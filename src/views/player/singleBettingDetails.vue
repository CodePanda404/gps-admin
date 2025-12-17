<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
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
import {
  getSingleBettingList,
  type SingleBettingListParams,
  type SingleBettingItem
} from "@/api/player";
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
  type: "",
  createTime: null as string[] | null
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "用户ID",
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入用户ID"
    }))
  },
  {
    label: "用户名",
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入用户名"
    }))
  },
  {
    label: "类型",
    prop: "type",
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
        value: "1"
      },
      {
        label: "未中奖",
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
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
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
    type: "",
    createTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用后端字段）
type BettingItem = SingleBettingItem;

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
    label: "用户ID",
    prop: "user_id"
  },
  {
    label: "用户名",
    prop: "username"
  },
  {
    label: "游戏ID",
    prop: "game_id"
  },
  {
    label: "投注ID",
    prop: "bet_id"
  },
  {
    label: "交易ID",
    prop: "transaction_id"
  },
  {
    label: "投注金额",
    prop: "bet_amount"
  },
  {
    label: "中奖金额",
    prop: "win_amount"
  },
  {
    label: "输赢",
    prop: "win_and_lose"
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: "160"
  },
  {
    label: "状态",
    prop: "status_text",
    valueType: "tag",
    fieldProps: (value: any) => ({
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

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, name, type, createTime } = searchData.value;
    
    const params: SingleBettingListParams = {
      pageNumber: page,
      pageSize,
      user_id: id || undefined,
      username: name || undefined,
      type: type || undefined
    };

    // 处理时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }

    const res = await getSingleBettingList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      // 直接使用后端数据，无需转换
      tableData.value = res.data.rows;
      total.value = res.data.total;

      // 计算统计信息（根据实际返回的字段调整）
      totalBet.value = res.data.rows.reduce((sum, item) => {
        const bet = parseFloat(item.bet_amount) || 0;
        return sum + bet;
      }, 0);
      totalWinLoss.value = res.data.rows.reduce((sum, item) => {
        return sum + (item.win_and_lose || 0);
      }, 0);
      totalCount.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      totalBet.value = 0;
      totalWinLoss.value = 0;
      totalCount.value = 0;
      message(res.msg || "获取列表数据失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
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
  // 如果URL中有playerId，设置到搜索表单的ID字段
  if (playerId.value) {
    searchData.value.id = playerId.value;
    pageInfo.value.page = 1;
  }
  getList();
});

// 监听路由参数变化，自动设置搜索表单的ID
watch(
  () => route.query.playerId,
  (newPlayerId) => {
    if (newPlayerId && typeof newPlayerId === "string") {
      searchData.value.id = newPlayerId;
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

