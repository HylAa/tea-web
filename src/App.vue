<script setup lang="ts">
import { onMounted } from "vue";
import {
  NConfigProvider,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
} from "naive-ui";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import { useThemeStore } from "./stores/theme";
const themeStore = useThemeStore();

// 初始化主题
onMounted(() => {
  themeStore.initTheme();
});
</script>

<template>
  <n-config-provider :theme="themeStore.naiveTheme">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <default-layout />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}
</style>