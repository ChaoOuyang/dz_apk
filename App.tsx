import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import GroupScreen from './src/screens/GroupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TabIcon from './src/components/TabIcon';
import { theme } from './src/theme';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'profile'>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'group':
        return <GroupScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Main Content Area */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'home', label: '大志' },
          { key: 'group', label: '群聊' },
          { key: 'profile', label: '我的' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <TabIcon
              type={tab.key as 'home' | 'group' | 'profile'}
              isActive={activeTab === tab.key}
              size={24}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: theme.spacing.tabBarHeight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.tabBarBorder,
    backgroundColor: theme.colors.tabBarBackground,
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    ...theme.typography.labelSmall,
    color: theme.colors.tabBarIconInactive,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
});

export default App;
