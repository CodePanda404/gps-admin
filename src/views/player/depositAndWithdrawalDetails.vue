<script setup lang="ts">
import { ref, computed } from "vue";
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

// 国际化
const { t } = useI18n();

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
  agent: "",
  status: "",
  registerTime: null as string[] | null
});

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
    name: "",
    agent: "",
    status: "",
    registerTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type DepositWithdrawalItem = {
  id: string;
  userId: string;
  name: string;
  type: string; // 存款/取款
  changedAmount: number;
  beforeAmount: number;
  afterAmount: number;
  createTime: string;
  remark: string;
};

// 多选选中数据
const multipleSelection = ref<DepositWithdrawalItem[]>([]);
// 表格相关数据和操作
const { tableData, pageInfo, total, loadingStatus } =
  useTable<DepositWithdrawalItem[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id",
    width: "120"
  },
  {
    label: "用户ID",
    prop: "userId",
    width: "120"
  },
  {
    label: "用户名",
    prop: "name",
    width: "130"
  },
  {
    label: "类型",
    prop: "type",
    width: "100"
  },
  {
    label: "变动游戏币",
    prop: "changedAmount",
    width: "130"
  },
  {
    label: "变动前",
    prop: "beforeAmount",
    width: "130"
  },
  {
    label: "变动后",
    prop: "afterAmount",
    width: "130"
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: "180"
  },
  {
    label: "备注",
    prop: "remark",
    minWidth: "200"
  }
]);

// 表格选中数据
const handleSelectionChange = (val: DepositWithdrawalItem[]) => {
  multipleSelection.value = val;
};

// 生成模拟数据
const generateMockData = (): DepositWithdrawalItem[] => {
  const types = ["存款", "取款"];
  const names = ["Siew", "John", "Alice", "Bob"];

  return Array.from({ length: 100 }).map((_, index) => {
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const changedAmount = Math.floor(Math.random() * 10000) + 1000;
    const beforeAmount = Math.floor(Math.random() * 50000) + 10000;
    const afterAmount =
      randomType === "存款"
        ? beforeAmount + changedAmount
        : beforeAmount - changedAmount;

    return {
      id: `abc${index + 1}`,
      userId: `abc${index + 1}`,
      name: randomName,
      type: randomType,
      changedAmount,
      beforeAmount,
      afterAmount,
      createTime: `2025-10-17 ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      remark: `beizhuuuuu${index + 1}`
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
        item.name.toLowerCase().includes(searchData.value.name.toLowerCase())
      );
    }
    if (searchData.value.agent) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchData.value.agent.toLowerCase())
      );
    }
    if (searchData.value.status !== "") {
      // 这里可以根据实际需求处理状态筛选
    }
    if (
      searchData.value.registerTime &&
      Array.isArray(searchData.value.registerTime) &&
      searchData.value.registerTime.length === 2
    ) {
      const startTime = new Date(searchData.value.registerTime[0]).getTime();
      const endTime = new Date(searchData.value.registerTime[1]).getTime();
      filteredData = filteredData.filter(item => {
        const itemTime = new Date(item.createTime).getTime();
        return itemTime >= startTime && itemTime <= endTime;
      });
    }

    const totalCount = filteredData.length;
    const start = (pageInfo.value.page - 1) * pageInfo.value.pageSize;
    const end = start + pageInfo.value.pageSize;
    const paginatedData = filteredData.slice(start, end);

    tableData.value = paginatedData;
    total.value = totalCount;
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
  const exportProps = tableConfig.value.map((col: any) => col.prop);
  const res: string[][] = multipleSelection.value.map(
    (item: DepositWithdrawalItem) => {
      return exportProps.map(
        prop => item[prop as keyof DepositWithdrawalItem] ?? ""
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
        height="550px"
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
            <!-- 筛选下拉菜单 -->
            <el-tooltip content="筛选" placement="top" :trigger="'hover'">
              <span style="display: inline-block">
                <el-dropdown
                  trigger="click"
                  popper-class="custom-filter-dropdown"
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
                    <component :is="Filter" />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>全部</el-dropdown-item>
                      <el-dropdown-item>图片</el-dropdown-item>
                      <el-dropdown-item>视频</el-dropdown-item>
                      <el-dropdown-item>文本</el-dropdown-item>
                      <el-dropdown-item>应用包</el-dropdown-item>
                      <el-dropdown-item>压缩包</el-dropdown-item>
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
.table-card {
  max-width: 100%;
  height: 700px;
  max-height: 650px;
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
