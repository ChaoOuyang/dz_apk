/**
 * Token 存储管理模块
 * 用于存储、获取和清理用户登录的 token
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export interface TokenData {
  token: string;
  expiresAt?: number; // 过期时间戳，可选
  createdAt: number; // 创建时间戳
}

/**
 * 保存 token
 */
export async function saveToken(token: string, expiresIn?: number): Promise<void> {
  try {
    const now = Date.now();
    const expiresAt = expiresIn ? now + expiresIn * 1000 : undefined;
    
    const tokenData: TokenData = {
      token,
      expiresAt,
      createdAt: now,
    };

    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    console.log('✅ [TokenStorage] Token saved successfully');
  } catch (error) {
    console.error('❌ [TokenStorage] Failed to save token:', error);
    throw error;
  }
}

/**
 * 获取存储的 token
 */
export async function getToken(): Promise<string | null> {
  try {
    const tokenDataStr = await AsyncStorage.getItem(TOKEN_KEY);
    if (!tokenDataStr) {
      return null;
    }

    const tokenData: TokenData = JSON.parse(tokenDataStr);
    
    // 检查 token 是否过期
    if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
      console.warn('⚠️ [TokenStorage] Token has expired');
      await removeToken();
      return null;
    }

    return tokenData.token;
  } catch (error) {
    console.error('❌ [TokenStorage] Failed to get token:', error);
    return null;
  }
}

/**
 * 检查 token 是否存在且有效
 */
export async function hasValidToken(): Promise<boolean> {
  const token = await getToken();
  return token !== null && token !== '';
}

/**
 * 移除 token
 */
export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('✅ [TokenStorage] Token removed successfully');
  } catch (error) {
    console.error('❌ [TokenStorage] Failed to remove token:', error);
  }
}

/**
 * 清空所有认证相关数据
 */
export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, TOKEN_EXPIRY_KEY]);
    console.log('✅ [TokenStorage] All auth data cleared');
  } catch (error) {
    console.error('❌ [TokenStorage] Failed to clear auth data:', error);
  }
}
