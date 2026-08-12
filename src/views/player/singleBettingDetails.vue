<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from "vue";
defineOptions({
  name: "SingleBettingDetails"
});
import { useRoute, useRouter } from "vue-router";
import {
  type PlusColumn,
  PlusSearch,
  PlusTable,
  PlusPagination
} from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import {
  getSingleBettingList,
  type SingleBettingListParams,
  type SingleBettingItem
} from "@/api/player";
import {
  getSupplierList,
  getCurrencyList,
  getGameBrandList,
  type GameBrandItem,
  type SupplierItem,
  type CurrencyItem,
} from "@/api/game";
import { ElTag } from "element-plus";
import dayjs from "dayjs";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 路由
const route = useRoute();
const router = useRouter();

// 获取路由参数
const userId = computed(() => (route.query.userId as string) || "");

// 国际化
const { t } = useI18n();

/*  -----搜索表单相关-----  */
// 币种列表（用于下拉选择）
const currencyOptions = ref<Array<{ label: string; value: string }>>([]);
// 供应商列表（用于下拉选择）
const supplierOptions = ref<Array<{ label: string; value: string }>>([]);
//
// 游戏品牌列表（用于所属分类显示）
const brandOptions = ref<Array<{ label: string; value: number }>>([]);


// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.name // currency_code 使用币种名称
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 获取游戏品牌列表（用于所属分类显示）
const fetchBrandList = async () => {
  try {
    const res = await getGameBrandList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      brandOptions.value = res.data.rows.map((item: GameBrandItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取游戏品牌列表失败:", error);
  }
};

// 获取供应商列表
const fetchSupplierList = async () => {
  try {
    const res = await getSupplierList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      supplierOptions.value = res.data.rows.map((item: SupplierItem) => ({
        label: item.name,
        value: item.name // provider 使用供应商名称
      }));
    }
  } catch (error: any) {
    console.error("获取供应商列表失败:", error);
  }
};

// 初始化时获取列表
fetchCurrencyList();
fetchSupplierList();
fetchBrandList()

// 搜索表单数据
const searchData = ref({
  user_id: "",
  user_admin_id: "",
  username: "",
  game_id: "",
  provider: "",
  currency_code: "",
  bet_id: "",
  transaction_id: "",
  status: "",
  createTime: null as string[] | null
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "用户ID",
    renderLabel: () => t("player.betDetail.search.userId"),
    prop: "user_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "商户ID",
    renderLabel: () => t("player.betDetail.search.adminId"),
    prop: "user_admin_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "玩家ID",
    renderLabel: () => t("player.betDetail.search.username"),
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "游戏ID",
    renderLabel: () => t("player.betDetail.search.gameId"),
    prop: "game_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "供应商",
    renderLabel: () => t("player.betDetail.search.supplier"),
    prop: "provider",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select"),
      filterable: true
    })),
    options: computed(() => [
      { label: t("player.betDetail.search.all"), value: "" },
      ...supplierOptions.value.map(item => ({
        label: item.label,
        value: item.value
      }))
    ])
  },
  {
    label: "币种",
    renderLabel: () => t("player.betDetail.search.currency"),
    prop: "currency_code",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select"),
      filterable: true
    })),
    options: computed(() => [
      {
        label: t("player.betDetail.search.all"),
        value: ""
      },
      ...currencyOptions.value.map(item => ({
        label: item.label,
        value: item.value
      }))
    ])
  },
  {
    label: "投注ID",
    renderLabel: () => t("player.betDetail.search.betId"),
    prop: "bet_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "交易ID",
    renderLabel: () => t("player.betDetail.search.transactionId"),
    prop: "transaction_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("player.betDetail.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: [
      {
        label: t("player.betDetail.search.all"),
        renderLabel: () => t("player.betDetail.search.all"),
        value: ""
      },
      {
        label: t("player.betDetail.search.win"),
        renderLabel: () => t("player.betDetail.search.win"),
        value: "1"
      },
      {
        label: t("player.betDetail.search.lose"),
        renderLabel: () => t("player.betDetail.search.lose"),
        value: "2"
      }
    ]
  },
  {
    label: "创建时间",
    renderLabel: () => t("player.betDetail.search.createTime"),
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: t("placeholder.start_time"),
      endPlaceholder: t("placeholder.end_time"),
      shortcuts: [
        {
          text: t("Time.today"),
          value: () => {
            const today = dayjs();
            return [
              today.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              today.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: t("Time.yesterday"),
          value: () => {
            const yesterday = dayjs().subtract(1, "day");
            return [
              yesterday.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              yesterday.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: t("Time.last7Days"),
          value: () => {
            const end = dayjs();
            const start = dayjs().subtract(6, "day");
            return [
              start.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              end.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: t("Time.last30Days"),
          value: () => {
            const end = dayjs();
            const start = dayjs().subtract(29, "day");
            return [
              start.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              end.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: t("Time.thisMonth"),
          value: () => {
            const now = dayjs();
            return [
              now.startOf("month").format("YYYY-MM-DD HH:mm:ss"),
              now.endOf("month").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: t("Time.lastMonth"),
          value: () => {
            const lastMonth = dayjs().subtract(1, "month");
            return [
              lastMonth.startOf("month").format("YYYY-MM-DD HH:mm:ss"),
              lastMonth.endOf("month").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        }
      ]
    }))
  }
];

// 点击搜索按钮
const handleSearch = (values: any) => {
  pageInfo.value.page = 1;
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    user_id: "",
    user_admin_id: "",
    username: "",
    game_id: "",
    provider: "",
    currency_code: "",
    bet_id: "",
    transaction_id: "",
    status: "",
    createTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = SingleBettingItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 统计信息
const totalBet = ref(0);
const totalWinLoss = ref(0);
const totalCount = ref(0);

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("player.betDetail.table.id"),
    prop: "id",
    width: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "用户ID",
    renderHeader: () => t("player.betDetail.table.userId"),
    prop: "user_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "玩家ID",
    renderHeader: () => t("player.betDetail.table.username"),
    prop: "username",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户ID",
    renderHeader: () => t("player.betDetail.table.merchantId"),
    prop: "user_admin_id",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "游戏ID",
    renderHeader: () => t("player.betDetail.table.game_id"),
    prop: "game_id",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
    {
    label: "游戏名称",
    renderHeader: () => t("player.betDetail.table.gameName"),
    prop: "game_name",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "游戏类型",
    renderHeader: () => t("player.betDetail.table.gameType"),
    prop: "game_type",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
   {
    label: "所属分类",
    renderHeader: () => t("player.betDetail.table.category"),
    prop: "type_id",
    width: 260,
    render: (value: string | number) => {
      if (!value) return "-";
      const brand = brandOptions.value.find(item => item.value === Number(value) || item.value === value);
      return brand ? brand.label : value;
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "供应商",
    renderHeader: () => t("player.betDetail.table.supplier"),
    prop: "provider",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    renderHeader: () => t("player.betDetail.table.currency"),
    prop: "currency_code",
    minWidth: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "投注ID",
    renderHeader: () => t("player.betDetail.table.betId"),
    prop: "bet_id",
    width: 240,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "交易ID",
    renderHeader: () => t("player.betDetail.table.transactionId"),
    prop: "transaction_id",
    width: 240,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "投注金额",
    renderHeader: () => t("player.betDetail.table.betAmount"),
    prop: "bet_amount",
    width: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "中奖金额",
    renderHeader: () => t("player.betDetail.table.winAmount"),
    prop: "win_amount",
    width: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "输赢",
    renderHeader: () => t("player.betDetail.table.winLoss"),
    prop: "win_and_lose",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "创建时间",
    renderHeader: () => t("player.betDetail.table.createTime"),
    prop: "createtime",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("player.betDetail.table.status"),
    prop: "status_text",
    valueType: "tag",
    width: "100",
    render: (value: string) => {
      const isWin = value === t("player.betDetail.table.win") || value === '中奖';
      return h(ElTag, {
        type: isWin ? "success" : "danger"
      }, () => isWin ? t("player.betDetail.table.win") : t("player.betDetail.table.lose"));
    },
    tableColumnProps: {
      fixed: "right",
      align: "center"
    }
  },
]);

// 表格操作栏按钮定义
buttons.value = [{
    text: () => t("player.betDetail.table.gameHistory"),
    code: "gameData",
    props: {
      type: "primary"
    },
    onClick: () => {
      message(t("player.betDetail.table.gameHistory"), { type: "info" });
    }
  }];

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { user_id, user_admin_id, username, game_id, provider, currency_code, bet_id, transaction_id, status, createTime } = searchData.value;
    const params: SingleBettingListParams = {
      pageNumber: page,
      pageSize,
      user_id: user_id || undefined,
      user_admin_id: user_admin_id || undefined,
      username: username || undefined,
      game_id: game_id || undefined,
      provider: provider || undefined,
      currency_code: currency_code || undefined,
      bet_id: bet_id || undefined,
      transaction_id: transaction_id || undefined,
      status: status || undefined
    };

    // 处理创建时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }

    const { data } = await getSingleBettingList(params);

    if (data && data.rows) {
      tableData.value = data.rows;
      total.value = data.total;

      // 计算统计信息
      totalBet.value = data.rows.reduce((sum, item) => {
        const bet = parseFloat(item.bet_amount) || 0;
        return sum + bet;
      }, 0);
      totalWinLoss.value = data.rows.reduce((sum, item) => {
        return sum + (item.win_and_lose || 0);
      }, 0);
      totalCount.value = data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      totalBet.value = 0;
      totalWinLoss.value = 0;
      totalCount.value = 0;
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("player.betDetail.message.getListFail"), { type: "error" });
    tableData.value = [];
    total.value = 0;
    totalBet.value = 0;
    totalWinLoss.value = 0;
    totalCount.value = 0;
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

// 初始化加载数据
onMounted(() => {
  // 如果URL中有userId，设置到搜索表单的user_id字段
  if (userId.value) {
    searchData.value.user_id = userId.value;
    pageInfo.value.page = 1;
  }
  getList();
});

// 监听路由参数变化，自动设置搜索表单的user_id
watch(
  () => route.query.userId,
  (newUserId) => {
    if (newUserId && typeof newUserId === "string") {
      searchData.value.user_id = newUserId;
      // 重置到第一页并重新获取数据
      pageInfo.value.page = 1;
      getList();
    }
  }
);

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message(t("player.betDetail.message.selectToExport"), { type: "warning" });
    return;
  }
  const exportTitles = tableConfig.value.map((col: any) => col.renderHeader());
  const exportProps = tableConfig.value
    .map((col: any) => col.prop)
    .filter((prop: string) => prop !== "action");
  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status_text") {
        const isWin = item.status_text === t("player.betDetail.table.win") || item.status_text === '中奖';
        return isWin ? t("player.betDetail.table.win") : t("player.betDetail.table.lose");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });
  res.unshift(exportTitles.filter((title: string) => title !== t("player.betDetail.table.action")));
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("player.betDetail.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("player.betDetail.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("player.betDetail.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("player.betDetail.export.jsonFileName");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="single-betting-details-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="110"
        label-position="right"
        :has-unfold="false"
        :searchText="t('player.betDetail.buttons.search')"
        :resetText="t('player.betDetail.buttons.reset')"
        @search="handleSearch"
        @reset="handleRest"
      />
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <PlusTable
        v-loading="loadingStatus"
        :columns="tableConfig"
        :table-data="tableData"
        :stripe="true"
        :is-selection="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: t('player.betDetail.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格标题：统计信息 -->
        <template #title>
          <div class="stats-content" style="margin-left: 5px">
            <div class="stat-item">
              <span class="stat-label">{{ t("player.betDetail.stats.totalBet") }}:</span>
              <el-input
                v-model="totalBet"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t("player.betDetail.stats.totalWinLoss") }}:</span>
              <el-input
                v-model="totalWinLoss"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t("player.betDetail.stats.totalCount") }}:</span>
              <el-input
                v-model="totalCount"
                readonly
                disabled
                style="width: 200px; margin-left: 5px"
              />
            </div>
          </div>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('player.betDetail.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('player.betDetail.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('player.betDetail.toolbar.hideSearch') : t('player.betDetail.toolbar.showSearch')"
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
          <el-tooltip :content="t('player.betDetail.toolbar.export')" placement="top" :trigger="'hover'">
            <span style="display: inline-block">
              <el-dropdown
                trigger="click"
                popper-class="custom-export-dropdown"
              >
                <el-icon
                  :size="18"
                  style="
                    margin-right: 15px;
                    cursor: pointer;
                    outline: none;
                  "
                  color="#606266"
                >
                  <component :is="Upload" />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item class="export-active" @click="exportJson"
                      >{{ t("player.betDetail.export.json") }}</el-dropdown-item
                    >
                    <el-dropdown-item @click="exportExcel"
                      >{{ t("player.betDetail.export.excel") }}</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
.single-betting-details-container {
  padding: 0 20px;
}

.search-card {
  margin-top: 20px;
  margin-bottom: 0;
}

.table-card {
  margin-top: 20px;
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

.custom-export-dropdown {
  min-width: 80px !important;
  padding: 0 !important;
  border-radius: 4px;
}

.custom-export-dropdown .el-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0 !important;
  text-align: center;
  border-radius: 0;
}

.custom-export-dropdown .export-active {
  color: #fff !important;
  background-color: #1677ff !important;
}

.custom-export-dropdown .el-dropdown-item:not(.export-active):hover {
  background-color: #f5f7fa !important;
}
</style>

