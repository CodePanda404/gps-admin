<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElImage, ElIcon, ElLink } from "element-plus";
import User from "~icons/tdesign/user";

defineOptions({
  name: "PersonalCenterMerchant"
});

// 商户信息数据
const merchantInfo = ref({
  nickname: "商户名称",
  avatar: "",
  apiDocLink: "https://asdfghjkqrtyuio.com",
  currency: "PHP",
  game: "PANDA",
  apiGateway: "XXXXXXXXXXXXXXXXXX",
  apiSecret: "actual_secret_key_here",
  apiWhitelist: "",
  callbackAddress: "XXXXXXXXXXXXXXXXX",
  actualCallbackAddress: "https://actual-callback-url.com"
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
  apiGateway: "xxxxx",
  apiKey: "xxxxxxxxxxx",
  apiSecret: "xxxxxxxxxxxx"
});

// 显示API白名单编辑对话框
const showWhitelistEditDialog = ref(false);
const whitelistEditForm = ref({
  whitelist: ""
});

// 通用的打开谷歌验证码对话框函数
const openGoogleVerifyDialog = (callback: () => void) => {
  googleVerifyCallback.value = callback;
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

  // TODO: 验证谷歌验证码
  // 模拟验证
  if (googleVerifyCode.value !== "123456") {
    googleVerifyError.value = "验证码错误";
    return;
  }

  // 验证通过，关闭验证码对话框
  showGoogleVerifyDialog.value = false;
  googleVerifyCode.value = "";
  googleVerifyError.value = "";
  
  // 执行回调函数
  if (googleVerifyCallback.value) {
    googleVerifyCallback.value();
    googleVerifyCallback.value = null;
  }
};

// 打开查看API密钥对话框（先显示谷歌验证码对话框）
const handleViewApiSecret = () => {
  openGoogleVerifyDialog(() => {
    showApiSecretDialog.value = true;
    // TODO: 从API获取实际的密钥数据
    // 这里使用模拟数据
  });
};

// 关闭查看API密钥对话框
const handleCloseApiSecretDialog = () => {
  showApiSecretDialog.value = false;
};

// 打开API白名单编辑（先显示谷歌验证码对话框）
const handleEditWhitelist = () => {
  openGoogleVerifyDialog(() => {
    showWhitelistEditDialog.value = true;
    whitelistEditForm.value.whitelist = merchantInfo.value.apiWhitelist;
  });
};

// 关闭API白名单编辑对话框
const handleCloseWhitelistEditDialog = () => {
  showWhitelistEditDialog.value = false;
  whitelistEditForm.value.whitelist = "";
};

// 保存API白名单
const handleSaveWhitelist = async () => {
  if (!whitelistEditForm.value.whitelist.trim()) {
    message("请输入API白名单", { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    merchantInfo.value.apiWhitelist = whitelistEditForm.value.whitelist;
    message("保存成功", { type: "success" });
    handleCloseWhitelistEditDialog();
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

// 打开回调地址编辑对话框
const handleEditCallbackAddress = () => {
  showCallbackAddressDialog.value = true;
  callbackAddressForm.value.address = merchantInfo.value.actualCallbackAddress;
};

// 关闭回调地址编辑对话框
const handleCloseCallbackAddressDialog = () => {
  showCallbackAddressDialog.value = false;
  callbackAddressForm.value.address = "";
};

// 保存回调地址
const handleSaveCallbackAddress = async () => {
  if (!callbackAddressForm.value.address.trim()) {
    message("请输入回调地址", { type: "warning" });
    return;
  }

  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    merchantInfo.value.actualCallbackAddress = callbackAddressForm.value.address;
    merchantInfo.value.callbackAddress = "X".repeat(callbackAddressForm.value.address.length);
    message("保存成功", { type: "success" });
    handleCloseCallbackAddressDialog();
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 初始化数据
onMounted(() => {
  // TODO: 从API获取商户信息
});
</script>

<template>
  <div class="personal-center-merchant-container">
    <!-- 第一个卡片：头像和昵称 -->
    <el-card shadow="never" style="margin: 20px">
      <div class="avatar-section">
        <el-image
          v-if="merchantInfo.avatar"
          :src="merchantInfo.avatar"
          fit="cover"
          class="avatar-image"
        >
          <template #error>
            <div class="avatar-placeholder">
              <el-icon :size="24"><component :is="User" /></el-icon>
            </div>
          </template>
        </el-image>
        <div v-else class="avatar-placeholder">
          <el-icon :size="24"><component :is="User" /></el-icon>
        </div>
        <div class="nickname-display">{{ merchantInfo.nickname }}</div>
      </div>
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
              :href="merchantInfo.apiDocLink"
              target="_blank"
              :underline="false"
              style="font-size: 14px;"
            >
              {{ merchantInfo.apiDocLink }}
            </el-link>
          </el-form-item>
          <el-form-item label="币种">
            <el-input
              :model-value="merchantInfo.currency"
              disabled
              placeholder="币种"
            />
          </el-form-item>
          <el-form-item label="开通游戏">
            <el-input
              :model-value="merchantInfo.game"
              disabled
              placeholder="开通游戏"
            />
          </el-form-item>
          <el-form-item label="API网关">
            <div style="display: flex; align-items: center; width: 100%;">
              <el-input
                :model-value="merchantInfo.apiGateway"
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
                :model-value="merchantInfo.apiWhitelist || '未设置'"
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
                :model-value="merchantInfo.callbackAddress"
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
</style>
