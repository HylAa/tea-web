<template>
  <div class="team-page">
    <div class="team-section">
      <div class="team-overlay"></div>
      <div class="team-container">
        <div class="team-header">
          <div class="team-subtitle">我们的运营团队</div>
          <div class="team-title">【茶】社核心成员</div>
          <div class="team-description">
            我们是一支专注于技术实现与用户体验的实干团队。成员各司其职，协同保障服务器稳定运行、平台功能完善及社区生态发展，致力于为您提供极致的游戏体验。
          </div>
        </div>
        <div class="team-members">
          <n-grid cols="4" x-gap="24" y-gap="24" responsive="screen">
            <n-grid-item>
              <div class="team-member">
                <div class="member-avatar">
                  <n-avatar
                    round
                    size="large"
                    src="/images/team/tea.png"
                    fallback-src="/images/team/default-avatar.jpg"
                  />
                </div>
                <div class="member-name">👑 市场运营</div>
                <div class="member-role">【茶】社</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="team-member">
                <div class="member-avatar">
                  <n-avatar
                    round
                    size="large"
                    src="/images/team/null.jpg"
                    fallback-src="/images/team/default-avatar.jpg"
                  />
                </div>
                <div class="member-name">🤝 战略决策</div>
                <div class="member-role">Null</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="team-member">
                <div class="member-avatar">
                  <n-avatar
                    round
                    size="large"
                    src="/images/team/Aliang.jpg"
                    fallback-src="/images/team/default-avatar.jpg"
                  />
                </div>
                <div class="member-name">🌐 前端开发总监</div>
                <div class="member-role">Aliang</div>
              </div>
            </n-grid-item>

            <n-grid-item>
              <div class="team-member">
                <div class="member-avatar">
                  <n-avatar
                    round
                    size="large"
                    src="/images/team/Ambr0se.jpg"
                    fallback-src="/images/team/default-avatar.jpg"
                  />
                </div>
                <div class="member-name">⚙️ 全栈架构首席</div>
                <div class="member-role">Amb0rse</div>
              </div>
            </n-grid-item>
          </n-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NGrid, NGridItem, NAvatar } from "naive-ui";

defineOptions({
  name: "TeamPage",
});
</script>

<style scoped>
.team-page {
  width: 100%;
  min-height: 100vh;
}

.team-section {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.team-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--overlay-bg);
  z-index: 1;
}

.team-container {
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.team-header {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeIn 1s ease-out;
}

.team-subtitle {
  font-size: 18px;
  color: #4caf50;
  margin-bottom: 16px;
}

.team-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
}

.team-description {
  font-size: 16px;
  color: var(--text-color-secondary);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.team-members {
  animation: fadeInUp 1s ease-out;
}

.team-member {
  text-align: center;
  padding: 20px;
  background-color: var(--card-bg);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.team-member:hover {
  transform: translateY(-5px);
  background-color: var(--bg-color-secondary);
  box-shadow: 0 8px 25px var(--shadow-color);
}

.member-avatar {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.member-avatar .n-avatar {
  width: 120px;
  height: 120px;
  font-size: 48px;
  border: 3px solid #4caf50;
}

.member-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-color);
}

.member-role {
  font-size: 14px;
  color: var(--text-color-secondary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>