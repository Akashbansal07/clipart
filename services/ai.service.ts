/**
 * AI Service - Backend API Integration
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface GenerationOptions {
  imageUri: string;
  style: ClipArtStyle;
  intensity: number;
}

export type ClipArtStyle = 'cartoon' | 'anime' | 'pixel' | 'flat' | 'sketch' | 'remove-bg';

export interface GenerationResult {
  success: boolean;
  imageUri?: string;
  style: ClipArtStyle;
  error?: string;
}

const STYLE_PROMPTS: Record<ClipArtStyle, string> = {
  cartoon: 'convert to cartoon style, animated, colorful, bold outlines, vibrant',
  flat: 'convert to flat illustration, minimalist design, vector art, simple shapes, clean',
  anime: 'convert to anime style, manga art, japanese animation, detailed',
  pixel: 'convert to pixel art, 8-bit style, retro gaming aesthetic, pixelated',
  sketch: 'convert to pencil sketch, hand-drawn, black and white outline, artistic',
};

const buildPrompt = (style: ClipArtStyle, intensity: number): string => {
  const basePrompt = STYLE_PROMPTS[style];
  const intensityText = intensity > 70 ? 'highly stylized' : intensity > 40 ? 'moderately stylized' : 'subtly stylized';
  return `${basePrompt}, ${intensityText}, high quality`;
};

const getBase64FromUri = async (uri: string): Promise<string> => {
  try {
    if (uri.startsWith('data:')) {
      return uri;
    }
    
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw error;
  }
};

export const generateClipart = async (
  options: GenerationOptions
): Promise<GenerationResult> => {
  try {
    const { imageUri, style, intensity } = options;

    console.log(`🎨 Generating ${style} clipart...`);
    console.log(`📡 Using API: ${API_URL}`);

    const prompt = buildPrompt(style, intensity);
    const imageBase64 = await getBase64FromUri(imageUri);

    console.log(`🚀 Calling backend API...`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        imageBase64,
        intensity,
      }),
    });

    console.log(`📥 Response status: ${response.status}`);

    const responseText = await response.text();
    console.log(`📝 Response: ${responseText.substring(0, 100)}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ JSON parse error');
      console.error('Response was:', responseText);
      throw new Error(`Backend returned invalid JSON: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error('❌ Backend error:', data.error);
      throw new Error(data.error || `Backend Error: ${response.status}`);
    }

    if (!data.success || !data.image) {
      throw new Error('No image in response');
    }

    console.log(`✅ ${style} generation successful`);

    return {
      success: true,
      imageUri: data.image,
      style,
    };

  } catch (error) {
    console.error(`❌ Error generating ${options.style}:`, error);
    return {
      success: false,
      style: options.style,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
};

export const generateMultipleStyles = async (
  imageUri: string,
  styles: ClipArtStyle[],
  intensity: number,
  onProgress?: (style: ClipArtStyle, result: GenerationResult) => void
): Promise<GenerationResult[]> => {
  const promises = styles.map(async (style) => {
    const result = await generateClipart({ imageUri, style, intensity });
    if (onProgress) {
      onProgress(style, result);
    }
    return result;
  });

  return Promise.all(promises);
};