import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GroupScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>群聊</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});

export default GroupScreen;
