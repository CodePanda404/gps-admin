import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/** 转账模式玩家列表项 */
export type TransferPlayerItem = {
  id: number;
  username: string;
  nickname: string;
  money: string;
  admin_id: number;
  currency: string;
  bet_all: string;
  win_all: string;
  company_win_all: number;
  wallet_type: number;
  loginip: string;
  joinip: string;
  /** 状态：normal-正常 */
  status: string;
  logintime: string;
  jointime: string;
};

/** 转账模式玩家列表查询参数 */
export type TransferPlayerListParams = {
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 玩家ID */
  id?: string | number;
  /** 用户名 */
  username?: string;
  /** 状态 */
  status?: string;
  /** 注册开始时间 */
  create_start_time?: string;
  /** 注册结束时间 */
  create_end_time?: string;
};

/** 转账模式玩家列表响应 */
export type TransferPlayerListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: TransferPlayerItem[];
  };
};

/** 切换玩家状态参数 */
export type SwitchPlayerStatusParams = {
  /** 玩家ID */
  id: number;
  /** 新状态 */
  status: string;
};

/** 切换玩家状态响应 */
export type SwitchPlayerStatusResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 获取转账模式玩家列表 */
export const getTransferPlayerList = (params?: TransferPlayerListParams) => {
  return http.request<TransferPlayerListResult>(
    "get",
    baseUrlApi("/member/memberts/index"),
    { params }
  );
};

/** 切换玩家状态 */
export const switchPlayerStatus = (data?: SwitchPlayerStatusParams) => {
  return http.request<SwitchPlayerStatusResult>(
    "post",
    baseUrlApi("/member/memberts/status"),
    { data }
  );
};

/** 锁定/解锁转账模式玩家参数 */
export type LockTransferPlayerParams = {
  /** 玩家ID */
  id: number | string;
  /** 类型：1-锁定 2-解锁 */
  type: number;
};

/** 锁定/解锁转账模式玩家响应 */
export type LockTransferPlayerResult = {
  code: number;
  msg: string;
  data: {
    id: string;
    username: string;
    /** 状态：normal-正常 */
    status: string;
    token: string;
  };
};

/** 锁定/解锁转账模式玩家 */
export const lockTransferPlayer = (data?: LockTransferPlayerParams) => {
  return http.request<LockTransferPlayerResult>(
    "post",
    baseUrlApi("/member/memberts/lock"),
    { data },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};
