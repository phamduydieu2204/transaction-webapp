/**
 * dataCacheManager.js
 * 
 * Manages data caching, TTL, and cache optimization
 * Provides cache operations and status monitoring
 */

/**
 * Data cache storage
 */
  },
  },
  },
    data: new Map(), // Map for storing search results by query hash
    ttl: 2 * 60 * 1000, // 2 minutes cache TTL
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
  };
}

/**
 * Gets data from cache
 * @param {string} cacheKey - Cache key to retrieve
 * @returns {any} - Cached data or null
 */
  });

      };
    } else {
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
    console.log(`⏱️ TTL updated for ${cacheKey}: ${ttl}ms`);
  }
}

/**
 * Creates a hash for search query to use as cache key
 * @param {Object} query - Search query object
 * @returns {string} - Hash string
 */
  });

  });
    };
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
  
  return removed;
}