# AI Clipart Generator - React Native App

Transform your photos into stunning clipart styles using AI-powered image generation.

## 🚀 Features

- **6 Artistic Styles**: Cartoon, Anime, Pixel Art, Flat Design, Sketch, and Remove Background
- **Adjustable Intensity**: Control the strength of style transformation (0-100%)
- **Multi-Style Generation**: Generate multiple styles simultaneously
- **Professional UI**: Modern design with skeleton loaders and smooth animations
- **Image Management**: Upload from camera or gallery, download and share results
- **Rate Limiting**: Built-in usage tracking (15 generations per day)
- **Responsive Design**: Works on phones and tablets with adaptive layouts

## 📱 Screenshots

[Add your app screenshots here]

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **UI Components**: Custom themed components with dark/light mode
- **State Management**: React Hooks
- **Storage**: Expo FileSystem & AsyncStorage
- **Image Processing**: Expo ImagePicker, MediaLibrary, ImageManipulator
- **Styling**: StyleSheet with dynamic theme system
- **Navigation**: Expo Router (file-based routing)

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI installed globally: `npm install -g expo-cli`
- For native builds: Android Studio or Xcode

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd clipart-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env` file in the root directory:

**For local development (Android Emulator):**
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/generate
```

**For local development (iOS Simulator):**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/generate
```

**For production:**
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.vercel.app/api/generate
```

4. **Start development server**
```bash
npx expo start
```

Or start with cache clear:
```bash
npx expo start -c
```

Press in terminal:
- `a` - Open on Android emulator
- `i` - Open on iOS simulator
- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle menu

## 🏗️ Project Structure

```
clipart-app/
├── app/                                # App screens (file-based routing)
│   └── (tabs)/
│       ├── index.tsx                  # Main home screen
│       ├── explore.tsx                # Explore screen
│       └── _layout.tsx                # Tab navigation layout
├── components/                         # Reusable UI components
│   ├── image-preview.tsx              # Image preview with actions
│   ├── image-preview-skeleton.tsx     # Loading skeleton for image
│   ├── image-upload-zone.tsx          # Drag & drop upload area
│   ├── intensity-slider.tsx           # Style intensity slider
│   ├── skeleton.tsx                   # Animated skeleton loader
│   ├── style-selector.tsx             # Style selection cards
│   ├── themed-text.tsx                # Themed text component
│   ├── themed-view.tsx                # Themed view component
│   └── upload-button.tsx              # Professional upload button
├── constants/                          # App-wide constants
│   └── theme.ts                       # Color themes (light/dark)
├── hooks/                              # Custom React hooks
│   └── use-color-scheme.ts            # Dark/light mode detection
├── services/                           # Business logic & API
│   ├── ai.service.ts                  # AI backend API integration
│   ├── rate-limit.service.ts          # Usage rate limiting
│   └── storage.service.ts             # AsyncStorage wrapper
├── utils/                              # Utility functions
│   └── image.utils.ts                 # Image validation & processing
├── assets/                             # Static assets
│   └── images/                        # App icons, splash screens
├── app.json                            # Expo & EAS configuration
├── package.json                        # Dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
└── .env                               # Environment variables (create this)
```

## 🎨 Available Styles

| Style | Icon | Description |
|-------|------|-------------|
| **Cartoon** | 🎨 | Bold outlines, vibrant colors, animated look |
| **Anime** | ⭐ | Japanese animation style, manga art, highly detailed |
| **Pixel Art** | 🎮 | Retro 8-bit gaming aesthetic, blocky pixels |
| **Flat Design** | 📐 | Minimalist vector art with solid colors |
| **Sketch** | ✏️ | Hand-drawn pencil outline, black and white |
| **Remove BG** | ✂️ | Transparent background, isolated subject |

## 🔧 Configuration

### Intensity Levels

The intensity slider controls style transformation strength:

- **0-30% (Subtle)**: Minimal changes, close to original
- **31-60% (Moderate)**: Balanced, noticeable transformation
- **61-100% (Strong)**: Fully transformed artistic look

### Rate Limiting

**Default**: 15 generations per day (resets at midnight)

To modify the limit, edit `services/rate-limit.service.ts`:
```typescript
const DAILY_LIMIT = 15; // Change this value
const RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

### Theme Customization

Edit `constants/theme.ts` to customize colors:
```typescript
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4', // Primary brand color
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};
```

## 📱 Building for Production

### Setup EAS (Expo Application Services)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure EAS**
```bash
eas build:configure
```

### Build Android APK

**Preview build (for testing):**
```bash
eas build --platform android --profile preview
```

**Production build:**
```bash
eas build --platform android --profile production
```

### Build iOS App

**Preview build:**
```bash
eas build --platform ios --profile preview
```

**Production build:**
```bash
eas build --platform ios --profile production
```

### EAS Configuration

Project is already configured in `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "428e2468-46ff-468d-913c-ecb6dcfe5eec"
  }
}
```

## 🌐 API Integration

The app communicates with a Node.js backend API (see `backend/README.md`).

### Endpoints

**1. Generate Styled Image**
```
POST /api/generate
```

Request:
```json
{
  "prompt": "convert to cartoon style, bold outlines...",
  "imageBase64": "data:image/png;base64,iVBORw0KG...",
  "intensity": 50
}
```

Response:
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KG..."
}
```

**2. Remove Background**
```
POST /api/remove-bg
```

Request:
```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KG..."
}
```

Response:
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KG..."
}
```

### API Service Usage

```typescript
import { generateClipart } from '@/services/ai.service';

const result = await generateClipart({
  imageUri: 'file://path/to/image.jpg',
  style: 'cartoon',
  intensity: 50,
});

if (result.success) {
  console.log('Generated image:', result.imageUri);
}
```

## 🐛 Known Issues & Limitations

### Expo Go Limitations

**1. Download Feature Restricted**
- **Issue**: Expo Go has limited media library access on Android
- **Impact**: Download button shows "Share & Save" dialog instead
- **Workaround**: Use Share button to save images
- **Solution**: Build production APK for full download functionality

**2. File System Access**
- **Issue**: Some file operations limited in Expo Go
- **Solution**: Build development or production build

### Background Removal Limitations

**Current Implementation:**
- Uses OpenAI GPT-Image-1 for background removal
- May alter subject appearance slightly due to image regeneration
- Not true pixel-perfect background removal

**For True Background Removal:**
- Consider integrating Remove.bg API (requires separate API key)
- Or use specialized background removal services

### Platform-Specific Issues

**Android:**
- Requires media library permissions for download
- API level 33+ requires granular permissions

**iOS:**
- Requires photo library usage descriptions in app.json
- Simulator doesn't support camera (use image picker)

## 🔐 Permissions Required

### Android
```xml
android.permission.CAMERA
android.permission.READ_EXTERNAL_STORAGE
android.permission.WRITE_EXTERNAL_STORAGE
android.permission.READ_MEDIA_IMAGES
```

### iOS
```
NSPhotoLibraryUsageDescription
NSCameraUsageDescription
NSPhotoLibraryAddUsageDescription
```

These are configured in `app.json`.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Upload image from gallery
- [ ] Capture image from camera
- [ ] Select single style and generate
- [ ] Select multiple styles and generate
- [ ] Adjust intensity slider
- [ ] Download generated image
- [ ] Share generated image
- [ ] Test on Android device/emulator
- [ ] Test on iOS device/simulator
- [ ] Test dark mode
- [ ] Test rate limiting (exceed 15 generations)
- [ ] Test error handling (network offline)

### Performance Testing

- Monitor memory usage during image generation
- Check app responsiveness during concurrent generations
- Verify skeleton loaders appear correctly
- Test with various image sizes (small to large)

## 📊 Performance Optimization

### Image Processing
- Images are validated and resized before upload
- Max dimension: 2048px (configurable in `image.utils.ts`)
- JPEG quality: 0.8 for optimal balance

### API Calls
- Backend supports up to 5 concurrent requests
- Frontend generates styles in parallel for speed
- Progressive result display (show as they complete)

### Loading States
- Skeleton loaders for better perceived performance
- Smooth animations (no jarring transitions)
- Clear feedback during all operations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Add comments for complex logic
- Use meaningful variable names
- Keep components small and focused




---

**Built with ❤️ using React Native & Expo**
