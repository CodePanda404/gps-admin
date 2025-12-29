<script setup lang="ts">
defineOptions({
  name: "DictionaryConfig"
});
import { ref, watch } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElButton, ElDialog, ElMessageBox, ElTable, ElTableColumn, ElInput } from "element-plus";
import { saveSystemConfig } from "@/api/system";
import type { ConfigGroup } from "@/api/system";
import Delete from "~icons/ep/delete";
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

// 配置项数据，每个array类型的配置项对应一个表格
type ConfigItemData = {
  id: number;
  name: string;
  title: string;
  data: Array<{ key: string; value: string }>;
};

const configItemsData = ref<ConfigItemData[]>([]);
const originalConfigItemsData = ref<ConfigItemData[]>([]);

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 从后端数据初始化表单
const initFormData = () => {
  if (!props.configGroup || !props.configGroup.list) return;
  
  // 遍历后端返回的配置项，为每个array类型的配置项创建数据
  configItemsData.value = props.configGroup.list
    .filter(item => item.type === "array")
    .map(item => {
      let data: Array<{ key: string; value: string }> = [];
      
      try {
        const value = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          // 将对象转换为数组格式
          data = Object.keys(value).map(key => ({
            key: key,
            value: String(value[key])
          }));
        }
      } catch {
        // 解析失败，保持空数组
      }
      
      return {
        id: item.id,
        name: item.name,
        title: item.title || item.name,
        data: data
      };
    });
  
  // 保存原始数据
  originalConfigItemsData.value = JSON.parse(JSON.stringify(configItemsData.value));
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
  originalConfigItemsData.value = JSON.parse(JSON.stringify(configItemsData.value));
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
    
    // 遍历配置项数据，转换为后端格式
    configItemsData.value.forEach(configItem => {
      // 将数组转换为JSON对象
      const obj: Record<string, string> = {};
      configItem.data.forEach(item => {
        if (item.key && item.value) {
          obj[item.key] = item.value;
        }
      });
      saveData[configItem.name] = JSON.stringify(obj);
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
      originalConfigItemsData.value = JSON.parse(JSON.stringify(configItemsData.value));
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
  configItemsData.value = JSON.parse(JSON.stringify(originalConfigItemsData.value));
  // 禁用表单
  isEditMode.value = false;
  isSaveDisabled.value = true;
};

// 添加行
const handleAddRow = (configItem: ConfigItemData) => {
  configItem.data.push({
    key: "",
    value: ""
  });
};

// 删除行
const handleDeleteRow = (configItem: ConfigItemData, index: number) => {
  configItem.data.splice(index, 1);
};

</script>

<template>
  <div class="dictionary-config-container">
    <el-card shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <el-button type="primary" @click="handleEdit" :disabled="isEditMode">
            修改
          </el-button>
        </div>
      </template>
      <el-form label-width="200px">
        <!-- 动态生成每个配置项的表格 -->
        <el-form-item
          v-for="configItem in configItemsData"
          :key="configItem.id"
          :label="configItem.title"
        >
          <div class="key-value-table">
            <el-table :data="configItem.data" border style="width: 100%">

              <el-table-column label="Array key" width="200">
                <template #default="{ row }">
                  <el-input
                    v-model="row.key"
                    :disabled="!isEditMode"
                    placeholder="请输入"
                  />
                </template>
              </el-table-column>
              <el-table-column label="Array value" width="200">
                <template #default="{ row }">
                  <el-input
                    v-model="row.value"
                    :disabled="!isEditMode"
                    placeholder="请输入"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" v-if="isEditMode">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    @click="handleDeleteRow(configItem, $index)"
                  >
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button
              v-if="isEditMode"
              type="primary"
              link
              @click="handleAddRow(configItem)"
              style="margin-top: 10px;"
            >
              <el-icon style="margin-right: 5px;"><Plus /></el-icon>
              追加
            </el-button>
          </div>
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
.dictionary-config-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.key-value-table {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
