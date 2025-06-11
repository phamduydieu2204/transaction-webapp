/**
 * overviewReport.js
 * 
 * Overview report functionality - Tổng quan kinh doanh
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatCurrency } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';

/**
 * Load overview report (Tổng quan kinh doanh)
 * @param {Object} options - Options for loading report
 * @param {Object} options.dateRange - Date range filter {start: 'yyyy/mm/dd', end: 'yyyy/mm/dd'}
 * @param {string} options.period - Period name (e.g., 'this_month', 'last_month')
 */
export async function loadOverviewReport(options = {}) {
  console.log('📈 Loading overview report with options:', options);
  
  try {
    // Load the overview report HTML template
    await loadOverviewHTML();
    
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
    
    // Calculate KPIs with date range
    const kpis = calculateOverviewKPIs(transactions, expenses, dateRange);
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
      updateDataTables(filteredTransactions, filteredExpenses)
    ]);
    
    console.log('✅ Overview report loaded successfully');
    
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
      console.warn('⚠️ Overview template not found, using fallback');
      // Use existing structure but enhance it
      enhanceExistingStructure(container);
      return;
    }
    
    const html = await response.text();
    
    // Find the overview report container and add content to it
    const overviewPage = document.getElementById('report-overview');
    if (overviewPage) {
      overviewPage.innerHTML = html;
      overviewPage.classList.add('active');
    } else {
      // Fallback: create the structure
      container.innerHTML = `<div id="report-overview" class="report-page active">${html}</div>`;
    }
    
    console.log('📄 Overview HTML template loaded');
  } catch (error) {
    console.warn('⚠️ Using existing structure with enhancements');
    enhanceExistingStructure(container);
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
 */
function calculateOverviewKPIs(transactions, expenses, dateRange) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  console.log('📅 Date filtering setup:');
  console.log(`  - Using date range:`, dateRange);
  console.log(`  - Total transactions to filter: ${transactions.length}`);
  console.log(`  - Total expenses to filter: ${expenses.length}`);
  
  // Filter data based on date range
  let filteredTransactions, filteredExpenses;
  
  if (dateRange && dateRange.start && dateRange.end) {
    // Use provided date range
    filteredTransactions = filterDataByDateRange(transactions, dateRange);
    filteredExpenses = filterDataByDateRange(expenses, dateRange);
    
    console.log('📊 Filtered by date range:');
    console.log(`  - Transactions: ${transactions.length} → ${filteredTransactions.length}`);
    console.log(`  - Expenses: ${expenses.length} → ${filteredExpenses.length}`);
  } else {
    // Default to current month if no date range
    console.log('📅 No date range provided, using current month');
    
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
  
  // Calculate totals - check various field names
  const totalRevenue = filteredTransactions.reduce((sum, t) => {
    const revenue = parseFloat(t.doanhThu || t.revenue || t.Revenue || t.doanh_thu) || 0;
    return sum + revenue;
  }, 0);
  
  const totalExpense = filteredExpenses.reduce((sum, e) => {
    const expense = parseFloat(e.soTien || e.amount || e.Amount || e.so_tien) || 0;
    return sum + expense;
  }, 0);
  
  console.log('📊 Revenue calculation:');
  console.log('  - Filtered transactions:', filteredTransactions.length);
  console.log('  - Total revenue calculated:', totalRevenue);
  console.log('  - Total expense calculated:', totalExpense);
  
  const totalProfit = totalRevenue - totalExpense;
  const totalTransactions = filteredTransactions.length;
  
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
  const prevExpenses = filterDataByDateRange(expenses, prevDateRange);
  
  const prevRevenue = prevTransactions.reduce((sum, t) => {
    return sum + (parseFloat(t.doanhThu || t.revenue) || 0);
  }, 0);
  
  const prevExpense = prevExpenses.reduce((sum, e) => {
    return sum + (parseFloat(e.soTien || e.amount) || 0);
  }, 0);
  
  const prevProfit = prevRevenue - prevExpense;
  const prevTransactionCount = prevTransactions.length;
  
  // Calculate growth percentages
  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
  const expenseGrowth = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense * 100) : 0;
  const profitGrowth = prevProfit !== 0 ? ((totalProfit - prevProfit) / Math.abs(prevProfit) * 100) : 0;
  const transactionGrowth = prevTransactionCount > 0 ? ((totalTransactions - prevTransactionCount) / prevTransactionCount * 100) : 0;
  
  return {
    revenue: {
      current: totalRevenue,
      previous: prevRevenue,
      growth: revenueGrowth
    },
    expense: {
      current: totalExpense,
      previous: prevExpense,
      growth: expenseGrowth
    },
    profit: {
      current: totalProfit,
      previous: prevProfit,
      growth: profitGrowth
    },
    transactions: {
      current: totalTransactions,
      previous: prevTransactionCount,
      growth: transactionGrowth
    }
  };
}

/**
 * Update KPI cards with calculated data
 */
async function updateKPICards(kpis) {
  // Revenue card
  updateKPICard('revenue', {
    value: kpis.revenue.current,
    growth: kpis.revenue.growth,
    icon: '💰',
    title: 'Doanh thu tháng này'
  });
  
  // Expense card
  updateKPICard('expense', {
    value: kpis.expense.current,
    growth: kpis.expense.growth,
    icon: '💸',
    title: 'Chi phí tháng này'
  });
  
  // Profit card
  updateKPICard('profit', {
    value: kpis.profit.current,
    growth: kpis.profit.growth,
    icon: '📈',
    title: 'Lợi nhuận tháng này'
  });
  
  // Transaction card
  updateKPICard('transaction', {
    value: kpis.transactions.current,
    growth: kpis.transactions.growth,
    icon: '📋',
    title: 'Giao dịch tháng này'
  });
}

/**
 * Update individual KPI card
 */
function updateKPICard(type, data) {
  let valueElement, changeElement;
  
  // Map to HTML IDs
  switch (type) {
    case 'revenue':
      valueElement = document.getElementById('total-revenue');
      changeElement = document.getElementById('revenue-change');
      break;
    case 'expense':
      valueElement = document.getElementById('total-expenses');
      changeElement = document.getElementById('expense-change');
      break;
    case 'profit':
      valueElement = document.getElementById('total-profit');
      changeElement = document.getElementById('profit-change');
      break;
    case 'transaction':
      valueElement = document.getElementById('total-transactions');
      changeElement = document.getElementById('transaction-change');
      break;
  }
  
  if (!valueElement) {
    console.warn(`❌ KPI element not found for ${type}`);
    return;
  }
  
  console.log(`💰 Updating KPI ${type}:`);
  console.log(`  - Element ID: ${valueElement ? valueElement.id : 'NOT FOUND'}`);
  console.log(`  - Raw value: ${data.value}`);
  console.log(`  - Formatted value: ${type === 'transaction' ? data.value.toLocaleString() : formatRevenue(data.value)}`);
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
 * Load charts
 */
async function loadCharts(transactions, expenses) {
  try {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js not available, loading from CDN');
      await loadChartJS();
    }
    
    // Render revenue trend chart
    renderRevenueTrendChart(transactions);
    
    // Render expense distribution chart
    renderExpenseDistributionChart(expenses);
    
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
 * Render revenue trend chart
 */
function renderRevenueTrendChart(transactions) {
  const canvas = document.getElementById('revenue-trend-chart');
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
        data: monthsData.revenue,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
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
 * Get revenue data for last 6 months
 */
function getLastSixMonthsData(transactions) {
  const months = [];
  const revenue = [];
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
    revenue.push(monthRevenue);
  }
  
  return {
    labels: months,
    revenue: revenue
  };
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
 * Update data tables
 */
function updateDataTables(transactions, expenses) {
  updateTopCustomersTable(transactions);
  updateRecentTransactionsTable(transactions);
  updateTopExpensesTable(expenses);
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

// Make function available globally
window.loadOverviewReport = loadOverviewReport;