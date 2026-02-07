import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';

export interface ActivityInfo {
  activityId: number;
  activityName?: string;
  startTime?: string;
  location?: string;
  signupNum?: number;
  limitNum?: number;
  remark?: string;
  [key: string]: any;
}

interface ActivityCardProps {
  activity: ActivityInfo;
  onSignup?: (activityId: number, activityInfo: ActivityInfo) => void;
  isLoading?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onSignup,
  isLoading = false,
}) => {
  const handleSignup = () => {
    if (onSignup && !isLoading) {
      onSignup(activity.activityId, activity);
    }
  };

  // 构造报名信息文字
  const signupInfo = activity.signupNum !== undefined && activity.limitNum !== undefined
    ? `${activity.signupNum}/${activity.limitNum}`
    : undefined;

  return (
    <View style={styles.card}>
      {/* Activity Info */}
      <View style={styles.content}>
        {/* Activity Name */}
        {activity.activityName && (
          <Text style={styles.activityName} numberOfLines={2}>
            {activity.activityName}
          </Text>
        )}

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          {/* Time */}
          {activity.startTime && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>🕐</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {activity.startTime}
              </Text>
            </View>
          )}

          {/* Location */}
          {activity.location && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>📍</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {activity.location}
              </Text>
            </View>
          )}

          {/* Signup Count */}
          {signupInfo && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>👥</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {signupInfo}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Signup Button */}
      <TouchableOpacity
        style={[
          styles.signupButton,
          isLoading && styles.signupButtonLoading,
        ]}
        onPress={handleSignup}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.signupButtonText}>报名</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.light,
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  activityName: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  metaContainer: {
    gap: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaLabel: {
    fontSize: 14,
    width: 16,
  },
  metaValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  signupButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
  },
  signupButtonLoading: {
    opacity: 0.7,
  },
  signupButtonText: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.white,
  },
});
