import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';

interface LoadingIndicatorProps {
  size?: number;
  color?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 24,
  color = '#E65100',
}) => {
  const dots = [useRef(new Animated.Value(0)), useRef(new Animated.Value(0)), useRef(new Animated.Value(0))];

  useEffect(() => {
    dots.forEach((dot, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.sequence([
            Animated.timing(dot.current, {
              toValue: 1,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(dot.current, {
              toValue: 0,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size / 3,
              height: size / 3,
              borderRadius: size / 6,
              backgroundColor: color,
              opacity: dot.current,
              marginHorizontal: 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  dot: {
    opacity: 0.3,
  },
});
