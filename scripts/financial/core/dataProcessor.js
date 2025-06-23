/**
 * dataProcessor.js
 * 
 * Core data processing utilities for financial dashboard
 * Handles data transformation, filtering, and calculations
 */
  period: 'current_month', // current_month, last_month, custom
  selectedSoftware: [], // Array of selected software names
  compareMode: 'none', // none, previous_period, same_period_last_year
};

// Make available globally
  // Revenue breakdown by software
  };
}

/**
 * Calculate revenue breakdown by software organization
 * @param {Array} transactionData - Transaction records
 * @returns {Object} Revenue breakdown by software
 */
  });

      };
    }
  });
  });

      };
    }
  });
  });

    };
  });
    burnRate: recentExpenses / 30, // Daily burn rate
  };
}

/**
 * Calculate growth metrics compared to previous periods
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @returns {Object} Growth metrics
 */
  };
}