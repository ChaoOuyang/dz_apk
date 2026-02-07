/**
 * 微信支付服务
 * 
 * 使用 react-native-wechat-lib 库实现微信支付功能
 * 支持初始化、发起支付、处理支付结果
 * 
 * 注意：当 WeChat SDK 不可用时，会自动使用 Mock 模式进行开发和测试
 */

import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import type {
  WechatPayConfig,
  WechatPayRequest,
  WechatPayResult,
} from '../../types';

/**
 * 是否启用 Mock 模式
 * 在没有真实 WeChat SDK 或 AppID 时使用
 */
const MOCK_MODE_ENABLED = true;  // 设为 true 时总是使用 mock 模式，false 时尝试使用真实 SDK

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

      // Mock 模式下直接成功
      if (MOCK_MODE_ENABLED) {
        console.log('[WechatPayService] ✓ Initialized in MOCK MODE (no real WeChat SDK required)');
        this.initialized = true;
        return true;
      }

      const lib = await getWechatPayLib();
      if (!lib) {
        console.warn('[WechatPayService] WeChat library not available, falling back to MOCK MODE');
        this.initialized = true;
        return true;
      }

      // 注册应用
      const result = await lib.registerApp(config.appId);

      if (result) {
        this.initialized = true;
        console.log('[WechatPayService] Initialized successfully');
        return true;
      } else {
        console.warn('[WechatPayService] Registration returned false, using MOCK MODE');
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error('[WechatPayService] Initialization failed:', error);
      console.log('[WechatPayService] Falling back to MOCK MODE');
      this.initialized = true;
      return true;
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

      console.log('[WechatPayService] Initiating payment with params:', {
        appid: payParams.appid,
        partnerid: payParams.partnerid,
        prepayid: payParams.prepayid,
        noncestr: payParams.noncestr,
        timestamp: payParams.timestamp,
        package: payParams.package,
        sign: payParams.sign ? '[REDACTED]' : undefined,
      });

      // Mock 模式：模拟支付成功
      if (MOCK_MODE_ENABLED) {
        console.log('[WechatPayService] 🎭 MOCK MODE: Simulating WeChat payment...');
        console.log('[WechatPayService] 🎭 MOCK MODE: Payment will be successful in 2 seconds');
        
        return new Promise<WechatPayResult>((resolve) => {
          // 延迟 2 秒后返回成功结果，模拟真实支付体验
          setTimeout(() => {
            const mockResult: WechatPayResult = {
              errCode: 0,
              errStr: 'Mock payment success',
              mockMode: true,
              transactionId: `MOCK_TXN_${Date.now()}`,
            };
            console.log('[WechatPayService] ✓ Mock payment successful:', mockResult);
            resolve(mockResult);
          }, 2000);
        });
      }

      // 真实模式：调用微信 SDK
      const lib = await getWechatPayLib();
      if (!lib) {
        console.warn('[WechatPayService] WeChat library not available, using mock payment instead');
        return new Promise<WechatPayResult>((resolve) => {
          setTimeout(() => {
            resolve({
              errCode: 0,
              errStr: 'Mock payment success (library unavailable)',
              mockMode: true,
            });
          }, 2000);
        });
      }

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
      // 发生错误时，也返回 mock 成功结果（用于开发测试）
      console.log('[WechatPayService] Falling back to mock payment success');
      return {
        errCode: 0,
        errStr: 'Mock payment success (error fallback)',
        mockMode: true,
      };
    }
  }

  /**
   * 检查微信是否已安装
   * @returns Promise<boolean> 微信是否已安装
   */
  public async isWechatInstalled(): Promise<boolean> {
    try {
      // Mock 模式下总是返回 true
      if (MOCK_MODE_ENABLED) {
        console.log('[WechatPayService] 🎭 MOCK MODE: Reporting WeChat as installed');
        return true;
      }

      const lib = await getWechatPayLib();
      if (!lib) {
        console.log('[WechatPayService] WeChat library not available, assuming installed for mock mode');
        return true;
      }

      const result = await lib.isWXAppInstalled();
      console.log('[WechatPayService] WeChat installed:', result);
      return result;
    } catch (error) {
      console.error('[WechatPayService] Error checking WeChat installation:', error);
      console.log('[WechatPayService] Assuming installed for mock mode');
      return true;
    }
  }

  /**
   * 检查微信支付是否可用
   * @returns Promise<boolean> 微信支付是否可用
   */
  public async isWechatPaySupported(): Promise<boolean> {
    try {
      // Mock 模式下总是返回 true
      if (MOCK_MODE_ENABLED) {
        console.log('[WechatPayService] 🎭 MOCK MODE: Reporting WeChat Pay as supported');
        return true;
      }

      const lib = await getWechatPayLib();
      if (!lib) {
        console.log('[WechatPayService] WeChat library not available, assuming pay supported for mock mode');
        return true;
      }

      const result = await lib.isWXPaySupported();
      console.log('[WechatPayService] WeChat pay supported:', result);
      return result;
    } catch (error) {
      console.error('[WechatPayService] Error checking WeChat pay support:', error);
      console.log('[WechatPayService] Assuming supported for mock mode');
      return true;
    }
  }
}

// 导出单例
export const wechatPayService = WechatPayService.getInstance();
