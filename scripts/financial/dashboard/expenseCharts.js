/**
 * expenseCharts.js
 * 
 * Expense-specific chart components for financial dashboard
 * Handles expense tracking, categorization, and analysis charts
 */

import { 
  createOrUpdateChart, 
  createLineChartConfig, 
  createBarChartConfig,
  createDoughnutChartConfig,
  CHART_COLORS,
  formatCurrencyForChart 
} from '../core/chartManager.js';

/**
 * Render expense by category chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderExpenseByCategoryChart(metrics, containerId = 'expenseByCategoryChart') {
  const container = document.getElementById(containerId);
  if (!container) {
// console.warn(`Container #${containerId} not found for expense by category chart`);
    return;
  }

  const expensesByCategory = metrics.expensesByCategory || {};
  const categoryData = Object.values(expensesByCategory)
    .sort((a, b) => b.amount - a.amount);

  if (categoryData.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu chi phí</div>';
    return;
  }

  const labels = categoryData.map(item => item.name);
  const data = categoryData.map(item => item.amount);

  const config = createDoughnutChartConfig(labels, data, {
    plugins: {
      title: {
        display: true,
        text: 'Chi phí theo Danh mục',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            const category = categoryData[context.dataIndex];
            return [
              `${context.label}: ${formatCurrencyForChart(context.parsed)} (${percentage}%)`,
              `Số lượng: ${category.count}`,
              `Trung bình: ${formatCurrencyForChart(category.averageAmount)}`
            ];
          }
        }
      }
    }
  });

  // Create canvas if it doesn't exist
  if (!document.getElementById(containerId + 'Canvas')) {
    container.innerHTML = `<canvas id="${containerId}Canvas" style="max-height: 400px;"></canvas>`;
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}

/**
 * Render monthly expense trend chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderExpenseTrendChart(metrics, containerId = 'expenseTrendChart') {
  const container = document.getElementById(containerId);
  if (!container) {
// console.warn(`Container #${containerId} not found for expense trend chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
  
  const expenseData = months.map(month => monthlyData[month]?.expenses || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });

  const datasets = [{
    label: 'Chi phí',
    data: expenseData,
    borderColor: CHART_COLORS.expense,
    backgroundColor: CHART_COLORS.expense + '20',
    fill: true,
    tension: 0.4
  }];

  const config = createLineChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Xu hướng Chi phí (12 tháng gần nhất)',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrencyForChart(value);
          }
        }
      }
    }
  });

  // Create canvas if it doesn't exist
  if (!document.getElementById(containerId + 'Canvas')) {
    container.innerHTML = `<canvas id="${containerId}Canvas" style="max-height: 400px;"></canvas>`;
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}

/**
 * Render expense comparison chart (budget vs actual)
 * @param {Object} metrics - Financial metrics data
 * @param {Object} budgetData - Budget data for comparison
 * @param {string} containerId - Container element ID
 */
export function renderExpenseBudgetChart(metrics, budgetData = {}, containerId = 'expenseBudgetChart') {
  const container = document.getElementById(containerId);
  if (!container) {
// console.warn(`Container #${containerId} not found for expense budget chart`);
    return;
  }

  const expensesByCategory = metrics.expensesByCategory || {};
  const categories = Object.keys(expensesByCategory);

  if (categories.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu chi phí</div>';
    return;
  }

  const actualExpenses = categories.map(cat => expensesByCategory[cat].amount);
  const budgetExpenses = categories.map(cat => budgetData[cat] || 0);

  const datasets = [
    {
      label: 'Chi phí thực tế',
      data: actualExpenses,
      backgroundColor: CHART_COLORS.expense,
      borderColor: CHART_COLORS.expense,
      borderWidth: 1
    },
    {
      label: 'Ngân sách',
      data: budgetExpenses,
      backgroundColor: CHART_COLORS.warning,
      borderColor: CHART_COLORS.warning,
      borderWidth: 1
    }
  ];

  const config = createBarChartConfig(categories, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'So sánh Chi phí Thực tế vs Ngân sách',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrencyForChart(value);
          }
        }
      }
    }
  });

  // Create canvas if it doesn't exist
  if (!document.getElementById(containerId + 'Canvas')) {
    container.innerHTML = `<canvas id="${containerId}Canvas" style="max-height: 400px;"></canvas>`;
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}

/**
 * Render expense efficiency chart (cost per transaction)
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderExpenseEfficiencyChart(metrics, containerId = 'expenseEfficiencyChart') {
  const container = document.getElementById(containerId);
  if (!container) {
// console.warn(`Container #${containerId} not found for expense efficiency chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-6); // Last 6 months
  
  // Calculate expense efficiency metrics
  const efficiencyData = months.map(month => {
    const data = monthlyData[month];
    if (!data || data.revenue === 0) return 0;
    
    // Cost as percentage of revenue
    return (data.expenses / data.revenue) * 100;
  });
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });

  // Color bars based on efficiency (lower is better)
  const backgroundColors = efficiencyData.map(rate => {
    if (rate <= 30) return CHART_COLORS.success;      // Good efficiency
    if (rate <= 50) return CHART_COLORS.warning;      // Moderate efficiency
    return CHART_COLORS.danger;                        // Poor efficiency
  });

  const datasets = [{
    label: 'Chi phí/Doanh thu (%)',
    data: efficiencyData,
    backgroundColor: backgroundColors,
    borderColor: backgroundColors,
    borderWidth: 1
  }];

  const config = createBarChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Hiệu quả Chi phí (Chi phí/Doanh thu %)',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y.toFixed(1);
            return `Chi phí/DT: ${value}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  });

  // Create canvas if it doesn't exist
  if (!document.getElementById(containerId + 'Canvas')) {
    container.innerHTML = `<canvas id="${containerId}Canvas" style="max-height: 400px;"></canvas>`;
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}

/**
 * Render expense analytics table
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderExpenseAnalyticsTable(metrics, containerId = 'expenseAnalyticsTable') {
  const container = document.getElementById(containerId);
  if (!container) {
// console.warn(`Container #${containerId} not found for expense analytics table`);
    return;
  }

  const expensesByCategory = metrics.expensesByCategory || {};
  const categoryData = Object.values(expensesByCategory)
    .sort((a, b) => b.amount - a.amount);

  let tableHTML = `
    <div class="analytics-table">
      <h4>💸 Phân tích Chi tiết Chi phí</h4>
      <table class="expense-table">
        <thead>
          <tr>
            <th>Danh mục</th>
            <th>Chi phí</th>
            <th>Số lượng</th>
            <th>Trung bình</th>
            <th>% Tổng CP</th>
          </tr>
        </thead>
        <tbody>
  `;

  const totalExpenses = metrics.totalExpenses || 0;

  categoryData.forEach((category, index) => {
    const percentage = totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : '0';
    
    tableHTML += `
      <tr>
        <td class="category-name">${category.name}</td>
        <td class="expense-amount">${formatCurrencyForChart(category.amount)} VND</td>
        <td class="expense-count">${category.count}</td>
        <td class="average-amount">${formatCurrencyForChart(category.averageAmount)} VND</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Tổng cộng</strong></td>
            <td><strong>${formatCurrencyForChart(totalExpenses)} VND</strong></td>
            <td><strong>${metrics.expenseCount || 0}</strong></td>
            <td><strong>${formatCurrencyForChart(totalExpenses / (metrics.expenseCount || 1))} VND</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}

/**
 * Render top expense items
 * @param {Array} expenseData - Raw expense data
 * @param {string} containerId - Container element ID
 * @param {number} limit - Number of top items to show
 */
export function renderTopExpenseItems(expenseData, containerId = 'topExpenseItems', limit = 10) {
  const container = document.getElementById(containerId);
  if (!container) {
// console.warn(`Container #${containerId} not found for top expense items`);
    return;
  }

  // Sort expenses by amount
  const sortedExpenses = [...expenseData]
    .sort((a, b) => (parseFloat(b.soTien || b.amount) || 0) - (parseFloat(a.soTien || a.amount) || 0))
    .slice(0, limit);

  if (sortedExpenses.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu chi phí</div>';
    return;
  }

  let html = `
    <div class="top-expenses">
      <h4>💸 Top ${limit} Chi phí Lớn nhất</h4>
      <div class="expense-list">
  `;

  sortedExpenses.forEach((expense, index) => {
    const amount = parseFloat(expense.soTien || expense.amount) || 0;
    const description = expense.moTa || expense.description || 'Không có mô tả';
    const category = expense.loaiChiPhi || expense.category || 'Khác';
    const date = new Date(expense.ngayTao || expense.date).toLocaleDateString('vi-VN');

    html += `
      <div class="expense-item">
        <div class="expense-rank">#${index + 1}</div>
        <div class="expense-details">
          <div class="expense-description">${description}</div>
          <div class="expense-meta">
            <span class="expense-category">${category}</span> • 
            <span class="expense-date">${date}</span>
          </div>
        </div>
        <div class="expense-amount">${formatCurrencyForChart(amount)} VND</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}