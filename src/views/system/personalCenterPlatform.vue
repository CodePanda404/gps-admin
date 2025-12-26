<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
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
    message("昵称不能为空", { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.nickname = personalFormData.value.nickname;
    message("保存成功", { type: "success" });
    isEditMode.value = false;
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
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
    return `${emailCountdown.value}秒后可重新获取验证码`;
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
    message("请输入邮箱", { type: "warning" });
    return;
  }

  emailLoading.value = true;
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("验证码已发送", { type: "success" });
    startEmailCountdown();
  } catch (error: any) {
    console.error("发送验证码失败:", error);
    message(error?.message || "发送验证码失败", { type: "error" });
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
    message("请输入邮箱验证码", { type: "warning" });
    return;
  }

  if (userInfo.value.googleStatus === 1 && !changeEmailForm.value.googleCode) {
    message("请输入谷歌验证码", { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.email = changeEmailForm.value.email;
    message("更改邮箱成功", { type: "success" });
    handleCloseChangeEmailDialog();
  } catch (error: any) {
    console.error("更改邮箱失败:", error);
    message(error?.message || "更改邮箱失败", { type: "error" });
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
    message("密钥已复制", { type: "success" });
  });
};

// 确认绑定谷歌验证
const handleConfirmBindGoogle = async () => {
  if (!bindGoogleForm.value.verifyCode) {
    message("请输入验证码", { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.googleStatus = 1;
    message("绑定谷歌验证成功", { type: "success" });
    handleCloseBindGoogleDialog();
  } catch (error: any) {
    console.error("绑定谷歌验证失败:", error);
    message(error?.message || "绑定谷歌验证失败", { type: "error" });
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
    message("请输入谷歌验证码", { type: "warning" });
    return;
  }

  try {
    await ElMessageBox.confirm(
      "解绑安全系数将降低,请谨慎解绑。",
      "解绑确认",
      {
        confirmButtonText: "确认解绑",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    userInfo.value.googleStatus = 0;
    message("解绑谷歌验证成功", { type: "success" });
    handleCloseUnbindGoogleDialog();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("解绑谷歌验证失败:", error);
      message(error?.message || "解绑谷歌验证失败", { type: "error" });
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
          <span>个人信息</span>
        </div>
      </template>
      <el-form
        ref="personalFormRef"
        :model="personalFormData"
        label-width="100px"
      >
        <el-form-item label="昵称">
          <div style="display: flex; align-items: center; width: 62%;">
            <el-input
              v-model="personalFormData.nickname"
              :disabled="!isEditMode"
              placeholder="请输入昵称"
              style="margin-right: 10px;"
            />
            <el-button
              v-if="!isEditMode"
              type="primary"
              @click="handleEdit"
            >
              修改
            </el-button>
            <template v-else>
              <el-button type="primary" @click="handleSave">
                保存
              </el-button>
              <el-button @click="handleCancel">
                取消
              </el-button>
            </template>
          </div>
        </el-form-item>
        <div style="width: 60%;">
          <el-form-item label="账号">
          <el-input
            :model-value="userInfo.username"
            disabled
            placeholder="账号"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-input
            :model-value="userInfo.department"
            disabled
            placeholder="部门"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-input
            :model-value="userInfo.role"
            disabled
            placeholder="角色"
          />
        </el-form-item>
        </div>
        
      </el-form>
    </el-card>

    <!-- 安全信息卡片 -->
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <span>安全信息</span>
        </div>
      </template>
      <el-form
        label-width="100px"
      >
        <div style="width: 60%;">
          <el-form-item label="邮箱">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <el-input
                :model-value="formattedEmail || '未绑定'"
                placeholder="请输入内容"
                style="flex: 1"
              />
              <el-button
                type="primary"
                @click="handleChangeEmail"
              >
                更改
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="谷歌验证">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <el-input
                :model-value="userInfo.googleStatus === 1 ? '已绑定' : '谷歌验证未绑定'"
                disabled
                style="flex: 1"
              />
              <el-button
                v-if="userInfo.googleStatus === 0"
                type="primary"
                @click="handleBindGoogle"
              >
                绑定
              </el-button>
              <el-button
                v-else
                type="primary"
                @click="handleUnbindGoogle"
              >
                解绑
              </el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 更改邮箱对话框 -->
    <el-dialog
      v-model="showChangeEmailDialog"
      title="输入邮箱验证码"
      width="480px"
      :close-on-click-modal="false"
      @close="handleCloseChangeEmailDialog"
    >
      <div class="email-verify-content">
        <p class="email-verify-tip">
          验证码已发送至 {{ formattedEmail }}，有效期10分钟
        </p>
        <p class="email-verify-warning">
          邮箱已停用?请联系管理员
        </p>
        <el-form
          ref="changeEmailFormRef"
          :model="changeEmailForm"
        >
          <el-form-item label="验证码">
            <el-input
              v-model="changeEmailForm.emailCode"
              placeholder="请输入验证码"
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
                重新获取验证码
              </el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="userInfo.googleStatus === 1" label="验证码">
            <el-input
              v-model="changeEmailForm.googleCode"
              placeholder="请输入谷歌验证码"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseChangeEmailDialog">返回</el-button>
          <el-button type="primary" @click="handleConfirmChangeEmail">
            下一步
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 绑定谷歌验证对话框 -->
    <el-dialog
      v-model="showBindGoogleDialog"
      title="设置谷歌验证器"
      width="600px"
      :close-on-click-modal="false"
      @close="handleCloseBindGoogleDialog"
    >
      <div class="bind-google-content">
        <div class="step-section">
          <h3>第一步: 下载Google Authenticator应用</h3>
          <div class="download-buttons">
            <el-button type="success">
              <el-icon><component :is="Plus" /></el-icon>
              <span style="margin-left: 5px;">Android 下载</span>
            </el-button>
            <el-button type="primary">
              <el-icon><component :is="Plus" /></el-icon>
              <span style="margin-left: 5px;">iOS 下载</span>
            </el-button>
          </div>
        </div>
        <div class="step-section">
          <h3>第二步: 扫描二维码或手动输入密钥</h3>
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
              <div class="secret-label">手动输入密钥:</div>
              <div class="secret-input-wrapper">
                <el-input
                  :model-value="bindGoogleForm.secret"
                  readonly
                  style="flex: 1"
                />
                <el-button
                  type="primary"
                  @click="handleCopySecret"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="step-section">
          <h3>第三步: 输入验证码</h3>
          <el-form-item label="验证码">
            <el-input
              v-model="bindGoogleForm.verifyCode"
              placeholder="请输入验证码"
              clearable
            />
          </el-form-item>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseBindGoogleDialog">返回</el-button>
          <el-button type="primary" @click="handleConfirmBindGoogle">
            确认绑定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 解绑谷歌验证对话框 -->
    <el-dialog
      v-model="showUnbindGoogleDialog"
      title="解绑谷歌验证"
      width="480px"
      :close-on-click-modal="false"
      @close="handleCloseUnbindGoogleDialog"
    >
      <div class="unbind-google-content">
        <p class="unbind-warning">
          解绑安全系数将降低,请谨慎解绑。
        </p>
        <el-form-item label="验证码">
          <el-input
            v-model="unbindGoogleForm.verifyCode"
            placeholder="请输入谷歌验证码"
            clearable
          />
        </el-form-item>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseUnbindGoogleDialog">取消</el-button>
          <el-button type="primary" @click="handleConfirmUnbindGoogle">
            确认解绑
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
