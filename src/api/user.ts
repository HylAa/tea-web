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
 * 获取用户信息
 * @param userId 用户ID
 */
export function getUserInfo(userId: string) {
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