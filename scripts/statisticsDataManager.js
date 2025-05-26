/**
 * statisticsDataManager.js
 * 
 * Manages data fetching, caching, and processing for statistics
 * Handles API calls and data state management
 */

import { getConstants } from './constants.js';

/**
 * Data cache for statistics
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
  }
};

/**
 * Checks if cached data is still valid
 * @param {string} cacheKey - Cache key to check
 * @returns {boolean} - True if cache is valid
 */
function isCacheValid(cacheKey) {
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
function updateCache(cacheKey, data) {
  dataCache[cacheKey] = {
    ...dataCache[cacheKey],
    data: data,
    lastFetch: Date.now()
  };
  console.log(`📦 Cache updated for ${cacheKey}:`, data?.length || 'N/A', 'items');
}

/**
 * Clears specific cache or all caches
 * @param {string} cacheKey - Specific cache to clear, or null for all
 */
export function clearCache(cacheKey = null) {
  if (cacheKey) {
    dataCache[cacheKey].data = null;
    dataCache[cacheKey].lastFetch = null;
    console.log(`🗑️ Cache cleared for ${cacheKey}`);
  } else {
    Object.keys(dataCache).forEach(key => {
      dataCache[key].data = null;
      dataCache[key].lastFetch = null;
    });
    console.log("🗑️ All caches cleared");
  }
}

/**
 * Fetches expense statistics data from API
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Array of expense records
 */
export async function fetchExpenseData(options = {}) {
  const {
    forceRefresh = false,
    timeout = 15000
  } = options;

  // Check cache first
  if (!forceRefresh && isCacheValid('expenses')) {
    console.log("📦 Using cached expense data");
    return dataCache.expenses.data;
  }

  const { BACKEND_URL } = getConstants();
  
  console.log("🔄 Fetching expense data from API...");

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseStats" }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const expenseData = result.data || [];
      updateCache('expenses', expenseData);
      console.log("✅ Expense data fetched successfully:", expenseData.length, "records");
      return expenseData;
    } else {
      throw new Error(result.message || "Unknown API error");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Expense data fetch timeout after ${timeout}ms`);
      throw new Error("Request timeout - please try again");
    } else {
      console.error("❌ Error fetching expense data:", error);
      throw error;
    }
  }
}

/**
 * Fetches transaction data from API
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Array of transaction records
 */
export async function fetchTransactionData(options = {}) {
  const {
    forceRefresh = false,
    timeout = 15000
  } = options;

  // Check cache first
  if (!forceRefresh && isCacheValid('transactions')) {
    console.log("📦 Using cached transaction data");
    return dataCache.transactions.data;
  }

  const { BACKEND_URL } = getConstants();
  
  console.log("🔄 Fetching transaction data from API...");

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getTransactionStats" }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const transactionData = result.data || [];
      updateCache('transactions', transactionData);
      console.log("✅ Transaction data fetched successfully:", transactionData.length, "records");
      return transactionData;
    } else {
      throw new Error(result.message || "Unknown API error");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Transaction data fetch timeout after ${timeout}ms`);
      throw new Error("Request timeout - please try again");
    } else {
      console.error("❌ Error fetching transaction data:", error);
      throw error;
    }
  }
}

/**
 * Fetches expense dropdown options from API
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Expense dropdown options
 */
export async function fetchExpenseOptions(options = {}) {
  const {
    forceRefresh = false,
    timeout = 10000
  } = options;

  // Check cache first
  if (!forceRefresh && isCacheValid('expenseOptions')) {
    console.log("📦 Using cached expense options");
    return dataCache.expenseOptions.data;
  }

  const { BACKEND_URL } = getConstants();
  
  console.log("🔄 Fetching expense options from API...");

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseDropdownOptions" }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const optionsData = {
        expenseMap: result.expenseMap || {},
        bankMap: result.bankMap || {}
      };
      updateCache('expenseOptions', optionsData);
      console.log("✅ Expense options fetched successfully");
      return optionsData;
    } else {
      throw new Error(result.message || "Unknown API error");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Expense options fetch timeout after ${timeout}ms`);
      throw new Error("Request timeout - please try again");
    } else {
      console.error("❌ Error fetching expense options:", error);
      throw error;
    }
  }
}

/**
 * Searches expenses with filters
 * @param {Object} filters - Search filters
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Filtered expense results
 */
export async function searchExpenses(filters, options = {}) {
  const {
    useCache = true,
    timeout = 15000
  } = options;

  const { BACKEND_URL } = getConstants();
  
  console.log("🔍 Searching expenses with filters:", filters);

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "searchExpenses",
        ...filters
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const searchResults = result.data || [];
      console.log("✅ Expense search completed:", searchResults.length, "results");
      return searchResults;
    } else {
      throw new Error(result.message || "Search failed");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Expense search timeout after ${timeout}ms`);
      throw new Error("Search timeout - please try again");
    } else {
      console.error("❌ Error searching expenses:", error);
      throw error;
    }
  }
}

/**
 * Searches transactions with filters
 * @param {Object} filters - Search filters
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Filtered transaction results
 */
export async function searchTransactions(filters, options = {}) {
  const {
    useCache = true,
    timeout = 15000
  } = options;

  const { BACKEND_URL } = getConstants();
  
  console.log("🔍 Searching transactions with filters:", filters);

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "searchTransactions",
        ...filters
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const searchResults = result.data || [];
      console.log("✅ Transaction search completed:", searchResults.length, "results");
      return searchResults;
    } else {
      throw new Error(result.message || "Search failed");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Transaction search timeout after ${timeout}ms`);
      throw new Error("Search timeout - please try again");
    } else {
      console.error("❌ Error searching transactions:", error);
      throw error;
    }
  }
}

/**
 * Gets combined statistics data (expenses + transactions)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Combined statistics data
 */
export async function getCombinedStatistics(options = {}) {
  const {
    forceRefresh = false,
    includeTransactions = true,
    includeExpenses = true
  } = options;

  console.log("📊 Fetching combined statistics data...");

  try {
    const promises = [];
    
    if (includeExpenses) {
      promises.push(fetchExpenseData({ forceRefresh }));
    }
    
    if (includeTransactions) {
      promises.push(fetchTransactionData({ forceRefresh }));
    }

    const results = await Promise.all(promises);
    
    const combinedData = {
      expenses: includeExpenses ? results[includeTransactions ? 0 : 0] : [],
      transactions: includeTransactions ? results[includeExpenses ? 1 : 0] : [],
      timestamp: Date.now()
    };

    console.log("✅ Combined statistics data ready:", {
      expenses: combinedData.expenses.length,
      transactions: combinedData.transactions.length
    });

    return combinedData;

  } catch (error) {
    console.error("❌ Error fetching combined statistics:", error);
    throw error;
  }
}

/**
 * Preloads data for faster statistics display
 * @param {Object} options - Preload options
 * @returns {Promise<void>}
 */
export async function preloadStatisticsData(options = {}) {
  const {
    background = true
  } = options;

  console.log("🚀 Preloading statistics data...");

  try {
    if (background) {
      // Fire and forget - don't wait for completion
      Promise.all([
        fetchExpenseData({ forceRefresh: false }),
        fetchTransactionData({ forceRefresh: false }),
        fetchExpenseOptions({ forceRefresh: false })
      ]).catch(error => {
        console.warn("⚠️ Background preload failed:", error);
      });
    } else {
      // Wait for completion
      await Promise.all([
        fetchExpenseData({ forceRefresh: false }),
        fetchTransactionData({ forceRefresh: false }),
        fetchExpenseOptions({ forceRefresh: false })
      ]);
      console.log("✅ Statistics data preloaded successfully");
    }
  } catch (error) {
    console.error("❌ Error preloading statistics data:", error);
    throw error;
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
    status[key] = {
      hasData: !!cache.data,
      recordCount: Array.isArray(cache.data) ? cache.data.length : 'N/A',
      lastFetch: cache.lastFetch,
      isValid: isCacheValid(key),
      ttl: cache.ttl
    };
  });

  return status;
}

/**
 * Exports data to different formats
 * @param {Array} data - Data to export
 * @param {string} format - Export format ("csv", "json")
 * @param {string} filename - Output filename
 * @returns {Promise<void>}
 */
export async function exportData(data, format = "csv", filename = "statistics") {
  console.log(`📤 Exporting ${data.length} records as ${format}...`);

  try {
    let content = "";
    let mimeType = "";
    let fileExtension = "";

    switch (format.toLowerCase()) {
      case "csv":
        content = convertToCSV(data);
        mimeType = "text/csv";
        fileExtension = ".csv";
        break;
      
      case "json":
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        fileExtension = ".json";
        break;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log("✅ Export completed successfully");
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

/**
 * Converts array of objects to CSV format
 * @param {Array} data - Data to convert
 * @returns {string} - CSV formatted string
 */
function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.join(",");
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || "";
      // Escape commas and quotes in CSV
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",");
  });
  
  return [csvHeaders, ...csvRows].join("\n");
}