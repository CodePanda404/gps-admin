<script setup lang="ts">
defineOptions({
  name: "FeatureControl"
});
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElSwitch, ElButton, ElInput, ElInputNumber, ElDialog, ElMessageBox } from "element-plus";

// 编辑模式状态
const isEditMode = ref(false);

// 表单数据
const formData = ref({
  registerIpLimit: 0,
  ipWhitelist: "",
  maintenanceStatus: false,
  tgServiceLink: "",
  whatsappServiceLink: "",
  contactPhone: "",
  email: "",
  contactAddress: "",
  copyrightText: "",
  twaMiniProgramRobot: ""
});

// 原始数据（用于取消时恢复）
const originalFormData = ref({
  registerIpLimit: 0,
  ipWhitelist: "",
  maintenanceStatus: false,
  tgServiceLink: "",
  whatsappServiceLink: "",
  contactPhone: "",
  email: "",
  contactAddress: "",
  copyrightText: "",
  twaMiniProgramRobot: ""
});

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 获取配置数据
const getConfig = async () => {
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    // 模拟数据
    const data = {
      registerIpLimit: 10,
      ipWhitelist: "192.168.1.1,192.168.1.2",
      maintenanceStatus: true,
      tgServiceLink: "",
      whatsappServiceLink: "",
      contactPhone: "",
      email: "",
      contactAddress: "",
      copyrightText: "",
      twaMiniProgramRobot: ""
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
  <div class="feature-control-container">
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="handleEdit" :disabled="isEditMode">
            修改
          </el-button>
        </div>
      </template>
      <el-form :model="formData" label-width="200px">
        <el-form-item label="注册IP限制数">
          <el-input-number
            v-model="formData.registerIpLimit"
            :min="0"
            :disabled="!isEditMode"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="IP白名单">
          <el-input
            v-model="formData.ipWhitelist"
            :disabled="!isEditMode"
            placeholder="IP白名单,多个白名单以英文逗号隔开"
          />
        </el-form-item>
        <el-form-item label="维护状态">
          <el-switch
            v-model="formData.maintenanceStatus"
            :disabled="!isEditMode"
          />
        </el-form-item>
        <el-form-item label="TG客服链接">
          <el-input
            v-model="formData.tgServiceLink"
            :disabled="!isEditMode"
            placeholder="请输入TG客服链接"
          />
        </el-form-item>
        <el-form-item label="WhatsApp客服链接">
          <el-input
            v-model="formData.whatsappServiceLink"
            :disabled="!isEditMode"
            placeholder="请输入WhatsApp客服链接"
          />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="formData.contactPhone"
            :disabled="!isEditMode"
            placeholder="请输入联系电话"
          />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input
            v-model="formData.email"
            :disabled="!isEditMode"
            placeholder="请输入电子邮箱"
          />
        </el-form-item>
        <el-form-item label="联系地址">
          <el-input
            v-model="formData.contactAddress"
            :disabled="!isEditMode"
            placeholder="请输入联系地址"
          />
        </el-form-item>
        <el-form-item label="版权文案">
          <el-input
            v-model="formData.copyrightText"
            :disabled="!isEditMode"
            placeholder="例如:Copyright © GamePlus. All Rights Reserved."
          />
        </el-form-item>
        <el-form-item label="TWA小程序机器人">
          <el-input
            v-model="formData.twaMiniProgramRobot"
            :disabled="!isEditMode"
            placeholder="请输入TWA小程序机器人"
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
.feature-control-container {
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
