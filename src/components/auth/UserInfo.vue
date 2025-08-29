<template>
  <div class="user-info-container">
    <n-dropdown
      :options="userMenuOptions"
      placement="bottom-end"
      trigger="click"
      @select="handleMenuSelect"
    >
      <div class="user-avatar" :class="{ 'is-steam': isSteamUser }">
        <n-avatar
          :size="40"
          :src="user?.avatar"
          :fallback-src="defaultAvatar"
          class="avatar"
        >
          <n-icon v-if="!user?.avatar">
            <person-outline />
          </n-icon>
        </n-avatar>
        
        <!-- Steam 标识 -->
        <div v-if="isSteamUser" class="steam-badge">
          <n-icon size="12">
            <logo-steam />
          </n-icon>
        </div>
      </div>
    </n-dropdown>

    <!-- 用户详情弹窗 -->
    <n-modal v-model:show="showDetailModal" :mask-closable="true">
      <n-card
        title="用户信息"
        :bordered="false"
        size="large"
        role="dialog"
        aria-modal="true"
        class="user-detail-modal"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showDetailModal = false">
            <template #icon>
              <n-icon><close-outline /></n-icon>
            </template>
          </n-button>
        </template>

        <div class="user-detail-content">
          <div class="user-header">
            <n-avatar
              :size="80"
              :src="user?.avatar"
              :fallback-src="defaultAvatar"
              class="detail-avatar"
            >
              <n-icon v-if="!user?.avatar" size="40">
                <person-outline />
              </n-icon>
            </n-avatar>
            
            <div class="user-info">
              <h3>{{ user?.displayName || user?.username }}</h3>
              <p v-if="isSteamUser" class="steam-info">
                <n-icon size="16">
                  <logo-steam />
                </n-icon>
                Steam 用户
              </p>
              <p v-if="user?.isAdmin" class="admin-badge">
                <n-icon size="16">
                  <shield-checkmark-outline />
                </n-icon>
                管理员
              </p>
            </div>
          </div>

          <n-divider />

          <div class="user-details">
            <div class="detail-item">
              <span class="label">用户名:</span>
              <span class="value">{{ user?.username }}</span>
            </div>
            
            <div v-if="user?.email" class="detail-item">
              <span class="label">邮箱:</span>
              <span class="value">{{ user?.email }}</span>
            </div>
            
            <div v-if="user?.steamId" class="detail-item">
              <span class="label">Steam ID:</span>
              <span class="value">{{ user?.steamId }}</span>
            </div>
            
            <div v-if="user?.createdAt" class="detail-item">
              <span class="label">注册时间:</span>
              <span class="value">{{ formatDate(user?.createdAt) }}</span>
            </div>
          </div>

          <div class="user-actions">
            <n-button type="primary" @click="goToProfile">
              <template #icon>
                <n-icon><person-outline /></n-icon>
              </template>
              个人主页
            </n-button>
            
            <n-button @click="handleLogout" type="error">
              <template #icon>
                <n-icon><log-out-outline /></n-icon>
              </template>
              退出登录
            </n-button>
          </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NAvatar,
  NDropdown,
  NModal,
  NCard,
  NButton,
  NIcon,
  NDivider,
  useDialog
} from 'naive-ui'
import {
  PersonOutline,
  LogOutOutline,
  ShieldCheckmarkOutline,
  CloseOutline,
  LogoSteam
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

// 状态
const showDetailModal = ref(false)

// 默认头像
const defaultAvatar = '/public/images/team/default-avatar.jpg'

// 计算属性
const user = computed(() => userStore.user)
const isSteamUser = computed(() => userStore.isSteamUser)

// 用户菜单选项
const userMenuOptions = computed(() => [
  {
    label: '个人信息',
    key: 'profile',
    icon: () => h(NIcon, null, { default: () => h(PersonOutline) })
  },
  {
    label: '设置',
    key: 'settings',
    icon: () => h(NIcon, null, { default: () => h(PersonOutline) })
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  }
])

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      showDetailModal.value = true
      break
    case 'settings':
      message.info('设置功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = () => {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      userStore.logout()
      message.success('已退出登录')
      router.push('/')
    }
  })
}

// 跳转到个人主页
const goToProfile = () => {
  message.info('个人主页功能开发中...')
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.user-info-container {
  position: relative;
}

.user-avatar {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar.is-steam .avatar {
  border: 2px solid #1b2838;
}

.steam-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #1b2838;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.avatar {
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: #4080ff;
}

.user-detail-modal {
  max-width: 500px;
  width: 90%;
}

.user-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.detail-avatar {
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.user-info p {
  margin: 4px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.steam-info {
  color: #1b2838;
  font-weight: 500;
}

.admin-badge {
  color: #ff4d4f;
  font-weight: 500;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.detail-item .value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 640px) {
  .user-detail-modal {
    width: 95%;
    margin: 20px;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-details {
    gap: 12px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .user-actions {
    flex-direction: column;
  }
}
</style>