/**
 * 通用类型定义
 */

/**
 * API 响应的通用格式
 */
export interface ApiResponse<T = any> {
  respCode: string;
  respMessage: string;
  data?: T;
}

/**
 * 请求配置选项
 */
export interface RequestOptions {
  /** 是否使用 POST 方法，默认为 false (GET 请求) */
  isPost?: boolean;
  /** 是否使用 form-urlencoded 格式，默认为 false (使用 JSON) */
  isFormEncoded?: boolean;
  /** 超时时间（毫秒），默认为 30000 */
  timeout?: number;
  /** 是否在错误时显示 Alert，默认为 true */
  showErrorAlert?: boolean;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}
