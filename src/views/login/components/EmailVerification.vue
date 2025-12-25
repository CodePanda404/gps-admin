<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { sendEmailCode } from "@/api/user";
import Keyhole from "~icons/ri/shield-keyhole-line";
import RiGoogleFill from "~icons/ri/google-fill";

const { t } = useI18n();
const loading = ref(false);
const countdown = ref(0);
const timer = ref<number | null>(null);
const ruleForm = reactive({
  emailCode: "",
  googleCode: ""
});
const ruleFormRef = ref<FormInstance>();

// 从 store 获取邮箱和谷歌验证状态
const recoveryEmail = computed(() => {
  return useUserStoreHook().recoveryEmail || "";
});

// 格式化邮箱显示（部分隐藏）
const email = computed(() => {
  const emailStr = recoveryEmail.value;
  if (!emailStr) return "";
  
  const [localPart, domain] = emailStr.split("@");
  if (!localPart || !domain) return emailStr;
  
  // 如果本地部分长度大于2，只显示前2个字符，其余用*代替
  if (localPart.length > 2) {
    return `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}@${domain}`;
  }
  return emailStr;
});

const hasGoogleAuth = computed(() => {
  return useUserStoreHook().googleStatus === 1;
});

// 邮箱验证码校验规则：不为空且纯数字
const emailCodeRules = [
  {
    required: true,
    message: transformI18n($t("login.passwordRecovery.emailCodePlaceholder")),
    trigger: "blur"
  },
  {
    pattern: /^\d+$/,
    message: "邮箱验证码必须为纯数字",
    trigger: "blur"
  }
];

// 谷歌验证码校验规则：非空且为数字
const googleCodeRules = [
  {
    required: true,
    message: transformI18n($t("login.passwordRecovery.googleCodePlaceholder")),
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
    return `${countdown.value}${t("login.passwordRecovery.countdownUnit")}${t("login.passwordRecovery.countdownText")}`;
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
  const userEmail = recoveryEmail.value;
  
  if (!username || !userEmail) {
    message(transformI18n($t("login.passwordRecovery.accountRequired")), { type: "error" });
    return;
  }
  
  loading.value = true;
  sendEmailCode({ username, email: userEmail })
    .then(res => {
      if (res.code === 0) {
  message(transformI18n($t("login.passwordRecovery.codeSent")), { type: "success" });
  startCountdown();
      } else {
        message(res.msg || transformI18n($t("login.passwordRecovery.sendCodeFailed")), { type: "error" });
      }
    })
    .catch(error => {
      message(error?.response?.data?.msg || error?.message || transformI18n($t("login.passwordRecovery.sendCodeFailed")), { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  // 先进行表单验证
  await formEl.validate(valid => {
    if (!valid) return;
  });
  
  // 前端校验邮箱验证码（不为空且纯数字）
  if (!ruleForm.emailCode) {
    message(transformI18n($t("login.passwordRecovery.emailCodePlaceholder")), { type: "error" });
    return;
  }
  
  if (!/^\d+$/.test(ruleForm.emailCode)) {
    message("邮箱验证码必须为纯数字", { type: "error" });
    return;
  }
  
  // 如果开启了谷歌验证，前端校验谷歌验证码（非空且为数字）
  if (hasGoogleAuth.value) {
    if (!ruleForm.googleCode) {
      message(transformI18n($t("login.passwordRecovery.googleCodePlaceholder")), { type: "error" });
      return;
    }
    
    if (!/^\d+$/.test(ruleForm.googleCode)) {
      message("谷歌验证码必须为数字", { type: "error" });
      return;
    }
  }
  
  // 保存验证码到 store，供设置新密码页面使用
  useUserStoreHook().SET_EMAIL_CODE(ruleForm.emailCode);
  if (hasGoogleAuth.value && ruleForm.googleCode) {
    useUserStoreHook().SET_GOOGLE_CODE(ruleForm.googleCode);
  }
  
  // 所有验证码通过前端校验后，直接跳转到设置新密码页面
  // 后端验证统一交给下一个流程（设置新密码页面）来处理
  useUserStoreHook().SET_CURRENTPAGE(3);
};

const onBack = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  countdown.value = 0;
  useUserStoreHook().SET_CURRENTPAGE(1);
};

onMounted(async () => {
  // 初始化时获取账号信息
  const username = useUserStoreHook().username;
  const userEmail = recoveryEmail.value;
  const shouldAutoSend = useUserStoreHook().shouldAutoSendEmailCode;
  
  // 只有从校验用户页面进入时才自动发送验证码
  if (username && userEmail && shouldAutoSend) {
    // 自动发送验证码
    onResendCode();
    // 发送后重置标记
    useUserStoreHook().SET_SHOULD_AUTO_SEND_EMAIL_CODE(false);
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
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="formRules"
    size="large"
  >
    <Motion>
      <h2 class="login-form-title">{{ t("login.passwordRecovery.emailVerificationTitle") }}</h2>
    </Motion>
    
    <Motion :delay="50">
      <p class="login-form-tip">
        {{ t("login.passwordRecovery.emailVerificationTip") }}
        <span v-if="email">{{ email }}</span>
        <span v-else>{{ t("login.passwordRecovery.emailPlaceholder") }}</span>
        {{ t("login.passwordRecovery.validityPeriod") }}
      </p>
    </Motion>

    <Motion :delay="100">
      <el-form-item :rules="emailCodeRules" prop="emailCode">
        <el-input
          v-model="ruleForm.emailCode"
          clearable
          :placeholder="t('login.passwordRecovery.emailCodePlaceholder')"
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
            {{ t("login.passwordRecovery.resendCode") }}
          </el-button>
        </div>
      </el-form-item>
    </Motion>

    <Motion v-if="hasGoogleAuth" :delay="150" style="margin-bottom: 30px;">
      <el-form-item :rules="googleCodeRules" prop="googleCode">
        <el-input
          v-model="ruleForm.googleCode"
          clearable
          :placeholder="t('login.passwordRecovery.googleCodePlaceholder')"
          :prefix-icon="useRenderIcon(RiGoogleFill)"
        />
      </el-form-item>
    </Motion>

    <Motion :delay="200">
      <el-form-item>
        <div class="button-group">
          <el-button
            class="cancel-button"
            size="large"
            @click="onBack"
          >
            {{ t("login.passwordRecovery.back") }}
          </el-button>
          <el-button
            class="next-button"
            type="primary"
            size="large"
            :loading="loading"
            @click="onSubmit(ruleFormRef)"
          >
            {{ t("login.passwordRecovery.nextStep") }}
          </el-button>
        </div>
      </el-form-item>
    </Motion>
  </el-form>
</template>

<style scoped lang="scss">
.login-form-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: left;
  
  html.dark & {
    color: #ffffff;
  }
}

.login-form-tip {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
  text-align: left;
  
  html.dark & {
    color: #999;
  }
}

.countdown-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: left;
}

.resend-text {
  text-align: left;
}

.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
  
  .cancel-button {
    flex: 1;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    color: #606266;
    
    html.dark & {
      background: #141414;
      border-color: rgba(255, 255, 255, 0.15);
      color: #e0e0e0;
    }
  }
  
  .next-button {
    flex: 1;
  }
}
</style>

