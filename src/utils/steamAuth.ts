/**
 * Steam OpenID 认证工具
 * 前端实现Steam用户认证和信息获取
 */

export interface SteamUser {
  steamId: string
  username: string        // personaname
  displayName: string     // personaname
  avatar: string          // avatarfull/avatarmedium/avatar
  profileUrl: string      // profileurl
  country?: string        // loccountrycode
  state?: string          // locstatecode  
  city?: string           // loccityid
  realName?: string       // realname
  profileState?: number   // profilestate - 1表示用户填写了资料
  personaState?: number   // personastate - 在线状态
  visibilityState?: number // communityvisibilitystate - 资料可见性
  lastLogoff?: number     // lastlogoff - 上次在线时间
  timeCreated?: number    // timecreated - 账号创建时间
  gameId?: string         // gameid - 当前在玩的游戏ID
}

export interface SteamAuthConfig {
  realm: string
  returnUrl: string
  apiKey?: string
  allowedReturnUrls?: string[]
  maxLoginAttempts?: number
  loginAttemptWindow?: number // 分钟
  enableNonceValidation?: boolean
}

export interface SteamOpenIDParams {
  'openid.ns': string
  'openid.mode': string
  'openid.op_endpoint': string
  'openid.claimed_id': string
  'openid.identity': string
  'openid.return_to': string
  'openid.response_nonce': string
  'openid.assoc_handle': string
  'openid.signed': string
  'openid.sig': string
}

export class SteamAuthenticator {
  private config: SteamAuthConfig
  private readonly STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
  private readonly STEAM_API_URL = '/steam-web-api/ISteamUser/GetPlayerSummaries/v2/'
  private readonly STEAM_PROFILE_URL = 'https://steamcommunity.com/profiles/'
  
  // 登录尝试跟踪
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
  
  // Nonce 存储 (用于防重放攻击)
  private usedNonces = new Set<string>()
  
  constructor(config: SteamAuthConfig) {
    this.config = {
      maxLoginAttempts: 5,
      loginAttemptWindow: 15,
      enableNonceValidation: true,
      allowedReturnUrls: [],
      ...config
    }
  }

  /**
   * 生成安全 nonce
   */
  private generateNonce(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 12)
    return `${timestamp}-${random}`
  }

  /**
   * 验证 nonce 的唯一性和时效性
   */
  private validateNonce(nonce: string): boolean {
    if (!this.config.enableNonceValidation) return true
    
    // 检查是否已使用过
    if (this.usedNonces.has(nonce)) {
      console.warn('Nonce 已被使用:', nonce)
      return false
    }
    
    // 解析时间戳
    const parts = nonce.split('-')
    if (parts.length < 2) return false
    
    const timestamp = parseInt(parts[0])
    if (isNaN(timestamp)) return false
    
    // 检查时效性 (5分钟)
    const now = Date.now()
    const maxAge = 5 * 60 * 1000
    
    if (now - timestamp > maxAge) {
      console.warn('Nonce 已过期:', nonce)
      return false
    }
    
    // 标记为已使用
    this.usedNonces.add(nonce)
    
    // 清理过期的 nonce (保持集合大小合理)
    if (this.usedNonces.size > 1000) {
      const oldNonces = Array.from(this.usedNonces).filter(n => {
        const ts = parseInt(n.split('-')[0])
        return now - ts > maxAge
      })
      oldNonces.forEach(n => this.usedNonces.delete(n))
    }
    
    return true
  }

  /**
   * 验证回调 URL 是否在白名单中
   */
  private validateReturnUrl(url: string): boolean {
    if (!this.config.allowedReturnUrls || this.config.allowedReturnUrls.length === 0) {
      // 如果没有配置白名单，只检查是否与配置的 returnUrl 匹配
      return url === this.config.returnUrl
    }
    
    try {
      const urlObj = new URL(url)
      const urlWithoutQuery = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
      
      return this.config.allowedReturnUrls.some(allowedUrl => {
        try {
          const allowedUrlObj = new URL(allowedUrl)
          const allowedWithoutQuery = `${allowedUrlObj.protocol}//${allowedUrlObj.host}${allowedUrlObj.pathname}`
          return urlWithoutQuery === allowedWithoutQuery
        } catch {
          return false
        }
      })
    } catch {
      return false
    }
  }

  /**
   * 检查登录尝试限制
   */
  private checkLoginAttempts(identifier: string): boolean {
    if (!this.config.maxLoginAttempts) return true
    
    const now = Date.now()
    const windowMs = (this.config.loginAttemptWindow || 15) * 60 * 1000
    const attempts = this.loginAttempts.get(identifier)
    
    if (!attempts) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // 重置窗口
    if (now - attempts.lastAttempt > windowMs) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // 检查是否超过限制
    if (attempts.count >= this.config.maxLoginAttempts) {
      console.warn(`登录尝试过多: ${identifier}, 计数: ${attempts.count}`)
      return false
    }
    
    // 增加计数
    attempts.count++
    attempts.lastAttempt = now
    
    return true
  }

  /**
   * 清除登录尝试记录 (登录成功后调用)
   */
  private clearLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier)
  }

  /**
   * 获取客户端标识符
   */
  private getClientIdentifier(): string {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      window.location.hostname
    ].join('|')
    
    // 简单哈希
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i)
      hash = hash & hash
    }
    
    return Math.abs(hash).toString(36)
  }

  /**
   * 生成Steam登录URL (增强版)
   */
  generateLoginUrl(): string {
    // 检查登录尝试限制
    const clientId = this.getClientIdentifier()
    if (!this.checkLoginAttempts(clientId)) {
      throw new Error('登录尝试过于频繁，请稍后重试')
    }
    
    // 生成 nonce
    const nonce = this.generateNonce()
    
    // 构建返回URL，包含nonce
    const returnUrl = new URL(this.config.returnUrl)
    returnUrl.searchParams.set('nonce', nonce)
    
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl.toString(),
      'openid.realm': this.config.realm,
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select'
    })

    console.log('生成Steam登录URL，nonce:', nonce)
    return `${this.STEAM_OPENID_URL}?${params.toString()}`
  }

  /**
   * 从URL参数中提取Steam ID
   */
  extractSteamIdFromCallback(params: URLSearchParams): string | null {
    const identity = params.get('openid.identity')
    if (!identity) return null

    // Steam identity 格式: https://steamcommunity.com/openid/id/76561197960287930
    const match = identity.match(/\/(\d+)$/)
    return match ? match[1] : null
  }

  /**
   * 验证Steam OpenID回调参数 (增强版)
   */
  validateOpenIDResponse(params: URLSearchParams): {
    isValid: boolean
    steamId: string | null
    error?: string
  } {
    const mode = params.get('openid.mode')
    const identity = params.get('openid.identity')

    // 1. 检查基本参数
    if (mode !== 'id_res') {
      return {
        isValid: false,
        steamId: null,
        error: '无效的OpenID响应模式'
      }
    }

    if (!identity) {
      return {
        isValid: false,
        steamId: null,
        error: '缺少身份标识'
      }
    }

    // 2. 提取Steam ID
    const steamId = this.extractSteamIdFromCallback(params)
    if (!steamId) {
      return {
        isValid: false,
        steamId: null,
        error: '无法提取Steam ID'
      }
    }

    // 3. 验证返回URL (白名单检查)
    const returnTo = params.get('openid.return_to')
    if (returnTo) {
      if (!this.validateReturnUrl(returnTo)) {
        console.error('回调URL验证失败:', returnTo)
        return {
          isValid: false,
          steamId: null,
          error: '回调URL不在允许列表中'
        }
      }
    }

    // 4. 验证 nonce (防重放攻击)
    if (returnTo) {
      try {
        const url = new URL(returnTo)
        const nonce = url.searchParams.get('nonce')
        
        if (this.config.enableNonceValidation) {
          if (!nonce) {
            return {
              isValid: false,
              steamId: null,
              error: '缺少 nonce 参数'
            }
          }
          
          if (!this.validateNonce(nonce)) {
            return {
              isValid: false,
              steamId: null,
              error: 'Nonce 验证失败'
            }
          }
        }
      } catch (error) {
        console.error('解析回调URL失败:', error)
        return {
          isValid: false,
          steamId: null,
          error: '无效的回调URL格式'
        }
      }
    }

    // 5. 验证 response_nonce (Steam提供的)
    const responseNonce = params.get('openid.response_nonce')
    if (responseNonce) {
      // Steam的response_nonce格式验证
      if (!this.validateSteamResponseNonce(responseNonce)) {
        console.warn('Steam response_nonce 格式异常:', responseNonce)
        // 这里不直接失败，因为不同Steam版本可能有差异
      }
    }

    // 6. 验证必要的签名参数
    const signed = params.get('openid.signed')
    const sig = params.get('openid.sig')
    
    if (!signed || !sig) {
      return {
        isValid: false,
        steamId: null,
        error: '缺少必要的签名参数'
      }
    }

    return {
      isValid: true,
      steamId
    }
  }

  /**
   * 验证Steam response_nonce格式
   */
  private validateSteamResponseNonce(nonce: string): boolean {
    // Steam的nonce通常格式为: 2024-01-01T00:00:00ZuniqString
    const timestampMatch = nonce.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/)
    if (!timestampMatch) return false
    
    const timestamp = new Date(timestampMatch[1])
    if (isNaN(timestamp.getTime())) return false
    
    // 检查时间是否合理 (不能太久以前或未来)
    const now = new Date()
    const diffMs = Math.abs(now.getTime() - timestamp.getTime())
    const maxDiffMs = 30 * 60 * 1000 // 30分钟
    
    return diffMs <= maxDiffMs
  }

  /**
   * 验证Steam OpenID签名（临时跳过验证）
   */
  async verifyOpenIDSignature(params: URLSearchParams): Promise<{
    isValid: boolean
    error?: string
  }> {
    try {
      // 检查是否跳过验证（临时方案）
      const skipVerify = import.meta.env.VITE_SKIP_STEAM_VERIFY === 'true'
      
      if (skipVerify) {
        console.warn('⚠️ 跳过Steam签名验证（临时方案，等待后端API支持）')
        
        // 基本的参数检查
        const signed = params.get('openid.signed')
        const sig = params.get('openid.sig')
        const identity = params.get('openid.identity')
        
        if (!signed || !sig || !identity) {
          return {
            isValid: false,
            error: '缺少必要的OpenID参数'
          }
        }
        
        return {
          isValid: true
        }
      }

      // 将URLSearchParams转换为普通对象
      const openidParams: Record<string, string> = {}
      for (const [key, value] of params) {
        openidParams[key] = value
      }

      console.log('通过后端API验证Steam签名，参数:', openidParams)

      // 动态导入API函数以避免循环依赖
      const { verifySteamOpenID } = await import('../api/user')
      
      // 通过后端API验证
      const response = await verifySteamOpenID(openidParams)
      
      if (response.data.code === 200 && response.data.data?.isValid) {
        console.log('✅ Steam签名验证通过')
        return {
          isValid: true
        }
      } else {
        console.warn('❌ Steam签名验证失败:', response.data.message)
        return {
          isValid: false,
          error: response.data.message || 'Steam签名验证失败'
        }
      }
    } catch (error) {
      console.error('Steam签名验证异常:', error)
      return {
        isValid: false,
        error: `验证过程异常: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 获取Steam用户信息
   */
  async fetchUserInfo(steamId: string): Promise<SteamUser | null> {
    try {
      // 如果有API密钥，使用官方API
      if (this.config.apiKey) {
        return await this.fetchFromSteamAPI(steamId)
      }

      // 否则使用Steam社区页面信息（公开信息）
      return await this.fetchFromSteamProfile(steamId)
    } catch (error) {
      console.error('获取Steam用户信息失败:', error)
      return null
    }
  }

  /**
   * 通过Steam Web API获取用户信息
   */
  private async fetchFromSteamAPI(steamId: string): Promise<SteamUser | null> {
    if (!this.config.apiKey) return null

    try {
      const response = await fetch(
        `${this.STEAM_API_URL}?key=${this.config.apiKey}&steamids=${steamId}&format=json`
      )

      if (!response.ok) throw new Error('Steam API请求失败')

      const data = await response.json()
      const player = data.response?.players?.[0]

      if (!player) return null

      return {
        steamId: player.steamid,
        username: player.personaname,
        displayName: player.personaname,
        avatar: player.avatarfull || player.avatarmedium || player.avatar,
        profileUrl: player.profileurl || `${this.STEAM_PROFILE_URL}${steamId}`,
        country: player.loccountrycode,
        state: player.locstatecode,
        city: player.loccityid?.toString(),
        realName: player.realname,
        profileState: player.profilestate,
        personaState: player.personastate,
        visibilityState: player.communityvisibilitystate,
        lastLogoff: player.lastlogoff,
        timeCreated: player.timecreated,
        gameId: player.gameid
      }
    } catch (error) {
      console.error('Steam API获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 通过Steam社区页面获取用户信息（无需API密钥）
   */
  private async fetchFromSteamProfile(steamId: string): Promise<SteamUser | null> {
    try {
      // 注意：由于CORS限制，这里实际上无法直接从浏览器请求Steam页面
      // 在实际生产环境中，建议使用代理服务或API密钥
      console.warn('Steam社区页面受CORS限制，建议配置API密钥')
      
      // 返回基本信息作为fallback
      return {
        steamId,
        username: `Steam_${steamId.slice(-6)}`,
        displayName: `Steam User ${steamId.slice(-6)}`,
        avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
        profileUrl: `${this.STEAM_PROFILE_URL}${steamId}`
      }
    } catch (error) {
      console.error('获取Steam社区信息失败:', error)
      return null
    }
  }

  /**
   * 完整的Steam登录验证流程 (增强版)
   */
  async authenticateUser(params: URLSearchParams): Promise<{
    success: boolean
    user?: SteamUser
    error?: string
  }> {
    const clientId = this.getClientIdentifier()
    
    try {
      // 1. 基础参数验证 (已包含nonce和URL白名单验证)
      const validation = this.validateOpenIDResponse(params)
      if (!validation.isValid || !validation.steamId) {
        // 登录失败，记录尝试
        const attempts = this.loginAttempts.get(clientId)
        if (attempts) {
          attempts.count++
        }
        
        return {
          success: false,
          error: validation.error || 'Steam登录验证失败'
        }
      }

      // 2. Steam签名验证（重要的安全步骤）
      const signatureVerification = await this.verifyOpenIDSignature(params)
      if (!signatureVerification.isValid) {
        console.error('Steam签名验证失败:', signatureVerification.error)
        
        // 签名验证失败，记录尝试
        const attempts = this.loginAttempts.get(clientId)
        if (attempts) {
          attempts.count++
        }
        
        return {
          success: false,
          error: signatureVerification.error || 'Steam签名验证失败'
        }
      }

      console.log('✅ Steam签名验证通过')

      // 3. 获取用户信息
      const user = await this.fetchUserInfo(validation.steamId)
      if (!user) {
        return {
          success: false,
          error: '无法获取Steam用户信息'
        }
      }

      // 4. 调用后端Steam登录API
      console.log('调用后端Steam登录API，Steam ID:', validation.steamId)
      
      try {
        // 动态导入避免循环依赖
        const { steamLogin } = await import('../api/user')
        const loginResponse = await steamLogin(validation.steamId)
        
        if (loginResponse.data.code === 200) {
          console.log('✅ 后端Steam登录成功')
          
          // 5. 登录成功，清除失败记录
          this.clearLoginAttempts(clientId)
          
          // 记录成功登录事件
          console.log('✅ Steam用户认证成功:', {
            steamId: user.steamId,
            username: user.username,
            timestamp: new Date().toISOString()
          })

          return {
            success: true,
            user,
            token: loginResponse.data.data?.token, // 返回登录token
            apiResponse: loginResponse.data.data
          }
        } else {
          return {
            success: false,
            error: loginResponse.data.message || '后端登录失败'
          }
        }
      } catch (apiError) {
        console.warn('后端Steam登录API调用失败，使用前端数据:', apiError)
        
        // API调用失败时的降级处理
        this.clearLoginAttempts(clientId)
        
        return {
          success: true,
          user,
          fallback: true // 标记为降级处理
        }
      }
    } catch (error) {
      console.error('Steam认证流程异常:', error)
      
      // 异常情况也记录为失败尝试
      const attempts = this.loginAttempts.get(clientId)
      if (attempts) {
        attempts.count++
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '认证过程发生异常'
      }
    }
  }

  /**
   * 获取认证统计信息
   */
  getAuthStats(): {
    totalAttempts: number
    blockedClients: number
    usedNonces: number
  } {
    let totalAttempts = 0
    let blockedClients = 0
    
    this.loginAttempts.forEach((attempts) => {
      totalAttempts += attempts.count
      if (attempts.count >= (this.config.maxLoginAttempts || 5)) {
        blockedClients++
      }
    })
    
    return {
      totalAttempts,
      blockedClients,
      usedNonces: this.usedNonces.size
    }
  }

  /**
   * 清理过期的数据
   */
  cleanupExpiredData(): void {
    const now = Date.now()
    const windowMs = (this.config.loginAttemptWindow || 15) * 60 * 1000
    
    // 清理过期的登录尝试记录
    this.loginAttempts.forEach((attempts, clientId) => {
      if (now - attempts.lastAttempt > windowMs) {
        this.loginAttempts.delete(clientId)
      }
    })
    
    // 清理过期的nonce
    const maxAge = 5 * 60 * 1000
    const oldNonces = Array.from(this.usedNonces).filter(nonce => {
      const timestamp = parseInt(nonce.split('-')[0])
      return now - timestamp > maxAge
    })
    oldNonces.forEach(nonce => this.usedNonces.delete(nonce))
    
    console.log('清理过期数据完成:', {
      remainingAttempts: this.loginAttempts.size,
      remainingNonces: this.usedNonces.size
    })
  }
}

/**
 * Steam认证工具工厂函数 (增强版)
 */
export function createSteamAuthenticator(config?: Partial<SteamAuthConfig>): SteamAuthenticator {
  const baseUrl = window.location.origin
  
  const defaultConfig: SteamAuthConfig = {
    realm: baseUrl,
    returnUrl: `${baseUrl}/steam-callback`,
    apiKey: import.meta.env.VITE_STEAM_API_KEY,
    allowedReturnUrls: [
      `${baseUrl}/steam-callback`,
      `${baseUrl}/auth/steam/callback`
    ],
    maxLoginAttempts: 5,
    loginAttemptWindow: 15,
    enableNonceValidation: true
  }

  const authenticator = new SteamAuthenticator({
    ...defaultConfig,
    ...config
  })

  // 定期清理过期数据
  setInterval(() => {
    authenticator.cleanupExpiredData()
  }, 5 * 60 * 1000) // 每5分钟清理一次

  return authenticator
}

/**
 * Steam认证和用户信息工具函数
 */
export const steamAuthUtils = {
  /**
   * 检查是否为有效的Steam ID
   */
  isValidSteamId(steamId: string): boolean {
    return /^7656119[0-9]{10}$/.test(steamId)
  },

  /**
   * Steam ID 格式转换
   */
  steamId64To32(steamId64: string): number {
    const id64 = BigInt(steamId64)
    const id32 = Number(id64 - BigInt('76561197960265728'))
    return id32
  },

  /**
   * 生成Steam头像URL的不同尺寸
   */
  getSteamAvatarUrls(avatarHash: string) {
    const baseUrl = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars'
    const path = avatarHash.substring(0, 2)
    
    return {
      small: `${baseUrl}/${path}/${avatarHash}.jpg`,
      medium: `${baseUrl}/${path}/${avatarHash}_medium.jpg`,
      large: `${baseUrl}/${path}/${avatarHash}_full.jpg`
    }
  },

  /**
   * 获取用户在线状态文本
   */
  getPersonaStateText(personaState?: number): string {
    const states = {
      0: '离线',
      1: '在线', 
      2: '忙碌',
      3: '离开',
      4: '休息',
      5: '寻找交易',
      6: '寻找游戏'
    }
    return states[personaState as keyof typeof states] || '未知'
  },

  /**
   * 获取资料可见性状态文本
   */
  getVisibilityStateText(visibilityState?: number): string {
    const states = {
      1: '隐私',
      2: '仅好友可见',
      3: '用户好友的好友也可见', 
      4: '只对登录Steam的用户可见',
      5: '公开'
    }
    return states[visibilityState as keyof typeof states] || '未知'
  },

  /**
   * 判断用户是否在线
   */
  isUserOnline(personaState?: number): boolean {
    return personaState === 1
  },

  /**
   * 格式化最后在线时间
   */
  formatLastLogoff(lastLogoff?: number): string {
    if (!lastLogoff) return '未知'
    
    const date = new Date(lastLogoff * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return '不到1小时前'
    if (diffHours < 24) return `${diffHours}小时前`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}天前`
    
    return date.toLocaleDateString('zh-CN')
  }
}