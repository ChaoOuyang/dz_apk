import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
} from 'react-native';
import { ActivityCard, type ActivityInfo } from './ActivityCard';
import { getActivitySignup } from '../api';
import { theme } from '../theme';

interface ActivityCardListProps {
  /** Activity IDs from bot response */
  activityIds: number[];
  /** Optional callback when signup is pressed */
  onSignup?: (activityId: number, activityInfo: ActivityInfo) => void;
}

interface ActivityItemState {
  id: number;
  data?: ActivityInfo;
  loading: boolean;
  error?: string;
}

export const ActivityCardList: React.FC<ActivityCardListProps> = ({
  activityIds,
  onSignup,
}) => {
  const [activities, setActivities] = useState<ActivityItemState[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  // Initialize loading for all activity IDs
  useEffect(() => {
    if (!activityIds || activityIds.length === 0) {
      setActivities([]);
      return;
    }

    setActivities(
      activityIds.map(id => ({
        id,
        loading: true,
      }))
    );

    // Fetch activity data for each ID
    activityIds.forEach(id => {
      fetchActivityData(id);
    });
  }, [activityIds]);

  const fetchActivityData = async (activityId: number) => {
    try {
      setLoadingIds(prev => new Set([...prev, activityId]));
      
      const response = await getActivitySignup(activityId);
      
      console.log(`[ActivityCardList] Fetched activity ${activityId}:`, response);
      
      if (response) {
        // Extract activity info from response
        // API 返回结构: { activity: {...}, signupers: [...], team: {...}, ... }
        const activityData = response.activity || response;
        
        console.log(`[ActivityCardList] Activity data for ${activityId}:`, activityData);
        
        // 构造显示用的活动名称
        const activityName = [
          activityData.bollPark, // 场地名称，例如 "本土王牌LIVE"
          activityData.parkFormat, // 格式，例如 "7人制足球"
        ].filter(Boolean).join(' · ');
        
        // 构造显示用的时间
        const startTime = [
          activityData.time, // 例如 "周六"
          activityData.date, // 例如 "18:00"
        ].filter(Boolean).join(' ');
        
        // 获取位置信息
        const location = activityData.localtion || '地点待定';
        
        // 获取报名人数
        const signupNum = activityData.signupNum || 0;
        const limitNum = activityData.limitNum || 0;
        
        const activityInfo: ActivityInfo = {
          activityId,
          activityName: activityName || `活动 ${activityId}`,
          startTime: startTime || '时间待定',
          location,
          signupNum,
          limitNum,
          remark: activityData.remark,
          // 保留完整的原始数据以供后续使用
          ...response, 
        };

        setActivities(prev =>
          prev.map(item =>
            item.id === activityId
              ? { id: activityId, data: activityInfo, loading: false }
              : item
          )
        );
      } else {
        setActivities(prev =>
          prev.map(item =>
            item.id === activityId
              ? { id: activityId, loading: false, error: '加载失败' }
              : item
          )
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '加载失败';
      console.error(`[ActivityCardList] Error fetching activity ${activityId}:`, errorMsg);
      setActivities(prev =>
        prev.map(item =>
          item.id === activityId
            ? { id: activityId, loading: false, error: errorMsg }
            : item
        )
      );
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
    }
  };

  const handleSignup = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity?.data && onSignup) {
      onSignup(activityId, activity.data);
    }
  };

  const renderActivityItem = ({ item }: { item: ActivityItemState }) => {
    if (item.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{item.error}</Text>
        </View>
      );
    }

    if (!item.data) {
      return (
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '70%' }]} />
          </View>
        </View>
      );
    }

    return (
      <ActivityCard
        activity={item.data}
        onSignup={handleSignup}
        isLoading={loadingIds.has(item.id)}
      />
    );
  };

  if (activityIds.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  errorContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  skeletonCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonContent: {
    gap: theme.spacing.sm,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    width: '100%',
  },
});
