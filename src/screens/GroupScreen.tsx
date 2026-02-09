import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Image,
} from 'react-native';
import { theme } from '../theme';
import { getMyGroups } from '../api/services/group';
import type { GroupActivityInfo } from '../api/types/group';

const HISTORY_GROUPS_PAGE_SIZE = 10;

// 活动状态枚举
enum ActivityStatus {
  RECRUITING = 1, // 进行中
  CANCELLED = 3, // 已取消
  ENDED = 4, // 已结束
}

interface GroupSection {
  title: string;
  data: GroupActivityInfo[];
}

const GroupScreen = () => {
  const [recruitingGroups, setRecruitingGroups] = useState<GroupActivityInfo[]>([]);
  const [historyGroups, setHistoryGroups] = useState<GroupActivityInfo[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  // 初始化加载群组数据
  const loadGroups = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const result = await getMyGroups({
        page,
        size: HISTORY_GROUPS_PAGE_SIZE,
      });

      if (result) {
        setRecruitingGroups(result.recruitingGroups);
        if (append) {
          setHistoryGroups(prev => [...prev, ...result.historyGroups]);
        } else {
          setHistoryGroups(result.historyGroups);
        }
        // 判断是否还有更多数据
        setHasMoreHistory(result.historyGroups.length >= HISTORY_GROUPS_PAGE_SIZE);
      } else {
        setError('加载群组失败');
      }
    } catch (err) {
      setError('获取群组数据异常');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadGroups(1, false);
  }, [loadGroups]);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHistoryPage(1);
    loadGroups(1, false).then(() => setIsRefreshing(false));
  }, [loadGroups]);

  // 加载更多历史活动
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMoreHistory) {
      const nextPage = historyPage + 1;
      setHistoryPage(nextPage);
      loadGroups(nextPage, true);
    }
  }, [isLoadingMore, isLoading, hasMoreHistory, historyPage, loadGroups]);

  // 获取活动状态文本和颜色
  const getStatusInfo = (status: number): { text: string; color: string } => {
    switch (status) {
      case ActivityStatus.RECRUITING:
        return { text: '进行中', color: '#4CAF50' };
      case ActivityStatus.CANCELLED:
        return { text: '已取消', color: '#F44336' };
      case ActivityStatus.ENDED:
        return { text: '已结束', color: '#999999' };
      default:
        return { text: '未知', color: '#999999' };
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  // 获取群聊图标中每个小图片的位置尺寸（参考微信群头像布局算法）
  const getRectsInGroupIcon = (wh: number, count: number) => {
    // 如果只有1张图片就直接占全部位置
    if (count === 1) {
      return [{ x: 0, y: 0, width: wh, height: wh }];
    }

    const array: Array<{ x: number; y: number; width: number; height: number }> = [];
    // 图片间距
    let padding = 2;
    // 小图片尺寸
    let cellWH: number;
    // 用于后面计算的单元格数量（小于等于4张图片算4格单元格，大于4张算9格单元格）
    let cellCount: number;

    if (count <= 4) {
      cellWH = (wh - padding * 3) / 2;
      cellCount = 4;
    } else {
      padding = padding / 2;
      cellWH = (wh - padding * 4) / 3;
      cellCount = 9;
    }

    // 总行数
    const rowCount = Math.floor(Math.sqrt(cellCount));
    // 根据单元格长宽，间距，数量返回所有单元格初步对应的位置尺寸
    for (let i = 0; i < cellCount; i++) {
      // 当前行
      const row = Math.floor(i / rowCount);
      // 当前列
      const column = i % rowCount;
      const rect = {
        x: padding * (column + 1) + cellWH * column,
        y: padding * (row + 1) + cellWH * row,
        width: cellWH,
        height: cellWH,
      };
      array.push(rect);
    }

    // 根据实际图片的数量再调整单元格的数量和位置
    if (count === 2) {
      array.splice(0, 2);
      for (let i = 0; i < array.length; i++) {
        array[i].y = array[i].y - (padding + cellWH) / 2;
      }
    } else if (count === 3) {
      array.splice(0, 1);
      array[0].x = (wh - cellWH) / 2;
    } else if (count === 5) {
      array.splice(0, 4);
      for (let i = 0; i < array.length; i++) {
        if (i < 2) {
          array[i].x = array[i].x - (padding + cellWH) / 2;
        }
        array[i].y = array[i].y - (padding + cellWH) / 2;
      }
    } else if (count === 6) {
      array.splice(0, 3);
      for (let i = 0; i < array.length; i++) {
        array[i].y = array[i].y - (padding + cellWH) / 2;
      }
    } else if (count === 7) {
      array.splice(0, 2);
      array[0].x = (wh - cellWH) / 2;
    } else if (count === 8) {
      array.splice(0, 1);
      for (let i = 0; i < 2; i++) {
        array[i].x = array[i].x - (padding + cellWH) / 2;
      }
    }
    return array;
  };

  // 群组卡片组件
  const GroupCard = ({ item }: { item: GroupActivityInfo }) => {
    const statusInfo = getStatusInfo(item.status);
    // 最多显示9个成员头像
    const displayMembers = item.memberHeadimgurls?.slice(0, 9) || [];
    
    // 渲染群头像
    const renderGroupAvatar = () => {
      if (displayMembers.length === 0) {
        // 没有成员头像时显示默认群头像
        return item.headimgurl ? (
          <Image
            source={{ uri: item.headimgurl }}
            style={styles.groupAvatar}
          />
        ) : (
          <View style={[styles.groupAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>
              {item.groupName?.charAt(0) || '群'}
            </Text>
          </View>
        );
      }

      // 显示成员头像（微信风格布局）
      const avatarSize = 60;
      const rects = getRectsInGroupIcon(avatarSize, displayMembers.length);
      
      return (
        <View style={styles.memberGrid}>
          {displayMembers.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={{
                position: 'absolute',
                left: rects[index].x,
                top: rects[index].y,
                width: rects[index].width,
                height: rects[index].height,
                borderRadius: 4,
              }}
            />
          ))}
        </View>
      );
    };
    
    return (
      <TouchableOpacity style={styles.groupCard}>
        {/* 左边：群头像 */}
        <View style={styles.avatarContainer}>
          {renderGroupAvatar()}
        </View>

        {/* 右边：信息区域 */}
        <View style={styles.cardInfo}>
          {/* 上面：活动时间和地点 */}
          <View style={styles.topSection}>
            <View style={styles.headerContent}>
              <Text style={styles.timeAndLocation} numberOfLines={1}>
                {formatDate(item.activeDate)} • {item.bollPark}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusText}>{statusInfo.text}</Text>
              </View>
            </View>
          </View>

          {/* 下面：备注 */}
          {item.remark && (
            <View style={styles.bottomSection}>
              <Text style={styles.remarkText} numberOfLines={1}>
                {item.remark}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 加载指示器
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>加载中...</Text>
    </View>
  );

  // 错误提示
  const ErrorMessage = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => handleRefresh()}
      >
        <Text style={styles.retryButtonText}>重试</Text>
      </TouchableOpacity>
    </View>
  );

  // 加载更多的加载指示器
  const LoadMoreIndicator = () => (
    isLoadingMore ? (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : null
  );

  // 没有更多数据提示
  const NoMoreData = () => (
    historyGroups.length > 0 && !hasMoreHistory ? (
      <View style={styles.noMoreContainer}>
        <Text style={styles.noMoreText}>没有更多数据了</Text>
      </View>
    ) : null
  );

  // 空状态
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>⚽</Text>
      <Text style={styles.emptyTitle}>暂无群组</Text>
      <Text style={styles.emptySubtitle}>参加活动后会自动加入群组</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>群聊</Text>
        </View>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (error && recruitingGroups.length === 0 && historyGroups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>群聊</Text>
        </View>
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const isEmpty = recruitingGroups.length === 0 && historyGroups.length === 0;

  // 准备 SectionList 数据
  const sections: GroupSection[] = [];
  if (recruitingGroups.length > 0) {
    sections.push({
      title: '进行中',
      data: recruitingGroups,
    });
  }
  if (historyGroups.length > 0) {
    sections.push({
      title: '历史记录',
      data: historyGroups,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>群聊</Text>
      </View>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          renderItem={({ item }: { item: any }) => <GroupCard item={item} />}
          renderSectionHeader={({ section: { title } }: { section: any }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <View style={styles.sectionDivider} />
            </View>
          )}
          keyExtractor={(item: any, index: number) =>
            `${item.groupId}-${item.status}-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => (
            <>
              <LoadMoreIndicator />
              <NoMoreData />
            </>
          )}
        />
      )}
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
  sectionHeader: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  groupCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.light,
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: theme.colors.white,
    ...theme.typography.bodySmallSemiBold,
    fontSize: 24,
  },
  memberGrid: {
    width: 60,
    height: 60,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  groupName: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusText: {
    color: theme.colors.white,
    ...theme.typography.label,
    fontWeight: '600',
  },
  timeAndLocation: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  bottomSection: {
    marginTop: theme.spacing.xs,
  },
  remarkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.tertiary,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  retryButtonText: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.white,
  },
  loadMoreContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  noMoreContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  noMoreText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
});

export default GroupScreen;
