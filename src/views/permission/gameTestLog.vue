<script setup lang="ts">
import { ref, computed, h, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "GameTestLog"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import { ElDialog, ElForm, ElFormItem, ElInput, ElTag, ElTooltip } from "element-plus";
import {
  getCurrencyList,
  type CurrencyItem
} from "@/api/game";
import {
  getGameTestLogList,
  getGameTestLogDetail,
  type GameTestLogItem,
  type GameTestLogListParams
} from "@/api/log";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 币种选项
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 钱包类型选项
const walletTypeOptions = [
  { label: "全部", value: "" },
  { label: "单一钱包", value: "1" },
  { label: "转账钱包", value: "2" }
];

// 状态选项
const statusOptions = [
  { label: "全部", value: "" },
  { label: "正常", value: "1" },
  { label: "停用", value: "0" }
];

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  shortname: "",
  type_name: "",
  wallet_type: "",
  currency: "",
  game_id: "",
  merchant_id: "",
  username: "",
  updateTime: [] as string[],
  status: ""
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
    label: "产品缩写",
    prop: "shortname",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品缩写"
    }))
  },
  {
    label: "产品名称",
    prop: "type_name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入产品名称"
    }))
  },
  {
    label: "钱包类型",
    prop: "wallet_type",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择钱包类型"
    })),
    options: walletTypeOptions
  },
  {
    label: "币种",
    prop: "currency",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入币种"
    }))
  },
  {
    label: "游戏ID",
    prop: "game_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入游戏ID"
    }))
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "用户",
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入用户"
    }))
  },
  {
    label: "创建时间",
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
      placeholder: "请选择状态"
    })),
    options: statusOptions
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
    shortname: "",
    type_name: "",
    wallet_type: "",
    currency: "",
    game_id: "",
    merchant_id: "",
    username: "",
    updateTime: [],
    status: ""
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用API响应类型）
type TableRow = GameTestLogItem;

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
    label: "钱包类型",
    prop: "wallet_type",
    render: (value: number | string) => {
      if (value === 1) return "单一钱包";
      if (value === 2) return "转账钱包";
      return value;
    },
    tableColumnProps: {
      align: "center"
    },
    width: "100"
  },
  {
    label: "币种",
    prop: "currency",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "游戏ID",
    prop: "game_id",
    tableColumnProps: {
      align: "center"
    },
    width: "220"
  },
  {
    label: "API报错信息",
    prop: "error_message",
    render: (value: string | null, row: TableRow) => {
      const errorMsg = value || row.message || "";
      if (!errorMsg) return "-";
      const maxLength = 50; // 限制显示字符数
      const truncated = errorMsg.length > maxLength ? errorMsg.substring(0, maxLength) + "..." : errorMsg;
      return h(ElTooltip, {
        content: errorMsg,
        placement: "top",
        effect: "dark"
      }, {
        default: () => h("span", truncated)
      });
    },
    tableColumnProps: {
      align: "center"
    },
    width: "160"
  },
  {
    label: "产品分类ID",
    prop: "type_id",
    tableColumnProps: {
      align: "center"
    },
    width: "120"
  },
  {
    label: "产品名称",
    prop: "type_name",
    tableColumnProps: {
      align: "center"
    },
    width: "180"
  },
  {
    label: "产品缩写",
    prop: "shortname",
    tableColumnProps: {
      align: "center"
    },
    width: "120"
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "用户",
    prop: "username",
    tableColumnProps: {
      align: "center"
    },
    width: "160"
  },
  {
    label: "创建时间",
    prop: "createtime",
    tableColumnProps: {
      align: "center"
    },
    width: "160"
  },
  {
    label: "状态",
    prop: "status",
    render: (value: number | string) => {
      if (value === "1" || value === 1) {
        return h(ElTag, { type: "success" }, () => "正常");
      }
      if (value === "0" || value === 0) {
        return h(ElTag, { type: "danger" }, () => "停用");
      }
      return value;
    },
    tableColumnProps: {
      align: "center",
      fixed: "right"
    }
  }
]);



// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, shortname, type_name, wallet_type, currency, game_id, merchant_id, username, updateTime, status } = searchData.value;
    
    const params: GameTestLogListParams = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      shortname: shortname || undefined,
      type_name: type_name || undefined,
      wallet_type: wallet_type || undefined,
      currency: currency || undefined,
      game_id: game_id || undefined,
      merchant_id: merchant_id || undefined,
      username: username || undefined,
      status: status || undefined
    };
    
    // 处理时间范围
    if (updateTime && Array.isArray(updateTime) && updateTime.length === 2) {
      params.create_start_time = updateTime[0];
      params.create_end_time = updateTime[1];
    }
    
    const res = await getGameTestLogList(params);
    
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

// 详情对话框相关
const showDetailDialog = ref(false);
const detailFormData = ref({
  requestUrl: "",
  promptMessage: "",
  gameLink: "",
  requestHeader: "",
  requestBody: "",
  requestResult: "",
  apiRequestUrl: "",
  apiRequestParams: "",
  apiRequestResult: ""
});

// 查看详情
const handleViewDetail = async (row: TableRow) => {
  try {
    const res = await getGameTestLogDetail(row.id);
    if (res.code === 0 && res.data) {
      const data = res.data;
      // 解析JSON字符串
      let requestHeader = "";
      let requestBody = "";
      let requestResult = "";
      let gameapiData = "";
      let gameapiResult = "";
      
      try {
        if (data.request_header) {
          const headerArray = JSON.parse(data.request_header);
          requestHeader = Array.isArray(headerArray) ? headerArray.join("\n") : data.request_header;
        }
      } catch (e) {
        requestHeader = data.request_header || "";
      }
      
      try {
        if (data.request_body) {
          const bodyObj = JSON.parse(data.request_body);
          requestBody = JSON.stringify(bodyObj, null, 2);
        }
      } catch (e) {
        requestBody = data.request_body || "";
      }
      
      try {
        if (data.request_result) {
          const resultObj = JSON.parse(data.request_result);
          requestResult = JSON.stringify(resultObj, null, 2);
        }
      } catch (e) {
        requestResult = data.request_result || "";
      }
      
      try {
        if (data.gameapi_data) {
          const apiDataObj = JSON.parse(data.gameapi_data);
          gameapiData = JSON.stringify(apiDataObj, null, 2);
        }
      } catch (e) {
        gameapiData = data.gameapi_data || "";
      }
      
      try {
        if (data.gameapi_result) {
          const apiResultObj = JSON.parse(data.gameapi_result);
          gameapiResult = JSON.stringify(apiResultObj, null, 2);
        }
      } catch (e) {
        gameapiResult = data.gameapi_result || "";
      }
      
      detailFormData.value = {
        requestUrl: data.request_url || "",
        promptMessage: data.message || "",
        gameLink: data.game_url || "",
        requestHeader: requestHeader,
        requestBody: requestBody,
        requestResult: requestResult,
        apiRequestUrl: data.gameapi_url || "",
        apiRequestParams: gameapiData,
        apiRequestResult: gameapiResult
      };
      showDetailDialog.value = true;
    } else {
      message(res.msg || "获取详情失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("获取详情失败:", error);
    message(error?.message || "获取详情失败", { type: "error" });
  }
};

// 关闭详情对话框
const handleCloseDetailDialog = () => {
  showDetailDialog.value = false;
  detailFormData.value = {
    requestUrl: "",
    promptMessage: "",
    gameLink: "",
    requestHeader: "",
    requestBody: "",
    requestResult: "",
    apiRequestUrl: "",
    apiRequestParams: "",
    apiRequestResult: ""
  };
};

// 配置操作列按钮
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
  }
];

// 初始化加载数据
onMounted(() => {
  fetchCurrencyList();
  getList();
});
</script>

<template>
  <div class="game-test-log-container">
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
        @selection-change="(val: any[]) => multipleSelection = val"
      >
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
      title="测试日志详情"
      width="800px"
      @close="handleCloseDetailDialog"
    >
      <el-form :model="detailFormData" label-width="120px">
        <!-- 后台请求信息 -->
        <div style="margin-bottom: 30px;">
          <h3 style="margin-bottom: 20px; font-size: 16px; font-weight: 600;">后台请求信息</h3>
          <el-form-item label="请求地址:">
            <el-input v-model="detailFormData.requestUrl" disabled />
          </el-form-item>
          <el-form-item label="提示信息:">
            <el-input v-model="detailFormData.promptMessage" disabled />
          </el-form-item>
          <el-form-item label="游戏链接:">
            <el-input v-model="detailFormData.gameLink" disabled />
          </el-form-item>
          <el-form-item label="请求头:">
            <el-input
              v-model="detailFormData.requestHeader"
              type="textarea"
              :rows="4"
              disabled
            />
          </el-form-item>
          <el-form-item label="请求体:">
            <el-input
              v-model="detailFormData.requestBody"
              type="textarea"
              :rows="4"
              disabled
            />
          </el-form-item>
          <el-form-item label="请求结果:">
            <el-input
              v-model="detailFormData.requestResult"
              type="textarea"
              :rows="4"
              disabled
            />
          </el-form-item>
        </div>

        <!-- API请求信息 -->
        <div>
          <h3 style="margin-bottom: 20px; font-size: 16px; font-weight: 600;">API请求信息</h3>
          <el-form-item label="API请求地址:">
            <el-input v-model="detailFormData.apiRequestUrl" disabled />
          </el-form-item>
          <el-form-item label="API请求参数:">
            <el-input
              v-model="detailFormData.apiRequestParams"
              type="textarea"
              :rows="4"
              disabled
            />
          </el-form-item>
          <el-form-item label="API请求结果:">
            <el-input
              v-model="detailFormData.apiRequestResult"
              type="textarea"
              :rows="4"
              disabled
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseDetailDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.game-test-log-container {
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
.game-test-log-container {
  width: 100%;
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
</style>


