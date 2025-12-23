<template>
  <div class="rich-text-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button
          :type="isBold ? 'primary' : 'default'"
          size="small"
          @click="toggleBold"
          title="粗体"
        >
          <strong>B</strong>
        </el-button>
        <el-button
          :type="isItalic ? 'primary' : 'default'"
          size="small"
          @click="toggleItalic"
          title="斜体"
        >
          <em>I</em>
        </el-button>
        <el-button
          :type="isUnderline ? 'primary' : 'default'"
          size="small"
          @click="toggleUnderline"
          title="下划线"
        >
          <u>U</u>
        </el-button>
      </el-button-group>
      
      <el-button-group style="margin-left: 10px">
        <el-button
          size="small"
          @click="alignLeft"
          title="左对齐"
        >
          <el-icon><component :is="AlignLeft" /></el-icon>
        </el-button>
        <el-button
          size="small"
          @click="alignCenter"
          title="居中"
        >
          <el-icon><component :is="AlignCenter" /></el-icon>
        </el-button>
        <el-button
          size="small"
          @click="alignRight"
          title="右对齐"
        >
          <el-icon><component :is="AlignRight" /></el-icon>
        </el-button>
        <el-button
          size="small"
          @click="alignJustify"
          title="两端对齐"
        >
          <el-icon><component :is="AlignJustify" /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group style="margin-left: 10px">
        <el-button
          size="small"
          @click="insertOrderedList"
          title="有序列表"
        >
          <el-icon><component :is="List" /></el-icon>
        </el-button>
        <el-button
          size="small"
          @click="insertUnorderedList"
          title="无序列表"
        >
          <el-icon><component :is="Menu" /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group style="margin-left: 10px">
        <el-button
          size="small"
          @click="insertLink"
          title="插入链接"
        >
          <el-icon><component :is="Link" /></el-icon>
        </el-button>
        <el-button
          size="small"
          @click="insertImage"
          title="插入图片"
        >
          <el-icon><component :is="Picture" /></el-icon>
        </el-button>
      </el-button-group>
    </div>
    
    <!-- 编辑区域 -->
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :style="editorStyle"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      v-html="modelValue"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  Menu,
  Link,
  Picture
} from "@element-plus/icons-vue";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLElement>();
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);

const editorStyle = computed(() => {
  return {
    minHeight: "200px",
    padding: "10px",
    border: "1px solid #dcdfe6",
    borderRadius: "4px",
    outline: "none"
  };
});

const handleInput = (e: Event) => {
  const target = e.target as HTMLElement;
  emit("update:modelValue", target.innerHTML);
};

const handleFocus = () => {
  checkFormatting();
};

const handleBlur = () => {
  // 保存当前内容
  if (editorRef.value) {
    emit("update:modelValue", editorRef.value.innerHTML);
  }
};

const checkFormatting = () => {
  if (!editorRef.value) return;
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    isBold.value = document.queryCommandState("bold");
    isItalic.value = document.queryCommandState("italic");
    isUnderline.value = document.queryCommandState("underline");
  }
};

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value);
  nextTick(() => {
    checkFormatting();
    if (editorRef.value) {
      emit("update:modelValue", editorRef.value.innerHTML);
    }
  });
};

const toggleBold = () => {
  execCommand("bold");
};

const toggleItalic = () => {
  execCommand("italic");
};

const toggleUnderline = () => {
  execCommand("underline");
};

const alignLeft = () => {
  execCommand("justifyLeft");
};

const alignCenter = () => {
  execCommand("justifyCenter");
};

const alignRight = () => {
  execCommand("justifyRight");
};

const alignJustify = () => {
  execCommand("justifyFull");
};

const insertOrderedList = () => {
  execCommand("insertOrderedList");
};

const insertUnorderedList = () => {
  execCommand("insertUnorderedList");
};

const insertLink = () => {
  const url = prompt("请输入链接地址:");
  if (url) {
    execCommand("createLink", url);
  }
};

const insertImage = () => {
  const url = prompt("请输入图片地址:");
  if (url) {
    execCommand("insertImage", url);
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorRef.value && editorRef.value.innerHTML !== newValue) {
      editorRef.value.innerHTML = newValue;
    }
  }
);
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background-color: #f5f7fa;
}

.editor-content {
  width: 100%;
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
  background-color: #fff;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #c0c4cc;
}

.editor-content:focus {
  border-color: #409eff;
}
</style>

