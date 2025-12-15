import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import FormkitPeople from "~icons/formkit/people";

export default {
  path: "/player",
  name: "Player",
  component: Layout,
  redirect: "/transfer",
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
        showLink: true,
        showParent: true,
        keepAlive: true
      },
      children: [
        {
          path: "deposit-withdrawal-details",
          name: "DepositWithdrawalDetails",
          component: () =>
            import("@/views/player/depositAndWithdrawalDetails.vue"),
          meta: {
            title: "存取款明细",
            showLink: true,
            showParent: true
          }
        },
        {
          path: "betting-details",
          name: "BettingDetails",
          component: () => import("@/views/player/bettingDetails.vue"),
          meta: {
            title: "投注明细",
            showLink: true,
            showParent: true
          }
        }
      ]
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
