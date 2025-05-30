<template>
  <div class="history-page">
    <div class="page-background"></div>
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          {{ textConfig?.history?.title || "社区发展历程" }}
        </h1>
        <div class="title-line"></div>
        <p class="page-subtitle">
          {{ textConfig?.history?.subtitle || "陪年历程，感谢有你" }}
        </p>
      </div>

      <div class="year-markers">
        <div
          v-for="year in textConfig?.history?.yearMarkers || []"
          :key="year"
          class="year-marker"
        >
          {{ year }}
        </div>
      </div>

      <div class="timeline" v-if="textConfig?.history?.events">
        <div
          v-for="(event, index) in textConfig.history.events"
          :key="event.date"
          :class="['timeline-item', index % 2 === 0 ? 'right' : 'left']"
        >
          <div class="timeline-date">
            <div class="date-badge">{{ event.date }}</div>
            <div class="date-circle"></div>
          </div>
          <div class="timeline-content">
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
          </div>
        </div>
      </div>
      <div v-else class="loading-state">
        {{ isLoading ? "加载中..." : "暂无数据" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { TextConfig } from "@/types/config";
import { loadTextConfig } from "@/utils/config";

defineOptions({
  name: "History",
});

const textConfig = ref<TextConfig | null>(null);
const isLoading = ref(true);

// 添加动画效果
onMounted(async () => {
  try {
    textConfig.value = await loadTextConfig();
    console.log("Loaded text config:", textConfig.value);
    console.log("Events:", textConfig.value?.history?.events);
  } catch (error) {
    console.error("Failed to load text configuration:", error);
  } finally {
    isLoading.value = false;
  }

  // 添加动画观察器
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  // 延迟一下以确保 DOM 已更新
  setTimeout(() => {
    const items = document.querySelectorAll(".timeline-item");
    items.forEach((item) => {
      observer.observe(item);
      // 设置初始延迟，使动画更自然
      const delay = Array.from(items).indexOf(item) * 0.1;
      (item as HTMLElement).style.transitionDelay = `${delay}s`;
    });
  }, 100);
});
</script>

<style scoped>
.history-page {
  width: 100%;
  min-height: 100vh;
  padding: 80px 20px;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
}

.page-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(240, 242, 245, 0.8) 0%,
    rgba(225, 235, 250, 0.8) 100%
  );
  z-index: -1;
}

.page-background::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%234080ff" fill-opacity="0.03" width="50" height="50" x="0" y="0"/><rect fill="%234080ff" fill-opacity="0.03" width="50" height="50" x="50" y="50"/></svg>');
  opacity: 0.5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.page-header {
  text-align: center;
  margin-bottom: 80px;
  position: relative;
}

.page-title {
  font-size: 42px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 2px;
}

.title-line {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #3a7bd5, #4080ff, #6bb5ff);
  margin: 0 auto 24px;
  border-radius: 2px;
}

.page-subtitle {
  font-size: 20px;
  color: #555;
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
}

/* 年份标记 */
.year-markers {
  position: sticky;
  top: 100px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 10%;
  margin-bottom: 40px;
  z-index: 2;
}

.year-marker {
  font-size: 32px;
  font-weight: bold;
  color: rgba(64, 128, 255, 0.3);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.year-marker:hover {
  color: rgba(64, 128, 255, 0.6);
  transform: translateY(-2px);
}

/* 时间线样式 */
.timeline {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding-top: 20px;
  padding-bottom: 60px;
}

/* 清除浮动 */
.timeline::after {
  content: "";
  display: table;
  clear: both;
}

/* 时间线竖线 */
.timeline::before {
  content: "";
  position: absolute;
  width: 4px;
  background: linear-gradient(to bottom, #3a7bd5, #6bb5ff);
  top: 0;
  bottom: 0;
  left: 50%;
  margin-left: -2px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(64, 128, 255, 0.3);
  z-index: 1;
  height: calc(100% - 60px);
}

.timeline-item {
  padding: 10px 40px;
  position: relative;
  width: 50%;
  box-sizing: border-box;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
  clear: both;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-item.left {
  float: left;
  padding-right: 40px;
}

.timeline-item.right {
  float: right;
  padding-left: 40px;
}

.timeline-date {
  position: absolute;
  width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
}

.date-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #3a7bd5, #4080ff);
  color: white;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(64, 128, 255, 0.3);
  margin-bottom: 10px;
  white-space: nowrap;
  position: relative;
  z-index: 3;
}

.date-circle {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #3a7bd5, #4080ff);
  border-radius: 50%;
  z-index: 3;
  border: 4px solid white;
  box-shadow: 0 0 0 2px #4080ff, 0 0 10px rgba(64, 128, 255, 0.5);
  position: absolute;
}

.left .timeline-date {
  right: -180px;
  top: 0;
}

.right .timeline-date {
  left: -180px;
  top: 0;
}

.left .date-circle {
  right: -22px;
  top: 40%;
  transform: translateY(-50%);
}

.right .date-circle {
  left: -22px;
  top: 40%;
  transform: translateY(-50%);
}

.timeline-content {
  padding: 25px 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(230, 235, 245, 0.8);
}

.timeline-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.timeline-content h3 {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  position: relative;
  padding-bottom: 12px;
}

.timeline-content h3::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #4080ff, #6bb5ff);
  border-radius: 3px;
}

.timeline-content p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

/* 添加箭头 */
.left .timeline-content::before {
  content: "";
  position: absolute;
  border-style: solid;
  border-width: 12px 12px 12px 0;
  border-color: transparent white transparent transparent;
  top: 50%;
  right: -12px;
  transform: translateY(-50%) rotate(180deg);
  filter: drop-shadow(2px 0 2px rgba(0, 0, 0, 0.05));
}

.right .timeline-content::before {
  content: "";
  position: absolute;
  border-style: solid;
  border-width: 12px 12px 12px 0;
  border-color: transparent white transparent transparent;
  top: 50%;
  left: -12px;
  transform: translateY(-50%);
  filter: drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.05));
}

/* 响应式设计 */
@media screen and (max-width: 992px) {
  .year-markers {
    position: relative;
    top: 0;
    padding: 0 5%;
    margin-bottom: 60px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }

  .year-marker {
    font-size: 24px;
  }

  .page-title {
    font-size: 36px;
  }

  .page-subtitle {
    font-size: 18px;
  }
}

@media screen and (max-width: 768px) {
  .year-markers {
    padding: 0;
    margin-bottom: 40px;
  }

  .year-marker {
    font-size: 20px;
  }

  .timeline::before {
    left: 40px;
  }

  .timeline-item {
    width: 100%;
    padding-left: 80px !important;
    padding-right: 20px !important;
    float: none !important;
  }

  .left .timeline-date,
  .right .timeline-date {
    left: 0;
    top: -40px;
    width: auto;
  }

  .left .date-circle,
  .right .date-circle {
    left: 31px;
    top: 50%;
    transform: translateY(-50%);
  }

  .left .timeline-content::before,
  .right .timeline-content::before {
    left: -12px;
    border-width: 12px 12px 12px 0;
    border-color: transparent white transparent transparent;
    transform: translateY(-50%);
  }

  .date-badge {
    margin-left: 60px;
  }

  .page-header {
    margin-bottom: 60px;
  }
}

@media screen and (max-width: 576px) {
  .year-markers {
    gap: 15px;
  }

  .year-marker {
    font-size: 18px;
  }

  .page-title {
    font-size: 30px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .timeline-item {
    padding-left: 60px !important;
  }

  .left .date-circle,
  .right .date-circle {
    left: 21px;
  }

  .date-badge {
    margin-left: 40px;
    font-size: 12px;
    padding: 4px 8px;
  }

  .timeline::before {
    left: 30px;
  }
}

/* 添加加载状态样式 */
.loading-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}
</style>
