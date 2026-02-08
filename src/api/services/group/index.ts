/**
 * 群组相关API服务
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
} from '../../types';

/**
 * 群组服务
 */
export class GroupService {
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
   */
  static async addMemberToGroup(params: AddMemberParams): Promise<boolean> {
    try {
      const result = await request<AddMemberResponse>(
        'addMemberToGroup',
        { groupId: params.groupId },
        { showErrorAlert: false }
      );
      return result?.success ?? false;
    } catch {
      return false;
    }
  }

  /**
   * 踢出群成员
   */
  static async kickMember(params: KickMemberParams): Promise<boolean> {
    try {
      const result = await request<KickMemberResponse>(
        'kickMember',
        { groupId: params.groupId, userId: params.userId }
      );
      return result?.success ?? false;
    } catch {
      return false;
    }
  }

  /**
   * 发送群消息
   */
  static async sendMessage(params: SendMessageParams): Promise<boolean> {
    try {
      const result = await request<SendMessageResponse>(
        'sendMessage',
        { groupId: params.groupId, content: params.content, type: params.type }
      );
      return result?.success ?? false;
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
