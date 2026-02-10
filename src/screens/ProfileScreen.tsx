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
  ActivityIndicator,
} from 'react-native';
import * as WeChat from 'react-native-wechat-lib';
import { theme } from '../theme';
import { useUserContext } from '../context/UserContext';
import { useAppContext } from '../../App';
import EditProfileScreen from './EditProfileScreen';
import { wechatLogin } from '../api/services/wechat';
import { saveToken } from '../utils/tokenStorage';

const ProfileScreen = () => {
  const { user, updateUserProfile, setToken } = useUserContext();
  const { setShowTabBar } = useAppContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isWeChatInstalled, setIsWeChatInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化微信 SDK
  useEffect(() => {
    initWeChat();
  }, []);

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

  // 初始化微信 SDK
  const initWeChat = async () => {
    try {
      // 注册微信 AppID
      const appId = 'wx46279c0318624f78';
      await WeChat.registerApp(appId, 'https://your-universal-link.com/');
      
      // 检查微信是否安装
      const installed = await WeChat.isWXAppInstalled();
      setIsWeChatInstalled(installed);
    } catch (error) {
      console.error('微信初始化失败:', error);
      setIsWeChatInstalled(false);
    }
  };

  // 微信登录
  const handleWeChatLogin = async () => {
    try {
      if (!isWeChatInstalled) {
        Alert.alert('提示', '请先安装微信客户端');
        return;
      }

      setIsLoading(true);

      // 发起微信授权登录请求
      const result = await WeChat.sendAuthRequest('snsapi_userinfo', 'wechat_login');
      
      // 处理授权回调
      if (result && result.code) {
        console.log('🔐 微信授权 code:', result.code);
        
        try {
           // 使用 code 向后端服务器交换 token
           // 后端会验证 code，交换用户信息，并返回 token
           const loginResponse = await wechatLogin(result.code);
           
           // 保存 token 到本地存储（后端 Redis 中存储 30 天自动过期）
           await saveToken(loginResponse.token);
           
           // 更新 Context 中的 token
           setToken(loginResponse.token);
           
           // 注意：后端只返回 token，不返回用户信息
           // 用户可以在需要时通过 token 调用其他 API 获取用户信息
           
           Alert.alert('成功', '微信登录成功！');
         } catch (backendError: any) {
           console.error('❌ 后端登录失败:', backendError);
           Alert.alert('错误', backendError.message || '登录失败，请重试');
         }
      }
    } catch (error: any) {
      console.error('❌ 微信登录失败:', error);
      if (error.errCode === -2) {
        // 用户取消
        Alert.alert('提示', '用户取消授权');
      } else {
        Alert.alert('错误', '微信登录失败：' + (error.message || '未知错误'));
      }
    } finally {
      setIsLoading(false);
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

        {/* WeChat Login Section */}
        <View style={styles.wechatSection}>
          <TouchableOpacity 
            style={[
              styles.wechatButton,
              (!isWeChatInstalled || isLoading) && styles.wechatButtonDisabled,
            ]}
            onPress={handleWeChatLogin}
            disabled={!isWeChatInstalled || isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.wechatButtonText}>登录中...</Text>
              </>
            ) : (
              <>
                <View style={styles.wechatIcon}>
                  <Text style={styles.wechatIconText}>微</Text>
                </View>
                <Text style={styles.wechatButtonText}>
                  {isWeChatInstalled ? '微信登录' : '未安装微信'}
                </Text>
              </>
            )}
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
  wechatSection: {
    marginBottom: theme.spacing.xl,
  },
  wechatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wechatButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  wechatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  wechatIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  wechatButtonText: {
    ...theme.typography.body,
    color: '#fff',
    fontWeight: '600',
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
