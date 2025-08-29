# 状态管理模块

[根目录](../../CLAUDE.md) > [src](../) > **stores**

## 模块职责

状态管理模块基于Pinia构建，负责应用程序的全局状态管理。当前主要管理用户认证状态、用户信息和登录会话数据。提供响应式的状态更新、持久化存储和跨组件的状态共享功能。

## 入口和启动

- **模块入口**: `index.ts` - 创建和配置Pinia实例
- **主要Store**: `user.ts` - 用户状态管理Store
- **初始化**: 在 `main.ts` 中注册，在 `DefaultLayout.vue` 中初始化

## 外部接口

### Pinia Store入口 (`index.ts`)
```typescript
import { createPinia } from 'pinia'

const pinia = createPinia()
export default pinia

// 导出用户Store
export { useUserStore } from './user'
```

### 用户状态管理Store (`user.ts`)
```typescript
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>()
  const user = ref<User | null>()
  const isLoading = ref(false)
  const error = ref<string | null>()
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isSteamUser = computed(() => !!user.value?.steamId)
  
  // 方法
  const initialize = async () => { /* 初始化用户状态 */ }
  const login = async (credentials: LoginCredentials) => { /* 用户名密码登录 */ }
  const steamLogin = async (steamId: string) => { /* Steam登录 */ }
  const fetchUserInfo = async () => { /* 获取用户信息 */ }
  const logout = () => { /* 退出登录 */ }
  const restoreFromStorage = () => { /* 从本地存储恢复 */ }
})
```

## 核心依赖和配置

### 依赖关系
- `pinia`: Vue官方状态管理库
- `@/api/user`: 用户相关API接口
- `localStorage`: 浏览器本地存储，用于状态持久化

### 状态持久化策略
```typescript
// 登录成功后保存到localStorage
localStorage.setItem('token', newToken)
localStorage.setItem('user', JSON.stringify(userInfo))

// 页面刷新时自动恢复状态
const restoreFromStorage = () => {
  const savedToken = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  
  if (savedToken && savedUser) {
    token.value = savedToken
    user.value = JSON.parse(savedUser)
  }
}
```

### 状态初始化流程
1. 应用启动时在`DefaultLayout.vue`中调用`userStore.initialize()`
2. 从localStorage恢复token和用户信息
3. 如果有有效token，自动获取最新用户信息
4. 处理token过期和网络错误情况

## 数据模型

### 用户状态类型
```typescript
interface User {
  id: string
  username: string
  email?: string
  avatar?: string           // 用户头像URL
  steamId?: string         // Steam用户唯一标识
  displayName?: string     // 用户显示名称
  profileUrl?: string      // Steam个人资料URL
  isAdmin?: boolean        // 管理员权限标识
  createdAt?: string       // 账户创建时间
  updatedAt?: string       // 最后更新时间
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

### Store状态结构
```typescript
// 响应式状态
const token = ref<string | null>(localStorage.getItem('token'))
const user = ref<User | null>(null)
const isLoading = ref(false)        // 加载状态指示器
const error = ref<string | null>(null)  // 错误信息

// 计算属性
const isLoggedIn = computed(() => !!token.value)        // 登录状态
const isSteamUser = computed(() => !!user.value?.steamId) // Steam用户标识
```

## 测试和质量

### 状态管理最佳实践
- **响应式设计**: 使用ref和computed确保状态变化自动触发UI更新
- **错误处理**: 统一的错误状态管理和用户友好的错误提示
- **加载状态**: 为异步操作提供loading状态，改善用户体验
- **数据一致性**: 确保状态与后端数据同步，自动处理token过期

### 开发和测试支持
- **状态调试**: Pinia DevTools支持，可视化状态变化
- **Mock数据**: 开发环境下支持模拟用户数据
- **状态重置**: 提供logout方法清除所有用户状态
- **错误恢复**: 自动处理token过期和网络错误

### 性能优化
- **计算属性缓存**: 使用computed避免重复计算
- **状态局部化**: 只在需要时加载用户数据
- **内存管理**: 登出时及时清理状态和事件监听

## 常见问题 (FAQ)

### Q: 页面刷新后为什么需要重新登录？
A: 如果刷新后需要重新登录，可能是token已过期或localStorage被清除。Store会自动检测并处理这种情况。

### Q: 如何在组件中使用用户状态？
A: 在组件中导入`import { useUserStore } from '@/stores/user'`，然后使用`const userStore = useUserStore()`获取状态和方法。

### Q: Steam登录和普通登录有什么区别？
A: Steam登录通过OpenID获取steamId，普通登录使用用户名密码。两种方式都会设置相同的token和用户状态结构。

### Q: 如何处理并发登录请求？
A: Store使用isLoading状态防止重复请求，确保同时只有一个登录操作在进行。

### Q: 用户权限如何管理？
A: 通过user对象中的isAdmin字段管理用户权限，可以在组件中通过计算属性或方法检查权限。

## 相关文件列表

### 核心状态文件
- `index.ts` - Pinia实例创建和Store导出
- `user.ts` - 用户状态管理Store

### 集成文件
- `../main.ts` - 应用入口，注册Pinia
- `../layouts/DefaultLayout.vue` - 布局组件，初始化用户状态
- `../components/auth/SteamLogin.vue` - Steam登录组件，调用登录方法
- `../components/auth/UserInfo.vue` - 用户信息组件，显示状态数据

### API接口
- `../api/user.ts` - 用户相关API接口，提供数据源
- `../utils/request.ts` - HTTP请求封装，处理认证token

### 配置和类型
- `../types/config.ts` - TypeScript类型定义
- `../../package.json` - Pinia版本和配置

## 变更日志 (Changelog)

### 2025-08-25 14:48:43
- **[初始化]** 创建状态管理模块文档
- **[架构分析]** 完成用户状态管理Store功能分析
- **[集成梳理]** 整理与认证组件和API模块的集成关系
- **[最佳实践]** 记录状态管理的性能优化和错误处理策略