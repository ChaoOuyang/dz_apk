/**
 * 应用导航配置
 * 
 * 当前应用使用底部 Tab 导航，包含三个主要路由：
 * - Home: 大志（首页/活动列表）
 * - Group: 群聊
 * - Profile: 我的（个人资料）
 */

import React from 'react';
import { useAppContext } from '../context/AppContext';
import HomeScreen from '../screens/HomeScreen';
import GroupScreen from '../screens/GroupScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Group: undefined;
  Profile: undefined;
};

/**
 * AppNavigator
 * 根据当前活跃的 tab 来渲染相应的屏幕
 */
export const AppNavigator: React.FC = () => {
  const { activeTab } = useAppContext();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'group':
        return <GroupScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return renderScreen();
};

export default AppNavigator;
