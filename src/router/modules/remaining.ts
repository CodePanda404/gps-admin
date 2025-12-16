import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: $t("menus.pureLogin"),
      showLink: false
    }
  },
  // 全屏403（无权访问）页面
  {
    path: "/access-denied",
    name: "AccessDenied",
    component: () => import("@/views/error/403.vue"),
    meta: {
      title: $t("menus.pureAccessDenied"),
      showLink: false
    }
  },
  // 全屏500（服务器出错）页面
  {
    path: "/server-error",
    name: "ServerError",
    component: () => import("@/views/error/500.vue"),
    meta: {
      title: $t("menus.pureServerError"),
      showLink: false
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: $t("status.pureLoad"),
      showLink: false
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  // 个人中心相关路由
  {
    path: "/profile",
    component: Layout,
    meta: {
      title: "个人中心",
      showLink: false
    },
    children: [
      {
        path: "/profile/change-password",
        name: "ChangePassword",
        component: () => import("@/views/profile/ChangePassword.vue"),
        meta: {
          title: "修改密码",
          showLink: false
        }
      },
      {
        path: "/profile/set-password",
        name: "SetPassword",
        component: () => import("@/views/profile/SetPassword.vue"),
        meta: {
          title: "设置新密码",
          showLink: false
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
