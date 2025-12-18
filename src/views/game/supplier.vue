<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "Supplier"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag } from "element-plus";
import {
  getSupplierList,
  addSupplier,
  editSupplier,
  deleteSupplier,
  uploadImage,
  type SupplierListParams,
  type SupplierItem,
  type AddSupplierParams,
  type EditSupplierParams,
  type DeleteSupplierParams
} from "@/api/game";
import { ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElSwitch, ElUpload, ElButton, ElRadioGroup, ElRadio } from "element-plus";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import More from "~icons/ep/more";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
  remark: "",
  status: "",
  updateTime: [] as string[]
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
      placeholder: "ID"
    }))
  },
  {
    label: "供应商",
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "供应商"
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
    name: "",
    remark: "",
    status: "",
    updateTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用后端字段）
type TableRow = SupplierItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置（根据后端字段调整）
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id"
  },
  {
    label: "供应商名称",
    prop: "name"
  },
 {
    label: 'logo',
    prop: 'pic',
    valueType: 'img',
    fieldProps: {
      fit:"cover"
   }
  },
  {
    label: "备注",
    prop: "remark"
  },
  {
    label: "排序",
    prop: "sort_no"
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true
    }
  },
  {
    label: "更新时间",
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true
    }
  },
  {
    label: "状态",
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === '1' ? "success" : "danger"
      }, () => value === '1' ? '正常' : '隐藏');
    },
    tableColumnProps: {
      sortable: true
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

// 状态切换处理
const handleStatusChange = async (params: any) => {
  const { row, prop, value } = params;
  const typedRow = row as TableRow;
  if (prop !== "status") {
    return;
  }

  if (!typedRow) {
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  // value 是切换后的状态值（"1" 或 "-1"）
  const originalStatus = value === "1" ? "-1" : "1";
  const isDisabling = value === "-1";

  const confirmMessage = isDisabling
    ? `是否确定将供应商${typedRow.name}隐藏?`
    : `是否确定将供应商${typedRow.name}恢复正常?`;

  // 查找当前行在 tableData 中的索引
  const index = tableData.value.findIndex(item => item.id === typedRow.id);
  if (index === -1) {
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  try {
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      draggable: true
    });

    // TODO: 调用真实的状态切换接口
    // const res = await updateSupplierStatus({ id: typedRow.id, status: value });
    const res = {
      code: 0,
      msg: "状态切换成功"
    };

    if (res.code === 0) {
      message(isDisabling ? "已隐藏" : "已恢复正常", {
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
      message(res.msg || "状态切换失败", { type: "error" });
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
    const { id, name, remark, status, updateTime } = searchData.value;
    
    const params: SupplierListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      name: name || undefined,
      remark: remark || undefined,
      status: status || undefined
    };

    // 处理时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }

    const res = await getSupplierList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      // 直接使用后端数据，无需转换
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

// 新增供应商对话框相关
const showAddDialog = ref(false);
const addFormRef = ref();
const addFormData = ref({
  name: "",
  remark: "",
  sort_no: 1,
  pic: "",
  status: "1"
});
const addFormRules = {
  name: [
    { required: true, message: "请输入供应商名称", trigger: "blur" }
  ]
};
const imageUrl = ref("");
const uploading = ref(false);
const imageUploadRef = ref();

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
    // Element Plus 的 http-request 中，file 就是 File 对象
    const res = await uploadImage({
      file: file,
      type: "1"
    });

    if (res.code === 0) {
      imageUrl.value = res.data;
      addFormData.value.pic = res.data;
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
  triggerImageSelect();
};

// 触发图片选择
const triggerImageSelect = () => {
  // 触发隐藏的 upload 组件的点击事件
  const uploadEl = imageUploadRef.value?.$el?.querySelector('input[type="file"]');
  if (uploadEl) {
    uploadEl.click();
  }
};

// 移除图片
const handleRemoveImage = () => {
  imageUrl.value = "";
  addFormData.value.pic = "";
};

// 打开新增对话框
const handleAdd = () => {
  showAddDialog.value = true;
  // 重置表单
  addFormData.value = {
    name: "",
    remark: "",
    sort_no: 1,
    pic: "",
    status: "1"
  };
  imageUrl.value = "";
};

// 关闭新增对话框
const handleCloseAddDialog = () => {
  showAddDialog.value = false;
  addFormRef.value?.resetFields();
  addFormData.value = {
    name: "",
    remark: "",
    sort_no: 1,
    pic: "",
    status: "1"
  };
  imageUrl.value = "";
};

// 提交新增表单
const handleSubmitAdd = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const params: AddSupplierParams = {
          name: addFormData.value.name,
          remark: addFormData.value.remark,
          sort_no: addFormData.value.sort_no,
          pic: addFormData.value.pic,
          status: addFormData.value.status
        };

        const res = await addSupplier(params);

        if (res.code === 0) {
          message("新增供应商成功", { type: "success" });
          handleCloseAddDialog();
          // 刷新列表
          getList();
        } else {
          message(res.msg || "新增供应商失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("新增供应商失败:", error);
        message(error?.message || "新增供应商失败", { type: "error" });
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
  // 调用编辑函数，与表格操作列的编辑按钮效果一致
  handleEditRow(multipleSelection.value[0]);
};

// 编辑供应商对话框相关
const showEditDialog = ref(false);
const editFormRef = ref();
const editFormData = ref({
  id: 0,
  name: "",
  remark: "",
  sort_no: 1,
  pic: "",
  status: "1"
});
const editFormRules = {
  name: [
    { required: true, message: "请输入供应商名称", trigger: "blur" }
  ]
};
const editImageUrl = ref("");
const editUploading = ref(false);
const editImageUploadRef = ref();

// 编辑图片上传前的处理
const beforeEditUpload = (file: File) => {
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

// 处理编辑图片上传
const handleEditImageUpload = async (options: any) => {
  const { file } = options;
  editUploading.value = true;
  
  try {
    const res = await uploadImage({
      file: file,
      type: "1"
    });

    if (res.code === 0) {
      editImageUrl.value = res.data;
      editFormData.value.pic = res.data;
      message("图片上传成功", { type: "success" });
    } else {
      message(res.msg || "图片上传失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("图片上传失败:", error);
    message(error?.message || "图片上传失败", { type: "error" });
  } finally {
    editUploading.value = false;
  }
};

// 触发编辑图片上传
const triggerEditImageUpload = () => {
  triggerEditImageSelect();
};

// 触发编辑图片选择
const triggerEditImageSelect = () => {
  const uploadEl = editImageUploadRef.value?.$el?.querySelector('input[type="file"]');
  if (uploadEl) {
    uploadEl.click();
  }
};

// 移除编辑图片
const handleRemoveEditImage = () => {
  editImageUrl.value = "";
  editFormData.value.pic = "";
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  showEditDialog.value = true;
  // 回填数据
  editFormData.value = {
    id: row.id,
    name: row.name,
    remark: row.remark || "",
    sort_no: row.sort_no || 1,
    pic: row.pic || "",
    status: row.status || "1"
  };
  editImageUrl.value = row.pic || "";
};

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  showEditDialog.value = false;
  editFormRef.value?.resetFields();
  editFormData.value = {
    id: 0,
    name: "",
    remark: "",
    sort_no: 1,
    pic: "",
    status: "1"
  };
  editImageUrl.value = "";
};

// 提交编辑表单
const handleSubmitEdit = async () => {
  if (!editFormRef.value) return;

  await editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const params: EditSupplierParams = {
          id: editFormData.value.id,
          name: editFormData.value.name,
          remark: editFormData.value.remark,
          sort_no: editFormData.value.sort_no,
          pic: editFormData.value.pic,
          status: editFormData.value.status
        };

        const res = await editSupplier(params);

        if (res.code === 0) {
          message("编辑供应商成功", { type: "success" });
          handleCloseEditDialog();
          // 刷新列表
          getList();
        } else {
          message(res.msg || "编辑供应商失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("编辑供应商失败:", error);
        message(error?.message || "编辑供应商失败", { type: "error" });
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
  const supplierNames = multipleSelection.value.map(item => item.name).join("、");
  const confirmMessage = `确定删除供应商 ${supplierNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除供应商", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    // 批量删除选中的供应商
    const deletePromises = multipleSelection.value.map(item =>
      deleteSupplier({ id: item.id })
    );

    const results = await Promise.all(deletePromises);
    
    // 检查是否全部成功
    const failedCount = results.filter(res => res.code !== 0).length;
    
    if (failedCount === 0) {
      message("删除成功", { type: "success" });
      // 清空选中数据
      multipleSelection.value = [];
      // 刷新列表
      getList();
    } else {
      message(`删除失败 ${failedCount} 条数据`, { type: "error" });
      // 即使有失败，也刷新列表
      getList();
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
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
    .filter((col: any) => col.prop !== "pic") // 排除Logo列
    .map((col: any) => col.label);
  const exportProps = tableConfig.value
    .filter((col: any) => col.prop !== "pic") // 排除Logo列
    .map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        return item.status === "1" ? "正常" : "隐藏";
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "供应商";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `供应商.xlsx`;
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
  a.download = "供应商.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="supplier-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never" style="margin: 20px">
      <PlusSearch
        v-show="showSearch"
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
          width: '120px',
          label: '操作'
        }"
        @selection-change="handleSelectionChange"
        @formChange="handleStatusChange"
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
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">删除</span>
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

    <!-- 新增供应商对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增供应商"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseAddDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addFormData"
        :rules="addFormRules"
        label-width="80px"
      >
        <el-form-item label="供应商" prop="name">
          <el-input
            v-model="addFormData.name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="图片">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="addFormData.pic"
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
                @click="triggerImageSelect"
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
        <el-form-item label="备注">
          <el-input
            v-model="addFormData.remark"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="addFormData.sort_no"
            :min="1"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="addFormData.status">
            <el-radio label="1">开启</el-radio>
            <el-radio label="-1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmitAdd" :loading="uploading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑供应商对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑供应商"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="供应商" prop="name">
          <el-input
            v-model="editFormData.name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="图片">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="editFormData.pic"
                placeholder="请输入"
                readonly
              />
              <el-button type="primary" @click="triggerEditImageUpload" :loading="editUploading">
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
            <div class="image-upload-area">
              <el-upload
                ref="editImageUploadRef"
                class="avatar-uploader"
                :action="''"
                :auto-upload="true"
                :show-file-list="false"
                :before-upload="beforeEditUpload"
                :http-request="handleEditImageUpload"
                style="display: none"
              >
              </el-upload>
              <div
                v-if="!editImageUrl"
                class="upload-placeholder"
                @click="triggerEditImageSelect"
              >
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <div v-else class="image-preview">
                <img :src="editImageUrl" class="preview-image" />
                <el-button
                  type="primary"
                  link
                  class="delete-btn"
                  @click="handleRemoveEditImage"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editFormData.remark"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="editFormData.sort_no"
            :min="1"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editFormData.status">
            <el-radio label="1">开启</el-radio>
            <el-radio label="-1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmitEdit" :loading="editUploading">
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
  
  .el-input {
    flex: 1;
  }
  
  .el-button {
    white-space: nowrap;
  }
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
  
  &:hover {
    border-color: var(--el-color-primary);
  }
  
  .upload-icon {
    font-size: 48px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 8px;
  }
  
  .upload-text {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }
}

.image-preview {
  position: relative;
  width: 178px;
  height: 178px;
  
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
  
  .delete-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: var(--el-color-primary);
  }
}

.avatar-uploader {
  display: none;
}
</style>
