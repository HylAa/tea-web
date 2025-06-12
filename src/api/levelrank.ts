import request from "../utils/request";
import type { AxiosResponse } from "axios";

// 定义玩家排名信息类型
export interface PlayerRank {
  top: number;
  rank_value: number;
  nickname: string;
  steam: string;
  headshot_rate: string;
  kd: string;
  mvp_rate: string;
  online_hours: string;
  last_online: string;
}

// API响应类型
export interface LevelRankResponse {
  code: number;
  message: string;
  data: PlayerRank[];
  timestamp: number;
}

/**
 * 获取玩家排行榜
 * 接口文档: /api/levelrank/top
 * 请求方式: GET
 * 认证方式: 无
 * @param limit 返回数量限制，默认50条
 */
export function getLevelRankTop(
  limit?: number
): Promise<AxiosResponse<LevelRankResponse>> {
  return request({
    url: "/levelrank/top",
    method: "get",
    params: limit ? { limit } : undefined,
  });
}