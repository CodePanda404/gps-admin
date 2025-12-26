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
import { message } from "@/utils/message";
import { ElTag, ElTooltip, ElImage, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElUpload, ElButton, ElInput, ElInputNumber, ElMessageBox } from "element-plus";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Upload from "~icons/ep/upload";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import Setting from "~icons/ep/setting";

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
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入ID"
    }))
  },
  {
    label: "分类管理",
    prop: "category",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入分类管理"
    }))
  },
  {
    label: "文件名",
    prop: "filename",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入文件名"
    }))
  },
  {
    label: "文件类型",
    prop: "fileType",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择文件类型"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "产品主图", value: "product_main" },
      { label: "产品介绍图", value: "product_intro" },
      { label: "文件", value: "file" }
    ]
  },
  {
    label: "存储地",
    prop: "storage",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择存储地"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "本地", value: "local" },
      { label: "OSS", value: "oss" },
      { label: "COS", value: "cos" }
    ]
  },
  {
    label: "图片类型",
    prop: "imageType",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择图片类型"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "JPG", value: "jpg" },
      { label: "PNG", value: "png" },
      { label: "GIF", value: "gif" },
      { label: "WEBP", value: "webp" }
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
type TableRow = {
  id: number;
  category: string;
  preview: string;
  filename: string;
  fileSize: string;
  imageWidth?: number;
  imageHeight?: number;
  storage: string;
  imageType: string;
  createtime: string;
  jumpType?: string;
  jumpLink?: string;
  sort?: number;
  imageFrames?: string;
  mimetype?: string;
  exparam?: string;
  uploadTime?: string;
};

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
    width: "100",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "分类管理",
    prop: "category",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "预览",
    prop: "preview",
    width: "120",
    tableColumnProps: {
      align: "center"
    },
    render: ({ row }: { row: TableRow }) => {
      if (!row.preview) {
        return h("span", "-");
      }
      return h(ElImage, {
        src: row.preview,
        style: { width: "60px", height: "60px", objectFit: "cover" },
        previewSrcList: [row.preview],
        fit: "cover"
      });
    }
  },
  {
    label: "文件名",
    prop: "filename",
    minWidth: "150",
    tableColumnProps: {
      align: "center"
    },
    render: ({ row }: { row: TableRow }) => {
      return h(
        ElTooltip,
        {
          content: row.filename,
          placement: "top"
        },
        {
          default: () =>
            h(
              "span",
              {
                style: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                  maxWidth: "150px"
                }
              },
              row.filename
            )
        }
      );
    }
  },
  {
    label: "文件大小",
    prop: "fileSize",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "存储地",
    prop: "storage",
    width: "120",
    tableColumnProps: {
      align: "center"
    },
    render: ({ row }: { row: TableRow }) => {
      const storageMap: Record<string, string> = {
        local: "本地",
        oss: "OSS",
        cos: "COS"
      };
      return h("span", storageMap[row.storage] || row.storage);
    }
  },
  {
    label: "图片类型",
    prop: "imageType",
    width: "120",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
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
    text: "编辑",
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
    text: "删除",
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

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        category: "产品图片",
        preview: "https://via.placeholder.com/60",
        filename: "product_image_001.jpg",
        fileSize: "2.5MB",
        imageWidth: 1920,
        imageHeight: 1080,
        storage: "local",
        imageType: "JPG",
        createtime: "2025-01-15 10:30:00"
      },
      {
        id: 2,
        category: "文章图片",
        preview: "https://via.placeholder.com/60",
        filename: "article_image_002.png",
        fileSize: "1.8MB",
        imageWidth: 1200,
        imageHeight: 800,
        storage: "oss",
        imageType: "PNG",
        createtime: "2025-01-14 15:20:00"
      }
    ] as TableRow[];
    total.value = 2;
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
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
const jumpTypeOptions = [
  { label: "无", value: "" },
  { label: "内部链接", value: "internal" },
  { label: "外部链接", value: "external" }
];

// 存储地选项
const storageOptions = [
  { label: "本地", value: "local" },
  { label: "OSS", value: "oss" },
  { label: "COS", value: "cos" }
];

// 编辑图片上传相关
const editImageUrl = ref("");
const editUploading = ref(false);
const editImageUploadRef = ref();

// 编辑图片上传前的处理
const beforeEditImageUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message("只能上传图片文件！", { type: "error" });
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
    message("图片上传成功", { type: "success" });
  } catch (error: any) {
    console.error("图片上传失败:", error);
    message(error?.message || "图片上传失败", { type: "error" });
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
  editFormData.value = {
    id: row.id,
    category: row.category || "",
    image: row.preview || "",
    jumpType: row.jumpType || "",
    jumpLink: row.jumpLink || "",
    sort: 0,
    imageWidth: row.imageWidth?.toString() || "",
    imageHeight: row.imageHeight?.toString() || "",
    imageType: row.imageType || "",
    imageFrames: row.imageFrames || "",
    fileSize: row.fileSize || "",
    mimetype: row.mimetype || "",
    exparam: row.exparam || "",
    uploadTime: row.uploadTime || row.createtime || "",
    storage: row.storage || ""
  };
  editImageUrl.value = row.preview || "";
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
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("编辑附件成功", { type: "success" });
    handleCloseEditDialog();
    // 刷新列表
    getList();
  } catch (error: any) {
    console.error("编辑附件失败:", error);
    message(error?.message || "编辑附件失败", { type: "error" });
  }
};

// 删除行
const handleDeleteRow = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      `确定删除附件"${row.filename}"吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("删除附件成功", { type: "success" });
    // 刷新列表
    getList();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除附件失败:", error);
      message(error?.message || "删除附件失败", { type: "error" });
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

// 文件类型选项
const fileTypeOptions = [
  { label: "产品主图", value: "product_main" },
  { label: "产品介绍图", value: "product_intro" },
  { label: "文件", value: "file" }
];

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
  uploading.value = true;
  
  try {
    // TODO: 对接实际上传API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟上传成功，生成预览URL
    const fileUrl = URL.createObjectURL(file);
    const fileItem = {
      url: fileUrl,
      name: file.name,
      uid: Date.now()
    };
    
    addFormData.value.files.push(fileItem);
    message("文件上传成功", { type: "success" });
  } catch (error: any) {
    console.error("文件上传失败:", error);
    message(error?.message || "文件上传失败", { type: "error" });
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
    message("请选择附件类型", { type: "warning" });
    return;
  }
  
  if (addFormData.value.files.length === 0) {
    message("请至少上传一个文件", { type: "warning" });
    return;
  }
  
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("新增附件成功", { type: "success" });
    handleCloseAddDialog();
    // 刷新列表
    getList();
  } catch (error: any) {
    console.error("新增附件失败:", error);
    message(error?.message || "新增附件失败", { type: "error" });
  }
};

// 编辑（批量）
const handleEdit = () => {
  if (multipleSelection.value.length === 0) {
    message("请选择要编辑的数据", { type: "warning" });
    return;
  }
  if (multipleSelection.value.length > 1) {
    message("请选择单条数据进行编辑", { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 删除（批量）
const handleDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message("请选择要删除的数据", { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${multipleSelection.value.length} 条数据吗？`,
      "批量删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("批量删除附件成功", { type: "success" });
    // 刷新列表
    getList();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批量删除附件失败:", error);
      message(error?.message || "批量删除附件失败", { type: "error" });
    }
  }
};

// 分类管理
const handleCategory = () => {
  message("分类管理功能待实现", { type: "info" });
  // TODO: 实现分类管理功能
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
</script>

<template>
  <div class="attachment-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card" shadow="never">
        <PlusSearch
        v-model="searchData"
          :columns="searchColumns"
        label-width="80"
        label-position="right"
          :has-unfold="false"
        searchText="搜索"
        resetText="重置"
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
          label: '操作'
        }"
        width="100%"
        height="90%"
        @selection-change="(val: TableRow[]) => multipleSelection = val"
      >
        <!-- 表格标题栏按钮 -->
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
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">删除</span>
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
      title="新增附件"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseAddDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addFormData"
        label-width="100px"
      >
        <el-form-item label="附件类型">
          <el-select
            v-model="addFormData.fileType"
            placeholder="请选择"
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

        <el-form-item label="上传">
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
              <span style="margin-left: 5px;">点击上传</span>
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
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmitAdd">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑附件对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑附件"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        label-width="100px"
      >
        <el-form-item label="分类管理">
          <el-select
            v-model="editFormData.category"
            placeholder="请选择"
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

        <el-form-item label="图片">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <el-input
              v-model="editFormData.image"
              placeholder="请输入"
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
                <span style="margin-left: 5px;">上传</span>
              </el-button>
            </el-upload>
            <el-button type="primary">
              <el-icon><component :is="Setting" /></el-icon>
              <span style="margin-left: 5px;">选择</span>
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
                <div class="upload-text">点击上传图片</div>
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
              删除
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-select
            v-model="editFormData.jumpType"
            placeholder="请选择"
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

        <el-form-item label="跳转链接">
          <el-input
            v-model="editFormData.jumpLink"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number
            v-model="editFormData.sort"
            placeholder="请输入"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="图片宽度">
          <el-input
            v-model="editFormData.imageWidth"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="图片高度">
          <el-input
            v-model="editFormData.imageHeight"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="图片类型">
          <el-input
            v-model="editFormData.imageType"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="Image frames">
          <el-input
            v-model="editFormData.imageFrames"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="文件大小">
          <el-input
            v-model="editFormData.fileSize"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="Minetype">
          <el-input
            v-model="editFormData.mimetype"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="Exparam">
          <el-input
            v-model="editFormData.exparam"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="上传时间">
          <el-input
            v-model="editFormData.uploadTime"
            placeholder="请输入"
          />
        </el-form-item>

        <el-form-item label="存储地">
          <el-select
            v-model="editFormData.storage"
            placeholder="请选择"
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
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmitEdit">确认</el-button>
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
