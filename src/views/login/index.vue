<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { ref, reactive, toRaw, computed } from "vue";
import { debounce } from "@pureadmin/utils";
import PasswordRecovery from "./components/PasswordRecovery.vue";
import EmailVerification from "./components/EmailVerification.vue";
import SetNewPassword from "./components/SetNewPassword.vue";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { proxy } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import LaySidebarFullScreen from "@/layout/components/lay-sidebar/components/SidebarFullScreen.vue";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import globalization from '~icons/tabler/world';
import Lock from '~icons/tdesign/lock-on';
import Check from "~icons/ep/check";
import User from '~icons/tdesign/user';
import RiGoogleFill from '~icons/ri/google-fill';

defineOptions({
  name: "Login"
});

const router = useRouter();
const title = ref("GamePlus 总控")
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();
const imgCode = ref("");
const checked = ref(false);
const currentPage = computed(() => {
  return useUserStoreHook().currentPage;
});


const { initStorage } = useLayout();
initStorage();

const { t } = useI18n();
const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const {  getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

const ruleForm = reactive({
  username: "",
  password: "",
  googleVerifyCode: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password,
          google_code: ruleForm.googleVerifyCode
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message(res.message || t("login.loginSuccess"), { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message(res.message || t("login.loginFail"), { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});
</script>

<template>
  <div class="select-none">
    <!-- 顶部栏（logo + 功能按钮） -->
    <div class="navbar">
      <div class="navbar-left">
        <img
          :src="overallStyle.valueOf() ? '/src/assets/login/logo-dark.png' : '/src/assets/login/logo.png'"
          class="logo-img" 
          alt="GamePlus Logo"
        />
      </div>
      <div class="navbar-right">
        <el-dropdown trigger="click">
          <globalization class="hover:text-primary hover:bg-[transparent]! w-[20px] h-[20px] ml-1.5 cursor-pointer outline-hidden duration-300" />
                  <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:text-white!', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                v-show="locale === 'zh'"
                class="check-zh"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:text-white!', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
        </el-dropdown>
        <LaySidebarFullScreen class="hover:text-primary hover:bg-[transparent]! w-[20px] h-[20px] ml-1.5 cursor-pointer outline-hidden duration-300" id="full-screen" trigger="click" style="margin-left: 20px; margin-top: 2px;"/>
        <el-switch
          v-model="dataTheme"
          inline-prompt
          :active-icon="dayIcon"
          :inactive-icon="darkIcon"
          @change="dataThemeChange"
          style="margin-left: 20px;"
        />
      </div>
    </div>
    <div class="login-container">
      <!-- 登录页面 -->
      <template v-if="currentPage === 0">
        <div class="img">
          <component :is="toRaw(proxy)" />
        </div>
        <div class="login-box">
          <div class="login-form">
            <div class="login-outline"> 
              <h1 class="outline-hidden" style="margin-bottom: 25px;">{{ title }}</h1>
            </div>
            <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="loginRules"
              size="large"
            >
            <!-- 账号 -->
              <Motion :delay="100" style="margin-bottom: 40px;">
                <el-form-item
                  :rules="[
                    {
                      required: true,
                      message: transformI18n($t('login.usernameReg')),
                      trigger: 'blur'
                    }
                  ]"
                  prop="username"
                >
                  <el-input
                    v-model="ruleForm.username"
                    clearable
                    :placeholder="t('login.usernameReg')"
                    :prefix-icon="useRenderIcon(User)"
                  />
                </el-form-item>
              </Motion>
              <!-- 密码 -->
              <Motion :delay="150" style="margin-bottom: 40px;">
                <el-form-item
                :rules="[
                    {
                      required: true,
                      message: transformI18n($t('login.passwordReg')),
                      trigger: 'blur'
                    }
                  ]"
                  prop="password">
                  <el-input
                    v-model="ruleForm.password"
                    clearable
                    show-password
                    :placeholder="t('login.passwordReg')"
                    :prefix-icon="useRenderIcon(Lock)"
                  />
                </el-form-item>
              </Motion>
              <!-- 谷歌验证码 -->
              <Motion :delay="150" style="margin-bottom: 30px;">
                <el-form-item>
                  <el-input
                    v-model="ruleForm.googleVerifyCode"
                    clearable
                    :placeholder="t('login.googleVerifyCodeReg')"
                    :prefix-icon="useRenderIcon(RiGoogleFill)"
                  >
                    <template v-slot:append>
                      <ReImageVerify v-model:code="imgCode" />
                    </template>
                  </el-input>
                </el-form-item>
              </Motion>
              <Motion :delay="250">
                <el-form-item>
                  <div class="w-full h-[20px] flex justify-between items-center">
                    <el-checkbox v-model="checked">
                      <span class="flex">
                        {{ t("login.remember") }}
                      </span>
                    </el-checkbox>
                    <el-button
                      link
                      type="primary"
                      @click="useUserStoreHook().SET_CURRENTPAGE(1)"
                    >
                      {{ t("login.forget") }}
                    </el-button>
                  </div>
                </el-form-item>
              </Motion>
              <Motion :delay="250">
                <el-button
                  class="w-full mt-4!"
                  size="large"
                  type="primary"
                  :loading="loading"
                  :disabled="disabled"
                  @click="onLogin(ruleFormRef)"
                >
                  {{ t("login.login") }}
                </el-button>
              </Motion>
            </el-form>
          </div>
        </div>
      </template>
      <!-- 找回密码相关页面 -->
      <template v-else>
        <div class="password-recovery-container">
          <PasswordRecovery v-if="currentPage === 1" />
          <EmailVerification v-if="currentPage === 2" />
          <SetNewPassword v-if="currentPage === 3" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
</style>
