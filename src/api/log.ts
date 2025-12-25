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

