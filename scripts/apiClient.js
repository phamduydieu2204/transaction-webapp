import { getConstants } from './constants.js';

// API key for authentication
const API_KEY = 'vidieu_vn_transaction_proxy_2024_secure';

/**
 * Helper function to make API requests with proper headers
 * @param {Object} data - Request data
 * @returns {Promise<Response>}
 */
export async function apiRequest(data) {
  const { BACKEND_URL } = getConstants();
  
  return fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify(data)
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