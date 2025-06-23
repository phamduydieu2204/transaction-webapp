/**
 * calculations.js
 * 
 * Core calculation functions for statistics
 * Handles revenue/expense calculations, growth metrics, and financial analysis
 */
  };
  };
    totals[transactionCurrency] += revenue;
  });

  return totals;
}

/**
 * Calculates profit margins and financial ratios
 * @param {Object} revenue - Revenue totals by currency
 * @param {Object} expenses - Expense totals by currency
 * @returns {Object} - Financial analysis results
 */
export function calculateFinancialAnalysis(revenue, expenses) {
  const analysis = {
    profit: {},
    profitMargin: {},
    expenseRatio: {},
    summary: {}
  };
  });

  // Overall summary
  };
    };
  }
  };
}

/**
 * Calculate allocated expense for a period based on software validity period
 * Logic: If expense has Phân bổ = Có and valid Ngày giao dịch + Ngày tái tục,
 * divide the cost evenly across the validity period.
 * Only count the portion that falls within the target period.
 * @param {Object} expense - Expense record
 * @param {Object} dateRange - Date range for allocation calculation
 * @returns {number} - Allocated amount for the period
 */
      'Phân bổ': expense['Phân bổ'],
      'Ngày tái tục': expense['Ngày tái tục'],
      'Ngày chi': expense['Ngày chi'],
      'Số tiền': expense['Số tiền']
    });
  }
  
  // Check multiple possible field names for allocation
      'Phân bổ': expense['Phân bổ'],
    'Ngày chi': expense['Ngày chi'],
    'Ngày tái tục': expense['Ngày tái tục'],
  // Must have both dates for allocation
             !renewalDate ? 'No renewal date' : 
             'Renewal date <= transaction date'
    });
    'Số tiền': expense['Số tiền'],
    };
  }
  
  // Parse target period
      'transactionDate.getTime()': transactionDate.getTime(),
      'renewalDate.getTime()': renewalDate.getTime(),
      'diff in ms': renewalDate.getTime() - transactionDate.getTime(),
      'diff in days (raw)': (renewalDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
    });
  }
  
  // If no overlap, return 0
    periodRange: `${dateRange.start} to ${dateRange.end}`,
    validDaysInPeriod,
    calculation: `${dailyAmount.toFixed(2)} × ${validDaysInPeriod} days`,
 * @param {Object} expense - Expense record  
 * @param {Object} dateRange - Date range for cash flow calculation
 * @returns {number} - Actual expense amount if paid in period, 0 otherwise
 */
    };
  }
      periodRange: `${dateRange.start} to ${dateRange.end}`,
    };
  }
  
  // Create date range for target month
  };
  
  const breakdown = {
    targetMonth: `${targetMonth.year}/${String(targetMonth.month).padStart(2, '0')}`,
    totalAllocatedExpense: 0,    // Chi phí phân bổ tháng
    totalActualExpense: 0,       // Chi phí thực tế
    allocatedDetails: [],        // Chi tiết phân bổ
    actualDetails: [],           // Chi tiết thực tế
      VND: { allocated: 0, actual: 0 },
      USD: { allocated: 0, actual: 0 },
      NGN: { allocated: 0, actual: 0 }
    }
  };
  });

      });
    }
    
    // Calculate actual amount paid in the month
  });

      });
    }
  });
  
  // Convert everything to VND for totals
  return breakdown;
}

// Make functions available globally for backward compatibility
window.calculateTotalExpenses = calculateTotalExpenses;
window.calculateTotalRevenue = calculateTotalRevenue;
window.calculateFinancialAnalysis = calculateFinancialAnalysis;
window.calculateGrowthRate = calculateGrowthRate;
window.calculateAllocatedExpense = calculateAllocatedExpense;
window.calculateActualExpense = calculateActualExpense;
window.calculateMonthlyExpenseBreakdown = calculateMonthlyExpenseBreakdown;