/**
 * 认证相关的类型定义
 */

/**
 * 微信认证配置
 */
export interface WechatAuthConfig {
  /** 微信应用 ID */
  appId: string;
  /** 微信 Universal Link（iOS 适配），可选 */
  universalLink?: string;
}

/**
 * 微信认证响应
 */
export interface WechatAuthResponse {
  /** 错误代码：0 表示成功，-1 表示错误，-2 表示用户拒绝 */
  errCode: number;
  /** 错误信息 */
  errStr: string;
  /** 授权码，用于后端获取 access_token 和用户信息 */
  code?: string;
  /** OAuth2 状态参数 */
  state?: string;
}

/**
 * 用户认证信息
 * 
 * 用于存储用户的微信授权信息
 */
export interface UserAuthInfo {
  /** 用户唯一 ID */
  userId: string;
  /** 微信授权码 */
  wechatCode: string;
  /** 微信授权状态 */
  wechatState: string;
  /** 授权时间戳 */
  authorizedAt: number;
  /** 是否通过微信授权 */
  isAuthorized: boolean;
}

/**
 * 微信登录回调响应（后端交换授权码获取用户信息）
 * 
 * 后端服务器使用授权码调用微信 API 获取用户信息后的响应
 */
export interface WechatLoginCallbackResponse {
  /** 微信用户唯一标识符（openid） */
  openId: string;
  /** 微信用户的 unionId（如果用户绑定了多个应用） */
  unionId?: string;
  /** 用户昵称 */
  nickName?: string;
  /** 用户头像 */
  avatarUrl?: string;
  /** 用户性别 (1-男, 2-女, 0-未知) */
  sex?: number;
  /** 用户所在省份 */
  province?: string;
  /** 用户所在城市 */
  city?: string;
  /** 用户所在国家 */
  country?: string;
  /** 微信授权码（用于再次调用微信 API） */
  code?: string;
}
