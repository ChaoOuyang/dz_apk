/**
 * 统一导出所有 API 类型定义
 */

// 通用类型
export type { ApiResponse, RequestOptions } from './common';

// 活动相关类型
export type { ActivitySignupParams, ActivitySignupResponse } from './activity';

// 支付相关类型
export type {
  WechatPayConfig,
  WechatPayRequest,
  WechatPayResult,
  WechatPayParams,
  WechatPayResponse,
  WechatPayFlowConfig,
} from './payment';

// Coze 相关类型
export type { HistoryMessage, StreamCallback } from './coze';
