<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "Attachment"
});
import {
  type PlusColumn,
  PlusSearch,
  PlusTable,
  useTable,
  PlusPagination,
  type PageInfo
} from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { ElTag, ElTooltip, ElImage, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElUpload, ElButton, ElInput, ElInputNumber, ElMessageBox } from "element-plus";
import {
  getAttachmentList,
  addAttachment,
  editAttachment,
  deleteBatchAttachment,
  getAttachmentCategory,
  classifyAttachment,
  type AttachmentItem,
  type AttachmentListParams,
  type AddAttachmentParams,
  type EditAttachmentParams,
  type ClassifyAttachmentParams
} from "@/api/system";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Upload from "~icons/ep/upload";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import Setting from "~icons/ep/setting";

// 国际化
const { t } = useI18n();

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  category: "",
  filename: "",
  fileType: "",
  storage: "",
  imageType: "",
  createTime: [] as string[]
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    renderLabel: () => t("systemSettings.attachment.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "分类管理",
    renderLabel: () => t("systemSettings.attachment.search.category"),
    prop: "category",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: computed(() => categoryOptions.value)
  },
  {
    label: "文件名",
    renderLabel: () => t("systemSettings.attachment.search.filename"),
    prop: "filename",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "文件类型",
    renderLabel: () => t("systemSettings.attachment.search.fileType"),
    prop: "fileType",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("systemSettings.attachment.search.fileTypePlaceholder")
    })),
    options: computed(() => [
      { label: t("systemSettings.attachment.search.all"), value: "" },
      ...categoryOptions.value.filter(item => item.value !== "")
    ])
  },
  {
    label: "存储地",
    renderLabel: () => t("systemSettings.attachment.search.storage"),
    prop: "storage",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("systemSettings.attachment.search.storagePlaceholder")
    })),
    options: computed(() => [
      { label: t("systemSettings.attachment.search.all"), value: "" },
      { label: t("systemSettings.attachment.search.local"), value: "local" },
      { label: t("systemSettings.attachment.search.oss"), value: "oss" },
      { label: t("systemSettings.attachment.search.cos"), value: "cos" }
    ])
  },
  {
    label: "图片类型",
    renderLabel: () => t("systemSettings.attachment.search.imageType"),
    prop: "imageType",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("systemSettings.attachment.search.imageTypePlaceholder")
    })),
    options: computed(() => [
      { label: t("systemSettings.attachment.search.all"), value: "" },
      { label: t("systemSettings.attachment.search.jpg"), value: "jpg" },
      { label: t("systemSettings.attachment.search.png"), value: "png" },
      { label: t("systemSettings.attachment.search.gif"), value: "gif" },
      { label: t("systemSettings.attachment.search.webp"), value: "webp" }
    ])
  },
  {
    label: "创建时间",
    renderLabel: () => t("systemSettings.attachment.search.createTime"),
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
  }
];

// 点击搜索按钮
const handleSearch = (values: any) => {
  pageInfo.value.page = 1;
  getList();
};

// 重置搜索表单
const handleReset = () => {
  searchData.value = {
    id: "",
    category: "",
    filename: "",
    fileType: "",
    storage: "",
    imageType: "",
    createTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = AttachmentItem & {
  fileSize: string;
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 附件分类选项
const categoryOptions = ref<Array<{ label: string; value: string }>>([
  { label: t("systemSettings.attachment.search.all"), value: "" }
]);

// 获取附件分类
const getCategoryList = async () => {
  try {
    const res = await getAttachmentCategory();
    if (res.code === 0) {
      // 处理返回的数据格式
      let categories: Array<{ label: string; value: string }> = [];
      if (Array.isArray(res.data)) {
        categories = res.data.map(item => ({
          label: item.label || item.value,
          value: item.value
        }));
      } else if (typeof res.data === "object") {
        categories = Object.entries(res.data).map(([key, value]) => ({
          label: value as string,
          value: key
        }));
      }
      categoryOptions.value = [
        { label: t("systemSettings.attachment.search.all"), value: "" },
        ...categories
      ];
    }
  } catch (error: any) {
    console.error("获取附件分类失败:", error);
  }
};

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("systemSettings.attachment.table.id"),
    prop: "id",
    width: "100",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "分类管理",
    renderHeader: () => t("systemSettings.attachment.table.category"),
    prop: "category",
    width: "120",
    tableColumnProps: {
      align: "center"
    },
    render: (value: string) => {
      const category = categoryOptions.value.find(item => item.value === value);
      return h("span", category?.label || value);
    }
  },
  {
    label: "预览",
    renderHeader: () => t("systemSettings.attachment.table.preview"),
    prop: "url",
    width: "120",
    valueType: 'img',
    fieldProps: {
      fit:"cover"
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "文件名",
    renderHeader: () => t("systemSettings.attachment.table.filename"),
    prop: "filename",
    minWidth: "220",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "文件类型",
    renderHeader: () => t("systemSettings.attachment.table.fileType"),
    prop: "category",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "文件大小",
    renderHeader: () => t("systemSettings.attachment.table.fileSize"),
    prop: "filesize",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "存储地",
    renderHeader: () => t("systemSettings.attachment.table.storage"),
    prop: "storage",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "图片类型",
    renderHeader: () => t("systemSettings.attachment.table.imageType"),
    prop: "imagetype",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    renderHeader: () => t("systemSettings.attachment.table.createTime"),
    prop: "createtime",
    width: "180",
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("systemSettings.attachment.buttons.edit"),
    code: "edit",
    props: {
      type: "primary",
      link: true
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEditRow(row);
    }
  },
  {
    text: () => t("systemSettings.attachment.buttons.delete"),
    code: "delete",
    props: {
      type: "danger",
      link: true
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleDeleteRow(row);
    }
  }
];

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

// 获取完整图片URL
const getImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // 如果URL以 / 开头，可能需要拼接域名
  return url;
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const params: AttachmentListParams = {
      pageNumber: pageInfo.value.page,
      pageSize: pageInfo.value.pageSize
    };

    if (searchData.value.id) {
      params.id = searchData.value.id;
    }
    if (searchData.value.category) {
      params.category = searchData.value.category;
    }
    if (searchData.value.filename) {
      params.filename = searchData.value.filename;
    }
    if (searchData.value.fileType) {
      params.category = searchData.value.fileType;
    }
    if (searchData.value.storage) {
      params.storage = searchData.value.storage;
    }
    if (searchData.value.imageType) {
      params.imagetype = searchData.value.imageType;
    }
    if (searchData.value.createTime && searchData.value.createTime.length === 2) {
      params.create_start_time = searchData.value.createTime[0];
      params.create_end_time = searchData.value.createTime[1];
    }

    const res = await getAttachmentList(params);

    if (res.code === 0) {
      tableData.value = res.data.rows.map(item => ({
        ...item,
        fileSize: formatFileSize(item.filesize)
      })) as TableRow[];
      total.value = res.data.total;
      pageInfo.value.page = Number(res.data.pageNumber);
      pageInfo.value.pageSize = Number(res.data.pageSize);
    } else {
      message(res.msg || t("systemSettings.attachment.message.getListFail"), { type: "error" });
      tableData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("systemSettings.attachment.message.getListFail"), { type: "error" });
    tableData.value = [];
    total.value = 0;
  } finally {
    loadingStatus.value = false;
  }
};

// 编辑附件对话框相关
const showEditDialog = ref(false);
const editFormRef = ref();
const editFormData = ref({
  id: 0,
  category: "",
  image: "",
  jumpType: "",
  jumpLink: "",
  sort: 0,
  imageWidth: "",
  imageHeight: "",
  imageType: "",
  imageFrames: "",
  fileSize: "",
  mimetype: "",
  exparam: "",
  uploadTime: "",
  storage: ""
});

// 跳转类型选项
const jumpTypeOptions = computed(() => [
  { label: t("systemSettings.attachment.select.pleaseSelect"), value: "" },
  { label: t("systemSettings.attachment.select.homePage"), value: "1" },
  { label: t("systemSettings.attachment.select.subPage"), value: "2" },
  { label: t("systemSettings.attachment.select.external"), value: "3" },
  { label: t("systemSettings.attachment.select.emptyLink"), value: "4" }
]);

// 存储地选项
const storageOptions = computed(() => [
  { label: t("systemSettings.attachment.search.local"), value: "local" },
  { label: t("systemSettings.attachment.search.oss"), value: "oss" },
  { label: t("systemSettings.attachment.search.cos"), value: "cos" }
]);

// 编辑图片上传相关
const editImageUrl = ref("");
const editUploading = ref(false);
const editImageUploadRef = ref();

// 编辑图片上传前的处理
const beforeEditImageUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message(t("systemSettings.attachment.message.onlyImage"), { type: "error" });
    return false;
  }
  return true;
};

// 处理编辑图片上传
const handleEditImageUpload = async (options: any) => {
  const { file } = options;
  editUploading.value = true;
  
  try {
    // TODO: 对接实际上传API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟上传成功
    const fileUrl = URL.createObjectURL(file);
    editImageUrl.value = fileUrl;
    editFormData.value.image = fileUrl;
    message(t("systemSettings.attachment.message.imageUploadSuccess"), { type: "success" });
  } catch (error: any) {
    console.error("图片上传失败:", error);
    message(error?.message || t("systemSettings.attachment.message.imageUploadFail"), { type: "error" });
  } finally {
    editUploading.value = false;
  }
};

// 删除编辑图片
const handleRemoveEditImage = () => {
  if (editImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(editImageUrl.value);
  }
  editImageUrl.value = "";
  editFormData.value.image = "";
};

// 打开编辑对话框
const handleEditRow = (row: TableRow) => {
  showEditDialog.value = true;
  // 填充表单数据
  const imageUrl = getImageUrl(row.url);
  editFormData.value = {
    id: row.id,
    category: row.category || "",
    image: imageUrl || "",
    jumpType: row.type?.toString() || "",
    jumpLink: row.path || "",
    sort: row.sort_no || 0,
    imageWidth: row.imagewidth || "",
    imageHeight: row.imageheight || "",
    imageType: row.imagetype || "",
    imageFrames: row.imageframes?.toString() || "",
    fileSize: formatFileSize(row.filesize),
    mimetype: row.mimetype || "",
    exparam: row.extparam || "",
    uploadTime: row.createtime || "",
    storage: row.storage || ""
  };
  editImageUrl.value = imageUrl || "";
};

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  showEditDialog.value = false;
  // 清理blob URL
  if (editImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(editImageUrl.value);
  }
  editFormData.value = {
    id: 0,
    category: "",
    image: "",
    jumpType: "",
    jumpLink: "",
    sort: 0,
    imageWidth: "",
    imageHeight: "",
    imageType: "",
    imageFrames: "",
    fileSize: "",
    mimetype: "",
    exparam: "",
    uploadTime: "",
    storage: ""
  };
  editImageUrl.value = "";
};

// 提交编辑表单
const handleSubmitEdit = async () => {
  try {
    const params: EditAttachmentParams = {
      id: editFormData.value.id.toString(),
      category: editFormData.value.category || undefined,
      url: editFormData.value.image || undefined,
      type: editFormData.value.jumpType || undefined,
      path: editFormData.value.jumpLink || "",
      sort_no: editFormData.value.sort.toString()
    };

    const res = await editAttachment(params);

    if (res.code === 0) {
      message(t("systemSettings.attachment.message.editSuccess"), { type: "success" });
      handleCloseEditDialog();
      // 刷新列表
      getList();
    } else {
      message(res.msg || t("systemSettings.attachment.message.editFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("编辑附件失败:", error);
    message(error?.message || t("systemSettings.attachment.message.editFail"), { type: "error" });
  }
};

// 删除行
const handleDeleteRow = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      t("systemSettings.attachment.message.confirmDelete", { filename: row.filename }),
      t("systemSettings.attachment.delete.title"),
      {
        confirmButtonText: t("systemSettings.attachment.buttons.confirm"),
        cancelButtonText: t("systemSettings.attachment.buttons.cancel"),
        type: "warning"
      }
    );

    const res = await deleteBatchAttachment({ ids: row.id.toString() });

    if (res.code === 0) {
      message(t("systemSettings.attachment.message.deleteSuccess"), { type: "success" });
      // 刷新列表
      getList();
    } else {
      message(res.msg || t("systemSettings.attachment.message.deleteFail"), { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除附件失败:", error);
      message(error?.message || t("systemSettings.attachment.message.deleteFail"), { type: "error" });
    }
  }
};

// 新增附件对话框相关
const showAddDialog = ref(false);
const addFormRef = ref();
const addFormData = ref({
  fileType: "",
  files: [] as Array<{ url: string; name: string; uid: number }>
});

// 文件类型选项（从接口获取，这里使用 categoryOptions）
const fileTypeOptions = computed(() => 
  categoryOptions.value.filter(item => item.value !== "")
);

// 文件上传相关
const uploadRef = ref();
const uploading = ref(false);

// 文件上传前的处理
const beforeUpload = (file: File) => {
  // 可以在这里添加文件大小、类型等验证
  return true;
};

// 处理文件上传
const handleFileUpload = async (options: any) => {
  const { file } = options;
  
  if (!addFormData.value.fileType) {
    message(t("systemSettings.attachment.message.selectFileType"), { type: "warning" });
    return;
  }
  
  uploading.value = true;
  
  try {
    const params: AddAttachmentParams = {
      file: file
    };

    const res = await addAttachment(params);

    if (res.code === 0) {
      // 上传成功后，需要调用编辑接口设置 category
      if (res.data?.id) {
        try {
          await editAttachment({
            id: res.data.id.toString(),
            category: addFormData.value.fileType
          });
        } catch (error) {
          console.error("设置附件分类失败:", error);
        }
      }
      
      // 上传成功，添加到文件列表
      const fileUrl = res.data?.url || URL.createObjectURL(file);
      const fileItem = {
        url: fileUrl,
        name: file.name,
        uid: Date.now()
      };
      
      addFormData.value.files.push(fileItem);
      message(t("systemSettings.attachment.message.fileUploadSuccess"), { type: "success" });
    } else {
      message(res.msg || t("systemSettings.attachment.message.fileUploadFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("文件上传失败:", error);
    message(error?.message || t("systemSettings.attachment.message.fileUploadFail"), { type: "error" });
  } finally {
    uploading.value = false;
  }
};

// 删除已上传的文件
const handleRemoveFile = (fileItem: { url: string; name: string; uid: number }) => {
  const index = addFormData.value.files.findIndex(item => item.uid === fileItem.uid);
  if (index > -1) {
    // 如果是blob URL，需要释放
    if (fileItem.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileItem.url);
    }
    addFormData.value.files.splice(index, 1);
  }
};

// 打开新增对话框
const handleAdd = () => {
  showAddDialog.value = true;
  // 重置表单
  addFormData.value = {
    fileType: "",
    files: []
  };
};

// 关闭新增对话框
const handleCloseAddDialog = () => {
  showAddDialog.value = false;
  // 清理blob URLs
  addFormData.value.files.forEach(file => {
    if (file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  });
  addFormData.value = {
    fileType: "",
    files: []
  };
};

// 提交新增表单
const handleSubmitAdd = async () => {
  if (!addFormData.value.fileType) {
    message(t("systemSettings.attachment.message.selectFileType"), { type: "warning" });
    return;
  }
  
  if (addFormData.value.files.length === 0) {
    message(t("systemSettings.attachment.message.uploadAtLeastOne"), { type: "warning" });
    return;
  }
  
  // 新增时文件已经通过 handleFileUpload 上传了
  // 这里只需要关闭对话框并刷新列表
  try {
    message(t("systemSettings.attachment.message.addSuccess"), { type: "success" });
    handleCloseAddDialog();
    // 刷新列表
    getList();
  } catch (error: any) {
    console.error("新增附件失败:", error);
    message(error?.message || t("systemSettings.attachment.message.addFail"), { type: "error" });
  }
};

// 编辑（批量）
const handleEdit = () => {
  if (multipleSelection.value.length === 0) {
    message(t("systemSettings.attachment.message.selectToEdit"), { type: "warning" });
    return;
  }
  if (multipleSelection.value.length > 1) {
    message(t("systemSettings.attachment.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 删除（批量）
const handleDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message(t("systemSettings.attachment.message.selectToDelete"), { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(
      t("systemSettings.attachment.message.confirmBatchDelete", { count: multipleSelection.value.length }),
      t("systemSettings.attachment.delete.batchTitle"),
      {
        confirmButtonText: t("systemSettings.attachment.buttons.confirm"),
        cancelButtonText: t("systemSettings.attachment.buttons.cancel"),
        type: "warning"
      }
    );

    const ids = multipleSelection.value.map(item => item.id).join(",");
    const res = await deleteBatchAttachment({ ids });

    if (res.code === 0) {
      message(t("systemSettings.attachment.message.batchDeleteSuccess"), { type: "success" });
      multipleSelection.value = [];
      // 刷新列表
      getList();
    } else {
      message(res.msg || t("systemSettings.attachment.message.batchDeleteFail"), { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批量删除附件失败:", error);
      message(error?.message || t("systemSettings.attachment.message.batchDeleteFail"), { type: "error" });
    }
  }
};

// 分类对话框相关
const showClassifyDialog = ref(false);
const classifyFormData = ref({
  category: ""
});

// 打开分类对话框
const handleCategory = () => {
  if (multipleSelection.value.length === 0) {
    message(t("systemSettings.attachment.message.selectToClassify"), { type: "warning" });
    return;
  }
  showClassifyDialog.value = true;
  classifyFormData.value.category = "";
};

// 关闭分类对话框
const handleCloseClassifyDialog = () => {
  showClassifyDialog.value = false;
  classifyFormData.value.category = "";
};

// 提交分类
const handleSubmitClassify = async () => {
  if (!classifyFormData.value.category) {
    message(t("systemSettings.attachment.message.selectCategory"), { type: "warning" });
    return;
  }

  if (multipleSelection.value.length === 0) {
    message(t("systemSettings.attachment.message.selectToClassify"), { type: "warning" });
    return;
  }

  try {
    const params: ClassifyAttachmentParams = {
      category: classifyFormData.value.category,
      ids: multipleSelection.value.map(item => item.id).join(",")
    };

    const res = await classifyAttachment(params);

    if (res.code === 0) {
      message(t("systemSettings.attachment.message.classifySuccess"), { type: "success" });
      handleCloseClassifyDialog();
      multipleSelection.value = [];
      // 刷新列表
      getList();
    } else {
      message(res.msg || t("systemSettings.attachment.message.classifyFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("分类失败:", error);
    message(error?.message || t("systemSettings.attachment.message.classifyFail"), { type: "error" });
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
getCategoryList();
getList();
</script>

<template>
  <div class="attachment-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card" shadow="never">
        <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="110"
        label-position="right"
        :has-unfold="false"
        :searchText="t('systemSettings.attachment.buttons.search')"
        :resetText="t('systemSettings.attachment.buttons.reset')"
        @search="handleSearch"
        @reset="handleReset"
      />
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never">
      <PlusTable
        v-loading="loadingStatus"
        :columns="tableConfig"
        :table-data="tableData"
        :stripe="true"
        :is-selection="true"
        :adaptive="true"
        :action-bar="{
          buttons,
          width: '120px',
          label: t('systemSettings.attachment.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="(val: TableRow[]) => multipleSelection = val"
      >
        <!-- 表格标题栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t("systemSettings.attachment.buttons.add") }}</span>
          </el-button>
          <el-button
            type="success"
            @click="handleEdit"
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t("systemSettings.attachment.buttons.edit") }}</span>
          </el-button>
          <el-button
            type="danger"
            @click="handleDelete"
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t("systemSettings.attachment.buttons.delete") }}</span>
          </el-button>
          <el-button
            type="info"
            @click="handleCategory"
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t("systemSettings.attachment.buttons.classify") }}</span>
          </el-button>
          </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('systemSettings.attachment.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('systemSettings.attachment.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('systemSettings.attachment.toolbar.hideSearch') : t('systemSettings.attachment.toolbar.showSearch')"
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
          <el-tooltip :content="t('systemSettings.attachment.toolbar.export')" placement="top" :trigger="'hover'">
            <span style="display: inline-block">
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

    <!-- 新增附件对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="t('systemSettings.attachment.add.title')"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseAddDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addFormData"
        label-width="140px"
      >
        <el-form-item :label="t('systemSettings.attachment.add.fileType')" required>
          <el-select
            v-model="addFormData.fileType"
            :placeholder="t('systemSettings.attachment.select.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="item in fileTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.add.selectFile')" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="true"
            :before-upload="beforeUpload"
            :http-request="handleFileUpload"
            :show-file-list="false"
            multiple
          >
            <el-button type="primary" :loading="uploading">
              <el-icon><component :is="Upload" /></el-icon>
              <span style="margin-left: 5px;">{{ t("systemSettings.attachment.add.clickUpload") }}</span>
            </el-button>
          </el-upload>
        </el-form-item>

        <!-- 已上传文件列表 -->
        <el-form-item v-if="addFormData.files.length > 0" label="">
          <div class="uploaded-files">
            <div
              v-for="file in addFormData.files"
              :key="file.uid"
              class="file-item"
            >
              <div class="file-preview">
                <el-image
                  v-if="file.url"
                  :src="file.url"
                  fit="cover"
                  style="width: 100px; height: 100px"
                  :preview-src-list="[file.url]"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><component :is="Upload" /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="file-name">{{ file.name }}</div>
              <el-button
                type="primary"
                link
                @click="handleRemoveFile(file)"
                style="color: #409eff;"
              >
                {{ t("systemSettings.attachment.buttons.delete") }}
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddDialog">{{ t("systemSettings.attachment.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmitAdd">{{ t("systemSettings.attachment.buttons.confirm") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑附件对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="t('systemSettings.attachment.edit.title')"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        label-width="100px"
      >
        <el-form-item :label="t('systemSettings.attachment.edit.category')">
          <el-select
            v-model="editFormData.category"
            :placeholder="t('systemSettings.attachment.select.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.image')">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <el-input
              v-model="editFormData.image"
              :placeholder="t('placeholder.input')"
              style="flex: 1"
            />
            <el-upload
              ref="editImageUploadRef"
              :auto-upload="true"
              :before-upload="beforeEditImageUpload"
              :http-request="handleEditImageUpload"
              :show-file-list="false"
            >
              <el-button type="primary" :loading="editUploading">
                <el-icon><component :is="Upload" /></el-icon>
                <span style="margin-left: 5px;">{{ t("systemSettings.attachment.edit.upload") }}</span>
              </el-button>
            </el-upload>
            <el-button type="primary">
              <el-icon><component :is="Setting" /></el-icon>
              <span style="margin-left: 5px;">{{ t("systemSettings.attachment.edit.select") }}</span>
            </el-button>
          </div>
          <div style="position: relative; display: inline-block;">
            <el-upload
              class="image-uploader"
              :auto-upload="true"
              :before-upload="beforeEditImageUpload"
              :http-request="handleEditImageUpload"
              :show-file-list="false"
            >
              <div v-if="!editImageUrl" class="upload-area">
                <el-icon class="upload-icon"><component :is="Plus" /></el-icon>
                <div class="upload-text">{{ t("systemSettings.attachment.edit.clickUploadImage") }}</div>
              </div>
              <div v-else class="image-preview-wrapper">
                <el-image
                  :src="editImageUrl"
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="[editImageUrl]"
                />
              </div>
            </el-upload>
            <el-button
              v-if="editImageUrl"
              type="primary"
              link
              @click="handleRemoveEditImage"
              class="delete-image-btn"
            >
              {{ t("systemSettings.attachment.buttons.delete") }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.jumpType')">
          <el-select
            v-model="editFormData.jumpType"
            :placeholder="t('systemSettings.attachment.select.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="item in jumpTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.jumpLink')">
          <el-input
            v-model="editFormData.jumpLink"
            :placeholder="t('placeholder.input')"
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.sort')">
          <el-input-number
            v-model="editFormData.sort"
            :placeholder="t('placeholder.input')"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.imageWidth')">
          <el-input
            v-model="editFormData.imageWidth"
            :placeholder="t('placeholder.input')"
            disabled
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.imageHeight')">
          <el-input
            v-model="editFormData.imageHeight"
            :placeholder="t('placeholder.input')"
            disabled
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.imageType')">
          <el-input
            v-model="editFormData.imageType"
            :placeholder="t('placeholder.input')"
            disabled
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.fileSize')">
          <el-input
            v-model="editFormData.fileSize"
            :placeholder="t('placeholder.input')"
            disabled
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.uploadTime')">
          <el-input
            v-model="editFormData.uploadTime"
            :placeholder="t('placeholder.input')"
            disabled
          />
        </el-form-item>

        <el-form-item :label="t('systemSettings.attachment.edit.storage')">
          <el-select
            v-model="editFormData.storage"
            :placeholder="t('systemSettings.attachment.select.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="item in storageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEditDialog">{{ t("systemSettings.attachment.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmitEdit">{{ t("systemSettings.attachment.buttons.confirm") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分类对话框 -->
    <el-dialog
      v-model="showClassifyDialog"
      :title="t('systemSettings.attachment.classify.title')"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseClassifyDialog"
    >
      <el-form
        :model="classifyFormData"
        label-width="100px"
      >
        <el-form-item :label="t('systemSettings.attachment.classify.category')" required>
          <el-select
            v-model="classifyFormData.category"
            :placeholder="t('systemSettings.attachment.select.pleaseSelect')"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === ''"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseClassifyDialog">{{ t("systemSettings.attachment.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmitClassify">{{ t("systemSettings.attachment.buttons.confirm") }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.attachment-container {
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
.attachment-container {
  width: 100%;
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

.uploaded-files {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-preview {
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
    display: flex;
    align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.file-name {
  font-size: 12px;
        color: #606266;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.image-uploader {
  position: relative;
}

.upload-area {
  width: 200px;
  height: 200px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f5f7fa;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 10px;
}

.upload-text {
  color: #8c939d;
  font-size: 14px;
}

.image-preview-wrapper {
  width: 200px;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.delete-image-btn {
  position: absolute;
  right: 0;
  top: 0;
  color: #409eff;
}
</style>
