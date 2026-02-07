/**
 * API 配置文件
 * 定义所有后端 API 端点和应用级别的常量
 */

import { Platform } from 'react-native';

// 基础 API URL
// export const API_BASE_URL = 'https://interface.dazhiyouqiu.com/0827/';

/**
 * 获取本地服务器 IP
 * Android 模拟器中需要使用 10.0.2.2 来访问宿主机的 localhost
 * iOS 模拟器和真机中可以使用 127.0.0.1 或 localhost
 */
const getLocalServerUrl = (): string => {
  // Android 模拟器：使用 10.0.2.2
  // iOS 模拟器/真机：使用 127.0.0.1
  const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  return `http://${host}:80/0827/`;
};

export const API_BASE_URL = getLocalServerUrl();

// 固定的会话令牌（rdsession）
export const FIXED_SESSION = 'axdTx2Xlq4Xbl7xL';

// 密钥（用于请求签名）
export const API_SECRET = 'e2ffab74c3d1f8477a801a7377b66125';

// API 端点映射
export const API_ENDPOINTS = { 
  // 活动报名展示
  showSignup: 'api/core/show_signup',
  // 获取微信支付参数
  getWechatPayParams: 'api/attend/userAttendInsurance',
  // 群组相关接口
  getGroupByActivity: 'api/app/group/getByActivity',
  createGroup: 'api/app/group/create',
  addMemberToGroup: 'api/app/group/member/add',
};

/**
 * 获取完整的 API 地址
 * @param endpoint API 端点 key
 * @returns 完整的 URL
 */
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return API_BASE_URL + API_ENDPOINTS[endpoint];
};
