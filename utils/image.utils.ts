import { ImageUploadConfig } from '@/types/image.types';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Default configuration for image uploads
 */
export const DEFAULT_IMAGE_CONFIG: ImageUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  quality: 0.8,
  aspectRatio: [4, 3],
};

// Maximum dimensions for compressed images
const MAX_IMAGE_WIDTH = 2048;
const MAX_IMAGE_HEIGHT = 2048;

/**
 * Validate image file size
 */
export const validateFileSize = (fileSize: number, maxSize: number = DEFAULT_IMAGE_CONFIG.maxFileSize): boolean => {
  return fileSize <= maxSize;
};

/**
 * Validate image format
 */
export const validateImageFormat = (mimeType: string): boolean => {
  return DEFAULT_IMAGE_CONFIG.allowedFormats.includes(mimeType.toLowerCase());
};

/**
 * Format file size to human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file size from URI
 */
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

/**
 * Get image dimensions from URI using ImageManipulator
 */
export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    // Use a no-op manipulation just to get the image info
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return { width: result.width, height: result.height };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
};

/**
 * Calculate resize dimensions to fit within max dimensions while maintaining aspect ratio
 */
const calculateResizeDimensions = (
  width: number,
  height: number,
  maxWidth: number = MAX_IMAGE_WIDTH,
  maxHeight: number = MAX_IMAGE_HEIGHT
): { width: number; height: number } | null => {
  if (width <= maxWidth && height <= maxHeight) {
    return null; // No resize needed
  }

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.floor(width * ratio),
    height: Math.floor(height * ratio),
  };
};

/**
 * Compress and resize image if needed
 */
export const compressImage = async (
  uri: string,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<{ uri: string; width: number; height: number; size: number }> => {
  try {
    const {
      quality = 0.8,
      maxWidth = MAX_IMAGE_WIDTH,
      maxHeight = MAX_IMAGE_HEIGHT,
    } = options;

    // Get original dimensions
    const dimensions = await getImageDimensions(uri);
    
    // Calculate new dimensions if resize is needed
    const newDimensions = calculateResizeDimensions(
      dimensions.width,
      dimensions.height,
      maxWidth,
      maxHeight
    );

    const actions: ImageManipulator.Action[] = [];

    // Add resize action if needed
    if (newDimensions) {
      actions.push({
        resize: newDimensions,
      });
    }

    // Manipulate image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get compressed file size
    const fileSize = await getFileSize(result.uri);

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: fileSize,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Generate unique ID for uploaded images
 */
export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract filename from URI
 */
export const extractFilename = (uri: string): string => {
  return uri.split('/').pop() || 'unknown';
};

/**
 * Check if URI is a valid image
 */
export const isValidImageUri = (uri: string): boolean => {
  if (!uri) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerUri = uri.toLowerCase();
  
  return imageExtensions.some(ext => lowerUri.includes(ext)) || 
         lowerUri.startsWith('data:image/') ||
         lowerUri.startsWith('file://') ||
         lowerUri.startsWith('content://');
};

/**
 * Validate image format from URI
 */
export const getImageFormatFromUri = (uri: string): string | null => {
  const lowerUri = uri.toLowerCase();
  
  if (lowerUri.includes('.jpg') || lowerUri.includes('.jpeg')) return 'image/jpeg';
  if (lowerUri.includes('.png')) return 'image/png';
  if (lowerUri.includes('.gif')) return 'image/gif';
  if (lowerUri.includes('.webp')) return 'image/webp';
  
  return null;
};

/**
 * Validate image before upload
 */
export const validateImage = async (
  uri: string,
  fileSize?: number,
  mimeType?: string
): Promise<{ valid: boolean; error?: string }> => {
  // Check if URI is valid
  if (!isValidImageUri(uri)) {
    return { valid: false, error: 'Invalid image format. Please select a valid image file.' };
  }

  // Get file size if not provided
  if (fileSize === undefined) {
    fileSize = await getFileSize(uri);
  }

  // Check file size
  if (fileSize > 0 && !validateFileSize(fileSize)) {
    return {
      valid: false,
      error: `Image is too large (${formatFileSize(fileSize)}). Maximum size is ${formatFileSize(DEFAULT_IMAGE_CONFIG.maxFileSize)}.`,
    };
  }

  // Check format if not provided
  if (!mimeType) {
    mimeType = getImageFormatFromUri(uri) || '';
  }

  if (mimeType && !validateImageFormat(mimeType)) {
    return {
      valid: false,
      error: `Invalid image format. Supported formats: JPG, PNG, GIF, WEBP`,
    };
  }

  return { valid: true };
};

/**
 * Process image: validate, compress if needed
 */
export const processImage = async (
  uri: string
): Promise<{
  success: boolean;
  uri?: string;
  error?: string;
  compressed?: boolean;
  originalSize?: number;
  compressedSize?: number;
}> => {
  try {
    // Validate image
    const validation = await validateImage(uri);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Get original file size
    const originalSize = await getFileSize(uri);

    // Check if compression is needed (> 5MB)
    const needsCompression = originalSize > 5 * 1024 * 1024;

    if (needsCompression) {
      console.log(`Compressing image (${formatFileSize(originalSize)})...`);
      
      const compressed = await compressImage(uri, {
        quality: 0.8,
        maxWidth: MAX_IMAGE_WIDTH,
        maxHeight: MAX_IMAGE_HEIGHT,
      });

      console.log(`Compressed to ${formatFileSize(compressed.size)}`);

      return {
        success: true,
        uri: compressed.uri,
        compressed: true,
        originalSize,
        compressedSize: compressed.size,
      };
    }

    return {
      success: true,
      uri,
      compressed: false,
      originalSize,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      error: 'Failed to process image. Please try again.',
    };
  }
};