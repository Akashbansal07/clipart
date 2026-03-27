import React from 'react';
import { StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface UploadButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function UploadButton({
  icon,
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
}: UploadButtonProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'primary' && {
          backgroundColor: disabled ? '#e5e7eb' : isLoading ? '#f3f4f6' : tintColor,
        },
        variant === 'secondary' && {
          backgroundColor: disabled ? '#f9fafb' : '#ffffff',
          borderWidth: 2.5,
          borderColor: disabled ? '#e5e7eb' : tintColor,
        },
        pressed && !disabled && !isLoading && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {isLoading && (
          <ActivityIndicator
            color="#000000"
            size="small"
            style={styles.spinner}
          />
        )}
        
        <View
          style={[
            styles.iconContainer,
            variant === 'primary' && !isLoading && {
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
            },
            variant === 'primary' && isLoading && {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            },
            variant === 'secondary' && {
              backgroundColor: `${tintColor}15`,
            },
          ]}
        >
          <ThemedText style={styles.icon}>{icon}</ThemedText>
        </View>
        
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.label,
            variant === 'primary' && !isLoading && { color: '#ffffff' },
            variant === 'primary' && isLoading && { color: '#000000' },
            variant === 'secondary' && {
              color: disabled ? '#9ca3af' : tintColor,
            },
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 16,
    minHeight: 58,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fullWidth: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  spinner: {
    marginRight: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
});