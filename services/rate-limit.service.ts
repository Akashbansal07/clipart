import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GENERATION_COUNT: '@clipart_generation_count',
  LAST_GENERATION_DATE: '@clipart_last_date',
  LAST_GENERATION_TIME: '@clipart_last_time',
};

const MAX_GENERATIONS_PER_DAY = 100;
const COOLDOWN_SECONDS = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  nextAvailableIn?: number; // seconds
  reason?: string;
}

/**
 * Get current generation count for today
 */
const getTodayCount = async (): Promise<number> => {
  try {
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_GENERATION_DATE);
    
    // Reset count if it's a new day
    if (lastDate !== today) {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_GENERATION_DATE, today);
      await AsyncStorage.setItem(STORAGE_KEYS.GENERATION_COUNT, '0');
      return 0;
    }
    
    const count = await AsyncStorage.getItem(STORAGE_KEYS.GENERATION_COUNT);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting generation count:', error);
    return 0;
  }
};

/**
 * Get time since last generation
 */
const getTimeSinceLastGeneration = async (): Promise<number> => {
  try {
    const lastTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_GENERATION_TIME);
    if (!lastTime) return Infinity;
    
    const now = Date.now();
    const last = parseInt(lastTime, 10);
    return Math.floor((now - last) / 1000); // seconds
  } catch (error) {
    console.error('Error getting last generation time:', error);
    return Infinity;
  }
};

/**
 * Check if generation is allowed
 */
export const checkRateLimit = async (): Promise<RateLimitResult> => {
  const count = await getTodayCount();
  const timeSinceLast = await getTimeSinceLastGeneration();
  
  // Check daily limit
  if (count >= MAX_GENERATIONS_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Daily limit reached (${MAX_GENERATIONS_PER_DAY} images/day). Come back tomorrow!`,
    };
  }
  
  // Check cooldown
  if (timeSinceLast < COOLDOWN_SECONDS) {
    return {
      allowed: false,
      remaining: MAX_GENERATIONS_PER_DAY - count,
      nextAvailableIn: COOLDOWN_SECONDS - timeSinceLast,
      reason: `Please wait ${COOLDOWN_SECONDS - timeSinceLast} seconds before generating again.`,
    };
  }
  
  return {
    allowed: true,
    remaining: MAX_GENERATIONS_PER_DAY - count - 1,
  };
};

/**
 * Record a generation
 */
export const recordGeneration = async (): Promise<void> => {
  try {
    const count = await getTodayCount();
    await AsyncStorage.setItem(STORAGE_KEYS.GENERATION_COUNT, (count + 1).toString());
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_GENERATION_TIME, Date.now().toString());
  } catch (error) {
    console.error('Error recording generation:', error);
  }
};

/**
 * Get current usage stats
 */
export const getUsageStats = async (): Promise<{
  used: number;
  remaining: number;
  total: number;
}> => {
  const count = await getTodayCount();
  return {
    used: count,
    remaining: MAX_GENERATIONS_PER_DAY - count,
    total: MAX_GENERATIONS_PER_DAY,
  };
};

/**
 * Reset for testing (dev only)
 */
export const resetRateLimit = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GENERATION_COUNT,
      STORAGE_KEYS.LAST_GENERATION_DATE,
      STORAGE_KEYS.LAST_GENERATION_TIME,
    ]);
  } catch (error) {
    console.error('Error resetting rate limit:', error);
  }
};