<script setup lang="ts">
defineOptions({
  name: "ParameterConfig"
});
import { ref, watch } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElButton, ElInput, ElDialog, ElMessageBox } from "element-plus";
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

// 从后端数据初始化表单
const initFormData = () => {
  if (!props.configGroup || !props.configGroup.list) return;
  
  // 遍历后端返回的配置项，映射到前端字段
  props.configGroup.list.forEach((item) => {
    // 根据后端字段名映射到前端字段
    // 如果后端字段名与前端字段名不同，在这里进行映射
    // 例如：如果后端有api_document_address字段，映射到apiDocumentAddress
    // 如果后端没有返回，保持默认值
    
    // 信用额度提醒值可能以后端字段名为key，例如：credit_limit_reminder_INR
    // 这里暂时保留，等后端有具体字段名时再添加映射逻辑
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
      // 根据item.name映射前端字段到后端字段
      // 例如：如果后端字段是api_document_address，前端是apiDocumentAddress
      // saveData[item.name] = formData.value.apiDocumentAddress;
      
      // 信用额度提醒值可能需要特殊处理
      // 例如：如果后端字段是credit_limit_reminder_INR，前端是creditLimitReminderINR
      // 这里暂时保留，等后端有具体字段名时再添加映射逻辑
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
