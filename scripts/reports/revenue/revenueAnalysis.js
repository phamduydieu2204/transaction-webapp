/**
 * revenueAnalysis.js
 * 
 * Revenue Analysis functionality - Phân tích doanh thu chi tiết
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatCurrency, formatDate } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { 
  calculateBusinessMetrics,
  calculateTotalRevenue,
  normalizeDate,
  getDateRange
} from '../../statisticsCore.js';
import { 
  getTransactionField, 
  normalizeTransaction, 
  getTransactionTypeDisplay 
} from '../../core/dataMapping.js';

/**
 * Load revenue analysis report
 * @param {Object} options - Options for loading report
 * @param {Object} options.dateRange - Date range filter {start: 'yyyy/mm/dd', end: 'yyyy/mm/dd'}
 * @param {string} options.period - Period name (e.g., 'this_month', 'last_month')
 */
    // Get date range from options or global filters
    const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
    const period = options.period || window.globalFilters?.period || 'this_month';
    
    // Filter data by date range
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    
    // Load all components
    await Promise.all([
      updateRevenueKPIs(filteredTransactions, period),
      renderRevenueTrendChart(filteredTransactions, period),
      renderRevenueCategoryChart(filteredTransactions),
      loadTopCustomersByRevenue(filteredTransactions),
      loadTopProductsByRevenue(filteredTransactions),
      updateRevenueInsights(filteredTransactions)
    ]);
    
    // Setup event handlers
    setupRevenueAnalysisHandlers();
  } catch (error) {
    console.error('❌ Error loading revenue analysis:', error);
    showError('Không thể tải phân tích doanh thu');
  }
}

/**
 * Load the revenue analysis HTML template
 */
async function loadRevenueAnalysisHTML() {
  const container = document.getElementById('report-revenue');
  if (!container) return;
  
  try {
    const response = await fetch('./partials/tabs/report-pages/revenue-analysis.html');
    if (!response.ok) {
      throw new Error('Template not found');
    }
    
    const html = await response.text();
    container.innerHTML = html;
    container.classList.add('active');
  } catch (error) {
    console.error('❌ Could not load revenue analysis template:', error);
    throw error;
  }
}

/**
 * Update revenue KPI cards
 */
async function updateRevenueKPIs(transactions, period) {
  
  // Calculate current period metrics
  const currentMetrics = calculateRevenueMetrics(transactions);
  
  // Calculate previous period for comparison
  const previousTransactions = getPreviousPeriodTransactions(transactions, period);
  const previousMetrics = calculateRevenueMetrics(previousTransactions);
  
  // Update KPI values
  updateKPIElement('total-revenue-value', formatRevenue(currentMetrics.totalRevenue));
  updateKPIElement('avg-transaction-value', formatRevenue(currentMetrics.avgTransactionValue));
  updateKPIElement('highest-transaction', formatRevenue(currentMetrics.highestTransaction.amount));
  
  // Calculate and update changes
  const revenueChange = calculatePercentageChange(
    previousMetrics.totalRevenue, 
    currentMetrics.totalRevenue
  );
  const avgChange = calculatePercentageChange(
    previousMetrics.avgTransactionValue, 
    currentMetrics.avgTransactionValue
  );
  
  updateChangeElement('total-revenue-change', revenueChange);
  updateChangeElement('avg-transaction-change', avgChange);
  
  // Update growth rate
  updateKPIElement('growth-rate-value', `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%`);
  
  // Update highest transaction details
  if (currentMetrics.highestTransaction.customer) {
    updateKPIElement('highest-transaction-detail', 
      `${currentMetrics.highestTransaction.customer} - ${currentMetrics.highestTransaction.product || 'N/A'}`);
  }
  
}

/**
 * Calculate revenue metrics from transactions
 */
function calculateRevenueMetrics(transactions) {
  let grossRevenue = 0; // Doanh thu từ "đã hoàn tất" + "đã thanh toán"
  let refundAmount = 0; // Số tiền hoàn trả từ "hoàn tiền"
  let highestTransaction = { amount: 0, customer: '', product: '' };
  });

        };
      }
    } else if (status === 'hoàn tiền') {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
  });

      }]
    },
      },
        },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
              return `Doanh thu: ${formatRevenue(context.parsed.y)}`;
            }
          }
        }
      },
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
          }
        }
      }
    }
  });
}

/**
 * Render revenue category chart (pie/bar)
 */
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ],
      }]
    },
  });

          }
        },
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${formatRevenue(context.parsed)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Load top customers by revenue
 */
    const performance = calculateProductPerformance(product);
    
    return `
      <tr>
        <td class="rank-col">${index + 1}</td>
        <td class="product-col">
          <div class="product-info">
            <span class="product-name">${product.name}</span>
            <small class="product-category">${product.category || 'N/A'}</small>
          </div>
        </td>
        <td class="sold-col">${product.quantity}</td>
        <td class="revenue-col">${formatRevenue(product.revenue)}</td>
        <td class="price-col">${formatRevenue(product.avgPrice)}</td>
        <td class="share-col">${marketShare}%</td>
        <td class="performance-col">
          <div class="performance-indicator ${performance.class}">
            <i class="fas fa-${performance.icon}"></i>
            ${performance.label}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update revenue insights
 */
async function updateRevenueInsights(transactions) {
  
  const insights = generateRevenueInsights(transactions);
  
  // Update best performer
  updateInsightElement('best-performer-value', insights.bestPerformer.value);
  updateInsightElement('best-performer-desc', insights.bestPerformer.description);
  
  // Update growth trend
  updateInsightElement('growth-trend-value', insights.growthTrend.value);
  updateInsightElement('growth-trend-desc', insights.growthTrend.description);
  
  // Update concentration
  updateInsightElement('concentration-value', insights.concentration.value);
  updateInsightElement('concentration-desc', insights.concentration.description);
  
  // Update risk
  updateInsightElement('risk-value', insights.risk.value);
  updateInsightElement('risk-desc', insights.risk.description);
}

/**
 * Setup event handlers for revenue analysis
 */
function setupRevenueAnalysisHandlers() {
  // Period selector buttons
  const periodBtns = document.querySelectorAll('.period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      periodBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const period = e.target.dataset.period;
      refreshRevenueChart(period);
    });
  });
  
  // View selector buttons
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.table-container');
      const viewBtns = container.querySelectorAll('.view-btn');
      
      viewBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const view = e.target.dataset.view;
      refreshCustomerTable(view);
    });
  });
  
  // Sort selector buttons
  const sortBtns = document.querySelectorAll('.sort-btn');
  sortBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.table-container');
      const sortBtns = container.querySelectorAll('.sort-btn');
      
      sortBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const sort = e.target.dataset.sort;
      refreshProductTable(sort);
    });
  });
}

// Helper functions
function updateKPIElement(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateChangeElement(id, change) {
  const element = document.getElementById(id);
  if (element) {
    const isPositive = change >= 0;
    element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
    element.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
  }
}
  return ((current - previous) / previous) * 100;
}

function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) return data;
  
  return data.filter(item => {
    const itemDate = normalizeDate(getTransactionField(item, 'transactionDate'));
    if (!itemDate) return false;
    
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}

// Additional helper functions for data processing
function prepareTrendData(transactions, period) {
  // Tính doanh thu gộp theo thời gian (bao gồm cả trừ hoàn tiền)
  const trendMetrics = calculateRevenueMetrics(transactions);
  
  // Implementation for trend data preparation
  // This would create time-series data based on the period using gross revenue calculation
  // Placeholder data - should be calculated from actual time-series analysis
  return {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    values: [100000, 150000, 120000, 180000] // Should use trendMetrics.totalRevenue for real implementation
  };
}
  };
}
  });

      };
    }
    
    if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
      customers[customerName].revenue += revenue;
      customers[customerName].transactionCount++;
    } else if (status === 'hoàn tiền') {
      customers[customerName].refunds += Math.abs(revenue);
    }
  });
  
  return Object.values(customers)
    .map(customer => {
      const netRevenue = customer.revenue - customer.refunds;
      return {
        ...customer
  });
        revenue: netRevenue, // Doanh thu gộp sau khi trừ hoàn tiền
      };
    })
    .filter(customer => customer.revenue > 0); // Chỉ hiển thị khách hàng có doanh thu dương
}
        category: 'Software', // Could be enhanced with actual categories
  });

      };
    }
    
    if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
      products[productName].revenue += revenue;
      products[productName].quantity++;
    } else if (status === 'hoàn tiền') {
      products[productName].refunds += Math.abs(revenue);
    }
  });
  
  return Object.values(products)
    .map(product => {
      const netRevenue = product.revenue - product.refunds;
      return {
        ...product
  });
        revenue: netRevenue, // Doanh thu gộp sau khi trừ hoàn tiền
      };
    })
    .filter(product => product.revenue > 0); // Chỉ hiển thị sản phẩm có doanh thu dương
}

function calculateCustomerTrend(customerName, transactions) {
  // Placeholder implementation for customer trend calculation
  return { type: 'up', icon: 'arrow-up', value: '+15' };
}

function calculateProductPerformance(product) {
  // Placeholder implementation for product performance
  if (product.revenue > 1000000) {
    return { class: 'excellent', icon: 'star', label: 'Xuất sắc' };
  } else if (product.revenue > 500000) {
    return { class: 'good', icon: 'thumbs-up', label: 'Tốt' };
  } else {
    return { class: 'average', icon: 'minus', label: 'Trung bình' };
  }
}
    },
    },
    },
    }
  };
}

function getPreviousPeriodTransactions(transactions, period) {
  // Giữ nguyên tất cả giao dịch để tính chính xác doanh thu gộp (bao gồm cả hoàn tiền)
  // vì calculateRevenueMetrics sẽ xử lý logic trừ hoàn tiền
  
  // Placeholder - would implement actual previous period calculation using all transactions
  // calculateRevenueMetrics will handle the gross revenue calculation including refunds
  return transactions.slice(0, Math.floor(transactions.length / 2));
}

function loadChartJS() {
  return new Promise((resolve, reject) => {
    if (typeof Chart !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Global functions for template usage
window.refreshRevenueAnalysis = function() {
  loadRevenueAnalysis();
};

window.exportRevenueReport = function() {
  // Implementation for export functionality
};

window.exportCustomerRevenueData = function() {
};

window.exportProductRevenueData = function() {
};

window.toggleChartView = function(chartType, viewType) {
};

function refreshRevenueChart(period) {
  // Implementation for chart refresh
}

function refreshCustomerTable(view) {
  // Implementation for table refresh
}

function refreshProductTable(sort) {
  // Implementation for table refresh
}

