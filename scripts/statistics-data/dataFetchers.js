/**
 * dataFetchers.js
 * 
 * Handles all data fetching operations from various sources
 * Includes API calls for expenses, transactions, and options
 */

import { getConstants } from '../constants.js';

/**
 * Fetches expense statistics data from API
 * @param {Object} options - Fetch options
 * @param {boolean} options.timeout - Request timeout in ms
 * @returns {Promise<Array>} - Array of expense records
 */
export async function fetchExpenseData(options = {}) {
  const { timeout = 15000 } = options;
  const { BACKEND_URL } = getConstants();
  

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseStats" }),
      signal: controller.signal

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const expenseData = result.data || [];
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
 * @param {boolean} options.timeout - Request timeout in ms
 * @returns {Promise<Array>} - Array of transaction records
 */
export async function fetchTransactionData(options = {}) {
  const { timeout = 15000 } = options;
  const { BACKEND_URL } = getConstants();
  

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getTransactionStats" }),
      signal: controller.signal

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const transactionData = result.data || [];
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
 * @param {boolean} options.timeout - Request timeout in ms
 * @returns {Promise<Object>} - Expense dropdown options
 */
export async function fetchExpenseOptions(options = {}) {
  const { timeout = 10000 } = options;
  const { BACKEND_URL } = getConstants();
  

  try {
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseDropdownOptions" }),
      signal: controller.signal

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
  const { timeout = 15000 } = options;
  const { BACKEND_URL } = getConstants();
  

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

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const searchResults = result.data || [];
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
  const { timeout = 15000 } = options;
  const { BACKEND_URL } = getConstants();
  

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

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const searchResults = result.data || [];
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