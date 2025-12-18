<script setup lang="ts">
import { ref, computed } from "vue";
defineOptions({
  name: "Attachment"
});
import {
  type PlusColumn,
  PlusSearch,
  PlusTable,
  useTable,
  PlusPagination,
  type PageInfo
} from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Upload from "~icons/ep/upload";
import Filter from "~icons/ep/filter";

const { t } = useI18n();

// Tabs state
const activeTab = ref("tab1");

// Search state
const state = ref({
  type: "",
  account: "",
  name: "",
  timeRange: [] as string[]
});

const searchColumns: PlusColumn[] = [
  {
    renderLabel: () => t("system.attachment.type"),
    prop: "type",
    valueType: "select",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" }
    ],
    fieldProps: computed(() => ({
      placeholder: t("system.attachment.typePlaceholder")
    }))
  },
  {
    renderLabel: () => t("system.attachment.account"),
    prop: "account",
    valueType: "input",
    fieldProps: computed(() => ({
      placeholder: t("system.attachment.accountPlaceholder")
    }))
  },
  {
    renderLabel: () => t("system.attachment.name"),
    prop: "name",
    valueType: "input",
    fieldProps: computed(() => ({
      placeholder: t("system.attachment.namePlaceholder")
    }))
  },
  {
    renderLabel: () => t("system.attachment.operationTime"),
    prop: "timeRange",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "datetimerange",
      startPlaceholder: t("system.attachment.startTime"),
      endPlaceholder: t("system.attachment.endTime")
    }))
  }
];

const handleSearch = () => {
  page.value.page = 1;
  // In real app, fetch data here
};

const handleReset = () => {
  state.value = { type: "", account: "", name: "", timeRange: [] };
  page.value.page = 1;
};

// Table state
type TableRow = {
  id: string;
  supplier: string;
  sort: string;
  updateTime: string;
  status: string;
  itemName: string;
};

const { tableData, buttons } = useTable<TableRow[]>();
const loading = ref(false);
const multipleSelection = ref<TableRow[]>([]);

const page = ref({
  page: 1,
  pageSize: 10,
  total: 100
});

const tableConfig = computed<PlusColumn[]>(() => [
  {
    label: t("system.attachment.id"),
    prop: "id",
    minWidth: 200
  },
  {
    label: t("system.attachment.supplier"),
    prop: "supplier",
    minWidth: 150
  },
  {
    label: t("system.attachment.sort"),
    prop: "sort",
    minWidth: 100
  },
  {
    label: t("system.attachment.updateTime"),
    prop: "updateTime",
    minWidth: 180
  },
  {
    label: t("system.attachment.status"),
    prop: "status",
    minWidth: 120
  },
  {
    label: t("system.attachment.itemName"),
    prop: "itemName",
    render: () => {
      return t("system.attachment.action");
    },
    valueType: "text",
    width: 100,
    fixed: "right"
  }
]);

// Operation buttons for the column "Action" (renamed to Item Name in screenshot but functionality seems like action?)
// Wait, the screenshot ID shows "Item Name" as the last column header with content "操作" (Action/Operation).
// Actually the screenshot last column header is "项目名称" (Item Name) but the content is "操作" (Operation) in blue link color.
// Maybe "Item Name" is just a label and the content is actual links?
// Let's stick to the screenshot visuals: Header "项目名称", Content "操作".
// But usually "操作" is for the Action column.
// I will assume the column key is `action` but label is configurable.
// Let's use custom render for that column.

// Generating Mock Data
const generateMockData = () => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: "wuwu_aa_negeinegei_duangduangduang",
    supplier: "Pragmatic Play",
    sort: "001",
    updateTime: "2025-10-17 00:24:16",
    status: "zhuangtailii",
    itemName: "Action"
  }));
};

tableData.value = generateMockData();

const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

const handlePageChange = (val: PageInfo) => {
  page.value.page = val.page;
  page.value.pageSize = val.pageSize;
};
</script>

<template>
  <div class="attachment-container">
    <el-card shadow="never" class="main-card">
      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="分页 1" name="tab1" />
        <el-tab-pane label="分页 2" name="tab2" />
        <el-tab-pane label="分页 3" name="tab3" />
        <el-tab-pane label="分页 4" name="tab4" />
        <el-tab-pane label="分页 5" name="tab5" />
      </el-tabs>

      <div class="search-area">
        <PlusSearch
          v-model="state"
          :columns="searchColumns"
          :search-text="t('system.attachment.search')"
          :reset-text="t('system.attachment.reset')"
          :has-unfold="false"
          :col-props="{ span: 6 }"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template #footer="{ handleSearch, handleReset }">
            <div style="display: flex; align-items: flex-start">
              <el-button type="primary" @click="handleSearch">{{
                t("system.attachment.search")
              }}</el-button>
              <el-button @click="handleReset">{{
                t("system.attachment.reset")
              }}</el-button>
            </div>
          </template>
        </PlusSearch>
      </div>

      <div class="toolbar-area">
        <div class="left-buttons">
          <el-button type="primary">{{ t("system.attachment.add") }}</el-button>
          <el-button type="primary">{{
            t("system.attachment.edit")
          }}</el-button>
          <el-button type="primary">{{
            t("system.attachment.delete")
          }}</el-button>
          <el-button type="primary">{{
            t("system.attachment.more")
          }}</el-button>
        </div>
        <div class="right-icons">
          <el-tooltip content="密度" placement="top">
            <el-icon :size="20" class="icon-btn"><Monitor /></el-icon>
          </el-tooltip>
          <el-tooltip content="列设置" placement="top">
            <el-icon :size="20" class="icon-btn"><Grid /></el-icon>
          </el-tooltip>
          <el-tooltip content="导出" placement="top">
            <el-icon :size="20" class="icon-btn"><Upload /></el-icon>
          </el-tooltip>
          <el-tooltip content="筛选" placement="top">
            <el-icon :size="20" class="icon-btn"><Filter /></el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="table-area">
        <PlusTable
          v-loading="loading"
          :columns="tableConfig"
          :table-data="tableData"
          :stripe="true"
          is-selection
          @selection-change="handleSelectionChange"
        >
          <template #plus-field-itemName>
            <el-link type="primary" :underline="false">{{
              t("system.attachment.action")
            }}</el-link>
          </template>
        </PlusTable>
      </div>

      <div class="pagination-area">
        <PlusPagination
          v-model="page"
          :total="page.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.attachment-container {
  padding: 20px;

  .main-card {
    min-height: calc(100vh - 140px);
  }

  .demo-tabs {
    margin-bottom: 20px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
      background-color: #f0f0f0;
    }
  }

  .search-area {
    padding: 20px;
    margin-bottom: 20px;
    background-color: #fff; // Or #f5f7fa based on design
    // PlusSearch internal styling might need adjustment to match screenshot exactly
    :deep(.plus-search__action) {
      margin-left: 0 !important;
      text-align: left !important;
    }
  }

  .toolbar-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .left-buttons {
      display: flex;
      gap: 10px;
    }

    .right-icons {
      display: flex;
      gap: 16px;
      align-items: center;

      .icon-btn {
        color: #606266;
        cursor: pointer;
        outline: none;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .table-area {
    margin-bottom: 20px;
  }

  :deep(.search-action-col) {
    justify-content: flex-start !important;
    text-align: left !important;
  }
}
</style>
