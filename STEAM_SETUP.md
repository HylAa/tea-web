# Steam 第三方登录配置完整指南

本指南将详细说明如何配置 Steam 第三方登录功能，确保在生产环境中正常运行。

## 📋 前置要求

- ✅ 拥有 Steam 账号
- ✅ 已确定网站域名（必须支持 HTTPS）
- ✅ 网站已部署并可通过域名访问

## 🎮 第一步：注册 Steam 开发者账号

### 1.1 访问 Steamworks

1. 打开浏览器，访问 [Steamworks 合作伙伴网站](https://partner.steamgames.com/)
2. 点击右上角 **"登录"** 按钮
3. 使用您的 Steam 账号登录

### 1.2 开发者验证（如果是首次使用）

如果您是首次使用 Steamworks，需要完成开发者验证：

1. 填写开发者信息表单
2. 提供必要的身份验证文档
3. 等待 Steam 审核（通常需要 1-3 个工作日）

> **注意**: 对于网站登录功能，通常不需要付费的开发者许可证。

## ❌ 第二步：无需创建 Steam 应用

**重要说明**：Steam OpenID 登录**不需要**注册 Steam 应用或获取应用 ID。

Steam OpenID 是一个开放的认证协议，只需要：
1. 构造正确的 OpenID 登录 URL
2. 处理 Steam 的回调验证

这与 Steam Web API 或 Steam 游戏开发不同，无需任何应用注册步骤。

## 🔑 第二步：获取 Steam Web API 密钥（可选）

> **重要**：这一步是**可选的**。Steam OpenID 登录本身不需要 API 密钥，但如果您想获取更详细的用户信息（如头像、昵称等），则需要 API 密钥。

### 2.1 申请 API 密钥（可选）

1. 访问 [Steam Web API 密钥页面](https://steamcommunity.com/dev/apikey)
2. 使用您的 Steam 账号登录
3. 填写申请表单：
   - **域名**: 输入您的网站域名（如：`https://yourdomain.com`）
   - **用途描述**: `用于游戏社区网站的 Steam 用户信息获取`

4. 点击 **"注册"** 按钮

### 2.2 保存 API 密钥

- 复制生成的 API 密钥（32位字符串）
- **妥善保存**，这个密钥将用于获取用户详细信息

> **说明**: 
> - **有 API 密钥**：可以获取用户头像、昵称、个人资料等详细信息
> - **无 API 密钥**：只能获取基础的 Steam ID，用户信息将显示默认值

## ⚙️ 第三步：配置网站环境变量

### 3.1 创建生产环境配置文件

在项目根目录创建 `.env.production` 文件：

```bash
# 复制模板文件
cp .env.production.template .env.production
```

### 3.2 填写必要配置

编辑 `.env.production` 文件，**只需要填入以下核心配置**：

```bash
# ========================================
# 基础配置
# ========================================
VITE_SITE_URL=https://yourdomain.com
VITE_APP_TITLE=茶游戏社区

# ========================================
# Steam OpenID 配置（必填）
# ========================================
# Steam 回调域名和地址（重要！必须是实际的 HTTPS 域名）
VITE_STEAM_REALM=https://yourdomain.com
VITE_STEAM_RETURN_URL=https://yourdomain.com/steam-callback

# Steam Web API 密钥（可选 - 用于获取用户详细信息）
VITE_STEAM_API_KEY=YOUR_32_CHARACTER_API_KEY_HERE

# 应用名称（可选）
VITE_STEAM_APP_NAME=茶游戏社区
```

### 3.3 重要说明

- **必填项**：只有 `VITE_STEAM_REALM` 和 `VITE_STEAM_RETURN_URL` 是必需的
- **可选项**：`VITE_STEAM_API_KEY` 用于获取用户头像和昵称，可以不填
- **域名要求**：必须是 HTTPS 域名，不能使用 HTTP 或 IP 地址

### 4.3 配置验证

保存文件后，运行配置验证：

```bash
npm run build
```

如果看到以下输出，说明配置正确：
```
✅ 应用配置验证通过
```

## 🌐 第五步：域名和 HTTPS 配置

### 5.1 域名要求

Steam OpenID 要求：
- ✅ 必须使用**真实域名**（不能是 IP 地址）
- ✅ 必须支持 **HTTPS**
- ✅ 域名必须可以从互联网访问
- ❌ 不支持 `localhost` 或内网域名

### 5.2 宝塔面板 HTTPS 配置

如果您使用宝塔面板，按以下步骤配置 HTTPS：

1. **申请 SSL 证书**：
   - 登录宝塔面板
   - 进入 "网站" → 选择您的网站 → "SSL"
   - 选择 "Let's Encrypt" 或其他证书提供商
   - 点击 "申请" 并等待证书颁发

2. **强制 HTTPS**：
   - 在 SSL 设置页面，开启 "强制HTTPS"
   - 确保所有 HTTP 请求都会重定向到 HTTPS

3. **验证 HTTPS**：
   - 访问 `https://yourdomain.com`
   - 确保浏览器地址栏显示锁图标

## 🔄 第六步：Steam 回调配置验证

### 6.1 确认回调 URL 格式

Steam 将用户重定向到回调 URL，格式必须为：
```
https://yourdomain.com/steam-callback?openid.ns=...&openid.mode=...
```

### 6.2 测试回调页面

1. 访问您的回调页面：`https://yourdomain.com/steam-callback`
2. 应该看到 "正在处理 Steam 登录..." 的页面
3. 如果页面 404，检查路由配置

## 🧪 第七步：测试 Steam 登录功能

### 7.1 本地测试（开发环境）

```bash
# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:5174
```

1. 点击 "登录" 按钮
2. 点击 "模拟 Steam 登录" 测试基本功能
3. 确认模拟登录正常工作

### 7.2 生产环境测试

```bash
# 构建生产版本
npm run build

# 部署到宝塔面板（或上传 dist 文件夹）
```

1. 访问您的网站：`https://yourdomain.com`
2. 点击 "登录" 按钮
3. 点击 "使用 Steam 登录"
4. 应该跳转到 Steam 授权页面
5. 完成授权后应该跳转回您的网站并登录成功

## 🛠️ 常见问题排查

### 问题 1：Steam 授权后无法跳转回网站

**可能原因**：
- 回调 URL 配置错误
- 域名不匹配
- HTTPS 配置问题

**解决方法**：
1. 检查 `.env.production` 中的 `VITE_STEAM_RETURN_URL`
2. 确认域名拼写正确
3. 验证 HTTPS 证书有效

### 问题 2：获取不到 Steam 用户信息

**可能原因**：
- API 密钥无效
- 跨域请求被阻止
- Steam API 限流

**解决方法**：
1. 验证 API 密钥是否正确
2. 检查浏览器开发者工具的网络请求
3. 如果没有 API 密钥，系统会使用 fallback 方案

### 问题 3：配置验证失败

**常见错误信息**：
```
❌ 配置验证失败: ['Steam realm必须使用HTTPS']
```

**解决方法**：
1. 确保所有 Steam 相关的 URL 都以 `https://` 开头
2. 检查域名格式是否正确
3. 确认环境变量文件格式正确

## 📝 配置检查清单

完成配置后，请核对以下清单：

### Steam 配置
- [ ] Steam Web API 密钥已获取
- [ ] `.env.production` 文件已创建并填写
- [ ] Steam realm 和 return URL 使用 HTTPS
- [ ] 域名格式正确（无拼写错误）

### 网站配置  
- [ ] 域名可以正常访问
- [ ] HTTPS 证书有效
- [ ] 强制 HTTPS 已开启
- [ ] 回调页面 `/steam-callback` 可访问

### 功能测试
- [ ] 本地开发环境测试通过
- [ ] 生产环境部署成功
- [ ] Steam 登录流程完整可用
- [ ] 用户信息正确显示

## 🎯 后续优化建议

### 安全性优化
1. **定期更换 API 密钥**：建议每 6 个月更换一次
2. **监控异常登录**：实现登录日志和异常检测
3. **会话安全**：合理设置会话过期时间

### 用户体验优化
1. **错误处理**：为各种异常情况提供友好的错误提示
2. **加载状态**：在登录过程中显示加载动画
3. **移动适配**：确保移动端 Steam 登录体验良好

### 性能优化
1. **缓存策略**：合理缓存用户信息和头像
2. **请求优化**：减少不必要的 API 调用
3. **资源压缩**：优化静态资源大小

---

完成以上配置后，您的网站就具备了完整的 Steam 第三方登录功能！

如有问题，请参考项目中的 `STEAM_LOGIN_TEST.md` 文件进行详细测试。