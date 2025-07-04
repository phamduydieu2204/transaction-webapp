/**
 * expenseAnalysis.js
 * 
 * Expense Analysis functionality - Phân tích chi phí chi tiết
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
  normalizeTransaction 
} from '../../core/dataMapping.js';

/**
 * Load expense analysis report
 * @param {Object} options - Options for loading report
 * @param {Object} options.dateRange - Date range filter {start: 'yyyy/mm/dd', end: 'yyyy/mm/dd'}
 * @param {string} options.period - Period name (e.g., 'this_month', 'last_month')
 */
export async function loadExpenseAnalysis(options = {}) {
// console.log('💸 Loading expense analysis with options:', options);
  
  try {
    // Load template
    await loadExpenseAnalysisHTML();
    
    // Ensure data is loaded
    await ensureDataIsLoaded();
    
    // Get data
    const transactions = window.transactionList || getFromStorage('transactions') || [];
    const expenses = window.expenseList || getFromStorage('expenses') || [];
    
// console.log('💸 Expense analysis data:', {
      transactions: transactions.length,
      expenses: expenses.length
    });
    
    // Get date range from options or global filters
    const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
    const period = options.period || window.globalFilters?.period || 'this_month';
    
    // Filter data by date range
    const filteredExpenses = filterDataByDateRange(expenses, dateRange);
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    
    // Load all components
    await Promise.all([
      updateExpenseKPIs(filteredExpenses, filteredTransactions, period),
      renderExpenseTrendChart(filteredExpenses, period),
      renderExpenseCategoryChart(filteredExpenses),
      renderBudgetComparisonChart(filteredExpenses),
      loadTopExpenseCategories(filteredExpenses),
      loadExpenseTypes(filteredExpenses),
      updateExpenseControlDashboard(filteredExpenses, filteredTransactions)
    ]);
    
    // Setup event handlers
    setupExpenseAnalysisHandlers();
    
    // console.log('✅ Expense analysis loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading expense analysis:', error);
    showError('Không thể tải phân tích chi phí');
  }
}

/**
 * Load the expense analysis HTML template
 */
async function loadExpenseAnalysisHTML() {
  const container = document.getElementById('report-expense');
  if (!container) return;
  
  try {
    const response = await fetch('./partials/tabs/report-pages/expense-analysis.html');
    if (!response.ok) {
      throw new Error('Template not found');
    }
    
    const html = await response.text();
    container.innerHTML = html;
    container.classList.add('active');
    
    // console.log('✅ Expense analysis template loaded');
    
  } catch (error) {
    console.error('❌ Could not load expense analysis template:', error);
    throw error;
  }
}

/**
 * Update expense KPI cards
 */
async function updateExpenseKPIs(expenses, transactions, period) {
  // console.log('💰 Updating expense KPIs');
  
  // Calculate current period metrics
  const currentMetrics = calculateExpenseMetrics(expenses);
  const revenueMetrics = calculateRevenueMetrics(transactions);
  
  // Calculate previous period for comparison
  const previousExpenses = getPreviousPeriodExpenses(expenses, period);
  const previousMetrics = calculateExpenseMetrics(previousExpenses);
  
  // Update KPI values
  updateKPIElement('total-expense-value', formatRevenue(currentMetrics.totalExpense));
  updateKPIElement('avg-expense-value', formatRevenue(currentMetrics.avgExpenseValue));
  updateKPIElement('largest-expense', formatRevenue(currentMetrics.largestExpense.amount));
  
  // Calculate expense ratio
  const expenseRatio = revenueMetrics.totalRevenue > 0 ? 
    (currentMetrics.totalExpense / revenueMetrics.totalRevenue) * 100 : 0;
  updateKPIElement('expense-ratio-value', `${expenseRatio.toFixed(1)}%`);
  
  // Calculate and update changes
  const expenseChange = calculatePercentageChange(
    previousMetrics.totalExpense, 
    currentMetrics.totalExpense
  );
  const avgChange = calculatePercentageChange(
    previousMetrics.avgExpenseValue, 
    currentMetrics.avgExpenseValue
  );
  
  updateChangeElement('total-expense-change', expenseChange);
  updateChangeElement('avg-expense-change', avgChange);
  
  // Update largest expense details
  if (currentMetrics.largestExpense.description) {
    updateKPIElement('largest-expense-detail', 
      `${currentMetrics.largestExpense.category || 'N/A'} - ${currentMetrics.largestExpense.description}`);
  }
  
  // console.log('💰 Expense KPIs updated:', currentMetrics);
}

/**
 * Calculate expense metrics from expenses
 */
function calculateExpenseMetrics(expenses) {
  let totalExpense = 0;
  let largestExpense = { amount: 0, category: '', description: '' };
  
  expenses.forEach(expense => {
    const amount = parseFloat(expense.soTien || expense.amount || 0);
    totalExpense += amount;
    
    if (amount > largestExpense.amount) {
      largestExpense = {
        amount: amount,
        category: expense.danhMuc || expense.category || 'N/A',
        description: expense.moTa || expense.description || 'N/A'
      };
    }
  });
  
  const avgExpenseValue = expenses.length > 0 ? totalExpense / expenses.length : 0;
  
  return {
    totalExpense,
    avgExpenseValue,
    expenseCount: expenses.length,
    largestExpense
  };
}

/**
 * Calculate revenue metrics for comparison
 */
function calculateRevenueMetrics(transactions) {
  let totalRevenue = 0;
  
  transactions.forEach(rawTransaction => {
    const t = normalizeTransaction(rawTransaction);
    if (!t) return;
    
    const amount = t.revenue || 0;
    totalRevenue += amount;
  });
  
  return { totalRevenue };
}

/**
 * Render expense trend chart
 */
async function renderExpenseTrendChart(expenses, period) {
  // console.log('📈 Rendering expense trend chart');
  
  const canvas = document.getElementById('expense-trend-chart');
  if (!canvas) return;
  
  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }
  
  const ctx = canvas.getContext('2d');
  
  // Prepare trend data based on period
  const trendData = prepareExpenseTrendData(expenses, period);
  
  // Destroy existing chart
  if (window.expenseTrendChart) {
    window.expenseTrendChart.destroy();
  }
  
  // Create new chart
  window.expenseTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [{
        label: 'Chi phí',
        data: trendData.values,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ef4444',
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
          borderColor: '#ef4444',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Chi phí: ${formatRevenue(context.parsed.y)}`;
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
 * Render expense category chart (pie/bar)
 */
async function renderExpenseCategoryChart(expenses) {
// console.log('🍰 Rendering expense category chart');
  
  const canvas = document.getElementById('expense-category-chart');
  if (!canvas) return;
  
  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }
  
  const ctx = canvas.getContext('2d');
  
  // Calculate expense by category
  const categoryData = calculateExpenseByCategory(expenses);
  
  // Destroy existing chart
  if (window.expenseCategoryChart) {
    window.expenseCategoryChart.destroy();
  }
  
  // Create pie chart
  window.expenseCategoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.labels,
      datasets: [{
        data: categoryData.values,
        backgroundColor: [
          '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
          '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
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
 * Render budget comparison chart
 */
async function renderBudgetComparisonChart(expenses) {
  // console.log('📊 Rendering budget comparison chart');
  
  const canvas = document.getElementById('budget-comparison-chart');
  if (!canvas) return;
  
  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }
  
  const ctx = canvas.getContext('2d');
  
  // Calculate budget vs actual data
  const budgetData = calculateBudgetVsActual(expenses);
  
  // Destroy existing chart
  if (window.budgetComparisonChart) {
    window.budgetComparisonChart.destroy();
  }
  
  // Create comparison chart
  window.budgetComparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: budgetData.labels,
      datasets: [
        {
          label: 'Ngân sách',
          data: budgetData.budget,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3b82f6',
          borderWidth: 1
        },
        {
          label: 'Thực tế',
          data: budgetData.actual,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: '#ef4444',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatRevenue(context.parsed.y)}`;
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
          }
        }
      }
    }
  });
}

/**
 * Load top expense categories
 */
async function loadTopExpenseCategories(expenses) {
  // console.log('📋 Loading top expense categories');
  
  const categoryExpenses = calculateCategoryExpenses(expenses);
  const topCategories = categoryExpenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  
  const tbody = document.getElementById('categories-expense-tbody');
  if (!tbody) return;
  
  if (topCategories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-data">Không có dữ liệu danh mục chi phí</td>
      </tr>
    `;
    return;
  }
  
  const totalExpense = categoryExpenses.reduce((sum, c) => sum + c.amount, 0);
  
  tbody.innerHTML = topCategories.map((category, index) => {
    const percentage = totalExpense > 0 ? ((category.amount / totalExpense) * 100).toFixed(1) : 0;
    const trend = calculateCategoryTrend(category.name, expenses);
    
    return `
      <tr>
        <td class="rank-col">${index + 1}</td>
        <td class="category-col">
          <div class="category-info">
            <span class="category-name">${category.name}</span>
            <small class="category-type">${category.type || 'Chi phí'}</small>
          </div>
        </td>
        <td class="count-col">${category.count}</td>
        <td class="amount-col">${formatRevenue(category.amount)}</td>
        <td class="avg-col">${formatRevenue(category.avgAmount)}</td>
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
 * Load expense types (recurring vs one-time)
 */
async function loadExpenseTypes(expenses) {
  // console.log('🔄 Loading expense types');
  
  const expenseTypes = analyzeExpenseTypes(expenses);
  
  const tbody = document.getElementById('expense-types-tbody');
  if (!tbody) return;
  
  if (expenseTypes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">Không có dữ liệu loại chi phí</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = expenseTypes.map(expense => {
    const typeClass = expense.isRecurring ? 'recurring' : 'onetime';
    const typeIcon = expense.isRecurring ? 'fa-repeat' : 'fa-clock';
    
    return `
      <tr class="${typeClass}">
        <td class="type-col">
          <div class="type-indicator ${typeClass}">
            <i class="fas ${typeIcon}"></i>
            ${expense.isRecurring ? 'Định kỳ' : 'Một lần'}
          </div>
        </td>
        <td class="description-col">${expense.description}</td>
        <td class="frequency-col">${expense.frequency}</td>
        <td class="amount-col">${formatRevenue(expense.amount)}</td>
        <td class="next-col">${expense.nextDate || 'N/A'}</td>
        <td class="action-col">
          <button class="action-btn" onclick="editExpense('${expense.id}')">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update expense control dashboard
 */
async function updateExpenseControlDashboard(expenses, transactions) {
  // console.log('🛡️ Updating expense control dashboard');
  
  // Update budget alerts
  const budgetAlerts = generateBudgetAlerts(expenses);
  updateBudgetAlerts(budgetAlerts);
  
  // Update optimization suggestions
  const optimizationSuggestions = generateOptimizationSuggestions(expenses);
  updateOptimizationSuggestions(optimizationSuggestions);
  
  // Update expense forecast
  const forecast = calculateExpenseForecast(expenses);
  updateExpenseForecast(forecast);
  
  // Update expense insights
  const insights = generateExpenseInsights(expenses, transactions);
  updateExpenseInsights(insights);
}

/**
 * Setup event handlers for expense analysis
 */
function setupExpenseAnalysisHandlers() {
  // Period selector buttons
  const periodBtns = document.querySelectorAll('.period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      periodBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const period = e.target.dataset.period;
      refreshExpenseChart(period);
    });
  });
  
  // View selector buttons
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.chart-container, .table-container');
      const viewBtns = container.querySelectorAll('.view-btn');
      
      viewBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const view = e.target.dataset.view;
      if (container.classList.contains('budget-vs-actual')) {
        refreshBudgetChart(view);
      } else {
        refreshExpenseTable(view);
      }
    });
  });
  
  // Filter selector buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.table-container');
      const filterBtns = container.querySelectorAll('.filter-btn');
      
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.dataset.filter;
      filterExpenseTypes(filter);
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
    element.className = `kpi-change ${isPositive ? 'negative' : 'positive'}`; // For expenses, less is better
  }
}

function calculatePercentageChange(previous, current) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) return data;
  
  return data.filter(item => {
    const itemDate = normalizeDate(item.ngayTao || item.date || item.transactionDate);
    if (!itemDate) return false;
    
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}

// Additional helper functions for data processing
function prepareExpenseTrendData(expenses, period) {
  // Implementation for expense trend data preparation
  return {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    values: [50000, 75000, 60000, 90000] // Placeholder data
  };
}

function calculateExpenseByCategory(expenses) {
  const categories = {};
  
  expenses.forEach(expense => {
    const category = expense.danhMuc || expense.category || 'Khác';
    const amount = parseFloat(expense.soTien || expense.amount || 0);
    
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += amount;
  });
  
  return {
    labels: Object.keys(categories),
    values: Object.values(categories)
  };
}

function calculateBudgetVsActual(expenses) {
  // Placeholder implementation for budget comparison
  const categories = ['Marketing', 'IT', 'Văn phòng', 'Nhân sự', 'Khác'];
  return {
    labels: categories,
    budget: [5000000, 3000000, 2000000, 8000000, 1000000],
    actual: [4500000, 3500000, 1800000, 7500000, 1200000]
  };
}

function calculateCategoryExpenses(expenses) {
  const categories = {};
  
  expenses.forEach(expense => {
    const categoryName = expense.danhMuc || expense.category || 'Không xác định';
    const amount = parseFloat(expense.soTien || expense.amount || 0);
    
    if (!categories[categoryName]) {
      categories[categoryName] = {
        name: categoryName,
        amount: 0,
        count: 0,
        type: 'Chi phí'
      };
    }
    
    categories[categoryName].amount += amount;
    categories[categoryName].count++;
  });
  
  return Object.values(categories).map(category => ({
    ...category,
    avgAmount: category.count > 0 ? category.amount / category.count : 0
  }));
}

function analyzeExpenseTypes(expenses) {
  // Placeholder implementation for expense type analysis
  return expenses.slice(0, 10).map((expense, index) => ({
    id: `expense-${index}`,
    description: expense.moTa || expense.description || 'Chi phí không xác định',
    amount: parseFloat(expense.soTien || expense.amount || 0),
    isRecurring: Math.random() > 0.5, // Placeholder logic
    frequency: Math.random() > 0.5 ? 'Hàng tháng' : 'Một lần',
    nextDate: Math.random() > 0.5 ? '15/01/2025' : null
  }));
}

function calculateCategoryTrend(categoryName, expenses) {
  // Placeholder implementation for category trend calculation
  return { type: 'down', icon: 'arrow-down', value: '-8' };
}

function generateBudgetAlerts(expenses) {
  return [
    {
      type: 'warning',
      title: 'Vượt ngân sách Marketing',
      description: 'Chi phí marketing đã vượt 85% ngân sách tháng này'
    }
  ];
}

function generateOptimizationSuggestions(expenses) {
  return [
    {
      title: 'Tối ưu chi phí IT',
      description: 'Có thể tiết kiệm 15% bằng cách gộp các gói dịch vụ',
      savings: 500000
    }
  ];
}

function calculateExpenseForecast(expenses) {
  return {
    nextMonth: 8500000,
    trend: 'up',
    confidence: 78
  };
}

function generateExpenseInsights(expenses, transactions) {
  return {
    savingOpportunity: {
      value: '2.5M ₫',
      description: 'Tiết kiệm tiềm năng từ việc tối ưu hóa quy trình'
    },
    spendingPattern: {
      value: 'Ổn định',
      description: 'Chi phí duy trì ở mức ổn định trong 3 tháng qua'
    },
    costEfficiency: {
      value: '85%',
      description: 'Hiệu quả chi phí tốt so với mức trung bình ngành'
    },
    expenseRisk: {
      value: 'Thấp',
      description: 'Rủi ro chi phí được kiểm soát tốt'
    }
  };
}

function updateBudgetAlerts(alerts) {
  const container = document.getElementById('budget-alerts-list');
  if (!container) return;
  
  container.innerHTML = alerts.map(alert => `
    <div class="alert-item">
      <div class="alert-icon ${alert.type}">
        <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      </div>
      <div class="alert-content">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-description">${alert.description}</div>
      </div>
    </div>
  `).join('');
}

function updateOptimizationSuggestions(suggestions) {
  const container = document.getElementById('optimization-suggestions');
  if (!container) return;
  
  container.innerHTML = suggestions.map(suggestion => `
    <div class="optimization-item">
      <div class="optimization-icon">
        <i class="fas fa-lightbulb"></i>
      </div>
      <div class="optimization-content">
        <div class="optimization-title">${suggestion.title}</div>
        <div class="optimization-description">${suggestion.description}</div>
        <div class="optimization-savings">Tiết kiệm: ${formatRevenue(suggestion.savings)}</div>
      </div>
    </div>
  `).join('');
}

function updateExpenseForecast(forecast) {
  updateKPIElement('next-month-forecast', formatRevenue(forecast.nextMonth));
  updateKPIElement('expense-trend-direction', forecast.trend === 'up' ? '📈' : '📉');
  updateKPIElement('forecast-confidence', `${forecast.confidence}%`);
}

function updateExpenseInsights(insights) {
  updateKPIElement('saving-opportunity-value', insights.savingOpportunity.value);
  updateKPIElement('saving-opportunity-desc', insights.savingOpportunity.description);
  
  updateKPIElement('spending-pattern-value', insights.spendingPattern.value);
  updateKPIElement('spending-pattern-desc', insights.spendingPattern.description);
  
  updateKPIElement('cost-efficiency-value', insights.costEfficiency.value);
  updateKPIElement('cost-efficiency-desc', insights.costEfficiency.description);
  
  updateKPIElement('expense-risk-value', insights.expenseRisk.value);
  updateKPIElement('expense-risk-desc', insights.expenseRisk.description);
}

function getPreviousPeriodExpenses(expenses, period) {
  // Placeholder - would implement actual previous period calculation
  return expenses.slice(0, Math.floor(expenses.length / 2));
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
window.refreshExpenseAnalysis = function() {
  loadExpenseAnalysis();
};

window.exportExpenseReport = function() {
  // console.log('📊 Exporting expense report...');
  // Implementation for export functionality
};

window.exportCategoryExpenseData = function() {
  // console.log('📊 Exporting category expense data...');
};

window.exportExpenseTypesData = function() {
  // console.log('📊 Exporting expense types data...');
};

window.toggleExpenseChartView = function(chartType, viewType) {
  // console.log(`🔄 Toggling ${chartType} chart to ${viewType} view`);
};

window.editExpense = function(expenseId) {
  // console.log(`✏️ Editing expense: ${expenseId}`);
};

function refreshExpenseChart(period) {
  // console.log(`🔄 Refreshing expense chart for period: ${period}`);
  // Implementation for chart refresh
}

function refreshBudgetChart(view) {
  // console.log(`🔄 Refreshing budget chart for view: ${view}`);
  // Implementation for budget chart refresh
}

function refreshExpenseTable(view) {
  // console.log(`🔄 Refreshing expense table for view: ${view}`);
  // Implementation for table refresh
}

function filterExpenseTypes(filter) {
  // console.log(`🔄 Filtering expense types: ${filter}`);
  // Implementation for expense type filtering
}