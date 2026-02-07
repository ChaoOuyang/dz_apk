/**
 * 微信支付服务 (已简化)
 * 
 * 现在仅用于初始化和与原生微信模块的简单交互
 * 具体的支付流程由后端处理
 */

import { NativeModules, Platform } from 'react-native';

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
}

// 导出单例
export const wechatPayService = WechatPayService.getInstance();
