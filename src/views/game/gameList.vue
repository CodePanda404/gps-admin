<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "GameList"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElTooltip, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElRadioGroup, ElRadio, ElInputNumber, ElUpload, ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import {
  getGameList,
  getSupplierList,
  getCurrencyList,
  getGameBrandList,
  addGame,
  editGame,
  deleteBatchGame,
  testGames,
  uploadImage,
  switchGameStatus,
  type GameListParams,
  type GameListItem,
  type SupplierItem,
  type CurrencyItem,
  type GameBrandItem,
  type AddGameParams,
  type EditGameParams
} from "@/api/game";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import More from "~icons/ep/more";

/*  -----搜索表单相关-----  */
// 供应商列表（用于下拉选择）
const supplierOptions = ref<Array<{ label: string; value: number }>>([]);
// 币种列表（用于下拉选择）
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);
// 游戏品牌列表（用于所属分类下拉选择）
const brandOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取供应商列表
const fetchSupplierList = async () => {
  try {
    const res = await getSupplierList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      supplierOptions.value = res.data.rows.map((item: SupplierItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取供应商列表失败:", error);
  }
};

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

// 获取游戏品牌列表（用于所属分类）
const fetchBrandList = async () => {
  try {
    const res = await getGameBrandList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      brandOptions.value = res.data.rows.map((item: GameBrandItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取游戏品牌列表失败:", error);
  }
};

// 初始化时获取列表
fetchSupplierList();
fetchCurrencyList();
fetchBrandList();

// 搜索表单数据
const searchData = ref({
  id: "",
  wallet_type: "",
  provider: "",
  game_id: "",
  game_code: "",
  name: "",
  name_cn: "",
  common_name: "",
  product_code: "",
  common_content: "",
  type_id: "",
  is_local: "",
  has_pic: "",
  currency: "",
  createTime: null as string[] | null,
  updateTime: null as string[] | null,
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
    label: "供应商",
    prop: "provider",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择供应商",
      filterable: true
    })),
    options: computed(() => [
      { label: "全部", value: "" },
      ...supplierOptions.value.map(item => ({
        label: item.label,
        value: item.label
      }))
    ])
  },
  {
    label: "游戏ID",
    prop: "game_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入游戏ID"
    }))
  },
  {
    label: "游戏code",
    prop: "game_code",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入游戏code"
    }))
  },
  {
    label: "游戏英文名称",
    prop: "name",
    valueType: "copy",
    width: 180,
    fieldProps: computed(() => ({
      placeholder: "请输入游戏英文名称"
    }))
  },
  {
    label: "游戏中文名称",
    prop: "name_cn",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入游戏中文名称"
    }))
  },
  {
    label: "产品缩写",
    prop: "common_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品缩写"
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
    label: "所属玩法",
    prop: "common_content",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入所属玩法"
    }))
  },
  {
    label: "所属分类",
    prop: "type_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择所属分类",
      filterable: true
    })),
    options: computed(() => [
      { label: "全部", value: "" },
      ...brandOptions.value.map(item => ({
        label: item.label,
        value: item.value
      }))
    ])
  },
  {
    label: "标签",
    prop: "tag",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入标签"
    }))
  },
  {
    label: "有无图片",
    prop: "has_pic",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "有", value: "1" },
      { label: "无", value: "2" }
    ]
  },
  {
    label: "支持币种",
    prop: "currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入支持币种"
    }))
  },
  {
    label: "已停用币种",
    prop: "disabled_currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入已停用币种"
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
const handleSearch = (values: any) => {
  pageInfo.value.page = 1;
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    id: "",
    wallet_type: "",
    provider: "",
    game_id: "",
    game_code: "",
    name: "",
    name_cn: "",
    common_name: "",
    product_code: "",
    common_content: "",
    type_id: "",
    is_local: "",
    has_pic: "",
    currency: "",
    createTime: null,
    updateTime: null,
    status: ""
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = GameListItem;

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
    label: "供应商",
    prop: "provider",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "游戏ID",
    prop: "game_id",
    tableColumnProps: {
      align: "center"
    },
    width: 160
  },
  {
    label: "游戏code",
    prop: "game_code",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "游戏英文名称",
    prop: "name",
    tableColumnProps: {
      align: "center"
    },
    width: 180
  },
  {
    label: "游戏中文名称",
    prop: "name_cn",
    tableColumnProps: {
      align: "center"
    },
    width: 180
  },
  {
    label: "产品缩写",
    prop: "common_name",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "产品ID",
    prop: "product_code",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "所属玩法",
    prop: "common_content",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "所属分类",
    prop: "common_name",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "标签",
    prop: "tag",
    render: (value: string) => {
      return value || "-";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "产品主图",
    prop: "product_pic",
    valueType: "img",
    fieldProps: {
      fit: "cover"
    },
    fieldSlots: {
      error: () => (h("div", ""))
    },
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "演示站游戏图",
    prop: "web_pic",
    valueType: "img",
    fieldProps: {
      fit: "cover"
    },
    fieldSlots: {
      error: () => (h("div", ""))
    },
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "webp游戏图",
    prop: "pic",
    valueType: "img",
    fieldProps: {
      fit: "cover"
    },
    fieldSlots: {
      error: () => (h("div", ""))
    },
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "图片存储",
    prop: "is_local",
    render: (value: string | number) => {
      if (value === "1" || value === 1) return "本地";
      return "远程";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "有无图片",
    prop: "pic",
    render: (value: string) => {
      // 根据是否有 pic 字段判断
      if (value && value !== "") return "有";
      return "无";
    },
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "支持币种",
    prop: "currency",
    render: (value: string) => {
      if (!value) return "-";
      // 将币种字符串按逗号分割
      const currencies = value.split(",").map((c: string) => c.trim()).filter((c: string) => c);
      const maxDisplay = 10;
      
      if (currencies.length <= maxDisplay) {
        // 如果不超过10个，直接显示
        return h("span", currencies.join(", "));
      } else {
        // 如果超过10个，显示前10个+"..."
        const displayCurrencies = currencies.slice(0, maxDisplay);
        const displayText = displayCurrencies.join(", ") + "...";
        const fullText = currencies.join(", ");
        
        return h(
          ElTooltip,
          {
            content: fullText,
            placement: "top",
            effect: "dark"
          },
          {
            default: () => h("span", { style: { cursor: "help" } }, displayText)
          }
        );
      }
    },
    tableColumnProps: {
      align: "center"
    },
    width: 430
  },
  {
    label: "已停用币种",
    prop: "disabled_currency",
    render: (value: string) => {
      if (!value) return "-";
      // 将币种字符串按逗号分割
      const currencies = value.split(",").map((c: string) => c.trim()).filter((c: string) => c);
      const maxDisplay = 10;
      
      if (currencies.length <= maxDisplay) {
        return h("span", currencies.join(", "));
      } else {
        const displayCurrencies = currencies.slice(0, maxDisplay);
        const displayText = displayCurrencies.join(", ") + "...";
        const fullText = currencies.join(", ");
        
        return h(
          ElTooltip,
          {
            content: fullText,
            placement: "top",
            effect: "dark"
          },
          {
            default: () => h("span", { style: { cursor: "help" } }, displayText)
          }
        );
      }
    },
    tableColumnProps: {
      align: "center"
    },
    width: 300
  },
  {
    label: "创建时间",
    prop: "createtime",
    tableColumnProps: {
      align: "center",
      sortable: true
    },
    width: 160
  },
  {
    label: "更新时间",
    prop: "updatetime",
    tableColumnProps: {
      align: "center",
      sortable: true
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
    text: "切换状态",
    code: "switchStatus",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleSwitchStatus(row);
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
      provider, 
      game_id, 
      game_code, 
      name, 
      name_cn, 
      common_name, 
      product_code, 
      common_content, 
      type_id, 
      is_local, 
      has_pic, 
      currency, 
      createTime, 
      updateTime, 
      status 
    } = searchData.value;
    
    const params: GameListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      wallet_type: wallet_type || undefined,
      provider: provider || undefined,
      game_id: game_id || undefined,
      game_code: game_code || undefined,
      name: name || undefined,
      name_cn: name_cn || undefined,
      common_name: common_name || undefined,
      product_code: product_code || undefined,
      common_content: common_content || undefined,
      type_id: type_id || undefined,
      is_local: is_local || undefined,
      has_pic: has_pic || undefined,
      currency: currency || undefined,
      status: status || undefined
    };

    // 处理更新时间范围（新接口只支持更新时间，不支持创建时间）
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }

    const res = await getGameList(params);

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
const switchStatusLoading = ref(false);

// 状态切换对话框相关
const showStatusDialog = ref(false);
const statusDialogRow = ref<TableRow | null>(null);
const statusDialogStatus = ref("1");

// 游戏对话框相关（新增和编辑共用）
const showDialog = ref(false);
const isEditMode = ref(false);
const formRef = ref();
const formData = ref({
  id: 0,
  game_id: "",
  game_code: "",
  name: "",
  name_cn: "",
  wallet_type: "",
  provider: "",
  common_name: "",
  product_code: "",
  common_content: "",
  type_id: "",
  currency: "",
  pic: "",
  web_pic: "",
  webp_pic: "",
  weigh: 0,
  ranking: 0,
  fee_rate: "",
  prize_rate: "",
  tag: "",
  pic_text: "",
  pic_text_status: "0",
  recommend: "0",
  status: "1"
});
const formRules = {
  game_id: [
    { required: true, message: "请输入游戏ID", trigger: "blur" }
  ],
  name: [
    { required: true, message: "请输入游戏名称", trigger: "blur" }
  ]
};
const imageUrl = ref("");
const webPicUrl = ref("");
const webpPicUrl = ref("");
const uploading = ref(false);
const imageUploadRef = ref();
const webPicUploadRef = ref();
const webpPicUploadRef = ref();

// 钱包类型选项
const walletTypeOptions = [
  { label: "单一模式", value: "1" },
  { label: "转账模式", value: "2" }
];

// 图片上传前的处理
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    message("只能上传图片文件！", { type: "error" });
    return false;
  }
  if (!isLt2M) {
    message("图片大小不能超过 2MB！", { type: "error" });
    return false;
  }
  return true;
};

// 处理图片上传
const handleImageUpload = async (options: any, type: "pic" | "web_pic" | "webp_pic") => {
  const { file } = options;
  uploading.value = true;
  
  try {
    const res = await uploadImage({
      file: file,
      type: "1"
    });

    if (res.code === 0) {
      if (type === "pic") {
        imageUrl.value = res.data;
        formData.value.pic = res.data;
      } else if (type === "web_pic") {
        webPicUrl.value = res.data;
        formData.value.web_pic = res.data;
      } else if (type === "webp_pic") {
        webpPicUrl.value = res.data;
        formData.value.webp_pic = res.data;
      }
      message("图片上传成功", { type: "success" });
    } else {
      message(res.msg || "图片上传失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("图片上传失败:", error);
    message(error?.message || "图片上传失败", { type: "error" });
  } finally {
    uploading.value = false;
  }
};

// 触发图片上传
const triggerImageUpload = (type: "pic" | "web_pic" | "webp_pic") => {
  let uploadRef;
  if (type === "pic") {
    uploadRef = imageUploadRef.value;
  } else if (type === "web_pic") {
    uploadRef = webPicUploadRef.value;
  } else {
    uploadRef = webpPicUploadRef.value;
  }
  const uploadEl = uploadRef?.$el?.querySelector('input[type="file"]');
  if (uploadEl) {
    uploadEl.click();
  }
};

// 移除图片
const handleRemoveImage = (type: "pic" | "web_pic" | "webp_pic") => {
  if (type === "pic") {
    imageUrl.value = "";
    formData.value.pic = "";
  } else if (type === "web_pic") {
    webPicUrl.value = "";
    formData.value.web_pic = "";
  } else if (type === "webp_pic") {
    webpPicUrl.value = "";
    formData.value.webp_pic = "";
  }
};

// 重置表单数据
const resetFormData = () => {
  formData.value = {
    id: 0,
    game_id: "",
    game_code: "",
    name: "",
    name_cn: "",
    wallet_type: "",
    provider: "",
    common_name: "",
    product_code: "",
    common_content: "",
    type_id: "",
    currency: "",
    pic: "",
    web_pic: "",
    webp_pic: "",
    weigh: 0,
    ranking: 0,
    fee_rate: "",
    prize_rate: "",
    tag: "",
    pic_text: "",
    pic_text_status: "0",
    recommend: "0",
    status: "1"
  };
  imageUrl.value = "";
  webPicUrl.value = "";
  webpPicUrl.value = "";
};

// 打开新增对话框
const handleAdd = () => {
  isEditMode.value = false;
  resetFormData();
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  resetFormData();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEditMode.value) {
          // 编辑模式 - 除了id，其余字段和新增相同
          const params: EditGameParams = {
            id: formData.value.id,
            name: formData.value.name || undefined,
            name_cn: formData.value.name_cn || undefined,
            wallet_type: formData.value.wallet_type || undefined,
            provider: formData.value.provider || undefined,
            common_name: formData.value.common_name || undefined,
            product_code: formData.value.product_code || undefined,
            common_content: formData.value.common_content || undefined,
            type_id: formData.value.type_id || undefined,
            pic: formData.value.pic || undefined,
            web_pic: formData.value.web_pic || undefined,
            webp_pic: formData.value.webp_pic || undefined,
            weigh: formData.value.weigh || undefined,
            ranking: formData.value.ranking || undefined,
            fee_rate: formData.value.fee_rate || undefined,
            prize_rate: formData.value.prize_rate || undefined,
            tag: formData.value.tag || undefined,
            pic_text: formData.value.pic_text || undefined,
            pic_text_status: formData.value.pic_text_status || undefined,
            recommend: formData.value.recommend || undefined,
            status: formData.value.status || undefined,
            currency: formData.value.currency || undefined
          };

          const res = await editGame(params);

          if (res.code === 0) {
            message("编辑游戏成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "编辑游戏失败", { type: "error" });
          }
        } else {
          // 新增模式
          const params: AddGameParams = {
            game_id: formData.value.game_id,
            name: formData.value.name,
            name_cn: formData.value.name_cn || undefined,
            wallet_type: formData.value.wallet_type || undefined,
            provider: formData.value.provider || undefined,
            common_name: formData.value.common_name || undefined,
            product_code: formData.value.product_code || undefined,
            common_content: formData.value.common_content || undefined,
            type_id: formData.value.type_id || undefined,
            pic: formData.value.pic || undefined,
            weigh: formData.value.weigh || undefined,
            recommend: formData.value.recommend || undefined,
            status: formData.value.status || "1"
          };

          const res = await addGame(params);

          if (res.code === 0) {
            message("新增游戏成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "新增游戏失败", { type: "error" });
          }
        }
      } catch (error: any) {
        console.error(`${isEditMode.value ? "编辑" : "新增"}游戏失败:`, error);
        message(error?.message || `${isEditMode.value ? "编辑" : "新增"}游戏失败`, { type: "error" });
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
  // 回填数据
  formData.value = {
    id: row.id,
    game_id: row.game_id || "",
    game_code: (row as any).game_code || "",
    name: row.name || "",
    name_cn: row.name_cn || "",
    wallet_type: row.wallet_type ? String(row.wallet_type) : "",
    provider: row.provider || "",
    common_name: row.common_name || "",
    product_code: row.product_code || "",
    common_content: row.common_content || "",
    type_id: row.type_id ? String(row.type_id) : "",
    currency: row.currency || "",
    pic: row.pic || "",
    web_pic: (row as any).web_pic || "",
    webp_pic: (row as any).webp_pic || "",
    weigh: row.weigh || 0,
    ranking: (row as any).ranking || 0,
    fee_rate: (row as any).fee_rate || "",
    prize_rate: (row as any).prize_rate || "",
    tag: (row as any).tag || "",
    pic_text: (row as any).pic_text || "",
    pic_text_status: (row as any).pic_text_status || "0",
    recommend: (row as any).recommend || "0",
    status: row.status || "1"
  };
  imageUrl.value = row.pic || "";
  webPicUrl.value = (row as any).web_pic || "";
  webpPicUrl.value = (row as any).webp_pic || "";
  showDialog.value = true;
};

// 删除单行数据
const handleDeleteRow = async (row: TableRow) => {
  const confirmMessage = `确定删除游戏 ${row.name}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除游戏", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 删除单行数据，使用批量删除API但只传一个id
      const res = await deleteBatchGame({ ids: row.id.toString() });

      if (res.code === 0) {
        message("删除成功", { type: "success" });
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

// 切换状态
const handleSwitchStatus = (row: TableRow) => {
  statusDialogRow.value = row;
  // 设置当前状态值
  if (row.status === "1") {
    statusDialogStatus.value = "1";
  } else if (row.status === "-1") {
    statusDialogStatus.value = "-1";
  } else if (row.status === "0") {
    statusDialogStatus.value = "0";
  } else {
    statusDialogStatus.value = "1";
  }
  showStatusDialog.value = true;
};

// 确认切换状态
const handleConfirmSwitchStatus = async () => {
  if (!statusDialogRow.value) return;

  switchStatusLoading.value = true;
  try {
    // 调用接口切换状态
    const res = await switchGameStatus({
      ids: statusDialogRow.value.id.toString(),
      status: statusDialogStatus.value
    });

    if (res.code === 0) {
      message("状态切换成功", { type: "success" });
      
      // 更新本地数据
      if (statusDialogRow.value) {
        statusDialogRow.value.status = statusDialogStatus.value;
      }
      
      // 关闭对话框
      showStatusDialog.value = false;
      statusDialogRow.value = null;
      
      // 刷新列表
      getList();
    } else {
      message(res.msg || "状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("状态切换失败:", error);
    message(error?.message || "状态切换失败", { type: "error" });
  } finally {
    switchStatusLoading.value = false;
  }
};

// 关闭状态切换对话框
const handleCloseStatusDialog = () => {
  showStatusDialog.value = false;
  statusDialogRow.value = null;
  statusDialogStatus.value = "1";
};

// 测试游戏
const handleTestGame = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要测试的游戏！", { type: "warning" });
    return;
  }

  const gameNames = multipleSelection.value.map(item => item.name).join("、");
  const confirmMessage = `是否确定测试游戏 ${gameNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "测试游戏", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "success"
    });

    testGameLoading.value = true;
    try {
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await testGames({ ids });

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
    return exportProps.map(prop => item[prop as keyof TableRow] ?? "");
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "游戏列表";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `游戏列表.xlsx`;
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
  a.download = "游戏列表.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="games-container">
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
            @click="handleTestGame" 
            type="info" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="testGameLoading"
          >
            <span>测试游戏</span>
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

    <!-- 游戏对话框（新增和编辑共用） -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑游戏' : '新增游戏'"
      width="800px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        class="dialog-form"
      >
        <el-form-item label="备注">
          <el-input
            v-model="formData.tag"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="钱包模式">
          <el-select
            v-model="formData.wallet_type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in walletTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏ID" prop="game_id">
          <el-input
            v-model="formData.game_id"
            placeholder="请输入"
            maxlength="100"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="游戏Code">
          <el-input
            v-model="formData.game_code"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="游戏英文名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="游戏中文名称">
          <el-input
            v-model="formData.name_cn"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="产品缩写">
          <el-input
            v-model="formData.common_name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input
            v-model="formData.product_code"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="formData.type_id"
            placeholder="请选择"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value.toString()"
            />
          </el-select>
          <div v-if="isEditMode" style="margin-top: 5px; color: #909399; font-size: 12px;">
            原分类: {{ (formData as any).original_category || "-" }}
          </div>
        </el-form-item>
        <el-form-item label="支持币种">
          <el-input
            v-model="formData.currency"
            placeholder="请输入"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="游戏类型">
          <el-input
            v-model="formData.common_content"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="当前自定义游戏类型">
          <el-input
            :model-value="formData.common_content"
            placeholder="请输入"
            maxlength="100"
            readonly
          />
        </el-form-item>
        <el-form-item label="修改自定义游戏类型">
          <el-input
            v-model="formData.common_content"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="游戏主图">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="formData.pic"
                placeholder="请输入"
                readonly
              />
              <el-button type="primary" @click="triggerImageUpload('pic')" :loading="uploading">
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
              <el-button type="default" @click="triggerImageUpload('pic')">
                选择
              </el-button>
            </div>
            <div class="image-upload-area">
              <el-upload
                ref="imageUploadRef"
                class="avatar-uploader"
                :action="''"
                :auto-upload="true"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="(options) => handleImageUpload(options, 'pic')"
                style="display: none"
              >
              </el-upload>
              <div
                v-if="!imageUrl"
                class="upload-placeholder"
                @click="triggerImageUpload('pic')"
              >
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <div v-else class="image-preview">
                <img :src="imageUrl" class="preview-image" />
                <el-button
                  type="primary"
                  link
                  class="delete-btn"
                  @click="handleRemoveImage('pic')"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="演示站游戏图">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="formData.web_pic"
                placeholder="请输入"
                readonly
              />
              <el-button type="primary" @click="triggerImageUpload('web_pic')" :loading="uploading">
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
              <el-button type="default" @click="triggerImageUpload('web_pic')">
                选择
              </el-button>
            </div>
            <div class="image-upload-area">
              <el-upload
                ref="webPicUploadRef"
                class="avatar-uploader"
                :action="''"
                :auto-upload="true"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="(options) => handleImageUpload(options, 'web_pic')"
                style="display: none"
              >
              </el-upload>
              <div
                v-if="!webPicUrl"
                class="upload-placeholder"
                @click="triggerImageUpload('web_pic')"
              >
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <div v-else class="image-preview">
                <img :src="webPicUrl" class="preview-image" />
                <el-button
                  type="primary"
                  link
                  class="delete-btn"
                  @click="handleRemoveImage('web_pic')"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="热门排序">
          <el-input-number
            v-model="formData.weigh"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="formData.ranking"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="宣传费率">
          <el-input
            v-model="formData.fee_rate"
            placeholder="请输入"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="RTP">
          <el-input
            v-model="formData.prize_rate"
            placeholder="请输入"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="formData.tag"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="封面文字内容">
          <el-input
            v-model="formData.pic_text"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="封面文字显示">
          <el-radio-group v-model="formData.pic_text_status">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推荐">
          <el-radio-group v-model="formData.recommend">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="-1">隐藏</el-radio>
            <el-radio label="0">维护</el-radio>
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

    <!-- 状态切换对话框 -->
    <el-dialog
      v-model="showStatusDialog"
      title="状态切换"
      width="400px"
      :close-on-click-modal="false"
      @close="handleCloseStatusDialog"
    >
      <div>
        <div style="font-size: 14px; color: #606266; display: flex; align-items: center;">
          <span>状态：</span>
          <el-radio-group v-model="statusDialogStatus">
            <el-radio label="1">正常</el-radio>
            <el-radio label="-1">隐藏</el-radio>
            <el-radio label="0">维护</el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseStatusDialog">取消</el-button>
          <el-button type="primary" @click="handleConfirmSwitchStatus" :loading="switchStatusLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.games-container {
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

/* 图片上传样式 */
.image-upload-container {
  width: 100%;
}

.image-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.image-input-group .el-input {
  flex: 1;
}

.image-input-group .el-button {
  white-space: nowrap;
}

.image-upload-area {
  position: relative;
}

.upload-placeholder {
  width: 178px;
  height: 178px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--el-transition-duration-fast);
  background-color: var(--el-fill-color-lighter);
}

.upload-placeholder:hover {
  border-color: var(--el-color-primary);
}

.upload-placeholder .upload-icon {
  font-size: 48px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}

.upload-placeholder .upload-text {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.image-preview {
  position: relative;
  width: 178px;
  height: 178px;
}

.image-preview .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-preview .delete-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

/* 对话框表单样式 */
.dialog-form {
  margin: 0 auto;
  padding-right: 30px;
}
</style>
