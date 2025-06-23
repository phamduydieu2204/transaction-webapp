/**
 * categoryDataProcessors.js
 * 
 * Data processing functions for expense categories
 * Handles data grouping, calculations, and transformations
 */

import { normalizeDate } from '../statisticsCore.js';

/**
 * Define main categories with configuration
 * @returns {Object} Main categories configuration
 */
export function getMainCategories() {
  return {
    'Kinh doanh phần mềm': { color: '#667eea', icon: '💻' },
    'Sinh hoạt cá nhân': { color: '#f093fb', icon: '🏠' },
    'Kinh doanh Amazon': { color: '#4facfe', icon: '📦' },
    'Khác': { color: '#fa709a', icon: '📌' }
  };
}

/**
 * Calculate expense data by category for last 12 months
 * @param {Array} expenseData - Expense records
 * @returns {Object} Category data for chart
 */
  });
      monthly: {},
    };
  });
  
  // Initialize last 12 months
      monthLabel: `${date.getMonth() + 1}/${date.getFullYear()}`,
      ...Object.keys(mainCategories).reduce((acc, cat) => {
    categoryPercentages: {},
  };
  
  // Calculate total expense
    };
  }
  
  // Calculate category percentages
  });
  
  // Get top subcategories across all categories
  });

  });
    });
  });
  });
        ...Object.keys(mainCategories).reduce((acc, cat) => {
          acc[cat] = 0;
          return acc;
        }, {})
      };
    }
    
    grouped[periodKey].total += amount;
    grouped[periodKey][mainCategory] += amount;
  });
  
  return grouped;
}

/**
 * Get period key based on date and period type
 * @param {Date} date - Date object
 * @param {string} period - Period type
 * @returns {string} Period key
 */
function getPeriodKey(date, period) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (period) {
    case 'daily':
      return `${year}-Q${quarter}`;
    case 'monthly':
  }
}

/**
 * Get week number of the year
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}