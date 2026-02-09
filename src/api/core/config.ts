/**
 * API 配置
 */

import { Platform } from 'react-native';

const getLocalServerUrl = (): string => {
  const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  return `http://${host}:80/0827/`;
};

export const API_BASE_URL = getLocalServerUrl();

export const FIXED_SESSION = 'axdTx2Xlq4Xbl7xL';
export const API_SECRET = 'e2ffab74c3d1f8477a801a7377b66125';

export const API_ENDPOINTS = {
  showSignup: 'api/core/show_signup',
  getMyGroups: 'api/app/group/list/my',
  getGroupByActivity: 'api/app/group/getByActivity',
  getGroupInfo: 'api/app/group/info',
  createGroup: 'api/app/group/create',
  addMemberToGroup: 'api/app/group/member/add',
  kickMember: 'api/app/group/member/kick',
  sendMessage: 'api/app/group/message/send',
  getMessages: 'api/app/group/message/list',
};

export const POST_ENDPOINTS = new Set<keyof typeof API_ENDPOINTS>([
  'createGroup',
  'addMemberToGroup',
  'kickMember',
  'sendMessage',
]);

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string =>
  API_BASE_URL + API_ENDPOINTS[endpoint];
