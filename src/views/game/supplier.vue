<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "Supplier"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag } from "element-plus";
import {
  getSupplierList,
  addSupplier,
  editSupplier,
  deleteBatchSupplier,
  uploadImage,
  type SupplierListParams,
  type SupplierItem,
  type AddSupplierParams,
  type EditSupplierParams
} from "@/api/game";
import { ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElUpload, ElButton, ElRadioGroup, ElRadio } from "element-plus";
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
  name: "",
  remark: "",
  status: "",
  updateTime: [] as string[]
});
// 搜索表单显示控制
const showSearch = ref(true);

// 国际化
const { t } = useI18n();

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    renderLabel: () => t("game.supplier.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.supplier.search.id")
    }))
  },
  {
    label: "供应商",
    renderLabel: () => t("game.supplier.search.supplier"),
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.supplier.search.supplier")
    }))
  },
  {
    label: "备注",
    renderLabel: () => t("game.supplier.search.remark"),
    prop: "remark",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.supplier.search.remark")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("game.supplier.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: [
      {
        label: t("game.supplier.search.all"),
        renderLabel: () => t("game.supplier.search.all"),
        value: ""
      },
      {
        label: t("game.supplier.search.normal"),
        renderLabel: () => t("game.supplier.search.normal"),
        value: "1"
      },
      {
        label: t("game.supplier.search.hidden"),
        renderLabel: () => t("game.supplier.search.hidden"),
        value: "-1"
      }
    ]
  },
  {
    label: "更新时间",
    renderLabel: () => t("game.supplier.search.updateTime"),
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
    renderHeader: () => t("game.supplier.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "供应商名称",
    renderHeader: () => t("game.supplier.table.supplier"),
    prop: "name",
    tableColumnProps: {
      align: "center"
    }
  },
 {
    label: 'logo',
    renderHeader: () => t("game.supplier.table.pic"),
    prop: 'pic',
    valueType: 'img',
    fieldProps: {
      fit:"cover"
   },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    renderHeader: () => t("game.supplier.table.remark"),
    prop: "remark",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "排序",
    renderHeader: () => t("game.supplier.table.sort_no"),
    prop: "sort_no",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    renderHeader: () => t("game.supplier.table.createTime"),
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    renderHeader: () => t("game.supplier.table.updateTime"),
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("game.supplier.table.status"),
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === '1' ? "success" : "danger"
      }, () => value === '1' ? t("game.supplier.table.normal") : t("game.supplier.table.hidden"));
    },
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("game.supplier.buttons.edit"),
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

  // value 是切换后的状态值（"1" 或 "-1"）
  const originalStatus = value === "1" ? "-1" : "1";
  const isDisabling = value === "-1";

  const confirmMessage = isDisabling
    ? t("game.supplier.status.confirmHide", { name: typedRow.name })
    : t("game.supplier.status.confirmRestore", { name: typedRow.name });

  // 查找当前行在 tableData 中的索引
  const index = tableData.value.findIndex(item => item.id === typedRow.id);

  try {
    await ElMessageBox.confirm(confirmMessage, t("game.supplier.status.switchTitle"), {
      confirmButtonText: t("game.supplier.buttons.confirm"),
      cancelButtonText: t("game.supplier.buttons.cancel"),
      draggable: true
    });

    // TODO: 调用真实的状态切换接口
    // const res = await updateSupplierStatus({ id: typedRow.id, status: value });
    const res = {
      code: 0,
      msg: t("game.supplier.status.success")
    };

    if (res.code === 0) {
      message(isDisabling ? t("game.supplier.status.hidden") : t("game.supplier.status.restored"), {
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
      message(res.msg || t("game.supplier.status.fail"), { type: "error" });
    }
  } catch (error: any) {
    // 取消或出错恢复
    tableData.value[index] = {
      ...tableData.value[index],
      status: originalStatus
    };
    if (error !== "cancel") {
      console.error(t("game.supplier.status.fail"), error);
      message(error?.message || t("game.supplier.status.fail"), { type: "error" });
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
      message(res.msg || t("game.supplier.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error(t("game.supplier.message.getListFail"), error);
    message(error?.message || t("game.supplier.message.getListFail"), { type: "error" });
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

// 统一对话框相关（新增和编辑共用）
const showDialog = ref(false);
const isEdit = ref(false);
const dialogTitle = computed(() => isEdit.value ? t("game.supplier.edit.title") : t("game.supplier.add.title"));
const formRef = ref();
const formData = ref({
  id: 0,
  name: "",
  remark: "",
  sort_no: 1,
  pic: "",
  status: "1"
});
const formRules = computed(() => ({
  name: [
    { required: true, message: t("game.supplier.form.nameRequired"), trigger: "blur" }
  ]
}));
const imageUrl = ref("");
const uploading = ref(false);
const imageUploadRef = ref();

// 图片上传前的处理
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    message(t("game.supplier.upload.onlyImage"), { type: "error" });
    return false;
  }
  if (!isLt2M) {
    message(t("game.supplier.upload.sizeLimit"), { type: "error" });
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
      message(t("game.supplier.upload.success"), { type: "success" });
    } else {
      message(res.msg || t("game.supplier.upload.fail"), { type: "error" });
    }
  } catch (error: any) {
    console.error(t("game.supplier.upload.fail"), error);
    message(error?.message || t("game.supplier.upload.fail"), { type: "error" });
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

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  showDialog.value = true;
  // 重置表单
  formData.value = {
    id: 0,
    name: "",
    remark: "",
    sort_no: 1,
    pic: "",
    status: "1"
  };
  imageUrl.value = "";
  formRef.value?.resetFields();
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("game.supplier.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  // 调用编辑函数，与表格操作列的编辑按钮效果一致
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  showDialog.value = true;
  // 回填数据
  formData.value = {
    id: row.id,
    name: row.name,
    remark: row.remark || "",
    sort_no: row.sort_no || 1,
    pic: row.pic || "",
    status: row.status || "1"
  };
  imageUrl.value = row.pic || "";
  formRef.value?.resetFields();
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  formData.value = {
    id: 0,
    name: "",
    remark: "",
    sort_no: 1,
    pic: "",
    status: "1"
  };
  imageUrl.value = "";
};

// 提交表单（新增和编辑共用）
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          const params: EditSupplierParams = {
            id: formData.value.id,
            name: formData.value.name,
            remark: formData.value.remark,
            sort_no: formData.value.sort_no,
            pic: formData.value.pic,
            status: formData.value.status
          };

          const res = await editSupplier(params);

          if (res.code === 0) {
            message(t("game.supplier.editSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("game.supplier.editFail"), { type: "error" });
          }
        } else {
          // 新增
          const params: AddSupplierParams = {
            name: formData.value.name,
            remark: formData.value.remark,
            sort_no: formData.value.sort_no,
            pic: formData.value.pic,
            status: formData.value.status
          };

          const res = await addSupplier(params);

          if (res.code === 0) {
            message(t("game.supplier.addSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("game.supplier.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        const errorMsg = isEdit.value ? t("game.supplier.editFail") : t("game.supplier.addFail");
        console.error(errorMsg, error);
        message(error?.message || errorMsg, { type: "error" });
      }
    }
  });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message(t("game.supplier.message.selectToDelete"), { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const supplierNames = multipleSelection.value.map(item => item.name).join("、");
  const confirmMessage = `${t("game.supplier.deleteTip")} ${supplierNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, t("game.supplier.deleteTitle"), {
      confirmButtonText: t("game.supplier.buttons.confirm"),
      cancelButtonText: t("game.supplier.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的供应商
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchSupplier({ ids });

      if (res.code === 0) {
        message(t("game.supplier.deleteSuccess"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || t("game.supplier.deleteFail"), { type: "error" });
      }
    } catch (error: any) {
      console.error(t("game.supplier.deleteFail"), error);
      message(error?.message || t("game.supplier.deleteFail"), { type: "error" });
    } finally {
      deleteLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error(t("game.supplier.deleteFail"), error);
    }
  }
};

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message(t("game.supplier.message.selectToExport"), { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value
    .filter((col: any) => col.prop !== "pic") // 排除Logo列
    .map((col: any) => {
      // 使用国际化文本作为标题
      if (col.prop === "id") return t("game.supplier.table.id");
      if (col.prop === "name") return t("game.supplier.table.supplier");
      if (col.prop === "remark") return t("game.supplier.table.remark");
      if (col.prop === "sort_no") return t("game.supplier.table.sort_no");
      if (col.prop === "createtime") return t("game.supplier.table.createTime");
      if (col.prop === "updatetime") return t("game.supplier.table.updateTime");
      if (col.prop === "status") return t("game.supplier.table.status");
      return col.label;
    });
  const exportProps = tableConfig.value
    .filter((col: any) => col.prop !== "pic") // 排除Logo列
    .map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        return item.status === "1" ? t("game.supplier.table.normal") : t("game.supplier.table.hidden");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("game.supplier.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `${t("game.supplier.export.fileName")}`;
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("game.supplier.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t("game.supplier.export.sheetName")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="supplier-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="100"
        label-position="right"
        :has-unfold="false"
        :searchText="t('game.supplier.buttons.search')"
        :resetText="t('game.supplier.buttons.reset')"
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
          width: '120px',
          label: t('game.supplier.table.action')
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
            <span style="margin-left: 3px;">{{ t("game.supplier.buttons.add") }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t("game.supplier.buttons.edit") }}</span>
          </el-button>
            <el-button 
              type="danger" 
              @click="handleDelete" 
              size="default"
              :disabled="multipleSelection.length === 0"
              :loading="deleteLoading"
            >
              <el-icon><component :is="Delete" /></el-icon>
              <span style="margin-left: 3px;">{{ t("game.supplier.buttons.delete") }}</span>
            </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('game.supplier.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('game.supplier.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('game.supplier.toolbar.hideSearch') : t('game.supplier.toolbar.showSearch')"
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
          <el-tooltip :content="t('game.supplier.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 新增/编辑供应商对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item :label="t('game.supplier.search.supplier')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('game.supplier.table.pic')">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="formData.pic"
                :placeholder="t('placeholder.input')"
                readonly
              />
              <el-button type="primary" @click="triggerImageUpload" :loading="uploading">
                <el-icon><Upload /></el-icon>
                {{ t('game.supplier.add.upload') }}
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
                <div class="upload-text">{{ t('game.supplier.add.uploadTip') }}</div>
              </div>
              <div v-else class="image-preview">
                <img :src="imageUrl" class="preview-image" />
                <el-button
                  type="primary"
                  link
                  class="delete-btn"
                  @click="handleRemoveImage"
                >
                  {{ t('game.supplier.buttons.delete') }}
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('game.supplier.search.remark')">
          <el-input
            v-model="formData.remark"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('game.supplier.table.sort_no')">
          <el-input-number
            v-model="formData.sort_no"
            :min="1"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('game.supplier.search.status')">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">{{ t("game.supplier.table.normal") }}</el-radio>
            <el-radio label="-1">{{ t("game.supplier.table.hidden") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t("game.supplier.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="uploading">
            {{ t("game.supplier.buttons.confirm") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.supplier-container {
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
