import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  variant?: 'card' | 'grid' | 'list';
  count?: number;
}

export function SkeletonLoader({ variant = 'grid', count = 6 }: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const backgroundColor = Colors[colorScheme ?? 'light'].text + '15';

  if (variant === 'card') {
    return (
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.skeletonCard,
            { backgroundColor, opacity },
          ]}
        />
      </View>
    );
  }

  if (variant === 'grid') {
    return (
      <View style={styles.gridContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.skeletonGridItem,
              { backgroundColor, opacity },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeletonListItem,
            { backgroundColor, opacity },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
  },
  skeletonCard: {
    width: '100%',
    height: 400,
    borderRadius: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  skeletonGridItem: {
    width: (SCREEN_WIDTH - 44) / 2,
    height: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 16,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  skeletonListItem: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
});