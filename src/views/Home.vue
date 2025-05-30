<template>
  <div class="home">
    <div class="section-nav">
      <!-- <div
        class="nav-dot"
        :class="{ active: activeSection === 0 }"
        @click="scrollToSection(0)"
      ></div>
      <div
        class="nav-dot"
        :class="{ active: activeSection === 1 }"
        @click="scrollToSection(1)"
      ></div>
      <div
        class="nav-dot"
        :class="{ active: activeSection === 2 }"
        @click="scrollToSection(2)"
      ></div>
      <div
        class="nav-dot"
        :class="{ active: activeSection === 3 }"
        @click="scrollToSection(3)"
      ></div>
      <div
        class="nav-dot"
        :class="{ active: activeSection === 4 }"
        @click="scrollToSection(4)"
      ></div> -->
    </div>
    <div
      class="sections-container"
      ref="sectionsContainer"
      @scroll="handleScroll"
    >
      <section class="section" id="section-0">
        <Banner />
      </section>
      <section class="section" id="section-1">
        <HomeServersSection />
      </section>
      <section class="section" id="section-2">
        <AdvantageSection />
      </section>
      <section class="section" id="section-3">
        <HomeRankingSection />
      </section>
      <section class="section" id="section-4">
        <HomeAboutSection />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent } from "vue";

// 使用异步组件加载
const Banner = defineAsyncComponent(
  () => import("../components/home/Banner.vue")
);
const HomeServersSection = defineAsyncComponent(
  () => import("../components/home/HomeServersSection.vue")
);
const HomeRankingSection = defineAsyncComponent(
  () => import("../components/home/HomeRankingSection.vue")
);
const AdvantageSection = defineAsyncComponent(
  () => import("../components/home/AdvantageSection.vue")
);
const HomeAboutSection = defineAsyncComponent(
  () => import("../components/home/HomeAboutSection.vue")
);

defineOptions({
  name: "Home",
});

const sectionsContainer = ref<HTMLElement | null>(null);
const activeSection = ref(0);
// 添加节流变量，防止滚动事件触发过于频繁
const isScrolling = ref(false);

const handleScroll = () => {
  if (!sectionsContainer.value) return;

  const scrollTop = sectionsContainer.value.scrollTop;
  const height = window.innerHeight;

  // 计算当前活跃的部分
  activeSection.value = Math.floor((scrollTop + height / 2) / height);
};

// 处理鼠标滚轮事件
const handleWheel = (event: WheelEvent) => {
  // 如果正在滚动中，则不响应新的滚动事件
  if (isScrolling.value) return;

  if (!sectionsContainer.value) return;

  // 确定滚动方向 (正值为向下，负值为向上)
  const direction = event.deltaY > 0 ? 1 : -1;

  // 当前活跃节的索引
  const currentSection = activeSection.value;

  // 特殊处理：如果已经是最后一个 section，并且向下滚动，不阻止默认行为
  if (currentSection === 4 && direction > 0) {
    // 允许自然滚动到 footer
    return;
  }

  // 阻止默认滚动行为（仅在需要自定义滚动时）
  event.preventDefault();

  // 设置滚动状态
  isScrolling.value = true;

  // 确定目标节
  const targetSection = Math.max(0, Math.min(4, currentSection + direction));

  // 如果有变化，则滚动到目标节
  if (targetSection !== currentSection) {
    scrollToSection(targetSection);
  }

  // 滚动动画完成后重置滚动状态（考虑动画时间约为500ms）
  setTimeout(() => {
    isScrolling.value = false;
  }, 600); // 稍微减少防抖时间，提高响应性
};

const scrollToSection = (index: number) => {
  if (!sectionsContainer.value) return;

  const targetPosition = index * window.innerHeight;

  // 使用平滑滚动
  sectionsContainer.value.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
};

onMounted(() => {
  // 延迟一下再添加滚轮事件监听，确保页面完全加载
  setTimeout(() => {
    // 初始化时处理一次滚动事件
    handleScroll();

    // 添加窗口大小变化的监听器
    window.addEventListener("resize", handleScroll);

    // 添加鼠标滚轮事件监听
    document.addEventListener("wheel", handleWheel, { passive: false });

    console.log("滚轮事件监听器已添加");
  }, 500);
});

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener("resize", handleScroll);
  document.removeEventListener("wheel", handleWheel);
});
</script>

<style scoped>
.home {
  width: 100%;
  min-height: 100vh; /* 使用 min-height 而不是 height，允许内容扩展 */
  position: relative;
  display: flex;
  flex-direction: column;
}

.sections-container {
  width: 100%;
  flex: 1; /* 使用 flex 替代固定高度 */
  overflow-y: auto;
  scroll-snap-type: y proximity; /* 改为 proximity，让滚动更自然 */
  scrollbar-width: none; /* Firefox */
}

.sections-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.section {
  width: 100%;
  height: 100vh;
  scroll-snap-align: start;
  position: relative;
}

.section-nav {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-dot.active {
  background-color: #4080ff;
  transform: scale(1.2);
}
</style>
