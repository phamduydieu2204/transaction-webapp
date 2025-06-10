/**
 * reportCalculations.js
 * 
 * Common calculation functions for reports
 */

/**
 * Calculate total revenue from transactions
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} filters - Optional filters
 * @returns {number} Total revenue
 */
export function calculateTotalRevenue(transactions = [], filters = {}) {
  if (!Array.isArray(transactions)) return 0;
  
  return transactions
    .filter(transaction => applyFilters(transaction, filters))
    .reduce((total, transaction) => {
      const revenue = parseFloat(transaction.revenue) || 0;
      return total + revenue;
    }, 0);
}

/**
 * Calculate total expenses
 * @param {Array} expenses - Array of expense objects
 * @param {Object} filters - Optional filters
 * @returns {number} Total expenses
 */
export function calculateTotalExpenses(expenses = [], filters = {}) {
  if (!Array.isArray(expenses)) return 0;
  
  return expenses
    .filter(expense => applyFilters(expense, filters))
    .reduce((total, expense) => {
      const amount = parseFloat(expense.amount || expense.soTien) || 0;
      return total + amount;
    }, 0);
}

/**
 * Calculate profit (revenue - expenses)
 * @param {number} revenue - Total revenue
 * @param {number} expenses - Total expenses
 * @returns {number} Profit
 */
export function calculateProfit(revenue, expenses) {
  return (revenue || 0) - (expenses || 0);
}

/**
 * Calculate profit margin percentage
 * @param {number} profit - Profit amount
 * @param {number} revenue - Revenue amount
 * @returns {number} Profit margin percentage
 */
export function calculateProfitMargin(profit, revenue) {
  if (!revenue || revenue === 0) return 0;
  return (profit / revenue) * 100;
}

/**
 * Calculate growth rate between two periods
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Growth rate percentage
 */
export function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate average transaction value
 * @param {Array} transactions - Array of transactions
 * @param {Object} filters - Optional filters
 * @returns {number} Average transaction value
 */
export function calculateAverageTransactionValue(transactions = [], filters = {}) {
  const filteredTransactions = transactions.filter(t => applyFilters(t, filters));
  
  if (filteredTransactions.length === 0) return 0;
  
  const totalRevenue = calculateTotalRevenue(filteredTransactions);
  return totalRevenue / filteredTransactions.length;
}

/**
 * Calculate customer lifetime value
 * @param {Array} customerTransactions - Transactions for a specific customer
 * @returns {number} Customer lifetime value
 */
export function calculateCustomerLifetimeValue(customerTransactions = []) {
  return calculateTotalRevenue(customerTransactions);
}

/**
 * Calculate renewal rate
 * @param {Array} renewals - Array of renewal data
 * @param {Array} expirations - Array of expiration data
 * @returns {number} Renewal rate percentage
 */
export function calculateRenewalRate(renewals = [], expirations = []) {
  const totalExpirations = expirations.length;
  const totalRenewals = renewals.length;
  
  if (totalExpirations === 0) return 0;
  return (totalRenewals / totalExpirations) * 100;
}

/**
 * Calculate retention rate
 * @param {Array} activeCustomers - Currently active customers
 * @param {Array} totalCustomers - Total customers at start of period
 * @returns {number} Retention rate percentage
 */
export function calculateRetentionRate(activeCustomers = [], totalCustomers = []) {
  if (totalCustomers.length === 0) return 0;
  return (activeCustomers.length / totalCustomers.length) * 100;
}

/**
 * Calculate commission amount
 * @param {number} revenue - Revenue amount
 * @param {number} commissionRate - Commission rate (percentage)
 * @returns {number} Commission amount
 */
export function calculateCommission(revenue, commissionRate) {
  if (!revenue || !commissionRate) return 0;
  return (revenue * commissionRate) / 100;
}

/**
 * Calculate days between dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
export function calculateDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate moving average
 * @param {Array} values - Array of numeric values
 * @param {number} period - Period for moving average
 * @returns {Array} Array of moving averages
 */
export function calculateMovingAverage(values = [], period = 7) {
  if (!Array.isArray(values) || values.length < period) return [];
  
  const result = [];
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const average = slice.reduce((sum, val) => sum + (parseFloat(val) || 0), 0) / period;
    result.push(average);
  }
  
  return result;
}

/**
 * Apply filters to data object
 * @param {Object} item - Data object to filter
 * @param {Object} filters - Filter criteria
 * @returns {boolean} Whether item passes filters
 */
function applyFilters(item, filters = {}) {
  if (!item || typeof item !== 'object') return false;
  
  // Date range filter
  if (filters.startDate || filters.endDate) {
    const itemDate = new Date(item.ngayTao || item.date || item.createdAt);
    if (isNaN(itemDate.getTime())) return false;
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (itemDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (itemDate > endDate) return false;
    }
  }
  
  // Customer filter
  if (filters.customer && item.customer !== filters.customer) {
    return false;
  }
  
  // Software filter
  if (filters.software && item.software !== filters.software) {
    return false;
  }
  
  // Status filter
  if (filters.status && item.status !== filters.status) {
    return false;
  }
  
  return true;
}

/**
 * Group data by time period
 * @param {Array} data - Array of data objects
 * @param {string} period - Time period ('day', 'week', 'month', 'quarter', 'year')
 * @param {string} dateField - Field name containing date
 * @returns {Object} Grouped data by period
 */
export function groupByTimePeriod(data = [], period = 'month', dateField = 'ngayTao') {
  const grouped = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField]);
    if (isNaN(date.getTime())) return;
    
    let key;
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  return grouped;
}

/**
 * Calculate customer lifetime value
 * @param {Array} transactions - Customer's transactions
 * @returns {number} Lifetime value
 */
export function calculateCustomerLifetimeValue(transactions = []) {
  if (!Array.isArray(transactions)) return 0;
  
  return transactions.reduce((total, transaction) => {
    const revenue = parseFloat(transaction.revenue || transaction.doanhThu) || 0;
    return total + revenue;
  }, 0);
}

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
export function calculateDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate growth rate between two values
 * @param {number} currentValue - Current value
 * @param {number} previousValue - Previous value
 * @returns {number} Growth rate as percentage
 */
export function calculateGrowthRate(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return 0;
  
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

/**
 * Calculate average value from array
 * @param {Array} values - Array of numbers
 * @returns {number} Average value
 */
export function calculateAverage(values = []) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  
  const sum = values.reduce((total, value) => {
    const num = parseFloat(value) || 0;
    return total + num;
  }, 0);
  
  return sum / values.length;
}