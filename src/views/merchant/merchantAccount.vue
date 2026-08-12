<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineOptions({
  name: "MerchantAccount"
});

// 国际化
const { t } = useI18n();
</script>

<template>
  <div class="merchant-account-container">
    <el-card shadow="never" style="margin: 20px">
      <h2>{{ t("merchant.merchantAccount.title") }}</h2>
      <p>{{ t("merchant.merchantAccount.developing") }}</p>
    </el-card>
  </div>
</template>

<style scoped>
</style>

