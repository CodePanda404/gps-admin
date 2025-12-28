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
import {
  getAccountManagementList,
  getParentAdminList,
  getRoleManagementList,
  addAccount,
  editAccount,
  deleteBatchAccount,
  type AccountManagementItem,
  type AccountManagementListParams,
  type ParentAdminItem,
  type AddAccountParams,
  type EditAccountParams,
  type DeleteBatchAccountParams,
  type RoleManagementItem
} from "@/api/auth";
import {
  getCurrencyList,
  searchGameProductType,
  type CurrencyItem,
  type GameProductTypeSearchItem
} from "@/api/game";
import Upload from "~icons/ep/upload";
import Monitor from "~icons/ep/monitor";
import Grid from "~icons/ep/grid";
import Filter from "~icons/ep/filter";
import Plus from "~icons/ep/plus";
import Edit from "~icons/ep/edit";
import Refresh from "~icons/ep/refresh";
import Delete from "~icons/ep/delete";

/*  -----搜索表单相关-----  */
// 搜索表单数据
const searchData = ref({
  username: "",
  nickname: "",
  role_group: "",
  superior: "",
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
    label: "上级",
    prop: "superior",
    valueType: "select",
    fieldProps: computed(() => ({
      placeholder: "请选择上级",
      filterable: true
    })),
    options: computed(() => [
      { label: "全部", value: "" },
      ...superiorOptions.value.map(item => ({
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

// 角色组选项（从API获取）
const roleGroupOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取角色组列表
const getRoleGroupList = async () => {
  try {
    const res = await getRoleManagementList();
    
    if (res.code === 0 && res.data && res.data.rows) {
      roleGroupOptions.value = res.data.rows.map((item: RoleManagementItem) => {
        // 去除HTML实体和spacer，只显示纯名称
        const displayName = item.name.replace(/&nbsp;|├|│|└/g, "").trim();
        return {
          label: displayName,
          value: item.id
        };
      });
    }
  } catch (error: any) {
    console.error("获取角色组列表失败:", error);
  }
};

// 上级选项（从API获取）
const superiorOptions = ref<Array<{ label: string; value: number }>>([
  { label: "无", value: 0 }
]);

// 币种选项（从API获取）
const currencyOptions = ref<Array<{ label: string; value: string }>>([]);

// 游戏品牌选项（从API获取）
const gameBrandOptions = ref<Array<{ label: string; value: number }>>([]);

// 获取上级列表
const getSuperiorList = async () => {
  try {
    const res = await getParentAdminList({
      pageNumber: 1,
      pageSize: 1000 // 获取所有上级，设置一个较大的值
    });
    
    if (res.code === 0 && res.data && res.data.rows) {
      superiorOptions.value = [
        { label: "无", value: 0 },
        ...res.data.rows.map((item: ParentAdminItem) => ({
          label: item.username,
          value: item.id
        }))
      ];
    }
  } catch (error: any) {
    console.error("获取上级列表失败:", error);
  }
};

// 获取币种列表
const getCurrencyOptions = async () => {
  try {
    const res = await getCurrencyList({
      pageNumber: 1,
      pageSize: 1000,
      status: "1" // 只获取正常状态的币种
    });
    
    if (res.code === 0 && res.data && res.data.rows) {
      currencyOptions.value = res.data.rows.map((item: CurrencyItem) => ({
        label: item.name,
        value: item.name
      }));
    }
  } catch (error: any) {
    console.error("获取币种列表失败:", error);
  }
};

// 获取游戏产品类型列表（用于开通游戏下拉框）
const getGameBrandOptions = async () => {
  try {
    const res = await searchGameProductType({
      pageNumber: 1,
      pageSize: 1000 // 获取所有游戏产品类型
    });
    
    if (res.code === 0 && res.data && res.data.rows) {
      gameBrandOptions.value = res.data.rows.map((item: GameProductTypeSearchItem) => ({
        label: item.name,
        value: item.id
      }));
    }
  } catch (error: any) {
    console.error("获取游戏产品类型列表失败:", error);
  }
};

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
    superior: "",
    loginTime: [],
    createTime: [],
    status: ""
  };
  pageInfo.value.page = 1;
  getList();
};

// 表格数据类型（直接使用API响应类型，但需要扩展显示字段）
type TableRow = AccountManagementItem & {
  nickname?: string;
  role_group?: string;
  superior?: string;
  google_verify?: string;
  whitelist_ip?: string;
  remark?: string;
  login_time?: string;
};

// 多选选中数据
const multipleSelection = ref<TableRow[]>([]);
// 表格相关数据和操作
const { tableData, pageInfo, total, buttons: buttonsRef, loadingStatus } =
  useTable<TableRow[]>();

// 表格配置
const tableConfig: any = ref([
  {
    label: "用户名",
    prop: "username",
    minWidth: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "昵称",
    prop: "nickname",
    render: (value: string, row: TableRow) => {
      // 如果没有nickname，使用username
      return value || row.username || "-";
    },
    minWidth: 160,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "角色组",
    prop: "groups_text",
    render: (value: string) => {
      return value || "-";
    },
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "上级",
    prop: "agentname",
    render: (value: string) => {
      return value && value !== "-" ? value : "无";
    },
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
    prop: "google_status",
    minWidth: 100,
    render: (value: number) => {
      return value === 1 ? "启用" : "未启用";
    },
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "白名单IP",
    prop: "whitelist_ip",
    render: () => {
      // API响应中没有此字段，显示"-"
      return "-";
    },
    minWidth: 140,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "备注",
    prop: "remark",
    render: () => {
      // API响应中没有此字段，显示"-"
      return "-";
    },
    minWidth: 120,
    tableColumnProps: {
      align: "center"
    }
  },
  {
    label: "登录时间",
    prop: "logintime",
    width: 160,
    render: (value: number) => {
      if (!value || value === 0) return "-";
      // 将时间戳转换为日期时间字符串
      return dayjs.unix(value).format("YYYY-MM-DD HH:mm:ss");
    },
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
      const isNormal = value === "normal" || value === "1";
      return h(ElTag, {
        type: isNormal ? "success" : "danger"
      }, () => isNormal ? "正常" : "停用");
    },
    tableColumnProps: {
       sortable: true,
       fixed: "right",
       align: "center"
    }
  }
]);


// 表格操作栏按钮定义
buttonsRef.value = [
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
    },
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
    const { page, pageSize } = pageInfo.value;
    const { username, nickname, role_group, superior, loginTime, createTime, status } = searchData.value;
    
    const params: AccountManagementListParams = {
      pageNumber: page,
      pageSize,
      username: username || undefined,
      status: status || undefined
    };
    
    // 处理上级参数（如果API支持）
    if (superior) {
      // TODO: 根据实际API参数名调整
      // params.pid = superior;
    }
    
    // 处理创建时间范围
    if (createTime && Array.isArray(createTime) && createTime.length === 2) {
      params.create_start_time = createTime[0];
      params.create_end_time = createTime[1];
    }
    
    // 处理登录时间范围（API可能不支持，但先保留）
    // if (loginTime && Array.isArray(loginTime) && loginTime.length === 2) {
    //   // API可能没有登录时间范围参数
    // }
    
    const res = await getAccountManagementList(params);
    
    if (res.code === 0 && res.data && res.data.rows) {
      // 转换数据以匹配表格显示
      tableData.value = res.data.rows.map((item: AccountManagementItem) => ({
        ...item,
        nickname: item.username, // 如果没有nickname，使用username
        role_group: item.groups_text || "",
        superior: item.agentname || "无",
        google_verify: item.google_status === 1 ? "1" : "0",
        whitelist_ip: "", // API响应中没有此字段
        remark: "", // API响应中没有此字段
        login_time: item.logintime && item.logintime > 0 
          ? dayjs.unix(item.logintime).format("YYYY-MM-DD HH:mm:ss")
          : ""
      })) as any[];
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
getSuperiorList(); // 先加载上级列表
getRoleGroupList(); // 加载角色组列表
getCurrencyOptions(); // 加载币种列表
getGameBrandOptions(); // 加载游戏品牌列表
getList();

// 对话框相关
const showDialog = ref(false);
const dialogTitle = ref("新增");
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const formData = ref({
  id: 0,
  role_group: "",
  superior: "0",
  username: "",
  nickname: "",
  email: "",
  password: "",
  type: "1", // 账号类型,1正式账号2测试账号
  wallet_type: "1", // 钱包类型,1单一2转账
  version: "1.0", // API版本,1.0/2.0
  currency: "", // 币种
  type_ids: [] as number[], // 开通游戏,传品牌ID数组
  google_verify: "1",
  google_secret: "",
  whitelist_ip: "",
  remark: "",
  status: "normal" // 状态,normal正常,hidden禁用
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
    { type: "email" as const, message: "请输入正确的邮箱格式", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 30, message: "密码长度必须在6-30位之间", trigger: "blur" }
  ]
};

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = "添加";
  formData.value = {
    id: 0,
    role_group: "",
    superior: "0",
    username: "",
    nickname: "",
    email: "",
    password: "",
    type: "1",
    wallet_type: "1",
    version: "1.0",
    currency: "",
    type_ids: [],
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
  // 查找上级ID（根据pid查找）
  let superiorId = "0";
  if (row.pid && row.pid !== 0) {
    const superiorItem = superiorOptions.value.find(item => item.value === row.pid);
    if (superiorItem) {
      superiorId = superiorItem.value.toString();
    }
  }
  
  // 查找角色组ID（根据groups_text查找对应的角色ID）
  let roleGroupId = "";
  if (row.groups_text || row.role_group) {
    const roleGroupName = row.groups_text || row.role_group || "";
    const roleGroupItem = roleGroupOptions.value.find(item => item.label === roleGroupName);
    if (roleGroupItem) {
      roleGroupId = roleGroupItem.value.toString();
    }
  }
  
  formData.value = {
    id: row.id,
    role_group: roleGroupId,
    superior: superiorId,
    username: row.username,
    nickname: row.nickname || row.username,
    email: row.email,
    password: "", // 编辑时也需要输入密码
    type: "1", // TODO: 从API获取账号类型
    wallet_type: row.wallet_type?.toString() || "1", // TODO: 从API获取钱包类型
    version: "1.0", // TODO: 从API获取API版本
    currency: "", // TODO: 从API获取币种
    type_ids: [], // TODO: 从API获取开通游戏
    google_verify: row.google_status === 1 ? "1" : "0",
    google_secret: "SDFDHGKJHKJHJRH455RHH5H534H", // 模拟密钥
    whitelist_ip: row.whitelist_ip || "",
    remark: row.remark || "",
    status: row.status,
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
        if (isEdit.value) {
          // 编辑：调用API
          const pid = formData.value.superior && formData.value.superior !== "0" 
            ? parseInt(formData.value.superior) 
            : 0;
          
          // 将type_ids数组转换为逗号分隔的字符串
          const typeIdsStr = formData.value.type_ids.length > 0
            ? formData.value.type_ids.join(",")
            : "";
          
          const params: EditAccountParams = {
            id: formData.value.id,
            group_id: formData.value.role_group,
            pid: pid,
            google_status: formData.value.google_verify === "1" ? 1 : 0,
            password: formData.value.password,
            type_ids: typeIdsStr
          };
          
          const res = await editAccount(params);
          
          if (res.code === 0) {
            message("编辑成功", { type: "success" });
            handleCloseDialog();
            // 刷新列表
            getList();
          } else {
            message(res.msg || "编辑失败", { type: "error" });
          }
        } else {
          // 新增：调用API
          const pid = formData.value.superior && formData.value.superior !== "0" 
            ? parseInt(formData.value.superior) 
            : 0;
          
          // 将type_ids数组转换为逗号分隔的字符串
          const typeIdsStr = formData.value.type_ids.length > 0
            ? formData.value.type_ids.join(",")
            : undefined;
          
          const params: AddAccountParams = {
            group_id: formData.value.role_group,
            pid: pid,
            username: formData.value.username,
            password: formData.value.password,
            type: formData.value.type,
            wallet_type: formData.value.wallet_type,
            version: formData.value.version,
            currency: formData.value.currency,
            type_ids: typeIdsStr,
            status: formData.value.status,
            nickname: formData.value.nickname || undefined
          };
          
          const res = await addAccount(params);
          
          if (res.code === 0) {
            message("新增成功", { type: "success" });
            handleCloseDialog();
            // 刷新列表
            getList();
          } else {
            message(res.msg || "新增失败", { type: "error" });
          }
        }
        
        // 编辑成功后关闭对话框
        if (isEdit.value) {
          handleCloseDialog();
        }
      } catch (error: any) {
        console.error("提交失败:", error);
        message(error?.message || "提交失败", { type: "error" });
      }
    }
  });
};

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    message("请先选择要删除的数据！", { type: "warning" });
    return;
  }

  // 检查是否有正常状态的账号（只能删除停用状态的账号）
  const normalAccounts = multipleSelection.value.filter(
    row => row.status === "normal" || row.status === "1"
  );
  if (normalAccounts.length > 0) {
    message("只能删除停用状态的账号", { type: "warning" });
    return;
  }

  const usernames = multipleSelection.value.map(item => item.username).join("、");
  const confirmMessage = `确定删除选中的 ${multipleSelection.value.length} 条账号数据？\n账号：${usernames}`;

  try {
    await ElMessageBox.confirm(confirmMessage, "批量删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const ids = multipleSelection.value.map(item => item.id).join(",");
    const params: DeleteBatchAccountParams = { ids };
    const res = await deleteBatchAccount(params);

    if (res.code === 0) {
      message("删除成功", { type: "success" });
      getList();
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

// 删除单条数据（只有停用状态显示，使用批量删除API）
const handleDelete = async (row: TableRow) => {
  const isNormal = row.status === "normal" || row.status === "1";
  if (isNormal) {
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
    
    const params: DeleteBatchAccountParams = { ids: row.id.toString() };
    const res = await deleteBatchAccount(params);
    
    if (res.code === 0) {
      message("删除成功", { type: "success" });
      getList();
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
</script>

<template>
  <div class="account-management-container">
    <!-- 搜索表单 -->
    <el-card v-show="showSearch" class="search-card">
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
    <el-card class="table-card">
      <PlusTable
        v-loading="loadingStatus"
        :columns="tableConfig"
        :table-data="tableData"
        :stripe="true"
        :is-selection="true"
        :action-bar="{
          buttons: buttonsRef,
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
              :value="item.value.toString()"
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
              :value="item.value.toString()"
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
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入"
            show-password
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="账号类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="1">正式账号</el-radio>
            <el-radio label="2">测试账号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="钱包类型" prop="wallet_type">
          <el-radio-group v-model="formData.wallet_type">
            <el-radio label="1">单一</el-radio>
            <el-radio label="2">转账</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="API版本" prop="version">
          <el-select
            v-model="formData.version"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="1.0" value="1.0" />
            <el-option label="2.0" value="2.0" />
          </el-select>
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-select
            v-model="formData.currency"
            placeholder="请选择"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in currencyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开通游戏">
          <el-select
            v-model="formData.type_ids"
            placeholder="请选择游戏品牌"
            style="width: 100%"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in gameBrandOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="-1">停用</el-radio>
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
  padding: 0 20px;
}

.search-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 0;
}

.table-card {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}
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
