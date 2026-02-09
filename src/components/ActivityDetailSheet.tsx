import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Easing,
  Platform,
  Alert,
} from 'react-native';
import type { ActivityInfo } from './ActivityCard';
import { theme } from '../theme';

interface ActivityDetailSheetProps {
  visible: boolean;
  activity: ActivityInfo | null;
  onClose: () => void;
  onSignup: (status: 'signup' | 'pending') => void;
  isLoading?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');
const SHEET_HEIGHT = screenHeight * 0.9; // 占屏幕9/10的高度

export const ActivityDetailSheet: React.FC<ActivityDetailSheetProps> = ({
  visible,
  activity,
  onClose,
  onSignup,
  isLoading = false,
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: screenHeight - SHEET_HEIGHT,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [visible, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: any, gestureState: any) => {
        // 只在竖直方向滑动时响应，避免与按钮点击冲突
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_: any, gestureState: any) => {
        // 只允许向下滑动
        if (gestureState.dy > 0) {
          slideAnim.setValue(screenHeight - SHEET_HEIGHT + gestureState.dy);
        }
      },
      onPanResponderRelease: (_: any, gestureState: any) => {
        // 如果向下滑动超过一定距离，关闭
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.timing(slideAnim, {
            toValue: screenHeight - SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  /**
   * 处理报名操作（仅进群咨询，不进行支付）
   */
  const handlePendingSignup = () => {
    console.log('[ActivityDetailSheet] User requested to join group chat');
    onSignup('pending');
  };



  if (!visible) return null;

  return (
    <>

      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={onClose}
      >
        {/* 背景遮罩 */}
        <TouchableOpacity 
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

          {/* BottomSheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          {/* 拖动指示条 */}
          <View style={styles.dragIndicator} />

          {/* 容器：内容 */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            {...panResponder.panHandlers}
          >
          {activity && (
            <>
              {/* 活动名称 */}
              <Text style={styles.activityTitle}>
                {activity.activityName}
              </Text>

              {/* 详细信息 */}
              <View style={styles.detailsContainer}>
                {/* 时间 */}
                {activity.startTime && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🕐</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>比赛时间</Text>
                      <Text style={styles.detailValue}>
                        {activity.startTime}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 位置 */}
                {activity.location && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>比赛地点</Text>
                      <Text style={styles.detailValue}>
                        {activity.location}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 报名人数 */}
                {activity.signupNum !== undefined && activity.limitNum !== undefined && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>👥</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>报名人数</Text>
                      <Text style={styles.detailValue}>
                        {activity.signupNum}/{activity.limitNum} 人
                      </Text>
                    </View>
                  </View>
                )}

                {/* 备注信息 */}
                {activity.remark && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📝</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>备注</Text>
                      <Text 
                        style={styles.detailValue}
                        numberOfLines={3}
                      >
                        {activity.remark}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* 按钮区域 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPending]}
                  onPress={handlePendingSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.primary} size="small" />
                  ) : (
                    <Text style={styles.buttonTextSecondary}>进群咨询</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    ...theme.shadows.large,
  },
  dragIndicator: {
    height: 4,
    width: 40,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  activityTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  detailsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  detailIcon: {
    fontSize: 20,
    width: 24,
    height: 24,
    textAlignVertical: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPending: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonSignup: {
    backgroundColor: theme.colors.primary,
  },
  buttonTextPrimary: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.white,
  },
  buttonTextSecondary: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.primary,
  },
});
