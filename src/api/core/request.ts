/**
 * 通用 API 请求客户端
 */

import { API_BASE_URL, API_ENDPOINTS, POST_ENDPOINTS, FIXED_SESSION } from './config';
import { generateSignature, generateRandom, getTimestamp } from './signature';
import { Alert } from 'react-native';
import type { ApiResponse, RequestOptions } from '../types';

/**
 * API 业务错误响应码
 */
const RESPONSE_CODES = {
  SUCCESS: '0',
};

/**
 * 构建完整的请求数据
 */
function buildRequestData(data: Record<string, any>): Record<string, any> {
  const requestData = {
    ...data,
    rdsession: FIXED_SESSION,
    random: generateRandom(),
    timestamp: getTimestamp(),
  };
  (requestData as Record<string, any>).signture = generateSignature(requestData);
  return requestData;
}

/**
 * 处理 API 响应
 */
function handleResponse<T>(response: any, options: RequestOptions): T | null {
  const { respCode, respMessage } = response;

  if (respCode === RESPONSE_CODES.SUCCESS) {
    if (response.data !== undefined) {
      return response.data ?? null;
    }
    const { respCode: _, respMessage: __, ...data } = response;
    return (Object.keys(data).length > 0 ? data : null) as T | null;
  }

  if (options.showErrorAlert !== false) {
    Alert.alert('提示', respMessage || '请求失败，请重试', [{ text: '确定' }]);
  }

  throw new Error(`API Error: ${respMessage}`);
}

/**
 * 通用 API 请求函数
 */
export async function request<T = any>(
  endpoint: keyof typeof API_ENDPOINTS,
  data: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<T | null> {
  const {
    isPost = POST_ENDPOINTS.has(endpoint),
    isFormEncoded = false,
    timeout = 30000,
    showErrorAlert = true,
    headers: customHeaders = {},
  } = options;

  const requestData = buildRequestData(data);
  const url = API_BASE_URL + API_ENDPOINTS[endpoint];
  const method = isPost ? 'POST' : 'GET';
  const contentType = isFormEncoded ? 'application/x-www-form-urlencoded' : 'application/json';
  const headers: Record<string, string> = { 'Content-Type': contentType, ...customHeaders };

  let body: string | null = null;
  let fetchUrl = url;

  if (isPost) {
    body = isFormEncoded
      ? Object.keys(requestData)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(requestData[key])}`)
          .join('&')
      : JSON.stringify(requestData);
  } else {
    const queryParams = new URLSearchParams();
    Object.keys(requestData).forEach((key) => {
      queryParams.append(key, String(requestData[key]));
    });
    fetchUrl = `${url}?${queryParams.toString()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fetchUrl, { method, headers, body, signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const apiResponse: ApiResponse<T> = await response.json();
      return handleResponse(apiResponse, options);
    } else if (response.status === 500) {
      if (showErrorAlert) {
        Alert.alert('提示', '忙不过来了，请重新进入', [{ text: '确定' }]);
      }
      throw new Error('Server error');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      if (showErrorAlert) {
        Alert.alert('提示', '请求超时，请检查网络', [{ text: '确定' }]);
      }
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * 请求带重试
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
      return await request<T>(endpoint, data, {
        ...options,
        showErrorAlert: attempt === maxRetries,
      });
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 1000 * attempt);
        });
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
