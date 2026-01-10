<script setup lang="ts">
import { ref, watch } from "vue";
defineOptions({
  name: "GameConfig"
});
import { message } from "@/utils/message";
import { 
  ElCard, 
  ElForm, 
  ElFormItem, 
  ElInput, 
  ElButton, 
  ElDialog,
  ElMessageBox
} from "element-plus";
import { editConfig, deleteConfig } from "@/api/system";
import type { ConfigGroup, ConfigItem } from "@/api/system";
import Delete from "~icons/ep/delete";

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
const formData = ref<Record<string, string>>({});

// 原始数据（用于取消时恢复）
const originalFormData = ref<Record<string, string>>({});

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 从后端数据初始化表单
const initFormData = () => {
  if (!props.configGroup || !props.configGroup.list) return;
  
  const newFormData: Record<string, string> = {};
  
  // 遍历后端返回的配置项，初始化表单数据
  props.configGroup.list.forEach((item: ConfigItem) => {
    newFormData[item.name] = item.value ? String(item.value) : "";
  });
  
  formData.value = newFormData;
  // 保存原始数据
  originalFormData.value = JSON.parse(JSON.stringify(newFormData));
};

// 监听配置组变化
watch(() => props.configGroup, () => {
  if (props.configGroup && props.configGroup.list) {
    initFormData();
    // 切换配置组时重置编辑状态
    isEditMode.value = false;
    isSaveDisabled.value = true;
  }
}, { immediate: true, deep: true });

// 监听表单数据变化
watch(formData, () => {
  if (isEditMode.value) {
    // 检查数据是否有变化
    const hasChanged = JSON.stringify(formData.value) !== JSON.stringify(originalFormData.value);
    isSaveDisabled.value = !hasChanged;
  }
}, { deep: true });

// 点击修改按钮
const handleEdit = () => {
  isEditMode.value = true;
  isSaveDisabled.value = false;
  // 保存当前数据作为原始数据
  originalFormData.value = JSON.parse(JSON.stringify(formData.value));
};

// 保存配置
const handleSave = () => {
  showGoogleVerifyDialog.value = true;
  googleVerifyCode.value = "";
};

// 取消修改
const handleCancel = () => {
  // 恢复原始数据
  formData.value = JSON.parse(JSON.stringify(originalFormData.value));
  isEditMode.value = false;
  isSaveDisabled.value = true;
};

// 关闭谷歌验证对话框
const handleCloseGoogleVerifyDialog = () => {
  showGoogleVerifyDialog.value = false;
  googleVerifyCode.value = "";
};

// 确认保存（带谷歌验证）
const handleConfirmSave = async () => {
  if (!googleVerifyCode.value) {
    message("请输入谷歌验证码", { type: "warning" });
    return;
  }

  try {
    // 构建保存数据对象，包含所有配置项
    const saveData: Record<string, string> = {};
    
    props.configGroup.list.forEach((item: ConfigItem) => {
      const value = formData.value[item.name];
      saveData[item.name] = value || "";
    });

    // 添加谷歌验证码到保存数据中
    saveData.google_code = googleVerifyCode.value;

    // 一次性保存所有配置项
    const res = await editConfig(saveData);

    if (res.code === 0) {
      message("保存成功", { type: "success" });
      showGoogleVerifyDialog.value = false;
      googleVerifyCode.value = "";
      isEditMode.value = false;
      isSaveDisabled.value = true;
      // 重新获取数据
      emit("refresh");
    } else {
      message(res.msg || "保存失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 删除配置项
const handleDeleteConfig = async (item: ConfigItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置项"${item.title}"吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    const res = await deleteConfig({
      name: item.name
    });

    if (res.code === 0) {
      message("删除成功", { type: "success" });
      // 重新获取数据
      emit("refresh");
    } else {
      message(res.msg || "删除失败", { type: "error" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
    }
  }
};
</script>

<template>
  <div class="game-config-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ configGroup.title }}</span>
          <div class="header-buttons">
            <el-button 
              v-if="!isEditMode" 
              type="primary" 
              @click="handleEdit"
            >
              修改
            </el-button>
            <template v-else>
              <el-button @click="handleCancel">取消</el-button>
              <el-button 
                type="primary" 
                :disabled="isSaveDisabled"
                @click="handleSave"
              >
                保存
              </el-button>
            </template>
          </div>
        </div>
      </template>

      <el-form label-width="200px" class="config-form">
        <el-form-item 
          v-for="item in configGroup.list" 
          :key="item.id"
          :label="item.title"
        >
          <div class="form-item-content">
            <el-input
              v-model="formData[item.name]"
              :placeholder="item.tip || `请输入${item.title}`"
              :disabled="!isEditMode"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDeleteConfig(item)"
              style="margin-left: 10px"
            >
              删除
            </el-button>
          </div>
          <div v-if="item.tip" class="form-tip">{{ item.tip }}</div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 谷歌验证对话框 -->
    <el-dialog
      v-model="showGoogleVerifyDialog"
      title="谷歌验证"
      width="400px"
      :close-on-click-modal="false"
      @close="handleCloseGoogleVerifyDialog"
    >
      <el-form>
        <el-form-item>
          <el-input
            v-model="googleVerifyCode"
            placeholder="请输入谷歌验证码"
            maxlength="6"
            @keyup.enter="handleConfirmSave"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseGoogleVerifyDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirmSave">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.game-config-container {
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.config-form {
  padding: 20px 0;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.config-form :deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}

.form-item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.form-item-content > :first-child {
  flex: 1;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
