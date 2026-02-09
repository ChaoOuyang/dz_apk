import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  DeviceEventEmitter,
} from 'react-native';
import * as WeChat from 'react-native-wechat-lib';

import HomeScreen from './src/screens/HomeScreen';
import GroupScreen from './src/screens/GroupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TabIcon from './src/components/TabIcon';
import { theme } from './src/theme';
import { HomeScreenProvider } from './src/context/HomeScreenContext';
import { UserProvider } from './src/context/UserContext';

interface AppContextType {
  activeTab: 'home' | 'group' | 'profile';
  setActiveTab: (tab: 'home' | 'group' | 'profile') => void;
  showTabBar: boolean;
  setShowTabBar: (show: boolean) => void;
  // 群导航相关
  targetGroupId: string | number | null;
  setTargetGroupId: (id: string | number | null) => void;
  targetGroupName: string | null;
  setTargetGroupName: (name: string | null) => void;
  targetActivityId: number | null;
  setTargetActivityId: (id: number | null) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function AppContent(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'profile'>('home');
  const [showTabBar, setShowTabBar] = useState(true);
  const [targetGroupId, setTargetGroupId] = useState<string | number | null>(null);
  const [targetGroupName, setTargetGroupName] = useState<string | null>(null);
  const [targetActivityId, setTargetActivityId] = useState<number | null>(null);

  // 4.1 初始化 SDK 与事件监听
  useEffect(() => {
    // WeChat AppID 和 Universal Link 配置
    const WECHAT_APPID = 'wx46279c0318624f78'; // 🚨 生产环境请替换为实际的 AppID
    const WECHAT_UNIVERSALLINK = 'https://your.domain.com/app/'; // 🚨 生产环境请替换为实际的 Universal Link

    // 1. 注册 App
    WeChat.registerApp(WECHAT_APPID, WECHAT_UNIVERSALLINK);

    // 2. 添加事件监听
    const wechatRespListener = DeviceEventEmitter.addListener('WeChat_Resp', (resp) => {
      console.log('收到微信回调', resp);
      // resp.type === 'SendMessageToWX.Resp' // 分享
      // resp.type === 'PayReq.Resp' // 支付
      // resp.type === 'SendAuth.Resp' // 登录
      if (resp.errCode === 0) {
        // 根据 resp.type 处理成功逻辑
        console.log('微信操作成功:', resp.type);
      } else {
        // 处理失败逻辑
        console.log('微信操作失败，错误码:', resp.errCode);
      }
    });

    return () => {
      // 移除监听
      wechatRespListener.remove();
    };
  }, []);

  const renderContent = () => {
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

  return (
    <AppContext.Provider value={{ 
      activeTab, 
      setActiveTab, 
      showTabBar, 
      setShowTabBar,
      targetGroupId,
      setTargetGroupId,
      targetGroupName,
      setTargetGroupName,
      targetActivityId,
      setTargetActivityId,
    }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        {/* Main Content Area */}
        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Bottom Tab Bar */}
        {showTabBar && (
          <View style={styles.tabBar}>
            {[
              { key: 'home', label: '大志' },
              { key: 'group', label: '群聊' },
              { key: 'profile', label: '我的' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <TabIcon
                  type={tab.key as 'home' | 'group' | 'profile'}
                  isActive={activeTab === tab.key}
                  size={24}
                />
                <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>
    </AppContext.Provider>
  );
}

function App(): React.JSX.Element {
  return (
    <UserProvider>
      <HomeScreenProvider>
        <AppContent />
      </HomeScreenProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: theme.spacing.tabBarHeight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.tabBarBorder,
    backgroundColor: theme.colors.tabBarBackground,
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    ...theme.typography.labelSmall,
    color: theme.colors.tabBarIconInactive,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
});

export default App;
