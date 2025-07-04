/**
 * dataTransformers.js
 * 
 * Handles data transformation, normalization, and formatting
 * Converts data between different formats and structures
 */

/**
 * Converts array of objects to CSV format
 * @param {Array} data - Data to convert
 * @returns {string} - CSV formatted string
 */
export function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.join(",");
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || "";
      // Escape commas and quotes in CSV
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",");
  });
  
  return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Normalizes expense data structure
 * @param {Array} expenses - Raw expense data
 * @returns {Array} - Normalized expense data
 */
export function normalizeExpenseData(expenses) {
  if (!Array.isArray(expenses)) return [];
  
  return expenses.map(expense => ({
    id: expense.id || expense.timestamp,
    date: expense.date || expense.ngayTao,
    amount: parseFloat(expense.amount || expense.soTien || 0),
    category: expense.category || expense.loaiChiPhi || 'Unknown',
    description: expense.description || expense.moTa || '',
    bank: expense.bank || expense.nganHang || '',
    status: expense.status || 'active',
    createdAt: expense.createdAt || expense.timestamp,
    updatedAt: expense.updatedAt || expense.timestamp
  }));
}

/**
 * Normalizes transaction data structure
 * @param {Array} transactions - Raw transaction data
 * @returns {Array} - Normalized transaction data
 */
export function normalizeTransactionData(transactions) {
  if (!Array.isArray(transactions)) return [];
  
  return transactions.map(transaction => ({
    id: transaction.id || transaction.timestamp,
    date: transaction.date || transaction.ngayTao,
    amount: parseFloat(transaction.amount || transaction.soTien || 0),
    type: transaction.type || transaction.loaiGiaoDich || 'revenue',
    customer: transaction.customer || transaction.khachHang || '',
    software: transaction.software || transaction.phanMem || '',
    package: transaction.package || transaction.goiDichVu || '',
    status: transaction.status || 'active',
    createdAt: transaction.createdAt || transaction.timestamp,
    updatedAt: transaction.updatedAt || transaction.timestamp
  }));
}

/**
 * Formats currency value for display
 * @param {number} value - Numeric value
 * @param {string} currency - Currency code (default: VND)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value, currency = 'VND') {
  const numValue = parseFloat(value) || 0;
  
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numValue);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(numValue);
}

/**
 * Formats date for display
 * @param {string|Date} date - Date value
 * @param {string} format - Date format (default: 'DD/MM/YYYY')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Aggregates data by period (day, week, month, year)
 * @param {Array} data - Data to aggregate
 * @param {string} period - Aggregation period
 * @param {string} valueField - Field to sum
 * @returns {Object} - Aggregated data by period
 */
export function aggregateByPeriod(data, period = 'month', valueField = 'amount') {
  if (!Array.isArray(data) || data.length === 0) return {};
  
  const aggregated = {};
  
  data.forEach(item => {
    const date = new Date(item.date || item.ngayTao);
    let key;
    
    switch (period) {
      case 'day':
        key = formatDate(date, 'YYYY-MM-DD');
        break;
      case 'week':
        const weekNum = getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNum}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = formatDate(date, 'YYYY-MM-DD');
    }
    
    if (!aggregated[key]) {
      aggregated[key] = {
        period: key,
        count: 0,
        total: 0,
        items: []
      };
    }
    
    aggregated[key].count++;
    aggregated[key].total += parseFloat(item[valueField] || 0);
    aggregated[key].items.push(item);
  });
  
  return aggregated;
}

/**
 * Gets week number for a date
 * @param {Date} date - Date object
 * @returns {number} - Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Groups data by a specific field
 * @param {Array} data - Data to group
 * @param {string} field - Field to group by
 * @returns {Object} - Grouped data
 */
export function groupByField(data, field) {
  if (!Array.isArray(data) || data.length === 0) return {};
  
  return data.reduce((groups, item) => {
    const key = item[field] || 'Unknown';
    
    if (!groups[key]) {
      groups[key] = {
        name: key,
        count: 0,
        total: 0,
        items: []
      };
    }
    
    groups[key].count++;
    groups[key].total += parseFloat(item.amount || item.soTien || 0);
    groups[key].items.push(item);
    
    return groups;
  }, {});
}

/**
 * Sorts data by field and order
 * @param {Array} data - Data to sort
 * @param {string} field - Sort field
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} - Sorted data
 */
export function sortData(data, field, order = 'asc') {
  if (!Array.isArray(data)) return [];
  
  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Handle date fields
    if (field === 'date' || field === 'ngayTao') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // Handle numeric fields
    if (field === 'amount' || field === 'soTien') {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : (aVal < bVal ? -1 : 0);
    } else {
      return aVal < bVal ? 1 : (aVal > bVal ? -1 : 0);
    }
  });
}