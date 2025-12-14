<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { sendVerificationCode, verifyCode, recoverPassword } from "@/api/user";
import Keyhole from "~icons/ri/shield-keyhole-line";
import RiGoogleFill from "~icons/ri/google-fill";

const { t } = useI18n();
const loading = ref(false);
const countdown = ref(0);
const timer = ref<number | null>(null);
const hasGoogleAuth = ref(false);
const email = ref("");
const ruleForm = reactive({
  emailCode: "",
  googleCode: ""
});
const ruleFormRef = ref<FormInstance>();

const emailCodeRules = [
  {
    required: true,
    message: transformI18n($t("login.passwordRecovery.emailCodePlaceholder")),
    trigger: "blur"
  }
];

const googleCodeRules = [
  {
    required: true,
    message: transformI18n($t("login.passwordRecovery.googleCodePlaceholder")),
    trigger: "blur"
  }
];

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
  
  const account = useUserStoreHook().username;
  if (!account) {
    message(transformI18n($t("login.passwordRecovery.accountRequired")), { type: "error" });
    return;
  }
  
  // 暂时只做前端处理，模拟发送验证码
  message(transformI18n($t("login.passwordRecovery.codeSent")), { type: "success" });
  startCountdown();
  
  // 如果需要后端发送验证码，可以取消下面的注释
  // loading.value = true;
  // sendVerificationCode({ account })
  //   .then(res => {
  //     if (res.success) {
  //       message(transformI18n($t("login.passwordRecovery.codeSent")), { type: "success" });
  //       if (res.data?.email) {
  //         email.value = res.data.email;
  //       }
  //       if (res.data?.hasGoogleAuth !== undefined) {
  //         hasGoogleAuth.value = res.data.hasGoogleAuth;
  //       }
  //       startCountdown();
  //     } else {
  //       message(res.message || transformI18n($t("login.passwordRecovery.sendCodeFailed")), { type: "error" });
  //     }
  //   })
  //   .catch(error => {
  //     message(error?.message || transformI18n($t("login.passwordRecovery.sendCodeFailed")), { type: "error" });
  //   })
  //   .finally(() => {
  //     loading.value = false;
  //   });
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  // 手动验证邮箱验证码
  if (!ruleForm.emailCode) {
    message(transformI18n($t("login.passwordRecovery.emailCodePlaceholder")), { type: "error" });
    return;
  }
  
  // 如果开启了谷歌验证，验证谷歌验证码
  if (hasGoogleAuth.value && !ruleForm.googleCode) {
    message(transformI18n($t("login.passwordRecovery.googleCodePlaceholder")), { type: "error" });
    return;
  }
  
  // 暂时只做前端验证，不调用后端
  // 直接跳转到设置新密码页面
  useUserStoreHook().SET_CURRENTPAGE(3);
  
  // 如果需要后端验证，可以取消下面的注释
  // loading.value = true;
  // const account = useUserStoreHook().username;
  // verifyCode({
  //   account,
  //   emailCode: ruleForm.emailCode,
  //   googleCode: hasGoogleAuth.value ? ruleForm.googleCode : undefined
  // })
  //   .then(res => {
  //     if (res.success) {
  //       // 跳转到设置新密码页面
  //       useUserStoreHook().SET_CURRENTPAGE(3);
  //     } else {
  //       message(res.message || transformI18n($t("login.passwordRecovery.verifyFailed")), { type: "error" });
  //     }
  //   })
  //   .catch(error => {
  //     message(error?.message || transformI18n($t("login.passwordRecovery.verifyFailed")), { type: "error" });
  //   })
  //   .finally(() => {
  //     loading.value = false;
  //   });
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
  const account = useUserStoreHook().username;
  if (!account) {
    // 如果没有账号信息，返回上一步
    useUserStoreHook().SET_CURRENTPAGE(1);
    return;
  }
  
  // 暂时模拟邮箱和谷歌验证状态（用于调试）
  // 可以设置一个测试邮箱
  email.value = "px*******@gmail.com";
  hasGoogleAuth.value = false; // 设置为 true 可以测试谷歌验证码输入框
  
  // 如果需要从后端获取，可以取消下面的注释
  // try {
  //   const res = await recoverPassword({ account });
  //   if (res.success) {
  //     if (res.data?.email) {
  //       email.value = res.data.email;
  //     }
  //     if (res.data?.hasGoogleAuth !== undefined) {
  //       hasGoogleAuth.value = res.data.hasGoogleAuth;
  //     }
  //   }
  // } catch (error) {
  //   console.error("Failed to get account info:", error);
  // }
  
  // 暂时不自动发送验证码，用户需要手动点击重新获取
  // onResendCode();
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

    <Motion :delay="100" style="margin-bottom: 30px;">
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
      <el-form-item prop="googleCode">
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
  margin-bottom: 12px;
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
  margin-top: 8px;
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

