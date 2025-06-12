/**
 * overviewReport.js
 * 
 * Overview report functionality - Tổng quan kinh doanh
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatCurrency } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { 
  calculateBusinessMetrics,
  calculateTotalRevenue,
  calculateTotalExpenses,
  formatCurrency as formatCurrencyCore,
  normalizeDate,
  getDateRange
} from '../../statisticsCore.js';
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
  
  prevTransactions.forEach(t => {
    const revenue = parseFloat(t.doanhThu || t.revenue) || 0;
    const status = t.loaiGiaoDich || t.transactionType || t.status || '';
    
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
  
  transactions.forEach(t => {
    const amount = parseFloat(t.doanhThu || t.revenue || t.Revenue || t.doanh_thu || t.amount) || 0;
    const status = (t.loaiGiaoDich || t.transactionType || t.status || '').toLowerCase();
    
    if (status.includes('hoàn tất') || status.includes('completed')) {
      breakdown.completed.count++;
      breakdown.completed.amount += amount;
    } else if (status.includes('đã thanh toán') || status.includes('paid')) {
      breakdown.paid.count++;
      breakdown.paid.amount += amount;
    } else if (status.includes('hoàn tiền') || status.includes('refund')) {
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
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.ngayGiaoDich || t.date);
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
    const weekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.ngayGiaoDich || t.date);
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
    const dayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.ngayGiaoDich || t.date);
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
      .filter(t => {
        const transactionDate = new Date(t.ngayGiaoDich || t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, t) => sum + (parseFloat(t.doanhThu || t.revenue) || 0), 0);
    
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
  transactions.forEach(t => {
    const customer = t.tenKhachHang || t.customer || 'Không xác định';
    if (!customers[customer]) {
      customers[customer] = {
        name: customer,
        revenue: 0,
        transactions: 0
      };
    }
    customers[customer].revenue += parseFloat(t.doanhThu || t.revenue) || 0;
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
    .sort((a, b) => new Date(b.ngayGiaoDich || b.date) - new Date(a.ngayGiaoDich || a.date))
    .slice(0, 5);
  
  // Update table
  table.innerHTML = recentTransactions.map(t => `
    <tr>
      <td>${new Date(t.ngayGiaoDich || t.date).toLocaleDateString('vi-VN')}</td>
      <td>${t.tenKhachHang || t.customer || 'N/A'}</td>
      <td>${t.tenSanPham || t.product || 'N/A'}</td>
      <td>${formatRevenue(parseFloat(t.doanhThu || t.revenue) || 0)}</td>
      <td>
        <span class="status-badge ${(t.trangThai || t.status || 'pending').toLowerCase()}">${t.trangThai || t.status || 'Pending'}</span>
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
 * Load top products data
 * @param {Array} transactions - Filtered transactions
 */
async function loadTopProducts(transactions = []) {
  try {
    const container = document.getElementById('top-software-body');
    if (!container) {
      console.warn('❌ Top products container not found');
      console.warn('🔍 Available elements:', {
        'top-software-body': !!document.getElementById('top-software-body'),
        'topProducts': !!document.getElementById('topProducts'),
        'top-software-table': !!document.getElementById('top-software-table')
      });
      return;
    }

    // Use provided transactions or fallback to global
    if (!transactions || transactions.length === 0) {
      transactions = window.transactionList || [];
    }
    
    // Group by software and calculate totals
    const softwareStats = {};
    transactions.forEach(transaction => {
      const software = transaction.software || transaction.tenSanPham || 'Không xác định';
      const revenue = parseFloat(transaction.revenue || transaction.doanhThu) || 0;
      
      if (!softwareStats[software]) {
        softwareStats[software] = {
          name: software,
          revenue: 0,
          count: 0
        };
      }
      
      softwareStats[software].revenue += revenue;
      softwareStats[software].count += 1;
    });

    // Sort by revenue and get top 5
    const topProducts = Object.values(softwareStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Render top products as table rows
    const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
    
    container.innerHTML = topProducts.map(product => {
      const percentage = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td>${product.name}</td>
          <td>${product.count}</td>
          <td>${formatRevenue(product.revenue)}</td>
          <td>${percentage}%</td>
        </tr>
      `;
    }).join('');
    console.log('✅ Top products loaded');
  } catch (error) {
    console.error('❌ Error loading top products:', error);
    showError('Không thể tải dữ liệu sản phẩm hàng đầu');
  }
}

/**
 * Load top customers data
 * @param {Array} transactions - Filtered transactions
 */
async function loadTopCustomers(transactions = []) {
  try {
    const container = document.getElementById('top-customers-body');
    if (!container) {
      console.warn('❌ Top customers container not found');
      console.warn('🔍 Available elements:', {
        'top-customers-body': !!document.getElementById('top-customers-body'),
        'topCustomers': !!document.getElementById('topCustomers'),
        'top-customers-table': !!document.getElementById('top-customers-table')
      });
      return;
    }

    // Use provided transactions or fallback to global
    if (!transactions || transactions.length === 0) {
      transactions = window.transactionList || [];
    }
    
    // Group by customer and calculate totals
    const customerStats = {};
    transactions.forEach(transaction => {
      const customer = transaction.customer || transaction.tenKhachHang || 'Không xác định';
      const revenue = parseFloat(transaction.revenue || transaction.doanhThu) || 0;
      
      if (!customerStats[customer]) {
        customerStats[customer] = {
          name: customer,
          revenue: 0,
          count: 0
        };
      }
      
      customerStats[customer].revenue += revenue;
      customerStats[customer].count += 1;
    });

    // Sort by revenue and get top 5
    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Render top customers as table rows
    container.innerHTML = topCustomers.map(customer => {
      const trend = Math.random() > 0.5 ? 'up' : 'down'; // Placeholder trend
      const trendIcon = trend === 'up' ? '📈' : '📉';
      return `
        <tr>
          <td>${customer.name}</td>
          <td>${customer.count}</td>
          <td>${formatRevenue(customer.revenue)}</td>
          <td>${trendIcon}</td>
        </tr>
      `;
    }).join('');
    console.log('✅ Top customers loaded');
  } catch (error) {
    console.error('❌ Error loading top customers:', error);
    showError('Không thể tải dữ liệu khách hàng hàng đầu');
  }
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
  
  transactions.forEach(t => {
    const status = (t.loaiGiaoDich || t.transactionType || t.status || '').toLowerCase();
    const paymentStatus = (t.trangThaiThanhToan || t.paymentStatus || '').toLowerCase();
    const deliveryStatus = (t.trangThaiGiaoHang || t.deliveryStatus || '').toLowerCase();
    const orderDate = new Date(t.ngayGiaoDich || t.orderDate || t.date);
    const deliveryDate = t.ngayGiaoHang || t.deliveryDate ? new Date(t.ngayGiaoHang || t.deliveryDate) : null;
    
    // Case 1: Đã thanh toán nhưng chưa hoàn tất (cần giao hàng)
    if ((status.includes('đã thanh toán') || paymentStatus.includes('paid') || paymentStatus.includes('đã thanh toán')) &&
        (!status.includes('hoàn tất') && !status.includes('completed'))) {
      
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
    
    // Case 2: Chưa thanh toán nhưng đã giao hàng (cần thu tiền)
    else if ((deliveryStatus.includes('delivered') || deliveryStatus.includes('đã giao') || status.includes('giao hàng')) &&
             (!status.includes('đã thanh toán') && !paymentStatus.includes('paid'))) {
      
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
  
  tbody.innerHTML = needsDelivery.map(transaction => {
    const orderDate = new Date(transaction.ngayGiaoDich || transaction.date);
    const customer = transaction.tenKhachHang || transaction.customer || 'Không xác định';
    const product = transaction.tenSanPham || transaction.software || transaction.product || 'N/A';
    const amount = parseFloat(transaction.doanhThu || transaction.revenue || transaction.amount) || 0;
    const waitingTime = transaction.waitingDays;
    const isUrgent = transaction.isUrgent;
    
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
  
  tbody.innerHTML = needsPayment.map(transaction => {
    const deliveryDate = transaction.deliveryDate ? new Date(transaction.deliveryDate) : new Date(transaction.ngayGiaoDich || transaction.date);
    const customer = transaction.tenKhachHang || transaction.customer || 'Không xác định';
    const product = transaction.tenSanPham || transaction.software || transaction.product || 'N/A';
    const amount = parseFloat(transaction.doanhThu || transaction.revenue || transaction.amount) || 0;
    const overdueDays = transaction.overdueDays;
    const isOverdue = transaction.isOverdue;
    
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