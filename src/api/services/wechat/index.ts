/**
 * 微信登录服务
 * 处理微信登录相关的 API 请求
 */

import { request } from '../../core';
import type { ApiResponse } from '../../types';

/**
 * 微信登录响应类型
 */
export interface WeChatLoginResponse {
  token: string; // 后端生成的 32 位随机字符串，Redis 中存储 30 天
}

/**
 * 微信授权登录请求参数
 */
export interface WeChatLoginParams {
  code: string; // 微信授权获得的 code
  state?: string;
}

/**
 * 通过微信 code 获取 token
 * 
 * 流程：
 * 1. 调用微信授权获得 code
 * 2. 将 code 发送到后端
 * 3. 后端用 code 换取微信用户信息和 access_token
 * 4. 后端生成应用的 token
 * 5. 返回 token 和用户信息
 * 
 * @param code 微信授权获得的 code
 * @returns token 和用户信息
 */
export async function wechatLogin(code: string): Promise<WeChatLoginResponse> {
  console.log('🔐 [WeChat Login] Exchanging code for token:', code.substring(0, 10) + '...');
  
  try {
    // 使用通用的 request 函数调用后端 API
    // 后端需要实现 api/auth/wechat/login 端点
    const response = await request<WeChatLoginResponse>(
      'wechatLogin',
      { code },
      { showErrorAlert: false }
    );

     if (response) {
       console.log('✅ [WeChat Login] Success:', {
         token: response.token ? response.token.substring(0, 10) + '...' : 'undefined',
       });
       return response;
    } else {
      throw new Error('微信登录失败：未获得 token');
    }
  } catch (error: any) {
    console.error('❌ [WeChat Login] Failed:', error);
    throw error;
  }
}


