# 工具函数模块

[根目录](../../CLAUDE.md) > [src](../) > **utils**

## 模块职责

工具函数模块提供应用程序的基础设施功能，包括HTTP请求封装、应用配置管理、Steam认证工具、安全管理和会话管理。该模块为整个应用提供统一的数据访问层、配置管理、安全防护和认证能力，确保代码的可维护性、安全性和一致性。

## 入口和启动

- **HTTP请求封装**: `request.ts` - 基于axios的HTTP客户端
- **应用配置管理**: `appConfig.ts` - 生产环境配置管理和验证
- **Steam认证工具**: `steamAuth.ts` - Steam OpenID认证完整实现
- **安全管理**: `security.ts` - CSRF保护和安全工具
- **会话管理**: `session.ts` - 安全会话存储和指纹验证
- **使用方式**: 通过ES6模块导入在各个业务模块中使用

## 外部接口

### HTTP请求封装 (`request.ts`)
```typescript
// 导出配置好的axios实例
export default service: AxiosInstance

// 配置信息
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.teahvh.cc/api"
const TIMEOUT = 15000

// 拦截器功能
// 请求拦截器：自动添加Authorization头
// 响应拦截器：统一错误处理和数据格式化
```

### 应用配置管理 (`appConfig.ts`)
```typescript
// 配置接口
export interface AppConfig {
  apiBaseUrl: string
  siteUrl: string
  appTitle: string
  steam: SteamConfig
  security: SecurityConfig
  features: FeatureFlags
  monitoring: MonitoringConfig
}

// 主要功能
export const appConfig: AppConfig          // 配置实例
export const configValidator              // 配置验证器
export const configUtils                 // 配置工具函数
export function initializeConfig(): AppConfig  // 配置初始化
```

### Steam认证工具 (`steamAuth.ts`)
```typescript
// Steam认证器类
export class SteamAuthenticator {
  generateLoginUrl(): string                    // 生成Steam登录URL
  extractSteamIdFromCallback(params): string    // 从回调提取Steam ID
  validateOpenIDResponse(params): ValidationResult  // 验证OpenID响应
  verifyOpenIDSignature(params): Promise<VerificationResult>  // 验证Steam签名
  fetchUserInfo(steamId: string): Promise<SteamUser>  // 获取用户信息
  authenticateUser(params): Promise<AuthResult>  // 完整认证流程
}

// 工厂函数
export function createSteamAuthenticator(config?): SteamAuthenticator

// 工具函数
export const steamAuthUtils: {
  isValidSteamId(steamId: string): boolean
  steamId64To32(steamId64: string): number
  getSteamAvatarUrls(avatarHash: string): AvatarUrls
}
```

### 安全管理 (`security.ts`)
```typescript
// 安全管理器
export const securityManager: {
  generateCSRFToken(): string               // 生成CSRF Token
  validateCSRFToken(token: string): boolean // 验证CSRF Token
  sanitizeInput(input: string): string     // 输入过滤
  encodeOutput(output: string): string     // 输出编码
  generateRandomString(length: number): string  // 生成随机字符串
  hashData(data: string): string          // 数据哈希
}
```

### 会话管理 (`session.ts`)
```typescript
// 会话管理器
export const sessionManager: {
  saveSession(sessionData: SessionData): void    // 保存会话
  loadSession(): SessionData | null              // 加载会话
  clearSession(): void                           // 清除会话
  isSessionValid(): boolean                      // 验证会话有效性
  updateSessionActivity(): void                  // 更新会话活动时间
  generateFingerprint(): string                  // 生成设备指纹
  validateFingerprint(fingerprint: string): boolean  // 验证设备指纹
}
```

## 核心依赖和配置

### HTTP请求配置
```typescript
// axios实例配置
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,           // API基础URL
  timeout: 15000,              // 15秒超时
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
})
```

### 应用配置系统
```typescript
// 环境变量配置
VITE_API_BASE_URL=https://api.teahvh.cc/api
VITE_STEAM_API_KEY=你的Steam_API密钥
VITE_SESSION_KEY=你的会话密钥
VITE_FINGERPRINT_KEY=teahvh-fingerprint

// 配置验证
const validation = configValidator.validateAllConfig()
if (!validation.isValid) {
  throw new Error(`配置错误: ${validation.errors.join(', ')}`)
}
```

### Steam认证配置
```typescript
// Steam OpenID配置
const steamConfig: SteamAuthConfig = {
  realm: window.location.origin,
  returnUrl: `${window.location.origin}/steam-callback`,
  apiKey: import.meta.env.VITE_STEAM_API_KEY  // 可选
}

// 认证流程
const steamAuth = createSteamAuthenticator(steamConfig)
const authUrl = steamAuth.generateLoginUrl()
```

### 安全机制配置
```typescript
// CSRF保护
const csrfToken = securityManager.generateCSRFToken()
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken

// 会话安全
const sessionData: SessionData = {
  token: userToken,
  user: userInfo,
  fingerprint: sessionManager.generateFingerprint(),
  expiresAt: Date.now() + sessionExpireTime
}
sessionManager.saveSession(sessionData)
```

## 数据模型

### HTTP响应标准格式
```typescript
interface ApiResponse<T = any> {
  code: number        // 业务状态码，200表示成功
  message: string     // 响应信息
  data: T            // 响应数据
  timestamp?: number  // 时间戳（可选）
}
```

### Steam认证相关类型
```typescript
interface SteamUser {
  steamId: string
  username: string
  displayName: string
  avatar: string
  profileUrl: string
  country?: string
  state?: string
  city?: string
}

interface SteamAuthConfig {
  realm: string
  returnUrl: string
  apiKey?: string
}

interface SteamOpenIDParams {
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
```

### 会话和安全类型
```typescript
interface SessionData {
  token: string
  user: User
  fingerprint: string
  expiresAt: number
  createdAt: number
  lastActivity: number
}

interface SecurityConfig {
  sessionKey: string
  fingerprintKey: string
  sessionExpireHours: number
}
```

### 应用配置类型
```typescript
interface AppConfig {
  apiBaseUrl: string
  siteUrl: string
  appTitle: string
  appDescription: string
  
  steam: {
    apiKey?: string
    appName: string
    realm: string
    returnUrl: string
  }
  
  security: {
    sessionKey: string
    fingerprintKey: string
    sessionExpireHours: number
  }
  
  features: {
    devtools: boolean
    debugMode: boolean
    performanceMonitoring: boolean
    pwa: boolean
  }
  
  monitoring: {
    gaId?: string
    sentryDsn?: string
  }
}
```

## 测试和质量

### 错误处理策略
- **网络错误**: 自动重试和超时处理
- **业务错误**: 统一的错误码处理和用户提示
- **认证错误**: 自动处理token过期和登录状态
- **配置错误**: 配置加载失败的降级处理
- **安全错误**: CSRF验证失败和会话异常处理

### 安全防护机制
- **CSRF保护**: 自动生成和验证CSRF Token
- **会话安全**: 设备指纹验证和会话过期管理
- **输入验证**: XSS防护和输入过滤
- **数据加密**: 敏感数据哈希和安全存储
- **Steam验证**: 完整的OpenID签名验证流程

### 性能优化
- **请求缓存**: 避免重复的配置文件请求
- **请求去重**: 防止并发相同请求
- **超时控制**: 15秒请求超时，避免长时间等待
- **内存管理**: 适当的缓存策略，避免内存泄漏
- **配置缓存**: 应用配置只加载一次，减少重复计算

### 开发支持
- **环境区分**: 支持开发和生产环境的不同配置
- **调试日志**: 详细的请求、响应和安全事件日志
- **错误追踪**: 完整的错误堆栈和上下文信息
- **代理配置**: 开发环境下的API代理支持
- **配置验证**: 启动时自动检查配置完整性和有效性

## 常见问题 (FAQ)

### Q: 如何修改API基础URL？
A: 设置环境变量`VITE_API_BASE_URL`或修改vite.config.ts中的代理配置。

### Q: Steam认证失败怎么办？
A: 检查Steam配置(realm和returnUrl必须是HTTPS)，确保OpenID回调处理正确，开发环境可使用模拟登录。

### Q: 会话过期如何处理？
A: 系统会自动检测会话过期并清除登录状态，用户需要重新登录。可通过`VITE_SESSION_EXPIRE_HOURS`调整过期时间。

### Q: 如何启用调试模式？
A: 设置环境变量`VITE_DEBUG_MODE=true`，将显示详细的日志和配置信息。

### Q: CSRF保护如何工作？
A: 系统启动时自动生成CSRF Token并添加到请求头，服务器端需要验证该Token。

### Q: 设备指纹如何生成？
A: 基于浏览器特征(User-Agent、屏幕分辨率、时区等)生成唯一标识，用于会话安全验证。

## 相关文件列表

### 核心工具文件
- `request.ts` - HTTP请求封装和拦截器配置
- `appConfig.ts` - 应用配置管理和验证系统
- `steamAuth.ts` - Steam OpenID认证完整实现
- `security.ts` - 安全管理和CSRF保护
- `session.ts` - 会话管理和设备指纹验证

### 配置文件
- `../../vite.config.ts` - Vite构建配置，包含API代理
- `../../.env.*` - 环境变量配置文件

### 类型定义
- `../types/config.ts` - TypeScript类型定义

### 使用示例
- `../api/*.ts` - 各个API模块都使用request工具
- `../stores/user.ts` - 用户状态管理使用HTTP请求和会话管理
- `../components/auth/*.vue` - 认证组件使用Steam认证工具
- `../main.ts` - 应用启动时初始化配置和安全设置

### 测试和调试
- `../components/demo/ApiDemo.vue` - API测试演示组件
- `../views/SteamCallback.vue` - Steam认证回调页面
- 浏览器开发者工具 - 网络请求和会话存储监控

## 变更日志 (Changelog)

### 2025-08-28 10:12:51
- **[架构升级]** 新增应用配置管理系统和环境变量验证
- **[安全增强]** 添加CSRF保护、会话管理和设备指纹验证
- **[Steam集成]** 完善Steam OpenID认证工具，支持完整签名验证
- **[配置系统]** 统一配置管理，支持生产环境优化和监控集成
- **[类型完善]** 补充所有工具函数的TypeScript类型定义

### 2025-08-25 14:48:43
- **[初始化]** 创建工具函数模块文档
- **[架构分析]** 完成HTTP请求封装和配置管理功能分析
- **[最佳实践]** 整理错误处理、性能优化和开发支持策略
- **[集成梳理]** 记录与API模块和配置系统的依赖关系