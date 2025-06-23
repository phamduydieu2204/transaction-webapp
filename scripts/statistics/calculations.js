/**
 * calculations.js
 * 
 * Core calculation functions for statistics
 * Handles revenue/expense calculations, growth metrics, and financial analysis
 */

import { normalizeDate } from './dataUtilities.js';

/**
 * Calculates total expenses with filtering options
 * @param {Array} data - Array of expense records
 * @param {Object} options - Calculation options
 * @returns {Object} - Calculated totals by currency
 */
export function calculateTotalExpenses(data, options = {}) {
  const {
    isSearching = false,
    targetDate = null,
    currency = null,
    dateRange = null
  } = options;

  const totals = {
    VND: 0,
    USD: 0,
    NGN: 0
  };

  if (!Array.isArray(data)) return totals;

    recordCount: data.length,
    isSearching,
    targetDate,
    currency
  });

  data.forEach(expense => {
    const expenseCurrency = expense.currency || "VND";
    const amount = parseFloat(expense.amount) || 0;
    
    // Skip if specific currency filter is set and doesn't match
    if (currency && expenseCurrency !== currency) return;

    // If searching, include all results
    if (isSearching) {
      totals[expenseCurrency] += amount;
      return;
    }

    // If target date is specified, filter by date
    if (targetDate) {
      const normalizedDate = normalizeDate(expense.date);
      if (normalizedDate === targetDate) {
        totals[expenseCurrency] += amount;
      }
      return;
    }

    // If date range is specified
    if (dateRange && dateRange.start && dateRange.end) {
      const normalizedDate = normalizeDate(expense.date);
      if (normalizedDate >= dateRange.start && normalizedDate <= dateRange.end) {
        totals[expenseCurrency] += amount;
      }
      return;
    }

    // Default: include all
    totals[expenseCurrency] += amount;
  });

  return totals;
}

/**
 * Calculates total revenue with filtering options
 * @param {Array} data - Array of transaction records
 * @param {Object} options - Calculation options
 * @returns {Object} - Calculated totals by currency
 */
export function calculateTotalRevenue(data, options = {}) {
  const {
    isSearching = false,
    targetDate = null,
    currency = null,
    dateRange = null,
    userRole = null
  } = options;

  const totals = {
    VND: 0,
    USD: 0,
    NGN: 0
  };

  if (!Array.isArray(data)) return totals;

    recordCount: data.length,
    isSearching,
    targetDate,
    currency,
    userRole
  });

  data.forEach(transaction => {
    const transactionCurrency = transaction.currency || "VND";
    const revenue = parseFloat(transaction.revenue) || 0;
    
    // Skip if specific currency filter is set and doesn't match
    if (currency && transactionCurrency !== currency) return;

    // Apply user role filtering if needed
    if (userRole && userRole !== "admin") {
      // Add role-based filtering logic here
    }

    // If searching, include all results
    if (isSearching) {
      totals[transactionCurrency] += revenue;
      return;
    }

    // If target date is specified, filter by date
    if (targetDate) {
      const normalizedDate = normalizeDate(transaction.transactionDate);
      if (normalizedDate === targetDate) {
        totals[transactionCurrency] += revenue;
      }
      return;
    }

    // If date range is specified
    if (dateRange && dateRange.start && dateRange.end) {
      const normalizedDate = normalizeDate(transaction.transactionDate);
      if (normalizedDate >= dateRange.start && normalizedDate <= dateRange.end) {
        totals[transactionCurrency] += revenue;
      }
      return;
    }

    // Default: include all
    totals[transactionCurrency] += revenue;
  });

  return totals;
}

/**
 * Calculates profit margins and financial ratios
 * @param {Object} revenue - Revenue totals by currency
 * @param {Object} expenses - Expense totals by currency
 * @returns {Object} - Financial analysis results
 */
export function calculateFinancialAnalysis(revenue, expenses) {
  const analysis = {
    profit: {},
    profitMargin: {},
    expenseRatio: {},
    summary: {}
  };

  const currencies = ["VND", "USD", "NGN"];

  currencies.forEach(currency => {
    const rev = revenue[currency] || 0;
    const exp = expenses[currency] || 0;
    
    analysis.profit[currency] = rev - exp;
    analysis.profitMargin[currency] = rev > 0 ? ((rev - exp) / rev) * 100 : 0;
    analysis.expenseRatio[currency] = rev > 0 ? (exp / rev) * 100 : 0;
  });

  // Overall summary
  const totalRevenue = currencies.reduce((sum, curr) => sum + (revenue[curr] || 0), 0);
  const totalExpenses = currencies.reduce((sum, curr) => sum + (expenses[curr] || 0), 0);
  
  analysis.summary = {
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    overallMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
  };

  return analysis;
}

/**
 * Calculates growth rates between periods
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous period value
 * @returns {Object} - Growth rate information
 */
export function calculateGrowthRate(currentValue, previousValue) {
  const current = parseFloat(currentValue) || 0;
  const previous = parseFloat(previousValue) || 0;

  if (previous === 0) {
    return {
      rate: current > 0 ? 100 : 0,
      direction: current > 0 ? "up" : "neutral",
      isNew: true
    };
  }

  const rate = ((current - previous) / previous) * 100;
  
  return {
    rate: Math.abs(rate),
    direction: rate > 0 ? "up" : rate < 0 ? "down" : "neutral",
    isNew: false
  };
}

/**
 * Calculate allocated expense for a period based on software validity period
 * Logic: If expense has Phân bổ = Có and valid Ngày giao dịch + Ngày tái tục,
 * divide the cost evenly across the validity period.
 * Only count the portion that falls within the target period.
 * @param {Object} expense - Expense record
 * @param {Object} dateRange - Date range for allocation calculation
 * @returns {number} - Allocated amount for the period
 */
export function calculateAllocatedExpense(expense, dateRange) {
  // Debug: Log full expense object for Helium10 or salary payments
  if ((expense.product && (expense.product.includes('Helium10') || expense.product.includes('Trả lương'))) || 
      (expense.description && (expense.description.includes('Helium10') || expense.description.includes('Trả lương'))) ||
      (expense['Tên sản phẩm/Dịch vụ'] && expense['Tên sản phẩm/Dịch vụ'].includes('Trả lương'))) {
      fullExpense: expense,
      keys: Object.keys(expense),
      periodicAllocation: expense.periodicAllocation,
      'Phân bổ': expense['Phân bổ'],
      renewDate: expense.renewDate,
      'Ngày tái tục': expense['Ngày tái tục'],
      date: expense.date,
      'Ngày chi': expense['Ngày chi'],
      amount: expense.amount,
      'Số tiền': expense['Số tiền']
    });
  }
  
  // Check multiple possible field names for allocation
  const allocationValue = expense.periodicAllocation || expense['Phân bổ'] || expense.allocation;
  
  // If no allocation needed, return 0
  if (!allocationValue || (allocationValue !== 'Có' && allocationValue !== 'Có')) {
      periodicAllocation: expense.periodicAllocation,
      'Phân bổ': expense['Phân bổ'],
      allocation: expense.allocation,
      allocationValue: allocationValue,
      reason: 'allocation field not "Có"'
    return 0;
  }
  
  // Parse dates - both transaction date and renewal date are required
  // Check multiple possible field names for dates
  const dateValue = expense.date || expense['Ngày chi'] || expense.transactionDate;
  const renewDateValue = expense.renewDate || expense['Ngày tái tục'] || expense.renewalDate;
  
  const transactionDate = dateValue ? new Date(normalizeDate(dateValue)) : null;
  const renewalDate = renewDateValue ? new Date(normalizeDate(renewDateValue)) : null;
  
    originalDate: expense.date,
    'Ngày chi': expense['Ngày chi'],
    dateValue,
    originalRenewDate: expense.renewDate,
    'Ngày tái tục': expense['Ngày tái tục'],
    renewDateValue,
    parsedTransactionDate: transactionDate,
    parsedRenewalDate: renewalDate
  
  // Must have both dates for allocation
  if (!transactionDate || !renewalDate || renewalDate <= transactionDate) {
      transactionDate: dateValue,
      renewalDate: renewDateValue,
      parsedTransactionDate: transactionDate,
      parsedRenewalDate: renewalDate,
      reason: !transactionDate ? 'No transaction date' : 
             !renewalDate ? 'No renewal date' : 
             'Renewal date <= transaction date'
    });
    return 0;
  }
  
  // Calculate total validity period in days (inclusive of both start and end dates)
  const totalValidityDays = Math.ceil((renewalDate - transactionDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate daily amount - check multiple field names
  const amountValue = expense.amount || expense['Số tiền'] || 0;
  const totalAmount = parseFloat(amountValue) || 0;
  
    originalAmount: expense.amount,
    'Số tiền': expense['Số tiền'],
    amountValue,
    totalAmount,
    totalValidityDays
  });
  const dailyAmount = totalAmount / totalValidityDays;
  
  // If no date range specified, return amount for current month
  if (!dateRange || !dateRange.start || !dateRange.end) {
    // Default to current month
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    dateRange = {
      start: normalizeDate(monthStart),
      end: normalizeDate(monthEnd)
    };
  }
  
  // Parse target period
  const periodStart = new Date(normalizeDate(dateRange.start));
  const periodEnd = new Date(normalizeDate(dateRange.end));
  
  // Calculate overlap between validity period and target period
  const overlapStart = new Date(Math.max(periodStart, transactionDate));
  const overlapEnd = new Date(Math.min(periodEnd, renewalDate));
  
  // Special handling for monthly salary payments
  if (expense.product && expense.product.includes('Trả lương') || 
      expense['Tên sản phẩm/Dịch vụ'] && expense['Tên sản phẩm/Dịch vụ'].includes('Trả lương')) {
      transactionDate: normalizeDate(transactionDate),
      renewalDate: normalizeDate(renewalDate),
      periodStart: normalizeDate(periodStart),
      periodEnd: normalizeDate(periodEnd),
      overlapStart: normalizeDate(overlapStart),
      overlapEnd: normalizeDate(overlapEnd),
      'transactionDate.getTime()': transactionDate.getTime(),
      'renewalDate.getTime()': renewalDate.getTime(),
      'diff in ms': renewalDate.getTime() - transactionDate.getTime(),
      'diff in days (raw)': (renewalDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
    });
  }
  
  // If no overlap, return 0
  if (overlapStart > overlapEnd) {
    return 0;
  }
  
  // Calculate days that software is valid within the target period
  // Note: We add 1 because both start and end dates are inclusive
  const validDaysInPeriod = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
  
  // Return allocated amount for the overlapping period
  const allocatedAmount = dailyAmount * validDaysInPeriod;
  
    expense: expense.product || expense.description,
    totalAmount,
    transactionDate: normalizeDate(transactionDate),
    renewalDate: normalizeDate(renewalDate),
    totalValidityDays,
    dailyAmount: dailyAmount.toFixed(2),
    periodRange: `${dateRange.start} to ${dateRange.end}`,
    overlapStart: normalizeDate(overlapStart),
    overlapEnd: normalizeDate(overlapEnd),
    validDaysInPeriod,
    calculation: `${dailyAmount.toFixed(2)} × ${validDaysInPeriod} days`,
    allocatedAmount: allocatedAmount.toFixed(2)
  
  return allocatedAmount;
}

/**
 * Calculate actual expense for cash flow analysis
 * Logic: Only count expenses that were actually paid in the target period
 * @param {Object} expense - Expense record  
 * @param {Object} dateRange - Date range for cash flow calculation
 * @returns {number} - Actual expense amount if paid in period, 0 otherwise
 */
export function calculateActualExpense(expense, dateRange) {
  const expenseDate = expense.date ? new Date(normalizeDate(expense.date)) : null;
  
  if (!expenseDate) return 0;
  
  // If no date range specified, use current month
  if (!dateRange || !dateRange.start || !dateRange.end) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    dateRange = {
      start: normalizeDate(monthStart),
      end: normalizeDate(monthEnd)
    };
  }
  
  const periodStart = new Date(normalizeDate(dateRange.start));
  const periodEnd = new Date(normalizeDate(dateRange.end));
  
  // Only count if expense was paid within the period
  if (expenseDate >= periodStart && expenseDate <= periodEnd) {
    const amount = parseFloat(expense.amount) || 0;
    
      expense: expense.product || expense.description,
      expenseDate: normalizeDate(expenseDate),
      periodRange: `${dateRange.start} to ${dateRange.end}`,
      amount,
      included: true
    
    return amount;
  }
  
  return 0;
}

/**
 * Calculate monthly allocated expenses for current month
 * This function calculates the portion of each expense that should be allocated to the current month
 * based on the software's validity period
 * @param {Array} expenses - Array of expense records
 * @param {Object} targetMonth - Target month {year, month} or null for current month
 * @returns {Object} - Summary of allocated vs actual expenses
 */
export function calculateMonthlyExpenseBreakdown(expenses, targetMonth = null) {
  if (!targetMonth) {
    const now = new Date();
    targetMonth = {
      year: now.getFullYear(),
      month: now.getMonth() + 1 // 1-indexed
    };
  }
  
  // Create date range for target month
  const monthStart = new Date(targetMonth.year, targetMonth.month - 1, 1);
  const monthEnd = new Date(targetMonth.year, targetMonth.month, 0);
  
  const dateRange = {
    start: normalizeDate(monthStart),
    end: normalizeDate(monthEnd)
  };
  
  const breakdown = {
    targetMonth: `${targetMonth.year}/${String(targetMonth.month).padStart(2, '0')}`,
    totalAllocatedExpense: 0,    // Chi phí phân bổ tháng
    totalActualExpense: 0,       // Chi phí thực tế
    allocatedDetails: [],        // Chi tiết phân bổ
    actualDetails: [],           // Chi tiết thực tế
    currencyBreakdown: {
      VND: { allocated: 0, actual: 0 },
      USD: { allocated: 0, actual: 0 },
      NGN: { allocated: 0, actual: 0 }
    }
  };
  
  expenses.forEach(expense => {
    const currency = expense.currency || 'VND';
    
    // Calculate allocated amount for the month
    const allocatedAmount = calculateAllocatedExpense(expense, dateRange);
    if (allocatedAmount > 0) {
      breakdown.currencyBreakdown[currency].allocated += allocatedAmount;
      breakdown.allocatedDetails.push({
        product: expense.product || expense.description,
        amount: allocatedAmount,
        currency: currency,
        isAllocated: true,
        originalAmount: parseFloat(expense.amount) || 0,
        transactionDate: expense.date,
        renewDate: expense.renewDate
      });
    }
    
    // Calculate actual amount paid in the month
    const actualAmount = calculateActualExpense(expense, dateRange);
    if (actualAmount > 0) {
      breakdown.currencyBreakdown[currency].actual += actualAmount;
      breakdown.actualDetails.push({
        product: expense.product || expense.description,
        amount: actualAmount,
        currency: currency,
        isPaid: true,
        transactionDate: expense.date
      });
    }
  });
  
  // Convert everything to VND for totals
  const convertToVND = (amount, currency) => {
    if (currency === 'USD') return amount * 25000;
    if (currency === 'NGN') return amount * 50;
    return amount;
  };
  
  Object.keys(breakdown.currencyBreakdown).forEach(currency => {
    const currData = breakdown.currencyBreakdown[currency];
    breakdown.totalAllocatedExpense += convertToVND(currData.allocated, currency);
    breakdown.totalActualExpense += convertToVND(currData.actual, currency);
  });
  
    totalAllocated: breakdown.totalAllocatedExpense,
    totalActual: breakdown.totalActualExpense,
    allocatedCount: breakdown.allocatedDetails.length,
    actualCount: breakdown.actualDetails.length
  
  return breakdown;
}

// Make functions available globally for backward compatibility
window.calculateTotalExpenses = calculateTotalExpenses;
window.calculateTotalRevenue = calculateTotalRevenue;
window.calculateFinancialAnalysis = calculateFinancialAnalysis;
window.calculateGrowthRate = calculateGrowthRate;
window.calculateAllocatedExpense = calculateAllocatedExpense;
window.calculateActualExpense = calculateActualExpense;
window.calculateMonthlyExpenseBreakdown = calculateMonthlyExpenseBreakdown;