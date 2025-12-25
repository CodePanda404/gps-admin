<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "OperationLog"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
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
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入ID"
    }))
  },
  {
    label: "用户名",
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入用户名"
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
    label: "内容",
    prop: "content",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入内容（模糊匹配）"
    }))
  },
  {
    label: "URL",
    prop: "url",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入URL"
    }))
  },
  {
    label: "IP",
    prop: "ip",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入IP"
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
  if (titleLower.includes("添加账号") || titleLower.includes("新增账号")) return "添加账号";
  if (titleLower.includes("修改密码")) return "修改密码";
  if (titleLower.includes("修改谷歌") || titleLower.includes("谷歌验证")) return "修改谷歌验证";
  if (titleLower.includes("增加商户") || titleLower.includes("新增商户")) return "增加商户";
  if (titleLower.includes("维护游戏")) return "维护游戏";
  if (titleLower.includes("停用游戏")) return "停用游戏";
  // 如果无法匹配，直接返回title
  return title;
};

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    prop: "id",
    tableColumnProps: {
      align: "center"
    },
    width: 100
  },
  {
    label: "用户名",
    prop: "username",
    tableColumnProps: {
      align: "center"
    },
    width: 120
  },
  {
    label: "标题",
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
    prop: "ip",
    tableColumnProps: {
      align: "center"
    },
    width: 140
  },
  {
    label: "浏览器",
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
      `确定删除ID为 ${row.id} 的操作日志吗？`,
      "删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      total.value -= 1;
      message("删除成功", { type: "success" });
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
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const ids = multipleSelection.value.map(item => item.id);
    tableData.value = tableData.value.filter(item => !ids.includes(item.id));
    total.value -= multipleSelection.value.length;
    multipleSelection.value = [];
    message("删除成功", { type: "success" });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
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
        :adaptive="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: '操作'
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="操作日志详情"
      width="800px"
      :close-on-click-modal="false"
      @close="handleCloseDetailDialog"
    >
      <el-form
        :model="detailFormData"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="ID">
          <el-input
            v-model="detailFormData.id"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="detailFormData.username"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="事件">
          <el-input
            v-model="detailFormData.event"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="标题">
          <el-input
            v-model="detailFormData.title"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="detailFormData.content"
            type="textarea"
            disabled
            :rows="4"
            placeholder="-"
            style="white-space: pre-wrap; word-break: break-all;"
          />
        </el-form-item>
        <el-form-item label="URL">
          <el-input
            v-model="detailFormData.url"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="IP">
          <el-input
            v-model="detailFormData.ip"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="浏览器">
          <el-input
            v-model="detailFormData.useragent"
            disabled
            placeholder="-"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input
            v-model="detailFormData.createtime"
            disabled
            placeholder="-"
          />
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
.operation-log-container {
  width: 100%;
}


.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>


