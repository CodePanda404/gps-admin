import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import GamePad from "~icons/ri/gamepad-line";

export default {
  path: "/game",
  name: "Game",
  component: Layout,
  redirect: "/game/supplier",
  meta: {
    icon: GamePad,
    title: $t("menus.game") || "游戏管理",
    rank: 2
  },
  children: [
    {
      path: "/game/supplier",
      name: "Supplier",
      component: () => import("@/views/game/supplier.vue"),
      meta: {
        title: $t("menus.supplier"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/game/game-play-type",
      name: "GamePlayType",
      component: () => import("@/views/game/gamePlayType.vue"),
      meta: {
        title: $t("menus.playType"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/game/game-list",
      name: "GameList",
      component: () => import("@/views/game/gameList.vue"),
      meta: {
        title: $t("menus.gameList"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/game/game-brand",
      name: "GameBrand",
      component: () => import("@/views/game/gameBrand.vue"),
      meta: {
        title: $t("menus.gameBrand"),
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;

