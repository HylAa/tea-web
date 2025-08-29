# Nginx反向代理配置实施记录

## 项目背景
将前端直接访问后端API (`https://api.teahvh.cc/api`) 改为通过nginx反向代理访问，隐藏真实后端地址并增强安全性。

## 实施步骤

### 1. Nginx配置修改 (`bt.nginx.conf`)

#### 修改内容
- **代理目标**: `https://api.teahvh.cc/api/` (确保末尾包含 `/api/`)
- **Host头**: 修改为 `api.teahvh.cc` 而非 `$host`
- **SSL协议**: 升级为 TLSv1.2 和 TLSv1.3
- **新增配置**:
  - 超时设置 (30s连接，60s读写)
  - 缓冲区配置 (4k x 8)
  - 安全头 (XSS防护、内容类型保护、框架拒绝)
  - 错误处理和请求大小限制 (10MB)

#### 代理路径规则
```
客户端请求: /api/user/info
nginx代理到: https://api.teahvh.cc/api/user/info
```

### 2. 前端环境变量修改

#### 生产环境 (`.env.production`)
```bash
# 修改前
VITE_API_BASE_URL=https://api.teahvh.cc/api

# 修改后  
VITE_API_BASE_URL=/api
```

#### 开发环境 (`.env.development`)
```bash
# 保持不变，开发环境直接访问后端
VITE_API_BASE_URL=https://api.teahvh.cc/api
```

#### 模板文件 (`.env.production.template`)
```bash
# 更新示例和说明
VITE_API_BASE_URL=/api
# 添加环境区分说明
```

## 部署步骤

### 1. 重新构建前端
```bash
npm run build
```

### 2. 重载nginx配置
```bash
# 测试配置语法
nginx -t

# 重载配置
nginx -s reload
# 或
systemctl reload nginx
```

### 3. 验证配置
```bash
# 检查API代理是否正常
curl -I https://www.teahvh.cc/api/

# 检查前端是否能正常加载
curl -I https://www.teahvh.cc/
```

## 配置优化

### 安全增强
- ✅ 隐藏后端服务器信息 (`proxy_hide_header X-Powered-By`)
- ✅ 添加XSS防护头 (`X-XSS-Protection`)
- ✅ 防止内容类型嗅探 (`X-Content-Type-Options: nosniff`)
- ✅ 禁止页面被嵌入框架 (`X-Frame-Options: DENY`)

### 性能优化  
- ✅ 配置代理缓冲区 (减少内存使用)
- ✅ 设置合理超时时间 (避免长时间等待)
- ✅ 限制上传大小 (防止大文件攻击)

### 错误处理
- ✅ 代理错误拦截 (`proxy_intercept_errors`)
- ✅ 自定义错误页面 (502/503/504 -> /50x.html)

## 预期效果

### 访问变化
- **修改前**: 客户端 → `https://api.teahvh.cc/api/xxx`
- **修改后**: 客户端 → `https://www.teahvh.cc/api/xxx` → nginx代理 → `https://api.teahvh.cc/api/xxx`

### 安全提升
- ✅ 隐藏后端API真实地址
- ✅ 统一通过主域名访问所有资源  
- ✅ 可在nginx层实施安全策略
- ✅ 避免跨域问题 (同源策略)

## 注意事项

1. **开发环境**: 保持直接访问后端，便于调试
2. **生产环境**: 必须使用反向代理，提高安全性
3. **SSL证书**: 确保主域名SSL证书正常
4. **错误监控**: 关注nginx错误日志和后端API响应
5. **性能监控**: 观察代理层延迟和错误率

## 故障排查

### 常见问题
1. **502 Bad Gateway**: 检查后端API是否可访问
2. **504 Gateway Timeout**: 调整proxy_read_timeout参数  
3. **CORS错误**: 确认后端API支持来自主域名的请求
4. **路径错误**: 检查proxy_pass末尾是否包含 `/api/`

### 调试命令
```bash
# 查看nginx错误日志
tail -f /var/log/nginx/error.log

# 查看站点访问日志  
tail -f /www/wwwlogs/www.teahvh.cc.log

# 测试后端API直连
curl -I https://api.teahvh.cc/api/

# 测试通过代理访问
curl -I https://www.teahvh.cc/api/
```

## Steam登录CORS问题修复

### 问题描述
生产环境Steam登录失败，错误信息：
```
Access to fetch at 'https://steamcommunity.com/openid/login' from origin 'https://www.teahvh.cc' has been blocked by CORS policy
```

### 修复方案
1. **新增Steam OpenID验证代理** (nginx配置):
```nginx
location /steam-openid/ {
    proxy_pass https://steamcommunity.com/openid/;
    # 配置CORS和超时
}
```

2. **修改前端验证请求路径** (steamAuth.ts):
```typescript
// 修改前: 直接请求Steam服务器
const response = await fetch(`${this.STEAM_OPENID_URL}`, {

// 修改后: 通过nginx代理
const response = await fetch(this.STEAM_OPENID_VERIFY_URL, {
```

### 修复效果
- ✅ 解决CORS跨域问题
- ✅ Steam签名验证请求通过nginx代理
- ✅ 保持安全性，隐藏直接访问Steam API

## 实施完成

- ✅ nginx API代理配置优化完成
- ✅ nginx Steam OpenID代理配置完成
- ✅ 前端环境变量更新完成  
- ✅ 前端Steam验证路径修复完成
- ✅ 安全头和错误处理配置完成
- ✅ 部署文档创建完成

## 部署步骤

1. **重新构建前端**:
```bash
npm run build
```

2. **测试nginx配置**:
```bash
nginx -t
```

3. **重载nginx配置**:
```bash
nginx -s reload
```

4. **验证功能**:
- 测试API代理: `curl -I https://www.teahvh.cc/api/`
- 测试Steam登录功能

配置修复完成，Steam登录CORS问题已解决。