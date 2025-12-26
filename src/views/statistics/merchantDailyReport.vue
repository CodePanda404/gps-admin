<script setup lang="ts">
import { ref, computed } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "MerchantDailyReport"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  merchant_id: "",
  date: [] as string[]
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "商户ID",
    prop: "merchant_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入商户ID"
    }))
  },
  {
    label: "日期",
    prop: "date",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
      startPlaceholder: "开始日期",
      endPlaceholder: "结束日期"
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
    merchant_id: "",
    date: []
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = {
  date: string;
  merchant_id: number;
  merchant_name: string;
  bet_amount: string;
  win_amount: string;
  profit_loss: string;
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "日期",
    prop: "date",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户ID",
    prop: "merchant_id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "商户名称",
    prop: "merchant_name",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "投注金额",
    prop: "bet_amount",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "中奖金额",
    prop: "win_amount",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "盈亏",
    prop: "profit_loss",
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    tableData.value = [];
    total.value = 0;
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
</script>

<template>
  <div class="merchant-daily-report-container">
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
        :adaptive="true"
        width="100%"
        height="90%"
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
.merchant-daily-report-container {
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
</style>


