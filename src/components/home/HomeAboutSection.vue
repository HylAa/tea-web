<template>
  <div class="about-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">{{ textConfig?.about.title }}</h2>
        <div class="header-line"></div>
        <p class="section-subtitle">{{ textConfig?.about.subtitle }}</p>
      </div>

      <div class="about-content">
        <div class="about-card">
          <!-- <div class="card-icon">
            <n-icon size="48" color="#4080ff">
              <flame-outline />
            </n-icon>
          </div> -->
          <h2 class="card-title">{{ textConfig?.about.card.title }}</h2>
          <div class="card-line"></div>
          <div class="card-content">
            <p>{{ textConfig?.about.card.content }}</p>
            <div class="action-buttons">
              <n-button
                class="action-button"
                type="primary"
                @click="viewHistoryPage"
              >
                {{ textConfig?.about.card.buttons.history }}
              </n-button>
              <!-- <n-button class="action-button" @click="viewCS2OfficialWebsite">
                {{ textConfig?.about.card.buttons.cs2Official }}
              </n-button> -->
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="view-all-container">
        <n-button class="view-all-button" @click="viewAboutPage">
          查看更多
        </n-button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { NIcon, NButton } from "naive-ui";
import { FlameOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import type { TextConfig } from "@/types/config";
import { loadTextConfig } from "@/utils/config";

defineOptions({
  name: "HomeAboutSection",
});

const router = useRouter();
const textConfig = ref<TextConfig | null>(null);

const viewAboutPage = () => {
  router.push("/about");
};

const viewHistoryPage = () => {
  router.push("/history");
};

const viewCS2OfficialWebsite = () => {
  window.open(textConfig.value?.about.card.cs2OfficialUrl, "_blank");
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
.about-section {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f9fc;
  padding: 0 20px;
}

.section-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.header-line {
  width: 60px;
  height: 3px;
  background-color: #4080ff;
  margin: 0 auto 24px;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.about-content {
  margin-bottom: 40px;
}

.about-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.card-icon {
  margin-bottom: 24px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.card-line {
  width: 60px;
  height: 3px;
  background-color: #4080ff;
  margin-bottom: 24px;
}

.card-content {
  font-size: 16px;
  line-height: 1.8;
  color: #555;
}

.card-content p {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.action-button {
  min-width: 160px;
}

.view-all-container {
  text-align: center;
  margin-top: 40px;
}

.view-all-button {
  padding: 8px 32px;
  font-size: 16px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .card-title {
    font-size: 26px;
  }

  .section-title {
    font-size: 28px;
  }

  .about-card {
    padding: 30px;
  }
}

@media (max-width: 576px) {
  .section-title,
  .card-title {
    font-size: 24px;
  }

  .section-subtitle {
    font-size: 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-button {
    width: 100%;
  }
}
</style>
