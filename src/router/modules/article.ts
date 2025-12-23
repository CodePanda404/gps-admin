import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");
import Document from "~icons/ep/document";

export default {
  path: "/article",
  name: "Article",
  component: Layout,
  redirect: "/article/help",
  meta: {
    icon: Document,
    title: "文章管理",
    rank: 5
  },
  children: [
    {
      path: "/article/help",
      name: "Help",
      component: () => import("@/views/article/help.vue"),
      meta: {
        title: "帮助管理",
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;


