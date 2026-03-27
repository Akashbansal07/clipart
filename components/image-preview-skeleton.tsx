import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './skeleton';

export function ImagePreviewSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </View>

      <Skeleton width="100%" height={300} borderRadius={16} style={styles.image} />

      <View style={styles.infoBox}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="60%" height={16} style={styles.infoLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    marginBottom: 12,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  infoLine: {
    marginTop: 8,
  },
});