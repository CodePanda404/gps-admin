<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
import { ElSwitch, ElTag } from "element-plus";
defineOptions({
  name: "WlgAccount"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
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
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "ID"
    }))
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "选择"
    })),
    options: [
      {
        label: "全部",
        value: ""
      },
      {
        label: "单一模式",
        value: "1"
      },
      {
        label: "转账模式",
        value: "2"
      }
    ]
  },
  {
    label: "账号类型",
    prop: "type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "选择"
    })),
    options: [
      {
        label: "全部",
        value: ""
      },
      {
        label: "正式账号",
        value: "1"
      },
      {
        label: "测试账号",
        value: "2"
      }
    ]
  },
  {
    label: "总社名称",
    prop: "dealer_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "总社名称"
    }))
  },
  // Row 2
  {
    label: "绑定商户",
    prop: "bound_merchant",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "绑定商户"
    }))
  },
  {
    label: "总社ID",
    prop: "dealer_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "总社ID"
    }))
  },
  {
    label: "代理ID",
    prop: "agent_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "代理ID"
    }))
  },
  {
    label: "API密钥",
    prop: "key",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "API密钥"
    }))
  },
  // Row 3
  {
    label: "API地址",
    prop: "api_host",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "API地址"
    }))
  },
  {
    label: "总社账号",
    prop: "dealer_account",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "总社账号"
    }))
  },
  {
    label: "总社密码",
    prop: "dealer_pwd",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "总社密码"
    }))
  },
  {
    label: "代理账号",
    prop: "agent_account",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "代理账号"
    }))
  },
  // Row 4
  {
    label: "代理密码",
    prop: "agent_pwd",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "代理密码"
    }))
  },
  {
    label: "总社后台",
    prop: "sn_url",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "总社后台"
    }))
  },
  {
    label: "代理后台",
    prop: "agent_url",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "代理后台"
    }))
  },
  {
    label: "备注",
    prop: "remark",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "备注"
    }))
  },
  // Row 5
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "选择"
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
        label: "隐藏",
        value: "-1"
      }
    ]
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
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "warning"
      }, () => value === 1 ? "单一模式" : value === 2 ? "转账模式" : value);
    },
    width: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "账户类型",
    prop: "type",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "warning"
      }, () => value === 1 ? "正式账号" : value === 2 ? "测试账号" : value);
    },
    width: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    prop: "currency_id",
    render: (value: number) => {
      const currency = currencyOptions.value.find(item => item.value === value);
      return currency ? currency.label : value;
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社名称",
    prop: "dealer_name",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "绑定商户",
    prop: "bound_merchant",
    render: () => {
      // TODO: 绑定商户字段需要从其他接口获取，暂时显示空
      return h("span", "SB商户");
    },
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社ID",
    prop: "dealer_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理ID",
    prop: "agent_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "API密钥",
    prop: "key",
    width: 280,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "API地址",
    prop: "api_host",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社账号",
    prop: "dealer_account",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社密码",
    prop: "dealer_pwd",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理账号",
    prop: "agent_account",
    width: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理密码",
    prop: "agent_pwd",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "总社后台",
    prop: "sn_url",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "代理后台",
    prop: "agent_url",
    width: 220,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    prop: "remark",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "状态",
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === "1" ? "success" : "danger"
      }, () => value === "1" ? "正常" : "隐藏");
    },
    tableColumnProps: {
       sortable: true,
       fixed: "right",
       align: "center"
    }
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
      status: status || undefined
    };

    const res = await getWlgAccountList(params);

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
const unbindLoading = ref(false);

// 新增WLG账号对话框相关
const showAddDialog = ref(false);
const addFormRef = ref();
const addFormData = ref({
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
const addFormRules = {
  wallet_type: [
    { required: true, message: "请选择钱包模式", trigger: "change" }
  ],
  dealer_name: [
    { required: true, message: "请输入总社名称", trigger: "blur" }
  ]
};

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
  showAddDialog.value = true;
  // 重置表单
  addFormData.value = {
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

// 关闭新增对话框
const handleCloseAddDialog = () => {
  showAddDialog.value = false;
  addFormRef.value?.resetFields();
  addFormData.value = {
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

// 提交新增表单
const handleSubmitAdd = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const params: AddWlgAccountParams = {
          wallet_type: addFormData.value.wallet_type,
          type: addFormData.value.type || undefined,
          currency_id: addFormData.value.currency_id || undefined,
          dealer_name: addFormData.value.dealer_name,
          dealer_id: addFormData.value.dealer_id || undefined,
          agent_id: addFormData.value.agent_id || undefined,
          key: addFormData.value.key || undefined,
          api_host: addFormData.value.api_host || undefined,
          sn_url: addFormData.value.sn_url || undefined,
          dealer_account: addFormData.value.dealer_account || undefined,
          dealer_pwd: addFormData.value.dealer_pwd || undefined,
          agent_url: addFormData.value.agent_url || undefined,
          agent_account: addFormData.value.agent_account || undefined,
          agent_pwd: addFormData.value.agent_pwd || undefined,
          status: addFormData.value.status
        };

        const res = await addWlgAccount(params);

        if (res.code === 0) {
          message("新增WLG账号成功", { type: "success" });
          handleCloseAddDialog();
          // 刷新列表
          getList();
        } else {
          message(res.msg || "新增WLG账号失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("新增WLG账号失败:", error);
        message(error?.message || "新增WLG账号失败", { type: "error" });
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

// 编辑WLG账号对话框相关
const showEditDialog = ref(false);
const editFormRef = ref();
const editFormData = ref({
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
const editFormRules = {
  wallet_type: [
    { required: true, message: "请选择钱包模式", trigger: "change" }
  ],
  dealer_name: [
    { required: true, message: "请输入总社名称", trigger: "blur" }
  ]
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  showEditDialog.value = true;
  // 回填数据
  editFormData.value = {
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
};

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  showEditDialog.value = false;
  editFormRef.value?.resetFields();
  editFormData.value = {
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

// 提交编辑表单
const handleSubmitEdit = async () => {
  if (!editFormRef.value) return;

  await editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const params: EditWlgAccountParams = {
          id: editFormData.value.id,
          wallet_type: editFormData.value.wallet_type || undefined,
          type: editFormData.value.type || undefined,
          currency_id: editFormData.value.currency_id || undefined,
          dealer_name: editFormData.value.dealer_name || undefined,
          dealer_id: editFormData.value.dealer_id || undefined,
          agent_id: editFormData.value.agent_id || undefined,
          key: editFormData.value.key || undefined,
          api_host: editFormData.value.api_host || undefined,
          sn_url: editFormData.value.sn_url || undefined,
          dealer_account: editFormData.value.dealer_account || undefined,
          dealer_pwd: editFormData.value.dealer_pwd || undefined,
          agent_url: editFormData.value.agent_url || undefined,
          agent_account: editFormData.value.agent_account || undefined,
          agent_pwd: editFormData.value.agent_pwd || undefined,
          status: editFormData.value.status || undefined
        };

        const res = await editWlgAccount(params);

        if (res.code === 0) {
          message("编辑WLG账号成功", { type: "success" });
          handleCloseEditDialog();
          // 刷新列表
          getList();
        } else {
          message(res.msg || "编辑WLG账号失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("编辑WLG账号失败:", error);
        message(error?.message || "编辑WLG账号失败", { type: "error" });
      }
    }
  });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要删除的数据！", { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const accountNames = multipleSelection.value.map(item => item.dealer_name).join("、");
  const confirmMessage = `确定删除WLG账号 ${accountNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除WLG账号", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的账号
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchWlgAccount({ ids });

      if (res.code === 0) {
        message("删除成功", { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
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

// 解绑商户
const handleUnbindMerchant = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要解绑的数据！", { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm("是否确定解绑商户?", "解绑商户", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    unbindLoading.value = true;
    try {
      // 批量解绑选中的账号
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await unbindBatchWlgAccount({ ids });

      if (res.code === 0) {
        message("解绑成功", { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || "解绑失败", { type: "error" });
      }
    } catch (error: any) {
      console.error("解绑失败:", error);
      message(error?.message || "解绑失败", { type: "error" });
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
        return item.status === "1" ? "正常" : "隐藏";
      }
      if (prop === "wallet_type") {
        return item.wallet_type === 1 ? "单一模式" : item.wallet_type === 2 ? "转账模式" : item.wallet_type;
      }
      if (prop === "type") {
        return item.type === 1 ? "正式账号" : item.type === 2 ? "测试账号" : item.type;
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
  const sheetName = "WLG账号管理";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `WLG账号管理.xlsx`;
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
  a.download = "WLG账号管理.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="wlg-account-container">
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
        :action-bar="{
          buttons,
          width: '150px',
          label: '操作'
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">添加</span>
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
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">删除</span>
          </el-button>
          <el-button 
            type="warning" 
            @click="handleUnbindMerchant" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="unbindLoading"
          >
            <span>解绑商户</span>
          </el-button>
          <el-dropdown style="margin-left: 15px;">
            <el-button type="info" size="default" >
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
          <div>
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

    <!-- 新增WLG账号对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseAddDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addFormData"
        :rules="addFormRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="钱包模式" prop="wallet_type">
          <el-select
            v-model="addFormData.wallet_type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="单一模式" value="1" />
            <el-option label="转账模式" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号类型" prop="type">
          <el-select
            v-model="addFormData.type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="正式账号" value="1" />
            <el-option label="测试账号" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择币种" prop="currency_id">
          <el-select
            v-model="addFormData.currency_id"
            placeholder="请选择"
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
        <el-form-item label="总社名称" prop="dealer_name">
          <el-input
            v-model="addFormData.dealer_name"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="总社ID" prop="dealer_id">
          <el-input
            v-model="addFormData.dealer_id"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="代理ID" prop="agent_id">
          <el-input
            v-model="addFormData.agent_id"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="API 秘钥" prop="key">
          <el-input
            v-model="addFormData.key"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="API 地址" prop="api_host">
          <el-select
            v-model="addFormData.api_host"
            placeholder="请选择"
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
        <el-form-item label="总社后台" prop="sn_url">
          <el-select
            v-model="addFormData.sn_url"
            placeholder="请选择"
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
        <el-form-item label="总社账号" prop="dealer_account">
          <el-input
            v-model="addFormData.dealer_account"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="总社密码" prop="dealer_pwd">
          <el-input
            v-model="addFormData.dealer_pwd"
            placeholder="请输入"
            maxlength="100"
            show-password
          />
        </el-form-item>
        <el-form-item label="代理后台" prop="agent_url">
          <el-select
            v-model="addFormData.agent_url"
            placeholder="请选择"
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
        <el-form-item label="代理账号" prop="agent_account">
          <el-input
            v-model="addFormData.agent_account"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="代理密码" prop="agent_pwd">
          <el-input
            v-model="addFormData.agent_pwd"
            placeholder="请输入"
            maxlength="100"
            show-password
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="addFormData.status">
            <el-radio label="1">开启</el-radio>
            <el-radio label="-1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmitAdd">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑WLG账号对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="钱包模式" prop="wallet_type">
          <el-select
            v-model="editFormData.wallet_type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="单一模式" value="1" />
            <el-option label="转账模式" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号类型" prop="type">
          <el-select
            v-model="editFormData.type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="正式账号" value="1" />
            <el-option label="测试账号" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择币种" prop="currency_id">
          <el-select
            v-model="editFormData.currency_id"
            placeholder="请选择"
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
        <el-form-item label="总社名称" prop="dealer_name">
          <el-input
            v-model="editFormData.dealer_name"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="总社ID" prop="dealer_id">
          <el-input
            v-model="editFormData.dealer_id"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="代理ID" prop="agent_id">
          <el-input
            v-model="editFormData.agent_id"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="API 秘钥" prop="key">
          <el-input
            v-model="editFormData.key"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="API 地址" prop="api_host">
          <el-select
            v-model="editFormData.api_host"
            placeholder="请选择"
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
        <el-form-item label="总社后台" prop="sn_url">
          <el-select
            v-model="editFormData.sn_url"
            placeholder="请选择"
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
        <el-form-item label="总社账号" prop="dealer_account">
          <el-input
            v-model="editFormData.dealer_account"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="总社密码" prop="dealer_pwd">
          <el-input
            v-model="editFormData.dealer_pwd"
            placeholder="请输入"
            maxlength="100"
            show-password
          />
        </el-form-item>
        <el-form-item label="代理后台" prop="agent_url">
          <el-select
            v-model="editFormData.agent_url"
            placeholder="请选择"
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
        <el-form-item label="代理账号" prop="agent_account">
          <el-input
            v-model="editFormData.agent_account"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="代理密码" prop="agent_pwd">
          <el-input
            v-model="editFormData.agent_pwd"
            placeholder="请输入"
            maxlength="100"
            show-password
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editFormData.status">
            <el-radio label="1">开启</el-radio>
            <el-radio label="-1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmitEdit">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
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

/* 对话框表单样式 */
.dialog-form {
  margin: 0 auto;
  padding-right: 20px;
}
</style>

