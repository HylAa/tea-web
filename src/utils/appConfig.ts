/**
 * 生产环境配置管理
 * 统一管理应用配置，支持环境变量和动态配置
 */

export interface AppConfig {
  // 基础配置
  apiBaseUrl: string
  siteUrl: string
  appTitle: string
  appDescription: string
  
  // Steam配置
  steam: {
    apiKey?: string
    appName: string
    realm: string
    returnUrl: string
  }
  
  // 安全配置
  security: {
    sessionKey: string
    fingerprintKey: string
    sessionExpireHours: number
  }
  
  // 功能开关
  features: {
    devtools: boolean
    debugMode: boolean
    performanceMonitoring: boolean
    pwa: boolean
  }
  
  // 监控配置
  monitoring: {
    gaId?: string
    sentryDsn?: string
  }
  
  // 部署配置
  deployment: {
    cdnUrl?: string
    buildOutput: string
  }
}

/**
 * 获取环境变量值，支持默认值
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue
}

/**
 * 获取布尔类型环境变量
 */
function getBoolEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key]
  if (value === undefined || value === '') return defaultValue
  return value === 'true' || value === '1' || value === 'yes'
}

/**
 * 获取数字类型环境变量
 */
function getNumberEnvVar(key: string, defaultValue: number = 0): number {
  const value = import.meta.env[key]
  if (value === undefined || value === '') return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * 创建应用配置
 */
function createAppConfig(): AppConfig {
  const isProduction = import.meta.env.PROD
  const baseUrl = window.location.origin
  
  return {
    // 基础配置
    apiBaseUrl: getEnvVar('VITE_API_BASE_URL'),
    siteUrl: getEnvVar('VITE_SITE_URL', baseUrl),
    appTitle: getEnvVar('VITE_APP_TITLE', '茶游戏社区'),
    appDescription: getEnvVar('VITE_APP_DESCRIPTION', '专业的游戏社区平台'),
    
    // Steam配置
    steam: {
      apiKey: getEnvVar('VITE_STEAM_API_KEY'), // 可选
      appName: getEnvVar('VITE_STEAM_APP_NAME', 'TeaHvh Gaming Community'),
      realm: getEnvVar('VITE_STEAM_REALM', baseUrl),
      returnUrl: getEnvVar('VITE_STEAM_RETURN_URL', `${baseUrl}/steam-callback`)
    },
    
    // 安全配置
    security: {
      sessionKey: getEnvVar('VITE_SESSION_KEY', 'default-session-key'),
      fingerprintKey: getEnvVar('VITE_FINGERPRINT_KEY', 'teahvh-fingerprint'),
      sessionExpireHours: getNumberEnvVar('VITE_SESSION_EXPIRE_HOURS', 168) // 默认7天
    },
    
    // 功能开关
    features: {
      devtools: getBoolEnvVar('VITE_DEVTOOLS_ENABLED', !isProduction),
      debugMode: getBoolEnvVar('VITE_DEBUG_MODE', !isProduction),
      performanceMonitoring: getBoolEnvVar('VITE_PERFORMANCE_MONITORING', isProduction),
      pwa: getBoolEnvVar('VITE_PWA_ENABLED', false)
    },
    
    // 监控配置
    monitoring: {
      gaId: getEnvVar('VITE_GA_MEASUREMENT_ID'),
      sentryDsn: getEnvVar('VITE_SENTRY_DSN')
    },
    
    // 部署配置
    deployment: {
      cdnUrl: getEnvVar('VITE_CDN_URL'),
      buildOutput: getEnvVar('VITE_BUILD_OUTPUT', 'dist')
    }
  }
}

/**
 * 应用配置实例
 */
export const appConfig = createAppConfig()

/**
 * 配置验证函数
 */
export const configValidator = {
  /**
   * 验证Steam配置
   */
  validateSteamConfig(): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 检查必需配置
    if (!appConfig.steam.realm) {
      errors.push('Steam realm未配置')
    }
    
    if (!appConfig.steam.returnUrl) {
      errors.push('Steam return URL未配置')
    }
    
    if (!appConfig.steam.apiKey) {
      warnings.push('Steam API密钥未配置，将使用fallback方案')
    }
    
    // 检查URL格式
    try {
      new URL(appConfig.steam.realm)
    } catch {
      errors.push('Steam realm不是有效的URL')
    }
    
    try {
      new URL(appConfig.steam.returnUrl)
    } catch {
      errors.push('Steam return URL不是有效的URL')
    }
    
    // 检查HTTPS
    if (appConfig.steam.realm && !appConfig.steam.realm.startsWith('https://')) {
      errors.push('Steam realm必须使用HTTPS')
    }
    
    if (appConfig.steam.returnUrl && !appConfig.steam.returnUrl.startsWith('https://')) {
      errors.push('Steam return URL必须使用HTTPS')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  },
  
  /**
   * 验证安全配置
   */
  validateSecurityConfig(): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 检查会话密钥
    if (appConfig.security.sessionKey === 'default-session-key') {
      warnings.push('使用默认会话密钥，建议在生产环境中修改')
    }
    
    if (appConfig.security.sessionKey.length < 16) {
      warnings.push('会话密钥长度过短，建议至少16位')
    }
    
    // 检查过期时间
    if (appConfig.security.sessionExpireHours < 1) {
      errors.push('会话过期时间不能小于1小时')
    }
    
    if (appConfig.security.sessionExpireHours > 720) {
      warnings.push('会话过期时间过长(超过30天)，可能存在安全风险')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  },
  
  /**
   * 完整配置验证
   */
  validateAllConfig() {
    const steamValidation = this.validateSteamConfig()
    const securityValidation = this.validateSecurityConfig()
    
    return {
      isValid: steamValidation.isValid && securityValidation.isValid,
      errors: [...steamValidation.errors, ...securityValidation.errors],
      warnings: [...steamValidation.warnings, ...securityValidation.warnings],
      steam: steamValidation,
      security: securityValidation
    }
  }
}

/**
 * 配置工具函数
 */
export const configUtils = {
  /**
   * 打印配置信息(隐藏敏感信息)
   */
  printConfig() {
    const safeConfig = {
      ...appConfig,
      steam: {
        ...appConfig.steam,
        apiKey: appConfig.steam.apiKey ? '***已配置***' : '未配置'
      },
      security: {
        ...appConfig.security,
        sessionKey: '***隐藏***'
      }
    }
    
    console.group('🔧 应用配置')
    console.log(safeConfig)
    console.groupEnd()
  },
  
  /**
   * 检查是否为生产环境
   */
  isProduction(): boolean {
    return import.meta.env.PROD
  },
  
  /**
   * 检查是否为开发环境
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV
  },
  
  /**
   * 获取构建信息
   */
  getBuildInfo() {
    return {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      baseUrl: import.meta.env.BASE_URL
    }
  }
}

/**
 * 初始化配置检查
 */
export function initializeConfig() {
  // 在开发环境或启用调试模式时打印配置
  if (appConfig.features.debugMode) {
    configUtils.printConfig()
  }
  
  // 验证配置
  const validation = configValidator.validateAllConfig()
  
  if (validation.errors.length > 0) {
    console.error('❌ 配置验证失败:', validation.errors)
    throw new Error(`配置错误: ${validation.errors.join(', ')}`)
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ 配置警告:', validation.warnings)
  }
  
  console.log('✅ 应用配置验证通过')
  return appConfig
}