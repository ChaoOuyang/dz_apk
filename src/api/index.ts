/**
 * API 模块导出文件
 * 
 * 统一导出所有 API 相关的函数和类型
 */

import { request } from './request';

// 导出请求函数
export {
  request,
  requestWithRetry,
  type ApiResponse,
  type RequestOptions,
} from './request';

// 导出配置
export {
  API_BASE_URL,
  API_ENDPOINTS,
  FIXED_SESSION,
  getApiUrl,
  API_SECRET,
} from './config';

// 导出签名工具
export {
  generateSignature,
  generateRandom,
  getTimestamp,
} from './signature';

/**
 * 活动接口类型定义
 */
export interface ActivitySignupParams {
  activity_id: number;
  fromId?: number;
  inviteId?: number;
  iv?: string;
  code?: string;
  encryptedData?: string;
}

export interface ActivitySignupResponse {
  // 根据实际接口响应添加字段
  [key: string]: any;
}

/**
 * 便捷函数：获取活动报名信息
 * @param activityId 活动ID
 * @param params 其他可选参数
 * @returns 活动报名信息
 * 
 * @example
 * const result = await getActivitySignup(673123, {
 *   fromId: 6,
 *   inviteId: 0,
 * });
 */
export async function getActivitySignup(
  activityId: number,
  params?: Partial<ActivitySignupParams>
): Promise<ActivitySignupResponse | null> {
  return request<ActivitySignupResponse>(
    'showSignup',
    {
      activity_id: activityId,
      fromId: params?.fromId || 0,
      inviteId: params?.inviteId || 0,
      iv: params?.iv || '',
      code: params?.code || '',
      encryptedData: params?.encryptedData || '',
    },
    { showErrorAlert: true }
  );
}

/**
 * 快速测试：请求 showSignup 接口
 * @param activityId 活动ID，默认使用 673123 进行测试
 * @returns 测试结果
 * 
 * @example
 * // 在你的组件中快速测试
 * const result = await testShowSignup();
 * console.log('测试结果:', result);
 */
export async function testShowSignup(
  activityId: number = 673123
): Promise<ActivitySignupResponse | null> {
  try {
    console.log(`[Test] Starting testShowSignup with activityId: ${activityId}`);
    
    const result = await getActivitySignup(activityId, {
      fromId: 6,
      inviteId: 0,
    });
    
    console.log('[Test] testShowSignup succeeded:', result);
    return result;
  } catch (error) {
    console.error('[Test] testShowSignup failed:', error);
    throw error;
  }
}
