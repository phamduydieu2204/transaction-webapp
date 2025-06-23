/**
 * dataAnalytics.js
 * 
 * Business data analytics and calculations
 * Handles metrics calculation, data filtering, and KPI computation
 */

import { normalizeDate } from '../statisticsCore.js';

/**
 * Calculate comprehensive business metrics
 */
export function calculateBusinessMetrics(transactionData, expenseData, dateRange) {
  
  // Basic financial metrics
  const totalRevenue = calculateTotalRevenue(transactionData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Revenue analysis
  const revenueBySource = calculateRevenueBySource(transactionData);
  const revenueByPeriod = calculateRevenueByPeriod(transactionData, dateRange);
  const averageOrderValue = transactionData.length > 0 ? totalRevenue / transactionData.length : 0;
  
  // Cost analysis
  const expensesByCategory = calculateExpensesByCategory(expenseData);
  const operatingExpenses = calculateOperatingExpenses(expenseData);
  const costOfRevenue = calculateCostOfRevenue(expenseData);
  
  // Accounting type breakdown
  const accountingBreakdown = calculateAccountingBreakdown(expenseData);
  
  // Growth metrics
  const growthMetrics = calculateGrowthMetrics(transactionData, expenseData, dateRange);
  
  // Efficiency metrics
  const efficiencyMetrics = calculateEfficiencyMetrics(transactionData, expenseData);
  
  // Cash flow metrics
  const cashFlowMetrics = calculateCashFlowMetrics(transactionData, expenseData, dateRange);
  
  return {
    financial: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      grossProfit: totalRevenue - costOfRevenue,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - costOfRevenue) / totalRevenue) * 100 : 0
    },
    revenue: {
      bySource: revenueBySource,
      byPeriod: revenueByPeriod,
      averageOrderValue,
      totalTransactions: transactionData.length
    },
    costs: {
      byCategory: expensesByCategory,
      operating: operatingExpenses,
      costOfRevenue,
      costPerTransaction: transactionData.length > 0 ? totalExpenses / transactionData.length : 0,
      accountingBreakdown: accountingBreakdown
    },
    growth: growthMetrics,
    efficiency: efficiencyMetrics,
    cashFlow: cashFlowMetrics,
    kpis: {
      revenuePerDay: calculateRevenuePerDay(transactionData, dateRange),
      burnRate: calculateBurnRate(expenseData, dateRange),
      runway: calculateRunway(netProfit, totalExpenses, dateRange)
    }
  };
}

/**
 * Calculate total revenue
 */
export function calculateTotalRevenue(transactionData) {
  return transactionData.reduce((total, transaction) => {
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    // Skip invalid amounts
    if (isNaN(amount) || amount === null || amount === undefined) {
      return total;
    }
    return total + amount;
  }, 0);
}

/**
 * Calculate total expenses
 */
export function calculateTotalExpenses(expenseData) {
  return expenseData.reduce((total, expense) => {
    const amount = parseFloat(expense.amount || 0);
    // Skip invalid amounts
    if (isNaN(amount) || amount === null || amount === undefined) {
      return total;
    }
    return total + amount;
  }, 0);
}

/**
 * Calculate revenue by source (software) using Tên chuẩn
 */
export function calculateRevenueBySource(transactionData) {
  const bySource = {};
  
  transactionData.forEach(transaction => {
    // Use Tên chuẩn if available, otherwise fall back to software name
    const source = transaction.tenChuan || transaction.softwareName || 'Khác';
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    bySource[source] = (bySource[source] || 0) + amount;
  });
  
  // Convert to array and sort by amount
  return Object.entries(bySource)
    .map(([source, amount]) => ({ source, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate revenue by time period (daily/weekly/monthly)
 */
export function calculateRevenueByPeriod(transactionData, dateRange) {
  const byPeriod = {};
  
  transactionData.forEach(transaction => {
    const date = normalizeDate(transaction.transactionDate || transaction.date);
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    
    if (date) {
      byPeriod[date] = (byPeriod[date] || 0) + amount;
    }
  });
  
  return byPeriod;
}

/**
 * Calculate expenses by category using Tên chuẩn for better grouping
 */
export function calculateExpensesByCategory(expenseData) {
  const categories = {};
  
  expenseData.forEach(expense => {
    // Skip non-related expenses if accounting type is available
    if (expense.accountingType && expense.accountingType === 'Không liên quan') {
      categories['Sinh hoạt cá nhân'] = (categories['Sinh hoạt cá nhân'] || 0) + parseFloat(expense.amount || 0);
      return;
    }
    
    const amount = parseFloat(expense.amount || 0);
    
    // Use Tên chuẩn for categorization if available
    if (expense.standardName || expense.tenChuan) {
      const categoryName = expense.standardName || expense.tenChuan;
      categories[categoryName] = (categories[categoryName] || 0) + amount;
    } else {
      // Fallback to original logic
      const type = expense.type || 'Khác';
      const category = expense.category || 'Khác';
      
      let assignedCategory = 'Khác';
      if (type.includes('phần mềm') || category.includes('phần mềm')) {
        assignedCategory = 'Kinh doanh phần mềm';
      } else if (type.includes('cá nhân') || type.includes('Sinh hoạt')) {
        assignedCategory = 'Sinh hoạt cá nhân';
      } else if (type.includes('Amazon') || category.includes('Amazon')) {
        assignedCategory = 'Kinh doanh Amazon';
      } else if (category.includes('Marketing') || category.includes('Quảng cáo')) {
        assignedCategory = 'Marketing & Quảng cáo';
      } else if (category.includes('Vận hành') || category.includes('Operational')) {
        assignedCategory = 'Vận hành';
      }
      
      categories[assignedCategory] = (categories[assignedCategory] || 0) + amount;
    }
  });
  
  return Object.entries(categories)
    .map(([category, amount]) => ({ category, amount }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate operating expenses
 */
export function calculateOperatingExpenses(expenseData) {
  return expenseData
    .filter(expense => {
      // Use accounting type if available
      if (expense.accountingType) {
        return expense.accountingType === 'OPEX';
      }
      
      // Fallback to old logic if no accounting type
      const type = expense.type || '';
      const category = expense.category || '';
      // Exclude personal expenses from both type and category fields
      return !type.includes('cá nhân') && !type.includes('Sinh hoạt') && 
             !category.includes('cá nhân') && !category.includes('Sinh hoạt');
    })
    .reduce((total, expense) => {
      const amount = parseFloat(expense.amount || 0);
      // Skip invalid amounts
      if (isNaN(amount) || amount === null || amount === undefined) {
        return total;
      }
      return total + amount;
    }, 0);
}

/**
 * Calculate cost of revenue
 */
export function calculateCostOfRevenue(expenseData) {
  return expenseData
    .filter(expense => {
      // Use accounting type if available
      if (expense.accountingType) {
        return expense.accountingType === 'COGS';
      }
      
      // Fallback to old logic if no accounting type
      const category = expense.category || '';
      return category.includes('phần mềm') || category.includes('Amazon') || category.includes('COGS');
    })
    .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
}

/**
 * Calculate accounting type breakdown
 */
export function calculateAccountingBreakdown(expenseData) {
  const breakdown = {
    'COGS': 0,
    'OPEX': 0,
    'Không liên quan': 0
  };
  
  expenseData.forEach(expense => {
    const amount = parseFloat(expense.amount || 0);
    const accountingType = expense.accountingType || determineAccountingTypeFromData(expense);
    
    if (breakdown.hasOwnProperty(accountingType)) {
      breakdown[accountingType] += amount;
    } else {
      // Default to OPEX if unknown
      breakdown['OPEX'] += amount;
    }
  });
  
  return breakdown;
}

/**
 * Determine accounting type from expense data (fallback)
 */
function determineAccountingTypeFromData(expense) {
  const type = expense.type || '';
  const category = expense.category || '';
  
  // Non-related
  if (type.includes('cá nhân') || type.includes('Sinh hoạt')) {
    return 'Không liên quan';
  }
  
  // COGS
  if (category.includes('phần mềm') || category.includes('Amazon') || category.includes('COGS')) {
    return 'COGS';
  }
  
  // Default to OPEX
  return 'OPEX';
}

/**
 * Calculate growth metrics
 */
export function calculateGrowthMetrics(transactionData, expenseData, dateRange) {
  // Calculate current period metrics
  const currentRevenue = calculateTotalRevenue(transactionData);
  const currentExpenses = calculateTotalExpenses(expenseData);
  const currentProfit = currentRevenue - currentExpenses;
  const currentTransactionCount = transactionData.length;
  
  // Calculate growth by comparing current month vs previous month
  let revenueGrowth = 0;
  let expenseGrowth = 0;
  let profitGrowth = 0;
  let transactionGrowth = 0;
  
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter current month data
    const currentMonthTransactions = transactionData.filter(t => {
      const date = new Date(t.transactionDate || t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const currentMonthExpenses = expenseData.filter(e => {
      const date = new Date(e.date || e.transactionDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Filter previous month data
    const prevMonthTransactions = transactionData.filter(t => {
      const date = new Date(t.transactionDate || t.date);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });
    
    const prevMonthExpenses = expenseData.filter(e => {
      const date = new Date(e.date || e.transactionDate);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });
    
    // Calculate metrics for both periods
    const currentMonthRevenue = calculateTotalRevenue(currentMonthTransactions);
    const currentMonthExpenseTotal = calculateTotalExpenses(currentMonthExpenses);
    const currentMonthProfit = currentMonthRevenue - currentMonthExpenseTotal;
    
    const prevMonthRevenue = calculateTotalRevenue(prevMonthTransactions);
    const prevMonthExpenseTotal = calculateTotalExpenses(prevMonthExpenses);
    const prevMonthProfit = prevMonthRevenue - prevMonthExpenseTotal;
    
    // Calculate growth percentages
    if (prevMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    }
    
    if (prevMonthExpenseTotal > 0) {
      expenseGrowth = ((currentMonthExpenseTotal - prevMonthExpenseTotal) / prevMonthExpenseTotal) * 100;
    }
    
    if (prevMonthProfit !== 0) {
      profitGrowth = ((currentMonthProfit - prevMonthProfit) / Math.abs(prevMonthProfit)) * 100;
    }
    
    if (prevMonthTransactions.length > 0) {
      transactionGrowth = ((currentMonthTransactions.length - prevMonthTransactions.length) / prevMonthTransactions.length) * 100;
    }
    
  } catch (error) {
    console.warn('⚠️ Error calculating growth metrics:', error);
  }
  
  return {
    revenueGrowth: isFinite(revenueGrowth) ? revenueGrowth : 0,
    expenseGrowth: isFinite(expenseGrowth) ? expenseGrowth : 0,
    profitGrowth: isFinite(profitGrowth) ? profitGrowth : 0,
    transactionGrowth: isFinite(transactionGrowth) ? transactionGrowth : 0,
    // Add current values for reference
    currentRevenue,
    currentExpenses,
    currentProfit,
    currentTransactionCount
  };
}

/**
 * Calculate efficiency metrics
 */
export function calculateEfficiencyMetrics(transactionData, expenseData) {
  const totalRevenue = calculateTotalRevenue(transactionData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  const operatingExpenses = calculateOperatingExpenses(expenseData);
  
  return {
    revenuePerEmployee: totalRevenue, // TODO: Divide by employee count
    costEfficiencyRatio: totalRevenue > 0 ? (operatingExpenses / totalRevenue) * 100 : 0,
    productivityIndex: transactionData.length > 0 ? totalRevenue / transactionData.length : 0
  };
}

/**
 * Calculate cash flow metrics
 */
export function calculateCashFlowMetrics(transactionData, expenseData, dateRange) {
  const totalRevenue = calculateTotalRevenue(transactionData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  
  return {
    netCashFlow: totalRevenue - totalExpenses,
    operatingCashFlow: totalRevenue - calculateOperatingExpenses(expenseData),
    freeCashFlow: totalRevenue - totalExpenses // Simplified
  };
}

/**
 * Calculate revenue per day
 */
export function calculateRevenuePerDay(transactionData, dateRange) {
  const totalRevenue = calculateTotalRevenue(transactionData);
  
  if (!dateRange || !dateRange.start || !dateRange.end) {
    // If no date range, calculate based on actual data span
    if (transactionData.length === 0) return 0;
    
    const dates = transactionData
      .map(t => new Date(t.transactionDate || t.date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);
    
    if (dates.length === 0) return totalRevenue;
    
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return daysDiff > 0 ? totalRevenue / daysDiff : totalRevenue;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  return daysDiff > 0 ? totalRevenue / daysDiff : totalRevenue;
}

/**
 * Calculate burn rate
 */
export function calculateBurnRate(expenseData, dateRange) {
  const operatingExpenses = calculateOperatingExpenses(expenseData);
  
  if (!dateRange || !dateRange.start || !dateRange.end) {
    // If no date range, calculate based on actual data span
    if (expenseData.length === 0) return 0;
    
    const dates = expenseData
      .map(e => new Date(e.date || e.transactionDate))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);
    
    if (dates.length === 0) return operatingExpenses;
    
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return daysDiff > 0 ? operatingExpenses / daysDiff : operatingExpenses;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  return daysDiff > 0 ? operatingExpenses / daysDiff : operatingExpenses;
}

/**
 * Calculate runway (months of operation)
 */
export function calculateRunway(netProfit, totalExpenses, dateRange) {
  if (netProfit >= 0) {
    return Infinity; // Profitable
  }
  
  // Calculate monthly burn rate based on date range
  let monthlyBurn = totalExpenses;
  
  if (dateRange && dateRange.start && dateRange.end) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Convert to monthly rate (30 days average)
    monthlyBurn = (totalExpenses / daysDiff) * 30;
  }
  
  // Simplified assumption for current cash
  const currentCash = Math.abs(netProfit);
  
  return monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
}

/**
 * Filter data by date range
 */
export function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return data.filter(item => {
    const dateField = item.transactionDate || item.date || item.timestamp;
    if (!dateField) return false;
    
    const itemDate = new Date(dateField);
    return itemDate >= startDate && itemDate <= endDate;
  });
}