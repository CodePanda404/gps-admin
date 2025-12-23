import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");
import Wallet from "~icons/ep/wallet";

export default {
  path: "/finance",
  name: "Finance",
  component: Layout,
  redirect: "/finance/merchant-bill-detail",
  meta: {
    icon: Wallet,
    title: "财务管理",
    rank: 4
  },
  children: [
    {
      path: "/finance/merchant-bill-detail",
      name: "MerchantBillDetail",
      component: () => import("@/views/finance/merchantBillDetail.vue"),
      meta: {
        title: "明细",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;


