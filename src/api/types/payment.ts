/**
 * 支付相关的类型定义
 */

/**
 * 微信支付服务配置
 */
export interface WechatPayConfig {
  appId: string;
}

/**
 * 微信支付请求参数（传递给原生 WeChat SDK）
 */
export interface WechatPayRequest {
  appid: string; // 微信应用ID
  partnerid: string; // 商户ID
  prepayid: string; // 预支付ID
  noncestr: string; // 随机字符串
  timestamp: string; // 时间戳
  sign: string; // 签名
  package: string; // 包信息
}

/**
 * 微信支付结果
 */
export interface WechatPayResult {
  errCode: number; // 错误码: 0=成功, -1=用户取消, -2=支付失败
  errStr: string; // 错误描述
  [key: string]: any;
}

/**
 * 微信支付参数
 */
export interface WechatPayParams {
  type?: number; // 支付类型 1: 保险
  privateInsurance?: number; // 是否私有保险
  activityId: number; // 活动ID
  phone?: string; // 手机号
  name?: string; // 姓名
  idCard?: string; // 身份证号
}

/**
 * 微信支付响应 - 支付所需参数
 */
export interface WechatPayResponse {
  appid: string; // 微信应用ID
  partnerid: string; // 商户ID
  prepayid: string; // 预支付ID
  noncestr: string; // 随机字符串
  timestamp: string; // 时间戳
  sign: string; // 签名
  package: string; // 包信息
  [key: string]: any;
}

/**
 * 微信支付流程配置
 */
export interface WechatPayFlowConfig {
  activityId: number;
  phone?: string;
  name?: string;
  idCard?: string;
  type?: number;
  privateInsurance?: number;
  onSuccess?: (result: WechatPayResult) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}
