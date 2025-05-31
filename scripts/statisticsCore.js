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
 * Calculate allocated expense for a period based on software validity period
 * Logic: If expense has Phân bổ = Có and valid Ngày giao dịch + Ngày tái tục,
 * divide the cost evenly across the validity period.
 * Only count the portion that falls within the target period.
 * @param {Object} expense - Expense record
 * @param {Object} dateRange - Date range for allocation calculation
 * @returns {number} - Allocated amount for the period
 */
export function calculateAllocatedExpense(expense, dateRange) {
  // Debug: Log full expense object for Helium10
  if ((expense.product && expense.product.includes('Helium10')) || 
      (expense.description && expense.description.includes('Helium10'))) {
    console.log(`🔍 HELIUM10 DEBUG - Full expense object:`, {
      fullExpense: expense,
      keys: Object.keys(expense),
      periodicAllocation: expense.periodicAllocation,
      renewDate: expense.renewDate,
      date: expense.date
    });
  }
  
  // Check multiple possible field names for allocation
  const allocationValue = expense.periodicAllocation || expense['Phân bổ'] || expense.allocation;
  
  // If no allocation needed, return 0
  if (!allocationValue || (allocationValue !== 'Có' && allocationValue !== 'Có')) {
    console.log(`❌ ${expense.product || expense.description || 'Unknown'} - No allocation:`, {
      periodicAllocation: expense.periodicAllocation,
      'Phân bổ': expense['Phân bổ'],
      allocation: expense.allocation,
      allocationValue: allocationValue,
      reason: 'allocation field not "Có"'
    });
    return 0;
  }
  
  // Parse dates - both transaction date and renewal date are required
  // Check multiple possible field names for dates
  const dateValue = expense.date || expense['Ngày chi'] || expense.transactionDate;
  const renewDateValue = expense.renewDate || expense['Ngày tái tục'] || expense.renewalDate;
  
  const transactionDate = dateValue ? new Date(normalizeDate(dateValue)) : null;
  const renewalDate = renewDateValue ? new Date(normalizeDate(renewDateValue)) : null;
  
  console.log(`📅 Date parsing for ${expense.product || expense.description}:`, {
    originalDate: expense.date,
    'Ngày chi': expense['Ngày chi'],
    dateValue,
    originalRenewDate: expense.renewDate,
    'Ngày tái tục': expense['Ngày tái tục'],
    renewDateValue,
    parsedTransactionDate: transactionDate,
    parsedRenewalDate: renewalDate
  });
  
  // Must have both dates for allocation
  if (!transactionDate || !renewalDate || renewalDate <= transactionDate) {
    console.log(`❌ ${expense.product || expense['Tên sản phẩm/Dịch vụ'] || expense.description} - Invalid dates:`, {
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
  
  // Calculate total validity period in days
  const totalValidityDays = Math.ceil((renewalDate - transactionDate) / (1000 * 60 * 60 * 24));
  
  // Calculate daily amount - check multiple field names
  const amountValue = expense.amount || expense['Số tiền'] || 0;
  const totalAmount = parseFloat(amountValue) || 0;
  
  console.log(`💰 Amount parsing for ${expense.product || expense['Tên sản phẩm/Dịch vụ']}:`, {
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
  
  // If no overlap, return 0
  if (overlapStart > overlapEnd) {
    return 0;
  }
  
  // Calculate days that software is valid within the target period
  const validDaysInPeriod = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
  
  // Return allocated amount for the overlapping period
  const allocatedAmount = dailyAmount * validDaysInPeriod;
  
  console.log(`📊 Allocated expense calculation:`, {
    expense: expense.product || expense.description,
    totalAmount,
    transactionDate: normalizeDate(transactionDate),
    renewalDate: normalizeDate(renewalDate),
    totalValidityDays,
    dailyAmount,
    periodRange: `${dateRange.start} to ${dateRange.end}`,
    validDaysInPeriod,
    allocatedAmount
  });
  
  return allocatedAmount;
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
  
  console.log(`📅 Monthly expense breakdown for ${breakdown.targetMonth}:`, {
    totalAllocated: breakdown.totalAllocatedExpense,
    totalActual: breakdown.totalActualExpense,
    allocatedCount: breakdown.allocatedDetails.length,
    actualCount: breakdown.actualDetails.length
  });
  
  return breakdown;
}

/**
 * Test function for allocation logic verification
 * @param {Array} testCases - Array of test scenarios
 * @returns {Array} - Test results
 */
export function testAllocationLogic(testCases = null) {
  const defaultTestCases = [
    {
      name: 'Phần mềm mua từ năm trước, vẫn còn hiệu lực',
      expense: {
        product: 'Adobe Photoshop',
        amount: 1200000,
        currency: 'VND',
        date: '2024/01/15',
        renewDate: '2025/01/14',
        periodicAllocation: 'Có'
      },
      targetPeriod: {
        start: '2024/12/01',
        end: '2024/12/31'
      },
      expectedAllocated: Math.round((1200000 / 365) * 31), // 31 ngày tháng 12
      expectedActual: 0 // Không thanh toán trong tháng 12
    },
    {
      name: 'Phần mềm mua trong tháng, không có phân bổ',
      expense: {
        product: 'Microsoft Office',
        amount: 5000000,
        currency: 'VND',
        date: '2024/12/10',
        renewDate: '2025/12/09',
        periodicAllocation: 'Không'
      },
      targetPeriod: {
        start: '2024/12/01',
        end: '2024/12/31'
      },
      expectedAllocated: 5000000, // Toàn bộ trong tháng mua
      expectedActual: 5000000    // Toàn bộ trong tháng mua
    },
    {
      name: 'Phần mềm hết hạn giữa tháng',
      expense: {
        product: 'Canva Pro',
        amount: 600000,
        currency: 'VND',
        date: '2024/11/15',
        renewDate: '2024/12/15',
        periodicAllocation: 'Có'
      },
      targetPeriod: {
        start: '2024/12/01',
        end: '2024/12/31'
      },
      expectedAllocated: Math.round((600000 / 30) * 15), // 15 ngày đầu tháng
      expectedActual: 0 // Không thanh toán trong tháng 12
    }
  ];
  
  const tests = testCases || defaultTestCases;
  const results = [];
  
  tests.forEach(test => {
    const allocatedAmount = calculateAllocatedExpense(test.expense, test.targetPeriod);
    const actualAmount = calculateActualExpense(test.expense, test.targetPeriod);
    
    const result = {
      testName: test.name,
      allocated: {
        calculated: Math.round(allocatedAmount),
        expected: test.expectedAllocated,
        passed: Math.abs(allocatedAmount - test.expectedAllocated) < 1000 // Tolerance 1000 VND
      },
      actual: {
        calculated: Math.round(actualAmount),
        expected: test.expectedActual,
        passed: actualAmount === test.expectedActual
      }
    };
    
    result.overallPassed = result.allocated.passed && result.actual.passed;
    results.push(result);
    
    console.log(`🗺️ Test: ${test.name}`, {
      allocated: result.allocated,
      actual: result.actual,
      passed: result.overallPassed
    });
  });
  
  const totalPassed = results.filter(r => r.overallPassed).length;
  console.log(`🏆 Test Results: ${totalPassed}/${results.length} tests passed`);
  
  return results;
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
    
    console.log(`💰 Actual expense calculation:`, {
      expense: expense.product || expense.description,
      expenseDate: normalizeDate(expenseDate),
      periodRange: `${dateRange.start} to ${dateRange.end}`,
      amount,
      included: true
    });
    
    return amount;
  }
  
  return 0;
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
    
    // Calculate allocated expense (accounting view) and actual expense (cash flow view)
    let allocatedExpenseVND = 0;  // Chi phí phân bổ tháng
    let actualExpenseVND = 0;     // Chi phí thực tế
    
    expenseData.expenses.forEach(expense => {
      const amount = parseFloat(expense.amount) || 0;
      const currency = expense.currency || 'VND';
      
      // Convert to VND helper function
      const convertToVND = (amt, curr) => {
        if (curr === 'USD') return amt * 25000;
        if (curr === 'NGN') return amt * 50;
        return amt;
      };
      
      // Calculate allocated expense for accounting view
      const allocatedAmount = calculateAllocatedExpense(expense, dateRange);
      if (allocatedAmount > 0) {
        // Has periodic allocation
        allocatedExpenseVND += convertToVND(allocatedAmount, currency);
        console.log(`📊 ${tenChuan} - Allocated expense:`, {
          product: expense.product,
          allocatedAmount,
          currency,
          convertedVND: convertToVND(allocatedAmount, currency)
        });
      } else {
        // No allocation - use actual amount if in period
        const actualAmount = calculateActualExpense(expense, dateRange);
        if (actualAmount > 0) {
          allocatedExpenseVND += convertToVND(actualAmount, currency);
          console.log(`💰 ${tenChuan} - Non-allocated actual expense:`, {
            product: expense.product,
            actualAmount,
            currency,
            convertedVND: convertToVND(actualAmount, currency)
          });
        }
      }
      
      // Calculate actual expense for cash flow view
      const actualAmount = calculateActualExpense(expense, dateRange);
      if (actualAmount > 0) {
        actualExpenseVND += convertToVND(actualAmount, currency);
      }
    });
    
    // Calculate profits and ROI for both perspectives
    const accountingProfit = transactionData.totalRevenue - allocatedExpenseVND;  // Lợi nhuận kế toán
    const actualProfit = transactionData.totalRevenue - actualExpenseVND;        // Lợi nhuận thực tế
    
    // ROI theo góc nhìn kế toán (phân bổ)
    const accountingROI = allocatedExpenseVND > 0 
      ? ((transactionData.totalRevenue - allocatedExpenseVND) / allocatedExpenseVND) * 100
      : transactionData.totalRevenue > 0 ? 100 : 0;
      
    // ROI theo góc nhìn dòng tiền (thực tế)
    const actualROI = actualExpenseVND > 0 
      ? ((transactionData.totalRevenue - actualExpenseVND) / actualExpenseVND) * 100
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
      actualExpense: actualExpenseVND,
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