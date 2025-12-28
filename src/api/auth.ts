import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// ==================== 账号管理相关接口 ====================

/** 账号管理列表项 */
export type AccountManagementItem = {
  id: number;
  pid: number;
  wallet_type: number;
  username: string;
  email: string;
  status: string;
  logintime: number;
  google_status: number;
  agentname: string;
  groups: string;
  groups_text: string;
  createtime: string;
};

/** 账号管理列表查询参数 */
export type AccountManagementListParams = {
  id?: string | number;
  wallet_type?: string | number;
  currency?: string;
  game_id?: string;
  create_start_time?: string;
  create_end_time?: string;
  error_message?: string;
  type_id?: string | number;
  type_name?: string;
  shortname?: string;
  merchant_id?: string | number;
  merchant_name?: string;
  username?: string;
  status?: string | number;
  pageNumber?: number;
  pageSize?: number;
};

/** 账号管理列表响应 */
export type AccountManagementListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: AccountManagementItem[];
  };
};

/** 获取账号管理列表 */
export const getAccountManagementList = (params?: AccountManagementListParams) => {
  return http.request<AccountManagementListResult>(
    "get",
    baseUrlApi("/auth/admin/index"),
    { params }
  );
};

/** 新增账号参数 */
export type AddAccountParams = {
  group_id: string | number;
  pid: string | number;
  username: string;
  password: string;
  type: string | number; // 账号类型,1正式账号2测试账号
  wallet_type: string | number; // 钱包类型,1单一2转账
  version: string; // API版本,1.0/2.0
  currency: string; // 币种,传name
  type_ids?: string; // 开通游戏,传品牌ID,多个用逗号间隔开
  status?: string; // 状态,normal正常,hidden禁用
  nickname?: string; // 昵称,非必填
};

/** 新增账号响应 */
export type AddAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增账号 */
export const addAccount = (params: AddAccountParams) => {
  const formData = new FormData();
  formData.append("group_id", params.group_id.toString());
  formData.append("pid", params.pid.toString());
  formData.append("username", params.username);
  formData.append("password", params.password);
  formData.append("type", params.type.toString());
  formData.append("wallet_type", params.wallet_type.toString());
  formData.append("version", params.version);
  formData.append("currency", params.currency);
  
  if (params.type_ids) {
    formData.append("type_ids", params.type_ids);
  }
  if (params.status) {
    formData.append("status", params.status);
  }
  if (params.nickname) {
    formData.append("nickname", params.nickname);
  }

  return http.request<AddAccountResult>(
    "post",
    baseUrlApi("/auth/admin/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑账号参数 */
export type EditAccountParams = {
  id: string | number;
  group_id: string | number;
  pid: string | number;
  google_status: string | number; // 0或1
  password: string;
  type_ids?: string; // 可选，多个用逗号分隔
};

/** 编辑账号响应 */
export type EditAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑账号 */
export const editAccount = (params: EditAccountParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("group_id", params.group_id.toString());
  formData.append("pid", params.pid.toString());
  formData.append("google_status", params.google_status.toString());
  formData.append("password", params.password);
  
  if (params.type_ids !== undefined) {
    formData.append("type_ids", params.type_ids || "");
  }

  return http.request<EditAccountResult>(
    "post",
    baseUrlApi("/auth/admin/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 批量删除账号参数 */
export type DeleteBatchAccountParams = {
  ids: string; // 多个ID用逗号分隔
};

/** 批量删除账号响应 */
export type DeleteBatchAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 批量删除账号 */
export const deleteBatchAccount = (params: DeleteBatchAccountParams) => {
  const formData = new FormData();
  formData.append("ids", params.ids);

  return http.request<DeleteBatchAccountResult>(
    "post",
    baseUrlApi("/auth/admin/del_batch"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

// ==================== 菜单管理相关接口 ====================

/** 菜单列表项 */
export type MenuItem = {
  id: number;
  pid: number;
  name: string;
  title: string;
  icon: string;
  url: string;
  ismenu: number;
  menutype: string;
  extend: string;
  py?: string;
  pinyin?: string;
  weigh: number;
  status: string;
  haschild?: number;
};

/** 菜单列表查询参数 */
export type MenuListParams = {
  id?: string | number;
  title?: string;
  name?: string;
  status?: string;
  ismenu?: string | number;
  pageNumber?: number;
  pageSize?: number;
};

/** 菜单列表响应 */
export type MenuListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    rows: MenuItem[];
  };
};

/** 获取菜单列表 */
export const getMenuList = (params?: MenuListParams) => {
  return http.request<MenuListResult>(
    "get",
    baseUrlApi("/auth/rule/index"),
    { params }
  );
};

/** 添加菜单参数 */
export type AddMenuParams = {
  ismenu: string | number;
  pid: string | number;
  name: string;
  title: string;
  url?: string;
  icon?: string;
  condition?: string;
  menutype?: string;
  extend?: string;
  remark?: string;
  weigh: string | number;
  status: string;
};

/** 添加菜单响应 */
export type AddMenuResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 添加菜单 */
export const addMenu = (params: AddMenuParams) => {
  const formData = new FormData();
  formData.append("ismenu", params.ismenu.toString());
  formData.append("pid", params.pid.toString());
  formData.append("name", params.name);
  formData.append("title", params.title);
  if (params.url !== undefined) {
    formData.append("url", params.url);
  }
  if (params.icon !== undefined) {
    formData.append("icon", params.icon);
  }
  if (params.condition !== undefined) {
    formData.append("condition", params.condition);
  }
  if (params.menutype !== undefined) {
    formData.append("menutype", params.menutype);
  }
  if (params.extend !== undefined) {
    formData.append("extend", params.extend);
  }
  if (params.remark !== undefined) {
    formData.append("remark", params.remark);
  }
  formData.append("weigh", params.weigh.toString());
  formData.append("status", params.status);

  return http.request<AddMenuResult>(
    "post",
    baseUrlApi("/auth/rule/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑菜单参数 */
export type EditMenuParams = {
  id: string | number;
  ismenu: string | number;
  pid: string | number;
  name: string;
  title: string;
  url?: string;
  icon?: string;
  condition?: string;
  menutype?: string;
  extend?: string;
  remark?: string;
  weigh: string | number;
  status: string;
};

/** 编辑菜单响应 */
export type EditMenuResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑菜单 */
export const editMenu = (params: EditMenuParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("ismenu", params.ismenu.toString());
  formData.append("pid", params.pid.toString());
  formData.append("name", params.name);
  formData.append("title", params.title);
  if (params.url !== undefined) {
    formData.append("url", params.url);
  }
  if (params.icon !== undefined) {
    formData.append("icon", params.icon);
  }
  if (params.condition !== undefined) {
    formData.append("condition", params.condition);
  }
  if (params.menutype !== undefined) {
    formData.append("menutype", params.menutype);
  }
  if (params.extend !== undefined) {
    formData.append("extend", params.extend);
  }
  if (params.remark !== undefined) {
    formData.append("remark", params.remark);
  }
  formData.append("weigh", params.weigh.toString());
  formData.append("status", params.status);

  return http.request<EditMenuResult>(
    "post",
    baseUrlApi("/auth/rule/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 批量删除菜单参数 */
export type DeleteBatchMenuParams = {
  ids: string; // 多个ID用逗号分隔
};

/** 批量删除菜单响应 */
export type DeleteBatchMenuResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 批量删除菜单 */
export const deleteBatchMenu = (params: DeleteBatchMenuParams) => {
  const formData = new FormData();
  formData.append("ids", params.ids);

  return http.request<DeleteBatchMenuResult>(
    "post",
    baseUrlApi("/auth/rule/del_batch"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

// ==================== 角色管理相关接口 ====================

/** 角色管理列表项 */
export type RoleManagementItem = {
  id: number;
  pid: number;
  name: string;
  rules: string;
  createtime: number;
  updatetime: number;
  status: string;
  spacer: string;
  haschild: number;
};

/** 角色管理列表响应 */
export type RoleManagementListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    rows: RoleManagementItem[];
  };
};

/** 获取角色管理列表 */
export const getRoleManagementList = () => {
  return http.request<RoleManagementListResult>(
    "get",
    baseUrlApi("/auth/group/index")
  );
};

// ==================== 上级管理员相关接口 ====================

/** 上级管理员列表项 */
export type ParentAdminItem = {
  id: number;
  pid: number;
  username: string;
  wallet_type: number;
  email: string;
  status: string;
  logintime: number;
  google_status: number;
};

/** 上级管理员列表查询参数 */
export type ParentAdminListParams = {
  pageNumber?: number;
  pageSize?: number;
  username?: string;
};

/** 上级管理员列表响应 */
export type ParentAdminListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: ParentAdminItem[];
  };
};

/** 获取上级管理员列表 */
export const getParentAdminList = (params?: ParentAdminListParams) => {
  return http.request<ParentAdminListResult>(
    "get",
    baseUrlApi("/auth/admin/parent_admin"),
    { params }
  );
};

