/**
 * API 模块导出文件
 * 
 * 统一导出所有 API 相关的函数和类型
 */

import { request } from './request';
import { CozeApi } from './temp/cozeApi';
import type { HistoryMessage } from './temp/cozeApi';

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

// 导出 Coze API
export { CozeApi };
export type { HistoryMessage };

// 导出微信支付服务（仅保留基础服务）
export { wechatPayService, WechatPayService } from './wechatPayService';

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
 * 微信支付参数
 */
export interface WechatPayParams {
  type?: number; // 支付类型 1: 保险
  privateInsurance?: number; // 是否私有保险
  activityId: number; // 活动ID
  phone?: string; // 手机号
  name?: string; // 姓名
  idCard?: string; // 身份证号
}

/**
 * 微信支付响应 - 支付所需参数
 */
export interface WechatPayResponse {
  appid: string; // 微信应用ID
  partnerid: string; // 商户ID
  prepayid: string; // 预支付ID
  noncestr: string; // 随机字符串
  timestamp: string; // 时间戳
  sign: string; // 签名
  package: string; // 包信息
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

/**
 * 便捷函数：获取微信支付参数
 * @param params 支付参数
 * @returns 微信支付参数
 * 
 * @example
 * const payParams = await getWechatPayParams({
 *   activityId: 673509,
 *   type: 1,
 *   privateInsurance: 0,
 *   phone: '13800000000',
 *   name: '张三',
 *   idCard: '110101200001011234',
 * });
 */
export async function getWechatPayParams(
  params: WechatPayParams
): Promise<WechatPayResponse | null> {
  try {
    console.log('[getWechatPayParams] Fetching payment params:', {
      ...params,
      idCard: params.idCard ? '[REDACTED]' : undefined,
    });
    
    const result = await request<WechatPayResponse>(
      'getWechatPayParams',
      {
        type: params.type || 1,
        privateInsurance: params.privateInsurance || 0,
        activityId: params.activityId,
        phone: params.phone || '',
        name: params.name || '',
        idCard: params.idCard || '',
      },
      { showErrorAlert: false }
    );
    
    console.log('[getWechatPayParams] Success:', result);
    return result;
  } catch (error) {
    console.error('[getWechatPayParams] Error:', error);
    return null;
  }
}
