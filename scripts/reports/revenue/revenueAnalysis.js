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
export async function loadRevenueAnalysis(options = {}) {
  // console.log('📈 Loading revenue analysis with options:', options);
  
  try {
    // Load template
    await loadRevenueAnalysisHTML();
    
    // Ensure data is loaded
    await ensureDataIsLoaded();
    
    // Get data
    const transactions = window.transactionList || getFromStorage('transactions') || [];
    const expenses = window.expenseList || getFromStorage('expenses') || [];
    
    console.log('📊 Revenue analysis data:', {
      transactions: transactions.length,
      expenses: expenses.length
    });
    
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
    
    // console.log('✅ Revenue analysis loaded successfully');
    
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
    
    // console.log('✅ Revenue analysis template loaded');
    
  } catch (error) {
    console.error('❌ Could not load revenue analysis template:', error);
    throw error;
  }
}

/**
 * Update revenue KPI cards
 */
async function updateRevenueKPIs(transactions, period) {
  // console.log('💰 Updating revenue KPIs');
  
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
  
  // console.log('💰 Revenue KPIs updated:', currentMetrics);
}

/**
 * Calculate revenue metrics from transactions
 */
function calculateRevenueMetrics(transactions) {
  let grossRevenue = 0; // Doanh thu từ "đã hoàn tất" + "đã thanh toán"
  let refundAmount = 0; // Số tiền hoàn trả từ "hoàn tiền"
  let highestTransaction = { amount: 0, customer: '', product: '' };
  let validTransactionCount = 0;
  
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const status = (t.transactionType || t.loaiGiaoDich || '').toLowerCase().trim();
    const amount = t.revenue || 0;
    
    if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
      grossRevenue += amount;
      validTransactionCount++;
      
      if (amount > highestTransaction.amount) {
        highestTransaction = {
          amount: amount,
          customer: t.customerName || 'N/A',
          product: t.softwareName || 'N/A'
        };
      }
    } else if (status === 'hoàn tiền') {
      refundAmount += Math.abs(amount); // Đảm bảo số dương để trừ
    }
  });
  
  // Doanh thu gộp = "Đã thanh toán" + "Đã hoàn tất" - "Hoàn tiền"
  const totalRevenue = grossRevenue - refundAmount;
  const avgTransactionValue = validTransactionCount > 0 ? totalRevenue / validTransactionCount : 0;
  
  return {
    totalRevenue,
    grossRevenue, // Doanh thu trước khi trừ hoàn tiền
    refundAmount, // Số tiền hoàn trả
    avgTransactionValue,
    transactionCount: validTransactionCount,
    highestTransaction
  };
}

/**
 * Render revenue trend chart
 */
async function renderRevenueTrendChart(transactions, period) {
  // console.log('📈 Rendering revenue trend chart');
  
  const canvas = document.getElementById('revenue-trend-chart');
  if (!canvas) return;
  
  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }
  
  const ctx = canvas.getContext('2d');
  
  // Prepare trend data based on period
  const trendData = prepareTrendData(transactions, period);
  
  // Destroy existing chart
  if (window.revenueTrendChart) {
    window.revenueTrendChart.destroy();
  }
  
  // Create new chart
  window.revenueTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [{
        label: 'Doanh thu',
        data: trendData.values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: '#3b82f6',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Doanh thu: ${formatRevenue(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatRevenue(value);
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Render revenue category chart (pie/bar)
 */
async function renderRevenueCategoryChart(transactions) {
  console.log('🍰 Rendering revenue category chart');
  
  const canvas = document.getElementById('revenue-category-chart');
  if (!canvas) return;
  
  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }
  
  const ctx = canvas.getContext('2d');
  
  // Calculate revenue by category/software
  const categoryData = calculateRevenueByCategory(transactions);
  
  // Destroy existing chart
  if (window.revenueCategoryChart) {
    window.revenueCategoryChart.destroy();
  }
  
  // Create pie chart
  window.revenueCategoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.labels,
      datasets: [{
        data: categoryData.values,
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
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
async function loadTopCustomersByRevenue(transactions) {
  console.log('👥 Loading top customers by revenue');
  
  const customerRevenue = calculateCustomerRevenue(transactions);
  const topCustomers = customerRevenue
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  const tbody = document.getElementById('customers-revenue-tbody');
  if (!tbody) return;
  
  if (topCustomers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-data">Không có dữ liệu khách hàng</td>
      </tr>
    `;
    return;
  }
  
  const totalRevenue = customerRevenue.reduce((sum, c) => sum + c.revenue, 0);
  
  tbody.innerHTML = topCustomers.map((customer, index) => {
    const percentage = totalRevenue > 0 ? ((customer.revenue / totalRevenue) * 100).toFixed(1) : 0;
    const trend = calculateCustomerTrend(customer.name, transactions);
    
    return `
      <tr>
        <td class="rank-col">${index + 1}</td>
        <td class="customer-col">
          <div class="customer-info">
            <span class="customer-name">${customer.name}</span>
            <small class="customer-email">${customer.email || 'N/A'}</small>
          </div>
        </td>
        <td class="transactions-col">${customer.transactionCount}</td>
        <td class="revenue-col">${formatRevenue(customer.revenue)}</td>
        <td class="avg-col">${formatRevenue(customer.avgValue)}</td>
        <td class="percentage-col">${percentage}%</td>
        <td class="trend-col">
          <span class="trend ${trend.type}">
            <i class="fas fa-${trend.icon}"></i>
            ${trend.value}%
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Load top products by revenue
 */
async function loadTopProductsByRevenue(transactions) {
  console.log('💻 Loading top products by revenue');
  
  const productRevenue = calculateProductRevenue(transactions);
  const topProducts = productRevenue
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  const tbody = document.getElementById('products-revenue-tbody');
  if (!tbody) return;
  
  if (topProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-data">Không có dữ liệu sản phẩm</td>
      </tr>
    `;
    return;
  }
  
  const totalRevenue = productRevenue.reduce((sum, p) => sum + p.revenue, 0);
  
  tbody.innerHTML = topProducts.map((product, index) => {
    const marketShare = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : 0;
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
  // console.log('💡 Updating revenue insights');
  
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

function updateInsightElement(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function calculatePercentageChange(previous, current) {
  if (previous === 0) return current > 0 ? 100 : 0;
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

function calculateRevenueByCategory(transactions) {
  const categories = {};
  const refunds = {}; // Theo dõi hoàn tiền theo danh mục
  
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const status = (t.transactionType || t.loaiGiaoDich || '').toLowerCase().trim();
    const category = t.softwareName || 'Khác';
    const revenue = t.revenue || 0;
    
    if (!categories[category]) {
      categories[category] = 0;
      refunds[category] = 0;
    }
    
    if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
      categories[category] += revenue;
    } else if (status === 'hoàn tiền') {
      refunds[category] += Math.abs(revenue);
    }
  });
  
  // Tính doanh thu gộp = doanh thu - hoàn tiền cho mỗi danh mục
  const finalCategories = {};
  Object.keys(categories).forEach(category => {
    const netRevenue = categories[category] - refunds[category];
    if (netRevenue > 0) { // Chỉ hiển thị danh mục có doanh thu dương
      finalCategories[category] = netRevenue;
    }
  });
  
  return {
    labels: Object.keys(finalCategories),
    values: Object.values(finalCategories)
  };
}

function calculateCustomerRevenue(transactions) {
  const customers = {};
  
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const status = (t.transactionType || t.loaiGiaoDich || '').toLowerCase().trim();
    const customerName = t.customerName || 'Không xác định';
    const revenue = t.revenue || 0;
    
    if (!customers[customerName]) {
      customers[customerName] = {
        name: customerName,
        email: t.customerEmail || '',
        revenue: 0,
        refunds: 0,
        transactionCount: 0
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
        ...customer,
        revenue: netRevenue, // Doanh thu gộp sau khi trừ hoàn tiền
        avgValue: customer.transactionCount > 0 ? netRevenue / customer.transactionCount : 0
      };
    })
    .filter(customer => customer.revenue > 0); // Chỉ hiển thị khách hàng có doanh thu dương
}

function calculateProductRevenue(transactions) {
  const products = {};
  
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const status = (t.transactionType || t.loaiGiaoDich || '').toLowerCase().trim();
    const productName = t.softwareName || 'Không xác định';
    const revenue = t.revenue || 0;
    
    if (!products[productName]) {
      products[productName] = {
        name: productName,
        category: 'Software', // Could be enhanced with actual categories
        revenue: 0,
        refunds: 0,
        quantity: 0
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
        ...product,
        revenue: netRevenue, // Doanh thu gộp sau khi trừ hoàn tiền
        avgPrice: product.quantity > 0 ? netRevenue / product.quantity : 0
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

function generateRevenueInsights(transactions) {
  // Placeholder implementation for insights generation
  return {
    bestPerformer: {
      value: 'Software A',
      description: 'Đóng góp 35% tổng doanh thu'
    },
    growthTrend: {
      value: '+25%',
      description: 'Tăng trưởng ổn định trong 3 tháng qua'
    },
    concentration: {
      value: '80%',
      description: 'Top 20% khách hàng đóng góp 80% doanh thu'
    },
    risk: {
      value: 'Trung bình',
      description: 'Phụ thuộc vào 3 khách hàng lớn'
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
  // console.log('📊 Exporting revenue report...');
  // Implementation for export functionality
};

window.exportCustomerRevenueData = function() {
  // console.log('📊 Exporting customer revenue data...');
};

window.exportProductRevenueData = function() {
  // console.log('📊 Exporting product revenue data...');
};

window.toggleChartView = function(chartType, viewType) {
  // console.log(`🔄 Toggling ${chartType} chart to ${viewType} view`);
};

function refreshRevenueChart(period) {
  // console.log(`🔄 Refreshing revenue chart for period: ${period}`);
  // Implementation for chart refresh
}

function refreshCustomerTable(view) {
  // console.log(`🔄 Refreshing customer table for view: ${view}`);
  // Implementation for table refresh
}

function refreshProductTable(sort) {
  // console.log(`🔄 Refreshing product table for sort: ${sort}`);
  // Implementation for table refresh
}


