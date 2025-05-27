/**
 * financialDashboard.js
 * 
 * Dashboard Tài Chính Tổng Quan
 * Hiển thị tình hình tài chính real-time với alerts và forecasts
 */

import { normalizeDate, formatCurrency, getDateRange } from './statisticsCore.js';

// Global state cho filter panel với persistence
window.globalFilters = JSON.parse(localStorage.getItem('dashboardFilters')) || {
  dateRange: null,
  period: 'current_month', // current_month, last_month, custom
  customStartDate: null,
  customEndDate: null
};

// Save filters to localStorage
function saveFiltersToStorage() {
  localStorage.setItem('dashboardFilters', JSON.stringify(window.globalFilters));
}

/**
 * Renders the comprehensive financial dashboard
 * @param {Array} transactionData - Transaction records from GiaoDich sheet
 * @param {Array} expenseData - Expense records from ChiPhi sheet  
 * @param {Object} options - Dashboard options
 */
export function renderFinancialDashboard(transactionData, expenseData, options = {}) {
  const {
    containerId = "financialDashboard",
    globalFilters = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Dashboard container #${containerId} not found`);
    return;
  }

  console.log("💰 Rendering Financial Dashboard với dữ liệu:", {
    transactions: transactionData.length,
    expenses: expenseData.length,
    globalFilters: globalFilters
  });
  
  // Debug: Verify dashboard is rendering
  console.log("🔍 Dashboard container found:", !!container);
  console.log("📊 Container ID:", containerId);

  // Apply global filters if available
  let filteredTransactionData = transactionData;
  let filteredExpenseData = expenseData;
  
  if (globalFilters && globalFilters.dateRange) {
    filteredTransactionData = filterDataByDateRange(transactionData, globalFilters.dateRange);
    filteredExpenseData = filterDataByDateRange(expenseData, globalFilters.dateRange);
    
    console.log("🔍 Đã áp dụng bộ lọc:", {
      originalTransactions: transactionData.length,
      filteredTransactions: filteredTransactionData.length,
      originalExpenses: expenseData.length,
      filteredExpenses: filteredExpenseData.length,
      dateRange: globalFilters.dateRange
    });
  }

  // Calculate all metrics với dữ liệu đã lọc
  const metrics = calculateFinancialMetrics(filteredTransactionData, filteredExpenseData, globalFilters);

  // Render dashboard HTML
  const dashboardHTML = `
    <div class="dashboard-wrapper">
      ${renderFilterPanel()}
      <div class="financial-dashboard">
        <div class="dashboard-header">
          <h2>💰 Dashboard Tài Chính Tổng Quan</h2>
          <div class="dashboard-controls">
            <button class="filter-toggle-btn" onclick="toggleFilterPanel()">
              <span class="filter-icon">⚙️</span> Bộ lọc
            </button>
            <div class="last-updated">Cập nhật: ${new Date().toLocaleString('vi-VN')}</div>
          </div>
        </div>
        
        <!-- Tổng quan Doanh thu / Chi phí / Lợi nhuận -->
        ${renderOverviewCards(metrics)}
        
        <!-- Dòng tiền & Thanh khoản -->
        ${renderCashFlowTracker(metrics)}
        
        <!-- Chi phí theo danh mục -->
        ${renderCategoryBreakdown(metrics)}
      </div>
    </div>
  `;

  container.innerHTML = dashboardHTML;
  
  // Debug: Verify components are rendered
  console.log("✅ Dashboard HTML length:", dashboardHTML.length);
  console.log("📈 Overview cards present:", !!container.querySelector('.overview-cards'));
  console.log("🔧 Filter panel present:", !!container.querySelector('.filter-panel'));
  console.log("💰 Revenue card present:", !!container.querySelector('.revenue-card'));
  console.log("💸 Expense card present:", !!container.querySelector('.expense-card'));
  console.log("💵 Profit card present:", !!container.querySelector('.profit-card'));
  
  // Initialize default filters if not set
  if (!window.globalFilters.dateRange) {
    window.updatePeriodFilter('current_month');
  }
  
  // Add interactive features
  addDashboardInteractivity();
  
  console.log("✅ Financial Dashboard rendered successfully");
  
  // Show notification to user
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #48bb78;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-weight: 500;
  `;
  notification.textContent = '✅ Dashboard tài chính đã tải xong! Bộ lọc và tổng quan đang hiển thị.';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Calculates comprehensive financial metrics
 */
function calculateFinancialMetrics(transactionData, expenseData, globalFilters = null) {
  const today = new Date();
  const todayStr = normalizeDate(today);
  const thisMonth = getDateRange("month");
  const thisQuarter = getDateRange("quarter");
  const thisYear = getDateRange("year");

  console.log("🧮 Calculating financial metrics...");
  
  // Sử dụng filtered date range nếu có
  let primaryPeriod;
  if (globalFilters && globalFilters.dateRange) {
    primaryPeriod = {
      start: globalFilters.dateRange.start,
      end: globalFilters.dateRange.end
    };
  } else {
    primaryPeriod = thisMonth;
  }

  // Revenue calculations - sử dụng primaryPeriod làm chính
  const revenueToday = calculateRevenue(transactionData, todayStr, todayStr);
  // Nếu data đã được filter, skip date filter cho primaryPeriod
  const isDataFiltered = globalFilters && globalFilters.dateRange;
  const revenueMonth = calculateRevenue(transactionData, primaryPeriod.start, primaryPeriod.end, isDataFiltered);
  const revenueQuarter = calculateRevenue(transactionData, thisQuarter.start, thisQuarter.end);
  const revenueYear = calculateRevenue(transactionData, thisYear.start, thisYear.end);

  // Expense calculations by category - sử dụng primaryPeriod làm chính
  const expensesToday = calculateExpensesByCategory(expenseData, todayStr, todayStr);
  const expensesMonth = calculateExpensesByCategory(expenseData, primaryPeriod.start, primaryPeriod.end, isDataFiltered);
  const expensesQuarter = calculateExpensesByCategory(expenseData, thisQuarter.start, thisQuarter.end);
  const expensesYear = calculateExpensesByCategory(expenseData, thisYear.start, thisYear.end);

  // Profit calculations
  const profitToday = revenueToday.total - expensesToday.total;
  const profitMonth = revenueMonth.total - expensesMonth.total;
  const profitQuarter = revenueQuarter.total - expensesQuarter.total;
  const profitYear = revenueYear.total - expensesYear.total;

  // Margin calculations
  const marginToday = revenueToday.total > 0 ? (profitToday / revenueToday.total) * 100 : 0;
  const marginMonth = revenueMonth.total > 0 ? (profitMonth / revenueMonth.total) * 100 : 0;
  const marginQuarter = revenueQuarter.total > 0 ? (profitQuarter / revenueQuarter.total) * 100 : 0;
  const marginYear = revenueYear.total > 0 ? (profitYear / revenueYear.total) * 100 : 0;

  return {
    today: {
      revenue: revenueToday,
      expenses: expensesToday,
      profit: profitToday,
      margin: marginToday
    },
    month: {
      revenue: revenueMonth,
      expenses: expensesMonth,
      profit: profitMonth,
      margin: marginMonth
    },
    quarter: {
      revenue: revenueQuarter,
      expenses: expensesQuarter,
      profit: profitQuarter,
      margin: marginQuarter
    },
    year: {
      revenue: revenueYear,
      expenses: expensesYear,
      profit: profitYear,
      margin: marginYear
    }
  };
}

/**
 * Calculates revenue within date range
 */
function calculateRevenue(transactionData, startDate, endDate, skipDateFilter = false) {
  const revenue = {
    total: 0,
    byType: {},
    bySoftware: {},
    byEmployee: {}
  };

  console.log("💰 Calculate Revenue Debug:", {
    dataCount: transactionData.length,
    startDate,
    endDate,
    skipDateFilter,
    startDateType: typeof startDate,
    endDateType: typeof endDate,
    sampleData: transactionData.slice(0, 2)
  });

  transactionData.forEach(transaction => {
    let shouldInclude = true;
    
    // Chỉ filter theo date nếu không skip
    if (!skipDateFilter) {
      const transactionDate = normalizeDate(transaction.transactionDate || transaction.date);
      // Đảm bảo so sánh string date format yyyy/mm/dd
      const normalizedStart = typeof startDate === 'string' ? startDate : normalizeDate(startDate);
      const normalizedEnd = typeof endDate === 'string' ? endDate : normalizeDate(endDate);
      shouldInclude = transactionDate >= normalizedStart && transactionDate <= normalizedEnd;
    }
    
    if (shouldInclude) {
      const amount = parseFloat(transaction.revenue || transaction.amount || 0);
      const type = transaction.transactionType || transaction.type || "Khác";
      const software = transaction.softwareName || transaction.software || "Khác";
      const employee = transaction.employeeName || transaction.employee || "Khác";

      revenue.total += amount;
      revenue.byType[type] = (revenue.byType[type] || 0) + amount;
      revenue.bySoftware[software] = (revenue.bySoftware[software] || 0) + amount;
      revenue.byEmployee[employee] = (revenue.byEmployee[employee] || 0) + amount;
    }
  });

  console.log("✅ Calculate Revenue Result:", {
    total: revenue.total,
    recordsProcessed: transactionData.length
  });

  return revenue;
}

/**
 * Calculates expenses by category within date range
 */
function calculateExpensesByCategory(expenseData, startDate, endDate, skipDateFilter = false) {
  const expenses = {
    total: 0,
    "Sinh hoạt cá nhân": 0,
    "Kinh doanh phần mềm": 0, 
    "Kinh doanh Amazon": 0,
    "Khác": 0,
    bySubCategory: {},
    byEmployee: {}
  };

  console.log("💸 Calculate Expenses Debug:", {
    dataCount: expenseData.length,
    startDate,
    endDate,
    skipDateFilter,
    sampleData: expenseData.slice(0, 2)
  });

  expenseData.forEach(expense => {
    let shouldInclude = true;
    
    // Chỉ filter theo date nếu không skip
    if (!skipDateFilter) {
      const expenseDate = normalizeDate(expense.date);
      // Đảm bảo so sánh string date format yyyy/mm/dd
      const normalizedStart = typeof startDate === 'string' ? startDate : normalizeDate(startDate);
      const normalizedEnd = typeof endDate === 'string' ? endDate : normalizeDate(endDate);
      shouldInclude = expenseDate >= normalizedStart && expenseDate <= normalizedEnd;
    }
    
    if (shouldInclude) {
      const amount = parseFloat(expense.amount || 0);
      const category = expense.type || "Khác";
      const subCategory = expense.category || "Khác";
      const employee = expense.employeeName || expense.employee || "Khác";

      expenses.total += amount;
      
      // Map to main categories
      if (category.includes("Sinh hoạt") || category.includes("cá nhân")) {
        expenses["Sinh hoạt cá nhân"] += amount;
      } else if (category.includes("phần mềm") || category.includes("software")) {
        expenses["Kinh doanh phần mềm"] += amount;
      } else if (category.includes("Amazon")) {
        expenses["Kinh doanh Amazon"] += amount;
      } else {
        expenses["Khác"] += amount;
      }

      expenses.bySubCategory[subCategory] = (expenses.bySubCategory[subCategory] || 0) + amount;
      expenses.byEmployee[employee] = (expenses.byEmployee[employee] || 0) + amount;
    }
  });

  console.log("✅ Calculate Expenses Result:", {
    total: expenses.total,
    recordsProcessed: expenseData.length
  });

  return expenses;
}

/**
 * Get current period label from global filters
 */
function getPeriodLabel() {
  if (!window.globalFilters || !window.globalFilters.dateRange) return "Tháng này";
  
  const { start, end } = window.globalFilters.dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Kiểm tra nếu là tháng đầy đủ
  const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  if (startDate.getTime() === startOfMonth.getTime() && endDate.getTime() === endOfMonth.getTime()) {
    return `Tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
  }
  
  // Ngược lại hiển thị khoảng thời gian
  return `${start} đến ${end}`;
}

/**
 * Renders overview cards with key metrics
 */
function renderOverviewCards(metrics) {
  const periodLabel = getPeriodLabel();

  return `
    <div class="overview-cards">
      <div class="overview-card revenue-card">
        <div class="card-header">
          <h3>📈 Doanh Thu</h3>
          <div class="period-label">${periodLabel}</div>
        </div>
        <div class="card-content">
          <div class="main-amount revenue-amount">
            ${formatCurrency(metrics.month.revenue.total, "VND")}
          </div>
          <div class="sub-info">
            <div>Top phần mềm: ${getTopSoftware(metrics.month.revenue.bySoftware)}</div>
          </div>
        </div>
      </div>

      <div class="overview-card expense-card">
        <div class="card-header">
          <h3>💸 Chi Phí</h3>
          <div class="period-label">${periodLabel}</div>
        </div>
        <div class="card-content">
          <div class="main-amount expense-amount">
            ${formatCurrency(metrics.month.expenses.total, "VND")}
          </div>
          <div class="sub-info">
            <div>Kinh doanh: ${formatCurrency(metrics.month.expenses["Kinh doanh phần mềm"], "VND")}</div>
            <div>Cá nhân: ${formatCurrency(metrics.month.expenses["Sinh hoạt cá nhân"], "VND")}</div>
          </div>
        </div>
      </div>

      <div class="overview-card profit-card ${metrics.month.profit >= 0 ? 'positive' : 'negative'}">
        <div class="card-header">
          <h3>💰 Lợi Nhuận</h3>
          <div class="period-label">${periodLabel}</div>
        </div>
        <div class="card-content">
          <div class="main-amount profit-amount">
            ${formatCurrency(metrics.month.profit, "VND")}
          </div>
          <div class="sub-info">
            <div>Margin: ${metrics.month.margin.toFixed(1)}%</div>
            <div>${metrics.month.profit >= 0 ? '📈 Lãi' : '📉 Lỗ'}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Gets top performing software
 */
function getTopSoftware(bySoftware) {
  const entries = Object.entries(bySoftware);
  if (entries.length === 0) return "Chưa có";
  
  const top = entries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  
  return top[0];
}

/**
 * Renders cash flow tracking section
 */
function renderCashFlowTracker(metrics) {
  return `
    <div class="cash-flow-section">
      <h3>💳 Dòng Tiền & Thanh Khoản</h3>
      <div class="cash-flow-grid">
        <div class="cash-flow-item">
          <div class="cf-label">Tiền vào hôm nay</div>
          <div class="cf-amount positive">+${formatCurrency(metrics.today.revenue.total, "VND")}</div>
        </div>
        <div class="cash-flow-item">
          <div class="cf-label">Tiền ra hôm nay</div>
          <div class="cf-amount negative">-${formatCurrency(metrics.today.expenses.total, "VND")}</div>
        </div>
        <div class="cash-flow-item">
          <div class="cf-label">Net Cash Flow</div>
          <div class="cf-amount ${metrics.today.profit >= 0 ? 'positive' : 'negative'}">
            ${metrics.today.profit >= 0 ? '+' : ''}${formatCurrency(metrics.today.profit, "VND")}
          </div>
        </div>
        <div class="cash-flow-item">
          <div class="cf-label">Dự kiến tháng này</div>
          <div class="cf-amount ${metrics.month.profit >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(metrics.month.profit, "VND")}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders category breakdown
 */
function renderCategoryBreakdown(metrics) {
  const total = metrics.month.expenses.total;
  
  // Get current period label
  const periodLabel = getPeriodLabel();
  
  // Calculate percentages and prepare data
  const categories = [
    {
      name: 'Kinh doanh phần mềm',
      amount: metrics.month.expenses['Kinh doanh phần mềm'],
      icon: '💻',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Sinh hoạt cá nhân',
      amount: metrics.month.expenses['Sinh hoạt cá nhân'],
      icon: '🏠',
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Kinh doanh Amazon',
      amount: metrics.month.expenses['Kinh doanh Amazon'],
      icon: '📦',
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      name: 'Khác',
      amount: metrics.month.expenses['Khác'] || 0,
      icon: '📌',
      color: '#fa709a',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ].filter(cat => cat.amount > 0) // Only show categories with expenses
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  
  return `
    <div class="category-breakdown-modern">
      <h3>📊 Chi Phí Theo Danh Mục 
        <span class="period-label-inline">${periodLabel}</span>
      </h3>
      
      <div class="category-cards">
        ${categories.map((cat, index) => {
          const percentage = total > 0 ? (cat.amount / total) * 100 : 0;
          return `
            <div class="category-card" style="background: ${cat.gradient}">
              <div class="category-icon">${cat.icon}</div>
              <div class="category-info">
                <div class="category-name">${cat.name}</div>
                <div class="category-amount-modern">${formatCurrency(cat.amount, "VND")}</div>
                <div class="category-percentage">${percentage.toFixed(1)}% tổng chi phí</div>
              </div>
              <div class="category-chart">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg"
                    stroke="#ffffff"
                    stroke-width="2"
                    fill="none"
                    stroke-opacity="0.3"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path class="circle"
                    stroke="#ffffff"
                    stroke-width="3"
                    stroke-dasharray="${percentage}, 100"
                    stroke-linecap="round"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" class="percentage-text">${percentage.toFixed(0)}%</text>
                </svg>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="category-summary">
        <div class="summary-item">
          <span class="summary-label">Tổng chi phí ${periodLabel.toLowerCase()}</span>
          <span class="summary-value">${formatCurrency(total, "VND")}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates alerts based on data analysis
 */
function generateAlerts(transactionData, expenseData, metrics) {
  const alerts = [];
  
  // High expense alert
  if (metrics.today.expenses.total > metrics.month.expenses.total / 30 * 2) {
    alerts.push({
      type: "warning",
      icon: "⚠️",
      title: "Chi phí cao bất thường",
      message: `Hôm nay chi ${formatCurrency(metrics.today.expenses.total, "VND")}, cao hơn bình thường`
    });
  }
  
  // Low revenue alert
  if (metrics.today.revenue.total === 0) {
    alerts.push({
      type: "info",
      icon: "📉",
      title: "Chưa có doanh thu hôm nay",
      message: "Cần focus vào việc bán hàng và chốt deal"
    });
  }
  
  // Profit margin alert
  if (metrics.month.margin < 50) {
    alerts.push({
      type: "warning", 
      icon: "📊",
      title: "Tỷ suất lợi nhuận thấp",
      message: `Margin tháng này chỉ ${metrics.month.margin.toFixed(1)}%, cần tối ưu chi phí`
    });
  }
  
  return alerts;
}

/**
 * Renders alert system
 */
function renderAlertSystem(alerts) {
  if (alerts.length === 0) {
    return `
      <div class="alert-system">
        <h3>🔔 Thông Báo</h3>
        <div class="alert success">
          <span class="alert-icon">✅</span>
          <div class="alert-content">
            <div class="alert-title">Tình hình tài chính ổn định</div>
            <div class="alert-message">Không có cảnh báo nào cần chú ý</div>
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="alert-system">
      <h3>🔔 Cảnh Báo Quan Trọng</h3>
      ${alerts.map(alert => `
        <div class="alert ${alert.type}">
          <span class="alert-icon">${alert.icon}</span>
          <div class="alert-content">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-message">${alert.message}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Generates forecast data
 */
function generateForecast(transactionData, expenseData) {
  // Simple forecast based on current trends
  return {
    monthRevenue: 0, // Will implement later
    monthExpenses: 0,
    recommendations: [
      "Tập trung vào các phần mềm có margin cao",
      "Tối ưu chi phí marketing",
      "Theo dõi sát customer acquisition cost"
    ]
  };
}

/**
 * Renders quick forecast section
 */
function renderQuickForecast(forecast) {
  return `
    <div class="forecast-section">
      <h3>🔮 Dự Báo & Khuyến Nghị</h3>
      <div class="recommendations">
        ${forecast.recommendations.map(rec => `
          <div class="recommendation">
            <span class="rec-icon">💡</span>
            <span class="rec-text">${rec}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Adds interactive features to dashboard
 */
function addDashboardInteractivity() {
  // No interactive features needed for simplified cards
  console.log("✅ Dashboard interactivity initialized");
}

/**
 * Adds CSS styles for financial dashboard
 */
export function addFinancialDashboardStyles() {
  if (document.getElementById('financial-dashboard-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'financial-dashboard-styles';
  styles.textContent = `
    /* Dashboard Wrapper & Layout */
    .dashboard-wrapper {
      position: relative;
      min-height: 500px;
    }
    
    .financial-dashboard {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      margin: 20px 0;
      transition: margin-right 0.3s ease;
    }
    
    .financial-dashboard.filter-open {
      margin-right: 320px;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }
    
    .dashboard-header h2 {
      margin: 0;
      color: #2d3748;
    }
    
    .last-updated {
      color: #6c757d;
      font-size: 14px;
    }
    
    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f0f4f8;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
    }
    
    .overview-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-left: 5px solid #007bff;
    }
    
    .overview-card.revenue-card {
      border-left-color: #28a745;
    }
    
    .overview-card.expense-card {
      border-left-color: #dc3545;
    }
    
    .overview-card.profit-card.positive {
      border-left-color: #17a2b8;
    }
    
    .overview-card.profit-card.negative {
      border-left-color: #ffc107;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .card-header h3 {
      margin: 0;
      font-size: 16px;
      color: #495057;
    }
    
    .period-label {
      font-size: 12px;
      color: #6c757d;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }
    
    .main-amount {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .revenue-amount { color: #28a745; }
    .expense-amount { color: #dc3545; }
    .profit-amount { color: #17a2b8; }
    
    .sub-info {
      font-size: 14px;
      color: #6c757d;
    }
    
    .cash-flow-section {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .cash-flow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .cash-flow-item {
      text-align: center;
      padding: 15px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }
    
    .cf-label {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 8px;
    }
    
    .cf-amount {
      font-size: 20px;
      font-weight: bold;
    }
    
    .cf-amount.positive { color: #28a745; }
    .cf-amount.negative { color: #dc3545; }
    
    .category-breakdown {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .category-bars {
      margin-top: 15px;
    }
    
    .category-bar {
      display: grid;
      grid-template-columns: 150px 1fr 120px;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .category-progress {
      background: #e9ecef;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      transition: width 0.5s ease;
    }
    
    .progress-bar.software { background: #007bff; }
    .progress-bar.personal { background: #28a745; }
    .progress-bar.amazon { background: #ffc107; }
    
    .category-amount {
      text-align: right;
      font-weight: bold;
    }
    
    .alert-system {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .alert {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .alert.success {
      background: #d4edda;
      border-left-color: #28a745;
    }
    
    .alert.warning {
      background: #fff3cd;
      border-left-color: #ffc107;
    }
    
    .alert.info {
      background: #d1ecf1;
      border-left-color: #17a2b8;
    }
    
    .alert-icon {
      font-size: 20px;
      margin-right: 15px;
    }
    
    .alert-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .forecast-section {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .recommendations {
      margin-top: 15px;
    }
    
    .recommendation {
      display: flex;
      align-items: center;
      padding: 10px;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .rec-icon {
      margin-right: 10px;
      font-size: 16px;
    }
    
    .hidden {
      display: none !important;
    }
    
    @media (max-width: 768px) {
      .overview-cards {
        grid-template-columns: 1fr;
      }
      
      .cash-flow-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .category-bar {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 10px;
      }
      
      .period-tabs {
        flex-wrap: wrap;
      }
      
      /* Mobile Filter Panel */
      .filter-panel {
        width: 100%;
        right: -100%;
      }
      
      .financial-dashboard.filter-open {
        margin-right: 0;
      }
      
      .dashboard-controls {
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
    }
    
    /* Filter Panel Styles */
    .filter-panel {
      position: fixed;
      top: 0;
      right: -320px;
      width: 300px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 1000;
      overflow-y: auto;
      border-left: 1px solid #e9ecef;
    }
    
    .filter-panel.open {
      right: 0;
    }
    
    .filter-panel-header {
      padding: 20px;
      background: #007bff;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1001;
    }
    
    .filter-panel-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .close-filter-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .close-filter-btn:hover {
      background-color: rgba(255,255,255,0.2);
    }
    
    .filter-section {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .filter-section h4 {
      margin: 0 0 15px 0;
      color: #2d3748;
      font-size: 14px;
      font-weight: 600;
    }
    
    .period-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .period-option {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }
    
    .period-option:hover {
      border-color: #3182ce;
      background: #f7faff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(49, 130, 206, 0.15);
    }
    
    .period-option.selected {
      border-color: #3182ce;
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
    }
    
    .period-icon {
      font-size: 24px;
      margin-right: 12px;
      min-width: 30px;
    }
    
    .period-content {
      flex: 1;
    }
    
    .period-title {
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .period-subtitle {
      font-size: 12px;
      color: #718096;
    }
    
    .period-check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      transition: all 0.3s ease;
    }
    
    .period-check.active {
      background: #48bb78;
      border-color: #48bb78;
    }
    
    .custom-date-range {
      max-height: 0;
      overflow: hidden;
      transition: all 0.4s ease;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 8px;
    }
    
    .custom-date-range.expanded {
      max-height: 300px;
      padding: 16px;
      border: 1px solid #e2e8f0;
    }
    
    .date-range-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
    }
    
    .range-icon {
      font-size: 16px;
    }
    
    .date-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .date-input-wrapper {
      flex: 1;
    }
    
    .date-input-wrapper label {
      display: block;
      font-size: 12px;
      color: #718096;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .date-input-wrapper input[type="date"] {
      width: 100%;
      padding: 10px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 13px;
      transition: border-color 0.2s;
    }
    
    .date-input-wrapper input[type="date"]:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }
    
    .date-separator {
      color: #3182ce;
      font-weight: bold;
      margin-top: 20px;
    }
    
    .date-quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    .quick-btn {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
      color: #4a5568;
    }
    
    .quick-btn:hover {
      background: #3182ce;
      color: white;
      border-color: #3182ce;
    }
    
    .filter-note {
      color: #718096;
      font-size: 12px;
      text-align: center;
      padding: 20px 0;
    }
    
    .filter-actions {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .apply-filter-btn, .reset-filter-btn {
      padding: 12px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .apply-filter-btn {
      background-color: #48bb78;
      color: white;
    }
    
    .apply-filter-btn:hover {
      background-color: #38a169;
    }
    
    .reset-filter-btn {
      background-color: #edf2f7;
      color: #4a5568;
    }
    
    .reset-filter-btn:hover {
      background-color: #e2e8f0;
    }
    
    .filter-toggle-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-weight: 500;
    }
    
    .filter-toggle-btn:hover {
      background: #0056b3;
    }
    
    .dashboard-controls {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .period-label {
      font-size: 12px;
      color: #718096;
      background: #f7faff;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    
    /* Modern category breakdown styles */
    .category-breakdown-modern {
      margin-top: 24px;
    }
    
    .category-breakdown-modern h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .period-label-inline {
      font-size: 14px;
      background: #e6f7ff;
      color: #1890ff;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: normal;
    }
    
    .category-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .category-card {
      padding: 20px;
      border-radius: 12px;
      color: white;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .category-icon {
      font-size: 32px;
      width: 50px;
      text-align: center;
    }
    
    .category-info {
      flex: 1;
    }
    
    .category-name {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 4px;
    }
    
    .category-amount-modern {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .category-percentage {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .category-chart {
      width: 60px;
      height: 60px;
    }
    
    .circular-chart {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }
    
    .circle-bg,
    .circle {
      fill: none;
      stroke-width: 2.8;
    }
    
    .circle {
      stroke-dasharray: 0, 100;
      transition: stroke-dasharray 0.6s ease;
    }
    
    .percentage-text {
      fill: white;
      font-size: 10px;
      font-weight: bold;
      text-anchor: middle;
    }
    
    .category-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .summary-label {
      color: #718096;
      font-size: 14px;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: bold;
      color: #2d3748;
    }
  `;
  
  document.head.appendChild(styles);
}

/**
 * Render filter panel bên phải
 */
function renderFilterPanel() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return `
    <div class="filter-panel" id="filterPanel">
      <div class="filter-panel-header">
        <h3>🔧 Bộ Lọc Báo Cáo</h3>
        <button class="close-filter-btn" onclick="toggleFilterPanel()">×</button>
      </div>
      
      <div class="filter-section">
        <h4>📅 Chu Kỳ Báo Cáo</h4>
        <div class="period-selector">
          
          <!-- Tháng này -->
          <div class="period-option ${window.globalFilters.period === 'current_month' ? 'selected' : ''}" 
               onclick="selectPeriod('current_month')">
            <div class="period-icon">📈</div>
            <div class="period-content">
              <div class="period-title">Tháng này</div>
              <div class="period-subtitle">${currentMonth}/${currentYear}</div>
            </div>
            <div class="period-check ${window.globalFilters.period === 'current_month' ? 'active' : ''}">✓</div>
          </div>
          
          <!-- Tháng trước -->
          <div class="period-option ${window.globalFilters.period === 'last_month' ? 'selected' : ''}" 
               onclick="selectPeriod('last_month')">
            <div class="period-icon">📊</div>
            <div class="period-content">
              <div class="period-title">Tháng trước</div>
              <div class="period-subtitle">${lastMonth}/${lastMonthYear}</div>
            </div>
            <div class="period-check ${window.globalFilters.period === 'last_month' ? 'active' : ''}">✓</div>
          </div>
          
          <!-- Tùy chọn -->
          <div class="period-option ${window.globalFilters.period === 'custom' ? 'selected' : ''}" 
               onclick="selectPeriod('custom')">
            <div class="period-icon">🗓️</div>
            <div class="period-content">
              <div class="period-title">Tùy chọn</div>
              <div class="period-subtitle">Chọn khoảng thời gian</div>
            </div>
            <div class="period-check ${window.globalFilters.period === 'custom' ? 'active' : ''}">✓</div>
          </div>
          
          <!-- Custom date range -->
          <div class="custom-date-range ${window.globalFilters.period === 'custom' ? 'expanded' : ''}" id="customDateRange">
            <div class="date-range-header">
              <span class="range-icon">🎯</span>
              <span>Chọn khoảng thời gian</span>
            </div>
            
            <div class="date-inputs">
              <div class="date-input-wrapper">
                <label>🚀 Từ ngày</label>
                <input type="date" id="customStartDate" 
                       value="${window.globalFilters.customStartDate || ''}"
                       onchange="updateCustomDateRange()">
              </div>
              
              <div class="date-separator">→</div>
              
              <div class="date-input-wrapper">
                <label>🏁 Đến ngày</label>
                <input type="date" id="customEndDate"
                       value="${window.globalFilters.customEndDate || ''}"
                       onchange="updateCustomDateRange()">
              </div>
            </div>
            
            <div class="date-quick-actions">
              <button onclick="setQuickRange('this_week')" class="quick-btn">Tuần này</button>
              <button onclick="setQuickRange('last_week')" class="quick-btn">Tuần trước</button>
              <button onclick="setQuickRange('last_7_days')" class="quick-btn">7 ngày qua</button>
              <button onclick="setQuickRange('last_30_days')" class="quick-btn">30 ngày qua</button>
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- Các bộ lọc khác có thể thêm vào đây -->
      <div class="filter-section">
        <h4>🎯 Bộ Lọc Khác</h4>
        <div class="filter-note">
          <em>Các bộ lọc khác sẽ được thêm vào sau...</em>
        </div>
      </div>
      
      <div class="filter-actions">
        <button class="apply-filter-btn" onclick="applyFilters()">
          ✅ Áp Dụng Bộ Lọc
        </button>
        <button class="reset-filter-btn" onclick="resetFilters()">
          🔄 Đặt Lại
        </button>
      </div>
    </div>
  `;
}

/**
 * Lọc dữ liệu theo khoảng thời gian
 */
export function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  // Đặt startDate về đầu ngày (00:00:00) để bao gồm cả ngày đầu tiên
  startDate.setHours(0, 0, 0, 0);
  // Đặt endDate về cuối ngày (23:59:59) để bao gồm cả ngày cuối cùng
  endDate.setHours(23, 59, 59, 999);
  
  console.log("🔍 Filter date range:", {
    original: dateRange,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  
  const filteredData = data.filter((item, index) => {
    // Sử dụng đúng field names: transactionDate cho transactions, date cho expenses
    const dateValue = item.transactionDate || item.date;
    
    if (!dateValue) {
      return false;
    }
    
    // Xử lý cả format yyyy/mm/dd và ISO format
    let itemDate;
    if (typeof dateValue === 'string') {
      if (dateValue.includes('/')) {
        // Format yyyy/mm/dd
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          itemDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          // Đặt thời gian về đầu ngày để so sánh chính xác
          itemDate.setHours(0, 0, 0, 0);
        }
      } else if (dateValue.includes('T') || dateValue.includes('-')) {
        // ISO format hoặc yyyy-mm-dd
        itemDate = new Date(dateValue);
      }
    } else {
      itemDate = new Date(dateValue);
    }
    
    if (!itemDate || isNaN(itemDate.getTime())) {
      return false;
    }
    
    // Debug cho một vài items đầu tiên
    if (index < 3) {
      console.log("🔍 Checking item date:", {
        originalValue: dateValue,
        itemDate: itemDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        inRange: itemDate >= startDate && itemDate <= endDate
      });
    }
    
    const inRange = itemDate >= startDate && itemDate <= endDate;
    
    
    return inRange;
  });
  
  
  return filteredData;
}

/**
 * Toggle hiển thị filter panel
 */
window.toggleFilterPanel = function() {
  const panel = document.getElementById('filterPanel');
  if (panel) {
    panel.classList.toggle('open');
  }
}

/**
 * Chọn period với giao diện mới
 */
window.selectPeriod = function(period) {
  // Update global filter
  window.globalFilters.period = period;
  
  // Save to localStorage
  saveFiltersToStorage();
  
  // Update UI
  document.querySelectorAll('.period-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  document.querySelectorAll('.period-check').forEach(check => {
    check.classList.remove('active');
  });
  
  // Activate selected option
  const selectedOption = document.querySelector(`.period-option[onclick*="${period}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
    const check = selectedOption.querySelector('.period-check');
    if (check) check.classList.add('active');
  }
  
  // Handle custom date range visibility
  const customDateRange = document.getElementById('customDateRange');
  if (customDateRange) {
    if (period === 'custom') {
      customDateRange.classList.add('expanded');
    } else {
      customDateRange.classList.remove('expanded');
    }
  }
  
  // Calculate date range automatically for predefined periods
  updatePeriodFilter(period);
}

/**
 * Cập nhật bộ lọc chu kỳ (logic cũ)
 */
window.updatePeriodFilter = function(period) {
  window.globalFilters.period = period;
  
  const customDateRange = document.getElementById('customDateRange');
  if (customDateRange) {
    customDateRange.style.display = period === 'custom' ? 'block' : 'none';
  }
  
  // Clear custom dates when switching to preset periods
  if (period !== 'custom') {
    window.globalFilters.customStartDate = null;
    window.globalFilters.customEndDate = null;
  }
  
  // Tự động tính toán dateRange cho current_month và last_month
  if (period === 'current_month') {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    window.globalFilters.dateRange = {
      start: normalizeDate(firstDay), // Dùng normalizeDate để có format yyyy/mm/dd
      end: normalizeDate(lastDay)
    };
  } else if (period === 'last_month') {
    const now = new Date();
    // Tháng trước thực tế
    const lastMonth = now.getMonth() - 1;
    const lastMonthYear = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const actualLastMonth = lastMonth < 0 ? 11 : lastMonth;
    
    const firstDay = new Date(lastMonthYear, actualLastMonth, 1);
    const lastDay = new Date(lastMonthYear, actualLastMonth + 1, 0);
    
    window.globalFilters.dateRange = {
      start: normalizeDate(firstDay), // Dùng normalizeDate để có format yyyy/mm/dd
      end: normalizeDate(lastDay)
    };
    
  }
  
  // Save to localStorage
  saveFiltersToStorage();
  
  console.log('📅 Đã cập nhật period filter:', {
    period: period,
    dateRange: window.globalFilters.dateRange
  });
}

/**
 * Cập nhật khoảng thời gian tùy chọn
 */
window.updateCustomDateRange = function() {
  const startInput = document.getElementById('customStartDate');
  const endInput = document.getElementById('customEndDate');
  
  if (startInput && endInput) {
    window.globalFilters.customStartDate = startInput.value;
    window.globalFilters.customEndDate = endInput.value;
    
    if (startInput.value && endInput.value) {
      // Convert từ yyyy-mm-dd sang yyyy/mm/dd
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);
      window.globalFilters.dateRange = {
        start: normalizeDate(startDate),
        end: normalizeDate(endDate)
      };
    }
  }
}

/**
 * Áp dụng bộ lọc và refresh dashboard
 */
window.applyFilters = function() {
  console.log('🔄 Áp dụng bộ lọc...', window.globalFilters);
  
  // Trigger refresh của toàn bộ statistics UI
  if (window.statisticsUIControllerActive && window.refreshStatisticsWithFilters) {
    window.refreshStatisticsWithFilters(window.globalFilters);
  } else {
    // Fallback: reload statistics
    if (window.loadStatisticsData) {
      window.loadStatisticsData();
    }
  }
  
  // Đóng filter panel sau khi áp dụng
  toggleFilterPanel();
}

/**
 * Reset tất cả bộ lọc về mặc định
 */
window.resetFilters = function() {
  window.globalFilters = {
    dateRange: null,
    period: 'current_month',
    customStartDate: null,
    customEndDate: null
  };
  
  // Reset UI
  const currentMonthRadio = document.querySelector('input[value="current_month"]');
  if (currentMonthRadio) {
    currentMonthRadio.checked = true;
  }
  
  const customDateRange = document.getElementById('customDateRange');
  if (customDateRange) {
    customDateRange.style.display = 'none';
  }
  
  // Reset custom date inputs
  const startInput = document.getElementById('customStartDate');
  const endInput = document.getElementById('customEndDate');
  if (startInput) startInput.value = '';
  if (endInput) endInput.value = '';
  
  console.log('🔄 Đã reset bộ lọc');
  
  // Áp dụng ngay sau khi reset
  applyFilters();
}

/**
 * Set quick date ranges
 */
window.setQuickRange = function(range) {
  const now = new Date();
  let startDate, endDate;
  
  switch(range) {
    case 'this_week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startDate = startOfWeek;
      endDate = new Date(now);
      break;
      
    case 'last_week':
      const lastWeekEnd = new Date(now);
      lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;
      
    case 'last_7_days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      endDate = new Date(now);
      break;
      
    case 'last_30_days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      endDate = new Date(now);
      break;
  }
  
  // Format dates for input fields
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // Update input fields
  const startInput = document.getElementById('customStartDate');
  const endInput = document.getElementById('customEndDate');
  
  if (startInput) startInput.value = startDateStr;
  if (endInput) endInput.value = endDateStr;
  
  // Update global filters
  window.globalFilters.customStartDate = startDateStr;
  window.globalFilters.customEndDate = endDateStr;
  window.globalFilters.dateRange = {
    start: normalizeDate(startDate), // Convert sang yyyy/mm/dd
    end: normalizeDate(endDate)
  };
  
  console.log('📅 Quick range set:', range, {
    start: startDateStr,
    end: endDateStr
  });
}