/**
 * formatters.js - Data formatting utilities
 * 
 * Common formatting functions for displaying data
 */

/**
 * Format currency in VND
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format number with thousand separators
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '';
  
  return new Intl.NumberFormat('vi-VN').format(number);
}

/**
 * Format date to dd/mm/yyyy
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date to yyyy/mm/dd (for input fields)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForInput(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${year}/${month}/${day}`;
}

/**
 * Format datetime to dd/mm/yyyy HH:mm
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(datetime) {
  if (!datetime) return '';
  
  const d = typeof datetime === 'string' ? new Date(datetime) : datetime;
  if (isNaN(d.getTime())) return '';
  
  const date = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${date} ${hours}:${minutes}`;
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone string
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Vietnam phone format
  if (cleaned.startsWith('84')) {
    // +84 XX XXX XXXX
    const match = cleaned.match(/^(84)(\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
  } else if (cleaned.startsWith('0')) {
    // 0XX XXX XXXX
    const match = cleaned.match(/^(0\d{2})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  }
  
  return phone;
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format duration in milliseconds to human readable
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms) {
  if (!ms || ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format transaction ID
 * @param {string} id - Transaction ID
 * @returns {string} Formatted ID
 */
export function formatTransactionId(id) {
  if (!id) return '';
  
  // Add prefix if not present
  if (!id.startsWith('GD')) {
    return `GD${id}`;
  }
  
  return id;
}

/**
 * Format status with color
 * @param {string} status - Status text
 * @returns {object} {text: string, color: string}
 */
export function formatStatus(status) {
  const statusMap = {
    'completed': { text: 'Hoàn thành', color: '#4CAF50' },
    'pending': { text: 'Đang chờ', color: '#FF9800' },
    'cancelled': { text: 'Đã hủy', color: '#F44336' },
    'paid': { text: 'Đã thanh toán', color: '#4CAF50' },
    'unpaid': { text: 'Chưa thanh toán', color: '#F44336' },
    'partial': { text: 'Thanh toán một phần', color: '#FF9800' }
  };
  
  return statusMap[status] || { text: status, color: '#757575' };
}

/**
 * Format table row number based on pagination
 * @param {number} index - Item index in current page
 * @param {number} page - Current page (1-based)
 * @param {number} pageSize - Items per page
 * @returns {number} Row number
 */
export function formatRowNumber(index, page, pageSize) {
  return (page - 1) * pageSize + index + 1;
}

/**
 * Parse currency string to number
 * @param {string} currencyStr - Currency string
 * @returns {number} Numeric value
 */
export function parseCurrency(currencyStr) {
  if (!currencyStr) return 0;
  
  // Remove currency symbol and thousand separators
  const cleaned = currencyStr.toString()
    .replace(/[^\d,-]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  
  return parseFloat(cleaned) || 0;
}

/**
 * Format name (capitalize first letter of each word)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export function formatName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}