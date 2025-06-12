<template>
  <n-card class="server-card" hoverable :class="getServerTypeClass()">
    <div class="server-header">
      <div class="server-info">
        <h3 class="server-name">{{ server.name }}</h3>
        <!-- <div class="server-location">
          <n-icon><location-outline /></n-icon>
          <span>{{ server.location || "未知" }}</span>
        </div> -->
      </div>
      <div class="server-status" :class="{ online: isServerOnline }">
        {{ isServerOnline ? "在" : "离" }}
      </div>
    </div>

    <div class="server-details">
      <div class="detail-item">
        <n-icon><map-outline /></n-icon>
        <span>{{ server.map }}</span>
      </div>
      <div class="detail-item">
        <n-icon><people-outline /></n-icon>
        <span>{{ server.players }}/{{ server.maxplayers }}</span>
      </div>
      <div class="detail-item" :class="getPingClass(server.ping || 0)">
        <n-icon><time-outline /></n-icon>
        <span>{{ server.ping || "?" }}ms</span>
      </div>
    </div>

    <!-- 在线玩家列表 -->
    <div class="online-players">
      <div class="section-title">
        <n-icon><people-outline /></n-icon>
        <span>在线玩家 ({{ server.online?.length || 0 }})</span>
      </div>
      <n-scrollbar style="max-height: 120px">
        <div class="player-list">
          <div
            v-for="player in server.online || []"
            :key="player.steam"
            class="player-item"
          >
            <img
              :src="player.avatarUrl || getDefaultAvatar()"
              :alt="player.name"
              class="player-avatar clickable"
              @error="handleImageError"
              @click="openSteamProfile(player.steam)"
              title="点击查看Steam主页"
            />
            <span class="player-name">{{ player.name }}</span>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <!-- <div class="server-features">
      <n-tag
        v-for="feature in server.features"
        :key="feature"
        class="feature-tag"
        size="small"
      >
        {{ feature }}
      </n-tag>
    </div> -->

    <div class="server-actions">
      <!-- <n-button class="favorite-btn" quaternary circle size="small">
        <template #icon>
          <n-icon><star-outline /></n-icon>
        </template>
      </n-button> -->
      <n-button type="primary" class="connect-btn" @click="handleConnect">
        <template #icon>
          <n-icon><log-in-outline /></n-icon>
        </template>
        连接服务器
      </n-button>
      <n-button class="copy-btn" secondary circle @click="handleCopy">
        <template #icon>
          <n-icon><copy-outline /></n-icon>
        </template>
      </n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NButton, NIcon, NScrollbar, useMessage } from "naive-ui";
import {
  PeopleOutline,
  TimeOutline,
  CopyOutline,
  MapOutline,
  LogInOutline,
} from "@vicons/ionicons5";
import { computed, watch } from "vue";

// 更新 OnlinePlayer 接口定义
interface OnlinePlayer {
  steam: string;
  name: string;
  avatarUrl?: string; // 添加可选的 avatarUrl 属性
}

// 兼容旧的ServerProps接口
interface ServerProps {
  name: string;
  location?: string;
  map: string;
  players: number;
  maxplayers?: number;
  maxPlayers?: number;
  ping?: number;
  features?: string[];
  online?: OnlinePlayer[];
  port?: number;
  bots?: number;
}

const props = defineProps<{
  server: ServerProps;
}>();

const message = useMessage();

// 计算服务器是否在线（有玩家或明确标记为在线）
const isServerOnline = computed(() => {
  return (
    props.server.players > 0 ||
    (Array.isArray(props.server.online) && props.server.online.length > 0)
  );
});

const handleConnect = () => {
  if (props.server.port) {
    const serverAddress = `steam://connect/teahvh.cc:${props.server.port}`;
    window.location.href = serverAddress;
  }
};

const handleCopy = async () => {
  if (props.server.port) {
    const serverAddress = `connect teahvh.cc:${props.server.port}`;

    // 创建一个临时的文本区域元素
    const textArea = document.createElement("textarea");
    textArea.value = serverAddress;

    // 设置样式使其不可见
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);

    try {
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(serverAddress);
        message.success("服务器连接信息已复制到剪贴板");
      } else {
        // 回退到传统方法
        textArea.select();
        const successful = document.execCommand("copy");
        if (successful) {
          message.success("服务器连接信息已复制到剪贴板");
        } else {
          message.info("请按 Ctrl+C 复制服务器连接信息");
          // 选中文本以便用户手动复制
          textArea.select();
        }
      }
    } catch (err) {
      console.error("复制失败:", err);
      message.info("请按 Ctrl+C 复制服务器连接信息");
      // 选中文本以便用户手动复制
      textArea.select();
    } finally {
      // 清理临时元素
      document.body.removeChild(textArea);
    }
  }
};

const getPingClass = (ping: number) => {
  if (ping < 50) return "ping-good";
  if (ping < 100) return "ping-medium";
  return "ping-bad";
};

const getServerTypeClass = () => {
  const features = props.server.features?.map((f) => f.toLowerCase()) || [];
  if (features.includes("competitive") || features.includes("ranked")) {
    return "competitive-server";
  }
  if (features.includes("casual") || features.includes("fun modes")) {
    return "casual-server";
  }
  if (features.includes("training") || features.includes("practice")) {
    return "training-server";
  }
  if (features.includes("community") || features.includes("custom maps")) {
    return "community-server";
  }
  return "default-server";
};

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

// Steam ID 转换函数
function convertSteamIDToSteamID64(steamID: string): string {
  const parts = steamID.split(":");
  if (parts.length !== 3) return "";

  const accountNumber = parseInt(parts[2]);
  const steamID64 =
    76561197960265728n + BigInt(accountNumber) * 2n + BigInt(parts[1]);
  return steamID64.toString();
}

const fetchPlayerAvatar = async (player: OnlinePlayer) => {
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

// 打开Steam主页
const openSteamProfile = (steamId: string) => {
  const steamId64 = convertSteamIDToSteamID64(steamId);
  if (steamId64) {
    window.open(`https://steamcommunity.com/profiles/${steamId64}`, '_blank');
  }
};

// 在线玩家列表渲染
const initializePlayerAvatars = () => {
  if (props.server.online) {
    props.server.online.forEach((player) => {
      if (!player.avatarUrl) {
        player.avatarUrl = getDefaultAvatar();
        // 在后台加载真实头像
        fetchPlayerAvatar(player);
      }
    });
  }
};

// 监听在线玩家列表变化
watch(
  () => props.server.online,
  (newValue) => {
    if (newValue) {
      initializePlayerAvatars();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.server-card {
  position: relative;
  border-radius: 16px;
  transition: all 0.3s ease;
  height: 460px; /* 固定高度 */
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

/* .server-card :deep(.n-card__content) {
  padding: 20px 24px;
  color: #000;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
} */

/* 浅色模式 - 深色盒子 */
.server-card :deep(.n-card__content) {
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(0, 0, 0, 0.3);
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2); */
  /* backdrop-filter: blur(12px); */
  /* box-shadow: 0 0 50px 10px rgba(255, 0, 0, 1) !important; */
  transition: all 0.3s ease;
}

/* .server-card :deep(.n-card__content)::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 0 50px 10px rgba(255, 0, 0, 1) !important;
} */

/* .server-card :deep(.n-card__content)::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.1), transparent 70%);
  transition: all 0.3s ease;
  z-index: -1;
} */

/* 添加过渡效果 */
.server-details,
.online-players,
.server-actions,
.player-item,
.detail-item {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 数据更新时的过渡效果 */
.server-details > *,
.online-players > *,
.player-item {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0.6;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 玩家列表项的交错动画 */
.player-item {
  animation: fadeInRight 0.3s ease both;
}

.player-item:nth-child(1) {
  animation-delay: 0.05s;
}
.player-item:nth-child(2) {
  animation-delay: 0.1s;
}
.player-item:nth-child(3) {
  animation-delay: 0.15s;
}
.player-item:nth-child(4) {
  animation-delay: 0.2s;
}
.player-item:nth-child(5) {
  animation-delay: 0.25s;
}

@keyframes fadeInRight {
  from {
    opacity: 0.6;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 在线玩家区域的过渡 - 浅色模式深色盒子 */
/* .online-players {
  margin: 16px 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(6px);
  flex: 1;
  min-height: 166px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
} */

.detail-item {
  transition: opacity 0.3s ease;
}

/* 确保深色模式下生效 */
html.dark .server-card :deep(.n-card__content) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05) !important;
}

/* 最高优先级覆盖 */
/* :global(.dark) .server-card :deep(.n-card__content) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05) !important;
} */

html.dark .server-card :deep(.n-card__content)::before {
  background: rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

html.dark .server-card :deep(.n-card__content)::after {
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 70%) !important;
}

html.dark .online-players {
  background: rgba(255, 255, 255, 0.05) !important;
}

html.dark .server-details {
  background: rgba(255, 255, 255, 0.05) !important;
}

html.dark .feature-tag {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

html.dark .server-name {
  color: #ffffff !important;
}

html.dark .server-location {
  color: rgba(255, 255, 255, 0.6) !important;
}

html.dark .detail-item {
  color: rgba(255, 255, 255, 0.75) !important;
}

html.dark .section-title {
  color: rgba(255, 255, 255, 0.75) !important;
}

html.dark .player-name {
  color: rgba(255, 255, 255, 0.75) !important;
}

html.dark .player-item {
  background: rgba(255, 255, 255, 0.05) !important;
}

html.dark .player-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

html.dark .copy-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.75) !important;
}

html.dark .copy-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.server-card:hover {
  transform: translateY(-5px);
}

/* 浅色模式悬停效果 */
.server-card:hover :deep(.n-card__content) {
  background: rgba(0, 0, 0, 0.2) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.3);
}

/* 深色模式悬停效果 */
html.dark .server-card:hover :deep(.n-card__content) {
  background: rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.1), 0 0 30px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
}

.server-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.server-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.server-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background-color: #ff8a80;
  color: white;
  box-shadow: 0 2px 5px rgba(255, 138, 128, 0.3);
}

.server-status.online {
  background-color: #69f0ae;
  box-shadow: 0 2px 5px rgba(105, 240, 174, 0.3);
}

.server-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
}

.ping-good {
  color: #00c853;
}

.ping-medium {
  color: #ffd600;
}

.ping-bad {
  color: #ff3d00;
}

.server-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.feature-tag {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.8);
  font-weight: 500;
  backdrop-filter: blur(6px);
}

.server-actions {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.connect-btn {
  padding: 8px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(45deg, #2196f3, #64b5f6);
  border: none;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  font-weight: 500;
  color: white;
}

.connect-btn:hover {
  background: linear-gradient(45deg, #1e88e5, #42a5f5);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.favorite-btn {
  color: #ffd700;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.1);
}

.online-players {
  margin: 16px 0;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 16px;
  /* backdrop-filter: blur(4px); */
  flex: 1;
  min-height: 156px;
  display: flex;
  flex-direction: column;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 600;
  font-size: 14px;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.player-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 10px;
}

.player-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.player-avatar.clickable {
  cursor: pointer;
}

.player-avatar.clickable:hover {
  border-color: #409eff;
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.player-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(4px);
}

.player-item:hover .player-avatar {
  border-color: #409eff;
  transform: scale(1.05);
}

.player-name {
  color: rgba(0, 0, 0, 0.75);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.copy-btn {
  margin-left: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  color: rgba(0, 0, 0, 0.75);
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .server-card :deep(.n-card__content) {
    padding: 16px;
  }

  .server-name {
    font-size: 18px;
  }

  .server-details {
    padding: 10px;
  }

  .detail-item {
    font-size: 13px;
  }

  .connect-btn {
    padding: 6px 16px;
    font-size: 13px;
  }
}
</style>