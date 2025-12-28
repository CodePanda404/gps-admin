import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// ==================== 操作日志相关接口 ====================

/** 操作日志列表项 */
export type OperationLogItem = {
  id: number;
  username: string;
  title: string;
  content: string;
  url: string;
  ip: string;
  useragent: string;
  createtime: string;
};

/** 操作日志列表查询参数 */
export type OperationLogListParams = {
  username?: string;
  title?: string;
  content?: string;
  url?: string;
  ip?: string;
  create_start_time?: string;
  create_end_time?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 操作日志列表响应 */
export type OperationLogListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: OperationLogItem[];
  };
};

/** 获取操作日志列表 */
export const getOperationLogList = (params?: OperationLogListParams) => {
  return http.request<OperationLogListResult>(
    "get",
    baseUrlApi("/log/adminlog/index"),
    { params }
  );
};

// ==================== 游戏测试日志相关接口 ====================

/** 游戏测试日志列表项 */
export type GameTestLogItem = {
  id: number;
  method: string;
  wallet_type: number;
  currency: string;
  type_id: number;
  type_name: string;
  shortname: string;
  game_id: string;
  up_game_id: string | null;
  provider: string | null;
  merchant_id: number;
  merchant_name: string;
  username: string;
  status: number;
  request_header: string;
  request_body: string;
  request_url: string;
  request_result: string;
  gameapi_url: string;
  gameapi_data: string;
  gameapi_result: string;
  message: string;
  createtime: string;
  error_code: string | null;
  error_message: string | null;
  game_url: string | null;
};

/** 游戏测试日志列表查询参数 */
export type GameTestLogListParams = {
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

/** 游戏测试日志列表响应 */
export type GameTestLogListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: GameTestLogItem[];
  };
};

/** 获取游戏测试日志列表 */
export const getGameTestLogList = (params?: GameTestLogListParams) => {
  return http.request<GameTestLogListResult>(
    "get",
    baseUrlApi("/log/gametestlog/index"),
    { params }
  );
};

/** 游戏测试日志详情响应 */
export type GameTestLogDetailResult = {
  code: number;
  msg: string;
  data: GameTestLogItem;
};

/** 获取游戏测试日志详情 */
export const getGameTestLogDetail = (id: string | number) => {
  return http.request<GameTestLogDetailResult>(
    "get",
    baseUrlApi("/log/gametestlog/detail"),
    { params: { id } }
  );
};

