/**
 * 微信认证服务
 * 
 * 使用 react-native-wechat-lib 库实现微信登录功能
 * 支持微信授权登录、获取用户信息、检查微信安装状态等
 * 
 * 当库不可用时，提供详细的诊断信息和故障排除建议
 */

import type { WechatAuthConfig, WechatAuthResponse, WechatLoginCallbackResponse } from '../../types';
import { request } from '../../core';

/**
 * 获取 WeChat 库的引用
 */
let WechatLib: any = null;
let libLoadAttempted = false;

/**
 * 诊断信息接口
 */
interface DiagnosticInfo {
  libraryAvailable: boolean;
  libraryError?: string;
  platform?: string;
  hasNativeModule?: boolean;
}

/**
 * 获取诊断信息
 */
const getDiagnosticInfo = (): DiagnosticInfo => {
  const diagnostic: DiagnosticInfo = {
    libraryAvailable: WechatLib !== null,
  };

  try {
    const { Platform } = require('react-native');
    diagnostic.platform = Platform.OS;
  } catch (e) {
    // 无法获取 Platform 信息
  }

  return diagnostic;
};

/**
 * 获取 WeChat 库，带有详细的错误诊断
 */
const getWechatLib = async (): Promise<any> => {
  if (WechatLib) {
    return WechatLib;
  }

  // 防止重复尝试
  if (libLoadAttempted) {
    return null;
  }

  libLoadAttempted = true;

  try {
    // 尝试导入 react-native-wechat-lib
    WechatLib = require('react-native-wechat-lib');
    console.log('[WechatAuthService] ✓ WeChat library loaded successfully');
    return WechatLib;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const diagnostic = getDiagnosticInfo();
    
    console.error(
      '[WechatAuthService] ✗ Failed to load WeChat library:',
      errorMsg
    );
    console.warn(
      '[WechatAuthService] Platform:', 
      diagnostic.platform || 'unknown'
    );
    console.warn(
      '[WechatAuthService] Troubleshooting steps:',
      [
        '',
        '1. Verify npm package installation:',
        '   npm ls react-native-wechat-lib',
        '',
        '2. Reinstall if needed:',
        '   npm install react-native-wechat-lib --force',
        '',
        '3. Clean native build caches:',
        '   - Android: cd android && ./gradlew clean && cd ..',
        '   - iOS: cd ios && rm -rf Pods Podfile.lock && pod install && cd ..',
        '',
        '4. Verify native configuration:',
        '   - Android: Check AndroidManifest.xml for WXEntryActivity',
        '   - iOS: Check Info.plist for CFBundleURLTypes with WeChat AppID',
        '',
        '5. Rebuild the app:',
        '   npm run android  // or npm run ios',
        '',
        'For detailed setup instructions, see WECHAT_SETUP.md'
      ].join('\n')
    );
    
    return null;
  }
};

/**
 * 微信认证服务类
 */
export class WechatAuthService {
  private static instance: WechatAuthService;
  private initialized = false;
  private appId: string = '';
  private libAvailable = false;

  private constructor() {}

  /**
   * 获取单例
   */
  public static getInstance(): WechatAuthService {
    if (!WechatAuthService.instance) {
      WechatAuthService.instance = new WechatAuthService();
    }
    return WechatAuthService.instance;
  }

  /**
   * 初始化微信认证服务
   * @param config 配置信息（包含 appId 和可选的 universalLink）
   * @returns Promise<boolean> 初始化是否成功
   * 
   * @example
   * const success = await wechatAuthService.initialize({
   *   appId: 'wx46279c0318624f78',
   *   universalLink: 'https://yourdomain.com/wechat'
   * });
   */
  public async initialize(config: WechatAuthConfig): Promise<boolean> {
    try {
      if (this.initialized && this.appId === config.appId) {
        return this.libAvailable;
      }

      this.appId = config.appId;

      const lib = await getWechatLib();
      if (!lib || !lib.registerApp) {
        console.warn(
          '[WechatAuthService] ⚠ WeChat library not available in initialization.\n' +
          'The app will continue to work but WeChat login will not be available.\n' +
          'Check the console above for detailed troubleshooting steps.'
        );
        // 标记为已初始化但库不可用，避免重复加载和日志轰炸
        this.initialized = true;
        this.libAvailable = false;
        return false;
      }

      // 注册应用
      const universalLink = config.universalLink || '';
      const result = await lib.registerApp(config.appId, universalLink);

      if (result) {
        this.initialized = true;
        this.libAvailable = true;
        console.log('[WechatAuthService] ✓ Successfully registered with WeChat (AppID: ' + config.appId + ')');
        return true;
      } else {
        console.warn('[WechatAuthService] ⚠ WeChat registration returned false');
        this.initialized = true;
        this.libAvailable = false;
        return false;
      }
    } catch (error) {
      console.error('[WechatAuthService] Error during initialization:', error);
      this.initialized = true;
      this.libAvailable = false;
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
   * 获取应用 ID
   */
  public getAppId(): string {
    return this.appId;
  }

  /**
   * 获取诊断信息（用于故障排除）
   * @returns DiagnosticInfo 诊断信息
   */
  public getDiagnostics(): DiagnosticInfo {
    return getDiagnosticInfo();
  }

  /**
   * 检查库是否可用（不使用 async，直接检查缓存）
   * @returns boolean 库是否已加载
   */
  public isLibraryAvailable(): boolean {
    return WechatLib !== null && this.libAvailable;
  }

  /**
   * 检查微信是否已安装
   * @returns Promise<boolean> 微信是否已安装
   */
  public async isWechatInstalled(): Promise<boolean> {
    try {
      const lib = await getWechatLib();
      if (!lib || !lib.isWXAppInstalled) {
        return false;
      }

      const result = await lib.isWXAppInstalled();
      return result;
    } catch (error) {
      console.error('[WechatAuthService] Error checking if WeChat is installed:', error);
      return false;
    }
  }

  /**
   * 检查微信是否支持该API
   * @returns Promise<boolean> 微信是否支持
   */
  public async isWechatSupported(): Promise<boolean> {
    try {
      const lib = await getWechatLib();
      if (!lib || !lib.isWXAppSupportApi) {
        return false;
      }

      const result = await lib.isWXAppSupportApi();
      return result;
    } catch (error) {
      console.error('[WechatAuthService] Error checking WeChat support:', error);
      return false;
    }
  }

  /**
   * 获取微信 API 版本号
   * @returns Promise<string> API 版本号
   */
  public async getWechatApiVersion(): Promise<string> {
    try {
      const lib = await getWechatLib();
      if (!lib || !lib.getApiVersion) {
        return 'unknown';
      }

      const version = await lib.getApiVersion();
      return version;
    } catch (error) {
      console.error('[WechatAuthService] Error getting API version:', error);
      return 'unknown';
    }
  }

  /**
   * 打开微信应用
   * @returns Promise<boolean> 是否成功打开
   */
  public async openWechatApp(): Promise<boolean> {
    try {
      const lib = await getWechatLib();
      if (!lib || !lib.openWXApp) {
        return false;
      }

      const result = await lib.openWXApp();
      return result;
    } catch (error) {
      console.error('[WechatAuthService] Error opening WeChat app:', error);
      return false;
    }
  }

  /**
   * 发起微信授权登录
   * @param scope 授权范围（默认为 ['snsapi_userinfo']）
   * @param state OAuth2 状态参数（用于安全验证）
   * @returns Promise<WechatAuthResponse> 登录响应
   * 
   * @example
   * const response = await wechatAuthService.sendAuthRequest(
   *   ['snsapi_userinfo'],
   *   'random_state_string'
   * );
   * 
   * if (response.errCode === 0) {
   *   console.log('Authorization successful, code:', response.code);
   * } else {
   *   console.log('Authorization failed:', response.errStr);
   * }
   */
  public async sendAuthRequest(
    scope: string[] | string = ['snsapi_userinfo'],
    state: string = ''
  ): Promise<WechatAuthResponse> {
    try {
      if (!this.initialized) {
        throw new Error('WechatAuthService is not initialized. Call initialize() first.');
      }

      const lib = await getWechatLib();
      if (!lib || !lib.sendAuthRequest) {
        console.warn('[WechatAuthService] WeChat library not available for auth request');
        return {
          errCode: -1,
          errStr: 'WeChat library not available. Check WECHAT_SETUP.md for setup instructions.',
        };
      }

      // 确保 scope 是数组
      const scopeArray = Array.isArray(scope) ? scope : [scope];

      // 发起授权请求
      const response = await lib.sendAuthRequest(scopeArray, state);

      // 验证响应
      if (!response) {
        return {
          errCode: -1,
          errStr: 'No response from WeChat',
        };
      }

      // 处理响应中的 errCode，-2 表示用户拒绝
      if (response.errCode === -2) {
        return {
          errCode: -2,
          errStr: 'User cancelled authorization',
        };
      }

      return {
        errCode: response.errCode || 0,
        errStr: response.errStr || '',
        code: response.code || '',
        state: response.state || state,
      };
    } catch (error) {
      console.error('[WechatAuthService] Error sending auth request:', error);
      return {
        errCode: -1,
        errStr: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * 处理微信授权回调（用于 iOS 的 URL Scheme 处理）
   * @param url 回调 URL
   * @returns boolean 是否成功处理
   */
  public async handleWechatCallback(url: string): Promise<boolean> {
    try {
      const lib = await getWechatLib();
      if (!lib || !lib.handleOpenURL) {
        return false;
      }

      await lib.handleOpenURL(url);
      return true;
    } catch (error) {
      console.error('[WechatAuthService] Error handling WeChat callback:', error);
      return false;
    }
  }

  /**
   * 使用授权码交换用户信息（调用后端服务器）
   * 
   * 这个方法将授权码发送到后端服务器，后端使用这个授权码调用微信 API
   * 获取用户的 access_token 和用户信息
   * 
   * @param code 微信授权码
   * @param state OAuth2 状态参数（用于验证请求的有效性）
   * @returns Promise<WechatLoginCallbackResponse> 用户信息
   * 
   * @example
   * const userInfo = await wechatAuthService.exchangeCodeForUserInfo(code, state);
   * console.log('User OpenID:', userInfo.openId);
   * console.log('User Nickname:', userInfo.nickName);
   */
  public async exchangeCodeForUserInfo(
    code: string,
    state: string = ''
  ): Promise<WechatLoginCallbackResponse> {
    try {
      if (!code) {
        throw new Error('Authorization code is required');
      }

      console.log('[WechatAuthService] Exchanging code for user info with backend');
      
      // 调用后端 API 来交换授权码获取用户信息
      const userInfo = await request<WechatLoginCallbackResponse>(
        'wechatLoginCallback',
        {
          code,
          state,
        },
        {
          isPost: true,
          showErrorAlert: true,
        }
      );

      if (!userInfo) {
        throw new Error('Failed to get user info from backend');
      }

      if (!userInfo.openId) {
        throw new Error('Invalid response: missing openId');
      }

      console.log('[WechatAuthService] Successfully exchanged code for user info');
      console.log('[WechatAuthService] User OpenID:', userInfo.openId);

      return userInfo;
    } catch (error) {
      console.error('[WechatAuthService] Error exchanging code for user info:', error);
      throw error;
    }
  }
}

// 导出单例
export const wechatAuthService = WechatAuthService.getInstance();
