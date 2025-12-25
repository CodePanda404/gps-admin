<script setup lang="ts">
import { ref, computed, h } from "vue";
import dayjs from "dayjs";
defineOptions({
  name: "AccountManagement"
});
import { type PlusColumn, PlusSearch, PlusTable, PlusPagination } from "plus-pro-components";
import { useTable } from "plus-pro-components";
import { message } from "@/utils/message";
import { ElMessageBox, ElTag, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElButton, ElRadioGroup, ElRadio, ElSelect, ElOption, type FormInstance } from "element-plus";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Refresh from "~icons/ep/refresh";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  username: "",
  nickname: "",
  role_group: "",
  loginTime: [] as string[],
  createTime: [] as string[],
  status: ""
});

// 搜索表单显示控制
const showSearch = ref(true);

// 搜索表单配置
const searchColumns: PlusColumn[] = [
  {
    label: "用户名",
    prop: "username",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入用户名"
    }))
  },
  {
    label: "昵称",
    prop: "nickname",
    valueType: "copy",
    fieldProps: computed(() => ({
      placeholder: "请输入昵称"
    }))
  },
  {
    label: "角色组",
    prop: "role_group",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择角色组",
      filterable: true
    })),
    options: computed(() => [
      { label: "全部", value: "" },
      ...roleGroupOptions.value.map(item => ({
        label: item.label,
        value: item.value.toString()
      }))
    ])
  },
  {
    label: "登录时间",
    prop: "loginTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: "开始日期时间",
      endPlaceholder: "结束日期时间",
      shortcuts: [
        {
          text: "今天",
          value: () => {
            const today = dayjs();
            return [
              today.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              today.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "昨天",
          value: () => {
            const yesterday = dayjs().subtract(1, "day");
            return [
              yesterday.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              yesterday.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "最近7天",
          value: () => {
            const end = dayjs();
            const start = dayjs().subtract(6, "day");
            return [
              start.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              end.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        }
      ]
    }))
  },
  {
    label: "创建时间",
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: computed(() => ({
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      startPlaceholder: "开始日期时间",
      endPlaceholder: "结束日期时间",
      shortcuts: [
        {
          text: "今天",
          value: () => {
            const today = dayjs();
            return [
              today.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              today.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "昨天",
          value: () => {
            const yesterday = dayjs().subtract(1, "day");
            return [
              yesterday.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              yesterday.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        },
        {
          text: "最近7天",
          value: () => {
            const end = dayjs();
            const start = dayjs().subtract(6, "day");
            return [
              start.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
              end.endOf("day").format("YYYY-MM-DD HH:mm:ss")
            ];
          }
        }
      ]
    }))
  },
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择"
    })),
    options: [
      { label: "全部", value: "" },
      { label: "正常", value: "1" },
      { label: "停用", value: "0" }
    ]
  }
];

// 角色组选项（模拟数据，后续对接API）
const roleGroupOptions = ref([
  { label: "管理员", value: 1 },
  { label: "普通用户", value: 2 },
  { label: "代理商", value: 3 }
]);

// 上级选项（模拟数据，后续对接API）
const superiorOptions = ref([
  { label: "无", value: 0 },
  { label: "管理员", value: 1 }
]);

// 点击搜索按钮
const handleSearch = (values: any) => {
  pageInfo.value.page = 1;
  getList();
};

// 重置搜索表单
const handleRest = () => {
  searchData.value = {
    username: "",
    nickname: "",
    role_group: "",
    loginTime: [],
    createTime: [],
    status: ""
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型
type TableRow = {
  id: number;
  username: string;
  nickname: string;
  role_group: string;
  superior: string;
  email: string;
  google_verify: string;
  whitelist_ip: string;
  remark: string;
  login_time: string;
  createtime: string;
  status: string;
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, pageInfo, total, buttons, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "用户名",
    prop: "username",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "昵称",
    prop: "nickname",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "角色组",
    prop: "role_group",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "上级",
    prop: "superior",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "关联邮箱",
    prop: "email",
    minWidth: 240,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "谷歌验证",
    prop: "google_verify",
    minWidth: 100,
    render: (value: string) => {
      return value === "1" ? "启用" : "未启用";
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "白名单IP",
    prop: "whitelist_ip",
    minWidth: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    prop: "remark",
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "登录时间",
    prop: "login_time",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "创建时间",
    prop: "createtime",
    width: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    render: (value: string) => {
      return h(ElTag, {
        type: value === "1" ? "success" : "danger"
      }, () => value === "1" ? "正常" : "停用");
    },
    tableColumnProps: {
       sortable: true,
       fixed: "right",
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
  }
];

// 表格选中数据变化时更新按钮
const handleSelectionChange = (val: TableRow[]) => {
  multipleSelection.value = val;
};

// 获取列表数据
const getList = async () => {
  loadingStatus.value = true;
  try {
    // TODO: 对接实际API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        username: "admin",
        nickname: "管理员",
        role_group: "管理员",
        superior: "无",
        email: "admin@example.com",
        google_verify: "1",
        whitelist_ip: "192.168.1.1",
        remark: "系统管理员",
        login_time: "2024-01-01 10:00:00",
        createtime: "2024-01-01 00:00:00",
        status: "1"
      },
      {
        id: 2,
        username: "user1",
        nickname: "用户1",
        role_group: "普通用户",
        superior: "管理员",
        email: "user1@example.com",
        google_verify: "0",
        whitelist_ip: "",
        remark: "",
        login_time: "2024-01-02 10:00:00",
        createtime: "2024-01-02 00:00:00",
        status: "1"
      },
      {
        id: 3,
        username: "user2",
        nickname: "用户2",
        role_group: "普通用户",
        superior: "管理员",
        email: "user2@example.com",
        google_verify: "0",
        whitelist_ip: "",
        remark: "",
        login_time: "",
        createtime: "2024-01-03 00:00:00",
        status: "0"
      }
    ];
    total.value = tableData.value.length;
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
  role_group: "",
  superior: "",
  username: "",
  nickname: "",
  email: "",
  password: "",
  google_verify: "1",
  google_secret: "",
  whitelist_ip: "",
  remark: "",
  status: "1"
});

// 表单验证规则
const formRules = {
  role_group: [
    { required: true, message: "请选择角色组", trigger: "change" }
  ],
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" }
  ],
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" }
  ],
  email: [
    { required: true, message: "请输入关联邮箱", trigger: "blur" },
    { type: "email" as const, message: "请输入正确的邮箱格式", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加";
  formData.value = {
    id: 0,
    role_group: "",
    superior: "",
    username: "",
    nickname: "",
    email: "",
    password: "",
    google_verify: "0",
    google_secret: "",
    whitelist_ip: "",
    remark: "",
    status: "1"
  };
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
  formData.value = {
    id: row.id,
    role_group: row.role_group,
    superior: row.superior,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    password: "", // 编辑时不显示密码
    google_verify: row.google_verify || "0",
    google_secret: "SDFDHGKJHKJHJRH455RHH5H534H", // 模拟密钥
    whitelist_ip: row.whitelist_ip || "",
    remark: row.remark || "",
    status: row.status || "1"
  };
  showDialog.value = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  showDialog.value = false;
  formRef.value?.resetFields();
};

// 刷新谷歌验证密钥
const handleRefreshGoogleSecret = () => {
  // TODO: 调用API生成新的密钥
  formData.value.google_secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15).toUpperCase();
  message("密钥已刷新", { type: "success" });
};

// 显示二维码
const handleShowQrCode = () => {
  // TODO: 显示二维码弹窗
  message("二维码功能待实现", { type: "info" });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 对接实际API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isEdit.value) {
          // 编辑：更新列表中的数据
          const index = tableData.value.findIndex(item => item.id === formData.value.id);
          if (index !== -1) {
            tableData.value[index] = {
              ...tableData.value[index],
              username: formData.value.username,
              nickname: formData.value.nickname,
              role_group: formData.value.role_group,
              superior: formData.value.superior,
              email: formData.value.email,
              google_verify: formData.value.google_verify,
              whitelist_ip: formData.value.whitelist_ip,
              remark: formData.value.remark,
              status: formData.value.status
            };
          }
          message("编辑成功", { type: "success" });
        } else {
          // 新增：添加到列表
          const newId = tableData.value.length > 0 
            ? Math.max(...tableData.value.map(item => item.id)) + 1 
            : 1;
          const newItem: TableRow = {
            id: newId,
            username: formData.value.username,
            nickname: formData.value.nickname,
            role_group: formData.value.role_group,
            superior: formData.value.superior || "无",
            email: formData.value.email,
            google_verify: formData.value.google_verify,
            whitelist_ip: formData.value.whitelist_ip,
            remark: formData.value.remark,
            login_time: "",
            createtime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            status: formData.value.status
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

// 删除单条数据（只有停用状态显示）
const handleDelete = async (row: TableRow) => {
  if (row.status === "1") {
    message("只能删除停用状态的账号", { type: "warning" });
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定删除账号"${row.username}"吗？`,
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
</script>

<template>
  <div class="account-management-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card" shadow="never" style="margin: 20px">
      <PlusSearch
        v-model="searchData"
        :columns="searchColumns"
        label-width="80"
        label-position="right"
        :has-unfold="false"
        searchText="搜索"
        resetText="重置"
        @search="handleSearch"
        @reset="handleRest"
      />
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never" style="margin: 20px">
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
        @selection-change="handleSelectionChange"
      >
        <!-- 表格操作栏按钮 -->
        <template #title>
          <el-button type="primary" @click="handleAdd" size="default">
            <el-icon><component :is="Plus" /></el-icon>
            <span style="margin-left: 3px;">添加</span>
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
          <!-- 筛选：点击切换搜索表单显示/隐藏 -->
          <el-tooltip
            :content="showSearch ? '隐藏搜索' : '显示搜索'"
            placement="top"
            :trigger="'hover'"
          >
            <span style="display: inline-block">
              <el-icon
                :size="18"
                style="
                  margin-right: 15px;
                  cursor: pointer;
                  outline: none;
                "
                color="#606266"
                @click="showSearch = !showSearch"
              >
                <component :is="Filter" />
              </el-icon>
            </span>
          </el-tooltip>
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
      width="600px"
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
        <el-form-item label="角色组" prop="role_group">
          <el-select
            v-model="formData.role_group"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in roleGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上级">
          <el-select
            v-model="formData.superior"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in superiorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="formData.nickname"
            placeholder="请输入"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="关联邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入"
            show-password
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="谷歌验证">
         <el-radio-group v-model="formData.google_verify">
            <el-radio label="1">开启</el-radio>
            <el-radio label="0">关闭</el-radio>
         </el-radio-group>
        </el-form-item>
        <el-form-item>                    
          <div v-if="formData.google_verify === '1'" style="width: 100%">
            <el-input
              v-model="formData.google_secret"
              placeholder="密钥"
              readonly
              disabled
              style="width: 80%"
            />
            <el-button type="primary" @click="handleRefreshGoogleSecret" style="margin-left: 10px;">
               <el-icon><component :is="Refresh" /></el-icon>
               <span style="margin-left: 3px;">刷新</span>
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="API 白名单">
          <el-input
            v-model="formData.whitelist_ip"
            type="textarea"
            :rows="4"
            placeholder="请输入"
            maxlength="500"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            多个白名单以英文逗号隔开
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            placeholder="请输入"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">停用</el-radio>
          </el-radio-group>
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
.account-management-container {
  width: 100%;
}

.dialog-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
