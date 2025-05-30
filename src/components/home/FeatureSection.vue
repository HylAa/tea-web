<template>
  <div class="feature-section">
    <div class="feature-content">
      <div class="feature-text">
        <div class="feature-subtitle">在战场上展下你的技巧</div>
        <div class="feature-title">成熟的对抗服务与强大的防作弊系统</div>
        <div class="feature-description">
          我们的对抗服务采用一对一匹配系统，确保每场比赛都公平公正，让你的技术得到充分展示。
          先进的防作弊系统将为您提供最佳的游戏体验。
        </div>
        <!-- <n-button type="primary" class="feature-button">了解更多</n-button> -->
      </div>
      <div class="feature-image">
        <img src="/images/csctt.png" alt="Feature Image" />
      </div>
    </div>
    <div class="feature-highlights">
      <n-grid cols="3" x-gap="24" y-gap="24" responsive="screen">
        <n-grid-item>
          <div class="feature-card">
            <div class="feature-card-icon">
              <n-icon size="36" color="#4caf50">
                <shield-checkmark-outline />
              </n-icon>
            </div>
            <div class="feature-card-title">多种防作弊系统</div>
            <div class="feature-card-description">
              专业的防作弊系统，全方位保障游戏的公平性
            </div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="feature-card">
            <div class="feature-card-icon">
              <n-icon size="36" color="#4caf50">
                <trophy-outline />
              </n-icon>
            </div>
            <div class="feature-card-title">多种技能培训</div>
            <div class="feature-card-description">
              全方位提高你的游戏技巧，提升你的竞技水平
            </div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="feature-card">
            <div class="feature-card-icon">
              <n-icon size="36" color="#4caf50">
                <game-controller-outline />
              </n-icon>
            </div>
            <div class="feature-card-title">专业的游戏环境</div>
            <div class="feature-card-description">
              高品质的游戏体验，畅爽的游戏环境
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NGrid, NGridItem, NIcon, NButton } from "naive-ui";
import {
  ShieldCheckmarkOutline,
  TrophyOutline,
  GameControllerOutline,
} from "@vicons/ionicons5";

defineOptions({
  name: "FeatureSection",
});
</script>

<style scoped>
.feature-section {
  width: 100%;
  height: 100vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url("/images/feature-bg.jpg");
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  color: white;
}

.feature-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  margin-bottom: 60px;
}

.feature-text {
  flex: 1;
  padding-right: 40px;
  animation: slideInLeft 1s ease-out;
}

.feature-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
  color: white;
}

.feature-subtitle {
  font-size: 18px;
  color: #4caf50;
  margin-bottom: 16px;
}

.feature-description {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

.feature-button {
  padding: 0 24px;
  height: 40px;
  font-size: 16px;
  border-radius: 20px;
}

.feature-image {
  flex: 1;
  animation: slideInRight 1s ease-out;
}

.feature-image img {
  width: 100%;
  border-radius: 8px;
  /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); */
}

.feature-highlights {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 1.5s ease-out;
}

.feature-card {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  height: 100%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background-color: rgba(255, 255, 255, 0.15);
}

.feature-card-icon {
  margin-bottom: 16px;
}

.feature-card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
}

.feature-card-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
</style>
