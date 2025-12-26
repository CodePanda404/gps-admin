<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { getTopMenu } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

defineProps({
  collapse: Boolean
});

const { title } = useNav();
const { dataTheme } = useDataThemeChange();

// 使用响应式的isDark来跟踪主题变化
const isDark = ref(document.documentElement.classList.contains("dark"));

// 监听DOM的dark class变化，确保实时响应主题切换
let observer: MutationObserver | null = null;
let unwatchTheme: (() => void) | null = null;

onMounted(() => {
  // 初始化
  isDark.value = document.documentElement.classList.contains("dark");
  
  // 监听DOM class变化
  observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains("dark");
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  });
  
  // 同时监听dataTheme变化（双重保障）
  unwatchTheme = watch(dataTheme, (newVal) => {
    isDark.value = newVal;
  });
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (unwatchTheme) {
    unwatchTheme();
    unwatchTheme = null;
  }
});

// 根据主题色动态获取logo
const logoUrl = computed(() => {
  // 深色模式使用 logo-dark.png，浅色模式使用 logo.png
  return isDark.value
    ? "/src/assets/login/logo-dark.png"
    : "/src/assets/login/logo.png";
});
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="logoUrl" alt="logo" />
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="logoUrl" alt="logo" />
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    padding-left: 20px;

    img {
      display: inline-block;
      height: 17px;
      width: auto;
    }

    .sidebar-title {
      display: inline-block;
      height: 32px;
      margin: 2px 0 0 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 18px;
      font-weight: 600;
      line-height: 32px;
      color: var(--pure-theme-sub-menu-active-text);
      white-space: nowrap;
    }
  }
}
</style>
