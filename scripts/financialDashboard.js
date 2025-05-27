/**
 * financialDashboard.js
 * 
 * Dashboard Tài Chính Tổng Quan
 * Hiển thị tình hình tài chính real-time với alerts và forecasts
 */

import { normalizeDate, formatCurrency, getDateRange } from './statisticsCore.js';

// Global state cho filter panel
window.globalFilters = {
  dateRange: null,
  period: 'current_month', // current_month, last_month, custom
  customStartDate: null,
  customEndDate: null
};

/**
 * Renders the comprehensive financial dashboard
 * @param {Array} transactionData - Transaction records from GiaoDich sheet
 * @param {Array} expenseData - Expense records from ChiPhi sheet  
 * @param {Object} options - Dashboard options
 */
export function renderFinancialDashboard(transactionData, expenseData, options = {}) {
  const {
    containerId = "financialDashboard",
    showAlerts = true,
    showForecast = true,
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
  const metrics = calculateFinancialMetrics(filteredTransactionData, filteredExpenseData);
  const alerts = generateAlerts(filteredTransactionData, filteredExpenseData, metrics);
  const forecast = generateForecast(filteredTransactionData, filteredExpenseData);

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
        
        ${renderOverviewCards(metrics)}
        ${renderCashFlowTracker(metrics)}
        ${renderCategoryBreakdown(metrics)}
        ${showAlerts ? renderAlertSystem(alerts) : ''}
        ${showForecast ? renderQuickForecast(forecast) : ''}
      </div>
    </div>
  `;

  container.innerHTML = dashboardHTML;
  
  // Initialize default filters if not set
  if (!window.globalFilters.dateRange) {
    window.updatePeriodFilter('current_month');
  }
  
  // Add interactive features
  addDashboardInteractivity();
  
  console.log("✅ Financial Dashboard rendered successfully");
}

/**
 * Calculates comprehensive financial metrics
 */
function calculateFinancialMetrics(transactionData, expenseData) {
  const today = new Date();
  const todayStr = normalizeDate(today);
  const thisMonth = getDateRange("month");
  const thisQuarter = getDateRange("quarter");
  const thisYear = getDateRange("year");

  console.log("🧮 Calculating financial metrics...");

  // Revenue calculations
  const revenueToday = calculateRevenue(transactionData, todayStr, todayStr);
  const revenueMonth = calculateRevenue(transactionData, thisMonth.start, thisMonth.end);
  const revenueQuarter = calculateRevenue(transactionData, thisQuarter.start, thisQuarter.end);
  const revenueYear = calculateRevenue(transactionData, thisYear.start, thisYear.end);

  // Expense calculations by category
  const expensesToday = calculateExpensesByCategory(expenseData, todayStr, todayStr);
  const expensesMonth = calculateExpensesByCategory(expenseData, thisMonth.start, thisMonth.end);
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
function calculateRevenue(transactionData, startDate, endDate) {
  const revenue = {
    total: 0,
    byType: {},
    bySoftware: {},
    byEmployee: {}
  };

  transactionData.forEach(transaction => {
    const transactionDate = normalizeDate(transaction.transactionDate || transaction.date);
    
    if (transactionDate >= startDate && transactionDate <= endDate) {
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

  return revenue;
}

/**
 * Calculates expenses by category within date range
 */
function calculateExpensesByCategory(expenseData, startDate, endDate) {
  const expenses = {
    total: 0,
    "Sinh hoạt cá nhân": 0,
    "Kinh doanh phần mềm": 0, 
    "Kinh doanh Amazon": 0,
    "Khác": 0,
    bySubCategory: {},
    byEmployee: {}
  };

  expenseData.forEach(expense => {
    const expenseDate = normalizeDate(expense.date);
    
    if (expenseDate >= startDate && expenseDate <= endDate) {
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

  return expenses;
}

/**
 * Renders overview cards with key metrics
 */
function renderOverviewCards(metrics) {
  // Get current period label from global filters
  const getPeriodLabel = () => {
    if (!window.globalFilters) return "Tháng này";
    
    switch (window.globalFilters.period) {
      case 'current_month':
        const currentDate = new Date();
        return `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
      case 'last_month':
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        return `Tháng ${lastMonthDate.getMonth() + 1}/${lastMonthDate.getFullYear()}`;
      case 'custom':
        if (window.globalFilters.dateRange && window.globalFilters.dateRange.start && window.globalFilters.dateRange.end) {
          return `${window.globalFilters.dateRange.start} đến ${window.globalFilters.dateRange.end}`;
        }
        return "Khoảng thời gian tùy chọn";
      default:
        return "Tháng này";
    }
  };

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
  
  return `
    <div class="category-breakdown">
      <h3>📊 Chi Phí Theo Danh Mục (Tháng Này)</h3>
      <div class="category-bars">
        <div class="category-bar">
          <div class="category-label">Kinh doanh phần mềm</div>
          <div class="category-progress">
            <div class="progress-bar software" style="width: ${total > 0 ? (metrics.month.expenses['Kinh doanh phần mềm'] / total) * 100 : 0}%"></div>
          </div>
          <div class="category-amount">${formatCurrency(metrics.month.expenses['Kinh doanh phần mềm'], "VND")}</div>
        </div>
        <div class="category-bar">
          <div class="category-label">Sinh hoạt cá nhân</div>
          <div class="category-progress">
            <div class="progress-bar personal" style="width: ${total > 0 ? (metrics.month.expenses['Sinh hoạt cá nhân'] / total) * 100 : 0}%"></div>
          </div>
          <div class="category-amount">${formatCurrency(metrics.month.expenses['Sinh hoạt cá nhân'], "VND")}</div>
        </div>
        <div class="category-bar">
          <div class="category-label">Kinh doanh Amazon</div>
          <div class="category-progress">
            <div class="progress-bar amazon" style="width: ${total > 0 ? (metrics.month.expenses['Kinh doanh Amazon'] / total) * 100 : 0}%"></div>
          </div>
          <div class="category-amount">${formatCurrency(metrics.month.expenses['Kinh doanh Amazon'], "VND")}</div>
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
    
    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .filter-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    
    .filter-option:hover {
      background-color: #f8f9fa;
    }
    
    .filter-option input[type="radio"] {
      margin: 0;
    }
    
    .filter-option span {
      font-size: 14px;
      color: #4a5568;
    }
    
    .custom-date-range {
      margin-top: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .date-input-group {
      margin-bottom: 10px;
    }
    
    .date-input-group:last-child {
      margin-bottom: 0;
    }
    
    .date-input-group label {
      display: block;
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .date-input-group input[type="date"] {
      width: 100%;
      padding: 8px;
      border: 1px solid #cbd5e0;
      border-radius: 4px;
      font-size: 14px;
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
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    
    .filter-toggle-btn:hover {
      background: #0056b3;
    }
    
    .dashboard-controls {
      display: flex;
      align-items: center;
      gap: 15px;
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
        <div class="filter-options">
          <label class="filter-option">
            <input type="radio" name="period" value="current_month" 
                   ${window.globalFilters.period === 'current_month' ? 'checked' : ''}
                   onchange="updatePeriodFilter('current_month')">
            <span>Tháng này (${currentMonth}/${currentYear})</span>
          </label>
          
          <label class="filter-option">
            <input type="radio" name="period" value="last_month"
                   ${window.globalFilters.period === 'last_month' ? 'checked' : ''}
                   onchange="updatePeriodFilter('last_month')">
            <span>Tháng trước (${lastMonth}/${lastMonthYear})</span>
          </label>
          
          <label class="filter-option">
            <input type="radio" name="period" value="custom"
                   ${window.globalFilters.period === 'custom' ? 'checked' : ''}
                   onchange="updatePeriodFilter('custom')">
            <span>Tùy chọn</span>
          </label>
          
          <div class="custom-date-range" id="customDateRange" 
               style="display: ${window.globalFilters.period === 'custom' ? 'block' : 'none'}">
            <div class="date-input-group">
              <label>Từ ngày:</label>
              <input type="date" id="customStartDate" 
                     value="${window.globalFilters.customStartDate || ''}"
                     onchange="updateCustomDateRange()">
            </div>
            <div class="date-input-group">
              <label>Đến ngày:</label>
              <input type="date" id="customEndDate"
                     value="${window.globalFilters.customEndDate || ''}"
                     onchange="updateCustomDateRange()">
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
function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return data.filter(item => {
    const itemDate = new Date(normalizeDate(item.ngayGiaoDich || item.ngayChiPhi || item.date));
    return itemDate >= startDate && itemDate <= endDate;
  });
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
 * Cập nhật bộ lọc chu kỳ
 */
window.updatePeriodFilter = function(period) {
  window.globalFilters.period = period;
  
  const customDateRange = document.getElementById('customDateRange');
  if (customDateRange) {
    customDateRange.style.display = period === 'custom' ? 'block' : 'none';
  }
  
  // Tự động tính toán dateRange cho current_month và last_month
  if (period === 'current_month') {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    window.globalFilters.dateRange = {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  } else if (period === 'last_month') {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    window.globalFilters.dateRange = {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  }
  
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
      window.globalFilters.dateRange = {
        start: startInput.value,
        end: endInput.value
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