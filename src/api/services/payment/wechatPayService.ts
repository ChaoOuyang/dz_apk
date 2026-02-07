/**
 * 微信支付服务
 * 
 * 使用 react-native-wechat-lib 库实现微信支付功能
 * 支持初始化、发起支付、处理支付结果
 */

import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import type {
  WechatPayConfig,
  WechatPayRequest,
  WechatPayResult,
} from '../../types';

/**
 * 获取 WeChat 库的引用
 */
let WechatPay: any = null;

const getWechatPayLib = async (): Promise<any> => {
  if (WechatPay) {
    return WechatPay;
  }

  try {
    // 尝试导入 react-native-wechat-lib
    WechatPay = require('react-native-wechat-lib');
    return WechatPay;
  } catch (error) {
    console.error('[WechatPayService] Failed to load WeChat lib:', error);
    return null;
  }
};

/**
 * 微信支付服务类
 */
export class WechatPayService {
  private static instance: WechatPayService;
  private initialized = false;
  private appId: string = '';
  private eventEmitter: NativeEventEmitter | null = null;
  private paymentPromise: Promise<WechatPayResult> | null = null;
  private paymentResolver: ((result: WechatPayResult) => void) | null = null;

  private constructor() {
    this.initializeEventListener();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListener() {
    try {
      const lib = require('react-native-wechat-lib');
      if (lib && lib.addEventListener) {
        // 监听支付结果
        const subscription = lib.addEventListener('PayResp', (response: any) => {
          console.log('[WechatPayService] Received PayResp:', response);
          if (this.paymentResolver) {
            this.paymentResolver({
              errCode: response.errCode || 0,
              errStr: response.errStr || 'Payment completed',
              ...response,
            });
            this.paymentResolver = null;
            this.paymentPromise = null;
          }
        });
      }
    } catch (error) {
      console.warn('[WechatPayService] Event listener initialization skipped:', error);
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
   * 初始化微信支付服务
   * @param config 配置信息
   * @returns Promise<boolean> 初始化是否成功
   */
  public async initialize(config: WechatPayConfig): Promise<boolean> {
    try {
      console.log('[WechatPayService] Initializing with appId:', config.appId);
      this.appId = config.appId;

      const lib = await getWechatPayLib();
      if (!lib) {
        throw new Error('WeChat library is not available');
      }

      // 注册应用
      const result = await lib.registerApp(config.appId);

      if (result) {
        this.initialized = true;
        console.log('[WechatPayService] Initialized successfully');
        return true;
      } else {
        console.warn('[WechatPayService] Registration returned false');
        return false;
      }
    } catch (error) {
      console.error('[WechatPayService] Initialization failed:', error);
      return false;
    }
  }

  /**
   * 检查服务是否已初始化
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 获取应用ID
   */
  public getAppId(): string {
    return this.appId;
  }

  /**
   * 发起微信支付
   * @param payParams 支付参数（来自后端 API）
   * @returns Promise<WechatPayResult> 支付结果
   * 
   * @example
   * const payParams = {
   *   appid: 'wx1234567890abcdef',
   *   partnerid: '1234567890',
   *   prepayid: 'wx201410272009395522657a690389285100',
   *   noncestr: 'ibuqwkdje',
   *   timestamp: '1414277957',
   *   sign: '9A0A8659F005D6984697E2CA0A9CF3B7',
   *   package: 'Sign=WXPay'
   * };
   * const result = await wechatPayService.pay(payParams);
   */
  public async pay(payParams: WechatPayRequest): Promise<WechatPayResult> {
    try {
      if (!this.initialized) {
        throw new Error('WechatPayService is not initialized. Call initialize() first.');
      }

      const lib = await getWechatPayLib();
      if (!lib) {
        throw new Error('WeChat library is not available');
      }

      console.log('[WechatPayService] Initiating payment with params:', {
        appid: payParams.appid,
        partnerid: payParams.partnerid,
        prepayid: payParams.prepayid,
        noncestr: payParams.noncestr,
        timestamp: payParams.timestamp,
        package: payParams.package,
        sign: payParams.sign ? '[REDACTED]' : undefined,
      });

      // 构建支付请求
      const paymentRequest = {
        partnerid: payParams.partnerid,
        prepayid: payParams.prepayid,
        noncestr: payParams.noncestr,
        timestamp: payParams.timestamp,
        sign: payParams.sign,
        package: payParams.package,
      };

      // 创建一个 Promise 来等待支付结果
      return new Promise<WechatPayResult>((resolve, reject) => {
        this.paymentResolver = (result: WechatPayResult) => {
          resolve(result);
        };

        // 调用微信支付
        lib.sendPaymentRequest(paymentRequest)
          .then(() => {
            console.log('[WechatPayService] Payment request sent successfully');
            // 支付请求发送成功，等待支付结果回调
          })
          .catch((error: any) => {
            console.error('[WechatPayService] Payment request failed:', error);
            this.paymentResolver = null;
            reject(error);
          });

        // 设置超时机制，防止无限等待
        const timeout = setTimeout(() => {
          if (this.paymentResolver) {
            this.paymentResolver({
              errCode: -1,
              errStr: 'Payment timeout',
            });
            this.paymentResolver = null;
            this.paymentPromise = null;
          }
        }, 60000); // 60秒超时

        // 清理超时计时器
        const originalResolver = this.paymentResolver;
        this.paymentResolver = (result: WechatPayResult) => {
          clearTimeout(timeout);
          originalResolver?.(result);
        };
      });
    } catch (error) {
      console.error('[WechatPayService] Payment error:', error);
      return {
        errCode: -1,
        errStr: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 检查微信是否已安装
   * @returns Promise<boolean> 微信是否已安装
   */
  public async isWechatInstalled(): Promise<boolean> {
    try {
      const lib = await getWechatPayLib();
      if (!lib) {
        return false;
      }

      const result = await lib.isWXAppInstalled();
      console.log('[WechatPayService] WeChat installed:', result);
      return result;
    } catch (error) {
      console.error('[WechatPayService] Error checking WeChat installation:', error);
      return false;
    }
  }

  /**
   * 检查微信支付是否可用
   * @returns Promise<boolean> 微信支付是否可用
   */
  public async isWechatPaySupported(): Promise<boolean> {
    try {
      const lib = await getWechatPayLib();
      if (!lib) {
        return false;
      }

      const result = await lib.isWXPaySupported();
      console.log('[WechatPayService] WeChat pay supported:', result);
      return result;
    } catch (error) {
      console.error('[WechatPayService] Error checking WeChat pay support:', error);
      return false;
    }
  }
}

// 导出单例
export const wechatPayService = WechatPayService.getInstance();
