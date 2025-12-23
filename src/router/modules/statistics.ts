import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");
import DataLine from "~icons/ep/data-line";

export default {
  path: "/statistics",
  name: "Statistics",
  component: Layout,
  redirect: "/statistics/player",
  meta: {
    icon: DataLine,
    title: "数据统计",
    rank: 6
  },
  children: [
    {
      path: "/statistics/player",
      name: "PlayerStatistics",
      component: () => import("@/views/statistics/playerStatistics.vue"),
      meta: {
        title: "玩家统计",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/statistics/game",
      name: "GameStatistics",
      component: () => import("@/views/statistics/gameStatistics.vue"),
      meta: {
        title: "游戏统计",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/statistics/product",
      name: "ProductStatistics",
      component: () => import("@/views/statistics/productStatistics.vue"),
      meta: {
        title: "产品统计",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/statistics/merchant-daily",
      name: "MerchantDailyReport",
      component: () => import("@/views/statistics/merchantDailyReport.vue"),
      meta: {
        title: "商户日报表",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;


