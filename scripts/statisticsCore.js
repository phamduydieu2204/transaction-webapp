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

/**
 * Groups transactions by Tên chuẩn (Standard Name)
 * @param {Array} transactions - Array of transaction records
 * @returns {Object} - Grouped transactions by tenChuan
 */
export function groupTransactionsByTenChuan(transactions) {
  const grouped = {};
  
  if (!Array.isArray(transactions)) return grouped;
  
  transactions.forEach(transaction => {
    const tenChuan = transaction.tenChuan || transaction.softwareName || "Không xác định";
    
    if (!grouped[tenChuan]) {
      grouped[tenChuan] = {
        tenChuan: tenChuan,
        transactions: [],
        totalRevenue: 0,
        totalDuration: 0,
        customerCount: new Set(),
        softwarePackages: new Set()
      };
    }
    
    grouped[tenChuan].transactions.push(transaction);
    grouped[tenChuan].totalRevenue += parseFloat(transaction.revenue) || 0;
    grouped[tenChuan].totalDuration += parseInt(transaction.duration) || 0;
    grouped[tenChuan].customerCount.add(transaction.customerEmail);
    grouped[tenChuan].softwarePackages.add(transaction.softwarePackage);
  });
  
  // Convert Sets to counts
  Object.keys(grouped).forEach(key => {
    grouped[key].uniqueCustomers = grouped[key].customerCount.size;
    grouped[key].packageCount = grouped[key].softwarePackages.size;
    delete grouped[key].customerCount;
    delete grouped[key].softwarePackages;
  });
  
  return grouped;
}

/**
 * Groups expenses by Tên chuẩn (Standard Name)
 * @param {Array} expenses - Array of expense records
 * @returns {Object} - Grouped expenses by standardName
 */
export function groupExpensesByTenChuan(expenses) {
  const grouped = {};
  
  if (!Array.isArray(expenses)) return grouped;
  
  expenses.forEach(expense => {
    const tenChuan = expense.standardName || expense.product || "Không xác định";
    
    if (!grouped[tenChuan]) {
      grouped[tenChuan] = {
        tenChuan: tenChuan,
        expenses: [],
        totalAmount: {
          VND: 0,
          USD: 0,
          NGN: 0
        },
        categories: new Set(),
        suppliers: new Set()
      };
    }
    
    grouped[tenChuan].expenses.push(expense);
    const currency = expense.currency || "VND";
    const amount = parseFloat(expense.amount) || 0;
    grouped[tenChuan].totalAmount[currency] = (grouped[tenChuan].totalAmount[currency] || 0) + amount;
    grouped[tenChuan].categories.add(expense.category);
    grouped[tenChuan].suppliers.add(expense.supplier);
  });
  
  // Convert Sets to counts
  Object.keys(grouped).forEach(key => {
    grouped[key].categoryCount = grouped[key].categories.size;
    grouped[key].supplierCount = grouped[key].suppliers.size;
    delete grouped[key].categories;
    delete grouped[key].suppliers;
  });
  
  return grouped;
}

/**
 * Calculate allocated expense for a period
 * @param {Object} expense - Expense record
 * @param {Object} dateRange - Date range for allocation calculation
 * @returns {number} - Allocated amount for the period
 */
function calculateAllocatedExpense(expense, dateRange) {
  // If no allocation needed, return 0
  if (!expense.periodicAllocation || expense.periodicAllocation !== 'Có') {
    return 0;
  }
  
  // Parse dates
  const expenseDate = new Date(normalizeDate(expense.date));
  const renewDate = expense.renewDate ? new Date(normalizeDate(expense.renewDate)) : null;
  
  // If no renew date, cannot allocate
  if (!renewDate || renewDate <= expenseDate) {
    return 0;
  }
  
  // Calculate total allocation period in days
  const totalDays = Math.ceil((renewDate - expenseDate) / (1000 * 60 * 60 * 24));
  
  // Calculate daily amount
  const dailyAmount = (parseFloat(expense.amount) || 0) / totalDays;
  
  // If no date range specified, return full amount
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return parseFloat(expense.amount) || 0;
  }
  
  // Parse date range
  const rangeStart = new Date(normalizeDate(dateRange.start));
  const rangeEnd = new Date(normalizeDate(dateRange.end));
  
  // Calculate overlap period
  const overlapStart = new Date(Math.max(rangeStart, expenseDate));
  const overlapEnd = new Date(Math.min(rangeEnd, renewDate));
  
  // If no overlap, return 0
  if (overlapStart > overlapEnd) {
    return 0;
  }
  
  // Calculate allocated days
  const allocatedDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
  
  // Return allocated amount
  return dailyAmount * allocatedDays;
}

/**
 * Calculates ROI by matching transactions and expenses using Tên chuẩn
 * @param {Array} transactions - Transaction records
 * @param {Array} expenses - Expense records
 * @param {Object} dateRange - Optional date range for allocation calculation
 * @returns {Array} - ROI analysis results
 */
export function calculateROIByTenChuan(transactions, expenses, dateRange = null) {
  const transactionGroups = groupTransactionsByTenChuan(transactions);
  const expenseGroups = groupExpensesByTenChuan(expenses);
  
  const roiAnalysis = [];
  
  // Get all unique Tên chuẩn from both transactions and expenses
  const allTenChuan = new Set([
    ...Object.keys(transactionGroups),
    ...Object.keys(expenseGroups)
  ]);
  
  allTenChuan.forEach(tenChuan => {
    const transactionData = transactionGroups[tenChuan] || {
      totalRevenue: 0,
      uniqueCustomers: 0,
      transactions: []
    };
    
    const expenseData = expenseGroups[tenChuan] || {
      totalAmount: { VND: 0, USD: 0, NGN: 0 },
      expenses: []
    };
    
    // Calculate actual expense (cash flow)
    const actualExpenseVND = expenseData.totalAmount.VND + 
                           (expenseData.totalAmount.USD * 25000) + 
                           (expenseData.totalAmount.NGN * 50);
    
    // Calculate allocated expense (accounting view)
    let allocatedExpenseVND = 0;
    let actualExpenseInPeriod = 0;
    
    expenseData.expenses.forEach(expense => {
      const amount = parseFloat(expense.amount) || 0;
      const currency = expense.currency || 'VND';
      
      // Convert to VND
      let amountVND = amount;
      if (currency === 'USD') amountVND = amount * 25000;
      else if (currency === 'NGN') amountVND = amount * 50;
      
      // Check if expense date is within the period
      if (dateRange && dateRange.start && dateRange.end) {
        const expenseDate = new Date(normalizeDate(expense.date));
        const rangeStart = new Date(normalizeDate(dateRange.start));
        const rangeEnd = new Date(normalizeDate(dateRange.end));
        
        // Only count actual expense if it's within the period
        if (expenseDate >= rangeStart && expenseDate <= rangeEnd) {
          actualExpenseInPeriod += amountVND;
        }
      } else {
        // No date range, count all
        actualExpenseInPeriod += amountVND;
      }
      
      // Calculate allocated amount
      const allocatedAmount = calculateAllocatedExpense(expense, dateRange);
      if (allocatedAmount > 0) {
        // Convert allocated amount to VND if needed
        if (currency === 'USD') allocatedExpenseVND += allocatedAmount * 25000;
        else if (currency === 'NGN') allocatedExpenseVND += allocatedAmount * 50;
        else allocatedExpenseVND += allocatedAmount;
      } else if (!expense.periodicAllocation || expense.periodicAllocation !== 'Có') {
        // If not allocated, use actual amount in period
        if (dateRange && dateRange.start && dateRange.end) {
          const expenseDate = new Date(normalizeDate(expense.date));
          const rangeStart = new Date(normalizeDate(dateRange.start));
          const rangeEnd = new Date(normalizeDate(dateRange.end));
          
          if (expenseDate >= rangeStart && expenseDate <= rangeEnd) {
            allocatedExpenseVND += amountVND;
          }
        } else {
          allocatedExpenseVND += amountVND;
        }
      }
    });
    
    // Calculate profits and ROI
    const accountingProfit = transactionData.totalRevenue - allocatedExpenseVND;
    const actualProfit = transactionData.totalRevenue - actualExpenseInPeriod;
    
    const accountingROI = allocatedExpenseVND > 0 
      ? ((transactionData.totalRevenue - allocatedExpenseVND) / allocatedExpenseVND) * 100
      : transactionData.totalRevenue > 0 ? 100 : 0;
      
    const actualROI = actualExpenseInPeriod > 0 
      ? ((transactionData.totalRevenue - actualExpenseInPeriod) / actualExpenseInPeriod) * 100
      : transactionData.totalRevenue > 0 ? 100 : 0;
    
    roiAnalysis.push({
      tenChuan: tenChuan,
      revenue: transactionData.totalRevenue,
      // Accounting view
      allocatedExpense: allocatedExpenseVND,
      accountingProfit: accountingProfit,
      accountingROI: accountingROI,
      accountingProfitMargin: transactionData.totalRevenue > 0 
        ? (accountingProfit / transactionData.totalRevenue) * 100 
        : 0,
      // Cash flow view
      actualExpense: actualExpenseInPeriod,
      actualProfit: actualProfit,
      actualROI: actualROI,
      actualProfitMargin: transactionData.totalRevenue > 0 
        ? (actualProfit / transactionData.totalRevenue) * 100 
        : 0,
      // General info
      customerCount: transactionData.uniqueCustomers,
      transactionCount: transactionData.transactions.length,
      expenseCount: expenseData.expenses.length
    });
  });
  
  // Sort by accounting ROI descending
  roiAnalysis.sort((a, b) => b.accountingROI - a.accountingROI);
  
  return roiAnalysis;
}