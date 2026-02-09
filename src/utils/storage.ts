/**
 * 存储工具函数
 * 用于 AsyncStorage 的封装和本地数据存储
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 保存字符串值
 */
export const saveString = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving string for key ${key}:`, error);
    throw error;
  }
};

/**
 * 获取字符串值
 */
export const getString = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting string for key ${key}:`, error);
    return null;
  }
};

/**
 * 保存对象（自动 JSON 序列化）
 */
export const saveObject = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving object for key ${key}:`, error);
    throw error;
  }
};

/**
 * 获取对象（自动 JSON 反序列化）
 */
export const getObject = async (key: string): Promise<any | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting object for key ${key}:`, error);
    return null;
  }
};

/**
 * 删除指定键
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key ${key}:`, error);
    throw error;
  }
};

/**
 * 清空所有存储
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};
