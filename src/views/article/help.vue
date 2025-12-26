<script setup lang="ts">
import { ref, computed,onBeforeUnmount, shallowRef, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "Help"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import { ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElButton, ElMessageBox, type FormInstance } from "element-plus";
import RichTextEditor from "@/components/RichTextEditor/index.vue";
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import {
  getHelpList,
  addHelp,
  editHelp,
  deleteBatchHelp,
  type HelpListParams,
  type HelpItem,
  type AddHelpParams,
  type EditHelpParams
} from "@/api/article";
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
  createTime: [] as string[],
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
    title: "",
    createTime: [],
    updateTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = HelpItem;

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
    label: "标题",
    prop: "title",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "排序",
    prop: "weigh",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "更新时间",
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 对话框相关
const showDialog = ref(false);
const dialogTitle = ref("新增");
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const formData = ref({
  id: 0,
  title: "",
  content: "",
  weigh: 0
});

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: "请输入标题", trigger: "blur" }
  ],
  content: [
    { required: true, message: "请输入内容", trigger: "blur" }
  ],
  weigh: [
    { required: true, message: "请输入排序", trigger: "blur" },
    { type: "number" as const, min: 0, message: "排序必须大于等于0", trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "新增";
  formData.value = {
    id: 0,
    title: "",
    content: "",
    weigh: 0
  };
  // 重置编辑器内容
  if (editorRef.value) {
    editorRef.value.setHtml("");
  }
  showDialog.value = true;
};

// 打开编辑对话框
const handleEdit = (row?: TableRow) => {
  const editRow = row || (multipleSelection.value.length === 1 ? multipleSelection.value[0] : null);
  if (!editRow) {
    message("请选择一条数据进行编辑", { type: "warning" });
    return;
  }
  isEdit.value = true;
  dialogTitle.value = "编辑";
  formData.value = {
    id: editRow.id,
    title: editRow.title,
    content: editRow.content || "",
    weigh: editRow.weigh
  };
  // 设置编辑器内容
  if (editorRef.value) {
    editorRef.value.setHtml(editRow.content || "");
  }
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  // 清空编辑器内容
  if (editorRef.value) {
    editorRef.value.setHtml("");
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取编辑器内容
        const content = editorRef.value?.getHtml() || formData.value.content;
        
        if (isEdit.value) {
          // 编辑
          const params: EditHelpParams = {
            id: formData.value.id,
            title: formData.value.title,
            content: content,
            weigh: formData.value.weigh
          };
          
          const res = await editHelp(params);
          
          if (res.code === 0) {
            message("编辑成功", { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || "编辑失败", { type: "error" });
          }
        } else {
          // 新增
          const params: AddHelpParams = {
            title: formData.value.title,
            content: content,
            weigh: formData.value.weigh
          };
          
          const res = await addHelp(params);
          
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

// 删除单条数据
const handleDelete = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      `确定删除标题为"${row.title}"的数据吗？`,
      "删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    const res = await deleteBatchHelp({ ids: row.id.toString() });
    
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

// 批量删除
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message("请选择要删除的数据", { type: "warning" });
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${multipleSelection.value.length} 条数据吗？`,
      "删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    const ids = multipleSelection.value.map(item => item.id).join(",");
    const res = await deleteBatchHelp({ ids });
    
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
      handleEdit(row);
    }
  },
  {
    text: "删除",
    code: "delete",
    props: {
      type: "danger"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleDelete(row);
    }
  }
];

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, title, createTime, updateTime } = searchData.value;
    
    const params: HelpListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      title: title || undefined
    };
    
    // 处理创建时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }
    
    // 处理更新时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.update_start_time = updateTime[0];
      params.update_end_time = updateTime[1];
    }
    
    const res = await getHelpList(params);
    
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

// 富文本编辑器相关
const mode = "default";
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

const toolbarConfig: any = { excludeKeys: "fullScreen" };
const editorConfig = { placeholder: "请输入内容..." };

const handleCreated = (editor: any) => {
  // 记录 editor 实例，重要！
  editorRef.value = editor;
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

</script>

<template>
  <div class="help-container">
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
        @reset="handleRest"
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
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">新增</span>
          </el-button>
          <el-button 
            type="success" 
            @click="() => handleEdit()" 
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
      width="800px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        class="dialog-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div class="wangeditor">
            <Toolbar
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
              style="border: 1px solid #ccc"
            />
            <Editor
              v-model="formData.content"
              :defaultConfig="editorConfig"
              :mode="mode"
              style="min-height: 320px; border: 1px solid #ccc"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="weigh">
          <el-input-number
            v-model="formData.weigh"
            :min="0"
            :max="9999"
            placeholder="请输入排序"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.help-container {
  width: 100%;
  padding: 0 20px;
}

.search-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 0;
}

.table-card {
  margin-top: 20px;
  margin-right: 20px;
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


