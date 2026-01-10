import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import Store from "~icons/ep/takeaway-box";

export default {
  path: "/merchant",
  name: "Merchant",
  component: Layout,
  redirect: "/merchant/merchant-list",
  meta: {
    icon: Store,
    title: $t("menus.merchant"),
    rank: 3
  },
  children: [
    {
      path: "/merchant/merchant-list",
      name: "MerchantList",
      component: () => import("@/views/merchant/merchantList.vue"),
      meta: {
        title: $t("menus.merchantList"),
        showLink: true,
        showParent: true
      },
      children: [
        {
          path: "/merchant/adjustment-record",
          name: "AdjustmentRecord",
          component: () => import("@/views/merchant/adjustmentRecord.vue"),
          meta: {
            title: $t("menus.adjustRecord"),
            keepAlive: true,
            showLink: true,
            showParent: true
          }
        }
      ]
    },
    {
      path: "/merchant/merchant-account",
      name: "MerchantAccount",
      component: () => import("@/views/merchant/merchantAccount.vue"),
      meta: {
        title: $t("menus.merchantAccount"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/merchant-product",
      name: "MerchantProduct",
      component: () => import("@/views/merchant/merchantProduct.vue"),
      meta: {
        title: $t("menus.merchantProduct"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/currency",
      name: "Currency",
      component: () => import("@/views/merchant/currency.vue"),
      meta: {
        title: $t("menus.currencyType"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/wlg-account",
      name: "WlgAccount",
      component: () => import("@/views/merchant/wlgAccount.vue"),
      meta: {
        title: $t("menus.WlgAccount"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/pgf-account",
      name: "PgfAccount",
      component: () => import("@/views/merchant/pgfAccount.vue"),
      meta: {
        title: $t("menus.PgfAccount"),
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/operation-log",
      name: "OperationLog",
      component: () => import("@/views/merchant/operationLog.vue"),
      meta: {
        title: $t("menus.operationLog"),
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;

