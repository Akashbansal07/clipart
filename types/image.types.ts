export interface ImageAsset {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }
  
  export interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
  }
  
  export interface ClipArtResult {
    id: string;
    originalUri: string;
    processedUri: string;
    createdAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }
  
  export type UploadSource = 'camera' | 'gallery' | 'dragdrop';
  
  export interface ImageUploadConfig {
    maxFileSize: number; // in bytes
    allowedFormats: string[];
    quality: number; // 0-1
    aspectRatio?: [number, number];
  }