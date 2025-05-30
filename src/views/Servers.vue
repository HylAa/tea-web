<template>
  <div class="servers-page">
    <div class="page-header">
      <h1>服务器列表</h1>
      <p>查找并加入您喜欢的游戏服务器</p>
      <div class="refresh-status">
        <span class="refresh-text">{{ refreshText }}</span>
      </div>
    </div>

    <div class="filter-section">
      <div class="search-box">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索服务器名称..."
          clearable
        >
          <template #prefix>
            <n-icon><search-outline /></n-icon>
          </template>
        </n-input>
      </div>

      <div class="filter-options">
        <!-- <n-select
          v-model:value="regionFilter"
          placeholder="地区"
          :options="regionOptions"
          clearable
        />-->
        <n-select
          v-model:value="mapFilter"
          placeholder="地图"
          :options="mapOptions"
          clearable
        />
        <n-switch v-model:value="onlineOnly">
          <template #checked>只显示在线</template>
          <template #unchecked>显示全部</template>
        </n-switch>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
      <p>加载中...</p>
    </div>

    <div v-else-if="filteredServers.length === 0" class="empty-state">
      <n-empty description="没有找到符合条件的服务器" />
    </div>

    <div v-else class="servers-grid">
      <div
        v-for="server in filteredServers"
        :key="server.port"
        class="server-card-container"
      >
        <server-card :server="server" />
      </div>
    </div>

    <!-- <div class="pagination">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-slot="5"
        :page-sizes="[8, 16, 24, 32]"
        v-model:page-size="pageSize"
        show-size-picker
      />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
} from "vue";
import {
  NInput,
  NSelect,
  NSwitch,
  NSpin,
  NEmpty,
  NPagination,
  NIcon,
  useMessage,
} from "naive-ui";
import { SearchOutline } from "@vicons/ionicons5";
import { serverApi } from "../api";
import { ServerInfo } from "../api/server";

// 使用异步组件加载ServerCard
const ServerCard = defineAsyncComponent(
  () => import("../components/servers/ServerCard.vue")
);

defineOptions({
  name: "ServersPage",
});

const message = useMessage();

// 过滤和搜索状态
const searchQuery = ref("");
const regionFilter = ref<string | null>(null);
const mapFilter = ref<string | null>(null);
const onlineOnly = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(8);
const servers = ref<ServerInfo[]>([]);

// 选项数据
const regionOptions = [
  { label: "上海", value: "上海" },
  { label: "北京", value: "北京" },
  { label: "香港", value: "香港" },
  { label: "美国", value: "美国" },
];

// 地图选项将从API获取的数据中动态生成
const mapOptions = computed(() => {
  const uniqueMaps = new Set<string>();

  servers.value.forEach((server) => {
    if (server.map) {
      uniqueMaps.add(server.map);
    }
  });

  return Array.from(uniqueMaps).map((map) => ({
    label: map,
    value: map,
  }));
});

// 刷新相关状态
const refreshInterval = 30000; // 10秒
const refreshTimer = ref<number | null>(null);
const countdownTimer = ref<number | null>(null);
const lastRefreshTime = ref(Date.now());
const currentTime = ref(Date.now()); // 添加当前时间的响应式变量

// 倒计时文本
const refreshText = computed(() => {
  const remainingSeconds = Math.ceil(
    (refreshInterval - (currentTime.value - lastRefreshTime.value)) / 1000
  );
  return remainingSeconds > 0 ? `${remainingSeconds}s` : "0s";
});

// 开始定时刷新
const startRefreshTimer = () => {
  // 清理现有定时器
  if (refreshTimer.value) {
    window.clearInterval(refreshTimer.value);
  }
  if (countdownTimer.value) {
    window.clearInterval(countdownTimer.value);
  }

  // 设置刷新定时器
  refreshTimer.value = window.setInterval(async () => {
    await fetchServers();
    lastRefreshTime.value = Date.now();
    currentTime.value = Date.now();
  }, refreshInterval);

  // 设置倒计时更新定时器（每秒更新一次）
  countdownTimer.value = window.setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
};

// 获取服务器列表
const fetchServers = async () => {
  try {
    useMockData();

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
                // 使用Vue的响应式更新，避免整个列表刷新
                Object.assign(servers.value[index], {
                  ...response.data.data,
                  location: servers.value[index].location,
                  features: servers.value[index].features,
                });
              }
            }
          })
          .catch((error) => {
            console.error(`获取服务器 ${server.port} 详情失败:`, error);
          })
      );

    await Promise.all(detailPromises);
  } catch (error) {
    console.error("获取服务器详情失败:", error);
  }
};

// 使用模拟数据（API加载失败时的备选方案）
const useMockData = () => {
  servers.value = [
    {
      port: 27025,
      name: "【茶】🔩 干拉魔怔 #1 | 官方群聊：965674939",
      location: "上海BGP",
      map: "de_train_cyberpunk",
      players: 10,
      bots: 0,
      maxplayers: 24,
      ping: 3,
      features: ["Double Tap", "No Spread", "Rapid Fire"],
      online: [],
    },
    {
      port: 27030,
      name: "【茶】🏹 鸟狙魔怔 #1 | 官方群聊：965674939",
      location: "北京BGP",
      map: "de_mirage_winter_2020",
      players: 12,
      bots: 0,
      maxplayers: 24,
      ping: 3,
      features: ["Double Tap", "Rapid Fire"],
      online: [],
    },
    {
      port: 27040,
      name: "【茶】🚀 鸟狙爆头 #1 | 官方群聊：965674939",
      location: "香港BGP",
      map: "de_mirage",
      players: 18,
      bots: 0,
      maxplayers: 20,
      ping: 3,
      features: ["No Spread", "Competitive"],
      online: [],
    },
    {
      port: 27050,
      name: "【茶】⚗️ 纯净 #1 | 官方群聊：965674939",
      location: "上海BGP",
      map: "de_nuke",
      players: 5,
      bots: 0,
      maxplayers: 16,
      ping: 3,
      features: ["Casual", "Respawn"],
      online: [],
    },
  ];
};

// 过滤服务器
const filteredServers = computed(() => {
  let result = [...servers.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((server) =>
      server.name.toLowerCase().includes(query)
    );
  }

  // 地区过滤
  if (regionFilter.value) {
    result = result.filter((server) =>
      server.location?.includes(regionFilter.value || "")
    );
  }

  // 地图过滤
  if (mapFilter.value) {
    result = result.filter((server) => server.map === mapFilter.value);
  }

  // 在线状态过滤（有玩家的服务器）
  if (onlineOnly.value) {
    result = result.filter((server) => server.players > 0);
  }

  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return result.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  const filteredTotal = servers.value.filter((server) => {
    // 应用所有过滤条件，除了分页
    let match = true;

    if (searchQuery.value) {
      match =
        match &&
        server.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    }

    if (regionFilter.value) {
      match =
        match && (server.location?.includes(regionFilter.value || "") || false);
    }

    if (mapFilter.value) {
      match = match && server.map === mapFilter.value;
    }

    if (onlineOnly.value) {
      match = match && server.players > 0;
    }

    return match;
  }).length;

  return Math.ceil(filteredTotal / pageSize.value);
});

// 组件挂载时启动定时器
onMounted(() => {
  fetchServers();
  lastRefreshTime.value = Date.now();
  currentTime.value = Date.now();
  startRefreshTimer();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshTimer.value) {
    window.clearInterval(refreshTimer.value);
  }
  if (countdownTimer.value) {
    window.clearInterval(countdownTimer.value);
  }
});
</script>

<style scoped>
.servers-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #36d1dc, #5b86e5);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.servers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 27px;
  margin-bottom: 32px;
}

.server-card-container {
  height: 100%;
}

.empty-state,
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.refresh-status {
  display: inline-block;
  margin-left: 10px;
  font-size: 26px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.refresh-text {
  color: #2080f0;
  font-family: monospace;
}

@media (max-width: 768px) {
  .servers-page {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
  }

  .servers-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .refresh-status {
    margin: 10px;
  }
}
</style>
