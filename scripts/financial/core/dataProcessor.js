/**
 * dataProcessor.js
 * 
 * Core data processing utilities for financial dashboard
 * Handles data transformation, filtering, and calculations
 */

import { normalizeDate, formatCurrency, getDateRange } from '../../statisticsCore.js';

/**
 * Global state for filter panel with persistence
 */
export const globalFilters = JSON.parse(localStorage.getItem('dashboardFilters')) || {
  dateRange: null,
  period: 'current_month', // current_month, last_month, custom
  customStartDate: null,
  customEndDate: null,
  selectedSoftware: [], // Array of selected software names
  compareMode: 'none', // none, previous_period, same_period_last_year
  showAllSoftware: true // Toggle to show all or selected software
};

// Make available globally
window.globalFilters = globalFilters;

/**
 * Save filters to localStorage
 */
export function saveFiltersToStorage() {
  localStorage.setItem('dashboardFilters', JSON.stringify(window.globalFilters));
}

/**
 * Filter data by date range
 * @param {Array} data - Data array to filter
 * @param {Object} dateRange - Date range filter
 * @returns {Array} Filtered data
 */
export function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return data.filter(item => {
    const itemDate = new Date(normalizeDate(item.ngayTao || item.date || item.createdAt));
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Calculate comprehensive financial metrics
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records  
 * @param {Object} filters - Applied filters
 * @returns {Object} Financial metrics object
 */
export function calculateFinancialMetrics(transactionData, expenseData, filters = {}) {
  // Basic revenue calculation
  const totalRevenue = transactionData.reduce((sum, transaction) => {
    return sum + (parseFloat(transaction.revenue) || 0);
  }, 0);

  // Basic expense calculation
  const totalExpenses = expenseData.reduce((sum, expense) => {
    return sum + (parseFloat(expense.soTien || expense.amount) || 0);
  }, 0);

  // Profit calculation
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Revenue breakdown by software
  const revenueByOrgSoftware = calculateRevenueByOrgSoftware(transactionData);
  
  // Expense breakdown by category
  const expensesByCategory = calculateExpensesByCategory(expenseData);
  
  // Monthly trends
  const monthlyData = calculateMonthlyTrends(transactionData, expenseData);
  
  // Cash flow metrics
  const cashFlowMetrics = calculateCashFlowMetrics(transactionData, expenseData);
  
  // Growth metrics
  const growthMetrics = calculateGrowthMetrics(transactionData, expenseData);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueByOrgSoftware,
    expensesByCategory,
    monthlyData,
    cashFlowMetrics,
    growthMetrics,
    transactionCount: transactionData.length,
    expenseCount: expenseData.length
  };
}

/**
 * Calculate revenue breakdown by software organization
 * @param {Array} transactionData - Transaction records
 * @returns {Object} Revenue breakdown by software
 */
export function calculateRevenueByOrgSoftware(transactionData) {
  const revenueMap = {};
  
  transactionData.forEach(transaction => {
    const software = transaction.software || 'Không xác định';
    const revenue = parseFloat(transaction.revenue) || 0;
    
    if (!revenueMap[software]) {
      revenueMap[software] = {
        name: software,
        revenue: 0,
        transactionCount: 0,
        averageValue: 0
      };
    }
    
    revenueMap[software].revenue += revenue;
    revenueMap[software].transactionCount += 1;
  });
  
  // Calculate averages
  Object.values(revenueMap).forEach(software => {
    software.averageValue = software.transactionCount > 0 
      ? software.revenue / software.transactionCount 
      : 0;
  });
  
  return revenueMap;
}

/**
 * Calculate expenses breakdown by category
 * @param {Array} expenseData - Expense records
 * @returns {Object} Expenses breakdown by category
 */
export function calculateExpensesByCategory(expenseData) {
  const categoryMap = {};
  
  expenseData.forEach(expense => {
    const category = expense.loaiChiPhi || expense.category || 'Khác';
    const amount = parseFloat(expense.soTien || expense.amount) || 0;
    
    if (!categoryMap[category]) {
      categoryMap[category] = {
        name: category,
        amount: 0,
        count: 0,
        averageAmount: 0
      };
    }
    
    categoryMap[category].amount += amount;
    categoryMap[category].count += 1;
  });
  
  // Calculate averages
  Object.values(categoryMap).forEach(category => {
    category.averageAmount = category.count > 0 
      ? category.amount / category.count 
      : 0;
  });
  
  return categoryMap;
}

/**
 * Calculate monthly trends for revenue and expenses
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @returns {Object} Monthly trends data
 */
export function calculateMonthlyTrends(transactionData, expenseData) {
  const monthlyRevenue = {};
  const monthlyExpenses = {};
  
  // Process revenue data
  transactionData.forEach(transaction => {
    const date = new Date(normalizeDate(transaction.ngayTao));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const revenue = parseFloat(transaction.revenue) || 0;
    
    if (!monthlyRevenue[monthKey]) {
      monthlyRevenue[monthKey] = 0;
    }
    monthlyRevenue[monthKey] += revenue;
  });
  
  // Process expense data
  expenseData.forEach(expense => {
    const date = new Date(normalizeDate(expense.ngayTao || expense.date));
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = parseFloat(expense.soTien || expense.amount) || 0;
    
    if (!monthlyExpenses[monthKey]) {
      monthlyExpenses[monthKey] = 0;
    }
    monthlyExpenses[monthKey] += amount;
  });
  
  // Combine data by month
  const allMonths = new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyExpenses)]);
  const monthlyData = {};
  
  allMonths.forEach(month => {
    const revenue = monthlyRevenue[month] || 0;
    const expenses = monthlyExpenses[month] || 0;
    
    monthlyData[month] = {
      month,
      revenue,
      expenses,
      profit: revenue - expenses,
      profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
    };
  });
  
  return monthlyData;
}

/**
 * Calculate cash flow metrics
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @returns {Object} Cash flow metrics
 */
export function calculateCashFlowMetrics(transactionData, expenseData) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Recent cash inflows (last 30 days)
  const recentRevenue = transactionData
    .filter(t => new Date(normalizeDate(t.ngayTao)) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  
  // Recent cash outflows (last 30 days)  
  const recentExpenses = expenseData
    .filter(e => new Date(normalizeDate(e.ngayTao || e.date)) >= thirtyDaysAgo)
    .reduce((sum, e) => sum + (parseFloat(e.soTien || e.amount) || 0), 0);
  
  // Weekly cash flow
  const weeklyRevenue = transactionData
    .filter(t => new Date(normalizeDate(t.ngayTao)) >= sevenDaysAgo)
    .reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
    
  const weeklyExpenses = expenseData
    .filter(e => new Date(normalizeDate(e.ngayTao || e.date)) >= sevenDaysAgo)
    .reduce((sum, e) => sum + (parseFloat(e.soTien || e.amount) || 0), 0);
  
  return {
    recentCashInflow: recentRevenue,
    recentCashOutflow: recentExpenses,
    netCashFlow: recentRevenue - recentExpenses,
    weeklyCashFlow: weeklyRevenue - weeklyExpenses,
    burnRate: recentExpenses / 30, // Daily burn rate
    runwayDays: recentRevenue > 0 ? (recentRevenue / (recentExpenses / 30)) : 0
  };
}

/**
 * Calculate growth metrics compared to previous periods
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @returns {Object} Growth metrics
 */
export function calculateGrowthMetrics(transactionData, expenseData) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // Current month data
  const currentMonthRevenue = transactionData
    .filter(t => new Date(normalizeDate(t.ngayTao)) >= currentMonth)
    .reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
    
  const currentMonthExpenses = expenseData
    .filter(e => new Date(normalizeDate(e.ngayTao || e.date)) >= currentMonth)
    .reduce((sum, e) => sum + (parseFloat(e.soTien || e.amount) || 0), 0);
  
  // Last month data
  const lastMonthRevenue = transactionData
    .filter(t => {
      const date = new Date(normalizeDate(t.ngayTao));
      return date >= lastMonth && date <= lastMonthEnd;
    })
    .reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
    
  const lastMonthExpenses = expenseData
    .filter(e => {
      const date = new Date(normalizeDate(e.ngayTao || e.date));
      return date >= lastMonth && date <= lastMonthEnd;
    })
    .reduce((sum, e) => sum + (parseFloat(e.soTien || e.amount) || 0), 0);
  
  // Calculate growth rates
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;
    
  const expenseGrowth = lastMonthExpenses > 0
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0;
  
  return {
    currentMonthRevenue,
    lastMonthRevenue,
    currentMonthExpenses,
    lastMonthExpenses,
    revenueGrowth,
    expenseGrowth,
    profitGrowth: (currentMonthRevenue - currentMonthExpenses) - (lastMonthRevenue - lastMonthExpenses)
  };
}