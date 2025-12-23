<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "PlayerStatistics"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import { ElTabs, ElTabPane } from "element-plus";
import {
  getCurrencyList,
  type CurrencyItem
} from "@/api/game";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 当前激活的标签页
const activeTab = ref("daily");

// 币种选项
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);

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

// 钱包类型选项
const walletTypeOptions = [
  { label: "全部", value: "" },
  { label: "单一钱包", value: "1" },
  { label: "转账钱包", value: "2" }
];

/*  -----日报表搜索表单相关-----  */
// 日报表搜索表单数据
const dailySearchData = ref({
  date: [] as string[],
  account_id: "",
  account: "",
  merchant_id: "",
  merchant_number: "",
  wallet_type: "",
  currency_id: ""
});

// 日报表搜索表单配置
const dailySearchColumns: PlusColumn[] = [
  {
    label: "日期",
    prop: "date",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
      startPlaceholder: "开始日期",
      endPlaceholder: "结束日期"
    }))
  },
  {
    label: "账号ID",
    prop: "account_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入账号ID"
    }))
  },
  {
    label: "账号",
    prop: "account",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入账号"
    }))
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "商户号",
    prop: "merchant_number",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户号"
    }))
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择钱包类型"
    })),
    options: walletTypeOptions
  },
  {
    label: "币种",
    prop: "currency_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择币种",
      filterable: true
    })),
    options: computed(() => [
      {
        label: "全部",
        value: ""
      },
      ...currencyOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
  }
];

/*  -----月报表搜索表单相关-----  */
// 月报表搜索表单数据
const monthlySearchData = ref({
  month: [] as string[],
  account_id: "",
  account: "",
  merchant_id: "",
  merchant_number: "",
  currency_id: ""
});

// 月报表搜索表单配置
const monthlySearchColumns: PlusColumn[] = [
  {
    label: "月份",
    prop: "month",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "monthrange",
      format: "YYYY-MM",
      valueFormat: "YYYY-MM",
      startPlaceholder: "开始月份",
      endPlaceholder: "结束月份"
    }))
  },
  {
    label: "账号ID",
    prop: "account_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入账号ID"
    }))
  },
  {
    label: "账号",
    prop: "account",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入账号"
    }))
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "商户号",
    prop: "merchant_number",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户号"
    }))
  },
  {
    label: "币种",
    prop: "currency_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择币种",
      filterable: true
    })),
    options: computed(() => [
      {
        label: "全部",
        value: ""
      },
      ...currencyOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
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
      account_id: "",
      account: "",
      merchant_id: "",
      merchant_number: "",
      wallet_type: "",
      currency_id: ""
    };
  } else {
    monthlySearchData.value = {
      month: [],
      account_id: "",
      account: "",
      merchant_id: "",
      merchant_number: "",
      currency_id: ""
    };
  }
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type DailyTableRow = {
  date: string;
  account_id: number;
  account: string;
  merchant_id: number;
  merchant_number: string;
  wallet_type: string;
  currency_id: string;
  order_total_amount: string;
  payout_total_amount: string;
  win_loss: string;
};

type MonthlyTableRow = {
  month: string;
  account_id: number;
  account: string;
  merchant_id: number;
  merchant_number: string;
  currency_id: string;
  order_total_amount: string;
  payout_total_amount: string;
  win_loss: string;
};

// 多选选中数据
const multipleSelection = ref<(DailyTableRow | MonthlyTableRow)[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<(DailyTableRow | MonthlyTableRow)[]>();

// 日报表表格配置
const dailyTableConfig: any = ref([
  {
    label: "日期",
    prop: "date",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "账号ID",
    prop: "account_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "账号",
    prop: "account",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户号",
    prop: "merchant_number",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    prop: "currency_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "下单总金额",
    prop: "order_total_amount",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "派奖总金额",
    prop: "payout_total_amount",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "输赢",
    prop: "win_loss",
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 月报表表格配置
const monthlyTableConfig: any = ref([
  {
    label: "月份",
    prop: "month",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "账户ID",
    prop: "account_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "账号",
    prop: "account",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户号",
    prop: "merchant_number",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    prop: "currency_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "下单总金额",
    prop: "order_total_amount",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "派彩总额",
    prop: "payout_total_amount",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "输赢",
    prop: "win_loss",
    tableColumnProps: {
      align: "center"
    }
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
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    tableData.value = [];
    total.value = 0;
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
    tableData.value = [];
    total.value = 0;
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
  getList();
});
</script>

<template>
  <div class="player-statistics-container">
    <!-- 标签页容器 -->
    <el-card class="tabs-card" shadow="never" style="margin: 20px">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="日报表" name="daily" />
        <el-tab-pane label="月报表" name="monthly" />
      </el-tabs>
    </el-card>

    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card" shadow="never" style="margin: 20px">
      <PlusSearch
        v-if="activeTab === 'daily'"
        v-model="dailySearchData"
        :columns="dailySearchColumns"
        label-width="80"
        label-position="right"
        :has-unfold="false"
        searchText="搜索"
        resetText="重置"
        @search="handleSearch"
        @reset="handleRest"
      />
      <PlusSearch
        v-else
        v-model="monthlySearchData"
        :columns="monthlySearchColumns"
        label-width="80"
        label-position="right"
        :has-unfold="false"
        searchText="搜索"
        resetText="重置"
        @search="handleSearch"
        @reset="handleRest"
      />
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never" style="margin: 20px">
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
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip content="密度" placement="top">
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
          <el-tooltip content="列设置" placement="top">
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
            :content="showSearch ? '隐藏搜索' : '显示搜索'"
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
          <el-tooltip content="导出" placement="top" :trigger="'hover'">
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
.player-statistics-container {
  width: 100%;
}
</style>


