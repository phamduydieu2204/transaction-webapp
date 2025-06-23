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
  });

  });
}

/**
 * Formats percentage with proper symbol
 * @param {number} percentage - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
    },
    },
    }
  };
  });

  });
}

/**
 * Formats duration in days to human readable format
 * @param {number} days - Number of days
 * @returns {string} - Formatted duration string
 */
  };
  };
  const colorClass = colors[direction] || "secondary";
  
  return {
    text: `${icon}${formattedRate}%`,
  };
}

/**
 * Formats ROI with proper styling
 * @param {number} roi - ROI percentage
 * @returns {Object} - Formatted ROI with styling info
 */
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
  };
}

/**
 * Formats profit margin with styling
 * @param {number} margin - Profit margin percentage
 * @returns {Object} - Formatted margin with styling info
 */
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