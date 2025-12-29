<script setup lang="ts">
defineOptions({
  name: "EmailConfig"
});
import { ref, watch } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElSelect, ElOption } from "element-plus";
import { saveSystemConfig } from "@/api/system";
import type { ConfigGroup } from "@/api/system";

// Props
const props = defineProps<{
  configGroup: ConfigGroup;
}>();

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

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
  { label: "请选择", value: "" },
  { label: "SMTP", value: "1" }
];

// 邮件验证类型选项
const mailVerifyTypeOptions = [
  { label: "无", value: "0" },
  { label: "TLS", value: "1" },
  { label: "SSL", value: "2" }
];

// 从后端数据初始化表单
const initFormData = () => {
  if (!props.configGroup || !props.configGroup.list) return;
  
  // 遍历后端返回的配置项，映射到前端字段
  props.configGroup.list.forEach((item) => {
    switch (item.name) {
      case "mail_type":
        // select类型，值是数组，取第一个元素
        if (Array.isArray(item.value) && item.value.length > 0) {
          formData.value.mail_type = String(item.value[0]);
        } else {
          formData.value.mail_type = "";
        }
        break;
      case "mail_smtp_host":
        formData.value.mail_smtp_host = item.value ? String(item.value) : "";
        break;
      case "mail_smtp_port":
        formData.value.mail_smtp_port = item.value ? String(item.value) : "";
        break;
      case "mail_smtp_user":
        formData.value.mail_smtp_user = item.value ? String(item.value) : "";
        break;
      case "mail_smtp_pass":
        formData.value.mail_smtp_password = item.value ? String(item.value) : "";
        break;
      case "mail_verify_type":
        // select类型，值是数组，取第一个元素
        if (Array.isArray(item.value) && item.value.length > 0) {
          formData.value.mail_vertify_type = String(item.value[0]);
        } else {
          formData.value.mail_vertify_type = "";
        }
        break;
      case "mail_from":
        formData.value.mail_from = item.value ? String(item.value) : "";
        break;
    }
  });
  
  // 保存原始数据
  originalFormData.value = { ...formData.value };
};

// 监听配置组变化
watch(() => props.configGroup, () => {
  if (props.configGroup && props.configGroup.list) {
    initFormData();
  }
}, { immediate: true, deep: true });

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
    // 准备保存数据，将前端字段映射回后端字段名
    const saveData: Record<string, any> = {};
    
    // 遍历后端配置项，找到对应的字段并保存
    props.configGroup.list.forEach((item) => {
      switch (item.name) {
        case "mail_type":
          saveData[item.name] = [formData.value.mail_type];
          break;
        case "mail_smtp_host":
          saveData[item.name] = formData.value.mail_smtp_host;
          break;
        case "mail_smtp_port":
          saveData[item.name] = formData.value.mail_smtp_port;
          break;
        case "mail_smtp_user":
          saveData[item.name] = formData.value.mail_smtp_user;
          break;
        case "mail_smtp_pass":
          saveData[item.name] = formData.value.mail_smtp_password;
          break;
        case "mail_verify_type":
          saveData[item.name] = [formData.value.mail_vertify_type];
          break;
        case "mail_from":
          saveData[item.name] = formData.value.mail_from;
          break;
      }
    });

    const res = await saveSystemConfig({
      group: props.configGroup.name,
      data: saveData,
      google_code: googleVerifyCode.value
    });

    if (res.code === 0) {
      message("保存成功", { type: "success" });
      isEditMode.value = false;
      isSaveDisabled.value = true;
      // 更新原始数据
      originalFormData.value = { ...formData.value };
      googleVerifyCode.value = "";
      // 触发刷新
      emit("refresh");
    } else {
      message(res.msg || "保存失败", { type: "error" });
    }
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
            placeholder="请选择"
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
          <el-select
            v-model="formData.mail_vertify_type"
            :disabled="!isEditMode"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in mailVerifyTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
