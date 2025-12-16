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
        title: "供应商",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/game/game-play-type",
      name: "GamePlayType",
      component: () => import("@/views/game/gamePlayType.vue"),
      meta: {
        title: "玩法类型",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/game/games",
      name: "Games",
      component: () => import("@/views/game/games.vue"),
      meta: {
        title: "游戏列表",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/game/game-brand",
      name: "GameBrand",
      component: () => import("@/views/game/gameBrand.vue"),
      meta: {
        title: "游戏品牌",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;

