<template>
  <div class="ranking-page">
    <div class="page-header">
      <h1>玩家排行榜</h1>
      <p>查看游戏中表现最出色的玩家</p>
    </div>

    <div class="filter-section">
      <div class="search-box">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索玩家名称..."
          clearable
        >
          <template #prefix>
            <n-icon><search-outline /></n-icon>
          </template>
        </n-input>
      </div>

      <div class="filter-options">
        <n-select
          style="width: 100px"
          v-model:value="limit"
          placeholder="显示数量"
          :options="limitOptions"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
      <p>加载中...</p>
    </div>

    <div v-else-if="filteredPlayers.length === 0" class="empty-state">
      <n-empty description="没有找到符合条件的玩家" />
    </div>

    <div v-else class="ranking-table-container">
      <n-data-table
        :columns="columns"
        :data="filteredPlayers"
        :bordered="false"
        :pagination="false"
        striped
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted, watch } from "vue";
import type { DataTableColumns } from "naive-ui";
import {
  NInput,
  NSelect,
  NSpin,
  NEmpty,
  NIcon,
  NDataTable,
  NButton,
  useMessage,
} from "naive-ui";
import {
  SearchOutline,
  TrophyOutline,
  TimeOutline,
  LogoSteam,
} from "@vicons/ionicons5";
import { levelrankApi } from "../api";
import type { PlayerRank } from "../api/levelrank";

interface ExtendedPlayerRank extends PlayerRank {
  avatarUrl?: string;
}

const message = useMessage();

// 状态
const searchQuery = ref("");
const loading = ref(false);
const players = ref<ExtendedPlayerRank[]>([]);
const limit = ref(10);

// 显示数量选项
const limitOptions = [
  { label: "10条", value: 10 },
  { label: "20条", value: 20 },
  { label: "50条", value: 50 },
  { label: "300条", value: 300 },
];

// 头像相关函数
const getDefaultAvatar = () => {
  return "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg";
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = getDefaultAvatar();
  }
};

const fetchPlayerAvatar = async (player: ExtendedPlayerRank) => {
  const steamId64 = convertSteamIDToSteamID64(player.steam);
  try {
    const response = await fetch(`/steam-api/profiles/${steamId64}/?xml=1`);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const avatarElement = xmlDoc.querySelector("avatarMedium");
    player.avatarUrl = avatarElement?.textContent || getDefaultAvatar();
  } catch (error) {
    console.error("获取Steam头像失败:", error);
    player.avatarUrl = getDefaultAvatar();
  }
};

// 表格列定义
const columns: DataTableColumns<ExtendedPlayerRank> = [
  {
    title: "TOP",
    key: "top",
    width: 120,
    align: "center",
    render(row: ExtendedPlayerRank) {
      if (row.top <= 3) {
        return h(
          "div",
          {
            class: `rank-badge rank-${row.top}`,
          },
          [
            h(NIcon, {
              component: TrophyOutline,
              size: 18,
            }),
            h("span", {}, `${row.top}`),
          ]
        );
      }
      return h("span", { class: "rank-normal" }, `${row.top}`);
    },
  },
  {
    title: "昵称",
    key: "nickname",
    width: 280,
    ellipsis: {
      tooltip: true,
    },
    render(row: ExtendedPlayerRank) {
      return h(
        "div",
        {
          class: "player-name",
          style: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "6px",
            width: "100%",
            overflow: "hidden",
          },
        },
        [
          h("img", {
            src: row.avatarUrl || getDefaultAvatar(),
            alt: row.nickname,
            class: "player-avatar clickable",
            style: {
              width: "36px",
              height: "36px",
              minWidth: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
            },
            onError: handleImageError,
            onClick: () => openSteamProfile(row.steam),
            title: "点击查看Steam主页",
          }),
          h(
            "span",
            {
              class: "nickname",
              style: {
                fontWeight: "500",
                color: "var(--text-color)",
                fontSize: "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: "1",
              },
            },
            row.nickname
          ),
        ]
      );
    },
  },
  {
    title: "段位分",
    key: "rank_value",
    width: 120,
    align: "center",
    sorter: (row1, row2) => row1.rank_value - row2.rank_value,
    defaultSortOrder: "descend",
    render(row: ExtendedPlayerRank) {
      return h(
        "span",
        {
          class: "score-value",
        },
        row.rank_value.toLocaleString()
      );
    },
  },
  {
    title: "爆头率",
    key: "headshot_rate",
    width: 100,
    align: "center",
    sorter: (row1, row2) =>
      parseFloat(row1.headshot_rate) - parseFloat(row2.headshot_rate),
    render(row: ExtendedPlayerRank) {
      const rate = parseFloat(row.headshot_rate);
      const color =
        rate >= 0.5 ? "#f56c6c" : rate >= 0.3 ? "#e6a23c" : "#67c23a";
      return h(
        "span",
        {
          class: "stat-value",
          style: {
            color,
          },
        },
        `${(rate * 100).toFixed(1)}%`
      );
    },
  },
  {
    title: "K/D",
    key: "kd",
    width: 100,
    align: "center",
    sorter: (row1, row2) => parseFloat(row1.kd) - parseFloat(row2.kd),
    render(row: ExtendedPlayerRank) {
      const kd = parseFloat(row.kd);
      const color = kd >= 2 ? "#67c23a" : kd >= 1 ? "#409eff" : "#f56c6c";
      return h(
        "span",
        {
          class: "stat-value",
          style: {
            color,
          },
        },
        row.kd
      );
    },
  },
  {
    title: "MVP率",
    key: "mvp_rate",
    width: 100,
    align: "center",
    sorter: (row1, row2) =>
      parseFloat(row1.mvp_rate) - parseFloat(row2.mvp_rate),
    render(row: ExtendedPlayerRank) {
      const color =
        parseFloat(row.mvp_rate) >= 0.3
          ? "#f8ba00"
          : parseFloat(row.mvp_rate) >= 0.15
          ? "#e6a23c"
          : "#666";
      return h(
        "span",
        {
          class: "stat-value",
          style: {
            color,
          },
        },
        row.mvp_rate
      );
    },
  },
  {
    title: "游戏时长",
    key: "online_hours",
    width: 120,
    align: "center",
    sorter: (row1, row2) =>
      parseFloat(row1.online_hours) - parseFloat(row2.online_hours),
    render(row: ExtendedPlayerRank) {
      return h(
        "div",
        {
          class: "time-value",
        },
        [
          h(NIcon, {
            component: TimeOutline,
            size: 16,
            class: "time-icon",
          }),
          h("span", {}, `${row.online_hours}小时`),
        ]
      );
    },
  },
  {
    title: "最后出现",
    key: "last_online",
    width: 100,
    align: "center",
  },
  {
    title: "主页",
    key: "actions",
    width: 200,
    align: "center",
    render(row: ExtendedPlayerRank) {
      return h("div", { class: "action-buttons" }, [
        h(
          NButton,
          {
            size: "small",
            class: "action-button steam-button",
            onClick: () => {
              window.open(
                `https://steamcommunity.com/profiles/${convertSteamIDToSteamID64(
                  row.steam
                )}`,
                "_blank"
              );
            },
          },
          {
            icon: () =>
              h(NIcon, {
                component: LogoSteam,
              }),
            default: () => "STEAM",
          }
        ),
      ]);
    },
  },
];

// 获取排行榜数据
const fetchRankings = async () => {
  loading.value = true;
  try {
    const response = await levelrankApi.getLevelRankTop(limit.value);
    if (response.data.code === 200) {
      // 立即用默认头像显示列表
      players.value = response.data.data.map((player) => ({
        ...player,
        avatarUrl: getDefaultAvatar(),
      }));

      // 在后台加载 Steam 头像
      setTimeout(() => {
        players.value.forEach(async (player) => {
          try {
            await fetchPlayerAvatar(player);
          } catch (error) {
            console.error(`获取玩家 ${player.nickname} 的头像失败:`, error);
          }
        });
      }, 0);
    } else {
      message.error(response.data.message || "获取排行榜失败");
    }
  } catch (error: any) {
    console.error("获取排行榜失败:", error);
    message.error(error.message || "获取排行榜失败");
  } finally {
    loading.value = false;
  }
};

// 过滤玩家
const filteredPlayers = computed(() => {
  if (!searchQuery.value) return players.value;

  const query = searchQuery.value.toLowerCase();
  return players.value.filter(
    (player) =>
      player.nickname.toLowerCase().includes(query) ||
      player.steam.toLowerCase().includes(query)
  );
});

// 监听显示数量变化
watch(limit, () => {
  fetchRankings();
});

// 打开Steam主页
const openSteamProfile = (steamId: string) => {
  const steamId64 = convertSteamIDToSteamID64(steamId);
  if (steamId64) {
    window.open(`https://steamcommunity.com/profiles/${steamId64}`, '_blank');
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchRankings();
});

// Steam ID 转换函数
function convertSteamIDToSteamID64(steamID: string): string {
  const parts = steamID.split(":");
  if (parts.length !== 3) return "";

  const accountNumber = parseInt(parts[2]);
  const steamID64 =
    76561197960265728n + BigInt(accountNumber) * 2n + BigInt(parts[1]);
  return steamID64.toString();
}
</script>

<style scoped>
.ranking-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #ff9966, #ff5e62);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
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
  backdrop-filter: blur(10px);
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

.ranking-table-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.empty-state,
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* 使用更高优先级的选择器来确保样式生效 */
:deep(.rank-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 20px;
  min-width: 60px;
  height: 32px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

:deep(.rank-1) {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

:deep(.rank-2) {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(176, 176, 176, 0.3);
}

:deep(.rank-3) {
  background: linear-gradient(135deg, #cd7f32, #8b4513);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
}

:deep(.player-name) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

:deep(.player-name:hover) {
  background: transparent;
}

:deep(.player-avatar) {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

:deep(.player-avatar.clickable:hover) {
  transform: scale(1.1);
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.player-name:hover .player-avatar) {
  border-color: #409eff;
  transform: scale(1.05);
}

:deep(.nickname) {
  font-weight: 500;
  color: var(--text-color);
  font-size: 14px;
  transition: color 0.3s ease;
}

:deep(.player-name:hover .nickname) {
  color: var(--text-color);
}

:deep(.score-value) {
  font-weight: 600;
  color: #ff5e62;
  font-size: 15px;
}

:deep(.stat-value) {
  font-weight: 600;
  font-family: "Roboto Mono", monospace;
  font-size: 14px;
}

:deep(.time-value) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #409eff;
  font-size: 14px;
}

:deep(.time-icon) {
  opacity: 0.8;
}

:deep(.action-buttons) {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.action-button) {
  min-width: 90px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

:deep(.steam-button) {
  background: linear-gradient(135deg, #1b2838, #2a475e);
  border: none;
  color: #fff;
}

:deep(.steam-button:hover) {
  background: linear-gradient(135deg, #2a475e, #3d6686);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(42, 71, 94, 0.3);
}

:deep(.rank-normal) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-weight: 500;
  font-size: 14px;
  min-width: 60px;
  height: 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 表格样式覆盖 */
:deep(.n-data-table) {
  background: transparent !important;
}

:deep(.n-data-table-tr) {
  background: transparent !important;
}

:deep(.n-data-table-tr:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #888 !important;
  font-weight: 500 !important;
  padding: 12px 16px !important;
}

:deep(.n-data-table-td) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 12px 16px !important;
}

@media (max-width: 768px) {
  .ranking-page {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
  }

  :deep(.player-avatar) {
    width: 28px;
    height: 28px;
    border-width: 1.5px;
  }

  :deep(.nickname) {
    font-size: 13px;
  }

  :deep(.rank-badge),
  :deep(.rank-normal) {
    min-width: 50px;
    height: 28px;
    font-size: 13px;
    padding: 4px 8px;
  }

  :deep(.stat-value),
  :deep(.time-value) {
    font-size: 13px;
  }

  :deep(.n-data-table-th),
  :deep(.n-data-table-td) {
    padding: 8px 12px !important;
  }
}
</style>