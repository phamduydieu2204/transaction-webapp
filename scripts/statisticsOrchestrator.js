/**
 * statisticsOrchestrator.js - DISABLED
 * 
 * ⚠️ This file has been disabled during cleanup to prevent conflicts.
 * Direct imports should use statisticsCore.js instead
 * 
 * Reason: Orchestration layer adds unnecessary complexity
 * Date: 2025-01-16
 */

console.warn('⚠️ statisticsOrchestrator.js is disabled - import directly from statisticsCore.js instead');

// Re-export main functions from statisticsCore for backward compatibility
export {
  normalizeDate,
  calculateTotalExpenses,
  calculateTotalRevenue,
  formatCurrency,
  getDateRange,
  calculateFinancialAnalysis,
  groupTransactionsByTenChuan,
  groupExpensesByTenChuan
} from './statisticsCore.js';

/**
 * DISABLED - StatisticsAPI object redirects to core functions
 */
export const StatisticsAPI = {
  data: {
    message: 'Use direct imports from statisticsCore.js instead'
  },
  format: {
    message: 'Use direct imports from statisticsCore.js instead'  
  },
  calculate: {
    message: 'Use direct imports from statisticsCore.js instead'
  }
};

window.StatisticsAPI = StatisticsAPI;