<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "OperationLog"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
import { ElMessageBox, ElTooltip, ElButton, ElDialog, ElForm, ElFormItem, ElInput } from "element-plus";
import {
  getOperationLogList,
  type OperationLogListParams,
  type OperationLogItem
} from "@/api/log";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Delete from "~icons/ep/delete";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  username: "",
  title: "",
  content: "",
  url: "",
  ip: "",
  createTime: [] as string[]
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    renderLabel: () => t("permission.operationLog.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.operationLog.search.id")
    }))
  },
  {
    label: "用户名",
    renderLabel: () => t("permission.operationLog.search.username"),
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.operationLog.search.username")
    }))
  },
  {
    label: "标题",
    renderLabel: () => t("permission.operationLog.search.title"),
    prop: "title",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.operationLog.search.title")
    }))
  },
  {
    label: "内容",
    renderLabel: () => t("permission.operationLog.search.content"),
    prop: "content",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.operationLog.search.content")
    }))
  },
  {
    label: "URL",
    renderLabel: () => t("permission.operationLog.search.url"),
    prop: "url",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.operationLog.search.url")
    }))
  },
  {
    label: "IP",
    renderLabel: () => t("permission.operationLog.search.ip"),
    prop: "ip",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("permission.operationLog.search.ip")
    }))
  },
  {
    label: "创建时间",
    renderLabel: () => t("permission.operationLog.search.createTime"),
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
const handleRest = () => {
  searchData.value = {
    id: "",
    username: "",
    title: "",
    content: "",
    url: "",
    ip: "",
    createTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = OperationLogItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 获取事件类型名称（根据title判断）
const getEventName = (title: string | undefined): string => {
  if (!title) return "-";
  // 根据title判断事件类型
  const titleLower = title.toLowerCase();
  if (titleLower.includes("添加账号") || titleLower.includes("新增账号")) return t("permission.operationLog.event.addAccount");
  if (titleLower.includes("修改密码")) return t("permission.operationLog.event.changePassword");
  if (titleLower.includes("修改谷歌") || titleLower.includes("谷歌验证")) return t("permission.operationLog.event.changeGoogle");
  if (titleLower.includes("增加商户") || titleLower.includes("新增商户")) return t("permission.operationLog.event.addMerchant");
  if (titleLower.includes("维护游戏")) return t("permission.operationLog.event.maintainGame");
  if (titleLower.includes("停用游戏")) return t("permission.operationLog.event.disableGame");
  // 如果无法匹配，直接返回title
  return title;
};

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("permission.operationLog.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "用户名",
    renderHeader: () => t("permission.operationLog.table.username"),
    prop: "username",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "标题",
    renderHeader: () => t("permission.operationLog.table.title"),
    prop: "title",
    render: (value: string) => {
      return getEventName(value);
    },
    tableColumnProps: {
      align: "center"
    },
    width: 230
  },
  {
    label: "详情",
    renderHeader: () => t("permission.operationLog.table.content"),
    prop: "content",
    render: (value: string) => {
      if (!value) return "-";
      // 如果内容过长，显示省略号并添加提示
      const maxLength = 25;
      if (value.length > maxLength) {
        const displayText = value.substring(0, maxLength) + "...";
        return h(
          ElTooltip,
          {
            content: value,
            placement: "top",
            effect: "dark"
          },
          {
            default: () => h("span", { style: { cursor: "help" } }, displayText)
          }
        );
      }
      return value;
    },
    tableColumnProps: {
      align: "center"
    },
    minWidth: 220
  },
  {
    label: "URL",
    renderHeader: () => t("permission.operationLog.table.url"),
    prop: "url",
    render: (value: string) => {
      if (!value) return "-";
      const maxLength = 25;
      if (value.length > maxLength) {
        const displayText = value.substring(0, maxLength) + "...";
        return h(
          ElTooltip,
          {
            content: value,
            placement: "top",
            effect: "dark"
          },
          {
            default: () => h("span", { style: { cursor: "help" } }, displayText)
          }
        );
      }
      return value;
    },
    tableColumnProps: {
      align: "center"
    },
    minWidth: 200
  },
  {
    label: "IP",
    renderHeader: () => t("permission.operationLog.table.ip"),
    prop: "ip",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "浏览器",
    renderHeader: () => t("permission.operationLog.table.browser"),
    prop: "useragent",
    render: (value: string) => {
      if (!value) return "-";
      // 从useragent中提取浏览器信息
      const ua = value.toLowerCase();
      if (ua.includes("chrome")) return "Chrome";
      if (ua.includes("firefox")) return "Firefox";
      if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
      if (ua.includes("edge")) return "Edge";
      if (ua.includes("opera")) return "Opera";
      // 如果无法识别，返回原始值的前50个字符
      return value.length > 50 ? value.substring(0, 50) + "..." : value;
    },
    tableColumnProps: {
      align: "center"
    },
    width: 150
  },
  {
    label: "创建时间",
    renderHeader: () => t("permission.operationLog.table.createTime"),
    prop: "createtime",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("permission.operationLog.buttons.detail"),
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
    text: () => t("permission.operationLog.buttons.delete"),
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
    const { page, pageSize } = pageInfo.value;
    const { id, username, title, content, url, ip, createTime } = searchData.value;
    
    const params: OperationLogListParams = {
      pageNumber: page,
      pageSize,
      username: username || undefined,
      title: title || undefined,
      content: content || undefined,
      url: url || undefined,
      ip: ip || undefined
    };
    
    // 处理创建时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }
    
    const res = await getOperationLogList(params);
    
    if (res.code === 0 && res.data && res.data.rows) {
      tableData.value = res.data.rows;
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("permission.operationLog.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("permission.operationLog.message.getListFail"), { type: "error" });
    tableData.value = [];
    total.value = 0;
  } finally {
    loadingStatus.value = false;
  }
};

// 详情对话框相关
const showDetailDialog = ref(false);
const detailData = ref<TableRow | null>(null);

// 详情表单数据
const detailFormData = ref({
  id: "",
  username: "",
  title: "",
  event: "",
  content: "",
  url: "",
  ip: "",
  useragent: "",
  createtime: ""
});

// 查看详情
const handleViewDetail = (row: TableRow) => {
  detailData.value = row;
  // 填充表单数据
  detailFormData.value = {
    id: String(row.id || ""),
    username: row.username || "",
    title: row.title || "",
    event: getEventName(row.title),
    content: row.content || "",
    url: row.url || "",
    ip: row.ip || "",
    useragent: row.useragent || "",
    createtime: row.createtime || ""
  };
  showDetailDialog.value = true;
};

// 关闭详情对话框
const handleCloseDetailDialog = () => {
  showDetailDialog.value = false;
  detailData.value = null;
  // 重置表单数据
  detailFormData.value = {
    id: "",
    username: "",
    title: "",
    event: "",
    content: "",
    url: "",
    ip: "",
    useragent: "",
    createtime: ""
  };
};

// 删除单行数据
const handleDeleteRow = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      t("permission.operationLog.message.confirmDelete", { id: row.id }),
      t("permission.operationLog.delete.title"),
      {
        confirmButtonText: t("permission.operationLog.buttons.confirm"),
        cancelButtonText: t("permission.operationLog.buttons.cancel"),
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      total.value -= 1;
      message(t("permission.operationLog.message.deleteSuccess"), { type: "success" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || t("permission.operationLog.message.deleteFail"), { type: "error" });
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message(t("permission.operationLog.message.selectToDelete"), { type: "warning" });
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      t("permission.operationLog.message.confirmBatchDelete", { count: multipleSelection.value.length }),
      t("permission.operationLog.delete.batchTitle"),
      {
        confirmButtonText: t("permission.operationLog.buttons.confirm"),
        cancelButtonText: t("permission.operationLog.buttons.cancel"),
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const ids = multipleSelection.value.map(item => item.id);
    tableData.value = tableData.value.filter(item => !ids.includes(item.id));
    total.value -= multipleSelection.value.length;
    multipleSelection.value = [];
    message(t("permission.operationLog.message.deleteSuccess"), { type: "success" });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || t("permission.operationLog.message.deleteFail"), { type: "error" });
    }
  }
};

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
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
  <div class="operation-log-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="100"
        label-position="right"
        :has-unfold="false"
        :searchText="t('permission.operationLog.buttons.search')"
        :resetText="t('permission.operationLog.buttons.reset')"
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
          width: '150px',
          label: t('permission.operationLog.table.action')
        }"
        @selection-change="handleSelectionChange"
        width="100%"
        height="90%"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button 
            type="danger" 
            @click="handleBatchDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.operationLog.buttons.delete') }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('permission.operationLog.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('permission.operationLog.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('permission.operationLog.toolbar.hideSearch') : t('permission.operationLog.toolbar.showSearch')"
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
          <el-tooltip :content="t('permission.operationLog.toolbar.export')" placement="top" :trigger="'hover'">
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="t('permission.operationLog.detail.title')"
      width="800px"
      :close-on-click-modal="false"
      @close="handleCloseDetailDialog"
    >
      <el-form
        :model="detailFormData"
        label-width="100px"
        label-position="right"
      >
        <el-form-item :label="t('permission.operationLog.detail.id')">
          <el-input
            v-model="detailFormData.id"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.username')">
          <el-input
            v-model="detailFormData.username"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.event')">
          <el-input
            v-model="detailFormData.event"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.title')">
          <el-input
            v-model="detailFormData.title"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.content')">
          <el-input
            v-model="detailFormData.content"
            type="textarea"
            disabled
            :rows="4"
            placeholder="-"
            style="white-space: pre-wrap; word-break: break-all;"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.url')">
          <el-input
            v-model="detailFormData.url"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.ip')">
          <el-input
            v-model="detailFormData.ip"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.browser')">
          <el-input
            v-model="detailFormData.useragent"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item :label="t('permission.operationLog.detail.createTime')">
          <el-input
            v-model="detailFormData.createtime"
            disabled
            placeholder="-"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDetailDialog">{{ t('permission.operationLog.buttons.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.operation-log-container {
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


.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>


