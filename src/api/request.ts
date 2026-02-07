/**
 * 通用 API 请求客户端
 * 
 * 简化的 API 请求实现:
 * 1. 使用固定的 rdsession
 * 2. 自动添加随机数、时间戳和签名
 * 3. 支持 GET/POST 请求
 * 4. 完善的错误处理
 */

import {
  API_BASE_URL,
  API_ENDPOINTS,
  FIXED_SESSION,
} from './config';
import { generateSignature, generateRandom, getTimestamp } from './signature';
import { Alert } from 'react-native';

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

/**
 * API 业务错误响应码
 */
const RESPONSE_CODES = {
  SUCCESS: '0',
};

/**
 * 构建完整的请求数据
 * 包含业务参数、会话令牌、随机数、时间戳和签名
 * 
 * @param data 业务参数
 * @returns 包含签名的完整请求数据
 */
function buildRequestData(
  data: Record<string, any>,
): Record<string, any> {
  // 生成系统参数
  const random = generateRandom();
  const timestamp = getTimestamp();

  // 组装完整参数
  const requestData = {
    ...data,
    rdsession: FIXED_SESSION,
    random,
    timestamp,
  };

  // 计算签名
  const signature = generateSignature(requestData);
  (requestData as Record<string, any>).signture = signature;

  console.log('[ApiRequest] Request data assembled:', {
    ...requestData,
    signture: '[REDACTED]',
    rdsession: '[REDACTED]',
  });

  return requestData;
}

/**
 * 处理 API 响应
 * 根据业务响应码决定是否成功
 * 
 * @param response API 响应
 * @param options 请求选项
 * @returns 处理后的响应数据
 * @throws 业务错误时 throw
 */
function handleResponse<T>(
  response: any,
  options: RequestOptions
): T | null {
  const { respCode, respMessage } = response;

  console.log('[ApiRequest] Response code:', respCode, 'Message:', respMessage);
  console.log('[ApiRequest] Full response:', response);

  // 成功响应
  if (respCode === RESPONSE_CODES.SUCCESS) {
    // 如果有 data 字段，返回 data；否则返回整个响应（去掉 respCode 和 respMessage）
    if (response.data !== undefined) {
      return response.data ?? null;
    } else {
      // 返回整个响应对象，不包括 respCode 和 respMessage
      const { respCode: _, respMessage: __, ...data } = response;
      return (Object.keys(data).length > 0 ? data : null) as T | null;
    }
  }

  // 其他业务错误
  if (options.showErrorAlert !== false) {
    Alert.alert('提示', respMessage || '请求失败，请重试', [
      { text: '确定' },
    ]);
  }

  throw new Error(`API Error: ${respMessage}`);
}

/**
 * 通用 API 请求函数
 * 
 * @param endpoint API 端点 key，对应 API_ENDPOINTS 中的键
 * @param data 请求参数
 * @param options 请求选项
 * @returns Promise，包含响应数据
 * 
 * @example
 * // 简单的 GET 请求
 * const result = await request('getEventInfo', {});
 * 
 * // 获取活动报名信息
 * const signupInfo = await request('showSignup', {
 *   activity_id: 673123,
 *   fromId: 6,
 *   inviteId: 0,
 * });
 * 
 * // POST 请求
 * const result = await request('getEventInfo', { eventId: '123' }, { isPost: true });
 * 
 * // 带选项的请求
 * const result = await request('getEventInfo', { eventId: '123' }, {
 *   timeout: 60000,
 *   showErrorAlert: false,
 * });
 */
export async function request<T = any>(
  endpoint: keyof typeof API_ENDPOINTS,
  data: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<T | null> {
  const {
    isPost = false,
    isFormEncoded = false,
    timeout = 30000,
    showErrorAlert = true,
    headers: customHeaders = {},
  } = options;

  try {
    // 构建请求数据
    const requestData = buildRequestData(data);

    // 准备请求
    const url = API_BASE_URL + API_ENDPOINTS[endpoint];
    const method = isPost ? 'POST' : 'GET';
    const contentType = isFormEncoded
      ? 'application/x-www-form-urlencoded'
      : 'application/json';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      ...customHeaders,
    };

    let body: string | null = null;
    let fetchUrl = url;

    if (isPost) {
      // POST 请求
      if (isFormEncoded) {
        // Form-urlencoded 格式
        body = Object.keys(requestData)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(requestData[key])}`)
          .join('&');
      } else {
        // JSON 格式
        body = JSON.stringify(requestData);
      }
    } else {
      // GET 请求：参数附加到 URL
      const queryParams = new URLSearchParams();
      Object.keys(requestData).forEach((key) => {
        queryParams.append(key, String(requestData[key]));
      });
      fetchUrl = `${url}?${queryParams.toString()}`;
    }

    console.log(`[ApiRequest] ${method} ${fetchUrl}`);

    // 发送网络请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fetchUrl, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理响应
      if (response.ok) {
        const apiResponse: ApiResponse<T> = await response.json();
        return handleResponse(apiResponse, options);
      } else if (response.status === 500) {
        // 服务器错误
        console.error('[ApiRequest] Server error (500)');
        if (showErrorAlert) {
          Alert.alert('提示', '忙不过来了，请重新进入', [{ text: '确定' }]);
        }
        throw new Error('Server error');
      } else {
        // 其他 HTTP 错误
        console.error('[ApiRequest] HTTP error:', response.status);
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('[ApiRequest] Request timeout');
        if (showErrorAlert) {
          Alert.alert('提示', '请求超时，请检查网络', [{ text: '确定' }]);
        }
        throw new Error('Request timeout');
      }

      throw error;
    }
  } catch (error) {
    console.error('[ApiRequest] Request failed:', error);

    if (!showErrorAlert) {
      throw error;
    }

    throw error;
  }
}

/**
 * 高级请求包装器，添加自动重试
 * 
 * @param endpoint API 端点
 * @param data 请求参数
 * @param options 请求选项
 * @param maxRetries 最多重试次数
 * @returns Promise
 */
export async function requestWithRetry<T = any>(
  endpoint: keyof typeof API_ENDPOINTS,
  data: Record<string, any> = {},
  options: RequestOptions = {},
  maxRetries: number = 3
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[ApiRequest] Attempt ${attempt}/${maxRetries}`);
      return await request<T>(endpoint, data, {
        ...options,
        showErrorAlert: attempt === maxRetries,
      });
    } catch (error) {
      lastError = error as Error;
      console.warn(`[ApiRequest] Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 1000 * attempt);
        });
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
