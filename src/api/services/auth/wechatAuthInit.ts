/**
 * 微信认证初始化模块
 * 
 * 在应用启动时调用此模块来初始化微信认证服务
 * 请将此文件中的 WECHAT_APP_ID 替换为您实际的微信应用 ID
 */

import { wechatAuthService } from './wechatAuthService';
import type { WechatAuthConfig } from '../../types';

/**
 * 您的微信应用 ID
 * 替换为实际的微信应用 ID
 * 
 * 您的 AppID: wx46279c0318624f78
 */
const WECHAT_APP_ID = 'wx46279c0318624f78';

/**
 * 微信 Universal Link（iOS 适配）
 * 可选参数，用于 iOS 的 URL Scheme 处理
 * 格式：https://yourdomain.com/wechat
 */
const WECHAT_UNIVERSAL_LINK = '';

/**
 * 初始化微信认证服务
 * 
 * 在应用启动时调用此函数，建议在 App.tsx 的 useEffect 中调用
 * 目前为真实模式，会尝试初始化微信组件
 * 
 * @returns Promise<boolean> 初始化是否成功
 */
export async function initializeWechatAuth(): Promise<boolean> {
  try {
    const config: WechatAuthConfig = {
      appId: WECHAT_APP_ID,
      universalLink: WECHAT_UNIVERSAL_LINK,
    };

    const success = await wechatAuthService.initialize(config);

    if (success) {
      console.log('[WechatAuthInit] WeChat auth service initialized successfully');
      return true;
    } else {
      console.warn('[WechatAuthInit] Failed to initialize WeChat auth service');
      return false;
    }
  } catch (error) {
    console.error('[WechatAuthInit] Error initializing WeChat auth service:', error);
    return false;
  }
}

/**
 * 获取初始化状态
 */
export function isWechatAuthInitialized(): boolean {
  return wechatAuthService.isInitialized();
}

/**
 * 获取当前应用 ID
 */
export function getWechatAuthAppId(): string {
  return wechatAuthService.getAppId();
}

/**
 * 使用示例：在 App.tsx 中调用
 * 
 * ```typescript
 * import { useEffect } from 'react';
 * import { initializeWechatAuth } from './src/api/services/auth/wechatAuthInit';
 * 
 * export default function App() {
 *   useEffect(() => {
 *     // 应用启动时初始化微信认证
 *     initializeWechatAuth().then((success) => {
 *       if (success) {
 *         console.log('微信认证初始化成功');
 *       } else {
 *         console.log('微信认证初始化失败');
 *       }
 *     });
 *   }, []);
 * 
 *   return <YourApp />;
 * }
 * ```
 */
