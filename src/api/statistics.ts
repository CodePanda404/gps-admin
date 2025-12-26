import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// ==================== 游戏统计相关接口 ====================

/** 游戏统计日报表列表项 */
export type GameStatisticsDailyItem = {
  id: number;
  date: string;
  admin_id: number;
  admin_name: string;
  game_id: string;
  game_name: string;
  type_name: string;
  provider: string;
  wallet_type: number;
  currency: string;
  bet: string;
  win: string;
  company_win: string;
  cost_price: string;
  agent_price: string;
  cost: string;
  agent_sale: string;
  sale: string;
  agent_profit: string;
  profit: string;
};

/** 游戏统计月报表列表项 */
export type GameStatisticsMonthlyItem = {
  id: number;
  month: string;
  admin_id: number;
  admin_name: string;
  game_id: string;
  game_name: string;
  type_name: string;
  provider: string;
  wallet_type: number;
  currency: string;
  bet: string;
  win: string;
  company_win: string;
  cost_price: string;
  agent_price: string;
  cost: string;
  agent_sale: string;
  sale: string;
  agent_profit: string;
  profit: string;
};

/** 游戏统计日报表查询参数 */
export type GameStatisticsDailyParams = {
  admin_id?: string | number;
  game_id?: string;
  admin_name?: string;
  type_name?: string;
  provider?: string;
  wallet_type?: string | number;
  game_name?: string;
  start_time?: string;
  end_time?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 游戏统计月报表查询参数 */
export type GameStatisticsMonthlyParams = {
  admin_id?: string | number;
  game_id?: string;
  admin_name?: string;
  type_name?: string;
  provider?: string;
  wallet_type?: string | number;
  game_name?: string;
  month?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 游戏统计日报表响应 */
export type GameStatisticsDailyResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: GameStatisticsDailyItem[];
  };
};

/** 游戏统计月报表响应 */
export type GameStatisticsMonthlyResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: GameStatisticsMonthlyItem[];
  };
};

/** 获取游戏统计日报表列表 */
export const getGameStatisticsDailyList = (params?: GameStatisticsDailyParams) => {
  return http.request<GameStatisticsDailyResult>(
    "get",
    baseUrlApi("/data/game/index"),
    { params }
  );
};

/** 获取游戏统计月报表列表 */
export const getGameStatisticsMonthlyList = (params?: GameStatisticsMonthlyParams) => {
  return http.request<GameStatisticsMonthlyResult>(
    "get",
    baseUrlApi("/data/gamemonth/index"),
    { params }
  );
};

// ==================== 玩家统计相关接口 ====================

/** 玩家统计日报表列表项 */
export type PlayerStatisticsDailyItem = {
  id: number;
  date: string;
  admin_id: number;
  user_id: number;
  currency: string;
  bet: string;
  win: string;
  company_win: number | string;
};

/** 玩家统计月报表列表项 */
export type PlayerStatisticsMonthlyItem = {
  id: number;
  month: string;
  admin_id: number;
  user_id: number;
  currency: string;
  bet: string;
  win: string;
  company_win: number | string;
};

/** 玩家统计日报表查询参数 */
export type PlayerStatisticsDailyParams = {
  admin_id?: string | number;
  user_id?: string | number;
  currency?: string;
  wallet_type?: string | number;
  game_name?: string;
  start_time?: string;
  end_time?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 玩家统计月报表查询参数 */
export type PlayerStatisticsMonthlyParams = {
  admin_id?: string | number;
  user_id?: string | number;
  currency?: string;
  wallet_type?: string | number;
  month?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 玩家统计日报表响应 */
export type PlayerStatisticsDailyResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: PlayerStatisticsDailyItem[];
  };
};

/** 玩家统计月报表响应 */
export type PlayerStatisticsMonthlyResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: PlayerStatisticsMonthlyItem[];
  };
};

/** 获取玩家统计日报表列表 */
export const getPlayerStatisticsDailyList = (params?: PlayerStatisticsDailyParams) => {
  return http.request<PlayerStatisticsDailyResult>(
    "get",
    baseUrlApi("/data/player/index"),
    { params }
  );
};

/** 获取玩家统计月报表列表 */
export const getPlayerStatisticsMonthlyList = (params?: PlayerStatisticsMonthlyParams) => {
  return http.request<PlayerStatisticsMonthlyResult>(
    "get",
    baseUrlApi("/data/playermonth/index"),
    { params }
  );
};

// ==================== 产品统计相关接口 ====================

/** 产品统计日报表列表项 */
export type ProductStatisticsDailyItem = {
  id: number;
  date: string;
  admin_id: number;
  type_name: string;
  provider: string;
  currency: string;
  bet: string;
  win: string;
  company_win: number | string;
  cost_price: string;
  agent_price: string;
  cost: string;
  agent_sale: string;
  sale: string;
  agent_profit: string;
  profit: string;
};

/** 产品统计月报表列表项 */
export type ProductStatisticsMonthlyItem = {
  id: number;
  month: string;
  admin_id: number;
  type_name: string;
  provider: string;
  currency: string;
  bet: string;
  win: string;
  company_win: number | string;
  cost_price: string;
  agent_price: string;
  cost: string;
  agent_sale: string;
  sale: string;
  agent_profit: string;
  profit: string;
};

/** 产品统计日报表查询参数 */
export type ProductStatisticsDailyParams = {
  admin_id?: string | number;
  type_name?: string;
  provider?: string;
  start_time?: string;
  end_time?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 产品统计月报表查询参数 */
export type ProductStatisticsMonthlyParams = {
  admin_id?: string | number;
  type_name?: string;
  provider?: string;
  month?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 产品统计日报表响应 */
export type ProductStatisticsDailyResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: ProductStatisticsDailyItem[];
  };
};

/** 产品统计月报表响应 */
export type ProductStatisticsMonthlyResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: ProductStatisticsMonthlyItem[];
  };
};

/** 获取产品统计日报表列表 */
export const getProductStatisticsDailyList = (params?: ProductStatisticsDailyParams) => {
  return http.request<ProductStatisticsDailyResult>(
    "get",
    baseUrlApi("/data/product/index"),
    { params }
  );
};

/** 获取产品统计月报表列表 */
export const getProductStatisticsMonthlyList = (params?: ProductStatisticsMonthlyParams) => {
  return http.request<ProductStatisticsMonthlyResult>(
    "get",
    baseUrlApi("/data/productmonth/index"),
    { params }
  );
};

