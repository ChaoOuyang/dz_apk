/**
 * API 配置文件
 * 定义所有后端 API 端点和应用级别的常量
 */

// 基础 API URL
export const API_BASE_URL = 'https://interface.dazhiyouqiu.com/0827/';

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
};

/**
 * 获取完整的 API 地址
 * @param endpoint API 端点 key
 * @returns 完整的 URL
 */
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return API_BASE_URL + API_ENDPOINTS[endpoint];
};
