<script setup lang="ts">
defineOptions({
  name: "ParameterConfig"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton } from "element-plus";

// 参数配置数据
const formData = ref({
  param1: "",
  param2: "",
  param3: ""
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
  <div class="parameter-config-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="200px">
        <el-form-item label="参数1">
          <el-input v-model="formData.param1" placeholder="请输入参数1" />
        </el-form-item>
        <el-form-item label="参数2">
          <el-input v-model="formData.param2" placeholder="请输入参数2" />
        </el-form-item>
        <el-form-item label="参数3">
          <el-input v-model="formData.param3" placeholder="请输入参数3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.parameter-config-container {
  width: 100%;
}
</style>


