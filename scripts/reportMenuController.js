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

async function renderSoftwareROI(transactionData, expenseData) {
  const container = document.getElementById('softwareROI');
  if (!container) return;
  
  try {
    // Calculate ROI by software
    const softwareROI = new Map();
    
    // Calculate revenue by software
    transactionData.forEach(transaction => {
      const software = transaction.softwareName || 'Khác';
      if (!softwareROI.has(software)) {
        softwareROI.set(software, {
          name: software,
          revenue: 0,
          cost: 0,
          transactionCount: 0
        });
      }
      
      const data = softwareROI.get(software);
      data.revenue += parseFloat(transaction.revenue) || 0;
      data.transactionCount++;
    });
    
    // Calculate costs by software
    expenseData.forEach(expense => {
      // Match expense to software based on category/description
      const desc = (expense.description || '').toLowerCase();
      const category = (expense.category || '').toLowerCase();
      
      // Simple matching logic - can be improved
      let matchedSoftware = null;
      softwareROI.forEach((data, software) => {
        if (desc.includes(software.toLowerCase()) || category.includes(software.toLowerCase())) {
          matchedSoftware = software;
        }
      });
      
      if (matchedSoftware) {
        softwareROI.get(matchedSoftware).cost += parseFloat(expense.amount) || 0;
      }
    });
    
    // Calculate ROI metrics
    const roiData = Array.from(softwareROI.values()).map(software => {
      const roi = software.cost > 0 ? ((software.revenue - software.cost) / software.cost) * 100 : 0;
      const profit = software.revenue - software.cost;
      const margin = software.revenue > 0 ? (profit / software.revenue) * 100 : 0;
      
      return {
        ...software,
        roi,
        profit,
        margin
      };
    }).sort((a, b) => b.roi - a.roi);
    
    container.innerHTML = `
      <div class="software-roi-analysis">
        <h3>📈 Phân tích ROI Phần mềm</h3>
        <div class="roi-table">
          <table>
            <thead>
              <tr>
                <th>Phần mềm</th>
                <th>Doanh thu</th>
                <th>Chi phí</th>
                <th>Lợi nhuận</th>
                <th>ROI</th>
                <th>Biên lợi nhuận</th>
              </tr>
            </thead>
            <tbody>
              ${roiData.slice(0, 10).map(software => `
                <tr>
                  <td>
                    <div class="software-name">${software.name}</div>
                    <div class="transaction-count">${software.transactionCount} giao dịch</div>
                  </td>
                  <td class="revenue">${formatCurrency(software.revenue)}</td>
                  <td class="cost">${formatCurrency(software.cost)}</td>
                  <td class="${software.profit >= 0 ? 'profit' : 'loss'}">${formatCurrency(software.profit)}</td>
                  <td class="roi ${software.roi >= 0 ? 'positive' : 'negative'}">
                    ${software.roi > 0 ? '+' : ''}${software.roi.toFixed(1)}%
                  </td>
                  <td class="margin">${software.margin.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="roi-summary">
          <div class="summary-card">
            <div class="summary-icon">🏆</div>
            <div class="summary-content">
              <div class="summary-label">ROI cao nhất</div>
              <div class="summary-value">${roiData[0]?.name || 'N/A'}</div>
              <div class="summary-detail">${roiData[0]?.roi > 0 ? '+' : ''}${roiData[0]?.roi?.toFixed(1) || 0}%</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">💰</div>
            <div class="summary-content">
              <div class="summary-label">Lợi nhuận cao nhất</div>
              <div class="summary-value">${roiData.sort((a, b) => b.profit - a.profit)[0]?.name || 'N/A'}</div>
              <div class="summary-detail">${formatCurrency(roiData[0]?.profit || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
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

