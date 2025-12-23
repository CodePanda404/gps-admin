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
    title: "权限管理",
    rank: 7
  },
  children: [
    {
      path: "/permission/account",
      name: "AccountManagement",
      component: () => import("@/views/permission/accountManagement.vue"),
      meta: {
        title: "账号管理",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/role",
      name: "RoleManagement",
      component: () => import("@/views/permission/roleManagement.vue"),
      meta: {
        title: "角色管理",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/menu",
      name: "MenuManagement",
      component: () => import("@/views/permission/menuManagement.vue"),
      meta: {
        title: "菜单管理",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/game-test-log",
      name: "GameTestLog",
      component: () => import("@/views/permission/gameTestLog.vue"),
      meta: {
        title: "游戏测试日志",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/permission/operation-log",
      name: "OperationLog",
      component: () => import("@/views/permission/operationLog.vue"),
      meta: {
        title: "操作日志",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;


