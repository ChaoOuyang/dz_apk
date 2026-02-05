import { Platform } from 'react-native';

// WeChat Official Font Family (微信官方字体)
const FONT_FAMILY = Platform.select({
  ios: 'SF Pro Display', // Apple's San Francisco Pro Display (Used by WeChat on iOS)
  android: 'Roboto', // Google's Roboto (Used by WeChat on Android)
  default: 'System',
});

export const typography = {
  // Font Family
  fontFamily: FONT_FAMILY,
  
  // 标题样式
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    fontFamily: FONT_FAMILY,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    fontFamily: FONT_FAMILY,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    fontFamily: FONT_FAMILY,
  },
  
  // 标题标签
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
  },
  
  // 正文
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: FONT_FAMILY,
  },
  bodySemiBold: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
  },
  bodySmallSemiBold: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    fontFamily: FONT_FAMILY,
  },
  
  // 标签/小文本
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    fontFamily: FONT_FAMILY,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    fontFamily: FONT_FAMILY,
  },
  
  // 辅助文本
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: FONT_FAMILY,
  },
  captionSmall: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
    fontFamily: FONT_FAMILY,
  },
};

export default typography;
