import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ImagePreviewProps {
  uri: string;
  onRemove: () => void;
  onProcess?: () => void;
  showActions?: boolean;
}

export function ImagePreview({
  uri,
  onRemove,
  onProcess,
  showActions = true,
}: ImagePreviewProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Your Image
        </ThemedText>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
          <ThemedText style={[styles.statusText, { color: '#10b981' }]}>
            Ready
          </ThemedText>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
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
  title: {
    fontSize: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  infoBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3b82f6',
    textAlign: 'center',
  },
});