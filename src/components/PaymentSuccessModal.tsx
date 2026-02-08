/**
 * 支付成功弹窗组件
 * 
 * 显示支付成功提示和报名成功信息
 * 提醒用户可在对应的活动群里咨询有问题
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';

interface PaymentSuccessModalProps {
  visible: boolean;
  activityName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * 支付成功弹窗
 * 
 * 功能：
 * 1. 显示支付和报名成功信息
 * 2. 提示用户可在活动群里咨询
 * 3. 点击确定按钮后，自动拉用户进群并切换到群聊tab
 */
export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  activityName = '活动',
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      {/* 背景遮罩 */}
      <View style={styles.backdrop} />

      {/* 弹窗内容 */}
      <View style={styles.container}>
        <View style={styles.modalContent}>
          {/* 成功图标 */}
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>

          {/* 报名成功标题 - 重点突出 */}
          <Text style={styles.title}>报名成功！</Text>

          {/* 成功描述 */}
          <Text style={styles.description}>
            您已成功报名{activityName}
          </Text>

          {/* 活动群提示 - 重点突出群信息 */}
          <View style={styles.groupNotificationContainer}>
            <View style={styles.groupIconWrapper}>
              <Text style={styles.groupIcon}>👥</Text>
            </View>
            <View style={styles.groupInfoContent}>
              <Text style={styles.groupTitle}>已拉您进入活动通知群</Text>
              <Text style={styles.groupDescription}>
                在群里可直接咨询活动相关问题，我们会尽快为您解答
              </Text>
            </View>
          </View>

          {/* 确定按钮 */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <View style={styles.confirmButtonContent}>
                <Text style={styles.confirmButtonText}>前去群聊</Text>
                <Text style={styles.confirmButtonArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 340,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  successIconText: {
    fontSize: 36,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  groupNotificationContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  groupIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  groupIcon: {
    fontSize: 20,
  },
  groupInfoContent: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  groupDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  confirmButton: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
  confirmButtonArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
