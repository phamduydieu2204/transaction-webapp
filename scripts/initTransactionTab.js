/**
 * Initialize Transaction Tab
 * Sets up date defaults and event listeners for the transaction form
 */

import { initializeDateCalculations } from './calculateEndDate.js';
import { updatePackageList } from './updatePackageList.js';
import { updateAccountList } from './updateAccountList.js';
import { initTransactionTypeDropdown } from './transactionTypeManager.js';

/**
 * Setup software dropdown event handlers for cascading selection
 */
function setupSoftwareDropdownHandlers() {
  const softwareNameSelect = document.getElementById('softwareName');
  const softwarePackageSelect = document.getElementById('softwarePackage');
  
  if (softwareNameSelect) {
    // Remove existing event listeners to avoid duplicates
    if (softwareNameSelect.changeHandler) {
      softwareNameSelect.removeEventListener('change', softwareNameSelect.changeHandler);
    }
    
    // Create the event handler
    softwareNameSelect.changeHandler = function() {
      // Update package list based on selected software
      if (window.softwareData) {
        updatePackageList(window.softwareData, null, updateAccountList, null);
      }
    };
    
    // Add the event listener
    softwareNameSelect.addEventListener('change', softwareNameSelect.changeHandler);
  }
  
  if (softwarePackageSelect) {
    // Remove existing event listeners to avoid duplicates
    if (softwarePackageSelect.changeHandler) {
      softwarePackageSelect.removeEventListener('change', softwarePackageSelect.changeHandler);
    }
    
    // Create the event handler
    softwarePackageSelect.changeHandler = function() {
      // Update account list based on selected software and package
      if (window.softwareData) {
        updateAccountList(window.softwareData, null);
      }
    };
    
    // Add the event listener
    softwarePackageSelect.addEventListener('change', softwarePackageSelect.changeHandler);
  }
}

/**
 * Initialize software data if not already loaded
 */
async function initializeSoftwareData() {
  if (!window.softwareData || window.softwareData.length === 0) {
    try {
      // Import fetchSoftwareList
      const { fetchSoftwareList } = await import('./fetchSoftwareList.js');
      
      // Load software data
      await fetchSoftwareList(null, window.softwareData, updatePackageList, updateAccountList);
    } catch (error) {
      // Silent fail
    }
  }
}

/**
 * Initialize the transaction tab
 */
export async function initTransactionTab() {
  try {
    // Initialize date calculations and defaults
    initializeDateCalculations();
    
    // Initialize transaction type dropdown with all options
    initTransactionTypeDropdown();
    
    // Initialize software data if needed
    await initializeSoftwareData();
    
    // Setup software dropdown cascading handlers
    setupSoftwareDropdownHandlers();
  } catch (error) {
    // Silent fail
  }
}

// Make function available globally for the navigation manager
window.initTransactionTab = initTransactionTab;