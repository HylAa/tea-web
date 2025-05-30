<template>
  <div class="market-page">
    <h1>交易所</h1>
    <p>这里是交易所页面，您可以与其他玩家交易游戏物品。</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "MarketPage",
});
</script>

<style scoped>
.market-page {
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
