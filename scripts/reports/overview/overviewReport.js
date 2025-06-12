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
export async function loadOverviewReport(options = {}) {
  console.log('📈 Loading overview report with options:', options);
  
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
    
    console.log('🔍 Checking data availability:', {
      transactionList: window.transactionList ? window.transactionList.length : 0,
      expenseList: window.expenseList ? window.expenseList.length : 0
    });
    
    // Get data from global variables (primary) or storage (fallback)
    const transactions = window.transactionList || getFromStorage('transactions') || [];
    const expenses = window.expenseList || getFromStorage('expenses') || [];
    
    console.log('📊 Data found:', {
      transactions: transactions.length,
      expenses: expenses.length,
      sampleTransaction: transactions[0] ? Object.keys(transactions[0]) : [],
      sampleExpense: expenses[0] ? Object.keys(expenses[0]) : []
    });
    
    // Get date range from options or global filters
    const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
    const period = options.period || window.globalFilters?.period || 'this_month';
    
    console.log('📅 Using date range:', dateRange);
    console.log('📅 Period:', period);
    
    // Update period display
    updatePeriodDisplay(period);
    
    // Calculate KPIs with date range or period - USING NEW FUNCTION
    // Use consolidated business metrics calculation from statisticsCore.js
    const kpis = calculateBusinessMetrics(transactions, expenses, dateRange);
    console.log('💰 Calculated KPIs:');
    console.log('  - Revenue:', kpis.revenue);
    console.log('  - Expense:', kpis.expense);
    console.log('  - Profit:', kpis.profit);
    console.log('  - Transactions:', kpis.transactions);
    
    // Filter data for charts and tables
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    const filteredExpenses = filterDataByDateRange(expenses, dateRange);
    
    // Update all components
    console.log('🚀 Loading overview components...');
    
    // Wait a moment for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await Promise.all([
      updateKPICards(kpis),
      loadTopProducts(filteredTransactions),
      loadTopCustomers(filteredTransactions),
      loadCharts(filteredTransactions, filteredExpenses),
      updateDataTables(filteredTransactions, filteredExpenses),
      loadPendingTransactions(filteredTransactions)
    ]);
    
    // PERFORMANCE: Initialize lazy loading for non-critical elements
    initOverviewLazyLoading();
    
    console.log('🔄 FORCE CACHE REFRESH - v2.0.1');
    console.log('✅ Overview report loaded successfully with optimizations');
    
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
      throw new Error('Template not found');
    }
    
    const html = await response.text();
    console.log('✅ Template HTML loaded, length:', html.length);
    
    // Find the overview report container and add content to it
    const overviewPage = document.getElementById('report-overview');
    if (overviewPage) {
      console.log('📝 Applying template to existing container');
      overviewPage.innerHTML = html;
      overviewPage.classList.add('active');
      console.log('✅ Template applied to existing container');
      
      // Verify template was applied
      setTimeout(() => {
        const hasCompleted = !!document.getElementById('completed-revenue');
        const hasChart = !!document.getElementById('revenue-status-chart');
        console.log('🗖️ Template verification after apply:', { hasCompleted, hasChart });
      }, 10);
    } else {
      // Fallback: create the structure
      container.innerHTML = `<div id="report-overview" class="report-page active">${html}</div>`;
      console.log('✅ Template applied to new container');
    }
    
    console.log('📄 NEW Overview HTML template loaded successfully');
    
    // Verify new elements exist
    setTimeout(() => {
      const completedElement = document.getElementById('completed-revenue');
      const paidElement = document.getElementById('paid-revenue');
      const unpaidElement = document.getElementById('unpaid-revenue');
      const revenueStatusChart = document.getElementById('revenue-status-chart');
      const statusDistChart = document.getElementById('status-distribution-chart');
      console.log('🔍 Template verification:', {
        'completed-revenue': !!completedElement,
        'paid-revenue': !!paidElement,
        'unpaid-revenue': !!unpaidElement,
        'revenue-status-chart': !!revenueStatusChart,
        'status-distribution-chart': !!statusDistChart
      });
      
      // Debug: check what's actually in the container
      const container = document.getElementById('report-overview');
      console.log('📝 Container content preview:', container?.innerHTML?.substring(0, 200) + '...');
    }, 50);
    
  } catch (error) {
    console.error('❌ CRITICAL: Could not load new template:', error);
    console.warn('🚫 NOT using fallback - forcing error to fix issue');
    throw error;  // Force error instead of using fallback
  }
}

/**
 * Enhance existing structure with KPI cards
 */
function enhanceExistingStructure(container) {
  // Check if container already has the KPI structure
  if (container.querySelector('.kpi-grid')) {
    console.log('📄 KPI structure already exists');
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
  
  console.log('📄 Overview structure enhanced with KPI cards');
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
  
  console.log('📅 🆕 NEW FIXED Date filtering setup:');
  console.log(`  - Period parameter: "${period}"`);
  console.log(`  - Period === 'all_time':`, period === 'all_time');
  console.log(`  - Using date range:`, dateRange);
  console.log(`  - Total transactions to filter: ${transactions.length}`);
  console.log(`  - Total expenses to filter: ${expenses.length}`);
  
  // NEW SIMPLIFIED LOGIC - Filter data based on period first
  let filteredTransactions, filteredExpenses;
  
  // Check period FIRST
  console.log('📅 📝 Checking period value...');
  if (period && period.toString() === 'all_time') {
    // No filtering for all time
    console.log('📅 🔥 💯 🆕 ALL TIME BRANCH ACTIVATED - NO FILTERING!');
    filteredTransactions = transactions;
    filteredExpenses = expenses;
    console.log('📅 💯 Result: transactions =', filteredTransactions.length, ', expenses =', filteredExpenses.length);
  } else if (dateRange && dateRange.start && dateRange.end) {
    // Use provided date range
    console.log('📊 Using date range filtering');
    filteredTransactions = filterDataByDateRange(transactions, dateRange);
    filteredExpenses = filterDataByDateRange(expenses, dateRange);
    
    console.log('📊 Filtered by date range:');
    console.log(`  - Transactions: ${transactions.length} → ${filteredTransactions.length}`);
    console.log(`  - Expenses: ${expenses.length} → ${filteredExpenses.length}`);
  } else {
    // Default to current month if no date range
    console.log('📅 Using current month fallback for period:', period);
    console.log('📅 ❌ CURRENT MONTH FALLBACK ACTIVATED');
    
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
  
  console.log('📊 Revenue calculation by status:');
  console.log('  - Completed:', statusBreakdown.completed);
  console.log('  - Paid:', statusBreakdown.paid);
  console.log('  - Unpaid:', statusBreakdown.unpaid);
  console.log('  - Total revenue:', totalRevenue);
  console.log('  - Total transactions:', totalTransactions);
  
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
  
  console.log('📊 Revenue calculation by status:');
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
  console.log('✨ UPDATED updateKPICards - Using consolidated business metrics');
  console.log('📊 KPIs data structure:', kpis);
  
  // Check if we're using the new template with status-based elements
  const newTemplate = document.getElementById('completed-revenue') !== null;
  
  if (newTemplate) {
    // New template - Use business metrics structure
    console.log('🆕 Using new template with business metrics structure');
    
    // Map business metrics to KPI cards
    updateKPICard('completed', {
      value: kpis.financial.totalRevenue || 0,
      growth: 0, // Growth calculation can be added later
      elementId: 'completed-revenue',
      changeId: 'completed-change'
    });
    
    updateKPICard('paid', {
      value: kpis.financial.totalRevenue || 0, // All revenue assumed paid for now
      growth: 0,
      elementId: 'paid-revenue', 
      changeId: 'paid-change'
    });
    
    updateKPICard('refund', {
      value: 0, // Refund can be calculated separately if needed
      growth: 0,
      elementId: 'refund-revenue',
      changeId: 'refund-change'
    });
    
    updateKPICard('transaction', {
      value: kpis.revenue.totalTransactions || 0,
      growth: 0,
      elementId: 'total-transactions',
      changeId: 'transaction-change'
    });
    
    // Update status breakdown using simplified data
    updateStatusBreakdownWithRefund(kpis);
    
  } else {
    // Old template fallback - Use business metrics structure
    console.log('⚠️ Using old template with business metrics');
    updateKPICard('revenue', {
      value: kpis.financial.totalRevenue || 0,
      growth: 0,
      elementId: 'total-revenue',
      changeId: 'revenue-change'
    });
    
    updateKPICard('expense', {
      value: kpis.expense?.current || 0,
      growth: kpis.expense?.growth || 0,
      elementId: 'total-expenses',
      changeId: 'expense-change'
    });
    
    updateKPICard('profit', {
      value: kpis.profit?.current || 0,
      growth: kpis.profit?.growth || 0,
      elementId: 'total-profit',
      changeId: 'profit-change'
    });
    
    updateKPICard('transaction', {
      value: kpis.transactions.current,
      growth: kpis.transactions.growth,
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
  
  console.log(`🔍 Looking for element: ${data.elementId}`);
  console.log(`🔍 Element found:`, !!valueElement);
  
  if (!valueElement) {
    console.warn(`❌ KPI element not found: ${data.elementId}`);
    console.warn(`🔍 Available elements with 'revenue' in ID:`, 
      Array.from(document.querySelectorAll('[id*="revenue"]')).map(el => el.id));
    return;
  }
  
  console.log(`💰 Updating KPI ${type}:`);
  console.log(`  - Element ID: ${data.elementId}`);
  console.log(`  - Raw value: ${data.value}`);
  console.log(`  - Growth: ${data.growth}%`);
  
  if (valueElement) {
    if (type === 'transaction') {
      valueElement.textContent = data.value.toLocaleString();
    } else {
      valueElement.textContent = formatRevenue(data.value);
    }
  }
  
  if (changeElement) {
    const isPositive = data.growth >= 0;
    const arrow = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const sign = data.growth >= 0 ? '+' : '';
    
    changeElement.innerHTML = `
      <i class="fas ${arrow}"></i> ${sign}${data.growth.toFixed(1)}%
    `;
    changeElement.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
  }
}

/**
 * Update status breakdown display
 */
function updateStatusBreakdown(kpis) {
  const total = kpis.transactions.current;
  
  // Update counts
  document.getElementById('completed-count').textContent = kpis.completed.count;
  document.getElementById('paid-count').textContent = kpis.paid.count;
  document.getElementById('unpaid-count').textContent = kpis.unpaid.count;
  
  // Update percentages and bars
  const completedPercent = total > 0 ? (kpis.completed.count / total * 100) : 0;
  const paidPercent = total > 0 ? (kpis.paid.count / total * 100) : 0;
  const unpaidPercent = total > 0 ? (kpis.unpaid.count / total * 100) : 0;
  
  document.getElementById('completed-percentage').textContent = completedPercent.toFixed(1) + '%';
  document.getElementById('paid-percentage').textContent = paidPercent.toFixed(1) + '%';
  document.getElementById('unpaid-percentage').textContent = unpaidPercent.toFixed(1) + '%';
  
  document.getElementById('completed-bar').style.width = completedPercent + '%';
  document.getElementById('paid-bar').style.width = paidPercent + '%';
  document.getElementById('unpaid-bar').style.width = unpaidPercent + '%';
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
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js not available, loading from CDN');
      await loadChartJS();
    }
    
    // Check which charts are available in the template
    const hasNewCharts = document.getElementById('revenue-status-chart') !== null;
    const hasOldCharts = document.getElementById('revenueTrendChart') !== null;
    
    console.log('📊 Chart template check:', {
      hasNewCharts,
      hasOldCharts,
      'revenue-status-chart': !!document.getElementById('revenue-status-chart'),
      'status-distribution-chart': !!document.getElementById('status-distribution-chart'),
      'revenueTrendChart': !!document.getElementById('revenueTrendChart'),
      'expenseDistributionChart': !!document.getElementById('expenseDistributionChart')
    });
    
    if (hasNewCharts) {
      // Render new charts
      renderRevenueStatusChart(transactions);
      renderStatusDistributionChart(transactions);
    } else if (hasOldCharts) {
      // Render old charts
      console.log('⚠️ Using old chart template');
      renderRevenueTrendChart(transactions);
      renderExpenseDistributionChart(expenses);
    } else {
      console.warn('⚠️ No chart containers found');
    }
    
  } catch (error) {
    console.error('❌ Error loading charts:', error);
    showChartError();
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
  
  console.log('📈 Rendering revenue trend chart for period:', currentPeriod);
  
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
  
  // Create stacked bar chart showing revenue by status over time
  new Chart(ctx, {
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
          backgroundColor: '#e74c3c',
          borderColor: '#c0392b',
          borderWidth: 1,
          order: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
          stacked: true,
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
          stacked: true,
          beginAtZero: true,
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
            }
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 3
        }
      }
    }
  });
  
  // Add chart period controls event listeners
  addChartPeriodControls();
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
        backgroundColor: [
          '#27ae60', // Completed - Green
          '#3498db', // Paid - Blue  
          '#e74c3c'  // Refunded - Red (highlighted)
        ],
        borderColor: [
          '#229954', // Darker green
          '#2980b9', // Darker blue
          '#c0392b'  // Darker red
        ],
        borderWidth: function(context) {
          // Make refund border thicker to highlight
          return context.dataIndex === 2 ? 4 : 2;
        },
        hoverBackgroundColor: [
          '#2ecc71',
          '#5dade2', 
          '#ec7063'
        ],
        hoverBorderWidth: function(context) {
          return context.dataIndex === 2 ? 6 : 3;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%', // Slightly smaller cutout for better visibility
      plugins: {
        legend: {
          display: false // Hide default legend, we'll use custom table
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#fff',
          borderWidth: 1,
          padding: 12,
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
              
              return [
                `Số lượng: ${statusData.count} giao dịch`,
                `Tỷ lệ: ${percentage}%`,
                `Tổng tiền: ${formatRevenue(statusData.amount)}`,
                `Trung bình: ${formatRevenue(statusData.count > 0 ? statusData.amount / statusData.count : 0)}`
              ];
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
      elements: {
        arc: {
          borderWidth: function(context) {
            // Highlight refund slice
            return context.dataIndex === 2 ? 4 : 2;
          }
        }
      }
    }
  });
  
  // Update the detailed status table
  updateStatusDetailTable(statusBreakdown);
  
  console.log('🍰 Status distribution chart with details rendered:', statusBreakdown);
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
  
  console.log('📊 Status detail table updated with breakdown:', statusBreakdown);
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

/**
 * Add chart period controls event listeners
 */
function addChartPeriodControls() {
  const chartButtons = document.querySelectorAll('.chart-btn[data-period]');
  
  chartButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      chartButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get period and update chart
      const period = this.getAttribute('data-period');
      updateChartPeriod(period);
    });
  });
}

/**
 * Update chart based on selected period
 * @param {string} period - Selected period (7days, 30days, 90days)
 */
function updateChartPeriod(period) {
  console.log('📊 Updating chart for period:', period);
  
  // Get current transactions
  const transactions = window.transactionList || [];
  
  // Filter transactions based on period
  let filteredTransactions;
  const now = new Date();
  
  switch (period) {
    case '7days':
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.ngayGiaoDich || t.date);
        return transactionDate >= sevenDaysAgo;
      });
      break;
      
    case '30days':
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.ngayGiaoDich || t.date);
        return transactionDate >= thirtyDaysAgo;
      });
      break;
      
    case '90days':
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.ngayGiaoDich || t.date);
        return transactionDate >= ninetyDaysAgo;
      });
      break;
      
    default:
      filteredTransactions = transactions;
  }
  
  // Re-render chart with filtered data
  renderRevenueStatusChart(filteredTransactions);
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
    console.log('📊 Using new table template');
  } else if (hasOldTables) {
    // Old template
    console.log('📊 Using old table template');
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
  transactions.forEach(transaction => {
    const product = transaction.software || transaction.tenSanPham || transaction.product || 'Không xác định';
    const revenue = parseFloat(transaction.revenue || transaction.doanhThu || transaction.amount) || 0;
    const quantity = parseFloat(transaction.quantity || transaction.soLuong) || 1; // Default 1 if not specified
    const transactionDate = new Date(transaction.ngayGiaoDich || transaction.date);
    
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
    
    // Use email as unique identifier, display name as label
    const customerEmail = t.email || 'no-email@unknown.com';
    const customerName = t.customerName || 'Không xác định';
    const revenue = t.revenue || 0;
    const transactionDate = new Date(t.transactionDate);
    
    totalRevenue += revenue;
    
    if (!customerStats[customerEmail]) {
      customerStats[customerEmail] = {
        email: customerEmail,
        name: customerName,
        totalRevenue: 0,
        transactionCount: 0,
        transactions: [],
        firstTransaction: transactionDate,
        lastTransaction: transactionDate
      };
    }
    
    const customerData = customerStats[customerEmail];
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
          <button class="action-btn-small details" onclick="viewCustomerDetails('${customer.email || customer.name}')" title="Xem chi tiết khách hàng">
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
  
  console.log('🆕 🔥 NEW FUNCTION - Date filtering setup:');
  console.log(`  - Period parameter: "${period}"`);
  console.log(`  - Period === 'all_time':`, period === 'all_time');
  console.log(`  - Total transactions to filter: ${transactions.length}`);
  console.log(`  - Total expenses to filter: ${expenses.length}`);
  
  // Filter data based on period - SIMPLIFIED LOGIC
  let filteredTransactions, filteredExpenses;
  
  if (period === 'all_time') {
    console.log('🆕 💯 ALL TIME ACTIVATED - NO FILTERING!');
    filteredTransactions = transactions;
    filteredExpenses = expenses;
    console.log('🆕 💯 RESULT: transactions =', filteredTransactions.length);
  } else {
    console.log('🆕 Using current month filter for period:', period);
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
  
  console.log('🆕 📊 NEW FUNCTION Revenue calculation:');
  console.log('  - Filtered transactions:', totalTransactions);
  console.log('  - Total revenue calculated:', totalRevenue);
  
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
  console.log('📊 Updating status breakdown with refund support');
  
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
  
  console.log('📊 Status breakdown updated:', statusBreakdown);
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
  
  console.log('📈 Status highlights updated:', { refundImpact, successRate, netRevenue });
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
 */
async function loadPendingTransactions(transactions = []) {
  try {
    console.log('📋 Loading pending transactions...');
    
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
      loadNeedsDeliveryTable(pendingCategories.needsDelivery),
      loadNeedsPaymentTable(pendingCategories.needsPayment)
    ]);
    
    // Update alerts
    updatePendingAlerts(pendingCategories);
    
    console.log('✅ Pending transactions loaded:', pendingCategories);
  } catch (error) {
    console.error('❌ Error loading pending transactions:', error);
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
  needsDelivery.sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return b.isUrgent - a.isUrgent;
    return b.waitingDays - a.waitingDays;
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
 */
async function loadNeedsDeliveryTable(needsDelivery) {
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
    const orderDate = transaction.transactionDate ? new Date(transaction.transactionDate) : new Date();
    const customer = transaction.customerName || 'Không xác định';
    const product = transaction.softwareName || 'N/A';
    const amount = transaction.revenue || 0;
    const waitingTime = rawTransaction.waitingDays;
    const isUrgent = rawTransaction.isUrgent;
    
    return `
      <tr class="pending-row ${isUrgent ? 'urgent-row' : ''}" data-transaction-id="${transaction.id || ''}">
        <td class="date-cell">
          ${orderDate.toLocaleDateString('vi-VN')}
          ${isUrgent ? '<span class="urgent-badge">🔥 Gấp</span>' : ''}
        </td>
        <td class="customer-cell">${customer}</td>
        <td class="product-cell">${product}</td>
        <td class="amount-cell">${formatRevenue(amount)}</td>
        <td class="waiting-cell ${isUrgent ? 'urgent-waiting' : ''}">
          ${waitingTime} ngày
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
 */
function exportStatusData() {
  console.log('💾 Exporting status data...');
  
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
    
    console.log('✅ Status data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting status data:', error);
    alert('Lỗi xuất dữ liệu. Vui lòng thử lại.');
  }
}

/**
 * Action functions for pending transactions
 */
function markAsDelivered(transactionId) {
  console.log('🚚 Marking as delivered:', transactionId);
  // Implementation would update transaction status
  alert(`Gả lập: Đánh dấu giao dịch ${transactionId} đã giao hàng`);
  // Reload pending transactions
  loadPendingTransactions();
}

function markAsPaid(transactionId) {
  console.log('💰 Marking as paid:', transactionId);
  // Implementation would update payment status
  alert(`Gả lập: Đánh dấu giao dịch ${transactionId} đã thanh toán`);
  // Reload pending transactions
  loadPendingTransactions();
}

function sendPaymentReminder(transactionId) {
  console.log('🔔 Sending payment reminder:', transactionId);
  // Implementation would send reminder
  alert(`Gả lập: Gửi nhắc nhở thanh toán cho giao dịch ${transactionId}`);
}

function viewTransactionDetails(transactionId) {
  console.log('👁️ Viewing transaction details:', transactionId);
  // Implementation would show transaction detail modal
  alert(`Gả lập: Hiển thị chi tiết giao dịch ${transactionId}`);
}

function markAllAsDelivered() {
  console.log('🚚 Marking all as delivered');
  const checkedRows = document.querySelectorAll('.needs-delivery-table input[type="checkbox"]:checked');
  if (checkedRows.length === 0) {
    alert('Vui lòng chọn ít nhất một giao dịch');
    return;
  }
  alert(`Gả lập: Đánh dấu ${checkedRows.length} giao dịch đã giao hàng`);
  loadPendingTransactions();
}

function markAllAsPaid() {
  console.log('💰 Marking all as paid');
  const checkedRows = document.querySelectorAll('.needs-payment-table input[type="checkbox"]:checked');
  if (checkedRows.length === 0) {
    alert('Vui lòng chọn ít nhất một giao dịch');
    return;
  }
  alert(`Gả lập: Đánh dấu ${checkedRows.length} giao dịch đã thanh toán`);
  loadPendingTransactions();
}

function sendPaymentReminders() {
  console.log('🔔 Sending payment reminders');
  const overdueCount = document.getElementById('overdue-count')?.textContent || 0;
  alert(`Gả lập: Gửi nhắc nhở thanh toán cho ${overdueCount} giao dịch quá hạn`);
}

function showOverdueDetails() {
  console.log('📄 Showing overdue details');
  alert('Gả lập: Hiển thị chi tiết các giao dịch quá hạn thanh toán');
}

function showUrgentDeliveries() {
  console.log('🎆 Showing urgent deliveries');
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
        
        // Use email as unique identifier, display name as label
        const customerEmail = t.email || 'no-email@unknown.com';
        const customerName = t.customerName || 'Không xác định';
        const revenue = t.revenue || 0;
        const status = t.transactionType;
        const softwareName = t.softwareName || '';
        const transactionDate = t.transactionDate || '';
        
        // Use email as key but store display name
        if (!customerMap.has(customerEmail)) {
            customerMap.set(customerEmail, {
                email: customerEmail,
                name: customerName, // Display name
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
        
        const customer = customerMap.get(customerEmail);
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
  console.log('💾 Exporting needs delivery data...');
  
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
      ...needsDelivery.map(t => [
        new Date(t.ngayGiaoDich || t.date).toLocaleDateString('vi-VN'),
        t.tenKhachHang || t.customer || 'N/A',
        t.tenSanPham || t.software || t.product || 'N/A',
        parseFloat(t.doanhThu || t.revenue || t.amount) || 0,
        t.waitingDays,
        t.isUrgent ? 'Gấp' : 'Bình thường',
        t.isUrgent ? 'Cần giao gấp - quá 3 ngày' : 'Trong thời hạn'
      ])
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
    alert('Lỗi xuất dữ liệu. Vui lòng thử lại.');
  }
}

function exportNeedsPayment() {
  console.log('💾 Exporting needs payment data...');
  
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
      ...needsPayment.map(t => [
        t.deliveryDate ? new Date(t.deliveryDate).toLocaleDateString('vi-VN') : 'N/A',
        t.tenKhachHang || t.customer || 'N/A',
        t.tenSanPham || t.software || t.product || 'N/A',
        parseFloat(t.doanhThu || t.revenue || t.amount) || 0,
        t.overdueDays,
        t.isOverdue ? 'Quá hạn' : 'Trong hạn',
        t.isOverdue ? 'Cần liên hệ gấp' : 'Theo dõi bình thường'
      ])
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
window.updateChartPeriod = updateChartPeriod;
window.calculateRevenueByStatus = calculateRevenueByStatus;
window.exportStatusData = exportStatusData;
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
  console.log('👥 Viewing customer details:', customerIdentifier);
  
  const transactions = window.transactionList || [];
  const customerTransactions = transactions.filter(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    return t && (t.email === customerIdentifier || t.customerName === customerIdentifier);
  });
  
  const customerAnalytics = calculateNormalizedCustomerAnalytics(transactions);
  const customerStats = customerAnalytics.find(c => c.email === customerIdentifier || c.name === customerIdentifier);
  
  if (!customerStats) {
    alert('Không tìm thấy thông tin khách hàng');
    return;
  }
  
  // For now, show basic info in alert (can be enhanced to modal)
  const info = `
    Thông tin chi tiết: ${customerStats.name}
    📧 Email: ${customerStats.email}
    
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
  console.log('📺 Viewing product details:', productName);
  
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
  console.log('💾 Exporting customer data...');
  
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
  console.log('💾 Exporting software/product data...');
  
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
    alert('Lỗi xuất dữ liệu sản phẩm. Vui lòng thử lại.');
  }
}