/**
 * 群组相关API服务
 * 
 * 提供群组创建、获取、成员管理等功能
 */

import { request } from '../../core';

/**
 * 群组信息接口
 */
export interface AppGroup {
  groupId: string | number;
  activityId: string | number;
  name: string;
  ownerId: string | number;
  createdAt: string;
  memberCount: number;
}

/**
 * 群创建响应
 */
export interface GroupCreateResponse {
  group: AppGroup;
}

/**
 * 获取群信息响应
 */
export interface GroupInfoResponse {
  group: AppGroup;
}

/**
 * 查询活动对应的群响应
 */
export interface GroupQueryResponse {
  group: AppGroup | null;
}

/**
 * 添加成员响应
 */
export interface AddMemberResponse {
  success: boolean;
  message?: string;
}

/**
 * 群组服务类
 */
export class GroupService {
  /**
   * 查询活动对应的群
   * 如果群不存在，返回 null，可能需要创建新群
   * 
   * @param activityId 活动ID
   * @returns 群信息，如果不存在则为 null
   */
  static async getGroupByActivity(activityId: number): Promise<AppGroup | null> {
    try {
      console.log('[GroupService] Fetching group by activity ID:', activityId);
      
      const result = await request<GroupQueryResponse>(
        'getGroupByActivity',
        { activityId },
        { showErrorAlert: false }
      );

      if (result && result.group) {
        console.log('[GroupService] Found group:', result.group);
        return result.group;
      }

      console.log('[GroupService] No group found for activity:', activityId);
      return null;
    } catch (error) {
      console.error('[GroupService] Error fetching group by activity:', error);
      return null;
    }
  }

  /**
   * 创建新群
   * 
   * @param activityId 活动ID
   * @param groupName 群名称（默认为"活动群"）
   * @returns 创建的群信息
   */
  static async createGroup(
    activityId: number,
    groupName: string = '活动群'
  ): Promise<AppGroup | null> {
    try {
      console.log('[GroupService] Creating group for activity:', activityId, 'name:', groupName);

      const result = await request<GroupCreateResponse>(
        'createGroup',
        {
          activityId,
          name: groupName,
        },
        { isPost: true, showErrorAlert: false }
      );

      if (result && result.group) {
        console.log('[GroupService] Group created successfully:', result.group);
        return result.group;
      }

      console.error('[GroupService] Failed to create group');
      return null;
    } catch (error) {
      console.error('[GroupService] Error creating group:', error);
      return null;
    }
  }

  /**
   * 获取或创建活动对应的群
   * 优先获取现有群，如果不存在则创建新群
   * 
   * @param activityId 活动ID
   * @param groupName 群名称（创建新群时使用）
   * @returns 群信息
   */
  static async getOrCreateGroup(
    activityId: number,
    groupName: string = '活动群'
  ): Promise<AppGroup | null> {
    try {
      console.log('[GroupService] Getting or creating group for activity:', activityId);

      // 先尝试获取现有群
      let group = await this.getGroupByActivity(activityId);

      // 如果群不存在，则创建新群
      if (!group) {
        console.log('[GroupService] Group not found, creating new group...');
        group = await this.createGroup(activityId, groupName);
      }

      return group;
    } catch (error) {
      console.error('[GroupService] Error getting or creating group:', error);
      return null;
    }
  }

  /**
   * 拉用户进群
   * 
   * @param groupId 群ID
   * @param userId 用户ID
   * @returns 是否成功
   */
  static async addMemberToGroup(groupId: number | string, userId: number | string): Promise<boolean> {
    try {
      console.log('[GroupService] Adding member to group:', { groupId, userId });

      const result = await request<AddMemberResponse>(
        'addMemberToGroup',
        { groupId, userId },
        { isPost: true, showErrorAlert: false }
      );

      if (result && result.success) {
        console.log('[GroupService] Member added successfully');
        return true;
      }

      console.error('[GroupService] Failed to add member:', result?.message);
      return false;
    } catch (error) {
      console.error('[GroupService] Error adding member to group:', error);
      return false;
    }
  }
}

// 导出实例方法
export const getGroupByActivity = (activityId: number) => GroupService.getGroupByActivity(activityId);
export const createGroup = (activityId: number, groupName?: string) => GroupService.createGroup(activityId, groupName);
export const getOrCreateGroup = (activityId: number, groupName?: string) => GroupService.getOrCreateGroup(activityId, groupName);
export const addMemberToGroup = (groupId: number | string, userId: number | string) => GroupService.addMemberToGroup(groupId, userId);
