/**
 * revenueCharts.js
 * 
 * Revenue-specific chart components for financial dashboard
 * Handles revenue tracking, trends, and analysis charts
 */

import { 
  createOrUpdateChart, 
  createLineChartConfig, 
  createBarChartConfig,
  createPieChartConfig,
  CHART_COLORS,
  formatCurrencyForChart 
} from '../core/chartManager.js';

/**
 * Render revenue trend chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderRevenueTrendChart(metrics, containerId = 'revenueTrendChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for revenue trend chart`);
    return;
  }

  // Prepare monthly data for trend analysis
  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
  
  const revenueData = months.map(month => monthlyData[month]?.revenue || 0);
  const profitData = months.map(month => monthlyData[month]?.profit || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });

  const datasets = [
    {
      label: 'Doanh thu',
      data: revenueData,
      borderColor: CHART_COLORS.revenue,
      backgroundColor: CHART_COLORS.revenue + '20',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Lợi nhuận',
      data: profitData,
      borderColor: CHART_COLORS.profit,
      backgroundColor: CHART_COLORS.profit + '20',
      fill: false,
      tension: 0.4
    }
  ];

  const config = createLineChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Xu hướng Doanh thu & Lợi nhuận (12 tháng gần nhất)',
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
 * Render revenue by software breakdown chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderRevenueBySoftwareChart(metrics, containerId = 'revenueBySoftwareChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for revenue by software chart`);
    return;
  }

  const revenueByOrgSoftware = metrics.revenueByOrgSoftware || {};
  const softwareData = Object.values(revenueByOrgSoftware)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10 software

  if (softwareData.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu doanh thu</div>';
    return;
  }

  const labels = softwareData.map(item => item.name);
  const data = softwareData.map(item => item.revenue);

  const config = createPieChartConfig(labels, data, {
    plugins: {
      title: {
        display: true,
        text: 'Doanh thu theo Phần mềm (Top 10)',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            const software = softwareData[context.dataIndex];
            return [
              `${context.label}: ${formatCurrencyForChart(context.parsed)} (${percentage}%)`,
              `Giao dịch: ${software.transactionCount}`,
              `Trung bình: ${formatCurrencyForChart(software.averageValue)}`
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
 * Render monthly revenue comparison chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderMonthlyRevenueChart(metrics, containerId = 'monthlyRevenueChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for monthly revenue chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-6); // Last 6 months
  
  const revenueData = months.map(month => monthlyData[month]?.revenue || 0);
  const expenseData = months.map(month => monthlyData[month]?.expenses || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  });

  const datasets = [
    {
      label: 'Doanh thu',
      data: revenueData,
      backgroundColor: CHART_COLORS.revenue,
      borderColor: CHART_COLORS.revenue,
      borderWidth: 1
    },
    {
      label: 'Chi phí',
      data: expenseData,
      backgroundColor: CHART_COLORS.expense,
      borderColor: CHART_COLORS.expense,
      borderWidth: 1
    }
  ];

  const config = createBarChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'So sánh Doanh thu vs Chi phí theo tháng',
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
 * Render revenue growth chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderRevenueGrowthChart(metrics, containerId = 'revenueGrowthChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for revenue growth chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12);
  
  // Calculate month-over-month growth rates
  const growthRates = [];
  const labels = [];
  
  for (let i = 1; i < months.length; i++) {
    const currentMonth = monthlyData[months[i]];
    const previousMonth = monthlyData[months[i - 1]];
    
    if (currentMonth && previousMonth && previousMonth.revenue > 0) {
      const growthRate = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
      growthRates.push(growthRate);
      
      const [year, monthNum] = months[i].split('-');
      const date = new Date(year, monthNum - 1);
      labels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }));
    }
  }

  if (growthRates.length === 0) {
    container.innerHTML = '<div class="no-data">Không đủ dữ liệu để tính tăng trưởng</div>';
    return;
  }

  // Color bars based on positive/negative growth
  const backgroundColors = growthRates.map(rate => 
    rate >= 0 ? CHART_COLORS.success : CHART_COLORS.danger
  );

  const datasets = [{
    label: 'Tăng trưởng (%)',
    data: growthRates,
    backgroundColor: backgroundColors,
    borderColor: backgroundColors,
    borderWidth: 1
  }];

  const config = createBarChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Tỷ lệ Tăng trưởng Doanh thu theo tháng (%)',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y.toFixed(1);
            return `Tăng trưởng: ${value}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
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
 * Render revenue analytics summary table
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderRevenueAnalyticsTable(metrics, containerId = 'revenueAnalyticsTable') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for revenue analytics table`);
    return;
  }

  const revenueByOrgSoftware = metrics.revenueByOrgSoftware || {};
  const softwareData = Object.values(revenueByOrgSoftware)
    .sort((a, b) => b.revenue - a.revenue);

  let tableHTML = `
    <div class="analytics-table">
      <h4>📊 Phân tích Chi tiết Doanh thu</h4>
      <table class="revenue-table">
        <thead>
          <tr>
            <th>Phần mềm</th>
            <th>Doanh thu</th>
            <th>Giao dịch</th>
            <th>Trung bình</th>
            <th>% Tổng DT</th>
          </tr>
        </thead>
        <tbody>
  `;

  const totalRevenue = metrics.totalRevenue || 0;

  softwareData.forEach((software, index) => {
    const percentage = totalRevenue > 0 ? ((software.revenue / totalRevenue) * 100).toFixed(1) : '0';
    
    tableHTML += `
      <tr>
        <td class="software-name">${software.name}</td>
        <td class="revenue-amount">${formatCurrencyForChart(software.revenue)} VND</td>
        <td class="transaction-count">${software.transactionCount}</td>
        <td class="average-value">${formatCurrencyForChart(software.averageValue)} VND</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Tổng cộng</strong></td>
            <td><strong>${formatCurrencyForChart(totalRevenue)} VND</strong></td>
            <td><strong>${metrics.transactionCount || 0}</strong></td>
            <td><strong>${formatCurrencyForChart(totalRevenue / (metrics.transactionCount || 1))} VND</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}