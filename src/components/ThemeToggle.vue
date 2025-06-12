<template>
  <n-dropdown
    :options="themeOptions"
    @select="handleThemeSelect"
    trigger="click"
    placement="bottom-end"
  >
    <n-button quaternary circle :title="currentThemeTitle">
      <template #icon>
        <n-icon size="18">
          <component :is="currentThemeIcon" />
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { NButton, NIcon, NDropdown } from 'naive-ui'
import {
  SunnyOutline,
  MoonOutline
} from '@vicons/ionicons5'
import { useThemeStore, type ThemeMode } from '../stores/theme'

const themeStore = useThemeStore()

// 主题选项
const themeOptions = [
  {
    label: '浅色模式',
    key: 'light',
    icon: () => h(NIcon, null, { default: () => h(SunnyOutline) })
  },
  {
    label: '深色模式',
    key: 'dark',
    icon: () => h(NIcon, null, { default: () => h(MoonOutline) })
  }
]

// 当前主题图标
const currentThemeIcon = computed(() => {
  switch (themeStore.themeMode) {
    case 'light':
      return SunnyOutline
    case 'dark':
      return MoonOutline
    default:
      return MoonOutline
  }
})

// 当前主题标题
const currentThemeTitle = computed(() => {
  switch (themeStore.themeMode) {
    case 'light':
      return '当前：浅色模式'
    case 'dark':
      return '当前：深色模式'
    default:
      return '主题切换'
  }
})

// 处理主题选择
const handleThemeSelect = (key: string) => {
  themeStore.setThemeMode(key as ThemeMode)
}
</script>

<style scoped>
/* 主题切换按钮样式 */
:deep(.n-button) {
  transition: all 0.3s ease;
}

:deep(.n-button:hover) {
  transform: scale(1.05);
}
</style>