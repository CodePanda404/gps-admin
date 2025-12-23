<script setup lang="ts">
defineOptions({
  name: "FeatureControl"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElSwitch, ElButton } from "element-plus";

// 功能控制数据
const formData = ref({
  feature1: true,
  feature2: false,
  feature3: true
});

// 保存配置
const handleSave = async () => {
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("保存成功", { type: "success" });
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};
</script>

<template>
  <div class="feature-control-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="200px">
        <el-form-item label="功能1">
          <el-switch v-model="formData.feature1" />
        </el-form-item>
        <el-form-item label="功能2">
          <el-switch v-model="formData.feature2" />
        </el-form-item>
        <el-form-item label="功能3">
          <el-switch v-model="formData.feature3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.feature-control-container {
  width: 100%;
}
</style>


