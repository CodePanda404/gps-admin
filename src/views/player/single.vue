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
import {
  getSinglePlayerList,
  lockSinglePlayer,
  type SinglePlayerListParams,
  type SinglePlayerItem
} from "@/api/player";
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

// 表格数据类型（直接使用后端字段）
type TableRow = SinglePlayerItem;

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
    prop: "username",
    width: "200"
  },
  {
    label: "余额",
    prop: "money"
  },
  {
    label: "币种",
    prop: "currency"
  },
  {
    label: "商户ID",
    prop: "admin_id"
  },
  {
    label: "登录时间",
    prop: "logintime",
    width: "160"
  },
  {
    label: "登录IP",
    prop: "loginip",  
    width: "140"
  },
  {
    label: "注册时间",
    prop: "jointime",
    width: "160"
  },
  {
    label: "注册IP",
    prop: "joinip",
    width: "140"
  },
  {
    label: "状态",
    prop: "status",
    valueType: "switch",
    editable: true,
    fieldProps: {
      activeValue: "normal",
      inactiveValue: "hidden"
    }
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
          playerId: row.id.toString(),
          playerName: row.username
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
  // 只处理玩家状态字段的变化
  if (prop !== "status") {
    return;
  }

  // 检查 row 是否存在
  if (!row) {
    console.error("行数据不存在");
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  // 目标状态 (value 是切换后的值)
  // value: Normal/Unlock-> type: 1
  // value: Disabled/Lock-> type: 2
  const targetType = value == 'normal' ? 1 : 2;
  // 原始状态
  const originalStatus = value == 'normal' ? 'hidden' : 'normal';

  // 提示文字
  const confirmMessage = value == 'normal'
    ? `是否确定将玩家${row.username}解锁?`
    : `是否确定将玩家${row.username}锁定?`

  // 查找当前行在 tableData 中的索引
  const index = tableData.value.findIndex(item => item.id === row.id);
  if (index === -1) {
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      draggable: true
    });

    const res = await lockSinglePlayer({
      id: row.id,
      type: targetType
    });

    if (res.code === 0) {
      message(value == 'normal' ? "玩家已解锁" : "玩家已锁定", {
        type: "success"
      });
      // 更新本地数据 - 通过更新 tableData 中对应的项来触发响应式更新
      tableData.value[index] = {
        ...tableData.value[index],
        status: res.data.status
      };
    } else {
      // 失败恢复 - 通过更新 tableData 中对应的项来触发响应式更新
      tableData.value[index] = {
        ...tableData.value[index],
        status: originalStatus
      };
      message(res.msg || "玩家状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    //取消或出错恢复 - 通过更新 tableData 中对应的项来触发响应式更新
    tableData.value[index] = {
      ...tableData.value[index],
      status: originalStatus
    };
    if (error !== "cancel") {
      console.error("状态切换失败:", error);
      message(error?.message || "状态切换失败", { type: "error" });
    }
  }
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, name, status, registerTime } = searchData.value;
    
    const params: SinglePlayerListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      username: name || undefined,
      status: status || undefined
    };

    // 处理时间范围
    if (registerTime && Array.isArray(registerTime) && registerTime.length === 2) {
      params.create_start_time = registerTime[0];
      params.create_end_time = registerTime[1];
    }

    const res = await getSinglePlayerList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      // 直接使用后端数据，无需转换
      tableData.value = res.data.rows;
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
