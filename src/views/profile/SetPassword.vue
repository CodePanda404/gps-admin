<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import { message } from "@/utils/message";
import { REGEXP_PWD } from "@/views/login/utils/rule";
import type { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { updatePassword, logout } from "@/api/user";
import Lock from "~icons/ri/lock-fill";
import { View, Hide } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { removeToken } from "@/utils/auth";

const { t } = useI18n();
const router = useRouter();
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
        callback(new Error("请输入新密码"));
      } else if (!REGEXP_PWD.test(value)) {
        callback(new Error("密码须至少包含数字、英文字母、符号中的两种;且长度不小于8位"));
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
        callback(new Error("请再次输入新密码"));
      } else if (ruleForm.password !== value) {
        callback(new Error("两次输入密码不一致"));
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
      if (!username) {
        message("用户信息丢失，请重新登录", { type: "error" });
        return;
      }
      
      loading.value = true;
      updatePassword({
        username,
        password: ruleForm.password,
        repassword: ruleForm.confirmPassword
      })
        .then(res => {
          if (res.code === 0) {
            message(res.msg || "密码修改成功", { type: "success" });
            // 1秒后调用退出登录接口，然后跳转到登录页面
            setTimeout(() => {
              logout()
                .then(() => {
                  // 清除本地token
                  removeToken();
                  // 跳转到登录页面
                  router.push("/login");
                })
                .catch(() => {
                  // 即使退出登录失败，也清除token并跳转到登录页面
                  removeToken();
                  router.push("/login");
                });
            }, 1000);
          } else {
            message(res.msg || "密码修改失败", { type: "error" });
            loading.value = false;
          }
        })
        .catch(error => {
          message(error?.response?.data?.msg || error?.message || "密码修改失败", { type: "error" });
          loading.value = false;
        });
    }
  });
};

const onBack = () => {
  router.back();
};
</script>

<template>
  <div class="set-password-wrapper">
    <div class="set-password-container">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        size="large"
      >
        <h2 class="form-title">设置新密码</h2>
        
        <p class="form-tip">
          密码须至少包含数字、英文字母、符号中的两种;且长度不小于8位
        </p>

        <el-form-item :rules="passwordRules" prop="password" style="margin-bottom: 30px;">
          <el-input
            v-model="ruleForm.password"
            clearable
            :type="showPassword ? 'text' : 'password'"
            placeholder="输入新密码"
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

        <el-form-item :rules="confirmPasswordRules" prop="confirmPassword" style="margin-bottom: 30px;">
          <el-input
            v-model="ruleForm.confirmPassword"
            clearable
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="再次输入新密码"
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

        <el-form-item>
          <div class="button-group">
            <el-button
              class="cancel-button"
              size="large"
              @click="onBack"
            >
              返回
            </el-button>
            <el-button
              class="confirm-button"
              type="primary"
              size="large"
              :loading="loading"
              @click="onSubmit(ruleFormRef)"
            >
              确定
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.set-password-wrapper {
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

.set-password-container {
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
    
    .confirm-button {
      flex: 1;
    }
  }
}

@media screen and (max-width: 968px) {
  .set-password-wrapper {
    padding: 0 2rem;
  }
  
  .set-password-container {
    :deep(.el-form) {
      width: 100%;
      max-width: 420px;
    }
  }
}
</style>

