import React, { useState } from 'react';
import { StyleSheet, View, Platform, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ImageUploadZoneProps {
  onImageDrop: (uri: string) => void;
  isUploading?: boolean;
}

export function ImageUploadZone({ onImageDrop, isUploading = false }: ImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const colorScheme = useColorScheme();

  // Web-specific drag and drop handlers
  const handleDragEnter = (e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              onImageDrop(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert('Please drop an image file');
        }
      }
    }
  };

  const webProps = Platform.OS === 'web' ? {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  } : {};

  return (
    <View
      {...webProps}
      style={[
        styles.container,
        isDragOver && styles.dragOver,
        isUploading && styles.uploading,
        {
          borderColor: isDragOver 
            ? Colors[colorScheme ?? 'light'].tint
            : Colors[colorScheme ?? 'light'].text + '30',
          backgroundColor: isDragOver
            ? Colors[colorScheme ?? 'light'].tint + '10'
            : 'transparent',
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint + '15' }
        ]}>
          <IconSymbol
            name={isUploading ? 'arrow.clockwise' : 'arrow.up.doc'}
            size={48}
            color={Colors[colorScheme ?? 'light'].tint}
          />
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {isUploading ? 'Uploading...' : isDragOver ? 'Drop your image here' : 'Drag & drop your image'}
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          {Platform.OS === 'web' 
            ? 'Supports: JPG, PNG, GIF (Max 10MB)'
            : 'Use the buttons below to upload'}
        </ThemedText>

        {Platform.OS === 'web' && !isUploading && (
          <View style={styles.formatsList}>
            <FormatBadge label="JPG" />
            <FormatBadge label="PNG" />
            <FormatBadge label="GIF" />
            <FormatBadge label="WEBP" />
          </View>
        )}
      </View>
    </View>
  );
}

function FormatBadge({ label }: { label: string }) {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[
      styles.formatBadge,
      { 
        backgroundColor: Colors[colorScheme ?? 'light'].text + '10',
        borderColor: Colors[colorScheme ?? 'light'].text + '20',
      }
    ]}>
      <ThemedText style={styles.formatText}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    transition: 'all 0.3s ease',
  },
  dragOver: {
    transform: [{ scale: 1.02 }],
  },
  uploading: {
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
  formatsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  formatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  formatText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
});