/**
 * dataValidators.js
 * 
 * Handles data validation, sanitization, and integrity checks
 * Ensures data quality and consistency
 */

/**
 * Validates expense data structure
 * @param {Object} expense - Expense object to validate
 * @returns {Object} - Validation result {isValid, errors}
 */
export function validateExpenseData(expense) {
  const errors = [];
  
  if (!expense || typeof expense !== 'object') {
    return { isValid: false, errors: ['Invalid expense object'] };
  }
  
  // Required fields
  if (!expense.date && !expense.ngayTao) {
    errors.push('Date is required');
  }
  
  if (expense.amount === undefined && expense.soTien === undefined) {
    errors.push('Amount is required');
  }
  
  // Validate amount
  const amount = parseFloat(expense.amount || expense.soTien);
  if (isNaN(amount) || amount < 0) {
    errors.push('Amount must be a positive number');
  }
  
  // Validate date
  const date = new Date(expense.date || expense.ngayTao);
  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
  }
  
  // Validate category
  if (!expense.category && !expense.loaiChiPhi) {
    errors.push('Category is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates transaction data structure
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} - Validation result {isValid, errors}
 */
export function validateTransactionData(transaction) {
  const errors = [];
  
  if (!transaction || typeof transaction !== 'object') {
    return { isValid: false, errors: ['Invalid transaction object'] };
  }
  
  // Required fields
  if (!transaction.date && !transaction.ngayTao) {
    errors.push('Date is required');
  }
  
  if (transaction.amount === undefined && transaction.soTien === undefined) {
    errors.push('Amount is required');
  }
  
  // Validate amount
  const amount = parseFloat(transaction.amount || transaction.soTien);
  if (isNaN(amount) || amount < 0) {
    errors.push('Amount must be a positive number');
  }
  
  // Validate date
  const date = new Date(transaction.date || transaction.ngayTao);
  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
  }
  
  // Validate customer
  if (!transaction.customer && !transaction.khachHang) {
    errors.push('Customer is required');
  }
  
  // Validate software
  if (!transaction.software && !transaction.phanMem) {
    errors.push('Software is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sanitizes string input
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitizes numeric input
 * @param {any} input - Value to sanitize
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} - Sanitized number
 */
export function sanitizeNumber(input, defaultValue = 0) {
  const num = parseFloat(input);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Sanitizes date input
 * @param {any} input - Date value to sanitize
 * @returns {Date|null} - Sanitized date or null
 */
export function sanitizeDate(input) {
  if (!input) return null;
  
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validates and sanitizes expense array
 * @param {Array} expenses - Array of expenses
 * @returns {Object} - {valid: [], invalid: []}
 */
export function validateExpenseArray(expenses) {
  if (!Array.isArray(expenses)) {
    return { valid: [], invalid: [] };
  }
  
  const valid = [];
  const invalid = [];
  
  expenses.forEach((expense, index) => {
    const validation = validateExpenseData(expense);
    
    if (validation.isValid) {
      valid.push(sanitizeExpenseData(expense));
    } else {
      invalid.push({
        index: index,
        data: expense,
        errors: validation.errors
      });
    }
  });
  
  return { valid, invalid };
}

/**
 * Validates and sanitizes transaction array
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - {valid: [], invalid: []}
 */
export function validateTransactionArray(transactions) {
  if (!Array.isArray(transactions)) {
    return { valid: [], invalid: [] };
  }
  
  const valid = [];
  const invalid = [];
  
  transactions.forEach((transaction, index) => {
    const validation = validateTransactionData(transaction);
    
    if (validation.isValid) {
      valid.push(sanitizeTransactionData(transaction));
    } else {
      invalid.push({
        index: index,
        data: transaction,
        errors: validation.errors
      });
    }
  });
  
  return { valid, invalid };
}

/**
 * Sanitizes expense data
 * @param {Object} expense - Expense to sanitize
 * @returns {Object} - Sanitized expense
 */
export function sanitizeExpenseData(expense) {
  return {
    id: sanitizeString(expense.id || expense.timestamp || ''),
    date: sanitizeDate(expense.date || expense.ngayTao),
    amount: sanitizeNumber(expense.amount || expense.soTien, 0),
    category: sanitizeString(expense.category || expense.loaiChiPhi || 'Unknown'),
    description: sanitizeString(expense.description || expense.moTa || ''),
    bank: sanitizeString(expense.bank || expense.nganHang || ''),
    status: sanitizeString(expense.status || 'active'),
    createdAt: sanitizeDate(expense.createdAt || expense.timestamp),
    updatedAt: sanitizeDate(expense.updatedAt || expense.timestamp)
  };
}

/**
 * Sanitizes transaction data
 * @param {Object} transaction - Transaction to sanitize
 * @returns {Object} - Sanitized transaction
 */
export function sanitizeTransactionData(transaction) {
  return {
    id: sanitizeString(transaction.id || transaction.timestamp || ''),
    date: sanitizeDate(transaction.date || transaction.ngayTao),
    amount: sanitizeNumber(transaction.amount || transaction.soTien, 0),
    type: sanitizeString(transaction.type || transaction.loaiGiaoDich || 'revenue'),
    customer: sanitizeString(transaction.customer || transaction.khachHang || ''),
    software: sanitizeString(transaction.software || transaction.phanMem || ''),
    package: sanitizeString(transaction.package || transaction.goiDichVu || ''),
    status: sanitizeString(transaction.status || 'active'),
    createdAt: sanitizeDate(transaction.createdAt || transaction.timestamp),
    updatedAt: sanitizeDate(transaction.updatedAt || transaction.timestamp)
  };
}

/**
 * Checks data integrity
 * @param {Array} data - Data array to check
 * @param {string} type - Data type ('expense' or 'transaction')
 * @returns {Object} - Integrity check results
 */
export function checkDataIntegrity(data, type) {
  const results = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    duplicates: 0,
    issues: []
  };
  
  if (!Array.isArray(data)) {
    results.issues.push('Data is not an array');
    return results;
  }
  
  results.totalRecords = data.length;
  
  const seen = new Set();
  const validator = type === 'expense' ? validateExpenseData : validateTransactionData;
  
  data.forEach((item, index) => {
    // Check validity
    const validation = validator(item);
    if (validation.isValid) {
      results.validRecords++;
    } else {
      results.invalidRecords++;
      results.issues.push({
        index: index,
        errors: validation.errors
      });
    }
    
    // Check duplicates
    const id = item.id || item.timestamp;
    if (id && seen.has(id)) {
      results.duplicates++;
      results.issues.push({
        index: index,
        error: `Duplicate ID: ${id}`
      });
    }
    seen.add(id);
  });
  
  return results;
}