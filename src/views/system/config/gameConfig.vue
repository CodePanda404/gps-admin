<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "GameConfig"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import { ElCard, ElButton, ElTooltip, ElIcon } from "element-plus";
import {
  getCurrencyList,
  type CurrencyItem
} from "@/api/game";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Edit from "~icons/ep/edit";

// 币种选项
const currencyOptions = ref<Array<{ label: string; value: string }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.name
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  merchant_number: "",
  currency: "",
  agent_number: "",
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
    label: "商户号",
    prop: "merchant_number",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户号"
    }))
  },
  {
    label: "币种",
    prop: "currency",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择币种",
      filterable: true
    })),
    options: computed(() => [
      {
        label: "全部",
        value: ""
      },
      ...currencyOptions.value
    ])
  },
  {
    label: "代理号",
    prop: "agent_number",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入代理号"
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
    merchant_number: "",
    currency: "",
    agent_number: "",
    createTime: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = {
  id: number;
  manufacturer_name: string;
  merchant_number: string;
  currency: string;
  api_address: string;
  token_value: string;
  secret_key: string;
  agent_number: string;
  createtime: string;
};

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
    },
    width: 100
  },
  {
    label: "厂商名称",
    prop: "manufacturer_name",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户号",
    prop: "merchant_number",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    prop: "currency",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "API地址",
    prop: "api_address",
    tableColumnProps: {
      align: "center"
    },
    minWidth: 200
  },
  {
    label: "Token值",
    prop: "token_value",
    tableColumnProps: {
      align: "center"
    },
    minWidth: 150
  },
  {
    label: "秘钥",
    prop: "secret_key",
    tableColumnProps: {
      align: "center"
    },
    minWidth: 150
  },
  {
    label: "代理号",
    prop: "agent_number",
    tableColumnProps: {
      align: "center"
    }
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

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  // TODO: 实现编辑功能
  message("编辑功能待实现", { type: "info" });
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        manufacturer_name: "厂商A",
        merchant_number: "M001",
        currency: "USD",
        api_address: "https://api.example.com",
        token_value: "token123456",
        secret_key: "secret789",
        agent_number: "A001",
        createtime: "2024-01-01 10:00:00"
      }
    ];
    total.value = 1;
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
onMounted(() => {
  fetchCurrencyList();
  getList();
});
</script>

<template>
  <div class="game-config-container">
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
  </div>
</template>

<style scoped>
.game-config-container {
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
.game-config-container {
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
