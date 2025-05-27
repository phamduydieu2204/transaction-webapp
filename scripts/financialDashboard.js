/**
 * financialDashboard.js
 * 
 * Dashboard Tài Chính Tổng Quan
 * Hiển thị tình hình tài chính real-time với alerts và forecasts
 */

import { normalizeDate, formatCurrency, getDateRange } from './statisticsCore.js';

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
    showForecast = true
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Dashboard container #${containerId} not found`);
    return;
  }

  console.log("💰 Rendering Financial Dashboard với dữ liệu:", {
    transactions: transactionData.length,
    expenses: expenseData.length
  });

  // Calculate all metrics
  const metrics = calculateFinancialMetrics(transactionData, expenseData);
  const alerts = generateAlerts(transactionData, expenseData, metrics);
  const forecast = generateForecast(transactionData, expenseData);

  // Render dashboard HTML
  const dashboardHTML = `
    <div class="financial-dashboard">
      <div class="dashboard-header">
        <h2>💰 Dashboard Tài Chính Tổng Quan</h2>
        <div class="last-updated">Cập nhật: ${new Date().toLocaleString('vi-VN')}</div>
      </div>
      
      ${renderOverviewCards(metrics)}
      ${renderCashFlowTracker(metrics)}
      ${renderCategoryBreakdown(metrics)}
      ${showAlerts ? renderAlertSystem(alerts) : ''}
      ${showForecast ? renderQuickForecast(forecast) : ''}
    </div>
  `;

  container.innerHTML = dashboardHTML;
  
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
  return `
    <div class="overview-cards">
      <div class="overview-card revenue-card">
        <div class="card-header">
          <h3>📈 Doanh Thu</h3>
          <div class="period-tabs">
            <button class="period-tab active" data-period="today">Hôm nay</button>
            <button class="period-tab" data-period="month">Tháng</button>
            <button class="period-tab" data-period="quarter">Quý</button>
            <button class="period-tab" data-period="year">Năm</button>
          </div>
        </div>
        <div class="card-content">
          <div class="main-amount revenue-amount" data-period="today">
            ${formatCurrency(metrics.today.revenue.total, "VND")}
          </div>
          <div class="main-amount revenue-amount hidden" data-period="month">
            ${formatCurrency(metrics.month.revenue.total, "VND")}
          </div>
          <div class="main-amount revenue-amount hidden" data-period="quarter">
            ${formatCurrency(metrics.quarter.revenue.total, "VND")}
          </div>
          <div class="main-amount revenue-amount hidden" data-period="year">
            ${formatCurrency(metrics.year.revenue.total, "VND")}
          </div>
          <div class="sub-info">
            <div>Top phần mềm: ${getTopSoftware(metrics.today.revenue.bySoftware)}</div>
          </div>
        </div>
      </div>

      <div class="overview-card expense-card">
        <div class="card-header">
          <h3>💸 Chi Phí</h3>
          <div class="period-tabs">
            <button class="period-tab active" data-period="today">Hôm nay</button>
            <button class="period-tab" data-period="month">Tháng</button>
            <button class="period-tab" data-period="quarter">Quý</button>
            <button class="period-tab" data-period="year">Năm</button>
          </div>
        </div>
        <div class="card-content">
          <div class="main-amount expense-amount" data-period="today">
            ${formatCurrency(metrics.today.expenses.total, "VND")}
          </div>
          <div class="main-amount expense-amount hidden" data-period="month">
            ${formatCurrency(metrics.month.expenses.total, "VND")}
          </div>
          <div class="main-amount expense-amount hidden" data-period="quarter">
            ${formatCurrency(metrics.quarter.expenses.total, "VND")}
          </div>
          <div class="main-amount expense-amount hidden" data-period="year">
            ${formatCurrency(metrics.year.expenses.total, "VND")}
          </div>
          <div class="sub-info">
            <div>Kinh doanh: ${formatCurrency(metrics.today.expenses["Kinh doanh phần mềm"], "VND")}</div>
            <div>Cá nhân: ${formatCurrency(metrics.today.expenses["Sinh hoạt cá nhân"], "VND")}</div>
          </div>
        </div>
      </div>

      <div class="overview-card profit-card ${metrics.today.profit >= 0 ? 'positive' : 'negative'}">
        <div class="card-header">
          <h3>💰 Lợi Nhuận</h3>
          <div class="period-tabs">
            <button class="period-tab active" data-period="today">Hôm nay</button>
            <button class="period-tab" data-period="month">Tháng</button>
            <button class="period-tab" data-period="quarter">Quý</button>
            <button class="period-tab" data-period="year">Năm</button>
          </div>
        </div>
        <div class="card-content">
          <div class="main-amount profit-amount" data-period="today">
            ${formatCurrency(metrics.today.profit, "VND")}
          </div>
          <div class="main-amount profit-amount hidden" data-period="month">
            ${formatCurrency(metrics.month.profit, "VND")}
          </div>
          <div class="main-amount profit-amount hidden" data-period="quarter">
            ${formatCurrency(metrics.quarter.profit, "VND")}
          </div>
          <div class="main-amount profit-amount hidden" data-period="year">
            ${formatCurrency(metrics.year.profit, "VND")}
          </div>
          <div class="sub-info">
            <div>Margin: ${metrics.today.margin.toFixed(1)}%</div>
            <div>${metrics.today.profit >= 0 ? '📈 Lãi' : '📉 Lỗ'}</div>
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
  // Period tab switching
  document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const period = e.target.dataset.period;
      const card = e.target.closest('.overview-card');
      
      // Update active tab
      card.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      // Show corresponding amount
      card.querySelectorAll('.main-amount').forEach(amount => {
        if (amount.dataset.period === period) {
          amount.classList.remove('hidden');
        } else {
          amount.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Adds CSS styles for financial dashboard
 */
export function addFinancialDashboardStyles() {
  if (document.getElementById('financial-dashboard-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'financial-dashboard-styles';
  styles.textContent = `
    .financial-dashboard {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      margin: 20px 0;
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
    
    .period-tabs {
      display: flex;
      gap: 5px;
    }
    
    .period-tab {
      padding: 4px 8px;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .period-tab.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
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
    }
  `;
  
  document.head.appendChild(styles);
}