<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
defineOptions({
  name: "SystemConfig"
});
import { ElTabs, ElTabPane, ElCard, ElButton } from "element-plus";
import { getSystemConfig, type ConfigGroup, type SystemConfigResult } from "@/api/system";
import Plus from "~icons/ep/plus";
import DynamicConfig from "./dynamicConfig.vue";
import GameConfig from "./gameConfig.vue";

// 当前激活的标签页
const activeTab = ref("");

// 配置数据
const configData = ref<SystemConfigResult["data"] | null>(null);
const loading = ref(false);

// 路由
const router = useRouter();

// 跳转到新增配置页面
const handleAddConfig = () => {
  router.push({
    path: "/system/config/add"
  });
};

// 标签页选项（根据groupList动态生成）
const tabOptions = computed(() => {
  if (!configData.value?.groupList) return [];
  return Object.entries(configData.value.groupList).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
};

// 获取当前配置组
const currentConfigGroup = computed(() => {
  if (!configData.value || !activeTab.value) return null;
  return configData.value.siteList[activeTab.value as keyof typeof configData.value.siteList] || null;
});

// 获取配置数据
const getConfig = async () => {
  loading.value = true;
  try {
    const res = await getSystemConfig();
    if (res.code === 0 && res.data) {
      configData.value = res.data;
      // 设置默认激活的标签页（第一个）
      if (tabOptions.value.length > 0 && !activeTab.value) {
        activeTab.value = tabOptions.value[0].value;
      }
    } else {
      message(res.msg || "获取配置失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("获取配置失败:", error);
    message(error?.message || "获取配置失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 初始化加载数据
onMounted(() => {
  getConfig();
});
</script>

<template>
  <div class="system-config-container">
    <!-- 标签页容器 -->
    <el-card class="tabs-card" shadow="never" style="margin: 20px" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <el-button type="primary" @click="handleAddConfig" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">新增</span>
          </el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" v-if="tabOptions.length > 0">
        <el-tab-pane
          v-for="tab in tabOptions"
          :key="tab.value"
          :label="tab.label"
          :name="tab.value"
        />
      </el-tabs>
    </el-card>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 游戏配置使用表格形式 -->
      <GameConfig 
        v-if="activeTab === 'game' && currentConfigGroup" 
        :key="`game-${activeTab}`"
        :config-group="currentConfigGroup"
        @refresh="getConfig"
      />
      <!-- 其他配置使用动态表单 -->
      <DynamicConfig
        v-else-if="currentConfigGroup && activeTab !== 'game'"
        :key="`dynamic-${activeTab}`"
        :config-group="currentConfigGroup"
        :type-list="configData?.typeList"
        @refresh="getConfig"
      />
    </div>
  </div>
</template>

<style scoped>
.system-config-container {
  width: 100%;
}

.content-area {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

