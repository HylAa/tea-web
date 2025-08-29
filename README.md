# TeaHvh Gaming Community

> 基于 Vue 3 + TypeScript 的现代化游戏社区平台，专为【茶】社区开发

[![Vue](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Naive UI](https://img.shields.io/badge/Naive%20UI-2.38.0-18A058?style=flat)](https://www.naiveui.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 项目简介

TeaHvh Gaming Community 是一个专业的游戏社区平台，提供服务器信息展示、Steam 用户认证、排行榜系统等功能。项目采用现代化的前端技术栈，具备完善的用户认证系统、安全会话管理和响应式设计。

### 🌟 核心特性

- 🔐 **Steam OpenID 登录** - 集成 Steam 官方认证系统
- 🖥️ **服务器信息展示** - 实时服务器状态监控和玩家信息
- 📊 **排行榜系统** - 玩家等级排名和统计信息
- 👤 **用户管理** - 完整的用户状态管理和会话持久化
- 🛡️ **安全防护** - CSRF 保护、会话指纹验证、设备管理
- 📱 **响应式设计** - 适配桌面和移动端设备
- 🎨 **现代化 UI** - 基于 Naive UI 的专业界面设计
- ⚡ **高性能** - Vite 构建，快速开发和部署

### 🛠️ 技术架构

- **前端框架**: Vue 3 + Composition API + TypeScript
- **UI 组件库**: Naive UI (专业级 Vue 组件库)
- **状态管理**: Pinia (Vue 官方状态管理库)
- **路由系统**: Vue Router 4 (支持动态路由和懒加载)
- **构建工具**: Vite (快速现代化构建工具)
- **HTTP 客户端**: Axios (统一 API 请求管理)
- **认证系统**: Steam OpenID 2.0 集成
- **安全机制**: CSRF 保护、会话指纹、安全存储

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 现代浏览器支持 (Chrome 88+, Firefox 78+, Safari 14+)

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-org/teahvh-web.git
cd teahvh-web

# 安装依赖
npm install
```

### 环境配置

复制环境配置模板并填入实际配置：

```bash
# 开发环境
cp .env.development.template .env.development

# 生产环境  
cp .env.production.template .env.production
```

#### 必需的环境变量

```env
# API 配置
VITE_API_BASE_URL=https://api.teahvh.cc/api
VITE_SITE_URL=https://www.teahvh.cc

# Steam 登录配置 (必填)
VITE_STEAM_API_KEY=你的Steam_API密钥
VITE_STEAM_REALM=https://www.teahvh.cc
VITE_STEAM_RETURN_URL=https://www.teahvh.cc/steam-callback

# 安全配置
VITE_SESSION_KEY=你的会话加密密钥
VITE_FINGERPRINT_KEY=设备指纹密钥
VITE_SESSION_EXPIRE_HOURS=168
```

### 开发环境启动

```bash
# 启动开发服务器
npm run dev

# 项目将在 http://localhost:5173 启动
```

### 构建和部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 构建输出在 dist/ 目录
```

## 📁 项目结构

```
src/
├── api/                 # API 接口管理
│   ├── user.ts         # 用户相关 API
│   ├── server.ts       # 服务器信息 API
│   ├── announcement.ts # 公告 API
│   └── levelrank.ts    # 排行榜 API
├── assets/             # 静态资源
├── components/         # 组件库
│   ├── auth/          # 认证组件
│   ├── home/          # 首页组件
│   ├── servers/       # 服务器组件
│   └── icons/         # 图标组件
├── layouts/           # 布局组件
│   └── DefaultLayout.vue
├── router/            # 路由配置
│   └── index.ts
├── stores/            # 状态管理 (Pinia)
│   ├── user.ts       # 用户状态
│   └── index.ts      # 状态入口
├── utils/             # 工具函数
│   ├── request.ts    # HTTP 请求封装
│   ├── steamAuth.ts  # Steam 认证工具
│   ├── session.ts    # 会话管理
│   ├── security.ts   # 安全工具
│   └── appConfig.ts  # 应用配置
├── views/             # 页面组件
│   ├── Home.vue      # 首页
│   ├── Servers.vue   # 服务器列表
│   └── SteamCallback.vue  # Steam 回调
└── types/             # TypeScript 类型定义
```

## 🔐 Steam 登录集成

### 获取 Steam API 密钥

1. 访问 [Steam Web API Key](https://steamcommunity.com/dev/apikey)
2. 使用 Steam 账号登录
3. 填写域名信息获取 API Key
4. 将 API Key 配置到环境变量中

### Steam 登录流程

1. **用户点击登录** → 生成 Steam OpenID 登录 URL
2. **跳转到 Steam** → 用户在 Steam 官方页面授权
3. **回调验证** → 验证 OpenID 签名和用户信息
4. **创建会话** → 生成安全会话并持久化存储
5. **状态同步** → 更新用户状态和权限信息

### 安全特性

- ✅ OpenID 2.0 标准协议
- ✅ Steam 官方签名验证
- ✅ 设备指纹防护
- ✅ 会话过期管理
- ✅ 多设备登录检测
- ✅ CSRF 攻击防护

## 🏗️ 部署指南

### Nginx 配置

项目包含完整的 Nginx 反向代理配置 (`bt.nginx.conf`)：

```nginx
# API 反向代理
location /api/ {
    proxy_pass https://api.teahvh.cc/api/;
    proxy_set_header Host api.teahvh.cc;
    # ... 其他配置
}

# Steam API 代理
location /steam-web-api/ {
    proxy_pass https://api.steampowered.com/;
    proxy_set_header Host api.steampowered.com;
    # ... CORS 配置
}
```

### 部署步骤

1. **构建项目**
   ```bash
   npm run build
   ```

2. **上传文件**
   - 将 `dist/` 目录内容上传到服务器
   - 配置 Nginx 反向代理

3. **SSL 证书**
   - Steam 登录要求 HTTPS 协议
   - 配置有效的 SSL 证书

4. **环境变量**
   - 更新生产环境配置
   - 确保 API 密钥安全

## 🔧 开发指南

### 添加新 API 接口

```typescript
// src/api/example.ts
import request from '@/utils/request'

export function getExampleData(params: any) {
  return request({
    url: '/example',
    method: 'get',
    params
  })
}
```

### 创建新组件

```vue
<!-- src/components/example/ExampleComponent.vue -->
<template>
  <div class="example-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 组件逻辑
</script>
```

### 状态管理

```typescript
// src/stores/example.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  const state = ref('')
  const getter = computed(() => state.value)
  
  const action = () => {
    // 状态操作
  }
  
  return { state, getter, action }
})
```

## 🧪 测试

### 开发环境测试

项目在开发环境下提供 Mock 数据支持：

- Steam 登录模拟功能
- API 接口 Mock 数据
- 用户状态模拟

### 功能测试检查点

- [ ] Steam 登录流程完整
- [ ] 页面刷新状态保持
- [ ] 服务器信息正确显示
- [ ] 排行榜数据加载
- [ ] 响应式设计适配
- [ ] 安全机制有效

## 📝 更新日志

### v1.2.0 (2025-08-29)
- 🔧 修复 Steam 登录状态持久化问题
- 📖 完善 README 文档和部署指南
- 🛡️ 增强会话安全管理
- ⚡ 优化应用初始化流程

### v1.1.0 (2025-08-28)
- ✨ 完整的 Steam OpenID 认证系统
- 🔒 安全会话管理和设备指纹验证
- 📊 服务器信息和排行榜功能
- 🎨 Naive UI 界面优化

### v1.0.0 (2025-08-25)
- 🎉 项目初始化和基础架构
- 🖥️ Vue 3 + TypeScript 开发环境
- 🎯 核心功能模块实现

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目到你的 GitHub
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 最佳实践
- 组件使用 PascalCase 命名
- 函数和变量使用 camelCase 命名
- 添加适当的注释和文档

## ❓ 常见问题

### Q: Steam 登录失败怎么办？
A: 检查以下配置：
- Steam API Key 是否正确
- 回调 URL 必须是 HTTPS
- 域名配置是否匹配

### Q: 页面刷新后登录状态丢失？
A: 确保：
- 浏览器支持 localStorage
- 没有禁用 Cookie
- 会话未过期

### Q: 如何修改 API 地址？
A: 更新环境变量 `VITE_API_BASE_URL` 或修改 nginx 代理配置。

### Q: 如何启用调试模式？
A: 设置环境变量 `VITE_DEBUG_MODE=true`。

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🔗 相关链接

- [Vue 3 官方文档](https://vuejs.org/)
- [Naive UI 组件库](https://www.naiveui.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Steam Web API 文档](https://developer.valvesoftware.com/wiki/Steam_Web_API)

## 💬 技术支持

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [项目 Issues](https://github.com/your-org/teahvh-web/issues)
- 邮箱: support@teahvh.cc
- 社区论坛: [TeaHvh 社区](https://www.teahvh.cc)

---

<div align="center">
  
**🎮 Gaming Community | ⚡ Powered by Vue 3 | 🔐 Secured by Steam**

Made with ❤️ for gamers, by gamers.

</div>