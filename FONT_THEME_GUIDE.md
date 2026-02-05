# 微信官方字体与主题系统指南

## 概述

本项目已成功集成微信官方字体和完整的主题系统。现在应用使用与微信相同的官方字体，提供一致的视觉体验。

## 字体配置

### 官方字体选择

本项目采用与微信相同的字体策略：

#### iOS 平台
- **字体**: SF Pro Display
- **说明**: Apple 官方设计的 San Francisco Pro Display 字体，是 iOS 系统的标准字体
- **特性**: 现代、清晰、高效的字体设计

#### Android 平台
- **字体**: Roboto
- **说明**: Google 的官方设计字体，是 Android 系统的标准字体
- **特性**: 几何设计、易读性强、适配多种尺寸

### 字体应用

字体已全局应用到整个应用程序。可以通过主题系统随时调用：

```typescript
import { theme } from './src/theme';

// 获取当前平台的字体名称
const fontFamily = theme.typography.fontFamily;
```

## 主题系统架构

### 目录结构

```
src/theme/
├── index.ts          # 主题入口文件
├── typography.ts     # 字体、文字样式定义
├── colors.ts         # 颜色定义
├── spacing.ts        # 间距定义
├── radius.ts         # 圆角定义
└── shadows.ts        # 阴影定义
```

### 核心模块说明

#### 1. Typography (字体)

```typescript
import { typography } from './src/theme';

// 可用的文字样式
typography.h1          // 32px, 粗体 - 大标题
typography.h2          // 28px, 600字重 - 中标题
typography.h3          // 24px, 600字重 - 小标题
typography.title       // 18px, 粗体 - 页面标题
typography.titleSmall  // 16px, 600字重 - 小标题

typography.body        // 16px, 400字重 - 正文
typography.bodySmall   // 14px, 400字重 - 小正文
typography.bodySemiBold       // 16px, 500字重
typography.bodySmallSemiBold  // 14px, 500字重

typography.label       // 12px, 500字重 - 标签
typography.labelSmall  // 10px, 500字重 - 小标签

typography.caption     // 12px, 400字重 - 辅助文本
typography.captionSmall // 10px, 400字重 - 小辅助文本
```

#### 2. Colors (颜色)

```typescript
import { colors } from './src/theme';

colors.primary              // #E65100 - 主色（橙色）
colors.primaryLight         // #FF7D4A - 浅主色
colors.primaryDark          // #D14A00 - 深主色

colors.background           // #FFFFFF - 背景色
colors.backgroundSecondary  // #F5F5F5 - 次级背景色
colors.backgroundTertiary   // #EFEFEF - 三级背景色

colors.text.primary         // #000000 - 主文本色
colors.text.secondary       // #666666 - 次级文本色
colors.text.tertiary        // #999999 - 三级文本色
colors.text.disabled        // #CCCCCC - 禁用文本色

colors.messageBubbleUser    // #E65100 - 用户消息气泡
colors.messageBubbleBot     // #F5F5F5 - 机器人消息气泡
```

#### 3. Spacing (间距)

```typescript
import { spacing } from './src/theme';

spacing.xs    // 4px  - 极小
spacing.sm    // 8px  - 小
spacing.md    // 12px - 中
spacing.lg    // 16px - 大 (推荐 padding/margin)
spacing.xl    // 20px - 特大
spacing.xxl   // 24px - 极大

// 组件特定尺寸
spacing.inputHeight   // 48px
spacing.buttonHeight  // 48px
spacing.tabBarHeight  // 60px
spacing.headerHeight  // 50px
```

#### 4. Radius (圆角)

```typescript
import { radius } from './src/theme';

radius.none    // 0
radius.sm      // 4px - 按钮、输入框
radius.md      // 8px
radius.lg      // 12px - 卡片、建议按钮
radius.xl      // 16px - 消息气泡
radius.xxl     // 20px
radius.full    // 9999 - 完全圆形
```

#### 5. Shadows (阴影)

```typescript
import { shadows } from './src/theme';

shadows.light    // 轻微阴影 - elevation: 1
shadows.medium   // 中等阴影 - elevation: 5
shadows.heavy    // 深色阴影 - elevation: 10
shadows.card     // 卡片阴影
shadows.button   // 按钮阴影
```

## 使用示例

### 在组件中使用主题

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
});

export default MyComponent;
```

### 常见模式

#### 组合文字样式和颜色

```typescript
const styles = StyleSheet.create({
  heading: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  button: {
    ...theme.typography.bodySmallSemiBold,
    color: theme.colors.primary,
  },
});
```

#### 使用间距和圆角

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
});
```

#### 使用阴影

```typescript
const styles = StyleSheet.create({
  card: {
    ...theme.shadows.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  button: {
    ...theme.shadows.button,
    borderRadius: theme.radius.md,
  },
});
```

## 字体的自动应用

字体已通过以下方式自动应用于整个应用程序：

1. **全局容器**: App.tsx 的 `container` 样式中设置了 `fontFamily`
2. **所有屏幕**: 每个屏幕的容器都使用 `theme.colors.background` 和 `fontFamily`
3. **文本样式**: 所有文本样式都包含了 `fontFamily` 属性

无需为每个 Text 组件单独设置字体，样式继承会自动处理。

## 在新增组件中使用主题

当添加新组件时，请按照以下步骤：

1. **导入主题**
```typescript
import { theme } from '../theme';
```

2. **在 StyleSheet 中使用主题**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
});
```

3. **使用组件时应用样式**
```typescript
<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>
```

## 主题定制

### 修改颜色

编辑 `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#新颜色代码',
  // ... 其他颜色
};
```

### 修改字体大小

编辑 `src/theme/typography.ts`:

```typescript
export const typography = {
  body: {
    fontSize: 新字号,
    fontWeight: '400' as const,
    lineHeight: 新行高,
    fontFamily: FONT_FAMILY,
  },
  // ... 其他样式
};
```

### 修改间距

编辑 `src/theme/spacing.ts`:

```typescript
export const spacing = {
  lg: 新的间距值,
  // ... 其他间距
};
```

## 浏览器兼容性

- **iOS**: SF Pro Display 在所有 iOS 版本上都可用
- **Android**: Roboto 在所有 Android 版本上都可用
- **Fallback**: 如果指定字体不可用，将使用系统默认字体

## 性能考虑

- 由于使用系统字体（SF Pro Display 和 Roboto），无需加载自定义字体文件
- 性能开销极小
- 字体渲染由系统优化，显示效果最佳

## 常见问题

### Q: 字体没有改变？
A: 确保已重新启动应用程序，字体更改需要应用重新编译才能生效。

### Q: 如何在特定平台使用不同的字体？
A: 字体已通过 `Platform.select()` 自动处理平台差异。如需自定义，编辑 `src/theme/typography.ts` 中的 `FONT_FAMILY` 定义。

### Q: 如何添加新的文字样式？
A: 在 `src/theme/typography.ts` 中添加新样式，例如：
```typescript
export const typography = {
  // ... 现有样式
  customStyle: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
  },
};
```

### Q: 我需要覆盖特定组件的字体吗？
A: 不需要。全局字体配置会自动应用。只有在需要不同的大小/粗细时才需要覆盖。

## 总结

通过这个主题系统，整个应用程序现在：

✅ 使用微信官方字体（iOS: SF Pro Display, Android: Roboto）
✅ 保持视觉一致性
✅ 易于维护和扩展
✅ 无性能开销
✅ 遵循最佳实践

所有组件都通过导入 `theme` 对象来使用统一的设计系统。
