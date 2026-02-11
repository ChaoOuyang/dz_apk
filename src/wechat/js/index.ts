import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import type { AuthResponse, EventType, WechatModule } from './types';
import { WechatError } from './types';

const WechatLogin = NativeModules.WechatLogin as WechatModule;

if (!WechatLogin) {
  throw new Error('WechatLogin native module not found');
}

// Simple EventEmitter implementation for React Native
class SimpleEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();
  private onceListeners: Map<string, Set<Function>> = new Map();

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  once(event: string, listener: Function) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(listener);
  }

  emit(event: string, ...args: any[]) {
    // Call regular listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(listener => {
        listener(...args);
      });
    }

    // Call once listeners and remove them
    if (this.onceListeners.has(event)) {
      const onceListenerSet = this.onceListeners.get(event)!;
      onceListenerSet.forEach(listener => {
        listener(...args);
      });
      this.onceListeners.delete(event);
    }
  }

  addListener(event: string, listener: Function) {
    return this.on(event, listener);
  }

  removeListener(event: string, listener: Function) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener);
    }
    if (this.onceListeners.has(event)) {
      this.onceListeners.get(event)!.delete(listener);
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }
}

let isAppRegistered = false;
const emitter = new SimpleEventEmitter();

// 监听原生事件
DeviceEventEmitter.addListener('WeChat_Resp', (resp: AuthResponse) => {
  emitter.emit(resp.type, resp);
});

DeviceEventEmitter.addListener('WeChat_Req', (resp: AuthResponse) => {
  emitter.emit(resp.type, resp);
});

/**
 * 注册微信 App
 * @param appId 微信 App ID
 * @param universalLink iOS Universal Link (Android 可以传空字符串)
 */
export function registerApp(appId: string, universalLink: string = ''): Promise<boolean> {
  if (isAppRegistered) {
    return Promise.resolve(true);
  }
  
  return new Promise((resolve, reject) => {
    WechatLogin.registerApp(appId, universalLink, (error, result) => {
      if (error) {
        return reject(typeof error === 'string' ? new Error(error) : error);
      }
      isAppRegistered = true;
      resolve(result);
    });
  });
}

/**
 * 检查微信是否已安装
 */
export function isWXAppInstalled(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    WechatLogin.isWXAppInstalled((error, result) => {
      if (error) {
        return reject(typeof error === 'string' ? new Error(error) : error);
      }
      resolve(result);
    });
  });
}

/**
 * 检查微信是否支持 API
 */
export function isWXAppSupportApi(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    WechatLogin.isWXAppSupportApi((error, result) => {
      if (error) {
        return reject(typeof error === 'string' ? new Error(error) : error);
      }
      resolve(result);
    });
  });
}

/**
 * 获取微信 SDK 版本
 */
export function getApiVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    WechatLogin.getApiVersion((error, result) => {
      if (error) {
        return reject(typeof error === 'string' ? new Error(error) : error);
      }
      resolve(result);
    });
  });
}

/**
 * 打开微信 App
 */
export function openWXApp(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    WechatLogin.openWXApp((error, result) => {
      if (error) {
        return reject(typeof error === 'string' ? new Error(error) : error);
      }
      resolve(result);
    });
  });
}

/**
 * 发送微信登录授权请求
 * @param scope 授权作用域，如 'snsapi_userinfo'
 * @param state 用于保持请求和回调的状态
 */
export function sendAuthRequest(
  scope: string = 'snsapi_userinfo',
  state: string = 'wechat_sdk_demo'
): Promise<AuthResponse> {
  if (!isAppRegistered) {
    return Promise.reject(new Error('registerApp required.'));
  }
  
  return new Promise((resolve, reject) => {
    // 先调用原生方法
    WechatLogin.sendAuthRequest(scope, state, () => {});
    
    // 监听回调
    emitter.once('SendAuth.Resp', (resp: AuthResponse) => {
      if (resp.errCode === 0) {
        resolve(resp);
      } else {
        reject(new WechatError(resp));
      }
    });
  });
}

/**
 * 添加事件监听
 */
export function addListener(eventType: EventType, listener: (response: AuthResponse) => void) {
  emitter.addListener(eventType, listener);
}

/**
 * 移除事件监听
 */
export function removeListener(eventType: EventType, listener: (response: AuthResponse) => void) {
  emitter.removeListener(eventType, listener);
}

/**
 * 移除所有事件监听
 */
export function removeAllListeners(eventType?: EventType) {
  if (eventType) {
    emitter.removeAllListeners(eventType);
  } else {
    emitter.removeAllListeners();
  }
}

// 导出类型
export type { AuthResponse, EventType, WechatError };
