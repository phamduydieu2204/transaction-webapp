/**
 * transactionTypeManager.js
 * 
 * Manages dynamic transaction type dropdown options and tooltips
 * Based on original transaction status when editing
 */

export const TRANSACTION_TYPES = {
  // All possible transaction types in the correct order
  ALL_TYPES: [
    {
      value: "Đã hoàn tất",
      label: "Đã hoàn tất", 
      tooltip: "Giao dịch đã được thanh toán và đã giao hàng cho khách"
    },
    {
      value: "Đã thanh toán", 
      label: "Đã thanh toán",
      tooltip: "Khách hàng đã thực hiện thanh toán nhưng bên bán chưa giao hàng"
    },
    {
      value: "Chưa thanh toán",
      label: "Chưa thanh toán",
      tooltip: "Bên bán đã giao hàng nhưng khách hàng chưa thực hiện chuyển khoản"
    },
    {
      value: "Hoàn tiền",
      label: "Hoàn tiền",
      tooltip: "Giao dịch đã hoàn tất nhưng khách hàng không hài lòng và mong muốn được hoàn tiền"
    },
    {
      value: "Hủy giao dịch", 
      label: "Hủy giao dịch",
      tooltip: "Giao dịch không hoàn tất do khách hàng không chuyển tiền hoặc bên bán không thể giao hàng"
    }
  ],
  
  // Default states for new transactions (includes all types for search purposes)
  DEFAULT: [
    {
      value: "Đã hoàn tất",
      label: "Đã hoàn tất", 
      tooltip: "Giao dịch đã được thanh toán và đã giao hàng cho khách"
    },
    {
      value: "Đã thanh toán", 
      label: "Đã thanh toán",
      tooltip: "Khách hàng đã thực hiện thanh toán nhưng bên bán chưa giao hàng"
    },
    {
      value: "Chưa thanh toán",
      label: "Chưa thanh toán",
      tooltip: "Bên bán đã giao hàng nhưng khách hàng chưa thực hiện chuyển khoản"
    },
    {
      value: "Hoàn tiền",
      label: "Hoàn tiền",
      tooltip: "Giao dịch đã hoàn tất nhưng khách hàng không hài lòng và mong muốn được hoàn tiền"
    },
    {
      value: "Hủy giao dịch", 
      label: "Hủy giao dịch",
      tooltip: "Giao dịch không hoàn tất do khách hàng không chuyển tiền hoặc bên bán không thể giao hàng"
    }
  ],
  
  // Edit rules based on original transaction status
  EDIT_RULES: {
    "Đã hoàn tất": ["Đã hoàn tất", "Hoàn tiền"],
    "Chưa thanh toán": ["Đã hoàn tất", "Chưa thanh toán", "Hủy giao dịch"],
    "Đã thanh toán": ["Đã hoàn tất", "Đã thanh toán", "Hủy giao dịch"],
    "Hoàn tiền": ["Hoàn tiền"],
    "Hủy giao dịch": ["Hủy giao dịch"]
  }
};

/**
 * Initialize transaction type dropdown for new transactions
 */
export function initTransactionTypeDropdown() {
  const select = document.getElementById('transactionType');
  if (!select) return;
  
  console.log('🔄 Initializing transaction type dropdown for new transaction');
  
  // Clear existing options except the placeholder
  while (select.children.length > 1) {
    select.removeChild(select.lastChild);
  }
  
  // Add default options
  TRANSACTION_TYPES.DEFAULT.forEach(type => {
    const option = document.createElement('option');
    option.value = type.value;
    option.textContent = type.label;
    option.title = type.tooltip;
    select.appendChild(option);
  });
  
  console.log('✅ Transaction type dropdown initialized with default options');
}

/**
 * Update transaction type dropdown for editing based on original status
 * @param {string} originalStatus - The original transaction status
 * @param {string} currentValue - Current selected value to maintain
 */
export function updateTransactionTypeForEdit(originalStatus, currentValue = '') {
  const select = document.getElementById('transactionType');
  if (!select) return;
  
  console.log('🔄 Updating transaction type dropdown for edit mode:', {
    originalStatus,
    currentValue
  });
  
  // Clear existing options except the placeholder
  while (select.children.length > 1) {
    select.removeChild(select.lastChild);
  }
  
  // Get allowed options based on original status
  const allowedOptions = TRANSACTION_TYPES.EDIT_RULES[originalStatus] || [];
  
  if (allowedOptions.length === 0) {
    console.warn(`⚠️ No edit rules found for status: ${originalStatus}`);
    return;
  }
  
  // Add options in the correct order based on ALL_TYPES sequence
  TRANSACTION_TYPES.ALL_TYPES.forEach(type => {
    if (allowedOptions.includes(type.value)) {
      const option = document.createElement('option');
      option.value = type.value;
      option.textContent = type.label;
      option.title = type.tooltip;
      select.appendChild(option);
    }
  });
  
  console.log(`✅ Added ${allowedOptions.length} options for ${originalStatus}:`, allowedOptions);
  
  // Set current value if provided
  if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
    select.value = currentValue;
    console.log(`✅ Set current value: ${currentValue}`);
  }
}

/**
 * Get tooltip for a transaction type
 * @param {string} transactionType - The transaction type value
 * @returns {string} The tooltip text
 */
export function getTransactionTypeTooltip(transactionType) {
  // Check default types
  const defaultType = TRANSACTION_TYPES.DEFAULT.find(type => type.value === transactionType);
  if (defaultType) return defaultType.tooltip;
  
  // Check edit states
  const editState = Object.values(TRANSACTION_TYPES.EDIT_STATES).find(type => type.value === transactionType);
  if (editState) return editState.tooltip;
  
  return '';
}

/**
 * Check if transaction type is valid for file sharing
 * @param {string} transactionType - The transaction type value
 * @returns {boolean} True if should share files
 */
export function shouldShareFiles(transactionType) {
  return transactionType === "Đã hoàn tất" || transactionType === "Dùng thử";
}

/**
 * Check if transaction type indicates completion
 * @param {string} transactionType - The transaction type value
 * @returns {boolean} True if transaction is completed
 */
export function isCompletedTransaction(transactionType) {
  return transactionType === "Đã hoàn tất";
}

/**
 * Check if transaction type indicates a pending state
 * @param {string} transactionType - The transaction type value
 * @returns {boolean} True if transaction is pending
 */
export function isPendingTransaction(transactionType) {
  return transactionType === "Chưa thanh toán" || transactionType === "Đã thanh toán";
}