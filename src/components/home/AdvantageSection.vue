<template>
  <div class="advantage-section">
    <div class="advantage-container">
      <div class="advantage-header">
        <div class="advantage-subtitle">
          {{ textConfig?.advantage.subtitle }}
        </div>
        <div class="advantage-title">{{ textConfig?.advantage.title }}</div>
        <div class="advantage-description">
          {{ textConfig?.advantage.description }}
        </div>
      </div>
      <div class="advantage-content">
        <n-grid cols="3" x-gap="24" y-gap="65" responsive="screen">
          <n-grid-item
            v-for="card in textConfig?.advantage.cards"
            :key="card.title"
          >
            <div class="advantage-card">
              <div class="advantage-icon">
                <n-icon size="36" color="#4caf50">
                  <component :is="getIconComponent(card.icon)" />
                </n-icon>
              </div>
              <div class="advantage-card-title">{{ card.title }}</div>
              <div class="advantage-card-description">
                {{ card.description }}
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
      <!-- <div class="advantage-footer">
        <n-button type="primary" size="large" class="join-button">
          立即加入我们
        </n-button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { NGrid, NGridItem, NIcon } from "naive-ui";
import {
  ShieldOutline,
  CodeWorkingOutline,
  ServerOutline,
  PeopleOutline,
  StarOutline,
  TimeOutline,
} from "@vicons/ionicons5";
import type { TextConfig } from "@/types/config";
import { loadTextConfig } from "@/utils/config";

defineOptions({
  name: "AdvantageSection",
});

const textConfig = ref<TextConfig | null>(null);

const iconMap = {
  "shield-outline": ShieldOutline,
  "code-working-outline": CodeWorkingOutline,
  "server-outline": ServerOutline,
  "people-outline": PeopleOutline,
  "star-outline": StarOutline,
  "time-outline": TimeOutline,
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap];
};

onMounted(async () => {
  try {
    textConfig.value = await loadTextConfig();
  } catch (error) {
    console.error("Failed to load text configuration:", error);
  }
});
</script>

<style scoped>
.advantage-section {
  width: 100%;
  height: 100vh;
  background: linear-gradient(15deg, #232f3e 0%,  #1a3a5f 30%, #0c2d4d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  color: white;
  overflow: hidden;
  position: relative;
}

.advantage-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: 1;
}

.advantage-container {
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.advantage-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 1s ease-out;
}

.advantage-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.advantage-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
}

.advantage-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.advantage-content {
  animation: fadeInUp 1s ease-out 0.3s;
  animation-fill-mode: both;
}

.advantage-card {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 10px;
  height: 100%;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.advantage-card:hover {
  transform: translateY(-5px);
  background-color: rgba(255, 255, 255, 0.15);
}

.advantage-icon {
  margin-bottom: 16px;
}

.advantage-card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.advantage-card-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.advantage-footer {
  text-align: center;
  margin-top: 65px;
  animation: fadeIn 1s ease-out 0.6s;
  animation-fill-mode: both;
}

.join-button {
  padding: 0 32px;
  height: 48px;
  font-size: 16px;
  border-radius: 24px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
html.dark .advantage-section {
  background: linear-gradient(73deg, #101010 40%, #252525 60%) !important;
}
</style>