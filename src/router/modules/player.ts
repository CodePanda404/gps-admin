import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import FormkitPeople from '~icons/formkit/people';

export default {
  path: "/player",
  name: "Player",
  component: Layout,
  redirect: "/player/transfer",
  meta: {
    icon: FormkitPeople,
    title: $t("menus.player"),
    rank: 0
  },
  children: [
    {
      path: "/player/transfer",
      name: "Transfer",
      component: () => import("@/views/player/transfer.vue"),
      meta: {
        title: $t("menus.transfer"),
      },
      children: [
        {
          path: "/player/transfer/deposit-withdrawal-details",
          name: "DepositWithdrawalDetails",
          component: () => import("@/views/player/depositAndWithdrawalDetails.vue"),
          meta: {
            title: "存取款明细",
          }
        },
        {
          path: "/player/transfer/betting-details",
          name: "BettingDetails",
          component: () => import("@/views/player/bettingDetails.vue"),
          meta: {
            title: "投注明细",
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
