<template>
  <div class="steam-callback-container">
    <div class="callback-content">
      <n-spin size="large" />
      <h2>正在处理 Steam 登录...</h2>
      <p>请稍候，我们正在验证您的 Steam 账号信息</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

onMounted(async () => {
  try {
    console.log('Steam 回调页面加载，URL参数:', window.location.search)
    
    // 获取 URL 参数
    const openidParams = new URLSearchParams(window.location.search)
    
    // 导入 Steam 认证工具
    const { createSteamAuthenticator } = await import('@/utils/steamAuth')
    const steamAuth = createSteamAuthenticator()
    
    // 使用新的认证工具验证回调
    const authResult = await steamAuth.authenticateUser(openidParams)
    
    console.log('Steam 认证结果:', authResult)
    
    if (authResult.success && authResult.user) {
      // 使用会话管理器创建安全会话
      const { sessionManager } = await import('@/utils/session')
      const session = sessionManager.createSession(authResult.user)
      
      // 更新用户状态
      userStore.token = session.token
      userStore.user = session.user
      
      console.log('Steam 登录成功，用户信息:', session.user)
      message.success('Steam 登录成功！')
      router.push('/')
    } else {
      console.error('Steam 登录失败:', authResult.error)
      message.error(authResult.error || 'Steam 登录失败')
      router.push('/')
    }
  } catch (error: any) {
    console.error('Steam 回调处理失败:', error)
    message.error(error.message || 'Steam 登录处理失败')
    router.push('/')
  }
})

// 从 OpenID identity 中提取 Steam ID
const extractSteamId = (identity: string): string | null => {
  // Steam identity 格式: https://steamcommunity.com/openid/id/76561197960287930
  const match = identity.match(/\/(\d+)$/)
  return match ? match[1] : null
}
</script>

<style scoped>
.steam-callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  text-align: center;
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.callback-content h2 {
  margin: 24px 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.callback-content p {
  margin: 0;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}
</style>