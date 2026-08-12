<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "GamePlayType"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag } from "element-plus";
import {
  getGamePlayTypeList,
  addGamePlayType,
  editGamePlayType,
  deleteBatchGamePlayType,
  uploadImage,
  type GamePlayTypeListParams,
  type GamePlayTypeItem,
  type AddGamePlayTypeParams,
  type EditGamePlayTypeParams
} from "@/api/game";
import { ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElRadioGroup, ElRadio, ElButton, ElUpload } from "element-plus";
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
  shortname: "",
  name_cn: "",
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
    renderLabel: () => t("game.playType.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.playType.search.id")
    }))
  },
  {
    label: "玩法类型",
    renderLabel: () => t("game.playType.search.name"),
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.playType.search.name")
    }))
  },
  {
    label: "玩法缩写",
    renderLabel: () => t("game.playType.search.shortname"),
    prop: "shortname",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.playType.search.shortname")
    }))
  },
  {
    label: "中文名称",
    renderLabel: () => t("game.playType.search.name_cn"),
    prop: "name_cn",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("game.playType.search.name_cn")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("game.playType.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: [
      {
        label: t("game.playType.search.all"),
        renderLabel: () => t("game.playType.search.all"),
        value: ""
      },
      {
        label: t("game.playType.search.normal"),
        renderLabel: () => t("game.playType.search.normal"),
        value: "1"
      },
      {
        label: t("game.playType.search.hidden"),
        renderLabel: () => t("game.playType.search.hidden"),
        value: "-1"
      }
    ]
  },
  {
    label: "更新时间",
    renderLabel: () => t("game.playType.search.updateTime"),
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
    shortname: "",
    name_cn: "",
    status: "",
    updateTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用后端字段）
type TableRow = GamePlayTypeItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置（根据后端字段调整）
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("game.playType.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "玩法类型",
    renderHeader: () => t("game.playType.table.name"),
    prop: "name",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "玩法缩写",
    renderHeader: () => t("game.playType.table.shortname"),
    prop: "shortname",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "中文名称",
    renderHeader: () => t("game.playType.table.name_cn"),
    prop: "name_cn",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "图片",
    renderHeader: () => t("game.playType.table.pic"),
    prop: "pic",
    valueType: "img",
    fieldProps: {
      fit: "cover"
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "排序",
    renderHeader: () => t("game.playType.table.sort_no"),
    prop: "sort_no",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    renderHeader: () => t("game.playType.table.createTime"),
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    renderHeader: () => t("game.playType.table.updateTime"),
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("game.playType.table.status"),
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === '1' ? "success" : "danger"
      }, () => value === '1' ? t("game.playType.table.normal") : t("game.playType.table.disabled"));
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
    text: () => t("game.playType.buttons.edit"),
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
    const { id, name, shortname, name_cn, status, updateTime } = searchData.value;
    
    const params: GamePlayTypeListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      name: name || undefined,
      shortname: shortname || undefined,
      name_cn: name_cn || undefined,
      status: status || undefined
    };

    // 处理时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }

    const res = await getGamePlayTypeList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      // 直接使用后端数据，无需转换
      tableData.value = res.data.rows;
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("game.playType.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error(t("game.playType.message.getListFail"), error);
    message(error?.message || t("game.playType.message.getListFail"), { type: "error" });
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

// 对话框相关（合并新增和编辑）
const showDialog = ref(false);
const isEdit = ref(false);
const dialogTitle = computed(() => isEdit.value ? t("game.playType.edit.title") : t("game.playType.add.title"));
const formRef = ref();
const formData = ref({
  id: 0,
  name: "",
  shortname: "",
  name_cn: "",
  pic: "",
  sort_no: 1,
  status: "1"
});
const formRules = computed(() => ({
  name: [
    { required: true, message: t("game.playType.form.nameRequired"), trigger: "blur" }
  ],
  shortname: [
    { required: true, message: t("game.playType.form.shortnameRequired"), trigger: "blur" }
  ],
  name_cn: [
    { required: true, message: t("game.playType.form.nameCnRequired"), trigger: "blur" }
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
    message(t("game.playType.upload.onlyImage"), { type: "error" });
    return false;
  }
  if (!isLt2M) {
    message(t("game.playType.upload.sizeLimit"), { type: "error" });
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
      message(t("game.playType.upload.success"), { type: "success" });
    } else {
      message(res.msg || t("game.playType.upload.fail"), { type: "error" });
    }
  } catch (error: any) {
    console.error(t("game.playType.upload.fail"), error);
    message(error?.message || t("game.playType.upload.fail"), { type: "error" });
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
    shortname: "",
    name_cn: "",
    pic: "",
    sort_no: 1,
    status: "1"
  };
  imageUrl.value = "";
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("game.playType.message.selectOneToEdit"), { type: "warning" });
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
    shortname: row.shortname,
    name_cn: row.name_cn,
    pic: row.pic || "",
    sort_no: row.sort_no || 1,
    status: row.status || "1"
  };
  imageUrl.value = row.pic || "";
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  formData.value = {
    id: 0,
    name: "",
    shortname: "",
    name_cn: "",
    pic: "",
    sort_no: 1,
    status: "1"
  };
  imageUrl.value = "";
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          const params: EditGamePlayTypeParams = {
            id: formData.value.id,
            name: formData.value.name,
            shortname: formData.value.shortname,
            name_cn: formData.value.name_cn,
            pic: formData.value.pic,
            sort_no: formData.value.sort_no,
            status: formData.value.status
          };

          const res = await editGamePlayType(params);

          if (res.code === 0) {
            message(t("game.playType.editSuccess"), { type: "success" });
            handleCloseDialog();
            // 刷新列表
            getList();
          } else {
            message(res.msg || t("game.playType.editFail"), { type: "error" });
          }
        } else {
          // 新增
          const params: AddGamePlayTypeParams = {
            name: formData.value.name,
            shortname: formData.value.shortname,
            name_cn: formData.value.name_cn,
            pic: formData.value.pic,
            sort_no: formData.value.sort_no,
            status: formData.value.status
          };

          const res = await addGamePlayType(params);

          if (res.code === 0) {
            message(t("game.playType.addSuccess"), { type: "success" });
            handleCloseDialog();
            // 刷新列表
            getList();
          } else {
            message(res.msg || t("game.playType.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        console.error(isEdit.value ? t("game.playType.editFail") : t("game.playType.addFail"), error);
        message(error?.message || (isEdit.value ? t("game.playType.editFail") : t("game.playType.addFail")), { type: "error" });
      }
    }
  });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message(t("game.playType.message.selectToDelete"), { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const typeNames = multipleSelection.value.map(item => item.name_cn).join("、");
  const confirmMessage = `${t("game.playType.delete.tip")} ${typeNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, t("game.playType.delete.title"), {
      confirmButtonText: t("game.playType.buttons.confirm"),
      cancelButtonText: t("game.playType.buttons.cancel"),
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的玩法类型
      const ids = multipleSelection.value.map(item => item.id).join(",");
      const res = await deleteBatchGamePlayType({ ids });

      if (res.code === 0) {
        message(t("game.playType.delete.success"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(res.msg || t("game.playType.delete.fail"), { type: "error" });
      }
    } catch (error: any) {
      console.error(t("game.playType.delete.fail"), error);
      message(error?.message || t("game.playType.delete.fail"), { type: "error" });
    } finally {
      deleteLoading.value = false;
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error(t("game.playType.delete.fail"), error);
    }
  }
};

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message(t("game.playType.message.selectToExport"), { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value
    .filter((col: any) => col.prop !== "pic") // 排除图片列
    .map((col: any) => {
      if (col.prop === "id") return t("game.playType.table.id");
      if (col.prop === "name") return t("game.playType.table.name");
      if (col.prop === "shortname") return t("game.playType.table.shortname");
      if (col.prop === "name_cn") return t("game.playType.table.name_cn");
      if (col.prop === "sort_no") return t("game.playType.table.sort_no");
      if (col.prop === "createtime") return t("game.playType.table.createTime");
      if (col.prop === "updatetime") return t("game.playType.table.updateTime");
      if (col.prop === "status") return t("game.playType.table.status");
      return col.label;
    });
  const exportProps = tableConfig.value
    .filter((col: any) => col.prop !== "pic") // 排除图片列
    .map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        return item.status === "1" ? t("game.playType.table.normal") : t("game.playType.table.hidden");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("game.playType.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `${t("game.playType.export.fileName")}`;
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("game.playType.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t("game.playType.export.sheetName")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="game-play-type-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="110"
        label-position="right"
        :has-unfold="false"
        :searchText="t('game.playType.buttons.search')"
        :resetText="t('game.playType.buttons.reset')"
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
          label: t('game.playType.table.action')
        }"
        @selection-change="handleSelectionChange"
        width="100%"
        height="90%"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t("game.playType.buttons.add") }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t("game.playType.buttons.edit") }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t("game.playType.buttons.delete") }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('game.playType.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('game.playType.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('game.playType.toolbar.hideSearch') : t('game.playType.toolbar.showSearch')"
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
          <el-tooltip :content="t('game.playType.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 新增/编辑玩法类型对话框 -->
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
        label-width="100px"
      >
        <el-form-item :label="t('game.playType.search.name')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('game.playType.search.shortname')" prop="shortname">
          <el-input
            v-model="formData.shortname"
            :placeholder="t('placeholder.input')"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item :label="t('game.playType.search.name_cn')" prop="name_cn">
          <el-input
            v-model="formData.name_cn"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('game.playType.table.pic')">
          <div class="image-upload-container">
            <div class="image-input-group">
              <el-input
                v-model="formData.pic"
                :placeholder="t('placeholder.input')"
                readonly
              />
              <el-button type="primary" @click="triggerImageUpload" :loading="uploading">
                <el-icon><Upload /></el-icon>
                {{ t('game.playType.add.upload') }}
              </el-button>
              <el-button @click="triggerImageSelect">
                {{ t('game.playType.buttons.select') }}
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
                <div class="upload-text">{{ t('game.playType.add.uploadTip') }}</div>
              </div>
              <div v-else class="image-preview">
                <img :src="imageUrl" class="preview-image" />
                <el-button
                  type="primary"
                  link
                  class="delete-btn"
                  @click="handleRemoveImage"
                >
                  {{ t('game.playType.buttons.delete') }}
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('game.playType.table.sort_no')">
          <el-input-number
            v-model="formData.sort_no"
            :min="1"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('game.playType.search.status')">
          <el-radio-group v-model="formData.status">
            <el-radio label="1" value="1">{{ t("game.playType.table.normal") }}</el-radio>
            <el-radio label="-1" value="-1">{{ t("game.playType.table.hidden") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t("game.playType.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="uploading">
            {{ t("game.playType.buttons.confirm") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.game-play-type-container {
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
