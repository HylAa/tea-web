import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// 获取环境变量中的 API 基础 URL，如果不存在则使用默认值
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.teahvh.cc/api";

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL, // 从环境变量获取 API 基础 URL
  timeout: 15000, // 请求超时时间
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么，例如添加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    // 对请求错误做些什么
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    // 根据自定义错误码判断请求是否成功
    if (data.code && data.code !== 200) {
      // 处理业务错误
      const error = new Error(data.message || "服务器返回错误") as AxiosError;
      error.response = response;
      return Promise.reject(error);
    }

    // 如果没有自定义错误码，直接返回数据
    return response;
  },
  (error: AxiosError) => {
    // 处理 HTTP 错误状态码
    let message = "请求失败";

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          message = "未授权，请重新登录";
          // 可以在此处理登出逻辑
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求的资源不存在";
          break;
        case 500:
          message = "服务器内部错误";
          break;
        default:
          message = `请求错误 (${status})`;
      }
    } else if (error.request) {
      message = "服务器无响应";
    }

    // 可以在这里集成全局错误提示
    console.error("响应错误:", message);

    return Promise.reject(error);
  }
);

// 导出 axios 实例
export default service;
