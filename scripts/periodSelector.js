/**
 * periodSelector.js
 * 
 * Handles period selection for statistics reports
 */

// Current selected period
    'yesterday': 'Hôm qua',
    'this_week': 'Tuần này',
    'last_week': 'Tuần trước',
    'last_7_days': '7 ngày qua',
    'this_month': 'Tháng này',
    'last_month': 'Tháng trước',
    'last_30_days': '30 ngày qua',
    'this_quarter': 'Quý này',
    'last_quarter': 'Quý trước',
    'this_year': 'Năm nay',
    'last_year': 'Năm trước',
    'all_time': 'Tất cả thời gian',
    'custom': 'Tùy chỉnh'
  };
      startDate.setDate(today.getDate() - 6);
      endDate = new Date(today);
      break;
      
    case 'this_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
      
    case 'last_month':
      startDate = new Date(year, quarter * 3, 1);
      endDate = new Date(year, quarter * 3 + 3, 0);
      break;
      
    case 'this_year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
      
    case 'last_year':
    };
  }
    });
  }
  
  // Refresh current report with new date range
      };
      window.loadOverviewReport(options);
    }
  }
}

/**
 * Show custom date picker
 */
function showCustomDatePicker() {
  // This would open a date picker modal
  // For now, just use the existing filter panel
  if (window.toggleFilterPanel) {
    window.toggleFilterPanel();
    
    // Switch to custom date tab
    if (window.selectPeriod) {
      window.selectPeriod('custom');
    }
  }
}

/**
 * Initialize period selector
 */
export function initPeriodSelector() {
  
  // Set initial period from saved filters
  if (window.globalFilters && window.globalFilters.period) {
    currentReportPeriod = window.globalFilters.period;
    updatePeriodUI(currentReportPeriod);
  }
  
  // Close dropdown on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const dropdown = document.querySelector('.period-dropdown');
      if (dropdown && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
      }
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPeriodSelector);
} else {
  initPeriodSelector();
}