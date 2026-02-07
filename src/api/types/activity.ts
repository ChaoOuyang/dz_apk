/**
 * 活动相关的类型定义
 */

export interface ActivitySignupParams {
  activity_id: number;
  fromId?: number;
  inviteId?: number;
  iv?: string;
  code?: string;
  encryptedData?: string;
}

export interface ActivitySignupResponse {
  // 根据实际接口响应添加字段
  [key: string]: any;
}
