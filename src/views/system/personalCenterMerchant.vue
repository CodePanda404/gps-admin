<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { message } from "@/utils/message";
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElImage, ElIcon, ElLink } from "element-plus";
import {
  getMerchantProfile,
  googleCheck,
  updateMerchantProfile,
  sendEmailCode,
  bindEmail,
  unbindGoogle,
  type MerchantProfileData
} from "@/api/user";
import User from "~icons/tdesign/user";
import Edit from "~icons/ep/edit";
import Keyhole from "~icons/ri/shield-keyhole-line";
import RiGoogleFill from "~icons/ri/google-fill";
import Plus from "~icons/ep/plus";

defineOptions({
  name: "PersonalCenterMerchant"
});

// 商户信息数据
const merchantInfo = ref<MerchantProfileData>({
  id: 0,
  gruop_name: "",
  username: "",
  nickname: "",
  email_hidden: "",
  email: "",
  type: 0,
  wallet_type: 0,
  google_status: 0,
  currency: null,
  category: null,
  api_key: null,
  api_secret: null,
  white_ip: null,
  callback_url: "",
  open_api_host: "",
  api_doc_url: "",
  transfer_api_doc_url: ""
});

// 谷歌验证码对话框相关
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");
const googleVerifyError = ref("");
const googleVerifyCallback = ref<(() => void) | null>(null);

// 显示API密钥对话框
const showApiSecretDialog = ref(false);

// API密钥数据
const apiSecretData = ref({
  apiGateway: "",
  apiKey: "",
  apiSecret: ""
});

// 显示API白名单编辑对话框
const showWhitelistEditDialog = ref(false);
const whitelistEditForm = ref({
  whitelist: ""
});

// 通用的打开谷歌验证码对话框函数
const openGoogleVerifyDialog = (callback: (googleCode: string) => void) => {
  googleVerifyCallback.value = callback as any;
  showGoogleVerifyDialog.value = true;
  googleVerifyCode.value = "";
  googleVerifyError.value = "";
};

// 关闭谷歌验证码对话框
const handleCloseGoogleVerifyDialog = () => {
  showGoogleVerifyDialog.value = false;
  googleVerifyCode.value = "";
  googleVerifyError.value = "";
  googleVerifyCallback.value = null;
};

// 确认谷歌验证码
const handleConfirmGoogleVerify = async () => {
  if (!googleVerifyCode.value.trim()) {
    googleVerifyError.value = "请输入谷歌验证码";
    return;
  }

  try {
    const res = await googleCheck({ google_code: googleVerifyCode.value });
    
    if (res.code === 0) {
      // 验证通过，关闭验证码对话框
      showGoogleVerifyDialog.value = false;
      const verifiedCode = googleVerifyCode.value;
      googleVerifyCode.value = "";
      googleVerifyError.value = "";
      
      // 执行回调函数，传递验证码
      if (googleVerifyCallback.value) {
        (googleVerifyCallback.value as (googleCode?: string) => void)(verifiedCode);
        googleVerifyCallback.value = null;
      }
    } else {
      googleVerifyError.value = res.msg || "验证码错误";
    }
  } catch (error: any) {
    console.error("验证失败:", error);
    googleVerifyError.value = error?.message || "验证失败";
  }
};

// 打开查看API密钥对话框（先显示谷歌验证码对话框）
const handleViewApiSecret = () => {
  openGoogleVerifyDialog(() => {
    showApiSecretDialog.value = true;
    // 从商户信息中获取API密钥数据
    apiSecretData.value = {
      apiGateway: merchantInfo.value.open_api_host || "",
      apiKey: merchantInfo.value.api_key || "未设置",
      apiSecret: merchantInfo.value.api_secret || "未设置"
    };
  });
};

// 关闭查看API密钥对话框
const handleCloseApiSecretDialog = () => {
  showApiSecretDialog.value = false;
};

// 存储谷歌验证码（用于提交时使用）
const savedGoogleCode = ref("");

// 打开API白名单编辑（先显示谷歌验证码对话框）
const handleEditWhitelist = () => {
  openGoogleVerifyDialog((googleCode: string) => {
    savedGoogleCode.value = googleCode;
    showWhitelistEditDialog.value = true;
    whitelistEditForm.value.whitelist = merchantInfo.value.white_ip || "";
  });
};

// 关闭API白名单编辑对话框
const handleCloseWhitelistEditDialog = () => {
  showWhitelistEditDialog.value = false;
  whitelistEditForm.value.whitelist = "";
  savedGoogleCode.value = "";
};

// 保存API白名单
const handleSaveWhitelist = async () => {
  if (!whitelistEditForm.value.whitelist.trim()) {
    message("请输入API白名单", { type: "warning" });
    return;
  }

  if (!savedGoogleCode.value) {
    message("请先进行谷歌验证", { type: "warning" });
    return;
  }

  try {
    const res = await updateMerchantProfile({
      white_ip: whitelistEditForm.value.whitelist,
      google_code: savedGoogleCode.value
    });

    if (res.code === 0) {
      message("保存成功", { type: "success" });
      merchantInfo.value.white_ip = whitelistEditForm.value.whitelist;
      savedGoogleCode.value = "";
      handleCloseWhitelistEditDialog();
      // 重新获取商户信息
      await getMerchantInfo();
    } else {
      message(res.msg || "保存失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};


// 回调地址编辑对话框
const showCallbackAddressDialog = ref(false);
const callbackAddressForm = ref({
  address: ""
});

// 存储回调地址的谷歌验证码
const savedCallbackGoogleCode = ref("");

// 打开回调地址编辑对话框
const handleEditCallbackAddress = () => {
  openGoogleVerifyDialog((googleCode: string) => {
    savedCallbackGoogleCode.value = googleCode;
    showCallbackAddressDialog.value = true;
    callbackAddressForm.value.address = merchantInfo.value.callback_url || "";
  });
};

// 关闭回调地址编辑对话框
const handleCloseCallbackAddressDialog = () => {
  showCallbackAddressDialog.value = false;
  callbackAddressForm.value.address = "";
  savedCallbackGoogleCode.value = "";
};

// 保存回调地址
const handleSaveCallbackAddress = async () => {
  if (!callbackAddressForm.value.address.trim()) {
    message("请输入回调地址", { type: "warning" });
    return;
  }

  if (!savedCallbackGoogleCode.value) {
    message("请先进行谷歌验证", { type: "warning" });
    return;
  }

  try {
    const res = await updateMerchantProfile({
      callback_url: callbackAddressForm.value.address,
      google_code: savedCallbackGoogleCode.value
    });

    if (res.code === 0) {
      message("保存成功", { type: "success" });
      merchantInfo.value.callback_url = callbackAddressForm.value.address;
      savedCallbackGoogleCode.value = "";
      handleCloseCallbackAddressDialog();
      // 重新获取商户信息
      await getMerchantInfo();
    } else {
      message(res.msg || "保存失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 存储个人信息编辑的谷歌验证码
const savedNicknameGoogleCode = ref("");

// 获取商户信息
const getMerchantInfo = async () => {
  try {
    const res = await getMerchantProfile();
    if (res.code === 0) {
      merchantInfo.value = res.data;
    } else {
      message(res.msg || "获取商户信息失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("获取商户信息失败:", error);
    message(error?.message || "获取商户信息失败", { type: "error" });
  }
};

// 个人信息编辑模式
const isEditMode = ref(false);
const originalNickname = ref("");
const personalFormData = ref({
  nickname: ""
});

// 点击修改按钮
const handleEditPersonalInfo = () => {
  isEditMode.value = true;
  originalNickname.value = merchantInfo.value.nickname;
  personalFormData.value.nickname = merchantInfo.value.nickname;
};

// 点击保存按钮
const handleSavePersonalInfo = async () => {
  if (!personalFormData.value.nickname.trim()) {
    message("昵称不能为空", { type: "warning" });
    return;
  }

  // 需要谷歌验证
  openGoogleVerifyDialog((googleCode: string) => {
    savedNicknameGoogleCode.value = googleCode;
    doSavePersonalInfo();
  });
};

// 执行保存个人信息
const doSavePersonalInfo = async () => {
  try {
    const res = await updateMerchantProfile({
      nickname: personalFormData.value.nickname,
      google_code: savedNicknameGoogleCode.value
    });

    if (res.code === 0) {
      message("保存成功", { type: "success" });
      merchantInfo.value.nickname = personalFormData.value.nickname;
      savedNicknameGoogleCode.value = "";
      isEditMode.value = false;
      // 重新获取商户信息
      await getMerchantInfo();
    } else {
      message(res.msg || "保存失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 点击取消按钮
const handleCancelPersonalInfo = () => {
  personalFormData.value.nickname = originalNickname.value;
  isEditMode.value = false;
  savedNicknameGoogleCode.value = "";
};

// 邮箱相关
const showChangeEmailDialog = ref(false);
const changeEmailForm = ref({
  email: "",
  emailCode: "",
  googleCode: ""
});
const emailCountdown = ref(0);
const emailTimer = ref<number | null>(null);
const emailLoading = ref(false);

// 格式化邮箱显示
const formattedEmail = computed(() => {
  const emailStr = merchantInfo.value.email;
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
    const res = await sendEmailCode({
      username: merchantInfo.value.username,
      email: changeEmailForm.value.email
    });

    if (res.code === 0) {
      message("验证码已发送", { type: "success" });
      startEmailCountdown();
    } else {
      message(res.msg || "发送验证码失败", { type: "error" });
    }
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
    email: merchantInfo.value.email || "",
    emailCode: "",
    googleCode: ""
  };
  // 如果已有邮箱，自动发送验证码
  if (merchantInfo.value.email) {
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

  if (merchantInfo.value.google_status === 1 && !changeEmailForm.value.googleCode) {
    message("请输入谷歌验证码", { type: "warning" });
    return;
  }

  try {
    const res = await bindEmail({
      username: merchantInfo.value.username,
      email: changeEmailForm.value.email,
      email_code: changeEmailForm.value.emailCode,
      google_code: changeEmailForm.value.googleCode || undefined
    });

    if (res.code === 0) {
      message("更改邮箱成功", { type: "success" });
      handleCloseChangeEmailDialog();
      // 重新获取商户信息
      await getMerchantInfo();
    } else {
      message(res.msg || "更改邮箱失败", { type: "error" });
    }
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
  secret: "",
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
    secret: "",
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
    merchantInfo.value.google_status = 1;
    message("绑定谷歌验证成功", { type: "success" });
    handleCloseBindGoogleDialog();
    // 重新获取商户信息
    await getMerchantInfo();
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

    const res = await unbindGoogle({
      google_code: unbindGoogleForm.value.verifyCode
    });

    if (res.code === 0) {
      message("解绑谷歌验证成功", { type: "success" });
      handleCloseUnbindGoogleDialog();
      // 重新获取商户信息
      await getMerchantInfo();
    } else {
      message(res.msg || "解绑谷歌验证失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("解绑谷歌验证失败:", error);
      message(error?.message || "解绑谷歌验证失败", { type: "error" });
    }
  }
};

// 初始化数据
onMounted(() => {
  getMerchantInfo();
  personalFormData.value.nickname = merchantInfo.value.nickname;
});

onUnmounted(() => {
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
    emailTimer.value = null;
  }
});
</script>

<template>
  <div class="personal-center-merchant-container">
    <!-- 第一个卡片：头像和昵称 -->
    <el-card shadow="never" style="margin: 20px">
      <div class="avatar-section">
        <div class="avatar-placeholder">
          <el-icon :size="24"><component :is="User" /></el-icon>
        </div>
        <div class="nickname-display">{{ merchantInfo.nickname }}</div>
      </div>
    </el-card>

    <!-- 个人信息卡片 -->
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <el-form
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
              @click="handleEditPersonalInfo"
            >
              修改
            </el-button>
            <template v-else>
              <el-button type="primary" @click="handleSavePersonalInfo">
                保存
              </el-button>
              <el-button @click="handleCancelPersonalInfo">
                取消
              </el-button>
            </template>
          </div>
        </el-form-item>
        <div style="width: 60%;">
          <el-form-item label="账号">
            <el-input
              :model-value="merchantInfo.username"
              disabled
              placeholder="账号"
            />
          </el-form-item>
          <el-form-item label="角色组">
            <el-input
              :model-value="merchantInfo.gruop_name"
              disabled
              placeholder="角色组"
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
                disabled
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
                :model-value="merchantInfo.google_status === 1 ? '已绑定' : '谷歌验证未绑定'"
                disabled
                style="flex: 1"
              />
              <el-button
                v-if="merchantInfo.google_status === 0"
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

    <!-- 商户信息卡片 -->
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <span>商户信息</span>
        </div>
      </template>
      <el-form label-width="150px">
        <div style="width: 60%;">
          <el-form-item label="单一钱包API文档链接">
            <el-link
              type="primary"
              :href="merchantInfo.api_doc_url"
              target="_blank"
              :underline="false"
              style="font-size: 14px;"
            >
              {{ merchantInfo.api_doc_url }}
            </el-link>
          </el-form-item>
          <el-form-item label="币种">
            <el-input
              :model-value="merchantInfo.currency || '未设置'"
              disabled
              placeholder="币种"
            />
          </el-form-item>
          <el-form-item label="开通游戏">
            <el-input
              :model-value="merchantInfo.category || '未设置'"
              disabled
              placeholder="开通游戏"
            />
          </el-form-item>
          <el-form-item label="API网关">
            <div style="display: flex; align-items: center; width: 100%;">
              <el-input
                :model-value="merchantInfo.open_api_host"
                disabled
                style="margin-right: 10px;"
              />
              <el-button
                type="primary"
                @click="handleViewApiSecret"
              >
                查看API 秘钥
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="API白名单">
            <div style="display: flex; align-items: flex-start; width: 100%;">
              <el-input
                :model-value="merchantInfo.white_ip || '未设置'"
                type="textarea"
                :rows="4"
                disabled
                placeholder="请输入"
                style="margin-right: 10px; flex: 1"
              />
              <el-button
                type="primary"
                @click="handleEditWhitelist"
              >
                更改
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="回调地址">
            <div style="display: flex; align-items: center; width: 100%;">
              <el-input
                :model-value="merchantInfo.callback_url || '未设置'"
                disabled
                style="margin-right: 10px;"
              />
              <el-button
                type="primary"
                @click="handleEditCallbackAddress"
              >
                更改
              </el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 谷歌验证码对话框 -->
    <el-dialog
      v-model="showGoogleVerifyDialog"
      title="谷歌验证"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseGoogleVerifyDialog"
    >
      <el-form :model="{ code: googleVerifyCode }" label-width="80">
        <el-form-item label="验证码">
          <el-input
            v-model="googleVerifyCode"
            placeholder="请输入谷歌验证码"
            clearable
            @keyup.enter="handleConfirmGoogleVerify"
          />
          <div v-if="googleVerifyError" class="error-message">
            {{ googleVerifyError }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseGoogleVerifyDialog">取消</el-button>
          <el-button type="primary" @click="handleConfirmGoogleVerify">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看API密钥对话框 -->
    <el-dialog
      v-model="showApiSecretDialog"
      title="API 秘钥"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseApiSecretDialog"
    >
      <el-form :model="apiSecretData" label-width="200px" label-position="top">
        <el-form-item label="API网关">
          <el-input
            :model-value="apiSecretData.apiGateway"
            disabled
            readonly
          />
        </el-form-item>
        <el-form-item label="API Key/operatorcode">
          <el-input
            :model-value="apiSecretData.apiKey"
            disabled
            readonly
          />
        </el-form-item>
        <el-form-item label="API Secret">
          <el-input
            :model-value="apiSecretData.apiSecret"
            disabled
            readonly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseApiSecretDialog">取消</el-button>
          <el-button type="primary" @click="handleCloseApiSecretDialog">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑API白名单对话框 -->
    <el-dialog
      v-model="showWhitelistEditDialog"
      title="修改API白名单"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseWhitelistEditDialog"
    >
      <el-form :model="whitelistEditForm">
        <span>请输入API白名单，多个请用英文符号逗号隔</span>
        <el-form-item>
          <el-input
            v-model="whitelistEditForm.whitelist"
            type="textarea"
            :rows="6"
            placeholder="请输入API白名单，多个请用英文符号逗号隔开"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseWhitelistEditDialog">取消</el-button>
          <el-button type="primary" @click="handleSaveWhitelist">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑回调地址对话框 -->
    <el-dialog
      v-model="showCallbackAddressDialog"
      title="编辑回调地址"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseCallbackAddressDialog"
    >
      <el-form :model="callbackAddressForm" label-width="100px">
        <el-form-item label="回调地址">
          <el-input
            v-model="callbackAddressForm.address"
            placeholder="请输入回调地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseCallbackAddressDialog">取消</el-button>
          <el-button type="primary" @click="handleSaveCallbackAddress">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>


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
          验证码已发送至 {{ formattedEmail || changeEmailForm.email }}，有效期10分钟
        </p>
        <p class="email-verify-warning">
          邮箱已停用?请联系管理员
        </p>
        <el-form :model="changeEmailForm">
          <el-form-item label="新邮箱">
            <el-input
              v-model="changeEmailForm.email"
              placeholder="请输入新邮箱"
              clearable
            />
          </el-form-item>
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
          <el-form-item v-if="merchantInfo.google_status === 1" label="谷歌验证码">
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
                >
                  复制
                </el-button>
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
.personal-center-merchant-container {
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

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
</style>
