import request from "../utils/request";

/**
 * 获取公告列表
 * 接口文档: /api/announcement
 * 请求方式: GET
 * 认证方式: 无
 *
 * 返回数据结构:
 * {
 *   code: number,    // 返回值，200表示成功
 *   message: string, // 信息
 *   data: Announcement[], // 数据本体，数组
 *   timestamp: number // 响应时间（可能为空）
 * }
 *
 * 注意：由于响应拦截器已处理，实际返回的是 data 部分
 */
export function getAnnouncements(): Promise<AnnouncementResponse> {
  return request({
    url: "/announcement",
    method: "get",
  });
}

// 定义公告数据类型
export interface Announcement {
  timer: number;
  content: string[];
}

// API响应类型
export interface AnnouncementResponse {
  code: number;
  message: string;
  data: Announcement[];
  timestamp?: number;
}
