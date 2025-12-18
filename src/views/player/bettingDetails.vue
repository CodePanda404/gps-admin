<script setup lang="ts">
import { ref, computed, h, watch, onMounted } from "vue";
defineOptions({
  name: "BettingDetails"
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
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import dayjs from "dayjs";
import {
  getTransferBettingList,
  type TransferBettingListParams,
  type TransferBettingItem
} from "@/api/player";
import {
  getCurrencyList,
  type CurrencyItem
} from "@/api/game";
import { ElTag } from "element-plus";

// 路由
const route = useRoute();
const router = useRouter();

// 获取路由参数
const playerId = computed(() => (route.query.playerId as string) || "");
const playerName = computed(() => (route.query.playerName as string) || "");

// 国际化
const { t } = useI18n();

/*  -----搜索表单相关-----  */
// 币种列表（用于下拉选择）
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 初始化时获取币种列表
fetchCurrencyList();

// 搜索表单数据
const searchData = ref({
  id: "",
  user_id: "",
  username: "",
  game_id: "",
  currency_id: "",
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
    label: "ID",
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "ID"
    }))
  },
  {
    label: "用户ID",
    prop: "user_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "用户ID"
    }))
  },
  {
    label: "用户名",
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "用户名"
    }))
  },
  {
    label: "游戏ID",
    prop: "game_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "游戏ID"
    }))
  },
  {
    label: "币种",
    prop: "currency_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择",
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
  },
  {
    label: "投注ID",
    prop: "bet_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "投注ID"
    }))
  },
  {
    label: "交易ID",
    prop: "transaction_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "交易ID"
    }))
  },
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择"
    })),
    options: [
      {
        label: "全部",
        value: ""
      },
      {
        label: "中奖",
        value: "中奖"
      },
      {
        label: "未中奖",
        value: "未中奖"
      }
    ]
  },
  {
    label: "创建时间",
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: "开始日期时间",
      endPlaceholder: "结束日期时间",
      shortcuts: [
        {
          text: "今天",
          value: () => {
            const today = dayjs();
            return [
              today.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              today.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "昨天",
          value: () => {
            const yesterday = dayjs().subtract(1, "day");
            return [
              yesterday.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              yesterday.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "最近7天",
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
          text: "最近30天",
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
          text: "本月",
          value: () => {
            const now = dayjs();
            return [
              now.startOf("month").format("YYYY-MM-DD HH:mm:ss"),
              now.endOf("month").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "上月",
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
    id: "",
    user_id: "",
    username: "",
    game_id: "",
    currency_id: "",
    bet_id: "",
    transaction_id: "",
    status: "",
    createTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = TransferBettingItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id",
    width: 100
  },
  {
    label: "用户ID",
    prop: "user_id"
  },
  {
    label: "用户名",
    prop: "username",
    width: 140
  },
  {
    label: "游戏ID",
    prop: "game_id",
    width: 140
  },
  {
    label: "投注ID",
    prop: "bet_id",
    width: 240
  },
  {
    label: "交易ID",
    prop: "transaction_id",
    width: 240
  },
  {
    label: "投注金额",
    prop: "bet_amount",
    width: 100
  },
  {
    label: "中奖金额",
    prop: "win_amount",
    width: 100
  },
  {
    label: "输赢",
    prop: "win_and_lose"
  },
  {
    label: "状态",
    prop: "status_text",
    valueType: "tag",
     render: (value: string) => {
      return h(ElTag, {
        type: value === '中奖' ? "success" : "danger"
      }, () => value === '中奖' ? value : '未中奖');
    },
    tableColumnProps: {
      fixed: "right"
    }
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: 160
  }
]);

// 表格操作栏按钮定义
buttons.value = [{
    text: () => "游戏数据",
    code: "gameData",
    props: {
      type: "primary"
    },
    onClick: () => {
      message("游戏数据", { type: "info" });
    }
  }];

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 模拟数据（用于测试，后端接口响应慢时使用）
const mockData = {
  code: 0,
  msg: "成功",
  data: {
    total: 79095972,
    pages: 7909598,
    pageNumber: "1",
    pageSize: "10",
    rows: [
      {
        id: 79097064,
        user_id: 7954401,
        username: "12451P17948",
        game_id: "JL_49",
        bet_id: "TwomtzQPde3pXyK6Adny7c",
        transaction_id: "45f7563b-036b-42fe-b42d-221e4a362250",
        bet_amount: "3.00",
        win_amount: "0.00",
        win_and_lose: -3,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:15"
      },
      {
        id: 79097065,
        user_id: 8016511,
        username: "12451P21689",
        game_id: "PGS_74",
        bet_id: "WC5cfv3wLVzpAwH2MExNzL",
        transaction_id: "5e1246b2-8ac9-40e1-a14b-de0b063ad2ba",
        bet_amount: "10.00",
        win_amount: "0.00",
        win_and_lose: -10,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:15"
      },
      {
        id: 79097055,
        user_id: 8005203,
        username: "12452P30942",
        game_id: "JL_77",
        bet_id: "poBVLefK25FHboHt5mdzWN",
        transaction_id: "3adaa59c-a3fb-42a5-b3be-9eae40887a28",
        bet_amount: "1.00",
        win_amount: "0.00",
        win_and_lose: -1,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097056,
        user_id: 8012536,
        username: "12451P21410",
        game_id: "JL_49",
        bet_id: "Zz7KTXDbYHNnQfzLjGFpfV",
        transaction_id: "16ddf54c-2097-4602-947d-b24316832c69",
        bet_amount: "1.00",
        win_amount: "0.00",
        win_and_lose: -1,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097057,
        user_id: 7957773,
        username: "12449P23906",
        game_id: "JL_103",
        bet_id: "i3C4uokfSFqWmT32jJ6yFA",
        transaction_id: "489dccdb-0b75-4cf0-a3cd-761077a2e42c",
        bet_amount: "1.00",
        win_amount: "0.15",
        win_and_lose: -0.85,
        status_text: "中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097058,
        user_id: 8017649,
        username: "12452P33944",
        game_id: "PGS_1492288",
        bet_id: "qGbpgxN4Xi9JKAVk945jbY",
        transaction_id: "25ee8abc-cb63-4889-8c52-4118eac3e24f",
        bet_amount: "5.00",
        win_amount: "0.00",
        win_and_lose: -5,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097059,
        user_id: 8009962,
        username: "12452P31989",
        game_id: "JL_109",
        bet_id: "r96qSP8r5o4KbivvCkyRCE",
        transaction_id: "3468b042-d7db-47fa-a717-78df20209a43",
        bet_amount: "1.00",
        win_amount: "0.00",
        win_and_lose: -1,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097060,
        user_id: 8017637,
        username: "12449P28930",
        game_id: "PGS_1492288",
        bet_id: "W83FGtf36hnH94BtKnPmh9",
        transaction_id: "a3156ad1-81c4-46fe-8f12-2a292247a83d",
        bet_amount: "5.00",
        win_amount: "0.00",
        win_and_lose: -5,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097061,
        user_id: 8016389,
        username: "12449P28844",
        game_id: "PGS_123",
        bet_id: "VvucMoLnYiK72DBWUbzfqi",
        transaction_id: "b070c8a7-7c46-4264-bda6-6433e9f7e758",
        bet_amount: "1.00",
        win_amount: "0.00",
        win_and_lose: -1,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      },
      {
        id: 79097062,
        user_id: 8017648,
        username: "12451P22004",
        game_id: "PGS_1834850",
        bet_id: "CFzCiKCLKkGSBnPAboo68F",
        transaction_id: "103b5458-1277-4ba6-af5f-e63de9ba948a",
        bet_amount: "0.00",
        win_amount: "0.00",
        win_and_lose: 0,
        status_text: "未中奖",
        createtime: "2025-12-18 15:57:14"
      }
    ]
  }
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    // TODO: 临时使用模拟数据，等后端接口优化后再切换回真实API
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 使用模拟数据
    const res = mockData;

    // 真实API调用（暂时注释）
    // const params: TransferBettingListParams = {
    //   pageNumber: pageInfo.value.page,
    //   pageSize: pageInfo.value.pageSize
    // };
    // if (searchData.value.id) {
    //   params.id = searchData.value.id;
    // }
    // if (searchData.value.user_id) {
    //   params.user_id = searchData.value.user_id;
    // }
    // if (searchData.value.username) {
    //   params.username = searchData.value.username;
    // }
    // if (searchData.value.game_id) {
    //   params.game_id = searchData.value.game_id;
    // }
    // if (searchData.value.currency_id) {
    //   params.currency_id = searchData.value.currency_id;
    // }
    // if (searchData.value.bet_id) {
    //   params.bet_id = searchData.value.bet_id;
    // }
    // if (searchData.value.transaction_id) {
    //   params.transaction_id = searchData.value.transaction_id;
    // }
    // if (searchData.value.status) {
    //   params.status = searchData.value.status;
    // }
    // if (
    //   searchData.value.createTime &&
    //   Array.isArray(searchData.value.createTime) &&
    //   searchData.value.createTime.length === 2
    // ) {
    //   params.create_start_time = searchData.value.createTime[0];
    //   params.create_end_time = searchData.value.createTime[1];
    // }
    // const res = await getTransferBettingList(params);

    if (res.code === 0) {
      tableData.value = res.data.rows;
      total.value = res.data.total;
    } else {
      message(res.msg || "获取列表数据失败", { type: "error" });
      tableData.value = [];
      total.value = 0;
    }
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

// 初始化加载数据
onMounted(() => {
  // 如果URL中有playerId，设置到搜索表单的user_id字段
  if (playerId.value) {
    searchData.value.user_id = playerId.value;
    pageInfo.value.page = 1;
  }
  getList();
});

// 监听路由参数变化，自动设置搜索表单的user_id
watch(
  () => route.query.playerId,
  (newPlayerId) => {
    if (newPlayerId && typeof newPlayerId === "string") {
      searchData.value.user_id = newPlayerId;
      // 重置到第一页并重新获取数据
      pageInfo.value.page = 1;
      getList();
    }
  }
);

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }
  const exportTitles = tableConfig.value.map((col: any) => col.label);
  const exportProps = tableConfig.value
    .map((col: any) => col.prop)
    .filter((prop: string) => prop !== "action");
  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status_text") {
        return item.status_text || "";
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });
  res.unshift(exportTitles.filter((title: string) => title !== "操作"));
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "投注明细";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `投注明细.xlsx`;
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "投注明细.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="betting-details-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never" style="margin: 20px">
      <PlusSearch
        v-show="showSearch"
        v-model="searchData"
        :columns="searchColumns"
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
        :columns="tableConfig"
        :table-data="tableData"
        :stripe="true"
        :is-selection="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: t('player.transfer.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >

       <!-- 表格操作工具栏 -->
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
          <div>
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
              <el-dropdown
                trigger="click"
                popper-class="custom-export-dropdown"
              >
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
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item class="export-active" @click="exportJson"
                      >Json</el-dropdown-item
                    >
                    <el-dropdown-item @click="exportExcel"
                      >Excel</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
          </el-tooltip>
          </div>
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

.custom-filter-dropdown {
  min-width: 120px !important;
  padding: 0 !important;
  border-radius: 4px;
}

.custom-filter-dropdown .el-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0 !important;
  text-align: center;
  border-radius: 0;
}

.custom-filter-dropdown .el-dropdown-item:hover {
  background-color: #f5f7fa !important;
}
</style>
