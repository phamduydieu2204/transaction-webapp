/**
 * Cache Manager - Quản lý cache cho performance và real-time updates
 */

class CacheManager {
  constructor() {
    this.caches = new Map();
    this.ttl = 5 * 60 * 1000; // Default TTL: 5 minutes
  }

  /**
   * Set cache with optional TTL
   */
  set(key, value, ttl = this.ttl) {
    this.caches.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  /**
   * Get cache if not expired
   */
  get(key) {
    const cache = this.caches.get(key);
    if (!cache) return null;
    
    if (Date.now() > cache.expires) {
      this.caches.delete(key);
      return null;
    }
    
    return cache.value;
  }

  /**
   * Clear specific cache
   */
  clear(key) {
    this.caches.delete(key);
  }

  /**
   * Clear all caches
   */
  clearAll() {
    this.caches.clear();
  }

  /**
   * Clear expired caches
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, cache] of this.caches.entries()) {
      if (now > cache.expires) {
        this.caches.delete(key);
      }
    }
  }

  /**
   * Force clear all transaction-related caches
   */
  clearTransactionCaches() {
    // Clear window cache objects
    if (window.transactionCache) delete window.transactionCache;
    if (window.transactionDataCache) delete window.transactionDataCache;
    
    // Clear cache manager entries
    this.clear('transactions');
    this.clear('transaction-stats');
    
  }

  /**
   * Force clear all expense-related caches
   */
  clearExpenseCaches() {
    // Clear window cache objects
    if (window.expenseCache) delete window.expenseCache;
    if (window.expenseDataCache) delete window.expenseDataCache;
    
    // Clear cache manager entries
    this.clear('expenses');
    this.clear('expense-stats');
    
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Make available globally for debugging
window.cacheManager = cacheManager;