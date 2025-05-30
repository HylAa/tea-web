import request from "../utils/request";
import type { AxiosResponse } from "axios";

/**
 * 获取服务器信息
 * 接口文档: /api/server/{port}
 * 请求方式: GET
 * 认证方式: 无
 *
 * 返回数据结构:
 * {
 *   code: number,    // 返回值，200表示成功
 *   message: string, // 信息
 *   data: ServerInfo, // 数据本体
 *   timestamp?: number // 响应时间（可能为空）
 * }
 */
export function getServerInfo(
  port: string | number
): Promise<AxiosResponse<ServerResponse>> {
  return request({
    url: `/server/${port}`,
    method: "get",
  });
}

/**
 * 获取所有服务器列表
 * 接口文档: /api/servers
 * 请求方式: GET
 * 认证方式: 无
 */
export function getServerList(): Promise<AxiosResponse<ServersListResponse>> {
  return request({
    url: "/servers",
    method: "get",
  });
}

// 定义在线玩家类型
export interface OnlinePlayer {
  name: string;
  steam: string;
}

// 定义服务器信息类型
export interface ServerInfo {
  players: number;
  bots: number;
  maxplayers: number;
  map: string;
  name: string;
  online: OnlinePlayer[];
  // 添加可能需要的额外字段
  port?: number;
  location?: string;
  features?: string[];
  ping?: number;
}

// API单个服务器响应类型
export interface ServerResponse {
  code: number;
  message: string;
  data: ServerInfo;
  timestamp?: number;
}

// API服务器列表响应类型
export interface ServersListResponse {
  code: number;
  message: string;
  data: ServerInfo[];
  timestamp?: number;
}
