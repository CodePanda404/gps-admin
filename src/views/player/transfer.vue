<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  type PlusColumn,
  PlusSearch
} from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { switchPlayerStatus } from "@/api/player";
import { type TransferPlayerItem } from "@/api/player";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";

// 路由
const router = useRouter();

// 国际化
const { t } = useI18n();

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
  userId: "",
  status: "",
  registerTime: null as string[] | null
});

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    prop: "id",
    valueType: "copy",
    // 国际化
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

// 点击搜索按钮
const handleSearch = (values: any) => {
  // 重置到第一页
  pageInfo.value.page = 1;
  // 重新获取数据
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    id: "",
    name: "",
    userId: "",
    status: "",
    registerTime: null
  };
  // 重置到第一页
  pageInfo.value.page = 1;
  // 重新获取数据
  getList();
};

// /  *----表格相关-----  */ */
// 表格数据类型
type TableRow = TransferPlayerItem;
// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } = useTable<TableRow[]>();

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
    width: "100",
    editable: true
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("player.transfer.depWithDrawDetail"),
    code: "depWithDrawDetail",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      // 跳转到存取款明细页面，传递玩家ID
      router.push({
        name: "DepositWithdrawalDetails",
        query: {
          playerId: row.id.toString(),
          playerName: row.name
        }
      });
    }
  },
  {
    text: () => t("player.transfer.betDetail"),
    code: "betDetail",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      // 跳转到投注明细页面，传递玩家ID
      router.push({
        name: "BettingDetails",
        query: {
          playerId: row.id.toString(),
          playerName: row.name
        }
      });
    }
  }
];

// 表格选中数据
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 玩家状态切换处理
const handleStatusChange = async (params: {
  row: TableRow;
  prop: string;
  value: any;
}) => {
  const { row, prop, value } = params;
  console.log("切换玩家状态", params.row);
  // 只处理玩家状态字段的变化
  if (prop !== "status") {
    return;
  }

  // 检查 row 是否存在
  if (!row) {
    console.error("行数据不存在");
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }
  // 原始状态 => 新状态的反值
  const originalStatus = !value; 

  // 是否是禁用操作
  const isDisabling = originalStatus === true;

  // 提示文字
  const confirmMessage = isDisabling
    ? `是否确定将玩家${row.name}禁用?`
    : `是否确定将玩家${row.name}恢复正常?`;

  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      draggable: true
    });

    // 调用 API 切换状态
    // const res = await switchPlayerStatus({
    //   id: row.id,
    //   status: newStatus
    // });
    const res = {
      success: false,
      message: "玩家状态切换成功"
    };

    // 玩家状态切换成功
    if (res.success) {
      // 显示成功提示
      message(isDisabling ? "玩家已禁用" : "玩家已恢复正常", {
        type: "success"
      });
      // 可选：刷新列表数据
      // getList();
    } else {
      // 玩家状态失败 => 恢复原状态
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
      message("玩家状态切换失败", { type: "error" });
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

// 固定初始数据
const generateMockData = (): TableRow[] => {
  return [
    {
      id: 1,
      name: "Slew1",
      balance: 1250000,
      currency: "PHP",
      merchant: "abc123",
      totalBet: 50000,
      totalPet: 45000,
      totalWinLoss: 5000,
      loginTime: "2024-01-15 10:30:25",
      loginIp: "192.168.1.100",
      registerTime: "2024-01-01 08:15:30",
      registerIP: "192.168.1.1",
      status: true
    },
    {
      id: 2,
      name: "John2",
      balance: 850000,
      currency: "INR",
      merchant: "xyz789",
      totalBet: 30000,
      totalPet: 28000,
      totalWinLoss: 2000,
      loginTime: "2024-01-16 14:20:10",
      loginIp: "192.168.1.101",
      registerTime: "2024-01-02 09:20:15",
      registerIP: "192.168.1.2",
      status: true
    },
    {
      id: 3,
      name: "Alice3",
      balance: 2100000,
      currency: "THB",
      merchant: "merchant001",
      totalBet: 80000,
      totalPet: 75000,
      totalWinLoss: 5000,
      loginTime: "2024-01-17 16:45:30",
      loginIp: "192.168.1.102",
      registerTime: "2024-01-03 10:30:20",
      registerIP: "192.168.1.3",
      status: false
    },
    {
      id: 4,
      name: "Bob4",
      balance: 950000,
      currency: "MYR",
      merchant: "merchant002",
      totalBet: 40000,
      totalPet: 35000,
      totalWinLoss: 5000,
      loginTime: "2024-01-18 11:15:45",
      loginIp: "192.168.1.103",
      registerTime: "2024-01-04 11:45:10",
      registerIP: "192.168.1.4",
      status: true
    },
    {
      id: 5,
      name: "Charlie5",
      balance: 1500000,
      currency: "USD",
      merchant: "merchant003",
      totalBet: 60000,
      totalPet: 55000,
      totalWinLoss: 5000,
      loginTime: "2024-01-19 13:30:20",
      loginIp: "192.168.1.104",
      registerTime: "2024-01-05 14:20:30",
      registerIP: "192.168.1.5",
      status: true
    },
    {
      id: 6,
      name: "David6",
      balance: 680000,
      currency: "PHP",
      merchant: "abc123",
      totalBet: 25000,
      totalPet: 22000,
      totalWinLoss: 3000,
      loginTime: "2024-01-20 09:25:15",
      loginIp: "192.168.1.105",
      registerTime: "2024-01-06 15:10:45",
      registerIP: "192.168.1.6",
      status: true
    },
    {
      id: 7,
      name: "Emma7",
      balance: 3200000,
      currency: "INR",
      merchant: "xyz789",
      totalBet: 95000,
      totalPet: 88000,
      totalWinLoss: 7000,
      loginTime: "2024-01-21 11:40:30",
      loginIp: "192.168.1.106",
      registerTime: "2024-01-07 16:25:20",
      registerIP: "192.168.1.7",
      status: false
    },
    {
      id: 8,
      name: "Frank8",
      balance: 1450000,
      currency: "THB",
      merchant: "merchant001",
      totalBet: 55000,
      totalPet: 50000,
      totalWinLoss: 5000,
      loginTime: "2024-01-22 14:15:50",
      loginIp: "192.168.1.107",
      registerTime: "2024-01-08 10:50:35",
      registerIP: "192.168.1.8",
      status: true
    },
    {
      id: 9,
      name: "Grace9",
      balance: 780000,
      currency: "MYR",
      merchant: "merchant002",
      totalBet: 35000,
      totalPet: 32000,
      totalWinLoss: 3000,
      loginTime: "2024-01-23 16:30:25",
      loginIp: "192.168.1.108",
      registerTime: "2024-01-09 12:15:10",
      registerIP: "192.168.1.9",
      status: true
    },
    {
      id: 10,
      name: "Henry10",
      balance: 2200000,
      currency: "USD",
      merchant: "merchant003",
      totalBet: 70000,
      totalPet: 65000,
      totalWinLoss: 5000,
      loginTime: "2024-01-24 08:45:40",
      loginIp: "192.168.1.109",
      registerTime: "2024-01-10 13:30:25",
      registerIP: "192.168.1.10",
      status: true
    },
    {
      id: 11,
      name: "Ivy11",
      balance: 920000,
      currency: "PHP",
      merchant: "abc123",
      totalBet: 42000,
      totalPet: 38000,
      totalWinLoss: 4000,
      loginTime: "2024-01-25 10:20:15",
      loginIp: "192.168.1.110",
      registerTime: "2024-01-11 09:45:50",
      registerIP: "192.168.1.11",
      status: false
    },
    {
      id: 12,
      name: "Jack12",
      balance: 1650000,
      currency: "INR",
      merchant: "xyz789",
      totalBet: 65000,
      totalPet: 60000,
      totalWinLoss: 5000,
      loginTime: "2024-01-26 12:35:30",
      loginIp: "192.168.1.111",
      registerTime: "2024-01-12 14:20:15",
      registerIP: "192.168.1.12",
      status: true
    },
    {
      id: 13,
      name: "Kate13",
      balance: 580000,
      currency: "THB",
      merchant: "merchant001",
      totalBet: 28000,
      totalPet: 25000,
      totalWinLoss: 3000,
      loginTime: "2024-01-27 15:50:45",
      loginIp: "192.168.1.112",
      registerTime: "2024-01-13 11:10:30",
      registerIP: "192.168.1.13",
      status: true
    },
    {
      id: 14,
      name: "Leo14",
      balance: 3100000,
      currency: "MYR",
      merchant: "merchant002",
      totalBet: 100000,
      totalPet: 92000,
      totalWinLoss: 8000,
      loginTime: "2024-01-28 09:15:20",
      loginIp: "192.168.1.113",
      registerTime: "2024-01-14 16:40:25",
      registerIP: "192.168.1.14",
      status: false
    },
    {
      id: 15,
      name: "Mia15",
      balance: 1180000,
      currency: "USD",
      merchant: "merchant003",
      totalBet: 48000,
      totalPet: 43000,
      totalWinLoss: 5000,
      loginTime: "2024-01-29 13:25:35",
      loginIp: "192.168.1.114",
      registerTime: "2024-01-15 08:30:40",
      registerIP: "192.168.1.15",
      status: true
    },
    {
      id: 16,
      name: "Noah16",
      balance: 750000,
      currency: "PHP",
      merchant: "abc123",
      totalBet: 33000,
      totalPet: 30000,
      totalWinLoss: 3000,
      loginTime: "2024-01-30 11:40:50",
      loginIp: "192.168.1.115",
      registerTime: "2024-01-16 10:15:20",
      registerIP: "192.168.1.16",
      status: true
    },
    {
      id: 17,
      name: "Olivia17",
      balance: 2400000,
      currency: "INR",
      merchant: "xyz789",
      totalBet: 75000,
      totalPet: 70000,
      totalWinLoss: 5000,
      loginTime: "2024-01-31 14:55:25",
      loginIp: "192.168.1.116",
      registerTime: "2024-01-17 12:50:15",
      registerIP: "192.168.1.17",
      status: false
    },
    {
      id: 18,
      name: "Paul18",
      balance: 980000,
      currency: "THB",
      merchant: "merchant001",
      totalBet: 45000,
      totalPet: 40000,
      totalWinLoss: 5000,
      loginTime: "2024-02-01 10:30:40",
      loginIp: "192.168.1.117",
      registerTime: "2024-01-18 15:25:30",
      registerIP: "192.168.1.18",
      status: true
    },
    {
      id: 19,
      name: "Quinn19",
      balance: 1350000,
      currency: "MYR",
      merchant: "merchant002",
      totalBet: 52000,
      totalPet: 47000,
      totalWinLoss: 5000,
      loginTime: "2024-02-02 16:20:15",
      loginIp: "192.168.1.118",
      registerTime: "2024-01-19 09:40:45",
      registerIP: "192.168.1.19",
      status: true
    },
    {
      id: 20,
      name: "Ryan20",
      balance: 1850000,
      currency: "USD",
      merchant: "merchant003",
      totalBet: 68000,
      totalPet: 63000,
      totalWinLoss: 5000,
      loginTime: "2024-02-03 08:45:30",
      loginIp: "192.168.1.119",
      registerTime: "2024-01-20 13:15:10",
      registerIP: "192.168.1.20",
      status: true
    },
    {
      id: 21,
      name: "Sophia21",
      balance: 620000,
      currency: "PHP",
      merchant: "abc123",
      totalBet: 29000,
      totalPet: 26000,
      totalWinLoss: 3000,
      loginTime: "2024-02-04 12:10:25",
      loginIp: "192.168.1.120",
      registerTime: "2024-01-21 11:30:20",
      registerIP: "192.168.1.21",
      status: false
    },
    {
      id: 22,
      name: "Tom22",
      balance: 2750000,
      currency: "INR",
      merchant: "xyz789",
      totalBet: 88000,
      totalPet: 82000,
      totalWinLoss: 6000,
      loginTime: "2024-02-05 15:35:50",
      loginIp: "192.168.1.121",
      registerTime: "2024-01-22 14:45:35",
      registerIP: "192.168.1.22",
      status: true
    },
    {
      id: 23,
      name: "Uma23",
      balance: 1100000,
      currency: "THB",
      merchant: "merchant001",
      totalBet: 50000,
      totalPet: 45000,
      totalWinLoss: 5000,
      loginTime: "2024-02-06 09:50:40",
      loginIp: "192.168.1.122",
      registerTime: "2024-01-23 10:20:15",
      registerIP: "192.168.1.23",
      status: true
    },
    {
      id: 24,
      name: "Victor24",
      balance: 4200000,
      currency: "MYR",
      merchant: "merchant002",
      totalBet: 120000,
      totalPet: 110000,
      totalWinLoss: 10000,
      loginTime: "2024-02-07 13:25:30",
      loginIp: "192.168.1.123",
      registerTime: "2024-01-24 16:10:50",
      registerIP: "192.168.1.24",
      status: false
    },
    {
      id: 25,
      name: "Wendy25",
      balance: 1680000,
      currency: "USD",
      merchant: "merchant003",
      totalBet: 72000,
      totalPet: 67000,
      totalWinLoss: 5000,
      loginTime: "2024-02-08 11:15:45",
      loginIp: "192.168.1.124",
      registerTime: "2024-01-25 08:55:25",
      registerIP: "192.168.1.25",
      status: true
    }
  ];
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 每次重新生成数据（简化逻辑，不维护状态持久化）
    const allData = generateMockData();

    // 根据搜索条件过滤数据
    let filteredData = [...allData];

    // ID 筛选
    if (searchData.value.id) {
      filteredData = filteredData.filter(item =>
        item.id.toString() === searchData.value.id.toString()
      );
    }

    // 用户名筛选
    if (searchData.value.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchData.value.name.toLowerCase())
      );
    }

    // 用户ID筛选
    if (searchData.value.userId) {
      filteredData = filteredData.filter(item =>
        item.id.toString() === searchData.value.userId.toString()
      );
    }

    // 状态筛选
    if (searchData.value.status !== "") {
      const statusBool = searchData.value.status === "1";
      filteredData = filteredData.filter(item => item.status === statusBool);
    }

    // 注册时间范围筛选
    if (
      searchData.value.registerTime &&
      Array.isArray(searchData.value.registerTime) &&
      searchData.value.registerTime.length === 2
    ) {
      const startTime = new Date(searchData.value.registerTime[0]).getTime();
      const endTime = new Date(searchData.value.registerTime[1]).getTime();
      filteredData = filteredData.filter(item => {
        const itemTime = new Date(item.registerTime).getTime();
        return itemTime >= startTime && itemTime <= endTime;
      });
    }

    // 计算总数
    const totalCount = filteredData.length;

    // 分页处理
    const start = (pageInfo.value.page - 1) * pageInfo.value.pageSize;
    const end = start + pageInfo.value.pageSize;
    const paginatedData = filteredData.slice(start, end);

    // 更新表格数据和分页信息
    tableData.value = paginatedData;
    total.value = totalCount;
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
    tableData.value = [];
  } finally {
    loadingStatus.value = false;
  }
};

// 记录上一次的 pageSize，用于检测 pageSize 是否改变
const previousPageSize = ref(pageInfo.value.pageSize);

// 分页处理
const handlePageChange = () => {
  if (pageInfo.value.pageSize !== previousPageSize.value) {
    // pageSize 改变了，重置到第一页
    pageInfo.value.page = 1;
    previousPageSize.value = pageInfo.value.pageSize;
  }
  // 重新加载数据
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
      v-model="searchData"
      :columns="searchColumns"
      label-width="80"
      label-position="right"
      :has-unfold="false"
      :searchText="t('player.transfer.search')"
      :resetText="t('player.transfer.reset')"
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
      :is-selection="true"
      :action-bar="{
        buttons,
        width: '220px',
        label: t('player.transfer.action')
      }"
      height="550px"
      @selection-change="handleSelectionChange"
      @formChange="handleStatusChange"
    >
      <template #density-icon>
        <el-tooltip content="密度" placement="top">
          <el-icon
            :size="18"
            style="cursor: pointer; outline: none; margin-right: 15px;"
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
            style="cursor: pointer; outline: none; margin-right: 5px;"
            color="#606266"
          >
            <component :is="Grid" />
          </el-icon>
        </el-tooltip>
      </template>
      <template #toolbar>
        <!-- 导出下拉菜单 -->
        <el-tooltip content="导出" placement="top" :trigger="'hover'">
          <span style="display: inline-block;">
            <el-dropdown trigger="click" popper-class="custom-export-dropdown">
              <el-icon
                :size="18"
                style="
                  margin-right: 15px;
                  cursor: pointer;
                  outline: none;
                  display: inline-block;
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
          </span>
        </el-tooltip>
        <!-- 筛选下拉菜单 -->
        <el-tooltip content="筛选" placement="top" :trigger="'hover'">
          <span style="display: inline-block;">
            <el-dropdown trigger="click" popper-class="custom-filter-dropdown">
              <el-icon
                :size="18"
                style="
                  margin-right: 15px;
                  cursor: pointer;
                  outline: none;
                  display: inline-block;
                "
                color="#606266"
              >
                <component :is="Filter" />
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>全部</el-dropdown-item>
                  <el-dropdown-item>图片</el-dropdown-item>
                  <el-dropdown-item>视频</el-dropdown-item>
                  <el-dropdown-item>文本</el-dropdown-item>
                  <el-dropdown-item>应用包</el-dropdown-item>
                  <el-dropdown-item>压缩包</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

.custom-filter-dropdown {
  min-width: 120px !important;
  padding: 0 !important;
  border-radius: 4px;
}

/* 筛选下拉选项样式 */
.custom-filter-dropdown .el-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0 !important;
  text-align: center;
  border-radius: 0;
}

/* 鼠标 hover 效果 */
.custom-filter-dropdown .el-dropdown-item:hover {
  background-color: #f5f7fa !important;
}
</style>
