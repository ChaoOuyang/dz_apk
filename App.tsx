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
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('home')}
        >
          <View style={styles.iconContainer}>
             <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTabText]}>💬</Text> 
          </View>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabText]}>大志</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('group')}
        >
          <Text style={[styles.tabIcon, activeTab === 'group' && styles.activeTabText]}>👥</Text>
          <Text style={[styles.tabLabel, activeTab === 'group' && styles.activeTabText]}>群聊</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabText]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabText]}>我的</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60, // Standard tab bar height
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 5, // Safe area padding adjustment if needed
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 2,
    // Add a specific style for the 'Da Zhi' icon if needed to match the square look
    // but the emoji is fine for now.
  },
  tabIcon: {
    fontSize: 24,
    color: '#999',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF5722', // Orange color matching the design
  },
});

export default App;
