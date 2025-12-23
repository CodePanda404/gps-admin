<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "GameBrand"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElTooltip, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElRadioGroup, ElRadio, ElInputNumber, ElUpload, ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import {
  getGameBrandList,
  getSupplierList,
  addGameBrand,
  editGameBrand,
  deleteBatchGameBrand,
  syncGameBrand,
  syncGameBrandPics,
  testGameBrand,
  uploadImage,
  type GameBrandListParams,
  type GameBrandItem,
  type SupplierItem,
  type AddGameBrandParams,
  type EditGameBrandParams
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

// 初始化时获取供应商列表
fetchSupplierList();

// 搜索表单数据
const searchData = ref({
  id: "",
  wallet_type: "",
  name: "",
  type: "",
  shortname: "",
  game_count: "",
  provider: "",
  product_id: "",
  currency: "",
  type_code: "",
  type_description: "",
  status: "",
  updateTime: null as string[] | null
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
    label: "产品名称",
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品名称"
    }))
  },
  {
    label: "类型",
    prop: "type",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入类型"
    }))
  },
  {
    label: "缩写",
    prop: "shortname",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入缩写"
    }))
  },
  {
    label: "游戏数量",
    prop: "game_count",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入游戏数量"
    }))
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
      {
        label: "全部",
        value: ""
      },
      ...supplierOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
  },
  {
    label: "产品ID",
    prop: "product_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品ID"
    }))
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
    label: "类型代码",
    prop: "type_code",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入类型代码"
    }))
  },
  {
    label: "类型说明",
    prop: "type_description",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入类型说明"
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
        label: "正常",
        value: "1"
      },
      {
        label: "隐藏",
        value: "-1"
      },
      {
        label: "维护",
        value: "0"
      }
    ]
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
    name: "",
    type: "",
    shortname: "",
    game_count: "",
    provider: "",
    product_id: "",
    currency: "",
    type_code: "",
    type_description: "",
    status: "",
    updateTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = GameBrandItem;

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
    label: "产品名称",
    prop: "name",
    tableColumnProps: {
      align: "center"
    },
    width: 200
  },
  {
    label: "产品名称 (原厂商)",
    prop: "name_original",
    tableColumnProps: {
      align: "center"
    },
    width: 200
  },
  {
    label: "产品主图",
    prop: "pic",
    valueType: "img",
    fieldProps: {
      fit: "cover"
    },
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "类型",
    prop: "category",
    tableColumnProps: {
      align: "center"
    },
    width: 220
  },
  {
    label: "缩写",
    prop: "shortname",
    tableColumnProps: {
      align: "center"
    },
    width: 160
  },
  {
    label: "游戏数量",
    prop: "game_count",
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
    width: 160
  },
  {
    label: "产品ID",
    prop: "product_code",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
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
    label: "亚洲成本价",
    prop: "cost_price_asia",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "欧洲成本价",
    prop: "cost_price",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "亚洲市场价",
    prop: "market_price_asia",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "欧洲市场价",
    prop: "market_price",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "排序",
    prop: "sort_no",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "类型代码",
    prop: "type_code",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "类型说明",
    prop: "type_description",
    tableColumnProps: {
      align: "center"
    },
    minWidth: 180
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
        label = "开启";
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
    const { id, wallet_type, name, type, shortname, game_count, provider, product_id, currency, type_code, type_description, status, updateTime } = searchData.value;
    const params: GameBrandListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      wallet_type: wallet_type || undefined,
      name: name || undefined,
      type: type || undefined,
      shortname: shortname || undefined,
      game_count: game_count || undefined,
      provider: provider || undefined,
      product_id: product_id || undefined,
      currency: currency || undefined,
      type_code: type_code || undefined,
      type_desc: type_description || undefined,
      status: status || undefined
    };

    // 处理更新时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }

    const { data } = await getGameBrandList(params);

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

// 游戏品牌对话框相关（新增和编辑共用）
const showDialog = ref(false);
const isEditMode = ref(false);
const formRef = ref();
const formData = ref({
  id: 0,
  name: "",
  name_original: "",
  wallet_type: "",
  provider: "",
  category: "",
  pic: "",
  shortname: "",
  type_code: "",
  type_desc: "",
  product_code: "",
  sort_no: 0,
  cost_price: "",
  cost_price_asia: "",
  market_price: "",
  market_price_asia: "",
  currency: "",
  syn_currecny_to_games: "1",
  status: "1"
});
const formRules = {
  name: [
    { required: true, message: "请输入产品名称", trigger: "blur" }
  ]
};
const imageUrl = ref("");
const uploading = ref(false);
const imageUploadRef = ref();

// 操作按钮 loading 状态
const deleteLoading = ref(false);
const syncGamesLoading = ref(false);
const syncImagesLoading = ref(false);
const testGameLoading = ref(false);
const submitLoading = ref(false); // 表单提交 loading
const switchStatusLoading = ref(false); // 切换状态 loading

// 状态切换对话框相关
const showStatusDialog = ref(false);
const statusDialogRow = ref<TableRow | null>(null);
const statusDialogStatus = ref("1"); // 默认开启

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
const handleImageUpload = async (options: any) => {
  const { file } = options;
  uploading.value = true;
  
  try {
    const res = await uploadImage({
      file: file,
      type: "1"
    });

    if (res.code === 0) {
      imageUrl.value = res.data;
      formData.value.pic = res.data;
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
const triggerImageUpload = () => {
  const uploadEl = imageUploadRef.value?.$el?.querySelector('input[type="file"]');
  if (uploadEl) {
    uploadEl.click();
  }
};

// 移除图片
const handleRemoveImage = () => {
  imageUrl.value = "";
  formData.value.pic = "";
};

// 重置表单数据
const resetFormData = () => {
  formData.value = {
    id: 0,
    name: "",
    name_original: "",
    wallet_type: "",
    provider: "",
    category: "",
    pic: "",
    shortname: "",
    type_code: "",
    type_desc: "",
    product_code: "",
    sort_no: 0,
    cost_price: "",
    cost_price_asia: "",
    market_price: "",
    market_price_asia: "",
    currency: "",
    syn_currecny_to_games: "1",
    status: "1"
  };
  imageUrl.value = "";
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
          // 编辑模式
          const params: EditGameBrandParams = {
            id: formData.value.id,
            name: formData.value.name || undefined,
            shortname: formData.value.shortname || undefined,
            wallet_type: formData.value.wallet_type || undefined,
            provider: formData.value.provider || undefined,
            category: formData.value.category || undefined,
            currency: formData.value.currency || undefined,
            product_code: formData.value.product_code || undefined,
            type_code: formData.value.type_code || undefined,
            type_desc: formData.value.type_desc || undefined,
            cost_price: formData.value.cost_price || undefined,
            cost_price_asia: formData.value.cost_price_asia || undefined,
            market_price: formData.value.market_price || undefined,
            market_price_asia: formData.value.market_price_asia || undefined,
            pic: formData.value.pic || undefined,
            sort_no: formData.value.sort_no || undefined,
            syn_currecny_to_games: formData.value.syn_currecny_to_games || "1",
            status: formData.value.status || "1"
          };

          const res = await editGameBrand(params);

          if (res.code === 0) {
            message("编辑游戏品牌成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "编辑游戏品牌失败", { type: "error" });
          }
        } else {
          // 新增模式
          const params: AddGameBrandParams = {
            name: formData.value.name,
            shortname: formData.value.shortname || undefined,
            wallet_type: formData.value.wallet_type || undefined,
            provider: formData.value.provider || undefined,
            category: formData.value.category || undefined,
            currency: formData.value.currency || undefined,
            product_code: formData.value.product_code || undefined,
            type_code: formData.value.type_code || undefined,
            type_desc: formData.value.type_desc || undefined,
            cost_price: formData.value.cost_price || undefined,
            cost_price_asia: formData.value.cost_price_asia || undefined,
            market_price: formData.value.market_price || undefined,
            market_price_asia: formData.value.market_price_asia || undefined,
            pic: formData.value.pic || undefined,
            sort_no: formData.value.sort_no || undefined,
            syn_currecny_to_games: formData.value.syn_currecny_to_games || "1",
            status: formData.value.status || "1"
          };

          const res = await addGameBrand(params);

          if (res.code === 0) {
            message("新增游戏品牌成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "新增游戏品牌失败", { type: "error" });
          }
        }
      } catch (error: any) {
        console.error(`${isEditMode.value ? "编辑" : "新增"}游戏品牌失败:`, error);
        message(error?.message || `${isEditMode.value ? "编辑" : "新增"}游戏品牌失败`, { type: "error" });
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
    name: row.name || "",
    name_original: row.name_original || "",
    wallet_type: row.wallet_type ? String(row.wallet_type) : "",
    provider: row.provider || "",
    category: row.category || "",
    pic: row.pic || "",
    shortname: row.shortname || "",
    type_code: row.type_code || "",
    type_desc: row.type_desc || row.type_description || "",
    product_code: row.product_code || row.product_id || "",
    sort_no: row.sort_no || 0,
    cost_price: row.cost_price || "",
    cost_price_asia: row.cost_price_asia || "",
    market_price: row.market_price || "",
    market_price_asia: row.market_price_asia || "",
    currency: row.currency || "",
    syn_currecny_to_games: row.syn_currecny_to_games || row.sync_currency || "1",
    status: row.status || "1"
  };
  imageUrl.value = row.pic || "";
  showDialog.value = true;
};

// 删除单行数据
const handleDeleteRow = async (row: TableRow) => {
  const confirmMessage = `确定删除游戏品牌 ${row.name}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除游戏品牌", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 删除单行数据，使用批量删除API但只传一个id
      const res = await deleteBatchGameBrand({ ids: row.id.toString() });

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

// 批量删除（保留用于表格标题栏的删除按钮）
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要删除的数据！", { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const brandNames = multipleSelection.value.map(item => item.name).join("、");
  const confirmMessage = `确定删除游戏品牌 ${brandNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除游戏品牌", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的游戏品牌
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchGameBrand({ ids });

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

// 同步游戏
const handleSyncGames = async () => {
  if (multipleSelection.value.length !== 1) {
    message("请选择一条数据进行同步！", { type: "warning" });
    return;
  }

  const brand = multipleSelection.value[0];
  const confirmMessage = `是否确定同步品牌 ${brand.name} 到游戏？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "同步游戏", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    syncGamesLoading.value = true;
    try {
      const res = await syncGameBrand({ id: brand.id });

      if (res.code === 0) {
        message("同步游戏成功", { type: "success" });
      } else {
        message(res.msg || "同步游戏失败", { type: "error" });
      }
    } catch (error: any) {
      console.error("同步游戏失败:", error);
      message(error?.message || "同步游戏失败", { type: "error" });
    } finally {
      syncGamesLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("同步游戏失败:", error);
    }
  }
};

// 同步图片
const handleSyncImages = async () => {
  if (multipleSelection.value.length !== 1) {
    message("请选择一条数据进行同步！", { type: "warning" });
    return;
  }

  const brand = multipleSelection.value[0];
  const confirmMessage = `是否确定同步品牌 ${brand.name} 的图片？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "同步图片", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    syncImagesLoading.value = true;
    try {
      const res = await syncGameBrandPics({ id: brand.id });

      if (res.code === 0) {
        message("同步图片成功", { type: "success" });
      } else {
        message(res.msg || "同步图片失败", { type: "error" });
      }
    } catch (error: any) {
      console.error("同步图片失败:", error);
      message(error?.message || "同步图片失败", { type: "error" });
    } finally {
      syncImagesLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("同步图片失败:", error);
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
    // 模拟请求，暂时使用 setTimeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟成功响应
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
  if (multipleSelection.value.length !== 1) {
    message("请选择一条数据进行测试！", { type: "warning" });
    return;
  }

  const brand = multipleSelection.value[0];
  const confirmMessage = `是否确定测试品牌 ${brand.name} 的游戏？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "测试游戏", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "success"
    });

    testGameLoading.value = true;
    try {
      const res = await testGameBrand({ id: brand.id });

      if (res.code === 0 && res.data && res.data.game_url) {
        // 在新页面打开游戏网页地址
        window.open(res.data.game_url, "_blank");
        message("游戏页面已打开", { type: "success" });
      } else {
        message(res.msg || "获取游戏链接失败", { type: "error" });
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
  const sheetName = "游戏品牌";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `游戏品牌.xlsx`;
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
  a.download = "游戏品牌.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="game-brand-container">
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
          <div style="display: inline-flex; gap: 10px; align-items: center;">
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
              @click="handleDelete" 
              size="default"
              :disabled="multipleSelection.length === 0"
              :loading="deleteLoading"
            >
              <el-icon><component :is="Delete" /></el-icon>
              <span style="margin-left: 3px;">删除</span>
            </el-button>
            <el-button 
              @click="handleSyncGames" 
              type="warning" 
              size="default"
              :disabled="multipleSelection.length !== 1"
              :loading="syncGamesLoading"
            >
              <span>同步游戏</span>
            </el-button>
            <el-button 
              @click="handleSyncImages" 
              color="#626aef" 
              size="default"
              :disabled="multipleSelection.length !== 1"
              :loading="syncImagesLoading"
            >
              <span>同步图片</span>
            </el-button>
            <el-button 
              @click="handleTestGame" 
              type="info" 
              size="default"
              :disabled="multipleSelection.length !== 1"
              :loading="testGameLoading"
            >
              <span>测试游戏</span>
            </el-button>
          </div>
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

    <!-- 游戏品牌对话框（新增和编辑共用） -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑游戏品牌' : '新增游戏品牌'"
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
        <el-form-item label="产品名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="产品名称(原厂商)">
          <el-input
            v-model="formData.name_original"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="钱包类型">
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
        <el-form-item label="供应商">
          <el-select
            v-model="formData.provider"
            placeholder="请选择"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input
            v-model="formData.category"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="Logo">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="formData.pic"
                placeholder="请输入"
                readonly
              />
              <el-button type="primary" @click="triggerImageUpload" :loading="uploading">
                <el-icon><Upload /></el-icon>
                上传
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
                :http-request="handleImageUpload"
                style="display: none"
              >
              </el-upload>
              <div
                v-if="!imageUrl"
                class="upload-placeholder"
                @click="triggerImageUpload"
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
                  @click="handleRemoveImage"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="缩写">
          <el-input
            v-model="formData.shortname"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="类型代码">
          <el-input
            v-model="formData.type_code"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="类型说明">
          <el-input
            v-model="formData.type_desc"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="产品代码">
          <el-input
            v-model="formData.product_code"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="formData.sort_no"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="欧洲区成本价">
          <el-input
            v-model="formData.cost_price"
            placeholder="请输入"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="亚洲区成本价">
          <el-input
            v-model="formData.cost_price_asia"
            placeholder="请输入"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="欧洲区市场价">
          <el-input
            v-model="formData.market_price"
            placeholder="请输入"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="亚洲区市场价">
          <el-input
            v-model="formData.market_price_asia"
            placeholder="请输入"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="币种">
          <el-input
            v-model="formData.currency"
            placeholder="请输入"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="同步币种到游戏列表">
          <el-radio-group v-model="formData.syn_currecny_to_games">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
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
            确认
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
          <el-radio label="1">开启</el-radio>
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
