<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
import { ElTag } from "element-plus";
defineOptions({
  name: "PgfAccount"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
import {
  getPgfAccountList,
  getCurrencyList,
  addPgfAccount,
  editPgfAccount,
  deleteBatchPgfAccount,
  unbindBatchPgfAccount,
  type PgfAccountListParams,
  type PgfAccountItem,
  type CurrencyItem,
  type AddPgfAccountParams,
  type EditPgfAccountParams
} from "@/api/game";
import { ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElRadioGroup, ElRadio } from "element-plus";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import More from "~icons/ep/more";

/*  -----搜索表单相关-----  */
// 币种列表（用于下拉选择）
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 初始化时获取币种列表
fetchCurrencyList();

// 搜索表单数据
const searchData = ref({
  id: "",
  wallet_type: "",
  type: "",
  bound_merchant: "",
  token: "",
  key: "",
  api_host: "",
  currency_id: "",
  status: "",
  createTime: [] as string[],
  updateTime: [] as string[]
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  // Row 1
  {
    label: "ID",
    renderLabel: () => t("merchant.pgfAccount.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.id")
    }))
  },
  {
    label: "钱包类型",
    renderLabel: () => t("merchant.pgfAccount.search.wallet_type"),
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.wallet_type")
    })),
    options: computed(() => [
      {
        label: t("merchant.pgfAccount.search.all"),
        value: ""
      },
      {
        label: t("merchant.pgfAccount.search.single"),
        value: "1"
      },
      {
        label: t("merchant.pgfAccount.search.transfer"),
        value: "2"
      }
    ])
  },
  {
    label: "账号类型",
    renderLabel: () => t("merchant.pgfAccount.search.type"),
    prop: "type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.type")
    })),
    options: computed(() => [
      {
        label: t("merchant.pgfAccount.search.all"),
        value: ""
      },
      {
        label: t("merchant.pgfAccount.search.formal"),
        value: "1"
      },
      {
        label: t("merchant.pgfAccount.search.test"),
        value: "2"
      }
    ])
  },
  {
    label: "币种",
    renderLabel: () => t("merchant.pgfAccount.search.currency_id"),
    prop: "currency_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.currency_id"),
      filterable: true
    })),
    options: computed(() => [
      {
        label: t("merchant.pgfAccount.search.all"),
        value: ""
      },
      ...currencyOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
  },
  {
    label: "绑定商户",
    renderLabel: () => t("merchant.pgfAccount.search.bound_merchant"),
    prop: "bound_merchant",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.bound_merchant")
    }))
  },
  // Row 2
  {
    label: "Token值",
    renderLabel: () => t("merchant.pgfAccount.search.token"),
    prop: "token",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.token")
    }))
  },
  {
    label: "API密钥",
    renderLabel: () => t("merchant.pgfAccount.search.key"),
    prop: "key",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.key")
    }))
  },
  {
    label: "API地址",
    renderLabel: () => t("merchant.pgfAccount.search.api_host"),
    prop: "api_host",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.api_host")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("merchant.pgfAccount.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.pgfAccount.search.status")
    })),
    options: computed(() => [
      {
        label: t("merchant.pgfAccount.search.all"),
        value: ""
      },
      {
        label: t("merchant.pgfAccount.search.normal"),
        value: "1"
      },
      {
        label: t("merchant.pgfAccount.search.hidden"),
        value: "-1"
      }
    ])
  },
  // Row 3
  {
    label: "创建时间",
    renderLabel: () => t("merchant.pgfAccount.search.createTime"),
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
  },
  {
    label: "更新时间",
    renderLabel: () => t("merchant.pgfAccount.search.updateTime"),
    prop: "updateTime",
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
    wallet_type: "",
    type: "",
    bound_merchant: "",
    token: "",
    key: "",
    api_host: "",
    currency_id: "",
    status: "",
    createTime: [],
    updateTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = PgfAccountItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("merchant.pgfAccount.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "钱包类型",
    renderHeader: () => t("merchant.pgfAccount.table.wallet_type"),
    prop: "wallet_type",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "warning"
      }, () => value === 1 ? t("merchant.pgfAccount.table.single") : value === 2 ? t("merchant.pgfAccount.table.transfer") : value);
    },
    width: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "账户类型",
    renderHeader: () => t("merchant.pgfAccount.table.type"),
    prop: "type",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "warning"
      }, () => value === 1 ? t("merchant.pgfAccount.table.formal") : value === 2 ? t("merchant.pgfAccount.table.test") : value);
    },
    width: 130,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    renderHeader: () => t("merchant.pgfAccount.table.currency_id"),
    prop: "currency_id",
    render: () => {
      // TODO: 币种字段需要从其他接口获取，暂时显示空
      return h("span", "PHP");
    },
    width: 110,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "绑定商户",
    renderHeader: () => t("merchant.pgfAccount.table.bound_merchant"),
    prop: "bound_merchant",
    render: () => {
      // TODO: 绑定商户字段需要从其他接口获取，暂时显示占位文本
      return h("span", "-");
    },
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "Token值",
    renderHeader: () => t("merchant.pgfAccount.table.token"),
    prop: "token",
    width: 300,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "API密钥",
    renderHeader: () => t("merchant.pgfAccount.table.key"),
    prop: "key",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
    {
    label: "API地址",
    renderHeader: () => t("merchant.pgfAccount.table.api_host"),
    prop: "api_host",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    renderHeader: () => t("merchant.pgfAccount.table.createtime"),
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    renderHeader: () => t("merchant.pgfAccount.table.updatetime"),
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
   {
    label: "状态",
    renderHeader: () => t("merchant.pgfAccount.table.status"),
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === "1" ? "success" : "danger"
      }, () => value === "1" ? t("merchant.pgfAccount.table.normal") : t("merchant.pgfAccount.table.hidden"));
    },
    tableColumnProps: {
       sortable: true,
       fixed: "right",
       align: "center"
    },
    width: 100,
  },
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("merchant.pgfAccount.buttons.edit"),
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEditRow(row);
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
      wallet_type, 
      type, 
      bound_merchant, 
      token, 
      key, 
      api_host, 
      currency_id,
      status, 
      createTime, 
      updateTime 
    } = searchData.value;
    
    const params: PgfAccountListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      wallet_type: wallet_type || undefined,
      type: type || undefined,
      token: token || undefined,
      key: key || undefined,
      api_host: api_host || undefined,
      currency_id: currency_id || undefined,
      status: status || undefined
    };

    // 处理创建时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }

    // 处理更新时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }

    const res = await getPgfAccountList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      tableData.value = res.data.rows;
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("merchant.pgfAccount.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("merchant.pgfAccount.message.getListFail"), { type: "error" });
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
const unbindLoading = ref(false);

// 对话框相关（统一新增和编辑）
const showDialog = ref(false);
const isEdit = ref(false);
const formRef = ref();
const formData = ref({
  id: 0,
  wallet_type: "",
  type: "",
  currency_id: "",
  api_host: "",
  token: "",
  key: "",
  status: "1"
});
const formRules = {
  wallet_type: [
    { required: true, message: t("merchant.pgfAccount.form.walletTypeRequired"), trigger: "change" }
  ]
};

// 对话框标题
const dialogTitle = computed(() => {
  return isEdit.value ? t("merchant.pgfAccount.edit.title") : t("merchant.pgfAccount.add.title");
});

// API地址选项（根据实际需求调整）
const apiHostOptions = ref([
  { label: "(正式) http://apiexternal12345", value: "http://apiexternal12345" },
  { label: "(测试) http://apiexternal.nmu2ga.com", value: "http://apiexternal.nmu2ga.com" },
  { label: "https://apiexternal.pgf-nmg2nd.com", value: "https://apiexternal.pgf-nmg2nd.com" }
]);

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    id: 0,
    wallet_type: "",
    type: "",
    currency_id: "",
    api_host: "",
    token: "",
    key: "",
    status: "1"
  };
  showDialog.value = true;
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("merchant.pgfAccount.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  
  // 查找PHP币种的ID（因为表格中显示的是PHP，但API响应中没有currency_id字段）
  const phpCurrency = currencyOptions.value.find(opt => opt.label === "PHP");
  const defaultCurrencyId = phpCurrency ? phpCurrency.value.toString() : "";
  
  // 回填数据
  formData.value = {
    id: row.id,
    wallet_type: row.wallet_type.toString(),
    type: row.type.toString(),
    currency_id: defaultCurrencyId, // 默认设置为PHP币种
    api_host: row.api_host || "",
    token: row.token || "",
    key: row.key || "",
    status: row.status || "1"
  };
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  formData.value = {
    id: 0,
    wallet_type: "",
    type: "",
    currency_id: "",
    api_host: "",
    token: "",
    key: "",
    status: "1"
  };
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          const params: EditPgfAccountParams = {
            id: formData.value.id,
            wallet_type: formData.value.wallet_type || undefined,
            type: formData.value.type || undefined,
            status: formData.value.status || undefined,
            token: formData.value.token || undefined,
            key: formData.value.key || undefined,
            api_host: formData.value.api_host || undefined
          };

          const res = await editPgfAccount(params);

          if (res.code === 0) {
            message(t("merchant.pgfAccount.message.editSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("merchant.pgfAccount.message.editFail"), { type: "error" });
          }
        } else {
          // 新增
          const params: AddPgfAccountParams = {
            wallet_type: formData.value.wallet_type,
            type: formData.value.type || undefined,
            status: formData.value.status,
            token: formData.value.token || undefined,
            key: formData.value.key || undefined,
            api_host: formData.value.api_host || undefined
          };

          const res = await addPgfAccount(params);

          if (res.code === 0) {
            message(t("merchant.pgfAccount.message.addSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("merchant.pgfAccount.message.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        console.error(isEdit.value ? "编辑PGF账号失败:" : "新增PGF账号失败:", error);
        message(error?.message || (isEdit.value ? t("merchant.pgfAccount.message.editFail") : t("merchant.pgfAccount.message.addFail")), { type: "error" });
      }
    }
  });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.pgfAccount.message.selectToDelete"), { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const accountIds = multipleSelection.value.map(item => item.id).join("、");
  const confirmMessage = t("merchant.pgfAccount.message.confirmDelete", { ids: accountIds });

  try {
    await ElMessageBox.confirm(confirmMessage, t("merchant.pgfAccount.delete.title"), {
      confirmButtonText: t("merchant.pgfAccount.buttons.confirm"),
      cancelButtonText: t("merchant.pgfAccount.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的账号
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchPgfAccount({ ids });

      if (res.code === 0) {
        message(t("merchant.pgfAccount.message.deleteSuccess"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || t("merchant.pgfAccount.message.deleteFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || t("merchant.pgfAccount.message.deleteFail"), { type: "error" });
    } finally {
      deleteLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
    }
  }
};

// 解绑商户
const handleUnbindMerchant = async () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.pgfAccount.message.selectToUnbind"), { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(t("merchant.pgfAccount.message.confirmUnbind"), t("merchant.pgfAccount.unbind.title"), {
      confirmButtonText: t("merchant.pgfAccount.buttons.confirm"),
      cancelButtonText: t("merchant.pgfAccount.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    unbindLoading.value = true;
    try {
      // 批量解绑选中的账号
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await unbindBatchPgfAccount({ ids });

      if (res.code === 0) {
        message(t("merchant.pgfAccount.message.unbindSuccess"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || t("merchant.pgfAccount.message.unbindFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("解绑失败:", error);
      message(error?.message || t("merchant.pgfAccount.message.unbindFail"), { type: "error" });
    } finally {
      unbindLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("解绑失败:", error);
    }
  }
};

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.pgfAccount.message.selectToExport"), { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value.map((col: any) => col.label);
  const exportProps = tableConfig.value.map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        return item.status === "1" ? t("merchant.pgfAccount.table.normal") : t("merchant.pgfAccount.table.hidden");
      }
      if (prop === "wallet_type") {
        return item.wallet_type === 1 ? t("merchant.pgfAccount.table.single") : item.wallet_type === 2 ? t("merchant.pgfAccount.table.transfer") : item.wallet_type;
      }
      if (prop === "type") {
        return item.type === 1 ? t("merchant.pgfAccount.table.formal") : item.type === 2 ? t("merchant.pgfAccount.table.test") : item.type;
      }
      if (prop === "currency_id" || prop === "bound_merchant") {
        // 这些字段不在API响应中，导出时显示占位文本
        return prop === "currency_id" ? "PHP" : t("merchant.pgfAccount.table.boundMerchantPlaceholder");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("merchant.pgfAccount.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("merchant.pgfAccount.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.pgfAccount.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("merchant.pgfAccount.export.jsonFileName");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="pgf-account-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="130"
        label-position="right"
        :has-unfold="false"
        :searchText="t('merchant.pgfAccount.buttons.search')"
        :resetText="t('merchant.pgfAccount.buttons.reset')"
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
        :action-bar="{
          buttons,
          width: '150px',
          label: t('merchant.pgfAccount.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.pgfAccount.buttons.add') }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.pgfAccount.buttons.edit') }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.pgfAccount.buttons.delete') }}</span>
          </el-button>
          <el-button 
            type="warning" 
            @click="handleUnbindMerchant" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="unbindLoading"
          >
            <span>{{ t('merchant.pgfAccount.buttons.unbind') }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('merchant.pgfAccount.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('merchant.pgfAccount.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('merchant.pgfAccount.toolbar.hideSearch') : t('merchant.pgfAccount.toolbar.showSearch')"
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
          <el-tooltip :content="t('merchant.pgfAccount.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 新增/编辑PGF账号对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="dialog-form"
      >
        <el-form-item :label="t('merchant.pgfAccount.form.wallet_type')" prop="wallet_type">
          <el-select
            v-model="formData.wallet_type"
            :placeholder="t('placeholder.select')"
            style="width: 100%"
          >
            <el-option :label="t('merchant.pgfAccount.form.single')" value="1" />
            <el-option :label="t('merchant.pgfAccount.form.transfer')" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.pgfAccount.form.type')" prop="type">
          <el-select
            v-model="formData.type"
            :placeholder="t('placeholder.select')"
            style="width: 100%"
          >
            <el-option :label="t('merchant.pgfAccount.form.formal')" value="1" />
            <el-option :label="t('merchant.pgfAccount.form.test')" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.pgfAccount.form.currency_id')" prop="currency_id">
          <el-select
            v-model="formData.currency_id"
            :placeholder="t('placeholder.select')"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in currencyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.pgfAccount.form.api_host')" prop="api_host">
          <el-select
            v-model="formData.api_host"
            :placeholder="t('placeholder.select')"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="item in apiHostOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.pgfAccount.form.token')" prop="token">
          <el-input
            v-model="formData.token"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.pgfAccount.form.key')" prop="key">
          <el-input
            v-model="formData.key"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.pgfAccount.form.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">{{ t('merchant.pgfAccount.form.open') }}</el-radio>
            <el-radio label="-1">{{ t('merchant.pgfAccount.form.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t('merchant.pgfAccount.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ t('merchant.pgfAccount.buttons.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pgf-account-container {
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
  padding-right: 20px;
}
</style>

