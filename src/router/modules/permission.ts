import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");
import Lock from "~icons/ep/lock";

export default {
  path: "/permission",
  name: "Permission",
  component: Layout,
  redirect: "/permission/account",
  meta: {
    icon: Lock,
    title: $t("menus.permission"),
    rank: 7
  },
  children: [
    {
      path: "/permission/account",
      name: "AccountManagement",
      component: () => import("@/views/permission/accountManagement.vue"),
      meta: {
        title: $t("menus.account"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/role",
      name: "RoleManagement",
      component: () => import("@/views/permission/roleManagement.vue"),
      meta: {
        title: $t("menus.role"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/menu",
      name: "MenuManagement",
      component: () => import("@/views/permission/menuManagement.vue"),
      meta: {
        title: $t("menus.menu"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/game-test-log",
      name: "GameTestLog",
      component: () => import("@/views/permission/gameTestLog.vue"),
      meta: {
        title: $t("menus.gameTestLog"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/operation-log",
      name: "OperationLog",
      component: () => import("@/views/permission/operationLog.vue"),
      meta: {
        title: $t("menus.operationLog"),
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;


