<template>
  <div class="banner">
    <div class="banner-content">
      <div class="banner-header">
        <div class="banner-logo">
          <img src="/logo.png" alt="Logo" class="logo" />
        </div>
        <div class="banner-subtitle">{{ textConfig?.banner.title }}</div>
      </div>
      <!-- <div class="banner-subtitle">{{ textConfig?.banner.subtitle }}</div> -->
      <!-- <div class="banner-title">{{ textConfig?.banner.title }}</div> -->
      <div class="banner-description">
        {{ textConfig?.banner.description }}
      </div>
      <n-button
        type="primary"
        size="large"
        class="banner-button"
        @click="handleJoinServer"
      >
        <template #icon>
          <n-icon><log-in-outline /></n-icon>
        </template>
        {{ textConfig?.banner.joinButton }}
      </n-button>
    </div>
    <div class="scroll-indicator" @click="scrollDown">
      <n-icon size="24" color="#ffffff">
        <chevron-down-outline />
      </n-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from "naive-ui";
import { LogInOutline, ChevronDownOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import type { TextConfig } from "@/types/config";
import { loadTextConfig } from "@/utils/config";

defineOptions({
  name: "Banner",
});

const router = useRouter();
const textConfig = ref<TextConfig | null>(null);

onMounted(async () => {
  try {
    textConfig.value = await loadTextConfig();
  } catch (error) {
    console.error("Failed to load text configuration:", error);
  }
});

const handleJoinServer = () => {
  router.push("/servers");
};

const scrollDown = () => {
  const height = window.innerHeight;
  window.scrollTo({
    top: height,
    behavior: "smooth",
  });
};
</script>

<style scoped>
.banner {
  width: 100%;
  height: 100vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url("/images/bg-img2.png");
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  position: relative;
}

.banner-content {
  max-width: 800px;
  padding: 0 20px;
  animation: fadeIn 1.5s ease-out;
}

.banner-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px;
}

.banner-logo {
  margin-bottom: 0;
}

.banner-logo img {
  width: 80px;
  height: 80px;
}

.banner-subtitle {
  font-size: 60px;
  color: #4caf50;
}

.banner-title {
  font-size: 60px;
  font-weight: bold;
  margin-bottom: 24px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.banner-description {
  font-size: 20px;
  margin-bottom: 32px;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.banner-button {
  padding: 0 32px;
  height: 50px;
  font-size: 18px;
  border-radius: 25px;
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 2s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
