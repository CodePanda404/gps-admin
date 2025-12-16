import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/** 登录请求参数 */
export type LoginParams = {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** Google 验证码（可选） */
  google_code?: string;
};

/** 登录响应结果 */
export type UserResult = {
  code: number;
  msg: string;
  data: {
    id: number;
    username: string;
    email: string;
    avatar: string;
    group_id: string;
    gruop_name: string;
    token: string;
    google_status?: number; // 1-开启，0-未开启
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

/** 登录 */
export const getLogin = (params?: LoginParams) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.password) formData.append("password", params.password);
  if (params?.google_code !== undefined) formData.append("google_code", params.google_code || "");

  return http.request<UserResult>("post", baseUrlApi("/login/login"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

/** 校验账号响应结果 */
export type CheckAccountResult = {
  code: number;
  msg: string;
  data: {
    id: number;
    username: string;
    email: string;
    google_status: number; // 1-开启，0-未开启
    token: string;
  };
};

/** 发送邮箱验证码响应结果 */
export type SendEmailCodeResult = {
  code: number;
  msg: string;
  data: {
    id: number;
    username: string;
    email: string;
    code: number;
    token: string;
  };
};

export type RecoverPasswordResult = {
  success: boolean;
  message?: string;
  data?: {
    email?: string;
    hasGoogleAuth?: boolean;
  };
};

/** 验证验证码响应结果 */
export type VerifyCodeResult = {
  code: number;
  msg: string;
  data?: any;
};

export type ResetPasswordResult = {
  success: boolean;
  message?: string;
};

/** 找回密码 - 校验账号 */
export const checkAccount = (params?: { username: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);

  return http.request<CheckAccountResult>("post", baseUrlApi("/login/check_account"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 发送邮箱验证码 */
export const sendEmailCode = (params?: { username: string; email: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.email) formData.append("email", params.email);

  return http.request<SendEmailCodeResult>("post", baseUrlApi("/login/send_email_code"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 验证 Google Authenticator 验证码 */
export const verifyCode = (params?: { username: string; google_code: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.google_code) formData.append("google_code", params.google_code);

  return http.request<VerifyCodeResult>("post", baseUrlApi("/login/verify_code"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 忘记密码响应结果 */
export type ForgetPasswordResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 重置密码 */
export const resetPassword = (data?: { account: string; password: string; confirmPassword: string }) => {
  return http.request<ResetPasswordResult>("post", "/password/reset", { data });
};

/** 忘记密码（设置新密码） */
export const forgetPassword = (params?: { username: string; password: string; repassword: string; sms_code: string; google_code?: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.password) formData.append("password", params.password);
  if (params?.repassword) formData.append("repassword", params.repassword);
  if (params?.sms_code) formData.append("sms_code", params.sms_code);
  if (params?.google_code !== undefined) formData.append("google_code", params.google_code || "");

  return http.request<ForgetPasswordResult>("post", baseUrlApi("/login/forget_pwd"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 绑定邮箱响应结果 */
export type BindEmailResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 绑定邮箱 */
export const bindEmail = (params?: { username: string; email: string; email_code: string; google_code?: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.email) formData.append("email", params.email);
  if (params?.email_code) formData.append("email_code", params.email_code);
  if (params?.google_code !== undefined) formData.append("google_code", params.google_code || "");

  return http.request<BindEmailResult>("post", baseUrlApi("/auth/admin/bind_email"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 校验旧密码响应结果 */
export type CheckPasswordResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 校验旧密码 */
export const checkPassword = (params?: { username: string; password: string; google_code?: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.password) formData.append("password", params.password);
  if (params?.google_code !== undefined) formData.append("google_code", params.google_code || "");

  return http.request<CheckPasswordResult>("post", baseUrlApi("/auth/admin/check_password"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 更新密码响应结果 */
export type UpdatePasswordResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 更新密码 */
export const updatePassword = (params?: { username: string; password: string; repassword: string }) => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();
  if (params?.username) formData.append("username", params.username);
  if (params?.password) formData.append("password", params.password);
  if (params?.repassword) formData.append("repassword", params.repassword);

  return http.request<UpdatePasswordResult>("post", baseUrlApi("/auth/admin/update_pwd"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

/** 退出登录响应结果 */
export type LogoutResult = {
  code: number;
  msg: string;
  data?: any;
};

/** 退出登录 */
export const logout = () => {
  // 使用 FormData 格式发送请求
  const formData = new FormData();

  return http.request<LogoutResult>("post", baseUrlApi("/login/logout"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
