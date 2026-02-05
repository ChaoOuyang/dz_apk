import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { theme } from '../theme';

const GroupScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>群聊</Text>
      </View>
      <Text style={styles.text}>Group Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
  },
  header: {
    height: theme.spacing.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 0,
    elevation: 0,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  text: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
});

export default GroupScreen;
