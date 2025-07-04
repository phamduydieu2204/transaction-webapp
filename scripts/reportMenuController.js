/**
 * reportMenuController.js
 * 
 * Main controller for report menu - using modular architecture
 * This file now imports functionality from separate modules
 */

// Import from the new modular structure
export { initReportMenu } from './reports/reportMenuController.js';

// For backward compatibility, also make available globally
import { initReportMenu as initReportMenuModular } from './reports/reportMenuController.js';

// Make available globally
window.initReportMenu = initReportMenuModular;