<script setup lang="ts">
import { ref, computed, h, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "RoleManagement"
});
import { type PlusColumn, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";

// 国际化
const { t } = useI18n();
import {
  getRoleManagementList,
  getRoleTree,
  getMenuList,
  addRole,
  editRole,
  type RoleManagementItem,
  type RoleManagementListResult,
  type RoleTreeItem,
  type MenuItem
} from "@/api/auth";
import { ElMessageBox, ElTag, ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption, ElTree, ElCheckbox, type FormInstance } from "element-plus";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Delete from "~icons/ep/delete";
import { constantMenus } from "@/router/index";

// 表格数据类型（直接使用API响应类型，但需要扩展显示字段）
type TableRow = RoleManagementItem & {
  parent?: string;
  displayName?: string;
};

// 权限树节点类型
type PermissionNode = {
  id: string | number;
  label: string;
  path?: string;
  children?: PermissionNode[];
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, buttons, pageInfo, total, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "ID",
    renderHeader: () => t("permission.roleManagement.table.id"),
    prop: "id",
    width: 80,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "父级",
    renderHeader: () => t("permission.roleManagement.table.parent"),
    prop: "parent",
    minWidth: 120,
    render: (value: string, row: TableRow) => {
      // 根据pid查找父级名称
      if (row.pid === 0) {
        return t("permission.roleManagement.table.none");
      }
      const parentItem = tableData.value.find(item => item.id === row.pid);
      if (parentItem) {
        // 去除HTML实体和spacer，只显示纯名称
        const parentName = parentItem.name.replace(/&nbsp;|├|│|└/g, "").trim();
        return parentName || t("permission.roleManagement.table.none");
      }
      return value || t("permission.roleManagement.table.none");
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "名称",
    renderHeader: () => t("permission.roleManagement.table.name"),
    prop: "name",
    minWidth: 200,
    render: (value: string) => {
      // 处理HTML实体，将&nbsp;转换为空格，保留层级符号
      return value
        .replace(/&nbsp;/g, " ")
        .replace(/├/g, "├")
        .replace(/│/g, "│")
        .replace(/└/g, "└");
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    renderHeader: () => t("permission.roleManagement.table.status"),
    prop: "status",
    width: 100,
    render: (value: string) => {
      const isNormal = value === "normal" || value === "1";
      return h(ElTag, {
        type: isNormal ? "success" : "danger"
      }, () => isNormal ? t("permission.roleManagement.table.normal") : t("permission.roleManagement.table.disabled"));
    },
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: () => t("permission.roleManagement.buttons.edit"),
    code: "edit",
    props: {
      type: "primary"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleEditRow(row);
    }
  },
  {
    text: () => t("permission.roleManagement.buttons.delete"),
    code: "delete",
    props: {
      type: "danger"
    },
    onClick: (params: any) => {
      const row = params.row as TableRow;
      handleDelete(row);
    }
  }
];

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    const res = await getRoleManagementList();
    
    if (res.code === 0 && res.data && res.data.rows) {
      // 转换数据以匹配表格显示
      tableData.value = res.data.rows.map((item: RoleManagementItem) => {
        // 查找父级名称
        let parentName = t("permission.roleManagement.table.none");
        if (item.pid !== 0) {
          const parentItem = res.data.rows.find((p: RoleManagementItem) => p.id === item.pid);
          if (parentItem) {
            // 去除HTML实体和spacer，只显示纯名称
            parentName = parentItem.name.replace(/&nbsp;|├|│|└/g, "").trim();
          }
        }
        
        return {
          ...item,
          parent: parentName
        };
      }) as any[];
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
      message(res.msg || t("permission.roleManagement.message.getListFail"), { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || t("permission.roleManagement.message.getListFail"), { type: "error" });
    tableData.value = [];
    total.value = 0;
  } finally {
    loadingStatus.value = false;
  }
};

// 记录上一次的 pageSize
const previousPageSize = ref(pageInfo.value.pageSize);

// 分页处理
const handlePageChange = () => {
  if (pageInfo.value.pageSize !== previousPageSize.value) {
    pageInfo.value.page = 1;
    previousPageSize.value = pageInfo.value.pageSize;
  }
  getList();
};

// 初始化加载数据
getList();

// 对话框相关
const showDialog = ref(false);
const dialogTitle = computed(() => {
  return isEdit.value ? t("permission.roleManagement.edit.title") : t("permission.roleManagement.add.title");
});
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const formData = ref({
  id: 0,
  parent: "",
  name: "",
  permissions: [] as string[]
});

// 父级选项（从API数据动态生成）
const parentOptions = computed(() => {
  const options = [{ label: t("permission.roleManagement.form.none"), value: "" }];
  // 从tableData中获取所有角色作为父级选项
  tableData.value.forEach(item => {
    const displayName = item.name.replace(/&nbsp;|├|│|└/g, "").trim();
    options.push({
      label: displayName,
      value: item.id.toString()
    });
  });
  return options;
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: t("permission.roleManagement.form.nameRequired"), trigger: "blur" }
  ]
};

// 权限树数据
const permissionTreeData = ref<PermissionNode[]>([]);
const permissionTreeRef = ref();
const checkAll = ref(false);
const expandAll = ref(false);
const expandedKeys = ref<(string | number)[]>([]);

// 将菜单列表转换为前端树结构
const buildPermissionTreeFromMenuList = (menuList: MenuItem[]): PermissionNode[] => {
  // 创建节点映射
  const nodeMap = new Map<number, PermissionNode>();
  const rootNodes: PermissionNode[] = [];

  // 第一遍：创建所有节点
  menuList.forEach(item => {
    const node: PermissionNode = {
      id: item.id,
      label: item.title.trim(), // 去除标题中的空格
      children: []
    };
    nodeMap.set(item.id, node);
  });

  // 第二遍：建立父子关系
  menuList.forEach(item => {
    const node = nodeMap.get(item.id);
    if (!node) return;

    if (item.pid === 0) {
      // 根节点
      rootNodes.push(node);
    } else {
      // 子节点
      const parentNode = nodeMap.get(item.pid);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(node);
      } else {
        // 如果找不到父节点，也作为根节点处理
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
};

// 将后端返回的权限树数据转换为选中状态映射
const buildSelectedMapFromRoleTree = (roleTreeData: RoleTreeItem[]): Map<number, boolean> => {
  const selectedMap = new Map<number, boolean>();
  roleTreeData.forEach(item => {
    selectedMap.set(item.id, item.state.selected);
  });
  return selectedMap;
};

// 获取所有权限节点的key（包括权限项）
const getAllPermissionKeys = (nodes: PermissionNode[]): string[] => {
  const keys: string[] = [];
  const traverse = (nodeList: PermissionNode[]) => {
    nodeList.forEach(node => {
      // 添加权限项（查看、添加、编辑、删除）
      keys.push(`${node.id}-view`);
      keys.push(`${node.id}-add`);
      keys.push(`${node.id}-edit`);
      keys.push(`${node.id}-delete`);
      
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return keys;
};

// 获取所有菜单节点的key（用于全选）
const getAllMenuKeys = (nodes: PermissionNode[]): (string | number)[] => {
  const keys: (string | number)[] = [];
  const traverse = (nodeList: PermissionNode[]) => {
    nodeList.forEach(node => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return keys;
};

// 获取所有节点key（用于展开）
const getAllNodeKeys = (nodes: PermissionNode[]): (string | number)[] => {
  const keys: (string | number)[] = [];
  const traverse = (nodeList: PermissionNode[]) => {
    nodeList.forEach(node => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return keys;
};

// 选中全部
const handleCheckAll = () => {
  if (checkAll.value) {
    const allKeys = getAllPermissionKeys(permissionTreeData.value);
    permissionCheckedKeys.value = allKeys;
  } else {
    permissionCheckedKeys.value = [];
  }
};

// 展开全部
const handleExpandAll = () => {
  if (expandAll.value) {
    expandedKeys.value = getAllNodeKeys(permissionTreeData.value);
  } else {
    expandedKeys.value = [];
  }
};

// 权限选中状态管理
const permissionCheckedKeys = ref<string[]>([]);

// 检查权限是否被选中
const isPermissionChecked = (nodeId: string | number, permission: string): boolean => {
  const key = `${nodeId}-${permission}`;
  // 如果菜单节点本身被选中，或者权限key被选中，都返回true
  return permissionCheckedKeys.value.includes(key) || permissionCheckedKeys.value.includes(String(nodeId));
};

// 更新权限选中状态
const updatePermission = (nodeId: string | number, permission: string, checked: boolean) => {
  const key = `${nodeId}-${permission}`;
  const keys = [...permissionCheckedKeys.value];
  
  if (checked) {
    if (!keys.includes(key)) {
      keys.push(key);
    }
    // 如果选中了权限，也选中菜单节点本身
    const menuKey = String(nodeId);
    if (!keys.includes(menuKey)) {
      keys.push(menuKey);
    }
  } else {
    const index = keys.indexOf(key);
    if (index > -1) {
      keys.splice(index, 1);
    }
    // 检查是否还有其他权限被选中，如果没有，则取消菜单节点的选中
    const hasOtherPermissions = ['view', 'add', 'edit', 'delete'].some(p => {
      if (p === permission) return false;
      return keys.includes(`${nodeId}-${p}`);
    });
    if (!hasOtherPermissions) {
      const menuIndex = keys.indexOf(String(nodeId));
      if (menuIndex > -1) {
        keys.splice(menuIndex, 1);
      }
    }
  }
  
  permissionCheckedKeys.value = keys;
  
  // 更新checkAll状态
  const allKeys = getAllPermissionKeys(permissionTreeData.value);
  checkAll.value = allKeys.length > 0 && allKeys.every(k => keys.includes(k));
};

// 打开新增对话框
const handleAdd = async () => {
  isEdit.value = false;
  formData.value = {
    id: 0,
    parent: "",
    name: "",
    permissions: []
  };
  checkAll.value = false;
  expandAll.value = false;
  permissionCheckedKeys.value = [];
  expandedKeys.value = [];
  
  // 获取菜单列表来构建权限树
  try {
    const menuRes = await getMenuList();
    if (menuRes.code !== 0 || !menuRes.data || !menuRes.data.rows) {
      message(menuRes.msg || t("permission.roleManagement.message.getMenuListFail"), { type: "error" });
      showDialog.value = true;
      return;
    }
    
    // 将菜单列表转换为树结构
    permissionTreeData.value = buildPermissionTreeFromMenuList(menuRes.data.rows);
    
    // 展开所有节点
    expandAll.value = true;
    expandedKeys.value = getAllNodeKeys(permissionTreeData.value);
  } catch (error: any) {
    console.error("获取权限树数据失败:", error);
    message(error?.message || t("permission.roleManagement.message.getPermissionTreeFail"), { type: "error" });
  }
  
  showDialog.value = true;
};

// 打开编辑对话框
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message(t("permission.roleManagement.message.selectOneToEdit"), { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = async (row: TableRow) => {
  isEdit.value = true;
  
  // 处理名称，去除HTML实体和spacer
  const displayName = row.name.replace(/&nbsp;|├|│|└/g, "").trim();
  
  formData.value = {
    id: row.id,
    parent: row.pid === 0 ? "" : row.pid.toString(),
    name: displayName,
    permissions: []
  };
  
  // 重置权限树和选中状态
  permissionTreeData.value = [];
  permissionCheckedKeys.value = [];
  checkAll.value = false;
  expandAll.value = false;
  expandedKeys.value = [];
  
  // 先获取所有菜单列表，然后获取角色权限树数据
  try {
    // 1. 获取所有菜单列表
    const menuRes = await getMenuList();
    if (menuRes.code !== 0 || !menuRes.data || !menuRes.data.rows) {
      message(menuRes.msg || t("permission.roleManagement.message.getMenuListFail"), { type: "error" });
      showDialog.value = true;
      return;
    }
    
    // 2. 将菜单列表转换为树结构
    permissionTreeData.value = buildPermissionTreeFromMenuList(menuRes.data.rows);
    
    // 3. 获取角色权限树数据（用于标记哪些菜单已选中）
    const roleTreeRes = await getRoleTree({ pid: row.pid });
    if (roleTreeRes.code === 0 && roleTreeRes.data) {
      // 构建选中状态映射
      const selectedMap = buildSelectedMapFromRoleTree(roleTreeRes.data);
      
      // 根据选中状态设置权限选中
      const selectedKeys: string[] = [];
      selectedMap.forEach((isSelected, menuId) => {
        if (isSelected) {
          // 选中该菜单节点的所有权限项
          selectedKeys.push(`${menuId}-view`);
          selectedKeys.push(`${menuId}-add`);
          selectedKeys.push(`${menuId}-edit`);
          selectedKeys.push(`${menuId}-delete`);
          // 也保存菜单节点ID本身，用于判断菜单是否被选中
          selectedKeys.push(String(menuId));
        }
      });
      
      permissionCheckedKeys.value = selectedKeys;
    } else {
      // 如果获取角色权限树失败，只显示菜单树，不设置选中状态
      console.warn("获取角色权限树失败:", roleTreeRes.msg);
    }
    
    // 展开所有节点
    expandAll.value = true;
    expandedKeys.value = getAllNodeKeys(permissionTreeData.value);
  } catch (error: any) {
    console.error("获取权限树数据失败:", error);
    message(error?.message || t("permission.roleManagement.message.getPermissionTreeFail"), { type: "error" });
  }
  
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
};

// 从权限选中keys中提取权限ID（菜单ID），多个用逗号隔开
// checkedKeys 可能包含：纯数字（菜单ID）或 "数字-权限" 格式（如 "1-view", "1-add"）
// 返回格式：逗号分隔的菜单ID字符串，如 "1,2,3"
const extractMenuIds = (checkedKeys: string[]): string => {
  const menuIdSet = new Set<number>();
  
  checkedKeys.forEach(key => {
    // 如果key是纯数字（菜单ID），直接添加
    if (/^\d+$/.test(key)) {
      menuIdSet.add(parseInt(key));
    } else {
      // 如果key是 "数字-权限" 格式（如 "1-view"），提取数字部分（菜单ID）
      const match = key.match(/^(\d+)-/);
      if (match) {
        menuIdSet.add(parseInt(match[1]));
      }
    }
  });
  
  // 去重、排序，转换为逗号分隔的字符串
  return Array.from(menuIdSet).sort((a, b) => a - b).join(",");
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取选中的权限菜单ID
        const rules = extractMenuIds(permissionCheckedKeys.value);
        const pid = formData.value.parent ? parseInt(formData.value.parent) : 0;
        
        if (isEdit.value) {
          // 编辑角色
          const res = await editRole({
            id: formData.value.id,
            pid: pid,
            name: formData.value.name,
            status: "normal", // 默认状态为normal
            rules: rules || "*"
          });
          
          if (res.code === 0) {
            message(t("permission.roleManagement.message.editSuccess"), { type: "success" });
            handleCloseDialog();
            // 重新获取列表数据
            await getList();
          } else {
            message(res.msg || t("permission.roleManagement.message.editFail"), { type: "error" });
          }
        } else {
          // 新增角色
          const res = await addRole({
            pid: pid,
            name: formData.value.name,
            status: "normal", // 默认状态为normal
            rules: rules || "*"
          });
          
          if (res.code === 0) {
            message(t("permission.roleManagement.message.addSuccess"), { type: "success" });
            handleCloseDialog();
            // 重新获取列表数据
            await getList();
          } else {
            message(res.msg || t("permission.roleManagement.message.addFail"), { type: "error" });
          }
        }
      } catch (error: any) {
        console.error("提交失败:", error);
        message(error?.message || t("permission.roleManagement.message.submitFail"), { type: "error" });
      }
    }
  });
};

// 删除单条数据
const handleDelete = async (row: TableRow) => {
  try {
    // 处理名称，去除HTML实体和spacer
    const displayName = row.name.replace(/&nbsp;|├|│|└/g, "").trim();
    await ElMessageBox.confirm(
      t("permission.roleManagement.message.confirmDelete", { name: displayName }),
      t("permission.roleManagement.delete.title"),
      {
        confirmButtonText: t("permission.roleManagement.buttons.confirm"),
        cancelButtonText: t("permission.roleManagement.buttons.cancel"),
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      total.value -= 1;
      message(t("permission.roleManagement.message.deleteSuccess"), { type: "success" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || t("permission.roleManagement.message.deleteFail"), { type: "error" });
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message(t("permission.roleManagement.message.selectToDelete"), { type: "warning" });
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      t("permission.roleManagement.message.confirmBatchDelete", { count: multipleSelection.value.length }),
      t("permission.roleManagement.delete.batchTitle"),
      {
        confirmButtonText: t("permission.roleManagement.buttons.confirm"),
        cancelButtonText: t("permission.roleManagement.buttons.cancel"),
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const ids = multipleSelection.value.map(item => item.id);
    tableData.value = tableData.value.filter(item => !ids.includes(item.id));
    total.value -= multipleSelection.value.length;
    multipleSelection.value = [];
    message(t("permission.roleManagement.message.deleteSuccess"), { type: "success" });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || t("permission.roleManagement.message.deleteFail"), { type: "error" });
    }
  }
};
</script>

<template>
  <div class="role-management-container">
    <!-- 表格 -->
    <el-card class="table-card">
      <PlusTable
        v-loading="loadingStatus"
        :columns="tableConfig"
        :table-data="tableData"
        :stripe="true"
        :is-selection="true"
        :action-bar="{
          buttons,
          width: '150px',
          label: t('permission.roleManagement.table.action')
        }"
        width="100%"
        height="90%"
        @selection-change="(val: TableRow[]) => multipleSelection = val"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.roleManagement.buttons.add') }}</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.roleManagement.buttons.edit') }}</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleBatchDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">{{ t('permission.roleManagement.buttons.delete') }}</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip :content="t('permission.roleManagement.toolbar.density')" placement="top">
            <el-icon
              :size="18"
              style=" margin-right: 15px;cursor: pointer; outline: none"
              color="#606266"
            >
              <component :is="Monitor" />
            </el-icon>
          </el-tooltip>
        </template>
        <template #column-settings-icon>
          <el-tooltip :content="t('permission.roleManagement.toolbar.columnSettings')" placement="top">
            <el-icon
              :size="18"
              style=" margin-right: 5px;cursor: pointer; outline: none"
              color="#606266"
            >
              <component :is="Grid" />
            </el-icon>
          </el-tooltip>
        </template>
        <template #toolbar>
          <!-- 导出下拉菜单 -->
          <el-tooltip :content="t('permission.roleManagement.toolbar.export')" placement="top" :trigger="'hover'">
            <span style="display: inline-block">
              <el-icon
                :size="18"
                style="
                  display: inline-block;
                  margin-right: 15px;
                  cursor: pointer;
                  outline: none;
                "
                color="#606266"
              >
                <component :is="Upload" />
              </el-icon>
            </span>
          </el-tooltip>
        </template>
      </PlusTable>
      <PlusPagination
        v-model="pageInfo"
        :total="total"
        :small="true"
        :page-sizes="[10, 20, 50, 100]"
        :layout="'total, sizes, prev, pager, next, jumper'"
        @change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
      @close="handleCloseDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item :label="t('permission.roleManagement.form.parent')">
          <el-select
            v-model="formData.parent"
            :placeholder="t('placeholder.select')"
            style="width: 100%"
            filterable
            :disabled="isEdit"
          >
            <el-option
              v-for="item in parentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('permission.roleManagement.form.name')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('placeholder.input')"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="t('permission.roleManagement.form.permissions')">
          <div class="permission-controls">
            <el-checkbox v-model="checkAll" @change="handleCheckAll">{{ t('permission.roleManagement.form.checkAll') }}</el-checkbox>
            <el-checkbox v-model="expandAll" @change="handleExpandAll" style="margin-left: 20px">{{ t('permission.roleManagement.form.expandAll') }}</el-checkbox>
          </div>
          <div class="permission-tree-container">
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTreeData"
              :props="{ children: 'children', label: 'label' }"
              node-key="id"
              :expanded-keys="expandedKeys"
              :expand-on-click-node="false"
              style="max-height: 400px; overflow-y: auto; margin-top: 10px"
            >
              <template #default="{ node, data }">
                <div class="permission-node">
                  <span class="node-label">{{ data.label }}</span>
                  <div class="permission-checkboxes">
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'view')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'view', val)"
                    >
                      {{ t('permission.roleManagement.form.view') }}
                    </el-checkbox>
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'add')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'add', val)"
                    >
                      {{ t('permission.roleManagement.form.add') }}
                    </el-checkbox>
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'edit')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'edit', val)"
                    >
                      {{ t('permission.roleManagement.form.edit') }}
                    </el-checkbox>
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'delete')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'delete', val)"
                    >
                      {{ t('permission.roleManagement.form.delete') }}
                    </el-checkbox>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">{{ t('permission.roleManagement.buttons.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ t('permission.roleManagement.buttons.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-management-container {
  width: 100%;
  padding: 0 20px;
}

.table-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}

.dialog-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.permission-controls {
  margin-bottom: 10px;
}

.permission-tree-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.permission-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px 0;
}

.node-label {
  flex: 1;
  font-weight: 500;
}

.permission-checkboxes {
  display: flex;
  gap: 15px;
  margin-left: 20px;
}

:deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
}

:deep(.el-tree-node__label) {
  width: 100%;
}
</style>
