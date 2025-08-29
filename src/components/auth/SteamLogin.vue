<template>
  <div class="steam-login-container">
    <n-modal v-model:show="showModal" :mask-closable="true" @close="handleClose">
      <n-card
        title="Steam 登录"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="steam-login-modal"
      >
        <template #header-extra>
          <n-button quaternary circle @click="handleClose">
            <template #icon>
              <n-icon><close-outline /></n-icon>
            </template>
          </n-button>
        </template>

        <div class="steam-login-content">
          <div class="steam-logo">
            <n-icon size="64" color="#1b2838">
              <logo-steam />
            </n-icon>
          </div>
          
          <div class="steam-description">
            <h3>使用 Steam 账号登录</h3>
            <p>安全便捷，无需记住额外密码</p>
          </div>

          <div class="steam-actions">
            <n-button
              type="primary"
              size="large"
              :loading="isLoading"
              @click="handleSteamLogin"
              class="steam-login-button"
            >
              <template #icon>
                <n-icon><logo-steam /></n-icon>
              </template>
              {{ isLoading ? '登录中...' : '使用 Steam 登录' }}
            </n-button>
            
            <!-- 开发环境下的模拟登录按钮 -->
            <n-button
              v-if="isDev"
              type="info"
              size="small"
              @click="handleMockSteamLogin"
              class="mock-login-button"
            >
              模拟 Steam 登录 (开发测试)
            </n-button>
          </div>

          <div class="steam-steps" v-if="!isLoading">
            <h4>登录步骤：</h4>
            <ol>
              <li>点击"使用 Steam 登录"按钮</li>
              <li>在新窗口中完成 Steam 授权</li>
              <li>授权成功后自动返回本站</li>
            </ol>
          </div>

          <div class="steam-loading" v-if="isLoading">
            <n-spin size="large" />
            <p>正在等待 Steam 授权...</p>
          </div>
        </div>
      </n-card>
    </n-modal>

    <!-- Steam 登录回调处理 -->
    <div v-if="showCallback" class="steam-callback">
      <n-spin size="large" />
      <p>正在处理 Steam 登录回调...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  NModal, 
  NCard, 
  NButton, 
  NIcon, 
  NSpin,
  useDialog 
} from 'naive-ui'
import { 
  LogoSteam, 
  CloseOutline 
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', user: any): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<Emits>()

const message = useMessage()
const userStore = useUserStore()

// 开发环境标志
const isDev = import.meta.env.DEV

// 状态
const showModal = ref(props.visible)
const isLoading = ref(false)
const showCallback = ref(false)

// 监听 props 变化
watch(() => props.visible, (newValue: boolean) => {
  showModal.value = newValue
})

// 监听内部状态变化
watch(showModal, (newValue: boolean) => {
  emit('update:visible', newValue)
})

// 检查 URL 参数是否包含 Steam 回调
onMounted(() => {
  checkSteamCallback()
})

// 检查 Steam 回调
const checkSteamCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    showCallback.value = true
    await handleSteamCallback(code)
  }
}

// 处理 Steam 回调
const handleSteamCallback = async (code: string) => {
  try {
    const result = await userStore.steamLogin(code)
    
    if (result.success) {
      message.success('Steam 登录成功！')
      emit('success', userStore.user)
      
      // 清除 URL 参数
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      window.history.replaceState({}, '', url.toString())
      
      handleClose()
    } else {
      message.error(result.error || 'Steam 登录失败')
    }
  } catch (error: any) {
    message.error(error.message || 'Steam 登录失败')
  } finally {
    showCallback.value = false
  }
}

// 处理 Steam 登录
const handleSteamLogin = async () => {
  isLoading.value = true
  
  try {
    // 使用新的 Steam 认证工具
    const { createSteamAuthenticator } = await import('@/utils/steamAuth')
    const steamAuth = createSteamAuthenticator()
    
    // 生成 Steam 登录 URL
    const steamAuthUrl = steamAuth.generateLoginUrl()
    
    console.log('开始 Steam 登录流程，跳转到:', steamAuthUrl)
    
    // 在当前窗口跳转到 Steam 授权页面
    window.location.href = steamAuthUrl
  } catch (error) {
    console.error('Steam 登录初始化失败:', error)
    message.error('Steam 登录初始化失败，请稍后重试')
    isLoading.value = false
  }
}

// 处理模拟 Steam 登录 (开发环境)
const handleMockSteamLogin = async () => {
  if (!import.meta.env.DEV) return
  
  isLoading.value = true
  
  try {
    // 模拟一个 Steam ID
    const mockSteamId = '76561197960287930'
    const result = await userStore.steamLogin(mockSteamId)
    
    if (result.success) {
      message.success('模拟 Steam 登录成功！')
      emit('success', userStore.user)
      handleClose()
    } else {
      message.error(result.error || '模拟 Steam 登录失败')
    }
  } catch (error: any) {
    message.error(error.message || '模拟 Steam 登录失败')
  } finally {
    isLoading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  showModal.value = false
  emit('close')
  isLoading.value = false
}
</script>

<style scoped>
.steam-login-container {
  position: relative;
}

.steam-login-modal {
  max-width: 500px;
  width: 90%;
}

.steam-login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
}

.steam-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b2838 0%, #2a475e 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.steam-description {
  text-align: center;
}

.steam-description h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.steam-description p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.steam-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.steam-login-button {
  width: 100%;
  max-width: 300px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #1b2838 0%, #2a475e 100%);
  border: none;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.steam-login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 40, 56, 0.4);
}

.mock-login-button {
  margin-top: 12px;
  width: 100%;
  max-width: 300px;
}

.steam-steps {
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.steam-steps h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.steam-steps ol {
  margin: 0;
  padding-left: 20px;
}

.steam-steps li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.steam-steps li:last-child {
  margin-bottom: 0;
}

.steam-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.steam-loading p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.steam-callback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.steam-callback p {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}

@media (max-width: 640px) {
  .steam-login-modal {
    width: 95%;
    margin: 20px;
  }
  
  .steam-login-content {
    padding: 16px 0;
  }
  
  .steam-description h3 {
    font-size: 18px;
  }
  
  .steam-login-button {
    height: 44px;
    font-size: 15px;
  }
}
</style>