<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "GameStatistics"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { ElTabs, ElTabPane } from "element-plus";
import {
  getCurrencyList,
  getGameBrandList,
  getSupplierList,
  type CurrencyItem,
  type GameBrandItem,
  type SupplierItem
} from "@/api/game";
import {
  getGameStatisticsDailyList,
  getGameStatisticsMonthlyList,
  type GameStatisticsDailyItem,
  type GameStatisticsMonthlyItem,
  type GameStatisticsDailyParams,
  type GameStatisticsMonthlyParams
} from "@/api/statistics";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 国际化
const { t } = useI18n();

// 当前激活的标签页
const activeTab = ref("daily");

// 币种选项
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);
// 分类选项（游戏品牌）
const categoryOptions = ref<Array<{ label: string; value: number }>>([]);
// 厂商选项（供应商）
const supplierOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 获取分类列表（游戏品牌）
const fetchCategoryList = async () => {
  try {
    const res = await getGameBrandList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      categoryOptions.value = res.data.rows.map((item: GameBrandItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取分类列表失败:", error);
  }
};

// 获取厂商列表（供应商）
const fetchSupplierList = async () => {
  try {
    const res = await getSupplierList({ pageSize: 1000, status: "1" });
    if (res.code === 0 && res.data && res.data.rows) {
      supplierOptions.value = res.data.rows.map((item: SupplierItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取厂商列表失败:", error);
  }
};

// 钱包类型选项
const walletTypeOptions = computed(() => [
  { label: t("statistics.gameStatistics.search.all"), value: "" },
  { label: t("statistics.gameStatistics.search.single"), value: "1" },
  { label: t("statistics.gameStatistics.search.transfer"), value: "2" }
]);

/*  -----日报表搜索表单相关-----  */
// 日报表搜索表单数据
const dailySearchData = ref({
  date: [] as string[],
  game_id: "",
  game_name: "",
  type_name: "",
  provider: "",
  admin_id: "",
  admin_name: "",
  wallet_type: ""
});

// 日报表搜索表单配置
const dailySearchColumns: PlusColumn[] = [
  {
    label: "日期",
    renderLabel: () => t("statistics.gameStatistics.search.date"),
    prop: "date",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
      startPlaceholder: t("statistics.gameStatistics.search.startDate"),
      endPlaceholder: t("statistics.gameStatistics.search.endDate")
    }))
  },
  {
    label: "游戏ID",
    renderLabel: () => t("statistics.gameStatistics.search.game_id"),
    prop: "game_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.game_id")
    }))
  },
  {
    label: "游戏名称",
    renderLabel: () => t("statistics.gameStatistics.search.game_name"),
    prop: "game_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.game_name")
    }))
  },
  {
    label: "分类",
    renderLabel: () => t("statistics.gameStatistics.search.type_name"),
    prop: "type_name",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select"),
      filterable: true
    })),
    options: computed(() => [
      {
        label: t("statistics.gameStatistics.search.all"),
        value: ""
      },
      ...categoryOptions.value.map(item => ({
        label: item.label,
        value: item.label
      }))
    ])
  },
  {
    label: "厂商",
    renderLabel: () => t("statistics.gameStatistics.search.provider"),
    prop: "provider",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.provider")
    }))
  },
  {
    label: "商户ID",
    renderLabel: () => t("statistics.gameStatistics.search.admin_id"),
    prop: "admin_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.admin_id")
    }))
  },
  {
    label: "商户名称",
    renderLabel: () => t("statistics.gameStatistics.search.admin_name"),
    prop: "admin_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.admin_name")
    }))
  },
  {
    label: "钱包类型",
    renderLabel: () => t("statistics.gameStatistics.search.wallet_type"),
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: walletTypeOptions
  }
];

/*  -----月报表搜索表单相关-----  */
// 月报表搜索表单数据
const monthlySearchData = ref({
  month: [] as string[],
  game_id: "",
  game_name: "",
  type_name: "",
  provider: "",
  admin_id: "",
  admin_name: "",
  wallet_type: ""
});

// 月报表搜索表单配置
const monthlySearchColumns: PlusColumn[] = [
  {
    label: "月份",
    renderLabel: () => t("statistics.gameStatistics.search.month"),
    prop: "month",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "monthrange",
      format: "YYYY-MM",
      valueFormat: "YYYY-MM",
      startPlaceholder: t("statistics.gameStatistics.search.startMonth"),
      endPlaceholder: t("statistics.gameStatistics.search.endMonth")
    }))
  },
  {
    label: "游戏ID",
    renderLabel: () => t("statistics.gameStatistics.search.game_id"),
    prop: "game_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.game_id")
    }))
  },
  {
    label: "游戏名称",
    renderLabel: () => t("statistics.gameStatistics.search.game_name"),
    prop: "game_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.game_name")
    }))
  },
  {
    label: "分类",
    renderLabel: () => t("statistics.gameStatistics.search.type_name"),
    prop: "type_name",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select"),
      filterable: true
    })),
    options: computed(() => [
      {
        label: t("statistics.gameStatistics.search.all"),
        value: ""
      },
      ...categoryOptions.value.map(item => ({
        label: item.label,
        value: item.label
      }))
    ])
  },
  {
    label: "厂商",
    renderLabel: () => t("statistics.gameStatistics.search.provider"),
    prop: "provider",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.provider")
    }))
  },
  {
    label: "商户ID",
    renderLabel: () => t("statistics.gameStatistics.search.admin_id"),
    prop: "admin_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.admin_id")
    }))
  },
  {
    label: "商户名称",
    renderLabel: () => t("statistics.gameStatistics.search.admin_name"),
    prop: "admin_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("statistics.gameStatistics.search.admin_name")
    }))
  },
  {
    label: "钱包类型",
    renderLabel: () => t("statistics.gameStatistics.search.wallet_type"),
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: walletTypeOptions
  }
];

// 搜索表单显示控制
const showSearch = ref(true);

// 点击搜索按钮
const handleSearch = (values: any) => {
  pageInfo.value.page = 1;
  getList();
};

// 重置搜索表单
const handleRest = () => {
  if (activeTab.value === "daily") {
    dailySearchData.value = {
      date: [],
      game_id: "",
      game_name: "",
      type_name: "",
      provider: "",
      admin_id: "",
      admin_name: "",
      wallet_type: ""
    };
  } else {
    monthlySearchData.value = {
      month: [],
      game_id: "",
      game_name: "",
      type_name: "",
      provider: "",
      admin_id: "",
      admin_name: "",
      wallet_type: ""
    };
  }
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用API响应类型）
type DailyTableRow = GameStatisticsDailyItem;
type MonthlyTableRow = GameStatisticsMonthlyItem;

// 多选选中数据
const multipleSelection = ref<(DailyTableRow | MonthlyTableRow)[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<(DailyTableRow | MonthlyTableRow)[]>();

// 统计信息（使用字符串类型以便格式化显示）
const totalOrderAmount = ref<string | number>(0);
const totalPayoutAmount = ref<string | number>(0);
const totalWinLoss = ref<string | number>(0);

// 日报表表格配置
const dailyTableConfig: any = ref([
  {
    label: "日期",
    renderHeader: () => t("statistics.gameStatistics.table.date"),
    prop: "date",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "游戏ID",
    renderHeader: () => t("statistics.gameStatistics.table.game_id"),
    prop: "game_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "游戏名称",
    renderHeader: () => t("statistics.gameStatistics.table.game_name"),
    prop: "game_name",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  },
  {
    label: "币种",
    renderHeader: () => t("statistics.gameStatistics.table.currency"),
    prop: "currency",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "分类",
    renderHeader: () => t("statistics.gameStatistics.table.type_name"),
    prop: "type_name",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "厂商",
    renderHeader: () => t("statistics.gameStatistics.table.provider"),
    prop: "provider",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户ID",
    renderHeader: () => t("statistics.gameStatistics.table.admin_id"),
    prop: "admin_id",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "商户名称",
    renderHeader: () => t("statistics.gameStatistics.table.admin_name"),
    prop: "admin_name",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "钱包类型",
    renderHeader: () => t("statistics.gameStatistics.table.wallet_type"),
    prop: "wallet_type",
    render: (value: number) => {
      return value === 1 ? t("statistics.gameStatistics.search.single") : value === 2 ? t("statistics.gameStatistics.search.transfer") : "-";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "下单总额",
    renderHeader: () => t("statistics.gameStatistics.table.bet"),
    prop: "bet",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "派彩总额",
    renderHeader: () => t("statistics.gameStatistics.table.win"),
    prop: "win",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "输赢",
    renderHeader: () => t("statistics.gameStatistics.table.company_win"),
    prop: "company_win",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "成本价",
    renderHeader: () => t("statistics.gameStatistics.table.cost_price"),
    prop: "cost_price",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "代理点位",
    renderHeader: () => t("statistics.gameStatistics.table.agent_price"),
    prop: "agent_price",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "成本",
    renderHeader: () => t("statistics.gameStatistics.table.cost"),
    prop: "cost",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "代理销售",
    renderHeader: () => t("statistics.gameStatistics.table.agent_sale"),
    prop: "agent_sale",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "平台销售",
    renderHeader: () => t("statistics.gameStatistics.table.sale"),
    prop: "sale",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "代理利润",
    renderHeader: () => t("statistics.gameStatistics.table.agent_profit"),
    prop: "agent_profit",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "平台利润",
    renderHeader: () => t("statistics.gameStatistics.table.profit"),
    prop: "profit",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  }
]);

// 月报表表格配置
const monthlyTableConfig: any = ref([
  {
    label: "月份",
    renderHeader: () => t("statistics.gameStatistics.table.month"),
    prop: "month",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "游戏ID",
    renderHeader: () => t("statistics.gameStatistics.table.game_id"),
    prop: "game_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "游戏名称",
    renderHeader: () => t("statistics.gameStatistics.table.game_name"),
    prop: "game_name",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  },
  {
    label: "币种",
    renderHeader: () => t("statistics.gameStatistics.table.currency"),
    prop: "currency",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "分类",
    renderHeader: () => t("statistics.gameStatistics.table.type_name"),
    prop: "type_name",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "厂商",
    renderHeader: () => t("statistics.gameStatistics.table.provider"),
    prop: "provider",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户ID",
    renderHeader: () => t("statistics.gameStatistics.table.admin_id"),
    prop: "admin_id",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "商户名称",
    renderHeader: () => t("statistics.gameStatistics.table.admin_name"),
    prop: "admin_name",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "钱包类型",
    renderHeader: () => t("statistics.gameStatistics.table.wallet_type"),
    prop: "wallet_type",
    render: (value: number) => {
      return value === 1 ? t("statistics.gameStatistics.search.single") : value === 2 ? t("statistics.gameStatistics.search.transfer") : "-";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "下单总额",
    renderHeader: () => t("statistics.gameStatistics.table.bet"),
    prop: "bet",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "派彩总额",
    renderHeader: () => t("statistics.gameStatistics.table.win"),
    prop: "win",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "输赢",
    renderHeader: () => t("statistics.gameStatistics.table.company_win"),
    prop: "company_win",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "成本价",
    renderHeader: () => t("statistics.gameStatistics.table.cost_price"),
    prop: "cost_price",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "代理点位",
    renderHeader: () => t("statistics.gameStatistics.table.agent_price"),
    prop: "agent_price",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "成本",
    renderHeader: () => t("statistics.gameStatistics.table.cost"),
    prop: "cost",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "代理销售",
    renderHeader: () => t("statistics.gameStatistics.table.agent_sale"),
    prop: "agent_sale",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "平台销售",
    renderHeader: () => t("statistics.gameStatistics.table.sale"),
    prop: "sale",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "代理利润",
    renderHeader: () => t("statistics.gameStatistics.table.agent_profit"),
    prop: "agent_profit",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "平台利润",
    renderHeader: () => t("statistics.gameStatistics.table.profit"),
    prop: "profit",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  }
]);

// 当前表格配置（根据标签页切换）
const currentTableConfig = computed(() => {
  return activeTab.value === "daily" ? dailyTableConfig.value : monthlyTableConfig.value;
});

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    
    if (activeTab.value === "daily") {
      const { date, game_id, game_name, type_name, provider, admin_id, admin_name, wallet_type } = dailySearchData.value;
      
      const params: GameStatisticsDailyParams = {
        pageNumber: page,
        pageSize,
        game_id: game_id || undefined,
        game_name: game_name || undefined,
        type_name: type_name || undefined,
        provider: provider || undefined,
        admin_id: admin_id || undefined,
        admin_name: admin_name || undefined,
        wallet_type: wallet_type || undefined
      };
      
      // 处理日期范围
      if (date && Array.isArray(date) && date.length === 2) {
        params.start_time = date[0];
        params.end_time = date[1];
      }
      
      const res = await getGameStatisticsDailyList(params);
      
      if (res.code === 0 && res.data && res.data.rows) {
        tableData.value = res.data.rows as any[];
        total.value = res.data.total;
        
        // 计算统计信息（保留2位小数）
        const betSum = res.data.rows.reduce((sum, item) => {
          return sum + parseFloat(item.bet || "0");
        }, 0);
        const winSum = res.data.rows.reduce((sum, item) => {
          return sum + parseFloat(item.win || "0");
        }, 0);
        const companyWinSum = res.data.rows.reduce((sum, item) => {
          return sum + parseFloat(item.company_win || "0");
        }, 0);
        
        totalOrderAmount.value = betSum.toFixed(2);
        totalPayoutAmount.value = winSum.toFixed(2);
        totalWinLoss.value = companyWinSum.toFixed(2);
      } else {
        tableData.value = [];
        total.value = 0;
        totalOrderAmount.value = 0;
        totalPayoutAmount.value = 0;
        totalWinLoss.value = 0;
        message(res.msg || t("statistics.gameStatistics.message.getListFail"), { type: "error" });
      }
    } else {
      const { month, game_id, game_name, type_name, provider, admin_id, admin_name, wallet_type } = monthlySearchData.value;
      
      const params: GameStatisticsMonthlyParams = {
        pageNumber: page,
        pageSize,
        game_id: game_id || undefined,
        game_name: game_name || undefined,
        type_name: type_name || undefined,
        provider: provider || undefined,
        admin_id: admin_id || undefined,
        admin_name: admin_name || undefined,
        wallet_type: wallet_type || undefined
      };
      
      // 处理月份范围
      if (month && Array.isArray(month) && month.length === 2) {
        // 月报表API可能需要单个month参数，这里先传递第一个月份
        params.month = month[0];
      }
      
      const res = await getGameStatisticsMonthlyList(params);
      
      if (res.code === 0 && res.data && res.data.rows) {
        tableData.value = res.data.rows as any[];
        total.value = res.data.total;
        
        // 计算统计信息（保留2位小数）
        const betSum = res.data.rows.reduce((sum, item) => {
          return sum + parseFloat(item.bet || "0");
        }, 0);
        const winSum = res.data.rows.reduce((sum, item) => {
          return sum + parseFloat(item.win || "0");
        }, 0);
        const companyWinSum = res.data.rows.reduce((sum, item) => {
          return sum + parseFloat(item.company_win || "0");
        }, 0);
        
        totalOrderAmount.value = betSum.toFixed(2);
        totalPayoutAmount.value = winSum.toFixed(2);
        totalWinLoss.value = companyWinSum.toFixed(2);
      } else {
        tableData.value = [];
        total.value = 0;
        totalOrderAmount.value = 0;
        totalPayoutAmount.value = 0;
        totalWinLoss.value = 0;
        message(res.msg || t("statistics.gameStatistics.message.getListFail"), { type: "error" });
      }
    }
  } catch (error: any) {
    console.error(t("statistics.gameStatistics.message.getListFail"), error);
    message(error?.message || t("statistics.gameStatistics.message.getListFail"), { type: "error" });
    tableData.value = [];
    total.value = 0;
    totalOrderAmount.value = 0;
    totalPayoutAmount.value = 0;
    totalWinLoss.value = 0;
  } finally {
    loadingStatus.value = false;
  }
};

// 记录上一次的 pageSize
const previousPageSize = ref(pageInfo.value.pageSize);

// 分页处理
const handlePageChange = () => {
  if (pageInfo.value.pageSize !== previousPageSize.value) {
    pageInfo.value.page = 1;
    previousPageSize.value = pageInfo.value.pageSize;
  }
  getList();
};

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
  pageInfo.value.page = 1;
  multipleSelection.value = [];
  getList();
};

// 监听标签页切换，重置搜索表单
watch(activeTab, () => {
  handleRest();
});

// 初始化加载数据
onMounted(() => {
  fetchCurrencyList();
  fetchCategoryList();
  fetchSupplierList();
  getList();
});
</script>

<template>
  <div class="game-statistics-container">
    <!-- 标签页容器 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="t('statistics.gameStatistics.tabs.daily')" name="daily" />
        <el-tab-pane :label="t('statistics.gameStatistics.tabs.monthly')" name="monthly" />
      </el-tabs>
    </el-card>

    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-if="activeTab === 'daily'"
        v-model="dailySearchData"
        :columns="dailySearchColumns"
        label-width="120"
        label-position="right"
        :has-unfold="false"
        :searchText="t('statistics.gameStatistics.buttons.search')"
        :resetText="t('statistics.gameStatistics.buttons.reset')"
        @search="handleSearch"
        @reset="handleRest"
      />
      <PlusSearch
        v-else
        v-model="monthlySearchData"
        :columns="monthlySearchColumns"
        label-width="120"
        label-position="right"
        :has-unfold="false"
        :searchText="t('statistics.gameStatistics.buttons.search')"
        :resetText="t('statistics.gameStatistics.buttons.reset')"
        @search="handleSearch"
        @reset="handleRest"
      />
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <PlusTable
        v-loading="loadingStatus"
        :columns="currentTableConfig"
        :table-data="tableData"
        :stripe="true"
        :is-selection="true"
        :adaptive="true"
        width="100%"
        height="90%"
        @selection-change="(val: any[]) => multipleSelection = val"
      >
        <!-- 表格标题：统计信息 -->
        <template #title>
          <div class="stats-content" style="margin-left: 5px">
            <div class="stat-item">
              <span class="stat-label">{{ t('statistics.gameStatistics.stats.totalOrderAmount') }}:</span>
              <el-input
                v-model="totalOrderAmount"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('statistics.gameStatistics.stats.totalPayoutAmount') }}:</span>
              <el-input
                v-model="totalPayoutAmount"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('statistics.gameStatistics.stats.totalWinLoss') }}:</span>
              <el-input
                v-model="totalWinLoss"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
          </div>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('statistics.gameStatistics.toolbar.density')" placement="top">
            <el-icon
              :size="18"
              style=" margin-right: 15px;cursor: pointer; outline: none"
              color="#606266"
            >
              <component :is="Monitor" />
            </el-icon>
          </el-tooltip>
        </template>
        <template #column-settings-icon>
          <el-tooltip :content="t('statistics.gameStatistics.toolbar.columnSettings')" placement="top">
            <el-icon
              :size="18"
              style=" margin-right: 5px;cursor: pointer; outline: none"
              color="#606266"
            >
              <component :is="Grid" />
            </el-icon>
          </el-tooltip>
        </template>
        <template #toolbar>
          <!-- 筛选：点击切换搜索表单显示/隐藏 -->
          <el-tooltip
            :content="showSearch ? t('statistics.gameStatistics.toolbar.hideSearch') : t('statistics.gameStatistics.toolbar.showSearch')"
            placement="top"
            :trigger="'hover'"
          >
            <span style="display: inline-block">
              <el-icon
                :size="18"
                style="
                  margin-right: 15px;
                  cursor: pointer;
                  outline: none;
                "
                color="#606266"
                @click="showSearch = !showSearch"
              >
                <component :is="Filter" />
              </el-icon>
            </span>
          </el-tooltip>
          <!-- 导出下拉菜单 -->
          <el-tooltip :content="t('statistics.gameStatistics.toolbar.export')" placement="top" :trigger="'hover'">
            <span style="display: inline-block">
              <el-icon
                :size="18"
                style="
                  display: inline-block;
                  margin-right: 15px;
                  cursor: pointer;
                  outline: none;
                "
                color="#606266"
              >
                <component :is="Upload" />
              </el-icon>
            </span>
          </el-tooltip>
        </template>
      </PlusTable>
      <PlusPagination
        v-model="pageInfo"
        :total="total"
        :small="true"
        :page-sizes="[10, 20, 50, 100]"
        :layout="'total, sizes, prev, pager, next, jumper'"
        @change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<style scoped>
.game-statistics-container {
  width: 100%;
  padding: 0 20px;
}

.tabs-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 0;
}

.search-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 0;
}

.table-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}

.stats-content {
  display: flex;
  gap: 30px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}
</style>


