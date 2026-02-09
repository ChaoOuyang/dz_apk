/**
 * 应用配置常量
 * 用于存储环境变量、API URL 和其他全局配置
 */

// 应用元数据
export const APP_NAME = 'Dazhiyouqiu';
export const APP_VERSION = '0.0.1';

// API 配置
export const API_TIMEOUT = 10000; // 10 秒

// 微信配置
export const WECHAT_APPID = 'wx46279c0318624f78';
export const WECHAT_UNIVERSALLINK = 'https://your.domain.com/app/';

// 功能开关
export const FEATURE_FLAGS = {
  enableMockData: true,
  enableDebugLogging: true,
} as const;

// 分页配置
export const PAGINATION = {
  pageSize: 20,
  initialPage: 1,
} as const;

// 缓存配置（单位：毫秒）
export const CACHE_EXPIRY = {
  user: 1 * 60 * 60 * 1000, // 1 小时
  activities: 5 * 60 * 1000, // 5 分钟
  groups: 10 * 60 * 1000, // 10 分钟
} as const;
