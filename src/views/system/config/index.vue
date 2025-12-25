<script setup lang="ts">
import { ref } from "vue";
defineOptions({
  name: "SystemConfig"
});
import { ElTabs, ElTabPane, ElCard } from "element-plus";

// 当前激活的标签页
const activeTab = ref("featureControl");

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
};

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
    <div class="content-area">
      <FeatureControl v-if="activeTab === 'featureControl'" />
      <ParameterConfig v-if="activeTab === 'parameterConfig'" />
      <GameConfig v-if="activeTab === 'gameConfig'" />
      <SiteConfig v-if="activeTab === 'siteConfig'" />
      <EmailConfig v-if="activeTab === 'emailConfig'" />
      <DictionaryConfig v-if="activeTab === 'dictionaryConfig'" />
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

