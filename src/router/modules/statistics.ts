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
    title: $t("menus.statistics"),
    rank: 6
  },
  children: [
    {
      path: "/statistics/player",
      name: "PlayerStatistics",
      component: () => import("@/views/statistics/playerStatistics.vue"),
      meta: {
        title: $t("menus.playerStatistics"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/statistics/game",
      name: "GameStatistics",
      component: () => import("@/views/statistics/gameStatistics.vue"),
      meta: {
        title: $t("menus.gameStatistics"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/statistics/product",
      name: "ProductStatistics",
      component: () => import("@/views/statistics/productStatistics.vue"),
      meta: {
        title: $t("menus.productStatistics"),
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
        showLink: false,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;


