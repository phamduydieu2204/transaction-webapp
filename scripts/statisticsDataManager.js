/**
 * statisticsDataManager.js
 * 
 * Orchestrator for statistics data management
 * Coordinates between data fetching, caching, transformation, and validation
 */

// Import modules
import { 
  fetchExpenseData as _fetchExpenseData,
  fetchTransactionData as _fetchTransactionData,
  fetchExpenseOptions as _fetchExpenseOptions,
  searchExpenses as _searchExpenses,
  searchTransactions as _searchTransactions
} from './statistics-data/dataFetchers.js';

import {
  isCacheValid,
  updateCache,
  getFromCache,
  clearCache as _clearCache,
  getCacheStatus as _getCacheStatus,
  cacheSearchResults,
  getCachedSearchResults,
  optimizeCache
} from './statistics-data/dataCacheManager.js';

import {
  convertToCSV,
  normalizeExpenseData,
  normalizeTransactionData
} from './statistics-data/dataTransformers.js';

import {
  validateExpenseArray,
  validateTransactionArray
} from './statistics-data/dataValidators.js';

/**
 * Fetches expense data with caching and validation
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Validated expense records
 */
export async function fetchExpenseData(options = {}) {
  const { forceRefresh = false } = options;

  // Check cache first
  if (!forceRefresh) {
    const cached = getFromCache('expenses');
    if (cached) return cached;
  }

  // Fetch from API
  const rawData = await _fetchExpenseData(options);
  
  // Validate and normalize
  const { valid, invalid } = validateExpenseArray(rawData);
  
  if (invalid.length > 0) {
    console.warn(`⚠️ ${invalid.length} invalid expense records found`);
  }

  const normalizedData = normalizeExpenseData(valid);
  
  // Update cache
  updateCache('expenses', normalizedData);
  
  return normalizedData;
}

/**
 * Fetches transaction data with caching and validation
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Validated transaction records
 */
export async function fetchTransactionData(options = {}) {
  const { forceRefresh = false } = options;

  // Check cache first
  if (!forceRefresh) {
    const cached = getFromCache('transactions');
    if (cached) return cached;
  }

  // Fetch from API
  const rawData = await _fetchTransactionData(options);
  
  // Validate and normalize
  const { valid, invalid } = validateTransactionArray(rawData);
  
  if (invalid.length > 0) {
    console.warn(`⚠️ ${invalid.length} invalid transaction records found`);
  }

  const normalizedData = normalizeTransactionData(valid);
  
  // Update cache
  updateCache('transactions', normalizedData);
  
  return normalizedData;
}

/**
 * Fetches expense options with caching
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Expense options
 */
export async function fetchExpenseOptions(options = {}) {
  const { forceRefresh = false } = options;

  // Check cache first
  if (!forceRefresh) {
    const cached = getFromCache('expenseOptions');
    if (cached) return cached;
  }

  // Fetch from API
  const optionsData = await _fetchExpenseOptions(options);
  
  // Update cache
  updateCache('expenseOptions', optionsData);
  
  return optionsData;
}

/**
 * Searches expenses with caching
 * @param {Object} filters - Search filters
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
export async function searchExpenses(filters, options = {}) {
  // Check search cache
  const cached = getCachedSearchResults(filters);
  if (cached) return cached;

  // Perform search
  const results = await _searchExpenses(filters, options);
  
  // Cache results
  cacheSearchResults(filters, results);
  
  return results;
}

/**
 * Searches transactions with caching
 * @param {Object} filters - Search filters
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
export async function searchTransactions(filters, options = {}) {
  // Check search cache
  const cached = getCachedSearchResults(filters);
  if (cached) return cached;

  // Perform search
  const results = await _searchTransactions(filters, options);
  
  // Cache results
  cacheSearchResults(filters, results);
  
  return results;
}

/**
 * Gets combined statistics data
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Combined data
 */
export async function getCombinedStatistics(options = {}) {
  const {
    forceRefresh = false,
    includeTransactions = true,
    includeExpenses = true
  } = options;

  // console.log("📊 Fetching combined statistics data...");

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
      expenses: includeExpenses ? results[0] : [],
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
 * Preloads data for faster display
 * @param {Object} options - Preload options
 * @returns {Promise<void>}
 */
export async function preloadStatisticsData(options = {}) {
  const { background = true } = options;

  // console.log("🚀 Preloading statistics data...");

  try {
    const promises = [
      fetchExpenseData({ forceRefresh: false }),
      fetchTransactionData({ forceRefresh: false }),
      fetchExpenseOptions({ forceRefresh: false })
    ];

    if (background) {
      // Fire and forget
      Promise.all(promises).catch(error => {
        console.warn("⚠️ Background preload failed:", error);
      });
    } else {
      // Wait for completion
      await Promise.all(promises);
      // console.log("✅ Statistics data preloaded successfully");
    }

    // Optimize cache
    optimizeCache();
    
  } catch (error) {
    console.error("❌ Error preloading statistics data:", error);
    throw error;
  }
}

/**
 * Exports data to different formats
 * @param {Array} data - Data to export
 * @param {string} format - Export format
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
    
    // console.log("✅ Export completed successfully");
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// Re-export commonly used functions
export { clearCache } from './statistics-data/dataCacheManager.js';
export { getCacheStatus } from './statistics-data/dataCacheManager.js';