<script setup lang="ts">
import { ref, computed } from "vue";
defineOptions({
  name: "Single"
});
import { useRouter } from "vue-router";
import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { utils, writeFile } from "xlsx";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import {
  getSinglePlayerList,
  lockSinglePlayer,
  type SinglePlayerListParams,
  type SinglePlayerItem
} from "@/api/player";
import {
  getCurrencyList,
  type CurrencyItem
} from "@/api/game";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import dayjs from "dayjs";

// 路由
const router = useRouter();


// 国际化
const { t } = useI18n();


/*  -----搜索表单相关-----  */
// 币种列表（用于下拉选择）
const currencyOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList({ pageSize: 1000 });
    if (res.code === 0 && res.data && res.data.rows) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 初始化时获取币种列表
fetchCurrencyList();

// 搜索表单数据
const searchData = ref({
  id: "",
  name: "",
  currency_id: "",
  admin_id: "",
  status: "",
  registerTime: null as string[] | null,
  loginTime: null as string[] | null
});
// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "ID",
    renderLabel: () => t("player.single.search.id"),
    prop: "id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "用户名",
    renderLabel: () => t("player.single.search.username"),
    prop: "name",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "币种",
    renderLabel: () => t("player.single.search.currency"),
    prop: "currency_id",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select"),
      filterable: true
    })),
    options: computed(() => [
      {
        label: t("player.single.search.all"),
        value: ""
      },
      ...currencyOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
  },
  {
    label: "商户ID",
    renderLabel: () => t("player.single.search.admin_id"),
    prop: "admin_id",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "状态",
    renderLabel: () => t("player.single.search.status"),
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.select")
    })),
    options: [
      {
        label: t("player.single.search.all"),
        renderLabel: () => t("player.single.search.all"),
        value: ""
      },
       {
        label: t("player.single.search.normal"),
        renderLabel: () => t("player.single.search.normal"),
        value: "1"
      },
      {
        label: t("player.single.search.disabled"),
        renderLabel: () => t("player.single.search.disabled"),
        value: "0"
      }
    ]
  },
  {
    label: "登录IP",
    renderLabel: () => t("player.single.search.login_ip"),
    prop: "login_ip",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "注册IP",
    renderLabel: () => t("player.single.search.register_ip"),
    prop: "register_ip",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: t("placeholder.input")
    }))
  },
  {
    label: "登录时间",
    renderLabel: () => t("player.single.search.login_time"),
    prop: "loginTime",
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
  },
  {
    label: "注册时间",
    renderLabel: () => t("player.single.search.register_time"),
    prop: "registerTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: t("placeholder.start_time"),
      endPlaceholder:  t("placeholder.end_time"),
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
    name: "",
    currency_id: "",
    admin_id: "",
    status: "",
    registerTime: null,
    loginTime: null
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用后端字段）
type TableRow = SinglePlayerItem;

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("player.single.table.id"),
    prop: "id",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "用户名",
    renderHeader: () => t("player.single.table.username"),
    prop: "username",
    width: "200",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "余额",
    renderHeader: () => t("player.single.table.balance"),
    prop: "money",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "币种",
    renderHeader: () => t("player.single.table.currency"),
    prop: "currency",
    tableColumnProps: {
      align: "center"
    },
    width: "110"
  },
  {
    label: "商户ID",
    renderHeader: () => t("player.single.table.admin_id"),
    prop: "admin_id",
    tableColumnProps: {
      align: "center"
    },
    width: "110"
  },
  {
    label: "登录时间",
    renderHeader: () => t("player.single.table.login_time"),
    prop: "logintime",
    width: "160",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "登录IP",
    renderHeader: () => t("player.single.table.login_ip"),
    prop: "loginip",  
    width: "140",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "注册时间",
    renderHeader: () => t("player.single.table.register_time"),
    prop: "jointime",
    width: "160",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "注册IP",
    renderHeader: () => t("player.single.table.register_ip"),
    prop: "joinip",
    width: "140",
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("player.single.table.status"),
    prop: "status",
    valueType: "switch",
    editable: true,
    fieldProps: {
      activeValue: "normal",
      inactiveValue: "hidden"
    },
    tableColumnProps: {
       sortable: true,
       fixed: "right",
       align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("player.single.table.betDetail"),
    code: "bettingDetails",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      router.push({
        name: "SingleBettingDetails",
        query: {
          userId: row.id.toString()
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
  if (prop !== "status") {
    return;
  }

  // 检查 row 是否存在
  if (!row) {
    console.error("行数据不存在");
    message(t("player.single.message.dataNotFound"), { type: "error" });
    return;
  }

  // 目标状态 (value 是切换后的值)
  // value: Normal/Unlock-> type: 1
  // value: Disabled/Lock-> type: 2
  const targetType = value == 'normal' ? 1 : 2;
  // 原始状态
  const originalStatus = value == 'normal' ? 'hidden' : 'normal';

  // 提示文字
  const confirmMessage = value == 'normal'
    ? t("player.single.message.confirmUnlock", { username: row.username })
    : t("player.single.message.confirmLock", { username: row.username })

  // 查找当前行在 tableData 中的索引
  const index = tableData.value.findIndex(item => item.id === row.id);
  if (index === -1) {
    message(t("player.single.message.dataNotFound"), { type: "error" });
    return;
  }

  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(confirmMessage, t("player.single.statusSwitch.title"), {
      confirmButtonText: t("player.single.buttons.confirm"),
      cancelButtonText: t("player.single.buttons.cancel"),
      draggable: true
    });

    const res = await lockSinglePlayer({
      id: row.id,
      type: targetType
    });

    if (res.code === 0) {
      message(value == 'normal' ? t("player.single.message.unlockSuccess") : t("player.single.message.lockSuccess"), {
        type: "success"
      });
      // 更新本地数据 - 通过更新 tableData 中对应的项来触发响应式更新
      tableData.value[index] = {
        ...tableData.value[index],
        status: res.data.status
      };
    } else {
      // 失败恢复 - 通过更新 tableData 中对应的项来触发响应式更新
      tableData.value[index] = {
        ...tableData.value[index],
        status: originalStatus
      };
      message(res.msg || t("player.single.message.statusSwitchFail"), { type: "error" });
    }
  } catch (error: any) {
    //取消或出错恢复 - 通过更新 tableData 中对应的项来触发响应式更新
    tableData.value[index] = {
      ...tableData.value[index],
      status: originalStatus
    };
    if (error !== "cancel") {
      console.error("状态切换失败:", error);
      message(error?.message || t("player.single.message.statusSwitchFail"), { type: "error" });
    }
  }
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const { page, pageSize } = pageInfo.value;
    const { id, name, currency_id, admin_id, status, registerTime, loginTime } = searchData.value;
    
    const params: any = {
      pageNumber: page,
      pageSize,
      id: id || undefined,
      username: name || undefined,
      status: status || undefined,
      currency_id: currency_id || undefined,
      admin_id: admin_id || undefined
    };

    // 处理注册时间范围
    if (registerTime && Array.isArray(registerTime) && registerTime.length === 2) {
      params.create_start_time = registerTime[0];
      params.create_end_time = registerTime[1];
    }

    // 处理登录时间范围
    if (loginTime && Array.isArray(loginTime) && loginTime.length === 2) {
      params.login_start_time = loginTime[0];
      params.login_end_time = loginTime[1];
    }

    const res = await getSinglePlayerList(params);

    if (res.code === 0 && res.data && res.data.rows) {
      // 直接使用后端数据，无需转换
      tableData.value = res.data.rows;
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("player.single.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("player.single.message.getListFail"), { type: "error" });
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

// 导出到excel
const exportExcel = () => {
  if (!multipleSelection.value.length) {
    message(t("player.single.message.selectToExport"), { type: "warning" });
    return;
  }

  const exportTitles = tableConfig.value.map((col: any) => col.renderHeader());
  const exportProps = tableConfig.value.map((col: any) => col.prop);

  const res: string[][] = multipleSelection.value.map((item: TableRow) => {
    return exportProps.map(prop => {
      // 处理特殊字段
      if (prop === "status") {
        return item.status === "normal" ? t("player.single.table.normal") : t("player.single.table.disabled");
      }
      return item[prop as keyof TableRow] ?? "";
    });
  });

  res.unshift(exportTitles);

  const workSheet = utils.aoa_to_sheet(res);
  const workBook = utils.book_new();
  const sheetName = t("player.single.export.sheetName");
  utils.book_append_sheet(workBook, workSheet, sheetName);
  const fileName = t("player.single.export.fileName");
  writeFile(workBook, fileName);
};

// 导出为JSON
const exportJson = () => {
  if (!multipleSelection.value.length) {
    message(t("player.single.message.selectToExport"), { type: "warning" });
    return;
  }
  const dataStr = JSON.stringify(multipleSelection.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t("player.single.export.jsonFileName");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="single-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="110"
        label-position="right"
        :has-unfold="false"
        :searchText="t('player.single.buttons.search')"
        :resetText="t('player.single.buttons.reset')"
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
        :fit="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: t('player.single.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="handleSelectionChange"
        @formChange="handleStatusChange"
      >
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('player.single.toolbar.density')" placement="top">
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
          <el-tooltip :content="t('player.single.toolbar.columnSettings')" placement="top">
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
            :content="showSearch ? t('player.single.toolbar.hideSearch') : t('player.single.toolbar.showSearch')"
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
          <el-tooltip :content="t('player.single.toolbar.export')" placement="top" :trigger="'hover'">
            <span style="display: inline-block">
              <el-dropdown
                trigger="click"
                popper-class="custom-export-dropdown"
              >
                <el-icon
                  :size="18"
                  style="
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
                      >{{ t("player.single.export.json") }}</el-dropdown-item
                    >
                    <el-dropdown-item @click="exportExcel"
                      >{{ t("player.single.export.excel") }}</el-dropdown-item
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
.single-container {
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
