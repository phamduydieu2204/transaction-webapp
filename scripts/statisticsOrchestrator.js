/**
 * statisticsOrchestrator.js
 * 
 * Core statistics orchestration and exports
 * Main entry point that imports and re-exports all statistics modules
 */

// Import all modules
import {
  normalizeDate,
  groupTransactionsByTenChuan,
  groupExpensesByTenChuan,
  groupExpensesByMonth,
  groupRevenueByMonth
} from './statistics/dataUtilities.js';

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatLargeNumber,
  formatDateDisplay,
  formatMonthYear,
  formatDuration,
  formatGrowthRate,
  formatROI,
  formatProfitMargin
} from './statistics/formatters.js';

import {
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateFinancialAnalysis,
  calculateGrowthRate,
  calculateAllocatedExpense,
  calculateActualExpense,
  calculateMonthlyExpenseBreakdown
} from './statistics/calculations.js';

import {
  getDateRange,
  getCustomDateRange,
  getPreviousPeriodRange,
  getSamePeriodLastYear,
  getDaysBetween,
  isDateInPeriod,
  getMonthsInRange,
  getFiscalYear,
  getFiscalYearRange,
  formatPeriodName
} from './statistics/periodHandlers.js';

import {
  COLOR_SCHEMES,
  getColor,
  generateColors,
  prepareRevenueChartData,
  prepareExpenseChartData,
  prepareROIChartData,
  generateChartConfig,
  prepareComparisonChartData
} from './statistics/chartHelpers.js';

// Re-export all functions for backward compatibility
export {
  // Data utilities
  normalizeDate,
  groupTransactionsByTenChuan,
  groupExpensesByTenChuan,
  groupExpensesByMonth,
  groupRevenueByMonth,
  
  // Formatters
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatLargeNumber,
  formatDateDisplay,
  formatMonthYear,
  formatDuration,
  formatGrowthRate,
  formatROI,
  formatProfitMargin,
  
  // Calculations
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateFinancialAnalysis,
  calculateGrowthRate,
  calculateAllocatedExpense,
  calculateActualExpense,
  calculateMonthlyExpenseBreakdown,
  
  // Period handlers
  getDateRange,
  getCustomDateRange,
  getPreviousPeriodRange,
  getSamePeriodLastYear,
  getDaysBetween,
  isDateInPeriod,
  getMonthsInRange,
  getFiscalYear,
  getFiscalYearRange,
  formatPeriodName,
  
  // Chart helpers
  COLOR_SCHEMES,
  getColor,
  generateColors,
  prepareRevenueChartData,
  prepareExpenseChartData,
  prepareROIChartData,
  generateChartConfig,
  prepareComparisonChartData
};

/**
 * Main statistics API object for easy access to all functions
 */
export const StatisticsAPI = {
  // Data utilities
  data: {
    normalizeDate,
    groupTransactionsByTenChuan,
    groupExpensesByTenChuan,
    groupExpensesByMonth,
    groupRevenueByMonth
  },
  
  // Formatters
  format: {
    currency: formatCurrency,
    number: formatNumber,
    percentage: formatPercentage,
    largeNumber: formatLargeNumber,
    date: formatDateDisplay,
    monthYear: formatMonthYear,
    duration: formatDuration,
    growthRate: formatGrowthRate,
    roi: formatROI,
    profitMargin: formatProfitMargin
  },
  
  // Calculations
  calculate: {
    totalExpenses: calculateTotalExpenses,
    totalRevenue: calculateTotalRevenue,
    financialAnalysis: calculateFinancialAnalysis,
    growthRate: calculateGrowthRate,
    allocatedExpense: calculateAllocatedExpense,
    actualExpense: calculateActualExpense,
    monthlyExpenseBreakdown: calculateMonthlyExpenseBreakdown
  },
  
  // Period handlers
  period: {
    getDateRange,
    getCustomDateRange,
    getPreviousPeriodRange,
    getSamePeriodLastYear,
    getDaysBetween,
    isDateInPeriod,
    getMonthsInRange,
    getFiscalYear,
    getFiscalYearRange,
    formatPeriodName
  },
  
  // Chart helpers
  chart: {
    COLOR_SCHEMES,
    getColor,
    generateColors,
    prepareRevenueChartData,
    prepareExpenseChartData,
    prepareROIChartData,
    generateChartConfig,
    prepareComparisonChartData
  }
};

console.log('📊 Statistics Core modules loaded successfully');

// Make API available globally for backward compatibility
window.StatisticsAPI = StatisticsAPI;