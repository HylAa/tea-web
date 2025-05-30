<template>
  <div class="shop-page">
    <h1>商城</h1>
    <p>这里是商城页面，您可以购买各种游戏物品和服务。</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "ShopPage",
});
</script>

<style scoped>
.shop-page {
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
