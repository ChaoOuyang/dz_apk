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
import * as WeChat from 'react-native-wechat-lib';
import { theme } from '../theme';
import { useUserContext } from '../context/UserContext';
import { useAppContext } from '../../App';
import EditProfileScreen from './EditProfileScreen';
import { printSignatureDebugInfo } from '../utils/signatureUtils';

const ProfileScreen = () => {
  const { user, updateUserProfile } = useUserContext();
  const { setShowTabBar } = useAppContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isWeChatInstalled, setIsWeChatInstalled] = useState(false);

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
      // 打印签名信息用于调试
      if (Platform.OS === 'android') {
        console.log('开始获取应用签名信息...');
        await printSignatureDebugInfo();
      }
      
      // 注册微信 AppID
      // 重要：signature 是根据应用包名和签名生成的，用于验证应用身份
      const appId = 'wx46279c0318624f78';
      
      // 使用 registerApp 注册应用
      // 第二个参数是 Universal Link (iOS) 或 App Link (Android)
      await WeChat.registerApp(appId, 'https://your-universal-link.com/');
      
      console.log('微信 SDK 已注册');
      
      // 检查微信是否安装
      const installed = await WeChat.isWXAppInstalled();
      console.log('微信安装状态:', installed);
      setIsWeChatInstalled(installed);
    } catch (error) {
      console.error('微信初始化失败:', error);
      // 不弹出alert，允许用户继续使用应用
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

      // 发起微信授权登录请求
      const result = await WeChat.sendAuthRequest('snsapi_userinfo', 'wechat_login');
      
      // 处理授权回调
      if (result && result.code) {
        // 在实际应用中，需要将 code 发送到后端服务器
        // 后端通过 code 换取 access_token 和用户信息
        console.log('微信授权 code:', result.code);
        
        // 模拟登录成功，更新用户信息
        updateUserProfile({
          nickname: '微信用户',
          avatar: 'https://via.placeholder.com/150/07C160/FFFFFF?text=WeChat',
        });
        
        Alert.alert('成功', '微信登录成功！');
      }
    } catch (error: any) {
      console.error('微信登录失败:', error);
      if (error.errCode === -2) {
        // 用户取消
        Alert.alert('提示', '用户取消授权');
      } else {
        Alert.alert('错误', '微信登录失败：' + (error.message || '未知错误'));
      }
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
            style={styles.wechatButton}
            onPress={handleWeChatLogin}
            disabled={!isWeChatInstalled}
          >
            <View style={styles.wechatIcon}>
              <Text style={styles.wechatIconText}>微</Text>
            </View>
            <Text style={styles.wechatButtonText}>
              {isWeChatInstalled ? '微信登录' : '未安装微信'}
            </Text>
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
    backgroundColor: '#07C160',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#07C160',
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
