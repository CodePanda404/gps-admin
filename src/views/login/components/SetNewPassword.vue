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
import { resetPassword } from "@/api/user";
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
      // 暂时只做前端验证，不调用后端
      message(transformI18n($t("login.passwordRecovery.resetSuccess")), { type: "success" });
      // 重置状态并返回登录页
      setTimeout(() => {
        useUserStoreHook().SET_CURRENTPAGE(0);
        useUserStoreHook().SET_USERNAME("");
      }, 1500);
      
      // 如果需要后端验证，可以取消下面的注释
      // loading.value = true;
      // const account = useUserStoreHook().username;
      // resetPassword({
      //   account,
      //   password: ruleForm.password,
      //   confirmPassword: ruleForm.confirmPassword
      // })
      //   .then(res => {
      //     if (res.success) {
      //       message(transformI18n($t("login.passwordRecovery.resetSuccess")), { type: "success" });
      //       // 重置状态并返回登录页
      //       setTimeout(() => {
      //         useUserStoreHook().SET_CURRENTPAGE(0);
      //         useUserStoreHook().SET_USERNAME("");
      //       }, 1500);
      //     } else {
      //       message(res.message || transformI18n($t("login.passwordRecovery.resetFailed")), { type: "error" });
      //     }
      //   })
      //   .catch(error => {
      //     message(error?.message || transformI18n($t("login.passwordRecovery.resetFailed")), { type: "error" });
      //   })
      //   .finally(() => {
      //     loading.value = false;
      //   });
    }
  });
};

const onBack = () => {
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

