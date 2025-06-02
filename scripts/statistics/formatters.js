/**
 * formatters.js
 * 
 * Currency, number, and date formatting utilities
 * Handles all display formatting for statistics
 */

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
 * Format a number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export function formatNumber(num, decimals = 0) {
  if (typeof num !== 'number' || isNaN(num)) return "0";
  
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return "0%";
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date to Vietnamese locale string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'month'
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return "";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  
  switch (format) {
    case 'short':
      // dd/mm/yyyy
      return dateObj.toLocaleDateString('vi-VN');
      
    case 'long':
      // Ngày dd tháng mm năm yyyy
      return dateObj.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    case 'month':
      // Tháng mm/yyyy
      return dateObj.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit'
      });
      
    default:
      return dateObj.toLocaleDateString('vi-VN');
  }
}

/**
 * Format duration in days to readable string
 * @param {number} days - Number of days
 * @returns {string} - Formatted duration
 */
export function formatDuration(days) {
  if (!days || days <= 0) return "0 ngày";
  
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  
  const parts = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (remainingDays > 0) parts.push(`${remainingDays} ngày`);
  
  return parts.join(' ');
}

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} - Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency = 'VND') {
  if (fromCurrency === toCurrency) return amount;
  
  // Exchange rates (simplified - should be dynamic in production)
  const rates = {
    'USD_TO_VND': 25000,
    'NGN_TO_VND': 50,
    'VND_TO_USD': 1 / 25000,
    'VND_TO_NGN': 1 / 50,
    'USD_TO_NGN': 500,
    'NGN_TO_USD': 1 / 500
  };
  
  const rateKey = `${fromCurrency}_TO_${toCurrency}`;
  const rate = rates[rateKey] || 1;
  
  return amount * rate;
}

/**
 * Format large numbers with suffixes (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number with suffix
 */
export function formatCompactNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return "0";
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e9) {
    return sign + (absNum / 1e9).toFixed(1) + 'B';
  } else if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(1) + 'M';
  } else if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(1) + 'K';
  }
  
  return sign + absNum.toString();
}

/**
 * Format time period label
 * @param {string} period - Period type: 'day', 'week', 'month', 'quarter', 'year'
 * @param {Date} date - Reference date
 * @returns {string} - Formatted period label
 */
export function formatPeriodLabel(period, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  
  switch (period) {
    case 'day':
      return formatDate(date, 'short');
      
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${formatDate(weekStart, 'short')} - ${formatDate(weekEnd, 'short')}`;
      
    case 'month':
      return `Tháng ${month + 1}/${year}`;
      
    case 'quarter':
      return `Quý ${quarter}/${year}`;
      
    case 'year':
      return `Năm ${year}`;
      
    default:
      return formatDate(date, 'short');
  }
}