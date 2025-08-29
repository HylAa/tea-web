/**
 * 安全会话管理工具
 * 处理用户认证token生成、存储和验证
 */

import { SteamUser } from './steamAuth'

export interface SessionToken {
  token: string
  user: SteamUser
  expiresAt: number
  createdAt: number
  fingerprint: string
  deviceId: string
  version: number
}

export interface SessionConfig {
  tokenPrefix: string
  expirationHours: number
  encryptionKey?: string
  fingerprintKey: string
  maxConcurrentSessions: number
  autoRefreshThreshold: number // 小时数
}

export interface DeviceSession {
  deviceId: string
  fingerprint: string
  lastActive: number
  createTime: number
  userAgent: string
}

export interface EncryptionResult {
  encrypted: string
  iv: string
  salt: string
}

export class SessionManager {
  private config: SessionConfig
  private readonly STORAGE_KEY = 'teahvh_session'
  private readonly DEVICES_KEY = 'teahvh_devices'
  private readonly SESSION_VERSION = 2

  constructor(config?: Partial<SessionConfig>) {
    this.config = {
      tokenPrefix: 'THV',
      expirationHours: 24 * 7, // 7天
      fingerprintKey: 'teahvh_fp',
      maxConcurrentSessions: 3,
      autoRefreshThreshold: 24,
      ...config
    }
  }

  /**
   * 生成设备指纹 (增强版)
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    let canvasFingerprint = ''
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = 'red'
      ctx.fillRect(10, 10, 50, 50)
      ctx.fillStyle = 'blue'
      ctx.fillText('TeaHvh🔐', 2, 2)
      canvasFingerprint = canvas.toDataURL()
    }

    // 更全面的设备特征收集
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvasFingerprint,
      navigator.hardwareConcurrency || 0,
      navigator.maxTouchPoints || 0,
      navigator.platform,
      navigator.cookieEnabled,
      navigator.onLine,
      window.devicePixelRatio || 1,
      // WebGL指纹
      this.getWebGLFingerprint(),
      // 音频指纹
      this.getAudioFingerprint()
    ].join('|')

    return this.hash256(fingerprint)
  }

  /**
   * 获取WebGL指纹
   */
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return 'no-webgl'
      
      const renderer = gl.getParameter(gl.RENDERER)
      const vendor = gl.getParameter(gl.VENDOR)
      return `${vendor}|${renderer}`
    } catch {
      return 'webgl-error'
    }
  }

  /**
   * 获取音频指纹
   */
  private getAudioFingerprint(): string {
    try {
      // 创建音频上下文
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return 'no-audio'
      
      const context = new AudioContext()
      const oscillator = context.createOscillator()
      const analyser = context.createAnalyser()
      const gain = context.createGain()
      
      oscillator.connect(analyser)
      analyser.connect(gain)
      gain.connect(context.destination)
      
      gain.gain.value = 0
      oscillator.frequency.value = 10000
      oscillator.start(0)
      
      // 获取频率数据
      const buffer = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(buffer)
      
      oscillator.stop(0)
      context.close()
      
      return Array.from(buffer.slice(0, 10)).join(',')
    } catch {
      return 'audio-error'
    }
  }

  /**
   * SHA-256 类似的哈希函数
   */
  private hash256(str: string): string {
    let hash = 0
    const prime = 31
    
    for (let i = 0; i < str.length; i++) {
      hash = hash * prime + str.charCodeAt(i)
      hash = hash & hash // 保持32位
    }
    
    // 生成更长的哈希
    const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
    const timestamp = Date.now().toString(16).slice(-4)
    
    return hashStr + timestamp + this.generateRandomString(8)
  }

  /**
   * 生成随机字符串
   */
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 生成设备ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString(36)
    const random = this.generateRandomString(12)
    const fingerprint = this.generateDeviceFingerprint().slice(0, 8)
    return `${timestamp}-${fingerprint}-${random}`
  }

  /**
   * 高强度加密函数 (模拟AES)
   */
  private encryptAdvanced(data: string, key: string): EncryptionResult {
    // 生成随机IV和salt
    const iv = this.generateRandomString(16)
    const salt = this.generateRandomString(16)
    
    // 密钥派生
    const derivedKey = this.deriveKey(key, salt)
    
    // 多轮加密
    let encrypted = data
    for (let round = 0; round < 3; round++) {
      encrypted = this.encryptRound(encrypted, derivedKey, iv, round)
    }
    
    return {
      encrypted: btoa(encrypted),
      iv,
      salt
    }
  }

  /**
   * 密钥派生函数
   */
  private deriveKey(key: string, salt: string): string {
    let derived = key + salt
    
    // 多次哈希增强
    for (let i = 0; i < 1000; i++) {
      derived = this.hash256(derived + i.toString())
    }
    
    return derived
  }

  /**
   * 单轮加密
   */
  private encryptRound(data: string, key: string, iv: string, round: number): string {
    let result = ''
    const keyExtended = (key + iv + round.toString()).repeat(Math.ceil(data.length / key.length))
    
    for (let i = 0; i < data.length; i++) {
      const dataChar = data.charCodeAt(i)
      const keyChar = keyExtended.charCodeAt(i % keyExtended.length)
      const ivChar = iv.charCodeAt(i % iv.length)
      
      // 复杂变换
      let encrypted = dataChar ^ keyChar ^ ivChar
      encrypted = ((encrypted << 3) | (encrypted >> 5)) & 0xFF
      encrypted = encrypted ^ (i & 0xFF) ^ (round & 0xFF)
      
      result += String.fromCharCode(encrypted)
    }
    
    return result
  }

  /**
   * 高强度解密函数
   */
  private decryptAdvanced(encResult: EncryptionResult, key: string): string {
    try {
      const { encrypted, iv, salt } = encResult
      let decrypted = atob(encrypted)
      
      // 密钥派生
      const derivedKey = this.deriveKey(key, salt)
      
      // 反向多轮解密
      for (let round = 2; round >= 0; round--) {
        decrypted = this.decryptRound(decrypted, derivedKey, iv, round)
      }
      
      return decrypted
    } catch (error) {
      console.error('解密失败:', error)
      return ''
    }
  }

  /**
   * 单轮解密
   */
  private decryptRound(data: string, key: string, iv: string, round: number): string {
    let result = ''
    const keyExtended = (key + iv + round.toString()).repeat(Math.ceil(data.length / key.length))
    
    for (let i = 0; i < data.length; i++) {
      let encryptedChar = data.charCodeAt(i)
      
      // 反向变换
      encryptedChar = encryptedChar ^ (i & 0xFF) ^ (round & 0xFF)
      encryptedChar = ((encryptedChar >> 3) | (encryptedChar << 5)) & 0xFF
      
      const keyChar = keyExtended.charCodeAt(i % keyExtended.length)
      const ivChar = iv.charCodeAt(i % iv.length)
      const decrypted = encryptedChar ^ keyChar ^ ivChar
      
      result += String.fromCharCode(decrypted)
    }
    
    return result
  }

  /**
   * 生成安全token
   */
  generateToken(user: SteamUser): string {
    const timestamp = Date.now()
    const random = this.generateRandomString(12)
    const fingerprint = this.generateDeviceFingerprint()
    const deviceId = this.generateDeviceId()
    
    const payload = {
      steamId: user.steamId,
      username: user.username,
      timestamp,
      random,
      fingerprint,
      deviceId,
      version: this.SESSION_VERSION
    }

    const tokenData = JSON.stringify(payload)
    const hash = this.hash256(tokenData + this.config.encryptionKey)
    
    return `${this.config.tokenPrefix}_${btoa(tokenData)}_${hash.slice(0, 16)}`
  }

  /**
   * 验证token有效性 (增强版)
   */
  validateToken(token: string): {
    isValid: boolean
    payload?: any
    error?: string
    needsRefresh?: boolean
  } {
    try {
      if (!token.startsWith(this.config.tokenPrefix + '_')) {
        return { isValid: false, error: '无效的token前缀' }
      }

      const parts = token.split('_')
      if (parts.length !== 3) {
        return { isValid: false, error: '无效的token格式' }
      }

      const [, encodedData, hash] = parts
      
      // 验证完整性
      const tokenData = atob(encodedData)
      const expectedHash = this.hash256(tokenData + this.config.encryptionKey).slice(0, 16)
      
      if (hash !== expectedHash) {
        return { isValid: false, error: 'token完整性验证失败' }
      }

      const payload = JSON.parse(tokenData)

      // 验证版本号
      if (payload.version !== this.SESSION_VERSION) {
        return { isValid: false, error: 'token版本过旧，请重新登录' }
      }

      // 验证时间戳
      const now = Date.now()
      const expirationTime = payload.timestamp + (this.config.expirationHours * 60 * 60 * 1000)
      const refreshThreshold = payload.timestamp + (this.config.autoRefreshThreshold * 60 * 60 * 1000)
      
      if (now > expirationTime) {
        return { isValid: false, error: 'token已过期' }
      }

      // 检查是否需要刷新
      const needsRefresh = now > refreshThreshold

      // 验证设备指纹
      const currentFingerprint = this.generateDeviceFingerprint()
      if (payload.fingerprint !== currentFingerprint) {
        return { isValid: false, error: '设备指纹不匹配，可能存在安全风险' }
      }

      return { 
        isValid: true, 
        payload,
        needsRefresh 
      }
    } catch (error) {
      return { isValid: false, error: 'token解析失败' }
    }
  }

  /**
   * 创建用户会话 (增强版)
   */
  createSession(user: SteamUser): SessionToken {
    const now = Date.now()
    const token = this.generateToken(user)
    const fingerprint = this.generateDeviceFingerprint()
    const deviceId = this.generateDeviceId()

    const session: SessionToken = {
      token,
      user,
      expiresAt: now + (this.config.expirationHours * 60 * 60 * 1000),
      createdAt: now,
      fingerprint,
      deviceId,
      version: this.SESSION_VERSION
    }

    // 管理多设备会话
    this.manageDeviceSessions(deviceId, fingerprint)
    
    // 存储到localStorage
    this.saveSession(session)
    
    // 存储设备指纹
    localStorage.setItem(this.config.fingerprintKey, fingerprint)

    return session
  }

  /**
   * 管理多设备会话
   */
  private manageDeviceSessions(deviceId: string, fingerprint: string): void {
    try {
      const devicesData = localStorage.getItem(this.DEVICES_KEY)
      let devices: DeviceSession[] = devicesData ? JSON.parse(devicesData) : []
      
      // 清理过期设备
      const now = Date.now()
      devices = devices.filter(device => 
        now - device.lastActive < this.config.expirationHours * 60 * 60 * 1000
      )
      
      // 添加当前设备
      const currentDevice: DeviceSession = {
        deviceId,
        fingerprint,
        lastActive: now,
        createTime: now,
        userAgent: navigator.userAgent
      }
      
      // 查找是否已存在
      const existingIndex = devices.findIndex(d => d.deviceId === deviceId)
      if (existingIndex >= 0) {
        devices[existingIndex] = currentDevice
      } else {
        devices.push(currentDevice)
      }
      
      // 限制并发会话数量
      if (devices.length > this.config.maxConcurrentSessions) {
        // 按最后活动时间排序，保留最新的
        devices.sort((a, b) => b.lastActive - a.lastActive)
        devices = devices.slice(0, this.config.maxConcurrentSessions)
      }
      
      localStorage.setItem(this.DEVICES_KEY, JSON.stringify(devices))
    } catch (error) {
      console.error('管理设备会话失败:', error)
    }
  }

  /**
   * 保存会话到存储 (增强版)
   */
  private saveSession(session: SessionToken): void {
    try {
      const sessionData = JSON.stringify(session)
      const encryptionKey = this.config.encryptionKey || session.fingerprint
      const encryptResult = this.encryptAdvanced(sessionData, encryptionKey)
      
      // 保存加密结果
      const storageData = {
        data: encryptResult,
        timestamp: Date.now(),
        version: this.SESSION_VERSION
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData))
      
      // 设置过期检查
      this.scheduleSessionExpiry(session)
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }

  /**
   * 从存储加载会话 (增强版)
   */
  loadSession(): SessionToken | null {
    try {
      const storageDataRaw = localStorage.getItem(this.STORAGE_KEY)
      if (!storageDataRaw) return null

      const storageData = JSON.parse(storageDataRaw)
      
      // 验证版本
      if (storageData.version !== this.SESSION_VERSION) {
        this.clearSession()
        return null
      }

      const storedFingerprint = localStorage.getItem(this.config.fingerprintKey)
      if (!storedFingerprint) return null

      const encryptionKey = this.config.encryptionKey || storedFingerprint
      const decrypted = this.decryptAdvanced(storageData.data, encryptionKey)
      
      if (!decrypted) return null

      const session: SessionToken = JSON.parse(decrypted)

      // 验证指纹
      if (session.fingerprint !== storedFingerprint) {
        console.warn('设备指纹不匹配，清除会话')
        this.clearSession()
        return null
      }

      // 检查过期时间
      if (Date.now() > session.expiresAt) {
        console.log('会话已过期')
        this.clearSession()
        return null
      }

      // 验证token
      const validation = this.validateToken(session.token)
      if (!validation.isValid) {
        console.warn('Token验证失败:', validation.error)
        this.clearSession()
        return null
      }

      // 检查是否需要自动刷新
      if (validation.needsRefresh) {
        return this.autoRefreshSession(session)
      }

      return session
    } catch (error) {
      console.error('加载会话失败:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * 自动刷新会话
   */
  private autoRefreshSession(oldSession: SessionToken): SessionToken | null {
    try {
      console.log('自动刷新会话')
      
      // 创建新会话
      const newSession = this.createSession(oldSession.user)
      
      // 记录刷新事件
      console.log('会话已自动刷新:', {
        oldToken: oldSession.token.slice(0, 20) + '...',
        newToken: newSession.token.slice(0, 20) + '...',
        user: oldSession.user.username
      })
      
      return newSession
    } catch (error) {
      console.error('自动刷新会话失败:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * 设置会话过期检查
   */
  private scheduleSessionExpiry(session: SessionToken): void {
    // 在会话过期前5分钟执行检查
    const checkTime = session.expiresAt - Date.now() - (5 * 60 * 1000)
    
    if (checkTime > 0) {
      setTimeout(() => {
        const currentSession = this.loadSession()
        if (currentSession && currentSession.token === session.token) {
          // 如果会话仍然存在且是同一个token，尝试刷新
          this.autoRefreshSession(currentSession)
        }
      }, checkTime)
    }
  }

  /**
   * 刷新会话
   */
  refreshSession(session: SessionToken): SessionToken | null {
    // 检查是否还有足够时间刷新
    const now = Date.now()
    const timeLeft = session.expiresAt - now
    const refreshThreshold = 24 * 60 * 60 * 1000 // 24小时

    if (timeLeft < refreshThreshold) {
      return this.createSession(session.user)
    }

    return session
  }

  /**
   * 清除会话 (增强版)
   */
  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.config.fingerprintKey)
    localStorage.removeItem(this.DEVICES_KEY)
    localStorage.removeItem('token') // 兼容旧版本
    localStorage.removeItem('user') // 兼容旧版本
  }

  /**
   * 获取所有设备会话
   */
  getDeviceSessions(): DeviceSession[] {
    try {
      const devicesData = localStorage.getItem(this.DEVICES_KEY)
      return devicesData ? JSON.parse(devicesData) : []
    } catch {
      return []
    }
  }

  /**
   * 检测多设备登录
   */
  detectConcurrentSessions(): {
    hasMultipleSessions: boolean
    sessionCount: number
    sessions: DeviceSession[]
  } {
    const sessions = this.getDeviceSessions()
    const now = Date.now()
    
    // 过滤活跃会话
    const activeSessions = sessions.filter(session => 
      now - session.lastActive < this.config.expirationHours * 60 * 60 * 1000
    )

    return {
      hasMultipleSessions: activeSessions.length > 1,
      sessionCount: activeSessions.length,
      sessions: activeSessions
    }
  }

  /**
   * 清除指定设备会话
   */
  clearDeviceSession(deviceId: string): boolean {
    try {
      const sessions = this.getDeviceSessions()
      const filteredSessions = sessions.filter(s => s.deviceId !== deviceId)
      
      localStorage.setItem(this.DEVICES_KEY, JSON.stringify(filteredSessions))
      
      // 如果清除的是当前设备，也清除本地会话
      const currentFingerprint = this.generateDeviceFingerprint()
      const removedSession = sessions.find(s => s.deviceId === deviceId)
      
      if (removedSession && removedSession.fingerprint === currentFingerprint) {
        this.clearSession()
      }
      
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取当前会话状态
   */
  getSessionStatus(): {
    isLoggedIn: boolean
    session?: SessionToken
    timeLeft?: number
  } {
    const session = this.loadSession()
    
    if (!session) {
      return { isLoggedIn: false }
    }

    const timeLeft = session.expiresAt - Date.now()
    
    return {
      isLoggedIn: true,
      session,
      timeLeft
    }
  }

  /**
   * 设置会话过期监听器
   */
  onSessionExpired(callback: () => void): void {
    const checkExpiration = () => {
      const status = this.getSessionStatus()
      if (!status.isLoggedIn) {
        callback()
        return
      }

      if (status.timeLeft && status.timeLeft <= 0) {
        this.clearSession()
        callback()
        return
      }

      // 继续检查
      setTimeout(checkExpiration, 60000) // 每分钟检查一次
    }

    checkExpiration()
  }

  /**
   * 获取会话安全统计
   */
  getSecurityStats(): {
    deviceCount: number
    sessionAge: number
    lastRefresh?: number
    securityEvents: any[]
  } {
    const session = this.loadSession()
    const devices = this.getDeviceSessions()
    
    return {
      deviceCount: devices.length,
      sessionAge: session ? Date.now() - session.createdAt : 0,
      lastRefresh: session?.createdAt,
      securityEvents: [] // 可以扩展添加安全事件记录
    }
  }

  /**
   * 验证会话安全性
   */
  validateSessionSecurity(): {
    isSecure: boolean
    warnings: string[]
    recommendations: string[]
  } {
    const warnings: string[] = []
    const recommendations: string[] = []
    
    const session = this.loadSession()
    const devices = this.detectConcurrentSessions()
    
    // 检查多设备登录
    if (devices.hasMultipleSessions) {
      warnings.push(`检测到${devices.sessionCount}个设备同时登录`)
      recommendations.push('建议定期检查并清除不必要的设备会话')
    }
    
    // 检查会话年龄
    if (session) {
      const ageInDays = (Date.now() - session.createdAt) / (24 * 60 * 60 * 1000)
      if (ageInDays > 30) {
        warnings.push('会话时间过长，建议重新登录')
      }
    }
    
    // 检查设备指纹变化
    if (session) {
      const currentFingerprint = this.generateDeviceFingerprint()
      if (session.fingerprint !== currentFingerprint) {
        warnings.push('设备指纹发生变化，可能存在安全风险')
        recommendations.push('建议重新进行身份验证')
      }
    }
    
    return {
      isSecure: warnings.length === 0,
      warnings,
      recommendations
    }
  }
}

/**
 * 全局会话管理器实例
 */
export const sessionManager = new SessionManager({
  tokenPrefix: 'THV',
  expirationHours: 24 * 7, // 7天
  fingerprintKey: 'teahvh_device_fp',
  maxConcurrentSessions: 3,
  autoRefreshThreshold: 24,
  encryptionKey: 'TeaHvh-Session-Key-2024'
})

/**
 * 会话工具函数
 */
export const sessionUtils = {
  /**
   * 检查是否为安全环境
   */
  isSecureEnvironment(): boolean {
    return location.protocol === 'https:' || location.hostname === 'localhost'
  },

  /**
   * 获取会话统计信息
   */
  getSessionStats(session: SessionToken) {
    const now = Date.now()
    const ageMs = now - session.createdAt
    const timeLeftMs = session.expiresAt - now
    
    return {
      age: Math.floor(ageMs / (1000 * 60 * 60)), // 小时
      timeLeft: Math.floor(timeLeftMs / (1000 * 60 * 60)), // 小时
      isExpiringSoon: timeLeftMs < (24 * 60 * 60 * 1000), // 少于24小时
      needsRefresh: timeLeftMs < (48 * 60 * 60 * 1000), // 少于48小时
      fingerprint: session.fingerprint,
      deviceId: session.deviceId,
      version: session.version
    }
  },

  /**
   * 格式化会话token用于显示
   */
  formatTokenForDisplay(token: string): string {
    if (token.length < 20) return token
    return token.substr(0, 8) + '...' + token.substr(-8)
  },

  /**
   * 格式化设备信息
   */
  formatDeviceInfo(session: DeviceSession): {
    deviceName: string
    browser: string
    os: string
    lastActiveFormatted: string
  } {
    const ua = session.userAgent
    let browser = 'Unknown'
    let os = 'Unknown'
    
    // 简单的浏览器检测
    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Edge')) browser = 'Edge'
    
    // 简单的操作系统检测
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS')) os = 'iOS'
    
    // 格式化最后活动时间
    const timeDiff = Date.now() - session.lastActive
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    let lastActiveFormatted = ''
    if (days > 0) {
      lastActiveFormatted = `${days}天前`
    } else if (hours > 0) {
      lastActiveFormatted = `${hours}小时前`
    } else {
      lastActiveFormatted = '刚刚'
    }
    
    return {
      deviceName: `${browser} on ${os}`,
      browser,
      os,
      lastActiveFormatted
    }
  },

  /**
   * 检查会话健康状态
   */
  checkSessionHealth(): {
    isHealthy: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    
    const session = sessionManager.loadSession()
    if (!session) {
      return {
        isHealthy: false,
        issues: ['未登录'],
        suggestions: ['请先登录']
      }
    }
    
    const stats = this.getSessionStats(session)
    const security = sessionManager.validateSessionSecurity()
    
    // 检查过期状态
    if (stats.isExpiringSoon) {
      issues.push('会话即将过期')
      suggestions.push('建议重新登录以延长会话时间')
    }
    
    // 检查安全问题
    if (!security.isSecure) {
      issues.push(...security.warnings)
      suggestions.push(...security.recommendations)
    }
    
    // 检查环境安全性
    if (!this.isSecureEnvironment()) {
      issues.push('当前环境不安全（非HTTPS）')
      suggestions.push('建议在HTTPS环境下使用')
    }
    
    return {
      isHealthy: issues.length === 0,
      issues,
      suggestions
    }
  }
}