import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface TabIconProps {
  type: 'home' | 'group' | 'profile';
  isActive: boolean;
  size?: number;
}

const THEME_COLOR = theme.colors.primary;
const INACTIVE_COLOR = theme.colors.tabBarIconInactive;

/**
 * 精细简约风格的Tab Icon组件
 * - home: 聊天气泡（带细节纹理）
 * - group: 三个人的群组（带头身分离）
 * - profile: 头像+肩膀（人物形象）
 * 选中时填充主题色
 * 
 * todo： 在拿实际的icon替换后，需要删除这块的代码
 */
const TabIcon: React.FC<TabIconProps> = ({ type, isActive, size = 24 }) => {
  const color = isActive ? THEME_COLOR : INACTIVE_COLOR;
  const strokeWidth = size > 20 ? 1.2 : 0.9;

  const Circle = ({ width, height, cx, cy }: { width: number; height: number; cx: number; cy: number }) => (
    <View
      style={{
        width: width * size,
        height: height * size,
        borderRadius: (width * size) / 2,
        borderColor: color,
        borderWidth: strokeWidth,
        backgroundColor: isActive ? color : 'transparent',
        position: 'absolute',
        left: cx * size,
        top: cy * size,
      }}
    />
  );

  const Rect = ({ width, height, cx, cy, radius = 0 }: { width: number; height: number; cx: number; cy: number; radius?: number }) => (
    <View
      style={{
        width: width * size,
        height: height * size,
        borderRadius: radius * size,
        borderColor: color,
        borderWidth: strokeWidth,
        backgroundColor: isActive ? color : 'transparent',
        position: 'absolute',
        left: cx * size,
        top: cy * size,
      }}
    />
  );

  const renderChatBubble = () => (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* 主气泡 - 圆角矩形 */}
      <Rect width={0.65} height={0.6} cx={0.175} cy={0.08} radius={0.12} />
      {/* 小尾巴 - 左下角 */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.15,
          top: size * 0.62,
          width: size * 0.12,
          height: size * 0.15,
          borderRadius: size * 0.08,
          borderColor: color,
          borderWidth: strokeWidth,
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          backgroundColor: isActive ? color : 'transparent',
        }}
      />
    </View>
  );

  const renderGroup = () => (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* 顶部人物 */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.3,
          top: size * 0.02,
          width: size * 0.4,
          height: size * 0.4,
        }}
      >
        {/* 头 */}
        <Circle width={0.3} height={0.3} cx={0.05} cy={0} />
        {/* 身体 */}
        <Rect width={0.32} height={0.18} cx={0.04} cy={0.32} radius={0.05} />
      </View>

      {/* 左下人物 */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.02,
          top: size * 0.45,
          width: size * 0.4,
          height: size * 0.4,
        }}
      >
        {/* 头 */}
        <Circle width={0.3} height={0.3} cx={0.05} cy={0} />
        {/* 身体 */}
        <Rect width={0.32} height={0.18} cx={0.04} cy={0.32} radius={0.05} />
      </View>

      {/* 右下人物 */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.02,
          top: size * 0.45,
          width: size * 0.4,
          height: size * 0.4,
        }}
      >
        {/* 头 */}
        <Circle width={0.3} height={0.3} cx={0.05} cy={0} />
        {/* 身体 */}
        <Rect width={0.32} height={0.18} cx={0.04} cy={0.32} radius={0.05} />
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* 头部圆形 */}
      <Circle width={0.4} height={0.4} cx={0.3} cy={0.05} />
      
      {/* 肩膀部分 - 圆弧顶部 */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.15,
          top: size * 0.4,
          width: size * 0.7,
          height: size * 0.45,
          borderTopLeftRadius: size * 0.3,
          borderTopRightRadius: size * 0.3,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.1,
          borderColor: color,
          borderWidth: strokeWidth,
          backgroundColor: isActive ? color : 'transparent',
        }}
      />
      
      {/* 左肩膀突出 */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.08,
          top: size * 0.5,
          width: size * 0.15,
          height: size * 0.3,
          borderRadius: size * 0.075,
          borderColor: color,
          borderWidth: strokeWidth,
          backgroundColor: isActive ? color : 'transparent',
        }}
      />
      
      {/* 右肩膀突出 */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.08,
          top: size * 0.5,
          width: size * 0.15,
          height: size * 0.3,
          borderRadius: size * 0.075,
          borderColor: color,
          borderWidth: strokeWidth,
          backgroundColor: isActive ? color : 'transparent',
        }}
      />
    </View>
  );

  const renderIcon = () => {
    switch (type) {
      case 'home':
        return renderChatBubble();
      case 'group':
        return renderGroup();
      case 'profile':
        return renderProfile();
      default:
        return null;
    }
  };

  return <View style={styles.iconContainer}>{renderIcon()}</View>;
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabIcon;
