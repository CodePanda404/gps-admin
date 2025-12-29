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


