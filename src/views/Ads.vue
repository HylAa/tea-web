<template>
  <div class="ads-page">
    <h1>广告铺子</h1>
    <p>这里是广告铺子页面，您可以在这里发布和浏览广告。</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "AdsPage",
});
</script>

<style scoped>
.ads-page {
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
