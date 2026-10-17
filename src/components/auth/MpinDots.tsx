import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface MpinDotsProps {
  length: number; // 0 to 4
  isError?: boolean;
}

export function MpinDots({ length, isError }: MpinDotsProps) {
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (isError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [isError, shakeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {[0, 1, 2, 3].map((index) => {
        const isFilled = index < length;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isFilled ? styles.dotFilled : styles.dotEmpty,
              isError && styles.dotError,
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 10,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 8,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  dotFilled: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    transform: [{ scale: 1.1 }],
  },
  dotError: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
});
