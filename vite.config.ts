import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // 将 /api 前缀的请求代理到目标服务器（后端已允许跨域，暂时注释）
      // "/api": {
      //   target: "https://api.teahvh.cc",
      //   changeOrigin: true,
      //   // rewrite: (path) => path.replace(/^/api/, ''), // 如果API路径不需要 /api 前缀，可以取消注释
      // },
      "/steam-api": {
        target: "http://www.teahvh.cc",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-api/, ""),
      },
    },
  },
});