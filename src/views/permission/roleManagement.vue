<script setup lang="ts">
import { ref, computed, h, onMounted } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "RoleManagement"
});
import { type PlusColumn, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import {
  getRoleManagementList,
  type RoleManagementItem,
  type RoleManagementListResult
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
  id: string;
  label: string;
  path: string;
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
    prop: "id",
    width: 80,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "父级",
    prop: "parent",
    minWidth: 120,
    render: (value: string, row: TableRow) => {
      // 根据pid查找父级名称
      if (row.pid === 0) {
        return "无";
      }
      const parentItem = tableData.value.find(item => item.id === row.pid);
      if (parentItem) {
        // 去除HTML实体和spacer，只显示纯名称
        const parentName = parentItem.name.replace(/&nbsp;|├|│|└/g, "").trim();
        return parentName || "无";
      }
      return value || "无";
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "名称",
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
    prop: "status",
    width: 100,
    render: (value: string) => {
      const isNormal = value === "normal" || value === "1";
      return h(ElTag, {
        type: isNormal ? "success" : "danger"
      }, () => isNormal ? "正常" : "停用");
    },
    tableColumnProps: {
      align: "center"
    }
  }
]);

// 表格操作栏按钮定义
buttons.value = [
  {
    text: "编辑",
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
    text: "删除",
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
        let parentName = "无";
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
      message(res.msg || "获取列表数据失败", { type: "error" });
    }
  } catch (error: any) {
    console.error("获取列表数据失败:", error);
    message(error?.message || "获取列表数据失败", { type: "error" });
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
const dialogTitle = ref("新增");
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
  const options = [{ label: "无", value: "" }];
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
    { required: true, message: "请输入名称", trigger: "blur" }
  ]
};

// 权限树数据
const permissionTreeData = ref<PermissionNode[]>([]);
const permissionTreeRef = ref();
const checkAll = ref(false);
const expandAll = ref(false);

// 从路由结构构建权限树（使用模拟数据）
const buildPermissionTree = () => {
  // 模拟权限树数据 - 根据实际路由结构生成
  // 每个路由节点会显示4个权限复选框：查看、添加、编辑、删除
  const mockPermissionTree: PermissionNode[] = [
    {
      id: "/console",
      label: "控制台",
      path: "/console"
    },
    {
      id: "/welcome",
      label: "欢迎页面",
      path: "/welcome"
    },
    {
      id: "/system",
      label: "系统设置",
      path: "/system"
    },
    {
      id: "/merchant",
      label: "商户资料",
      path: "/merchant"
    },
    {
      id: "/player",
      label: "玩家管理",
      path: "/player"
    },
    {
      id: "/game",
      label: "游戏管理",
      path: "/game",
      children: [
        {
          id: "/game/supplier",
          label: "供应商",
          path: "/game/supplier"
        },
        {
          id: "/game/game-play-type",
          label: "玩法类型",
          path: "/game/game-play-type"
        },
        {
          id: "/game/game-list",
          label: "游戏列表",
          path: "/game/game-list"
        },
        {
          id: "/game/game-brand",
          label: "游戏品牌",
          path: "/game/game-brand"
        }
      ]
    },
    {
      id: "/agent",
      label: "代理管理",
      path: "/agent",
      children: [
        {
          id: "/agent/agent-list",
          label: "代理列表",
          path: "/agent/agent-list"
        }
      ]
    },
    {
      id: "/merchant-management",
      label: "商户管理",
      path: "/merchant-management",
      children: [
        {
          id: "/merchant-management/merchant-list",
          label: "商户列表",
          path: "/merchant-management/merchant-list"
        },
        {
          id: "/merchant-management/currency",
          label: "币种",
          path: "/merchant-management/currency"
        },
        {
          id: "/merchant-management/pgf-account",
          label: "PGF账号",
          path: "/merchant-management/pgf-account"
        },
        {
          id: "/merchant-management/wlg-account",
          label: "WLG账号",
          path: "/merchant-management/wlg-account"
        }
      ]
    },
    {
      id: "/permission",
      label: "权限管理",
      path: "/permission",
      children: [
        {
          id: "/permission/account",
          label: "账号管理",
          path: "/permission/account"
        },
        {
          id: "/permission/role",
          label: "角色管理",
          path: "/permission/role"
        },
        {
          id: "/permission/menu",
          label: "菜单管理",
          path: "/permission/menu"
        },
        {
          id: "/permission/game-test-log",
          label: "游戏测试日志",
          path: "/permission/game-test-log"
        },
        {
          id: "/permission/operation-log",
          label: "操作日志",
          path: "/permission/operation-log"
        }
      ]
    },
    {
      id: "/finance",
      label: "财务管理",
      path: "/finance",
      children: [
        {
          id: "/finance/merchant-bill",
          label: "商户账单",
          path: "/finance/merchant-bill",
          children: [
            {
              id: "/finance/merchant-bill/detail",
              label: "明细",
              path: "/finance/merchant-bill/detail"
            }
          ]
        }
      ]
    },
    {
      id: "/article",
      label: "文章管理",
      path: "/article",
      children: [
        {
          id: "/article/help",
          label: "帮助管理",
          path: "/article/help"
        }
      ]
    },
    {
      id: "/statistics",
      label: "数据统计",
      path: "/statistics",
      children: [
        {
          id: "/statistics/player",
          label: "玩家统计",
          path: "/statistics/player"
        },
        {
          id: "/statistics/game",
          label: "游戏统计",
          path: "/statistics/game"
        },
        {
          id: "/statistics/product",
          label: "产品统计",
          path: "/statistics/product"
        },
        {
          id: "/statistics/merchant-daily",
          label: "商户日报表",
          path: "/statistics/merchant-daily"
        }
      ]
    }
  ];

  permissionTreeData.value = mockPermissionTree;
};

// 初始化权限树
onMounted(() => {
  buildPermissionTree();
});

// 获取所有权限节点的key（包括权限项）
const getAllPermissionKeys = (nodes: PermissionNode[]): string[] => {
  const keys: string[] = [];
  const traverse = (nodeList: PermissionNode[]) => {
    nodeList.forEach(node => {
      // 添加权限项
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

// 获取所有节点key（用于展开）
const getAllNodeKeys = (nodes: PermissionNode[]): string[] => {
  const keys: string[] = [];
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
    const expandKeys = getAllNodeKeys(permissionTreeData.value);
    permissionTreeRef.value?.setExpandedKeys(expandKeys);
  } else {
    permissionTreeRef.value?.setExpandedKeys([]);
  }
};

// 权限选中状态管理
const permissionCheckedKeys = ref<string[]>([]);

// 检查权限是否被选中
const isPermissionChecked = (nodeId: string, permission: string): boolean => {
  const key = `${nodeId}-${permission}`;
  return permissionCheckedKeys.value.includes(key);
};

// 更新权限选中状态
const updatePermission = (nodeId: string, permission: string, checked: boolean) => {
  const key = `${nodeId}-${permission}`;
  const keys = [...permissionCheckedKeys.value];
  
  if (checked) {
    if (!keys.includes(key)) {
      keys.push(key);
    }
  } else {
    const index = keys.indexOf(key);
    if (index > -1) {
      keys.splice(index, 1);
    }
  }
  
  permissionCheckedKeys.value = keys;
  
  // 更新checkAll状态
  const allKeys = getAllPermissionKeys(permissionTreeData.value);
  checkAll.value = allKeys.length > 0 && allKeys.every(k => keys.includes(k));
};

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加";
  formData.value = {
    id: 0,
    parent: "",
    name: "",
    permissions: []
  };
  checkAll.value = false;
  expandAll.value = false;
  permissionCheckedKeys.value = [];
  permissionTreeRef.value?.setExpandedKeys([]);
  showDialog.value = true;
};

// 打开编辑对话框
const handleEdit = () => {
  if (multipleSelection.value.length !== 1) {
    message("请选择一条数据进行编辑", { type: "warning" });
    return;
  }
  handleEditRow(multipleSelection.value[0]);
};

// 编辑单行数据
const handleEditRow = (row: TableRow) => {
  isEdit.value = true;
  dialogTitle.value = "编辑";
  
  // 处理名称，去除HTML实体和spacer
  const displayName = row.name.replace(/&nbsp;|├|│|└/g, "").trim();
  
  formData.value = {
    id: row.id,
    parent: row.pid === 0 ? "" : row.pid.toString(),
    name: displayName,
    permissions: [] // TODO: 从API获取权限数据，rules字段包含权限ID
  };
  
  // TODO: 根据rules字段解析权限数据
  // rules字段是逗号分隔的权限ID字符串，或"*"表示全部权限
  // 这里先模拟一些选中的权限
  const mockPermissions = [
    "/game/supplier-view",
    "/game/supplier-add",
    "/game/supplier-edit",
    "/game/supplier-delete"
  ];
  permissionCheckedKeys.value = mockPermissions;
  
  checkAll.value = false;
  expandAll.value = true;
  handleExpandAll();
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取选中的权限
        formData.value.permissions = permissionCheckedKeys.value;
        
        // TODO: 对接实际API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isEdit.value) {
          // 编辑：更新列表中的数据
          const index = tableData.value.findIndex(item => item.id === formData.value.id);
          if (index !== -1) {
            tableData.value[index] = {
              ...tableData.value[index],
              parent: formData.value.parent,
              name: formData.value.name
            };
          }
          message("编辑成功", { type: "success" });
        } else {
          // 新增：添加到列表
          const newId = tableData.value.length > 0 
            ? Math.max(...tableData.value.map(item => item.id)) + 1 
            : 1;
          const pid = formData.value.parent ? parseInt(formData.value.parent) : 0;
          const newItem: TableRow = {
            id: newId,
            pid,
            name: formData.value.name,
            rules: permissionCheckedKeys.value.join(",") || "",
            createtime: Math.floor(Date.now() / 1000),
            updatetime: Math.floor(Date.now() / 1000),
            status: "normal",
            spacer: "",
            haschild: 0,
            parent: formData.value.parent ? (tableData.value.find(item => item.id === pid)?.name.replace(/&nbsp;|├|│|└/g, "").trim() || "无") : "无"
          };
          tableData.value.unshift(newItem);
          total.value += 1;
          message("新增成功", { type: "success" });
        }
        
        handleCloseDialog();
      } catch (error: any) {
        console.error("提交失败:", error);
        message(error?.message || "提交失败", { type: "error" });
      }
    }
  });
};

// 删除单条数据
const handleDelete = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      `确定删除角色"${row.name}"吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      total.value -= 1;
      message("删除成功", { type: "success" });
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    message("请选择要删除的数据", { type: "warning" });
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${multipleSelection.value.length} 条数据吗？`,
      "批量删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const ids = multipleSelection.value.map(item => item.id);
    tableData.value = tableData.value.filter(item => !ids.includes(item.id));
    total.value -= multipleSelection.value.length;
    multipleSelection.value = [];
    message("删除成功", { type: "success" });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      message(error?.message || "删除失败", { type: "error" });
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
          label: '操作'
        }"
        width="100%"
        height="90%"
        @selection-change="(val: TableRow[]) => multipleSelection = val"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">新增</span>
          </el-button>
          <el-button 
            type="success" 
            @click="handleEdit" 
            size="default"
            :disabled="multipleSelection.length !== 1"
          >
            <el-icon><component :is="Edit" /></el-icon>
            <span style="margin-left: 3px;">编辑</span>
          </el-button>
          <el-button 
            type="danger" 
            @click="handleBatchDelete" 
            size="default"
            :disabled="multipleSelection.length === 0"
          >
            <el-icon><component :is="Delete" /></el-icon>
            <span style="margin-left: 3px;">删除</span>
          </el-button>
        </template>
        <!-- 工具栏 -->
        <template #density-icon>
          <el-tooltip content="密度" placement="top">
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
          <el-tooltip content="列设置" placement="top">
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
          <el-tooltip content="导出" placement="top" :trigger="'hover'">
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
        <el-form-item label="父级">
          <el-select
            v-model="formData.parent"
            placeholder="请选择"
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
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="权限">
          <div class="permission-controls">
            <el-checkbox v-model="checkAll" @change="handleCheckAll">选中全部</el-checkbox>
            <el-checkbox v-model="expandAll" @change="handleExpandAll" style="margin-left: 20px">展开全部</el-checkbox>
          </div>
          <div class="permission-tree-container">
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTreeData"
              :props="{ children: 'children', label: 'label' }"
              node-key="id"
              :default-expand-all="expandAll"
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
                      查看
                    </el-checkbox>
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'add')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'add', val)"
                    >
                      添加
                    </el-checkbox>
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'edit')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'edit', val)"
                    >
                      编辑
                    </el-checkbox>
                    <el-checkbox
                      :model-value="isPermissionChecked(data.id, 'delete')"
                      @update:model-value="(val: boolean) => updatePermission(data.id, 'delete', val)"
                    >
                      删除xxxxxxxx
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
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
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
