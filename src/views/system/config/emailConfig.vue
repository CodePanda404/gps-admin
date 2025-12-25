<script setup lang="ts">
defineOptions({
  name: "EmailConfig"
});
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElSelect, ElOption } from "element-plus";

// 编辑模式状态
const isEditMode = ref(false);

// 表单数据
const formData = ref({
  mail_type: "",
  mail_smtp_host: "",
  mail_smtp_port: "",
  mail_smtp_user: "",
  mail_smtp_password: "",
  mail_vertify_type: "",
  mail_from: ""
});

// 原始数据（用于取消时恢复）
const originalFormData = ref({
  mail_type: "",
  mail_smtp_host: "",
  mail_smtp_port: "",
  mail_smtp_user: "",
  mail_smtp_password: "",
  mail_vertify_type: "",
  mail_from: ""
});

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 邮件类型选项
const mailTypeOptions = [
  { label: "SMTP", value: "smtp" },
  { label: "POP3", value: "pop3" },
  { label: "IMAP", value: "imap" }
];

// 获取配置数据
const getConfig = async () => {
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    // 模拟数据
    const data = {
      mail_type: "smtp",
      mail_smtp_host: "smtp.example.com",
      mail_smtp_port: "587",
      mail_smtp_user: "user@example.com",
      mail_smtp_password: "",
      mail_vertify_type: "tls",
      mail_from: "noreply@example.com"
    };
    formData.value = { ...data };
    originalFormData.value = { ...data };
  } catch (error: any) {
    console.error("获取配置失败:", error);
    message(error?.message || "获取配置失败", { type: "error" });
  }
};

// 点击修改按钮
const handleEdit = () => {
  isEditMode.value = true;
  isSaveDisabled.value = false;
  // 保存当前数据作为原始数据
  originalFormData.value = { ...formData.value };
};

// 保存配置
const handleSave = () => {
  showGoogleVerifyDialog.value = true;
  googleVerifyCode.value = "";
};

// 关闭谷歌验证码对话框
const handleCloseGoogleVerifyDialog = () => {
  showGoogleVerifyDialog.value = false;
  googleVerifyCode.value = "";
};

// 确认谷歌验证码
const handleConfirmGoogleVerify = async () => {
  if (!googleVerifyCode.value.trim()) {
    message("请输入谷歌验证码", { type: "warning" });
    return;
  }

  // 关闭验证码对话框
  showGoogleVerifyDialog.value = false;

  // 显示确认对话框
  try {
    await ElMessageBox.confirm(
      "确定要保存最新数据 ?",
      "保存",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    // 确认后发起保存请求
    await doSave();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("确认失败:", error);
    }
  }
};

// 执行保存操作
const doSave = async () => {
  try {
    // TODO: 对接实际API，传递 googleVerifyCode.value
    await new Promise(resolve => setTimeout(resolve, 500));
    message("保存成功", { type: "success" });
    isEditMode.value = false;
    isSaveDisabled.value = true;
    // 更新原始数据
    originalFormData.value = { ...formData.value };
    googleVerifyCode.value = "";
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 取消修改
const handleCancel = () => {
  // 恢复原始数据
  formData.value = { ...originalFormData.value };
  // 禁用表单
  isEditMode.value = false;
  isSaveDisabled.value = true;
};

// 初始化加载数据
onMounted(() => {
  getConfig();
});
</script>

<template>
  <div class="email-config-container">
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="handleEdit" :disabled="isEditMode">
            修改
          </el-button>
        </div>
      </template>
      <el-form :model="formData" label-width="200px">
        <el-form-item label="Mail type">
          <el-select
            v-model="formData.mail_type"
            :disabled="!isEditMode"
            placeholder="请输入"
            style="width: 100%"
          >
            <el-option
              v-for="item in mailTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Mail smtp host">
          <el-input
            v-model="formData.mail_smtp_host"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="Mail smtp port">
          <el-input
            v-model="formData.mail_smtp_port"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="Mail smtp user">
          <el-input
            v-model="formData.mail_smtp_user"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="Mail smtp password">
          <el-input
            v-model="formData.mail_smtp_password"
            type="password"
            :disabled="!isEditMode"
            placeholder="请输入"
            show-password
          />
        </el-form-item>
        <el-form-item label="Mail vertify type">
          <el-input
            v-model="formData.mail_vertify_type"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="Mail from">
          <el-input
            v-model="formData.mail_from"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSave"
            :disabled="isSaveDisabled"
          >
            保存
          </el-button>
          <el-button
            @click="handleCancel"
            :disabled="isSaveDisabled"
            style="margin-left: 10px"
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 谷歌验证码对话框 -->
    <el-dialog
      v-model="showGoogleVerifyDialog"
      title="保存"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseGoogleVerifyDialog"
    >
      <div style="margin-bottom: 20px; color: #606266;">
        请输入谷歌验证码,验证成功后将进行保存
      </div>
      <el-form :model="{ code: googleVerifyCode }" label-width="80px">
        <el-form-item label="验证码">
          <el-input
            v-model="googleVerifyCode"
            placeholder="请输入谷歌验证码"
            @keyup.enter="handleConfirmGoogleVerify"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseGoogleVerifyDialog">取消</el-button>
          <el-button type="primary" @click="handleConfirmGoogleVerify">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.email-config-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
