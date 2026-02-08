/**
 * 群组相关API服务
 * 
 * 统一的错误处理约定：
 * 1. 所有请求都通过 request 函数处理，自动验证 respCode
 * 2. 当 respCode !== "0" 时，request 函数会抛出异常
 * 3. 调用方使用 try-catch 捕获异常，或传入 showErrorAlert 选项控制错误提示
 * 4. 返回值：成功时返回业务数据，失败时返回 null
 */

import { request } from '../../core';
import type {
  AppGroup,
  AppGroupMessage,
  GroupCreateParams,
  GroupInfoParams,
  GroupQueryByActivityParams,
  AddMemberParams,
  KickMemberParams,
  SendMessageParams,
  GetMessagesParams,
  GroupCreateResponse,
  GroupInfoResponse,
  GroupQueryResponse,
  AddMemberResponse,
  KickMemberResponse,
  SendMessageResponse,
  GetMessagesResponse,
  GetMyGroupsParams,
  GetMyGroupsResponse,
  GroupActivityInfo,
} from '../../types';

/**
 * 群组服务
 */
export class GroupService {
  /**
   * 获取我的群组（分为进行中和历史）
   */
  static async getMyGroups(params: GetMyGroupsParams = {}): Promise<{ recruitingGroups: GroupActivityInfo[]; historyGroups: GroupActivityInfo[] } | null> {
    try {
      const result = await request<GetMyGroupsResponse>(
        'getMyGroups',
        {
          page: params.page ?? 1,
          size: params.size ?? 10,
        },
        { showErrorAlert: false }
      );
      return {
        recruitingGroups: result?.recruitingGroups ?? [],
        historyGroups: result?.historyGroups ?? [],
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 查询活动对应的群
   */
  static async getGroupByActivity(params: GroupQueryByActivityParams): Promise<AppGroup | null> {
    try {
      const result = await request<GroupQueryResponse>(
        'getGroupByActivity',
        { activityId: params.activityId },
        { showErrorAlert: false }
      );
      return result?.group ?? null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 创建新群
   */
  static async createGroup(params: GroupCreateParams): Promise<AppGroup | null> {
    try {
      const result = await request<GroupCreateResponse>(
        'createGroup',
        { activityId: params.activityId, name: params.name }
      );
      return result?.group ?? null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取或创建活动对应的群
   */
  static async getOrCreateGroup(
    activityId: number | string,
    groupName: string = '活动群'
  ): Promise<AppGroup | null> {
    let group = await this.getGroupByActivity({ activityId });
    return group || this.createGroup({ activityId, name: groupName });
  }

  /**
   * 获取群信息
   */
  static async getGroupInfo(params: GroupInfoParams): Promise<AppGroup | null> {
    try {
      const result = await request<GroupInfoResponse>(
        'getGroupInfo',
        { groupId: params.groupId },
        { showErrorAlert: false }
      );
      return result?.group ?? null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 拉用户进群
   * 
   * 当 respCode 为 "0" 时请求成功，request 函数会返回响应数据
   * 当 respCode 不为 "0" 时，request 函数会抛出异常
   */
  static async addMemberToGroup(params: AddMemberParams): Promise<boolean> {
    try {
      const result = await request<AddMemberResponse>(
        'addMemberToGroup',
        { groupId: params.groupId },
        { showErrorAlert: true }
      );
      // request 函数已验证 respCode 为 "0"，所以这里只需检查返回值是否存在
      return !!result;
    } catch {
      // 异常已由 request 函数处理（如果 showErrorAlert 为 true，已显示错误提示）
      return false;
    }
  }

  /**
   * 踢出群成员
   * 
   * 当 respCode 为 "0" 时请求成功
   */
  static async kickMember(params: KickMemberParams): Promise<boolean> {
    try {
      const result = await request<KickMemberResponse>(
        'kickMember',
        { groupId: params.groupId, userId: params.userId },
        { showErrorAlert: true }
      );
      // request 函数已验证 respCode 为 "0"，所以返回 true
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * 发送群消息
   * 
   * 当 respCode 为 "0" 时请求成功
   */
  static async sendMessage(params: SendMessageParams): Promise<boolean> {
    try {
      const result = await request<SendMessageResponse>(
        'sendMessage',
        { groupId: params.groupId, content: params.content, type: params.type },
        { showErrorAlert: true }
      );
      // request 函数已验证 respCode 为 "0"，所以返回 true
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * 获取群消息列表
   */
  static async getMessages(params: GetMessagesParams): Promise<AppGroupMessage[]> {
    try {
      const result = await request<GetMessagesResponse>(
        'getMessages',
        { groupId: params.groupId },
        { showErrorAlert: false }
      );
      return result?.messages ?? [];
    } catch {
      return [];
    }
  }
}

// 导出便捷函数
export const getMyGroups = (params?: GetMyGroupsParams) =>
  GroupService.getMyGroups(params);

export const getGroupByActivity = (activityId: number | string) =>
  GroupService.getGroupByActivity({ activityId });

export const getGroupInfo = (groupId: number | string) =>
  GroupService.getGroupInfo({ groupId });

export const createGroup = (activityId: number | string, groupName: string = '活动群') =>
  GroupService.createGroup({ activityId, name: groupName });

export const getOrCreateGroup = (activityId: number | string, groupName: string = '活动群') =>
  GroupService.getOrCreateGroup(activityId, groupName);

export const addMemberToGroup = (groupId: number | string) =>
  GroupService.addMemberToGroup({ groupId });

export const kickMember = (groupId: number | string, userId: number | string) =>
  GroupService.kickMember({ groupId, userId });

export const sendMessage = (groupId: number | string, content: string, type: number = 1) =>
  GroupService.sendMessage({ groupId, content, type });

export const getMessages = (groupId: number | string) =>
  GroupService.getMessages({ groupId });

export type {
  AppGroup,
  GroupCreateResponse,
  GroupInfoResponse,
  GroupQueryResponse,
  AddMemberResponse,
  GetMyGroupsParams,
  GetMyGroupsResponse,
  GroupActivityInfo
} from '../../types';
