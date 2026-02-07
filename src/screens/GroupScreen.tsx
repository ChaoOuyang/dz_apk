import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';

interface ChatGroup {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount: number;
  memberCount: number;
  hasNotification: boolean;
  avatar?: string;
}

const mockGroups: ChatGroup[] = [
  {
    id: '1',
    name: '本周六 18:00 太阳宫足球俱乐部',
    lastMessage: '明天有人来吗？',
    unreadCount: 2,
    memberCount: 8,
    hasNotification: true,
  },
  {
    id: '2',
    name: '下周一 19:30 朝阳体育公园',
    lastMessage: '报名人数已满',
    unreadCount: 0,
    memberCount: 12,
    hasNotification: false,
  },
  {
    id: '3',
    name: '周三 20:00 西二旗五人足球场',
    lastMessage: '大家周三见',
    unreadCount: 5,
    memberCount: 6,
    hasNotification: false,
  },
  {
    id: '4',
    name: '周末 15:00 建国路11号球场',
    lastMessage: '谁有事吗？',
    unreadCount: 1,
    memberCount: 10,
    hasNotification: true,
  },
  {
    id: '5',
    name: '本周五 21:00 东三环足球场',
    lastMessage: '有没有新人想加入？',
    unreadCount: 0,
    memberCount: 9,
    hasNotification: false,
  },
];

const GroupScreen = () => {
  const renderGroupItem = ({ item }: { item: ChatGroup }) => (
    <TouchableOpacity style={styles.groupItem}>
      {/* Avatar Placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>⚽</Text>
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.groupMeta}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || '暂无消息'}
          </Text>
          <Text style={styles.memberCount}>👥 {item.memberCount}</Text>
          {item.hasNotification && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>🔔</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>群聊</Text>
      </View>

      {/* Groups List */}
      <FlatList
        data={mockGroups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  groupItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
    ...theme.shadows.light,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  groupName: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: '#E65100',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    flexShrink: 0,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lastMessage: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  memberCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    flexShrink: 0,
  },
  notificationBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notificationText: {
    fontSize: 12,
  },
});

export default GroupScreen;
