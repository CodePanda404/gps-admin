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
import {
  getPlayerStatisticsDailyList,
  getPlayerStatisticsMonthlyList,
  type PlayerStatisticsDailyItem,
  type PlayerStatisticsMonthlyItem,
  type PlayerStatisticsDailyParams,
  type PlayerStatisticsMonthlyParams
} from "@/api/statistics";
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
  admin_id: "",
  user_id: "",
  currency: "",
  wallet_type: "",
  game_name: ""
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
    label: "商户ID",
    prop: "admin_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "玩家ID",
    prop: "user_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入玩家ID"
    }))
  },
  {
    label: "币种",
    prop: "currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入币种"
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
    label: "游戏名称",
    prop: "game_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入游戏名称"
    }))
  }
];

/*  -----月报表搜索表单相关-----  */
// 月报表搜索表单数据
const monthlySearchData = ref({
  month: [] as string[],
  admin_id: "",
  user_id: "",
  currency: "",
  wallet_type: ""
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
    label: "商户ID",
    prop: "admin_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "玩家ID",
    prop: "user_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入玩家ID"
    }))
  },
  {
    label: "币种",
    prop: "currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入币种"
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
      admin_id: "",
      user_id: "",
      currency: "",
      wallet_type: "",
      game_name: ""
    };
  } else {
    monthlySearchData.value = {
      month: [],
      admin_id: "",
      user_id: "",
      currency: "",
      wallet_type: ""
    };
  }
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用API响应类型）
type DailyTableRow = PlayerStatisticsDailyItem;
type MonthlyTableRow = PlayerStatisticsMonthlyItem;

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
    prop: "date",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户ID",
    prop: "admin_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "玩家ID",
    prop: "user_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "币种",
    prop: "currency",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "下单总额",
    prop: "bet",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "派彩总额",
    prop: "win",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "输赢",
    prop: "company_win",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  }
]);

// 月报表表格配置
const monthlyTableConfig: any = ref([
  {
    label: "月份",
    prop: "month",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户ID",
    prop: "admin_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "玩家ID",
    prop: "user_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "币种",
    prop: "currency",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "下单总额",
    prop: "bet",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "派彩总额",
    prop: "win",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "输赢",
    prop: "company_win",
    tableColumnProps: {
      align: "center"
    },
    width: 100
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
      const { date, admin_id, user_id, currency, wallet_type, game_name } = dailySearchData.value;
      
      const params: PlayerStatisticsDailyParams = {
        pageNumber: page,
        pageSize,
        admin_id: admin_id || undefined,
        user_id: user_id || undefined,
        currency: currency || undefined,
        wallet_type: wallet_type || undefined,
        game_name: game_name || undefined
      };
      
      // 处理日期范围
      if (date && Array.isArray(date) && date.length === 2) {
        params.start_time = date[0];
        params.end_time = date[1];
      }
      
      const res = await getPlayerStatisticsDailyList(params);
      
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
          return sum + parseFloat(String(item.company_win || "0"));
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
        message(res.msg || "获取列表数据失败", { type: "error" });
      }
    } else {
      const { month, admin_id, user_id, currency, wallet_type } = monthlySearchData.value;
      
      const params: PlayerStatisticsMonthlyParams = {
        pageNumber: page,
        pageSize,
        admin_id: admin_id || undefined,
        user_id: user_id || undefined,
        currency: currency || undefined,
        wallet_type: wallet_type || undefined
      };
      
      // 处理月份范围
      if (month && Array.isArray(month) && month.length === 2) {
        // 月报表API可能需要单个month参数，这里先传递第一个月份
        params.month = month[0];
      }
      
      const res = await getPlayerStatisticsMonthlyList(params);
      
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
          return sum + parseFloat(String(item.company_win || "0"));
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
        message(res.msg || "获取列表数据失败", { type: "error" });
      }
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
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
  getList();
});
</script>

<template>
  <div class="player-statistics-container">
    <!-- 标签页容器 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="日报表" name="daily" />
        <el-tab-pane label="月报表" name="monthly" />
      </el-tabs>
    </el-card>

    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
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
              <span class="stat-label">累计下单总额:</span>
              <el-input
                v-model="totalOrderAmount"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
            <div class="stat-item">
              <span class="stat-label">累计派彩总额:</span>
              <el-input
                v-model="totalPayoutAmount"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
            <div class="stat-item">
              <span class="stat-label">累计输赢总额:</span>
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


