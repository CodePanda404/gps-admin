<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "Currency"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
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
    renderLabel: () => t("merchant.currency.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.currency.search.id")
    }))
  },
  {
    label: "币种名称",
    renderLabel: () => t("merchant.currency.search.name"),
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.currency.search.name")
    }))
  },
  {
    label: "备注",
    renderLabel: () => t("merchant.currency.search.remark"),
    prop: "remark",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("merchant.currency.search.remark")
    }))
  },
  {
    label: "创建时间",
    renderLabel: () => t("merchant.currency.search.createTime"),
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: t("merchant.currency.search.startDateTime"),
      endPlaceholder: t("merchant.currency.search.endDateTime"),
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
  },
  {
    label: "更新时间",
    renderLabel: () => t("merchant.currency.search.updateTime"),
    prop: "updateTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: t("merchant.currency.search.startDateTime"),
      endPlaceholder: t("merchant.currency.search.endDateTime"),
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
  },
  {
    label: "状态",
    renderLabel: () => t("merchant.currency.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("merchant.currency.search.status")
    })),
    options: computed(() => [
      {
        label: t("merchant.currency.search.all"),
        value: ""
      },
      {
        label: t("merchant.currency.search.normal"),
        value: "1"
      },
      {
        label: t("merchant.currency.search.disabled"),
        value: "-1"
      }
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
    renderHeader: () => t("merchant.currency.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    renderHeader: () => t("merchant.currency.table.name"),
    prop: "name",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    renderHeader: () => t("merchant.currency.table.remark"),
    prop: "remark",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "时差",
    renderHeader: () => t("merchant.currency.table.difftime"),
    prop: "difftime",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    renderHeader: () => t("merchant.currency.table.createtime"),
    prop: "createtime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "更新时间",
    renderHeader: () => t("merchant.currency.table.updatetime"),
    prop: "updatetime",
    width: "160",
    tableColumnProps: {
      sortable: true,
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("merchant.currency.table.status"),
    prop: "status",
    render: (value: string) => {
      return h(ElTag, {
        type: value === '1' ? "success" : "danger"
      }, () => value === '1' ? t("merchant.currency.table.normal") : t("merchant.currency.table.disabled"));
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
    text: () => t("merchant.currency.buttons.edit"),
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
      message(res.msg || t("merchant.currency.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("merchant.currency.message.getListFail"), { type: "error" });
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

// 对话框相关（统一新增和编辑）
const showDialog = ref(false);
const isEdit = ref(false);
const formRef = ref();
const formData = ref({
  id: 0,
  name: "",
  remark: "",
  difftime: "",
  status: "1"
});
const formRules = {
  name: [
    { required: true, message: t("merchant.currency.form.nameRequired"), trigger: "blur" }
  ]
};

// 对话框标题
const dialogTitle = computed(() => {
  return isEdit.value ? t("merchant.currency.edit.title") : t("merchant.currency.add.title");
});

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    id: 0,
    name: "",
    remark: "",
    difftime: "",
    status: "1"
  };
  showDialog.value = true;
};

// 编辑（批量）- 只有一条选中时才能编辑
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("merchant.currency.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  formData.value = {
    id: row.id,
    name: row.name,
    remark: row.remark || "",
    difftime: row.difftime || "",
    status: row.status || "1"
  };
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
  formData.value = {
    id: 0,
    name: "",
    remark: "",
    difftime: "",
    status: "1"
  };
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑
          const params: EditCurrencyParams = {
            id: formData.value.id,
            name: formData.value.name,
            remark: formData.value.remark,
            difftime: formData.value.difftime,
            status: formData.value.status
          };

          const res = await editCurrency(params);

          if (res.code === 0) {
            message(t("merchant.currency.message.editSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("merchant.currency.message.editFail"), { type: "error" });
          }
        } else {
          // 新增
          const params: AddCurrencyParams = {
            name: formData.value.name,
            remark: formData.value.remark,
            difftime: formData.value.difftime,
            status: formData.value.status
          };

          const res = await addCurrency(params);

          if (res.code === 0) {
            message(t("merchant.currency.message.addSuccess"), { type: "success" });
            handleCloseDialog();
            getList();
          } else {
            message(res.msg || t("merchant.currency.message.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        console.error(isEdit.value ? "编辑币种失败:" : "新增币种失败:", error);
        message(error?.message || (isEdit.value ? t("merchant.currency.message.editFail") : t("merchant.currency.message.addFail")), { type: "error" });
      }
    }
  });
};

// 删除
const handleDelete = async () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.currency.message.selectToDelete"), { type: "warning" });
    return;
  }

  // 构建删除确认消息
  const currencyNames = multipleSelection.value.map(item => item.name).join("、");
  const confirmMessage = t("merchant.currency.message.confirmDelete", { names: currencyNames });

  try {
    await ElMessageBox.confirm(confirmMessage, t("merchant.currency.delete.title"), {
      confirmButtonText: t("merchant.currency.buttons.confirm"),
      cancelButtonText: t("merchant.currency.buttons.cancel"),
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
        message(t("merchant.currency.message.deleteSuccess"), { type: "success" });
        // 清空选中数据
        multipleSelection.value = [];
        // 刷新列表
        getList();
      } else {
        message(t("merchant.currency.message.deleteFailCount", { count: failedCount }), { type: "error" });
        // 即使有失败，也刷新列表
        getList();
      }
    } catch (error: any) {
      console.error("删除失败:", error);
      message(error?.message || t("merchant.currency.message.deleteFail"), { type: "error" });
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
        return item.status === "1" ? t("merchant.currency.table.normal") : t("merchant.currency.table.disabled");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("merchant.currency.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("merchant.currency.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("merchant.currency.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("merchant.currency.export.jsonFileName");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="currency-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="120"
        label-position="right"
        :has-unfold="false"
        :searchText="t('merchant.currency.buttons.search')"
        :resetText="t('merchant.currency.buttons.reset')"
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
        :action-bar="{
          buttons,
          width: '150px',
          label: t('merchant.currency.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.currency.buttons.add') }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.currency.buttons.edit') }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
            :loading="deleteLoading"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('merchant.currency.buttons.delete') }}</span>
          </el-button>
          <el-dropdown style="margin-left: 15px;">
            <el-button type="info" size="default" >
              <span>{{ t('merchant.currency.buttons.more') }}</span>
              <el-icon class="el-icon--right"><component :is="More" /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>{{ t('merchant.currency.buttons.action1') }}</el-dropdown-item>
                <el-dropdown-item>{{ t('merchant.currency.buttons.action2') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('merchant.currency.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('merchant.currency.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('merchant.currency.toolbar.hideSearch') : t('merchant.currency.toolbar.showSearch')"
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
          <el-tooltip :content="t('merchant.currency.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 新增/编辑币种对话框 -->
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
        label-width="130px"
      >
        <el-form-item :label="t('merchant.currency.form.name')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.currency.form.remark')">
          <el-input
            v-model="formData.remark"
            :placeholder="t('placeholder.input')"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.currency.form.difftime')">
          <el-input
            v-model="formData.difftime"
            :placeholder="t('placeholder.input')"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item :label="t('merchant.currency.form.status')">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">{{ t('merchant.currency.form.open') }}</el-radio>
            <el-radio label="-1">{{ t('merchant.currency.form.close') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t('merchant.currency.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ t('merchant.currency.buttons.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.currency-container {
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
</style>

