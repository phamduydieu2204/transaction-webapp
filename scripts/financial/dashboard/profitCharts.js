/**
 * profitCharts.js
 * 
 * Profit and profitability analysis charts for financial dashboard
 * Handles profit tracking, margins, and profitability metrics
 */

import { 
  createOrUpdateChart, 
  createLineChartConfig, 
  createBarChartConfig,
  CHART_COLORS,
  formatCurrencyForChart 
} from '../core/chartManager.js';

/**
 * Render profit trend chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderProfitTrendChart(metrics, containerId = 'profitTrendChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for profit trend chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
  
  const profitData = months.map(month => monthlyData[month]?.profit || 0);
  const profitMarginData = months.map(month => monthlyData[month]?.profitMargin || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });

  const datasets = [
    {
      label: 'Lợi nhuận',
      data: profitData,
      borderColor: CHART_COLORS.profit,
      backgroundColor: CHART_COLORS.profit + '20',
      fill: true,
      tension: 0.4,
      yAxisID: 'y'
    },
    {
      label: 'Tỷ suất lợi nhuận (%)',
      data: profitMarginData,
      borderColor: CHART_COLORS.warning,
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.4,
      yAxisID: 'y1'
    }
  ];

  const config = createLineChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Xu hướng Lợi nhuận & Tỷ suất (12 tháng gần nhất)',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrencyForChart(value);
          }
        },
        title: {
          display: true,
          text: 'Lợi nhuận (VND)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Tỷ suất (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
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
 * Render profit by software chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderProfitBySoftwareChart(metrics, containerId = 'profitBySoftwareChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for profit by software chart`);
    return;
  }

  const revenueByOrgSoftware = metrics.revenueByOrgSoftware || {};
  const expensesByCategory = metrics.expensesByCategory || {};
  
  // Calculate profit by software (simplified - assumes even expense distribution)
  const totalExpenses = metrics.totalExpenses || 0;
  const totalRevenue = metrics.totalRevenue || 0;
  const expenseRatio = totalRevenue > 0 ? totalExpenses / totalRevenue : 0;

  const softwareProfitData = Object.values(revenueByOrgSoftware)
    .map(software => ({
      name: software.name,
      revenue: software.revenue,
      estimatedExpenses: software.revenue * expenseRatio,
      profit: software.revenue - (software.revenue * expenseRatio),
      profitMargin: software.revenue > 0 ? ((software.revenue - (software.revenue * expenseRatio)) / software.revenue) * 100 : 0
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8); // Top 8 software

  if (softwareProfitData.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu lợi nhuận</div>';
    return;
  }

  const labels = softwareProfitData.map(item => item.name);
  const profitData = softwareProfitData.map(item => item.profit);
  const marginData = softwareProfitData.map(item => item.profitMargin);

  // Color bars based on profitability
  const backgroundColors = profitData.map(profit => 
    profit > 0 ? CHART_COLORS.success : CHART_COLORS.danger
  );

  const datasets = [
    {
      label: 'Lợi nhuận ước tính',
      data: profitData,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors,
      borderWidth: 1,
      yAxisID: 'y'
    }
  ];

  const config = createBarChartConfig(labels, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Lợi nhuận Ước tính theo Phần mềm',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const software = softwareProfitData[context.dataIndex];
            return [
              `Lợi nhuận: ${formatCurrencyForChart(software.profit)}`,
              `Doanh thu: ${formatCurrencyForChart(software.revenue)}`,
              `Chi phí ước tính: ${formatCurrencyForChart(software.estimatedExpenses)}`,
              `Tỷ suất: ${software.profitMargin.toFixed(1)}%`
            ];
          }
        }
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
 * Render quarterly profit analysis
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderQuarterlyProfitChart(metrics, containerId = 'quarterlyProfitChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for quarterly profit chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort();
  
  // Group by quarters
  const quarterlyData = {};
  months.forEach(month => {
    const [year, monthNum] = month.split('-');
    const quarter = Math.ceil(parseInt(monthNum) / 3);
    const quarterKey = `Q${quarter} ${year}`;
    
    if (!quarterlyData[quarterKey]) {
      quarterlyData[quarterKey] = {
        revenue: 0,
        expenses: 0,
        profit: 0
      };
    }
    
    const data = monthlyData[month];
    quarterlyData[quarterKey].revenue += data.revenue || 0;
    quarterlyData[quarterKey].expenses += data.expenses || 0;
    quarterlyData[quarterKey].profit += data.profit || 0;
  });

  const quarters = Object.keys(quarterlyData).slice(-8); // Last 8 quarters
  const profitData = quarters.map(q => quarterlyData[q].profit);
  const revenueData = quarters.map(q => quarterlyData[q].revenue);
  const expenseData = quarters.map(q => quarterlyData[q].expenses);

  const datasets = [
    {
      label: 'Doanh thu',
      data: revenueData,
      backgroundColor: CHART_COLORS.revenue + '60',
      borderColor: CHART_COLORS.revenue,
      borderWidth: 1
    },
    {
      label: 'Chi phí',
      data: expenseData,
      backgroundColor: CHART_COLORS.expense + '60',
      borderColor: CHART_COLORS.expense,
      borderWidth: 1
    },
    {
      label: 'Lợi nhuận',
      data: profitData,
      backgroundColor: CHART_COLORS.profit + '80',
      borderColor: CHART_COLORS.profit,
      borderWidth: 2
    }
  ];

  const config = createBarChartConfig(quarters, datasets, {
    plugins: {
      title: {
        display: true,
        text: 'Phân tích Lợi nhuận theo Quý',
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
 * Render profit margin comparison chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderProfitMarginChart(metrics, containerId = 'profitMarginChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for profit margin chart`);
    return;
  }

  const revenueByOrgSoftware = metrics.revenueByOrgSoftware || {};
  const totalExpenses = metrics.totalExpenses || 0;
  const totalRevenue = metrics.totalRevenue || 0;
  const avgExpenseRatio = totalRevenue > 0 ? totalExpenses / totalRevenue : 0;

  // Calculate profit margins by software
  const marginData = Object.values(revenueByOrgSoftware)
    .map(software => {
      const estimatedExpenses = software.revenue * avgExpenseRatio;
      const profit = software.revenue - estimatedExpenses;
      const margin = software.revenue > 0 ? (profit / software.revenue) * 100 : 0;
      
      return {
        name: software.name,
        margin: margin,
        revenue: software.revenue
      };
    })
    .filter(item => item.revenue > 0) // Only include software with revenue
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10); // Top 10

  if (marginData.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu tỷ suất lợi nhuận</div>';
    return;
  }

  const labels = marginData.map(item => item.name);
  const margins = marginData.map(item => item.margin);

  // Color bars based on margin quality
  const backgroundColors = margins.map(margin => {
    if (margin >= 30) return CHART_COLORS.success;      // Excellent margin
    if (margin >= 15) return CHART_COLORS.warning;      // Good margin
    if (margin >= 0) return CHART_COLORS.info;          // Break-even
    return CHART_COLORS.danger;                          // Loss
  });

  const datasets = [{
    label: 'Tỷ suất lợi nhuận (%)',
    data: margins,
    backgroundColor: backgroundColors,
    borderColor: backgroundColors,
    borderWidth: 1
  }];

  const config = createBarChartConfig(labels, datasets, {
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      title: {
        display: true,
        text: 'Tỷ suất Lợi nhuận theo Phần mềm (%)',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const software = marginData[context.dataIndex];
            return [
              `Tỷ suất: ${software.margin.toFixed(1)}%`,
              `Doanh thu: ${formatCurrencyForChart(software.revenue)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
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
    container.innerHTML = `<canvas id="${containerId}Canvas" style="max-height: 500px;"></canvas>`;
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}