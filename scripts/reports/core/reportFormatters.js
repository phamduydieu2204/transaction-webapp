/**
 * reportFormatters.js
 * 
 * Data formatting utilities for reports
 */

/**
 * Format revenue amount with proper currency symbol
 * @param {number} amount - Revenue amount
 * @returns {string} Formatted revenue
 */
export function formatRevenue(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 VND';
  
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
}

/**
 * Format percentage value
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  
  return value.toFixed(decimals) + '%';
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatLargeNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
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
 * Format duration in days
 * @param {number} days - Number of days
 * @returns {string} Formatted duration
 */
export function formatDuration(days) {
  if (typeof days !== 'number' || isNaN(days)) return '0 ngày';
  
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    return `${years} năm${remainingDays > 0 ? ` ${remainingDays} ngày` : ''}`;
  } else if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return `${months} tháng${remainingDays > 0 ? ` ${remainingDays} ngày` : ''}`;
  }
  
  return `${days} ngày`;
}

/**
 * Format relative time (e.g., "2 ngày trước", "trong 5 ngày")
 * @param {Date|string} date - Target date
 * @returns {string} Formatted relative time
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hôm nay';
  } else if (diffDays === 1) {
    return 'Ngày mai';
  } else if (diffDays === -1) {
    return 'Hôm qua';
  } else if (diffDays > 0) {
    return `Trong ${diffDays} ngày`;
  } else {
    return `${Math.abs(diffDays)} ngày trước`;
  }
}

/**
 * Format month-year for display
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted month-year
 */
export function formatMonthYear(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format quarter for display
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted quarter
 */
export function formatQuarter(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const quarter = Math.floor(d.getMonth() / 3) + 1;
  return `Q${quarter} ${d.getFullYear()}`;
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Vietnamese phone numbers
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone; // Return original if doesn't match patterns
}

/**
 * Format list of items for display
 * @param {Array} items - Array of items
 * @param {number} maxItems - Maximum items to show
 * @returns {string} Formatted list
 */
export function formatItemList(items, maxItems = 3) {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  if (items.length <= maxItems) {
    return items.join(', ');
  }
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  return `${visible.join(', ')} và ${remaining} mục khác`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'date-only')
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    case 'long':
      return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    case 'date-only':
      return d.toLocaleDateString('vi-VN');
    case 'datetime':
      return d.toLocaleString('vi-VN');
    default:
      return d.toLocaleDateString('vi-VN');
  }
}