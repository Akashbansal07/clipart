import React from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClipArtStyle } from '@/services/ai.service';

interface StyleSelectorProps {
  selectedStyles: ClipArtStyle[];
  onStyleToggle: (style: ClipArtStyle) => void;
  multiSelect?: boolean;
}

const STYLE_OPTIONS: Array<{
  style: ClipArtStyle;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    style: 'cartoon',
    label: 'Cartoon',
    icon: '🎨',
    description: 'Animated, colorful style',
  },
  {
    style: 'flat',
    label: 'Flat',
    icon: '📐',
    description: 'Minimalist vector art',
  },
  {
    style: 'anime',
    label: 'Anime',
    icon: '⭐',
    description: 'Japanese animation style',
  },
  {
    style: 'pixel',
    label: 'Pixel Art',
    icon: '🎮',
    description: 'Retro 8-bit gaming',
  },
  {
    style: 'sketch',
    label: 'Sketch',
    icon: '✏️',
    description: 'Hand-drawn outline',
  },
  
];

export function StyleSelector({
  selectedStyles,
  onStyleToggle,
  multiSelect = true,
}: StyleSelectorProps) {
  const colorScheme = useColorScheme();

  const isSelected = (style: ClipArtStyle) => selectedStyles.includes(style);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Choose Style{multiSelect ? 's' : ''}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {multiSelect
            ? `${selectedStyles.length} selected • Generate all at once`
            : 'Select one style to generate'}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STYLE_OPTIONS.map((option) => {
          const selected = isSelected(option.style);

          return (
            <Pressable
              key={option.style}
              onPress={() => onStyleToggle(option.style)}
              style={({ pressed }) => [
                styles.styleCard,
                selected && {
                  backgroundColor: Colors[colorScheme ?? 'light'].tint + '20',
                  borderColor: Colors[colorScheme ?? 'light'].tint,
                },
                !selected && {
                  backgroundColor: Colors[colorScheme ?? 'light'].text + '05',
                  borderColor: Colors[colorScheme ?? 'light'].text + '20',
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    selected && {
                      backgroundColor: Colors[colorScheme ?? 'light'].tint + '30',
                    },
                  ]}
                >
                  <ThemedText style={styles.icon}>{option.icon}</ThemedText>
                </View>

                {/* Label */}
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.label,
                    selected && { color: Colors[colorScheme ?? 'light'].tint },
                  ]}
                >
                  {option.label}
                </ThemedText>

                {/* Description */}
                <ThemedText style={styles.description}>
                  {option.description}
                </ThemedText>

                {/* Checkmark */}
                {selected && (
                  <View style={styles.checkmark}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color={Colors[colorScheme ?? 'light'].tint}
                    />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  styleCard: {
    width: 140,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});