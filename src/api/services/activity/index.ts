/**
 * 活动服务模块
 * 
 * 提供活动相关的 API 接口
 */

import { request } from '../../core';
import type { ActivitySignupParams, ActivitySignupResponse } from '../../types';

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
  try {
    const result = await request<ActivitySignupResponse>(
      'showSignup',
      {
        activity_id: activityId,
        fromId: params?.fromId || 0,
        inviteId: params?.inviteId || 0,
        iv: params?.iv || '',
        code: params?.code || '',
        encryptedData: params?.encryptedData || '',
      },
      { showErrorAlert: false }
    );
    console.log(`[getActivitySignup] Success for activity ${activityId}:`, result);
    return result;
  } catch (error) {
    console.error(`[getActivitySignup] Error fetching activity ${activityId}:`, error);
    // 返回 null 而不是抛出异常，让调用方处理
    return null;
  }
}

export type { ActivitySignupParams, ActivitySignupResponse } from '../../types';
