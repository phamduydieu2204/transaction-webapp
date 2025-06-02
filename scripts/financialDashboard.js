/**
 * financialDashboard.js
 * 
 * Main financial dashboard controller - using modular architecture
 * This file now imports functionality from separate modules
 */

// Import from the new modular structure
export { default as renderFinancialDashboard } from './financial/financialDashboard.js';

// For backward compatibility, also make available globally
import renderFinancialDashboardModular from './financial/financialDashboard.js';

// Make available globally
window.renderFinancialDashboard = renderFinancialDashboardModular;