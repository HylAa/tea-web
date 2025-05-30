<template>
  <div class="workshop-page">
    <h1>创意工坊</h1>
    <p>这里是创意工坊页面，展示玩家创作的游戏内容和模组。</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "WorkshopPage",
});
</script>

<style scoped>
.workshop-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  color: #666;
}
</style>
