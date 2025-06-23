/**
 * statisticsCore.js
 * 
 * Core statistics calculations and data processing
 * Handles all mathematical operations and data aggregations for statistics
 */

/**
 * Normalizes different date formats to yyyy/mm/dd
 * @param {string|Date} dateInput - Input date in various formats
 * @returns {string} - Normalized date string in yyyy/mm/dd format
 */
export function normalizeDate(dateInput) {
  if (!dateInput) return "";
  
  let date;
  if (typeof dateInput === 'string') {
    // Handle ISO string like "2025-05-21T17:00:00.000Z"
    if (dateInput.includes('T')) {
      date = new Date(dateInput);
    } 
    // Handle format "2025/05/23"
    else if (dateInput.includes('/')) {
      const [y, m, d] = dateInput.split('/');
      date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    // Handle other formats
    else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return "";
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

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
 * Groups expenses by month and type for summary statistics
 * @param {Array} data - Array of expense records
 * @param {Object} options - Grouping options
 * @returns {Object} - Grouped data by month and type
 */
export function groupExpensesByMonth(data, options = {}) {
  const {
    currency = "VND",
    sortBy = "month", // "month", "amount", "type"
    sortOrder = "desc" // "asc", "desc"
  } = options;

  const summaryMap = {};

  if (!Array.isArray(data)) return summaryMap;

  data.forEach(expense => {
    // Only process specified currency
    if (expense.currency !== currency) return;

    const normalizedDate = normalizeDate(expense.date);
    const month = normalizedDate.slice(0, 7); // yyyy/mm
    const type = expense.type || "Không xác định";
    const amount = parseFloat(expense.amount) || 0;

    const key = `${month}|${type}`;
    summaryMap[key] = (summaryMap[key] || 0) + amount;
  });

  // Convert to array and sort
  const summaryArray = Object.entries(summaryMap).map(([key, amount]) => {
    const [month, type] = key.split("|");
    return { month, type, amount };
  });

  // Sort by specified criteria
  summaryArray.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "month":
        comparison = a.month.localeCompare(b.month);
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = a.month.localeCompare(b.month);
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  return summaryArray;
}

/**
 * Groups revenue by month and software type
 * @param {Array} data - Array of transaction records
 * @param {Object} options - Grouping options
 * @returns {Array} - Grouped revenue data
 */
export function groupRevenueByMonth(data, options = {}) {
  const {
    currency = "VND",
    sortBy = "month",
    sortOrder = "desc"
  } = options;

  const summaryMap = {};

  if (!Array.isArray(data)) return [];

  data.forEach(transaction => {
    // Only process specified currency
    if (transaction.currency !== currency) return;

    const normalizedDate = normalizeDate(transaction.transactionDate);
    const month = normalizedDate.slice(0, 7); // yyyy/mm
    const software = transaction.softwareName || "Không xác định";
    const revenue = parseFloat(transaction.revenue) || 0;

    const key = `${month}|${software}`;
    summaryMap[key] = (summaryMap[key] || 0) + revenue;
  });

  // Convert to array and sort
  const summaryArray = Object.entries(summaryMap).map(([key, amount]) => {
    const [month, software] = key.split("|");
    return { month, software, amount };
  });

  // Sort by specified criteria
  summaryArray.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "month":
        comparison = a.month.localeCompare(b.month);
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "software":
        comparison = a.software.localeCompare(b.software);
        break;
      default:
        comparison = a.month.localeCompare(b.month);
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  return summaryArray;
}

/**
 * Analyzes profit and loss with currency conversion
 * @param {Object} revenue - Revenue totals by currency
 * @param {Object} expenses - Expense totals by currency
 * @returns {Object} - Profit/loss analysis
 */
export function analyzeProfitLoss(revenue, expenses) {
  const analysis = {
    profit: { VND: 0, USD: 0, NGN: 0 },
    profitMargin: { VND: 0, USD: 0, NGN: 0 },
    expenseRatio: { VND: 0, USD: 0, NGN: 0 }
  };

  const currencies = ["VND", "USD", "NGN"];

  currencies.forEach(currency => {
    const rev = revenue[currency] || 0;
    const exp = expenses[currency] || 0;
    
    analysis.profit[currency] = rev - exp;
    analysis.profitMargin[currency] = rev > 0 ? ((rev - exp) / rev) * 100 : 0;
    analysis.expenseRatio[currency] = rev > 0 ? (exp / rev) * 100 : 0;
  });

  return analysis;
}

/**
 * Generates date ranges for common periods
 * @param {string} period - Period type ("today", "week", "month", "quarter", "year")
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object} - Start and end dates for the period
 */
export function getDateRange(period, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  const ranges = {};

  switch (period) {
    case "today":
      ranges.start = normalizeDate(today);
      ranges.end = normalizeDate(today);
      break;

    case "week":
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      ranges.start = normalizeDate(startOfWeek);
      ranges.end = normalizeDate(endOfWeek);
      break;

    case "month":
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      ranges.start = normalizeDate(startOfMonth);
      ranges.end = normalizeDate(endOfMonth);
      break;

    case "quarter":
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const startOfQuarter = new Date(today.getFullYear(), quarterStartMonth, 1);
      const endOfQuarter = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
      
      ranges.start = normalizeDate(startOfQuarter);
      ranges.end = normalizeDate(endOfQuarter);
      break;

    case "year":
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      
      ranges.start = normalizeDate(startOfYear);
      ranges.end = normalizeDate(endOfYear);
      break;

    default:
      ranges.start = normalizeDate(today);
      ranges.end = normalizeDate(today);
  }

  return ranges;
}

/**
 * Formats numbers for display in different currencies
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount string
 */
export function formatCurrency(amount, currency = "VND") {
  if (typeof amount !== 'number' || isNaN(amount)) return "0";

  const formattedAmount = amount.toLocaleString();
  
  switch (currency) {
    case "VND":
      return `${formattedAmount} ₫`;
    case "USD":
      return `$${formattedAmount}`;
    case "NGN":
      return `₦${formattedAmount}`;
    default:
      return `${formattedAmount} ${currency}`;
  }
}

/**
 * Calculate revenue by source (software) using standardized names
 * @param {Array} transactionData - Transaction records
 * @returns {Array} - Revenue by source sorted by amount
 */
export function calculateRevenueBySource(transactionData) {
  const bySource = {};
  
  if (!Array.isArray(transactionData)) return [];
  
  transactionData.forEach(transaction => {
    const source = transaction.tenChuan || transaction.softwareName || 'Khác';
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    bySource[source] = (bySource[source] || 0) + amount;
  });
  
  return Object.entries(bySource)
    .map(([source, amount]) => ({ source, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate expenses by category using improved categorization logic
 * @param {Array} expenseData - Expense records
 * @returns {Array} - Expenses by category sorted by amount
 */
export function calculateExpensesByCategory(expenseData) {
  const categories = {};
  
  if (!Array.isArray(expenseData)) return [];
  
  expenseData.forEach(expense => {
    const amount = parseFloat(expense.amount || expense['Số tiền'] || 0);
    
    // Skip non-related expenses
    const accountingType = expense.accountingType || expense['Loại kế toán'] || '';
    if (accountingType === 'Không liên quan') {
      categories['Sinh hoạt cá nhân'] = (categories['Sinh hoạt cá nhân'] || 0) + amount;
      return;
    }
    
    // Use standardized name for categorization if available
    if (expense.standardName || expense.tenChuan) {
      const categoryName = expense.standardName || expense.tenChuan;
      categories[categoryName] = (categories[categoryName] || 0) + amount;
    } else {
      // Fallback to smart categorization
      const type = expense.type || '';
      const category = expense.category || '';
      
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
 * Calculate comprehensive business metrics
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} dateRange - Optional date range filter
 * @returns {Object} - Comprehensive business metrics
 */
export function calculateBusinessMetrics(transactionData, expenseData, dateRange = null) {
  
  // Apply date range filtering if specified
  let filteredTransactions = transactionData;
  let filteredExpenses = expenseData;
  
  if (dateRange && dateRange.start && dateRange.end) {
    filteredTransactions = transactionData.filter(t => {
      const tDate = normalizeDate(t.transactionDate || t.date);
      return tDate >= dateRange.start && tDate <= dateRange.end;
    });
    
    filteredExpenses = expenseData.filter(e => {
      const eDate = normalizeDate(e.date || e['Ngày chi']);
      return eDate >= dateRange.start && eDate <= dateRange.end;
    });
  }
  
  // Basic calculations
  const revenueData = calculateTotalRevenue(filteredTransactions);
  const expenseData_calc = calculateTotalExpenses(filteredExpenses);
  
  const totalRevenue = revenueData.VND + (revenueData.USD * 25000) + (revenueData.NGN * 50);
  const totalExpenses = expenseData_calc.VND + (expenseData_calc.USD * 25000) + (expenseData_calc.NGN * 50);
  
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses * 0.3) / totalRevenue) * 100 : 0; // Simplified COGS
  
  // Revenue analysis
  const revenueBySource = calculateRevenueBySource(filteredTransactions);
  const averageOrderValue = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0;
  
  // Cost analysis
  const expensesByCategory = calculateExpensesByCategory(filteredExpenses);
  
  // KPIs
  const days = dateRange ? getDaysBetween(new Date(dateRange.start), new Date(dateRange.end)) : 30;
  const revenuePerDay = totalRevenue / days;
  const burnRate = totalExpenses / days;
  
  // Cash flow (simplified)
  const operatingCashFlow = netProfit * 1.2; // Simplified calculation
  const freeCashFlow = operatingCashFlow * 0.9;
  
  return {
    financial: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      grossMargin,
      averageOrderValue,
      revenueBySource: revenueBySource.slice(0, 10) // Top 10 sources
    },
    costs: {
      expensesByCategory: expensesByCategory.slice(0, 10), // Top 10 categories
      costOfRevenue: totalExpenses * 0.3, // Simplified COGS
      operating: totalExpenses * 0.7 // Simplified OPEX
    },
    kpis: {
      revenuePerDay,
      burnRate,
      netProfitMargin: profitMargin
    },
    efficiency: {
      costEfficiencyRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0
    },
    cashFlow: {
      operatingCashFlow,
      freeCashFlow
    }
  };
}

/**
 * Calculate days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date  
 * @returns {number} - Number of days
 */
export function getDaysBetween(startDate, endDate) {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}