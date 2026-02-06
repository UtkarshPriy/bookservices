/**
 * In-memory cache for Book entities
 *
 * Interview Topics:
 * - Cache invalidation strategies
 * - TTL (Time To Live) management
 * - Cache hit/miss ratios
 * - Memory management
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

export class BookCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 60000; // 1 minute in milliseconds
  private hits = 0;
  private misses = 0;

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Set value in cache with optional TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 1 minute)
   */
  set<T>(key: string, data: T, ttl = this.TTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Invalidate a single cache entry
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   * Useful for bulk operations like "invalidate all books"
   * @param pattern - String pattern to match keys
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   * Useful for monitoring and optimization
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + "%",
      keys: Array.from(this.cache.keys()),
    };
  }
}
