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

// ==================== 商户产品相关接口 ====================

/** 商户产品列表项 */
export type MerchantProductItem = {
  id: number;
  type_name: string;
  product_name: string;
  product_code: string;
  merchant_id: number;
  merchant_name: string;
  wallet_type: number;
  currency: string;
  game_type: string;
  support_state: string;
  price: string;
  agent_price: string;
  status: string;
  createtime: string;
  updatetime: string;
};

/** 商户产品列表查询参数 */
export type MerchantProductListParams = {
  id?: string | number;
  type_name?: string;
  status?: string;
  update_start_time?: string;
  update_end_time?: string;
  pageNumber?: number;
  pageSize?: number;
  currency?: string;
  merchant_id?: string | number;
};

/** 商户产品列表响应 */
export type MerchantProductListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: MerchantProductItem[];
  };
};

/** 获取商户产品列表 */
export const getMerchantProductList = (params?: MerchantProductListParams) => {
  return http.request<MerchantProductListResult>(
    "get",
    baseUrlApi("/agent/product/index"),
    { params }
  );
};

/** 编辑商户产品参数 */
export type EditMerchantProductParams = {
  id: string | number;
  type_name: string;
  currency: string;
  price: string | number;
  agent_price: string | number;
};

/** 编辑商户产品响应 */
export type EditMerchantProductResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑商户产品 */
export const editMerchantProduct = (params: EditMerchantProductParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("type_name", params.type_name);
  formData.append("currency", params.currency);
  formData.append("price", params.price.toString());
  formData.append("agent_price", params.agent_price.toString());

  return http.request<EditMerchantProductResult>(
    "post",
    baseUrlApi("/agent/product/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 批量删除商户产品参数 */
export type DeleteBatchMerchantProductParams = {
  ids: string;
};

/** 批量删除商户产品响应 */
export type DeleteBatchMerchantProductResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 批量删除商户产品 */
export const deleteBatchMerchantProduct = (params: DeleteBatchMerchantProductParams) => {
  const formData = new FormData();
  formData.append("ids", params.ids);

  return http.request<DeleteBatchMerchantProductResult>(
    "post",
    baseUrlApi("/agent/product/del_batch"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 测试游戏参数 */
export type TestMerchantProductParams = {
  id: string | number;
};

/** 测试游戏响应 */
export type TestMerchantProductResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 测试游戏 */
export const testMerchantProduct = (params: TestMerchantProductParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());

  return http.request<TestMerchantProductResult>(
    "post",
    baseUrlApi("/agent/product/test_game"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

