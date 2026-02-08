/**
 * 微信支付工具函数
 * 
 * 提供高级的微信支付接口，简化支付流程
 * 支付成功后会自动处理群相关逻辑
 */

import { Alert } from 'react-native';
import { request } from '../../core';
import { wechatPayService } from './wechatPayService';
import { getOrCreateGroup, addMemberToGroup } from '../group';
import { USE_MOCK_DATA, MOCK_DELAY_MS, getWechatPayParamsMock } from '../../mocks';
import type {
  WechatPayParams,
  WechatPayResult,
  WechatPayFlowConfig,
  WechatPayResponse,
} from '../../types';

/**
 * 完整的微信支付流程
 * 
 * 1. 初始化微信服务
 * 2. 获取支付参数
 * 3. 发起支付
 * 4. 处理支付结果
 * 
 * 注意：在 Mock 模式下，会跳过微信检查，直接模拟支付成功
 */
export async function executeWechatPaymentFlow(
  config: WechatPayFlowConfig
): Promise<WechatPayResult | null> {
  try {
    // 初始化微信服务（如果未初始化）
    if (!wechatPayService.isInitialized()) {
      const initSuccess = await wechatPayService.initialize({
        appId: 'mock_app_id', // Mock 模式下可以使用任意 AppID
      });

      if (!initSuccess) {
        const errorMsg = '微信服务初始化失败，请重试';
        config.onError?.(errorMsg);
        showAlert('错误', errorMsg);
        return null;
      }
    }

    // 从后端获取微信支付参数
    const payParams = await getWechatPayParams({
      activityId: config.activityId,
      type: config.type || 1,
      privateInsurance: config.privateInsurance || 0,
      phone: config.phone || '',
      name: config.name || '',
      idCard: config.idCard || '',
    });

    if (!payParams) {
      const errorMsg = '获取支付信息失败，请检查网络后重试';
      config.onError?.(errorMsg);
      showAlert('提示', errorMsg);
      return null;
    }

    // 发起微信支付
    const paymentResult = await wechatPayService.pay({
      appid: payParams.appid || 'mock_app_id',
      partnerid: payParams.partnerid || '1000000',
      prepayid: payParams.prepayid || `MOCK_${Date.now()}`,
      noncestr: payParams.noncestr || 'mock_nonce',
      timestamp: payParams.timestamp || Math.floor(Date.now() / 1000).toString(),
      sign: payParams.sign || 'mock_sign',
      package: payParams.package || 'Sign=WXPay',
    });

    // 处理支付结果
    handlePaymentResult(paymentResult, config);

    return paymentResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '支付过程出现异常，请重试';
    config.onError?.(errorMsg);
    showAlert('错误', errorMsg);
    return null;
  }
}

/**
 * 处理支付结果
 */
function handlePaymentResult(
  result: WechatPayResult,
  config: WechatPayFlowConfig
): void {
  if (result.errCode === 0) {
    // 支付成功
    config.onSuccess?.(result);
  } else if (result.errCode === -1) {
    // 用户取消支付
    config.onCancel?.();
    showAlert('已取消', '您已取消支付');
  } else if (result.errCode === -2) {
    // 支付失败
    const errorMsg = `支付失败: ${result.errStr || '未知错误'}`;
    config.onError?.(errorMsg);
    showAlert('支付失败', errorMsg);
  } else {
    // 其他错误
    const errorMsg = result.errStr || '支付过程出现异常，请重试';
    config.onError?.(errorMsg);
    showAlert('错误', errorMsg);
  }
}

/**
 * 处理支付成功后的群相关逻辑
 * 自动获取或创建活动群，拉用户进群
 * 
 * @param activityId 活动ID
 * @param userId 用户ID
 * @returns 群ID
 */
export async function handlePostPaymentGroupLogic(
  activityId: number,
  userId: string | number
): Promise<number | string | null> {
  try {
    // 获取或创建群
    const group = await getOrCreateGroup(activityId, `活动-${activityId}`);
    
    if (!group) {
      return null;
    }
    
    // 拉用户进群
    const addMemberSuccess = await addMemberToGroup(group.id);
    
    if (!addMemberSuccess) {
      return null;
    }
    
    return group.id;
  } catch (error) {
    return null;
  }
}

/**
 * 显示提示框
 */
function showAlert(
  title: string,
  message: string,
  onPress?: () => void
): void {
  Alert.alert(title, message, [
    {
      text: '确定',
      onPress,
    },
  ]);
}

/**
 * 模拟网络延迟
 * @param ms 延迟时间（毫秒）
 */
async function mockDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取微信支付参数
 */
export async function getWechatPayParams(
  params: WechatPayParams
): Promise<WechatPayResponse | null> {
  try {
    // 如果启用了 mock 数据，直接返回 mock 数据
    if (USE_MOCK_DATA) {
      await mockDelay(MOCK_DELAY_MS);
      const mockData = getWechatPayParamsMock();
      return mockData;
    }
    
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
    
    return result;
  } catch (error) {
    return null;
  }
}

/**
 * 便捷函数：直接发起支付
 * 
 * @example
 * const result = await payForActivity(123, {
 *   onSuccess: (result) => console.log('支付成功'),
 *   onCancel: () => console.log('用户取消'),
 *   onError: (error) => console.log('支付失败:', error),
 * });
 */
export async function payForActivity(
  activityId: number,
  options?: Partial<WechatPayFlowConfig>
): Promise<WechatPayResult | null> {
  return executeWechatPaymentFlow({
    activityId,
    ...options,
  });
}
