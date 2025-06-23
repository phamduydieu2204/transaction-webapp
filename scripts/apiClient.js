import { getConstants } from './constants.js';

/**
 * Helper function to make API requests with proper headers
 * @param {Object} data - Request data
 * @returns {Promise<Response>}
 */
export async function apiRequest(data) {
  const { BACKEND_URL } = getConstants();
  
  return fetch(BACKEND_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
}

/**
 * Helper function to make API requests and parse JSON response
 * @param {Object} data - Request data
 * @returns {Promise<Object>}
 */
export async function apiRequestJson(data) {
  const response = await apiRequest(data);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Helper function to make API requests with retry logic
 * @param {Object} data - Request data
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Object>}
 */
export async function apiRequestWithRetry(data, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequestJson(data);
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.message.includes('HTTP error!') && error.message.includes('4')) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        console.warn(`API request failed, retrying (${attempt}/${maxRetries})...`);
      }
    }
  }
  
  throw lastError;
}

/**
 * Helper function for transaction-related API calls
 * @param {string} action - Action type
 * @param {Object} additionalData - Additional data to send
 * @returns {Promise<Object>}
 */
export async function transactionApiCall(action, additionalData = {}) {
  return apiRequestJson({
    action,
    ...additionalData
  });
}

/**
 * Helper function for expense-related API calls
 * @param {string} action - Action type
 * @param {Object} additionalData - Additional data to send
 * @returns {Promise<Object>}
 */
export async function expenseApiCall(action, additionalData = {}) {
  return apiRequestJson({
    action,
    ...additionalData
  });
}