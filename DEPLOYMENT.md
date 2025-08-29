# 🚀 宝塔面板部署指南

本指南详细说明如何将 TeaHvh-Web 项目部署到使用宝塔面板的服务器上。

## 📋 部署前准备

### 系统要求
- ✅ Linux 服务器（推荐 CentOS 7+ 或 Ubuntu 18+）
- ✅ 宝塔面板 7.0+
- ✅ Nginx 1.18+
- ✅ 已备案的域名
- ✅ SSL 证书（Let's Encrypt 或付费证书）

### 本地准备
- ✅ 完成 Steam 应用配置（参考 `STEAM_SETUP.md`）
- ✅ 配置生产环境变量（`.env.production`）
- ✅ 本地测试通过

## 🛠️ 第一步：准备生产环境配置

### 1.1 创建生产环境配置

```bash
# 复制配置模板
cp .env.production.template .env.production

# 编辑配置文件
vim .env.production
```

### 1.2 填写关键配置

重点配置以下项目：

```bash
# 替换为实际域名
VITE_SITE_URL=https://yourdomain.com
VITE_STEAM_REALM=https://yourdomain.com
VITE_STEAM_RETURN_URL=https://yourdomain.com/steam-callback

# 填入 Steam API 密钥
VITE_STEAM_API_KEY=your_steam_api_key_here

# 配置安全密钥
VITE_SESSION_KEY=your_random_session_key_here
```

## 🏗️ 第二步：构建生产版本

### 2.1 安装依赖并构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2.2 验证构建结果

```bash
# 检查构建产物
ls -la dist/

# 应该看到以下文件：
# - index.html
# - assets/ (CSS 和 JS 文件)
# - 其他静态资源
```

### 2.3 本地预览构建版本

```bash
# 预览生产版本
npm run preview

# 访问 http://localhost:4173 测试
```

## 🌐 第三步：宝塔面板配置

### 3.1 创建网站

1. **登录宝塔面板**
   - 访问 `http://your_server_ip:8888`
   - 输入用户名和密码登录

2. **添加站点**
   - 点击左侧 "网站"
   - 点击 "添加站点"
   - 填写域名：`yourdomain.com`
   - 选择 PHP 版本：选择 "纯静态"
   - 点击 "提交"

### 3.2 配置 SSL 证书

1. **申请免费证书**
   - 在网站列表中，点击域名对应的 "设置"
   - 选择 "SSL" 标签页
   - 点击 "Let's Encrypt"
   - 填写邮箱并点击 "申请"
   - 等待证书申请完成

2. **强制 HTTPS**
   - 在 SSL 设置页面，开启 "强制HTTPS"
   - 开启 "HSTS"

### 3.3 配置 Nginx

1. **使用自定义配置**
   - 在网站设置中，选择 "配置文件" 标签页
   - 备份现有配置
   - 复制 `deploy/nginx.conf` 的内容
   - 替换配置文件内容
   - **重要**: 将所有 `yourdomain.com` 替换为您的实际域名

2. **重载 Nginx 配置**
   - 点击 "保存"
   - 重启 Nginx 服务

## 📁 第四步：上传网站文件

### 4.1 方式一：使用宝塔面板文件管理器

1. **清空网站目录**
   - 进入 "文件" → 找到网站根目录（通常是 `/www/wwwroot/yourdomain.com`）
   - 删除默认的 `index.html` 和其他文件

2. **上传构建文件**
   - 将本地 `dist` 文件夹中的所有内容上传到网站根目录
   - 确保 `index.html` 在根目录下

### 4.2 方式二：使用 SCP 命令

```bash
# 压缩构建文件
tar -czf dist.tar.gz -C dist .

# 上传到服务器
scp dist.tar.gz root@your_server_ip:/www/wwwroot/yourdomain.com/

# 登录服务器解压
ssh root@your_server_ip
cd /www/wwwroot/yourdomain.com
tar -xzf dist.tar.gz
rm dist.tar.gz

# 设置权限
chown -R www:www /www/wwwroot/yourdomain.com
chmod -R 755 /www/wwwroot/yourdomain.com
```

### 4.3 方式三：使用 Git 自动部署

1. **在服务器上克隆仓库**
   ```bash
   cd /www/wwwroot
   git clone https://github.com/your-username/TeaHvh-Web.git yourdomain.com
   cd yourdomain.com
   ```

2. **安装 Node.js 环境**
   - 在宝塔面板中安装 "Node.js 版本管理器"
   - 安装 Node.js 16+ 版本

3. **创建部署脚本**
   ```bash
   # 创建 deploy.sh
   cat > deploy.sh << 'EOF'
   #!/bin/bash
   git pull origin main
   npm install
   npm run build
   cp -r dist/* /www/wwwroot/yourdomain.com/
   chown -R www:www /www/wwwroot/yourdomain.com
   EOF
   
   chmod +x deploy.sh
   ```

## 🔧 第五步：配置优化

### 5.1 创建日志目录

```bash
mkdir -p /www/wwwroot/yourdomain.com/logs
chown -R www:www /www/wwwroot/yourdomain.com/logs
```

### 5.2 配置防火墙

在宝塔面板中：
1. 进入 "安全" → "防火墙"
2. 确保以下端口已开放：
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 8888 (宝塔面板)

### 5.3 性能优化

1. **启用 Gzip 压缩**（已在 nginx.conf 中配置）
2. **配置浏览器缓存**（已在 nginx.conf 中配置）
3. **启用 HTTP/2**（已在 nginx.conf 中配置）

## 🧪 第六步：测试部署

### 6.1 基础功能测试

1. **访问网站**
   - 打开浏览器访问 `https://yourdomain.com`
   - 确认网站正常加载
   - 检查 HTTPS 证书是否有效

2. **测试 Steam 登录**
   - 点击登录按钮
   - 点击 "使用 Steam 登录"
   - 完成整个登录流程
   - 确认用户信息正确显示

### 6.2 性能测试

1. **使用浏览器开发者工具**
   - 检查网络请求是否正常
   - 验证静态资源缓存是否生效
   - 确认 Gzip 压缩是否启用

2. **使用在线工具测试**
   - [GTmetrix](https://gtmetrix.com/)
   - [PageSpeed Insights](https://pagespeed.web.dev/)
   - [SSL Labs](https://www.ssllabs.com/ssltest/)

## 🔄 第七步：自动化部署（可选）

### 7.1 使用 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_STEAM_API_KEY: ${{ secrets.STEAM_API_KEY }}
        VITE_SITE_URL: https://yourdomain.com
        # 其他环境变量...
    
    - name: Deploy to server
      uses: appleboy/scp-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        source: "dist/*"
        target: "/www/wwwroot/yourdomain.com/"
        strip_components: 1
```

### 7.2 配置 Webhook

1. 在宝塔面板中安装 "宝塔WebHook"
2. 创建 WebHook，设置拉取代码并重新构建
3. 在 GitHub 仓库设置中配置 WebHook

## 📊 第八步：监控和维护

### 8.1 日志监控

1. **查看访问日志**
   ```bash
   tail -f /www/wwwroot/yourdomain.com/logs/access.log
   ```

2. **查看错误日志**
   ```bash
   tail -f /www/wwwroot/yourdomain.com/logs/error.log
   ```

### 8.2 定期维护

1. **定期更新**
   - 更新 Node.js 依赖
   - 更新宝塔面板
   - 续期 SSL 证书（Let's Encrypt 自动续期）

2. **备份策略**
   - 定期备份网站文件
   - 备份 nginx 配置
   - 备份环境变量配置

## ❓ 常见问题

### 问题 1：网站访问 404

**解决方法**：
1. 检查网站文件是否正确上传
2. 确认 `index.html` 在根目录
3. 检查 nginx 配置是否正确

### 问题 2：Steam 登录失败

**解决方法**：
1. 确认域名和回调 URL 配置正确
2. 检查 HTTPS 证书是否有效
3. 验证 Steam API 密钥是否正确

### 问题 3：静态资源加载失败

**解决方法**：
1. 检查文件权限（644 for files, 755 for directories）
2. 确认 nginx 配置中的静态资源规则
3. 检查防火墙设置

---

部署完成后，您的 TeaHvh-Web 应用就可以在生产环境中正常运行了！

如有其他问题，请参考项目中的其他文档或联系技术支持。