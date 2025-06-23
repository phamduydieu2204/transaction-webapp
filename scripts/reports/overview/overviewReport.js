/**
 * overviewReport.js
 * 
 * Overview report functionality - Tổng quan kinh doanh
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatCurrency, formatDate } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { 
  calculateBusinessMetrics,
  calculateTotalRevenue,
  calculateTotalExpenses,
  formatCurrency as formatCurrencyCore,
  normalizeDate,
  getDateRange
} from '../../statisticsCore.js';
import { 
  getTransactionField, 
  normalizeTransaction, 
  getTransactionTypeDisplay,
  hasTransactionStatus 
} from '../../core/dataMapping.js';
import { initOverviewLazyLoading, preloadCriticalElements } from '../../utils/lazyLoader.js';
import { initCSSOptimizations, optimizeFontLoading, addResourceHints } from '../../utils/cssOptimizer.js';

/**
 * Load overview report (Tổng quan kinh doanh)
 * @param {Object} options - Options for loading report
 * @param {Object} options.dateRange - Date range filter {start: 'yyyy/mm/dd', end: 'yyyy/mm/dd'}
 * @param {string} options.period - Period name (e.g., 'this_month', 'last_month')
 */
    // Get data from global variables (primary) or storage (fallback)
    // Get date range from options or global filters
    const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
    const period = options.period || window.globalFilters?.period || 'this_month';

    // Update period display
    updatePeriodDisplay(period);
    
    // Filter data by date range FIRST
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    const filteredExpenses = filterDataByDateRange(expenses, dateRange);
    
    // Calculate KPIs with filtered data (and pass unfiltered data for comparison)
    const kpis = calculateUpdatedBusinessMetrics(filteredTransactions, filteredExpenses, dateRange, transactions);
    console.log('  - Doanh thu gộp:', kpis.grossRevenue);
    console.log('  - Tiền đang chờ thu:', kpis.pendingCollection);
    console.log('  - Tiền đang chờ chi:', kpis.pendingPayment);
    console.log('  - Tổng tiền hoàn trả:', kpis.totalRefunds);
    console.log('  - Tỷ lệ hoàn tiền:', kpis.refundRate);
    
    // Update all components
    
    // Wait a moment for DOM to be ready
    initOverviewLazyLoading();
  } catch (error) {
    console.error('❌ Error loading overview report:', error);
    showOverviewError(error.message);
  }
}

/**
 * Load the overview report HTML template
 */
async function loadOverviewHTML() {
  const container = document.getElementById('report-overview');
  if (!container) return;
  
  try {
    const response = await fetch('./partials/tabs/report-pages/overview-report.html');
    if (!response.ok) {
      console.error('❌ Overview template not found at:', response.url);
        'paid-revenue': !!paidElement,
        'unpaid-revenue': !!unpaidElement,
        'revenue-status-chart': !!revenueStatusChart,
        'status-distribution-chart': !!statusDistChart
      });
      
      // Debug: check what's actually in the container
      const container = document.getElementById('report-overview');
    }, 50);
  } catch (error) {
    console.error('❌ CRITICAL: Could not load new template:', error);
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
    displayElement.textContent = periodLabels[period] || period;
  }
}

/**
 * Filter data by date range
 */
function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  endDate.setHours(23, 59, 59, 999); // Include full end date
  
  return data.filter(item => {
    const itemDate = new Date(item.ngayGiaoDich || item.ngayChiTieu || item.date || item.transactionDate);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Calculate overview KPIs
 * @param {Array} transactions - All transactions
 * @param {Array} expenses - All expenses  
 * @param {Object} dateRange - Date range filter {start, end}
 * @param {string} period - Period name (e.g., 'all_time', 'this_month')
 */
function calculateOverviewKPIs(transactions, expenses, dateRange, period = 'this_month') {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  console.log(`  - Period parameter: "${period}"`);
  console.log(`  - Period === 'all_time':`, period === 'all_time');
  console.log(`  - Using date range:`, dateRange);
  console.log(`  - Total transactions to filter: ${transactions.length}`);
  console.log(`  - Total expenses to filter: ${expenses.length}`);
  
  // NEW SIMPLIFIED LOGIC - Filter data based on period first
  let filteredTransactions, filteredExpenses;
  
  // Check period FIRST
  if (period && period.toString() === 'all_time') {
    // No filtering for all time
    filteredTransactions = transactions;
    filteredExpenses = expenses;
  } else if (dateRange && dateRange.start && dateRange.end) {
    // Use provided date range
    filteredTransactions = filterDataByDateRange(transactions, dateRange);
    filteredExpenses = filterDataByDateRange(expenses, dateRange);
    
    console.log(`  - Transactions: ${transactions.length} → ${filteredTransactions.length}`);
    console.log(`  - Expenses: ${expenses.length} → ${filteredExpenses.length}`);
  } else {
    // Default to current month if no date range
    
    filteredTransactions = transactions.filter(rawTransaction => {
      const t = normalizeTransaction(rawTransaction);
      if (!t) return false;
      
      const transactionDate = new Date(t.transactionDate);
      
      if (isNaN(transactionDate.getTime())) {
        return false;
      }
      
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    filteredExpenses = expenses.filter(e => {
      const rawDate = e.ngayChiTieu || e.date;
      const expenseDate = new Date(rawDate);
      
      if (isNaN(expenseDate.getTime())) {
        return false;
      }
      
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  }
  
  // Calculate totals by transaction status
  const statusBreakdown = {
    completed: { count: 0, revenue: 0 },
    paid: { count: 0, revenue: 0 },
    unpaid: { count: 0, revenue: 0 }
  };
  
  filteredTransactions.forEach(t => {
    const revenue = parseFloat(t.doanhThu || t.revenue || t.Revenue || t.doanh_thu) || 0;
    const status = t.loaiGiaoDich || t.transactionType || t.status || '';
    
    if (status.toLowerCase().includes('hoàn tất')) {
      statusBreakdown.completed.count++;
      statusBreakdown.completed.revenue += revenue;
    } else if (status.toLowerCase().includes('đã thanh toán')) {
      statusBreakdown.paid.count++;
      statusBreakdown.paid.revenue += revenue;
    } else if (status.toLowerCase().includes('chưa thanh toán')) {
      statusBreakdown.unpaid.count++;
      statusBreakdown.unpaid.revenue += revenue;
    }
  });
  
  const totalRevenue = statusBreakdown.completed.revenue + statusBreakdown.paid.revenue + statusBreakdown.unpaid.revenue;
  const totalTransactions = filteredTransactions.length;
  
  console.log('  - Completed:', statusBreakdown.completed);
  console.log('  - Paid:', statusBreakdown.paid);
  console.log('  - Unpaid:', statusBreakdown.unpaid);
  console.log('  - Total revenue:', totalRevenue);
  console.log('  - Total transactions:', totalTransactions);
  
  // Calculate conversion rates
  console.log('  - Completed:', statusBreakdown.completed);
  console.log('  - Paid:', statusBreakdown.paid);
  console.log('  - Unpaid:', statusBreakdown.unpaid);
  console.log('  - Total transactions:', totalTransactions);
  
  // Calculate previous period for comparison
  let prevDateRange = null;
  
  if (dateRange && dateRange.start && dateRange.end) {
    // Calculate previous period based on current date range
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
    
    prevDateRange = {
      start: `${prevStartDate.getFullYear()}/${String(prevStartDate.getMonth() + 1).padStart(2, '0')}/${String(prevStartDate.getDate()).padStart(2, '0')}`,
      end: `${prevEndDate.getFullYear()}/${String(prevEndDate.getMonth() + 1).padStart(2, '0')}/${String(prevEndDate.getDate()).padStart(2, '0')}`
    };
  } else {
    // Previous month
    prevDateRange = {
      start: `${prevYear}/${String(prevMonth + 1).padStart(2, '0')}/01`,
      end: `${prevYear}/${String(prevMonth + 1).padStart(2, '0')}/${new Date(prevYear, prevMonth + 1, 0).getDate()}`
    };
  }
  
  // Filter previous period data
  const prevTransactions = filterDataByDateRange(transactions, prevDateRange);
  
  // Calculate previous period status breakdown
  const prevStatusBreakdown = {
    completed: { count: 0, revenue: 0 },
    paid: { count: 0, revenue: 0 },
    unpaid: { count: 0, revenue: 0 }
  };
    },
    },
    },
    },
    },
  };
}

/**
 * Update KPI cards with calculated data
 */
      growth: 0, // Rate growth calculation can be added later
  });
    // Update status breakdown with new data
  } else {
    // Old template fallback - convert new metrics to old structure
  });
  }
}

/**
 * Update individual KPI card
 */
function updateKPICard(type, data) {
  const valueElement = document.getElementById(data.elementId);
  const changeElement = document.getElementById(data.changeId);

  if (!valueElement) {
    console.warn(`❌ KPI element not found: ${data.elementId}`);
    console.warn(`🔍 Available elements with 'revenue' in ID:`, 
      Array.from(document.querySelectorAll('[id*="revenue"]')).map(el => el.id));
    return;
  }
  
  console.log(`  - Element ID: ${data.elementId}`);
  console.log(`  - Raw value: ${data.value}`);
  console.log(`  - Growth: ${data.growth}%`);
  console.log(`  - Is percentage: ${data.isPercentage}`);
    // Check which template we're using based on class names
      changeElement.innerHTML = `
        <i class="fas ${arrow}"></i>
        <span>${sign}${data.growth.toFixed(1)}%</span>
      `;
      changeElement.className = `kpi-metric-change ${isPositive ? 'positive' : 'negative'}`;
    } else if (isBoxTemplate) {
      // Previous box template
      changeElement.innerHTML = `
        <i class="fas ${arrow}"></i>
        <span>${sign}${data.growth.toFixed(1)}%</span>
      `;
      changeElement.className = `kpi-box-change ${isPositive ? 'positive' : 'negative'}`;
    } else {
      // Legacy template support
      changeElement.innerHTML = `
        <i class="fas ${arrow}"></i> ${sign}${data.growth.toFixed(1)}%
      `;
      changeElement.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
    }
  }
}

/**
 * Update status breakdown display with new metrics
 */
  // Update percentage displays
  const completedPercentElement = document.getElementById('completed-percentage');
  const paidPercentElement = document.getElementById('paid-percentage');
  const unpaidPercentElement = document.getElementById('unpaid-percentage');
  const refundedPercentElement = document.getElementById('refunded-percentage');
  
  if (completedPercentElement) completedPercentElement.textContent = completedPercent.toFixed(1) + '%';
  if (paidPercentElement) paidPercentElement.textContent = paidPercent.toFixed(1) + '%';
  if (unpaidPercentElement) unpaidPercentElement.textContent = unpaidPercent.toFixed(1) + '%';
  if (refundedPercentElement) refundedPercentElement.textContent = refundedPercent.toFixed(1) + '%';
  
  // Update progress bars
  const completedBar = document.getElementById('completed-bar');
  const paidBar = document.getElementById('paid-bar');
  const unpaidBar = document.getElementById('unpaid-bar');
  const refundedBar = document.getElementById('refunded-bar');
  
  if (completedBar) completedBar.style.width = completedPercent + '%';
  if (paidBar) paidBar.style.width = paidPercent + '%';
  if (unpaidBar) unpaidBar.style.width = unpaidPercent + '%';
  if (refundedBar) refundedBar.style.width = refundedPercent + '%';
  
    completed: `${kpis.statusBreakdown.completed.count} (${completedPercent.toFixed(1)}%)`,
    paid: `${kpis.statusBreakdown.paid.count} (${paidPercent.toFixed(1)}%)`,
    unpaid: `${kpis.statusBreakdown.unpaid.count} (${unpaidPercent.toFixed(1)}%)`,
}

/**
 * Update status breakdown display (legacy function for compatibility)
 */
    const completedPercentElement = document.getElementById('completed-percentage');
    const paidPercentElement = document.getElementById('paid-percentage');
    const unpaidPercentElement = document.getElementById('unpaid-percentage');
    
    if (completedPercentElement) completedPercentElement.textContent = completedPercent.toFixed(1) + '%';
    if (paidPercentElement) paidPercentElement.textContent = paidPercent.toFixed(1) + '%';
    if (unpaidPercentElement) unpaidPercentElement.textContent = unpaidPercent.toFixed(1) + '%';
    
    const completedBar = document.getElementById('completed-bar');
    const paidBar = document.getElementById('paid-bar');
    const unpaidBar = document.getElementById('unpaid-bar');
    
    if (completedBar) completedBar.style.width = completedPercent + '%';
    if (paidBar) paidBar.style.width = paidPercent + '%';
    if (unpaidBar) unpaidBar.style.width = unpaidPercent + '%';
  }
}

/**
 * Update conversion rates
 */
function updateConversionRates(conversion) {
  document.getElementById('payment-rate').textContent = conversion.paymentRate.toFixed(1) + '%';
  document.getElementById('completion-rate').textContent = conversion.completionRate.toFixed(1) + '%';
  document.getElementById('success-rate').textContent = conversion.successRate.toFixed(1) + '%';
}

/**
 * Load charts
 */
async function loadCharts(transactions, expenses) {
  try {
    // Since charts were removed, directly update the status detail table
    
    // Calculate detailed status breakdown with amounts
    const statusBreakdown = calculateDetailedStatusBreakdown(transactions);
    
    // Update the status detail table
    updateStatusDetailTable(statusBreakdown);
  } catch (error) {
    console.error('❌ Error updating status details:', error);
  }
}

/**
 * Load Chart.js library dynamically
 */
function loadChartJS() {
  return new Promise((resolve, reject) => {
    if (typeof Chart !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        {
        },
        {
        },
        {
  });

          },
          },
        }
      ]
    },
        }
      },
      },
          text: `Xu hướng doanh thu theo trạng thái - ${getPeriodDisplayName(currentPeriod)}`,
          },
        },
            }
          }
        },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
              return `Kỳ báo cáo: ${tooltipItems[0].label}`;
            },
              return `${context.dataset.label}: ${value} (${percentage}%)`;
            },
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
              return `Tổng: ${formatRevenue(total)}`;
            }
          }
        }
      },
          stacked: false, // Changed to false to show individual bars
          },
            }
          }
        },
          stacked: false, // Changed to false to show individual values
          beginAtZero: false, // Allow negative values to show properly
          grace: '10%', // Add 10% padding above and below
            color: 'rgba(0, 0, 0, 0.1)',
          },
            },
          },
          // Advanced auto-scale for small values visibility
          // Ensure minimum bar height for visibility
        }
      },
      // Plugin to ensure small bars are visible
        {
          beforeDatasetDraw: function(chart, args, options) {
      labels: ['Đã hoàn tất', 'Đã thanh toán', 'Hoàn tiền'],
        data: [statusBreakdown.completed.count, statusBreakdown.paid.count, statusBreakdown.refunded.count]
  });

          // Use brighter colors for small segments to make them more visible
          '#1e8449', // Darker green for better contrast
          '#1f618d', // Darker blue for better contrast
          '#922b21'  // Much darker red for better contrast
        ],
          // Make all borders thicker for better visibility
          // Progressive border thickness based on segment size
          '#2ecc71',
          '#5dade2', 
          '#ec7063'
        ],
          // Thicker hover borders for small segments and refunds
      aspectRatio: 1, // Force 1:1 aspect ratio for perfect circle
      cutout: '40%', // Optimal cutout for modern design
        }
      },
          display: false // Hide default legend, we'll use custom table
        },
            // Brighter background for small segments
          },
          },
          },
            // Thicker border for small segments
          },
            // Larger padding for small segments
          },
              const lines = [
                `Số lượng: ${statusData.count} giao dịch`,
                `Tỷ lệ: ${percentage}%`,
                `Tổng tiền: ${formatRevenue(statusData.amount)}`,
                `Trung bình: ${formatRevenue(statusData.count > 0 ? statusData.amount / statusData.count : 0)}`
              ];
              
              // Add special note for small segments
              const totalCount = statusBreakdown.completed.count + statusBreakdown.paid.count + statusBreakdown.refunded.count;
              const totalAmount = statusBreakdown.completed.amount + statusBreakdown.paid.amount + statusBreakdown.refunded.amount;
              return [
                ``,
                `Tổng cộng: ${totalCount} giao dịch`,
                `Tổng giá trị: ${formatRevenue(totalAmount)}`
              ];
            }
          }
        }
      },
      },
      // Ensure small segments are always visible
      // Enhanced interaction for small segments
      onHover: function(event, activeElements) {
          // Ensure minimum angle for small segments
          spacing: 2, // Add spacing between segments for better visibility
            // Slightly offset small segments to make them more visible
        {
            // Force chart to display full 360 degrees
            const chartArea = chart.chartArea;
            if (chartArea) {
              const ctx = chart.ctx;
              ctx.save();
              
              // Ensure the chart uses full canvas area
              const size = Math.min(chartArea.width, chartArea.height);
              const centerX = chartArea.left + chartArea.width / 2;
              const centerY = chartArea.top + chartArea.height / 2;
              
              // Force circular constraint
              chart.options.circumference = Math.PI * 2;
              chart.options.rotation = 0;
              
              ctx.restore();
            }
          }
        }
      ]
    }
  });
  
  // Force chart to render with full circle
  setTimeout(() => {
    if (window.statusDistributionChart) {
      window.statusDistributionChart.resize();
      window.statusDistributionChart.update('none');
    }
  }, 100);
  
  // Update the detailed status table
  updateStatusDetailTable(statusBreakdown);
  
}

/**
 * Calculate detailed status breakdown with counts and amounts
 * @param {Array} transactions - Transactions to analyze
 * @returns {Object} Detailed breakdown with counts and amounts
 */
function calculateDetailedStatusBreakdown(transactions) {
  const breakdown = {
    completed: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 }
  };
  };
    },
    {
    },
    {
    }
  ];
  
  tableBody.innerHTML = tableRows.map(row => `
    <tr class="${row.className}">
      <td class="status-cell">
        ${row.icon}
        <span class="status-name">${row.status}</span>
      </td>
      <td class="count-cell">${row.count.toLocaleString()}</td>
      <td class="amount-cell ${row.amount < 0 ? 'negative-amount' : 'positive-amount'}">
        ${formatRevenue(row.amount)}
        ${row.amount < 0 ? '<i class="fas fa-exclamation-triangle negative-icon"></i>' : ''}
      </td>
      <td class="percentage-cell">${row.percentage}%</td>
      <td class="avg-cell">${formatRevenue(row.count > 0 ? row.amount / row.count : 0)}</td>
    </tr>
  `).join('');
  
  // Add total row
        <span class="status-name"><strong>Tổng cộng</strong></span>
      </td>
      <td class="count-cell"><strong>${total.count.toLocaleString()}</strong></td>
      <td class="amount-cell ${total.amount < 0 ? 'negative-amount' : 'positive-amount'}">
        <strong>${formatRevenue(total.amount)}</strong>
      </td>
      <td class="percentage-cell"><strong>100.0%</strong></td>
      <td class="avg-cell"><strong>${formatRevenue(total.count > 0 ? total.amount / total.count : 0)}</strong></td>
    </tr>
  `;
  };
}

/**
 * Render expense distribution chart
 */
          '#e74c3c',
          '#f39c12',
          '#f1c40f',
          '#27ae60',
          '#3498db',
          '#9b59b6',
          '#34495e',
          '#e67e22'
        ],
      }]
    },
  });

        }
      }
    }
  });
}

/**
 * Get revenue data for last 6 months grouped by status
 */
function getLastSixMonthsDataByStatus(transactions) {
  const months = [];
  const completed = [];
  const paid = [];
  const refunded = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
  };
}

/**
 * Get yearly data grouped by status (for all_time period)
 */
  const labels = [];
  const completed = [];
  const paid = [];
  const refunded = [];
  
  for (let month = 0; month < 12; month++) {
    const date = new Date(targetYear, month, 1);
    const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
    
    const monthTransactions = transactions.filter(rawTransaction => {
      const t = normalizeTransaction(rawTransaction);
      if (!t) return false;
      const transactionDate = new Date(t.transactionDate);
      return transactionDate.getMonth() === month && 
             transactionDate.getFullYear() === targetYear;
    });
    
    const statusRevenue = calculateRevenueByStatus(monthTransactions);
    
    labels.push(monthName);
    completed.push(statusRevenue.completed);
    paid.push(statusRevenue.paid);
    refunded.push(statusRevenue.refunded);
  }
  
  return { labels, completed, paid, refunded };
}

/**
 * Get weekly data grouped by status (for monthly periods)
 */
function getWeeklyDataByStatus(transactions, period) {
  const now = new Date();
  const labels = [];
  const completed = [];
  const paid = [];
  const refunded = [];
  
  // Get target month based on period
  let targetDate;
  if (period === 'last_month') {
    targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else {
    targetDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  // Get weeks in the target month
  const weeks = getWeeksInMonth(targetDate);
  
  weeks.forEach((week, index) => {
    const weekTransactions = transactions.filter(rawTransaction => {
      const t = normalizeTransaction(rawTransaction);
      if (!t) return false;
      const transactionDate = new Date(t.transactionDate);
      return transactionDate >= week.start && transactionDate <= week.end;
    });
    
    const statusRevenue = calculateRevenueByStatus(weekTransactions);
    
    labels.push(`Tuần ${index + 1}`);
    completed.push(statusRevenue.completed);
    paid.push(statusRevenue.paid);
    refunded.push(statusRevenue.refunded);
  });
  
  return { labels, completed, paid, refunded };
}

/**
 * Get daily data grouped by status (for weekly periods)
 */
function getDailyDataByStatus(transactions, period) {
  const now = new Date();
  const labels = [];
  const completed = [];
  const paid = [];
  const refunded = [];
  
  // Get target week based on period
  let startDate, endDate;
  if (period === 'last_week') {
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
    startDate = lastWeekStart;
    endDate = new Date(lastWeekStart);
    endDate.setDate(lastWeekStart.getDate() + 6);
  } else {
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    startDate = thisWeekStart;
    endDate = new Date(now);
  }
  
  // Generate daily data
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayTransactions = transactions.filter(rawTransaction => {
      const t = normalizeTransaction(rawTransaction);
      if (!t) return false;
      const transactionDate = new Date(t.transactionDate);
      return transactionDate.toDateString() === current.toDateString();
    });
    
    const statusRevenue = calculateRevenueByStatus(dayTransactions);
    
    labels.push(current.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));
  });
    });
    'this_year': 'Năm nay',
    'last_year': 'Năm trước',
    'this_month': 'Tháng này',
    'last_month': 'Tháng trước',
    'last_30_days': '30 ngày qua',
    'this_week': 'Tuần này',
    'last_week': 'Tuần trước',
    'last_7_days': '7 ngày qua',
    'today': 'Hôm nay',
    'yesterday': 'Hôm qua'
  };
  };
}

/**
 * Render revenue trend chart (old template)
 */
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
  });
      }]
    },
        }
      },
              return formatRevenue(value);
            }
          }
        }
      }
    }
  });
}

/**
 * Get revenue data for last 6 months
 */
function getLastSixMonthsData(transactions) {
  const months = [];
  const values = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      }, 0);
    
    months.push(monthName);
    values.push(monthRevenue);
  }
  
  return { labels: months, values: values };
}

/**
 * Update data tables
 */
  });
      };
    }
    customers[customer].revenue += t.revenue || 0;
    customers[customer].transactions += 1;
  });
  
  // Sort by revenue and take top 5
  const topCustomers = Object.values(customers)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  // Update table
  table.innerHTML = topCustomers.map((customer, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${customer.name}</td>
      <td>${formatRevenue(customer.revenue)}</td>
      <td>${customer.transactions}</td>
    </tr>
  `).join('');
}

/**
 * Update recent transactions table
 */
function updateRecentTransactionsTable(transactions) {
  const table = document.querySelector('#recentTransactionsTable tbody');
  if (!table) return;
  
  // Get last 5 transactions
  const recentTransactions = transactions
    .map(rawTransaction => normalizeTransaction(rawTransaction))
    .filter(t => t !== null)
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
    .slice(0, 5);
  
  // Update table
  table.innerHTML = recentTransactions.map(t => `
    <tr>
      <td>${new Date(t.transactionDate).toLocaleDateString('vi-VN')}</td>
      <td>${t.customerName || 'N/A'}</td>
      <td>${t.softwareName || 'N/A'}</td>
      <td>${formatRevenue(t.revenue || 0)}</td>
      <td>
        <span class="status-badge ${(t.transactionType || 'pending').toLowerCase()}">${t.transactionType || 'Pending'}</span>
      </td>
    </tr>
  `).join('');
}

/**
 * Update top expenses table
 */
function updateTopExpensesTable(expenses) {
  const table = document.querySelector('#topExpensesTable tbody');
  if (!table) return;
  
  // Get largest expenses this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = expenses
    .filter(e => {
      const expenseDate = new Date(e.ngayChiTieu || e.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    })
    .sort((a, b) => (parseFloat(b.soTien || b.amount) || 0) - (parseFloat(a.soTien || a.amount) || 0))
    .slice(0, 5);
  
  // Update table
  table.innerHTML = currentMonthExpenses.map(e => `
    <tr>
      <td>${new Date(e.ngayChiTieu || e.date).toLocaleDateString('vi-VN')}</td>
      <td>${e.danhMuc || e.category || 'N/A'}</td>
      <td>${e.moTa || e.description || 'N/A'}</td>
      <td>${formatRevenue(parseFloat(e.soTien || e.amount) || 0)}</td>
    </tr>
  `).join('');
}

/**
 * Load enhanced top products/software data with bestseller analytics
 * @param {Array} transactions - Filtered transactions
 */
async function loadTopProducts(transactions = []) {
  try {
    const container = document.getElementById('top-software-body');
    if (!container) {
      console.warn('❌ Top products container not found');
      return;
    }

    // Use provided transactions or fallback to global
    if (!transactions || transactions.length === 0) {
      transactions = window.transactionList || [];
    }
    
    // Enhanced product analytics
    const productAnalytics = calculateProductAnalytics(transactions);
    
    // Update summary statistics
    updateProductSummary(productAnalytics);
    
    // Get current view mode
    const viewMode = document.querySelector('.top-software-enhanced .toggle-btn.active')?.dataset?.view || 'bestseller';
    
    // Sort products based on view mode
    const sortedProducts = sortProductsByView(productAnalytics.products, viewMode);
    
    // Render enhanced product table
    renderEnhancedProductTable(sortedProducts, productAnalytics);
    
    // Initialize view toggle handlers
    initProductViewToggle();
    
    console.log('✅ Enhanced top products loaded:', productAnalytics);
  } catch (error) {
    console.error('❌ Error loading top products:', error);
  });
      };
    }
  });
    });
    
    // Update date range
    // Calculate recent performance (last 30 days)
    // Market share calculation
    // Performance score (combines sales volume, revenue, growth, recency)
  };
}

/**
 * Update product summary statistics
 * @param {Object} analytics - Product analytics data
 */
  }
  
  if (top3MarketShareEl) {
    const top3Share = analytics.products
      .sort((a, b) => b.marketShare - a.marketShare)
      .slice(0, 3)
      .reduce((sum, p) => sum + p.marketShare, 0);
    top3MarketShareEl.textContent = `${top3Share.toFixed(1)}%`;
  }
}

/**
 * Sort products by view mode
 * @param {Array} products - Product data
 * @param {string} viewMode - Sort criteria
 * @returns {Array} Sorted products
 */
function sortProductsByView(products, viewMode) {
  switch (viewMode) {
    case 'revenue':
      return products.sort((a, b) => b.totalRevenue - a.totalRevenue);
    case 'growth':
    return `
      <tr class="product-row ${performanceClass}-performance ${product.isBestseller ? 'bestseller-product' : ''}">
        <td class="rank-cell">
          <div class="rank-display">
            <span class="rank-number">${index + 1}</span>
            ${index < 3 ? `<i class="fas fa-trophy rank-trophy rank-${index + 1}"></i>` : ''}
          </div>
        </td>
        <td class="product-cell">
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-badges">${statusBadges.join(' ')}</div>
            <div class="product-meta">
              <small>Bán từ ${product.firstSale.toLocaleDateString('vi-VN')}</small>
            </div>
          </div>
        </td>
        <td class="quantity-cell">
          <div class="quantity-info">
            <span class="quantity-total">${product.totalQuantity}</span>
            <small class="velocity-info">${product.salesVelocity.toFixed(1)}/tháng</small>
            ${product.recentQuantity > 0 ? `<small class="recent-sales">30 ngày: ${product.recentQuantity}</small>` : ''}
          </div>
        </td>
        <td class="revenue-cell">
          <span class="revenue-amount">${formatRevenue(product.totalRevenue)}</span>
        </td>
        <td class="avg-price-cell">
          <span class="avg-price">${formatRevenue(product.avgPrice)}</span>
        </td>
        <td class="market-share-cell">
          <div class="share-info">
            <span class="share-value">${product.marketShare.toFixed(1)}%</span>
            <div class="share-bar">
              <div class="share-fill" style="width: ${Math.min(product.marketShare * 3, 100)}%"></div>
            </div>
            <small class="revenue-share">DT: ${product.revenueShare.toFixed(1)}%</small>
          </div>
        </td>
        <td class="performance-cell ${performanceClass}">
          <div class="performance-info">
            <span class="performance-icon">${performanceIcon}</span>
            <span class="performance-score">${product.performanceScore.toFixed(0)}</span>
            <small class="growth-rate ${product.growthRate > 0 ? 'positive' : 'negative'}">
              ${product.growthRate > 0 ? '+' : ''}${product.growthRate.toFixed(1)}%
            </small>
          </div>
        </td>
        <td class="action-cell">
          <button class="action-btn-small details" onclick="viewProductDetails('${product.name}')" title="Xem chi tiết sản phẩm">
            <i class="fas fa-chart-bar"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Initialize product view toggle handlers
 */
function initProductViewToggle() {
  const toggleButtons = document.querySelectorAll('.top-software-enhanced .toggle-btn');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      toggleButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Reload products with new view
      const transactions = window.transactionList || [];
      loadTopProducts(transactions);
    });
  });
}

/**
 * Load enhanced top customers data with detailed analytics
 * @param {Array} transactions - Filtered transactions
 */
async function loadTopCustomers(transactions = []) {
  try {
    const container = document.getElementById('top-customers-body');
    if (!container) {
      console.warn('❌ Top customers container not found');
      return;
    }

    // Use provided transactions or fallback to global
    if (!transactions || transactions.length === 0) {
      transactions = window.transactionList || [];
    }
    
    // Enhanced customer analytics
    const customerAnalytics = calculateCustomerAnalytics(transactions);
    
    // Update summary statistics
    updateCustomerSummary(customerAnalytics);
    
    // Get current view mode
    const viewMode = document.querySelector('.top-customers-enhanced .toggle-btn.active')?.dataset?.view || 'revenue';
    
    // Sort customers based on view mode
    const sortedCustomers = sortCustomersByView(customerAnalytics.customers, viewMode);
    
    // Render enhanced customer table
    renderEnhancedCustomerTable(sortedCustomers, customerAnalytics.totalRevenue);
    
    // Initialize view toggle handlers
    initCustomerViewToggle();
    
    console.log('✅ Enhanced top customers loaded:', customerAnalytics);
  } catch (error) {
    console.error('❌ Error loading top customers:', error);
  });
      };
    }
  });
    });
    
    // Update date range
    // Calculate trend (simple growth rate based on recent vs old transactions)
    // Customer value score (weighted combination of revenue, frequency, recency)
    const recentWeight = Math.max(0, 1 - (daysSinceLast / 365)); // Less weight if inactive
    const valueScore = (customer.totalRevenue * 0.5) + (frequency * 1000 * 0.3) + (recentWeight * avgTransactionValue * 0.2);
    
    return {
      ...customer,
      avgTransactionValue,
      daysSinceFirst,
      daysSinceLast,
      frequency,
      growthRate,
      valueScore,
      recentRevenue,
      isActive: daysSinceLast <= 90, // Active if transaction within 90 days
    };
  });
  };
}

/**
 * Update customer summary statistics
 * @param {Object} analytics - Customer analytics data
 */
    top5PercentageEl.textContent = `${top5Percentage}%`;
  }
}

/**
 * Sort customers by view mode
 * @param {Array} customers - Customer data
 * @param {string} viewMode - Sort criteria
 * @returns {Array} Sorted customers
 */
function sortCustomersByView(customers, viewMode) {
  switch (viewMode) {
    case 'quantity':
      return customers.sort((a, b) => b.transactionCount - a.transactionCount);
    case 'avg':
    const statusBadges = [];
    
    if (customer.isVIP) statusBadges.push('<span class="badge vip">🎆 VIP</span>');
    if (!customer.isActive) statusBadges.push('<span class="badge inactive">⏸️ Ngừng</span>');
    if (daysSinceLast <= 7) statusBadges.push('<span class="badge recent">🔥 Mới</span>');
    
    return `
      <tr class="customer-row ${customer.isVIP ? 'vip-customer' : ''} ${!customer.isActive ? 'inactive-customer' : ''}">
        <td class="rank-cell">
          <div class="rank-display">
            <span class="rank-number">${index + 1}</span>
            ${index < 3 ? `<i class="fas fa-medal rank-medal rank-${index + 1}"></i>` : ''}
          </div>
        </td>
        <td class="customer-cell">
          <div class="customer-info">
            <div class="customer-name">${customer.name}</div>
            ${customer.email ? `<div class="customer-email"><small>📧 ${customer.email}</small></div>` : ''}
            <div class="customer-badges">${statusBadges.join(' ')}</div>
            <div class="customer-meta">
              <small>Khách hàng từ ${firstTransaction ? firstTransaction.toLocaleDateString('vi-VN') : 'N/A'}</small>
            </div>
          </div>
        </td>
        <td class="transactions-cell">
          <div class="transaction-info">
            <span class="transaction-count">${customer.transactionCount || 0}</span>
            <small class="frequency-info">${frequency.toFixed(1)}/tháng</small>
          </div>
        </td>
        <td class="revenue-cell">
          <div class="revenue-info">
            <span class="revenue-amount">${formatRevenue(revenue)}</span>
            ${recentRevenue > 0 ? `<small class="recent-revenue">30 ngày: ${formatRevenue(recentRevenue)}</small>` : ''}
          </div>
        </td>
        <td class="avg-cell">
          <span class="avg-value">${formatRevenue(avgValue)}</span>
        </td>
        <td class="percentage-cell">
          <div class="percentage-info">
            <span class="percentage-value">${percentage}%</span>
            <div class="percentage-bar">
              <div class="percentage-fill" style="width: ${Math.min(percentage * 2, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="trend-cell ${trendClass}">
          <div class="trend-info">
            <span class="trend-icon">${trendIcon}</span>
            <span class="trend-value">${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%</span>
            <small class="trend-desc">${daysSinceLast} ngày trước</small>
          </div>
        </td>
        <td class="action-cell">
          <button class="action-btn-small details" onclick="viewCustomerDetails('${customer.key || customer.email || customer.name}')" title="Xem chi tiết khách hàng">
            <i class="fas fa-user-circle"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Initialize customer view toggle handlers
 */
function initCustomerViewToggle() {
  const toggleButtons = document.querySelectorAll('.top-customers-enhanced .toggle-btn');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      toggleButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Reload customers with new view
      const transactions = window.transactionList || [];
      loadTopCustomers(transactions);
    });
  });
}

/**
 * Load summary statistics
 */
async function loadSummaryStats() {
  try {
    const container = document.getElementById('summaryStats');
    if (!container) {
      console.warn('❌ Summary stats container not found');
      return;
    }

    const transactions = window.transactionList || [];
    const expenses = window.expenseList || [];
    
    // Calculate key metrics
    const totalRevenue = calculateTotalRevenue(transactions);
    const totalExpenses = calculateTotalExpenses(expenses);
    const profit = calculateProfit(totalRevenue, totalExpenses);
    const profitMargin = calculateProfitMargin(profit, totalRevenue);
    
    const totalTransactions = transactions.length;
    const totalCustomers = new Set(transactions.map(t => t.customer)).size;
    const avgTransactionValue = totalRevenue / (totalTransactions || 1);

    // Render summary stats
    const html = `
      <div class="summary-grid">
        <div class="summary-card revenue">
          <div class="summary-icon">💰</div>
          <div class="summary-content">
            <div class="summary-value">${formatRevenue(totalRevenue)}</div>
            <div class="summary-label">Tổng doanh thu</div>
          </div>
        </div>
        
        <div class="summary-card expenses">
          <div class="summary-icon">💸</div>
          <div class="summary-content">
            <div class="summary-value">${formatRevenue(totalExpenses)}</div>
            <div class="summary-label">Tổng chi phí</div>
          </div>
        </div>
        
        <div class="summary-card profit ${profit >= 0 ? 'positive' : 'negative'}">
          <div class="summary-icon">${profit >= 0 ? '📈' : '📉'}</div>
          <div class="summary-content">
            <div class="summary-value">${formatRevenue(profit)}</div>
            <div class="summary-label">Lợi nhuận</div>
            <div class="summary-detail">${formatPercentage(profitMargin)} margin</div>
          </div>
        </div>
        
        <div class="summary-card transactions">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <div class="summary-value">${totalTransactions.toLocaleString()}</div>
            <div class="summary-label">Tổng giao dịch</div>
            <div class="summary-detail">Avg: ${formatRevenue(avgTransactionValue)}</div>
          </div>
        </div>
        
        <div class="summary-card customers">
          <div class="summary-icon">👥</div>
          <div class="summary-content">
            <div class="summary-value">${totalCustomers.toLocaleString()}</div>
            <div class="summary-label">Khách hàng</div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log('✅ Summary stats loaded');
  } catch (error) {
    console.error('❌ Error loading summary stats:', error);
    showError('Không thể tải thống kê tổng hợp');
  }
}

/**
 * Show error in overview report
 */
function showOverviewError(message) {
  const container = document.getElementById('report-overview');
  if (container) {
    container.innerHTML = `
      <div class="report-error">
        <h3>⚠️ Lỗi tải báo cáo</h3>
        <p>${message}</p>
        <button onclick="loadOverviewReport()" class="btn btn-primary">Thử lại</button>
      </div>
    `;
  }
}

/**
 * Show chart error
 */
function showChartError() {
  const chartContainers = document.querySelectorAll('.chart-container canvas');
  chartContainers.forEach(canvas => {
    const container = canvas.parentElement;
    container.innerHTML = `
      <div class="chart-error">
        <p>⚠️ Không thể tải biểu đồ</p>
      </div>
    `;
  });
}

/**
 * NEW FIXED Calculate overview KPIs with proper all_time handling
 */
function calculateOverviewKPIsNew(transactions, expenses, dateRange, period = 'this_month') {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  console.log(`  - Period parameter: "${period}"`);
  console.log(`  - Period === 'all_time':`, period === 'all_time');
  console.log(`  - Total transactions to filter: ${transactions.length}`);
  console.log(`  - Total expenses to filter: ${expenses.length}`);
  
  // Filter data based on period - SIMPLIFIED LOGIC
  let filteredTransactions, filteredExpenses;
  
  if (period === 'all_time') {
    filteredTransactions = transactions;
    filteredExpenses = expenses;
  } else {
    filteredTransactions = transactions.filter(t => {
      const rawDate = t.transactionDate || t.ngayGiaoDich || t.date;
      const transactionDate = new Date(rawDate);
      
      if (isNaN(transactionDate.getTime())) {
        return false;
      }
      
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    filteredExpenses = expenses.filter(e => {
      const rawDate = e.ngayChiTieu || e.date;
      const expenseDate = new Date(rawDate);
      
      if (isNaN(expenseDate.getTime())) {
        return false;
      }
      
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  }
  
  // Calculate totals by transaction status
  const statusBreakdown = {
    completed: { count: 0, revenue: 0 },
    paid: { count: 0, revenue: 0 },
    unpaid: { count: 0, revenue: 0 }
  };
  
  filteredTransactions.forEach(t => {
    const revenue = parseFloat(t.doanhThu || t.revenue || t.Revenue || t.doanh_thu) || 0;
    const status = t.loaiGiaoDich || t.transactionType || t.status || '';
    
    if (status.toLowerCase().includes('hoàn tất')) {
      statusBreakdown.completed.count++;
      statusBreakdown.completed.revenue += revenue;
    } else if (status.toLowerCase().includes('đã thanh toán')) {
      statusBreakdown.paid.count++;
      statusBreakdown.paid.revenue += revenue;
    } else if (status.toLowerCase().includes('chưa thanh toán')) {
      statusBreakdown.unpaid.count++;
      statusBreakdown.unpaid.revenue += revenue;
    }
  });
  
  const totalRevenue = statusBreakdown.completed.revenue + statusBreakdown.paid.revenue + statusBreakdown.unpaid.revenue;
  const totalTransactions = filteredTransactions.length;
  
  console.log('  - Filtered transactions:', totalTransactions);
  console.log('  - Total revenue calculated:', totalRevenue);
    },
    },
    },
    },
    },
  };
}

/**
 * Status breakdown update with refund support
 * @param {Object} kpis - Business metrics from statisticsCore
 */
function updateStatusBreakdownWithRefund(kpis) {
  
  // Get current transactions for real status calculation
  const transactions = window.transactionList || [];
  const dateRange = window.globalFilters?.dateRange || null;
  const period = window.globalFilters?.period || 'this_month';
  
  // Filter transactions based on current period
  const filteredTransactions = filterDataByDateRange(transactions, dateRange);
  
  // Calculate real status breakdown
  const statusBreakdown = {
    completed: { count: 0, revenue: 0 },
    paid: { count: 0, revenue: 0 },
    refunded: { count: 0, revenue: 0 }
  };
  }
  
  // Update success rate
  }
  
  // Update net revenue
  }
  
}

/**
 * Helper function to update element text content
 * @param {string} elementId - Element ID
 * @param {string|number} value - Value to set
 */
function updateElementText(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Helper function to update element style
 * @param {string} elementId - Element ID
 * @param {string} property - CSS property
 * @param {string} value - CSS value
 */
function updateElementStyle(elementId, property, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style[property] = value;
  }
}

/**
 * Load and display pending transactions that need action
 * @param {Array} transactions - Filtered transactions for current period
 * @param {Object} dateRange - Date range filter {start, end}
 */
async function loadPendingTransactions(transactions = [], dateRange = null) {
  try {
    
    // Use provided transactions or fallback to global
    if (!transactions || transactions.length === 0) {
      transactions = window.transactionList || [];
    }
    
    // Categorize pending transactions
    const pendingCategories = categorizePendingTransactions(transactions);
    
    // Update summary badges
    updatePendingSummary(pendingCategories);
    
    // Load pending tables
    await Promise.all([
      loadNeedsDeliveryTable(pendingCategories.needsDelivery, dateRange),
      loadNeedsPaymentTable(pendingCategories.needsPayment)
    ]);
    
    // Update alerts
    updatePendingAlerts(pendingCategories);
    
    console.log('✅ Pending transactions loaded:', pendingCategories);
  } catch (error) {
    console.error('❌ Error loading pending transactions:', error);
    // Case 1: Đã thanh toán nhưng chưa hoàn tất (cần giao hàng)
    // Sort from past to future (ascending)
  };
}

/**
 * Update pending summary badges
 * @param {Object} categories - Categorized pending transactions
 */
function updatePendingSummary(categories) {
  const deliveryBadge = document.getElementById('needs-delivery-count');
  const paymentBadge = document.getElementById('needs-payment-count');
  
  if (deliveryBadge) {
    const urgentCount = categories.urgentDelivery.length;
    deliveryBadge.innerHTML = `
      <i class="fas fa-truck"></i> Cần giao hàng: <strong>${categories.needsDelivery.length}</strong>
      ${urgentCount > 0 ? `<span class="urgent-indicator">❗ ${urgentCount} gấp</span>` : ''}
    `;
    
    deliveryBadge.className = `summary-badge needs-delivery ${urgentCount > 0 ? 'has-urgent' : ''}`;
  }
  
  if (paymentBadge) {
    const overdueCount = categories.overduePayment.length;
    paymentBadge.innerHTML = `
      <i class="fas fa-money-bill-wave"></i> Cần thu tiền: <strong>${categories.needsPayment.length}</strong>
      ${overdueCount > 0 ? `<span class="overdue-indicator">⚠️ ${overdueCount} quá hạn</span>` : ''}
    `;
    
    paymentBadge.className = `summary-badge needs-payment ${overdueCount > 0 ? 'has-overdue' : ''}`;
  }
}

/**
 * Load needs delivery table
 * @param {Array} needsDelivery - Transactions that need delivery
 * @param {Object} dateRange - Date range filter {start, end}
 */
      } else if (daysDiff === 0) {
        // Today
    }
    
    return `
      <tr class="pending-row ${isUrgent ? 'urgent-row' : ''}" data-transaction-id="${transaction.id || ''}">
        <td class="date-cell">
          ${displayDate.toLocaleDateString('vi-VN')}
          ${isUrgent ? '<span class="urgent-badge">🔥 Gấp</span>' : ''}
          <div class="date-note">${dateNote}</div>
        </td>
        <td class="customer-cell">${customer}</td>
        <td class="product-cell">${product}</td>
        <td class="amount-cell">${formatRevenue(amount)}</td>
        <td class="waiting-cell ${waitingClass}">
          ${waitingText}
          ${isUrgent ? '<i class="fas fa-exclamation-triangle urgent-icon"></i>' : ''}
        </td>
        <td class="action-cell">
          <button class="action-btn-small delivery" onclick="markAsDelivered('${transaction.id || ''}')" title="Đánh dấu đã giao hàng">
            <i class="fas fa-check"></i>
          </button>
          <button class="action-btn-small details" onclick="viewTransactionDetails('${transaction.id || ''}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Load needs payment table
 * @param {Array} needsPayment - Transactions that need payment
 */
    const customer = transaction.customerName || 'Không xác định';
    const product = transaction.softwareName || 'N/A';
    const amount = transaction.revenue || 0;
    const overdueDays = rawTransaction.overdueDays;
    const isOverdue = rawTransaction.isOverdue;
    
    return `
      <tr class="pending-row ${isOverdue ? 'overdue-row' : ''}" data-transaction-id="${transaction.id || ''}">
        <td class="date-cell">
          ${deliveryDate.toLocaleDateString('vi-VN')}
          ${isOverdue ? '<span class="overdue-badge">⚠️ Quá hạn</span>' : ''}
        </td>
        <td class="customer-cell">${customer}</td>
        <td class="product-cell">${product}</td>
        <td class="amount-cell">${formatRevenue(amount)}</td>
        <td class="overdue-cell ${isOverdue ? 'overdue-days' : ''}">
          ${overdueDays > 0 ? `${overdueDays} ngày` : 'Mới giao'}
          ${isOverdue ? '<i class="fas fa-exclamation-triangle overdue-icon"></i>' : ''}
        </td>
        <td class="action-cell">
          <button class="action-btn-small payment" onclick="markAsPaid('${transaction.id || ''}')" title="Đánh dấu đã thanh toán">
            <i class="fas fa-dollar-sign"></i>
          </button>
          <button class="action-btn-small reminder" onclick="sendPaymentReminder('${transaction.id || ''}')" title="Gửi nhắc nhở">
            <i class="fas fa-bell"></i>
          </button>
          <button class="action-btn-small details" onclick="viewTransactionDetails('${transaction.id || ''}')" title="Xem chi tiết">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update pending alerts
 * @param {Object} categories - Categorized pending transactions
 */
 */
/*
      ['Thanh toán', breakdown.paid.count, breakdown.paid.amount,
       ((breakdown.paid.count / (breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count)) * 100).toFixed(1),
      ['Hoàn tiền', breakdown.refunded.count, breakdown.refunded.amount,
       ((breakdown.refunded.count / (breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count)) * 100).toFixed(1),
      ['Tổng cộng', 
       breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count,
       breakdown.completed.amount + breakdown.paid.amount + breakdown.refunded.amount,
       '100.0',
       ((breakdown.completed.amount + breakdown.paid.amount + breakdown.refunded.amount) / 
        (breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count)).toFixed(0)]
    ];
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `phan-loai-trang-thai-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Status data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting status data:', error);
    alert('Lỗi xuất dữ liệu. Vui lòng thử lại.');
  }
}
*/

/**
 * Action functions for pending transactions
 */
function markAsDelivered(transactionId) {
  // Implementation would update transaction status
  alert(`Gả lập: Đánh dấu giao dịch ${transactionId} đã giao hàng`);
  // Reload pending transactions with current date range
  const dateRange = window.globalFilters?.dateRange || null;
  const transactions = window.transactionList || [];
  loadPendingTransactions(transactions, dateRange);
}

function markAsPaid(transactionId) {
  // Implementation would update payment status
  alert(`Gả lập: Đánh dấu giao dịch ${transactionId} đã thanh toán`);
  // Reload pending transactions with current date range
  const dateRange = window.globalFilters?.dateRange || null;
  const transactions = window.transactionList || [];
  loadPendingTransactions(transactions, dateRange);
}

function sendPaymentReminder(transactionId) {
  // Implementation would send reminder
  alert(`Gả lập: Gửi nhắc nhở thanh toán cho giao dịch ${transactionId}`);
}

function viewTransactionDetails(transactionId) {
  // Implementation would show transaction detail modal
  alert(`Gả lập: Hiển thị chi tiết giao dịch ${transactionId}`);
}

function markAllAsDelivered() {
  const checkedRows = document.querySelectorAll('.needs-delivery-table input[type="checkbox"]:checked');
  if (checkedRows.length === 0) {
    alert('Vui lòng chọn ít nhất một giao dịch');
    return;
  }
  alert(`Gả lập: Đánh dấu ${checkedRows.length} giao dịch đã giao hàng`);
  // Reload pending transactions with current date range
  const dateRange = window.globalFilters?.dateRange || null;
  const transactions = window.transactionList || [];
  loadPendingTransactions(transactions, dateRange);
}

function markAllAsPaid() {
  const checkedRows = document.querySelectorAll('.needs-payment-table input[type="checkbox"]:checked');
  if (checkedRows.length === 0) {
    alert('Vui lòng chọn ít nhất một giao dịch');
    return;
  }
  alert(`Gả lập: Đánh dấu ${checkedRows.length} giao dịch đã thanh toán`);
  // Reload pending transactions with current date range
  const dateRange = window.globalFilters?.dateRange || null;
  const transactions = window.transactionList || [];
  loadPendingTransactions(transactions, dateRange);
}

function sendPaymentReminders() {
  const overdueCount = document.getElementById('overdue-count')?.textContent || 0;
  alert(`Gả lập: Gửi nhắc nhở thanh toán cho ${overdueCount} giao dịch quá hạn`);
}
}
}

/**
 * Calculate pending transactions
 */
        }
    };
    
    transactions.forEach(rawTransaction => {
        const t = normalizeTransaction(rawTransaction);
        if (!t) return;
        
        const status = t.transactionType;
        const amount = t.revenue || 0;
        
        if (status === 'Đã thanh toán') {
            pending.paidNotDelivered.push(t);
            pending.summary.paidNotDeliveredCount++;
            pending.summary.paidNotDeliveredAmount += amount;
        } else if (status === 'Chưa thanh toán') {
            pending.deliveredNotPaid.push(t);
            pending.summary.deliveredNotPaidCount++;
            pending.summary.deliveredNotPaidAmount += amount;
        }
    });
    
    return pending;
}

/**
 * Update pending transactions section
 */
function updatePendingTransactionsSection(pending) {
    const section = document.getElementById('pendingTransactionsSection');
    if (!section) return;
    
    // Update summary cards
    const paidNotDeliveredCard = section.querySelector('.pending-card:nth-child(1)');
    if (paidNotDeliveredCard) {
        paidNotDeliveredCard.querySelector('.metric-value').textContent = pending.summary.paidNotDeliveredCount;
        paidNotDeliveredCard.querySelector('.metric-amount').textContent = formatCurrency(pending.summary.paidNotDeliveredAmount);
    }
    
    const deliveredNotPaidCard = section.querySelector('.pending-card:nth-child(2)');
  });
        }
  });
        }
        // Convert packages map to array for display
  });

      ]
      })
    ];
    
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `can-giao-hang-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Needs delivery data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting needs delivery data:', error);
  });

      ]
      })
    ];
    
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `can-thu-tien-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Needs payment data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting needs payment data:', error);
window.calculateDetailedStatusBreakdown = calculateDetailedStatusBreakdown;
window.loadPendingTransactions = loadPendingTransactions;
window.categorizePendingTransactions = categorizePendingTransactions;

// Pending transaction actions
window.markAsDelivered = markAsDelivered;
window.markAsPaid = markAsPaid;
window.sendPaymentReminder = sendPaymentReminder;
window.viewTransactionDetails = viewTransactionDetails;
window.markAllAsDelivered = markAllAsDelivered;
window.markAllAsPaid = markAllAsPaid;
window.sendPaymentReminders = sendPaymentReminders;
window.showOverdueDetails = showOverdueDetails;
window.showUrgentDeliveries = showUrgentDeliveries;
window.exportNeedsDelivery = exportNeedsDelivery;
window.exportNeedsPayment = exportNeedsPayment;

// Top customers and products functions
window.viewCustomerDetails = viewCustomerDetails;
window.viewProductDetails = viewProductDetails;
window.exportCustomerData = exportCustomerData;
window.exportSoftwareData = exportSoftwareData;
window.calculateCustomerScore = calculateCustomerScore;
window.calculateProductScore = calculateProductScore;

/**
 * View customer details modal/page
 * @param {string} customerIdentifier - Customer email or name to view
 */
function viewCustomerDetails(customerIdentifier) {
  
  const transactions = window.transactionList || [];
  const customerTransactions = transactions.filter(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    return t && (t.email === customerIdentifier || t.customerName === customerIdentifier);
  });
  
  const customerAnalytics = calculateNormalizedCustomerAnalytics(transactions);
  const customerStats = customerAnalytics.find(c => c.key === customerIdentifier || c.email === customerIdentifier || c.name === customerIdentifier);
  
  if (!customerStats) {
    alert('Không tìm thấy thông tin khách hàng');
    return;
  }
  
  // For now, show basic info in alert (can be enhanced to modal)
  const info = `
    Thông tin chi tiết: ${customerStats.name}${customerStats.email ? `
    📧 Email: ${customerStats.email}` : ''}
    
    💰 Tổng doanh thu: ${formatRevenue(customerStats.revenue || customerStats.totalRevenue || 0)}
    📋 Số giao dịch: ${customerStats.transactionCount}
    📈 Giá trị trung bình: ${formatRevenue(customerStats.averageOrderValue || customerStats.avgTransactionValue || 0)}
    📅 Khách hàng từ: ${customerStats.firstTransaction ? new Date(customerStats.firstTransaction).toLocaleDateString('vi-VN') : 'N/A'}
    ⏰ Giao dịch cuối: ${customerStats.lastTransaction ? new Date(customerStats.lastTransaction).toLocaleDateString('vi-VN') : 'N/A'}
    📈 Tăng trưởng: ${(customerStats.growthRate || 0).toFixed(1)}%
    🎯 Tần suất: ${(customerStats.frequency || 0).toFixed(1)} giao dịch/tháng
    ⭐ Trạng thái: ${customerStats.isVIP ? 'VIP' : 'Thường'} | ${customerStats.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
  `;
  
  alert(info);
}

/**
 * View product details modal/page
 * @param {string} productName - Product name to view
 */
function viewProductDetails(productName) {
  
  const transactions = window.transactionList || [];
  const productTransactions = transactions.filter(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    return t && t.softwareName === productName;
  });
  
  const productAnalytics = calculateNormalizedProductAnalytics(transactions);
  const productStats = productAnalytics.find(p => p.name === productName);
  
  if (!productStats) {
    alert('Không tìm thấy thông tin sản phẩm');
    return;
  }
  
  // For now, show basic info in alert (can be enhanced to modal)
  const info = `
    Chi tiết sản phẩm: ${productName}
    
    📺 Số lượng bán: ${productStats.transactionCount || productStats.totalQuantity || 0}
    💰 Tổng doanh thu: ${formatRevenue(productStats.revenue || productStats.totalRevenue || 0)}
    💲 Giá trung bình: ${formatRevenue(productStats.averageRevenue || productStats.avgPrice || 0)}
    📈 Tăng trưởng: ${(productStats.growthRate || 0).toFixed(1)}%
    🎢 Thị phần: ${(productStats.marketShare || 0).toFixed(1)}%
    🚀 Tốc độ bán: ${(productStats.salesVelocity || 0).toFixed(1)} sản phẩm/tháng
    📅 Bán từ: ${productStats.firstSale ? new Date(productStats.firstSale).toLocaleDateString('vi-VN') : 'N/A'}
    ⏰ Bán cuối: ${productStats.lastSale ? new Date(productStats.lastSale).toLocaleDateString('vi-VN') : 'N/A'}
    ⭐ Trạng thái: ${productStats.isBestseller ? 'Bán chạy' : 'Bình thường'} | ${productStats.isHot ? 'Hót' : productStats.isSlow ? 'Chậm' : 'Vừa'}
  `;
          customer.valueScore.toFixed(0)
        ])
    ];
    
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `top-khach-hang-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Customer data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting customer data:', error);
    alert('Lỗi xuất dữ liệu khách hàng. Vui lòng thử lại.');
  }
}

/**
 * Export enhanced software/product data to CSV
 */
function exportSoftwareData() {
  
  try {
    const transactions = window.transactionList || [];
    const analytics = calculateProductAnalytics(transactions);
    
    if (analytics.products.length === 0) {
      alert('Không có dữ liệu sản phẩm để xuất');
      return;
    }
    
    // Prepare CSV data with comprehensive product metrics
    const csvData = [
      [
        'Hạng', 'Tên sản phẩm', 'Số lượng bán', 'Tổng doanh thu (VNĐ)', 
        'Giá trung bình (VNĐ)', 'Thị phần (%)', '% Doanh thu', 
        'Tốc độ bán/tháng', 'Tăng trưởng (%)', 'Ngày bán đầu tiên', 
        'Ngày bán cuối', 'Trạng thái', 'Đánh giá hiệu suất'
      ],
      ...analytics.products
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .map((product, index) => {
          let status = 'Bình thường';
          if (product.isBestseller) status = 'Bán chạy';
          if (product.isHot) status += ' - Hót';
          if (product.isTrending) status += ' - Xu hướng';
          if (product.isSlow) status = 'Chậm';
          
          let performance = 'Trung bình';
          if (product.performanceScore > 100) performance = 'Xuất sắc';
          else if (product.performanceScore > 50) performance = 'Tốt';
          
          return [
            index + 1,
            product.name,
            product.totalQuantity,
            product.totalRevenue,
            product.avgPrice.toFixed(0),
            product.marketShare.toFixed(1),
            product.revenueShare.toFixed(1),
            product.salesVelocity.toFixed(1),
            product.growthRate.toFixed(1),
            product.firstSale.toLocaleDateString('vi-VN'),
            product.lastSale.toLocaleDateString('vi-VN'),
            status,
            performance
          ];
        })
    ];
    
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `san-pham-ban-chay-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Software/product data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting software data:', error);
  // Use pre-filtered transactions for current period metrics
  
  // Initialize metrics
  const metrics = {
    grossRevenue: 0,           // Doanh thu gộp = "đã hoàn tất" - "hoàn tiền"
    pendingCollection: 0,      // Tiền đang chờ thu = "chưa thanh toán"
    pendingPayment: 0,         // Tiền đang chờ chi = "đã thanh toán" 
    totalRefunds: 0,           // Tổng tiền hoàn trả = "hoàn tiền"
    refundRate: 0,             // Tỷ lệ hoàn tiền = số GD "hoàn tiền" / (tổng GD có hiệu lực)
    
    // Breakdown by status for detailed analysis
      completed: { count: 0, amount: 0 },      // đã hoàn tất
      paid: { count: 0, amount: 0 },           // đã thanh toán
      unpaid: { count: 0, amount: 0 },         // chưa thanh toán
      refunded: { count: 0, amount: 0 },       // hoàn tiền
      cancelled: { count: 0, amount: 0 }       // đã hủy
    },
    
    // Transaction counts
    effectiveTransactions: 0,   // Không bao gồm "đã hủy"
    
    // Previous period comparison (for growth calculations)
    }
  };

  // Process each transaction
    }
        metrics.statusBreakdown.cancelled.amount += amount;
        // Không tính vào effectiveTransactions
        break;
        
      default:
        console.warn(`⚠️ Unknown transaction status: "${status}"`);
        // Treat unknown status as effective transaction
  // Doanh thu gộp = Tổng tiền "đã hoàn tất" + Tổng tiền "đã thanh toán" - Tổng tiền "hoàn tiền"
  // Calculate previous period for growth comparison
  // For gross revenue, compare with same period of previous cycle (cùng kỳ chu kỳ trước)
  }
  
  // Calculate growth rates
  metrics.growthRates = {
    grossRevenue: calculateGrowthRate(metrics.grossRevenue, metrics.previousPeriod.grossRevenue),
    pendingCollection: 0, // Growth for pending amounts might not be meaningful
    totalRefunds: calculateGrowthRate(metrics.totalRefunds, metrics.previousPeriod.totalRefunds),
    effectiveTransactions: calculateGrowthRate(metrics.effectiveTransactions, metrics.previousPeriod.effectiveTransactions)
  };
  
  console.log(`  Current Gross Revenue: ${metrics.grossRevenue}`);
  console.log(`  Previous Period Gross Revenue: ${metrics.previousPeriod.grossRevenue}`);
  console.log(`  Growth Rate: ${metrics.growthRates.grossRevenue.toFixed(2)}%`);
  
  console.log('  💰 Doanh thu gộp:', formatCurrency(metrics.grossRevenue));
  console.log('  ⏳ Tiền đang chờ thu:', formatCurrency(metrics.pendingCollection));
  console.log('  💸 Tiền đang chờ chi:', formatCurrency(metrics.pendingPayment));
  console.log('  🔄 Tổng tiền hoàn trả:', formatCurrency(metrics.totalRefunds));
  console.log('  📊 Tỷ lệ hoàn tiền:', `${metrics.refundRate.toFixed(2)}%`);
  console.log('  📋 Status breakdown:', metrics.statusBreakdown);
  console.log('  📈 Growth rates:', metrics.growthRates);
 * previous cycle same period would be 2025/05/01 to 2025/05/13
 */
  };
  };
}

/**
 * Calculate growth rate between current and previous values
 */
  return ((current - previous) / previous) * 100;
}