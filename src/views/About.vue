<template>
  <div class="about-page">
    <div class="page-header">
      <h1>关于</h1>
      <div class="header-line"></div>
      <p>了解TeaHvH社区的历史与发展</p>
    </div>

    <div class="about-content">
      <div class="about-card">
        <div class="card-icon">
          <n-icon size="48" color="#4080ff">
            <flame-outline />
          </n-icon>
        </div>
        <h2 class="card-title">TeaHvH社区的故事</h2>
        <div class="card-line"></div>
        <div class="card-content">
          <p>
            TeaHvH社区前身是GTA联机组织（GTAIP），2018年正式入驻CSGO，现为CS2国服（完美世界）推荐的社区服务器，在这里你可以免费体验原版皮肤、手套、人物等饰品，更有不一样的地图、武器MOD、人物MOD，你从未玩过的船新版本等你体验。
          </p>
          <div class="action-buttons">
            <n-button class="action-button" type="primary">
              社区发展历程
            </n-button>
            <n-button class="action-button"> CS2国服官网 </n-button>
          </div>
        </div>
      </div>
    </div>

    <div class="team-section">
      <div class="section-header">
        <h2 class="section-title">我们的团队</h2>
        <p class="section-subtitle">认识一下为TeaHvH服务的核心成员</p>
      </div>

      <div class="team-grid">
        <div v-for="member in teamMembers" :key="member.id" class="team-card">
          <div class="member-avatar">
            <img :src="member.avatar" :alt="member.name" />
          </div>
          <h3 class="member-name">{{ member.name }}</h3>
          <p class="member-role">{{ member.role }}</p>
          <p class="member-description">{{ member.description }}</p>
          <div class="member-social">
            <a
              v-for="social in member.socials"
              :key="social.type"
              :href="social.link"
              target="_blank"
              class="social-link"
            >
              <n-icon :component="getSocialIcon(social.type)" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="join-section">
      <div class="join-content">
        <h2 class="join-title">加入我们的社区</h2>
        <p class="join-description">
          成为TeaHvH社区的一员，与志同道合的玩家一起游戏，参与各种精彩的社区活动
        </p>
        <n-button class="join-button" type="primary" size="large">
          立即加入
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon, NButton } from "naive-ui";
import {
  FlameOutline,
  LogoSteam,
  LogoDiscord,
  LogoTwitter,
  LogoGithub,
  LogoYoutube,
} from "@vicons/ionicons5";

defineOptions({
  name: "AboutPage",
});

// 团队成员数据
const teamMembers = [
  {
    id: 1,
    name: "管理员A",
    role: "创始人 & 首席开发者",
    avatar: "https://i.pravatar.cc/300?img=1",
    description:
      "热爱CS2，专注于服务器开发和社区建设。有多年FPS游戏经验和服务器管理经验。",
    socials: [
      { type: "steam", link: "#" },
      { type: "discord", link: "#" },
      { type: "twitter", link: "#" },
    ],
  },
  {
    id: 2,
    name: "管理员B",
    role: "社区经理",
    avatar: "https://i.pravatar.cc/300?img=2",
    description:
      "负责社区日常管理和活动组织，确保社区和谐健康发展。有丰富的社区运营经验。",
    socials: [
      { type: "steam", link: "#" },
      { type: "github", link: "#" },
    ],
  },
  {
    id: 3,
    name: "管理员C",
    role: "游戏服务器维护",
    avatar: "https://i.pravatar.cc/300?img=3",
    description:
      "负责服务器的日常维护和更新，确保服务器稳定运行。专业的技术支持人员。",
    socials: [
      { type: "steam", link: "#" },
      { type: "discord", link: "#" },
      { type: "youtube", link: "#" },
    ],
  },
  {
    id: 4,
    name: "管理员D",
    role: "内容创作者",
    avatar: "https://i.pravatar.cc/300?img=4",
    description:
      "负责社区内容创作，包括地图设计、MOD开发等。有多年的创作经验。",
    socials: [
      { type: "steam", link: "#" },
      { type: "youtube", link: "#" },
    ],
  },
];

// 获取社交媒体图标
const getSocialIcon = (type: string) => {
  const icons: Record<string, any> = {
    steam: LogoSteam,
    discord: LogoDiscord,
    twitter: LogoTwitter,
    github: LogoGithub,
    youtube: LogoYoutube,
  };
  return icons[type] || LogoSteam;
};
</script>

<style scoped>
.about-page {
  width: 100%;
  overflow-x: hidden;
}

.page-header {
  text-align: center;
  padding: 60px 20px;
  background-color: #f7f9fc;
}

.page-header h1 {
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

.page-header p {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.about-content {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
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

.team-section {
  background-color: #f7f9fc;
  padding: 80px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.team-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.member-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.member-role {
  font-size: 14px;
  color: #4080ff;
  margin-bottom: 16px;
}

.member-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.member-social {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f3f8;
  color: #666;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: #4080ff;
  color: #fff;
}

.join-section {
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url("/images/bg-img2.png");
  background-size: cover;
  background-position: center;
  padding: 100px 20px;
  text-align: center;
  color: #fff;
}

.join-content {
  max-width: 700px;
  margin: 0 auto;
}

.join-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}

.join-description {
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.join-button {
  padding: 0 40px;
  height: 50px;
  font-size: 18px;
}

@media (max-width: 768px) {
  .card-title,
  .join-title {
    font-size: 26px;
  }

  .section-title {
    font-size: 28px;
  }

  .team-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .about-card {
    padding: 30px;
  }
}

@media (max-width: 576px) {
  .page-header h1,
  .card-title,
  .join-title {
    font-size: 24px;
  }

  .section-title {
    font-size: 24px;
  }

  .section-subtitle,
  .page-header p,
  .join-description {
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