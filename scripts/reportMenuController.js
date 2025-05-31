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
  
  // Ensure data is loaded before proceeding
  await ensureDataIsLoaded();
  
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
 * Ensure data is loaded before rendering reports
 */
async function ensureDataIsLoaded() {
  let attempts = 0;
  const maxAttempts = 50; // Wait up to 5 seconds
  
  while (attempts < maxAttempts && (!window.transactionList || !window.expenseList)) {
    console.log(`⏳ Waiting for data to load... (attempt ${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  // If still no data after waiting, try to trigger load
  if (!window.transactionList || window.transactionList.length === 0) {
    console.log('🔄 No transaction data found, triggering load...');
    if (window.loadTransactions) {
      try {
        await window.loadTransactions();
      } catch (error) {
        console.warn('⚠️ Failed to load transactions:', error);
      }
    }
  }
  
  // Also ensure expense data is loaded
  if (!window.expenseList || window.expenseList.length === 0) {
    console.log('🔄 No expense data found, trying to load from statistics...');
    // Try to get expense data from statistics module
    if (window.loadStatisticsData && typeof window.loadStatisticsData === 'function') {
      try {
        await window.loadStatisticsData();
      } catch (error) {
        console.warn('⚠️ Failed to load expense data:', error);
      }
    }
  }
  
  // Use fallback data if still no data
  if (!window.transactionList) window.transactionList = [];
  if (!window.expenseList) window.expenseList = [];
  
  console.log('✅ Data ensured:', {
    transactions: window.transactionList.length,
    expenses: window.expenseList.length
  });
}

/**
 * Load revenue report (Phân tích doanh thu)
 */
async function loadRevenueReport() {
  console.log('💰 Loading revenue report');
  
  let transactionData = window.transactionList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange, window.globalFilters);
    console.log('🔍 Applied date filter:', {
      original: window.transactionList.length,
      filtered: transactionData.length,
      dateRange: window.globalFilters.dateRange
    });
  }
  
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
  
  let expenseData = window.expenseList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    expenseData = filterDataByDateRange(expenseData, window.globalFilters.dateRange, window.globalFilters);
    console.log('🔍 Applied date filter:', {
      original: window.expenseList.length,
      filtered: expenseData.length,
      dateRange: window.globalFilters.dateRange
    });
  }
  
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
  
  let transactionData = window.transactionList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange, window.globalFilters);
    console.log('🔍 Applied date filter:', {
      original: window.transactionList.length,
      filtered: transactionData.length,
      dateRange: window.globalFilters.dateRange
    });
  }
  
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
  let transactionData = window.transactionList || [];
  let expenseData = window.expenseList || [];
  
  // Apply date filter to transactions only
  // Keep ALL expenses for allocation calculation, but filter transactions by date
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange, window.globalFilters);
    // DO NOT filter expenseData - we need all expenses for allocation calculation
    console.log('🔍 Applied date filter to transactions only:', {
      originalTransactions: window.transactionList.length,
      filteredTransactions: transactionData.length,
      totalExpenses: expenseData.length,
      dateRange: window.globalFilters.dateRange,
      note: 'Expenses not filtered - needed for allocation calculation'
    });
  }
  
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
  
  let transactionData = window.transactionList || [];
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange, window.globalFilters);
    console.log('🔍 Applied date filter:', {
      original: window.transactionList.length,
      filtered: transactionData.length,
      dateRange: window.globalFilters.dateRange
    });
  }
  
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
  
  console.log('🏆 loadTopProducts:', {
    totalTransactions: transactionData.length,
    hasGlobalFilters: !!(window.globalFilters),
    hasDateRange: !!(window.globalFilters && window.globalFilters.dateRange)
  });
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange);
    console.log('🔍 After filtering:', transactionData.length, 'transactions');
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
  
  console.log('🔢 Product revenue calculated:', {
    totalProducts: Object.keys(productRevenue).length,
    topProducts: topProducts.length,
    sampleProduct: topProducts[0]
  });
  
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
  
  console.log('📊 loadSummaryStats:', {
    initialTransactions: transactionData.length,
    initialExpenses: expenseData.length,
    hasGlobalFilters: !!(window.globalFilters),
    hasDateRange: !!(window.globalFilters && window.globalFilters.dateRange)
  });
  
  // Apply date filter if exists
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    transactionData = filterDataByDateRange(transactionData, window.globalFilters.dateRange);
    expenseData = filterDataByDateRange(expenseData, window.globalFilters.dateRange);
    console.log('🔍 After filtering:', {
      transactions: transactionData.length,
      expenses: expenseData.length
    });
  }
  
  // Calculate statistics
  const totalTransactions = transactionData.length;
  const totalCustomers = new Set(transactionData.map(t => t.customerName)).size;
  const totalSoftware = new Set(transactionData.map(t => t.softwareName)).size;
  const totalExpenseItems = expenseData.length;
  
  console.log('📈 Summary stats calculated:', {
    totalTransactions,
    totalCustomers,
    totalSoftware,
    totalExpenseItems
  });
  
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
    await renderRevenueExpenseChart(transactionData, expenseData, 'revenueChart');
    
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
    await renderRevenueExpenseChart(transactionData, expenseData, 'revenueTrend');
    
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
  if (!container) return;
  
  try {
    // Calculate customer metrics
    const customerMap = new Map();
    const today = new Date();
    
    data.forEach(transaction => {
      const customer = transaction.customerName || 'Khách lẻ';
      if (!customerMap.has(customer)) {
        customerMap.set(customer, {
          name: customer,
          totalRevenue: 0,
          transactionCount: 0,
          firstTransaction: transaction.transactionDate,
          lastTransaction: transaction.transactionDate,
          packages: new Set(),
          status: transaction.status || 'active'
        });
      }
      
      const customerData = customerMap.get(customer);
      customerData.totalRevenue += parseFloat(transaction.revenue) || 0;
      customerData.transactionCount++;
      if (transaction.packageName) customerData.packages.add(transaction.packageName);
      
      // Update dates
      const transDate = new Date(transaction.transactionDate);
      const firstDate = new Date(customerData.firstTransaction);
      const lastDate = new Date(customerData.lastTransaction);
      
      if (transDate < firstDate) customerData.firstTransaction = transaction.transactionDate;
      if (transDate > lastDate) customerData.lastTransaction = transaction.transactionDate;
    });
    
    const customers = Array.from(customerMap.values());
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => {
      const lastDate = new Date(c.lastTransaction);
      const daysSinceLastTransaction = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      return daysSinceLastTransaction <= 90; // Active if transacted within 90 days
    }).length;
    
    const avgRevenuePerCustomer = customers.reduce((sum, c) => sum + c.totalRevenue, 0) / totalCustomers;
    const avgTransactionsPerCustomer = customers.reduce((sum, c) => sum + c.transactionCount, 0) / totalCustomers;
    
    container.innerHTML = `
      <div class="customer-overview">
        <h3>👥 Tổng quan Khách hàng</h3>
        <div class="overview-metrics">
          <div class="metric-card">
            <div class="metric-icon">👥</div>
            <div class="metric-content">
              <div class="metric-value">${totalCustomers}</div>
              <div class="metric-label">Tổng số khách hàng</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">✅</div>
            <div class="metric-content">
              <div class="metric-value">${activeCustomers}</div>
              <div class="metric-label">Khách hàng active</div>
              <div class="metric-sub">${Math.round(activeCustomers / totalCustomers * 100)}%</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${formatCurrency(avgRevenuePerCustomer)}</div>
              <div class="metric-label">Doanh thu TB/khách</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${avgTransactionsPerCustomer.toFixed(1)}</div>
              <div class="metric-label">Giao dịch TB/khách</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering customer overview:', error);
    container.innerHTML = '<p style="color: #c53030;">Lỗi khi tải tổng quan khách hàng</p>';
  }
}

async function renderExpiringCustomers(data) {
  const container = document.getElementById('expiringCustomers');
  if (!container) return;
  
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    // Group by customer and find latest expiry
    const customerExpiry = new Map();
    
    data.forEach(transaction => {
      if (!transaction.endDate) return;
      
      const customer = transaction.customerName || 'Khách lẻ';
      const endDate = new Date(transaction.endDate);
      
      if (!customerExpiry.has(customer) || endDate > customerExpiry.get(customer).endDate) {
        customerExpiry.set(customer, {
          name: customer,
          endDate: endDate,
          packageName: transaction.packageName || 'N/A',
          revenue: parseFloat(transaction.revenue) || 0,
          daysUntilExpiry: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
        });
      }
    });
    
    // Filter customers expiring within 30 days
    const expiringCustomers = Array.from(customerExpiry.values())
      .filter(c => c.endDate >= today && c.endDate <= thirtyDaysFromNow)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    
    container.innerHTML = `
      <div class="expiring-customers">
        <h3>⏰ Khách hàng sắp hết hạn (30 ngày)</h3>
        ${expiringCustomers.length === 0 ? 
          '<p style="text-align: center; color: #666;">Không có khách hàng nào sắp hết hạn</p>' :
          `<div class="expiring-list">
            ${expiringCustomers.slice(0, 10).map(customer => `
              <div class="expiring-item ${customer.daysUntilExpiry <= 7 ? 'urgent' : ''}">
                <div class="customer-info">
                  <div class="customer-name">${customer.name}</div>
                  <div class="package-name">${customer.packageName}</div>
                </div>
                <div class="expiry-info">
                  <div class="days-left ${customer.daysUntilExpiry <= 7 ? 'urgent' : ''}">
                    ${customer.daysUntilExpiry} ngày
                  </div>
                  <div class="expiry-date">${customer.endDate.toLocaleDateString('vi-VN')}</div>
                </div>
              </div>
            `).join('')}
          </div>`
        }
      </div>
    `;
  } catch (error) {
    console.error('Error rendering expiring customers:', error);
    container.innerHTML = '<p style="color: #c53030;">Lỗi khi tải danh sách khách hàng sắp hết hạn</p>';
  }
}

async function renderRenewalRate(data) {
  const container = document.getElementById('renewalRate');
  if (!container) return;
  
  try {
    // Group transactions by customer to track renewals
    const customerTransactions = new Map();
    
    data.forEach(transaction => {
      const customer = transaction.customerName || 'Khách lẻ';
      if (!customerTransactions.has(customer)) {
        customerTransactions.set(customer, []);
      }
      customerTransactions.get(customer).push(transaction);
    });
    
    // Calculate renewal metrics
    let totalExpired = 0;
    let totalRenewed = 0;
    const monthlyRenewals = {};
    
    customerTransactions.forEach((transactions, customer) => {
      // Sort by transaction date
      transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
      
      // Check for renewals (multiple transactions)
      if (transactions.length > 1) {
        totalRenewed++;
        
        // Track monthly renewals
        transactions.slice(1).forEach(trans => {
          const month = new Date(trans.transactionDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric' });
          monthlyRenewals[month] = (monthlyRenewals[month] || 0) + 1;
        });
      }
      
      // Check if expired (last transaction end date passed)
      const lastTransaction = transactions[transactions.length - 1];
      if (lastTransaction.endDate && new Date(lastTransaction.endDate) < new Date()) {
        totalExpired++;
      }
    });
    
    const totalCustomers = customerTransactions.size;
    const renewalRate = totalCustomers > 0 ? (totalRenewed / totalCustomers * 100) : 0;
    const churnRate = totalExpired > 0 ? (totalExpired / totalCustomers * 100) : 0;
    
    container.innerHTML = `
      <div class="renewal-rate-analysis">
        <h3>🔄 Phân tích Tỷ lệ Gia hạn</h3>
        <div class="renewal-metrics">
          <div class="renewal-card positive">
            <div class="renewal-icon">✅</div>
            <div class="renewal-content">
              <div class="renewal-value">${renewalRate.toFixed(1)}%</div>
              <div class="renewal-label">Tỷ lệ gia hạn</div>
              <div class="renewal-detail">${totalRenewed}/${totalCustomers} khách hàng</div>
            </div>
          </div>
          <div class="renewal-card negative">
            <div class="renewal-icon">❌</div>
            <div class="renewal-content">
              <div class="renewal-value">${churnRate.toFixed(1)}%</div>
              <div class="renewal-label">Tỷ lệ rời bỏ</div>
              <div class="renewal-detail">${totalExpired} khách hàng</div>
            </div>
          </div>
          <div class="renewal-card neutral">
            <div class="renewal-icon">📊</div>
            <div class="renewal-content">
              <div class="renewal-value">${(100 - churnRate).toFixed(1)}%</div>
              <div class="renewal-label">Tỷ lệ giữ chân</div>
              <div class="renewal-detail">Retention rate</div>
            </div>
          </div>
        </div>
        
        <div class="renewal-trend">
          <h4>📈 Xu hướng gia hạn theo tháng</h4>
          <div class="trend-chart">
            ${Object.entries(monthlyRenewals).slice(-6).map(([month, count]) => `
              <div class="trend-bar">
                <div class="bar" style="height: ${count * 20}px">${count}</div>
                <div class="month-label">${month}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering renewal rate:', error);
    container.innerHTML = '<p style="color: #c53030;">Lỗi khi tải tỷ lệ gia hạn</p>';
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

// State management for ROI table sorting
let roiSortState = {
  column: 'accountingROI', // Default sort by accounting ROI
  direction: 'desc' // desc = high to low, asc = low to high
};

/**
 * Sort ROI data by specified column and direction
 * @param {Array} data - ROI data array
 * @param {string} column - Column to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} - Sorted data
 */
function sortROIData(data, column, direction) {
  return data.sort((a, b) => {
    let valueA, valueB;
    
    switch (column) {
      case 'tenChuan':
        valueA = a.tenChuan || '';
        valueB = b.tenChuan || '';
        return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        
      case 'revenue':
        valueA = a.revenue || 0;
        valueB = b.revenue || 0;
        break;
        
      case 'allocatedExpense':
        valueA = a.allocatedExpense || 0;
        valueB = b.allocatedExpense || 0;
        break;
        
      case 'accountingProfit':
        valueA = a.accountingProfit || 0;
        valueB = b.accountingProfit || 0;
        break;
        
      case 'accountingROI':
        valueA = a.accountingROI || 0;
        valueB = b.accountingROI || 0;
        break;
        
      case 'accountingProfitMargin':
        valueA = a.accountingProfitMargin || 0;
        valueB = b.accountingProfitMargin || 0;
        break;
        
      case 'actualExpense':
        valueA = a.actualExpense || 0;
        valueB = b.actualExpense || 0;
        break;
        
      case 'actualProfit':
        valueA = a.actualProfit || 0;
        valueB = b.actualProfit || 0;
        break;
        
      case 'actualROI':
        valueA = a.actualROI || 0;
        valueB = b.actualROI || 0;
        break;
        
      case 'actualProfitMargin':
        valueA = a.actualProfitMargin || 0;
        valueB = b.actualProfitMargin || 0;
        break;
        
      default:
        valueA = a.accountingROI || 0;
        valueB = b.accountingROI || 0;
    }
    
    return direction === 'asc' ? valueA - valueB : valueB - valueA;
  });
}

/**
 * Handle column header click for sorting
 * @param {string} column - Column name
 */
function handleROISort(column) {
  // Toggle direction if same column, otherwise use desc as default
  if (roiSortState.column === column) {
    roiSortState.direction = roiSortState.direction === 'asc' ? 'desc' : 'asc';
  } else {
    roiSortState.column = column;
    roiSortState.direction = 'desc';
  }
  
  console.log('🔄 ROI Sort changed:', roiSortState);
  
  // Re-render the ROI table with new sorting
  const transactionData = window.transactionList || [];
  let expenseData = window.expenseList || [];
  
  // Apply transaction filter if exists (but keep all expenses for allocation)
  let filteredTransactions = transactionData;
  if (window.globalFilters && window.globalFilters.dateRange) {
    const { filterDataByDateRange } = window.financialDashboardModule || {};
    if (filterDataByDateRange) {
      filteredTransactions = filterDataByDateRange(transactionData, window.globalFilters.dateRange, window.globalFilters);
    }
  }
  
  renderSoftwareROI(filteredTransactions, expenseData);
}

// Make handleROISort globally available
window.handleROISort = handleROISort;

async function renderSoftwareROI(transactionData, expenseData) {
  const container = document.getElementById('softwareROI');
  if (!container) return;
  
  console.log('📊 renderSoftwareROI called with:', {
    transactions: transactionData.length,
    expenses: expenseData.length,
    sampleTransaction: transactionData[0],
    sampleExpense: expenseData[0],
    globalFilters: window.globalFilters
  });
  
  try {
    // Import the new ROI calculation function
    const { calculateROIByTenChuan } = await import('./statisticsCore.js');
    
    // Calculate ROI using Tên chuẩn matching with date range for allocation
    let roiData = calculateROIByTenChuan(transactionData, expenseData, window.globalFilters?.dateRange);
    
    console.log('💰 ROI calculated:', {
      roiItems: roiData.length,
      sampleROI: roiData[0]
    });
    
    // Apply sorting
    roiData = sortROIData(roiData, roiSortState.column, roiSortState.direction);
    
    // Get period label
    const periodLabel = getPeriodLabel();
    
    // Helper function to create sortable header
    const createSortableHeader = (column, label, extraStyle = '', extraAttrs = '') => {
      const isActive = roiSortState.column === column;
      const direction = isActive ? roiSortState.direction : 'desc';
      const arrow = isActive ? (direction === 'asc' ? ' ↑' : ' ↓') : ' ↕️';
      
      return `
        <th onclick="handleROISort('${column}')" 
            style="cursor: pointer; user-select: none; ${extraStyle} ${isActive ? 'background-color: #e8f4fd;' : ''}" 
            title="Click to sort ${direction === 'asc' ? 'high to low' : 'low to high'}"
            ${extraAttrs}>
          ${label}${arrow}
        </th>
      `;
    };
    
    // Calculate totals for summary row
    const totals = {
      revenue: 0,
      allocatedExpense: 0,
      accountingProfit: 0,
      actualExpense: 0,
      actualProfit: 0
    };
    
    roiData.forEach(item => {
      totals.revenue += item.revenue || 0;
      totals.allocatedExpense += item.allocatedExpense || 0;
      totals.accountingProfit += item.accountingProfit || 0;
      totals.actualExpense += item.actualExpense || 0;
      totals.actualProfit += item.actualProfit || 0;
    });
    
    // Calculate average ROI and margins
    const avgAccountingROI = totals.allocatedExpense > 0 
      ? ((totals.revenue - totals.allocatedExpense) / totals.allocatedExpense) * 100 : 0;
    const avgActualROI = totals.actualExpense > 0 
      ? ((totals.revenue - totals.actualExpense) / totals.actualExpense) * 100 : 0;
    const avgAccountingMargin = totals.revenue > 0 
      ? (totals.accountingProfit / totals.revenue) * 100 : 0;
    const avgActualMargin = totals.revenue > 0 
      ? (totals.actualProfit / totals.revenue) * 100 : 0;
    
    container.innerHTML = `
      <div class="software-roi-analysis">
        <h3>📈 Phân tích ROI Phần mềm <span class="period-indicator">${periodLabel}</span></h3>
        <div class="roi-table">
          <table>
            <thead>
              <tr>
                ${createSortableHeader('tenChuan', 'Phần mềm', '', 'rowspan="2"')}
                ${createSortableHeader('revenue', 'Doanh thu', '', 'rowspan="2"')}
                <th colspan="4" style="text-align: center; background: #e3f2fd;">Góc kế toán (Phân bổ)</th>
                <th colspan="4" style="text-align: center; background: #fff3e0;">Góc dòng tiền (Thực tế)</th>
              </tr>
              <tr>
                ${createSortableHeader('allocatedExpense', 'Chi phí phân bổ', 'background: #e3f2fd;')}
                ${createSortableHeader('accountingProfit', 'Lợi nhuận KT', 'background: #e3f2fd;')}
                ${createSortableHeader('accountingROI', 'ROI KT', 'background: #e3f2fd;')}
                ${createSortableHeader('accountingProfitMargin', 'Biên LN KT', 'background: #e3f2fd;')}
                ${createSortableHeader('actualExpense', 'Chi phí thực tế', 'background: #fff3e0;')}
                ${createSortableHeader('actualProfit', 'Lợi nhuận TT', 'background: #fff3e0;')}
                ${createSortableHeader('actualROI', 'ROI TT', 'background: #fff3e0;')}
                ${createSortableHeader('actualProfitMargin', 'Biên LN TT', 'background: #fff3e0;')}
              </tr>
            </thead>
            <tbody>
              <!-- Tổng giá trị -->
              <tr style="background-color: #f0f7ff; font-weight: bold; border-top: 2px solid #1976d2;">
                <td>
                  <div class="software-name">TổNG CỘNG</div>
                  <div class="transaction-count">${roiData.length} phần mềm</div>
                </td>
                <td class="revenue">${formatCurrency(totals.revenue)}</td>
                <!-- Góc kế toán -->
                <td class="cost" style="background: #e8f4fd;">${formatCurrency(totals.allocatedExpense)}</td>
                <td class="${totals.accountingProfit >= 0 ? 'profit' : 'loss'}" style="background: #e8f4fd;">${formatCurrency(totals.accountingProfit)}</td>
                <td class="roi ${avgAccountingROI >= 0 ? 'positive' : 'negative'}" style="background: #e8f4fd;">
                  ${avgAccountingROI > 0 ? '+' : ''}${avgAccountingROI.toFixed(1)}%
                </td>
                <td class="margin" style="background: #e8f4fd;">${avgAccountingMargin.toFixed(1)}%</td>
                <!-- Góc dòng tiền -->
                <td class="cost" style="background: #fff8f0;">${formatCurrency(totals.actualExpense)}</td>
                <td class="${totals.actualProfit >= 0 ? 'profit' : 'loss'}" style="background: #fff8f0;">${formatCurrency(totals.actualProfit)}</td>
                <td class="roi ${avgActualROI >= 0 ? 'positive' : 'negative'}" style="background: #fff8f0;">
                  ${avgActualROI > 0 ? '+' : ''}${avgActualROI.toFixed(1)}%
                </td>
                <td class="margin" style="background: #fff8f0;">${avgActualMargin.toFixed(1)}%</td>
              </tr>
              ${roiData.map(software => `
                <tr>
                  <td>
                    <div class="software-name">${software.tenChuan}</div>
                    <div class="transaction-count">${software.transactionCount} GD / ${software.expenseCount} CP</div>
                  </td>
                  <td class="revenue">${formatCurrency(software.revenue)}</td>
                  <!-- Góc kế toán -->
                  <td class="cost" style="background: #f5f5f5;">${formatCurrency(software.allocatedExpense)}</td>
                  <td class="${software.accountingProfit >= 0 ? 'profit' : 'loss'}" style="background: #f5f5f5;">${formatCurrency(software.accountingProfit)}</td>
                  <td class="roi ${software.accountingROI >= 0 ? 'positive' : 'negative'}" style="background: #f5f5f5;">
                    ${software.accountingROI > 0 ? '+' : ''}${software.accountingROI.toFixed(1)}%
                  </td>
                  <td class="margin" style="background: #f5f5f5;">${software.accountingProfitMargin.toFixed(1)}%</td>
                  <!-- Góc dòng tiền -->
                  <td class="cost" style="background: #fafafa;">${formatCurrency(software.actualExpense)}</td>
                  <td class="${software.actualProfit >= 0 ? 'profit' : 'loss'}" style="background: #fafafa;">${formatCurrency(software.actualProfit)}</td>
                  <td class="roi ${software.actualROI >= 0 ? 'positive' : 'negative'}" style="background: #fafafa;">
                    ${software.actualROI > 0 ? '+' : ''}${software.actualROI.toFixed(1)}%
                  </td>
                  <td class="margin" style="background: #fafafa;">${software.actualProfitMargin.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div>
          <h4 style="margin: 20px 0 15px 0;">📊 So sánh hai góc nhìn</h4>
          <div class="comparison-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Góc kế toán -->
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
              <h5 style="margin: 0 0 10px 0; color: #1565c0;">💼 Góc kế toán (Phân bổ)</h5>
              <div style="font-size: 14px;">
                <div style="margin-bottom: 8px;">
                  <strong>Tổng chi phí phân bổ:</strong> 
                  ${formatCurrency(roiData.reduce((sum, s) => sum + s.allocatedExpense, 0))}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Tổng lợi nhuận KT:</strong> 
                  <span style="color: ${roiData.reduce((sum, s) => sum + s.accountingProfit, 0) >= 0 ? '#2e7d32' : '#c62828'}">
                    ${formatCurrency(roiData.reduce((sum, s) => sum + s.accountingProfit, 0))}
                  </span>
                </div>
                <div>
                  <strong>ROI trung bình KT:</strong> 
                  ${roiData.length > 0 ? (roiData.reduce((sum, s) => sum + s.accountingROI, 0) / roiData.length).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            <!-- Góc dòng tiền -->
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
              <h5 style="margin: 0 0 10px 0; color: #e65100;">💰 Góc dòng tiền (Thực tế)</h5>
              <div style="font-size: 14px;">
                <div style="margin-bottom: 8px;">
                  <strong>Tổng chi phí thực tế:</strong> 
                  ${formatCurrency(roiData.reduce((sum, s) => sum + s.actualExpense, 0))}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Tổng lợi nhuận TT:</strong> 
                  <span style="color: ${roiData.reduce((sum, s) => sum + s.actualProfit, 0) >= 0 ? '#2e7d32' : '#c62828'}">
                    ${formatCurrency(roiData.reduce((sum, s) => sum + s.actualProfit, 0))}
                  </span>
                </div>
                <div>
                  <strong>ROI trung bình TT:</strong> 
                  ${roiData.length > 0 ? (roiData.reduce((sum, s) => sum + s.actualROI, 0) / roiData.length).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
          <!-- Top performers -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="summary-card">
              <div class="summary-icon">🏆</div>
              <div class="summary-content">
                <div class="summary-label">ROI kế toán cao nhất</div>
                <div class="summary-value">${roiData[0]?.tenChuan || 'N/A'}</div>
                <div class="summary-detail">${roiData[0]?.accountingROI > 0 ? '+' : ''}${roiData[0]?.accountingROI?.toFixed(1) || 0}%</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">💎</div>
              <div class="summary-content">
                <div class="summary-label">ROI thực tế cao nhất</div>
                <div class="summary-value">${roiData.sort((a, b) => b.actualROI - a.actualROI)[0]?.tenChuan || 'N/A'}</div>
                <div class="summary-detail">${roiData.sort((a, b) => b.actualROI - a.actualROI)[0]?.actualROI > 0 ? '+' : ''}${roiData.sort((a, b) => b.actualROI - a.actualROI)[0]?.actualROI?.toFixed(1) || 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add styles for period indicator and sortable table if not already added
    if (!document.getElementById('roiTableStyles')) {
      const style = document.createElement('style');
      style.id = 'roiTableStyles';
      style.textContent = `
        .period-indicator {
          font-size: 14px;
          font-weight: normal;
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 12px;
          border-radius: 16px;
          margin-left: 12px;
        }
        
        .roi-table table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .roi-table th {
          padding: 8px 12px;
          border: 1px solid #ddd;
          font-weight: bold;
          text-align: center;
          transition: background-color 0.2s;
        }
        
        .roi-table th:hover {
          background-color: #f0f8ff !important;
        }
        
        .roi-table th[onclick] {
          position: relative;
        }
        
        .roi-table th[onclick]:hover::after {
          content: 'Click to sort';
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          z-index: 1000;
        }
        
        .roi-table td {
          padding: 8px 12px;
          border: 1px solid #ddd;
          text-align: right;
        }
        
        .roi-table td:first-child {
          text-align: left;
        }
        
        .software-name {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .transaction-count {
          font-size: 12px;
          color: #666;
        }
        
        .profit {
          color: #2e7d32;
          font-weight: bold;
        }
        
        .loss {
          color: #c62828;
          font-weight: bold;
        }
        
        .roi.positive {
          color: #2e7d32;
          font-weight: bold;
        }
        
        .roi.negative {
          color: #c62828;
          font-weight: bold;
        }
        
        .revenue {
          color: #1976d2;
          font-weight: bold;
        }
        
        .cost {
          color: #ef6c00;
        }
        
        .margin {
          font-size: 13px;
        }
        
        /* Summary row styles */
        .roi-table tbody tr:first-child {
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .roi-table tbody tr:first-child td {
          font-weight: bold;
          border-bottom: 2px solid #1976d2;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.error('Error rendering software ROI:', error);
    container.innerHTML = '<p style="color: #c53030;">Lỗi khi tải phân tích ROI</p>';
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

// Export refresh function globally
window.refreshCurrentReport = refreshCurrentReport;

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

// Add global refresh function
window.refreshCurrentReport = async function() {
  console.log('🔄 Refreshing current report with new filters');
  
  // Get current active report type
  const activeTab = document.querySelector('.report-menu-item.active');
  if (!activeTab) {
    console.log('ℹ️ No active report to refresh');
    return;
  }
  
  const reportType = activeTab.dataset.report;
  console.log(`🔄 Refreshing ${reportType} report`);
  
  // Clear any existing content first
  const contentArea = document.getElementById('reportContent');
  if (contentArea) {
    contentArea.innerHTML = '<div class="loading-spinner">Đang tải lại báo cáo...</div>';
  }
  
  // Reload the report with new filters
  await loadReport(reportType);
};

