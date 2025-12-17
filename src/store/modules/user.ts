import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type UserResult,
  type RefreshTokenResult,
  getLogin,
  refreshTokenApi
} from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 前端生成的验证码（按实际需求替换）
    verifyCode: "",
    // 判断登录页面显示哪个组件（0：登录（默认）、1：找回密码、2：输入邮箱验证码 3：修改密码）
    currentPage: 0,
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认5天
    loginDay: 5,
    // 找回密码时用户的谷歌验证状态
    googleStatus: 0,
    // 找回密码时用户的邮箱
    recoveryEmail: "",
    // 找回密码时输入的邮箱验证码
    emailCode: "",
    // 找回密码时输入的谷歌验证码
    googleCode: "",
    // 当前登录用户的邮箱
    userEmail: storageLocal().getItem<DataInfo<number>>(userKey)?.userEmail ?? "",
    // 是否应该自动发送邮箱验证码
    shouldAutoSendEmailCode: false
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储登录页面显示哪个组件 */
    SET_CURRENTPAGE(value: number) {
      this.currentPage = value;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 存储找回密码时用户的谷歌验证状态 */
    SET_GOOGLE_STATUS(value: number) {
      this.googleStatus = value;
    },
    /** 存储找回密码时用户的邮箱 */
    SET_RECOVERY_EMAIL(value: string) {
      this.recoveryEmail = value;
    },
    /** 存储找回密码时输入的邮箱验证码 */
    SET_EMAIL_CODE(value: string) {
      this.emailCode = value;
    },
    /** 存储找回密码时输入的谷歌验证码 */
    SET_GOOGLE_CODE(value: string) {
      this.googleCode = value;
    },
    /** 存储当前登录用户的邮箱 */
    SET_USER_EMAIL(value: string) {
      this.userEmail = value;
      // 同时保存到 localStorage
      const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
      if (userInfo) {
        storageLocal().setItem(userKey, {
          ...userInfo,
          userEmail: value
        });
      }
    },
    /** 设置是否应该自动发送邮箱验证码 */
    SET_SHOULD_AUTO_SEND_EMAIL_CODE(value: boolean) {
      this.shouldAutoSendEmailCode = value;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<{ success: boolean; message?: string; data?: any }>((resolve, reject) => {
        getLogin(data)
          .then(response => {
            if (response?.code === 0) {
              // 计算过期时间（默认 7 天后过期）
              const expires = new Date();
              expires.setDate(expires.getDate() + 7);

              // 转换为 setToken 需要的格式
              setToken({
                accessToken: response.data.token,
                refreshToken: response.data.token,
                expires: expires,
                avatar: response.data.avatar || "",
                username: response.data.username,
                nickname: response.data.gruop_name || response.data.username,
                roles: [response.data.gruop_name || "admin"],
                permissions: ["*:*:*"],
                userEmail: response.data.email || ""
              });

              // 设置用户邮箱和谷歌验证状态
              this.SET_USER_EMAIL(response.data.email || "");
              if (response.data.google_status !== undefined) {
                this.SET_GOOGLE_STATUS(response.data.google_status);
              }

              // 清除邮箱检查标记，让系统在进入首页后重新检查
              if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem("emailChecked");
              }

              resolve({
                success: true,
                message: response.msg,
                data: response.data
              });
            } else {
              resolve({
                success: false,
                message: response.msg || "登录失败"
              });
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
