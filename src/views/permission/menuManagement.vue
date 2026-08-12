<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "MenuManagement"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
import { ElMessageBox, ElTag, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElButton, ElRadioGroup, ElRadio, ElSelect, ElOption, type FormInstance } from "element-plus";
import {
  getMenuList,
  addMenu,
  editMenu,
  deleteBatchMenu,
  statusBatchMenu,
  type MenuItem,
  type MenuListParams,
  type AddMenuParams,
  type EditMenuParams,
  type DeleteBatchMenuParams,
  type StatusBatchMenuParams
} from "@/api/auth";
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
  title: "",
  name: "",
  status: "",
  ismenu: ""
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    renderLabel: () => t("permission.menuManagement.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.menuManagement.search.id")
    }))
  },
  {
    label: "标题",
    renderLabel: () => t("permission.menuManagement.search.title"),
    prop: "title",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.menuManagement.search.title")
    }))
  },
  {
    label: "名称",
    renderLabel: () => t("permission.menuManagement.search.name"),
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.menuManagement.search.name")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("permission.menuManagement.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("permission.menuManagement.search.status")
    })),
    options: computed(() => [
      { label: t("permission.menuManagement.search.all"), value: "" },
      { label: t("permission.menuManagement.search.normal"), value: "normal" },
      { label: t("permission.menuManagement.search.hidden"), value: "hidden" }
    ])
  },
  {
    label: "菜单开关",
    renderLabel: () => t("permission.menuManagement.search.ismenu"),
    prop: "ismenu",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("permission.menuManagement.search.ismenu")
    })),
    options: computed(() => [
      { label: t("permission.menuManagement.search.all"), value: "" },
      { label: t("permission.menuManagement.search.enabled"), value: "1" },
      { label: t("permission.menuManagement.search.disabled"), value: "0" }
    ])
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
    title: "",
    name: "",
    status: "",
    ismenu: ""
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = MenuItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("permission.menuManagement.table.id"),
    prop: "id",
    width: 80,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "标题",
    renderHeader: () => t("permission.menuManagement.table.title"),
    prop: "title",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "Icon",
    renderHeader: () => t("permission.menuManagement.table.icon"),
    prop: "icon",
    width: 150,
    render: (value: string) => {
      return value || "-";
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "名称",
    renderHeader: () => t("permission.menuManagement.table.name"),
    prop: "name",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "排序",
    renderHeader: () => t("permission.menuManagement.table.weigh"),
    prop: "weigh",
    width: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("permission.menuManagement.table.status"),
    prop: "status",
    width: 100,
    render: (value: string) => {
      const isNormal = value === "normal";
      return h(ElTag, {
        type: isNormal ? "success" : "danger"
      }, () => isNormal ? t("permission.menuManagement.table.normal") : t("permission.menuManagement.table.hidden"));
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "菜单开关",
    renderHeader: () => t("permission.menuManagement.table.ismenu"),
    prop: "ismenu",
    render: (value: number) => {
      return h(ElTag, {
        type: value === 1 ? "success" : "danger"
      }, () => value === 1 ? t("permission.menuManagement.table.enabled") : t("permission.menuManagement.table.disabled"));
    },
    tableColumnProps: {
      align: "center"
    },
    width: 120
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("permission.menuManagement.buttons.detail"),
    code: "detail",
    props: {
      type: "primary",
      link: true
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleViewDetail(row);
    }
  },
  {
    text: () => t("permission.menuManagement.buttons.delete"),
    code: "delete",
    props: {
      type: "danger",
      link: true
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleDelete(row);
    },
  }
];

// 表格选中数据变化时更新按钮
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, title, name, status, ismenu } = searchData.value;
    
    const params: MenuListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      title: title || undefined,
      name: name || undefined,
      status: status || undefined,
      ismenu: ismenu || undefined
    };
    
    const res = await getMenuList(params);
    
    if (res.code === 0 && res.data && res.data.rows) {
      tableData.value = res.data.rows as any[];
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("permission.menuManagement.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("permission.menuManagement.message.getListFail"), { type: "error" });
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

// 对话框相关
const showDialog = ref(false);
const showDetailDialog = ref(false);
const dialogTitle = computed(() => {
  return isEdit.value ? t("permission.menuManagement.edit.title") : t("permission.menuManagement.add.title");
});
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const formData = ref({
  id: 0,
  ismenu: "1",
  pid: "0",
  name: "",
  title: "",
  url: "",
  icon: "",
  condition: "",
  menutype: "",
  extend: "",
  remark: "",
  weigh: 0,
  status: "normal"
});

// 详情数据
const detailData = ref<MenuItem | null>(null);

// 父级菜单选项（从列表数据中获取）
const parentMenuOptions = computed(() => {
  const options = [{ label: t("permission.menuManagement.form.none"), value: 0 }];
  tableData.value.forEach((item: MenuItem) => {
    if (item.id !== formData.value.id) {
      options.push({
        label: item.title,
        value: item.id
      });
    }
  });
  return options;
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: t("permission.menuManagement.form.nameRequired"), trigger: "blur" }
  ],
  title: [
    { required: true, message: t("permission.menuManagement.form.titleRequired"), trigger: "blur" }
  ],
  weigh: [
    { required: true, message: t("permission.menuManagement.form.weighRequired"), trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    id: 0,
    ismenu: "1",
    pid: "0",
    name: "",
    title: "",
    url: "",
    icon: "",
    condition: "",
    menutype: "",
    extend: "",
    remark: "",
    weigh: 0,
    status: "normal"
  };
  showDialog.value = true;
};

// 打开编辑对话框
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("permission.menuManagement.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  formData.value = {
    id: row.id,
    ismenu: row.ismenu.toString(),
    pid: row.pid.toString(),
    name: row.name,
    title: row.title,
    url: row.url || "",
    icon: row.icon || "",
    condition: row.extend || "",
    menutype: row.menutype || "",
    extend: row.extend || "",
    remark: row.extend || "",
    weigh: row.weigh,
    status: row.status
  };
  showDialog.value = true;
};

// 查看详情
const handleViewDetail = (row: TableRow) => {
  detailData.value = row;
  showDetailDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
};

// 关闭详情对话框
const handleCloseDetailDialog = () => {
  showDetailDialog.value = false;
  detailData.value = null;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          const params: EditMenuParams = {
            id: formData.value.id,
            ismenu: formData.value.ismenu,
            pid: formData.value.pid,
            name: formData.value.name,
            title: formData.value.title,
            url: formData.value.url || undefined,
            icon: formData.value.icon || undefined,
            condition: formData.value.condition || undefined,
            menutype: formData.value.menutype || undefined,
            extend: formData.value.extend || undefined,
            remark: formData.value.remark || undefined,
            weigh: formData.value.weigh,
            status: formData.value.status
          };
          
          const res = await editMenu(params);
          
          if (res.code === 0) {
            message(t("permission.menuManagement.message.editSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("permission.menuManagement.message.editFail"), { type: "error" });
          }
        } else {
          // 新增
          const params: AddMenuParams = {
            ismenu: formData.value.ismenu,
            pid: formData.value.pid,
            name: formData.value.name,
            title: formData.value.title,
            url: formData.value.url || undefined,
            icon: formData.value.icon || undefined,
            condition: formData.value.condition || undefined,
            menutype: formData.value.menutype || undefined,
            extend: formData.value.extend || undefined,
            remark: formData.value.remark || undefined,
            weigh: formData.value.weigh,
            status: formData.value.status
          };
          
          const res = await addMenu(params);
          
          if (res.code === 0) {
            message(t("permission.menuManagement.message.addSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("permission.menuManagement.message.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        console.error("提交失败:", error);
        message(error?.message || t("permission.menuManagement.message.submitFail"), { type: "error" });
      }
    }
  });
};

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    message(t("permission.menuManagement.message.selectToDelete"), { type: "warning" });
    return;
  }

  const titles = multipleSelection.value.map(item => item.title).join("、");
  const confirmMessage = t("permission.menuManagement.message.confirmBatchDelete", { 
    count: multipleSelection.value.length, 
    titles 
  });

  try {
    await ElMessageBox.confirm(confirmMessage, t("permission.menuManagement.delete.batchTitle"), {
      confirmButtonText: t("permission.menuManagement.buttons.confirm"),
      cancelButtonText: t("permission.menuManagement.buttons.cancel"),
      type: "warning"
    });

    const ids = multipleSelection.value.map(item => item.id).join(",");
    const params: DeleteBatchMenuParams = { ids };
    const res = await deleteBatchMenu(params);

    if (res.code === 0) {
      message(t("permission.menuManagement.message.deleteSuccess"), { type: "success" });
      getList();
    } else {
      message(res.msg || t("permission.menuManagement.message.deleteFail"), { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || t("permission.menuManagement.message.deleteFail"), { type: "error" });
    }
  }
};

// 删除单条数据（使用批量删除API）
const handleDelete = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      t("permission.menuManagement.message.confirmDelete", { title: row.title }),
      t("permission.menuManagement.delete.title"),
      {
        confirmButtonText: t("permission.menuManagement.buttons.confirm"),
        cancelButtonText: t("permission.menuManagement.buttons.cancel"),
        type: "warning"
      }
    );
    
    const params: DeleteBatchMenuParams = { ids: row.id.toString() };
    const res = await deleteBatchMenu(params);
    
    if (res.code === 0) {
      message(t("permission.menuManagement.message.deleteSuccess"), { type: "success" });
      getList();
    } else {
      message(res.msg || t("permission.menuManagement.message.deleteFail"), { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || t("permission.menuManagement.message.deleteFail"), { type: "error" });
    }
  }
};

// 状态切换对话框相关
const showStatusSwitchDialog = ref(false);
const statusSwitchForm = ref({
  status: "normal"
});

// 打开状态切换对话框
const handleStatusSwitch = () => {
  if (multipleSelection.value.length === 0) {
    message(t("permission.menuManagement.message.selectToSwitchStatus"), { type: "warning" });
    return;
  }
  showStatusSwitchDialog.value = true;
  // 如果选中的菜单状态都相同，则默认选择该状态，否则默认选择 normal
  const statuses = multipleSelection.value.map(item => item.status);
  const allSameStatus = statuses.every(status => status === statuses[0]);
  statusSwitchForm.value.status = allSameStatus ? statuses[0] : "normal";
};

// 关闭状态切换对话框
const handleCloseStatusSwitchDialog = () => {
  showStatusSwitchDialog.value = false;
  statusSwitchForm.value.status = "normal";
};

// 提交状态切换
const handleSubmitStatusSwitch = async () => {
  if (multipleSelection.value.length === 0) {
    message(t("permission.menuManagement.message.selectToSwitchStatus"), { type: "warning" });
    return;
  }

  try {
    const ids = multipleSelection.value.map(item => item.id).join(",");
    const params: StatusBatchMenuParams = {
      ids,
      status: statusSwitchForm.value.status
    };

    const res = await statusBatchMenu(params);

    if (res.code === 0) {
      message(t("permission.menuManagement.message.statusSwitchSuccess"), { type: "success" });
      handleCloseStatusSwitchDialog();
      multipleSelection.value = [];
      // 刷新列表
      getList();
    } else {
      message(res.msg || t("permission.menuManagement.message.statusSwitchFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("状态切换失败:", error);
    message(error?.message || t("permission.menuManagement.message.statusSwitchFail"), { type: "error" });
  }
};
</script>

<template>
  <div class="menu-management-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="100"
        label-position="right"
        :has-unfold="false"
        :searchText="t('permission.menuManagement.buttons.search')"
        :resetText="t('permission.menuManagement.buttons.reset')"
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
          label: t('permission.menuManagement.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.menuManagement.buttons.add') }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.menuManagement.buttons.edit') }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleBatchDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.menuManagement.buttons.delete') }}</span>
          </el-button>
          <el-button 
            type="warning" 
            @click="handleStatusSwitch" 
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.menuManagement.buttons.statusSwitch') }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('permission.menuManagement.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('permission.menuManagement.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('permission.menuManagement.toolbar.hideSearch') : t('permission.menuManagement.toolbar.showSearch')"
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
          <el-tooltip :content="t('permission.menuManagement.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 新增/编辑对话框 -->
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
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item :label="t('permission.menuManagement.form.ismenu')">
          <el-radio-group v-model="formData.ismenu">
            <el-radio label="1">{{ t('permission.menuManagement.form.enabled') }}</el-radio>
            <el-radio label="0">{{ t('permission.menuManagement.form.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.remark')">
          <el-input
            v-model="formData.remark"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.parent')">
          <el-select
            v-model="formData.pid"
            :placeholder="t('placeholder.select')"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in parentMenuOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.name')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('placeholder.input')"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.title')" prop="title">
          <el-input
            v-model="formData.title"
            :placeholder="t('placeholder.input')"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.url')">
          <el-input
            v-model="formData.url"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.icon')">
          <el-input
            v-model="formData.icon"
            :placeholder="t('placeholder.input')"
            maxlength="100"
          >
            <template #append>
              <el-button>{{ t('permission.menuManagement.form.select') }}</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.condition')">
          <el-input
            v-model="formData.condition"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.menutype')">
          <el-radio-group v-model="formData.menutype">
            <el-radio label="addtabs">{{ t('permission.menuManagement.form.addtabs') }}</el-radio>
            <el-radio label="dialog">{{ t('permission.menuManagement.form.dialog') }}</el-radio>
            <el-radio label="ajax">{{ t('permission.menuManagement.form.ajax') }}</el-radio>
            <el-radio label="blank">{{ t('permission.menuManagement.form.blank') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.extend')">
          <el-input
            v-model="formData.extend"
            type="textarea"
            :placeholder="t('placeholder.input')"
            :rows="3"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.weigh')" prop="weigh">
          <el-input-number
            v-model="formData.weigh"
            :min="0"
            :placeholder="t('placeholder.input')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.form.status')">
          <el-radio-group v-model="formData.status">
            <el-radio label="normal">{{ t('permission.menuManagement.form.normal') }}</el-radio>
            <el-radio label="hidden">{{ t('permission.menuManagement.form.hidden') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t('permission.menuManagement.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('permission.menuManagement.buttons.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="t('permission.menuManagement.detail.title')"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseDetailDialog"
    >
      <el-form
        v-if="detailData"
        :model="detailData"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item :label="t('permission.menuManagement.detail.id')">
          <el-input v-model="detailData.id" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.title')">
          <el-input v-model="detailData.title" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.name')">
          <el-input v-model="detailData.name" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.icon')">
          <el-input v-model="detailData.icon" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.url')">
          <el-input v-model="detailData.url" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.weigh')">
          <el-input v-model="detailData.weigh" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.status')">
          <el-input v-model="detailData.status" disabled />
        </el-form-item>
        <el-form-item :label="t('permission.menuManagement.detail.ismenu')">
          <el-input :value="detailData.ismenu === 1 ? t('permission.menuManagement.detail.enabled') : t('permission.menuManagement.detail.disabled')" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDetailDialog">{{ t('permission.menuManagement.buttons.close') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 状态切换对话框 -->
    <el-dialog
      v-model="showStatusSwitchDialog"
      :title="t('permission.menuManagement.statusSwitch.title')"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseStatusSwitchDialog"
    >
      <el-form :model="statusSwitchForm" label-width="100px">
        <el-form-item :label="t('permission.menuManagement.statusSwitch.status')" required>
          <el-select
            v-model="statusSwitchForm.status"
            :placeholder="t('permission.menuManagement.statusSwitch.status')"
            style="width: 100%"
          >
            <el-option
              :label="t('permission.menuManagement.statusSwitch.normal')"
              value="normal"
            />
            <el-option
              :label="t('permission.menuManagement.statusSwitch.hidden')"
              value="hidden"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseStatusSwitchDialog">{{ t('permission.menuManagement.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmitStatusSwitch">{{ t('permission.menuManagement.buttons.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.menu-management-container {
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

.dialog-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
