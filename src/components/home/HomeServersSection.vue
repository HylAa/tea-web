<template>
  <div class="servers-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">{{ textConfig?.servers.title }}</h2>
        <p class="section-subtitle">{{ textConfig?.servers.subtitle }}</p>
      </div>

      <div v-if="loading" class="loading-container">
        <n-spin size="large" />
        <p>{{ textConfig?.servers.loading }}</p>
      </div>

      <div v-else class="servers-grid">
        <div
          v-for="server in servers"
          :key="server.port"
          class="server-card-wrapper"
        >
          <server-card :server="server" />
        </div>
      </div>

      <div class="view-all-container">
        <n-button class="view-all-button" @click="viewAllServers">
          {{ textConfig?.servers.viewAllButton }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue";
import { NButton, NSpin, useMessage } from "naive-ui";
import { useRouter } from "vue-router";
import { serverApi } from "../../api";
import { ServerInfo } from "../../api/server";
import type { TextConfig } from "@/types/config";
import { loadTextConfig } from "@/utils/config";

const ServerCard = defineAsyncComponent(
  () => import("../servers/ServerCard.vue")
);

const router = useRouter();
const message = useMessage();

const loading = ref(false);
const servers = ref<ServerInfo[]>([]);
const textConfig = ref<TextConfig | null>(null);

// 获取服务器列表
const fetchServers = async () => {
  loading.value = true;
  try {
    // 先使用模拟数据
    servers.value = [
      {
        port: 27025,
        name: "【茶】🔩 干拉魔怔 #1",
        location: "上海BGP",
        map: "de_dust2",
        players: 10,
        bots: 0,
        maxplayers: 24,
        ping: 3,
        features: ["Double Tap", "No Spread", "Rapid Fire"],
        online: [],
      },
      {
        port: 27030,
        name: "【茶】🏹 鸟狙魔怔 #1",
        location: "北京BGP",
        map: "de_mirage",
        players: 12,
        bots: 0,
        maxplayers: 24,
        ping: 3,
        features: ["Double Tap", "Rapid Fire"],
        online: [],
      },
      {
        port: 27040,
        name: "【茶】🚀 鸟狙爆头 #1 ",
        location: "香港BGP",
        map: "de_inferno",
        players: 18,
        bots: 0,
        maxplayers: 20,
        ping: 3,
        features: ["No Spread", "Competitive"],
        online: [],
      },
    ];

    // 获取每个服务器的详细信息
    const detailPromises = servers.value
      .filter((server) => server.port !== undefined)
      .map((server) =>
        serverApi
          .getServerInfo(server.port!)
          .then((response) => {
            if (response.data.code === 200) {
              const index = servers.value.findIndex(
                (s) => s.port === server.port
              );
              if (index !== -1) {
                servers.value[index] = {
                  ...servers.value[index],
                  ...response.data.data,
                  location: servers.value[index].location,
                  features: servers.value[index].features,
                };
              }
            }
          })
          .catch((error) => {
            console.error(`获取服务器 ${server.port} 详情失败:`, error);
          })
      );

    await Promise.all(detailPromises);
  } catch (error) {
    console.error("获取服务器列表失败:", error);
    message.error(textConfig.value?.servers.fetchError || "获取服务器列表失败");
  } finally {
    loading.value = false;
  }
};

const viewAllServers = () => {
  router.push("/servers");
};

onMounted(async () => {
  try {
    textConfig.value = await loadTextConfig();
  } catch (error) {
    console.error("Failed to load text configuration:", error);
  }
  fetchServers();
});
</script>

<style scoped>
.servers-section {
  background-color: #f5f5f5;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #4080ff;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  margin-top: 16px;
}

.servers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.server-card-wrapper {
  height: 100%;
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.loading-container p {
  color: #666;
}

.view-all-container {
  text-align: center;
  margin-top: 20px;
}

.view-all-button {
  padding: 8px 32px;
  font-size: 16px;
  border-radius: 4px;
}

@media (max-width: 992px) {
  .servers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .section-container {
    padding: 20px;
  }

  .servers-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 28px;
  }

  .section-subtitle {
    font-size: 16px;
  }
}
</style>
