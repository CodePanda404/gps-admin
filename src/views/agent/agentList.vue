<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "AgentList"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElTooltip, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import {
  getAgentList,
  switchAgentStatus,
  type AgentListParams,
  type AgentItem
} from "@/api/agent";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  username: "",
  nickname: "",
  email: "",
  merchant: "",
  whitelist_ip: "",
  loginTime: null as string[] | null,
  createTime: null as string[] | null,
  status: ""
});
// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "代理账号",
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入代理账号"
    }))
  },
  {
    label: "昵称",
    prop: "nickname",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入昵称"
    }))
  },
  {
    label: "关联邮箱",
    prop: "email",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入关联邮箱"
    }))
  },
  {
    label: "关联商户",
    prop: "merchant",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入关联商户"
    }))
  },
  {
    label: "白名单IP",
    prop: "whitelist_ip",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入白名单IP"
    }))
  },
  {
    label: "登录时间",
    prop: "loginTime",
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
  },
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择状态"
    })),
    options: [
      {
        label: "全部",
        value: ""
      },
      {
        label: "正常",
        value: "normal"
      },
      {
        label: "隐藏",
        value: "hidden"
      }
    ]
  }
];

// 点击搜索按钮
const handleSearch = () => {
  // 重置到第一页
  pageInfo.value.page = 1;
  // 重新获取数据
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    id: "",
    username: "",
    nickname: "",
    email: "",
    merchant: "",
    whitelist_ip: "",
    loginTime: null,
    createTime: null,
    status: ""
  };
  // 重置到第一页
  pageInfo.value.page = 1;
  // 重新获取数据
  getList();
};

// 新增按钮处理
const handleAdd = () => {
  // TODO: 实现新增功能
  message("新增功能待实现", { type: "info" });
};

// 编辑按钮处理
const handleEdit = (row: TableRow) => {
  // TODO: 实现编辑功能
  message("编辑功能待实现", { type: "info" });
};

// /  *----表格相关-----  */ */
// 表格数据类型
type TableRow = AgentItem;
// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "代理账号",
    prop: "username",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "昵称",
    prop: "nickname",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "正式商户数",
    prop: "merchant_pro_num",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "测试商户数",
    prop: "merchant_test_num",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "关联邮箱",
    prop: "email",
    minWidth: 150,
    render: () => "-",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "谷歌验证",
    prop: "google_verify",
    minWidth: 120,
    render: () => "-",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "关联商户",
    prop: "merchant",
    minWidth: 150,
    render: () => "-",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "白名单IP",
    prop: "whitelist_ip",
    minWidth: 150,
    render: () => "-",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "最近登录时间",
    prop: "last_login_time",
    minWidth: 160,
    render: () => "-",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    prop: "createtime",
    minWidth: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    prop: "status",
    valueType: "switch",
    editable: true,
    fieldProps: {
      activeValue: "normal",
      inactiveValue: "hidden"
    },
    tableColumnProps: {
      sortable: true,
      fixed: "right",
      align: "center"
    }
  },
  {
    label: "操作",
    prop: "action",
    width: 100,
    tableColumnProps: {
      align: "center",
      fixed: "right"
    },
    render: (_value: any, row: TableRow) => {
      return h(
        ElButton,
        {
          type: "success",
          size: "small",
          link: true,
          onClick: () => handleEdit(row)
        },
        () => "编辑"
      );
    }
  }
]);

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 代理状态切换处理
const handleStatusChange = async (params: {
  row: TableRow;
  prop: string;
  value: any;
}) => {
  const { row, prop, value } = params;
  // 只处理状态字段的变化
  if (prop !== "status") {
    return;
  }

  // 检查 row 是否存在
  if (!row) {
    console.error("行数据不存在");
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  // 原始状态
  const originalStatus = value === "normal" ? "hidden" : "normal";

  // 提示文字
  const confirmMessage =
    value === "normal"
      ? `是否确定将代理${row.username}设置为正常状态?`
      : `是否确定将代理${row.username}设置为隐藏状态?`;

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

    const res = await switchAgentStatus({
      id: row.id,
      status: value
    });

    if (res.code === 0) {
      message(value === "normal" ? "代理已设置为正常状态" : "代理已设置为隐藏状态", {
        type: "success"
      });
      // 更新本地数据
      tableData.value[index] = {
        ...tableData.value[index],
        status: value
      };
    } else {
      // 失败恢复
      tableData.value[index] = {
        ...tableData.value[index],
        status: originalStatus
      };
      message(res.msg || "代理状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    // 取消或出错恢复
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
    const { username, loginTime, createTime, status } = searchData.value;
    const params: AgentListParams = {
      pageNumber: page,
      pageSize,
      username: username || undefined,
      status: status || undefined
    };

    if (loginTime && loginTime.length === 2) {
      params.login_start_time = loginTime[0];
      params.login_end_time = loginTime[1];
    }

    // 注意：API中没有创建时间的参数，这里暂时不处理
    // if (createTime && createTime.length === 2) {
    //   params.create_start_time = createTime[0];
    //   params.create_end_time = createTime[1];
    // }

    const { data } = await getAgentList(params);

    if (data && data.rows) {
      tableData.value = data.rows;
      total.value = data.total;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
    tableData.value = [];
  } finally {
    loadingStatus.value = false;
  }
};

// 初始化加载数据
getList();

// 分页处理
const handlePageChange = (val: any) => {
  pageInfo.value = val;
  getList();
};

// 导出Excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }
  const exportTitles = tableConfig.value.map((col: any) => col.label);
  const exportProps = tableConfig.value.map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: any) => {
    return exportProps.map(prop => {
      // 处理特殊字段
      if (prop === "status") {
        return item.status === "normal" ? "正常" : "隐藏";
      }
      return item[prop] ?? "";
    });
  });

  res.unshift(exportTitles);
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "数据报表";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `代理列表.xlsx`;
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
  a.download = "代理列表.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="agent-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card" shadow="never" style="margin: 20px">
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
        :stripe="true"
        :is-selection="true"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
        @formChange="handleStatusChange"
      >
        <!-- 工具栏 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">新增</span>
          </el-button>
        </template>
        <template #density-icon>
          <el-tooltip content="密度" placement="top">
            <el-icon
              :size="18"
              style="margin-right: 15px; cursor: pointer; outline: none"
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
              style="margin-right: 5px; cursor: pointer; outline: none"
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
                style="margin-right: 15px; cursor: pointer; outline: none"
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
                  style="margin-right: 15px; cursor: pointer; outline: none"
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

/* 下拉选项：上下排列+占满宽度+取消默认间距 */
.custom-export-dropdown .el-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0 !important;
  text-align: center;
  border-radius: 0;
}

/* Json 选项高亮：蓝色背景+白色文字 */
.custom-export-dropdown .export-active {
  color: #fff !important;
  background-color: #1677ff !important; /* Element Plus 主题蓝色 */
}

/* 鼠标 hover 效果（可选） */
.custom-export-dropdown .el-dropdown-item:not(.export-active):hover {
  background-color: #f5f7fa !important;
}
</style>

