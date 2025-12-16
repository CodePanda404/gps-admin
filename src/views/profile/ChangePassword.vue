<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive, computed } from "vue";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { checkPassword } from "@/api/user";
import Lock from "~icons/ri/lock-fill";
import RiGoogleFill from "~icons/ri/google-fill";
import { View, Hide } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);
const showPassword = ref(false);
const ruleForm = reactive({
  password: "",
  googleCode: ""
});
const ruleFormRef = ref<FormInstance>();

// 从 store 获取谷歌验证状态
const hasGoogleAuth = computed(() => {
  return useUserStoreHook().googleStatus === 1;
});

// 密码校验规则
const passwordRules = [
  {
    required: true,
    message: "请输入密码",
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
    password: passwordRules
  };
  if (hasGoogleAuth.value) {
    rules.googleCode = googleCodeRules;
  }
  return rules;
});

const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate(valid => {
    if (!valid) return;
  });
  
  // 前端校验密码（不为空）
  if (!ruleForm.password) {
    message("请输入密码", { type: "error" });
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
  
  const username = useUserStoreHook().username;
  if (!username) {
    message("用户信息丢失，请重新登录", { type: "error" });
    return;
  }
  
  loading.value = true;
  checkPassword({
    username,
    password: ruleForm.password,
    google_code: hasGoogleAuth.value ? ruleForm.googleCode : undefined
  })
    .then(res => {
      if (res.code === 0) {
        // 验证成功，直接跳转到设置新密码页面
        router.push("/profile/set-password");
      } else {
        message(res.msg || "验证失败", { type: "error" });
      }
    })
    .catch(error => {
      message(error?.response?.data?.msg || error?.message || "验证失败", { type: "error" });
    })
    .finally(() => {
      loading.value = false;
    });
};

const onBack = () => {
  router.back();
};
</script>

<template>
  <div class="change-password-wrapper">
    <div class="change-password-container">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="formRules"
        size="large"
      >
        <h2 class="form-title">修改当前密码</h2>
        
        <p class="form-tip">
          为了您的账号安全,修改密码前需要验证旧密码。
        </p>
        
        <el-form-item :rules="passwordRules" prop="password" style="margin-bottom: 30px;">
          <el-input
            v-model="ruleForm.password"
            clearable
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
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

        <el-form-item v-if="hasGoogleAuth" :rules="googleCodeRules" prop="googleCode" style="margin-bottom: 30px;">
          <el-input
            v-model="ruleForm.googleCode"
            clearable
            placeholder="请输入谷歌验证码"
            :prefix-icon="useRenderIcon(RiGoogleFill)"
          />
        </el-form-item>

        <el-form-item>
          <div class="button-group">
            <el-button
              class="cancel-button"
              size="large"
              @click="onBack"
            >
              取消
            </el-button>
            <el-button
              class="next-button"
              type="primary"
              size="large"
              :loading="loading"
              @click="onSubmit(ruleFormRef)"
            >
              下一步
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.change-password-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: calc(100vh - 48px);
  background: #f6faff;
  
  html.dark & {
    background-color: #1f1f1f;
  }
}

.change-password-container {
  width: 100%;
  max-width: 420px;
  
  :deep(.el-form) {
    background: #ffffff;
    width: 420px;
    min-height: 400px;
    padding: 55px 35px 38px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    html.dark & {
      background-color: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
  
  .form-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    text-align: left;
    
    html.dark & {
      color: #ffffff;
    }
  }
  
  .form-tip {
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
    
    .next-button {
      flex: 1;
    }
  }
}

@media screen and (max-width: 968px) {
  .change-password-wrapper {
    padding: 0 2rem;
  }
  
  .change-password-container {
    :deep(.el-form) {
      width: 100%;
      max-width: 420px;
    }
  }
}
</style>

