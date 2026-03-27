import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { ClipArtStyle } from './ai.service';

export interface SavedImage {
  id: string;
  uri: string;
  style: ClipArtStyle;
  timestamp: number;
  thumbnail?: string;
}

const CLIPART_DIRECTORY = `${FileSystem.documentDirectory}clipart/`;

/**
 * Initialize clipart directory
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CLIPART_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CLIPART_DIRECTORY, { intermediates: true });
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

/**
 * Save generated clipart to device
 */
export const saveClipartToDevice = async (
  imageUri: string,
  style: ClipArtStyle
): Promise<SavedImage> => {
  try {
    const id = `clipart_${Date.now()}_${style}`;
    const filename = `${id}.png`;
    const filepath = `${CLIPART_DIRECTORY}${filename}`;

    // Save to local directory
    await FileSystem.copyAsync({
      from: imageUri,
      to: filepath,
    });

    return {
      id,
      uri: filepath,
      style,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error saving clipart:', error);
    throw new Error('Failed to save image');
  }
};

/**
 * Download image to device gallery
 */
export const downloadToGallery = async (imageUri: string): Promise<boolean> => {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission denied');
    }

    // Save to gallery
    const asset = await MediaLibrary.createAssetAsync(imageUri);
    await MediaLibrary.createAlbumAsync('AI Clipart', asset, false);

    return true;
  } catch (error) {
    console.error('Error downloading to gallery:', error);
    return false;
  }
};

/**
 * Get all saved cliparts
 */
export const getSavedCliparts = async (): Promise<SavedImage[]> => {
  try {
    await initializeStorage();
    
    const files = await FileSystem.readDirectoryAsync(CLIPART_DIRECTORY);
    const cliparts: SavedImage[] = [];

    for (const file of files) {
      if (file.endsWith('.png')) {
        const filepath = `${CLIPART_DIRECTORY}${file}`;
        const parts = file.replace('.png', '').split('_');
        const style = parts[parts.length - 1] as ClipArtStyle;
        const timestamp = parseInt(parts[1], 10);

        cliparts.push({
          id: file.replace('.png', ''),
          uri: filepath,
          style,
          timestamp,
        });
      }
    }

    // Sort by timestamp (newest first)
    return cliparts.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting saved cliparts:', error);
    return [];
  }
};

/**
 * Delete a saved clipart
 */
export const deleteClipart = async (id: string): Promise<boolean> => {
  try {
    const filepath = `${CLIPART_DIRECTORY}${id}.png`;
    await FileSystem.deleteAsync(filepath, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting clipart:', error);
    return false;
  }
};

/**
 * Get base64 from local URI
 */
export const getBase64FromUri = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw new Error('Failed to convert image');
  }
};

/**
 * Share image using native share
 */
export const shareImage = async (imageUri: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web sharing API
      const base64 = await getBase64FromUri(imageUri);
      const blob = await fetch(base64).then(r => r.blob());
      const file = new File([blob], 'clipart.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'AI Clipart',
          text: 'Check out this AI-generated clipart!',
        });
        return true;
      }
    }
    
    // For mobile, we'll use expo-sharing in the component
    return false;
  } catch (error) {
    console.error('Error sharing image:', error);
    return false;
  }
};