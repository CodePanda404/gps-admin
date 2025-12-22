import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/** 代理列表项 */
export type AgentItem = {
  id: number;
  username: string;
  nickname: string;
  parent_name: string;
  groups_text: string;
  merchant_pro_num: number;
  merchant_test_num: number;
  status: string; // "normal"-正常, "hidden"-隐藏
  createtime: string;
  updatetime: string;
};

/** 代理列表查询参数 */
export type AgentListParams = {
  /** 代理ID */
  id?: string | number;
  /** 代理账号 */
  username?: string;
  /** 状态 */
  status?: string;
  /** 登录开始时间 */
  login_start_time?: string;
  /** 登录结束时间 */
  login_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 代理列表响应 */
export type AgentListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: AgentItem[];
  };
};

/** 切换代理状态参数 */
export type SwitchAgentStatusParams = {
  /** 代理ID */
  id: number | string;
  /** 新状态 */
  status: string;
};

/** 切换代理状态响应 */
export type SwitchAgentStatusResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 获取代理列表 */
export const getAgentList = (params?: AgentListParams) => {
  return http.request<AgentListResult>(
    "get",
    baseUrlApi("/agent/agent/index"),
    { params }
  );
};

/** 切换代理状态 */
export const switchAgentStatus = (data?: SwitchAgentStatusParams) => {
  return http.request<SwitchAgentStatusResult>(
    "post",
    baseUrlApi("/agent/agent/status"),
    { data }
  );
};

/** 商户列表项 */
export type MerchantItem = {
  id: number;
  username: string;
  nickname: string;
  parent_name: string;
  groups_text: string;
  merchant_pro_num: number;
  merchant_test_num: number;
  status: string; // "normal"-正常, "hidden"-隐藏
  createtime: string;
  updatetime: string;
};

/** 商户列表查询参数 */
export type MerchantListParams = {
  /** 商户ID */
  id?: string | number;
  /** 用户名 */
  username?: string;
  /** 状态 */
  status?: string;
  /** 登录开始时间 */
  login_start_time?: string;
  /** 登录结束时间 */
  login_end_time?: string;
  /** 钱包类型 */
  wallet_type?: string;
  /** 币种 */
  currency?: string;
  /** 商户类型 */
  type?: string;
  /** API-KEY */
  api_key?: string;
  /** 关联产品ID */
  pid?: string | number;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 商户列表响应 */
export type MerchantListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: MerchantItem[];
  };
};

/** 切换商户状态参数 */
export type SwitchMerchantStatusParams = {
  /** 商户ID */
  id: number | string;
  /** 新状态 */
  status: string;
};

/** 切换商户状态响应 */
export type SwitchMerchantStatusResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 获取商户列表 */
export const getMerchantList = (params?: MerchantListParams) => {
  return http.request<MerchantListResult>(
    "get",
    baseUrlApi("/agent/merchant/index"),
    { params }
  );
};

/** 切换商户状态 */
export const switchMerchantStatus = (data?: SwitchMerchantStatusParams) => {
  return http.request<SwitchMerchantStatusResult>(
    "post",
    baseUrlApi("/agent/merchant/status"),
    { data }
  );
};

