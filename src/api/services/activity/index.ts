/**
 * 活动服务模块
 * 
 * 提供活动相关的 API 接口
 */

import { request } from '../../core';
import type { ActivitySignupParams, ActivitySignupResponse } from '../../types';
import { USE_MOCK_DATA, MOCK_DELAY_MS, getActivitySignupMock } from '../../mocks';

/**
 * 模拟网络延迟
 * @param ms 延迟时间（毫秒）
 */
async function mockDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  try {
    // 如果启用了 mock 数据，直接返回 mock 数据
    if (USE_MOCK_DATA) {
      console.log(`[getActivitySignup] Using MOCK data for activity ${activityId}`);
      // 模拟网络延迟
      await mockDelay(MOCK_DELAY_MS);
      const mockData = getActivitySignupMock();
      console.log(`[getActivitySignup] Mock data for activity ${activityId}:`, mockData);
      return mockData;
    }

    // 否则调用实际的 API
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
