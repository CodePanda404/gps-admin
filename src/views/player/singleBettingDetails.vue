<script setup lang="ts">
import { ref, computed } from "vue";
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
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 路由
const route = useRoute();
const router = useRouter();

// 获取路由参数
const playerId = computed(() => (route.query.playerId as string) || "");
const playerName = computed(() => (route.query.playerName as string) || "");

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
  agent: "",
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
      placeholder: "请输入内容"
    }))
  },
  {
    label: "用户名",
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入内容"
    }))
  },
  {
    label: "所属代理",
    prop: "agent",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入内容"
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
        label: "正常",
        value: "1"
      },
      {
        label: "停用",
        value: "0"
      }
    ]
  },
  {
    label: "创建时间",
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "datetimerange",
      startPlaceholder: "开始日期时间",
      endPlaceholder: "结束日期时间"
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
    name: "",
    agent: "",
    status: "",
    createTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type BettingItem = {
  id: string;
  memberId: string;
  gameId: string;
  gameName: string;
  transactionId: string;
  betId: string;
  gameType: string;
  categoryId: string;
  supplier: string;
  currency: string;
  bet: number;
  bonus: number;
  winLoss: number;
  roundId: string;
  createTime: string;
  endTime: string;
  status: string; // 中奖/未中奖
};

// 多选选中数据
const multipleSelection = ref<BettingItem[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<BettingItem[]>();

// 统计信息
const totalBet = ref(0);
const totalWinLoss = ref(0);
const totalCount = ref(0);

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id"
  },
  {
    label: "会员ID",
    prop: "memberId"
  },
  {
    label: "游戏ID",
    prop: "gameId"
  },
  {
    label: "游戏名称",
    prop: "gameName"
  },
  {
    label: "交易ID",
    prop: "transactionId"
  },
  {
    label: "投注ID",
    prop: "betId"
  },
  {
    label: "游戏类型",
    prop: "gameType"
  },
  {
    label: "分类ID",
    prop: "categoryId"
  },
  {
    label: "供应商",
    prop: "supplier"
  },
  {
    label: "币种",
    prop: "currency"
  },
  {
    label: "投注",
    prop: "bet"
  },
  {
    label: "奖金",
    prop: "bonus"
  },
  {
    label: "输赢",
    prop: "winLoss"
  },
  {
    label: "回合ID",
    prop: "roundId"
  },
  {
    label: "创建时间",
    prop: "createTime"
  },
  {
    label: "结束时间",
    prop: "endTime"
  },
  {
    label: "状态",
    prop: "status",
    valueType: "tag",
    fieldProps: value => ({
      type: value === "中奖" ? "success" : "danger"
    })
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => "游戏历史",
    code: "gameHistory",
    props: {
      type: "primary"
    },
    onClick: () => {
      message("游戏历史功能", { type: "info" });
    }
  }
];

// 表格选中数据
const handleSelectionChange = (val: BettingItem[]) => {
  multipleSelection.value = val;
};

// 生成模拟数据
const generateMockData = (): BettingItem[] => {
  const suppliers = ["Pragmatic Play", "Evolution", "NetEnt", "Microgaming"];
  const currencies = ["PHP", "INR", "THB", "MYR", "USD"];
  const statuses = ["中奖", "未中奖"];
  const gameTypes = ["Casino", "Sports", "Lottery", "Poker"];
  const gameNames = ["1000", "2000", "3000", "4000"];

  return Array.from({ length: 100 }).map((_, index) => {
    const randomSupplier =
      suppliers[Math.floor(Math.random() * suppliers.length)];
    const randomCurrency =
      currencies[Math.floor(Math.random() * currencies.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomGameType =
      gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const randomGameName =
      gameNames[Math.floor(Math.random() * gameNames.length)];

    const bet = Math.floor(Math.random() * 5000) + 1000;
    const bonus = Math.floor(Math.random() * 3000) + 500;
    const winLoss = randomStatus === "中奖" ? bet + bonus - bet : -bet;

    return {
      id: `abc${index + 1}`,
      memberId: `abc${index + 1}`,
      gameId: `abc${index + 1}`,
      gameName: randomGameName,
      transactionId: `1000`,
      betId: `1000`,
      gameType: randomGameType,
      categoryId: randomGameType,
      supplier: randomSupplier,
      currency: randomCurrency,
      bet: bet,
      bonus: bonus,
      winLoss: winLoss,
      roundId: `abc${index + 1}`,
      createTime: `2025-10-17 ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      endTime: `2025-10-17 ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      status: randomStatus
    };
  });
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allData = generateMockData();
    let filteredData = [...allData];

    // 根据搜索条件过滤数据
    if (searchData.value.id) {
      filteredData = filteredData.filter(item =>
        item.id.includes(searchData.value.id)
      );
    }
    if (searchData.value.name) {
      filteredData = filteredData.filter(item =>
        item.memberId.toLowerCase().includes(searchData.value.name.toLowerCase())
      );
    }
    if (searchData.value.agent) {
      filteredData = filteredData.filter(item =>
        item.supplier
          .toLowerCase()
          .includes(searchData.value.agent.toLowerCase())
      );
    }
    if (searchData.value.status !== "") {
      const statusText = searchData.value.status === "1" ? "中奖" : "未中奖";
      filteredData = filteredData.filter(item => item.status === statusText);
    }
    if (
      searchData.value.createTime &&
      Array.isArray(searchData.value.createTime) &&
      searchData.value.createTime.length === 2
    ) {
      const startTime = new Date(searchData.value.createTime[0]).getTime();
      const endTime = new Date(searchData.value.createTime[1]).getTime();
      filteredData = filteredData.filter(item => {
        const itemTime = new Date(item.createTime).getTime();
        return itemTime >= startTime && itemTime <= endTime;
      });
    }

    // 计算统计信息
    totalBet.value = filteredData.reduce((sum, item) => sum + item.bet, 0);
    totalWinLoss.value = filteredData.reduce(
      (sum, item) => sum + item.winLoss,
      0
    );
    totalCount.value = filteredData.length;

    const totalCountForPagination = filteredData.length;
    const start = (pageInfo.value.page - 1) * pageInfo.value.pageSize;
    const end = start + pageInfo.value.pageSize;
    const paginatedData = filteredData.slice(start, end);

    tableData.value = paginatedData;
    total.value = totalCountForPagination;
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
    tableData.value = [];
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
getList();

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
  const res: string[][] = multipleSelection.value.map((item: BettingItem) => {
    return exportProps.map(prop => item[prop as keyof BettingItem] ?? "");
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
  <div class="single-betting-details-container">
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

    <!-- 统计信息 -->
    <el-card class="stats-card" shadow="never" style="margin: 20px">
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-label">总投注:</span>
          <el-input
            v-model="totalBet"
            readonly
            style="width: 200px; margin-left: 10px"
          />
        </div>
        <div class="stat-item">
          <span class="stat-label">总输赢:</span>
          <el-input
            v-model="totalWinLoss"
            readonly
            style="width: 200px; margin-left: 10px"
          />
        </div>
        <div class="stat-item">
          <span class="stat-label">总笔数:</span>
          <el-input
            v-model="totalCount"
            readonly
            style="width: 200px; margin-left: 10px"
          />
        </div>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never" style="margin: 20px">
      <PlusTable
        v-loading="loadingStatus"
        :columns="tableConfig"
        :table-data="tableData"
        :is-selection="true"
        :adaptive="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: '操作'
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
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
.stats-card {
  border: 1px dashed #409eff;
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

