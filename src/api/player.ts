import { http } from "@/utils/http";

/** 转账模式玩家列表项 */
export type TransferPlayerItem = {
  id: number;
  name: string;
  balance: number;
  currency: string;
  merchant: string;
  totalBet: number;
  totalPet: number;
  totalWinLoss: number;
  loginTime: string;
  loginIp: string;
  registerTime: string;
  registerIP: string;
  status: boolean;
};

/** 转账模式玩家列表查询参数 */
export type TransferPlayerListParams = {
  /** 当前页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 玩家ID */
  id?: string | number;
  /** 用户名 */
  name?: string;
  /** 用户ID */
  userId?: string | number;
  /** 状态：0-禁用，1-正常 */
  status?: string | number;
  /** 注册开始时间 */
  registerTimeStart?: string;
  /** 注册结束时间 */
  registerTimeEnd?: string;
};

/** 转账模式玩家列表响应 */
export type TransferPlayerListResult = {
  success: boolean;
  data: {
    /** 列表数据 */
    list: TransferPlayerItem[];
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    pageSize: number;
  };
  message?: string;
};

/** 切换玩家状态参数 */
export type SwitchPlayerStatusParams = {
  /** 玩家ID */
  id: number;
  /** 新状态：true-正常，false-禁用 */
  status: boolean;
};

/** 切换玩家状态响应 */
export type SwitchPlayerStatusResult = {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    status: boolean;
  };
};

/** 获取转账模式玩家列表 */
export const getTransferPlayerList = (params?: TransferPlayerListParams) => {
  return http.request<TransferPlayerListResult>("post", "/player/transfer/list", { data: params });
};

/** 切换玩家状态 */
export const switchPlayerStatus = (data?: SwitchPlayerStatusParams) => {
  return http.request<SwitchPlayerStatusResult>("post", "/player/transfer/switch-status", { data });
};

