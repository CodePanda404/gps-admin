<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "Currency"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElDialog, ElForm, ElFormItem, ElInput, ElRadioGroup, ElRadio } from "element-plus";
import {
  getCurrencyList,
  addCurrency,
  editCurrency,
  deleteCurrency,
  type CurrencyListParams,
  type CurrencyItem,
  type AddCurrencyParams,
  type EditCurrencyParams,
  type DeleteCurrencyParams
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
// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
  remark: "",
  status: "",
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
      placeholder: "ID"
    }))
  },
  {
    label: "币种名称",
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "币种名称"
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
        label: "停用",
        value: "-1"
      }
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
    name: "",
    remark: "",
    status: "",
    createTime: [],
    updateTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = CurrencyItem;

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
    label: "币种",
    prop: "name",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    prop: "remark",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "时差",
    prop: "difftime",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "状态",
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === '1' ? "success" : "danger"
      }, () => value === '1' ? '正常' : '停用');
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

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, name, remark, status, createTime, updateTime } = searchData.value;
    
    const params: CurrencyListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      name: name || undefined,
      remark: remark || undefined,
      status: status || undefined
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

    const res = await getCurrencyList(params);

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

// 新增币种对话框相关
const showAddDialog = ref(false);
const addFormRef = ref();
const addFormData = ref({
  name: "",
  remark: "",
  difftime: "",
  status: "1"
});
const addFormRules = {
  name: [
    { required: true, message: "请输入币种名称", trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  showAddDialog.value = true;
  // 重置表单
  addFormData.value = {
    name: "",
    remark: "",
    difftime: "",
    status: "1"
  };
};

// 关闭新增对话框
const handleCloseAddDialog = () => {
  showAddDialog.value = false;
  addFormRef.value?.resetFields();
  addFormData.value = {
    name: "",
    remark: "",
    difftime: "",
    status: "1"
  };
};

// 提交新增表单
const handleSubmitAdd = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const params: AddCurrencyParams = {
          name: addFormData.value.name,
          remark: addFormData.value.remark,
          difftime: addFormData.value.difftime,
          status: addFormData.value.status
        };

        const res = await addCurrency(params);

        if (res.code === 0) {
          message("新增币种成功", { type: "success" });
          handleCloseAddDialog();
          // 刷新列表
          getList();
        } else {
          message(res.msg || "新增币种失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("新增币种失败:", error);
        message(error?.message || "新增币种失败", { type: "error" });
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

// 编辑币种对话框相关
const showEditDialog = ref(false);
const editFormRef = ref();
const editFormData = ref({
  id: 0,
  name: "",
  remark: "",
  difftime: "",
  status: "1"
});
const editFormRules = {
  name: [
    { required: true, message: "请输入币种名称", trigger: "blur" }
  ]
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  showEditDialog.value = true;
  // 回填数据
  editFormData.value = {
    id: row.id,
    name: row.name,
    remark: row.remark || "",
    difftime: row.difftime || "",
    status: row.status || "1"
  };
};

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  showEditDialog.value = false;
  editFormRef.value?.resetFields();
  editFormData.value = {
    id: 0,
    name: "",
    remark: "",
    difftime: "",
    status: "1"
  };
};

// 提交编辑表单
const handleSubmitEdit = async () => {
  if (!editFormRef.value) return;

  await editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const params: EditCurrencyParams = {
          id: editFormData.value.id,
          name: editFormData.value.name,
          remark: editFormData.value.remark,
          difftime: editFormData.value.difftime,
          status: editFormData.value.status
        };

        const res = await editCurrency(params);

        if (res.code === 0) {
          message("编辑币种成功", { type: "success" });
          handleCloseEditDialog();
          // 刷新列表
          getList();
        } else {
          message(res.msg || "编辑币种失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("编辑币种失败:", error);
        message(error?.message || "编辑币种失败", { type: "error" });
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
  const currencyNames = multipleSelection.value.map(item => item.name).join("、");
  const confirmMessage = `确定删除币种 ${currencyNames}？`;

  try {
    await ElMessageBox.confirm(confirmMessage, "删除币种", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      draggable: true,
      type: "warning"
    });

    deleteLoading.value = true;
    try {
      // 批量删除选中的币种
      const deletePromises = multipleSelection.value.map(item =>
        deleteCurrency({ id: item.id })
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

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value.map((col: any) => col.label);
  const exportProps = tableConfig.value.map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      if (prop === "status") {
        return item.status === "1" ? "正常" : "停用";
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "币种管理";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = `币种管理.xlsx`;
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
  a.download = "币种管理.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="currency-container">
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
        :action-bar="{
          buttons,
          width: '150px',
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
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
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
          <div>
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
                    display: inline-block;
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
          </div>
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

    <!-- 新增币种对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增币种"
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
        <el-form-item label="币种名称" prop="name">
          <el-input
            v-model="addFormData.name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="addFormData.remark"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="时差">
          <el-input
            v-model="addFormData.difftime"
            placeholder="请输入"
            maxlength="20"
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
          <el-button type="primary" @click="handleSubmitAdd">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑币种对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑"
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
        <el-form-item label="币种名称" prop="name">
          <el-input
            v-model="editFormData.name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editFormData.remark"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="时差">
          <el-input
            v-model="editFormData.difftime"
            placeholder="请输入"
            maxlength="20"
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
          <el-button type="primary" @click="handleSubmitEdit">
            确认
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
</style>

