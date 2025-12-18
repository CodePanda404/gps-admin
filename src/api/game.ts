import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/** 供应商列表项 */
export type SupplierItem = {
  id: number;
  name: string;
  remark: string;
  pic: string;
  sort_no: number;
  status: string; // "1"-正常, "0"-禁用
  createtime: string;
  updatetime: string;
};

/** 供应商列表查询参数 */
export type SupplierListParams = {
  /** 供应商ID */
  id?: string | number;
  /** 供应商名称 */
  name?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: string;
  /** 更新开始时间 */
  update_start_time?: string;
  /** 更新结束时间 */
  update_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 供应商列表响应 */
export type SupplierListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: SupplierItem[];
  };
};

/** 获取供应商列表 */
export const getSupplierList = (params?: SupplierListParams) => {
  return http.request<SupplierListResult>(
    "get",
    baseUrlApi("/provider/provider/index"),
    { params }
  );
};

/** 上传图片参数 */
export type UploadImageParams = {
  file: File;
  type: string | number; // "1" 或其他类型
};

/** 上传图片响应 */
export type UploadImageResult = {
  code: number;
  msg: string;
  data: string; // 图片URL
};

/** 上传图片 */
export const uploadImage = (params: UploadImageParams) => {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("type", params.type.toString());

  return http.request<UploadImageResult>(
    "post",
    baseUrlApi("/upload/upload"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 新增供应商参数 */
export type AddSupplierParams = {
  name: string;
  remark?: string;
  sort_no?: number;
  pic?: string;
  status?: string; // "1"-正常, "0"-禁用
};

/** 新增供应商响应 */
export type AddSupplierResult = {
  code: number;
  msg: string;
  data: {
    id: string;
    name: string;
  };
};

/** 新增供应商 */
export const addSupplier = (params: AddSupplierParams) => {
  const formData = new FormData();
  formData.append("name", params.name);
  formData.append("remark", params.remark || "");
  formData.append("sort_no", (params.sort_no || 1).toString());
  formData.append("pic", params.pic || "");
  formData.append("status", params.status || "1");

  return http.request<AddSupplierResult>(
    "post",
    baseUrlApi("/provider/provider/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑供应商参数 */
export type EditSupplierParams = {
  id: number | string;
  name: string;
  remark?: string;
  sort_no?: number;
  pic?: string;
  status?: string; // "1"-正常, "0"-禁用
};

/** 编辑供应商响应 */
export type EditSupplierResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑供应商 */
export const editSupplier = (params: EditSupplierParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("name", params.name);
  formData.append("remark", params.remark || "");
  formData.append("sort_no", (params.sort_no || "").toString());
  formData.append("pic", params.pic || "");
  formData.append("status", params.status || "");

  return http.request<EditSupplierResult>(
    "post",
    baseUrlApi("/provider/provider/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除供应商参数 */
export type DeleteSupplierParams = {
  id: number | string;
};

/** 删除供应商响应 */
export type DeleteSupplierResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 删除供应商 */
export const deleteSupplier = (params: DeleteSupplierParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());

  return http.request<DeleteSupplierResult>(
    "post",
    baseUrlApi("/provider/provider/del"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 玩法类型列表项 */
export type GamePlayTypeItem = {
  id: number;
  name: string;
  shortname: string;
  name_cn: string;
  pic: string;
  sort_no: number;
  status: string; // "1"-正常, "0"-禁用
  createtime: string;
  updatetime: string;
};

/** 玩法类型列表查询参数 */
export type GamePlayTypeListParams = {
  /** 玩法类型ID */
  id?: string | number;
  /** 英文名称 */
  name?: string;
  /** 简称 */
  shortname?: string;
  /** 中文名称 */
  name_cn?: string;
  /** 状态 */
  status?: string;
  /** 更新开始时间 */
  update_start_time?: string;
  /** 更新结束时间 */
  update_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 玩法类型列表响应 */
export type GamePlayTypeListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: GamePlayTypeItem[];
  };
};

/** 获取玩法类型列表 */
export const getGamePlayTypeList = (params?: GamePlayTypeListParams) => {
  return http.request<GamePlayTypeListResult>(
    "get",
    baseUrlApi("/game/gametype/index"),
    { params }
  );
};

/** 币种列表项 */
export type CurrencyItem = {
  id: number;
  name: string;
  remark: string;
  difftime: string;
  status: string; // "1"-正常, "0"-停用
  createtime: string;
  updatetime: string;
};

/** 币种列表查询参数 */
export type CurrencyListParams = {
  /** 币种ID */
  id?: string | number;
  /** 币种名称 */
  name?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: string;
  /** 更新开始时间 */
  update_start_time?: string;
  /** 更新结束时间 */
  update_end_time?: string;
  /** 当前页码 */
  pageNumber?: number;
  /** 每页数量 */
  pageSize?: number;
};

/** 币种列表响应 */
export type CurrencyListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: CurrencyItem[];
  };
};

/** 获取币种列表 */
export const getCurrencyList = (params?: CurrencyListParams) => {
  return http.request<CurrencyListResult>(
    "get",
    baseUrlApi("/game/currency/index"),
    { params }
  );
};

/** 新增币种参数 */
export type AddCurrencyParams = {
  name: string;
  remark?: string;
  difftime?: string;
  status?: string; // "1"-开启, "-1"-关闭
};

/** 新增币种响应 */
export type AddCurrencyResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增币种 */
export const addCurrency = (params: AddCurrencyParams) => {
  const formData = new FormData();
  formData.append("name", params.name);
  formData.append("remark", params.remark || "");
  formData.append("difftime", params.difftime || "");
  formData.append("status", params.status || "1");

  return http.request<AddCurrencyResult>(
    "post",
    baseUrlApi("/game/currency/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑币种参数 */
export type EditCurrencyParams = {
  id: number | string;
  name: string;
  remark?: string;
  difftime?: string;
  status?: string; // "1"-开启, "-1"-关闭
};

/** 编辑币种响应 */
export type EditCurrencyResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑币种 */
export const editCurrency = (params: EditCurrencyParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("name", params.name);
  formData.append("remark", params.remark || "");
  formData.append("difftime", params.difftime || "");
  formData.append("status", params.status || "1");

  return http.request<EditCurrencyResult>(
    "post",
    baseUrlApi("/game/currency/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除币种参数 */
export type DeleteCurrencyParams = {
  id: number | string;
};

/** 删除币种响应 */
export type DeleteCurrencyResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 删除币种 */
export const deleteCurrency = (params: DeleteCurrencyParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());

  return http.request<DeleteCurrencyResult>(
    "post",
    baseUrlApi("/game/currency/del"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** WLG账号列表项 */
export type WlgAccountItem = {
  id: number;
  wallet_type: number;
  type: number;
  currency_id: number;
  dealer_name: string;
  dealer_id: string;
  agent_id: string;
  key: string;
  api_host: string;
  sn_url: string;
  dealer_account: string;
  dealer_pwd: string;
  agent_url: string;
  agent_account: string;
  agent_pwd: string;
  remark: string;
  status: string; // "1"-正常, "-1"-隐藏
  createtime: string;
  updatetime: string;
};

/** WLG账号列表查询参数 */
export type WlgAccountListParams = {
  id?: string | number;
  wallet_type?: number | string;
  type?: number | string;
  status?: string;
  create_start_time?: string;
  create_end_time?: string;
  update_start_time?: string;
  update_end_time?: string;
  pageNumber?: number;
  pageSize?: number;
  currency_id?: number | string;
  dealer_name?: string;
  dealer_id?: string;
  agent_id?: string;
  key?: string;
  api_host?: string;
  sn_url?: string;
  dealer_account?: string;
  dealer_pwd?: string;
  agent_url?: string;
  agent_account?: string;
  agent_pwd?: string;
  remark?: string;
};

/** WLG账号列表响应 */
export type WlgAccountListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: WlgAccountItem[];
  };
};

/** 获取WLG账号列表 */
export const getWlgAccountList = (params?: WlgAccountListParams) => {
  return http.request<WlgAccountListResult>(
    "get",
    baseUrlApi("/game/wlg/index"),
    { params }
  );
};

/** 新增WLG账号参数 */
export type AddWlgAccountParams = {
  wallet_type: string | number;
  type?: string | number;
  currency_id?: string | number;
  dealer_name: string;
  dealer_id?: string;
  agent_id?: string;
  key?: string;
  api_host?: string;
  sn_url?: string;
  dealer_account?: string;
  dealer_pwd?: string;
  agent_url?: string;
  agent_account?: string;
  agent_pwd?: string;
  remark?: string;
  status?: string; // "1"-开启, "-1"-关闭
};

/** 新增WLG账号响应 */
export type AddWlgAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增WLG账号 */
export const addWlgAccount = (params: AddWlgAccountParams) => {
  const formData = new FormData();
  formData.append("wallet_type", params.wallet_type.toString());
  formData.append("status", params.status || "1");
  if (params.type) formData.append("type", params.type.toString());
  if (params.currency_id) formData.append("currency_id", params.currency_id.toString());
  if (params.dealer_name) formData.append("dealer_name", params.dealer_name);
  if (params.dealer_id) formData.append("dealer_id", params.dealer_id);
  if (params.agent_id) formData.append("agent_id", params.agent_id);
  if (params.key) formData.append("key", params.key);
  if (params.api_host) formData.append("api_host", params.api_host);
  if (params.sn_url) formData.append("sn_url", params.sn_url);
  if (params.dealer_account) formData.append("dealer_account", params.dealer_account);
  if (params.dealer_pwd) formData.append("dealer_pwd", params.dealer_pwd);
  if (params.agent_url) formData.append("agent_url", params.agent_url);
  if (params.agent_account) formData.append("agent_account", params.agent_account);
  if (params.agent_pwd) formData.append("agent_pwd", params.agent_pwd);
  if (params.remark) formData.append("remark", params.remark);

  return http.request<AddWlgAccountResult>(
    "post",
    baseUrlApi("/game/wlg/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑WLG账号参数 */
export type EditWlgAccountParams = {
  id: number | string;
  wallet_type?: string | number;
  type?: string | number;
  currency_id?: string | number;
  dealer_name?: string;
  dealer_id?: string;
  agent_id?: string;
  key?: string;
  api_host?: string;
  sn_url?: string;
  dealer_account?: string;
  dealer_pwd?: string;
  agent_url?: string;
  agent_account?: string;
  agent_pwd?: string;
  remark?: string;
  status?: string; // "1"-开启, "-1"-关闭
};

/** 编辑WLG账号响应 */
export type EditWlgAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑WLG账号 */
export const editWlgAccount = (params: EditWlgAccountParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  if (params.wallet_type) formData.append("wallet_type", params.wallet_type.toString());
  if (params.type) formData.append("type", params.type.toString());
  if (params.currency_id) formData.append("currency_id", params.currency_id.toString());
  if (params.dealer_name) formData.append("dealer_name", params.dealer_name);
  if (params.dealer_id) formData.append("dealer_id", params.dealer_id);
  if (params.agent_id) formData.append("agent_id", params.agent_id);
  if (params.key) formData.append("key", params.key);
  if (params.api_host) formData.append("api_host", params.api_host);
  if (params.sn_url) formData.append("sn_url", params.sn_url);
  if (params.dealer_account) formData.append("dealer_account", params.dealer_account);
  if (params.dealer_pwd) formData.append("dealer_pwd", params.dealer_pwd);
  if (params.agent_url) formData.append("agent_url", params.agent_url);
  if (params.agent_account) formData.append("agent_account", params.agent_account);
  if (params.agent_pwd) formData.append("agent_pwd", params.agent_pwd);
  if (params.remark) formData.append("remark", params.remark);
  if (params.status) formData.append("status", params.status);

  return http.request<EditWlgAccountResult>(
    "post",
    baseUrlApi("/game/wlg/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除WLG账号参数 */
export type DeleteWlgAccountParams = {
  id: number | string;
};

/** 删除WLG账号响应 */
export type DeleteWlgAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 删除WLG账号 */
export const deleteWlgAccount = (params: DeleteWlgAccountParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());

  return http.request<DeleteWlgAccountResult>(
    "post",
    baseUrlApi("/game/wlg/del"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** PGF账号列表项 */
export type PgfAccountItem = {
  id: number;
  wallet_type: number;
  type: number;
  token: string;
  key: string;
  api_host: string;
  status: string; // "1"-正常, "-1"-隐藏
  createtime: string;
  updatetime: string;
};

/** PGF账号列表查询参数 */
export type PgfAccountListParams = {
  id?: string | number;
  wallet_type?: number | string;
  type?: number | string;
  status?: string;
  create_start_time?: string;
  create_end_time?: string;
  update_start_time?: string;
  update_end_time?: string;
  pageNumber?: number;
  pageSize?: number;
  token?: string;
  key?: string;
  api_host?: string;
};

/** PGF账号列表响应 */
export type PgfAccountListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: PgfAccountItem[];
  };
};

/** 获取PGF账号列表 */
export const getPgfAccountList = (params?: PgfAccountListParams) => {
  return http.request<PgfAccountListResult>(
    "get",
    baseUrlApi("/game/pgf/index"),
    { params }
  );
};

/** 新增PGF账号参数 */
export type AddPgfAccountParams = {
  wallet_type: string | number;
  type?: string | number;
  status?: string; // "1"-开启, "-1"-关闭
  token?: string;
  key?: string;
  api_host?: string;
};

/** 新增PGF账号响应 */
export type AddPgfAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增PGF账号 */
export const addPgfAccount = (params: AddPgfAccountParams) => {
  const formData = new FormData();
  formData.append("wallet_type", params.wallet_type.toString());
  if (params.type) formData.append("type", params.type.toString());
  if (params.status) formData.append("status", params.status);
  if (params.token) formData.append("token", params.token);
  if (params.key) formData.append("key", params.key);
  if (params.api_host) formData.append("api_host", params.api_host);

  return http.request<AddPgfAccountResult>(
    "post",
    baseUrlApi("/game/pgf/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑PGF账号参数 */
export type EditPgfAccountParams = {
  id: number | string;
  wallet_type?: string | number;
  type?: string | number;
  status?: string; // "1"-开启, "-1"-关闭
  token?: string;
  key?: string;
  api_host?: string;
};

/** 编辑PGF账号响应 */
export type EditPgfAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑PGF账号 */
export const editPgfAccount = (params: EditPgfAccountParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  if (params.wallet_type) formData.append("wallet_type", params.wallet_type.toString());
  if (params.type) formData.append("type", params.type.toString());
  if (params.status) formData.append("status", params.status);
  if (params.token) formData.append("token", params.token);
  if (params.key) formData.append("key", params.key);
  if (params.api_host) formData.append("api_host", params.api_host);

  return http.request<EditPgfAccountResult>(
    "post",
    baseUrlApi("/game/pgf/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除PGF账号参数 */
export type DeletePgfAccountParams = {
  id: number | string;
};

/** 删除PGF账号响应 */
export type DeletePgfAccountResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 删除PGF账号 */
export const deletePgfAccount = (params: DeletePgfAccountParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());

  return http.request<DeletePgfAccountResult>(
    "post",
    baseUrlApi("/game/pgf/del"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 新增玩法类型参数 */
export type AddGamePlayTypeParams = {
  name: string;
  name_cn: string;
  shortname: string;
  pic?: string;
  sort_no?: number;
  status?: string; // "1"-正常, "0"-禁用
};

/** 新增玩法类型响应 */
export type AddGamePlayTypeResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增玩法类型 */
export const addGamePlayType = (params: AddGamePlayTypeParams) => {
  const formData = new FormData();
  formData.append("name", params.name);
  formData.append("name_cn", params.name_cn);
  formData.append("shortname", params.shortname);
  formData.append("pic", params.pic || "");
  formData.append("sort_no", (params.sort_no || 1).toString());
  formData.append("status", params.status || "1");

  return http.request<AddGamePlayTypeResult>(
    "post",
    baseUrlApi("/game/gametype/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑玩法类型参数 */
export type EditGamePlayTypeParams = {
  id: number | string;
  name: string;
  name_cn: string;
  shortname: string;
  pic?: string;
  sort_no?: number;
  status?: string; // "1"-正常, "0"-禁用
};

/** 编辑玩法类型响应 */
export type EditGamePlayTypeResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑玩法类型 */
export const editGamePlayType = (params: EditGamePlayTypeParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("name", params.name);
  formData.append("name_cn", params.name_cn);
  formData.append("shortname", params.shortname);
  formData.append("pic", params.pic || "");
  formData.append("sort_no", (params.sort_no || 1).toString());
  formData.append("status", params.status || "1");

  return http.request<EditGamePlayTypeResult>(
    "post",
    baseUrlApi("/game/gametype/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除玩法类型参数 */
export type DeleteGamePlayTypeParams = {
  id: number | string;
};

/** 删除玩法类型响应 */
export type DeleteGamePlayTypeResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 删除玩法类型 */
export const deleteGamePlayType = (params: DeleteGamePlayTypeParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());

  return http.request<DeleteGamePlayTypeResult>(
    "post",
    baseUrlApi("/game/gametype/del"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

