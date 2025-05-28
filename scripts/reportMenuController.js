/**
 * reportMenuController.js
 * 
 * Controller cho menu báo cáo thống kê
 * Xử lý chuyển đổi giữa các trang báo cáo và render nội dung
 */

// State management
const reportState = {
  currentReport: 'overview',
  isLoading: false
};

/**
 * Initialize report menu controller
 */
export function initReportMenu() {
  console.log('🎮 Initializing report menu controller');
  
  // Check if containers exist
  console.log('🔍 Checking containers:', {
    revenueChart: !!document.getElementById('revenueChart'),
    topProducts: !!document.getElementById('topProducts'),
    topCustomers: !!document.getElementById('topCustomers'),
    summaryStats: !!document.getElementById('summaryStats')
  });
  
  // Setup menu click handlers
  setupMenuHandlers();
  
  // Load default report
  loadReport('overview');
  
  // Setup global functions
  window.refreshCurrentReport = refreshCurrentReport;
  window.exportCurrentReport = exportCurrentReport;
  
  console.log('✅ Report menu controller initialized');
}

/**
 * Setup menu item click handlers
 */
function setupMenuHandlers() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const reportType = item.dataset.report;
      
      // Update active menu item
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      
      // Load corresponding report
      loadReport(reportType);
    });
  });
}

/**
 * Load a specific report
 * @param {string} reportType - Type of report to load
 */
async function loadReport(reportType) {
  if (reportState.isLoading) return;
  
  console.log(`📊 Loading report: ${reportType}`);
  
  reportState.currentReport = reportType;
  reportState.isLoading = true;
  
  // Hide all report pages
  const reportPages = document.querySelectorAll('.report-page');
  reportPages.forEach(page => page.classList.remove('active'));
  
  // Show selected report page
  const selectedPage = document.getElementById(`report-${reportType}`);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }
  
  // Load report content based on type
  try {
    switch (reportType) {
      case 'overview':
        await loadOverviewReport();
        break;
      case 'revenue':
        await loadRevenueReport();
        break;
      case 'expense':
        await loadExpenseReport();
        break;
      case 'customer':
        await loadCustomerReport();
        break;
      case 'software':
        await loadSoftwareReport();
        break;
      case 'employee':
        await loadEmployeeReport();
        break;
      case 'finance':
        await loadFinanceReport();
        break;
      default:
        console.warn(`Unknown report type: ${reportType}`);
    }
  } catch (error) {
    console.error(`Error loading report ${reportType}:`, error);
    showError(`Không thể tải báo cáo ${reportType}`);
  } finally {
    reportState.isLoading = false;
  }
}

/**
 * Load overview report (Tổng quan kinh doanh)
 */
async function loadOverviewReport() {
  console.log('📈 Loading overview report');
  console.log('🔍 Checking data availability:', {
    transactionList: window.transactionList ? window.transactionList.length : 0,
    expenseList: window.expenseList ? window.expenseList.length : 0
  });
  
  // Financial dashboard đã được render từ statisticsUIController
  // Chỉ cần trigger refresh nếu cần
  if (window.refreshStatisticsWithFilters) {
    window.refreshStatisticsWithFilters(window.globalFilters);
  }
  
  // Load additional overview components
  console.log('🚀 Loading overview components...');
  await Promise.all([
    loadTopProducts(),
    loadTopCustomers(),
    loadSummaryStats(),
    loadRevenueChart()
  ]);
  console.log('✅ Overview components loaded');
}

/**
 * Load revenue report (Phân tích doanh thu)
 */
async function loadRevenueReport() {
  console.log('💰 Loading revenue report');
  
  const transactionData = window.transactionList || [];
  
  // Render các component doanh thu
  await Promise.all([
    renderRevenueByProduct(transactionData),
    renderRevenueByPackage(transactionData),
    renderRevenueByEmployee(transactionData),
    renderRevenueComparison(transactionData),
    renderRevenueTrend(transactionData)
  ]);
}

/**
 * Load expense report (Phân tích chi phí)
 */
async function loadExpenseReport() {
  console.log('💸 Loading expense report');
  
  const expenseData = window.expenseList || [];
  
  // Render existing monthly summary table
  if (window.renderExpenseStats) {
    window.renderExpenseStats();
  }
  
  // Render additional expense components
  await Promise.all([
    renderExpenseByCategory(expenseData),
    renderRecurringExpenses(expenseData),
    renderPaymentMethods(expenseData),
    renderTopExpenses(expenseData)
  ]);
}

/**
 * Load customer report (Quản lý khách hàng)
 */
async function loadCustomerReport() {
  console.log('👥 Loading customer report');
  
  const transactionData = window.transactionList || [];
  
  await Promise.all([
    renderCustomerOverview(transactionData),
    renderExpiringCustomers(transactionData),
    renderRenewalRate(transactionData),
    renderTransactionTypes(transactionData),
    renderCustomerLifetimeValue(transactionData)
  ]);
}

/**
 * Load software report (Tài khoản phần mềm)
 */
async function loadSoftwareReport() {
  console.log('💻 Loading software report');
  
  // Need to fetch software data from PhanMem sheet
  // For now, analyze from transaction data
  const transactionData = window.transactionList || [];
  const expenseData = window.expenseList || [];
  
  await Promise.all([
    renderSoftwareOverview(transactionData),
    renderExpiringSoftware(transactionData),
    renderSoftwareROI(transactionData, expenseData),
    renderSoftwareCostRevenue(transactionData, expenseData)
  ]);
}

/**
 * Load employee report (Báo cáo nhân viên)
 */
async function loadEmployeeReport() {
  console.log('👔 Loading employee report');
  
  const transactionData = window.transactionList || [];
  
  await Promise.all([
    renderEmployeePerformance(transactionData),
    renderTransactionCount(transactionData),
    renderEmployeeRanking(transactionData),
    renderPerformanceChart(transactionData),
    renderEmployeeKPI(transactionData)
  ]);
}

/**
 * Load finance report (Quản lý tài chính)
 */
async function loadFinanceReport() {
  console.log('🏦 Loading finance report');
  
  // Need to fetch bank data from NganHang/Vi sheet
  // For now, show placeholder
  showComingSoon('finance');
}

// ========== RENDER FUNCTIONS ==========

/**
 * Load top products
 */
async function loadTopProducts() {
  const container = document.getElementById('topProducts');
  if (!container) return;
  
  let transactionData = window.transactionList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange);
  }
  
  const productRevenue = {};
  
  // Calculate revenue by product
  transactionData.forEach(transaction => {
    const product = transaction.softwareName || 'Khác';
    const revenue = parseFloat(transaction.revenue) || 0;
    productRevenue[product] = (productRevenue[product] || 0) + revenue;
  });
  
  // Sort and get top 5
  const topProducts = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Get period label
  const periodLabel = getPeriodLabel();
  
  // Render with new design
  container.innerHTML = `
    <div class="top-section products">
      <h3>
        🏆 Top 5 Phần Mềm Bán Chạy
        <span class="period-selector">${periodLabel}</span>
      </h3>
      <div class="top-list">
        ${topProducts.map(([product, revenue], index) => `
          <div class="top-item">
            <div class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">
              ${index + 1}
            </div>
            <div class="item-info">
              <div class="item-name">${product}</div>
              <div class="item-detail">Doanh thu ${periodLabel.toLowerCase()}</div>
            </div>
            <div class="item-value">${formatCurrency(revenue)}</div>
          </div>
        `).join('')}
        ${topProducts.length === 0 ? '<p style="text-align: center; opacity: 0.7;">Chưa có dữ liệu</p>' : ''}
      </div>
    </div>
  `;
}

/**
 * Load top customers
 */
async function loadTopCustomers() {
  const container = document.getElementById('topCustomers');
  if (!container) return;
  
  let transactionData = window.transactionList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange);
  }
  
  const customerRevenue = {};
  
  // Calculate revenue by customer
  transactionData.forEach(transaction => {
    const customer = transaction.customerName || 'Khách lẻ';
    const revenue = parseFloat(transaction.revenue) || 0;
    customerRevenue[customer] = (customerRevenue[customer] || 0) + revenue;
  });
  
  // Sort and get top 5
  const topCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Get period label
  const periodLabel = getPeriodLabel();
  
  // Render with new design
  container.innerHTML = `
    <div class="top-section customers">
      <h3>
        👑 Top 5 Khách Hàng VIP
        <span class="period-selector">${periodLabel}</span>
      </h3>
      <div class="top-list">
        ${topCustomers.map(([customer, revenue], index) => `
          <div class="top-item">
            <div class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">
              ${index + 1}
            </div>
            <div class="item-info">
              <div class="item-name">${customer}</div>
              <div class="item-detail">Tổng chi tiêu ${periodLabel.toLowerCase()}</div>
            </div>
            <div class="item-value">${formatCurrency(revenue)}</div>
          </div>
        `).join('')}
        ${topCustomers.length === 0 ? '<p style="text-align: center; opacity: 0.7;">Chưa có dữ liệu</p>' : ''}
      </div>
    </div>
  `;
}

/**
 * Load summary statistics
 */
async function loadSummaryStats() {
  const container = document.getElementById('summaryStats');
  if (!container) return;
  
  let transactionData = window.transactionList || [];
  let expenseData = window.expenseList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange);
    expenseData = filterDataByDateRange(expenseData, window.globalFilters.dateRange);
  }
  
  // Calculate statistics
  const totalTransactions = transactionData.length;
  const totalCustomers = new Set(transactionData.map(t => t.customerName)).size;
  const totalSoftware = new Set(transactionData.map(t => t.softwareName)).size;
  const totalExpenseItems = expenseData.length;
  
  // Render summary stats
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-value">${totalTransactions}</div>
      <div class="stat-label">Giao dịch</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">👥</div>
      <div class="stat-value">${totalCustomers}</div>
      <div class="stat-label">Khách hàng</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💻</div>
      <div class="stat-value">${totalSoftware}</div>
      <div class="stat-label">Phần mềm</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💸</div>
      <div class="stat-value">${totalExpenseItems}</div>
      <div class="stat-label">Khoản chi</div>
    </div>
  `;
}

/**
 * Load revenue chart
 */
async function loadRevenueChart() {
  console.log('📈 loadRevenueChart called');
  const container = document.getElementById('revenueChart');
  console.log('📦 Container found:', !!container);
  
  if (!container) {
    console.error('❌ Container revenueChart not found');
    return;
  }
  
  try {
    console.log('📥 Importing chart module...');
    // Import chart module
    const { renderRevenueExpenseChart, addRevenueExpenseChartStyles } = await import('./revenueExpenseChart.js');
    console.log('✅ Chart module imported successfully');
    
    // Add styles
    addRevenueExpenseChartStyles();
    console.log('🎨 Styles added');
    
    // Get data
    let transactionData = window.transactionList || [];
    let expenseData = window.expenseList || [];
    
    // Apply filters if exists
    if (window.globalFilters) {
      console.log('🔍 Applying filters:', window.globalFilters);
      const { filterDataByDateRange } = await import('./financialDashboard.js');
      
      // Apply date and software filters
      transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange, window.globalFilters);
      expenseData = filterDataByDateRange(expenseData, window.globalFilters.dateRange, window.globalFilters);
    }
    
    console.log('📊 Data loaded:', {
      transactions: transactionData.length,
      expenses: expenseData.length,
      filtered: !!(window.globalFilters && window.globalFilters.dateRange)
    });
    
    // Render chart
    console.log('🖥️ Rendering chart...');
    renderRevenueExpenseChart(transactionData, expenseData, 'revenueChart');
    
    console.log('✅ Revenue/Expense chart loaded successfully');
  } catch (error) {
    console.error('❌ Error loading revenue chart:', error);
    console.error('🔍 Error details:', error.stack);
    container.innerHTML = `
      <div style="background: #fee; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #c53030;">Lỗi khi tải biểu đồ: ${error.message}</p>
      </div>
    `;
  }
}

/**
 * Get period label from global filters
 */
function getPeriodLabel() {
  if (!window.globalFilters || !window.globalFilters.dateRange) return "Tất cả";
  
  const { start, end } = window.globalFilters.dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Kiểm tra nếu là tháng đầy đủ
  const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  if (startDate.getDate() === 1 && endDate.getDate() === endOfMonth.getDate() && 
      startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `Tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
  }
  
  // Kiểm tra nếu là năm đầy đủ
  if (startDate.getDate() === 1 && startDate.getMonth() === 0 && 
      endDate.getDate() === 31 && endDate.getMonth() === 11 && 
      startDate.getFullYear() === endDate.getFullYear()) {
    return `Năm ${startDate.getFullYear()}`;
  }
  
  // Ngược lại hiển thị khoảng thời gian
  return `${start} - ${end}`;
}

// ========== PLACEHOLDER FUNCTIONS ==========
// These need to be implemented with actual logic

async function renderRevenueByProduct(data) {
  const container = document.getElementById('revenueByProduct');
  if (container) {
    container.innerHTML = '<p>📊 Biểu đồ doanh thu theo sản phẩm đang được phát triển...</p>';
  }
}

async function renderRevenueByPackage(data) {
  const container = document.getElementById('revenueByPackage');
  if (container) {
    container.innerHTML = '<p>📦 Doanh thu theo gói phần mềm đang được phát triển...</p>';
  }
}

async function renderRevenueByEmployee(data) {
  const container = document.getElementById('revenueByEmployee');
  if (container) {
    container.innerHTML = '<p>👤 Doanh thu theo nhân viên đang được phát triển...</p>';
  }
}

async function renderRevenueComparison(data) {
  const container = document.getElementById('revenueComparison');
  if (container) {
    container.innerHTML = '<p>📈 So sánh doanh thu đang được phát triển...</p>';
  }
}

async function renderRevenueTrend(data) {
  const container = document.getElementById('revenueTrend');
  if (!container) return;
  
  try {
    // Import chart module
    const { renderRevenueExpenseChart, addRevenueExpenseChartStyles } = await import('./revenueExpenseChart.js');
    
    // Add styles
    addRevenueExpenseChartStyles();
    
    // Get data
    const transactionData = window.transactionList || [];
    const expenseData = window.expenseList || [];
    
    // Render chart
    renderRevenueExpenseChart(transactionData, expenseData, 'revenueTrend');
    
    console.log('✅ Revenue trend chart loaded successfully');
  } catch (error) {
    console.error('❌ Error loading revenue trend:', error);
    container.innerHTML = `<p style="color: #c53030;">Lỗi khi tải biểu đồ xu hướng: ${error.message}</p>`;
  }
}

async function renderExpenseByCategory(data) {
  const container = document.getElementById('expenseByCategory');
  if (!container) return;
  
  try {
    // Import chart module
    const { renderExpenseCategoryChart, addExpenseCategoryChartStyles } = await import('./expenseCategoryChart.js');
    
    // Add styles
    addExpenseCategoryChartStyles();
    
    // Render chart
    renderExpenseCategoryChart(data, 'expenseByCategory');
    
    console.log('✅ Expense category chart loaded successfully');
  } catch (error) {
    console.error('❌ Error loading expense category chart:', error);
    container.innerHTML = `<p style="color: #c53030;">Lỗi khi tải biểu đồ: ${error.message}</p>`;
  }
}

async function renderRecurringExpenses(data) {
  const container = document.getElementById('recurringExpenses');
  if (container) {
    container.innerHTML = '<p>🔄 Chi phí định kỳ đang được phát triển...</p>';
  }
}

async function renderPaymentMethods(data) {
  const container = document.getElementById('paymentMethods');
  if (container) {
    container.innerHTML = '<p>💳 Phương thức thanh toán đang được phát triển...</p>';
  }
}

async function renderTopExpenses(data) {
  const container = document.getElementById('topExpenses');
  if (container) {
    container.innerHTML = '<p>💸 Top chi phí lớn nhất đang được phát triển...</p>';
  }
}

async function renderCustomerOverview(data) {
  const container = document.getElementById('customerOverview');
  if (container) {
    container.innerHTML = '<p>👥 Tổng quan khách hàng đang được phát triển...</p>';
  }
}

async function renderExpiringCustomers(data) {
  const container = document.getElementById('expiringCustomers');
  if (container) {
    container.innerHTML = '<p>⏰ Khách hàng sắp hết hạn đang được phát triển...</p>';
  }
}

async function renderRenewalRate(data) {
  const container = document.getElementById('renewalRate');
  if (container) {
    container.innerHTML = '<p>🔄 Tỷ lệ gia hạn đang được phát triển...</p>';
  }
}

async function renderTransactionTypes(data) {
  const container = document.getElementById('transactionTypes');
  if (container) {
    container.innerHTML = '<p>📊 Phân tích loại giao dịch đang được phát triển...</p>';
  }
}

async function renderCustomerLifetimeValue(data) {
  const container = document.getElementById('customerLifetimeValue');
  if (container) {
    container.innerHTML = '<p>💰 Customer Lifetime Value đang được phát triển...</p>';
  }
}

async function renderSoftwareOverview(data) {
  const container = document.getElementById('softwareOverview');
  if (container) {
    container.innerHTML = '<p>💻 Tổng quan phần mềm đang được phát triển...</p>';
  }
}

async function renderExpiringSoftware(data) {
  const container = document.getElementById('expiringSoftware');
  if (container) {
    container.innerHTML = '<p>⏰ Phần mềm sắp hết hạn đang được phát triển...</p>';
  }
}

async function renderSoftwareROI(transactionData, expenseData) {
  const container = document.getElementById('softwareROI');
  if (container) {
    container.innerHTML = '<p>📈 ROI phần mềm đang được phát triển...</p>';
  }
}

async function renderSoftwareCostRevenue(transactionData, expenseData) {
  const container = document.getElementById('softwareCostRevenue');
  if (container) {
    container.innerHTML = '<p>💰 Chi phí vs Doanh thu đang được phát triển...</p>';
  }
}

async function renderEmployeePerformance(data) {
  const container = document.getElementById('employeePerformance');
  if (container) {
    container.innerHTML = '<p>📊 Hiệu suất nhân viên đang được phát triển...</p>';
  }
}

async function renderTransactionCount(data) {
  const container = document.getElementById('transactionCount');
  if (container) {
    container.innerHTML = '<p>📈 Số lượng giao dịch đang được phát triển...</p>';
  }
}

async function renderEmployeeRanking(data) {
  const container = document.getElementById('employeeRanking');
  if (container) {
    container.innerHTML = '<p>🏆 Ranking nhân viên đang được phát triển...</p>';
  }
}

async function renderPerformanceChart(data) {
  const container = document.getElementById('performanceChart');
  if (container) {
    container.innerHTML = '<p>📊 Biểu đồ hiệu suất đang được phát triển...</p>';
  }
}

async function renderEmployeeKPI(data) {
  const container = document.getElementById('employeeKPI');
  if (container) {
    container.innerHTML = '<p>🎯 KPI nhân viên đang được phát triển...</p>';
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Refresh current report
 */
function refreshCurrentReport() {
  console.log('🔄 Refreshing current report:', reportState.currentReport);
  loadReport(reportState.currentReport);
}

/**
 * Export current report
 */
function exportCurrentReport() {
  console.log('📤 Exporting current report:', reportState.currentReport);
  // TODO: Implement export logic
  alert('Chức năng xuất báo cáo đang được phát triển');
}

/**
 * Show coming soon message
 * @param {string} feature - Feature name
 */
function showComingSoon(feature) {
  const container = document.querySelector('.report-page.active .report-content');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h3>🚧 Đang phát triển</h3>
        <p>Chức năng ${feature} sẽ sớm được cập nhật</p>
      </div>
    `;
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = 'error';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

