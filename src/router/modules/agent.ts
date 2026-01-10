import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");
import User from "~icons/ri/user-line";

export default {
  path: "/agent",
  name: "Agent",
  component: Layout,
  redirect: "/agent/agent-list",
  meta: {
    icon: User,
    title: $t("menus.agent"),
    rank: 4
  },
  children: [
    {
      path: "/agent/agent-list",
      name: "AgentList",
      component: () => import("@/views/agent/agentList.vue"),
      meta: {
        title: $t("menus.agentList"),
        showLink: true,
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;

