/**
 * Simple in-memory cache implementation
 * Reduces redundant API calls by caching responses with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache entry has expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache data with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Run cleanup every 10 minutes in production
if (typeof window === "undefined") {
  // Server-side only
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  QUOTE: 1 * 60 * 1000, // 1 minute for real-time quotes
  PROFILE: 60 * 60 * 1000, // 1 hour for company profile
  METRICS: 24 * 60 * 60 * 1000, // 24 hours for fundamental metrics
  HISTORY: 15 * 60 * 1000, // 15 minutes for historical data
  NEWS: 5 * 60 * 1000, // 5 minutes for news
} as const;
