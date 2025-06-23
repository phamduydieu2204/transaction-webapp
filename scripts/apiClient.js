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
    headers: {
      'Content-Type': 'application/json'
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