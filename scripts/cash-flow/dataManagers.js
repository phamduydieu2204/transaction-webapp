/**
 * dataManagers.js
 * Data fetching và processing cho cash flow reports
 */

/**
 * Fetch expense data for cash flow reports
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} Expense data array
 */
export async function fetchExpenseData(options = {}) {
  const {
    dateRange = null,
    categories = null,
    minAmount = null,
    maxAmount = null
  } = options;
  
  try {
    // In a real application, this would fetch from an API
    // For now, we'll simulate with local data
    const allExpenses = await getLocalExpenseData();
    
    // Apply filters
    let filteredExpenses = allExpenses;
    
    if (dateRange && dateRange.start && dateRange.end) {
      filteredExpenses = filterByDateRange(filteredExpenses, dateRange);
    }
    
    if (categories && categories.length > 0) {
      filteredExpenses = filterByCategories(filteredExpenses, categories);
    }
    
    if (minAmount !== null || maxAmount !== null) {
      filteredExpenses = filterByAmount(filteredExpenses, minAmount, maxAmount);
    }
    
    return filteredExpenses;
  } catch (error) {
    console.error('❌ Error fetching expense data:', error);
    return [];
  }
}

/**
 * Get local expense data (simulated)
 */
async function getLocalExpenseData() {
  // This would be replaced with actual data fetching logic
  return new Promise((resolve) => {
    // Simulate async data fetch
    setTimeout(() => {
      resolve(window.expenseData || []);
    }, 100);
  });
}

/**
 * Filter expenses by date range
 */
function filterByDateRange(expenses, dateRange) {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

/**
 * Filter expenses by categories
 */
function filterByCategories(expenses, categories) {
  return expenses.filter(expense => {
    const category = expense.type || expense.category || 'Khác';
    return categories.includes(category);
  });
}

/**
 * Filter expenses by amount range
 */
function filterByAmount(expenses, minAmount, maxAmount) {
  return expenses.filter(expense => {
    const amount = parseFloat(expense.amount || 0);
    const passesMin = minAmount === null || amount >= minAmount;
    const passesMax = maxAmount === null || amount <= maxAmount;
    return passesMin && passesMax;
  });
}

/**
 * Prepare data for cash flow vs accrual comparison
 */
export function prepareComparisonData(cashFlowData, accrualData) {
  const months = new Set([
    ...Object.keys(cashFlowData.byMonth),
    ...Object.keys(accrualData.byMonth)
  ]);
  
  const comparisonData = Array.from(months).sort().map(month => ({
    month,
    cashFlow: cashFlowData.byMonth[month] || 0,
    accrual: accrualData.byMonth[month] || 0,
  }));
  
  return {
    months: comparisonData,
    totals: {
      cashFlow: cashFlowData.total,
      accrual: accrualData.total,
    }
  };
}

/**
 * Cache manager for report data
 */
const reportCache = {
  data: new Map(),
  maxAge: 5 * 60 * 1000, // 5 minutes
  
  set(key, value) {
    this.data.set(key, {
      value,
  },
  
  get(key) {
    const item = this.data.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.data.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  clear() {
    this.data.clear();
  }
};

/**
 * Get cached or fresh report data
 */
export async function getReportData(options) {
  const cacheKey = JSON.stringify(options);
  const cached = reportCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await fetchExpenseData(options);
  reportCache.set(cacheKey, data);
  
  return data;
}

/**
 * Transform expense data for specific report needs
 */
export function transformExpenseData(expenses, transformType) {
  switch (transformType) {
    case 'monthly_summary':
      return createMonthlySummary(expenses);
    case 'category_breakdown':
      return createCategoryBreakdown(expenses);
    case 'allocation_analysis':
      return createAllocationAnalysis(expenses);
  }
}

/**
 * Create monthly summary from expenses
 */
function createMonthlySummary(expenses) {
  const summary = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!summary[monthKey]) {
      summary[monthKey] = {
        total: 0,
        count: 0,
      };
    }
    
    const amount = parseFloat(expense.amount || 0);
    summary[monthKey].total += amount;
    summary[monthKey].count++;
    
    const category = expense.type || expense.category || 'Khác';
    summary[monthKey].categories[category] = (summary[monthKey].categories[category] || 0) + amount;
  });
  
  return summary;
}

/**
 * Create category breakdown from expenses
 */
function createCategoryBreakdown(expenses) {
  const breakdown = {};
  
  expenses.forEach(expense => {
    const category = expense.type || expense.category || 'Khác';
    const amount = parseFloat(expense.amount || 0);
    
    if (!breakdown[category]) {
      breakdown[category] = {
        total: 0,
        count: 0,
      };
    }
    
    breakdown[category].total += amount;
    breakdown[category].count++;
    breakdown[category].items.push({
      date: expense.date,
      amount: amount,
    });
  });
  
  return breakdown;
}

/**
 * Create allocation analysis
 */
function createAllocationAnalysis(expenses) {
  const analysis = {
    allocated: [],
    nonAllocated: [],
    totalAllocated: 0,
    totalNonAllocated: 0,
  };
  
  expenses.forEach(expense => {
    const hasAllocation = expense.periodicAllocation === 'Có' || expense.periodicAllocation === 'Yes';
    const amount = parseFloat(expense.amount || 0);
    
    if (hasAllocation) {
      analysis.allocated.push(expense);
      analysis.totalAllocated += amount;
    } else {
      analysis.nonAllocated.push(expense);
      analysis.totalNonAllocated += amount;
    }
  });
  
  const total = analysis.totalAllocated + analysis.totalNonAllocated;
  analysis.allocationRate = total > 0 ? (analysis.totalAllocated / total * 100) : 0;
  
  return analysis;
}

/**
 * Export data manager functions
 */
export const dataManager = {
  fetch: fetchExpenseData,
  prepare: prepareComparisonData,
  transform: transformExpenseData,
  cache: reportCache,
  getReportData
};