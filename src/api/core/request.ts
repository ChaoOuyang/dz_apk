/**
 * 通用 API 请求客户端 - 与后端 Java 实现对齐
 * 
 * 完整的请求/响应流程：
 * 
 * 【请求流程】
 * 1. buildRequestData() - 构建请求数据
 *    - 添加系统参数：random、timestamp
 *    - 生成签名：基于所有参数的 MD5 哈希
 * 2. 构建请求头
 *    - 添加 token 到 header 中（如果有 token）
 *    - 或使用 rdsession 到 header 中（向后兼容）
 * 3. 构建请求体
 *    - POST JSON：JSON.stringify(requestData)
 *    - POST Form：application/x-www-form-urlencoded 编码
 *    - GET：参数添加到 URL 查询字符串
 * 4. 发送请求 - 设置 30 秒超时
 * 
 * 【响应流程】
 * 1. handleResponse() - 处理 API 响应
 *    - respCode='0' 表示成功，返回 data 或其他字段
 *    - respCode!='0' 表示失败，抛出错误并显示 alert
 * 2. 错误处理
 *    - HTTP 500+ 服务器错误
 *    - 超时错误
 *    - 网络错误
 * 
 * 【安全机制】
 * - 签名验证：防止参数篡改
 * - 时间戳验证：防重放攻击（5 分钟超时）
 * - Token/Session 验证：确保用户身份（通过 header 传递）
 */

import { API_BASE_URL, API_ENDPOINTS, POST_ENDPOINTS, FIXED_SESSION, API_SECRET } from './config';
import { generateSignature, generateRandom, getTimestamp } from './signature';
import { Alert } from 'react-native';
import type { ApiResponse, RequestOptions } from '../types';
import { getToken } from '../../utils/tokenStorage';

/**
 * API 响应码定义
 * @see 与后端 respCode 保持一致
 */
const RESPONSE_CODES = {
  SUCCESS: '0', // 成功
};

/**
 * 构建完整的请求数据
 * 
 * 步骤：
 * 1. 添加必要的系统参数（random、timestamp）
 * 2. 生成签名（基于上述所有参数 + API_SECRET 密钥）
 * 3. 返回完整的请求数据
 * 
 * 注意：
 * - Token 放在请求头中，不在请求参数中
 * - 签名字段不参与签名计算本身
 * - secret 密钥只在签名计算时使用，不在请求参数中发送
 */
async function buildRequestData(data: Record<string, any>): Promise<Record<string, any>> {
  // 步骤 1: 构建包含系统参数的请求数据（不包含 secret 和 token）
  const requestData: Record<string, any> = {
    ...data,
    random: generateRandom(),
    timestamp: getTimestamp(),
  };

  // 步骤 2: 生成签名（将 secret 密钥添加到签名源中）
  const signature = generateSignature(requestData, API_SECRET);
  requestData.signture = signature;

  console.log('📤 [Request Data]', {
    timestamp: requestData.timestamp,
    random: requestData.random,
    signture: requestData.signture,
    params: data,
  });

  return requestData;
}

/**
 * 处理 API 响应
 * 
 * 响应格式：
 * - respCode: '0' 表示成功
 * - respMessage: 响应消息（成功或错误）
 * - data: 业务数据（可选）
 */
function handleResponse<T>(response: any, options: RequestOptions): T | null {
  const { respCode, respMessage } = response;

  console.log('📥 [Response]', {
    respCode,
    respMessage,
    hasData: response.data !== undefined,
  });

  // 成功响应
  if (respCode === RESPONSE_CODES.SUCCESS) {
    // 如果有明确的 data 字段，返回它
    if (response.data !== undefined) {
      return response.data ?? null;
    }
    
    // 否则返回除了 respCode 和 respMessage 外的所有字段
    const { respCode: _, respMessage: __, ...data } = response;
    return (Object.keys(data).length > 0 ? data : null) as T | null;
  }

  // 错误响应
  const errorMessage = respMessage || '请求失败，请重试';
  console.error('❌ [API Error]', { respCode, respMessage: errorMessage });

  if (options.showErrorAlert !== false) {
    Alert.alert('提示', errorMessage, [{ text: '确定' }]);
  }

  throw new Error(`API Error [${respCode}]: ${errorMessage}`);
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

  const requestData = await buildRequestData(data);
  const url = API_BASE_URL + API_ENDPOINTS[endpoint];
  const method = isPost ? 'POST' : 'GET';
  const contentType = isFormEncoded ? 'application/x-www-form-urlencoded' : 'application/json';
  
  // 构建请求头，包含 token 认证
  const headers: Record<string, string> = { 'Content-Type': contentType, ...customHeaders };
  
  // 获取 token 并添加到请求头中
  const token = await getToken();
  if (token) {
    headers['token'] = token;
    console.log('🔐 [Auth] Using token in header for authentication');
  } else {
    headers['rdsession'] = FIXED_SESSION;
    console.log('🔐 [Auth] Using rdsession in header for authentication');
  }
  
  console.log('🌐 [API Request]', { endpoint, method, url });

  let body: string | null = null;
  let fetchUrl = url;

  if (isPost) {
    if (isFormEncoded) {
      // Form 表单编码（application/x-www-form-urlencoded）
      body = Object.keys(requestData)
        .map((key) => {
          const value = requestData[key];
          return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
        })
        .join('&');
      console.log('📦 [Form Body]', body);
    } else {
      // JSON 格式
      body = JSON.stringify(requestData);
      console.log('📦 [JSON Body]', body);
    }
  } else {
    // GET 请求，参数放在 URL 中
    const queryParams = new URLSearchParams();
    Object.keys(requestData).forEach((key) => {
      queryParams.append(key, String(requestData[key]));
    });
    fetchUrl = `${url}?${queryParams.toString()}`;
    console.log('🔗 [URL]', fetchUrl);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`⏳ [${method}] ${url}`, { timeout });

    const response = await fetch(fetchUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const statusText = response.statusText || `HTTP ${response.status}`;
    console.log(`✅ [${response.status}] ${statusText}`);

    // HTTP 200-299 状态码
    if (response.ok) {
      const apiResponse: ApiResponse<T> = await response.json();
      return handleResponse(apiResponse, options);
    }

    // 服务器错误 (500+)
    if (response.status >= 500) {
      const errorMsg = '服务器错误，请重新进入';
      console.error('❌ [Server Error]', { endpoint, status: response.status });
      if (showErrorAlert) {
        Alert.alert('提示', errorMsg, [{ text: '确定' }]);
      }
      throw new Error(errorMsg);
    }

    // 其他 HTTP 错误
    const errorMsg = `HTTP ${response.status}: ${statusText}`;
    console.error('❌ [HTTP Error]', { endpoint, status: response.status });
    if (showErrorAlert) {
      Alert.alert('提示', '请求出错，请重试', [{ text: '确定' }]);
    }
    throw new Error(errorMsg);
  } catch (error: any) {
    clearTimeout(timeoutId);

    // 请求超时
    if (error.name === 'AbortError') {
      const errorMsg = '请求超时，请检查网络';
      console.error('⏱️ [Timeout]', { endpoint, timeout });
      if (showErrorAlert) {
        Alert.alert('提示', errorMsg, [{ text: '确定' }]);
      }
      throw new Error(errorMsg);
    }

    // 其他错误
    console.error(`❌ [${endpoint}]`, error);
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
