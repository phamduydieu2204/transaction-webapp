export function formatDate(dateString) {
    if (!dateString) return "";
    return dateString;
}

/**
 * Format currency to Vietnamese format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "0 VNĐ";
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format revenue (alias for formatCurrency)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted revenue string
 */
export function formatRevenue(amount) {
  return formatCurrency(amount);
}