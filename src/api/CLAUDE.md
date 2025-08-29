# API接口模块

[根目录](../../CLAUDE.md) > [src](../) > **api**

## 模块职责

API接口模块负责统一管理所有与后端服务的通信接口，包括用户认证、服务器信息、公告系统、排行榜等核心业务API。所有API接口都基于统一的HTTP请求封装，支持错误处理、认证管理和响应数据标准化。

## 入口和启动

- **模块入口**: `index.ts` - 导出所有API接口模块
- **HTTP客户端**: 基于 `../utils/request.ts` 的axios封装
- **API基础URL**: `https://api.teahvh.cc/api`

## 外部接口

### 用户认证API (`user.ts`)
```typescript
// Steam登录接口
export function steamLogin(steamId: string): Promise<AxiosResponse>

// 用户信息获取
export function getUserInfo(userId: string): Promise<AxiosResponse>

// 传统登录接口
export function login(data: LoginCredentials): Promise<AxiosResponse>

// Steam账号绑定/解绑
export function bindSteamAccount(data: BindSteamData): Promise<AxiosResponse>
export function unbindSteamAccount(userId: string): Promise<AxiosResponse>
```

### 服务器信息API (`server.ts`)
```typescript
// 获取单个服务器信息
export function getServerInfo(port: string | number): Promise<AxiosResponse<ServerResponse>>

// 获取服务器列表
export function getServerList(): Promise<AxiosResponse<ServersListResponse>>
```

### 公告系统API (`announcement.ts`)
```typescript
// 获取公告列表
export function getAnnouncements(): Promise<AxiosResponse>
```

### 排行榜API (`levelrank.ts`)
```typescript
// 获取等级排行榜
export function getLevelRank(params?: RankParams): Promise<AxiosResponse>
```

## 核心依赖和配置

### 依赖关系
- `../utils/request.ts`: HTTP请求封装，提供axios实例和拦截器
- `axios`: HTTP客户端库
- TypeScript类型系统：强类型接口定义

### 配置参数
- **环境变量**: `VITE_API_BASE_URL` (默认: `https://api.teahvh.cc/api`)
- **认证方式**: Bearer Token (自动从localStorage获取)
- **超时设置**: 15秒请求超时
- **代理配置**: 开发环境支持 `/api` 和 `/steam-api` 代理

### 请求拦截器配置
```typescript
// 自动添加认证头
config.headers.set("Authorization", `Bearer ${token}`);

// 统一错误处理
- 401: 未授权，清除登录状态
- 403: 禁止访问
- 404: 资源不存在  
- 500: 服务器错误
```

## 数据模型

### 用户相关类型
```typescript
interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  steamId?: string
  displayName?: string
  profileUrl?: string
  isAdmin?: boolean
  createdAt?: string
  updatedAt?: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface SteamAuthResponse {
  token: string
  user: User
  expiresIn: number
}
```

### 服务器相关类型
```typescript
interface OnlinePlayer {
  name: string
  steam: string
}

interface ServerInfo {
  players: number
  bots: number
  maxplayers: number
  map: string
  name: string
  online: OnlinePlayer[]
  port?: number
  location?: string
  features?: string[]
  ping?: number
}
```

## 测试和质量

### 开发环境特性
- **Mock数据支持**: Steam登录和用户信息在开发环境提供模拟数据
- **API测试页面**: `/api-demo` 路由提供接口测试界面
- **错误模拟**: 支持各种HTTP状态码的错误响应测试

### 质量保证
- TypeScript强类型检查
- 统一的错误处理和日志记录
- 响应数据结构验证
- 请求超时和重试机制

## 常见问题 (FAQ)

### Q: 如何添加新的API接口？
A: 1. 在对应功能模块文件中添加接口函数；2. 定义TypeScript类型；3. 在index.ts中导出；4. 更新文档。

### Q: Steam登录在开发环境如何测试？
A: 开发环境下steamLogin函数会返回模拟数据，无需真实Steam认证，方便调试。

### Q: API请求失败如何处理？
A: 所有API请求都会通过响应拦截器统一处理错误，自动显示错误信息并处理特殊状态码（如401登出）。

### Q: 如何自定义API基础URL？
A: 设置环境变量 `VITE_API_BASE_URL` 即可覆盖默认的API地址。

## 相关文件列表

### 核心文件
- `index.ts` - API模块入口，导出所有接口
- `user.ts` - 用户认证相关API接口
- `server.ts` - 服务器信息相关API接口
- `announcement.ts` - 公告系统API接口
- `levelrank.ts` - 排行榜API接口

### 依赖文件
- `../utils/request.ts` - HTTP请求封装
- `../types/config.ts` - 类型定义文件
- `../../public/config/text.json` - 配置文件

### 测试和演示
- `../components/demo/ApiDemo.vue` - API测试演示组件
- `../views/SteamCallback.vue` - Steam登录回调处理页面

## 变更日志 (Changelog)

### 2025-08-25 14:48:43
- **[初始化]** 创建API模块文档
- **[接口梳理]** 完成用户认证、服务器信息、公告、排行榜接口分析
- **[类型定义]** 整理TypeScript接口类型和数据模型