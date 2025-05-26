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

  console.log("🧮 Calculating expenses:", {
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

  console.log("✅ Expense totals calculated:", totals);
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

  console.log("🧮 Calculating revenue:", {
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

  console.log("✅ Revenue totals calculated:", totals);
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

  console.log("📊 Grouping expenses by month:", {
    recordCount: data.length,
    currency,
    sortBy,
    sortOrder
  });

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

  console.log("✅ Monthly grouping completed:", summaryArray.length, "entries");
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

  console.log("📊 Grouping revenue by month:", {
    recordCount: data.length,
    currency,
    sortBy,
    sortOrder
  });

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

  console.log("✅ Revenue grouping completed:", summaryArray.length, "entries");
  return summaryArray;
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

  console.log("📈 Financial analysis completed:", analysis.summary);
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

  console.log(`📅 Generated ${period} range:`, ranges);
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