/**
 * 群组相关类型定义
 */

export interface AppGroup {
  id: string | number;
  activityId: string | number;
  name: string;
  ownerId: string | number;
  createdAt?: string;
  memberCount?: number;
}

export interface AppGroupMessage {
  id: number;
  groupId: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: number;
  createdAt: string;
}

export interface GroupCreateParams {
  activityId: number | string;
  name: string;
}

export interface GroupInfoParams {
  groupId: number | string;
}

export interface GroupQueryByActivityParams {
  activityId: number | string;
}

export interface AddMemberParams {
  groupId: number | string;
}

export interface KickMemberParams {
  groupId: number | string;
  userId: number | string;
}

export interface SendMessageParams {
  groupId: number | string;
  content: string;
  type: number;
}

export interface GetMessagesParams {
  groupId: number | string;
}

export interface GroupCreateResponse {
  group: AppGroup;
}

export interface GroupInfoResponse {
  group: AppGroup;
}

export interface GroupQueryResponse {
  group: AppGroup | null;
}

export interface AddMemberResponse {
  success: boolean;
  message?: string;
}

export interface KickMemberResponse {
  success: boolean;
  message?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  messageId?: number;
}

export interface GetMessagesResponse {
  messages: AppGroupMessage[];
}
