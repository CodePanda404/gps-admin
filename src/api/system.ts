import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// ==================== 系统配置相关接口 ====================

/** 配置项 */
export type ConfigItem = {
  id: number;
  name: string;
  group: string;
  title: string;
  tip: string;
  type: string;
  visible: string;
  value: string | number | string[] | null;
  content: string[] | null;
  rule: string;
  extend: string;
  setting: {
    table?: string;
    conditions?: string;
    key?: string;
    value?: string;
  } | null;
  extend_html: string;
};

/** 配置组 */
export type ConfigGroup = {
  name: string;
  title: string;
  list: ConfigItem[];
  active: boolean;
};

/** 系统配置响应 */
export type SystemConfigResult = {
  code: number;
  msg: string;
  data: {
    siteList: {
      ability: ConfigGroup;
      pay: ConfigGroup;
      game: ConfigGroup;
      basic: ConfigGroup;
      email: ConfigGroup;
      dictionary: ConfigGroup;
    };
    typeList: Record<string, string>;
    ruleList: Record<string, string>;
    groupList: Record<string, string>;
  };
};

/** 获取系统配置 */
export const getSystemConfig = () => {
  return http.request<SystemConfigResult>(
    "get",
    baseUrlApi("/general/config/index")
  );
};

/** 保存系统配置参数 */
export type SaveSystemConfigParams = {
  group: string;
  data: Record<string, any>;
  google_code?: string;
};

/** 保存系统配置响应 */
export type SaveSystemConfigResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 保存系统配置 */
export const saveSystemConfig = (params: SaveSystemConfigParams) => {
  const formData = new FormData();
  formData.append("group", params.group);
  
  // 将data对象转换为FormData
  Object.keys(params.data).forEach(key => {
    const value = params.data[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  if (params.google_code) {
    formData.append("google_code", params.google_code);
  }

  return http.request<SaveSystemConfigResult>(
    "post",
    baseUrlApi("/general/config/save"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 新增配置参数 */
export type AddConfigParams = {
  group: string;
  type: string;
  name: string;
  title: string;
  value: string;
  tip?: string;
  rule?: string;
  visible?: string;
  extend?: string;
};

/** 新增配置响应 */
export type AddConfigResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 新增配置 */
export const addConfig = (params: AddConfigParams) => {
  const formData = new FormData();
  formData.append("group", params.group);
  formData.append("type", params.type);
  formData.append("name", params.name);
  formData.append("title", params.title);
  formData.append("value", params.value);
  if (params.tip !== undefined) {
    formData.append("tip", params.tip);
  }
  if (params.rule !== undefined) {
    formData.append("rule", params.rule);
  }
  if (params.visible !== undefined) {
    formData.append("visible", params.visible);
  }
  if (params.extend !== undefined) {
    formData.append("extend", params.extend);
  }

  return http.request<AddConfigResult>(
    "post",
    baseUrlApi("/general/config/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 校验配置名称参数 */
export type CheckConfigNameParams = {
  name: string;
};

/** 校验配置名称响应 */
export type CheckConfigNameResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 校验配置名称是否存在 */
export const checkConfigName = (params: CheckConfigNameParams) => {
  const formData = new FormData();
  formData.append("name", params.name);

  return http.request<CheckConfigNameResult>(
    "post",
    baseUrlApi("/general/config/check"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 删除配置参数 */
export type DeleteConfigParams = {
  name: string;
};

/** 删除配置响应 */
export type DeleteConfigResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 删除配置 */
export const deleteConfig = (params: DeleteConfigParams) => {
  const formData = new FormData();
  formData.append("name", params.name);

  return http.request<DeleteConfigResult>(
    "post",
    baseUrlApi("/general/config/del"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑配置参数 */
export type EditConfigParams = {
  [key: string]: string; // 配置项名称作为key，配置项值作为value
};

/** 编辑配置响应 */
export type EditConfigResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑配置（批量保存所有配置项） */
export const editConfig = (params: EditConfigParams) => {
  const formData = new FormData();
  
  // 将所有配置项添加到FormData中
  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  });

  return http.request<EditConfigResult>(
    "post",
    baseUrlApi("/general/config/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

// ==================== 附件管理相关接口 ====================

/** 附件列表项 */
export type AttachmentItem = {
  id: number;
  category: string;
  admin_id: number;
  user_id: number;
  url: string;
  imagewidth: string;
  imageheight: string;
  imagetype: string;
  imageframes: number;
  filename: string;
  filesize: number;
  mimetype: string;
  extparam: string;
  createtime: string;
  updatetime: number;
  uploadtime: number;
  storage: string;
  sha1: string;
  sort_no: number;
  path: string | null;
  type: number;
  thumb_style: string;
};

/** 附件列表请求参数 */
export type AttachmentListParams = {
  id?: string;
  category?: string;
  filename?: string;
  imagetype?: string;
  storage?: string;
  create_start_time?: string;
  create_end_time?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** 附件列表响应 */
export type AttachmentListResult = {
  code: number;
  msg: string;
  data: {
    total: number;
    pages: number;
    pageNumber: string;
    pageSize: string;
    rows: AttachmentItem[];
  };
};

/** 获取附件列表 */
export const getAttachmentList = (params?: AttachmentListParams) => {
  return http.request<AttachmentListResult>(
    "get",
    baseUrlApi("/general/attachment/index"),
    { params }
  );
};

/** 添加附件请求参数 */
export type AddAttachmentParams = {
  file: File;
};

/** 添加附件响应 */
export type AddAttachmentResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 添加附件 */
export const addAttachment = (params: AddAttachmentParams) => {
  const formData = new FormData();
  formData.append("file", params.file);

  return http.request<AddAttachmentResult>(
    "post",
    baseUrlApi("/general/attachment/add"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 编辑附件请求参数 */
export type EditAttachmentParams = {
  id: string;
  category?: string;
  url?: string;
  type?: string;
  path?: string;
  sort_no?: string;
};

/** 编辑附件响应 */
export type EditAttachmentResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 编辑附件 */
export const editAttachment = (params: EditAttachmentParams) => {
  const formData = new FormData();
  formData.append("id", params.id);
  if (params.category) {
    formData.append("category", params.category);
  }
  if (params.url) {
    formData.append("url", params.url);
  }
  if (params.type) {
    formData.append("type", params.type);
  }
  if (params.path !== undefined) {
    formData.append("path", params.path || "");
  }
  if (params.sort_no) {
    formData.append("sort_no", params.sort_no);
  }

  return http.request<EditAttachmentResult>(
    "post",
    baseUrlApi("/general/attachment/edit"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 批量删除附件请求参数 */
export type DeleteBatchAttachmentParams = {
  ids: string;
};

/** 批量删除附件响应 */
export type DeleteBatchAttachmentResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 批量删除附件 */
export const deleteBatchAttachment = (params: DeleteBatchAttachmentParams) => {
  const formData = new FormData();
  formData.append("ids", params.ids);

  return http.request<DeleteBatchAttachmentResult>(
    "post",
    baseUrlApi("/general/attachment/del_batch"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 附件分类项 */
export type AttachmentCategoryItem = {
  value: string;
  label: string;
};

/** 获取附件分类响应 */
export type AttachmentCategoryResult = {
  code: number;
  msg: string;
  data: AttachmentCategoryItem[] | Record<string, string>;
};

/** 获取附件分类 */
export const getAttachmentCategory = () => {
  return http.request<AttachmentCategoryResult>(
    "get",
    baseUrlApi("/general/attachment/category")
  );
};

/** 分类附件请求参数 */
export type ClassifyAttachmentParams = {
  category: string;
  ids: string;
};

/** 分类附件响应 */
export type ClassifyAttachmentResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 分类附件 */
export const classifyAttachment = (params: ClassifyAttachmentParams) => {
  const formData = new FormData();
  formData.append("category", params.category);
  formData.append("ids", params.ids);

  return http.request<ClassifyAttachmentResult>(
    "post",
    baseUrlApi("/general/attachment/classify"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};


