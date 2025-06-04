/**
 * Initialize Transaction Tab
 * Sets up date defaults and event listeners for the transaction form
 */

import { initializeDateCalculations } from './calculateEndDate.js';

/**
 * Initialize the transaction tab
 */
export function initTransactionTab() {
  console.log('💰 Initializing transaction tab...');
  
  try {
    // Initialize date calculations and defaults
    initializeDateCalculations();
    
    console.log('✅ Transaction tab initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing transaction tab:', error);
  }
}

// Make function available globally for the navigation manager
window.initTransactionTab = initTransactionTab;