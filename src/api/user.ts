import request from "../utils/request";

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: { username: string; password: string }) {
  return request({
    url: "/user/login",
    method: "post",
    data,
  });
}

/**
 * Steam 登录
 * @param steamId Steam ID
 */
export function steamLogin(steamId: string) {
  // 开发环境下的模拟实现
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      // 模拟 API 响应延迟
      setTimeout(() => {
        resolve({
          data: {
            code: 200,
            data: {
              token: `mock_token_${steamId}_${Date.now()}`,
              user: {
                id: `user_${steamId}`,
                username: `SteamUser_${steamId.slice(-6)}`,
                steamId: steamId,
                avatar: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg`,
                displayName: `Steam User ${steamId.slice(-6)}`,
                isAdmin: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          }
        });
      }, 1000);
    });
  }

  // 生产环境使用真实 API
  return request({
    url: "/user/steam-login",
    method: "get",
    params: { steamId },
  });
}

/**
 * 获取用户信息
 * @param userId 用户ID
 */
export function getUserInfo(userId: string) {
  // 开发环境下的模拟实现
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            code: 200,
            data: {
              id: userId,
              username: userId === 'me' ? 'SteamUser_123456' : `User_${userId}`,
              steamId: userId === 'me' ? '76561197960287930' : undefined,
              avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
              displayName: userId === 'me' ? 'Steam User' : `User ${userId}`,
              isAdmin: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
      }, 500);
    });
  }

  // 生产环境使用真实 API
  return request({
    url: `/user/${userId}`,
    method: "get",
  });
}

/**
 * 用户注册
 * @param data 注册参数
 */
export function register(data: {
  username: string;
  password: string;
  email: string;
}) {
  return request({
    url: "/user/register",
    method: "post",
    data,
  });
}

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param data 用户信息
 */
export function updateUserInfo(userId: string, data: any) {
  return request({
    url: `/user/${userId}`,
    method: "put",
    data,
  });
}

/**
 * 获取用户列表
 * @param params 查询参数
 */
export function getUserList(params?: {
  page?: number;
  size?: number;
  keyword?: string;
}) {
  return request({
    url: "/user/list",
    method: "get",
    params,
  });
}

/**
 * 验证 Steam 登录状态
 * @param steamId Steam ID
 */
export function verifySteamLogin(steamId: string) {
  return request({
    url: "/user/steam-verify",
    method: "post",
    data: { steamId },
  });
}

/**
 * 获取 Steam 用户信息
 * @param steamId Steam ID
 */
export function getSteamUserInfo(steamId: string) {
  return request({
    url: "/user/steam-info",
    method: "get",
    params: { steamId },
  });
}

/**
 * 绑定 Steam 账号
 * @param data 绑定参数
 */
export function bindSteamAccount(data: {
  userId: string;
  steamId: string;
  accessToken: string;
}) {
  return request({
    url: "/user/bind-steam",
    method: "post",
    data,
  });
}

/**
 * 解绑 Steam 账号
 * @param userId 用户ID
 */
export function unbindSteamAccount(userId: string) {
  return request({
    url: `/user/unbind-steam/${userId}`,
    method: "post",
  });
}

/**
 * 通过后端验证Steam OpenID签名
 * @param openidParams Steam OpenID回调参数
 */
export function verifySteamOpenID(openidParams: Record<string, string>) {
  return request({
    url: "/user/steam-verify-openid",
    method: "post",
    data: openidParams,
  });
}
