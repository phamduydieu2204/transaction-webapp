// ==== scripts/statistics-core.js ====
import { getConstants } from './constants.js';
import { updateKPICards } from './statistics-kpi.js';
import { renderCharts } from './statistics-charts.js';
import { updateStatsTables } from './statistics-tables.js';

// Biến global cho thống kê
window.statisticsData = {
  transactions: [],
  expenses: [],
  filteredData: {
    transactions: [],
    expenses: []
  },
  timeFilter: 'month',
  fromDate: null,
  toDate: null
};

// Khởi tạo tab thống kê
export async function initStatistics() {
  console.log("🚀 Khởi tạo tab thống kê...");
  
  setupStatisticsEventListeners();
  await loadStatisticsData();
  setTimeFilter('month');
  filterAndRenderData();
}

function setupStatisticsEventListeners() {
  const timeFilterSelect = document.getElementById('statsTimeFilter');
  if (timeFilterSelect) {
    timeFilterSelect.addEventListener('change', handleTimeFilterChange);
  }
}

function handleTimeFilterChange(event) {
  const value = event.target.value;
  window.statisticsData.timeFilter = value;
  
  const customDateRange = document.getElementById('customDateRange');
  if (customDateRange) {
    customDateRange.style.display = value === 'custom' ? 'flex' : 'none';
  }
  
  if (value !== 'custom') {
    setTimeFilter(value);
    filterAndRenderData();
  }
}

window.applyCustomDateFilter = function() {
  const fromDate = document.getElementById('statsFromDate').value;
  const toDate = document.getElementById('statsToDate').value;
  
  if (fromDate && toDate) {
    window.statisticsData.fromDate = fromDate;
    window.statisticsData.toDate = toDate;
    filterAndRenderData();
  }
};

function setTimeFilter(period) {
  const today = new Date();
  let fromDate, toDate;
  
  switch (period) {
    case 'today':
      fromDate = toDate = formatDate(today);
      break;
    case 'week':
      fromDate = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
      toDate = formatDate(today);
      break;
    case 'month':
      fromDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      toDate = formatDate(today);
      break;
    case 'quarter':
      const quarter = Math.floor(today.getMonth() / 3);
      fromDate = formatDate(new Date(today.getFullYear(), quarter * 3, 1));
      toDate = formatDate(today);
      break;
    case 'year':
      fromDate = formatDate(new Date(today.getFullYear(), 0, 1));
      toDate = formatDate(today);
      break;
  }
  
  window.statisticsData.fromDate = fromDate;
  window.statisticsData.toDate = toDate;
}

async function loadStatisticsData() {
  try {
    console.log("📊 Đang tải dữ liệu thống kê...");
    
    const { BACKEND_URL } = getConstants();
    
    // Load transactions
    const transactionsResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getTransactions",
        maNhanVien: window.userInfo?.maNhanVien || "",
        vaiTro: "admin",
        giaoDichNhinThay: "bán hàng,hoàn tiền,dùng thử,nhập hàng",
        nhinThayGiaoDichCuaAi: "tất cả"
      })
    });
    
    const transactionsResult = await transactionsResponse.json();
    if (transactionsResult.status === "success") {
      window.statisticsData.transactions = transactionsResult.data || [];
    }
    
    // Load expenses
    const expensesResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getExpenseStats"
      })
    });
    
    const expensesResult = await expensesResponse.json();
    if (expensesResult.status === "success") {
      window.statisticsData.expenses = expensesResult.data || [];
    }
    
    console.log("✅ Đã tải xong dữ liệu thống kê");
    
  } catch (error) {
    console.error("❌ Lỗi khi tải dữ liệu thống kê:", error);
  }
}

function filterAndRenderData() {
  const { transactions, expenses, fromDate, toDate } = window.statisticsData;
  
  // Filter transactions
  window.statisticsData.filteredData.transactions = transactions.filter(t => {
    const transactionDate = t.transactionDate;
    return isDateInRange(transactionDate, fromDate, toDate);
  });
  
  // Filter expenses
  window.statisticsData.filteredData.expenses = expenses.filter(e => {
    const expenseDate = normalizeDate(e.date);
    return isDateInRange(expenseDate, fromDate, toDate);
  });
  
  renderStatistics();
}

function renderStatistics() {
  console.log("🎨 Rendering statistics...");
  
  try {
    updateKPICards(window.statisticsData.filteredData);
    renderCharts(window.statisticsData.filteredData);
    updateStatsTables(window.statisticsData.filteredData);
  } catch (error) {
    console.error("❌ Lỗi khi render thống kê:", error);
  }
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

function normalizeDate(dateInput) {
  if (!dateInput) return "";
  
  let date;
  if (typeof dateInput === 'string') {
    if (dateInput.includes('T')) {
      date = new Date(dateInput);
    } else if (dateInput.includes('/')) {
      const [y, m, d] = dateInput.split('/');
      date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return "";
  
  return formatDate(date);
}

function isDateInRange(dateStr, fromDate, toDate) {
  if (!dateStr || !fromDate || !toDate) return true;
  
  const date = dateStr.replace(/\//g, '');
  const from = fromDate.replace(/\//g, '');
  const to = toDate.replace(/\//g, '');
  
  return date >= from && date <= to;
}

// ==== scripts/statistics-utils.js ====
export function formatCurrency(amount, currency = 'VNĐ') {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' ' + currency;
}

export function formatNumber(num) {
  if (typeof num !== 'number') {
    num = parseFloat(num) || 0;
  }
  
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}

export function groupByMonth(data, dateField) {
  const grouped = {};
  
  data.forEach(item => {
    const date = normalizeDate(item[dateField]);
    if (!date) return;
    
    const monthKey = date.substring(0, 7); // YYYY/MM
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(item);
  });
  
  return grouped;
}

export function calculateRevenue(transactions) {
  let total = 0;
  
  transactions.forEach(t => {
    const revenue = parseFloat(t.revenue) || 0;
    
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      total += revenue;
    } else if (t.transactionType === 'Hoàn Tiền') {
      total -= revenue;
    }
  });
  
  return total;
}

export function calculateExpense(expenses) {
  return expenses.reduce((total, e) => {
    if (e.currency === 'VND') {
      return total + (parseFloat(e.amount) || 0);
    }
    return total;
  }, 0);
}

export function sortObjectByValue(obj, limit = null) {
  const sorted = Object.entries(obj)
    .sort(([,a], [,b]) => b - a);
  
  if (limit) {
    return sorted.slice(0, limit);
  }
  
  return sorted;
}


// ==== scripts/statistics-kpi.js ====
import { formatCurrency, formatNumber } from './statistics-utils.js';

export function updateKPICards(data) {
  const { transactions, expenses } = data;
  
  const currentKPIs = calculateKPIs(transactions, expenses);
  const previousKPIs = { revenue: 0, expense: 0, profit: 0, transactionCount: 0 };
  
  updateKPICard('totalRevenue', currentKPIs.revenue, previousKPIs.revenue, 'revenue');
  updateKPICard('totalExpense', currentKPIs.expense, previousKPIs.expense, 'expense');
  updateKPICard('totalProfit', currentKPIs.profit, previousKPIs.profit, 'profit');
  updateKPICard('totalTransactions', currentKPIs.transactionCount, previousKPIs.transactionCount, 'count');
}

function calculateKPIs(transactions, expenses) {
  let revenue = 0;
  let expense = 0;
  let transactionCount = 0;
  
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      revenue += parseFloat(t.revenue) || 0;
      transactionCount++;
    } else if (t.transactionType === 'Hoàn Tiền') {
      revenue -= parseFloat(t.revenue) || 0;
      transactionCount++;
    }
  });
  
  expenses.forEach(e => {
    if (e.currency === 'VND') {
      expense += parseFloat(e.amount) || 0;
    }
  });
  
  return {
    revenue,
    expense,
    profit: revenue - expense,
    transactionCount
  };
}

function updateKPICard(elementId, currentValue, previousValue, type) {
  const valueElement = document.getElementById(elementId);
  const changeElement = document.getElementById(elementId.replace('total', '') + 'Change');
  
  if (!valueElement || !changeElement) return;
  
  if (type === 'count') {
    valueElement.textContent = formatNumber(currentValue);
  } else {
    valueElement.textContent = formatCurrency(currentValue);
  }
  
  changeElement.textContent = "+0%";
  changeElement.className = "kpi-change neutral";
}

// ==== scripts/statistics-charts.js ====
import { 
  formatCurrency, 
  formatNumber, 
  generateColors, 
  groupByMonth,
  calculateRevenue,
  calculateExpense,
  sortObjectByValue
} from './statistics-utils.js';

let chartInstances = {};

export function renderCharts(data) {
  console.log("📊 Rendering charts...");
  
  destroyAllCharts();
  
  renderRevenueTimeChart(data);
  renderSoftwareRevenueChart(data);
  renderExpenseCategoryChart(data);
  renderProfitTrendChart(data);
  renderCustomerCharts(data);
}

function renderRevenueTimeChart(data) {
  const ctx = document.getElementById('revenueTimeChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const revenueByMonth = groupByMonth(
    transactions.filter(t => t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử'),
    'transactionDate'
  );
  
  const labels = Object.keys(revenueByMonth).sort();
  const values = labels.map(key => calculateRevenue(revenueByMonth[key]));
  
  chartInstances.revenueTime = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.map(label => {
        const [year, month] = label.split('/');
        return `${month}/${year}`;
      }),
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: values,
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
        borderWidth: 1
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

function renderProfitTrendChart(data) {
  const ctx = document.getElementById('profitTrendChart');
  if (!ctx) return;
  
  const { transactions, expenses } = data;
  
  const revenueByMonth = groupByMonth(transactions, 'transactionDate');
  const expenseByMonth = groupByMonth(expenses, 'date');
  
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

function renderCustomerCharts(data) {
  renderCustomerTypeChart(data);
  renderPurchaseFrequencyChart(data);
  renderCustomerValueChart(data);
}

function renderCustomerTypeChart(data) {
  const ctx = document.getElementById('customerTypeChart');
  if (!ctx) return;
  
  const { transactions } = data;
  const customers = new Set();
  const newCustomers = new Set();
  
  transactions.forEach(t => {
    const email = t.customerEmail?.toLowerCase();
    if (email) {
      customers.add(email);
      
      const allCustomerTransactions = window.statisticsData.transactions.filter(
        trans => trans.customerEmail?.toLowerCase() === email
      );
      
      if (allCustomerTransactions.length === 1) {
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

function destroyAllCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  chartInstances = {};
}

export { destroyAllCharts };