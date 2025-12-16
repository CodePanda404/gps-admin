<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { sendEmailCode } from "@/api/user";
import Keyhole from "~icons/ri/shield-keyhole-line";
import RiGoogleFill from "~icons/ri/google-fill";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  email: string;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  "confirm": [emailCode: string, googleCode?: string];
}>();

const loading = ref(false);
const countdown = ref(0);
const timer = ref<number | null>(null);
const ruleForm = reactive({
  emailCode: "",
  googleCode: ""
});
const ruleFormRef = ref<FormInstance>();

// 从 store 获取谷歌验证状态
const hasGoogleAuth = computed(() => {
  return useUserStoreHook().googleStatus === 1;
});

// 格式化邮箱显示（部分隐藏）
const formattedEmail = computed(() => {
  const emailStr = props.email;
  if (!emailStr) return "";
  
  const [localPart, domain] = emailStr.split("@");
  if (!localPart || !domain) return emailStr;
  
  // 如果本地部分长度大于2，只显示前2个字符，其余用*代替
  if (localPart.length > 2) {
    return `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}@${domain}`;
  }
  return emailStr;
});

// 邮箱验证码校验规则：不为空且纯数字
const emailCodeRules = [
  {
    required: true,
    message: "请输入验证码",
    trigger: "blur"
  },
  {
    pattern: /^\d+$/,
    message: "验证码必须为纯数字",
    trigger: "blur"
  }
];

// 谷歌验证码校验规则：非空且为数字
const googleCodeRules = [
  {
    required: true,
    message: "请输入谷歌验证码",
    trigger: "blur"
  },
  {
    pattern: /^\d+$/,
    message: "谷歌验证码必须为数字",
    trigger: "blur"
  }
];

// 动态表单验证规则
const formRules = computed(() => {
  const rules: any = {
    emailCode: emailCodeRules
  };
  if (hasGoogleAuth.value) {
    rules.googleCode = googleCodeRules;
  }
  return rules;
});

const countdownText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}秒后可重新获取验证码`;
  }
  return "";
});

const startCountdown = () => {
  countdown.value = 60;
  if (timer.value) {
    clearInterval(timer.value);
  }
  timer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    }
  }, 1000);
};

const onResendCode = async () => {
  if (countdown.value > 0) return;
  
  const username = useUserStoreHook().username;
  const userEmail = props.email;
  
  if (!username || !userEmail) {
    message("用户信息丢失", { type: "error" });
    return;
  }
  
  loading.value = true;
  sendEmailCode({ username, email: userEmail })
    .then(res => {
      if (res.code === 0) {
        message("验证码已发送", { type: "success" });
        startCountdown();
      } else {
        message(res.msg || "发送验证码失败", { type: "error" });
      }
    })
    .catch(error => {
      message(error?.response?.data?.msg || error?.message || "发送验证码失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate(valid => {
    if (!valid) return;
  });
  
  // 前端校验邮箱验证码（不为空且纯数字）
  if (!ruleForm.emailCode) {
    message("请输入验证码", { type: "error" });
    return;
  }
  
  if (!/^\d+$/.test(ruleForm.emailCode)) {
    message("验证码必须为纯数字", { type: "error" });
    return;
  }
  
  // 如果开启了谷歌验证，前端校验谷歌验证码（非空且为数字）
  if (hasGoogleAuth.value) {
    if (!ruleForm.googleCode) {
      message("请输入谷歌验证码", { type: "error" });
      return;
    }
    
    if (!/^\d+$/.test(ruleForm.googleCode)) {
      message("谷歌验证码必须为数字", { type: "error" });
      return;
    }
  }
  
  emit("confirm", ruleForm.emailCode, hasGoogleAuth.value ? ruleForm.googleCode : undefined);
};

const handleCancel = () => {
  emit("update:visible", false);
};

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value)
});

onMounted(async () => {
  // 初始化时获取账号信息并自动发送验证码
  const username = useUserStoreHook().username;
  const userEmail = props.email;
  if (username && userEmail) {
    // 自动发送验证码
    await onResendCode();
  }
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="输入邮箱验证码"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="true"
    @close="handleCancel"
  >
    <div class="email-verify-content">
      <p class="email-verify-tip">
        验证码发送至 {{ formattedEmail }} 有效期10分钟
      </p>
      
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="formRules"
      >
        <el-form-item :rules="emailCodeRules" prop="emailCode">
          <el-input
            v-model="ruleForm.emailCode"
            clearable
            placeholder="请输入验证码"
            :prefix-icon="useRenderIcon(Keyhole)"
          />
          <div v-if="countdownText" class="countdown-text">
            {{ countdownText }}
          </div>
          <div v-else class="resend-text">
            <el-button
              link
              type="primary"
              size="small"
              @click="onResendCode"
              :loading="loading"
            >
              重新获取验证码
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item v-if="hasGoogleAuth" :rules="googleCodeRules" prop="googleCode" style="margin-bottom: 30px;">
          <el-input
            v-model="ruleForm.googleCode"
            clearable
            placeholder="请输入谷歌验证码"
            :prefix-icon="useRenderIcon(RiGoogleFill)"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleConfirm(ruleFormRef)"
        >
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: "EmailVerifyDialog"
};
</script>

<style scoped lang="scss">
.email-verify-content {
  .email-verify-tip {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  
.countdown-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: left;
}

.resend-text {
  margin-top: 8px;
  text-align: left;
}
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

