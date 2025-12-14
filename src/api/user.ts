import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
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
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

export type RecoverPasswordResult = {
  success: boolean;
  message?: string;
  data?: {
    email?: string;
    hasGoogleAuth?: boolean;
  };
};

export type VerifyCodeResult = {
  success: boolean;
  message?: string;
};

export type ResetPasswordResult = {
  success: boolean;
  message?: string;
};

/** 找回密码 - 验证账号 */
export const recoverPassword = (data?: { account: string }) => {
  return http.request<RecoverPasswordResult>("post", "/password/recover", { data });
};

/** 发送验证码 */
export const sendVerificationCode = (data?: { account: string }) => {
  return http.request<RecoverPasswordResult>("post", "/password/send-code", { data });
};

/** 验证验证码 */
export const verifyCode = (data?: { account: string; emailCode: string; googleCode?: string }) => {
  return http.request<VerifyCodeResult>("post", "/password/verify-code", { data });
};

/** 重置密码 */
export const resetPassword = (data?: { account: string; password: string; confirmPassword: string }) => {
  return http.request<ResetPasswordResult>("post", "/password/reset", { data });
};
