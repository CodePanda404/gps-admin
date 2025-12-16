<script setup lang="ts">
import { ref, computed } from "vue";
defineOptions({
  name: "Single"
});
import { useRouter } from "vue-router";
import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 路由
const router = useRouter();

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
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
        label: "禁用",
        value: "0"
      },
      {
        label: "正常",
        value: "1"
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
type TableRow = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  merchant: string;
  loginTime: string;
  loginIp: string;
  registerTime: string;
  registerIP: string;
  status: boolean;
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id"
  },
  {
    label: "用户名",
    prop: "name"
  },
  {
    label: "余额",
    prop: "balance"
  },
  {
    label: "币种",
    prop: "currency"
  },
  {
    label: "商户ID",
    prop: "merchant"
  },
  {
    label: "登录时间",
    prop: "loginTime"
  },
  {
    label: "登录IP",
    prop: "loginIp"
  },
  {
    label: "注册时间",
    prop: "registerTime"
  },
  {
    label: "注册IP",
    prop: "registerIP"
  },
  {
    label: "状态",
    prop: "status",
    valueType: "switch",
    editable: true
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => "投注明细",
    code: "bettingDetails",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      router.push({
        name: "SingleBettingDetails",
        query: {
          playerId: row.id,
          playerName: row.name
        }
      });
    }
  }
];

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 玩家状态切换处理
const handleStatusChange = async (params: {
  row: TableRow;
  prop: string;
  value: any;
}) => {
  const { row, prop, value } = params;
  if (prop !== "status") {
    return;
  }

  if (!row) {
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  const originalStatus = !value;
  const isDisabling = originalStatus === true;

  const confirmMessage = isDisabling
    ? `是否确定将玩家${row.name}禁用?`
    : `是否确定将玩家${row.name}恢复正常?`;

  try {
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      draggable: true
    });

    // 模拟API调用
    const res = {
      success: true,
      message: "玩家状态切换成功"
    };

    if (res.success) {
      message(isDisabling ? "玩家已禁用" : "玩家已恢复正常", {
        type: "success"
      });
    } else {
      row.status = originalStatus;
      const tableRowIndex = tableData.value.findIndex(
        item => item.id === row.id
      );
      if (tableRowIndex !== -1) {
        tableData.value[tableRowIndex] = {
          ...tableData.value[tableRowIndex],
          status: originalStatus
        };
      }
      message("玩家状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    row.status = originalStatus;
    const tableRowIndex = tableData.value.findIndex(item => item.id === row.id);
    if (tableRowIndex !== -1) {
      tableData.value[tableRowIndex] = {
        ...tableData.value[tableRowIndex],
        status: originalStatus
      };
    }
    if (error !== "cancel") {
      console.error("状态切换失败:", error);
      message(error?.message || "状态切换失败", { type: "error" });
    }
  }
};

// 固定初始数据
const generateMockData = (): TableRow[] => {
  return [
    {
      id: "abc123",
      name: "Siew",
      balance: 1000,
      currency: "PHP",
      merchant: "abc123",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc124",
      name: "Siew2",
      balance: 2000,
      currency: "PHP",
      merchant: "abc123",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc125",
      name: "Siew3",
      balance: 3000,
      currency: "INR",
      merchant: "xyz789",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc126",
      name: "Siew4",
      balance: 4000,
      currency: "THB",
      merchant: "merchant001",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc127",
      name: "Siew5",
      balance: 5000,
      currency: "MYR",
      merchant: "merchant002",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc128",
      name: "Siew6",
      balance: 6000,
      currency: "USD",
      merchant: "merchant003",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc129",
      name: "Siew7",
      balance: 7000,
      currency: "PHP",
      merchant: "abc123",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc130",
      name: "Siew8",
      balance: 8000,
      currency: "INR",
      merchant: "xyz789",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc131",
      name: "Siew9",
      balance: 9000,
      currency: "THB",
      merchant: "merchant001",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc132",
      name: "Siew10",
      balance: 10000,
      currency: "MYR",
      merchant: "merchant002",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc133",
      name: "Siew11",
      balance: 11000,
      currency: "USD",
      merchant: "merchant003",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc134",
      name: "Siew12",
      balance: 12000,
      currency: "PHP",
      merchant: "abc123",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc135",
      name: "Siew13",
      balance: 13000,
      currency: "INR",
      merchant: "xyz789",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc136",
      name: "Siew14",
      balance: 14000,
      currency: "THB",
      merchant: "merchant001",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc137",
      name: "Siew15",
      balance: 15000,
      currency: "MYR",
      merchant: "merchant002",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc138",
      name: "Siew16",
      balance: 16000,
      currency: "USD",
      merchant: "merchant003",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc139",
      name: "Siew17",
      balance: 17000,
      currency: "PHP",
      merchant: "abc123",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc140",
      name: "Siew18",
      balance: 18000,
      currency: "INR",
      merchant: "xyz789",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc141",
      name: "Siew19",
      balance: 19000,
      currency: "THB",
      merchant: "merchant001",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc142",
      name: "Siew20",
      balance: 20000,
      currency: "MYR",
      merchant: "merchant002",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc143",
      name: "Siew21",
      balance: 21000,
      currency: "USD",
      merchant: "merchant003",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc144",
      name: "Siew22",
      balance: 22000,
      currency: "PHP",
      merchant: "abc123",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc145",
      name: "Siew23",
      balance: 23000,
      currency: "INR",
      merchant: "xyz789",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: false
    },
    {
      id: "abc146",
      name: "Siew24",
      balance: 24000,
      currency: "THB",
      merchant: "merchant001",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    },
    {
      id: "abc147",
      name: "Siew25",
      balance: 25000,
      currency: "MYR",
      merchant: "merchant002",
      loginTime: "2025-10-17 00:24:16",
      loginIp: "abc123",
      registerTime: "2025-10-17 00:24:16",
      registerIP: "abc123",
      status: true
    }
  ];
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
        item.merchant.toLowerCase().includes(searchData.value.agent.toLowerCase())
      );
    }

    if (searchData.value.status !== "") {
      const statusBool = searchData.value.status === "1";
      filteredData = filteredData.filter(item => item.status === statusBool);
    }

    if (
      searchData.value.registerTime &&
      Array.isArray(searchData.value.registerTime) &&
      searchData.value.registerTime.length === 2
    ) {
      const startTime = new Date(searchData.value.registerTime[0]).getTime();
      const endTime = new Date(searchData.value.registerTime[1]).getTime();
      filteredData = filteredData.filter(item => {
        const itemTime = new Date(item.registerTime).getTime();
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

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => item[prop as keyof TableRow] ?? "");
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "单一/免转模式玩家";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `单一/免转模式玩家.xlsx`;
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
  a.download = "单一/免转模式玩家.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="single-container">
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
        :adaptive="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: '操作'
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
        @formChange="handleStatusChange"
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
