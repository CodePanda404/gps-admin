import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import SettingIcon from "~icons/ep/setting";

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/config",
  meta: {
    icon: SettingIcon,
    title: $t("menus.system") || "系统设置",
    rank: 10
  },
  children: [
    {
      path: "/system/config",
      name: "SystemConfig",
      component: () => import("@/views/system/config/index.vue"),
      meta: {
        title: "系统配置",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/system/attachment",
      name: "Attachment",
      component: () => import("@/views/system/attachment/index.vue"),
      meta: {
        title: $t("menus.attachment") || "附件管理",
        showLink: VITE_HIDE_HOME === "true" ? false : true,
        keepAlive: true
      }
    },
    {
      path: "/system/personal-center-platform",
      name: "PersonalCenterPlatform",
      component: () => import("@/views/system/personalCenterPlatform.vue"),
      meta: {
        title: "个人中心(平台)",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/system/personal-center-merchant",
      name: "PersonalCenterMerchant",
      component: () => import("@/views/system/personalCenterMerchant.vue"),
      meta: {
        title: "个人中心(商户)",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;
