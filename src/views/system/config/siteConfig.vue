<script setup lang="ts">
defineOptions({
  name: "SiteConfig"
});
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElTable, ElTableColumn, ElIcon } from "element-plus";
import Delete from "~icons/ep/delete";
import Rank from "~icons/ep/rank";
import Plus from "~icons/ep/plus";

// 编辑模式状态
const isEditMode = ref(false);

// 表单数据
const formData = ref({
  site_name: "",
  filing: "",
  version: "",
  timezone: "",
  ip_blacklist: "",
  start_page: "",
  currency_symbol: "",
  monetary_symbol: "",
  admin_backend_domain: "",
  proxy_backend_domain: "",
  open_api_address: "",
  operations_backend_address: "",
  html_link_domain: ""
});

// 语言配置数据
const languageConfig = ref([
  { position: "back-end", language: "zh-cn" },
  { position: "back-end", language: "zh-cn" }
]);

// 原始数据（用于取消时恢复）
const originalFormData = ref({
  site_name: "",
  filing: "",
  version: "",
  timezone: "",
  ip_blacklist: "",
  start_page: "",
  currency_symbol: "",
  monetary_symbol: "",
  admin_backend_domain: "",
  proxy_backend_domain: "",
  open_api_address: "",
  operations_backend_address: "",
  html_link_domain: ""
});

const originalLanguageConfig = ref([
  { position: "back-end", language: "zh-cn" },
  { position: "back-end", language: "zh-cn" }
]);

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 获取配置数据
const getConfig = async () => {
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    // 模拟数据
    const data = {
      site_name: "GamePlus",
      filing: "备案号123456",
      version: "1.0.0",
      timezone: "UTC+8",
      ip_blacklist: "192.168.1.100,192.168.1.101",
      start_page: "/home",
      currency_symbol: "$",
      monetary_symbol: "USD",
      admin_backend_domain: "https://admin.example.com",
      proxy_backend_domain: "https://proxy.example.com",
      open_api_address: "https://api.example.com",
      operations_backend_address: "https://ops.example.com",
      html_link_domain: "https://www.example.com"
    };
    formData.value = { ...data };
    originalFormData.value = { ...data };
    // 语言配置数据
    languageConfig.value = [
      { position: "back-end", language: "zh-cn" },
      { position: "back-end", language: "zh-cn" }
    ];
    originalLanguageConfig.value = [
      { position: "back-end", language: "zh-cn" },
      { position: "back-end", language: "zh-cn" }
    ];
  } catch (error: any) {
    console.error("获取配置失败:", error);
    message(error?.message || "获取配置失败", { type: "error" });
  }
};

// 点击修改按钮
const handleEdit = () => {
  isEditMode.value = true;
  isSaveDisabled.value = false;
  // 保存当前数据作为原始数据
  originalFormData.value = { ...formData.value };
  originalLanguageConfig.value = JSON.parse(JSON.stringify(languageConfig.value));
};

// 保存配置
const handleSave = () => {
  showGoogleVerifyDialog.value = true;
  googleVerifyCode.value = "";
};

// 关闭谷歌验证码对话框
const handleCloseGoogleVerifyDialog = () => {
  showGoogleVerifyDialog.value = false;
  googleVerifyCode.value = "";
};

// 确认谷歌验证码
const handleConfirmGoogleVerify = async () => {
  if (!googleVerifyCode.value.trim()) {
    message("请输入谷歌验证码", { type: "warning" });
    return;
  }

  // 关闭验证码对话框
  showGoogleVerifyDialog.value = false;

  // 显示确认对话框
  try {
    await ElMessageBox.confirm(
      "确定要保存最新数据 ?",
      "保存",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    // 确认后发起保存请求
    await doSave();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("确认失败:", error);
    }
  }
};

// 执行保存操作
const doSave = async () => {
  try {
    // TODO: 对接实际API，传递 googleVerifyCode.value 和 languageConfig.value
    await new Promise(resolve => setTimeout(resolve, 500));
    message("保存成功", { type: "success" });
    isEditMode.value = false;
    isSaveDisabled.value = true;
    // 更新原始数据
    originalFormData.value = { ...formData.value };
    originalLanguageConfig.value = JSON.parse(JSON.stringify(languageConfig.value));
    googleVerifyCode.value = "";
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 取消修改
const handleCancel = () => {
  // 恢复原始数据
  formData.value = { ...originalFormData.value };
  languageConfig.value = JSON.parse(JSON.stringify(originalLanguageConfig.value));
  // 禁用表单
  isEditMode.value = false;
  isSaveDisabled.value = true;
};

// 添加语言配置行
const handleAddLanguageRow = () => {
  languageConfig.value.push({
    position: "",
    language: ""
  });
};

// 删除语言配置行
const handleDeleteLanguageRow = (index: number) => {
  languageConfig.value.splice(index, 1);
};

// 初始化加载数据
onMounted(() => {
  getConfig();
});
</script>

<template>
  <div class="site-config-container">
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="handleEdit" :disabled="isEditMode">
            修改
          </el-button>
        </div>
      </template>
      <el-form :model="formData" label-width="200px">
        <el-form-item label="站点名称">
          <el-input
            v-model="formData.site_name"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="备案">
          <el-input
            v-model="formData.filing"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="版本">
          <el-input
            v-model="formData.version"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="时区">
          <el-input
            v-model="formData.timezone"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="IP黑名单">
          <el-input
            v-model="formData.ip_blacklist"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">
            多个IP以英文逗号隔开
          </div>
        </el-form-item>

        <!-- 语言配置 -->
        <el-form-item label="语言配置">
          <div class="language-config-table">
            <el-table :data="languageConfig" border style="width: 100%">
              <el-table-column label="位置" width="200">
                <template #default="{ row, $index }">
                  <el-input
                    v-model="row.position"
                    :disabled="!isEditMode"
                    placeholder="请输入"
                  />
                </template>
              </el-table-column>
              <el-table-column label="语言" width="200">
                <template #default="{ row, $index }">
                  <el-input
                    v-model="row.language"
                    :disabled="!isEditMode"
                    placeholder="请输入"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" v-if="isEditMode">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    @click="handleDeleteLanguageRow($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button
              v-if="isEditMode"
              type="primary"
              link
              @click="handleAddLanguageRow"
              style="margin-top: 10px;"
            >
              <el-icon style="margin-right: 5px;"><Plus /></el-icon>
              追加
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="起始页">
          <el-input
            v-model="formData.start_page"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="币种符号">
          <el-input
            v-model="formData.currency_symbol"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="货币符号">
          <el-input
            v-model="formData.monetary_symbol"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="管理后台域名">
          <el-input
            v-model="formData.admin_backend_domain"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="代理后台域名">
          <el-input
            v-model="formData.proxy_backend_domain"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="开放API接口地址">
          <el-input
            v-model="formData.open_api_address"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="运营后台地址">
          <el-input
            v-model="formData.operations_backend_address"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="HTML链接域名">
          <el-input
            v-model="formData.html_link_domain"
            :disabled="!isEditMode"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSave"
            :disabled="isSaveDisabled"
          >
            保存
          </el-button>
          <el-button
            @click="handleCancel"
            :disabled="isSaveDisabled"
            style="margin-left: 10px"
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 谷歌验证码对话框 -->
    <el-dialog
      v-model="showGoogleVerifyDialog"
      title="保存"
      width="500px"
      :close-on-click-modal="false"
      @close="handleCloseGoogleVerifyDialog"
    >
      <div style="margin-bottom: 20px; color: #606266;">
        请输入谷歌验证码,验证成功后将进行保存
      </div>
      <el-form :model="{ code: googleVerifyCode }" label-width="80px">
        <el-form-item label="验证码">
          <el-input
            v-model="googleVerifyCode"
            placeholder="请输入谷歌验证码"
            @keyup.enter="handleConfirmGoogleVerify"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseGoogleVerifyDialog">取消</el-button>
          <el-button type="primary" @click="handleConfirmGoogleVerify">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.site-config-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.language-config-table {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
