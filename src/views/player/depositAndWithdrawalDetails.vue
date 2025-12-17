<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
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
const playerId = computed(() => (route.query.playerId as string) || "");

// 国际化
const { t } = useI18n();

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  user_id: "",
  username: "",
  agent: "",
  status: "",
  registerTime: null as string[] | null
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
    prop: "username",
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
        label: "禁用",
        value: "0"
      }
    ]
  },
  {
    label: "注册时间",
    prop: "registerTime",
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
    user_id: null,
    username: "",
    agent: "",
    status: "",
    registerTime: null
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
    prop: "id"
  },
  {
    label: "用户ID",
    prop: "userId"
  },
  {
    label: "用户名",
    prop: "name",
    width: 220
  },
  {
    label: "类型",
    prop: "type"
  },
  {
    label: "变动游戏币",
    prop: "changedAmount"
  },
  {
    label: "变动前",
    prop: "beforeAmount"
  },
  {
    label: "变动后",
    prop: "afterAmount"
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 160
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
    const { id, user_id, username, status, registerTime } = searchData.value;
    
    const params: DepositWithdrawalListParams = {
      pageNumber: page,
      pageSize,
      user_id: id || undefined,
      username: username || undefined,
      type: status || undefined
    };

    // 处理时间范围
    if (registerTime && Array.isArray(registerTime) && registerTime.length === 2) {
      params.create_start_time = registerTime[0];
      params.create_end_time = registerTime[1];
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
        createTime: item.createtime
      }));
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || "获取列表数据失败", { type: "error" });
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
  const sheetName = "存取款明细";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `存取款明细.xlsx`;
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
  a.download = "存取款明细.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="deposit-withdrawal-details-container">
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
        :is-selection="true"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
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
                      <el-dropdown-item
                        class="export-active"
                        @click="exportJson"
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
