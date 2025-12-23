<script setup lang="ts">
defineOptions({
  name: "PersonalCenterMerchant"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton } from "element-plus";

// 个人中心数据
const formData = ref({
  merchant_name: "",
  email: "",
  phone: "",
  address: ""
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
  <div class="personal-center-merchant-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="120px">
        <el-form-item label="商户名称">
          <el-input v-model="formData.merchant_name" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.personal-center-merchant-container {
  width: 100%;
}
</style>


