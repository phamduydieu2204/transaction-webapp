/**
 * cashFlowVsAccrualReport.js
 * 
 * Main orchestrator for Cash Flow vs Accrual Report
 * Coordinates all modules to generate comprehensive comparison report
 */

// Import all modules
    };
  } catch (error) {
    console.error('❌ Error rendering report:', error);
  });
      options: {}
    });
  }
  
  // Initialize accrual chart
  });
      options: {}
    });
  }
}

/**
 * Prepare chart data for Chart.js
 */
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    }]
  };
}

/**
 * Prepare accrual chart data
 */
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    }]
  };
}

/**
 * Get chart options
 */
      },
      }
    },
            return formatCurrencyShort(value);
          }
        }
      }
    }
  };
}

/**
 * Format month label
 */
function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  return `${month}/${year}`;
}

/**
 * Format currency short
 */
function formatCurrencyShort(amount) {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return `${(amount / 1000).toFixed(0)}K`;
}

// Export for global access
window.renderCashFlowVsAccrualReport = renderCashFlowVsAccrualReport;