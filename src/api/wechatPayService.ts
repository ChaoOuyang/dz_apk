/**
 * 微信支付服务
 * 
 * 提供微信支付的核心功能：
 * 1. 初始化微信支付
 * 2. 发起支付
 * 3. 处理支付回调
 */

import { NativeModules, Platform, Alert } from 'react-native';
import { getWechatPayParams, type WechatPayParams, type WechatPayResponse } from './index';

/**
 * 微信支付结果
 */
export interface PaymentResult {
  success: boolean;
  message: string;
  errorCode?: number;
}

/**
 * 微信支付服务类
 */
export class WechatPayService {
  private static instance: WechatPayService;
  private wechatModule: any;

  private constructor() {
    // 获取原生模块
    try {
      if (Platform.OS === 'android') {
        this.wechatModule = NativeModules.RNWechatLib || NativeModules.WeChatModule;
      } else if (Platform.OS === 'ios') {
        this.wechatModule = NativeModules.RNWechatLib || NativeModules.WeChatSDK;
      }
    } catch (error) {
      console.error('[WechatPayService] Failed to load WeChat module:', error);
    }
  }

  /**
   * 获取单例
   */
  public static getInstance(): WechatPayService {
    if (!WechatPayService.instance) {
      WechatPayService.instance = new WechatPayService();
    }
    return WechatPayService.instance;
  }

  /**
   * 检查微信是否已安装
   */
  public async isWechatInstalled(): Promise<boolean> {
    try {
      if (!this.wechatModule || !this.wechatModule.isWechatInstalled) {
        console.warn('[WechatPayService] WeChat module not available');
        return false;
      }
      
      const result = await this.wechatModule.isWechatInstalled();
      console.log('[WechatPayService] WeChat installed:', result);
      return result;
    } catch (error) {
      console.error('[WechatPayService] Error checking WeChat installation:', error);
      return false;
    }
  }

  /**
   * 发起微信支付
   * 
   * @param payParams 支付参数（从后端获取）
   * @returns 支付结果
   * 
   * @example
   * const result = await wechatPayService.pay({
   *   appid: 'wx1234567890abcdef',
   *   partnerid: '1234567890',
   *   prepayid: 'wx21123412341234123412341234',
   *   noncestr: 'random_string_123',
   *   timestamp: '1234567890',
   *   sign: 'abcdef123456',
   *   package: 'Sign=WXPay',
   * });
   */
  public async pay(payParams: WechatPayResponse): Promise<PaymentResult> {
    try {
      console.log('[WechatPayService] Starting WeChat payment...');
      
      // 检查微信是否安装
      const isInstalled = await this.isWechatInstalled();
      if (!isInstalled) {
        console.error('[WechatPayService] WeChat not installed');
        Alert.alert(
          '提示',
          '您的设备未安装微信，请先安装微信后再支付',
          [{ text: '确定' }]
        );
        return {
          success: false,
          message: 'WeChat not installed',
          errorCode: -1,
        };
      }

      // 验证必需的支付参数
      if (!this.validatePaymentParams(payParams)) {
        console.error('[WechatPayService] Invalid payment parameters');
        Alert.alert(
          '提示',
          '支付参数不完整，请重试',
          [{ text: '确定' }]
        );
        return {
          success: false,
          message: 'Invalid payment parameters',
          errorCode: -2,
        };
      }

      // 构建支付请求
      const payRequest = this.buildPaymentRequest(payParams);
      console.log('[WechatPayService] Payment request:', {
        ...payRequest,
        sign: '[REDACTED]',
      });

      // 调用微信支付
      if (!this.wechatModule || !this.wechatModule.paymentRequest) {
        console.error('[WechatPayService] PaymentRequest method not available');
        Alert.alert(
          '提示',
          '微信模块加载失败，请重启应用后重试',
          [{ text: '确定' }]
        );
        return {
          success: false,
          message: 'WeChat module not available',
          errorCode: -3,
        };
      }

      const result = await this.wechatModule.paymentRequest(payRequest);
      console.log('[WechatPayService] Payment result:', result);

      return this.handlePaymentResult(result);
    } catch (error) {
      console.error('[WechatPayService] Payment error:', error);
      Alert.alert(
        '提示',
        '支付过程中出现错误，请重试',
        [{ text: '确定' }]
      );
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        errorCode: -4,
      };
    }
  }

  /**
   * 完整的支付流程（获取参数 + 发起支付）
   * 
   * @param params 业务参数
   * @returns 支付结果
   * 
   * @example
   * const result = await wechatPayService.processPayment({
   *   activityId: 673509,
   *   type: 1,
   *   privateInsurance: 0,
   *   phone: '13800000000',
   *   name: '张三',
   *   idCard: '110101200001011234',
   * });
   */
  public async processPayment(params: WechatPayParams): Promise<PaymentResult> {
    try {
      console.log('[WechatPayService] Processing payment with params:', {
        ...params,
        idCard: params.idCard ? '[REDACTED]' : undefined,
      });

      // 第一步：从后端获取支付参数
      console.log('[WechatPayService] Step 1: Fetching payment parameters from server...');
      const payParams = await getWechatPayParams(params);

      if (!payParams) {
        console.error('[WechatPayService] Failed to get payment parameters');
        Alert.alert(
          '提示',
          '获取支付信息失败，请检查网络后重试',
          [{ text: '确定' }]
        );
        return {
          success: false,
          message: 'Failed to fetch payment parameters',
          errorCode: -5,
        };
      }

      console.log('[WechatPayService] Step 2: Initiating payment...');
      
      // 第二步：发起支付
      return await this.pay(payParams);
    } catch (error) {
      console.error('[WechatPayService] Process payment error:', error);
      Alert.alert(
        '提示',
        '支付处理失败，请重试',
        [{ text: '确定' }]
      );
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        errorCode: -6,
      };
    }
  }

  /**
   * 验证支付参数的完整性
   */
  private validatePaymentParams(params: WechatPayResponse): boolean {
    const requiredFields = ['appid', 'partnerid', 'prepayid', 'noncestr', 'timestamp', 'sign', 'package'];
    
    for (const field of requiredFields) {
      if (!params[field as keyof WechatPayResponse]) {
        console.error(`[WechatPayService] Missing required field: ${field}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 构建支付请求
   */
  private buildPaymentRequest(params: WechatPayResponse) {
    return {
      appId: params.appid,
      partnerId: params.partnerid,
      prepayId: params.prepayid,
      nonceStr: params.noncestr,
      timeStamp: params.timestamp,
      sign: params.sign,
      package: params.package,
    };
  }

  /**
   * 处理支付结果
   */
  private handlePaymentResult(result: any): PaymentResult {
    console.log('[WechatPayService] Processing payment result:', result);

    // 根据不同的结果码判断支付是否成功
    // 0: 成功
    // -1: 取消
    // -2: 失败
    // 其他: 异常

    if (result === 0 || result.errCode === 0) {
      return {
        success: true,
        message: '支付成功',
      };
    } else if (result === -1 || result.errCode === -1) {
      return {
        success: false,
        message: '支付已取消',
        errorCode: -1,
      };
    } else if (result === -2 || result.errCode === -2) {
      return {
        success: false,
        message: '支付失败',
        errorCode: -2,
      };
    } else {
      return {
        success: false,
        message: `支付异常: ${result.errMsg || 'Unknown error'}`,
        errorCode: result.errCode || -99,
      };
    }
  }
}

// 导出单例
export const wechatPayService = WechatPayService.getInstance();
