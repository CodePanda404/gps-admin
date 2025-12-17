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

