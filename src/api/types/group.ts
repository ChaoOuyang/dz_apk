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

/**
 * 统一的 API 响应基类
 * 所有后端 API 响应都符合以下格式：
 * {
 *   "respCode": "0",        // "0" 表示成功，非 "0" 表示失败
 *   "respMessage": "请求成功",
 *   "group": {...},         // 业务数据
 * }
 */
export interface BaseApiResponse<T = any> {
  respCode: string;           // "0" 成功，其他值为错误码
  respMessage: string;        // 响应消息
  data?: T;                   // 业务数据（可选，由具体接口定义）
}

export interface GroupCreateResponse extends BaseApiResponse {
  group: AppGroup;
}

export interface GroupInfoResponse extends BaseApiResponse {
  group: AppGroup;
}

export interface GroupQueryResponse extends BaseApiResponse {
  group: AppGroup | null;
}

export interface AddMemberResponse extends BaseApiResponse {
  group?: AppGroup;           // 成功时返回群信息
}

export interface KickMemberResponse extends BaseApiResponse {
  // 该接口仅需要检查 respCode 是否为 0
}

export interface SendMessageResponse extends BaseApiResponse {
  messageId?: number;         // 消息 ID
}

export interface GetMessagesResponse extends BaseApiResponse {
  messages: AppGroupMessage[];
}

/**
 * 获取我的群组相关类型
 */

// 群组活动信息（来自后端API）
export interface GroupActivityInfo {
  groupId: number;
  groupName: string;
  ownerId: number;
  createTime: number;
  activityId: number;
  status: number; // 1=进行中, 3=已结束
  activeDate: number;
  bollPark: string;
  headimgurl: string;
  remark: string;
  joinTime: number;
  role: number;
  memberHeadimgurls: string[]; // 群成员头像URL列表
}

// 获取我的群组的参数
export interface GetMyGroupsParams {
  page?: number;
  size?: number;
}

// 获取我的群组的响应
export interface GetMyGroupsResponse extends BaseApiResponse {
  recruitingGroups: GroupActivityInfo[];
  historyGroups: GroupActivityInfo[];
}
