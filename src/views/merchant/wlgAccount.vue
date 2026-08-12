<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
import { ElSwitch, ElTag } from "element-plus";
defineOptions({
  name: "WlgAccount"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
import {
  getWlgAccountList,
  getCurrencyList,
  addWlgAccount,
  editWlgAccount,
  deleteBatchWlgAccount,
  unbindBatchWlgAccount,
  type WlgAccountListParams,
  type WlgAccountItem,
  type CurrencyItem,
  type AddWlgAccountParams,
  type EditWlgAccountParams
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
  dealer_name: "",
  bound_merchant: "",
  dealer_id: "",
  agent_id: "",
  key: "",
  api_host: "",
  dealer_account: "",
  dealer_pwd: "",
  agent_account: "",
  agent_pwd: "",
  sn_url: "",
  agent_url: "",
  remark: "",
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
    renderLabel: () => t("merchant.wlgAccount.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.id")
    }))
  },
  {
    label: "钱包类型",
    renderLabel: () => t("merchant.wlgAccount.search.wallet_type"),
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.wallet_type")
    })),
    options: computed(() => [
      {
        label: t("merchant.wlgAccount.search.all"),
        value: ""
      },
      {
        label: t("merchant.wlgAccount.search.single"),
        value: "1"
      },
      {
        label: t("merchant.wlgAccount.search.transfer"),
        value: "2"
      }
    ])
  },
  {
    label: "账号类型",
    renderLabel: () => t("merchant.wlgAccount.search.type"),
    prop: "type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.type")
    })),
    options: computed(() => [
      {
        label: t("merchant.wlgAccount.search.all"),
        value: ""
      },
      {
        label: t("merchant.wlgAccount.search.formal"),
        value: "1"
      },
      {
        label: t("merchant.wlgAccount.search.test"),
        value: "2"
      }
    ])
  },
    {
    label: "币种",
    renderLabel: () => t("merchant.wlgAccount.search.currency_id"),
    prop: "currency_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.currency_id"),
      filterable: true
    })),
    options: computed(() => [
      {
        label: t("merchant.wlgAccount.search.all"),
        value: ""
      },
      ...currencyOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
  },
  {
    label: "总社名称",
    renderLabel: () => t("merchant.wlgAccount.search.dealer_name"),
    prop: "dealer_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.dealer_name")
    }))
  },
  // Row 2
  {
    label: "绑定商户",
    renderLabel: () => t("merchant.wlgAccount.search.bound_merchant"),
    prop: "bound_merchant",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.bound_merchant")
    }))
  },
  {
    label: "总社ID",
    renderLabel: () => t("merchant.wlgAccount.search.dealer_id"),
    prop: "dealer_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.dealer_id")
    }))
  },
  {
    label: "代理ID",
    renderLabel: () => t("merchant.wlgAccount.search.agent_id"),
    prop: "agent_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.agent_id")
    }))
  },
  {
    label: "API密钥",
    renderLabel: () => t("merchant.wlgAccount.search.key"),
    prop: "key",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.key")
    }))
  },
  // Row 3
  {
    label: "API地址",
    renderLabel: () => t("merchant.wlgAccount.search.api_host"),
    prop: "api_host",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.api_host")
    }))
  },
  {
    label: "总社账号",
    renderLabel: () => t("merchant.wlgAccount.search.dealer_account"),
    prop: "dealer_account",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.dealer_account")
    }))
  },
  {
    label: "总社密码",
    renderLabel: () => t("merchant.wlgAccount.search.dealer_pwd"),
    prop: "dealer_pwd",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.dealer_pwd")
    }))
  },
  {
    label: "代理账号",
    renderLabel: () => t("merchant.wlgAccount.search.agent_account"),
    prop: "agent_account",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.agent_account")
    }))
  },
  // Row 4
  {
    label: "代理密码",
    renderLabel: () => t("merchant.wlgAccount.search.agent_pwd"),
    prop: "agent_pwd",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.agent_pwd")
    }))
  },
  {
    label: "总社后台",
    renderLabel: () => t("merchant.wlgAccount.search.sn_url"),
    prop: "sn_url",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.sn_url")
    }))
  },
  {
    label: "代理后台",
    renderLabel: () => t("merchant.wlgAccount.search.agent_url"),
    prop: "agent_url",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.agent_url")
    }))
  },
  {
    label: "备注",
    renderLabel: () => t("merchant.wlgAccount.search.remark"),
    prop: "remark",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.remark")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("merchant.wlgAccount.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.wlgAccount.search.status")
    })),
    options: computed(() => [
      {
        label: t("merchant.wlgAccount.search.all"),
        value: ""
      },
      {
        label: t("merchant.wlgAccount.search.normal"),
        value: "1"
      },
      {
        label: t("merchant.wlgAccount.search.hidden"),
        value: "-1"
      }
    ])
  },
  {
    label: "创建时间",
    renderLabel: () => t("merchant.wlgAccount.search.createTime"),
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
    renderLabel: () => t("merchant.wlgAccount.search.updateTime"),
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
    dealer_name: "",
    bound_merchant: "",
    dealer_id: "",
    agent_id: "",
    key: "",
    api_host: "",
    dealer_account: "",
    dealer_pwd: "",
    agent_account: "",
    agent_pwd: "",
    sn_url: "",
    agent_url: "",
    remark: "",
    currency_id: "",
    status: "",
    createTime: [],
    updateTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = WlgAccountItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("merchant.wlgAccount.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "钱包类型",
    renderHeader: () => t("merchant.wlgAccount.table.wallet_type"),
    prop: "wallet_type",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "warning"
      }, () => value === 1 ? t("merchant.wlgAccount.table.single") : value === 2 ? t("merchant.wlgAccount.table.transfer") : value);
    },
    tableColumnProps: {
      align: "center"
    },
    width: 130,
  },
  {
    label: "账户类型",
    renderHeader: () => t("merchant.wlgAccount.table.type"),
    prop: "type",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "warning"
      }, () => value === 1 ? t("merchant.wlgAccount.table.formal") : value === 2 ? t("merchant.wlgAccount.table.test") : value);
    },
    tableColumnProps: {
      align: "center"
    },
    width: 130,
  },
  {
    label: "币种",
    renderHeader: () => t("merchant.wlgAccount.table.currency_id"),
    prop: "currency_id",
    render: (value: number) => {
      const currency = currencyOptions.value.find(item => item.value === value);
      return currency ? currency.label : value;
    },
    tableColumnProps: {
      align: "center"
    },
    width: 100,
  },
  {
    label: "总社名称",
    renderHeader: () => t("merchant.wlgAccount.table.dealer_name"),
    prop: "dealer_name",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "绑定商户",
    renderHeader: () => t("merchant.wlgAccount.table.bound_merchant"),
    prop: "bound_merchant",
    render: () => {
      // TODO: 绑定商户字段需要从其他接口获取，暂时显示空
      return h("span", t("merchant.wlgAccount.table.boundMerchantPlaceholder"));
    },
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社ID",
    renderHeader: () => t("merchant.wlgAccount.table.dealer_id"),
    prop: "dealer_id",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "代理ID",
    renderHeader: () => t("merchant.wlgAccount.table.agent_id"),
    prop: "agent_id",
    tableColumnProps: {
      align: "center"
    },
    width: 110
  },
  {
    label: "API密钥",
    renderHeader: () => t("merchant.wlgAccount.table.key"),
    prop: "key",
    width: 280,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "API地址",
    renderHeader: () => t("merchant.wlgAccount.table.api_host"),
    prop: "api_host",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社账号",
    renderHeader: () => t("merchant.wlgAccount.table.dealer_account"),
    prop: "dealer_account",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社密码",
    renderHeader: () => t("merchant.wlgAccount.table.dealer_pwd"),
    prop: "dealer_pwd",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理账号",
    renderHeader: () => t("merchant.wlgAccount.table.agent_account"),
    prop: "agent_account",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理密码",
    renderHeader: () => t("merchant.wlgAccount.table.agent_pwd"),
    prop: "agent_pwd",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社后台",
    renderHeader: () => t("merchant.wlgAccount.table.sn_url"),
    prop: "sn_url",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理后台",
    renderHeader: () => t("merchant.wlgAccount.table.agent_url"),
    prop: "agent_url",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    renderHeader: () => t("merchant.wlgAccount.table.remark"),
    prop: "remark",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    renderHeader: () => t("merchant.wlgAccount.table.createtime"),
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    renderHeader: () => t("merchant.wlgAccount.table.updatetime"),
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("merchant.wlgAccount.table.status"),
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === "1" ? "success" : "danger"
      }, () => value === "1" ? t("merchant.wlgAccount.table.normal") : t("merchant.wlgAccount.table.hidden"));
    },
    tableColumnProps: {
       sortable: true,
       fixed: "right",
       align: "center"
    },
    width: 100
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("merchant.wlgAccount.buttons.edit"),
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
      dealer_name, 
      bound_merchant, 
      dealer_id, 
      agent_id, 
      key, 
      api_host, 
      dealer_account, 
      dealer_pwd, 
      agent_account, 
      agent_pwd, 
      sn_url, 
      agent_url, 
      remark, 
      currency_id,
      status, 
      createTime, 
      updateTime 
    } = searchData.value;
    
    const params: WlgAccountListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      wallet_type: wallet_type || undefined,
      type: type || undefined,
      dealer_name: dealer_name || undefined,
      dealer_id: dealer_id || undefined,
      agent_id: agent_id || undefined,
      key: key || undefined,
      api_host: api_host || undefined,
      dealer_account: dealer_account || undefined,
      dealer_pwd: dealer_pwd || undefined,
      agent_account: agent_account || undefined,
      agent_pwd: agent_pwd || undefined,
      sn_url: sn_url || undefined,
      agent_url: agent_url || undefined,
      remark: remark || undefined,
      currency_id: currency_id || undefined,
      status: status || undefined
    };

    const res = await getWlgAccountList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      tableData.value = res.data.rows;
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("merchant.wlgAccount.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("merchant.wlgAccount.message.getListFail"), { type: "error" });
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
  dealer_name: "",
  dealer_id: "",
  agent_id: "",
  key: "",
  api_host: "",
  sn_url: "",
  dealer_account: "",
  dealer_pwd: "",
  agent_url: "",
  agent_account: "",
  agent_pwd: "",
  status: "1"
});
const formRules = {
  wallet_type: [
    { required: true, message: t("merchant.wlgAccount.form.walletTypeRequired"), trigger: "change" }
  ],
  dealer_name: [
    { required: true, message: t("merchant.wlgAccount.form.dealerNameRequired"), trigger: "blur" }
  ]
};

// 对话框标题
const dialogTitle = computed(() => {
  return isEdit.value ? t("merchant.wlgAccount.edit.title") : t("merchant.wlgAccount.add.title");
});

// API地址选项（根据实际需求调整）
const apiHostOptions = ref([
  { label: "https://api.niubpro.com", value: "https://api.niubpro.com" },
  { label: "https://h2.betcastles.com", value: "https://h2.betcastles.com" },
  { label: "https://api.goodctr666.com", value: "https://api.goodctr666.com" }
]);

// 总社后台选项（根据实际需求调整）
const snUrlOptions = ref([
  { label: "https://sn.zonegm777.com", value: "https://sn.zonegm777.com" },
  { label: "https://sn.goodctr666.com", value: "https://sn.goodctr666.com" },
  { label: "https://sn.nbetps.com", value: "https://sn.nbetps.com" }
]);

// 代理后台选项（根据实际需求调整）
const agentUrlOptions = ref([
  { label: "https://agent.zonegm777.com", value: "https://agent.zonegm777.com" },
  { label: "https://agent.goodctr666.com", value: "https://agent.goodctr666.com" },
  { label: "https://agent.nbetps.com", value: "https://agent.nbetps.com" }
]);

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    id: 0,
    wallet_type: "",
    type: "",
    currency_id: "",
    dealer_name: "",
    dealer_id: "",
    agent_id: "",
    key: "",
    api_host: "",
    sn_url: "",
    dealer_account: "",
    dealer_pwd: "",
    agent_url: "",
    agent_account: "",
    agent_pwd: "",
    status: "1"
  };
  showDialog.value = true;
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("merchant.wlgAccount.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  formData.value = {
    id: row.id,
    wallet_type: row.wallet_type.toString(),
    type: row.type.toString(),
    currency_id: row.currency_id.toString(),
    dealer_name: row.dealer_name,
    dealer_id: row.dealer_id || "",
    agent_id: row.agent_id || "",
    key: row.key || "",
    api_host: row.api_host || "",
    sn_url: row.sn_url || "",
    dealer_account: row.dealer_account || "",
    dealer_pwd: row.dealer_pwd || "",
    agent_url: row.agent_url || "",
    agent_account: row.agent_account || "",
    agent_pwd: row.agent_pwd || "",
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
    dealer_name: "",
    dealer_id: "",
    agent_id: "",
    key: "",
    api_host: "",
    sn_url: "",
    dealer_account: "",
    dealer_pwd: "",
    agent_url: "",
    agent_account: "",
    agent_pwd: "",
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
          const params: EditWlgAccountParams = {
            id: formData.value.id,
            wallet_type: formData.value.wallet_type || undefined,
            type: formData.value.type || undefined,
            currency_id: formData.value.currency_id || undefined,
            dealer_name: formData.value.dealer_name || undefined,
            dealer_id: formData.value.dealer_id || undefined,
            agent_id: formData.value.agent_id || undefined,
            key: formData.value.key || undefined,
            api_host: formData.value.api_host || undefined,
            sn_url: formData.value.sn_url || undefined,
            dealer_account: formData.value.dealer_account || undefined,
            dealer_pwd: formData.value.dealer_pwd || undefined,
            agent_url: formData.value.agent_url || undefined,
            agent_account: formData.value.agent_account || undefined,
            agent_pwd: formData.value.agent_pwd || undefined,
            status: formData.value.status || undefined
          };

          const res = await editWlgAccount(params);

          if (res.code === 0) {
            message(t("merchant.wlgAccount.message.editSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("merchant.wlgAccount.message.editFail"), { type: "error" });
          }
        } else {
          // 新增
          const params: AddWlgAccountParams = {
            wallet_type: formData.value.wallet_type,
            type: formData.value.type || undefined,
            currency_id: formData.value.currency_id || undefined,
            dealer_name: formData.value.dealer_name,
            dealer_id: formData.value.dealer_id || undefined,
            agent_id: formData.value.agent_id || undefined,
            key: formData.value.key || undefined,
            api_host: formData.value.api_host || undefined,
            sn_url: formData.value.sn_url || undefined,
            dealer_account: formData.value.dealer_account || undefined,
            dealer_pwd: formData.value.dealer_pwd || undefined,
            agent_url: formData.value.agent_url || undefined,
            agent_account: formData.value.agent_account || undefined,
            agent_pwd: formData.value.agent_pwd || undefined,
            status: formData.value.status
          };

          const res = await addWlgAccount(params);

          if (res.code === 0) {
            message(t("merchant.wlgAccount.message.addSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("merchant.wlgAccount.message.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        console.error(isEdit.value ? "编辑WLG账号失败:" : "新增WLG账号失败:", error);
        message(error?.message || (isEdit.value ? t("merchant.wlgAccount.message.editFail") : t("merchant.wlgAccount.message.addFail")), { type: "error" });
      }
    }
  });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.wlgAccount.message.selectToDelete"), { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const accountNames = multipleSelection.value.map(item => item.dealer_name).join("、");
  const confirmMessage = t("merchant.wlgAccount.message.confirmDelete", { names: accountNames });

  try {
    await ElMessageBox.confirm(confirmMessage, t("merchant.wlgAccount.delete.title"), {
      confirmButtonText: t("merchant.wlgAccount.buttons.confirm"),
      cancelButtonText: t("merchant.wlgAccount.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的账号
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchWlgAccount({ ids });

      if (res.code === 0) {
        message(t("merchant.wlgAccount.message.deleteSuccess"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || t("merchant.wlgAccount.message.deleteFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || t("merchant.wlgAccount.message.deleteFail"), { type: "error" });
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
    message(t("merchant.wlgAccount.message.selectToUnbind"), { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(t("merchant.wlgAccount.message.confirmUnbind"), t("merchant.wlgAccount.unbind.title"), {
      confirmButtonText: t("merchant.wlgAccount.buttons.confirm"),
      cancelButtonText: t("merchant.wlgAccount.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    unbindLoading.value = true;
    try {
      // 批量解绑选中的账号
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await unbindBatchWlgAccount({ ids });

      if (res.code === 0) {
        message(t("merchant.wlgAccount.message.unbindSuccess"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || t("merchant.wlgAccount.message.unbindFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error("解绑失败:", error);
      message(error?.message || t("merchant.wlgAccount.message.unbindFail"), { type: "error" });
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
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value.map((col: any) => col.label);
  const exportProps = tableConfig.value.map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        return item.status === "1" ? t("merchant.wlgAccount.table.normal") : t("merchant.wlgAccount.table.hidden");
      }
      if (prop === "wallet_type") {
        return item.wallet_type === 1 ? t("merchant.wlgAccount.table.single") : item.wallet_type === 2 ? t("merchant.wlgAccount.table.transfer") : item.wallet_type;
      }
      if (prop === "type") {
        return item.type === 1 ? t("merchant.wlgAccount.table.formal") : item.type === 2 ? t("merchant.wlgAccount.table.test") : item.type;
      }
      if (prop === "currency_id") {
        const currency = currencyOptions.value.find(opt => opt.value === item.currency_id);
        return currency ? currency.label : item.currency_id;
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("merchant.wlgAccount.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("merchant.wlgAccount.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.wlgAccount.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("merchant.wlgAccount.export.jsonFileName");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="wlg-account-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="130"
        label-position="right"
        :has-unfold="false"
        :searchText="t('merchant.wlgAccount.buttons.search')"
        :resetText="t('merchant.wlgAccount.buttons.reset')"
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
          label: t('merchant.wlgAccount.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.wlgAccount.buttons.add') }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.wlgAccount.buttons.edit') }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.wlgAccount.buttons.delete') }}</span>
          </el-button>
          <el-button 
            type="warning" 
            @click="handleUnbindMerchant" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="unbindLoading"
          >
            <span>{{ t('merchant.wlgAccount.buttons.unbind') }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('merchant.wlgAccount.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('merchant.wlgAccount.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('merchant.wlgAccount.toolbar.hideSearch') : t('merchant.wlgAccount.toolbar.showSearch')"
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
          <el-tooltip :content="t('merchant.wlgAccount.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 新增/编辑WLG账号对话框 -->
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
        label-width="130px"
        class="dialog-form"
      >
        <el-form-item :label="t('merchant.wlgAccount.form.wallet_type')" prop="wallet_type">
          <el-select
            v-model="formData.wallet_type"
            :placeholder="t('placeholder.select')"
            style="width: 100%"
          >
            <el-option :label="t('merchant.wlgAccount.form.single')" value="1" />
            <el-option :label="t('merchant.wlgAccount.form.transfer')" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.type')" prop="type">
          <el-select
            v-model="formData.type"
            :placeholder="t('placeholder.select')"
            style="width: 100%"
          >
            <el-option :label="t('merchant.wlgAccount.form.formal')" value="1" />
            <el-option :label="t('merchant.wlgAccount.form.test')" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.currency_id')" prop="currency_id">
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
        <el-form-item :label="t('merchant.wlgAccount.form.dealer_name')" prop="dealer_name">
          <el-input
            v-model="formData.dealer_name"
            :placeholder="t('placeholder.input')"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.dealer_id')" prop="dealer_id">
          <el-input
            v-model="formData.dealer_id"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.agent_id')" prop="agent_id">
          <el-input
            v-model="formData.agent_id"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.key')" prop="key">
          <el-input
            v-model="formData.key"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.api_host')" prop="api_host">
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
        <el-form-item :label="t('merchant.wlgAccount.form.sn_url')" prop="sn_url">
          <el-select
            v-model="formData.sn_url"
            :placeholder="t('placeholder.select')"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="item in snUrlOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.dealer_account')" prop="dealer_account">
          <el-input
            v-model="formData.dealer_account"
            :placeholder="t('placeholder.input')"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.dealer_pwd')" prop="dealer_pwd">
          <el-input
            v-model="formData.dealer_pwd"
            :placeholder="t('placeholder.input')"
            maxlength="100"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.agent_url')" prop="agent_url">
          <el-select
            v-model="formData.agent_url"
            :placeholder="t('placeholder.select')"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="item in agentUrlOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.agent_account')" prop="agent_account">
          <el-input
            v-model="formData.agent_account"
            :placeholder="t('placeholder.input')"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.agent_pwd')" prop="agent_pwd">
          <el-input
            v-model="formData.agent_pwd"
            :placeholder="t('placeholder.input')"
            maxlength="100"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('merchant.wlgAccount.form.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">{{ t('merchant.wlgAccount.form.open') }}</el-radio>
            <el-radio label="-1">{{ t('merchant.wlgAccount.form.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t('merchant.wlgAccount.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ t('merchant.wlgAccount.buttons.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.wlg-account-container {
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

/* 对话框表单样式 */
.dialog-form {
  margin: 0 auto;
  padding-right: 20px;
}
</style>

