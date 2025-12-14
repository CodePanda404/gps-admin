<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import echarts from "@/plugins/echarts";
import dayjs from "dayjs";
import DataLine from '~icons/solar/sort-horizontal-bold';
import User from "~icons/tdesign/user";
import Shop from "~icons/ep/shop";
import UserFilled from "~icons/ep/user-filled";
import TrendCharts from "~icons/ep/trend-charts";

defineOptions({
  name: "Dashboard"
});

const { t, locale } = useI18n();

// 今日数据
const todayData = ref({
  updateTime: dayjs().format("YYYY-MM-DD HH:mm"),
  newAgents: 2,
  newMerchants: 7,
  newPlayers: 12,
  activePlayers: 2342
});

// 平台数据概览
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const currency = ref("INR");
const chartInstance = ref<any>(null);
const chartContainer = ref<HTMLDivElement>();

// 日期选择器的禁用日期（只能选择今天及之前的日期）
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};

// 图表数据
const chartData = ref({
  categories: ["NR1", "NR2", "NR3", "NR4", "NR5", "NR6"],
  activePlayers: [90, 120, 130, 100, 90, 110],
  betCount: [140, 160, 180, 145, 100, 170],
  validBetAmount: [130, 140, 150, 110, 180, 170],
  payoutAmount: [100, 123, 160, 171, 190, 182],
  profitLoss: [130, 180, 160, 190, 162, 156]
});

// 数据总额
const totalData = ref({
  activePlayers: 1000,
  betCount: 1000,
  validBetAmount: 1000,
  payoutAmount: 1000,
  profitLoss: 1000
});

// 图表数据对应的日期（用于tooltip显示）
const chartDate = computed(() => {
  return selectedDate.value;
});

// 货币选项
const currencyOptions = [
  { label: "INR", value: "INR" },
  { label: "THB", value: "THB" },
  { label: "MYR", value: "MYR" }
];

// 获取图例数据（响应式）
const getLegendData = () => {
  return [
    t("home.activePlayers"),
    t("home.betCount"),
    t("home.validBetAmount"),
    t("home.payoutAmount"),
    t("home.profitLoss")
  ];
};

// 获取系列数据（响应式）
const getSeriesData = () => {
  return [
    {
      name: t("home.activePlayers"),
      type: "bar",
      data: chartData.value.activePlayers,
      itemStyle: {
        color: "#91d5ff"
      },
      barWidth: 20
    },
    {
      name: t("home.betCount"),
      type: "bar",
      data: chartData.value.betCount,
      itemStyle: {
        color: "#ff7979"
      },
      barWidth: 20
    },
    {
      name: t("home.validBetAmount"),
      type: "bar",
      data: chartData.value.validBetAmount,
      itemStyle: {
        color: "#b89fff"
      },
      barWidth: 20
    },
    {
      name: t("home.payoutAmount"),
      type: "bar",
      data: chartData.value.payoutAmount,
      itemStyle: {
        color: "#ffc516"
      },
      barWidth: 20
    },
    {
      name: t("home.profitLoss"),
      type: "bar",
      data: chartData.value.profitLoss,
      itemStyle: {
        color: "#78daae"
      },
      barWidth: 20
    }
  ];
};

// 初始化图表
const initChart = async () => {
  await nextTick();
  if (!chartContainer.value) return;

  // 如果已存在实例，先销毁
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }

  chartInstance.value = echarts.init(chartContainer.value);
  updateChartOption();
};

// 更新图表配置
const updateChartOption = () => {
  if (!chartInstance.value) return;

  const option = {
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function(params: any) {
        // 确保 params 是数组
        const paramArray = Array.isArray(params) ? params : [params];
        if (!paramArray || paramArray.length === 0) return "";
        
        // 格式：货币、日期、各项数据
        let result = `${currency.value}<br/>${chartDate.value}<br/>`;
        paramArray.forEach((item: any) => {
          if (item && item.seriesName && item.value !== undefined) {
            result += `${item.seriesName}: ${item.value}<br/>`;
          }
        });
        return result;
      },
      confine: true,
      enterable: false,
      backgroundColor: "rgba(50, 50, 50, 0.9)",
      borderColor: "transparent",
      textStyle: {
        color: "#fff"
      }
    },
    legend: {
      data: getLegendData(),
      top: 13,
      icon: "rect",
      itemWidth: 16,
      itemHeight: 4,
      itemGap: 20
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10px",
      top: "60px"
    },
    xAxis: {
      type: "category",
      data: chartData.value.categories,
      axisLabel: {
        interval: 0,
        margin: 25,
        fontSize: 14,
      }
    },
    yAxis: {
      type: "value",
      max: 200,
      interval: 40,
      axisLabel: {
        margin: 15,
        formatter: (value: number) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + "K";
          }
          return value.toString();
        }
      },
      axisLine: {
        offset: 8
      }
    },
    series: getSeriesData()
  };

  // 使用 notMerge: true 完全替换配置，避免残留的 coordinateSystem 配置
  chartInstance.value.setOption(option, { notMerge: true, lazyUpdate: false });
};

// 监听语言变化，更新图表
watch(
  () => locale.value,
  () => {
    if (chartInstance.value) {
      // 完全重置图表配置
      chartInstance.value.clear();
      updateChartOption();
    }
  }
);

// 窗口大小改变时调整图表
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="dashboard-container">
    <!-- 今日数据部分 -->
    <el-card class="today-data-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">{{ t("home.todayData") }}</span>
             <el-icon class="header-icon">
              <component :is="useRenderIcon(DataLine)" />
            </el-icon>
          </div>
          <div class="header-right">
            <span class="update-time">{{ t("home.updateTime") }}: {{ todayData.updateTime }}</span>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6" style="padding: 10px;">
          <div class="data-item">
            <div class="data-icon">
              <el-icon :size="40" color="#409EFF">
                <component :is="useRenderIcon(User)" />
              </el-icon>
            </div>
            <div class="data-content">
              <div class="data-label">{{ t("home.newAgents") }}</div>
              <div class="data-value">{{ todayData.newAgents }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6" style="padding: 10px;">
          <div class="data-item">
            <div class="data-icon">
              <el-icon :size="40" color="#67C23A">
                <component :is="useRenderIcon(Shop)" />
              </el-icon>
            </div>
            <div class="data-content">
              <div class="data-label">{{ t("home.newMerchants") }}</div>
              <div class="data-value">{{ todayData.newMerchants }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6" style="padding: 10px;">
          <div class="data-item">
            <div class="data-icon">
              <el-icon :size="40" color="#E6A23C">
                <component :is="useRenderIcon(UserFilled)" />
              </el-icon>
            </div>
            <div class="data-content">
              <div class="data-label">{{ t("home.newPlayers") }}</div>
              <div class="data-value">{{ todayData.newPlayers }}</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6" style="padding: 10px;">
          <div class="data-item">
            <div class="data-icon">
              <el-icon :size="40" color="#F56C6C">
                <component :is="useRenderIcon(TrendCharts)" />
              </el-icon>
            </div>
            <div class="data-content">
              <div class="data-label">{{ t("home.activePlayers") }}</div>
              <div class="data-value">{{ todayData.activePlayers }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 平台数据概览部分 -->
    <el-card class="platform-overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="header-title">{{ t("home.platformOverview") }}</span>
          </div>
          <div class="header-right">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              :placeholder="t('home.selectDate')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              class="date-select"
            />
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <!-- 左侧柱状图 -->
        <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18">
          <div ref="chartContainer" class="chart-container"></div>
        </el-col>
        
        <!-- 右侧数据总额 -->
        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
          <div class="total-data-container">
            <el-select v-model="currency" class="currency-select">
              <el-option
                v-for="item in currencyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            
            <div class="total-data-list">
              <div class="total-data-item total-data-item-active">
                <div class="total-data-label">{{ t("home.activePlayers") }}</div>
                <div class="total-data-value">{{ totalData.activePlayers }}</div>
              </div>
              
              <div class="total-data-item total-data-item-bet">
                <div class="total-data-label">{{ t("home.betCount") }}</div>
                <div class="total-data-value">{{ totalData.betCount }}</div>
              </div>
              
              <div class="total-data-item total-data-item-valid">
                <div class="total-data-label">{{ t("home.validBetAmount") }}</div>
                <div class="total-data-value">{{ totalData.validBetAmount }}</div>
              </div>
              
              <div class="total-data-item total-data-item-payout">
                <div class="total-data-label">{{ t("home.payoutAmount") }}</div>
                <div class="total-data-value">{{ totalData.payoutAmount }}</div>
              </div>
              
              <div class="total-data-item total-data-item-profit">
                <div class="total-data-label">{{ t("home.profitLoss") }}</div>
                <div class="total-data-value">{{ totalData.profitLoss }}</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 10px;
  .today-data-card {
    :deep(.el-card__header) {
      padding: 8px 10px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    
    :deep(.el-card__body) {
      padding: 10px;
    }
  }
  .platform-overview-card {
    margin-top: 20px;
    :deep(.el-card__header) {
      padding: 8px 10px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    
    :deep(.el-card__body) {
      padding: 10px;
    }
  }
  
  // 今日数据卡片头部样式
  .today-data-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 30px;
      padding: 10px;
      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .header-icon {
          font-size: 20px;
        }
        
        .header-title {
          margin-left: 5px;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .header-right {
        .update-time {
          font-size: 14px;
          color: #86909c;
        }
      }
    }
  }
  
  // 平台数据概览卡片头部样式
  .platform-overview-card {
    height: 500px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 60px;
      padding: 10px;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .header-right {
        .date-select {
          width: 160px;
          height: 36px;
          
          :deep(.el-input__wrapper) {
            height: 36px;
          }
        }
      }
    }
  }
  
  // 今日数据样式
  .data-item {
    padding: 20px;
    border: 1.5px solid rgb(226, 226, 226);
    border-radius: 8px;
    overflow: hidden;
    
    .data-icon {
      float: left;
      margin-top: 10px;
      margin-right: 16px;
    }
    
    .data-content {
      float: right;
      overflow: hidden;
      
      .data-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
      }
      
      .data-value {
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
  
  // 平台数据概览样式
  .platform-overview-card {
    .el-card__body {
      position: relative;
      .el-row {
        position: relative;
        &::after {
          content: "";
          position: absolute;
          left: calc(75% - 10px);
          top: 0;
          bottom: 10px;
          width: 1px;
          background-color: rgb(226, 226, 226);
        }
      }
    }
  }
  
  .chart-container {
    width: 100%;
    height: 400px;
    min-height: 400px;
  }
  
  .total-data-container {
    padding: 10px;
    .currency-select {
      width: 100%;
      margin-bottom: 5px;
      height: 50px;
      
      :deep(.el-input__wrapper) {
        height: 50px;
      }
    }
    
    .total-data-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .total-data-item {
      padding: 1px 16px;
      border-radius: 8px;
      overflow: hidden;
      
      .total-data-label {
        float: left;
        font-size: 14px;
        line-height: 50px;
      }
      
      .total-data-value {
        float: right;
        font-size: 20px;
        font-weight: 600;
        line-height: 50px;
      }
      
      &.total-data-item-active {
        background-color: #d9f0ff;
        
        .total-data-label,
        .total-data-value {
          color: #096dd9;
        }
      }
      
      &.total-data-item-bet {
        background-color: #ffd2d2;
        
        .total-data-label,
        .total-data-value {
          color: #cf1322;
        }
      }
      
      &.total-data-item-valid {
        background-color: #e9e2ff;
        
        .total-data-label,
        .total-data-value {
          color: #7f00bf;
        }
      }
      
      &.total-data-item-payout {
        background-color: #fff2cc;
        
        .total-data-label,
        .total-data-value {
          color: #715500;
        }
      }
      
      &.total-data-item-profit {
        background-color: #daf7ea;
        
        .total-data-label,
        .total-data-value {
          color: #165800;
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
    
    .data-item {
      padding: 16px;
      
      .data-content {
        .data-value {
          font-size: 20px;
        }
      }
    }
    
    .chart-container {
      height: 800px;
      min-height: 700px;
    }
  }
}
</style>
