<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { recoverPassword } from "@/api/user";
import User from "~icons/tdesign/user";
import { Warning } from "@element-plus/icons-vue";

const { t } = useI18n();
const loading = ref(false);
const errorMessage = ref("");
const ruleForm = reactive({
  account: ""
});
const ruleFormRef = ref<FormInstance>();

const accountRules = {
  account: [
    {
      required: true,
      message: transformI18n($t("login.passwordRecovery.accountPlaceholder")),
      trigger: "blur"
    }
  ]
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  errorMessage.value = "";
  await formEl.validate(valid => {
    if (valid) {
      // 暂时只做前端验证，不调用后端
      // 保存账号信息，用于下一步
      useUserStoreHook().SET_USERNAME(ruleForm.account);
      // 直接跳转到验证码页面
      useUserStoreHook().SET_CURRENTPAGE(2);
      
      // 如果需要后端验证，可以取消下面的注释
      // loading.value = true;
      // recoverPassword({ account: ruleForm.account })
      //   .then(res => {
      //     if (res.success) {
      //       // 保存账号和邮箱信息，用于下一步
      //       useUserStoreHook().SET_USERNAME(ruleForm.account);
      //       if (res.data?.email) {
      //         // 可以存储邮箱信息到 store 或通过其他方式传递
      //       }
      //       if (res.data?.hasGoogleAuth) {
      //         // 存储是否开启谷歌验证
      //       }
      //       // 跳转到验证码页面
      //       useUserStoreHook().SET_CURRENTPAGE(2);
      //     } else {
      //       // 显示错误信息
      //       errorMessage.value = res.message || transformI18n($t("login.passwordRecovery.accountNotExist"));
      //     }
      //   })
      //   .catch(error => {
      //     errorMessage.value = error?.message || transformI18n($t("login.passwordRecovery.accountNotExist"));
      //   })
      //   .finally(() => {
      //     loading.value = false;
      //   });
    }
  });
};

const onCancel = () => {
  useUserStoreHook().SET_CURRENTPAGE(0);
};
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="accountRules"
    size="large"
  >
    <Motion>
      <h2 class="login-form-title">{{ t("login.passwordRecovery.title") }}</h2>
    </Motion>
    
    <Motion :delay="50">
      <p class="login-form-tip">{{ t("login.passwordRecovery.tip") }}</p>
    </Motion>

    <Motion :delay="100" style="margin-bottom: 30px;">
      <el-form-item prop="account">
        <el-input
          v-model="ruleForm.account"
          clearable
          :placeholder="t('login.passwordRecovery.accountPlaceholder')"
          :prefix-icon="useRenderIcon(User)"
          :class="{ 'error-input': errorMessage }"
        />
        <div v-if="errorMessage" class="error-message">
          <el-icon class="error-icon"><Warning /></el-icon>
          <span>{{ errorMessage }}</span>
        </div>
      </el-form-item>
    </Motion>

    <Motion :delay="150">
      <el-form-item>
        <div class="button-group">
          <el-button
            class="cancel-button"
            size="large"
            @click="onCancel"
          >
            {{ t("login.passwordRecovery.cancel") }}
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

.error-input {
  :deep(.el-input__wrapper) {
    border-color: #f56c6c !important;
  }
}

.error-message {
  display: flex;
  align-items: center;
  color: #f56c6c;
  font-size: 12px;
  margin-top: 8px;
  
  .error-icon {
    margin-right: 4px;
    font-size: 14px;
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
  
  .next-button {
    flex: 1;
  }
}
</style>

