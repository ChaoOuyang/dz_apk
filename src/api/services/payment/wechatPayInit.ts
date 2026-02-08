/**
 * 微信支付初始化模块
 * 
 * 在应用启动时调用此模块来初始化微信支付服务
 */

import { wechatPayService } from './wechatPayService';

/**
 * 您的微信应用 ID
 * 替换为实际的微信应用 ID
 */
const WECHAT_APP_ID = 'wx1234567890abcdef';

/**
 * 初始化微信支付服务
 * 
 * 在应用启动时调用此函数，建议在 App.tsx 或 index.js 中调用
 * 目前为 mock 模式，不实际初始化微信组件
 */
export async function initializeWechatPay(): Promise<boolean> {
  try {
    // 暂时 mock 初始化，不实际调用 wechatPayService
    // 当前返回 true，避免应用启动失败
    return true;

    // 实际初始化代码（已注释，待后续启用）
    // const success = await wechatPayService.initialize({
    //   appId: WECHAT_APP_ID,
    // });
    //
    // if (success) {
    //   return true;
    // } else {
    //   return false;
    // }
  } catch (error) {
    return false;
  }
}

/**
 * 获取初始化状态
 */
export function isWechatPayInitialized(): boolean {
  return wechatPayService.isInitialized();
}

/**
 * 获取当前应用 ID
 */
export function getWechatAppId(): string {
  return wechatPayService.getAppId();
}

/**
 * 使用示例：在 App.tsx 中调用
 * 
 * ```typescript
 * import { useEffect } from 'react';
 * import { initializeWechatPay } from './api/services/payment/wechatPayInit';
 * 
 * export default function App() {
 *   useEffect(() => {
 *     // 应用启动时初始化微信支付
 *     initializeWechatPay().then((success) => {
 *       if (success) {
 *         console.log('微信支付初始化成功');
 *       } else {
 *         console.log('微信支付初始化失败');
 *       }
 *     });
 *   }, []);
 * 
 *   return <YourApp />;
 * }
 * ```
 */
