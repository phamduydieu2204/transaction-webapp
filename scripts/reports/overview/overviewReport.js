/**
 * overviewReport.js
 * 
 * Overview report functionality - Tổng quan kinh doanh
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatCurrency, formatDate } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { getConstants } from '../../constants.js';
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
export async function loadOverviewReport(options = {}) {
  
  try {
    // PERFORMANCE: Initialize optimizations early
    const optimizationPromises = [
      initCSSOptimizations(),
      optimizeFontLoading(),
      addResourceHints()
    ];
    
    // Load template and optimizations in parallel
    const [templateResult] = await Promise.all([
      loadOverviewHTML(),
      ...optimizationPromises
    ]);
    
    // Preload critical elements immediately
    preloadCriticalElements();
    
    // Ensure data is loaded before proceeding
    await ensureDataIsLoaded();
    
    // Get data from global variables (primary) or storage (fallback)
    const transactions = window.transactionList || getFromStorage('transactions') || [];
    const expenses = window.expenseList || getFromStorage('expenses') || [];
    
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
    
    // Update all components
    
    // Wait a moment for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await Promise.all([
      updateKPICards(kpis),
      loadTopProducts(filteredTransactions),
      loadTopCustomers(filteredTransactions),
      loadCharts(filteredTransactions, filteredExpenses),
      // updateDataTables(filteredTransactions, filteredExpenses), // Removed - status details section removed
      loadPendingTransactions(filteredTransactions, dateRange)
    ]);
    
    // PERFORMANCE: Initialize lazy loading for non-critical elements
    initOverviewLazyLoading();
    
    
  } catch (error) {
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
      throw new Error('Template not found');
    }
    
    const html = await response.text();
    
    // Find the overview report container and add content to it
    const overviewPage = document.getElementById('report-overview');
    if (overviewPage) {
      overviewPage.innerHTML = html;
      overviewPage.classList.add('active');
      
      // Verify template was applied
      setTimeout(() => {
        const hasCompleted = !!document.getElementById('completed-revenue');
        const hasChart = !!document.getElementById('revenue-status-chart');
      }, 10);
    } else {
      // Fallback: create the structure
      container.innerHTML = `<div id="report-overview" class="report-page active">${html}</div>`;
    }
    
    
    // Verify new elements exist
    setTimeout(() => {
      const completedElement = document.getElementById('completed-revenue');
      const paidElement = document.getElementById('paid-revenue');
      const unpaidElement = document.getElementById('unpaid-revenue');
      const revenueStatusChart = document.getElementById('revenue-status-chart');
      const statusDistChart = document.getElementById('status-distribution-chart');
      
      // Debug: check what's actually in the container
      const container = document.getElementById('report-overview');
    }, 50);
    
  } catch (error) {
    throw error;  // Force error instead of using fallback
  }
}

/**
 * Enhance existing structure with KPI cards
 */
function enhanceExistingStructure(container) {
  // Check if container already has the KPI structure
  if (container.querySelector('.kpi-grid')) {
    return;
  }
  
  // Add KPI cards to the beginning of the container
  const kpiHTML = `
    <div class="page-header">
      <h2>📊 Tổng quan kinh doanh</h2>
      <div class="header-actions">
        <button class="btn-refresh" onclick="refreshCurrentReport()">
          <i class="fas fa-sync-alt"></i> Làm mới
        </button>
        <button class="btn-export" onclick="exportCurrentReport()">
          <i class="fas fa-download"></i> Xuất báo cáo
        </button>
      </div>
    </div>
    
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card revenue-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-content">
          <div class="kpi-value">0 VNĐ</div>
          <div class="kpi-title">Doanh thu tháng này</div>
          <div class="kpi-growth positive">📈 +0.0%</div>
        </div>
      </div>
      
      <div class="kpi-card expense-card">
        <div class="kpi-icon">💸</div>
        <div class="kpi-content">
          <div class="kpi-value">0 VNĐ</div>
          <div class="kpi-title">Chi phí tháng này</div>
          <div class="kpi-growth positive">📈 +0.0%</div>
        </div>
      </div>
      
      <div class="kpi-card profit-card">
        <div class="kpi-icon">📈</div>
        <div class="kpi-content">
          <div class="kpi-value">0 VNĐ</div>
          <div class="kpi-title">Lợi nhuận tháng này</div>
          <div class="kpi-growth positive">📈 +0.0%</div>
        </div>
      </div>
      
      <div class="kpi-card transaction-card">
        <div class="kpi-icon">📋</div>
        <div class="kpi-content">
          <div class="kpi-value">0</div>
          <div class="kpi-title">Giao dịch tháng này</div>
          <div class="kpi-growth positive">📈 +0.0%</div>
        </div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-row">
        <div class="chart-container">
          <h3>📈 Xu hướng doanh thu</h3>
          <canvas id="revenueTrendChart"></canvas>
        </div>
        <div class="chart-container">
          <h3>🍰 Phân bổ chi phí</h3>
          <canvas id="expenseDistributionChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Data Tables Section -->
    <div class="data-tables-section">
      <div class="table-row">
        <div class="data-table-container">
          <h3>👥 Top khách hàng</h3>
          <table id="topCustomersTable" class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Doanh thu</th>
                <th>Giao dịch</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        
        <div class="data-table-container">
          <h3>📋 Giao dịch gần đây</h3>
          <table id="recentTransactionsTable" class="data-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Doanh thu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      
      <div class="data-table-container">
        <h3>💸 Chi phí lớn nhất tháng này</h3>
        <table id="topExpensesTable" class="data-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Danh mục</th>
              <th>Mô tả</th>
              <th>Số tiền</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;
  
  // Insert KPI structure at the beginning, keeping existing content
  const existingContent = container.innerHTML;
  container.innerHTML = kpiHTML + existingContent;
  
}

/**
 * Update period display
 */
function updatePeriodDisplay(period) {
  const displayElement = document.getElementById('overview-period-display');
  if (displayElement) {
    const periodLabels = {
      'today': 'Hôm nay',
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
  
  
  // Calculate conversion rates
  const paymentRate = statusBreakdown.unpaid.count > 0 
    ? ((statusBreakdown.paid.count + statusBreakdown.completed.count) / totalTransactions * 100) 
    : 0;
  const completionRate = statusBreakdown.paid.count > 0 
    ? (statusBreakdown.completed.count / (statusBreakdown.paid.count + statusBreakdown.completed.count) * 100)
    : 0;
  const successRate = totalTransactions > 0 
    ? (statusBreakdown.completed.count / totalTransactions * 100)
    : 0;
  
  
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
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
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
  
  prevTransactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const revenue = t.revenue || 0;
    const status = t.transactionType || '';
    
    if (status.toLowerCase().includes('hoàn tất')) {
      prevStatusBreakdown.completed.count++;
      prevStatusBreakdown.completed.revenue += revenue;
    } else if (status.toLowerCase().includes('đã thanh toán')) {
      prevStatusBreakdown.paid.count++;
      prevStatusBreakdown.paid.revenue += revenue;
    } else if (status.toLowerCase().includes('chưa thanh toán')) {
      prevStatusBreakdown.unpaid.count++;
      prevStatusBreakdown.unpaid.revenue += revenue;
    }
  });
  
  const prevTransactionCount = prevTransactions.length;
  
  // Calculate growth percentages
  const completedGrowth = prevStatusBreakdown.completed.revenue > 0 
    ? ((statusBreakdown.completed.revenue - prevStatusBreakdown.completed.revenue) / prevStatusBreakdown.completed.revenue * 100) 
    : 0;
  const paidGrowth = prevStatusBreakdown.paid.revenue > 0 
    ? ((statusBreakdown.paid.revenue - prevStatusBreakdown.paid.revenue) / prevStatusBreakdown.paid.revenue * 100) 
    : 0;
  const unpaidGrowth = prevStatusBreakdown.unpaid.revenue > 0 
    ? ((statusBreakdown.unpaid.revenue - prevStatusBreakdown.unpaid.revenue) / prevStatusBreakdown.unpaid.revenue * 100) 
    : 0;
  const transactionGrowth = prevTransactionCount > 0 
    ? ((totalTransactions - prevTransactionCount) / prevTransactionCount * 100) 
    : 0;
  
  return {
    statusBreakdown: statusBreakdown,
    completed: {
      current: statusBreakdown.completed.revenue,
      previous: prevStatusBreakdown.completed.revenue,
      growth: completedGrowth,
      count: statusBreakdown.completed.count
    },
    paid: {
      current: statusBreakdown.paid.revenue,
      previous: prevStatusBreakdown.paid.revenue,
      growth: paidGrowth,
      count: statusBreakdown.paid.count
    },
    unpaid: {
      current: statusBreakdown.unpaid.revenue,
      previous: prevStatusBreakdown.unpaid.revenue,
      growth: unpaidGrowth,
      count: statusBreakdown.unpaid.count
    },
    transactions: {
      current: totalTransactions,
      previous: prevTransactionCount,
      growth: transactionGrowth
    },
    conversion: {
      paymentRate: paymentRate,
      completionRate: completionRate,
      successRate: successRate
    },
    totalRevenue: totalRevenue
  };
}

/**
 * Update KPI cards with calculated data
 */
async function updateKPICards(kpis) {
  
  // Check if we have the new metrics structure (with grossRevenue, pendingCollection, etc.)
  const hasNewMetrics = kpis.grossRevenue !== undefined && kpis.statusBreakdown !== undefined;
  
  // Check if we're using the new template with status-based elements
  const newTemplate = document.getElementById('completed-revenue') !== null;
  
  if (newTemplate && hasNewMetrics) {
    // New template - Use updated business metrics structure
    
    // Map updated business metrics to KPI cards
    
    updateKPICard('grossRevenue', {
      value: kpis.grossRevenue || 0,
      growth: kpis.growthRates?.grossRevenue || 0,
      elementId: 'completed-revenue',
      changeId: 'completed-change'
    });
    
    updateKPICard('pendingCollection', {
      value: kpis.pendingCollection || 0,
      growth: kpis.growthRates?.pendingCollection || 0,
      elementId: 'paid-revenue', 
      changeId: 'paid-change'
    });
    
    updateKPICard('pendingPayment', {
      value: kpis.pendingPayment || 0,
      growth: kpis.growthRates?.pendingPayment || 0,
      elementId: 'unpaid-revenue',
      changeId: 'unpaid-change'
    });
    
    updateKPICard('totalRefunds', {
      value: kpis.totalRefunds || 0,
      growth: kpis.growthRates?.totalRefunds || 0,
      elementId: 'refund-revenue',
      changeId: 'refund-change'
    });
    
    updateKPICard('refundRate', {
      value: kpis.refundRate || 0,
      growth: 0, // Rate growth calculation can be added later
      elementId: 'refund-rate',
      changeId: 'refund-rate-change',
      isPercentage: true
    });
    
    updateKPICard('effectiveTransactions', {
      value: kpis.effectiveTransactions || 0,
      growth: kpis.growthRates?.effectiveTransactions || 0,
      elementId: 'total-transactions',
      changeId: 'transaction-change'
    });
    
    // Update status breakdown with new data
    updateStatusBreakdownWithNewMetrics(kpis);
    
  } else if (newTemplate && !hasNewMetrics) {
    // New template but old metrics structure - use legacy mapping
    updateKPICard('completed', {
      value: kpis.financial?.totalRevenue || 0,
      growth: 0,
      elementId: 'completed-revenue',
      changeId: 'completed-change'
    });
    
    updateKPICard('pendingCollection', {
      value: kpis.financial?.totalRevenue || 0, 
      growth: 0,
      elementId: 'paid-revenue', 
      changeId: 'paid-change'
    });
    
    updateKPICard('pendingPayment', {
      value: 0,
      growth: 0,
      elementId: 'unpaid-revenue',
      changeId: 'unpaid-change'
    });
    
    updateKPICard('totalRefunds', {
      value: 0,
      growth: 0,
      elementId: 'refund-revenue',
      changeId: 'refund-change'
    });
    
    updateKPICard('refundRate', {
      value: 0,
      growth: 0,
      elementId: 'refund-rate',
      changeId: 'refund-rate-change',
      isPercentage: true
    });
    
    updateKPICard('effectiveTransactions', {
      value: kpis.revenue?.totalTransactions || 0,
      growth: 0,
      elementId: 'total-transactions',
      changeId: 'transaction-change'
    });
    
  } else {
    // Old template fallback - convert new metrics to old structure
    updateKPICard('revenue', {
      value: kpis.grossRevenue || kpis.financial?.totalRevenue || 0,
      growth: kpis.growthRates?.grossRevenue || 0,
      elementId: 'total-revenue',
      changeId: 'revenue-change'
    });
    
    updateKPICard('transaction', {
      value: kpis.effectiveTransactions || kpis.revenue?.totalTransactions || 0,
      growth: kpis.growthRates?.effectiveTransactions || 0,
      elementId: 'total-transactions',
      changeId: 'transaction-change'
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
    return;
  }
  
  
  if (valueElement) {
    if (data.isPercentage) {
      // For percentage values like refund rate
      valueElement.textContent = data.value.toFixed(2) + '%';
    } else if (type.includes('transaction') || type === 'effectiveTransactions') {
      // For transaction counts
      valueElement.textContent = data.value.toLocaleString();
    } else {
      // For currency values
      valueElement.textContent = formatRevenue(data.value);
    }
  }
  
  if (changeElement) {
    const isPositive = data.growth >= 0;
    const arrow = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const sign = data.growth >= 0 ? '+' : '';
    
    // Check which template we're using based on class names
    const isMetricTemplate = changeElement.classList.contains('kpi-metric-change') || 
                            changeElement.parentElement?.classList.contains('kpi-metric-box');
    const isBoxTemplate = changeElement.classList.contains('kpi-box-change') || 
                         changeElement.parentElement?.classList.contains('kpi-box');
    
    if (isMetricTemplate) {
      // New metric template (6-box grid)
      
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
function updateStatusBreakdownWithNewMetrics(kpis) {
  
  const total = kpis.effectiveTransactions; // Use effective transactions (excluding cancelled)
  
  // Update counts
  const completedElement = document.getElementById('completed-count');
  const paidElement = document.getElementById('paid-count');
  const unpaidElement = document.getElementById('unpaid-count');
  const refundedElement = document.getElementById('refunded-count');
  
  if (completedElement) completedElement.textContent = kpis.statusBreakdown.completed.count;
  if (paidElement) paidElement.textContent = kpis.statusBreakdown.paid.count;
  if (unpaidElement) unpaidElement.textContent = kpis.statusBreakdown.unpaid.count;
  if (refundedElement) refundedElement.textContent = kpis.statusBreakdown.refunded.count;
  
  // Update percentages and bars
  const completedPercent = total > 0 ? (kpis.statusBreakdown.completed.count / total * 100) : 0;
  const paidPercent = total > 0 ? (kpis.statusBreakdown.paid.count / total * 100) : 0;
  const unpaidPercent = total > 0 ? (kpis.statusBreakdown.unpaid.count / total * 100) : 0;
  const refundedPercent = kpis.totalTransactions > 0 ? (kpis.statusBreakdown.refunded.count / kpis.totalTransactions * 100) : 0;
  
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
}

/**
 * Update status breakdown display (legacy function for compatibility)
 */
function updateStatusBreakdown(kpis) {
  // Check if we have new metrics structure
  if (kpis.statusBreakdown) {
    updateStatusBreakdownWithNewMetrics(kpis);
    return;
  }
  
  // Legacy fallback
  const total = kpis.transactions?.current || 0;
  
  // Update counts
  const completedElement = document.getElementById('completed-count');
  const paidElement = document.getElementById('paid-count');
  const unpaidElement = document.getElementById('unpaid-count');
  
  if (completedElement && kpis.completed) completedElement.textContent = kpis.completed.count;
  if (paidElement && kpis.paid) paidElement.textContent = kpis.paid.count;
  if (unpaidElement && kpis.unpaid) unpaidElement.textContent = kpis.unpaid.count;
  
  // Update percentages and bars
  if (kpis.completed && kpis.paid && kpis.unpaid) {
    const completedPercent = total > 0 ? (kpis.completed.count / total * 100) : 0;
    const paidPercent = total > 0 ? (kpis.paid.count / total * 100) : 0;
    const unpaidPercent = total > 0 ? (kpis.unpaid.count / total * 100) : 0;
    
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
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Render revenue by status chart - Hiển thị xu hướng doanh thu theo chu kỳ báo cáo
 * @param {Array} transactions - Filtered transactions for current period
 */
function renderRevenueStatusChart(transactions) {
  const canvas = document.getElementById('revenue-status-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Get current report period from global filters
  const currentPeriod = window.globalFilters?.period || 'this_month';
  const dateRange = window.globalFilters?.dateRange || null;
  
  
  // Prepare data based on current report cycle
  let chartData;
  if (currentPeriod === 'all_time') {
    // Show yearly data for all time
    chartData = getYearlyDataByStatus(transactions);
  } else if (['this_year', 'last_year'].includes(currentPeriod)) {
    // Show monthly data for year periods
    chartData = getMonthlyDataByStatus(transactions, currentPeriod);
  } else if (['this_month', 'last_month', 'last_30_days'].includes(currentPeriod)) {
    // Show weekly data for month periods
    chartData = getWeeklyDataByStatus(transactions, currentPeriod);
  } else if (['this_week', 'last_week', 'last_7_days'].includes(currentPeriod)) {
    // Show daily data for week periods
    chartData = getDailyDataByStatus(transactions, currentPeriod);
  } else {
    // Default: show last 6 months
    chartData = getLastSixMonthsDataByStatus(transactions);
  }
  
  // Destroy existing chart if it exists
  if (window.revenueChart instanceof Chart) {
    window.revenueChart.destroy();
  }

  // Create modern revenue trend chart
  window.revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Đã hoàn tất',
          data: chartData.completed,
          backgroundColor: '#27ae60',
          borderColor: '#229954',
          borderWidth: 1,
          order: 1
        },
        {
          label: 'Đã thanh toán',
          data: chartData.paid,
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1,
          order: 2
        },
        {
          label: 'Hoàn tiền',
          data: chartData.refunded || chartData.unpaid,
          backgroundColor: function(context) {
            const value = context.parsed.y;
            // Use different shades for negative values
            return value < 0 ? '#c0392b' : '#e74c3c';
          },
          borderColor: '#c0392b',
          borderWidth: function(context) {
            const value = context.parsed.y;
            // Thicker border for negative values to highlight
            return value < 0 ? 3 : 1;
          },
          order: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 10,
          right: 10
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: `Xu hướng doanh thu theo trạng thái - ${getPeriodDisplayName(currentPeriod)}`,
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#fff',
          borderWidth: 1,
          callbacks: {
            title: function(tooltipItems) {
              return `Kỳ báo cáo: ${tooltipItems[0].label}`;
            },
            label: function(context) {
              const value = formatRevenue(context.parsed.y);
              const total = context.chart.data.datasets.reduce((sum, dataset) => {
                return sum + (dataset.data[context.dataIndex] || 0);
              }, 0);
              const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
              return `${context.dataset.label}: ${value} (${percentage}%)`;
            },
            footer: function(tooltipItems) {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
              return `Tổng: ${formatRevenue(total)}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false, // Changed to false to show individual bars
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          stacked: false, // Changed to false to show individual values
          beginAtZero: false, // Allow negative values to show properly
          grace: '10%', // Add 10% padding above and below
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            callback: function(value) {
              return formatRevenue(value);
            },
            font: {
              size: 11
            },
            maxTicksLimit: 8 // Limit ticks for better readability
          },
          // Advanced auto-scale for small values visibility
          afterDataLimits: function(scale) {
            const originalRange = scale.max - scale.min;
            
            // Calculate minimum visible bar height (at least 50 units = 50k VND)
            const minVisibleValue = 50;
            
            // If range is too small, expand it
            if (originalRange < minVisibleValue * 10) {
              const center = (scale.max + scale.min) / 2;
              const newRange = Math.max(minVisibleValue * 10, originalRange * 2);
              scale.max = center + newRange / 2;
              scale.min = center - newRange / 2;
            }
            
            // Add substantial padding for small values
            const range = scale.max - scale.min;
            const padding = Math.max(range * 0.15, 200); // Increased padding (200 units = 200k VND)
            scale.max += padding;
            scale.min -= padding;
            
            // Special handling for negative values (refunds)
            if (scale.min > -minVisibleValue && scale.max > 0) {
              scale.min = Math.min(scale.min, -Math.max(scale.max * 0.3, minVisibleValue * 2));
            }
            
            // Ensure zero line is visible if data crosses zero
            if (scale.min < 0 && scale.max > 0) {
              scale.min = Math.min(scale.min, -scale.max * 0.2);
            }
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 3,
          // Ensure minimum bar height for visibility
          minBarLength: 3
        }
      },
      // Plugin to ensure small bars are visible
      plugins: [
        {
          id: 'minBarHeight',
          beforeDatasetDraw: function(chart, args, options) {
            const dataset = args.dataset;
            const meta = args.meta;
            
            // Adjust bars that are too small to see
            meta.data.forEach((bar, index) => {
              if (bar && dataset.data[index] !== 0) {
                const barHeight = Math.abs(bar.height);
                if (barHeight < 5) { // If bar is less than 5 pixels
                  const sign = dataset.data[index] >= 0 ? 1 : -1;
                  bar.height = 5 * sign; // Set minimum height
                }
              }
            });
          }
        }
      ]
    }
  });
  
}

/**
 * Render status distribution chart with detailed breakdown
 */
function renderStatusDistributionChart(transactions) {
  const canvas = document.getElementById('status-distribution-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Calculate detailed status breakdown with amounts
  const statusBreakdown = calculateDetailedStatusBreakdown(transactions);
  
  // Destroy existing chart if it exists
  if (window.statusDistributionChart instanceof Chart) {
    window.statusDistributionChart.destroy();
  }
  
  window.statusDistributionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Đã hoàn tất', 'Đã thanh toán', 'Hoàn tiền'],
      datasets: [{
        data: [statusBreakdown.completed.count, statusBreakdown.paid.count, statusBreakdown.refunded.count],
        backgroundColor: function(context) {
          const colors = [
            '#27ae60', // Completed - Green
            '#3498db', // Paid - Blue  
            '#e74c3c'  // Refunded - Red (highlighted)
          ];
          const data = context.chart.data.datasets[0].data[context.dataIndex];
          const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
          const percentage = total > 0 ? (data / total) * 100 : 0;
          
          // Use brighter colors for small segments to make them more visible
          if (percentage < 5) {
            const brightColors = ['#2ecc71', '#5dade2', '#ff6b6b'];
            return brightColors[context.dataIndex];
          }
          return colors[context.dataIndex];
        },
        borderColor: [
          '#1e8449', // Darker green for better contrast
          '#1f618d', // Darker blue for better contrast
          '#922b21'  // Much darker red for better contrast
        ],
        borderWidth: function(context) {
          // Make all borders thicker for better visibility
          const data = context.chart.data.datasets[0].data[context.dataIndex];
          const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
          const percentage = total > 0 ? (data / total) * 100 : 0;
          
          // Progressive border thickness based on segment size
          if (percentage < 2) {
            return 6; // Very thick for tiny segments
          } else if (percentage < 5) {
            return 5; // Thick for small segments
          } else if (context.dataIndex === 2) {
            return 4; // Thick for refunds (always highlight)
          }
          return 3; // Standard thick border for all segments
        },
        hoverBackgroundColor: [
          '#2ecc71',
          '#5dade2', 
          '#ec7063'
        ],
        hoverBorderWidth: function(context) {
          const data = context.chart.data.datasets[0].data[context.dataIndex];
          const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
          const percentage = total > 0 ? (data / total) * 100 : 0;
          
          // Thicker hover borders for small segments and refunds
          if (percentage < 5 || context.dataIndex === 2) {
            return 6;
          }
          return 3;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1, // Force 1:1 aspect ratio for perfect circle
      cutout: '40%', // Optimal cutout for modern design
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      },
      plugins: {
        legend: {
          display: false // Hide default legend, we'll use custom table
        },
        tooltip: {
          backgroundColor: function(context) {
            const dataIndex = context.tooltip.dataPoints[0].dataIndex;
            const data = context.tooltip.chart.data.datasets[0].data[dataIndex];
            const total = context.tooltip.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            // Brighter background for small segments
            if (percentage < 5) {
              return 'rgba(255, 255, 255, 0.95)';
            }
            return 'rgba(0, 0, 0, 0.9)';
          },
          titleColor: function(context) {
            const dataIndex = context.tooltip.dataPoints[0].dataIndex;
            const data = context.tooltip.chart.data.datasets[0].data[dataIndex];
            const total = context.tooltip.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            return percentage < 5 ? '#000' : '#fff';
          },
          bodyColor: function(context) {
            const dataIndex = context.tooltip.dataPoints[0].dataIndex;
            const data = context.tooltip.chart.data.datasets[0].data[dataIndex];
            const total = context.tooltip.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            return percentage < 5 ? '#000' : '#fff';
          },
          borderColor: function(context) {
            const dataIndex = context.tooltip.dataPoints[0].dataIndex;
            const data = context.tooltip.chart.data.datasets[0].data[dataIndex];
            const total = context.tooltip.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            return percentage < 5 ? '#000' : '#fff';
          },
          borderWidth: function(context) {
            const dataIndex = context.tooltip.dataPoints[0].dataIndex;
            const data = context.tooltip.chart.data.datasets[0].data[dataIndex];
            const total = context.tooltip.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            // Thicker border for small segments
            return percentage < 5 ? 3 : 1;
          },
          padding: function(context) {
            const dataIndex = context.tooltip.dataPoints[0].dataIndex;
            const data = context.tooltip.chart.data.datasets[0].data[dataIndex];
            const total = context.tooltip.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            // Larger padding for small segments
            return percentage < 5 ? 16 : 12;
          },
          callbacks: {
            title: function(tooltipItems) {
              const item = tooltipItems[0];
              return `${item.label} - Chi tiết`;
            },
            label: function(context) {
              const label = context.label || '';
              const dataIndex = context.dataIndex;
              const breakdown = statusBreakdown;
              let statusData;
              
              if (dataIndex === 0) statusData = breakdown.completed;
              else if (dataIndex === 1) statusData = breakdown.paid;
              else statusData = breakdown.refunded;
              
              const total = breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count;
              const percentage = total > 0 ? ((statusData.count / total) * 100).toFixed(1) : 0;
              
              const lines = [
                `Số lượng: ${statusData.count} giao dịch`,
                `Tỷ lệ: ${percentage}%`,
                `Tổng tiền: ${formatRevenue(statusData.amount)}`,
                `Trung bình: ${formatRevenue(statusData.count > 0 ? statusData.amount / statusData.count : 0)}`
              ];
              
              // Add special note for small segments
              if (percentage < 5 && statusData.count > 0) {
                lines.push(''); // Empty line
                lines.push('⚠️ Phân khúc nhỏ - đã tăng cường hiển thị');
              }
              
              // Add special note for refunds
              if (dataIndex === 2 && statusData.amount < 0) {
                lines.push(''); // Empty line
                lines.push('🔴 Hoàn tiền - ảnh hưởng tiêu cực đến doanh thu');
              }
              
              return lines;
            },
            footer: function(tooltipItems) {
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
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1200
      },
      // Ensure small segments are always visible
      circumference: Math.PI * 2,
      rotation: 0,
      // Enhanced interaction for small segments
      onHover: function(event, activeElements) {
        if (activeElements.length > 0) {
          event.native.target.style.cursor = 'pointer';
        } else {
          event.native.target.style.cursor = 'default';
        }
      },
      elements: {
        arc: {
          // Ensure minimum angle for small segments
          borderAlign: 'outer',
          spacing: 2, // Add spacing between segments for better visibility
          offset: function(context) {
            const data = context.chart.data.datasets[0].data[context.dataIndex];
            const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (data / total) * 100 : 0;
            
            // Slightly offset small segments to make them more visible
            if (percentage < 5) {
              return 5;
            }
            return 0;
          }
        }
      },
      // Plugin to ensure minimum visibility and full circle display
      plugins: [
        {
          id: 'minSegmentAngle',
          beforeDraw: function(chart) {
            const dataset = chart.data.datasets[0];
            const total = dataset.data.reduce((sum, val) => sum + val, 0);
            
            // Ensure minimum 3% visibility for any non-zero segment
            dataset.data.forEach((value, index) => {
              if (value > 0 && (value / total) < 0.03) {
                const minValue = total * 0.03;
                dataset._originalData = dataset._originalData || [...dataset.data];
                dataset.data[index] = minValue;
              }
            });
          }
        },
        {
          id: 'forceFullCircle',
          beforeDraw: function(chart) {
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
  
  transactions.forEach(rawTransaction => {
    // Normalize transaction data
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const amount = t.revenue || 0;
    const status = getTransactionTypeDisplay(t.transactionType);
    
    if (status === 'Đã hoàn tất') {
      breakdown.completed.count++;
      breakdown.completed.amount += amount;
    } else if (status === 'Đã thanh toán') {
      breakdown.paid.count++;
      breakdown.paid.amount += amount;
    } else if (status === 'Hoàn tiền') {
      breakdown.refunded.count++;
      // Refund amounts should be negative to highlight the loss
      breakdown.refunded.amount += Math.abs(amount) * -1;
    }
  });
  
  return breakdown;
}

/**
 * Update status detail table with breakdown data
 * @param {Object} statusBreakdown - Status breakdown data
 */
function updateStatusDetailTable(statusBreakdown) {
  const tableBody = document.getElementById('status-detail-tbody');
  if (!tableBody) return;
  
  const total = {
    count: statusBreakdown.completed.count + statusBreakdown.paid.count + statusBreakdown.refunded.count,
    amount: statusBreakdown.completed.amount + statusBreakdown.paid.amount + statusBreakdown.refunded.amount
  };
  
  const tableRows = [
    {
      status: 'Đã hoàn tất',
      icon: '<i class="fas fa-check-circle" style="color: #27ae60;"></i>',
      count: statusBreakdown.completed.count,
      amount: statusBreakdown.completed.amount,
      percentage: total.count > 0 ? ((statusBreakdown.completed.count / total.count) * 100).toFixed(1) : 0,
      className: 'status-completed'
    },
    {
      status: 'Đã thanh toán',
      icon: '<i class="fas fa-clock" style="color: #3498db;"></i>',
      count: statusBreakdown.paid.count,
      amount: statusBreakdown.paid.amount,
      percentage: total.count > 0 ? ((statusBreakdown.paid.count / total.count) * 100).toFixed(1) : 0,
      className: 'status-paid'
    },
    {
      status: 'Hoàn tiền',
      icon: '<i class="fas fa-undo-alt" style="color: #e74c3c;"></i>',
      count: statusBreakdown.refunded.count,
      amount: statusBreakdown.refunded.amount,
      percentage: total.count > 0 ? ((statusBreakdown.refunded.count / total.count) * 100).toFixed(1) : 0,
      className: 'status-refunded' // Special class for highlighting
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
  const totalRow = `
    <tr class="total-row">
      <td class="status-cell total-label">
        <i class="fas fa-calculator" style="color: #6c757d;"></i>
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
  
  tableBody.innerHTML += totalRow;
  
}

/**
 * Get status distribution with refund support
 * @param {Array} transactions - Transactions to analyze
 * @returns {Object} Status distribution counts
 */
function getStatusDistributionWithRefund(transactions) {
  let completed = 0;
  let paid = 0;
  let refunded = 0;
  
  transactions.forEach(t => {
    const status = (t.loaiGiaoDich || t.transactionType || t.status || '').toLowerCase();
    
    if (status.includes('hoàn tất') || status.includes('completed')) {
      completed++;
    } else if (status.includes('đã thanh toán') || status.includes('paid')) {
      paid++;
    } else if (status.includes('hoàn tiền') || status.includes('refund')) {
      refunded++;
    }
  });
  
  return {
    completed: completed,
    paid: paid,
    refunded: refunded
  };
}

/**
 * Render expense distribution chart
 */
function renderExpenseDistributionChart(expenses) {
  const canvas = document.getElementById('expense-distribution-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Group expenses by category
  const categoryData = getExpensesByCategory(expenses);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.labels,
      datasets: [{
        data: categoryData.values,
        backgroundColor: [
          '#e74c3c',
          '#f39c12',
          '#f1c40f',
          '#27ae60',
          '#3498db',
          '#9b59b6',
          '#34495e',
          '#e67e22'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
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
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.ngayGiaoDich || t.date);
      return transactionDate.getMonth() === date.getMonth() && 
             transactionDate.getFullYear() === date.getFullYear();
    });
    
    const statusRevenue = calculateRevenueByStatus(monthTransactions);
    
    months.push(monthName);
    completed.push(statusRevenue.completed);
    paid.push(statusRevenue.paid);
    refunded.push(statusRevenue.refunded);
  }
  
  return {
    labels: months,
    completed: completed,
    paid: paid,
    refunded: refunded,
    unpaid: refunded // Backward compatibility
  };
}

/**
 * Get yearly data grouped by status (for all_time period)
 */
function getYearlyDataByStatus(transactions) {
  const years = new Set();
  transactions.forEach(t => {
    const transactionDate = new Date(t.ngayGiaoDich || t.date);
    if (!isNaN(transactionDate.getTime())) {
      years.add(transactionDate.getFullYear());
    }
  });
  
  const sortedYears = Array.from(years).sort();
  const labels = sortedYears.map(year => year.toString());
  const completed = [];
  const paid = [];
  const refunded = [];
  
  sortedYears.forEach(year => {
    const yearTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.ngayGiaoDich || t.date);
      return transactionDate.getFullYear() === year;
    });
    
    const statusRevenue = calculateRevenueByStatus(yearTransactions);
    completed.push(statusRevenue.completed);
    paid.push(statusRevenue.paid);
    refunded.push(statusRevenue.refunded);
  });
  
  return { labels, completed, paid, refunded };
}

/**
 * Get monthly data grouped by status (for yearly periods)
 */
function getMonthlyDataByStatus(transactions, period) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const targetYear = period === 'last_year' ? currentYear - 1 : currentYear;
  
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
    completed.push(statusRevenue.completed);
    paid.push(statusRevenue.paid);
    refunded.push(statusRevenue.refunded);
    
    current.setDate(current.getDate() + 1);
  }
  
  return { labels, completed, paid, refunded };
}

/**
 * Calculate revenue by status for given transactions
 * @param {Array} transactions - Transactions to calculate
 * @returns {Object} Revenue breakdown by status
 */
function calculateRevenueByStatus(transactions) {
  let completed = 0;
  let paid = 0;
  let refunded = 0;
  
  transactions.forEach(t => {
    const revenue = parseFloat(t.doanhThu || t.revenue || t.Revenue || t.doanh_thu) || 0;
    const status = (t.loaiGiaoDich || t.transactionType || t.status || '').toLowerCase();
    
    if (status.includes('hoàn tất') || status.includes('completed')) {
      completed += revenue;
    } else if (status.includes('đã thanh toán') || status.includes('paid')) {
      paid += revenue;
    } else if (status.includes('hoàn tiền') || status.includes('refund') || status.includes('chưa thanh toán')) {
      refunded += revenue;
    }
  });
  
  return { completed, paid, refunded };
}

/**
 * Get weeks in a given month
 * @param {Date} monthDate - Date in the target month
 * @returns {Array} Array of week objects with start and end dates
 */
function getWeeksInMonth(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const weeks = [];
  let currentWeekStart = new Date(firstDay);
  
  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    
    if (weekEnd > lastDay) {
      weekEnd.setTime(lastDay.getTime());
    }
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: new Date(weekEnd)
    });
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Get display name for period
 * @param {string} period - Period identifier
 * @returns {string} Display name in Vietnamese
 */
function getPeriodDisplayName(period) {
  const periodNames = {
    'all_time': 'Tất cả thời gian',
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
  
  return periodNames[period] || period;
}



// Legacy function - kept for backward compatibility
function getStatusDistribution(transactions) {
  return getStatusDistributionWithRefund(transactions);
}

/**
 * Get expenses grouped by category
 */
function getExpensesByCategory(expenses) {
  const categories = {};
  
  expenses.forEach(expense => {
    const category = expense.danhMuc || expense.category || 'Khác';
    categories[category] = (categories[category] || 0) + (parseFloat(expense.soTien || expense.amount) || 0);
  });
  
  return {
    labels: Object.keys(categories),
    values: Object.values(categories)
  };
}

/**
 * Render revenue trend chart (old template)
 */
function renderRevenueTrendChart(transactions) {
  const canvas = document.getElementById('revenueTrendChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Prepare data for last 6 months
  const monthsData = getLastSixMonthsData(transactions);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthsData.labels,
      datasets: [{
        label: 'Doanh thu',
        data: monthsData.values,
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderColor: '#3498db',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
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
    
    const monthRevenue = transactions
      .filter(rawTransaction => {
        const t = normalizeTransaction(rawTransaction);
        if (!t) return false;
        const transactionDate = new Date(t.transactionDate);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, rawTransaction) => {
        const t = normalizeTransaction(rawTransaction);
        return sum + (t ? t.revenue || 0 : 0);
      }, 0);
    
    months.push(monthName);
    values.push(monthRevenue);
  }
  
  return { labels: months, values: values };
}

/**
 * Update data tables
 */
function updateDataTables(transactions, expenses) {
  // Check which template we're using
  const hasNewTables = document.getElementById('top-customers-body') !== null;
  const hasOldTables = document.getElementById('topCustomersTable') !== null;
  
  if (hasNewTables) {
    // New template - tables are updated via loadTopCustomers and loadTopProducts
  } else if (hasOldTables) {
    // Old template
    updateTopCustomersTable(transactions);
    updateRecentTransactionsTable(transactions);
    updateTopExpensesTable(expenses);
  }
}

/**
 * Update top customers table
 */
function updateTopCustomersTable(transactions) {
  const table = document.querySelector('#topCustomersTable tbody');
  if (!table) return;
  
  // Group by customer and calculate totals
  const customers = {};
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const customer = t.customerName || 'Không xác định';
    if (!customers[customer]) {
      customers[customer] = {
        name: customer,
        revenue: 0,
        transactions: 0
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
    
  } catch (error) {
    showError('Không thể tải dữ liệu sản phẩm hàng đầu');
  }
}

/**
 * Calculate comprehensive product analytics
 * @param {Array} transactions - All transactions
 * @returns {Object} Product analytics data
 */
function calculateProductAnalytics(transactions) {
  const productStats = {};
  let totalQuantity = 0;
  let totalRevenue = 0;
  
  // Group and analyze by product
  transactions.forEach(rawTransaction => {
    const transaction = normalizeTransaction(rawTransaction);
    const product = getTransactionField(transaction, 'softwareName') || 'Không xác định';
    const revenue = getTransactionField(transaction, 'revenue') || 0;
    const quantity = parseFloat(transaction.quantity || transaction.soLuong) || 1; // Default 1 if not specified
    const transactionDate = new Date(getTransactionField(transaction, 'transactionDate') || transaction.ngayGiaoDich || transaction.date);
    
    totalQuantity += quantity;
    totalRevenue += revenue;
    
    if (!productStats[product]) {
      productStats[product] = {
        name: product,
        totalRevenue: 0,
        totalQuantity: 0,
        transactionCount: 0,
        transactions: [],
        firstSale: transactionDate,
        lastSale: transactionDate
      };
    }
    
    const productData = productStats[product];
    productData.totalRevenue += revenue;
    productData.totalQuantity += quantity;
    productData.transactionCount += 1;
    productData.transactions.push({
      date: transactionDate,
      revenue: revenue,
      quantity: quantity,
      customer: transaction.tenKhachHang || transaction.customer
    });
    
    // Update date range
    if (transactionDate < productData.firstSale) {
      productData.firstSale = transactionDate;
    }
    if (transactionDate > productData.lastSale) {
      productData.lastSale = transactionDate;
    }
  });
  
  // Calculate additional metrics for each product
  const products = Object.values(productStats).map(product => {
    const avgPrice = product.totalRevenue / product.totalQuantity;
    const daysSinceFirst = Math.floor((new Date() - product.firstSale) / (1000 * 60 * 60 * 24));
    const daysSinceLast = Math.floor((new Date() - product.lastSale) / (1000 * 60 * 60 * 24));
    const salesVelocity = daysSinceFirst > 0 ? product.totalQuantity / (daysSinceFirst / 30) : 0; // sales per month
    
    // Calculate recent performance (last 30 days)
    const recentTransactions = product.transactions.filter(t => {
      const daysSince = Math.floor((new Date() - t.date) / (1000 * 60 * 60 * 24));
      return daysSince <= 30;
    });
    const recentQuantity = recentTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const recentRevenue = recentTransactions.reduce((sum, t) => sum + t.revenue, 0);
    
    // Growth calculation (compare recent vs previous period)
    const previousTransactions = product.transactions.filter(t => {
      const daysSince = Math.floor((new Date() - t.date) / (1000 * 60 * 60 * 24));
      return daysSince > 30 && daysSince <= 60;
    });
    const previousQuantity = previousTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const growthRate = previousQuantity > 0 ? ((recentQuantity - previousQuantity) / previousQuantity * 100) : 0;
    
    // Market share calculation
    const marketShare = totalQuantity > 0 ? (product.totalQuantity / totalQuantity * 100) : 0;
    const revenueShare = totalRevenue > 0 ? (product.totalRevenue / totalRevenue * 100) : 0;
    
    // Performance score (combines sales volume, revenue, growth, recency)
    const recentWeight = Math.max(0, 1 - (daysSinceLast / 180)); // Less weight if not sold recently
    const performanceScore = (product.totalQuantity * 0.3) + (product.totalRevenue * 0.0001) + (growthRate * 0.2) + (recentWeight * 100);
    
    // Product status classification
    const isBestseller = marketShare >= 15; // Top 15% market share
    const isHot = recentQuantity > 0 && daysSinceLast <= 7; // Sold in last week
    const isSlow = daysSinceLast > 90; // No sales in 90 days
    const isTrending = growthRate > 50; // 50%+ growth
    
    return {
      ...product,
      avgPrice,
      daysSinceFirst,
      daysSinceLast,
      salesVelocity,
      growthRate,
      marketShare,
      revenueShare,
      performanceScore,
      recentQuantity,
      recentRevenue,
      isBestseller,
      isHot,
      isSlow,
      isTrending
    };
  });
  
  return {
    products,
    totalRevenue,
    totalQuantity,
    totalProducts: products.length,
    bestsellers: products.filter(p => p.isBestseller),
    hotProducts: products.filter(p => p.isHot),
    slowProducts: products.filter(p => p.isSlow),
    trendingProducts: products.filter(p => p.isTrending)
  };
}

/**
 * Update product summary statistics
 * @param {Object} analytics - Product analytics data
 */
function updateProductSummary(analytics) {
  const totalProductsEl = document.getElementById('total-products');
  const hottestProductEl = document.getElementById('hottest-product');
  const top3MarketShareEl = document.getElementById('top3-market-share');
  
  if (totalProductsEl) {
    totalProductsEl.textContent = analytics.totalProducts;
  }
  
  if (hottestProductEl) {
    const hottest = analytics.products.sort((a, b) => b.recentQuantity - a.recentQuantity)[0];
    hottestProductEl.textContent = hottest ? hottest.name : 'N/A';
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
      return products.sort((a, b) => b.growthRate - a.growthRate);
    case 'bestseller':
    default:
      return products.sort((a, b) => b.totalQuantity - a.totalQuantity);
  }
}

/**
 * Render enhanced product table
 * @param {Array} products - Sorted product data
 * @param {Object} analytics - Product analytics
 */
function renderEnhancedProductTable(products, analytics) {
  const container = document.getElementById('top-software-body');
  if (!container) return;
  
  const topProducts = products.slice(0, 10); // Show top 10
  
  if (topProducts.length === 0) {
    container.innerHTML = `
      <tr class="empty-row">
        <td colspan="8" class="empty-message">
          <i class="fas fa-box-open"></i> 
          Chưa có dữ liệu sản phẩm
        </td>
      </tr>
    `;
    return;
  }
  
  container.innerHTML = topProducts.map((product, index) => {
    const performanceClass = product.performanceScore > 100 ? 'excellent' : product.performanceScore > 50 ? 'good' : 'average';
    const statusBadges = [];
    
    if (product.isBestseller) statusBadges.push('<span class="badge bestseller">🏆 Bán chạy</span>');
    if (product.isHot) statusBadges.push('<span class="badge hot">🔥 Hót</span>');
    if (product.isTrending) statusBadges.push('<span class="badge trending">📈 Xu hướng</span>');
    if (product.isSlow) statusBadges.push('<span class="badge slow">🐢 Chậm</span>');
    
    const performanceIcon = performanceClass === 'excellent' ? '🎆' : performanceClass === 'good' ? '✅' : '📈';
    
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
    
  } catch (error) {
    showError('Không thể tải dữ liệu khách hàng hàng đầu');
  }
}

/**
 * Calculate comprehensive customer analytics
 * @param {Array} transactions - All transactions
 * @returns {Object} Customer analytics data
 */
function calculateCustomerAnalytics(transactions) {
  const customerStats = {};
  let totalRevenue = 0;
  
  // Group and analyze by customer using email as unique identifier
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    // Use email as unique identifier if available, otherwise fallback to customerName
    const customerEmail = t.email;
    const customerName = t.customerName || 'Không xác định';
    const customerKey = customerEmail || customerName || 'unknown-customer';
    const revenue = t.revenue || 0;
    const transactionDate = new Date(t.transactionDate);
    
    totalRevenue += revenue;
    
    if (!customerStats[customerKey]) {
      customerStats[customerKey] = {
        email: customerEmail || null,
        name: customerName,
        key: customerKey,
        totalRevenue: 0,
        transactionCount: 0,
        transactions: [],
        firstTransaction: transactionDate,
        lastTransaction: transactionDate
      };
    }
    
    const customerData = customerStats[customerKey];
    // Update display name in case it changed
    if (customerName !== 'Không xác định') {
      customerData.name = customerName;
    }
    customerData.totalRevenue += revenue;
    customerData.transactionCount += 1;
    customerData.transactions.push({
      date: transactionDate,
      revenue: revenue,
      product: t.softwareName
    });
    
    // Update date range
    if (transactionDate < customerData.firstTransaction) {
      customerData.firstTransaction = transactionDate;
    }
    if (transactionDate > customerData.lastTransaction) {
      customerData.lastTransaction = transactionDate;
    }
  });
  
  // Calculate additional metrics for each customer
  const customers = Object.values(customerStats).map(customer => {
    const avgTransactionValue = customer.totalRevenue / customer.transactionCount;
    const daysSinceFirst = Math.floor((new Date() - customer.firstTransaction) / (1000 * 60 * 60 * 24));
    const daysSinceLast = Math.floor((new Date() - customer.lastTransaction) / (1000 * 60 * 60 * 24));
    const frequency = daysSinceFirst > 0 ? customer.transactionCount / (daysSinceFirst / 30) : 0; // transactions per month
    
    // Calculate trend (simple growth rate based on recent vs old transactions)
    const recentTransactions = customer.transactions.filter(t => {
      const daysSince = Math.floor((new Date() - t.date) / (1000 * 60 * 60 * 24));
      return daysSince <= 30; // Last 30 days
    });
    const recentRevenue = recentTransactions.reduce((sum, t) => sum + t.revenue, 0);
    const oldRevenue = customer.totalRevenue - recentRevenue;
    const growthRate = oldRevenue > 0 ? ((recentRevenue - oldRevenue) / oldRevenue * 100) : 0;
    
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
      isVIP: customer.totalRevenue >= totalRevenue * 0.1 // VIP if >10% of total revenue
    };
  });
  
  return {
    customers,
    totalRevenue,
    totalCustomers: customers.length,
    avgCustomerRevenue: totalRevenue / customers.length,
    activeCustomers: customers.filter(c => c.isActive).length,
    vipCustomers: customers.filter(c => c.isVIP).length
  };
}

/**
 * Update customer summary statistics
 * @param {Object} analytics - Customer analytics data
 */
function updateCustomerSummary(analytics) {
  const totalCustomersEl = document.getElementById('total-customers');
  const avgRevenueEl = document.getElementById('avg-customer-revenue');
  const top5PercentageEl = document.getElementById('top5-percentage');
  
  if (totalCustomersEl) {
    totalCustomersEl.textContent = analytics.totalCustomers;
  }
  
  if (avgRevenueEl) {
    avgRevenueEl.textContent = formatRevenue(analytics.avgCustomerRevenue);
  }
  
  if (top5PercentageEl) {
    const top5Revenue = analytics.customers
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .reduce((sum, c) => sum + c.totalRevenue, 0);
    const top5Percentage = analytics.totalRevenue > 0 ? ((top5Revenue / analytics.totalRevenue) * 100).toFixed(1) : 0;
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
      return customers.sort((a, b) => b.avgTransactionValue - a.avgTransactionValue);
    case 'revenue':
    default:
      return customers.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}

/**
 * Render enhanced customer table
 * @param {Array} customers - Sorted customer data
 * @param {number} totalRevenue - Total revenue for percentage calculation
 */
function renderEnhancedCustomerTable(customers, totalRevenue) {
  const container = document.getElementById('top-customers-body');
  if (!container) return;
  
  const topCustomers = customers.slice(0, 10); // Show top 10
  
  if (topCustomers.length === 0) {
    container.innerHTML = `
      <tr class="empty-row">
        <td colspan="8" class="empty-message">
          <i class="fas fa-users-slash"></i> 
          Chưa có dữ liệu khách hàng
        </td>
      </tr>
    `;
    return;
  }
  
  container.innerHTML = topCustomers.map((customer, index) => {
    // Support both old and new customer data structures
    const revenue = customer.revenue || customer.totalRevenue || 0;
    const avgValue = customer.averageOrderValue || customer.avgTransactionValue || 0;
    const growthRate = customer.growthRate || 0;
    const firstTransaction = customer.firstTransaction ? new Date(customer.firstTransaction) : null;
    const frequency = customer.frequency || 0;
    const recentRevenue = customer.recentRevenue || 0;
    const daysSinceLast = customer.daysSinceLast || 0;
    
    const percentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : 0;
    const trendIcon = growthRate > 0 ? '📈' : growthRate < -10 ? '📉' : '➡️';
    const trendClass = growthRate > 0 ? 'positive' : growthRate < -10 ? 'negative' : 'neutral';
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
  } catch (error) {
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
  
  
  return {
    statusBreakdown: statusBreakdown,
    completed: {
      current: statusBreakdown.completed.revenue,
      previous: 0,
      growth: 0,
      count: statusBreakdown.completed.count
    },
    paid: {
      current: statusBreakdown.paid.revenue,
      previous: 0,
      growth: 0,
      count: statusBreakdown.paid.count
    },
    unpaid: {
      current: statusBreakdown.unpaid.revenue,
      previous: 0,
      growth: 0,
      count: statusBreakdown.unpaid.count
    },
    transactions: {
      current: totalTransactions,
      previous: 0,
      growth: 0
    },
    conversion: {
      paymentRate: 0,
      completionRate: 0,
      successRate: 0
    },
    totalRevenue: totalRevenue
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
  
  filteredTransactions.forEach(t => {
    const revenue = parseFloat(t.doanhThu || t.revenue || t.Revenue || t.doanh_thu) || 0;
    const status = (t.loaiGiaoDich || t.transactionType || t.status || '').toLowerCase();
    
    if (status.includes('hoàn tất') || status.includes('completed')) {
      statusBreakdown.completed.count++;
      statusBreakdown.completed.revenue += revenue;
    } else if (status.includes('đã thanh toán') || status.includes('paid')) {
      statusBreakdown.paid.count++;
      statusBreakdown.paid.revenue += revenue;
    } else if (status.includes('hoàn tiền') || status.includes('refund')) {
      statusBreakdown.refunded.count++;
      statusBreakdown.refunded.revenue += revenue;
    }
  });
  
  const total = statusBreakdown.completed.count + statusBreakdown.paid.count + statusBreakdown.refunded.count;
  
  // Update counts
  updateElementText('completed-count', statusBreakdown.completed.count);
  updateElementText('paid-count', statusBreakdown.paid.count);
  updateElementText('refund-count', statusBreakdown.refunded.count);
  
  // Update percentages and bars
  if (total > 0) {
    const completedPercent = (statusBreakdown.completed.count / total * 100);
    const paidPercent = (statusBreakdown.paid.count / total * 100);
    const refundPercent = (statusBreakdown.refunded.count / total * 100);
    
    updateElementText('completed-percentage', completedPercent.toFixed(1) + '%');
    updateElementText('paid-percentage', paidPercent.toFixed(1) + '%');
    updateElementText('refund-percentage', refundPercent.toFixed(1) + '%');
    
    updateElementStyle('completed-bar', 'width', completedPercent + '%');
    updateElementStyle('paid-bar', 'width', paidPercent + '%');
    updateElementStyle('refund-bar', 'width', refundPercent + '%');
    
    // Update summary in distribution chart
    updateElementText('completed-summary', statusBreakdown.completed.count);
    updateElementText('paid-summary', statusBreakdown.paid.count);
    updateElementText('refund-summary', statusBreakdown.refunded.count);
    
    // Update status highlights
    updateStatusHighlights(statusBreakdown, total);
  }
  
}

/**
 * Update status highlights with key metrics
 * @param {Object} statusBreakdown - Status breakdown data
 * @param {number} total - Total transaction count
 */
function updateStatusHighlights(statusBreakdown, total) {
  // Calculate key metrics
  const refundImpact = statusBreakdown.refunded.amount; // Should be negative
  const successRate = total > 0 ? ((statusBreakdown.completed.count / total) * 100).toFixed(1) : 0;
  const netRevenue = statusBreakdown.completed.amount + statusBreakdown.paid.amount + statusBreakdown.refunded.amount;
  
  // Update refund impact (highlighted as negative)
  const refundElement = document.getElementById('refund-impact');
  if (refundElement) {
    refundElement.textContent = formatRevenue(refundImpact);
    refundElement.className = refundImpact < 0 ? 'highlight-value negative' : 'highlight-value';
  }
  
  // Update success rate
  const successElement = document.getElementById('success-rate-display');
  if (successElement) {
    successElement.textContent = `${successRate}%`;
    successElement.className = parseFloat(successRate) >= 80 ? 'highlight-value positive' : 'highlight-value';
  }
  
  // Update net revenue
  const netElement = document.getElementById('net-revenue');
  if (netElement) {
    netElement.textContent = formatRevenue(netRevenue);
    netElement.className = netRevenue >= 0 ? 'highlight-value positive' : 'highlight-value negative';
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
    
    // Store pending data globally for viewTransactionDetails access
    window.pendingTransactions = {
      needsDelivery: pendingCategories.needsDelivery,
      needsPayment: pendingCategories.needsPayment
    };
    
    // Update summary badges
    updatePendingSummary(pendingCategories);
    
    // Load pending tables
    await Promise.all([
      loadNeedsDeliveryTable(pendingCategories.needsDelivery, dateRange),
      loadNeedsPaymentTable(pendingCategories.needsPayment)
    ]);
    
    // Update alerts
    updatePendingAlerts(pendingCategories);
    
  } catch (error) {
    showError('Không thể tải giao dịch cần xử lý');
  }
}

/**
 * Categorize transactions into pending types
 * @param {Array} transactions - All transactions
 * @returns {Object} Categorized pending transactions
 */
function categorizePendingTransactions(transactions) {
  const needsDelivery = []; // Đã thanh toán nhưng chưa hoàn tất
  const needsPayment = [];  // Chưa thanh toán nhưng đã giao hàng
  
  transactions.forEach(rawTransaction => {
    // Normalize transaction data
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const status = getTransactionTypeDisplay(t.transactionType);
    const paymentStatus = t.transactionType || '';
    const deliveryStatus = t.transactionType || '';
    const orderDate = t.transactionDate ? new Date(t.transactionDate) : new Date();
    const deliveryDate = t.endDate ? new Date(t.endDate) : null;
    
    // Case 1: Đã thanh toán nhưng chưa hoàn tất (cần giao hàng)
    if (status === 'Đã thanh toán') {
      
      // Calculate waiting time
      const waitingDays = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      const isUrgent = waitingDays >= 3; // Urgent if waiting 3+ days
      
      needsDelivery.push({
        ...t,
        waitingDays,
        isUrgent,
        priority: isUrgent ? 'high' : 'normal'
      });
    }
    
    // Case 2: Chưa thanh toán (cần thu tiền)
    else if (status === 'Chưa thanh toán') {
      
      // Calculate overdue days
      const overdueDays = deliveryDate ? Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24)) : 0;
      const isOverdue = overdueDays > 7; // Overdue if 7+ days since delivery
      
      needsPayment.push({
        ...t,
        overdueDays,
        isOverdue,
        deliveryDate,
        priority: isOverdue ? 'high' : 'normal'
      });
    }
  });
  
  // Sort by priority and date
  // Sort by start date (column H) from past to future
  needsDelivery.sort((a, b) => {
    // Get start dates
    const dateA = a.startDate ? new Date(a.startDate) : new Date('9999-12-31'); // Put records without date at the end
    const dateB = b.startDate ? new Date(b.startDate) : new Date('9999-12-31');
    
    // Sort from past to future (ascending)
    return dateA.getTime() - dateB.getTime();
  });
  
  needsPayment.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return b.isOverdue - a.isOverdue;
    return b.overdueDays - a.overdueDays;
  });
  
  return {
    needsDelivery,
    needsPayment,
    urgentDelivery: needsDelivery.filter(t => t.isUrgent),
    overduePayment: needsPayment.filter(t => t.isOverdue)
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
async function loadNeedsDeliveryTable(needsDelivery, dateRange = null) {
  const tbody = document.getElementById('needs-delivery-tbody');
  if (!tbody) return;
  
  if (needsDelivery.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6" class="empty-message">
          <i class="fas fa-check-circle"></i> 
          Không có giao dịch nào cần giao hàng
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = needsDelivery.map(rawTransaction => {
    const transaction = normalizeTransaction(rawTransaction);
    
    // Use transaction start date (column H) instead of cycle start date
    let displayDate = new Date();
    let dateNote = '';
    
    if (transaction.startDate) {
      // Use startDate from transaction (column H in GiaoDich sheet)
      displayDate = new Date(transaction.startDate);
      dateNote = 'Ngày bắt đầu gói';
    } else if (transaction.transactionDate) {
      // Fallback to transaction date
      displayDate = new Date(transaction.transactionDate);
      dateNote = 'Ngày giao dịch';
    } else {
      // Last fallback to current date
      displayDate = new Date();
      dateNote = 'Không xác định';
    }
    
    const customer = transaction.customerName || 'Không xác định';
    const product = transaction.softwareName || 'N/A';
    const amount = transaction.revenue || 0;
    
    // Calculate waiting time from current date to start date (column H)
    let waitingTime = 0;
    let waitingText = '';
    let isUrgent = false;
    let waitingClass = '';
    
    if (transaction.startDate) {
      const startDate = new Date(transaction.startDate);
      const currentDate = new Date();
      
      // Set time to start of day for accurate day calculation
      startDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      // Calculate difference in days
      const timeDiff = startDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        // Future start date
        waitingTime = daysDiff;
        waitingText = `${daysDiff} ngày nữa`;
        isUrgent = daysDiff <= 3; // Urgent if starting within 3 days
        waitingClass = daysDiff <= 3 ? 'urgent-waiting' : daysDiff <= 7 ? 'warning-waiting' : 'normal-waiting';
      } else if (daysDiff === 0) {
        // Today
        waitingTime = 0;
        waitingText = 'Hôm nay';
        isUrgent = true;
        waitingClass = 'urgent-waiting';
      } else {
        // Past start date (overdue)
        waitingTime = Math.abs(daysDiff);
        waitingText = `Quá ${Math.abs(daysDiff)} ngày`;
        isUrgent = true;
        waitingClass = 'overdue-waiting';
      }
    } else {
      // Fallback if no start date
      waitingTime = rawTransaction.waitingDays || 0;
      waitingText = `${waitingTime} ngày`;
      isUrgent = rawTransaction.isUrgent || false;
      waitingClass = isUrgent ? 'urgent-waiting' : 'normal-waiting';
    }
    
    return `
      <tr class="pending-row ${isUrgent ? 'urgent-row' : ''}" data-transaction-id="${transaction.transactionId || transaction.id || ''}">
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
          <button class="action-btn-small delivery" onclick="markAsDelivered('${transaction.transactionId || transaction.id || ''}')" title="Đánh dấu đã giao hàng">
            <i class="fas fa-check"></i>
          </button>
          <button class="action-btn-small details" onclick="viewTransactionDetails('${transaction.transactionId || transaction.id || ''}')" title="Xem chi tiết">
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
async function loadNeedsPaymentTable(needsPayment) {
  const tbody = document.getElementById('needs-payment-tbody');
  if (!tbody) return;
  
  if (needsPayment.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6" class="empty-message">
          <i class="fas fa-check-circle"></i> 
          Không có giao dịch nào cần thu tiền
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = needsPayment.map(rawTransaction => {
    const transaction = normalizeTransaction(rawTransaction);
    const deliveryDate = rawTransaction.deliveryDate ? new Date(rawTransaction.deliveryDate) : 
                        transaction.transactionDate ? new Date(transaction.transactionDate) : new Date();
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
          <button class="action-btn-small payment" onclick="markAsPaid('${transaction.transactionId || transaction.id || ''}')" title="Đánh dấu đã thanh toán">
            <i class="fas fa-dollar-sign"></i>
          </button>
          <button class="action-btn-small reminder" onclick="sendPaymentReminder('${transaction.transactionId || transaction.id || ''}')" title="Gửi nhắc nhở">
            <i class="fas fa-bell"></i>
          </button>
          <button class="action-btn-small details" onclick="viewTransactionDetails('${transaction.transactionId || transaction.id || ''}')" title="Xem chi tiết">
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
function updatePendingAlerts(categories) {
  const overdueAlert = document.getElementById('overdue-alert');
  const urgentAlert = document.getElementById('urgent-alert');
  
  // Update overdue payment alert
  if (overdueAlert) {
    const overdueCount = categories.overduePayment.length;
    if (overdueCount > 0) {
      document.getElementById('overdue-count').textContent = overdueCount;
      overdueAlert.style.display = 'flex';
    } else {
      overdueAlert.style.display = 'none';
    }
  }
  
  // Update urgent delivery alert
  if (urgentAlert) {
    const urgentCount = categories.urgentDelivery.length;
    if (urgentCount > 0) {
      document.getElementById('urgent-delivery-count').textContent = urgentCount;
      urgentAlert.style.display = 'flex';
    } else {
      urgentAlert.style.display = 'none';
    }
  }
}

/**
 * Export status data to CSV
 * COMMENTED OUT: Function removed along with Status Details section
 */
/*
function exportStatusData() {
  
  try {
    const transactions = window.transactionList || [];
    const breakdown = calculateDetailedStatusBreakdown(transactions);
    
    // Prepare CSV data
    const csvData = [
      ['Trạng thái', 'Số lượng', 'Tổng tiền (VNĐ)', 'Tỷ lệ (%)', 'Trung bình (VNĐ)'],
      ['Hoàn tất', breakdown.completed.count, breakdown.completed.amount, 
       ((breakdown.completed.count / (breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count)) * 100).toFixed(1),
       breakdown.completed.count > 0 ? (breakdown.completed.amount / breakdown.completed.count).toFixed(0) : 0],
      ['Thanh toán', breakdown.paid.count, breakdown.paid.amount,
       ((breakdown.paid.count / (breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count)) * 100).toFixed(1),
       breakdown.paid.count > 0 ? (breakdown.paid.amount / breakdown.paid.count).toFixed(0) : 0],
      ['Hoàn tiền', breakdown.refunded.count, breakdown.refunded.amount,
       ((breakdown.refunded.count / (breakdown.completed.count + breakdown.paid.count + breakdown.refunded.count)) * 100).toFixed(1),
       breakdown.refunded.count > 0 ? (breakdown.refunded.amount / breakdown.refunded.count).toFixed(0) : 0],
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
    
  } catch (error) {
    alert('Lỗi xuất dữ liệu. Vui lòng thử lại.');
  }
}
*/

/**
 * Action functions for pending transactions
 */
async function markAsDelivered(transactionId) {
  
  // Show processing modal
  if (typeof window.showProcessingModal === 'function') {
    window.showProcessingModal("Đang cập nhật trạng thái giao hàng...");
  }
  
  try {
    // Find the transaction
    const transaction = window.transactionList?.find(t => t.transactionId === transactionId);
    if (!transaction) {
      throw new Error('Không tìm thấy giao dịch');
    }
    
    // Get user info
    const userInfo = window.getState ? window.getState().user : null;
    if (!userInfo) {
      throw new Error('Vui lòng đăng nhập lại');
    }
    
    // Get constants
    const { BACKEND_URL } = getConstants();
    
    // Prepare update data using same structure as handleUpdate.js
    const updateData = {
      action: "updateTransaction",
      transactionId: transactionId,
      transactionType: "Đã hoàn tất", // Change from "Đã thanh toán" to "Đã hoàn tất"
      transactionDate: transaction.transactionDate,
      customerName: transaction.customerName,
      customerEmail: transaction.customerEmail ? transaction.customerEmail.toLowerCase() : "",
      customerPhone: transaction.customerPhone,
      duration: parseInt(transaction.duration) || 0,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      deviceCount: parseInt(transaction.deviceCount) || 0,
      softwareName: transaction.softwareName,
      softwarePackage: transaction.softwarePackage,
      accountName: transaction.accountName,
      revenue: parseFloat(transaction.revenue) || 0,
      note: transaction.note || "",
      tenNhanVien: transaction.tenNhanVien,
      maNhanVien: transaction.maNhanVien,
      editorTenNhanVien: userInfo.tenNhanVien,
      editorMaNhanVien: userInfo.maNhanVien,
      duocSuaGiaoDichCuaAi: userInfo.duocSuaGiaoDichCuaAi || "chỉ bản thân"
    };
    
    
    // Send update request
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.status === "success") {
      // Update local transaction data
      transaction.transactionType = "Đã hoàn tất";
      
      // Clear cache if available (same as handleUpdate.js)
      if (window.cacheManager?.clearTransactionCaches) {
        window.cacheManager.clearTransactionCaches();
      }
      
      // Reload transactions if available (same as handleUpdate.js)
      if (window.loadTransactions) {
        await window.loadTransactions();
      }
      
      // Reload pending transactions with current date range
      const dateRange = window.globalFilters?.dateRange || null;
      const transactions = window.transactionList || [];
      await loadPendingTransactions(transactions, dateRange);
      
      // Show success message
      if (typeof window.showResultModal === 'function') {
        window.showResultModal("Đã cập nhật trạng thái giao hàng thành công!", true);
      }
      
    } else {
      throw new Error(result.message || 'Cập nhật thất bại');
    }
  } catch (error) {
    if (typeof window.showResultModal === 'function') {
      window.showResultModal(`Lỗi: ${error.message}`, false);
    } else {
      alert(`Lỗi: ${error.message}`);
    }
  } finally {
    // Close processing modal
    if (typeof window.closeProcessingModal === 'function') {
      window.closeProcessingModal();
    }
  }
}

async function markAsPaid(transactionId) {
  console.log('markAsPaid called with ID:', transactionId);
  
  try {
    // Show processing modal
    if (typeof window.showProcessingModal === 'function') {
      window.showProcessingModal("Đang cập nhật trạng thái thanh toán...");
    }

    // Validate session before updating transaction
    if (typeof window.validateBeforeOperation === 'function') {
      const sessionValid = await window.validateBeforeOperation();
      if (!sessionValid) {
        if (typeof window.closeProcessingModal === 'function') {
          window.closeProcessingModal();
        }
        return;
      }
    }

    // Find the transaction to update
    let transaction = null;
    
    // Search in main transaction list
    if (window.transactionList && window.transactionList.length > 0) {
      transaction = window.transactionList.find(t => t.transactionId === transactionId || t.id === transactionId);
    }
    
    // Search in pending transactions if not found in main list
    if (!transaction && window.pendingTransactions) {
      transaction = window.pendingTransactions.needsPayment?.find(t => t.transactionId === transactionId || t.id === transactionId) ||
                   window.pendingTransactions.needsDelivery?.find(t => t.transactionId === transactionId || t.id === transactionId);
    }

    if (!transaction) {
      throw new Error(`Không tìm thấy giao dịch với ID: ${transactionId}`);
    }

    console.log('Found transaction to mark as paid:', transaction.transactionId);

    // Get user info for editor permissions
    const userInfo = window.getState ? window.getState().user : null;
    if (!userInfo) {
      throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
    }

    console.log("✅ User info for markAsPaid:", userInfo.tenNhanVien);

    // Get backend URL
    const { BACKEND_URL } = getConstants();
    
    // Prepare update data - change transactionType to "Đã hoàn tất"
    const updateData = {
      action: "updateTransaction",
      transactionId: transaction.transactionId || transaction.id,
      transactionType: "Đã hoàn tất", // Change from "Chưa thanh toán" to "Đã hoàn tất"
      transactionDate: transaction.transactionDate,
      customerName: transaction.customerName,
      customerEmail: transaction.customerEmail,
      customerPhone: transaction.customerPhone,
      duration: transaction.duration,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      deviceCount: transaction.deviceCount,
      softwareName: transaction.softwareName,
      softwarePackage: transaction.softwarePackage,
      accountName: transaction.accountName,
      revenue: transaction.revenue,
      note: transaction.note || "",
      tenNhanVien: transaction.tenNhanVien,
      maNhanVien: transaction.maNhanVien,
      // Add editor information for permission check
      editorTenNhanVien: userInfo.tenNhanVien,
      editorMaNhanVien: userInfo.maNhanVien,
      duocSuaGiaoDichCuaAi: userInfo.duocSuaGiaoDichCuaAi || "chỉ bản thân"
    };

    // Send update request
    const response = await fetch(BACKEND_URL, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    console.log('Update response:', result);

    if (result.status === "success") {
      // Clear cache
      if (window.cacheManager && window.cacheManager.clearTransactionCaches) {
        window.cacheManager.clearTransactionCaches();
      }
      
      // Reload transactions to get fresh data
      if (window.loadTransactions) {
        await window.loadTransactions();
      }
      
      // Reload pending transactions with current date range
      const dateRange = window.globalFilters?.dateRange || null;
      const transactions = window.transactionList || [];
      await loadPendingTransactions(transactions, dateRange);
      
      // Close processing modal
      if (typeof window.closeProcessingModal === 'function') {
        window.closeProcessingModal();
      }
      
      // Show success message
      if (typeof window.showResultModal === 'function') {
        window.showResultModal("Đã cập nhật trạng thái thanh toán thành công!", true);
      } else {
        alert("Đã đánh dấu giao dịch đã thanh toán thành công!");
      }
      
    } else {
      throw new Error(result.message || 'Cập nhật thất bại');
    }

  } catch (error) {
    console.error('Error in markAsPaid:', error);
    
    // Close processing modal
    if (typeof window.closeProcessingModal === 'function') {
      window.closeProcessingModal();
    }
    
    // Show error message
    if (typeof window.showResultModal === 'function') {
      window.showResultModal(`Lỗi: ${error.message}`, false);
    } else {
      alert(`Lỗi: ${error.message}`);
    }
  }
}

function sendPaymentReminder(transactionId) {
  // Implementation would send reminder
  alert(`Gả lập: Gửi nhắc nhở thanh toán cho giao dịch ${transactionId}`);
}

async function viewTransactionDetails(transactionId) {
  
  try {
    // Debug logging
    console.log('viewTransactionDetails called with ID:', transactionId);
    console.log('Available data sources:', {
      transactionList: !!window.transactionList,
      transactionListLength: window.transactionList?.length || 0,
      pendingTransactions: !!window.pendingTransactions,
      needsPaymentLength: window.pendingTransactions?.needsPayment?.length || 0,
      needsDeliveryLength: window.pendingTransactions?.needsDelivery?.length || 0
    });
    
    // Find the transaction in multiple sources
    let transaction = null;
    
    // First, try to find in main transaction list
    if (window.transactionList && window.transactionList.length > 0) {
      transaction = window.transactionList.find(t => t.transactionId === transactionId || t.id === transactionId);
    }
    
    // If not found, try in pending transactions
    if (!transaction && window.pendingTransactions) {
      if (window.pendingTransactions.needsPayment) {
        transaction = window.pendingTransactions.needsPayment.find(t => t.transactionId === transactionId || t.id === transactionId);
      }
      if (!transaction && window.pendingTransactions.needsDelivery) {
        transaction = window.pendingTransactions.needsDelivery.find(t => t.transactionId === transactionId || t.id === transactionId);
      }
    }
    
    console.log('Found transaction:', !!transaction, transaction?.transactionId || transaction?.id);
    
    if (!transaction) {
      console.error('Transaction not found. Available transactions:', {
        mainList: window.transactionList?.map(t => ({ id: t.id, transactionId: t.transactionId })) || [],
        needsPayment: window.pendingTransactions?.needsPayment?.map(t => ({ id: t.id, transactionId: t.transactionId })) || [],
        needsDelivery: window.pendingTransactions?.needsDelivery?.map(t => ({ id: t.id, transactionId: t.transactionId })) || []
      });
      throw new Error(`Không tìm thấy giao dịch với ID: ${transactionId}`);
    }
    
    // Check if viewTransaction function is available
    if (typeof window.viewTransaction === 'function') {
      // Use the existing viewTransaction function
      await window.viewTransaction(transaction);
    } else {
      // Try to load the viewTransaction module
      try {
        const { viewTransaction } = await import('../../viewTransaction.js');
        await viewTransaction(transaction);
      } catch (importError) {
        
        // Fallback: Use detailModal directly
        try {
          const { detailModal } = await import('../../detailModalUnified.js');
          const { formatDate } = await import('../../formatDate.js');
          
          // Prepare fields for the modal
          const fields = [
            { label: "Mã giao dịch", value: transaction.transactionId, showCopy: true, important: true },
            { label: "Ngày giao dịch", value: formatDate(transaction.transactionDate), type: "date" },
            { label: "Loại giao dịch", value: transaction.transactionType },
            { label: "Tên khách hàng", value: transaction.customerName, important: true },
            { label: "Email", value: transaction.customerEmail, showCopy: true, type: "email" },
            { label: "Số điện thoại", value: transaction.customerPhone, showCopy: true, showExternalLink: true, type: "phone" },
            { label: "Số tháng đăng ký", value: transaction.duration },
            { label: "Ngày bắt đầu", value: formatDate(transaction.startDate), type: "date" },
            { label: "Ngày kết thúc", value: formatDate(transaction.endDate), type: "date" },
            { label: "Số thiết bị", value: transaction.deviceCount },
            { label: "Tên phần mềm", value: transaction.softwareName },
            { label: "Gói phần mềm", value: transaction.softwarePackage },
            { label: "Tên tài khoản", value: transaction.accountName || "" },
            { label: "Doanh thu", value: transaction.revenue, type: "currency", important: true },
            { label: "Ghi chú", value: transaction.note },
            { label: "Tên nhân viên", value: transaction.tenNhanVien },
            { label: "Mã nhân viên", value: transaction.maNhanVien }
          ];
          
          // Show the modal
          detailModal.show("Chi tiết giao dịch", fields);
        } catch (modalError) {
          alert(`Chi tiết giao dịch ${transactionId}:\n\n` +
                `Khách hàng: ${transaction.customerName}\n` +
                `Email: ${transaction.customerEmail}\n` +
                `Điện thoại: ${transaction.customerPhone}\n` +
                `Phần mềm: ${transaction.softwareName} - ${transaction.softwarePackage}\n` +
                `Doanh thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.revenue)}\n` +
                `Trạng thái: ${transaction.transactionType}`);
        }
      }
    }
  } catch (error) {
    alert(`Lỗi: ${error.message}`);
  }
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

function showOverdueDetails() {
  alert('Gả lập: Hiển thị chi tiết các giao dịch quá hạn thanh toán');
}

function showUrgentDeliveries() {
  alert('Gả lập: Hiển thị danh sách giao hàng gấp');
}

/**
 * Calculate pending transactions
 */
function calculatePendingTransactions(transactions) {
    const pending = {
        paidNotDelivered: [],
        deliveredNotPaid: [],
        summary: {
            paidNotDeliveredCount: 0,
            paidNotDeliveredAmount: 0,
            deliveredNotPaidCount: 0,
            deliveredNotPaidAmount: 0
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
    if (deliveredNotPaidCard) {
        deliveredNotPaidCard.querySelector('.metric-value').textContent = pending.summary.deliveredNotPaidCount;
        deliveredNotPaidCard.querySelector('.metric-amount').textContent = formatCurrency(pending.summary.deliveredNotPaidAmount);
    }
    
    // Update tables
    updatePendingTable('paidNotDeliveredTable', pending.paidNotDelivered, 'paid');
    updatePendingTable('deliveredNotPaidTable', pending.deliveredNotPaid, 'delivered');
}

/**
 * Update pending table
 */
function updatePendingTable(tableId, transactions, type) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có giao dịch</td></tr>';
        return;
    }
    
    transactions.slice(0, 10).forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.transactionId || ''}</td>
            <td>${formatDate(t.transactionDate || '')}</td>
            <td>${t.customerName || ''}</td>
            <td>${t.softwareName || ''}</td>
            <td class="text-right">${formatCurrency(t.revenue || 0)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Update table footer with total
    const tfoot = document.querySelector(`#${tableId} tfoot`);
    if (tfoot) {
        const total = transactions.reduce((sum, t) => sum + (t.revenue || 0), 0);
        tfoot.querySelector('.total-amount').textContent = formatCurrency(total);
    }
}

/**
 * Calculate customer analytics (normalized data version)
 */
function calculateNormalizedCustomerAnalytics(transactions) {
    const customerMap = new Map();
    
    transactions.forEach(rawTransaction => {
        const t = normalizeTransaction(rawTransaction);
        if (!t) return;
        
        // Use email as unique identifier if available, otherwise fallback to customerName
        const customerEmail = t.email;
        const customerName = t.customerName || 'Không xác định';
        const customerKey = customerEmail || customerName || 'unknown-customer';
        const revenue = t.revenue || 0;
        const status = t.transactionType;
        const softwareName = t.softwareName || '';
        const transactionDate = t.transactionDate || '';
        
        // Use customerKey (email or name) as unique identifier
        if (!customerMap.has(customerKey)) {
            customerMap.set(customerKey, {
                email: customerEmail || null,
                name: customerName,
                key: customerKey,
                revenue: 0,
                transactionCount: 0,
                products: new Set(),
                lastTransaction: null,
                firstTransaction: null,
                averageOrderValue: 0,
                refundCount: 0,
                refundAmount: 0
            });
        }
        
        const customer = customerMap.get(customerKey);
        // Update display name in case it changed
        if (customerName !== 'Không xác định') {
            customer.name = customerName;
        }
        customer.transactionCount++;
        
        if (status === 'Hoàn tiền') {
            customer.refundCount++;
            customer.refundAmount += Math.abs(revenue);
            customer.revenue -= Math.abs(revenue);
        } else {
            customer.revenue += revenue;
        }
        
        if (softwareName) {
            customer.products.add(softwareName);
        }
        
        // Update first and last transaction dates
        const date = new Date(transactionDate);
        if (!customer.firstTransaction || date < new Date(customer.firstTransaction)) {
            customer.firstTransaction = transactionDate;
        }
        if (!customer.lastTransaction || date > new Date(customer.lastTransaction)) {
            customer.lastTransaction = transactionDate;
        }
    });
    
    // Calculate additional metrics and convert to array
    const customers = Array.from(customerMap.values()).map(customer => {
        customer.averageOrderValue = customer.transactionCount > 0 ? 
            customer.revenue / customer.transactionCount : 0;
        customer.productCount = customer.products.size;
        customer.products = Array.from(customer.products);
        
        // Calculate customer score (for ranking)
        customer.score = calculateCustomerScore(customer);
        
        return customer;
    });
    
    // Sort by revenue (descending)
    customers.sort((a, b) => b.revenue - a.revenue);
    
    return customers;
}

/**
 * Calculate product analytics (normalized data version)
 */
function calculateNormalizedProductAnalytics(transactions) {
    const productMap = new Map();
    
    transactions.forEach(rawTransaction => {
        const t = normalizeTransaction(rawTransaction);
        if (!t) return;
        
        const productName = t.softwareName || 'Không xác định';
        const revenue = t.revenue || 0;
        const status = t.transactionType;
        const customerName = t.customerName || '';
        const packageName = t.packageName || '';
        const months = t.months || 0;
        
        if (!productMap.has(productName)) {
            productMap.set(productName, {
                name: productName,
                revenue: 0,
                transactionCount: 0,
                customers: new Set(),
                packages: new Map(),
                averageMonths: 0,
                totalMonths: 0,
                refundCount: 0,
                refundAmount: 0
            });
        }
        
        const product = productMap.get(productName);
        product.transactionCount++;
        
        if (status === 'Hoàn tiền') {
            product.refundCount++;
            product.refundAmount += Math.abs(revenue);
            product.revenue -= Math.abs(revenue);
        } else {
            product.revenue += revenue;
        }
        
        if (customerName) {
            product.customers.add(customerName);
        }
        
        if (packageName) {
            const packageCount = product.packages.get(packageName) || 0;
            product.packages.set(packageName, packageCount + 1);
        }
        
        if (months > 0) {
            product.totalMonths += months;
        }
    });
    
    // Calculate additional metrics and convert to array
    const products = Array.from(productMap.values()).map(product => {
        product.customerCount = product.customers.size;
        product.customers = Array.from(product.customers);
        product.averageMonths = product.transactionCount > 0 ? 
            product.totalMonths / product.transactionCount : 0;
        product.averageRevenue = product.transactionCount > 0 ? 
            product.revenue / product.transactionCount : 0;
        
        // Convert packages map to array for display
        product.topPackages = Array.from(product.packages.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        
        // Calculate product score
        product.score = calculateProductScore(product);
        
        return product;
    });
    
    // Sort by revenue (descending)
    products.sort((a, b) => b.revenue - a.revenue);
    
    return products;
}

/**
 * Calculate customer score
 */
function calculateCustomerScore(customer) {
  // Simple scoring algorithm based on multiple factors
  const revenueScore = customer.revenue / 1000000; // 1 point per million
  const frequencyScore = customer.transactionCount * 10; // 10 points per transaction
  const diversityScore = customer.productCount * 20; // 20 points per unique product
  const loyaltyScore = customer.firstTransaction ? 
    (new Date() - new Date(customer.firstTransaction)) / (1000 * 60 * 60 * 24 * 30) * 5 : 0; // 5 points per month
  
  return revenueScore + frequencyScore + diversityScore + loyaltyScore;
}

/**
 * Calculate product score
 */
function calculateProductScore(product) {
  // Simple scoring algorithm based on multiple factors
  const revenueScore = product.revenue / 1000000; // 1 point per million
  const popularityScore = product.transactionCount * 10; // 10 points per transaction
  const reachScore = product.customerCount * 15; // 15 points per unique customer
  const retentionScore = product.averageMonths * 20; // 20 points per average month
  
  return revenueScore + popularityScore + reachScore + retentionScore;
}

/**
 * Export functions for pending transactions
 */
function exportNeedsDelivery() {
  
  try {
    const transactions = window.transactionList || [];
    const categories = categorizePendingTransactions(transactions);
    const needsDelivery = categories.needsDelivery;
    
    if (needsDelivery.length === 0) {
      alert('Không có giao dịch nào cần giao hàng');
      return;
    }
    
    // Prepare CSV data
    const csvData = [
      ['Ngày đặt hàng', 'Khách hàng', 'Sản phẩm', 'Số tiền (VNĐ)', 'Ngày chờ', 'Trạng thái', 'Ghi chú'],
      ...needsDelivery.map(rawT => {
        const t = normalizeTransaction(rawT);
        return [
        new Date(t.transactionDate || rawT.ngayGiaoDich || rawT.date).toLocaleDateString('vi-VN'),
        t.customerName || 'N/A',
        t.softwareName || 'N/A',
        t.revenue || 0,
        rawT.waitingDays,
        rawT.isUrgent ? 'Gấp' : 'Bình thường',
        rawT.isUrgent ? 'Cần giao gấp - quá 3 ngày' : 'Trong thời hạn'
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
    
  } catch (error) {
    alert('Lỗi xuất dữ liệu. Vui lòng thử lại.');
  }
}

function exportNeedsPayment() {
  
  try {
    const transactions = window.transactionList || [];
    const categories = categorizePendingTransactions(transactions);
    const needsPayment = categories.needsPayment;
    
    if (needsPayment.length === 0) {
      alert('Không có giao dịch nào cần thu tiền');
      return;
    }
    
    // Prepare CSV data
    const csvData = [
      ['Ngày giao hàng', 'Khách hàng', 'Sản phẩm', 'Số tiền (VNĐ)', 'Ngày quá hạn', 'Trạng thái', 'Ghi chú'],
      ...needsPayment.map(rawT => {
        const t = normalizeTransaction(rawT);
        return [
        rawT.deliveryDate ? new Date(rawT.deliveryDate).toLocaleDateString('vi-VN') : 'N/A',
        t.customerName || 'N/A',
        t.softwareName || 'N/A',
        t.revenue || 0,
        rawT.overdueDays,
        rawT.isOverdue ? 'Quá hạn' : 'Trong hạn',
        rawT.isOverdue ? 'Cần liên hệ gấp' : 'Theo dõi bình thường'
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
    
  } catch (error) {
    alert('Lỗi xuất dữ liệu. Vui lòng thử lại.');
  }
}

// Make functions available globally
window.loadOverviewReport = loadOverviewReport;
window.calculatePendingTransactions = calculatePendingTransactions;
window.updatePendingTransactionsSection = updatePendingTransactionsSection;
window.updatePendingTable = updatePendingTable;
window.calculateCustomerAnalytics = calculateCustomerAnalytics;
window.calculateProductAnalytics = calculateProductAnalytics;
window.calculateNormalizedCustomerAnalytics = calculateNormalizedCustomerAnalytics;
window.calculateNormalizedProductAnalytics = calculateNormalizedProductAnalytics;
window.updateStatusBreakdownWithRefund = updateStatusBreakdownWithRefund;
window.calculateRevenueByStatus = calculateRevenueByStatus;
// window.exportStatusData = exportStatusData; // COMMENTED OUT: Function removed along with Status Details section
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
  
  alert(info);
}

/**
 * Export enhanced customer data to CSV
 */
function exportCustomerData() {
  
  try {
    const transactions = window.transactionList || [];
    const analytics = calculateCustomerAnalytics(transactions);
    
    if (analytics.customers.length === 0) {
      alert('Không có dữ liệu khách hàng để xuất');
      return;
    }
    
    // Prepare CSV data with comprehensive customer metrics
    const csvData = [
      [
        'Hạng', 'Tên khách hàng', 'Tổng giao dịch', 'Tổng doanh thu (VNĐ)', 
        'Giá trị TB (VNĐ)', '% Tổng doanh thu', 'Tần suất/tháng', 
        'Tăng trưởng (%)', 'Ngày từ khi là KH', 'Ngày giao dịch cuối', 
        'Trạng thái', 'Loại khách hàng', 'Điểm đánh giá'
      ],
      ...analytics.customers
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .map((customer, index) => [
          index + 1,
          customer.name,
          customer.transactionCount,
          customer.totalRevenue,
          customer.avgTransactionValue.toFixed(0),
          ((customer.totalRevenue / analytics.totalRevenue) * 100).toFixed(1),
          customer.frequency.toFixed(1),
          customer.growthRate.toFixed(1),
          customer.daysSinceFirst,
          customer.daysSinceLast,
          customer.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
          customer.isVIP ? 'VIP' : 'Thường',
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
    
  } catch (error) {
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
    
  } catch (error) {
    alert('Lỗi xuất dữ liệu sản phẩm. Vui lòng thử lại.');
  }
}

/**
 * Calculate updated business metrics according to new requirements
 * @param {Array} transactions - Raw transaction data
 * @param {Array} expenses - Raw expense data  
 * @param {Object} dateRange - Date range filter
 * @returns {Object} Updated business metrics
 */
function calculateUpdatedBusinessMetrics(filteredTransactions, filteredExpenses, dateRange, allTransactions) {
  // Use pre-filtered transactions for current period metrics
  
  // Initialize metrics
  const metrics = {
    grossRevenue: 0,           // Doanh thu gộp = "đã hoàn tất" - "hoàn tiền"
    pendingCollection: 0,      // Tiền đang chờ thu = "chưa thanh toán"
    pendingPayment: 0,         // Tiền đang chờ chi = "đã thanh toán" 
    totalRefunds: 0,           // Tổng tiền hoàn trả = "hoàn tiền"
    refundRate: 0,             // Tỷ lệ hoàn tiền = số GD "hoàn tiền" / (tổng GD có hiệu lực)
    
    // Breakdown by status for detailed analysis
    statusBreakdown: {
      completed: { count: 0, amount: 0 },      // đã hoàn tất
      paid: { count: 0, amount: 0 },           // đã thanh toán
      unpaid: { count: 0, amount: 0 },         // chưa thanh toán
      refunded: { count: 0, amount: 0 },       // hoàn tiền
      cancelled: { count: 0, amount: 0 }       // đã hủy
    },
    
    // Transaction counts
    totalTransactions: 0,
    effectiveTransactions: 0,   // Không bao gồm "đã hủy"
    
    // Previous period comparison (for growth calculations)
    previousPeriod: {
      grossRevenue: 0,
      totalRefunds: 0,
      effectiveTransactions: 0
    }
  };
  
  
  // Process each transaction
  filteredTransactions.forEach((rawTransaction, index) => {
    const transaction = normalizeTransaction(rawTransaction);
    if (!transaction) {
      return;
    }
    
    // Get transaction amount and status from column C (loaiGiaoDich)
    const amount = parseFloat(transaction.amount || transaction.doanhThu || transaction.revenue || 0);
    const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
    
    // Debug first few transactions
    if (index < 5) {
      // (Debug info removed)
    }
    
    metrics.totalTransactions++;
    
    // Categorize by transaction status (column C in GiaoDich sheet)
    switch (status) {
      case 'đã hoàn tất':
        metrics.statusBreakdown.completed.count++;
        metrics.statusBreakdown.completed.amount += amount;
        metrics.effectiveTransactions++;
        break;
        
      case 'đã thanh toán':
        metrics.statusBreakdown.paid.count++;
        metrics.statusBreakdown.paid.amount += amount;
        metrics.pendingPayment += amount;  // Tiền đang chờ chi
        metrics.effectiveTransactions++;
        break;
        
      case 'chưa thanh toán':
        metrics.statusBreakdown.unpaid.count++;
        metrics.statusBreakdown.unpaid.amount += amount;
        metrics.pendingCollection += amount;  // Tiền đang chờ thu
        metrics.effectiveTransactions++;
        break;
        
      case 'hoàn tiền':
        metrics.statusBreakdown.refunded.count++;
        metrics.statusBreakdown.refunded.amount += Math.abs(amount);  // Lưu số dương
        metrics.totalRefunds += Math.abs(amount);  // Tổng tiền hoàn trả (số dương)
        break;
        
      case 'đã hủy':
        metrics.statusBreakdown.cancelled.count++;
        metrics.statusBreakdown.cancelled.amount += amount;
        // Không tính vào effectiveTransactions
        break;
        
      default:
        // Treat unknown status as effective transaction
        metrics.effectiveTransactions++;
        break;
    }
  });
  
  // Calculate derived metrics
  
  // Doanh thu gộp = Tổng tiền "đã hoàn tất" + Tổng tiền "đã thanh toán" - Tổng tiền "hoàn tiền"
  metrics.grossRevenue = metrics.statusBreakdown.completed.amount + metrics.statusBreakdown.paid.amount - metrics.totalRefunds;
  
  // Tỷ lệ hoàn tiền = Số giao dịch "hoàn tiền" / Tổng giao dịch có hiệu lực
  // Giao dịch có hiệu lực = "đã hoàn tất" + "đã thanh toán" + "chưa thanh toán"
  const validTransactionsForRefundRate = metrics.statusBreakdown.completed.count + 
                                        metrics.statusBreakdown.paid.count + 
                                        metrics.statusBreakdown.unpaid.count;
  
  metrics.refundRate = validTransactionsForRefundRate > 0 
    ? (metrics.statusBreakdown.refunded.count / validTransactionsForRefundRate * 100)
    : 0;
  
  // Calculate previous period for growth comparison
  // For gross revenue, compare with same period of previous cycle (cùng kỳ chu kỳ trước)
  if (dateRange && dateRange.start && dateRange.end && allTransactions) {
    const samePeriodPreviousCycleRange = calculateSamePeriodPreviousCycle(dateRange);
    // Use allTransactions to get data from previous period
    const samePeriodTransactions = filterDataByDateRange(allTransactions || [], samePeriodPreviousCycleRange);
    
    
    samePeriodTransactions.forEach(rawTransaction => {
      const transaction = normalizeTransaction(rawTransaction);
      if (!transaction) return;
      
      const amount = parseFloat(transaction.amount || transaction.doanhThu || transaction.revenue || 0);
      const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
      
      switch (status) {
        case 'đã hoàn tất':
          metrics.previousPeriod.grossRevenue += amount;
          metrics.previousPeriod.effectiveTransactions++;
          break;
        case 'đã thanh toán':
          metrics.previousPeriod.grossRevenue += amount;
          metrics.previousPeriod.effectiveTransactions++;
          break;
        case 'hoàn tiền':
          metrics.previousPeriod.totalRefunds += Math.abs(amount);
          break;
        case 'chưa thanh toán':
          metrics.previousPeriod.effectiveTransactions++;
          break;
      }
    });
    
    metrics.previousPeriod.grossRevenue -= metrics.previousPeriod.totalRefunds;
  }
  
  // Calculate growth rates
  metrics.growthRates = {
    grossRevenue: calculateGrowthRate(metrics.grossRevenue, metrics.previousPeriod.grossRevenue),
    pendingCollection: 0, // Growth for pending amounts might not be meaningful
    pendingPayment: 0,
    totalRefunds: calculateGrowthRate(metrics.totalRefunds, metrics.previousPeriod.totalRefunds),
    effectiveTransactions: calculateGrowthRate(metrics.effectiveTransactions, metrics.previousPeriod.effectiveTransactions)
  };
  
  
  
  return metrics;
}

/**
 * Calculate same period of previous cycle for comparison
 * Example: If current period is 2025/06/01 to 2025/06/13, 
 * previous cycle same period would be 2025/05/01 to 2025/05/13
 */
function calculateSamePeriodPreviousCycle(currentRange) {
  const startDate = new Date(currentRange.start);
  const endDate = new Date(currentRange.end);
  
  
  // Calculate previous cycle by going back 1 month
  const prevStartDate = new Date(startDate);
  const prevEndDate = new Date(endDate);
  
  // Go back 1 month for both start and end dates
  prevStartDate.setMonth(prevStartDate.getMonth() - 1);
  prevEndDate.setMonth(prevEndDate.getMonth() - 1);
  
  // Handle edge cases for month boundaries
  // If original date was 31st but previous month only has 30 days, adjust
  if (prevStartDate.getDate() !== startDate.getDate()) {
    prevStartDate.setDate(0); // Set to last day of previous month
  }
  if (prevEndDate.getDate() !== endDate.getDate()) {
    prevEndDate.setDate(0); // Set to last day of previous month
  }
  
  const result = {
    start: prevStartDate.toISOString().split('T')[0],
    end: prevEndDate.toISOString().split('T')[0]
  };
  
  
  return result;
}

/**
 * Calculate previous period date range for comparison (legacy function kept for compatibility)
 */
function calculatePreviousPeriodRange(currentRange) {
  const startDate = new Date(currentRange.start);
  const endDate = new Date(currentRange.end);
  
  // Calculate period length in days
  const periodLength = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Calculate previous period
  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - periodLength + 1);
  
  return {
    start: prevStartDate.toISOString().split('T')[0],
    end: prevEndDate.toISOString().split('T')[0]
  };
}

/**
 * Calculate growth rate between current and previous values
 */
function calculateGrowthRate(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Export functions to window for use in HTML
window.markAsDelivered = markAsDelivered;
window.viewTransactionDetails = viewTransactionDetails;