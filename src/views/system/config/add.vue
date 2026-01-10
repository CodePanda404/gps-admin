<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElCard, type FormInstance } from "element-plus";
import { getSystemConfig, addConfig, checkConfigName, type SystemConfigResult } from "@/api/system";

defineOptions({
  name: "AddConfig"
});

const router = useRouter();

// 表单引用
const formRef = ref<FormInstance>();

// 配置数据
const configData = ref<SystemConfigResult["data"] | null>(null);
const loading = ref(false);

// 表单数据
const formData = ref({
  group: "",
  type: "",
  name: "",
  title: "",
  value: "",
  tip: "",
  rule: [] as string[],
  visible: "",
  extend: ""
});

// 表单验证规则
const formRules = {
  group: [
    { required: true, message: "请选择角色组", trigger: "change" }
  ],
  type: [
    { required: true, message: "请选择类型", trigger: "change" }
  ],
  name: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { validator: validateName, trigger: "blur" }
  ],
  title: [
    { required: true, message: "请输入标题", trigger: "blur" }
  ],
  value: [
    { required: true, message: "请输入值", trigger: "blur" }
  ]
};

// 校验配置名称是否重复
const nameChecking = ref(false);
const nameCheckTimer = ref<NodeJS.Timeout | null>(null);

async function validateName(rule: any, value: string, callback: any) {
  if (!value) {
    callback();
    return;
  }
  
  // 清除之前的定时器
  if (nameCheckTimer.value) {
    clearTimeout(nameCheckTimer.value);
  }
  
  nameChecking.value = true;
  
  // 防抖处理
  nameCheckTimer.value = setTimeout(async () => {
    try {
      const res = await checkConfigName({ name: value });
      if (res.code === 0) {
        // 如果返回成功，说明名称不存在，可以继续
        callback();
      } else {
        // 如果返回错误，说明名称已存在
        callback(new Error(res.msg || "配置名称已存在"));
      }
    } catch (error: any) {
      console.error("校验配置名称失败:", error);
      callback(new Error(error?.message || "校验配置名称失败"));
    } finally {
      nameChecking.value = false;
    }
  }, 500);
}

// 获取配置数据
const getConfig = async () => {
  loading.value = true;
  try {
    const res = await getSystemConfig();
    if (res.code === 0 && res.data) {
      configData.value = res.data;
    } else {
      message(res.msg || "获取配置失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("获取配置失败:", error);
    message(error?.message || "获取配置失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 角色组选项
const groupOptions = computed(() => {
  if (!configData.value?.groupList) return [];
  return Object.entries(configData.value.groupList).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

// 类型选项
const typeOptions = computed(() => {
  if (!configData.value?.typeList) return [];
  return Object.entries(configData.value.typeList).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

// 菜单规则选项
const ruleOptions = computed(() => {
  if (!configData.value?.ruleList) return [];
  return Object.entries(configData.value.ruleList).map(([key, value]) => ({
    label: `${value}(${key})`,
    value: key
  }));
});

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 将菜单规则数组转换为分号分隔的字符串
        const ruleStr = formData.value.rule.length > 0 
          ? formData.value.rule.join(";") 
          : "";
        
        const res = await addConfig({
          group: formData.value.group,
          type: formData.value.type,
          name: formData.value.name,
          title: formData.value.title,
          value: formData.value.value,
          tip: formData.value.tip || "",
          rule: ruleStr,
          visible: formData.value.visible || "",
          extend: formData.value.extend || ""
        });
        
        if (res.code === 0) {
          message("新增配置成功", { type: "success" });
          // 返回上一页
          router.back();
        } else {
          message(res.msg || "新增配置失败", { type: "error" });
        }
      } catch (error: any) {
        console.error("新增配置失败:", error);
        message(error?.message || "新增配置失败", { type: "error" });
      }
    }
  });
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
  formData.value = {
    group: "",
    type: "",
    name: "",
    title: "",
    value: "",
    tip: "",
    rule: [],
    visible: "",
    extend: ""
  };
};

// 初始化加载数据
onMounted(() => {
  getConfig();
});
</script>

<template>
  <div class="add-config-container">
    <el-card class="form-card" shadow="never" style="margin: 20px">
      <template #header>
        <div class="card-header">
          <span>新增配置</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="loading"
      >
        <el-form-item label="角色组:" prop="group">
          <el-select
            v-model="formData.group"
            placeholder="请选择角色组"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="类型:" prop="type">
          <el-select
            v-model="formData.type"
            placeholder="请选择类型"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="名称:" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入名称"
            :loading="nameChecking"
          />
        </el-form-item>
        
        <el-form-item label="标题:" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入标题"
          />
        </el-form-item>
        
        <el-form-item label="值:" prop="value">
          <el-input
            v-model="formData.value"
            placeholder="请输入值"
          />
        </el-form-item>
        
        <el-form-item label="Tip:">
          <el-input
            v-model="formData.tip"
            placeholder="请输入Tip"
          />
        </el-form-item>
        
        <el-form-item label="菜单规则:">
          <el-select
            v-model="formData.rule"
            placeholder="请选择菜单规则"
            style="width: 100%"
            multiple
            filterable
          >
            <el-option
              v-for="item in ruleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Visible condition:">
          <el-input
            v-model="formData.visible"
            placeholder="请输入Visible condition"
          />
        </el-form-item>
        
        <el-form-item label="Extend:">
          <el-input
            v-model="formData.extend"
            type="textarea"
            :rows="4"
            placeholder="请输入Extend"
            resize="both"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.add-config-container {
  width: 100%;
}

.form-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>

