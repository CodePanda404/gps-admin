<script setup lang="ts">
defineOptions({
  name: "SiteConfig"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton } from "element-plus";

// 站点配置数据
const formData = ref({
  site_name: "",
  site_url: "",
  site_logo: ""
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
  <div class="site-config-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="200px">
        <el-form-item label="站点名称">
          <el-input v-model="formData.site_name" placeholder="请输入站点名称" />
        </el-form-item>
        <el-form-item label="站点URL">
          <el-input v-model="formData.site_url" placeholder="请输入站点URL" />
        </el-form-item>
        <el-form-item label="站点Logo">
          <el-input v-model="formData.site_logo" placeholder="请输入站点Logo" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.site-config-container {
  width: 100%;
}
</style>


