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

/** 存取款明细列表项 */
export type DepositWithdrawalItem = {
  id: number;
  user_id: number;
  username: string;
  type_text: string; // 存款/取款
  money: string; // 变动金额（带正负号）
  before: string; // 变动前余额
  after: string; // 变动后余额
  createtime: string; // 创建时间
  remark?: string; // 备注
};

/** 存取款明细查询参数 */
export type DepositWithdrawalListParams = {
  /** ID */
  id?: string | number;
  /** 用户ID */
  user_id?: string | number;
  /** 用户名 */
  username?: string;
  /** 类型 */
  type?: string;
  /** 创建开始时间 */
  create_start_time?: string;
  /** 创建结束时间 */
  create_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 存取款明细列表响应 */
export type DepositWithdrawalListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: DepositWithdrawalItem[];
  };
};

/** 获取存取款明细列表 */
export const getDepositWithdrawalList = (params?: DepositWithdrawalListParams) => {
  return http.request<DepositWithdrawalListResult>(
    "get",
    baseUrlApi("/member/memberts/moneylog"),
    { params }
  );
};

/** 单一模式玩家列表项（与转账模式玩家列表项结构相同） */
export type SinglePlayerItem = TransferPlayerItem;

/** 单一模式玩家列表查询参数（与转账模式玩家列表查询参数结构相同） */
export type SinglePlayerListParams = TransferPlayerListParams;

/** 单一模式玩家列表响应 */
export type SinglePlayerListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: SinglePlayerItem[];
  };
};

/** 获取单一模式玩家列表 */
export const getSinglePlayerList = (params?: SinglePlayerListParams) => {
  return http.request<SinglePlayerListResult>(
    "get",
    baseUrlApi("/member/member/index"),
    { params }
  );
};

/** 锁定/解锁单一模式玩家参数 */
export type LockSinglePlayerParams = {
  /** 玩家ID */
  id: number | string;
  /** 类型：1-锁定 2-解锁 */
  type: number;
};

/** 锁定/解锁单一模式玩家响应 */
export type LockSinglePlayerResult = {
  code: number;
  msg: string;
  data: {
    id: string;
    username: string;
    /** 状态：normal-正常 */
    status: string;
    token?: string;
  };
};

/** 锁定/解锁单一模式玩家 */
export const lockSinglePlayer = (data?: LockSinglePlayerParams) => {
  return http.request<LockSinglePlayerResult>(
    "post",
    baseUrlApi("/member/member/lock"),
    { data },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 单一模式玩家投注明细列表项 */
export type SingleBettingItem = {
  id: number;
  user_id: number;
  username: string;
  game_id: string;
  bet_id: string;
  transaction_id: string;
  bet_amount: string;
  win_amount: string;
  win_and_lose: number;
  status_text: string; // 中奖/未中奖
  createtime: string;
};

/** 单一模式玩家投注明细查询参数 */
export type SingleBettingListParams = {
  /** 用户ID */
  user_id?: string | number;
  /** 用户名 */
  username?: string;
  /** 类型 */
  type?: string;
  /** 创建开始时间 */
  create_start_time?: string;
  /** 创建结束时间 */
  create_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 单一模式玩家投注明细列表响应 */
export type SingleBettingListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: SingleBettingItem[];
  };
};

/** 获取单一模式玩家投注明细列表 */
export const getSingleBettingList = (params?: SingleBettingListParams) => {
  return http.request<SingleBettingListResult>(
    "get",
    baseUrlApi("/member/member/betlog"),
    { params }
  );
};

/** 转账模式玩家投注明细项 */
export type TransferBettingItem = {
  id: number;
  user_id: number;
  username: string;
  game_id: string;
  bet_id: string;
  transaction_id: string;
  bet_amount: string;
  win_amount: string;
  win_and_lose: number;
  status_text: string;
  createtime: string;
};

/** 转账模式玩家投注明细查询参数 */
export type TransferBettingListParams = {
  /** ID */
  id?: string | number;
  /** 用户ID */
  user_id?: string | number;
  /** 用户名 */
  username?: string;
  /** 游戏ID */
  game_id?: string;
  /** 币种ID */
  currency_id?: string | number;
  /** 投注ID */
  bet_id?: string;
  /** 交易ID */
  transaction_id?: string;
  /** 状态 */
  status?: string;
  /** 创建开始时间 */
  create_start_time?: string;
  /** 创建结束时间 */
  create_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 转账模式玩家投注明细列表响应 */
export type TransferBettingListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: TransferBettingItem[];
  };
};

/** 获取转账模式玩家投注明细列表 */
export const getTransferBettingList = (params?: TransferBettingListParams) => {
  return http.request<TransferBettingListResult>(
    "get",
    baseUrlApi("/member/memberts/betlog"),
    { params }
  );
};
