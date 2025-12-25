<script setup lang="ts">
defineOptions({
  name: "DictionaryConfig"
});
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElButton, ElDialog, ElMessageBox, ElTable, ElTableColumn, ElInput } from "element-plus";
import Delete from "~icons/ep/delete";
import Plus from "~icons/ep/plus";

// 编辑模式状态
const isEditMode = ref(false);

// Category type 数据
const categoryTypeData = ref([
  { key: "11", value: "会员配置" },
  { key: "default", value: "默认" },
  { key: "page", value: "单页" },
  { key: "article", value: "文章" },
  { key: "test", value: "test" }
]);

// Config group 数据
const configGroupData = ref([
  { key: "ability", value: "功能控制" },
  { key: "pay", value: "参数配置" },
  { key: "game", value: "游戏配置" },
  { key: "basic", value: "站点配置" },
  { key: "email", value: "邮件配置" },
  { key: "dictionary", value: "字典配置" }
]);

// 原始数据（用于取消时恢复）
const originalCategoryTypeData = ref([
  { key: "11", value: "会员配置" },
  { key: "default", value: "默认" },
  { key: "page", value: "单页" },
  { key: "article", value: "文章" },
  { key: "test", value: "test" }
]);

const originalConfigGroupData = ref([
  { key: "ability", value: "功能控制" },
  { key: "pay", value: "参数配置" },
  { key: "game", value: "游戏配置" },
  { key: "basic", value: "站点配置" },
  { key: "email", value: "邮件配置" },
  { key: "dictionary", value: "字典配置" }
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
    // 模拟数据已在初始化时设置
    originalCategoryTypeData.value = JSON.parse(JSON.stringify(categoryTypeData.value));
    originalConfigGroupData.value = JSON.parse(JSON.stringify(configGroupData.value));
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
  originalCategoryTypeData.value = JSON.parse(JSON.stringify(categoryTypeData.value));
  originalConfigGroupData.value = JSON.parse(JSON.stringify(configGroupData.value));
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
    // TODO: 对接实际API，传递 googleVerifyCode.value, categoryTypeData.value, configGroupData.value
    await new Promise(resolve => setTimeout(resolve, 500));
    message("保存成功", { type: "success" });
    isEditMode.value = false;
    isSaveDisabled.value = true;
    // 更新原始数据
    originalCategoryTypeData.value = JSON.parse(JSON.stringify(categoryTypeData.value));
    originalConfigGroupData.value = JSON.parse(JSON.stringify(configGroupData.value));
    googleVerifyCode.value = "";
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};

// 取消修改
const handleCancel = () => {
  // 恢复原始数据
  categoryTypeData.value = JSON.parse(JSON.stringify(originalCategoryTypeData.value));
  configGroupData.value = JSON.parse(JSON.stringify(originalConfigGroupData.value));
  // 禁用表单
  isEditMode.value = false;
  isSaveDisabled.value = true;
};

// 添加 Category type 行
const handleAddCategoryTypeRow = () => {
  categoryTypeData.value.push({
    key: "",
    value: ""
  });
};

// 删除 Category type 行
const handleDeleteCategoryTypeRow = (index: number) => {
  categoryTypeData.value.splice(index, 1);
};

// 添加 Config group 行
const handleAddConfigGroupRow = () => {
  configGroupData.value.push({
    key: "",
    value: ""
  });
};

// 删除 Config group 行
const handleDeleteConfigGroupRow = (index: number) => {
  configGroupData.value.splice(index, 1);
};

// 初始化加载数据
onMounted(() => {
  getConfig();
});
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
        <!-- Category type -->
        <el-form-item label="Category type">
          <div class="key-value-table">
            <el-table :data="categoryTypeData" border style="width: 100%">
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
                    @click="handleDeleteCategoryTypeRow($index)"
                  >
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button
              v-if="isEditMode"
              type="primary"
              link
              @click="handleAddCategoryTypeRow"
              style="margin-top: 10px;"
            >
              <el-icon style="margin-right: 5px;"><Plus /></el-icon>
              追加
            </el-button>
          </div>
        </el-form-item>

        <!-- Config group -->
        <el-form-item label="Config group">
          <div class="key-value-table">
            <el-table :data="configGroupData" border style="width: 100%">
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
                    @click="handleDeleteConfigGroupRow($index)"
                  >
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button
              v-if="isEditMode"
              type="primary"
              link
              @click="handleAddConfigGroupRow"
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
