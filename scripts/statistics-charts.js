// statistics-charts.js - Xử lý biểu đồ thống kê

import { 
  formatCurrency, 
  formatNumber, 
  generateColors, 
  groupByMonth,
  calculateRevenue,
  calculateExpense,
  createTimeSeriesData,
  sortObjectByValue
} from './statistics-utils.js';

// Biến lưu trữ chart instances
let chartInstances = {};

// Render tất cả biểu đồ
export function renderCharts(data) {
  console.log("📊 Rendering charts...");
  
  // Destroy existing charts
  destroyAllCharts();
  
  // Render each chart
  renderRevenueTimeChart(data);
  renderSoftwareRevenueChart(data);
  renderExpenseCategoryChart(data);
  renderProfitTrendChart(data);
  renderCustomerCharts(data);
}

// Biểu đồ doanh thu theo thời gian
function renderRevenueTimeChart(data) {
  const ctx = document.getElementById('revenueTimeChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const timeSeriesData = createTimeSeriesData(
    transactions.filter(t => t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử'),
    'transactionDate',
    'revenue'
  );
  
  chartInstances.revenueTime = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeSeriesData.labels.map(label => {
        const [year, month] = label.split('/');
        return `${month}/${year}`;
      }),
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: timeSeriesData.values,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}

// Biểu đồ doanh thu theo phần mềm
function renderSoftwareRevenueChart(data) {
  const ctx = document.getElementById('softwareRevenueChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const softwareRevenue = {};
  
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      const key = t.softwareName || 'Khác';
      softwareRevenue[key] = (softwareRevenue[key] || 0) + (parseFloat(t.revenue) || 0);
    }
  });
  
  const sorted = sortObjectByValue(softwareRevenue, 10);
  const labels = sorted.map(([name]) => name);
  const values = sorted.map(([, value]) => value);
  const colors = generateColors(labels.length);
  
  chartInstances.softwareRevenue = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = values.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Biểu đồ chi phí theo danh mục
function renderExpenseCategoryChart(data) {
  const ctx = document.getElementById('expenseCategoryChart');
  if (!ctx) return;
  
  const { expenses } = data;
  const categoryExpense = {};
  
  expenses.forEach(e => {
    if (e.currency === 'VND') {
      const key = e.type || 'Khác';
      categoryExpense[key] = (categoryExpense[key] || 0) + (parseFloat(e.amount) || 0);
    }
  });
  
  const sorted = sortObjectByValue(categoryExpense, 8);
  const labels = sorted.map(([name]) => name);
  const values = sorted.map(([, value]) => value);
  const colors = generateColors(labels.length);
  
  chartInstances.expenseCategory = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Chi phí (VNĐ)',
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: colors.map(color => color.replace('0.8', '1'))
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Chi phí: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}

// Biểu đồ xu hướng lợi nhuận
function renderProfitTrendChart(data) {
  const ctx = document.getElementById('profitTrendChart');
  if (!ctx) return;
  
  const { transactions, expenses } = data;
  
  // Group by month
  const revenueByMonth = groupByMonth(transactions, 'transactionDate');
  const expenseByMonth = groupByMonth(expenses, 'date');
  
  // Get all months
  const allMonths = new Set([
    ...Object.keys(revenueByMonth),
    ...Object.keys(expenseByMonth)
  ]);
  
  const sortedMonths = Array.from(allMonths).sort();
  
  const revenueData = sortedMonths.map(month => {
    const monthTransactions = revenueByMonth[month] || [];
    return calculateRevenue(monthTransactions);
  });
  
  const expenseData = sortedMonths.map(month => {
    const monthExpenses = expenseByMonth[month] || [];
    return calculateExpense(monthExpenses);
  });
  
  const profitData = revenueData.map((revenue, index) => revenue - expenseData[index]);
  
  chartInstances.profitTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('/');
        return `${monthNum}/${year}`;
      }),
      datasets: [{
        label: 'Doanh thu',
        data: revenueData,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4
      }, {
        label: 'Chi phí',
        data: expenseData,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.4
      }, {
        label: 'Lợi nhuận',
        data: profitData,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}

// Biểu đồ phân tích khách hàng
function renderCustomerCharts(data) {
  renderCustomerTypeChart(data);
  renderPurchaseFrequencyChart(data);
  renderCustomerValueChart(data);
}

// Biểu đồ khách hàng mới/cũ
function renderCustomerTypeChart(data) {
  const ctx = document.getElementById('customerTypeChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const customers = new Set();
  const newCustomers = new Set();
  
  // Tìm khách hàng mới (first transaction in period)
  transactions.forEach(t => {
    const email = t.customerEmail?.toLowerCase();
    if (email) {
      customers.add(email);
      
      // Check if this is their first transaction ever
      const allCustomerTransactions = window.statisticsData.transactions.filter(
        trans => trans.customerEmail?.toLowerCase() === email
      );
      
      if (allCustomerTransactions.length === 1 || 
          allCustomerTransactions.every(trans => 
            isDateInCurrentPeriod(trans.transactionDate)
          )) {
        newCustomers.add(email);
      }
    }
  });
  
  const newCount = newCustomers.size;
  const returningCount = customers.size - newCount;
  
  chartInstances.customerType = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Khách hàng mới', 'Khách hàng cũ'],
      datasets: [{
        data: [newCount, returningCount],
        backgroundColor: ['#28a745', '#007bff'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = newCount + returningCount;
              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Biểu đồ tần suất mua hàng
function renderPurchaseFrequencyChart(data) {
  const ctx = document.getElementById('purchaseFrequencyChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const customerFrequency = {};
  
  transactions.forEach(t => {
    const email = t.customerEmail?.toLowerCase();
    if (email) {
      customerFrequency[email] = (customerFrequency[email] || 0) + 1;
    }
  });
  
  const frequencyGroups = {
    '1 lần': 0,
    '2-3 lần': 0,
    '4-5 lần': 0,
    '6+ lần': 0
  };
  
  Object.values(customerFrequency).forEach(count => {
    if (count === 1) {
      frequencyGroups['1 lần']++;
    } else if (count <= 3) {
      frequencyGroups['2-3 lần']++;
    } else if (count <= 5) {
      frequencyGroups['4-5 lần']++;
    } else {
      frequencyGroups['6+ lần']++;
    }
  });
  
  chartInstances.purchaseFrequency = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(frequencyGroups),
      datasets: [{
        label: 'Số khách hàng',
        data: Object.values(frequencyGroups),
        backgroundColor: '#ffc107',
        borderColor: '#e0a800',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Biểu đồ giá trị khách hàng
function renderCustomerValueChart(data) {
  const ctx = document.getElementById('customerValueChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const customerValue = {};
  
  transactions.forEach(t => {
    const email = t.customerEmail?.toLowerCase();
    const revenue = parseFloat(t.revenue) || 0;
    
    if (email && (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử')) {
      customerValue[email] = (customerValue[email] || 0) + revenue;
    }
  });
  
  const valueGroups = {
    'Dưới 1 triệu': 0,
    '1-5 triệu': 0,
    '5-10 triệu': 0,
    'Trên 10 triệu': 0
  };
  
  Object.values(customerValue).forEach(value => {
    if (value < 1000000) {
      valueGroups['Dưới 1 triệu']++;
    } else if (value < 5000000) {
      valueGroups['1-5 triệu']++;
    } else if (value < 10000000) {
      valueGroups['5-10 triệu']++;
    } else {
      valueGroups['Trên 10 triệu']++;
    }
  });
  
  chartInstances.customerValue = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(valueGroups),
      datasets: [{
        data: Object.values(valueGroups),
        backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#007bff'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = Object.values(valueGroups).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${context.parsed} khách (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Destroy tất cả charts
function destroyAllCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  chartInstances = {};
}

// Utility function
function isDateInCurrentPeriod(dateStr) {
  const { fromDate, toDate } = window.statisticsData;
  if (!fromDate || !toDate || !dateStr) return false;
  
  const date = dateStr.replace(/\//g, '');
  const from = fromDate.replace(/\//g, '');
  const to = toDate.replace(/\//g, '');
  
  return date >= from && date <= to;
}

// Export function để destroy charts khi cần
export { destroyAllCharts };