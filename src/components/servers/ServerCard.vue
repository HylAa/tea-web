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
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NButton, NIcon, NTag, NScrollbar } from "naive-ui";
import {
  LocationOutline,
  MapOutline,
  PeopleOutline,
  TimeOutline,
  StarOutline,
  LogInOutline,
} from "@vicons/ionicons5";
import { computed, defineComponent, type PropType } from "vue";
import { OnlinePlayer } from "../../api/server";

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

.server-card :deep(.n-card__content) {
  padding: 20px 24px;
  color: #000;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.server-card :deep(.n-card__content)::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  backdrop-filter: blur(8px);
}

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

/* 在线玩家区域的过渡 */
.online-players {
  margin: 16px 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(4px);
  flex: 1;
  min-height: 166px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 数据更新时的渐变效果 */
.detail-item {
  position: relative;
  overflow: hidden;
}

.detail-item span {
  transition: opacity 0.3s ease;
}

.detail-item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* 默认服务器 - 清新蓝 */
.default-server :deep(.n-card__content) {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.default-server :deep(.n-card__content)::before {
  background: linear-gradient(
    135deg,
    rgba(227, 242, 253, 0.95),
    rgba(187, 222, 251, 0.95)
  );
}

.default-server:hover :deep(.n-card__content) {
  background: linear-gradient(135deg, #bbdefb, #90caf9);
}

/* 竞技服务器 - 玫瑰红 */
.competitive-server :deep(.n-card__content) {
  background: linear-gradient(135deg, #ffeeff, #ffd6d6);
}

.competitive-server :deep(.n-card__content)::before {
  background: linear-gradient(
    135deg,
    rgba(255, 238, 255, 0.95),
    rgba(255, 214, 214, 0.95)
  );
}

.competitive-server:hover :deep(.n-card__content) {
  background: linear-gradient(135deg, #ffd6d6, #ffc1c1);
}

/* 休闲服务器 - 薄荷绿 */
.casual-server :deep(.n-card__content) {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
}

.casual-server :deep(.n-card__content)::before {
  background: linear-gradient(
    135deg,
    rgba(232, 245, 233, 0.95),
    rgba(200, 230, 201, 0.95)
  );
}

.casual-server:hover :deep(.n-card__content) {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

/* 训练服务器 - 温暖橙 */
.training-server :deep(.n-card__content) {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
}

.training-server :deep(.n-card__content)::before {
  background: linear-gradient(
    135deg,
    rgba(255, 243, 224, 0.95),
    rgba(255, 224, 178, 0.95)
  );
}

.training-server:hover :deep(.n-card__content) {
  background: linear-gradient(135deg, #ffe0b2, #ffcc80);
}

/* 社区服务器 - 梦幻紫 */
.community-server :deep(.n-card__content) {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
}

.community-server:hover :deep(.n-card__content) {
  background: linear-gradient(135deg, #e1bee7, #ce93d8);
}

.server-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
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
  background: rgba(255, 255, 255, 0.5);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
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
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
  backdrop-filter: blur(4px);
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
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(4px);
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
}

.player-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(4px);
}

.player-name {
  color: rgba(0, 0, 0, 0.75);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
