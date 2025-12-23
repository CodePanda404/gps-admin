<script setup lang="ts">
defineOptions({
  name: "GameConfig"
});
import { ref } from "vue";
import { message } from "@/utils/message";
import { ElForm, ElFormItem, ElInput, ElButton } from "element-plus";

// 游戏配置数据
const formData = ref({
  game_config1: "",
  game_config2: "",
  game_config3: ""
});

// 保存配置
const handleSave = async () => {
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    message("保存成功", { type: "success" });
  } catch (error: any) {
    console.error("保存失败:", error);
    message(error?.message || "保存失败", { type: "error" });
  }
};
</script>

<template>
  <div class="game-config-container">
    <el-card shadow="never" style="margin: 20px">
      <el-form :model="formData" label-width="200px">
        <el-form-item label="游戏配置1">
          <el-input v-model="formData.game_config1" placeholder="请输入游戏配置1" />
        </el-form-item>
        <el-form-item label="游戏配置2">
          <el-input v-model="formData.game_config2" placeholder="请输入游戏配置2" />
        </el-form-item>
        <el-form-item label="游戏配置3">
          <el-input v-model="formData.game_config3" placeholder="请输入游戏配置3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.game-config-container {
  width: 100%;
}
</style>


