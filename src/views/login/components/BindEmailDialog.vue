<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive, computed } from "vue";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { sendEmailCode } from "@/api/user";
import User from "~icons/tdesign/user";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  "next": [email: string];
}>();

const loading = ref(false);
const remindLater = ref(false);
const ruleForm = reactive({
  email: ""
});
const ruleFormRef = ref<FormInstance>();

const emailRules = [
  {
    required: true,
    message: "请输入邮箱",
    trigger: "blur"
  },
  {
    type: "email" as const,
    message: "请输入正确的邮箱格式",
    trigger: "blur"
  }
];

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value)
});

const handleClose = () => {
  emit("update:visible", false);
};

const handleNext = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      // 保存提醒设置
      if (remindLater.value) {
        // 可以保存到 localStorage，3天后提醒
        const remindDate = new Date();
        remindDate.setDate(remindDate.getDate() + 3);
        localStorage.setItem("emailBindRemindDate", remindDate.getTime().toString());
      }
      
      // 只验证邮箱，不发送验证码，验证码在邮箱验证对话框中发送
      emit("next", ruleForm.email);
    }
  });
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="绑定邮箱"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    @close="handleClose"
  >
    <div class="bind-email-content">
      <p class="bind-email-tip">
        GamePlus 2.0版本对系统进行的全面的升级,其中包括账户安全模块,为了您的账户安全,请即使绑定邮箱。该邮箱将用于密码找回等功能。
      </p>
      
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        label-width="60px"
      >
        <el-form-item label="邮箱" prop="email" :rules="emailRules">
          <el-input
            v-model="ruleForm.email"
            clearable
            placeholder="请输入邮箱"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-checkbox v-model="remindLater">
          3天后在提醒
        </el-checkbox>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleNext(ruleFormRef)"
        >
          下一步
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: "BindEmailDialog"
};
</script>

<style scoped lang="scss">
.bind-email-content {
  .bind-email-tip {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

