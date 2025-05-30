import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/ranking",
    name: "Ranking",
    component: () => import("../views/Ranking.vue"),
  },
  {
    path: "/servers",
    name: "Servers",
    component: () => import("../views/Servers.vue"),
  },
  {
    path: "/ads",
    name: "Ads",
    component: () => import("../views/Ads.vue"),
  },
  {
    path: "/shop",
    name: "Shop",
    component: () => import("../views/Shop.vue"),
  },
  {
    path: "/market",
    name: "Market",
    component: () => import("../views/Market.vue"),
  },
  {
    path: "/workshop",
    name: "Workshop",
    component: () => import("../views/Workshop.vue"),
  },
  {
    path: "/team",
    name: "Team",
    component: () => import("../views/Team.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/history",
    name: "History",
    component: () => import("../views/History.vue"),
  },
  {
    path: "/api-demo",
    name: "ApiDemo",
    component: () => import("../components/demo/ApiDemo.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
