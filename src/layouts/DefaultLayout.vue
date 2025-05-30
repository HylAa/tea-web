<template>
  <n-layout position="absolute" class="layout-container">
    <n-layout-header
      bordered
      class="header"
      :style="{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }"
    >
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="logo" />
        <span class="logo-text">【茶】社</span>
        <span class="logo-subtitle">始于2021</span>
      </div>
      <div class="menu-container">
        <n-menu
          mode="horizontal"
          :options="menuOptions"
          :indent="18"
          :value="activeKey"
        />
      </div>
      <div class="user-actions">
        <n-button
          quaternary
          circle
          title="通知公告"
          @click="showAnnouncement = true"
        >
          <template #icon>
            <n-icon><notifications-outline /></n-icon>
          </template>
        </n-button>
        <n-button type="primary" class="login-button" @click="handleLogin">
          <template #icon>
            <n-icon><logo-steam /></n-icon>
          </template>
          登录
        </n-button>
      </div>
    </n-layout-header>
    <n-layout-content class="content">
      <router-view></router-view>
    </n-layout-content>
    <n-layout-footer class="footer">
      <div class="footer-container">
        <!-- 左侧区域：Logo和简介 -->
        <div class="footer-section">
          <div class="footer-logo">
            <img src="/logo.png" alt="Logo" />
            <span>TeaHvH竞技平台</span>
          </div>
          <p class="footer-description">
            我们期待与您携手，在【茶】社这片新天地中，共同谱写出属于我们的温暖篇章。您的每一条建议，都将是我们前行的动力源泉！
          </p>
        </div>

        <!-- 中间区域：快速链接 -->
        <div class="footer-section">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li><a href="/">首页</a></li>
            <li><a href="/servers">服务器列表</a></li>
            <li><a href="/ranking">排行榜</a></li>
            <li><a href="/team">团队</a></li>
          </ul>
        </div>

        <!-- 中间区域：帮助中心 -->
        <div class="footer-section">
          <h3 class="footer-title">友情链接</h3>
          <ul class="footer-links">
            <!-- <li><a href="#">关于我们</a></li>
            <li><a href="#">新手指南</a></li>
            <li><a href="#">新手之家</a></li>
            <li><a href="#">问题小屋</a></li> -->
          </ul>
        </div>

        <!-- 右侧区域：关注我们 -->
        <div class="footer-section">
          <h3 class="footer-title">关注我们</h3>
          <div class="social-icons">
            <a href="https://github.com/ELDment/TEA-api-docs" title="GitHub">
              <n-icon size="24"><logo-github /></n-icon>
            </a>
            <a href="https://qm.qq.com/q/nXvHy96GLm" title="QQ">
              <n-icon size="24">
                <QQIcon />
              </n-icon>
            </a>
            <!-- <a href="#" title="抖音">
              <n-icon size="24"><logo-twitter /></n-icon>
            </a>
            <a href="#" title="B站">
              <n-icon size="24"><logo-youtube /></n-icon>
            </a>
            <a href="#" title="Discord">
              <n-icon size="24"><logo-discord /></n-icon>
            </a> -->
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">【茶】社 © 2025 保留所有权利。</div>
        <!-- <div class="beian">
          <a href="https://beian.miit.gov.cn/" target="_blank"
            >浙ICP备202XXXXX号</a
          >
          <span class="divider">|</span>
          <a href="http://www.beian.gov.cn/" target="_blank"
            >浙公网安备 33XXXXXXXXXX号</a
          >
        </div> -->
      </div>
    </n-layout-footer>
  </n-layout>

  <!-- 通知公告抽屉 -->
  <n-drawer v-model:show="showAnnouncement" :width="360" placement="right">
    <n-drawer-content title="通知公告" closable>
      <div class="announcement-container">
        <!-- {{ announcements.length > 0 }} -->
        <n-spin :show="announcementLoading">
          <div
            v-for="announcement in announcements"
            :key="announcement.timer"
            :time="announcement.timer"
          >
            <!-- {{ announcement.timer }}
            <div v-for="content in announcement.content" :key="content">
              {{ content }}
            </div> -->

            <n-timeline>
              <n-timeline-item
                v-for="content in announcement.content"
                :key="content"
              >
                {{ content }}
              </n-timeline-item>
            </n-timeline>
          </div>

          <!-- <div v-if="announcements.length > 0">
            <n-carousel
              :autoplay="true"
              :interval="
                currentAnnouncement ? currentAnnouncement.timer * 1000 : 5000
              "
              :show-dots="announcements.length > 1"
              :effect="'fade'"
              :draggable="true"
              @update:current-index="handleAnnouncementChange"
            >
              <n-carousel-item
                v-for="(announcement, index) in announcements"
                :key="index"
              >
                <div class="announcement-item">
                  <div
                    v-for="(content, i) in announcement.content"
                    :key="i"
                    class="announcement-content"
                  >
                    {{ content }}
                  </div>
                  <div class="announcement-timer">
                    显示时间: {{ announcement.timer }}秒
                  </div>
                </div>
              </n-carousel-item>
            </n-carousel>
          </div>
          <n-empty v-else description="暂无公告" /> -->
        </n-spin>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { h, ref, onMounted, computed, watchEffect } from "vue";
import {
  NIcon,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NMenu,
  NButton,
  NDrawer,
  NDrawerContent,
  NSpin,
  NEmpty,
  NCarousel,
  NCarouselItem,
  useMessage,
  NTimeline,
  NTimelineItem,
} from "naive-ui";
import { RouterLink, useRoute } from "vue-router";
import {
  HomeOutline,
  PeopleOutline,
  InformationCircleOutline,
  NotificationsOutline,
  LogOutOutline,
  SettingsOutline,
  PersonOutline,
  PodiumOutline,
  ServerOutline,
  BagOutline,
  CartOutline,
  SwapHorizontalOutline,
  BrushOutline,
  LogoSteam,
  LogoGithub,
  LogoTux,
  LogoFacebook,
  LogoTwitter,
  LogoYoutube,
  LogoDiscord,
} from "@vicons/ionicons5";
import { announcementApi } from "../api";
import { Announcement } from "../api/announcement";
import QQIcon from "../components/icons/QQIcon.vue";

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const route = useRoute();
const currentPath = ref(route.path);

// 监听路由变化
watchEffect(() => {
  currentPath.value = route.path;
});

// 计算当前激活的菜单项
const activeKey = computed(() => {
  const path = currentPath.value;
  if (path === "/") return "home";
  // 移除开头的斜杠，获取第一级路径
  return path.split("/")[1];
});

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: "/",
        },
        { default: () => "首页" }
      ),
    key: "home",
    icon: renderIcon(HomeOutline),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: "/servers",
        },
        { default: () => "服务器列表" }
      ),
    key: "servers",
    icon: renderIcon(ServerOutline),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: "/ranking",
        },
        { default: () => "排行榜" }
      ),
    key: "ranking",
    icon: renderIcon(PodiumOutline),
  },

  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: "/ads",
  //       },
  //       { default: () => "广告铺子" }
  //     ),
  //   key: "ads",
  //   icon: renderIcon(BagOutline),
  // },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: "/shop",
  //       },
  //       { default: () => "商城" }
  //     ),
  //   key: "shop",
  //   icon: renderIcon(CartOutline),
  // },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: "/market",
  //       },
  //       { default: () => "交易所" }
  //     ),
  //   key: "market",
  //   icon: renderIcon(SwapHorizontalOutline),
  // },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: "/workshop",
  //       },
  //       { default: () => "创意工坊" }
  //     ),
  //   key: "workshop",
  //   icon: renderIcon(BrushOutline),
  // },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: "/history",
  //       },
  //       { default: () => "关于" }
  //     ),
  //   key: "history",
  //   icon: renderIcon(InformationCircleOutline),
  // },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: "/team",
        },
        { default: () => "团队" }
      ),
    key: "team",
    icon: renderIcon(PeopleOutline),
  },
];

const userOptions = [
  {
    label: "个人信息",
    key: "profile",
    icon: renderIcon(PersonOutline),
  },
  {
    label: "设置",
    key: "settings",
    icon: renderIcon(SettingsOutline),
  },
  {
    type: "divider",
    key: "divider",
  },
  {
    label: "退出登录",
    key: "logout",
    icon: renderIcon(LogOutOutline),
  },
];

const handleLogin = () => {
  // 这里添加Steam登录逻辑
  console.log("Steam login clicked");
};

// 通知公告相关
const message = useMessage();
const showAnnouncement = ref(false);
const announcementLoading = ref(false);
const announcements = ref<Announcement[]>([]);
const currentAnnouncement = ref<Announcement | null>(null);

// 获取公告
const fetchAnnouncements = async () => {
  try {
    const response = await announcementApi.getAnnouncements();
    if (response.code === 200) {
      announcements.value = response.data;
    }
  } catch (error) {
    console.error("获取公告失败:", error);
  }
};

// 处理公告轮播切换
const handleAnnouncementChange = (index: number) => {
  currentAnnouncement.value = announcements.value[index];
};

// 组件挂载时获取公告
onMounted(() => {
  fetchAnnouncements();
});
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: visible;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.content {
  padding-top: 64px; /* 为固定的header腾出空间 */

  flex: 1; /* 占用所有可用空间 */
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 24px;
  flex-shrink: 0;
}

.menu-container {
  flex: 1;
  overflow-x: auto;
  white-space: nowrap;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* 添加菜单激活样式 */
:deep(.n-menu-item) {
  position: relative;
}

:deep(.n-menu-item--selected),
:deep(.n-menu-item.n-menu-item--selected::before) {
  border-bottom: none !important;
}

:deep(.n-menu-item.n-menu-item--selected::after),
:deep(.n-menu-item[data-active="true"]::after) {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background-color: var(--n-item-text-color-active, #4080ff);
  border-radius: 1px;
  transition: all 0.3s ease;
}

:deep(.n-menu-item:not(.n-menu-item--selected):hover::after) {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background-color: var(--n-item-text-color-hover, #4080ff);
  border-radius: 1px;
  opacity: 0.6;
}

.menu-container::-webkit-scrollbar {
  display: none;
}

.logo {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.logo-subtitle {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 24px;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 16px;
  height: 32px;
  border-radius: 16px;
}

.footer {
  padding: 0;
  color: #fff;
  background-color: #18181c;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  box-shadow: none;
  width: 100%;
  z-index: 2;
  margin-top: auto; /* 确保footer显示在底部 */
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  padding: 48px 64px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.footer-logo img {
  width: 32px;
  height: 32px;
}

.footer-logo span {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.footer-description {
  color: #aaa;
  line-height: 1.6;
  margin: 0;
}

.footer-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  position: relative;
}

.footer-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 32px;
  height: 2px;
  background-color: #4080ff;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #aaa;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #4080ff;
}

.social-icons {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.social-icons a {
  color: #aaa;
  transition: color 0.2s;
}

.social-icons a:hover {
  color: #4080ff;
}

.footer-bottom {
  padding: 16px 64px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}

.copyright {
  color: #888;
  text-align: center;
}

.beian {
  display: flex;
  align-items: center;
  gap: 8px;
}

.beian a {
  color: #888;
  text-decoration: none;
  transition: color 0.2s;
}

.beian a:hover {
  color: #4080ff;
}

.divider {
  color: #555;
}

/* 通知公告样式 */
.announcement-container {
  padding: 16px 0;
}

.announcement-item {
  min-height: 150px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.announcement-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  padding-left: 16px;
  position: relative;
}

.announcement-content::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4080ff;
}

.announcement-timer {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .logo-subtitle {
    display: none;
  }

  .menu-container {
    max-width: 60%;
  }

  .header {
    padding: 0 16px;
  }

  .footer-container {
    padding: 32px 24px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }

  .footer-bottom {
    padding: 16px 24px;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 576px) {
  .logo-text {
    display: none;
  }

  .user-actions {
    margin-left: 12px;
    gap: 8px;
  }

  .menu-container {
    max-width: 70%;
  }

  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>
