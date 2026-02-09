/**
 * Mock 数据模块
 * 
 * 提供开发环境中使用 mock 数据的能力
 * 可以通过设置 USE_MOCK_DATA 来切换是否使用 mock 数据
 */

export { ACTIVITY_SIGNUP_MOCK, getActivitySignupMock } from './activitySignupMock';

/**
 * 是否使用 Mock 数据
 * 在开发环境中可以设置为 true 来模拟后端数据
 * 在生产环境应该设置为 false
 * 
 * React Native 中 __DEV__ 是全局变量，在开发环境为 true，在生产环境为 false
 */
// @ts-ignore - __DEV__ 是 React Native 全局变量
export const USE_MOCK_DATA = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

/**
 * 模拟网络延迟（毫秒）
 * 用于更真实地模拟网络请求
 */
export const MOCK_DELAY_MS = 500;
