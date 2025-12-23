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
      component: Layout,
      redirect: "/system/config/feature-control",
      meta: {
        title: "系统配置",
        showLink: true,
        showParent: true
      },
      children: [
        {
          path: "/system/config/feature-control",
          name: "FeatureControl",
          component: () => import("@/views/system/config/featureControl.vue"),
          meta: {
            title: "功能控制",
            showLink: true,
            showParent: true
          }
        },
        {
          path: "/system/config/parameter",
          name: "ParameterConfig",
          component: () => import("@/views/system/config/parameterConfig.vue"),
          meta: {
            title: "参数配置",
            showLink: true,
            showParent: true
          }
        },
        {
          path: "/system/config/game",
          name: "GameConfig",
          component: () => import("@/views/system/config/gameConfig.vue"),
          meta: {
            title: "游戏配置",
            showLink: true,
            showParent: true
          }
        },
        {
          path: "/system/config/site",
          name: "SiteConfig",
          component: () => import("@/views/system/config/siteConfig.vue"),
          meta: {
            title: "站点配置",
            showLink: true,
            showParent: true
          }
        },
        {
          path: "/system/config/email",
          name: "EmailConfig",
          component: () => import("@/views/system/config/emailConfig.vue"),
          meta: {
            title: "邮件配置",
            showLink: true,
            showParent: true
          }
        },
        {
          path: "/system/config/dictionary",
          name: "DictionaryConfig",
          component: () => import("@/views/system/config/dictionaryConfig.vue"),
          meta: {
            title: "字典配置",
            showLink: true,
            showParent: true
          }
        }
      ]
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
