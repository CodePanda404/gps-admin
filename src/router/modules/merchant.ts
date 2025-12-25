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
    title: "商户管理",
    rank: 3
  },
  children: [
    {
      path: "/merchant/merchant-list",
      name: "MerchantList",
      component: () => import("@/views/merchant/merchantList.vue"),
      meta: {
        title: "商户列表",
        showLink: true,
        showParent: true
      },
      children: [
        {
          path: "/merchant/adjustment-record",
          name: "AdjustmentRecord",
          component: () => import("@/views/merchant/adjustmentRecord.vue"),
          meta: {
            title: "调额记录",
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
        title: "商户账号",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/merchant-product",
      name: "MerchantProduct",
      component: () => import("@/views/merchant/merchantProduct.vue"),
      meta: {
        title: "商户产品",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/currency",
      name: "Currency",
      component: () => import("@/views/merchant/currency.vue"),
      meta: {
        title: "币种管理",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/wlg-account",
      name: "WlgAccount",
      component: () => import("@/views/merchant/wlgAccount.vue"),
      meta: {
        title: "WLG账号管理",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/pgf-account",
      name: "PgfAccount",
      component: () => import("@/views/merchant/pgfAccount.vue"),
      meta: {
        title: "PGF账号管理",
        showLink: true,
        showParent: true
      }
    },
    {
      path: "/merchant/operation-log",
      name: "OperationLog",
      component: () => import("@/views/merchant/operationLog.vue"),
      meta: {
        title: "操作日志",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;

