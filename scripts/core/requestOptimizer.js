/**
 * Request Optimizer
 * Prevents duplicate API calls and implements request caching
 */

// Track in-flight requests
const pendingRequests = new Map();
const requestCache = new Map();

/**
 * Deduplicate identical requests to prevent multiple calls
 * @param {string} key - Unique identifier for the request
 * @param {Function} requestFn - Function that makes the actual request
 * @param {Object} options - Options including cache duration
 * @returns {Promise} - Request result
 */
export async function deduplicateRequest(key, requestFn, options = {}) {
  const { cacheDuration = 5 * 60 * 1000 } = options; // Default 5 minutes cache
  
  // Check if result is in cache
  if (requestCache.has(key)) {
    const cached = requestCache.get(key);
    const age = Date.now() - cached.timestamp;
    
    if (age < cacheDuration) {
      console.log(`🚀 Cache hit for ${key}`);
      return cached.data;
    } else {
      // Remove expired cache
      requestCache.delete(key);
    }
  }
  
  // Check if request is already in progress
  if (pendingRequests.has(key)) {
    console.log(`⏳ Request pending for ${key}, waiting...`);
    return await pendingRequests.get(key);
  }
  
  // Make new request
  console.log(`📡 Making new request for ${key}`);
  const requestPromise = requestFn()
    .then(data => {
      // Cache the result
      requestCache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    })
    .finally(() => {
      // Remove from pending requests
      pendingRequests.delete(key);
    });

  // Track as pending
  pendingRequests.set(key, requestPromise);
  
  return requestPromise;
}

/**
 * Clear cache for specific key or all cache
 */
export function clearRequestCache(key = null) {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
}

/**
 * Batch multiple requests into one
 */
export class RequestBatcher {
  constructor(batchProcessor, options = {}) {
    this.batchProcessor = batchProcessor;
    this.delay = options.delay || 50; // ms to wait before processing
    this.maxBatchSize = options.maxBatchSize || 10;
    
    this.queue = [];
    this.timeoutId = null;
  }

  add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      
      // Process immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else {
        // Schedule batch processing
        this.scheduleBatch();
      }
    });
  }

  scheduleBatch() {
    if (this.timeoutId) return;
    
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  async flush() {
    if (this.queue.length === 0) return;
    
    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // Get current batch
    const batch = this.queue.splice(0, this.maxBatchSize);
    const items = batch.map(b => b.item);
    
    try {
      const results = await this.batchProcessor(items);
      
      // Resolve individual promises
      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(b => {
        b.reject(error);
      });
    }
    
    // Process remaining items if any
    if (this.queue.length > 0) {
      this.scheduleBatch();
    }
  }
}

/**
 * Prefetch data that will likely be needed soon
 */
export function prefetchData(key, requestFn, options = {}) {
  // Only prefetch if not already cached
  if (!requestCache.has(key)) {
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        deduplicateRequest(key, requestFn, options);
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        deduplicateRequest(key, requestFn, options);
      }, 1000);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    cacheSize: requestCache.size,
    pendingRequests: pendingRequests.size,
    cacheKeys: Array.from(requestCache.keys())
  };
}

// Export for global access
window.requestOptimizer = {
  deduplicateRequest,
  clearRequestCache,
  RequestBatcher,
  prefetchData,
  getCacheStats
};