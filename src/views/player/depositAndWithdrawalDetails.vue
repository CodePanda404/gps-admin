<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "DepositWithdrawalDetails"
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
  getDepositWithdrawalList,
  type DepositWithdrawalListParams
} from "@/api/player";
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
// 搜索表单数据
const searchData = ref({
  id: "",
  user_id: "",
  username: "",
  agent: "",
  type: "",
  createTime: null as string[] | null
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    renderLabel: () => t("player.depositWithdrawal.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "用户ID",
    renderLabel: () => t("player.depositWithdrawal.search.userId"),
    prop: "user_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "用户名",
    renderLabel: () => t("player.depositWithdrawal.search.username"),
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "类型",
    renderLabel: () => t("player.depositWithdrawal.search.type"),
    prop: "type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: [
      {
        label: t("player.depositWithdrawal.search.all"),
        renderLabel: () => t("player.depositWithdrawal.search.all"),
        value: ""
      },
      {
        label: t("player.depositWithdrawal.search.deposit"),
        renderLabel: () => t("player.depositWithdrawal.search.deposit"),
        value: "1"
      },
      {
        label: t("player.depositWithdrawal.search.withdrawal"),
        renderLabel: () => t("player.depositWithdrawal.search.withdrawal"),
        value: "2"
      }
    ]
  },
  {
    label: "创建时间",
    renderLabel: () => t("player.depositWithdrawal.search.createTime"),
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
    id: "",
    user_id: "",
    username: "",
    agent: "",
    type: "",
    createTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（映射后的格式）
type TableDepositWithdrawalItem = {
  id: number;
  userId: number;
  name: string;
  type: string; // 存款/取款
  changedAmount: string; // 变动金额（带正负号）
  beforeAmount: string; // 变动前余额
  afterAmount: string; // 变动后余额
  createTime: string; // 创建时间
  remark: string; // 备注
};

// 多选选中数据
const multipleSelection = ref<TableDepositWithdrawalItem[]>([]);
// 表格相关数据和操作
const { tableData, pageInfo, total, loadingStatus } =
  useTable<TableDepositWithdrawalItem[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("player.depositWithdrawal.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "用户ID",
    renderHeader: () => t("player.depositWithdrawal.table.userId"),
    prop: "userId",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "用户名",
    renderHeader: () => t("player.depositWithdrawal.table.username"),
    prop: "name",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "类型",
    renderHeader: () => t("player.depositWithdrawal.table.type"),
    prop: "type",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "变动游戏币",
    renderHeader: () => t("player.depositWithdrawal.table.changedAmount"),
    prop: "changedAmount",
    tableColumnProps: {
      align: "center"
    },
    width: 150
  },
  {
    label: "变动前",
    renderHeader: () => t("player.depositWithdrawal.table.beforeAmount"),
    prop: "beforeAmount",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  },
  {
    label: "变动后",
    renderHeader: () => t("player.depositWithdrawal.table.afterAmount"),
    prop: "afterAmount",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  },
  {
    label: "创建时间",
    renderHeader: () => t("player.depositWithdrawal.table.createTime"),
    prop: "createTime",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    renderHeader: () => t("player.depositWithdrawal.table.remark"),
    prop: "remark",
    width: 200,
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 表格选中数据
const handleSelectionChange = (val: TableDepositWithdrawalItem[]) => {
  multipleSelection.value = val;
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, user_id, username, type, createTime } = searchData.value;
    
    const params: DepositWithdrawalListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      user_id: user_id || undefined,
      username: username || undefined,
      type: type || undefined
    };

    // 处理时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }

    const res = await getDepositWithdrawalList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      // 映射后端数据到表格数据格式
      tableData.value = res.data.rows.map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.username,
        type: item.type_text,
        changedAmount: item.money,
        beforeAmount: item.before,
        afterAmount: item.after,
        createTime: item.createtime,
        remark: (item as any).remark || ""
      }));
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("player.depositWithdrawal.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("player.depositWithdrawal.message.getListFail"), { type: "error" });
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
    message(t("player.depositWithdrawal.message.selectToExport"), { type: "warning" });
    return;
  }
  const exportTitles = tableConfig.value.map((col: any) => col.renderHeader());
  const exportProps = tableConfig.value.map((col: any) => col.prop);
  const res: string[][] = multipleSelection.value.map(
    (item: TableDepositWithdrawalItem) => {
      return exportProps.map(
        prop => item[prop as keyof TableDepositWithdrawalItem] ?? ""
      );
    }
  );
  res.unshift(exportTitles);
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("player.depositWithdrawal.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("player.depositWithdrawal.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("player.depositWithdrawal.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("player.depositWithdrawal.export.jsonFileName");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="deposit-withdrawal-details-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="100"
        label-position="right"
        :has-unfold="false"
        :searchText="t('player.depositWithdrawal.buttons.search')"
        :resetText="t('player.depositWithdrawal.buttons.reset')"
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
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <template #density-icon>
          <el-tooltip :content="t('player.depositWithdrawal.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('player.depositWithdrawal.toolbar.columnSettings')" placement="top">
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
              :content="showSearch ? t('player.depositWithdrawal.toolbar.hideSearch') : t('player.depositWithdrawal.toolbar.showSearch')"
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
            <el-tooltip :content="t('player.depositWithdrawal.toolbar.export')" placement="top" :trigger="'hover'">
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
                      <el-dropdown-item
                        class="export-active"
                        @click="exportJson"
                        >{{ t("player.depositWithdrawal.export.json") }}</el-dropdown-item
                      >
                      <el-dropdown-item @click="exportExcel"
                        >{{ t("player.depositWithdrawal.export.excel") }}</el-dropdown-item
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
.deposit-withdrawal-details-container {
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
