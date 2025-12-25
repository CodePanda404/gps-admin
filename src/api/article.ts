import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// ==================== 帮助文章相关接口 ====================

/** 帮助文章列表项 */
export type HelpItem = {
  id: number;
  title: string;
  content: string;
  weigh: number;
  createtime: string;
  updatetime: string;
};

/** 帮助文章列表查询参数 */
export type HelpListParams = {
  id?: string | number;
  title?: string;
  update_start_time?: string;
  update_end_time?: string;
  create_start_time?: string;
  create_end_time?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 帮助文章列表响应 */
export type HelpListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string | number;
    pageSize: string | number;
    rows: HelpItem[];
  };
};

/** 获取帮助文章列表 */
export const getHelpList = (params?: HelpListParams) => {
  return http.request<HelpListResult>(
    "get",
    baseUrlApi("/article/help/index"),
    { params }
  );
};

/** 新增帮助文章参数 */
export type AddHelpParams = {
  title: string;
  content: string;
  weigh: string | number;
};

/** 新增帮助文章响应 */
export type AddHelpResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增帮助文章 */
export const addHelp = (params: AddHelpParams) => {
  const formData = new FormData();
  formData.append("title", params.title);
  formData.append("content", params.content);
  formData.append("weigh", params.weigh.toString());

  return http.request<AddHelpResult>(
    "post",
    baseUrlApi("/article/help/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑帮助文章参数 */
export type EditHelpParams = {
  id: string | number;
  title: string;
  content: string;
  weigh: string | number;
};

/** 编辑帮助文章响应 */
export type EditHelpResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑帮助文章 */
export const editHelp = (params: EditHelpParams) => {
  const formData = new FormData();
  formData.append("id", params.id.toString());
  formData.append("title", params.title);
  formData.append("content", params.content);
  formData.append("weigh", params.weigh.toString());

  return http.request<EditHelpResult>(
    "post",
    baseUrlApi("/article/help/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 批量删除帮助文章参数 */
export type DeleteBatchHelpParams = {
  ids: string;
};

/** 批量删除帮助文章响应 */
export type DeleteBatchHelpResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 批量删除帮助文章 */
export const deleteBatchHelp = (params: DeleteBatchHelpParams) => {
  const formData = new FormData();
  formData.append("ids", params.ids);

  return http.request<DeleteBatchHelpResult>(
    "post",
    baseUrlApi("/article/help/del_batch"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

