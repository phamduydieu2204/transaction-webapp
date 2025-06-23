/**
 * dataUtilities.js
 * 
 * Data utilities for statistics
 * Handles date normalization, data filtering, and sorting operations
 */

/**
 * Normalizes different date formats to yyyy/mm/dd
 * @param {string|Date} dateInput - Input date in various formats
 * @returns {string} - Normalized date string in yyyy/mm/dd format
 */
export function normalizeDate(dateInput) {
  if (!dateInput) return "";
  
  let date;
  if (typeof dateInput === 'string') {
    // Handle ISO string like "2025-05-21T17:00:00.000Z"
  });

      };
    }
        },
      };
    }
    }
  });
    }
  });

  return summaryArray;
}

// Make functions available globally for backward compatibility
window.normalizeDate = normalizeDate;
window.groupTransactionsByTenChuan = groupTransactionsByTenChuan;
window.groupExpensesByTenChuan = groupExpensesByTenChuan;
window.groupExpensesByMonth = groupExpensesByMonth;
window.groupRevenueByMonth = groupRevenueByMonth;