<script setup lang="ts">
import { ref, computed } from "vue";
defineOptions({
  name: "Supplier"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import More from "~icons/ep/more";

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
  supplier: string;
  logo: string;
  remark: string;
  sort: number;
  updateTime: string;
  status: boolean;
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id"
  },
  {
    label: "供应商",
    prop: "supplier"
  },
  {
    label: "Logo",
    prop: "logo"
  },
  {
    label: "备注",
    prop: "remark"
  },
  {
    label: "排序",
    prop: "sort"
  },
  {
    label: "更新时间",
    prop: "updateTime"
  },
  {
    label: "状态",
    prop: "status",
    valueType: "switch",
    editable: true
  }
]);


// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 状态切换处理
const handleStatusChange = async (params: any) => {
  const { row, prop, value } = params;
  const typedRow = row as TableRow;
  if (prop !== "status") {
    return;
  }

  if (!typedRow) {
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  const originalStatus = !value;
  const isDisabling = originalStatus === true;

  const confirmMessage = isDisabling
    ? `是否确定将供应商${typedRow.supplier}禁用?`
    : `是否确定将供应商${typedRow.supplier}恢复正常?`;

  try {
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      draggable: true
    });

    const res = {
      success: true,
      message: "状态切换成功"
    };

    if (res.success) {
      message(isDisabling ? "已禁用" : "已恢复正常", {
        type: "success"
      });
    } else {
      typedRow.status = originalStatus;
      const tableRowIndex = tableData.value.findIndex(
        item => item.id === typedRow.id
      );
      if (tableRowIndex !== -1) {
        tableData.value[tableRowIndex] = {
          ...tableData.value[tableRowIndex],
          status: originalStatus
        };
      }
      message("状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    typedRow.status = originalStatus;
    const tableRowIndex = tableData.value.findIndex(item => item.id === typedRow.id);
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

// 生成模拟数据
const generateMockData = (): TableRow[] => {
  const suppliers = ["Pragmatic Play", "Evolution", "NetEnt", "Microgaming", "Play'n GO"];
  return Array.from({ length: 25 }).map((_, index) => ({
    id: `supplier_${index + 1}`,
    supplier: suppliers[index % suppliers.length],
    logo: `logo_${index + 1}.png`,
    remark: `备注信息 ${index + 1}`,
    sort: index + 1,
    updateTime: `2025-10-17 ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    status: index % 3 !== 0
  }));
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    const allData = generateMockData();
    let filteredData = [...allData];

    if (searchData.value.id) {
      filteredData = filteredData.filter(item =>
        item.id.includes(searchData.value.id)
      );
    }

    if (searchData.value.name) {
      filteredData = filteredData.filter(item =>
        item.supplier.toLowerCase().includes(searchData.value.name.toLowerCase())
      );
    }

    if (searchData.value.agent) {
      filteredData = filteredData.filter(item =>
        item.remark.toLowerCase().includes(searchData.value.agent.toLowerCase())
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
        const itemTime = new Date(item.updateTime).getTime();
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

// 添加
const handleAdd = () => {
  message("添加供应商", { type: "info" });
};

// 编辑
const handleEdit = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要编辑的数据！", { type: "warning" });
    return;
  }
  message(`编辑 ${multipleSelection.value.length} 条数据`, { type: "info" });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要删除的数据！", { type: "warning" });
    return;
  }
  try {
    await ElMessageBox.confirm("确认要删除吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true
    });
    message("删除成功", { type: "success" });
    getList();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
    }
  }
};

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
  const sheetName = "供应商";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `供应商.xlsx`;
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
  a.download = "供应商.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="supplier-container">
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
        @selection-change="handleSelectionChange"
        @formChange="handleStatusChange"
        width="100%"
        height="90%"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="large">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">新增</span>
          </el-button>
          <el-button type="success" @click="handleEdit" size="large">
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">编辑</span>
          </el-button>
          <el-button type="danger" @click="handleDelete" size="large">
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">删除</span>
          </el-button>
          <el-dropdown style="margin-left: 15px;">
            <el-button type="info" size="large" >
              <span>更多</span>
              <el-icon class="el-icon--right"><component :is="More" /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>操作1</el-dropdown-item>
                <el-dropdown-item>操作2</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
