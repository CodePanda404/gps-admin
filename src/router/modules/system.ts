import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import SettingIcon from "~icons/ep/setting";

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/attachment",
  meta: {
    icon: SettingIcon,
    title: $t("menus.system"),
    rank: 10
  },
  children: [
    {
      path: "/system/attachment",
      name: "Attachment",
      component: () => import("@/views/system/attachment/index.vue"),
      meta: {
        title: $t("menus.attachment"),
        showLink: VITE_HIDE_HOME === "true" ? false : true,
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
