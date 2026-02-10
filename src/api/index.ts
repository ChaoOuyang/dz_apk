/**
 * API 模块统一导出文件
 * 
 * 这是 src/api 模块的主导出点，提供了所有 API 相关的函数、类型和服务
 */

// ============ 核心通信层 ============
export {
  // 配置相关
  API_BASE_URL,
  API_ENDPOINTS,
  FIXED_SESSION,
  API_SECRET,
  getApiUrl,
  // 请求相关
  request,
  requestWithRetry,
  // 工具函数
  generateSignature,
  generateRandom,
  getTimestamp,
} from './core';

// ============ Token 管理 ============
export {
  saveToken,
  getToken,
  hasValidToken,
  removeToken,
  clearAuth,
  type TokenData,
} from '../utils/tokenStorage';

// ============ 类型定义 ============
export type {
  // 通用类型
  ApiResponse,
  RequestOptions,
  // 活动相关类型
  ActivitySignupParams,
  ActivitySignupResponse,
  // Coze 相关类型
  HistoryMessage,
  StreamCallback,
} from './types';

// ============ 服务层 ============

// 微信登录服务
export {
  wechatLogin,
  type WeChatLoginResponse,
  type WeChatLoginParams,
} from './services/wechat';

// Coze 服务
export { CozeApi } from './services/coze';

// 活动服务
export { getActivitySignup } from './services/activity';

// 群组服务
export {
  GroupService,
  getGroupByActivity,
  createGroup,
  getOrCreateGroup,
  addMemberToGroup,
} from './services/group';
export type { AppGroup, GroupCreateResponse, GroupInfoResponse, GroupQueryResponse, AddMemberResponse } from './services/group';

// ============ Mock 数据 ============
export {
  USE_MOCK_DATA,
  MOCK_DELAY_MS,
  ACTIVITY_SIGNUP_MOCK,
  getActivitySignupMock,
} from './mocks';
