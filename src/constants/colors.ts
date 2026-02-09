/**
 * 颜色常量
 * 定义应用中使用的所有颜色值
 */

export const COLORS = {
  // Primary Brand Colors
  primary: '#E65100', // Main orange color
  primaryLight: '#FF7D4A',
  primaryDark: '#D14A00',
  
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EFEFEF',
  
  // Border Colors
  border: '#EEEEEE',
  borderLight: '#F0F0F0',
  borderDark: '#DDDDDD',
  
  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  
  // Message Bubble Colors
  messageBubbleUser: '#E65100',
  messageBubbleBot: '#F5F5F5',
  messageBubbleUserText: '#FFFFFF',
  messageBubbleBotText: '#333333',
  
  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#EEEEEE',
  tabBarIconInactive: '#999999',
  tabBarIconActive: '#E65100',
  
  // Input Colors
  inputBorder: '#DDDDDD',
  inputBackground: '#FFFFFF',
  inputText: '#000000',
  inputPlaceholder: '#999999',
} as const;

export default COLORS;
