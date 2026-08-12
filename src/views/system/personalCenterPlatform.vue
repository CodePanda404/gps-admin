<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElImage, ElIcon } from "element-plus";
import { sendEmailCode } from "@/api/user";
import User from "~icons/tdesign/user";
import Keyhole from "~icons/ri/shield-keyhole-line";
import RiGoogleFill from "~icons/ri/google-fill";
import Plus from "~icons/ep/plus";

defineOptions({
  name: "PersonalCenterPlatform"
});

// 国际化
const { t } = useI18n();

// 个人信息数据
const userInfo = ref({
  nickname: "管理员",
  username: "admin",
  department: "技术部",
  role: "超级管理员",
  avatar: "",
  email: "px*******@gmail.com",
  googleStatus: 0 // 0: 未绑定, 1: 已绑定
});

// 编辑模式
const isEditMode = ref(false);
const originalNickname = ref("");

// 个人信息表单
const personalFormRef = ref();
const personalFormData = ref({
  nickname: ""
});

// 点击修改按钮
const handleEdit = () => {
  isEditMode.value = true;
  originalNickname.value = userInfo.value.nickname;
  personalFormData.value.nickname = userInfo.value.nickname;
};

// 点击保存按钮
const handleSave = async () => {
  if (!personalFormData.value.nickname.trim()) {
    message(t("systemSettings.personalCenterPlatform.message.nicknameNotEmpty"), { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.nickname = personalFormData.value.nickname;
    message(t("systemSettings.personalCenterPlatform.message.saveSuccess"), { type: "success" });
    isEditMode.value = false;
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || t("systemSettings.personalCenterPlatform.message.saveFail"), { type: "error" });
  }
};

// 点击取消按钮
const handleCancel = () => {
  personalFormData.value.nickname = originalNickname.value;
  isEditMode.value = false;
};

// 邮箱相关
const showChangeEmailDialog = ref(false);
const changeEmailForm = ref({
  email: "",
  emailCode: "",
  googleCode: ""
});
const changeEmailFormRef = ref();
const emailCountdown = ref(0);
const emailTimer = ref<number | null>(null);
const emailLoading = ref(false);

// 格式化邮箱显示
const formattedEmail = computed(() => {
  const emailStr = userInfo.value.email;
  if (!emailStr) return "";
  
  const [localPart, domain] = emailStr.split("@");
  if (!localPart || !domain) return emailStr;
  
  if (localPart.length > 2) {
    return `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}@${domain}`;
  }
  return emailStr;
});

// 邮箱验证码倒计时
const emailCountdownText = computed(() => {
  if (emailCountdown.value > 0) {
    return t("systemSettings.personalCenterPlatform.message.emailCountdown", { seconds: emailCountdown.value });
  }
  return "";
});

const startEmailCountdown = () => {
  emailCountdown.value = 60;
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
  }
  emailTimer.value = window.setInterval(() => {
    if (emailCountdown.value > 0) {
      emailCountdown.value--;
    } else {
      if (emailTimer.value) {
        clearInterval(emailTimer.value);
        emailTimer.value = null;
      }
    }
  }, 1000);
};

// 发送邮箱验证码
const sendChangeEmailCode = async () => {
  if (emailCountdown.value > 0) return;
  
  if (!changeEmailForm.value.email) {
    message(t("systemSettings.personalCenterPlatform.message.inputEmail"), { type: "warning" });
    return;
  }

  emailLoading.value = true;
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message(t("systemSettings.personalCenterPlatform.message.emailCodeSent"), { type: "success" });
    startEmailCountdown();
  } catch (error: any) {
    console.error("发送验证码失败:", error);
    message(error?.message || t("systemSettings.personalCenterPlatform.message.sendEmailCodeFail"), { type: "error" });
  } finally {
    emailLoading.value = false;
  }
};

// 打开更改邮箱对话框
const handleChangeEmail = () => {
  showChangeEmailDialog.value = true;
  changeEmailForm.value = {
    email: userInfo.value.email || "",
    emailCode: "",
    googleCode: ""
  };
  // 如果已有邮箱，自动发送验证码
  if (userInfo.value.email) {
    setTimeout(() => {
      sendChangeEmailCode();
    }, 100);
  }
};

// 关闭更改邮箱对话框
const handleCloseChangeEmailDialog = () => {
  showChangeEmailDialog.value = false;
  changeEmailForm.value = {
    email: "",
    emailCode: "",
    googleCode: ""
  };
};

// 确认更改邮箱
const handleConfirmChangeEmail = async () => {
  if (!changeEmailForm.value.emailCode) {
    message(t("systemSettings.personalCenterPlatform.message.inputEmailCode"), { type: "warning" });
    return;
  }

  if (userInfo.value.googleStatus === 1 && !changeEmailForm.value.googleCode) {
    message(t("systemSettings.personalCenterPlatform.message.inputGoogleCode"), { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.email = changeEmailForm.value.email;
    message(t("systemSettings.personalCenterPlatform.message.changeEmailSuccess"), { type: "success" });
    handleCloseChangeEmailDialog();
  } catch (error: any) {
    console.error("更改邮箱失败:", error);
    message(error?.message || t("systemSettings.personalCenterPlatform.message.changeEmailFail"), { type: "error" });
  }
};

// 谷歌验证相关
const showBindGoogleDialog = ref(false);
const showUnbindGoogleDialog = ref(false);
const bindGoogleForm = ref({
  qrCode: "",
  secret: "asdfghjqwertyuizxc",
  verifyCode: ""
});
const unbindGoogleForm = ref({
  verifyCode: ""
});

// 打开绑定谷歌验证对话框
const handleBindGoogle = () => {
  showBindGoogleDialog.value = true;
  // TODO: 获取二维码和密钥
  bindGoogleForm.value = {
    qrCode: "https://via.placeholder.com/200",
    secret: "asdfghjqwertyuizxc",
    verifyCode: ""
  };
};

// 关闭绑定谷歌验证对话框
const handleCloseBindGoogleDialog = () => {
  showBindGoogleDialog.value = false;
  bindGoogleForm.value = {
    qrCode: "",
    secret: "",
    verifyCode: ""
  };
};

// 复制密钥
const handleCopySecret = () => {
  navigator.clipboard.writeText(bindGoogleForm.value.secret).then(() => {
    message(t("systemSettings.personalCenterPlatform.message.secretCopied"), { type: "success" });
  });
};

// 确认绑定谷歌验证
const handleConfirmBindGoogle = async () => {
  if (!bindGoogleForm.value.verifyCode) {
    message(t("systemSettings.personalCenterPlatform.message.inputVerifyCode"), { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.googleStatus = 1;
    message(t("systemSettings.personalCenterPlatform.message.bindGoogleSuccess"), { type: "success" });
    handleCloseBindGoogleDialog();
  } catch (error: any) {
    console.error("绑定谷歌验证失败:", error);
    message(error?.message || t("systemSettings.personalCenterPlatform.message.bindGoogleFail"), { type: "error" });
  }
};

// 打开解绑谷歌验证对话框
const handleUnbindGoogle = () => {
  showUnbindGoogleDialog.value = true;
  unbindGoogleForm.value = {
    verifyCode: ""
  };
};

// 关闭解绑谷歌验证对话框
const handleCloseUnbindGoogleDialog = () => {
  showUnbindGoogleDialog.value = false;
  unbindGoogleForm.value = {
    verifyCode: ""
  };
};

// 确认解绑谷歌验证
const handleConfirmUnbindGoogle = async () => {
  if (!unbindGoogleForm.value.verifyCode) {
    message(t("systemSettings.personalCenterPlatform.message.inputGoogleCode"), { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(
      t("systemSettings.personalCenterPlatform.message.unbindWarning"),
      t("systemSettings.personalCenterPlatform.unbind.title"),
      {
        confirmButtonText: t("systemSettings.personalCenterPlatform.buttons.confirmUnbind"),
        cancelButtonText: t("systemSettings.personalCenterPlatform.buttons.cancel"),
        type: "warning"
      }
    );

    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.googleStatus = 0;
    message(t("systemSettings.personalCenterPlatform.message.unbindGoogleSuccess"), { type: "success" });
    handleCloseUnbindGoogleDialog();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("解绑谷歌验证失败:", error);
      message(error?.message || t("systemSettings.personalCenterPlatform.message.unbindGoogleFail"), { type: "error" });
    }
  }
};

// 初始化数据
onMounted(() => {
  // TODO: 从API获取用户信息
  personalFormData.value.nickname = userInfo.value.nickname;
});

onUnmounted(() => {
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
    emailTimer.value = null;
  }
});
</script>

<template>
  <div class="personal-center-platform-container">
    <!-- 第一个卡片：头像和昵称 -->
    <el-card shadow="never" style="margin: 20px">
      <div class="avatar-section">
        <el-image
          v-if="userInfo.avatar"
          :src="userInfo.avatar"
          fit="cover"
          class="avatar-image"
        >
          <template #error>
            <div class="avatar-placeholder">
              <el-icon :size="30"><component :is="User" /></el-icon>
            </div>
          </template>
        </el-image>
         <div v-else class="avatar-placeholder">
           <el-icon :size="24"><component :is="User" /></el-icon>
         </div>
        <div class="nickname-display">{{ userInfo.nickname }}</div>
      </div>
    </el-card>

    <!-- 第二个卡片：个人信息 -->
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <span>{{ t("systemSettings.personalCenterPlatform.personalInfo.title") }}</span>
        </div>
      </template>
      <el-form
        ref="personalFormRef"
        :model="personalFormData"
        label-width="100px"
      >
        <el-form-item :label="t('systemSettings.personalCenterPlatform.personalInfo.nickname')">
          <div style="display: flex; align-items: center; width: 62%;">
            <el-input
              v-model="personalFormData.nickname"
              :disabled="!isEditMode"
              :placeholder="t('systemSettings.personalCenterPlatform.personalInfo.nicknamePlaceholder')"
              style="margin-right: 10px;"
            />
            <el-button
              v-if="!isEditMode"
              type="primary"
              @click="handleEdit"
            >
              {{ t("systemSettings.personalCenterPlatform.buttons.edit") }}
            </el-button>
            <template v-else>
              <el-button type="primary" @click="handleSave">
                {{ t("systemSettings.personalCenterPlatform.buttons.save") }}
              </el-button>
              <el-button @click="handleCancel">
                {{ t("systemSettings.personalCenterPlatform.buttons.cancel") }}
              </el-button>
            </template>
          </div>
        </el-form-item>
        <div style="width: 60%;">
          <el-form-item :label="t('systemSettings.personalCenterPlatform.personalInfo.username')">
          <el-input
            :model-value="userInfo.username"
            disabled
            :placeholder="t('systemSettings.personalCenterPlatform.personalInfo.username')"
          />
        </el-form-item>
        <el-form-item :label="t('systemSettings.personalCenterPlatform.personalInfo.department')">
          <el-input
            :model-value="userInfo.department"
            disabled
            :placeholder="t('systemSettings.personalCenterPlatform.personalInfo.department')"
          />
        </el-form-item>
        <el-form-item :label="t('systemSettings.personalCenterPlatform.personalInfo.role')">
          <el-input
            :model-value="userInfo.role"
            disabled
            :placeholder="t('systemSettings.personalCenterPlatform.personalInfo.role')"
          />
        </el-form-item>
        </div>
        
      </el-form>
    </el-card>

    <!-- 安全信息卡片 -->
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <span>{{ t("systemSettings.personalCenterPlatform.securityInfo.title") }}</span>
        </div>
      </template>
      <el-form
        label-width="100px"
      >
        <div style="width: 60%;">
          <el-form-item :label="t('systemSettings.personalCenterPlatform.securityInfo.email')">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <el-input
                :model-value="formattedEmail || t('systemSettings.personalCenterPlatform.notBound')"
                :placeholder="t('placeholder.input')"
                style="flex: 1"
              />
              <el-button
                type="primary"
                @click="handleChangeEmail"
              >
                {{ t("systemSettings.personalCenterPlatform.buttons.change") }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="t('systemSettings.personalCenterPlatform.securityInfo.googleVerify')">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <el-input
                :model-value="userInfo.googleStatus === 1 ? t('systemSettings.personalCenterPlatform.bound') : t('systemSettings.personalCenterPlatform.googleNotBound')"
                disabled
                style="flex: 1"
              />
              <el-button
                v-if="userInfo.googleStatus === 0"
                type="primary"
                @click="handleBindGoogle"
              >
                {{ t("systemSettings.personalCenterPlatform.buttons.bind") }}
              </el-button>
              <el-button
                v-else
                type="primary"
                @click="handleUnbindGoogle"
              >
                {{ t("systemSettings.personalCenterPlatform.buttons.unbind") }}
              </el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 更改邮箱对话框 -->
    <el-dialog
      v-model="showChangeEmailDialog"
      :title="t('systemSettings.personalCenterPlatform.changeEmail.title')"
      width="480px"
      :close-on-click-modal="false"
      @close="handleCloseChangeEmailDialog"
    >
      <div class="email-verify-content">
        <p class="email-verify-tip">
          {{ t("systemSettings.personalCenterPlatform.changeEmail.tip", { email: formattedEmail }) }}
        </p>
        <p class="email-verify-warning">
          {{ t("systemSettings.personalCenterPlatform.changeEmail.warning") }}
        </p>
        <el-form
          ref="changeEmailFormRef"
          :model="changeEmailForm"
        >
          <el-form-item :label="t('systemSettings.personalCenterPlatform.changeEmail.verifyCode')">
            <el-input
              v-model="changeEmailForm.emailCode"
              :placeholder="t('systemSettings.personalCenterPlatform.changeEmail.verifyCodePlaceholder')"
              clearable
            />
            <div v-if="emailCountdownText" class="countdown-text">
              {{ emailCountdownText }}
            </div>
            <div v-else class="resend-text">
              <el-button
                link
                type="primary"
                size="small"
                @click="sendChangeEmailCode"
                :loading="emailLoading"
              >
                {{ t("systemSettings.personalCenterPlatform.changeEmail.resendCode") }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="userInfo.googleStatus === 1" :label="t('systemSettings.personalCenterPlatform.changeEmail.googleCode')">
            <el-input
              v-model="changeEmailForm.googleCode"
              :placeholder="t('systemSettings.personalCenterPlatform.changeEmail.googleCodePlaceholder')"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseChangeEmailDialog">{{ t("systemSettings.personalCenterPlatform.buttons.back") }}</el-button>
          <el-button type="primary" @click="handleConfirmChangeEmail">
            {{ t("systemSettings.personalCenterPlatform.buttons.next") }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 绑定谷歌验证对话框 -->
    <el-dialog
      v-model="showBindGoogleDialog"
      :title="t('systemSettings.personalCenterPlatform.bindGoogle.title')"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseBindGoogleDialog"
    >
      <div class="bind-google-content">
        <div class="step-section">
          <h3>{{ t("systemSettings.personalCenterPlatform.bindGoogle.step1") }}</h3>
          <div class="download-buttons">
            <el-button type="success">
              <el-icon><component :is="Plus" /></el-icon>
              <span style="margin-left: 5px;">{{ t("systemSettings.personalCenterPlatform.bindGoogle.androidDownload") }}</span>
            </el-button>
            <el-button type="primary">
              <el-icon><component :is="Plus" /></el-icon>
              <span style="margin-left: 5px;">{{ t("systemSettings.personalCenterPlatform.bindGoogle.iosDownload") }}</span>
            </el-button>
          </div>
        </div>
        <div class="step-section">
          <h3>{{ t("systemSettings.personalCenterPlatform.bindGoogle.step2") }}</h3>
          <div class="qr-section">
            <div class="qr-code-wrapper">
              <el-image
                v-if="bindGoogleForm.qrCode"
                :src="bindGoogleForm.qrCode"
                fit="contain"
                style="width: 200px; height: 200px"
              />
            </div>
            <div class="secret-section">
              <div class="secret-label">{{ t("systemSettings.personalCenterPlatform.bindGoogle.manualInput") }}</div>
              <div class="secret-input-wrapper">
                <el-input
                  :model-value="bindGoogleForm.secret"
                  readonly
                  style="flex: 1"
                />
                <el-button
                  type="primary"
                  @click="handleCopySecret"
                >
                  {{ t("systemSettings.personalCenterPlatform.buttons.copy") }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="step-section">
          <h3>{{ t("systemSettings.personalCenterPlatform.bindGoogle.step3") }}</h3>
          <el-form-item :label="t('systemSettings.personalCenterPlatform.bindGoogle.verifyCode')">
            <el-input
              v-model="bindGoogleForm.verifyCode"
              :placeholder="t('systemSettings.personalCenterPlatform.bindGoogle.verifyCodePlaceholder')"
              clearable
            />
          </el-form-item>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseBindGoogleDialog">{{ t("systemSettings.personalCenterPlatform.buttons.back") }}</el-button>
          <el-button type="primary" @click="handleConfirmBindGoogle">
            {{ t("systemSettings.personalCenterPlatform.buttons.confirmBind") }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 解绑谷歌验证对话框 -->
    <el-dialog
      v-model="showUnbindGoogleDialog"
      :title="t('systemSettings.personalCenterPlatform.unbind.title')"
      width="480px"
      :close-on-click-modal="false"
      @close="handleCloseUnbindGoogleDialog"
    >
      <div class="unbind-google-content">
        <p class="unbind-warning">
          {{ t("systemSettings.personalCenterPlatform.unbind.warning") }}
        </p>
        <el-form-item :label="t('systemSettings.personalCenterPlatform.unbind.verifyCode')">
          <el-input
            v-model="unbindGoogleForm.verifyCode"
            :placeholder="t('systemSettings.personalCenterPlatform.unbind.verifyCodePlaceholder')"
            clearable
          />
        </el-form-item>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseUnbindGoogleDialog">{{ t("systemSettings.personalCenterPlatform.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleConfirmUnbindGoogle">
            {{ t("systemSettings.personalCenterPlatform.buttons.confirmUnbind") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.personal-center-platform-container {
  width: 100%;
}

.avatar-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px 20px;
  gap: 15px;
}

.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  flex-shrink: 0;
}

.nickname-display {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.card-header {
  font-size: 16px;
  font-weight: 500;
}


.email-verify-content {
  .email-verify-tip {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .email-verify-warning {
    font-size: 12px;
    color: #909399;
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

.bind-google-content {
  .step-section {
    margin-bottom: 30px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 15px;
      color: #303133;
    }

    .download-buttons {
      display: flex;
      gap: 10px;
    }

    .qr-section {
      display: flex;
      gap: 30px;
      align-items: flex-start;

      .qr-code-wrapper {
        width: 200px;
        height: 200px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f7fa;
      }

      .secret-section {
        flex: 1;

        .secret-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 10px;
        }

        .secret-input-wrapper {
          display: flex;
          gap: 10px;
          align-items: center;
        }
      }
    }
  }
}

.unbind-google-content {
  .unbind-warning {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
