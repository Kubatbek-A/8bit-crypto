import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import MarketOverview from "@/views/MarketOverview.vue";
import CryptoDetail from "@/views/CryptoDetail.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "MarketOverview",
    component: MarketOverview,
  },
  {
    path: "/crypto/:primary",
    name: "CryptoDetail",
    component: CryptoDetail,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
