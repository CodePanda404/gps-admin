import type { RouteRecordName } from "vue-router";

export type cacheType = {
  mode: string;
  name?: RouteRecordName;
};

export type positionType = {
  startIndex?: number;
  length?: number;
};

export type appType = {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    // 判断是否手动点击Collapse
    isClickCollapse: boolean;
  };
  layout: string;
  device: string;
  viewportSize: { width: number; height: number };
};

export type multiType = {
  path: string;
  name: string;
  meta: any;
  query?: object;
  params?: object;
};

export type setType = {
  title: string;
  fixedHeader: boolean;
  hiddenSideBar: boolean;
};

export type userType = {
  avatar?: string;
  username?: string;
  nickname?: string;
  verifyCode?: string;
  currentPage?: number;
  roles?: Array<string>;
  permissions?: Array<string>;
  isRemembered?: boolean;
  loginDay?: number;
  googleStatus?: number; // 找回密码时用户的谷歌验证状态：1-开启，0-未开启
  recoveryEmail?: string; // 找回密码时用户的邮箱
  emailCode?: string; // 找回密码时输入的邮箱验证码
  googleCode?: string; // 找回密码时输入的谷歌验证码
  userEmail?: string; // 当前登录用户的邮箱
  shouldAutoSendEmailCode?: boolean; // 是否应该自动发送邮箱验证码
};
