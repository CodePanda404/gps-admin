<script setup lang="ts">
defineOptions({
  name: "ParameterConfig"
});
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElButton, ElInput, ElDialog, ElMessageBox } from "element-plus";

// 编辑模式状态
const isEditMode = ref(false);

// 表单数据
const formData = ref({
  apiDocumentAddress: "",
  transferWalletApiDocument: "",
  creditLimitReminderINR: 0,
  creditLimitReminderKES: 0,
  creditLimitReminderPHP: 0,
  creditLimitReminderIDR: 0,
  creditLimitReminderTHB: 0,
  creditLimitReminderCNY: 0,
  creditLimitReminderAUD: 0,
  creditLimitReminderBRL: 0,
  creditLimitReminderCOP: 0,
  creditLimitReminderMXN: 0,
  creditLimitReminderNGN: 0
});

// 原始数据（用于取消时恢复）
const originalFormData = ref({
  apiDocumentAddress: "",
  transferWalletApiDocument: "",
  creditLimitReminderINR: 0,
  creditLimitReminderKES: 0,
  creditLimitReminderPHP: 0,
  creditLimitReminderIDR: 0,
  creditLimitReminderTHB: 0,
  creditLimitReminderCNY: 0,
  creditLimitReminderAUD: 0,
  creditLimitReminderBRL: 0,
  creditLimitReminderCOP: 0,
  creditLimitReminderMXN: 0,
  creditLimitReminderNGN: 0
});

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 币种列表
const currencyList = [
  { code: "INR", label: "INR" },
  { code: "KES", label: "KES" },
  { code: "PHP", label: "PHP" },
  { code: "IDR", label: "IDR" },
  { code: "THB", label: "THB" },
  { code: "CNY", label: "CNY" },
  { code: "AUD", label: "AUD" },
  { code: "BRL", label: "BRL" },
  { code: "COP", label: "COP" },
  { code: "MXN", label: "MXN" },
  { code: "NGN", label: "NGN" }
];

// 获取配置数据
const getConfig = async () => {
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    // 模拟数据
    const data = {
      apiDocumentAddress: "https://jacskie179.gitbook.io/hai-wai-you-xi-api-ji-cheng-wen-dang-v1/api-document-v1/overview",
      transferWalletApiDocument: "https://jackie179.gitbook.io/game-plus-zhuan-zhang-qian-bao-api-wen-dang/",
      creditLimitReminderINR: 100000,
      creditLimitReminderKES: 100000,
      creditLimitReminderPHP: 100000,
      creditLimitReminderIDR: 100000,
      creditLimitReminderTHB: 100000,
      creditLimitReminderCNY: 100000,
      creditLimitReminderAUD: 100000,
      creditLimitReminderBRL: 100000,
      creditLimitReminderCOP: 100000,
      creditLimitReminderMXN: 100000,
      creditLimitReminderNGN: 100000
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
  <div class="parameter-config-container">
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="handleEdit" :disabled="isEditMode">
            修改
          </el-button>
        </div>
      </template>
      <el-form :model="formData" label-width="200px">
        <el-form-item label="API文档地址">
          <el-input
            v-model="formData.apiDocumentAddress"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="转账钱包API文档">
          <el-input
            v-model="formData.transferWalletApiDocument"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 信用额度提醒值设置 -->
    <el-card shadow="never" style="margin: 20px" class="credit-limit-card">
      <template #header>
        <div class="card-title">信用额度提醒值设置</div>
      </template>
      <el-form :model="formData" label-width="200px">
        <div class="credit-limit-grid">
          <el-form-item
            v-for="currency in currencyList"
            :key="currency.code"
            :label="currency.label"
            class="grid-item"
          >
            <el-input
              v-model="(formData as any)[`creditLimitReminder${currency.code}`]"
              :disabled="!isEditMode"
              type="number"
              placeholder="请输入"
            />
          </el-form-item>
        </div>
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
.parameter-config-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.credit-limit-card {
  background-color: #f5f7fa;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.credit-limit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.grid-item {
  margin-bottom: 18px;
}

.grid-item :deep(.el-form-item__label) {
  width: 100px !important;
}

.grid-item :deep(.el-form-item__content) {
  margin-left: 100px !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
