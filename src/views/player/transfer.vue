<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import {
  type PlusColumn,
  PlusSearch,
  FormChangeCallBackParams
} from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { switchPlayerStatus } from "@/api/player";
import { type TransferPlayerItem } from "@/api/player";
import { TableColumn } from "@pureadmin/table";
import Upload from "~icons/ep/upload";

const { t, locale } = useI18n();

// 加载状态
const loading = ref(false);

/*-----搜索表单相关-----*/
// 表单数据
const state = ref({
  id: "",
  name: "",
  userId: "",
  status: "",
  registerTime: null as string[] | null
});
// 表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("player.transfer.idPlaceholder")
    }))
  },
  {
    label: "用户名",
    renderLabel: () => t("player.transfer.name"),
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("player.transfer.namePlaceholder")
    }))
  },
  {
    label: "用户ID",
    renderLabel: () => t("player.transfer.userId"),
    prop: "userId",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("player.transfer.userIdPlaceholder")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("player.transfer.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("player.transfer.statusPlaceholder")
    })),
    options: [
      {
        label: "全部",
        renderLabel: () => t("player.transfer.all"),
        value: ""
      },
      {
        label: "禁用",
        renderLabel: () => t("player.transfer.disabled"),
        value: "0"
      },
      {
        label: "正常",
        renderLabel: () => t("player.transfer.normal"),
        value: "1"
      }
    ]
  },
  {
    label: "注册时间",
    renderLabel: () => t("player.transfer.registerTime"),
    prop: "registerTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      startPlaceholder: t("player.transfer.registerTimePlaceholder"),
      endPlaceholder: t("player.transfer.registerTimePlaceholder")
    }))
  }
];
// 处理搜索表单变化
const handleChange = (values: any) => {
  // 搜索条件变化时的处理
};

// 搜索处理
const handleSearch = (values: any) => {
  // 重置到第一页
  page.value.current = 1;
  // 重新获取数据
  getList();
};

// 重置搜索条件
const handleRest = () => {
  state.value = {
    id: "",
    name: "",
    userId: "",
    status: "",
    registerTime: null
  };
  // 重置到第一页
  page.value.current = 1;
  // 重新获取数据
  getList();
};

// /*----表格相关-----*/ */
// 表格数据类型
type TableRow = TransferPlayerItem;
const multipleSelection = ref<TableRow[]>([]);
const { tableData, buttons } = useTable<TableRow[]>();

// 分页配置
const page = ref({
  current: 1,
  pageSize: 10,
  total: 0
});
// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("player.transfer.id"),
    prop: "id",
    width: "100"
  },
  {
    label: "用户名",
    renderHeader: () => t("player.transfer.name"),
    prop: "name",
    width: "130"
  },
  {
    label: "余额",
    renderHeader: () => t("player.transfer.balance"),
    prop: "balance",
    width: "130"
  },
  {
    label: "币种",
    renderHeader: () => t("player.transfer.currency"),
    prop: "currency",
    width: "130"
  },
  {
    label: "商户ID",
    renderHeader: () => t("player.transfer.merchantID"),
    prop: "merchant",
    width: "130"
  },
  {
    label: "累计投注",
    renderHeader: () => t("player.transfer.totalBet"),
    prop: "totalBet",
    width: "130"
  },
  {
    label: "累计派彩",
    renderHeader: () => t("player.transfer.totalPet"),
    prop: "totalPet",
    width: "130"
  },
  {
    label: "累计输赢",
    renderHeader: () => t("player.transfer.totalWinLoss"),
    prop: "totalWinLoss",
    width: "130"
  },
  {
    label: "登录时间",
    renderHeader: () => t("player.transfer.loginTime"),
    prop: "loginTime",
    width: "180"
  },
  {
    label: "登录IP",
    renderHeader: () => t("player.transfer.loginIP"),
    prop: "loginIp",
    width: "130"
  },
  {
    label: "注册时间",
    renderHeader: () => t("player.transfer.registerTime"),
    prop: "registerTime",
    width: "180"
  },
  {
    label: "注册IP",
    renderHeader: () => t("player.transfer.registerIP"),
    prop: "registerIP",
    width: "130"
  },
  {
    label: "状态",
    renderHeader: () => t("player.transfer.status"),
    prop: "status",
    valueType: "switch",
    width: "130",
    editable: true
  }
]);

// 表格操作按钮定义
buttons.value = [
  {
    text: () => t("player.transfer.depWithDrawDetail"),
    code: "depWithDrawDetail",
    props: {
      type: "primary"
    },
    onClick: () => {}
  },
  {
    text: () => t("player.transfer.betDetail"),
    code: "betDetail",
    props: {
      type: "primary"
    },
    onClick: () => {}
  }
];

// 选中数据变化处理
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 状态切换处理
const handleStatusChange = async (params: {
  row: TableRow;
  prop: string;
  value: any;
}) => {
  const { row, prop, value } = params;

  // 只处理状态字段的变化
  if (prop !== "status") {
    return;
  }

  // 检查 row 是否存在
  if (!row) {
    console.error("行数据不存在");
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  const newStatus = value; // 新状态
  const originalStatus = !value; // 原始状态（新状态的反值）

  const isDisabling = originalStatus === true;

  // 构建提示文字
  const confirmMessage = isDisabling
    ? `是否确定将玩家${row.name}禁用?`
    : `是否确定将玩家${row.name}恢复正常?`;

  try {
    // 显示确认对话框
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
      draggable: true
    });

    // 调用 API 切换状态
    // const res = await switchPlayerStatus({
    //   id: row.id,
    //   status: newStatus
    // });
    const res = {
      success: false,
      message: "状态切换成功"
    };

    if (res.success) {
      // 显示成功提示
      message(isDisabling ? "玩家已禁用" : "玩家已恢复正常", {
        type: "success"
      });
      // 可选：刷新列表数据
      // getList();
    } else {
      // 失败时恢复原状态
      row.status = originalStatus;
      const tableRowIndex = tableData.value.findIndex(
        item => item.id === row.id
      );
      if (tableRowIndex !== -1) {
        // 创建新对象替换，确保响应式更新
        tableData.value[tableRowIndex] = {
          ...tableData.value[tableRowIndex],
          status: originalStatus
        };
      }
      message("状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    // 恢复 row.status（表格行对象）
    row.status = originalStatus;
    const tableRowIndex = tableData.value.findIndex(item => item.id === row.id);
    if (tableRowIndex !== -1) {
      // 创建新对象替换，确保响应式更新
      tableData.value[tableRowIndex] = {
        ...tableData.value[tableRowIndex],
        status: originalStatus
      };
    }

    if (error !== "cancel") {
      // 不是用户取消，而是请求失败
      console.error("状态切换失败:", error);
      message(error?.message || "状态切换失败", { type: "error" });
    }
  }
};

const handleEdited = (params: {
  row: TableRow;
  prop: string;
  value: any;
  oldValue: any;
}) => {
  console.log("xxxx", params);
};

const handleCellClick = (params: { row: TableRow; column: any }) => {
  console.log("yyyy", params.column);
  return false;
};

// 生成模拟数据
const generateMockData = (): TableRow[] => {
  const currencies = ["PHP", "INR", "THB", "MYR", "USD"];
  const names = [
    "Slew",
    "John",
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Emma",
    "Frank",
    "Grace",
    "Henry"
  ];
  const merchants = [
    "abc123",
    "xyz789",
    "merchant001",
    "merchant002",
    "merchant003"
  ];

  return Array.from({ length: 100 }).map((_, index) => {
    const randomCurrency =
      currencies[Math.floor(Math.random() * currencies.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomMerchant =
      merchants[Math.floor(Math.random() * merchants.length)];
    const randomDate = new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    return {
      id: index + 1,
      name: `${randomName}${index + 1}`,
      balance: Math.floor(Math.random() * 1000000000),
      currency: randomCurrency,
      merchant: randomMerchant,
      totalBet: Math.floor(Math.random() * 100000),
      totalPet: Math.floor(Math.random() * 100000),
      totalWinLoss: Math.floor(Math.random() * 50000) - 25000,
      loginTime: randomDate
        .toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
        .replace(/\//g, "-"),
      loginIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      registerTime: randomDate
        .toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
        .replace(/\//g, "-"),
      registerIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      status: Math.random() > 0.3 // 70% 概率为 true
    };
  });
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 每次重新生成数据（简化逻辑，不维护状态持久化）
    const allData = generateMockData();

    // 根据搜索条件过滤数据
    let filteredData = [...allData];

    // ID 筛选
    if (state.value.id) {
      filteredData = filteredData.filter(item =>
        item.id.toString().includes(state.value.id.toString())
      );
    }

    // 用户名筛选
    if (state.value.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(state.value.name.toLowerCase())
      );
    }

    // 用户ID筛选
    if (state.value.userId) {
      filteredData = filteredData.filter(item =>
        item.id.toString().includes(state.value.userId.toString())
      );
    }

    // 状态筛选
    if (state.value.status !== "") {
      const statusBool = state.value.status === "1";
      filteredData = filteredData.filter(item => item.status === statusBool);
    }

    // 注册时间范围筛选
    if (
      state.value.registerTime &&
      Array.isArray(state.value.registerTime) &&
      state.value.registerTime.length === 2
    ) {
      const startTime = new Date(state.value.registerTime[0]).getTime();
      const endTime = new Date(state.value.registerTime[1]).getTime();
      filteredData = filteredData.filter(item => {
        const itemTime = new Date(item.registerTime).getTime();
        return itemTime >= startTime && itemTime <= endTime;
      });
    }

    // 计算总数
    const total = filteredData.length;

    // 分页处理
    const start = (page.value.current - 1) * page.value.pageSize;
    const end = start + page.value.pageSize;
    const paginatedData = filteredData.slice(start, end);

    // 更新表格数据和分页信息
    tableData.value = paginatedData;
    page.value.total = total;
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const handlePageChange = (current: number, pageSize?: number) => {
  page.value.current = current;
  if (pageSize) {
    page.value.pageSize = pageSize;
    page.value.current = 1; // 切换每页数量时重置到第一页
  }
  getList();
};

// 初始化加载数据
getList();

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value.map(col => col.renderHeader());
  const exportProps = tableConfig.value.map(col => col.prop);

  // 3. 处理选中数据：按字段名提取值，空值替换为空字符串
  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      // 空值处理：避免Excel出现undefined/null
      return item[prop] ?? "";
    });
  });

  // 4. 插入表头（保持原有unshift逻辑）
  res.unshift(exportTitles);

  // 5. 生成并导出Excel（原有逻辑复用）
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  // 国际化sheet名称（可选）
  const sheetName = "数据报表";
  utils.book_append_sheet(workBook, workSheet, sheetName);
  // 国际化文件名（可选）
  const fileName = `转账模式玩家.xlsx`;
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
  a.download = "转账模式玩家.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <!-- 搜索表单 -->
  <el-card class="search-card" shadow="never" style="margin: 20px">
    <PlusSearch
      v-model="state"
      :columns="searchColumns"
      label-width="80"
      label-position="right"
      :has-unfold="false"
      :searchText="t('player.transfer.search')"
      :resetText="t('player.transfer.reset')"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleRest"
    />
  </el-card>
  <!-- 表格 -->
  <el-card class="table-card" shadow="never" style="margin: 20px">
    <PlusTable
      v-loading="loading"
      :columns="tableConfig"
      :table-data="tableData"
      :is-selection="true"
      :action-bar="{
        buttons,
        width: '220px',
        label: t('player.transfer.action')
      }"
      height="550px"
      @selection-change="handleSelectionChange"
      @formChange="handleStatusChange"
      @edited="handleEdited"
      @cell-click="handleCellClick"
    >
      <template #toolbar>
        <el-dropdown trigger="click" popper-class="custom-export-dropdown">
          <el-icon
            :size="20"
            style="
              margin-top: 3px;
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
              <el-dropdown-item @click="exportExcel">Excel</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </PlusTable>
    <PlusPagination
      v-model="page"
      :total="page.total"
      :small="true"
      :page-sizes="[10, 20, 50, 100]"
      :layout="'total, sizes, prev, pager, next, jumper'"
      @change="handlePageChange"
    />
  </el-card>
</template>

<style scoped>
.table-card {
  max-width: 100%;
  height: 700px;
  max-height: 650px;
}

.custom-export-dropdown {
  min-width: 80px !important;
  padding: 0 !important;
  border-radius: 4px;
}

/* 下拉选项：上下排列+占满宽度+取消默认间距 */
.custom-export-dropdown .el-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0 !important;
  text-align: center;
  border-radius: 0;
}

/* Json 选项高亮：蓝色背景+白色文字 */
.custom-export-dropdown .export-active {
  color: #fff !important;
  background-color: #1677ff !important; /* Element Plus 主题蓝色 */
}

/* 鼠标 hover 效果（可选） */
.custom-export-dropdown .el-dropdown-item:not(.export-active):hover {
  background-color: #f5f7fa !important;
}
</style>
