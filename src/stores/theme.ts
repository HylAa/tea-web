import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GlobalTheme } from 'naive-ui'
import { darkTheme } from 'naive-ui'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式状态 (默认深色)
  const themeMode = ref<ThemeMode>('dark')
  
  // 计算当前是否为深色模式
  const isDark = computed(() => {
    return themeMode.value === 'dark'
  })
  
  // Naive UI 主题配置
  const naiveTheme = computed<GlobalTheme | null>(() => {
    return isDark.value ? darkTheme : null
  })
  
  // 初始化主题
  const initTheme = () => {
    // 从本地存储读取主题设置
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      themeMode.value = savedTheme
    }
    
    // 应用主题到HTML根元素
    updateHtmlTheme()
  }
  
  // 更新HTML根元素的主题类
  const updateHtmlTheme = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }
  
  // 切换主题模式
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem('theme-mode', mode)
    updateHtmlTheme()
  }
  
  // 切换深浅色主题
  const toggleTheme = () => {
    if (themeMode.value === 'light') {
      setThemeMode('dark')
    } else {
      setThemeMode('light')
    }
  }
  
  return {
    themeMode,
    isDark,
    naiveTheme,
    initTheme,
    setThemeMode,
    toggleTheme
  }
})