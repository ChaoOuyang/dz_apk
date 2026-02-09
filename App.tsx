import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  DeviceEventEmitter,
  Text,
} from 'react-native';
import * as WeChat from 'react-native-wechat-lib';

import TabIcon from './src/components/TabIcon';
import { theme } from './src/theme';
import { HomeScreenProvider } from './src/context/HomeScreenContext';
import { UserProvider } from './src/context/UserContext';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { AppNavigator } from './src/navigation';
import { WECHAT_APPID, WECHAT_UNIVERSALLINK } from './src/constants';

/**
 * AppContent 组件
 * 应用主体内容，需要在 AppProvider 内部使用以访问 context
 */
function AppContent(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { activeTab, setActiveTab, showTabBar } = useAppContext();

  // 初始化微信 SDK 和事件监听
  useEffect(() => {
    // 1. 注册微信 App
    WeChat.registerApp(WECHAT_APPID, WECHAT_UNIVERSALLINK);

    // 2. 添加微信事件监听
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
      // 清理：移除监听
      wechatRespListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Main Content Area */}
      <View style={styles.content}>
        <AppNavigator />
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
              onPress={() => setActiveTab(tab.key as 'home' | 'group' | 'profile')}
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
  );
}

/**
 * App 根组件
 * 包装所有必要的 Provider
 */
function App(): React.JSX.Element {
  return (
    <UserProvider>
      <HomeScreenProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
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
