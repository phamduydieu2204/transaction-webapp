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
  };
}

/**
 * Sanitizes string input
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
}

/**
 * Sanitizes date input
 * @param {any} input - Date value to sanitize
 * @returns {Date|null} - Sanitized date or null
 */
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
  });

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
  });

      });
    }
  });
    amount: sanitizeNumber(expense.amount || expense.soTien, 0),
  };
}

/**
 * Sanitizes transaction data
 * @param {Object} transaction - Transaction to sanitize
 * @returns {Object} - Sanitized transaction
 */
    amount: sanitizeNumber(transaction.amount || transaction.soTien, 0),
  };
}

/**
 * Checks data integrity
 * @param {Array} data - Data array to check
 * @param {string} type - Data type ('expense' or 'transaction')
 * @returns {Object} - Integrity check results
 */
  };
  });

      });
    }
    
    // Check duplicates
  });
        error: `Duplicate ID: ${id}`
      });
    }
    seen.add(id);
  });
  
  return results;
}