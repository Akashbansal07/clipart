import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Alert, 
  Image,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { ImagePreview } from '@/components/image-preview';
import { ImagePreviewSkeleton } from '@/components/image-preview-skeleton';
import { Skeleton } from '@/components/skeleton';
import { UploadButton } from '@/components/upload-button';
import { StyleSelector } from '@/components/style-selector';
import { IntensitySlider } from '@/components/intensity-slider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { processImage } from '@/utils/image.utils';
import { generateMultipleStyles, ClipArtStyle, GenerationResult } from '@/services/ai.service';
import { checkRateLimit, recordGeneration, getUsageStats } from '@/services/rate-limit.service';
import { initializeStorage } from '@/services/storage.service';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const cardWidth = isTablet ? (width - 60) / 3 : (width - 52) / 2;

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<ClipArtStyle[]>(['cartoon', 'anime']);
  const [intensity, setIntensity] = useState(50);
  const [generatedResults, setGeneratedResults] = useState<GenerationResult[]>([]);
  const [usageRemaining, setUsageRemaining] = useState(15);
  const colorScheme = useColorScheme();

  useEffect(() => {
    initializeStorage();
    updateUsageStats();
  }, []);

  const updateUsageStats = async () => {
    const stats = await getUsageStats();
    setUsageRemaining(stats.remaining);
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please grant camera permission');
          return;
        }
      }

      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const imageUri = result.assets[0].uri;
        setIsProcessing(true);
        const processed = await processImage(imageUri);
        setIsProcessing(false);

        if (!processed.success) {
          Alert.alert('Invalid Image', processed.error || 'Failed to process image');
          return;
        }

        setSelectedImage(processed.uri || imageUri);
        setGeneratedResults([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please grant gallery permission');
          return;
        }
      }

      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const imageUri = result.assets[0].uri;
        setIsProcessing(true);
        const processed = await processImage(imageUri);
        setIsProcessing(false);

        if (!processed.success) {
          Alert.alert('Invalid Image', processed.error || 'Failed to process image');
          return;
        }

        setSelectedImage(processed.uri || imageUri);
        setGeneratedResults([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load image');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleImageDrop = (uri: string) => {
    setSelectedImage(uri);
    setGeneratedResults([]);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setGeneratedResults([]);
  };

  const handleStyleToggle = (style: ClipArtStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    
    if (selectedStyles.length === 0) {
      Alert.alert('No Styles Selected', 'Please select at least one style');
      return;
    }

    const rateCheck = await checkRateLimit();
    if (!rateCheck.allowed) {
      Alert.alert('Rate Limit', rateCheck.reason || 'Please wait');
      return;
    }

    setIsGenerating(true);
    setGeneratedResults([]);

    try {
      const results = await generateMultipleStyles(
        selectedImage,
        selectedStyles,
        intensity,
        (style, result) => {
          setGeneratedResults((prev) => [...prev, result]);
        }
      );

      await recordGeneration();
      await updateUsageStats();

      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        Alert.alert(
          'Partial Success',
          `${results.length - failures.length} of ${results.length} styles generated`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate clipart');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUri: string, style: string) => {
    try {
      console.log('Downloading image:', imageUri.substring(0, 100));
  
      if (imageUri.startsWith('data:image')) {
        const filename = `clipart_${style}_${Date.now()}.png`;
        const fileUri = FileSystem.cacheDirectory + filename;
        const base64Data = imageUri.split(',')[1];
        
        const { writeAsStringAsync } = require('expo-file-system/legacy');
        await writeAsStringAsync(fileUri, base64Data, {
          encoding: 'base64',
        });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          Alert.alert(
            'Save Image',
            'Expo Go cannot save directly to gallery. Use Share to save to your device.',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Share & Save',
                onPress: async () => {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Save your clipart',
                  });
                }
              }
            ]
          );
          return;
        }
        
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant media library permission');
            return;
          }
          
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          Alert.alert('Success! 🎉', 'Image saved to your gallery');
          console.log('Saved asset:', asset);
        } catch (permError) {
          console.log('MediaLibrary failed, using share:', permError);
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: 'Save your clipart (Share then save)',
          });
        }
        
      } else {
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant media library permission');
            return;
          }
          
          const asset = await MediaLibrary.createAssetAsync(imageUri);
          Alert.alert('Success! 🎉', 'Image saved to your gallery');
        } catch (permError) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(imageUri, {
              mimeType: 'image/png',
              dialogTitle: 'Save your clipart',
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Save Failed', 'Could not save image. Try the Share button instead.');
    }
  };
  
  const handleShare = async (imageUri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available');
        return;
      }
  
      console.log('Sharing image:', imageUri.substring(0, 100));
  
      if (imageUri.startsWith('data:image')) {
        const filename = `clipart_share_${Date.now()}.png`;
        const fileUri = FileSystem.cacheDirectory + filename;
        const base64Data = imageUri.split(',')[1];
        
        const { writeAsStringAsync } = require('expo-file-system/legacy');
        await writeAsStringAsync(fileUri, base64Data, {
          encoding: 'base64',
        });
        
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your clipart',
        });
        
      } else {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your clipart',
        });
      }
      
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Could not share image.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
            <ThemedText style={styles.logoEmoji}>🎨</ThemedText>
          </View>
        </View>

        <ThemedText type="title" style={styles.title}>
          AI Clipart Generator
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Transform your images into stunning clipart with AI
        </ThemedText>

        <View style={[styles.usageBar, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
          <ThemedText style={styles.usageText}>
            {usageRemaining} generations remaining today
          </ThemedText>
        </View>
      </ThemedView>

      {/* Upload Section */}
      {!selectedImage && (
        <ThemedView style={styles.uploadSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Upload Your Image
          </ThemedText>

          <ImageUploadZone
            onImageDrop={handleImageDrop}
            isUploading={isUploading || isProcessing}
          />

          <View style={styles.uploadOptions}>
            <ThemedText style={styles.orText}>or choose from</ThemedText>
            
            <View style={styles.buttonContainer}>
              <UploadButton
                icon="📷"
                label="Camera"
                onPress={handleCameraCapture}
                disabled={isUploading || isProcessing}
                variant="primary"
              />
              
              <UploadButton
                icon="🖼️"
                label="Gallery"
                onPress={handleGalleryPick}
                disabled={isUploading || isProcessing}
                variant="secondary"
              />
            </View>
          </View>
        </ThemedView>
      )}

      {/* Generation Section */}
      {selectedImage && (
        <>
          <ThemedView style={styles.generationSection}>
            {isProcessing ? (
              <ImagePreviewSkeleton />
            ) : (
              <ImagePreview
                uri={selectedImage}
                onRemove={handleRemoveImage}
                onProcess={handleGenerate}
                showActions={false}
              />
            )}

            {/* Change Image Buttons */}
            <View style={styles.changeImageContainer}>
              <ThemedText style={styles.changeImageText}>
                Want to use a different image?
              </ThemedText>
              <View style={styles.buttonContainer}>
                <UploadButton
                  icon="📷"
                  label="Take New Photo"
                  onPress={handleCameraCapture}
                  disabled={isUploading || isProcessing || isGenerating}
                  variant="secondary"
                />
                
                <UploadButton
                  icon="🖼️"
                  label="Choose Another"
                  onPress={handleGalleryPick}
                  disabled={isUploading || isProcessing || isGenerating}
                  variant="secondary"
                />
              </View>
            </View>

            <StyleSelector
              selectedStyles={selectedStyles}
              onStyleToggle={handleStyleToggle}
              multiSelect={true}
            />

            <IntensitySlider value={intensity} onChange={setIntensity} />

            <UploadButton
  icon="✨"
  label={isGenerating ? 'Generating...' : 'Generate Clipart'}
  onPress={handleGenerate}
  disabled={isGenerating || selectedStyles.length === 0}
  variant="primary"
  fullWidth
  isLoading={isGenerating}  // Add this line
/>
          </ThemedView>

          {/* Results Grid */}
          {(isGenerating || generatedResults.length > 0) && (
            <ThemedView style={styles.resultsSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Generated Clipart
              </ThemedText>

              <View style={styles.resultsGrid}>
                {generatedResults.map((result, index) => (
                  <View key={index} style={[styles.resultCard, { width: cardWidth }]}>
                    {result.success && result.imageUri ? (
                      <>
                        <Image
                          source={{ uri: result.imageUri }}
                          style={styles.resultImage}
                          resizeMode="cover"
                        />
                        
                        <View style={styles.resultOverlay}>
                          <ThemedText style={styles.resultStyleName}>
                            {result.style.toUpperCase()}
                          </ThemedText>
                          
                          <View style={styles.resultActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDownload(result.imageUri!, result.style)}
                            >
                              <Ionicons name="download-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleShare(result.imageUri!)}
                            >
                              <Ionicons name="share-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    ) : (
                      <View style={styles.resultError}>
                        <Ionicons name="alert-circle-outline" size={32} color="#e74c3c" />
                        <ThemedText style={styles.resultErrorText}>
                          {result.error || 'Failed'}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                ))}

                {/* Loading Skeletons - IMPROVED */}
                {isGenerating && selectedStyles.filter(
                  s => !generatedResults.find(r => r.style === s)
                ).map((style, index) => (
                  <View key={`skeleton-${index}`} style={[styles.resultCard, { width: cardWidth }]}>
                    <Skeleton width="100%" height={cardWidth} borderRadius={0} />
                    <View style={styles.skeletonOverlay}>
                      <Skeleton width={80} height={16} />
                      <View style={styles.skeletonActions}>
                        <Skeleton width={36} height={36} borderRadius={18} />
                        <Skeleton width={36} height={36} borderRadius={18} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Change Image Buttons After Results */}
              {!isGenerating && generatedResults.length > 0 && (
                <View style={styles.changeImageAfterResults}>
                  <ThemedText style={styles.changeImageAfterResultsText}>
                    Try a different image?
                  </ThemedText>
                  <View style={styles.buttonContainer}>
                    <UploadButton
                      icon="📷"
                      label="Take Photo"
                      onPress={handleCameraCapture}
                      disabled={isUploading || isProcessing}
                      variant="primary"
                    />
                    
                    <UploadButton
                      icon="🖼️"
                      label="Pick from Gallery"
                      onPress={handleGalleryPick}
                      disabled={isUploading || isProcessing}
                      variant="primary"
                    />
                  </View>
                </View>
              )}
            </ThemedView>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  usageBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  usageText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  uploadOptions: {
    marginTop: 24,
    alignItems: 'center',
  },
  orText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  generationSection: {
    gap: 20,
    marginBottom: 30,
  },
  changeImageContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 16,
  },
  changeImageText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultImage: {
    width: '100%',
    height: cardWidth,
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultStyleName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultError: {
    width: '100%',
    height: cardWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d7da',
    padding: 12,
  },
  resultErrorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  skeletonOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: 8,
  },
  changeImageAfterResults: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  changeImageAfterResultsText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
});