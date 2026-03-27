import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GenerationResult } from '@/services/ai.service';
import { downloadToGallery } from '@/services/storage.service';
import { SkeletonLoader } from './skeleton-loader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 20;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

interface ClipartGridProps {
  results: GenerationResult[];
  loading?: boolean;
  onImagePress?: (result: GenerationResult) => void;
}

export function ClipartGrid({ results, loading, onImagePress }: ClipartGridProps) {
  const colorScheme = useColorScheme();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleDownload = async (result: GenerationResult) => {
    if (!result.imageUri) return;

    const id = `${result.style}_${Date.now()}`;
    setDownloadingIds((prev) => new Set(prev).add(id));

    try {
      const success = await downloadToGallery(result.imageUri);
      if (success) {
        Alert.alert('Success', 'Image saved to gallery!');
      } else {
        Alert.alert('Error', 'Failed to save image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download image');
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleShare = async (result: GenerationResult) => {
    if (!result.imageUri) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(result.imageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your AI Clipart',
        });
      } else {
        Alert.alert('Info', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share image');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Generating Clipart...
        </ThemedText>
        <SkeletonLoader variant="grid" count={6} />
      </View>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const successResults = results.filter((r) => r.success && r.imageUri);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Your Clipart ({successResults.length})
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap to view • Long press for options
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {results.map((result, index) => (
          <ClipartGridItem
            key={`${result.style}_${index}`}
            result={result}
            onPress={() => onImagePress?.(result)}
            onDownload={() => handleDownload(result)}
            onShare={() => handleShare(result)}
            downloading={downloadingIds.has(`${result.style}_${Date.now()}`)}
          />
        ))}
      </View>
    </View>
  );
}

interface ClipartGridItemProps {
  result: GenerationResult;
  onPress: () => void;
  onDownload: () => void;
  onShare: () => void;
  downloading: boolean;
}

function ClipartGridItem({
  result,
  onPress,
  onDownload,
  onShare,
  downloading,
}: ClipartGridItemProps) {
  const colorScheme = useColorScheme();
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    setShowActions(true);
  };

  if (!result.success || !result.imageUri) {
    return (
      <View style={[styles.gridItem, styles.errorItem]}>
        <IconSymbol name="exclamationmark.triangle" size={32} color="#ef4444" />
        <ThemedText style={styles.errorText}>
          {result.style}
        </ThemedText>
        <ThemedText style={styles.errorSubtext}>
          Failed
        </ThemedText>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.gridItem,
        pressed && styles.pressed,
      ]}
    >
      {/* Image */}
      <Image
        source={{ uri: result.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      {/* Style Badge */}
      <View style={[
        styles.badge,
        { backgroundColor: Colors[colorScheme ?? 'light'].tint }
      ]}>
        <ThemedText style={styles.badgeText}>
          {result.style}
        </ThemedText>
      </View>

      {/* Actions Overlay */}
      {showActions && (
        <View style={styles.actionsOverlay}>
          <Pressable
            onPress={() => {
              setShowActions(false);
              onDownload();
            }}
            style={styles.actionButton}
          >
            {downloading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <IconSymbol name="arrow.down.circle.fill" size={32} color="#ffffff" />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setShowActions(false);
              onShare();
            }}
            style={styles.actionButton}
          >
            <IconSymbol name="square.and.arrow.up" size={32} color="#ffffff" />
          </Pressable>

          <Pressable
            onPress={() => setShowActions(false)}
            style={styles.actionButton}
          >
            <IconSymbol name="xmark.circle.fill" size={32} color="#ffffff" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  errorItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  errorSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});