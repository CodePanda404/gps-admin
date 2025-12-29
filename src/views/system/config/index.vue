<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
defineOptions({
  name: "SystemConfig"
});
import { ElTabs, ElTabPane, ElCard } from "element-plus";
import { getSystemConfig, type ConfigGroup, type SystemConfigResult } from "@/api/system";

// 当前激活的标签页
const activeTab = ref("featureControl");

// 配置数据
const configData = ref<SystemConfigResult["data"] | null>(null);
const loading = ref(false);

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
};

// 获取配置数据
const getConfig = async () => {
  loading.value = true;
  try {
    const res = await getSystemConfig();
    if (res.code === 0 && res.data) {
      configData.value = res.data;
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

// 导入各个子页面组件
import FeatureControl from "./featureControl.vue";
import ParameterConfig from "./parameterConfig.vue";
import GameConfig from "./gameConfig.vue";
import SiteConfig from "./siteConfig.vue";
import EmailConfig from "./emailConfig.vue";
import DictionaryConfig from "./dictionaryConfig.vue";
</script>

<template>
  <div class="system-config-container">
    <!-- 标签页容器 -->
    <el-card class="tabs-card" shadow="never" style="margin: 20px">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="功能控制" name="featureControl" />
        <el-tab-pane label="参数配置" name="parameterConfig" />
        <el-tab-pane label="游戏配置" name="gameConfig" />
        <el-tab-pane label="站点配置" name="siteConfig" />
        <el-tab-pane label="邮件配置" name="emailConfig" />
        <el-tab-pane label="字典配置" name="dictionaryConfig" />
      </el-tabs>
    </el-card>

    <!-- 内容区域 -->
    <div class="content-area" v-loading="loading">
      <FeatureControl 
        v-if="activeTab === 'featureControl' && configData" 
        :config-group="configData.siteList.ability"
        @refresh="getConfig"
      />
      <ParameterConfig 
        v-if="activeTab === 'parameterConfig' && configData" 
        :config-group="configData.siteList.pay"
        @refresh="getConfig"
      />
      <GameConfig 
        v-if="activeTab === 'gameConfig' && configData" 
        :config-group="configData.siteList.game"
        @refresh="getConfig"
      />
      <SiteConfig 
        v-if="activeTab === 'siteConfig' && configData" 
        :config-group="configData.siteList.basic"
        @refresh="getConfig"
      />
      <EmailConfig 
        v-if="activeTab === 'emailConfig' && configData" 
        :config-group="configData.siteList.email"
        @refresh="getConfig"
      />
      <DictionaryConfig 
        v-if="activeTab === 'dictionaryConfig' && configData" 
        :config-group="configData.siteList.dictionary"
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
</style>

