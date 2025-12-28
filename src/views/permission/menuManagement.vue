<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "MenuManagement"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElButton, ElRadioGroup, ElRadio, ElSelect, ElOption, type FormInstance } from "element-plus";
import {
  getMenuList,
  addMenu,
  editMenu,
  deleteBatchMenu,
  type MenuItem,
  type MenuListParams,
  type AddMenuParams,
  type EditMenuParams,
  type DeleteBatchMenuParams
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
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入ID"
    }))
  },
  {
    label: "标题",
    prop: "title",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入标题"
    }))
  },
  {
    label: "名称",
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入名称"
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
      { label: "全部", value: "" },
      { label: "正常", value: "normal" },
      { label: "隐藏", value: "hidden" }
    ]
  },
  {
    label: "菜单开关",
    prop: "ismenu",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "开启", value: "1" },
      { label: "关闭", value: "0" }
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
    prop: "id",
    width: 80,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "标题",
    prop: "title",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "ICON",
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
    prop: "name",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "排序",
    prop: "weigh",
    width: 100,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    render: (value: string) => {
      const isNormal = value === "normal";
      return h(ElTag, {
        type: isNormal ? "success" : "danger"
      }, () => isNormal ? "正常" : "隐藏");
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "菜单开关",
    prop: "ismenu",
    width: 100,
    render: (value: number) => {
      return value === 1 ? "开启" : "关闭";
    },
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: "详情",
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
    text: "删除",
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

// 对话框相关
const showDialog = ref(false);
const showDetailDialog = ref(false);
const dialogTitle = ref("新增");
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
  const options = [{ label: "无", value: 0 }];
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
    { required: true, message: "请输入名称", trigger: "blur" }
  ],
  title: [
    { required: true, message: "请输入标题", trigger: "blur" }
  ],
  weigh: [
    { required: true, message: "请输入排序", trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "新增";
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
    message("请选择一条数据进行编辑", { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  dialogTitle.value = "编辑";
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
            message("编辑成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "编辑失败", { type: "error" });
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
            message("新增成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "新增失败", { type: "error" });
          }
        }
      } catch (error: any) {
        console.error("提交失败:", error);
        message(error?.message || "提交失败", { type: "error" });
      }
    }
  });
};

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要删除的数据！", { type: "warning" });
    return;
  }

  const titles = multipleSelection.value.map(item => item.title).join("、");
  const confirmMessage = `确定删除选中的 ${multipleSelection.value.length} 条菜单数据？\n菜单：${titles}`;

  try {
    await ElMessageBox.confirm(confirmMessage, "批量删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const ids = multipleSelection.value.map(item => item.id).join(",");
    const params: DeleteBatchMenuParams = { ids };
    const res = await deleteBatchMenu(params);

    if (res.code === 0) {
      message("删除成功", { type: "success" });
      getList();
    } else {
      message(res.msg || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
    }
  }
};

// 删除单条数据（使用批量删除API）
const handleDelete = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      `确定删除菜单"${row.title}"吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    const params: DeleteBatchMenuParams = { ids: row.id.toString() };
    const res = await deleteBatchMenu(params);
    
    if (res.code === 0) {
      message("删除成功", { type: "success" });
      getList();
    } else {
      message(res.msg || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
    }
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
            @click="handleBatchDelete" 
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
        <el-form-item label="菜单开关">
          <el-radio-group v-model="formData.ismenu">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="父级">
          <el-select
            v-model="formData.pid"
            placeholder="请选择"
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
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="URL">
          <el-input
            v-model="formData.url"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-input
            v-model="formData.icon"
            placeholder="请输入"
            maxlength="100"
          >
            <template #append>
              <el-button>选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Condition">
          <el-input
            v-model="formData.condition"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-radio-group v-model="formData.menutype">
            <el-radio label="addtabs">Add tabs</el-radio>
            <el-radio label="dialog">Dialog</el-radio>
            <el-radio label="ajax">Ajax</el-radio>
            <el-radio label="blank">Blank</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Extend">
          <el-input
            v-model="formData.extend"
            type="textarea"
            placeholder="请输入"
            :rows="3"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="排序" prop="weigh">
          <el-input-number
            v-model="formData.weigh"
            :min="0"
            placeholder="请输入"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="normal">正常</el-radio>
            <el-radio label="hidden">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="菜单详情"
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
        <el-form-item label="ID">
          <el-input v-model="detailData.id" disabled />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="detailData.title" disabled />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="detailData.name" disabled />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="detailData.icon" disabled />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="detailData.url" disabled />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="detailData.weigh" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="detailData.status" disabled />
        </el-form-item>
        <el-form-item label="菜单开关">
          <el-input :value="detailData.ismenu === 1 ? '开启' : '关闭'" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDetailDialog">关闭</el-button>
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
