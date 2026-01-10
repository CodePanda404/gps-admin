<script setup lang="ts">
defineOptions({
  name: "DynamicConfig"
});
import { ref, watch, computed, h } from "vue";
import { message } from "@/utils/message";
import { 
  ElForm, 
  ElFormItem, 
  ElSwitch, 
  ElButton, 
  ElInput, 
  ElInputNumber, 
  ElDialog, 
  ElMessageBox,
  ElSelect,
  ElOption,
  ElUpload,
  ElImage,
  ElTable,
  ElTableColumn
} from "element-plus";
import Delete from "~icons/ep/delete";
import Plus from "~icons/ep/plus";
import { saveSystemConfig, deleteConfig, editConfig } from "@/api/system";
import type { ConfigGroup, ConfigItem } from "@/api/system";

// Props
const props = defineProps<{
  configGroup: ConfigGroup;
  typeList?: Record<string, string>;
}>();

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

// 编辑模式状态
const isEditMode = ref(false);

// 表单数据（动态生成）
const formData = ref<Record<string, any>>({});

// 原始数据（用于取消时恢复）
const originalFormData = ref<Record<string, any>>({});

// 保存按钮禁用状态
const isSaveDisabled = ref(true);

// 谷歌验证码对话框
const showGoogleVerifyDialog = ref(false);
const googleVerifyCode = ref("");

// 从后端数据初始化表单
const initFormData = () => {
  if (!props.configGroup || !props.configGroup.list) return;
  
  const newFormData: Record<string, any> = {};
  
  // 遍历后端返回的配置项，根据type初始化表单数据
  props.configGroup.list.forEach((item: ConfigItem) => {
    switch (item.type) {
      case "number":
        newFormData[item.name] = item.value ? Number(item.value) : 0;
        break;
      case "switch":
        newFormData[item.name] = item.value === "1" || item.value === 1 || item.value === true;
        break;
      case "select":
        // select类型，value可能是数组
        if (Array.isArray(item.value)) {
          newFormData[item.name] = item.value;
        } else {
          newFormData[item.name] = item.value ? [String(item.value)] : [];
        }
        break;
      case "array":
        // array类型，value是JSON字符串，需要解析
        try {
          if (typeof item.value === "string") {
            newFormData[item.name] = JSON.parse(item.value);
          } else {
            newFormData[item.name] = item.value || {};
          }
        } catch (e) {
          newFormData[item.name] = {};
        }
        break;
      case "image":
      case "images":
        newFormData[item.name] = item.value ? String(item.value) : "";
        break;
      default:
        // text, string等文本类型
        newFormData[item.name] = item.value ? String(item.value) : "";
        break;
    }
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
  ElMessageBox.confirm("确定要取消修改吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    // 恢复原始数据
    formData.value = JSON.parse(JSON.stringify(originalFormData.value));
    isEditMode.value = false;
    isSaveDisabled.value = true;
  }).catch(() => {
    // 用户取消
  });
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
      let configValue = "";
      
      switch (item.type) {
        case "switch":
          // switch类型转换为字符串 "1" 或 "0"
          configValue = value ? "1" : "0";
          break;
        case "select":
          // select类型，如果是数组，取第一个值
          if (Array.isArray(value) && value.length > 0) {
            configValue = value[0];
          } else {
            configValue = "";
          }
          break;
        case "array":
          // array类型，如果是数组格式，转换为对象；如果是对象，直接字符串化
          if (Array.isArray(value)) {
            // 将数组 [{key: "k1", value: "v1"}] 转换为对象 {k1: "v1"}
            const obj: Record<string, string> = {};
            value.forEach((item: { key: string; value: string }) => {
              if (item.key) {
                obj[item.key] = item.value;
              }
            });
            configValue = JSON.stringify(obj);
          } else {
            configValue = JSON.stringify(value);
          }
          break;
        case "number":
          configValue = String(value);
          break;
        default:
          configValue = value || "";
          break;
      }
      
      // 将配置项添加到保存数据对象中，key为配置项名称，value为配置项值
      saveData[item.name] = configValue;
    });

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

// 渲染表单控件
const renderFormControl = (item: ConfigItem) => {
  const value = formData.value[item.name];
  const disabled = !isEditMode.value;

  switch (item.type) {
    case "number":
      return h(ElInputNumber, {
        modelValue: value,
        "onUpdate:modelValue": (val: number) => {
          formData.value[item.name] = val;
        },
        disabled,
        style: { width: "100%" },
        placeholder: item.tip || "请输入"
      });
    
    case "switch":
      return h(ElSwitch, {
        modelValue: value,
        "onUpdate:modelValue": (val: boolean) => {
          formData.value[item.name] = val;
        },
        disabled
      });
    
    case "select":
      return h(ElSelect, {
        modelValue: value,
        "onUpdate:modelValue": (val: string[]) => {
          formData.value[item.name] = val;
        },
        disabled,
        style: { width: "100%" },
        placeholder: item.tip || "请选择"
      }, () => {
        if (item.content && Array.isArray(item.content)) {
          return item.content.map((option: string, index: number) => {
            return h(ElOption, {
              key: index,
              label: option,
              value: String(index + 1)
            });
          });
        }
        return null;
      });
    
    case "image":
    case "images":
      return h("div", { style: { display: "flex", gap: "10px", alignItems: "center" } }, [
        value ? h(ElImage, {
          src: value,
          style: { width: "100px", height: "100px" },
          previewSrcList: [value]
        }) : null,
        h(ElUpload, {
          disabled,
          action: "#",
          showFileList: false,
          beforeUpload: (file: File) => {
            // TODO: 实现图片上传逻辑
            const reader = new FileReader();
            reader.onload = (e) => {
              formData.value[item.name] = e.target?.result as string;
            };
            reader.readAsDataURL(file);
            return false;
          }
        }, () => h(ElButton, { disabled, size: "small" }, () => "上传图片"))
      ]);
    
    case "text":
      return h(ElInput, {
        modelValue: value,
        "onUpdate:modelValue": (val: string) => {
          formData.value[item.name] = val;
        },
        disabled,
        type: "textarea",
        rows: 4,
        placeholder: item.tip || "请输入"
      });
    
    case "array":
      // array类型显示为表格，类似字典配置
      let arrayData: Array<{ key: string; value: string }> = [];
      if (Array.isArray(value)) {
        arrayData = value;
      } else if (typeof value === "object" && value !== null) {
        arrayData = Object.keys(value).map(key => ({ key, value: String(value[key]) }));
      }
      
      // 确保 arrayData 是响应式的
      if (!formData.value[item.name] || !Array.isArray(formData.value[item.name])) {
        formData.value[item.name] = arrayData;
      }
      
      return h("div", { style: { width: "100%" } }, [
        h(ElTable, {
          data: formData.value[item.name],
          style: { width: "100%", marginBottom: "10px" }
        }, {
          default: () => [
            h(ElTableColumn, {
              prop: "key",
              label: "Array key",
              width: "200"
            }, {
              default: ({ row, $index }: { row: { key: string; value: string }, $index: number }) => {
                if (disabled) {
                  return row.key;
                }
                return h(ElInput, {
                  modelValue: row.key,
                  "onUpdate:modelValue": (val: string) => {
                    formData.value[item.name][$index].key = val;
                  },
                  placeholder: "请输入key"
                });
              }
            }),
            h(ElTableColumn, {
              prop: "value",
              label: "Array value"
            }, {
              default: ({ row, $index }: { row: { key: string; value: string }, $index: number }) => {
                if (disabled) {
                  return row.value;
                }
                return h(ElInput, {
                  modelValue: row.value,
                  "onUpdate:modelValue": (val: string) => {
                    formData.value[item.name][$index].value = val;
                  },
                  placeholder: "请输入value"
                });
              }
            }),
            h(ElTableColumn, {
              label: "操作",
              width: "100"
            }, {
              default: ({ $index }: { $index: number }) => {
                if (!disabled) {
                  return h(ElButton, {
                    type: "danger",
                    size: "small",
                    onClick: () => {
                      formData.value[item.name].splice($index, 1);
                    }
                  }, () => h(Delete));
                }
                return null;
              }
            })
          ]
        }),
        !disabled ? h(ElButton, {
          type: "primary",
          size: "small",
          style: { marginTop: "10px" },
          onClick: () => {
            if (!Array.isArray(formData.value[item.name])) {
              formData.value[item.name] = [];
            }
            formData.value[item.name].push({ key: "", value: "" });
          }
        }, () => [h(Plus), " 添加行"]) : null
      ]);
    
    default:
      // string等文本类型
      return h(ElInput, {
        modelValue: value,
        "onUpdate:modelValue": (val: string) => {
          formData.value[item.name] = val;
        },
        disabled,
        placeholder: item.tip || "请输入"
      });
  }
};

</script>

<template>
  <div class="dynamic-config-container">
    <el-card class="config-card" shadow="never" style="margin: 20px">
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
            <el-button 
              v-if="isEditMode" 
              type="primary" 
              @click="handleSave"
              :disabled="isSaveDisabled"
            >
              保存
            </el-button>
            <el-button 
              v-if="isEditMode" 
              @click="handleCancel"
            >
              取消
            </el-button>
          </div>
        </div>
      </template>

      <el-form label-width="150px" class="config-form">
        <el-form-item
          v-for="item in configGroup.list"
          :key="item.id"
          :label="item.title"
        >
          <div class="form-item-content">
            <component :is="() => renderFormControl(item)" />
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
    >
      <el-input
        v-model="googleVerifyCode"
        placeholder="请输入谷歌验证码"
        type="password"
        show-password
        @keyup.enter="handleConfirmSave"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showGoogleVerifyDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmSave">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dynamic-config-container {
  width: 100%;
}

.config-card {
  margin: 20px;
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
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

