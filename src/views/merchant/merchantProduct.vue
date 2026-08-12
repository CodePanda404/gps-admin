<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "MerchantProduct"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
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
    renderLabel: () => t("merchant.merchantProduct.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.id")
    }))
  },
  {
    label: "商户ID",
    renderLabel: () => t("merchant.merchantProduct.search.merchant_id"),
    prop: "merchant_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.merchant_id")
    }))
  },
  {
    label: "商户名",
    renderLabel: () => t("merchant.merchantProduct.search.merchant_name"),
    prop: "merchant_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.merchant_name")
    }))
  },
  {
    label: "产品ID",
    renderLabel: () => t("merchant.merchantProduct.search.product_code"),
    prop: "product_code",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.product_code")
    }))
  },
  {
    label: "产品",
    renderLabel: () => t("merchant.merchantProduct.search.type_name"),
    prop: "type_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.type_name")
    }))
  },
  {
    label: "产品全称",
    renderLabel: () => t("merchant.merchantProduct.search.product_name"),
    prop: "product_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.product_name")
    }))
  },
  {
    label: "钱包类型",
    renderLabel: () => t("merchant.merchantProduct.search.wallet_type"),
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.wallet_type")
    })),
    options: computed(() => [
      { label: t("merchant.merchantProduct.search.all"), value: "" },
      { label: t("merchant.merchantProduct.search.single"), value: "1" },
      { label: t("merchant.merchantProduct.search.transfer"), value: "2" }
    ])
  },
  {
    label: "币种",
    renderLabel: () => t("merchant.merchantProduct.search.currency"),
    prop: "currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.currency")
    }))
  },
  {
    label: "钱包支持情况",
    renderLabel: () => t("merchant.merchantProduct.search.support_state"),
    prop: "support_state",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.support_state")
    }))
  },
  {
    label: "更新时间",
    renderLabel: () => t("merchant.merchantProduct.search.updateTime"),
    prop: "updateTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: t("merchant.merchantProduct.search.startDateTime"),
      endPlaceholder: t("merchant.merchantProduct.search.endDateTime"),
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
  },
  {
    label: "状态",
    renderLabel: () => t("merchant.merchantProduct.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.merchantProduct.search.status")
    })),
    options: computed(() => [
      { label: t("merchant.merchantProduct.search.all"), value: "" },
      { label: t("merchant.merchantProduct.search.normal"), value: "1" },
      { label: t("merchant.merchantProduct.search.hidden"), value: "-1" },
      { label: t("merchant.merchantProduct.search.maintenance"), value: "0" }
    ])
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
    renderHeader: () => t("merchant.merchantProduct.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "商户ID",
    renderHeader: () => t("merchant.merchantProduct.table.merchant_id"),
    prop: "merchant_id",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "商户名",
    renderHeader: () => t("merchant.merchantProduct.table.merchant_name"),
    prop: "merchant_name",
    tableColumnProps: {
      align: "center"
    },
    width: 130
  },
  {
    label: "产品",
    renderHeader: () => t("merchant.merchantProduct.table.type_name"),
    prop: "type_name",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "产品全称",
    renderHeader: () => t("merchant.merchantProduct.table.product_name"),
    prop: "product_name",
    tableColumnProps: {
      align: "center"
    },
    width: 150
  },
  {
    label: "产品ID",
    renderHeader: () => t("merchant.merchantProduct.table.product_code"),
    prop: "product_code",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "钱包类型",
    renderHeader: () => t("merchant.merchantProduct.table.wallet_type"),
    prop: "wallet_type",
    render: (value: string | number) => {
      if (value === "1" || value === 1) return t("merchant.merchantProduct.table.single");
      if (value === "2" || value === 2) return t("merchant.merchantProduct.table.transfer");
      return value || "-";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "币种",
    renderHeader: () => t("merchant.merchantProduct.table.currency"),
    prop: "currency",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "游戏类型",
    renderHeader: () => t("merchant.merchantProduct.table.game_type"),
    prop: "game_type",
    tableColumnProps: {
      align: "center"
    },
    width: 200
  },
  {
    label: "钱包支持情况",
    renderHeader: () => t("merchant.merchantProduct.table.support_state"),
    prop: "support_state",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "价格",
    renderHeader: () => t("merchant.merchantProduct.table.price"),
    prop: "price",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "代理价格",
    renderHeader: () => t("merchant.merchantProduct.table.agent_price"),
    prop: "agent_price",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "创建时间",
    renderHeader: () => t("merchant.merchantProduct.table.createtime"),
    prop: "createtime",
    tableColumnProps: {
      align: "center"
    },
    width: 160
  },
  {
    label: "更新时间",
    renderHeader: () => t("merchant.merchantProduct.table.updatetime"),
    prop: "updatetime",
    tableColumnProps: {
      align: "center"
    },
    width: 160
  },
  {
    label: "状态",
    renderHeader: () => t("merchant.merchantProduct.table.status"),
    prop: "status",
    render: (value: string) => {
      let type: "success" | "warning" | "danger" | "info" = "info";
      let label = value;
      if (value === "1") {
        type = "success";
        label = t("merchant.merchantProduct.table.normal");
      } else if (value === "-1") {
        type = "warning";
        label = t("merchant.merchantProduct.table.hidden");
      } else if (value === "0") {
        type = "danger";
        label = t("merchant.merchantProduct.table.maintenance");
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
    text: () => t("merchant.merchantProduct.buttons.edit"),
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
    text: () => t("merchant.merchantProduct.buttons.delete"),
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
      message(res.msg || t("merchant.merchantProduct.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("merchant.merchantProduct.message.getListFail"), { type: "error" });
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
    { required: true, message: t("merchant.merchantProduct.form.typeNameRequired"), trigger: "blur" }
  ],
  merchant_id: [
    { required: true, message: t("merchant.merchantProduct.form.merchantIdRequired"), trigger: "blur" }
  ],
  merchant_name: [
    { required: true, message: t("merchant.merchantProduct.form.merchantNameRequired"), trigger: "blur" }
  ],
  currency: [
    { required: true, message: t("merchant.merchantProduct.form.currencyRequired"), trigger: "blur" }
  ],
  price: [
    { required: true, message: t("merchant.merchantProduct.form.priceRequired"), trigger: "blur" }
  ],
  agent_price: [
    { required: true, message: t("merchant.merchantProduct.form.agentPriceRequired"), trigger: "blur" }
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
          message(t("merchant.merchantProduct.message.addNotOpen"), { type: "info" });
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
          message(t("merchant.merchantProduct.message.editSuccess"), { type: "success" });
          handleCloseDialog();
          getList();
        } else {
          message(res.msg || t("merchant.merchantProduct.message.editFail"), { type: "error" });
        }
      } catch (error: any) {
        console.error("编辑失败:", error);
        message(error?.message || t("merchant.merchantProduct.message.editFail"), { type: "error" });
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("merchant.merchantProduct.message.selectOneToEdit"), { type: "warning" });
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
  const confirmMessage = t("merchant.merchantProduct.message.confirmDelete", { name: row.product_name });

  try {
    await ElMessageBox.confirm(confirmMessage, t("merchant.merchantProduct.delete.title"), {
      confirmButtonText: t("merchant.merchantProduct.buttons.confirm"),
      cancelButtonText: t("merchant.merchantProduct.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      const res = await deleteBatchMerchantProduct({ ids: row.id.toString() });

      if (res.code === 0) {
        message(t("merchant.merchantProduct.message.deleteSuccess"), { type: "success" });
        getList();
      } else {
        message(res.msg || t("merchant.merchantProduct.message.deleteFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || t("merchant.merchantProduct.message.deleteFail"), { type: "error" });
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
    message(t("merchant.merchantProduct.message.selectToDelete"), { type: "warning" });
    return;
  }

  const confirmMessage = t("merchant.merchantProduct.message.confirmBatchDelete", { count: multipleSelection.value.length });

  try {
    await ElMessageBox.confirm(confirmMessage, t("merchant.merchantProduct.delete.batchTitle"), {
      confirmButtonText: t("merchant.merchantProduct.buttons.confirm"),
      cancelButtonText: t("merchant.merchantProduct.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchMerchantProduct({ ids });

      if (res.code === 0) {
        message(t("merchant.merchantProduct.message.deleteSuccess"), { type: "success" });
        getList();
      } else {
        message(res.msg || t("merchant.merchantProduct.message.deleteFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || t("merchant.merchantProduct.message.deleteFail"), { type: "error" });
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
    message(t("merchant.merchantProduct.message.selectToTest"), { type: "warning" });
    return;
  }

  const product = multipleSelection.value[0];
  const confirmMessage = t("merchant.merchantProduct.message.confirmTest", { name: product.product_name });

  try {
    await ElMessageBox.confirm(confirmMessage, t("merchant.merchantProduct.test.title"), {
      confirmButtonText: t("merchant.merchantProduct.buttons.confirm"),
      cancelButtonText: t("merchant.merchantProduct.buttons.cancel"),
      draggable: true,
      type: "success"
    });

    testGameLoading.value = true;
    try {
      const res = await testMerchantProduct({ id: product.id });

      if (res.code === 0) {
        message(t("merchant.merchantProduct.message.testSuccess"), { type: "success" });
        // 如果响应中有游戏URL，可以打开
        if (res.data && (res.data as any).game_url) {
          window.open((res.data as any).game_url, "_blank");
        }
      } else {
        message(res.msg || t("merchant.merchantProduct.message.testFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("测试游戏失败:", error);
      message(error?.message || t("merchant.merchantProduct.message.testFail"), { type: "error" });
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
        if (item.status === "1") return t("merchant.merchantProduct.table.normal");
        if (item.status === "-1") return t("merchant.merchantProduct.table.hidden");
        if (item.status === "0") return t("merchant.merchantProduct.table.maintenance");
      }
      if (prop === "wallet_type") {
        if (item.wallet_type === 1) return t("merchant.merchantProduct.table.single");
        if (item.wallet_type === 2) return t("merchant.merchantProduct.table.transfer");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("merchant.merchantProduct.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("merchant.merchantProduct.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.merchantProduct.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("merchant.merchantProduct.export.jsonFileName");
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
        label-width="130"
        inline
        label-position="right"
        :has-unfold="false"
        :searchText="t('merchant.merchantProduct.buttons.search')"
        :resetText="t('merchant.merchantProduct.buttons.reset')"
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
          label: t('merchant.merchantProduct.table.action')
        }"
        @selection-change="handleSelectionChange"
        width="100%"
        height="90%"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.merchantProduct.buttons.add') }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.merchantProduct.buttons.edit') }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleBatchDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.merchantProduct.buttons.delete') }}</span>
          </el-button>
          <el-button 
            @click="handleTestGame" 
            type="info" 
            size="default"
            :disabled="multipleSelection.length !== 1"
            :loading="testGameLoading"
          >
            <span>{{ t('merchant.merchantProduct.buttons.test') }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('merchant.merchantProduct.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('merchant.merchantProduct.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('merchant.merchantProduct.toolbar.hideSearch') : t('merchant.merchantProduct.toolbar.showSearch')"
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
          <el-tooltip :content="t('merchant.merchantProduct.toolbar.export')" placement="top" :trigger="'hover'">
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
      :title="isEditMode ? t('merchant.merchantProduct.edit.title') : t('merchant.merchantProduct.add.title')"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        class="dialog-form"
      >
        <el-form-item :label="t('merchant.merchantProduct.form.type_name')" prop="type_name">
          <el-input
            v-model="formData.type_name"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.merchantProduct.form.merchant_id')" prop="merchant_id">
          <el-input
            v-model="formData.merchant_id"
            :placeholder="t('placeholder.input')"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.merchantProduct.form.merchant_name')" prop="merchant_name">
          <el-input
            v-model="formData.merchant_name"
            :placeholder="t('placeholder.input')"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.merchantProduct.form.currency')" prop="currency">
          <el-input
            v-model="formData.currency"
            :placeholder="t('placeholder.input')"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.merchantProduct.form.price')" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            style="width: 100%"
            :placeholder="t('placeholder.input')"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.merchantProduct.form.agent_price')" prop="agent_price">
          <el-input-number
            v-model="formData.agent_price"
            :min="0"
            :precision="2"
            style="width: 100%"
            :placeholder="t('placeholder.input')"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.merchantProduct.form.status')">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">{{ t('merchant.merchantProduct.form.open') }}</el-radio>
            <el-radio label="0">{{ t('merchant.merchantProduct.form.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t('merchant.merchantProduct.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ t('merchant.merchantProduct.buttons.confirm') }}
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
