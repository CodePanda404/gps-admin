<script setup lang="ts">
defineOptions({
  name: "SiteConfig"
});
import { ref, watch } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton, ElDialog, ElMessageBox, ElTable, ElTableColumn, ElIcon } from "element-plus";
import { saveSystemConfig } from "@/api/system";
import type { ConfigGroup } from "@/api/system";
import Delete from "~icons/ep/delete";
import Rank from "~icons/ep/rank";
import Plus from "~icons/ep/plus";

// Props
const props = defineProps<{
  configGroup: ConfigGroup;
}>();

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

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

// 从后端数据初始化表单
const initFormData = () => {
  if (!props.configGroup || !props.configGroup.list) return;
  
  // 遍历后端返回的配置项，映射到前端字段
  props.configGroup.list.forEach((item) => {
    switch (item.name) {
      case "name":
        formData.value.site_name = item.value ? String(item.value) : "";
        break;
      case "beian":
        formData.value.filing = item.value ? String(item.value) : "";
        break;
      case "version":
        formData.value.version = item.value ? String(item.value) : "";
        break;
      case "timezone":
        formData.value.timezone = item.value ? String(item.value) : "";
        break;
      case "forbiddenip":
        formData.value.ip_blacklist = item.value ? String(item.value) : "";
        break;
      case "fixedpage":
        formData.value.start_page = item.value ? String(item.value) : "";
        break;
      case "currency":
        formData.value.currency_symbol = item.value ? String(item.value) : "";
        break;
      case "currency_code":
        formData.value.monetary_symbol = item.value ? String(item.value) : "";
        break;
      case "admin_domain":
        formData.value.admin_backend_domain = item.value ? String(item.value) : "";
        break;
      case "agent_domain":
        formData.value.proxy_backend_domain = item.value ? String(item.value) : "";
        break;
      case "languages":
        // languages是array类型，需要解析JSON
        try {
          const langValue = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
          if (langValue && typeof langValue === "object") {
            languageConfig.value = Object.keys(langValue).map(key => ({
              position: key,
              language: langValue[key]
            }));
          }
        } catch {
          // 解析失败，保持默认值
        }
        break;
    }
  });
  
  // 保存原始数据
  originalFormData.value = { ...formData.value };
  originalLanguageConfig.value = JSON.parse(JSON.stringify(languageConfig.value));
};

// 监听配置组变化
watch(() => props.configGroup, () => {
  if (props.configGroup && props.configGroup.list) {
    initFormData();
  }
}, { immediate: true, deep: true });

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
    // 准备保存数据，将前端字段映射回后端字段名
    const saveData: Record<string, any> = {};
    
    // 遍历后端配置项，找到对应的字段并保存
    props.configGroup.list.forEach((item) => {
      switch (item.name) {
        case "name":
          saveData[item.name] = formData.value.site_name;
          break;
        case "beian":
          saveData[item.name] = formData.value.filing;
          break;
        case "version":
          saveData[item.name] = formData.value.version;
          break;
        case "timezone":
          saveData[item.name] = formData.value.timezone;
          break;
        case "forbiddenip":
          saveData[item.name] = formData.value.ip_blacklist;
          break;
        case "fixedpage":
          saveData[item.name] = formData.value.start_page;
          break;
        case "currency":
          saveData[item.name] = formData.value.currency_symbol;
          break;
        case "currency_code":
          saveData[item.name] = formData.value.monetary_symbol;
          break;
        case "admin_domain":
          saveData[item.name] = formData.value.admin_backend_domain;
          break;
        case "agent_domain":
          saveData[item.name] = formData.value.proxy_backend_domain;
          break;
        case "languages":
          // 将语言配置转换为JSON字符串
          const langObj: Record<string, string> = {};
          languageConfig.value.forEach(lang => {
            if (lang.position && lang.language) {
              langObj[lang.position] = lang.language;
            }
          });
          saveData[item.name] = JSON.stringify(langObj);
          break;
      }
    });

    const res = await saveSystemConfig({
      group: props.configGroup.name,
      data: saveData,
      google_code: googleVerifyCode.value
    });

    if (res.code === 0) {
      message("保存成功", { type: "success" });
      isEditMode.value = false;
      isSaveDisabled.value = true;
      // 更新原始数据
      originalFormData.value = { ...formData.value };
      originalLanguageConfig.value = JSON.parse(JSON.stringify(languageConfig.value));
      googleVerifyCode.value = "";
      // 触发刷新
      emit("refresh");
    } else {
      message(res.msg || "保存失败", { type: "error" });
    }
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
