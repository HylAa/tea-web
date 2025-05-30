<template>
  <div class="ranking-section">
    <div class="section-container">
      <div class="ranking-tabs">
        <div class="tab-header">
          <div
            v-for="(tab, index) in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === index }"
            @click="activeTab = index"
          >
            {{ tab.label }}
          </div>
        </div>

        <div class="ranking-content">
          <div v-if="loading" class="loading-state">
            <n-spin size="large" />
            <p>加载中...</p>
          </div>
          <table v-else class="ranking-table">
            <thead>
              <tr>
                <th class="rank-col">排名</th>
                <th class="player-col">玩家</th>
                <th class="value-col">K/D</th>
                <th class="value-col">段位分</th>
                <th class="value-col">爆头率</th>
                <th class="value-col">在线时长</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(player, index) in players" :key="player.steam">
                <td class="rank-cell">
                  <div class="rank-badge" :class="getRankClass(index + 1)">
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="player-cell">
                  <div class="player-info">
                    <img
                      :src="player.avatarUrl || getDefaultAvatar()"
                      :alt="player.nickname"
                      class="player-avatar"
                      @error="handleImageError"
                    />
                    <span class="player-name">{{ player.nickname }}</span>
                  </div>
                </td>
                <td class="value-cell">
                  <span :style="{ color: getKDColor(player.kd) }">{{
                    player.kd
                  }}</span>
                </td>
                <td class="value-cell">
                  <span class="score">{{ player.rank_value }}</span>
                </td>
                <td class="value-cell">
                  <span
                    :style="{ color: getHeadshotColor(player.headshot_rate) }"
                  >
                    {{ (parseFloat(player.headshot_rate) * 100).toFixed(1) }}%
                  </span>
                </td>
                <td class="value-cell">{{ player.online_hours }}小时</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="view-all-container">
        <n-button class="view-all-button" @click="viewAllRankings">
          查看完整TOP榜
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { NButton, NSpin } from "naive-ui";
import { useRouter } from "vue-router";
import { levelrankApi } from "../../api";
import type { PlayerRank } from "../../api/levelrank";

defineOptions({
  name: "HomeRankingSection",
});

const router = useRouter();
const activeTab = ref(0);
const loading = ref(false);

interface ExtendedPlayerRank extends PlayerRank {
  avatarUrl?: string;
}

const players = ref<ExtendedPlayerRank[]>([]);

const tabs = [{ label: "【茶】社TOP榜", key: "gunking" }];

const getRankClass = (rank: number) => {
  if (rank === 1) return "rank-first";
  if (rank === 2) return "rank-second";
  if (rank === 3) return "rank-third";
  return "";
};

const getKDColor = (kd: string) => {
  const kdValue = parseFloat(kd);
  if (kdValue >= 2) return "#67c23a";
  if (kdValue >= 1) return "#409eff";
  return "#f56c6c";
};

const getHeadshotColor = (rate: string) => {
  const rateValue = parseFloat(rate);
  if (rateValue >= 0.5) return "#f56c6c";
  if (rateValue >= 0.3) return "#e6a23c";
  return "#67c23a";
};

const getDefaultAvatar = () => {
  return "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg";
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = getDefaultAvatar();
  }
};

const getPlayerAvatar = (steamId64: string) => {
  // 使用 Steam 的头像 URL 格式
  return `https://avatars.akamai.steamstatic.com/${steamId64}_medium.jpg`;
};

// Steam ID 转换函数
function convertSteamIDToSteamID64(steamID: string): string {
  const parts = steamID.split(":");
  if (parts.length !== 3) return "76561197960265728"; // 默认 Steam ID

  const accountNumber = parseInt(parts[2]);
  const steamID64 =
    76561197960265728n + BigInt(accountNumber) * 2n + BigInt(parts[1]);
  return steamID64.toString();
}

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

const fetchRankings = async () => {
  loading.value = true;
  try {
    const response = await levelrankApi.getLevelRankTop(10);
    if (response.data.code === 200) {
      players.value = response.data.data.map((player) => ({
        ...player,
        avatarUrl: getDefaultAvatar(), // 初始使用默认头像
      }));
      // 获取所有玩家的头像
      await Promise.all(
        players.value.map((player) => fetchPlayerAvatar(player))
      );
    }
  } catch (error) {
    console.error("获取排行榜失败:", error);
  } finally {
    loading.value = false;
  }
};

const viewAllRankings = () => {
  router.push("/ranking");
};

onMounted(() => {
  fetchRankings();
});
</script>

<style scoped>
.ranking-section {
  background-color: #fff;
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
  padding: 0 24px;
}

.ranking-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f7fa;
}

.tab-item {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item.active {
  color: #4080ff;
  border-bottom-color: #4080ff;
  background-color: #fff;
}

.tab-item:hover:not(.active) {
  color: #4080ff;
  background-color: rgba(64, 128, 255, 0.05);
}

.ranking-content {
  padding: 16px;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th {
  padding: 12px 16px;
  text-align: left;
  color: #666;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
}

.ranking-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-table tr:last-child td {
  border-bottom: none;
}

.ranking-table tr:hover {
  background-color: #f5f7fa;
}

.rank-col {
  width: 80px;
}

.player-col {
  width: 240px;
}

.value-col {
  width: auto;
}

.rank-cell {
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  font-weight: 600;
  font-size: 14px;
}

.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffcc00);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #fff;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-third {
  background: linear-gradient(135deg, #cd7f32, #a05a2c);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.player-cell {
  padding: 8px 16px;
}

.player-info {
  display: flex;
  align-items: center;
}

.player-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.player-name {
  font-weight: 500;
}

.score {
  font-weight: 600;
  color: #4080ff;
}

.value-cell {
  color: #444;
}

.view-all-container {
  text-align: center;
  margin-top: 32px;
}

.view-all-button {
  padding: 8px 32px;
  font-size: 16px;
  border-radius: 4px;
}

@media (max-width: 992px) {
  .tab-item {
    padding: 12px 16px;
    font-size: 14px;
  }

  .player-col {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .tab-header {
    flex-wrap: wrap;
  }

  .tab-item {
    flex-grow: 1;
    text-align: center;
  }

  .player-avatar {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }

  .ranking-table th,
  .ranking-table td {
    padding: 8px;
  }

  .value-col:nth-child(5),
  .value-cell:nth-child(5) {
    display: none;
  }
}

@media (max-width: 576px) {
  .value-col:nth-child(4),
  .value-cell:nth-child(4),
  .value-col:nth-child(6),
  .value-cell:nth-child(6) {
    display: none;
  }

  .player-name {
    font-size: 14px;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-state p {
  margin-top: 16px;
}
</style>
