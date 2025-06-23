/**
 * dataTransformers.js
 * 
 * Handles data transformation, normalization, and formatting
 * Converts data between different formats and structures
 */

/**
 * Converts array of objects to CSV format
 * @param {Array} data - Data to convert
 * @returns {string} - CSV formatted string
 */
  });

  }));
}

/**
 * Normalizes transaction data structure
 * @param {Array} transactions - Raw transaction data
 * @returns {Array} - Normalized transaction data
 */
  });

  }));
}

/**
 * Formats currency value for display
 * @param {number} value - Numeric value
 * @param {string} currency - Currency code (default: VND)
 * @returns {string} - Formatted currency string
 */
  });

    }).format(numValue);
  }
  });

  }).format(numValue);
}

/**
 * Formats date for display
 * @param {string|Date} date - Date value
 * @param {string} format - Date format (default: 'DD/MM/YYYY')
 * @returns {string} - Formatted date string
 */
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
  }
}

/**
 * Aggregates data by period (day, week, month, year)
 * @param {Array} data - Data to aggregate
 * @param {string} period - Aggregation period
 * @param {string} valueField - Field to sum
 * @returns {Object} - Aggregated data by period
 */
export function aggregateByPeriod(data, period = 'month', valueField = 'amount') {
  if (!Array.isArray(data) || data.length === 0) return {};
  
  const aggregated = {};
  
  data.forEach(item => {
    const date = new Date(item.date || item.ngayTao);
    let key;
    
    switch (period) {
      case 'day':
        key = `${date.getFullYear()}-W${weekNum}`;
        break;
      case 'month':
        break;
      default:
      };
    }
      };
    }
    } else {
    }
  });
}