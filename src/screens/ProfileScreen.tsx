import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { useUserContext } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import EditProfileScreen from './EditProfileScreen';
import { useWeChat } from '../hooks/useWeChat';

const ProfileScreen = () => {
  const { user, updateUserProfile } = useUserContext();
  const { setShowTabBar } = useAppContext();
  const { sendAuthRequest } = useWeChat();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 配置参考：https://jueljin.cn/post/7541714394016792585
  // SDK 初始化和事件监听已在 App.tsx 中进行

  useEffect(() => {
    if (showEditModal) {
      setShowTabBar(false);
    } else {
      setShowTabBar(true);
    }
    return () => {
      setShowTabBar(true);
    };
  }, [showEditModal, setShowTabBar]);

  const handleWeChatLogin = async () => {
    try {
      setIsLoggingIn(true);

      // 4.2 使用 useWeChat Hook 发送登录请求
      const response = await sendAuthRequest('snsapi_userinfo', 'wechat_sdk_demo');

      console.log('WeChat login response:', response);

      if (response && response.errCode === 0 && response.code) {
        // 登录成功
        // 在实际应用中，这里应该将 response.code 发送到后端服务器
        // 后端服务器使用 code 换取 access_token 和 openid，然后获取用户信息

        console.log('WeChat Authorization Code:', response.code);
        Alert.alert('登录成功', `Code: ${response.code}\n\n(已打印到控制台，请在后端使用此Code)`);

        // 这里仅做前端模拟
        updateUserProfile({
          nickname: '微信用户',
        });
      } else if (response) {
        // 登录失败
        Alert.alert('失败', '登录失败: ' + (response.errStr || '未知错误'));
      }
    } catch (error: any) {
      console.error('WeChat login error:', error);
      Alert.alert('错误', '登录发生错误: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (showEditModal) {
    return <EditProfileScreen onBackPress={() => setShowEditModal(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* User Card */}
        <View style={styles.userCard}>
          {/* Avatar */}
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.nickname}>{user.nickname}</Text>
            <Text style={styles.userId}>ID: {user.id}</Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editButtonText}>编辑</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Options */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionLabel}>账户与安全</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionLabel}>帮助与反馈</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionLabel}>关于我们</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* WeChat Login */}
        <View style={[styles.optionsSection, { marginTop: 20 }]}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={handleWeChatLogin}
            disabled={isLoggingIn}
          >
            <Text style={[styles.optionLabel, isLoggingIn && { opacity: 0.6 }]}>
              {isLoggingIn ? '登录中...' : '微信登录'}
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  header: {
    height: theme.spacing.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 0,
    elevation: 0,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: theme.spacing.lg,
    backgroundColor: '#E8E8E8',
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    ...theme.typography.titleSmall,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  userId: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  editButtonText: {
    ...theme.typography.bodySmallSemiBold,
    color: '#fff',
  },
  optionsSection: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  optionArrow: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
});

export default ProfileScreen;
