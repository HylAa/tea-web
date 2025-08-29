import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as userLogin, steamLogin as apiSteamLogin, getUserInfo } from '@/api/user'

export interface User {
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

export interface LoginCredentials {
  username: string
  password: string
}

export interface SteamAuthResponse {
  token: string
  user: User
  expiresIn: number
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isSteamUser = computed(() => !!user.value?.steamId)

  // 初始化
  const initialize = async () => {
    if (token.value) {
      await fetchUserInfo()
    }
  }

  // 用户名密码登录
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await userLogin(credentials)
      
      if (response.data.code === 200) {
        const { token: newToken, user: userInfo } = response.data.data
        token.value = newToken
        user.value = userInfo
        
        // 保存到 localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userInfo))
        
        return { success: true }
      } else {
        throw new Error(response.data.message || '登录失败')
      }
    } catch (err: any) {
      error.value = err.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Steam 登录
  const steamLogin = async (steamId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('正在调用 Steam 登录 API，steamId:', steamId)
      const response = await apiSteamLogin(steamId)
      
      console.log('Steam 登录 API 响应:', response)
      
      if (response.data.code === 200) {
        const { token: newToken, user: userInfo } = response.data.data
        token.value = newToken
        user.value = userInfo
        
        // 保存到 localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userInfo))
        
        console.log('Steam 登录成功，用户信息:', userInfo)
        
        return { success: true }
      } else {
        console.error('Steam 登录 API 返回错误:', response.data)
        throw new Error(response.data.message || 'Steam 登录失败')
      }
    } catch (err: any) {
      console.error('Steam 登录异常:', err)
      error.value = err.message || 'Steam 登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await getUserInfo('me')
      
      if (response.data.code === 200) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
    } catch (err: any) {
      error.value = err.message || '获取用户信息失败'
      // 如果获取用户信息失败，可能是 token 过期，清除登录状态
      logout()
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    token.value = null
    user.value = null
    error.value = null
    
    // 使用新的会话管理器清除会话
    await clearSession()
    
    // 兼容旧版本，清除旧的 localStorage 数据
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 从安全会话恢复用户信息
  const restoreFromStorage = async () => {
    try {
      // 使用新的会话管理器
      const { sessionManager } = await import('@/utils/session')
      const session = sessionManager.loadSession()
      
      if (session) {
        token.value = session.token
        user.value = session.user
        console.log('从安全会话恢复用户信息:', session.user.username)
      } else {
        // 清理旧的存储数据
        logout()
      }
    } catch (error) {
      console.error('恢复用户会话失败:', error)
      logout()
    }
  }

  // 清理会话
  const clearSession = async () => {
    try {
      const { sessionManager } = await import('@/utils/session')
      sessionManager.clearSession()
    } catch (error) {
      console.error('清理会话失败:', error)
    }
  }

  return {
    // 状态
    token,
    user,
    isLoading,
    error,
    
    // 计算属性
    isLoggedIn,
    isSteamUser,
    
    // 方法
    initialize,
    login,
    steamLogin,
    fetchUserInfo,
    logout,
    clearError,
    restoreFromStorage,
    clearSession,
  }
})