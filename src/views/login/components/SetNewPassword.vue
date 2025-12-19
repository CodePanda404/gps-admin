<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import { REGEXP_PWD } from "../utils/rule";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { forgetPassword } from "@/api/user";
import Lock from "~icons/ri/lock-fill";
import { View, Hide } from "@element-plus/icons-vue";

const { t } = useI18n();
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const ruleForm = reactive({
  password: "",
  confirmPassword: ""
});
const ruleFormRef = ref<FormInstance>();

const passwordRules = [
  {
    validator: (rule, value, callback) => {
      if (value === "") {
        callback(new Error(transformI18n($t("login.passwordRecovery.newPasswordPlaceholder"))));
      } else if (!REGEXP_PWD.test(value)) {
        callback(new Error(transformI18n($t("login.passwordRecovery.passwordRule"))));
      } else {
        callback();
      }
    },
    trigger: "blur"
  }
];

const confirmPasswordRules = [
  {
    validator: (rule, value, callback) => {
      if (value === "") {
        callback(new Error(transformI18n($t("login.passwordRecovery.confirmPasswordPlaceholder"))));
      } else if (ruleForm.password !== value) {
        callback(new Error(transformI18n($t("login.passwordRecovery.passwordMismatch"))));
      } else {
        callback();
      }
    },
    trigger: "blur"
  }
];

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      const username = useUserStoreHook().username;
      const emailCode = useUserStoreHook().emailCode;
      const googleCode = useUserStoreHook().googleCode;
      const hasGoogleAuth = useUserStoreHook().googleStatus === 1;
      
      if (!username || !emailCode) {
        message(transformI18n($t("login.passwordRecovery.accountRequired")), { type: "error" });
        return;
      }
      
      loading.value = true;
      forgetPassword({
        username,
        password: ruleForm.password,
        repassword: ruleForm.confirmPassword,
        sms_code: emailCode,
        google_code: hasGoogleAuth ? googleCode : undefined
      })
        .then(res => {
          if (res.code === 0) {
            message(res.msg || transformI18n($t("login.passwordRecovery.resetSuccess")), { type: "success" });
      // 重置状态并返回登录页
      setTimeout(() => {
        useUserStoreHook().SET_CURRENTPAGE(0);
        useUserStoreHook().SET_USERNAME("");
              useUserStoreHook().SET_EMAIL_CODE("");
              useUserStoreHook().SET_GOOGLE_CODE("");
              useUserStoreHook().SET_RECOVERY_EMAIL("");
              useUserStoreHook().SET_GOOGLE_STATUS(0);
      }, 1500);
          } else {
            message(res.msg || transformI18n($t("login.passwordRecovery.resetFailed")), { type: "error" });
          }
        })
        .catch(error => {
          message(error?.response?.data?.msg || error?.message || transformI18n($t("login.passwordRecovery.resetFailed")), { type: "error" });
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};

const onBack = () => {
  // 从设置新密码页面返回，不应该自动发送验证码
  useUserStoreHook().SET_SHOULD_AUTO_SEND_EMAIL_CODE(false);
  useUserStoreHook().SET_CURRENTPAGE(2);
};
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    size="large"
  >
    <Motion>
      <h2 class="login-form-title">{{ t("login.passwordRecovery.setNewPasswordTitle") }}</h2>
    </Motion>
    
    <Motion :delay="50">
      <p class="login-form-tip">{{ t("login.passwordRecovery.passwordRequirement") }}</p>
    </Motion>

    <Motion :delay="100" style="margin-bottom: 30px;">
      <el-form-item :rules="passwordRules" prop="password">
        <el-input
          v-model="ruleForm.password"
          clearable
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('login.passwordRecovery.newPasswordPlaceholder')"
          :prefix-icon="useRenderIcon(Lock)"
        >
          <template #suffix>
            <el-icon
              class="password-icon"
              @click="showPassword = !showPassword"
            >
              <View v-if="!showPassword" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </Motion>

    <Motion :delay="150" style="margin-bottom: 30px;">
      <el-form-item :rules="confirmPasswordRules" prop="confirmPassword">
        <el-input
          v-model="ruleForm.confirmPassword"
          clearable
          :type="showConfirmPassword ? 'text' : 'password'"
          :placeholder="t('login.passwordRecovery.confirmPasswordPlaceholder')"
          :prefix-icon="useRenderIcon(Lock)"
        >
          <template #suffix>
            <el-icon
              class="password-icon"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <View v-if="!showConfirmPassword" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-input>
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
            class="confirm-button"
            type="primary"
            size="large"
            :loading="loading"
            @click="onSubmit(ruleFormRef)"
          >
            {{ t("login.passwordRecovery.confirm") }}
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

.password-icon {
  cursor: pointer;
  color: #909399;
  
  &:hover {
    color: #409eff;
  }
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
  
  .confirm-button {
    flex: 1;
  }
}
</style>

