/**
 * 安全工具函数
 * 提供前端安全防护和验证功能
 */

export interface SecurityConfig {
  enableCSRFProtection: boolean
  enableXSSProtection: boolean
  enableSessionValidation: boolean
  maxFailedAttempts: number
  lockoutDuration: number // 分钟
}

export class SecurityManager {
  private config: SecurityConfig
  private failedAttempts: Map<string, number> = new Map()
  private lockedAccounts: Map<string, number> = new Map()

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      enableCSRFProtection: true,
      enableXSSProtection: true,
      enableSessionValidation: true,
      maxFailedAttempts: 5,
      lockoutDuration: 15,
      ...config
    }
  }

  /**
   * 生成 CSRF Token
   */
  generateCSRFToken(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 9)
    const token = btoa(`${timestamp}_${random}`)
    
    // 存储到 sessionStorage
    sessionStorage.setItem('csrf_token', token)
    
    return token
  }

  /**
   * 验证 CSRF Token
   */
  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) return true
    
    const storedToken = sessionStorage.getItem('csrf_token')
    if (!storedToken || storedToken !== token) {
      console.warn('CSRF token 验证失败')
      return false
    }
    
    return true
  }

  /**
   * XSS 防护 - 清理用户输入
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableXSSProtection) return input
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * 验证 URL 是否为安全域名
   */
  isSafeDomain(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      // 允许的安全域名列表
      const safeDomains = [
        'steamcommunity.com',
        'api.steampowered.com',
        'steamcdn-a.akamaihd.net',
        window.location.hostname
      ]
      
      return safeDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )
    } catch {
      return false
    }
  }

  /**
   * 记录登录失败尝试
   */
  recordFailedAttempt(identifier: string): void {
    const current = this.failedAttempts.get(identifier) || 0
    this.failedAttempts.set(identifier, current + 1)
    
    if (current + 1 >= this.config.maxFailedAttempts) {
      const lockTime = Date.now() + (this.config.lockoutDuration * 60 * 1000)
      this.lockedAccounts.set(identifier, lockTime)
      console.warn(`账户 ${identifier} 因多次登录失败已被锁定`)
    }
  }

  /**
   * 检查账户是否被锁定
   */
  isAccountLocked(identifier: string): boolean {
    const lockTime = this.lockedAccounts.get(identifier)
    if (!lockTime) return false
    
    if (Date.now() > lockTime) {
      // 锁定时间已过，解除锁定
      this.lockedAccounts.delete(identifier)
      this.failedAttempts.delete(identifier)
      return false
    }
    
    return true
  }

  /**
   * 清除失败尝试记录（登录成功后调用）
   */
  clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier)
    this.lockedAccounts.delete(identifier)
  }

  /**
   * 获取剩余锁定时间（分钟）
   */
  getRemainingLockTime(identifier: string): number {
    const lockTime = this.lockedAccounts.get(identifier)
    if (!lockTime) return 0
    
    const remaining = Math.max(0, lockTime - Date.now())
    return Math.ceil(remaining / (60 * 1000))
  }

  /**
   * 验证会话完整性
   */
  async validateSession(): Promise<boolean> {
    if (!this.config.enableSessionValidation) return true
    
    try {
      const { sessionManager } = await import('@/utils/session')
      const status = sessionManager.getSessionStatus()
      
      return status.isLoggedIn
    } catch {
      return false
    }
  }

  /**
   * 检测可疑活动
   */
  detectSuspiciousActivity(): {
    issuspicious: boolean
    reasons: string[]
  } {
    const reasons: string[] = []
    
    // 检查用户代理
    if (!navigator.userAgent || navigator.userAgent.length < 10) {
      reasons.push('异常的用户代理')
    }
    
    // 检查是否使用代理或VPN（基础检测）
    if (navigator.onLine === false) {
      reasons.push('网络连接异常')
    }
    
    // 检查开发者工具
    let devtools = {open: false}
    const threshold = 160
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          reasons.push('检测到开发者工具')
        }
      } else {
        devtools.open = false
      }
    }, 500)
    
    return {
      issuspicious: reasons.length > 0,
      reasons
    }
  }

  /**
   * 安全头部检查
   */
  checkSecurityHeaders(): {
    isSecure: boolean
    missingHeaders: string[]
  } {
    const missingHeaders: string[] = []
    
    // 检查是否为 HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      missingHeaders.push('HTTPS')
    }
    
    // 这些头部通常由服务器设置，前端只能检测
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection'
    ]
    
    // 注意：前端无法直接检测响应头，这里作为提醒
    if (location.hostname !== 'localhost') {
      missingHeaders.push(...requiredHeaders.filter(() => true))
    }
    
    return {
      isSecure: missingHeaders.length === 0,
      missingHeaders
    }
  }
}

/**
 * 全局安全管理器实例
 */
export const securityManager = new SecurityManager()

/**
 * 安全工具函数
 */
export const securityUtils = {
  /**
   * 安全的 JSON 解析
   */
  safeJsonParse<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString)
    } catch {
      return defaultValue
    }
  },

  /**
   * 生成安全随机字符串
   */
  generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  },

  /**
   * 防抖函数（防止暴力攻击）
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  },

  /**
   * 节流函数（限制请求频率）
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  /**
   * 验证密码强度
   */
  validatePasswordStrength(password: string): {
    isStrong: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('密码至少需要8位字符')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('需要包含小写字母')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('需要包含大写字母')

    if (/\d/.test(password)) score += 1
    else feedback.push('需要包含数字')

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push('需要包含特殊字符')

    return {
      isStrong: score >= 4,
      score,
      feedback
    }
  },

  /**
   * 检查输入是否包含恶意内容
   */
  containsMaliciousContent(input: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ]

    return maliciousPatterns.some(pattern => pattern.test(input))
  }
}

/**
 * 安全装饰器 - 为函数添加安全检查
 */
export function secureFunction<T extends (...args: any[]) => any>(
  func: T,
  options: {
    requireCSRF?: boolean
    rateLimitMs?: number
    validateSession?: boolean
  } = {}
): T {
  const { requireCSRF = false, rateLimitMs = 0, validateSession = false } = options
  
  let lastCall = 0
  
  return ((...args: any[]) => {
    // 频率限制
    if (rateLimitMs > 0) {
      const now = Date.now()
      if (now - lastCall < rateLimitMs) {
        throw new Error('请求过于频繁，请稍后重试')
      }
      lastCall = now
    }
    
    // CSRF 验证
    if (requireCSRF) {
      const csrfToken = sessionStorage.getItem('csrf_token')
      if (!securityManager.validateCSRFToken(csrfToken || '')) {
        throw new Error('CSRF 验证失败')
      }
    }
    
    // 会话验证
    if (validateSession) {
      securityManager.validateSession().then(isValid => {
        if (!isValid) {
          throw new Error('会话已过期，请重新登录')
        }
      })
    }
    
    return func.apply(null, args)
  }) as T
}