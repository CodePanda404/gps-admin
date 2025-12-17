<script setup lang="ts">
import { ref, computed } from "vue";
defineOptions({
  name: "Transfer"
});
import { useRouter } from "vue-router";
import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { utils, writeFile } from "xlsx";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import {
  lockTransferPlayer,
  getTransferPlayerList,
  type TransferPlayerItem
} from "@/api/player";
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
  username: "",
  status: "",
  registerTime: [] as string[]
});
// 搜索表单显示控制
const showSearch = ref(true);

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
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("player.transfer.namePlaceholder")
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
        value: "disabled"
      },
      {
        label: "正常",
        renderLabel: () => t("player.transfer.normal"),
        value: "normal"
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
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: t("player.transfer.registerTimePlaceholder"),
      endPlaceholder: t("player.transfer.registerTimePlaceholder")
    }))
  }
];

// 点击搜索按钮
const handleSearch = () => {
  // 重置到第一页
  pageInfo.value.page = 1;
  // 重新获取数据
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    id: "",
    username: "",
    status: "",
    registerTime: []
  };
  // 重置到第一页
  pageInfo.value.page = 1;
  // 重新获取数据
  getList();
};

// /  *----表格相关-----  */ */
// 表格数据类型
type TableRow = TransferPlayerItem & {
  statusBool?: boolean; // 辅助字段用于 Switch
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
    renderHeader: () => t("player.transfer.id"),
    prop: "id"
  },
  {
    label: "用户名",
    renderHeader: () => t("player.transfer.name"),
    prop: "username"
  },
  {
    label: "余额",
    renderHeader: () => t("player.transfer.balance"),
    prop: "money"
  },
  {
    label: "币种",
    renderHeader: () => t("player.transfer.currency"),
    prop: "currency"
  },
  {
    label: "商户ID",
    renderHeader: () => t("player.transfer.merchantID"),
    prop: "admin_id"
  },
  {
    label: "累计投注",
    renderHeader: () => t("player.transfer.totalBet"),
    prop: "bet_all"
  },
  {
    label: "累计派彩",
    renderHeader: () => t("player.transfer.totalPet"),
    prop: "win_all"
  },
  {
    label: "累计输赢",
    renderHeader: () => t("player.transfer.totalWinLoss"),
    prop: "company_win_all"
  },
  {
    label: "登录时间",
    renderHeader: () => t("player.transfer.loginTime"),
    prop: "logintime",
    width: "160"
  },
  {
    label: "登录IP",
    renderHeader: () => t("player.transfer.loginIP"),
    prop: "loginip",
    width: "140"
  },
  {
    label: "注册时间",
    renderHeader: () => t("player.transfer.registerTime"),
    prop: "jointime",
    width: "160"
  },
  {
    label: "注册IP",
    renderHeader: () => t("player.transfer.registerIP"),
    prop: "joinip",
    width: "140"
  },
  {
    label: "状态",
    renderHeader: () => t("player.transfer.status"),
    prop: "statusBool",
    valueType: "switch",
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
          playerName: row.username
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
      router.push({
        name: "BettingDetails",
        query: {
          playerId: row.id.toString(),
          playerName: row.username
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
  // 只处理玩家状态字段的变化
  if (prop !== "statusBool") {
    return;
  }

  // 检查 row 是否存在
  if (!row) {
    console.error("行数据不存在");
    message("操作失败：无法找到对应的数据", { type: "error" });
    return;
  }

  // 目标状态 (value 是切换后的 boolean 值)
  // value: true (Normal/Unlock) -> type: 2
  // value: false (Disabled/Lock) -> type: 1
  const targetType = value ? 2 : 1;
  // 原始状态
  const originalStatusBool = !value;

  // 提示文字
  const confirmMessage = !value
    ? `是否确定将玩家${row.username}锁定?`
    : `是否确定将玩家${row.username}解锁?`;

  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(confirmMessage, "切换状态", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      draggable: true
    });

    const res = await lockTransferPlayer({
      id: row.id,
      type: targetType
    });

    if (res.code === 0) {
      message(value ? "玩家已解锁" : "玩家已锁定", {
        type: "success"
      });
      // 更新本地数据
      // 注意：API 返回的 status 是 string ("normal" 等)，这里我们只需要保持 switch 状态一致
      // 如果需要更精确的同步，可以使用 res.data.status
      row.status = value ? "normal" : "locked"; // 简单映射
    } else {
      // 失败恢复
      row.statusBool = originalStatusBool;
      message(res.msg || "玩家状态切换失败", { type: "error" });
    }
  } catch (error: any) {
    //取消或出错恢复
    row.statusBool = originalStatusBool;
    if (error !== "cancel") {
      console.error("状态切换失败:", error);
      message(error?.message || "状态切换失败", { type: "error" });
    }
  }
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, username, status, registerTime } = searchData.value;
    const params: any = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      username: username || undefined,
      status: status || undefined
    };

    if (registerTime && registerTime.length === 2) {
      params.create_start_time = registerTime[0];
      params.create_end_time = registerTime[1];
    }

    const { data } = await getTransferPlayerList(params);

    if (data && data.rows) {
      // 映射数据，添加 statusBool 辅助字段
      tableData.value = data.rows.map(item => ({
        ...item,
        statusBool: item.status === "normal"
      }));
      total.value = data.total;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
    tableData.value = [];
  } finally {
    loadingStatus.value = false;
  }
};

// 初始化加载数据
getList();

// 分页处理
const handlePageChange = (val: any) => {
  pageInfo.value = val;
  getList();
};

// 导出等功能暂未对接真实API
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message("请先选择要导出的数据！", { type: "warning" });
    return;
  }
  const exportTitles = tableConfig.value.map(col => col.renderHeader());
  const exportProps = tableConfig.value.map(col => col.prop);

  const res: string[][] = multipleSelection.value.map((item: any) => {
    return exportProps.map(prop => {
      // 处理特殊字段
      if (prop === "statusBool") {
        return item.status === "normal" ? "正常" : "禁用";
      }
      return item[prop] ?? "";
    });
  });

  res.unshift(exportTitles);
  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = "数据报表";
  utils.book_append_sheet(workBook, workSheet, sheetName);
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
  <div class="transfer-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never" style="margin: 20px">
      <PlusSearch
        v-show="showSearch"
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
        :adaptive="true"
        :action-bar="{
          buttons,
          width: '220px',
          label: t('player.transfer.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
        @formChange="handleStatusChange"
      >
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip content="密度" placement="top">
            <el-icon
              :size="18"
              style="margin-right: 15px; cursor: pointer; outline: none"
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
              style="margin-right: 5px; cursor: pointer; outline: none"
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
                style="margin-right: 15px; cursor: pointer; outline: none"
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
                  style="margin-right: 15px; cursor: pointer; outline: none"
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
