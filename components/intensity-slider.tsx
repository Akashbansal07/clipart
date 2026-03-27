import React from 'react';
import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const colorScheme = useColorScheme();

  const getIntensityLabel = (value: number): string => {
    if (value < 30) return 'Subtle';
    if (value < 60) return 'Moderate';
    return 'Strong';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            Style Intensity
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {getIntensityLabel(value)}
          </ThemedText>
        </View>
        <View style={[
          styles.valueBadge,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]}>
          <ThemedText style={styles.valueText}>{value}%</ThemedText>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={5}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={Colors[colorScheme ?? 'light'].tint}
          maximumTrackTintColor={Colors[colorScheme ?? 'light'].text + '30'}
          thumbTintColor={Colors[colorScheme ?? 'light'].tint}
        />
      </View>

      <View style={styles.labels}>
        <ThemedText style={styles.label}>Subtle</ThemedText>
        <ThemedText style={styles.label}>Strong</ThemedText>
      </View>

      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  valueBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  valueText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: -8,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
});