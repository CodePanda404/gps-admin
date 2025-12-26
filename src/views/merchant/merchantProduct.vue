<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "MerchantProduct"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElTooltip, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElRadioGroup, ElRadio, ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import {
  getMerchantProductList,
  editMerchantProduct,
  deleteBatchMerchantProduct,
  testMerchantProduct,
  type MerchantProductListParams,
  type MerchantProductItem,
  type EditMerchantProductParams
} from "@/api/agent";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  merchant_id: "",
  merchant_name: "",
  type_name: "",
  product_name: "",
  product_code: "",
  wallet_type: "",
  currency: "",
  support_state: "",
  updateTime: [] as string[],
  status: ""
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
      placeholder: "请输入ID"
    }))
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "商户名",
    prop: "merchant_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户名"
    }))
  },
  {
    label: "产品ID",
    prop: "product_code",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品ID"
    }))
  },
  {
    label: "产品",
    prop: "type_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品"
    }))
  },
  {
    label: "产品全称",
    prop: "product_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品全称"
    }))
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择钱包类型"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "单一模式", value: "1" },
      { label: "转账模式", value: "2" }
    ]
  },
  {
    label: "币种",
    prop: "currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入币种"
    }))
  },
  {
    label: "钱包支持情况",
    prop: "support_state",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入钱包支持情况"
    }))
  },
  {
    label: "更新时间",
    prop: "updateTime",
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
      { label: "全部", value: "" },
      { label: "正常", value: "1" },
      { label: "隐藏", value: "-1" },
      { label: "维护", value: "0" }
    ]
  }
];

// 点击搜索按钮
const handleSearch = () => {
  pageInfo.value.page = 1;
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    id: "",
    merchant_id: "",
    merchant_name: "",
    type_name: "",
    product_name: "",
    product_code: "",
    wallet_type: "",
    currency: "",
    support_state: "",
    updateTime: [],
    status: ""
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = MerchantProductItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户名",
    prop: "merchant_name",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "产品",
    prop: "type_name",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "产品全称",
    prop: "product_name",
    tableColumnProps: {
      align: "center"
    },
    width: 150
  },
  {
    label: "产品ID",
    prop: "product_code",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    render: (value: string | number) => {
      if (value === "1" || value === 1) return "单一模式";
      if (value === "2" || value === 2) return "转账模式";
      return value || "-";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "币种",
    prop: "currency",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "游戏类型",
    prop: "game_type",
    tableColumnProps: {
      align: "center"
    },
    width: 200
  },
  {
    label: "钱包支持情况",
    prop: "support_state",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "价格",
    prop: "price",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "代理价格",
    prop: "agent_price",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "创建时间",
    prop: "createtime",
    tableColumnProps: {
      align: "center"
    },
    width: 160
  },
  {
    label: "更新时间",
    prop: "updatetime",
    tableColumnProps: {
      align: "center"
    },
    width: 160
  },
  {
    label: "状态",
    prop: "status",
    render: (value: string) => {
      let type: "success" | "warning" | "danger" | "info" = "info";
      let label = value;
      if (value === "1") {
        type = "success";
        label = "正常";
      } else if (value === "-1") {
        type = "warning";
        label = "隐藏";
      } else if (value === "0") {
        type = "danger";
        label = "维护";
      }
      return h(ElTag, { type }, () => label);
    },
    tableColumnProps: {
      align: "center",
      fixed: "right"
    },
    width: 100
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: "编辑",
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEditRow(row);
    }
  },
  {
    text: "删除",
    code: "delete",
    props: {
      type: "danger"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleDeleteRow(row);
    }
  }
];

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const {
      id,
      merchant_id,
      type_name,
      currency,
      updateTime,
      status
    } = searchData.value;

    const params: MerchantProductListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      merchant_id: merchant_id || undefined,
      type_name: type_name || undefined,
      status: status || undefined,
      currency: currency || undefined
    };

    // 处理更新时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }

    const res = await getMerchantProductList(params);

    if (res.code === 0 && res.data && res.data.rows) {
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

// 操作按钮 loading 状态
const deleteLoading = ref(false);
const testGameLoading = ref(false);
const submitLoading = ref(false);

// 编辑对话框相关
const showDialog = ref(false);
const isEditMode = ref(false);
const formRef = ref();
const formData = ref({
  id: 0,
  type_name: "",
  merchant_id: "",
  merchant_name: "",
  currency: "",
  price: "",
  agent_price: "",
  status: "1"
});

const formRules = {
  type_name: [
    { required: true, message: "请输入产品", trigger: "blur" }
  ],
  merchant_id: [
    { required: true, message: "请输入商户ID", trigger: "blur" }
  ],
  merchant_name: [
    { required: true, message: "请输入商户名称", trigger: "blur" }
  ],
  currency: [
    { required: true, message: "请输入币种", trigger: "blur" }
  ],
  price: [
    { required: true, message: "请输入商户点位", trigger: "blur" }
  ],
  agent_price: [
    { required: true, message: "请输入代理点位", trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  isEditMode.value = false;
  formData.value = {
    id: 0,
    type_name: "",
    merchant_id: "",
    merchant_name: "",
    currency: "",
    price: "",
    agent_price: "",
    status: "1"
  };
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  formData.value = {
    id: 0,
    type_name: "",
    merchant_id: "",
    merchant_name: "",
    currency: "",
    price: "",
    agent_price: "",
    status: "1"
  };
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 目前只有编辑接口，新增功能暂时提示
        if (!isEditMode.value) {
          message("新增功能暂未开放", { type: "info" });
          return;
        }

        const params: EditMerchantProductParams = {
          id: formData.value.id,
          type_name: formData.value.type_name,
          currency: formData.value.currency,
          price: formData.value.price,
          agent_price: formData.value.agent_price
        };

        const res = await editMerchantProduct(params);

        if (res.code === 0) {
          message("编辑成功", { type: "success" });
          handleCloseDialog();
          getList();
        } else {
          message(res.msg || "编辑失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("编辑失败:", error);
        message(error?.message || "编辑失败", { type: "error" });
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message("请选择一条数据进行编辑！", { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEditMode.value = true;
  formData.value = {
    id: row.id,
    type_name: row.type_name || "",
    merchant_id: row.merchant_id ? String(row.merchant_id) : "",
    merchant_name: row.merchant_name || "",
    currency: row.currency || "",
    price: row.price || "",
    agent_price: row.agent_price || "",
    status: row.status || "1"
  };
  showDialog.value = true;
};

// 删除单行数据
const handleDeleteRow = async (row: TableRow) => {
  const confirmMessage = `确定删除产品 ${row.product_name}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除产品", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      const res = await deleteBatchMerchantProduct({ ids: row.id.toString() });

      if (res.code === 0) {
        message("删除成功", { type: "success" });
        getList();
      } else {
        message(res.msg || "删除失败", { type: "error" });
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
    } finally {
      deleteLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要删除的数据！", { type: "warning" });
    return;
  }

  const productNames = multipleSelection.value.map(item => item.product_name).join("、");
  const confirmMessage = `确定删除选中的 ${multipleSelection.value.length} 条产品数据？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "批量删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchMerchantProduct({ ids });

      if (res.code === 0) {
        message("删除成功", { type: "success" });
        getList();
      } else {
        message(res.msg || "删除失败", { type: "error" });
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
    } finally {
      deleteLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
    }
  }
};

// 测试游戏（单一钱包）
const handleTestGame = async () => {
  if (multipleSelection.value.length !== 1) {
    message("请选择一条数据进行测试！", { type: "warning" });
    return;
  }

  const product = multipleSelection.value[0];
  const confirmMessage = `是否确定测试产品 ${product.product_name} 的游戏？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "测试游戏", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "success"
    });

    testGameLoading.value = true;
    try {
      const res = await testMerchantProduct({ id: product.id });

      if (res.code === 0) {
        message("测试游戏成功", { type: "success" });
        // 如果响应中有游戏URL，可以打开
        if (res.data && (res.data as any).game_url) {
          window.open((res.data as any).game_url, "_blank");
        }
      } else {
        message(res.msg || "测试游戏失败", { type: "error" });
      }
    } catch (error: any) {
      console.error("测试游戏失败:", error);
      message(error?.message || "测试游戏失败", { type: "error" });
    } finally {
      testGameLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("测试游戏失败:", error);
    }
  }
};

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value
    .filter((col: any) => col.prop !== "action")
    .map((col: any) => col.label);
  const exportProps = tableConfig.value
    .filter((col: any) => col.prop !== "action")
    .map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        if (item.status === "1") return "正常";
        if (item.status === "-1") return "隐藏";
        if (item.status === "0") return "维护";
      }
      if (prop === "wallet_type") {
        if (item.wallet_type === 1) return "单一模式";
        if (item.wallet_type === 2) return "转账模式";
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "商户产品列表";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `商户产品列表.xlsx`;
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
  a.download = "商户产品列表.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="merchant-product-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="110"
        inline
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
        :is-selection="true"
        :adaptive="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: '操作'
        }"
        @selection-change="handleSelectionChange"
        width="100%"
        height="90%"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">新增</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">编辑</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleBatchDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">删除</span>
          </el-button>
          <el-button 
            @click="handleTestGame" 
            type="info" 
            size="default"
            :disabled="multipleSelection.length !== 1"
            :loading="testGameLoading"
          >
            <span>测试游戏（单一钱包）</span>
          </el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑商户产品' : '新增商户产品'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="产品" prop="type_name">
          <el-input
            v-model="formData.type_name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="商户ID" prop="merchant_id">
          <el-input
            v-model="formData.merchant_id"
            placeholder="请输入"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="商户名称" prop="merchant_name">
          <el-input
            v-model="formData.merchant_name"
            placeholder="请输入"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-input
            v-model="formData.currency"
            placeholder="请输入"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item label="商户点位" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="代理点位" prop="agent_price">
          <el-input-number
            v-model="formData.agent_price"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.merchant-product-container {
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

.dialog-form {
  margin: 0 auto;
  padding-right: 30px;
}
</style>
