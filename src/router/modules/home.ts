import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import TdesignHome from '~icons/tdesign/home';

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/home",
  meta: {
    icon: TdesignHome,
    title: $t("menus.home"),
    rank: 0
  },
  children: [
    {
      path: "/home",
      name: "Dashboard",
      component: () => import("@/views/home/index.vue"),
      meta: {
        title: $t("menus.dashboard"),
        showLink: VITE_HIDE_HOME === "true" ? false : true,
        showParent: true

      }
    }
  ]
} satisfies RouteConfigsTable;
