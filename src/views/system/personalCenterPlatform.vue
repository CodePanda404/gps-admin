<script setup lang="ts">
defineOptions({
  name: "PersonalCenterPlatform"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton, ElUpload } from "element-plus";

// 个人中心数据
const formData = ref({
  username: "",
  email: "",
  phone: "",
  avatar: ""
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
  <div class="personal-center-platform-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="120px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="formData.avatar" placeholder="请输入头像URL" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.personal-center-platform-container {
  width: 100%;
}
</style>


