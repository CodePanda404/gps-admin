<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "MerchantList"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElTooltip, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import {
  getMerchantList,
  switchMerchantStatus,
  getAgentList,
  type MerchantListParams,
  type MerchantItem
} from "@/api/agent";
import {
  getCurrencyList,
  type CurrencyItem
} from "@/api/game";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";

/*  -----搜索表单相关-----  */
// 币种列表（用于下拉选择）
const currencyOptions = ref<Array<{ label: string; value: string }>>([]);
// 代理列表（用于下拉选择）
const agentOptions = ref<Array<{ label: string; value: string }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.name
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 获取代理列表
const fetchAgentList = async () => {
  try {
    const res = await getAgentList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      agentOptions.value = res.data.rows.map((item) => ({
        label: item.username,
        value: item.username
      }));
    }
  } catch (error: any) {
    console.error("获取代理列表失败:", error);
  }
};

// 初始化时获取列表
fetchCurrencyList();
fetchAgentList();

// 搜索表单数据
const searchData = ref({
  id: "",
  username: "",
  currency: "",
  type: "",
  wallet_type: "",
  wlg_account_id: "",
  pid: "",
  parent_name: "",
  status: ""
});
// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "商户ID",
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "商户名称",
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户名称"
    }))
  },
  {
    label: "币种",
    prop: "currency",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择币种",
      filterable: true
    })),
    options: computed(() => [
      {
        label: "全部",
        value: ""
      },
      ...currencyOptions.value
    ])
  },
  {
    label: "商户类型",
    prop: "type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择商户类型"
    })),
    options: [
      {
        label: "全部",
        value: ""
      },
      {
        label: "正式",
        value: "1"
      },
      {
        label: "测试",
        value: "2"
      }
    ]
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择钱包类型"
    })),
    options: [
      {
        label: "全部",
        value: ""
      },
      {
        label: "单一/免转",
        value: "1"
      },
      {
        label: "转账",
        value: "2"
      }
    ]
  },
  {
    label: "WLG账户ID",
    prop: "wlg_account_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入WLG账户ID"
    }))
  },
  {
    label: "关联产品",
    prop: "pid",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入关联产品ID"
    }))
  },
  {
    label: "所属代理",
    prop: "parent_name",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择所属代理",
      filterable: true
    })),
    options: computed(() => [
      {
        label: "全部",
        value: ""
      },
      ...agentOptions.value
    ])
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
    currency: "",
    type: "",
    wallet_type: "",
    wlg_account_id: "",
    pid: "",
    parent_name: "",
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

// 额度调整按钮处理
const handleCreditAdjust = (row: TableRow) => {
  // TODO: 实现额度调整功能
  message("额度调整功能待实现", { type: "info" });
};

// 调额记录按钮处理
const handleAdjustRecord = (row: TableRow) => {
  // TODO: 实现调额记录功能
  message("调额记录功能待实现", { type: "info" });
};

// 查看API秘钥按钮处理
const handleViewApiKey = (row: TableRow) => {
  // TODO: 实现查看API秘钥功能
  message("查看API秘钥功能待实现", { type: "info" });
};

// /  *----表格相关-----  */ */
// 表格数据类型
type TableRow = MerchantItem;
// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "商户ID",
    prop: "id",
    minWidth: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户名称",
    prop: "username",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户类型",
    prop: "type",
    minWidth: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    prop: "currency",
    minWidth: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "授信额度",
    prop: "credit_limit",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "授信余额",
    prop: "credit_balance",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "保证金余额",
    prop: "deposit_balance",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    },
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "API-KEY",
    prop: "api_key",
    minWidth: 150,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "WLG账号ID",
    prop: "wlg_account_id",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "关联产品",
    prop: "pid",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "所属代理",
    prop: "parent_name",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "角色组",
    prop: "groups_text",
    minWidth: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "登录时间",
    prop: "updatetime",
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
  }
]);

buttons.value = [
  {
    text: "额度调整",
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEdit(row);
    }
  },
  {
    text: "调额记录",
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEdit(row);
    }
  },
  {
    text: "编辑",
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEdit(row);
    }
  },
  {
    text: "查看API密钥",
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEdit(row);
    }
  }
];

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 商户状态切换处理
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
      ? `是否确定将商户${row.username}设置为正常状态?`
      : `是否确定将商户${row.username}设置为隐藏状态?`;

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

    const res = await switchMerchantStatus({
      id: row.id,
      status: value
    });

    if (res.code === 0) {
      message(value === "normal" ? "商户已设置为正常状态" : "商户已设置为隐藏状态", {
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
      message(res.msg || "商户状态切换失败", { type: "error" });
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
    const { id, username, currency, type, wallet_type, wlg_account_id, pid, parent_name, status } = searchData.value;
    const params: MerchantListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      username: username || undefined,
      currency: currency || undefined,
      type: type || undefined,
      wallet_type: wallet_type || undefined,
      pid: pid || undefined,
      status: status || undefined
    };

    // 注意：API中没有parent_name参数，这里暂时不处理
    // if (parent_name) {
    //   params.parent_name = parent_name;
    // }

    const { data } = await getMerchantList(params);

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
  const fileName = `商户列表.xlsx`;
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
  a.download = "商户列表.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="merchant-list-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="100"
        label-position="right"
        :has-unfold="false"
        searchText="搜索"
        resetText="重置"
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
         :action-bar="{
          showNumber: 4,
          buttons,
          width: '320px',
          label: '操作'
        }"
        :is-selection="true"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
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
.merchant-list-container {
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
