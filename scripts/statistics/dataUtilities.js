/**
 * dataUtilities.js
 * 
 * Data utilities for statistics
 * Handles date normalization, data filtering, and sorting operations
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
    // Skip expenses with accountingType = "Không liên quan"
    const accountingType = expense.accountingType || expense['Loại kế toán'] || '';
    if (accountingType === 'Không liên quan') {
      return; // Skip this expense
    }
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

// console.log("📊 Grouping expenses by month:", {

  //     recordCount: data.length,
  //     currency,
  //     sortBy,
  //     sortOrder
  //   });
  // 
  //   data.forEach(expense => {
  //     // Only process specified currency
  //     if (expense.currency !== currency) return;
  // 
  //     const normalizedDate = normalizeDate(expense.date);
  //     const month = normalizedDate.slice(0, 7); // yyyy/mm
  //     const type = expense.type || "Không xác định";
  //     const amount = parseFloat(expense.amount) || 0;
  // 
  //     const key = `${month}|${type}`;
  //     summaryMap[key] = (summaryMap[key] || 0) + amount;
  //   });
  // 
  //   // Convert to array and sort
  //   const summaryArray = Object.entries(summaryMap).map(([key, amount]) => {
  //     const [month, type] = key.split("|");
  //     return { month, type, amount };
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

  // console.log("✅ Monthly grouping completed:", summaryArray.length, "entries");
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

// console.log("📊 Grouping revenue by month:", {

  //     recordCount: data.length,
  //     currency,
  //     sortBy,
  //     sortOrder
  //   });
  // 
  //   data.forEach(transaction => {
  //     // Only process specified currency
  //     if (transaction.currency !== currency) return;
  // 
  //     const normalizedDate = normalizeDate(transaction.transactionDate);
  //     const month = normalizedDate.slice(0, 7); // yyyy/mm
  //     const software = transaction.softwareName || "Không xác định";
  //     const revenue = parseFloat(transaction.revenue) || 0;
  // 
  //     const key = `${month}|${software}`;
  //     summaryMap[key] = (summaryMap[key] || 0) + revenue;
  //   });
  // 
  //   // Convert to array and sort
  //   const summaryArray = Object.entries(summaryMap).map(([key, amount]) => {
  //     const [month, software] = key.split("|");
  //     return { month, software, amount };
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

  // console.log("✅ Revenue grouping completed:", summaryArray.length, "entries");
  return summaryArray;
}

// Make functions available globally for backward compatibility
window.normalizeDate = normalizeDate;
window.groupTransactionsByTenChuan = groupTransactionsByTenChuan;
window.groupExpensesByTenChuan = groupExpensesByTenChuan;
window.groupExpensesByMonth = groupExpensesByMonth;
window.groupRevenueByMonth = groupRevenueByMonth;