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

// Thêm vào statisticsHandler.js để debug

/**
 * Debug function để test các API endpoints
 */
export async function debugStatisticsAPI() {
  const { BACKEND_URL } = getConstants();
  
  console.log('🔍 Testing statistics endpoints...');
  
  // Test 1: getStatisticsData - transactions
  try {
    console.log('📊 Testing transactions data...');
    const transResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStatisticsData',
        type: 'transactions',
        filters: { timeRange: 'month' },
        maNhanVien: window.userInfo?.maNhanVien || ''
      })
    });
    const transResult = await transResponse.json();
    console.log('✅ Transactions result:', transResult);
  } catch (error) {
    console.error('❌ Transactions API error:', error);
  }
  
  // Test 2: getStatisticsData - expenses  
  try {
    console.log('📊 Testing expenses data...');
    const expResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStatisticsData',
        type: 'expenses',
        filters: { timeRange: 'month' }
      })
    });
    const expResult = await expResponse.json();
    console.log('✅ Expenses result:', expResult);
  } catch (error) {
    console.error('❌ Expenses API error:', error);
  }
  
  // Test 3: getAccountUtilization
  try {
    console.log('📊 Testing account utilization...');
    const accResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getAccountUtilization'
      })
    });
    const accResult = await accResponse.json();
    console.log('✅ Account utilization result:', accResult);
  } catch (error) {
    console.error('❌ Account utilization API error:', error);
  }
  
  // Test 4: getEmployeeList
  try {
    console.log('📊 Testing employee list...');
    const empResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEmployeeList'
      })
    });
    const empResult = await empResponse.json();
    console.log('✅ Employee list result:', empResult);
  } catch (error) {
    console.error('❌ Employee list API error:', error);
  }
}

// Gán vào window để có thể gọi từ console
window.debugStatisticsAPI = debugStatisticsAPI;

// Thêm vào statisticsHandler.js - fallback implementation
export async function updateStatisticsFallback() {
  console.log('🔄 Cập nhật thống kê (fallback mode)...');
  
  try {
    // Sử dụng API getTransactions đơn giản thay vì getStatisticsData
    const { BACKEND_URL } = getConstants();
    
    // Get transactions data
    const transResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getTransactions',
        maNhanVien: window.userInfo?.maNhanVien || '',
        vaiTro: window.userInfo?.vaiTro || '',
        giaoDichNhinThay: window.userInfo?.giaoDichNhinThay || '',
        nhinThayGiaoDichCuaAi: window.userInfo?.nhinThayGiaoDichCuaAi || ''
      })
    });
    
    const transResult = await transResponse.json();
    console.log('📈 Transactions result:', transResult);
    
    if (transResult.status !== 'success') {
      throw new Error('Cannot get transactions: ' + transResult.message);
    }
    
    const transactions = transResult.data || [];
    console.log('✅ Got', transactions.length, 'transactions');
    
    // Get expenses data
    let expenses = [];
    try {
      const expResponse = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getExpenseStats'
        })
      });
      
      const expResult = await expResponse.json();
      if (expResult.status === 'success') {
        expenses = expResult.data || [];
        console.log('✅ Got', expenses.length, 'expenses');
      }
    } catch (expError) {
      console.warn('⚠️ Could not get expenses:', expError);
    }
    
    // Filter data by current time range
    const filters = getFilterValues();
    const filteredTransactions = filterTransactionsByDate(transactions, filters);
    const filteredExpenses = filterExpensesByDate(expenses, filters);
    
    console.log('📊 Filtered transactions:', filteredTransactions.length);
    console.log('📊 Filtered expenses:', filteredExpenses.length);
    
    // Update KPI cards
    updateKPICardsFallback(filteredTransactions, filteredExpenses);
    
    // Update charts
    updateChartsFallback(filteredTransactions, filteredExpenses);
    
    // Update tables
    updateTablesFallback(filteredTransactions, filteredExpenses);
    
    console.log('✅ Statistics updated successfully (fallback mode)');
    
  } catch (error) {
    console.error('❌ Error in fallback statistics:', error);
    showErrorState(error.message);
  }
}

function filterTransactionsByDate(transactions, filters) {
  if (!filters.startDate || !filters.endDate) return transactions;
  
  const startDate = new Date(filters.startDate.replace(/\//g, '-'));
  const endDate = new Date(filters.endDate.replace(/\//g, '-'));
  
  return transactions.filter(t => {
    if (!t.transactionDate) return false;
    const tDate = new Date(t.transactionDate.replace(/\//g, '-'));
    return tDate >= startDate && tDate <= endDate;
  });
}

function filterExpensesByDate(expenses, filters) {
  if (!filters.startDate || !filters.endDate) return expenses;
  
  const startDate = new Date(filters.startDate.replace(/\//g, '-'));
  const endDate = new Date(filters.endDate.replace(/\//g, '-'));
  
  return expenses.filter(e => {
    if (!e.date) return false;
    const eDate = new Date(e.date.replace(/\//g, '-'));
    return eDate >= startDate && eDate <= endDate;
  });
}

function updateKPICardsFallback(transactions, expenses) {
  const revenue = transactions.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  const expense = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const profit = revenue - expense;
  const transactionCount = transactions.length;
  const aov = transactionCount > 0 ? revenue / transactionCount : 0;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  console.log('📊 KPI Data:', { revenue, expense, profit, transactionCount, aov, profitMargin });
  
  updateElement('totalRevenue', formatCurrency(revenue));
  updateElement('totalExpense', formatCurrency(expense));
  updateElement('totalProfit', formatCurrency(profit));
  updateElement('totalTransactions', transactionCount.toLocaleString());
  updateElement('averageOrderValue', formatCurrency(aov));
  updateElement('profitMargin', profitMargin.toFixed(1) + '%');
}

// Thay thế function updateChartsFallback trong statisticsHandler.js
function updateChartsFallback(transactions, expenses) {
  console.log('📈 Updating charts (fallback)...');
  
  // Đợi DOM sẵn sàng
  setTimeout(() => {
    createRevenueChartRobust(transactions);
    createProductChartRobust(transactions);
  }, 100);
}

function createRevenueChartRobust(transactions) {
  console.log('📊 Creating revenue chart...');
  
  // Check prerequisites
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js not loaded');
    return;
  }
  
  const ctx = document.getElementById('revenueTrendChart');
  if (!ctx) {
    console.error('❌ Revenue chart canvas not found');
    return;
  }
  
  // Check if canvas is visible
  const rect = ctx.getBoundingClientRect();
  console.log('📐 Canvas dimensions:', rect);
  
  if (rect.width === 0 || rect.height === 0) {
    console.warn('⚠️ Canvas has zero dimensions, trying to fix...');
    
    // Force canvas size
    ctx.style.width = '400px';
    ctx.style.height = '200px';
    ctx.width = 400;
    ctx.height = 200;
    
    console.log('📐 Canvas size after fix:', ctx.getBoundingClientRect());
  }
  
  // Prepare data
  const revenueByDate = {};
  transactions.forEach(t => {
    const date = t.transactionDate;
    if (!revenueByDate[date]) revenueByDate[date] = 0;
    revenueByDate[date] += parseFloat(t.revenue) || 0;
  });
  
  console.log('📊 Revenue by date:', revenueByDate);
  
  if (Object.keys(revenueByDate).length === 0) {
    console.warn('⚠️ No revenue data to display');
    return;
  }
  
  const sortedDates = Object.keys(revenueByDate).sort();
  const labels = sortedDates.map(date => formatDateLabel(date));
  const data = sortedDates.map(date => revenueByDate[date]);
  
  console.log('📊 Chart data prepared:', { 
    labels: labels.slice(0, 5), // Show first 5 for brevity
    data: data.slice(0, 5),
    totalPoints: labels.length 
  });
  
  try {
    // Destroy existing chart
    if (window.revenueChart) {
      console.log('🗑️ Destroying existing revenue chart');
      window.revenueChart.destroy();
      window.revenueChart = null;
    }
    
    // Create new chart
    console.log('🎨 Creating new revenue chart...');
    window.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: data,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Ngày'
            }
          },
          y: {
            beginAtZero: true,
            display: true,
            title: {
              display: true,
              text: 'Doanh thu (VNĐ)'
            },
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Xu hướng doanh thu theo ngày'
          },
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
    
    console.log('✅ Revenue chart created successfully');
    
  } catch (error) {
    console.error('❌ Error creating revenue chart:', error);
    
    // Fallback: Show chart data in table format
    console.log('📋 Fallback - showing data in console table:');
    console.table(sortedDates.map((date, i) => ({
      date: date,
      revenue: formatCurrency(data[i])
    })));
  }
}

function createProductChartRobust(transactions) {
  console.log('📊 Creating product chart...');
  
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js not loaded');
    return;
  }
  
  const ctx = document.getElementById('productPerfChart');
  if (!ctx) {
    console.error('❌ Product chart canvas not found');
    return;
  }
  
  // Check canvas dimensions
  const rect = ctx.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    ctx.style.width = '400px';
    ctx.style.height = '200px';
    ctx.width = 400;
    ctx.height = 200;
  }
  
  // Prepare data
  const productRevenue = {};
  transactions.forEach(t => {
    const product = `${t.softwareName} - ${t.softwarePackage}`;
    if (!productRevenue[product]) productRevenue[product] = 0;
    productRevenue[product] += parseFloat(t.revenue) || 0;
  });
  
  console.log('📊 Product revenue:', productRevenue);
  
  if (Object.keys(productRevenue).length === 0) {
    console.warn('⚠️ No product data to display');
    return;
  }
  
  // Get top 8 products
  const sorted = Object.entries(productRevenue)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);
  
  const labels = sorted.map(([product,]) => {
    // Truncate long product names
    return product.length > 25 ? product.substring(0, 25) + '...' : product;
  });
  const data = sorted.map(([, revenue]) => revenue);
  const colors = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', 
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
  ];
  
  try {
    // Destroy existing chart
    if (window.productChart) {
      console.log('🗑️ Destroying existing product chart');
      window.productChart.destroy();
      window.productChart = null;
    }
    
    // Create new chart
    console.log('🎨 Creating new product chart...');
    window.productChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Top sản phẩm theo doanh thu'
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 10,
              usePointStyle: true
            }
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
    
    console.log('✅ Product chart created successfully');
    
  } catch (error) {
    console.error('❌ Error creating product chart:', error);
    
    // Fallback
    console.log('📋 Fallback - showing product data:');
    console.table(sorted.map(([product, revenue]) => ({
      product: product,
      revenue: formatCurrency(revenue)
    })));
  }
}

// Helper function for currency formatting
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

// Helper function for date formatting
function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('/');
  return `${day}/${month}`;
}

// Export for testing
window.createRevenueChartRobust = createRevenueChartRobust;
window.createProductChartRobust = createProductChartRobust;

function updateProductChartFallback(transactions) {
  const productRevenue = {};
  transactions.forEach(t => {
    const product = `${t.softwareName} - ${t.softwarePackage}`;
    if (!productRevenue[product]) productRevenue[product] = 0;
    productRevenue[product] += parseFloat(t.revenue) || 0;
  });
  
  console.log('📊 Product revenue:', productRevenue);
  
  const ctx = document.getElementById('productPerfChart');
  if (ctx && typeof Chart !== 'undefined') {
    const sorted = Object.entries(productRevenue)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    const labels = sorted.map(([product,]) => product);
    const data = sorted.map(([, revenue]) => revenue);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
    
    if (window.productChart) {
      window.productChart.destroy();
    }
    
    window.productChart = new Chart(ctx, {
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
          }
        }
      }
    });
    
    console.log('✅ Product chart created');
  }
}

function updateTablesFallback(transactions, expenses) {
  // Implement simple table updates
  console.log('📋 Updating tables (fallback)...');
  // You can implement basic table updates here
}

// Gán vào window để test
window.updateStatisticsFallback = updateStatisticsFallback;