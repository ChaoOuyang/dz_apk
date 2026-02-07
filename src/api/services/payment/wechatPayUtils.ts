/**
 * 微信支付工具函数
 * 
 * 提供高级的微信支付接口，简化支付流程
 */

import { Alert } from 'react-native';
import { request } from '../../core';
import { wechatPayService } from './wechatPayService';
import type {
  WechatPayParams,
  WechatPayResult,
  WechatPayFlowConfig,
  WechatPayResponse,
} from '../../types';

/**
 * 完整的微信支付流程
 * 
 * 1. 检查微信安装状态
 * 2. 检查微信支付支持
 * 3. 获取支付参数
 * 4. 初始化微信服务
 * 5. 发起支付
 * 6. 处理支付结果
 */
export async function executeWechatPaymentFlow(
  config: WechatPayFlowConfig
): Promise<WechatPayResult | null> {
  try {
    console.log('[WechatPayUtils] Starting payment flow for activity:', config.activityId);

    // 步骤 1: 检查微信是否已安装
    console.log('[WechatPayUtils] Checking WeChat installation...');
    const isWechatInstalled = await wechatPayService.isWechatInstalled();
    if (!isWechatInstalled) {
      const errorMsg = '请先安装微信应用';
      console.warn('[WechatPayUtils]', errorMsg);
      config.onError?.(errorMsg);
      showAlert('提示', errorMsg);
      return null;
    }

    // 步骤 2: 检查微信支付是否可用
    console.log('[WechatPayUtils] Checking WeChat pay support...');
    const isPaySupported = await wechatPayService.isWechatPaySupported();
    if (!isPaySupported) {
      const errorMsg = '您的微信版本不支持支付功能，请升级微信';
      console.warn('[WechatPayUtils]', errorMsg);
      config.onError?.(errorMsg);
      showAlert('提示', errorMsg);
      return null;
    }

    // 步骤 3: 从后端获取微信支付参数
    console.log('[WechatPayUtils] Fetching payment params from backend...');
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
      console.error('[WechatPayUtils]', errorMsg);
      config.onError?.(errorMsg);
      showAlert('提示', errorMsg);
      return null;
    }

    console.log('[WechatPayUtils] Successfully fetched payment params');

    // 步骤 4: 初始化微信服务（如果未初始化）
    if (!wechatPayService.isInitialized()) {
      console.log('[WechatPayUtils] Initializing WeChat service...');
      const initSuccess = await wechatPayService.initialize({
        appId: payParams.appid,
      });

      if (!initSuccess) {
        const errorMsg = '微信服务初始化失败，请重试';
        console.error('[WechatPayUtils]', errorMsg);
        config.onError?.(errorMsg);
        showAlert('错误', errorMsg);
        return null;
      }
    }

    // 步骤 5: 发起微信支付
    console.log('[WechatPayUtils] Initiating payment...');
    const paymentResult = await wechatPayService.pay({
      appid: payParams.appid,
      partnerid: payParams.partnerid,
      prepayid: payParams.prepayid,
      noncestr: payParams.noncestr,
      timestamp: payParams.timestamp,
      sign: payParams.sign,
      package: payParams.package,
    });

    console.log('[WechatPayUtils] Payment result:', paymentResult);

    // 步骤 6: 处理支付结果
    handlePaymentResult(paymentResult, config);

    return paymentResult;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '支付过程出现异常，请重试';
    console.error('[WechatPayUtils] Payment flow error:', error);
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
    console.log('[WechatPayUtils] Payment successful');
    showAlert(
      '支付成功',
      '您已成功报名该活动',
      () => {
        config.onSuccess?.(result);
      }
    );
  } else if (result.errCode === -1) {
    // 用户取消支付
    console.log('[WechatPayUtils] Payment cancelled by user');
    config.onCancel?.();
    showAlert('已取消', '您已取消支付');
  } else if (result.errCode === -2) {
    // 支付失败
    console.error('[WechatPayUtils] Payment failed');
    const errorMsg = `支付失败: ${result.errStr || '未知错误'}`;
    config.onError?.(errorMsg);
    showAlert('支付失败', errorMsg);
  } else {
    // 其他错误
    console.error('[WechatPayUtils] Unexpected payment result:', result);
    const errorMsg = result.errStr || '支付过程出现异常，请重试';
    config.onError?.(errorMsg);
    showAlert('错误', errorMsg);
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
 * 获取微信支付参数
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
