// statisticsHandler.js - Xử lý tất cả logic thống kê

import { getConstants } from './constants.js';

// Biến global cho charts
let revenueChart = null;
let productChart = null;

/**
 * Khởi tạo tab thống kê
 */
export function initStatistics() {
  console.log('🔄 Khởi tạo tab thống kê...');
  
  // Setup event listeners
  setupEventListeners();
  
  // Load initial data
  updateStatistics();
  
  // Setup Chart.js if available
  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = 'Arial, sans-serif';
    Chart.defaults.font.size = 12;
  }
}

/**
 * Setup các event listeners
 */
function setupEventListeners() {
  // Time range change
  const timeRange = document.getElementById('statsTimeRange');
  if (timeRange) {
    timeRange.addEventListener('change', handleTimeRangeChange);
  }
  
  // Employee filter change
  const employeeFilter = document.getElementById('statsEmployee');
  if (employeeFilter) {
    employeeFilter.addEventListener('change', updateStatistics);
  }
  
  // Custom date inputs
  const startDate = document.getElementById('statsStartDate');
  const endDate = document.getElementById('statsEndDate');
  if (startDate && endDate) {
    startDate.addEventListener('change', updateStatistics);
    endDate.addEventListener('change', updateStatistics);
  }
}

/**
 * Xử lý thay đổi time range
 */
function handleTimeRangeChange() {
  const timeRange = document.getElementById('statsTimeRange').value;
  const customDateRange = document.getElementById('customDateRange');
  
  if (timeRange === 'custom') {
    customDateRange.style.display = 'flex';
  } else {
    customDateRange.style.display = 'none';
    updateStatistics();
  }
}

/**
 * Cập nhật tất cả thống kê
 */
export async function updateStatistics() {
  console.log('🔄 Cập nhật thống kê...');
  
  try {
    // Show loading state
    showLoadingState();
    
    // Get filter values
    const filters = getFilterValues();
    
    // Fetch data
    const [transactionData, expenseData, accountData] = await Promise.all([
      fetchTransactionData(filters),
      fetchExpenseData(filters),
      fetchAccountData()
    ]);
    
    // Update all components
    updateKPICards(transactionData, expenseData);
    updateCharts(transactionData, expenseData);
    updateTables(transactionData, expenseData);
    updateAccountUtilization(accountData);
    updateExpiryAlerts(transactionData);
    updateFinancialSummary(transactionData, expenseData);
    
    // Hide loading state
    hideLoadingState();
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật thống kê:', error);
    showErrorState(error.message);
  }
}

/**
 * Lấy giá trị filter
 */
function getFilterValues() {
  const timeRange = document.getElementById('statsTimeRange')?.value || 'month';
  const employee = document.getElementById('statsEmployee')?.value || 'all';
  const startDate = document.getElementById('statsStartDate')?.value;
  const endDate = document.getElementById('statsEndDate')?.value;
  
  return {
    timeRange,
    employee,
    startDate,
    endDate,
    ...getDateRange(timeRange, startDate, endDate)
  };
}

/**
 * Tính toán khoảng thời gian
 */
function getDateRange(timeRange, customStart, customEnd) {
  const today = new Date();
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };
  
  switch (timeRange) {
    case 'today':
      return { startDate: formatDate(today), endDate: formatDate(today) };
      
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
      
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);
      return { startDate: formatDate(weekStart), endDate: formatDate(today) };
      
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDate(monthStart), endDate: formatDate(today) };
      
    case 'lastMonth':
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: formatDate(lastMonthStart), endDate: formatDate(lastMonthEnd) };
      
    case 'quarter':
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      return { startDate: formatDate(quarterStart), endDate: formatDate(today) };
      
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return { startDate: formatDate(yearStart), endDate: formatDate(today) };
      
    case 'custom':
      return { startDate: customStart, endDate: customEnd };
      
    default:
      return { startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: formatDate(today) };
  }
}

/**
 * Fetch dữ liệu giao dịch
 */
async function fetchTransactionData(filters) {
  const { BACKEND_URL } = getConstants();
  
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getStatisticsData',
      type: 'transactions',
      filters: filters,
      maNhanVien: window.userInfo?.maNhanVien || ''
    })
  });
  
  const result = await response.json();
  
  if (result.status === 'success') {
    return result.data;
  } else {
    throw new Error(result.message || 'Không thể lấy dữ liệu giao dịch');
  }
}

/**
 * Fetch dữ liệu chi phí
 */
async function fetchExpenseData(filters) {
  const { BACKEND_URL } = getConstants();
  
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getStatisticsData',
      type: 'expenses',
      filters: filters
    })
  });
  
  const result = await response.json();
  
  if (result.status === 'success') {
    return result.data;
  } else {
    throw new Error(result.message || 'Không thể lấy dữ liệu chi phí');
  }
}

/**
 * Fetch dữ liệu tài khoản
 */
async function fetchAccountData() {
  const { BACKEND_URL } = getConstants();
  
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getAccountUtilization'
    })
  });
  
  const result = await response.json();
  
  if (result.status === 'success') {
    return result.data;
  } else {
    console.warn('Không thể lấy dữ liệu tài khoản:', result.message);
    return [];
  }
}

/**
 * Cập nhật KPI cards
 */
function updateKPICards(transactionData, expenseData) {
  console.log('📊 Cập nhật KPI cards...');
  
  // Tính toán metrics
  const revenue = transactionData.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  const expense = expenseData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const profit = revenue - expense;
  const transactions = transactionData.length;
  const aov = transactions > 0 ? revenue / transactions : 0;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  // Cập nhật UI
  updateElement('totalRevenue', formatCurrency(revenue));
  updateElement('totalExpense', formatCurrency(expense));
  updateElement('totalProfit', formatCurrency(profit));
  updateElement('totalTransactions', transactions.toLocaleString());
  updateElement('averageOrderValue', formatCurrency(aov));
  updateElement('profitMargin', profitMargin.toFixed(1) + '%');
  
  // Cập nhật màu sắc profit
  const profitElement = document.getElementById('totalProfit');
  if (profitElement) {
    profitElement.style.color = profit >= 0 ? '#28a745' : '#dc3545';
  }
  
  // TODO: Tính toán % thay đổi so với kỳ trước
  updateChangeIndicators(0, 0, 0, 0); // Placeholder
}

/**
 * Cập nhật biểu đồ
 */
function updateCharts(transactionData, expenseData) {
  console.log('📈 Cập nhật biểu đồ...');
  
  updateRevenueTrendChart(transactionData);
  updateProductPerformanceChart(transactionData);
}

/**
 * Cập nhật biểu đồ xu hướng doanh thu
 */
function updateRevenueTrendChart(transactionData) {
  const ctx = document.getElementById('revenueTrendChart');
  if (!ctx || typeof Chart === 'undefined') return;
  
  // Group data by date
  const revenueByDate = {};
  transactionData.forEach(t => {
    const date = t.transactionDate;
    if (!revenueByDate[date]) {
      revenueByDate[date] = 0;
    }
    revenueByDate[date] += parseFloat(t.revenue) || 0;
  });
  
  // Sort dates and prepare chart data
  const sortedDates = Object.keys(revenueByDate).sort();
  const labels = sortedDates.map(date => formatDateLabel(date));
  const data = sortedDates.map(date => revenueByDate[date]);
  
  // Destroy existing chart
  if (revenueChart) {
    revenueChart.destroy();
  }
  
  // Create new chart
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Doanh thu',
        data: data,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Doanh thu: ' + formatCurrency(context.parsed.y);
            }
          }
        }
      }
    }
  });
}

/**
 * Cập nhật biểu đồ hiệu suất sản phẩm
 */
function updateProductPerformanceChart(transactionData) {
  const ctx = document.getElementById('productPerfChart');
  if (!ctx || typeof Chart === 'undefined') return;
  
  // Group by product
  const productRevenue = {};
  transactionData.forEach(t => {
    const product = `${t.softwareName} - ${t.softwarePackage}`;
    if (!productRevenue[product]) {
      productRevenue[product] = 0;
    }
    productRevenue[product] += parseFloat(t.revenue) || 0;
  });
  
  // Sort and get top 5
  const sorted = Object.entries(productRevenue)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const labels = sorted.map(([product,]) => product);
  const data = sorted.map(([, revenue]) => revenue);
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
  
  // Destroy existing chart
  if (productChart) {
    productChart.destroy();
  }
  
  // Create new chart
  productChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Cập nhật bảng dữ liệu
 */
function updateTables(transactionData, expenseData) {
  console.log('📋 Cập nhật bảng...');
  
  updateTopProductsTable(transactionData);
  updateEmployeePerformanceTable(transactionData);
  updateMonthlySummaryTable(expenseData);
}

/**
 * Cập nhật bảng top sản phẩm
 */
function updateTopProductsTable(transactionData) {
  const tbody = document.querySelector('#topProductsTable tbody');
  if (!tbody) return;
  
  // Group by product
  const productStats = {};
  let totalRevenue = 0;
  
  transactionData.forEach(t => {
    const key = `${t.softwareName}|${t.softwarePackage}`;
    if (!productStats[key]) {
      productStats[key] = {
        name: t.softwareName,
        package: t.softwarePackage,
        count: 0,
        revenue: 0
      };
    }
    productStats[key].count++;
    productStats[key].revenue += parseFloat(t.revenue) || 0;
    totalRevenue += parseFloat(t.revenue) || 0;
  });
  
  // Sort by revenue
  const sorted = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Update table
  tbody.innerHTML = '';
  sorted.forEach(product => {
    const percentage = totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : '0';
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.package}</td>
      <td>${product.count}</td>
      <td>${formatCurrency(product.revenue)}</td>
      <td>${percentage}%</td>
    `;
  });
}

/**
 * Cập nhật bảng hiệu suất nhân viên
 */
function updateEmployeePerformanceTable(transactionData) {
  const tbody = document.querySelector('#employeePerfTable tbody');
  if (!tbody) return;
  
  // Group by employee
  const employeeStats = {};
  
  transactionData.forEach(t => {
    const employee = t.tenNhanVien || 'N/A';
    if (!employeeStats[employee]) {
      employeeStats[employee] = {
        count: 0,
        revenue: 0
      };
    }
    employeeStats[employee].count++;
    employeeStats[employee].revenue += parseFloat(t.revenue) || 0;
  });
  
  // Sort by revenue
  const sorted = Object.entries(employeeStats)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      revenue: stats.revenue,
      aov: stats.count > 0 ? stats.revenue / stats.count : 0,
      commission: stats.revenue * 0.05 // 5% commission
    }))
    .sort((a, b) => b.revenue - a.revenue);
  
  // Update table
  tbody.innerHTML = '';
  sorted.forEach(emp => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.count}</td>
      <td>${formatCurrency(emp.revenue)}</td>
      <td>${formatCurrency(emp.aov)}</td>
      <td>${formatCurrency(emp.commission)}</td>
    `;
  });
}

/**
 * Cập nhật bảng tổng hợp chi phí theo tháng
 */
function updateMonthlySummaryTable(expenseData) {
  const tbody = document.querySelector('#monthlySummaryTable tbody');
  if (!tbody) return;
  
  // Group by month and category
  const monthlyStats = {};
  let totalAmount = 0;
  
  expenseData.forEach(e => {
    const month = e.date ? e.date.substring(0, 7) : 'N/A'; // YYYY/MM
    const category = e.type || 'Khác';
    const key = `${month}|${category}`;
    
    if (!monthlyStats[key]) {
      monthlyStats[key] = {
        month,
        category,
        count: 0,
        amount: 0
      };
    }
    monthlyStats[key].count++;
    monthlyStats[key].amount += parseFloat(e.amount) || 0;
    totalAmount += parseFloat(e.amount) || 0;
  });
  
  // Sort by month desc, then by amount desc
  const sorted = Object.values(monthlyStats)
    .sort((a, b) => {
      if (a.month !== b.month) {
        return b.month.localeCompare(a.month);
      }
      return b.amount - a.amount;
    });
  
  // Update table
  tbody.innerHTML = '';
  sorted.forEach(item => {
    const percentage = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : '0';
    const average = item.count > 0 ? item.amount / item.count : 0;
    
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.month}</td>
      <td>${item.category}</td>
      <td>${item.count}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td>${formatCurrency(average)}</td>
      <td>${percentage}%</td>
    `;
  });
}

/**
 * Cập nhật tình trạng tài khoản
 */
function updateAccountUtilization(accountData) {
  const container = document.getElementById('accountUtilization');
  if (!container || !accountData) return;
  
  container.innerHTML = '';
  
  accountData.forEach(account => {
    const utilization = account.allowedUsers > 0 
      ? (account.activeUsers / account.allowedUsers) * 100 
      : 0;
    
    let utilizationClass = 'low';
    if (utilization > 80) utilizationClass = 'high';
    else if (utilization > 60) utilizationClass = 'medium';
    
    const accountDiv = document.createElement('div');
    accountDiv.className = 'account-item';
    accountDiv.innerHTML = `
      <div class="account-info">
        <div class="account-name">${account.softwareName} - ${account.softwarePackage}</div>
        <div class="account-detail">${account.accountName}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${utilization}%"></div>
        </div>
      </div>
      <div class="utilization-rate ${utilizationClass}">
        ${account.activeUsers}/${account.allowedUsers}
      </div>
    `;
    
    container.appendChild(accountDiv);
  });
}

/**
 * Cập nhật cảnh báo hết hạn
 */
function updateExpiryAlerts(transactionData) {
  const container = document.getElementById('expiryAlerts');
  if (!container) return;
  
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  
  const expiring = transactionData.filter(t => {
    if (!t.endDate) return false;
    const endDate = new Date(t.endDate.replace(/\//g, '-'));
    return endDate >= today && endDate <= sevenDaysLater;
  });
  
  container.innerHTML = '';
  
  if (expiring.length === 0) {
    container.innerHTML = '<div class="alert-item"><div class="alert-content">Không có giao dịch nào sắp hết hạn</div></div>';
    return;
  }
  
  expiring.forEach(transaction => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle alert-icon"></i>
      <div class="alert-content">
        <div class="alert-title">${transaction.customerName}</div>
        <div class="alert-subtitle">
          ${transaction.softwareName} - Hết hạn: ${formatDateLabel(transaction.endDate)}
        </div>
      </div>
    `;
    container.appendChild(alertDiv);
  });
}

/**
 * Cập nhật tóm tắt tài chính
 */
function updateFinancialSummary(transactionData, expenseData) {
  const revenue = transactionData.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  const expense = expenseData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const netRevenue = revenue;
  const ebitda = netRevenue - expense;
  const roi = expense > 0 ? ((revenue - expense) / expense) * 100 : 0;
  
  // Monthly burn rate (assuming current month expense)
  const monthlyExpense = expense;
  const runway = monthlyExpense > 0 ? Math.floor(revenue / monthlyExpense) : 0;
  
  updateElement('netRevenue', formatCurrency(netRevenue));
  updateElement('totalCost', formatCurrency(expense));
  updateElement('ebitda', formatCurrency(ebitda));
  updateElement('roi', roi.toFixed(1) + '%');
  updateElement('burnRate', formatCurrency(monthlyExpense));
  updateElement('runway', runway + ' tháng');
  
  // Update colors
  const ebitdaElement = document.getElementById('ebitda');
  if (ebitdaElement) {
    ebitdaElement.style.color = ebitda >= 0 ? '#28a745' : '#dc3545';
  }
  
  const roiElement = document.getElementById('roi');
  if (roiElement) {
    roiElement.style.color = roi >= 0 ? '#28a745' : '#dc3545';
  }
}

/**
 * Utility functions
 */
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('/');
  return `${day}/${month}`;
}

function updateChangeIndicators(revenueChange, expenseChange, profitChange, transactionChange) {
  // TODO: Implement comparison with previous period
  console.log('Change indicators:', { revenueChange, expenseChange, profitChange, transactionChange });
}

function showLoadingState() {
  // TODO: Show loading spinners
}

function hideLoadingState() {
  // TODO: Hide loading spinners
}

function showErrorState(message) {
  console.error('Statistics error:', message);
  // TODO: Show user-friendly error message
}

/**
 * Export functions
 */
export function exportStatistics() {
  console.log('📄 Xuất báo cáo...');
  
  // TODO: Implement export to Excel/PDF
  alert('Chức năng xuất báo cáo đang được phát triển');
}

export function changeChartType(chartName, type) {
  console.log(`📊 Đổi loại biểu đồ: ${chartName} -> ${type}`);
  
  // Update active button
  const chartCard = document.querySelector(`#${chartName}Chart`).closest('.chart-card');
  const buttons = chartCard.querySelectorAll('.chart-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Recreate chart with new type
  if (chartName === 'revenueTrend') {
    const ctx = document.getElementById('revenueTrendChart');
    if (revenueChart) {
      const data = revenueChart.data;
      revenueChart.destroy();
      
      revenueChart = new Chart(ctx, {
        type: type,
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
  } else if (chartName === 'productPerf') {
    const ctx = document.getElementById('productPerfChart');
    if (productChart) {
      const data = productChart.data;
      productChart.destroy();
      
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: type === 'doughnut' ? 'bottom' : 'top'
          }
        }
      };
      
      if (type === 'bar') {
        chartOptions.scales = {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        };
      }
      
      productChart = new Chart(ctx, {
        type: type,
        data: data,
        options: chartOptions
      });
    }
  }
}

/**
 * Load danh sách nhân viên cho filter
 */
export async function loadEmployeeFilter() {
  try {
    const { BACKEND_URL } = getConstants();
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEmployeeList'
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      const select = document.getElementById('statsEmployee');
      if (select) {
        // Clear existing options except "Tất cả"
        select.innerHTML = '<option value="all">Tất cả</option>';
        
        // Add employee options
        result.data.forEach(emp => {
          const option = document.createElement('option');
          option.value = emp.maNhanVien;
          option.textContent = `${emp.tenNhanVien} (${emp.maNhanVien})`;
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Lỗi khi load danh sách nhân viên:', error);
  }
}

/**
 * Gán global functions cho HTML
 */
window.updateStatistics = updateStatistics;
window.exportStatistics = exportStatistics;
window.changeChartType = changeChartType;