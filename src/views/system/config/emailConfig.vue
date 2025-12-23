<script setup lang="ts">
defineOptions({
  name: "EmailConfig"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton } from "element-plus";

// 邮件配置数据
const formData = ref({
  smtp_host: "",
  smtp_port: "",
  smtp_user: "",
  smtp_password: ""
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
  <div class="email-config-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="200px">
        <el-form-item label="SMTP主机">
          <el-input v-model="formData.smtp_host" placeholder="请输入SMTP主机" />
        </el-form-item>
        <el-form-item label="SMTP端口">
          <el-input v-model="formData.smtp_port" placeholder="请输入SMTP端口" />
        </el-form-item>
        <el-form-item label="SMTP用户名">
          <el-input v-model="formData.smtp_user" placeholder="请输入SMTP用户名" />
        </el-form-item>
        <el-form-item label="SMTP密码">
          <el-input v-model="formData.smtp_password" type="password" placeholder="请输入SMTP密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.email-config-container {
  width: 100%;
}
</style>


