import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import FormkitPeople from '~icons/formkit/people';

export default {
  path: "/player",
  name: "Player",
  component: Layout,
  redirect: "/player",
  meta: {
    icon: FormkitPeople,
    title: $t("menus.player"),
    rank: 0
  },
  children: [
    {
      path: "/transfer",
      name: "Transfer",
      component: () => import("@/views/player/transfer.vue"),
      meta: {
        title: $t("menus.transfer"),
        showLink: VITE_HIDE_HOME === "true" ? false : true,
        showParent: true

      }
    },
    {
      path: "/single",
      name: "Single",
      component: () => import("@/views/player/single.vue"),
      meta: {
        title: $t("menus.single"),
        showLink: VITE_HIDE_HOME === "true" ? false : true,
        showParent: true

      }
    }
  ]
} satisfies RouteConfigsTable;
