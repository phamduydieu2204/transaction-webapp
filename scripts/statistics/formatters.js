/**
 * formatters.js
 * 
 * Formatting utilities for statistics
 * Handles currency, number, and date formatting for display
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
 * Formats number with proper thousands separators
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export function formatNumber(number, decimals = 0) {
  if (typeof number !== 'number' || isNaN(number)) return "0";
  
  return number.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats percentage with proper symbol
 * @param {number} percentage - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(percentage, decimals = 1) {
  if (typeof percentage !== 'number' || isNaN(percentage)) return "0%";
  
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formats large numbers with K/M/B suffixes
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number with suffix
 */
export function formatLargeNumber(number, decimals = 1) {
  if (typeof number !== 'number' || isNaN(number)) return "0";
  
  const absNumber = Math.abs(number);
  const sign = number < 0 ? '-' : '';
  
  if (absNumber >= 1e9) {
    return `${sign}${(absNumber / 1e9).toFixed(decimals)}B`;
  } else if (absNumber >= 1e6) {
    return `${sign}${(absNumber / 1e6).toFixed(decimals)}M`;
  } else if (absNumber >= 1e3) {
    return `${sign}${(absNumber / 1e3).toFixed(decimals)}K`;
  } else {
    return `${sign}${absNumber.toFixed(decimals)}`;
  }
}

/**
 * Formats date for display in Vietnamese format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ("short", "long", "medium")
 * @returns {string} - Formatted date string
 */
export function formatDateDisplay(date, format = "short") {
  if (!date) return "";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  
  const options = {
    short: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    },
    medium: { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    },
    long: { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }
  };
  
  return dateObj.toLocaleDateString('vi-VN', options[format] || options.short);
}

/**
 * Formats month/year for period displays
 * @param {string} monthString - Month in yyyy/mm format
 * @returns {string} - Formatted month/year string
 */
export function formatMonthYear(monthString) {
  if (!monthString || !monthString.includes('/')) return monthString;
  
  const [year, month] = monthString.split('/');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  return date.toLocaleDateString('vi-VN', { 
    month: 'long', 
    year: 'numeric' 
  });
}

/**
 * Formats duration in days to human readable format
 * @param {number} days - Number of days
 * @returns {string} - Formatted duration string
 */
export function formatDuration(days) {
  if (typeof days !== 'number' || isNaN(days) || days < 0) return "0 ngày";
  
  if (days === 0) return "0 ngày";
  if (days === 1) return "1 ngày";
  if (days < 30) return `${days} ngày`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} tháng`;
    } else {
      return `${months} tháng ${remainingDays} ngày`;
    }
  } else {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    const days_left = remainingDays % 30;
    
    let result = `${years} năm`;
    if (months > 0) result += ` ${months} tháng`;
    if (days_left > 0) result += ` ${days_left} ngày`;
    
    return result;
  }
}

/**
 * Formats growth rate with direction indicator
 * @param {number} rate - Growth rate percentage
 * @param {string} direction - Direction ("up", "down", "neutral")
 * @param {boolean} showIcon - Whether to show direction icon
 * @returns {string} - Formatted growth rate with indicator
 */
export function formatGrowthRate(rate, direction, showIcon = true) {
  if (typeof rate !== 'number' || isNaN(rate)) return "0%";
  
  const formattedRate = rate.toFixed(1);
  const icons = {
    up: "📈",
    down: "📉", 
    neutral: "➡️"
  };
  
  const colors = {
    up: "success",
    down: "danger",
    neutral: "secondary"
  };
  
  const icon = showIcon && icons[direction] ? icons[direction] + " " : "";
  const colorClass = colors[direction] || "secondary";
  
  return {
    text: `${icon}${formattedRate}%`,
    colorClass: colorClass,
    value: rate,
    direction: direction
  };
}

/**
 * Formats ROI with proper styling
 * @param {number} roi - ROI percentage
 * @returns {Object} - Formatted ROI with styling info
 */
export function formatROI(roi) {
  if (typeof roi !== 'number' || isNaN(roi)) {
    return {
      text: "0%",
      colorClass: "secondary",
      value: 0,
      performance: "neutral"
    };
  }
  
  const formattedROI = roi.toFixed(1);
  let performance, colorClass, icon;
  
  if (roi >= 100) {
    performance = "excellent";
    colorClass = "success";
    icon = "🚀";
  } else if (roi >= 50) {
    performance = "good";
    colorClass = "success";
    icon = "📈";
  } else if (roi >= 0) {
    performance = "positive";
    colorClass = "warning";
    icon = "📊";
  } else {
    performance = "negative";
    colorClass = "danger";
    icon = "📉";
  }
  
  return {
    text: `${icon} ${formattedROI}%`,
    colorClass: colorClass,
    value: roi,
    performance: performance
  };
}

/**
 * Formats profit margin with styling
 * @param {number} margin - Profit margin percentage
 * @returns {Object} - Formatted margin with styling info
 */
export function formatProfitMargin(margin) {
  if (typeof margin !== 'number' || isNaN(margin)) {
    return {
      text: "0%",
      colorClass: "secondary",
      value: 0,
      level: "unknown"
    };
  }
  
  const formattedMargin = margin.toFixed(1);
  let level, colorClass;
  
  if (margin >= 30) {
    level = "high";
    colorClass = "success";
  } else if (margin >= 15) {
    level = "medium";
    colorClass = "warning";
  } else if (margin >= 0) {
    level = "low";
    colorClass = "info";
  } else {
    level = "negative";
    colorClass = "danger";
  }
  
  return {
    text: `${formattedMargin}%`,
    colorClass: colorClass,
    value: margin,
    level: level
  };
}

// Make functions available globally for backward compatibility
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatPercentage = formatPercentage;
window.formatLargeNumber = formatLargeNumber;
window.formatDateDisplay = formatDateDisplay;
window.formatMonthYear = formatMonthYear;
window.formatDuration = formatDuration;
window.formatGrowthRate = formatGrowthRate;
window.formatROI = formatROI;
window.formatProfitMargin = formatProfitMargin;