<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { checkAccount } from "@/api/user";
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
      loading.value = true;
      checkAccount({ username: ruleForm.account })
        .then(res => {
          if (res.code === 0) {
            // 校验用户是否绑定邮箱
            if (!res.data.email || res.data.email.trim() === "") {
              errorMessage.value = "当前您的用户没有绑定，请联系管理员";
              return;
            }
            
            // 保存账号信息、邮箱和谷歌验证状态，用于下一步
            useUserStoreHook().SET_USERNAME(ruleForm.account);
            useUserStoreHook().SET_RECOVERY_EMAIL(res.data.email);
            useUserStoreHook().SET_GOOGLE_STATUS(res.data.google_status);
            // 设置标记：从校验用户页面进入，应该自动发送验证码
            useUserStoreHook().SET_SHOULD_AUTO_SEND_EMAIL_CODE(true);
            // 可以保存 token 用于后续步骤（如果需要）
            // 跳转到验证码页面
            useUserStoreHook().SET_CURRENTPAGE(2);
          } else {
            // 显示错误信息
            errorMessage.value = res.msg || transformI18n($t("login.passwordRecovery.accountNotExist"));
          }
        })
        .catch(error => {
          errorMessage.value = error?.response?.data?.msg || error?.message || transformI18n($t("login.passwordRecovery.accountNotExist"));
        })
        .finally(() => {
          loading.value = false;
        });
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

