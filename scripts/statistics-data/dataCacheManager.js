/**
 * dataCacheManager.js
 * 
 * Manages data caching, TTL, and cache optimization
 * Provides cache operations and status monitoring
 */

/**
 * Data cache storage
 */
const dataCache = {
  expenses: {
    data: null,
    lastFetch: null,
    ttl: 5 * 60 * 1000 // 5 minutes cache TTL
  },
  transactions: {
    data: null,
    lastFetch: null,
    ttl: 5 * 60 * 1000 // 5 minutes cache TTL
  },
  expenseOptions: {
    data: null,
    lastFetch: null,
    ttl: 30 * 60 * 1000 // 30 minutes cache TTL
  },
  searchResults: {
    data: new Map(), // Map for storing search results by query hash
    lastFetch: null,
    ttl: 2 * 60 * 1000, // 2 minutes cache TTL
    maxSize: 50 // Maximum number of cached searches
  }
};

/**
 * Checks if cached data is still valid
 * @param {string} cacheKey - Cache key to check
 * @returns {boolean} - True if cache is valid
 */
export function isCacheValid(cacheKey) {
  const cache = dataCache[cacheKey];
  if (!cache || !cache.data || !cache.lastFetch) return false;
  
  const now = Date.now();
  return (now - cache.lastFetch) < cache.ttl;
}

/**
 * Updates cache with new data
 * @param {string} cacheKey - Cache key to update
 * @param {any} data - Data to cache
 */
export function updateCache(cacheKey, data) {
  if (!dataCache[cacheKey]) {
    console.warn(`⚠️ Invalid cache key: ${cacheKey}`);
    return;
  }

  dataCache[cacheKey] = {
    ...dataCache[cacheKey],
    data: data,
    lastFetch: Date.now()
  };
  
  console.log(`📦 Cache updated for ${cacheKey}:`, 
    Array.isArray(data) ? `${data.length} items` : 'data stored');
}

/**
 * Gets data from cache
 * @param {string} cacheKey - Cache key to retrieve
 * @returns {any} - Cached data or null
 */
export function getFromCache(cacheKey) {
  if (!isCacheValid(cacheKey)) {
    // console.log(`⏱️ Cache miss or expired for ${cacheKey}`);
    return null;
  }
  
  // console.log(`📦 Cache hit for ${cacheKey}`);
  return dataCache[cacheKey].data;
}

/**
 * Clears specific cache or all caches
 * @param {string} cacheKey - Specific cache to clear, or null for all
 */
export function clearCache(cacheKey = null) {
  if (cacheKey) {
    if (dataCache[cacheKey]) {
      dataCache[cacheKey].data = null;
      dataCache[cacheKey].lastFetch = null;
      
      // Special handling for search results
      if (cacheKey === 'searchResults' && dataCache[cacheKey].data instanceof Map) {
        dataCache[cacheKey].data.clear();
      }
      
      // console.log(`🗑️ Cache cleared for ${cacheKey}`);
    }
  } else {
    Object.keys(dataCache).forEach(key => {
      dataCache[key].data = null;
      dataCache[key].lastFetch = null;
      
      // Special handling for search results
      if (key === 'searchResults' && dataCache[key].data instanceof Map) {
        dataCache[key].data = new Map();
      }
    });
    // console.log("🗑️ All caches cleared");
  }
}

/**
 * Gets cache status information
 * @returns {Object} - Cache status for all data types
 */
export function getCacheStatus() {
  const status = {};
  
  Object.keys(dataCache).forEach(key => {
    const cache = dataCache[key];
    
    if (key === 'searchResults' && cache.data instanceof Map) {
      status[key] = {
        hasData: cache.data.size > 0,
        recordCount: cache.data.size,
        lastFetch: cache.lastFetch,
        isValid: isCacheValid(key),
        ttl: cache.ttl,
        maxSize: cache.maxSize
      };
    } else {
      status[key] = {
        hasData: !!cache.data,
        recordCount: Array.isArray(cache.data) ? cache.data.length : 'N/A',
        lastFetch: cache.lastFetch,
        isValid: isCacheValid(key),
        ttl: cache.ttl
      };
    }
  });

  return status;
}

/**
 * Sets custom TTL for a cache key
 * @param {string} cacheKey - Cache key to update
 * @param {number} ttl - Time to live in milliseconds
 */
export function setCacheTTL(cacheKey, ttl) {
  if (dataCache[cacheKey] && typeof ttl === 'number' && ttl > 0) {
    dataCache[cacheKey].ttl = ttl;
    // console.log(`⏱️ TTL updated for ${cacheKey}: ${ttl}ms`);
  }
}

/**
 * Creates a hash for search query to use as cache key
 * @param {Object} query - Search query object
 * @returns {string} - Hash string
 */
export function createQueryHash(query) {
  const sortedQuery = Object.keys(query)
    .sort()
    .reduce((obj, key) => {
      obj[key] = query[key];
      return obj;
    }, {});
  
  return JSON.stringify(sortedQuery);
}

/**
 * Caches search results with query-based key
 * @param {Object} query - Search query
 * @param {Array} results - Search results
 */
export function cacheSearchResults(query, results) {
  const searchCache = dataCache.searchResults;
  const queryHash = createQueryHash(query);
  
  // Check cache size limit
  if (searchCache.data.size >= searchCache.maxSize) {
    // Remove oldest entry
    const firstKey = searchCache.data.keys().next().value;
    searchCache.data.delete(firstKey);
    // console.log(`🗑️ Removed oldest search cache entry`);
  }
  
  searchCache.data.set(queryHash, {
    query: query,
    results: results,
    timestamp: Date.now()
  });
  
  searchCache.lastFetch = Date.now();
  // console.log(`📦 Cached search results: ${results.length} items`);
}

/**
 * Gets cached search results
 * @param {Object} query - Search query
 * @returns {Array|null} - Cached results or null
 */
export function getCachedSearchResults(query) {
  const searchCache = dataCache.searchResults;
  const queryHash = createQueryHash(query);
  
  if (!searchCache.data.has(queryHash)) {
    return null;
  }
  
  const cached = searchCache.data.get(queryHash);
  const age = Date.now() - cached.timestamp;
  
  if (age > searchCache.ttl) {
    searchCache.data.delete(queryHash);
    // console.log(`⏱️ Search cache expired for query`);
    return null;
  }
  
  // console.log(`📦 Search cache hit: ${cached.results.length} items`);
  return cached.results;
}

/**
 * Preloads cache with data
 * @param {string} cacheKey - Cache key
 * @param {any} data - Data to preload
 */
export function preloadCache(cacheKey, data) {
  if (dataCache[cacheKey]) {
    updateCache(cacheKey, data);
    // console.log(`🚀 Cache preloaded for ${cacheKey}`);
  }
}

/**
 * Gets cache memory usage estimate
 * @returns {Object} - Memory usage information
 */
export function getCacheMemoryUsage() {
  const usage = {};
  let totalSize = 0;
  
  Object.keys(dataCache).forEach(key => {
    const cache = dataCache[key];
    let size = 0;
    
    if (cache.data) {
      // Rough estimate of memory usage
      if (key === 'searchResults' && cache.data instanceof Map) {
        cache.data.forEach((value) => {
          size += JSON.stringify(value).length * 2; // Unicode chars = 2 bytes
        });
      } else {
        size = JSON.stringify(cache.data).length * 2;
      }
    }
    
    usage[key] = {
      sizeBytes: size,
      sizeKB: (size / 1024).toFixed(2),
      sizeMB: (size / 1024 / 1024).toFixed(2)
    };
    
    totalSize += size;
  });
  
  usage.total = {
    sizeBytes: totalSize,
    sizeKB: (totalSize / 1024).toFixed(2),
    sizeMB: (totalSize / 1024 / 1024).toFixed(2)
  };
  
  return usage;
}

/**
 * Optimizes cache by removing expired entries
 */
export function optimizeCache() {
  let removed = 0;
  
  // Clean up search results cache
  const searchCache = dataCache.searchResults;
  if (searchCache.data instanceof Map) {
    const now = Date.now();
    
    searchCache.data.forEach((value, key) => {
      if (now - value.timestamp > searchCache.ttl) {
        searchCache.data.delete(key);
        removed++;
      }
    });
  }
  
  // Clear expired main caches
  Object.keys(dataCache).forEach(key => {
    if (key !== 'searchResults' && !isCacheValid(key) && dataCache[key].data) {
      dataCache[key].data = null;
      dataCache[key].lastFetch = null;
      removed++;
    }
  });
  
  console.log(`🧹 Cache optimized: ${removed} expired entries removed`);
  return removed;
}