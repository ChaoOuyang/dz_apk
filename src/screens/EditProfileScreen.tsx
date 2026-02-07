import React, { useState } from 'react';
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
  TextInput,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { useUserContext } from '../context/UserContext';

interface EditProfileScreenProps {
  onBackPress: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBackPress }) => {
  const { user, updateUserProfile, bindWeChat, unbindWeChat } = useUserContext();
  const [editedNickname, setEditedNickname] = useState(user.nickname);
  const [editedPhone, setEditedPhone] = useState(user.phone);
  const [isWeChatBound, setIsWeChatBound] = useState(user.isWeChatBound);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedNickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }

    setIsSaving(true);
    try {
      // 模拟保存延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateUserProfile({
        nickname: editedNickname,
        phone: editedPhone,
      });

      Alert.alert('成功', '个人资料已更新');
      onBackPress();
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeChatBinding = () => {
    if (isWeChatBound) {
      Alert.alert('解绑微信', '确定要解绑微信吗？', [
        { text: '取消', onPress: () => {} },
        {
          text: '确定',
          onPress: () => {
            unbindWeChat();
            setIsWeChatBound(false);
            Alert.alert('成功', '已解绑微信');
          },
        },
      ]);
    } else {
      // 模拟微信绑定流程
      Alert.alert('绑定微信', '即将跳转到微信绑定页面', [
        { text: '取消', onPress: () => {} },
        {
          text: '继续',
          onPress: () => {
            // 模拟绑定成功
            bindWeChat();
            setIsWeChatBound(true);
            Alert.alert('成功', '微信绑定成功');
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑个人资料</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>头像</Text>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>更换头像</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nickname Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>昵称</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入昵称"
            placeholderTextColor={theme.colors.text.secondary}
            value={editedNickname}
            onChangeText={setEditedNickname}
            maxLength={20}
          />
          <Text style={styles.charCount}>
            {editedNickname.length}/20
          </Text>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>电话</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入电话号码"
            placeholderTextColor={theme.colors.text.secondary}
            value={editedPhone}
            onChangeText={setEditedPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* WeChat Binding Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>微信绑定</Text>
          <TouchableOpacity
            style={styles.weChatItem}
            onPress={handleWeChatBinding}
          >
            <View style={styles.weChatInfo}>
              <Text style={styles.weChatLabel}>微信账号</Text>
              <Text style={styles.weChatStatus}>
                {isWeChatBound ? '已绑定' : '未绑定'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.weChatButton,
                isWeChatBound && styles.weChatButtonBound,
              ]}
              onPress={handleWeChatBinding}
            >
              <Text
                style={[
                  styles.weChatButtonText,
                  isWeChatBound && styles.weChatButtonTextBound,
                ]}
              >
                {isWeChatBound ? '已绑定' : '去绑定'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: '300',
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
    backgroundColor: '#E8E8E8',
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.radius.sm,
  },
  changeAvatarText: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.primary,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  weChatItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weChatInfo: {
    flex: 1,
  },
  weChatLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  weChatStatus: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  weChatButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  weChatButtonBound: {
    backgroundColor: '#E8E8E8',
  },
  weChatButtonText: {
    ...theme.typography.bodySmallSemiBold,
    color: '#fff',
  },
  weChatButtonTextBound: {
    color: theme.colors.text.secondary,
  },
  saveButton: {
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...theme.typography.bodySemiBold,
    color: '#fff',
  },
});

export default EditProfileScreen;
