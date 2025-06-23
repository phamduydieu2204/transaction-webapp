/**
 * categoryDataProcessors.js
 * 
 * Data processing functions for expense categories
 * Handles data grouping, calculations, and transformations
 */

import { normalizeDate } from '../statisticsCore.js';

/**
 * Define main categories with configuration
 * @returns {Object} Main categories configuration
 */
export function getMainCategories() {
  return {
    'Kinh doanh phần mềm': { color: '#667eea', icon: '💻' },
    'Sinh hoạt cá nhân': { color: '#f093fb', icon: '🏠' },
    'Kinh doanh Amazon': { color: '#4facfe', icon: '📦' },
    'Khác': { color: '#fa709a', icon: '📌' }
  };
}

/**
 * Calculate expense data by category for last 12 months
 * @param {Array} expenseData - Expense records
 * @returns {Object} Category data for chart
 */
export function calculateExpenseByCategoryData(expenseData) {
  const categoryData = {};
  const monthlyData = {};
  const today = new Date();
  const mainCategories = getMainCategories();
  
  // Initialize data structures
  Object.keys(mainCategories).forEach(category => {
    categoryData[category] = {
      total: 0,
      monthly: {},
      subCategories: {}
    };
  });
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = {
      month: monthKey,
      monthLabel: `${date.getMonth() + 1}/${date.getFullYear()}`,
      ...Object.keys(mainCategories).reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
      }, {}),
      total: 0
    };
  }
  
  // Process expense data
  expenseData.forEach(expense => {
    processExpenseItem(expense, categoryData, monthlyData);
  });
  
  return {
    categories: categoryData,
    monthly: Object.values(monthlyData),
    mainCategories
  };
}

/**
 * Process individual expense item
 * @param {Object} expense - Expense record
 * @param {Object} categoryData - Category data accumulator
 * @param {Object} monthlyData - Monthly data accumulator
 */
function processExpenseItem(expense, categoryData, monthlyData) {
  const expenseDate = new Date(normalizeDate(expense.date));
  const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
  const amount = parseFloat(expense.amount) || 0;
  const type = expense.type || 'Khác';
  const subCategory = expense.category || 'Khác';
  
  // Map to main category
  const mainCategory = mapToMainCategory(type);
  
  // Add to category total
  if (categoryData[mainCategory]) {
    categoryData[mainCategory].total += amount;
    
    // Add to subcategory
    if (!categoryData[mainCategory].subCategories[subCategory]) {
      categoryData[mainCategory].subCategories[subCategory] = 0;
    }
    categoryData[mainCategory].subCategories[subCategory] += amount;
    
    // Add to monthly data
    if (monthlyData[monthKey]) {
      monthlyData[monthKey][mainCategory] += amount;
      monthlyData[monthKey].total += amount;
      
      if (!categoryData[mainCategory].monthly[monthKey]) {
        categoryData[mainCategory].monthly[monthKey] = 0;
      }
      categoryData[mainCategory].monthly[monthKey] += amount;
    }
  }
}

/**
 * Map expense type to main category
 * @param {string} type - Expense type
 * @returns {string} Main category name
 */
function mapToMainCategory(type) {
  if (type.includes('Sinh hoạt') || type.includes('cá nhân')) {
    return 'Sinh hoạt cá nhân';
  } else if (type.includes('phần mềm') || type.includes('software')) {
    return 'Kinh doanh phần mềm';
  } else if (type.includes('Amazon')) {
    return 'Kinh doanh Amazon';
  }
  return 'Khác';
}

/**
 * Calculate category statistics
 * @param {Object} categoryData - Processed category data
 * @returns {Object} Category statistics
 */
export function calculateCategoryStats(categoryData) {
  const stats = {
    totalExpense: 0,
    avgMonthlyExpense: 0,
    topCategory: null,
    topSubCategories: [],
    categoryPercentages: {},
    monthlyTrend: []
  };
  
  // Calculate total expense
  stats.totalExpense = Object.values(categoryData.categories)
    .reduce((sum, cat) => sum + cat.total, 0);
  
  // Calculate average monthly expense
  stats.avgMonthlyExpense = stats.totalExpense / 12;
  
  // Find top category
  const sortedCategories = Object.entries(categoryData.categories)
    .sort((a, b) => b[1].total - a[1].total);
  
  if (sortedCategories.length > 0) {
    stats.topCategory = {
      name: sortedCategories[0][0],
      amount: sortedCategories[0][1].total
    };
  }
  
  // Calculate category percentages
  Object.entries(categoryData.categories).forEach(([category, data]) => {
    stats.categoryPercentages[category] = stats.totalExpense > 0 
      ? (data.total / stats.totalExpense) * 100 
      : 0;
  });
  
  // Get top subcategories across all categories
  const allSubCategories = [];
  Object.entries(categoryData.categories).forEach(([category, data]) => {
    Object.entries(data.subCategories).forEach(([subCat, amount]) => {
      allSubCategories.push({
        category,
        subCategory: subCat,

    });
  });
  
  stats.topSubCategories = allSubCategories
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  
  // Calculate monthly trend
  stats.monthlyTrend = calculateMonthlyTrend(categoryData.monthly);
  
  return stats;
}

/**
 * Calculate monthly trend data
 * @param {Array} monthlyData - Monthly expense data
 * @returns {Array} Monthly trend analysis
 */
function calculateMonthlyTrend(monthlyData) {
  const trend = [];
  
  monthlyData.forEach((month, index) => {
    const prevMonth = index > 0 ? monthlyData[index - 1] : null;
    const growth = prevMonth 
      ? ((month.total - prevMonth.total) / prevMonth.total) * 100 
      : 0;
    
    trend.push({
      month: month.monthLabel,
      total: month.total,
      growth: growth,
      isIncrease: growth > 0
    });
  });
  
  return trend;
}

/**
 * Group expenses by time period
 * @param {Array} expenseData - Expense records
 * @param {string} period - Time period (daily, weekly, monthly, quarterly)
 * @returns {Object} Grouped expense data
 */
export function groupExpensesByPeriod(expenseData, period = 'monthly') {
  const grouped = {};
  const mainCategories = getMainCategories();
  
  expenseData.forEach(expense => {
    const date = new Date(normalizeDate(expense.date));
    const periodKey = getPeriodKey(date, period);
    const amount = parseFloat(expense.amount) || 0;
    const mainCategory = mapToMainCategory(expense.type || 'Khác');
    
    if (!grouped[periodKey]) {
      grouped[periodKey] = {
        period: periodKey,
        total: 0,
        ...Object.keys(mainCategories).reduce((acc, cat) => {
          acc[cat] = 0;
          return acc;
        }, {})
      };
    }
    
    grouped[periodKey].total += amount;
    grouped[periodKey][mainCategory] += amount;
  });
  
  return grouped;
}

/**
 * Get period key based on date and period type
 * @param {Date} date - Date object
 * @param {string} period - Period type
 * @returns {string} Period key
 */
function getPeriodKey(date, period) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      const weekNum = getWeekNumber(date);
      return `${year}-W${String(weekNum).padStart(2, '0')}`;
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    case 'monthly':
    default:
      return `${year}-${month}`;
  }
}

/**
 * Get week number of the year
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}