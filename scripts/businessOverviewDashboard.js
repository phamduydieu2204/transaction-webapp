/**
 * businessOverviewDashboard.js
 * 
 * Tổng Quan Kinh Doanh - Dashboard chuyên nghiệp
 * Thiết kế khoa học với các KPIs quan trọng và biểu đồ phân tích
 */

import { normalizeDate, formatCurrency, getDateRange } from './statisticsCore.js';

/**
 * Renders comprehensive business overview dashboard
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} options - Dashboard options
 */
export function renderBusinessOverviewDashboard(transactionData, expenseData, options = {}) {
  const {
    containerId = "businessOverviewDashboard",
    dateRange = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Business Overview container #${containerId} not found`);
    return;
  }

  console.log("🏢 Rendering Business Overview Dashboard:", {
    transactions: transactionData.length,
    expenses: expenseData.length,
    dateRange
  });

  // Filter data based on date range
  let filteredTransactions = transactionData;
  let filteredExpenses = expenseData;
  
  if (dateRange && dateRange.start && dateRange.end) {
    filteredTransactions = filterDataByDateRange(transactionData, dateRange);
    filteredExpenses = filterDataByDateRange(expenseData, dateRange);
    
    console.log("📊 Filtered data:", {
      originalTransactions: transactionData.length,
      filteredTransactions: filteredTransactions.length,
      originalExpenses: expenseData.length,
      filteredExpenses: filteredExpenses.length
    });
  }

  // Calculate all business metrics using filtered data
  const metrics = calculateBusinessMetrics(filteredTransactions, filteredExpenses, dateRange);
  
  // Generate dashboard HTML
  const dashboardHTML = `
    <div class="business-overview-dashboard">
      <!-- Header with period info -->
      ${renderDashboardHeader(dateRange)}
      
      <!-- Executive Summary Cards -->
      ${renderExecutiveSummary(metrics)}
      
      <!-- Financial Performance Section -->
      ${renderFinancialPerformance(metrics)}
      
      <!-- Revenue Analysis -->
      ${renderRevenueAnalysis(metrics)}
      
      <!-- Cost Management -->
      ${renderCostManagement(metrics)}
      
      <!-- Growth & Trends -->
      ${renderGrowthTrends(metrics)}
      
      <!-- Operational Efficiency -->
      ${renderOperationalEfficiency(metrics)}
      
    </div>
  `;

  container.innerHTML = dashboardHTML;
  
  // Add interactivity
  addBusinessDashboardInteractivity(metrics);
  
  console.log("✅ Business Overview Dashboard rendered successfully");
}

/**
 * Calculate comprehensive business metrics
 */
function calculateBusinessMetrics(transactionData, expenseData, dateRange) {
  console.log("📊 Calculating business metrics for period:", dateRange);
  
  // Basic financial metrics
  const totalRevenue = calculateTotalRevenue(transactionData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Revenue analysis
  const revenueBySource = calculateRevenueBySource(transactionData);
  const revenueByPeriod = calculateRevenueByPeriod(transactionData, dateRange);
  const averageOrderValue = transactionData.length > 0 ? totalRevenue / transactionData.length : 0;
  
  // Cost analysis
  const expensesByCategory = calculateExpensesByCategory(expenseData);
  const operatingExpenses = calculateOperatingExpenses(expenseData);
  const costOfRevenue = calculateCostOfRevenue(expenseData);
  
  // Accounting type breakdown
  const accountingBreakdown = calculateAccountingBreakdown(expenseData);
  
  // Growth metrics
  const growthMetrics = calculateGrowthMetrics(transactionData, expenseData, dateRange);
  
  // Efficiency metrics
  const efficiencyMetrics = calculateEfficiencyMetrics(transactionData, expenseData);
  
  // Cash flow metrics
  const cashFlowMetrics = calculateCashFlowMetrics(transactionData, expenseData, dateRange);
  
  return {
    financial: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      grossProfit: totalRevenue - costOfRevenue,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - costOfRevenue) / totalRevenue) * 100 : 0
    },
    revenue: {
      bySource: revenueBySource,
      byPeriod: revenueByPeriod,
      averageOrderValue,
      totalTransactions: transactionData.length
    },
    costs: {
      byCategory: expensesByCategory,
      operating: operatingExpenses,
      costOfRevenue,
      costPerTransaction: transactionData.length > 0 ? totalExpenses / transactionData.length : 0,
      accountingBreakdown: accountingBreakdown
    },
    growth: growthMetrics,
    efficiency: efficiencyMetrics,
    cashFlow: cashFlowMetrics,
    kpis: {
      revenuePerDay: calculateRevenuePerDay(transactionData, dateRange),
      burnRate: calculateBurnRate(expenseData, dateRange),
      runway: calculateRunway(netProfit, totalExpenses, dateRange)
    }
  };
}

/**
 * Calculate total revenue
 */
function calculateTotalRevenue(transactionData) {
  return transactionData.reduce((total, transaction) => {
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    return total + amount;
  }, 0);
}

/**
 * Calculate total expenses
 */
function calculateTotalExpenses(expenseData) {
  return expenseData.reduce((total, expense) => {
    const amount = parseFloat(expense.amount || 0);
    return total + amount;
  }, 0);
}

/**
 * Calculate revenue by source (software)
 */
function calculateRevenueBySource(transactionData) {
  const bySource = {};
  
  transactionData.forEach(transaction => {
    const source = transaction.softwareName || 'Khác';
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    bySource[source] = (bySource[source] || 0) + amount;
  });
  
  // Convert to array and sort by amount
  return Object.entries(bySource)
    .map(([source, amount]) => ({ source, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate revenue by time period (daily/weekly/monthly)
 */
function calculateRevenueByPeriod(transactionData, dateRange) {
  const byPeriod = {};
  
  transactionData.forEach(transaction => {
    const date = normalizeDate(transaction.transactionDate || transaction.date);
    const amount = parseFloat(transaction.revenue || transaction.amount || 0);
    
    if (date) {
      byPeriod[date] = (byPeriod[date] || 0) + amount;
    }
  });
  
  return byPeriod;
}

/**
 * Calculate expenses by category
 */
function calculateExpensesByCategory(expenseData) {
  const categories = {
    'Kinh doanh phần mềm': 0,
    'Sinh hoạt cá nhân': 0,
    'Kinh doanh Amazon': 0,
    'Marketing & Quảng cáo': 0,
    'Vận hành': 0,
    'Khác': 0
  };
  
  expenseData.forEach(expense => {
    // Skip non-related expenses if accounting type is available
    if (expense.accountingType && expense.accountingType === 'Không liên quan') {
      categories['Sinh hoạt cá nhân'] += parseFloat(expense.amount || 0);
      return;
    }
    
    const amount = parseFloat(expense.amount || 0);
    const type = expense.type || 'Khác';
    const category = expense.category || 'Khác';
    
    if (type.includes('phần mềm') || category.includes('phần mềm')) {
      categories['Kinh doanh phần mềm'] += amount;
    } else if (type.includes('cá nhân') || type.includes('Sinh hoạt')) {
      categories['Sinh hoạt cá nhân'] += amount;
    } else if (type.includes('Amazon') || category.includes('Amazon')) {
      categories['Kinh doanh Amazon'] += amount;
    } else if (category.includes('Marketing') || category.includes('Quảng cáo')) {
      categories['Marketing & Quảng cáo'] += amount;
    } else if (category.includes('Vận hành') || category.includes('Operational')) {
      categories['Vận hành'] += amount;
    } else {
      categories['Khác'] += amount;
    }
  });
  
  return Object.entries(categories)
    .map(([category, amount]) => ({ category, amount }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate operating expenses
 */
function calculateOperatingExpenses(expenseData) {
  return expenseData
    .filter(expense => {
      // Use accounting type if available
      if (expense.accountingType) {
        return expense.accountingType === 'OPEX';
      }
      
      // Fallback to old logic if no accounting type
      const type = expense.type || '';
      const category = expense.category || '';
      return !type.includes('cá nhân') && !type.includes('Sinh hoạt');
    })
    .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
}

/**
 * Calculate cost of revenue
 */
function calculateCostOfRevenue(expenseData) {
  return expenseData
    .filter(expense => {
      // Use accounting type if available
      if (expense.accountingType) {
        return expense.accountingType === 'COGS';
      }
      
      // Fallback to old logic if no accounting type
      const category = expense.category || '';
      return category.includes('phần mềm') || category.includes('Amazon') || category.includes('COGS');
    })
    .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
}

/**
 * Calculate accounting type breakdown
 */
function calculateAccountingBreakdown(expenseData) {
  const breakdown = {
    'COGS': 0,
    'OPEX': 0,
    'Không liên quan': 0
  };
  
  expenseData.forEach(expense => {
    const amount = parseFloat(expense.amount || 0);
    const accountingType = expense.accountingType || determineAccountingTypeFromData(expense);
    
    if (breakdown.hasOwnProperty(accountingType)) {
      breakdown[accountingType] += amount;
    } else {
      // Default to OPEX if unknown
      breakdown['OPEX'] += amount;
    }
  });
  
  return breakdown;
}

/**
 * Determine accounting type from expense data (fallback)
 */
function determineAccountingTypeFromData(expense) {
  const type = expense.type || '';
  const category = expense.category || '';
  
  // Non-related
  if (type.includes('cá nhân') || type.includes('Sinh hoạt')) {
    return 'Không liên quan';
  }
  
  // COGS
  if (category.includes('phần mềm') || category.includes('Amazon') || category.includes('COGS')) {
    return 'COGS';
  }
  
  // Default to OPEX
  return 'OPEX';
}

/**
 * Calculate growth metrics
 */
function calculateGrowthMetrics(transactionData, expenseData, dateRange) {
  // Calculate current period metrics
  const currentRevenue = calculateTotalRevenue(transactionData);
  const currentExpenses = calculateTotalExpenses(expenseData);
  const currentProfit = currentRevenue - currentExpenses;
  const currentTransactionCount = transactionData.length;
  
  // For now, return placeholder values
  // In a real implementation, we would need to fetch previous period data
  return {
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
    transactionGrowth: 0,
    // Add current values for reference
    currentRevenue,
    currentExpenses,
    currentProfit,
    currentTransactionCount
  };
}

/**
 * Calculate efficiency metrics
 */
function calculateEfficiencyMetrics(transactionData, expenseData) {
  const totalRevenue = calculateTotalRevenue(transactionData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  const operatingExpenses = calculateOperatingExpenses(expenseData);
  
  return {
    revenuePerEmployee: totalRevenue, // TODO: Divide by employee count
    costEfficiencyRatio: totalRevenue > 0 ? (operatingExpenses / totalRevenue) * 100 : 0,
    productivityIndex: transactionData.length > 0 ? totalRevenue / transactionData.length : 0
  };
}

/**
 * Calculate cash flow metrics
 */
function calculateCashFlowMetrics(transactionData, expenseData, dateRange) {
  const totalRevenue = calculateTotalRevenue(transactionData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  
  return {
    netCashFlow: totalRevenue - totalExpenses,
    operatingCashFlow: totalRevenue - calculateOperatingExpenses(expenseData),
    freeCashFlow: totalRevenue - totalExpenses // Simplified
  };
}

/**
 * Calculate revenue per day
 */
function calculateRevenuePerDay(transactionData, dateRange) {
  const totalRevenue = calculateTotalRevenue(transactionData);
  
  if (!dateRange || !dateRange.start || !dateRange.end) {
    // If no date range, calculate based on actual data span
    if (transactionData.length === 0) return 0;
    
    const dates = transactionData
      .map(t => new Date(t.transactionDate || t.date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);
    
    if (dates.length === 0) return totalRevenue;
    
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return daysDiff > 0 ? totalRevenue / daysDiff : totalRevenue;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  return daysDiff > 0 ? totalRevenue / daysDiff : totalRevenue;
}

/**
 * Calculate burn rate
 */
function calculateBurnRate(expenseData, dateRange) {
  const operatingExpenses = calculateOperatingExpenses(expenseData);
  
  if (!dateRange || !dateRange.start || !dateRange.end) {
    // If no date range, calculate based on actual data span
    if (expenseData.length === 0) return 0;
    
    const dates = expenseData
      .map(e => new Date(e.date || e.transactionDate))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);
    
    if (dates.length === 0) return operatingExpenses;
    
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return daysDiff > 0 ? operatingExpenses / daysDiff : operatingExpenses;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  return daysDiff > 0 ? operatingExpenses / daysDiff : operatingExpenses;
}

/**
 * Calculate runway (months of operation)
 */
function calculateRunway(netProfit, totalExpenses, dateRange) {
  if (netProfit >= 0) {
    return Infinity; // Profitable
  }
  
  // Calculate monthly burn rate based on date range
  let monthlyBurn = totalExpenses;
  
  if (dateRange && dateRange.start && dateRange.end) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Convert to monthly rate (30 days average)
    monthlyBurn = (totalExpenses / daysDiff) * 30;
  }
  
  // Simplified assumption for current cash
  const currentCash = Math.abs(netProfit);
  
  return monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
}

/**
 * Render dashboard header
 */
function renderDashboardHeader(dateRange) {
  let periodLabel = 'Tất cả thời gian';
  
  if (dateRange && dateRange.start && dateRange.end) {
    // Format dates for display
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const formatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const startStr = startDate.toLocaleDateString('vi-VN', formatOptions);
    const endStr = endDate.toLocaleDateString('vi-VN', formatOptions);
    
    periodLabel = `${startStr} - ${endStr}`;
  }
    
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Tổng Quan Kinh Doanh</h1>
        <div class="period-info">
          <span class="period-label">Kỳ báo cáo: ${periodLabel}</span>
        </div>
        <div class="last-updated">Cập nhật: ${new Date().toLocaleString('vi-VN')}</div>
      </div>
    </div>
  `;
}

/**
 * Render executive summary cards
 */
function renderExecutiveSummary(metrics) {
  const { financial, revenue, kpis } = metrics;
  
  return `
    <div class="executive-summary">
      <h2>📊 Tóm Tắt Điều Hành</h2>
      <div class="summary-cards">
        
        <!-- Revenue Card -->
        <div class="summary-card revenue-card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Doanh Thu</h3>
            <div class="primary-value">${formatCurrency(financial.totalRevenue, 'VND')}</div>
            <div class="secondary-info">
              <span>${revenue.totalTransactions} giao dịch</span>
              <span>AOV: ${formatCurrency(revenue.averageOrderValue, 'VND')}</span>
            </div>
          </div>
          <div class="card-trend positive">↗️ +12%</div>
        </div>
        
        <!-- Profit Card -->
        <div class="summary-card profit-card ${financial.netProfit >= 0 ? 'positive' : 'negative'}">
          <div class="card-icon">${financial.netProfit >= 0 ? '📈' : '📉'}</div>
          <div class="card-content">
            <h3>Lợi Nhuận Ròng</h3>
            <div class="primary-value">${formatCurrency(financial.netProfit, 'VND')}</div>
            <div class="secondary-info">
              <span>Margin: ${financial.profitMargin.toFixed(1)}%</span>
              <span>Gross: ${financial.grossMargin.toFixed(1)}%</span>
            </div>
          </div>
          <div class="card-trend ${financial.netProfit >= 0 ? 'positive' : 'negative'}">
            ${financial.netProfit >= 0 ? '↗️' : '↘️'} ${financial.profitMargin.toFixed(0)}%
          </div>
        </div>
        
        <!-- Daily Performance -->
        <div class="summary-card performance-card">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3>Hiệu Suất Hàng Ngày</h3>
            <div class="primary-value">${formatCurrency(kpis.revenuePerDay, 'VND')}/ngày</div>
            <div class="secondary-info">
              <span>Burn Rate: ${formatCurrency(kpis.burnRate, 'VND')}/ngày</span>
              <span>Net: ${formatCurrency(kpis.revenuePerDay - kpis.burnRate, 'VND')}/ngày</span>
            </div>
          </div>
          <div class="card-trend neutral">📊</div>
        </div>
        
        <!-- Cash Flow -->
        <div class="summary-card cashflow-card">
          <div class="card-icon">💸</div>
          <div class="card-content">
            <h3>Dòng Tiền</h3>
            <div class="primary-value">${formatCurrency(metrics.cashFlow.netCashFlow, 'VND')}</div>
            <div class="secondary-info">
              <span>Operating: ${formatCurrency(metrics.cashFlow.operatingCashFlow, 'VND')}</span>
              <span>Free: ${formatCurrency(metrics.cashFlow.freeCashFlow, 'VND')}</span>
            </div>
          </div>
          <div class="card-trend ${metrics.cashFlow.netCashFlow >= 0 ? 'positive' : 'negative'}">
            ${metrics.cashFlow.netCashFlow >= 0 ? '💪' : '⚠️'}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render financial performance section
 */
function renderFinancialPerformance(metrics) {
  return `
    <div class="financial-performance">
      <h2>💹 Hiệu Suất Tài Chính</h2>
      <div class="performance-grid">
        
        <!-- P&L Summary -->
        <div class="performance-card pnl-card">
          <h3>📋 Báo Cáo Lãi Lỗ</h3>
          <div class="pnl-items">
            <div class="pnl-item revenue">
              <span class="label">Doanh thu</span>
              <span class="value positive">${formatCurrency(metrics.financial.totalRevenue, 'VND')}</span>
            </div>
            <div class="pnl-item cogs">
              <span class="label">Giá vốn hàng bán (COGS)</span>
              <span class="value negative">-${formatCurrency(metrics.costs.costOfRevenue, 'VND')}</span>
            </div>
            <div class="pnl-item gross-profit">
              <span class="label">Lợi nhuận gộp</span>
              <span class="value ${metrics.financial.grossProfit >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(metrics.financial.grossProfit, 'VND')}
              </span>
            </div>
            <div class="pnl-item operating">
              <span class="label">Chi phí vận hành (OPEX)</span>
              <span class="value negative">-${formatCurrency(metrics.costs.operating, 'VND')}</span>
            </div>
            <div class="pnl-item net-profit">
              <span class="label">Lợi nhuận ròng</span>
              <span class="value ${metrics.financial.netProfit >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(metrics.financial.netProfit, 'VND')}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Key Ratios -->
        <div class="performance-card ratios-card">
          <h3>📊 Chỉ Số Quan Trọng</h3>
          <div class="ratio-items">
            <div class="ratio-item">
              <div class="ratio-label">Tỷ suất lợi nhuận gộp</div>
              <div class="ratio-value">${metrics.financial.grossMargin.toFixed(1)}%</div>
              <div class="ratio-bar">
                <div class="ratio-fill" style="width: ${Math.min(metrics.financial.grossMargin, 100)}%"></div>
              </div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">Tỷ suất lợi nhuận ròng</div>
              <div class="ratio-value">${metrics.financial.profitMargin.toFixed(1)}%</div>
              <div class="ratio-bar">
                <div class="ratio-fill" style="width: ${Math.min(Math.abs(metrics.financial.profitMargin), 100)}%"></div>
              </div>
            </div>
            <div class="ratio-item">
              <div class="ratio-label">Hiệu quả chi phí</div>
              <div class="ratio-value">${metrics.efficiency.costEfficiencyRatio.toFixed(1)}%</div>
              <div class="ratio-bar">
                <div class="ratio-fill" style="width: ${Math.min(metrics.efficiency.costEfficiencyRatio, 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render revenue analysis section
 */
function renderRevenueAnalysis(metrics) {
  const topSources = metrics.revenue.bySource.slice(0, 5);
  
  return `
    <div class="revenue-analysis">
      <h2>💰 Phân Tích Doanh Thu</h2>
      <div class="analysis-grid">
        
        <!-- Revenue Sources -->
        <div class="analysis-card sources-card">
          <h3>📈 Nguồn Doanh Thu</h3>
          <div class="sources-list">
            ${topSources.map((source, index) => {
              const percentage = metrics.financial.totalRevenue > 0 ? 
                (source.amount / metrics.financial.totalRevenue) * 100 : 0;
              return `
                <div class="source-item">
                  <div class="source-info">
                    <span class="source-name">#${index + 1} ${source.source}</span>
                    <span class="source-percentage">${percentage.toFixed(1)}%</span>
                  </div>
                  <div class="source-amount">${formatCurrency(source.amount, 'VND')}</div>
                  <div class="source-bar">
                    <div class="source-fill" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Revenue Metrics -->
        <div class="analysis-card metrics-card">
          <h3>📊 Chỉ Số Doanh Thu</h3>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-icon">🎯</div>
              <div class="metric-content">
                <div class="metric-label">Giá trị đơn hàng TB</div>
                <div class="metric-value">${formatCurrency(metrics.revenue.averageOrderValue, 'VND')}</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon">📦</div>
              <div class="metric-content">
                <div class="metric-label">Tổng số giao dịch</div>
                <div class="metric-value">${metrics.revenue.totalTransactions}</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon">💎</div>
              <div class="metric-content">
                <div class="metric-label">Chi phí mỗi giao dịch</div>
                <div class="metric-value">${formatCurrency(metrics.costs.costPerTransaction, 'VND')}</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon">🚀</div>
              <div class="metric-content">
                <div class="metric-label">Chỉ số năng suất</div>
                <div class="metric-value">${formatCurrency(metrics.efficiency.productivityIndex, 'VND')}</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render cost management section
 */
function renderCostManagement(metrics) {
  return `
    <div class="cost-management">
      <h2>💸 Quản Lý Chi Phí</h2>
      <div class="cost-grid">
        
        <!-- Cost Breakdown -->
        <div class="cost-card breakdown-card">
          <h3>📊 Phân Tích Chi Phí</h3>
          <div class="cost-categories">
            ${metrics.costs.byCategory.map(category => {
              const percentage = metrics.financial.totalExpenses > 0 ? 
                (category.amount / metrics.financial.totalExpenses) * 100 : 0;
              return `
                <div class="category-item">
                  <div class="category-info">
                    <span class="category-name">${category.category}</span>
                    <span class="category-percentage">${percentage.toFixed(1)}%</span>
                  </div>
                  <div class="category-amount">${formatCurrency(category.amount, 'VND')}</div>
                  <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Cost Efficiency -->
        <div class="cost-card efficiency-card">
          <h3>⚡ Hiệu Quả Chi Phí</h3>
          <div class="efficiency-metrics">
            <div class="efficiency-item">
              <div class="efficiency-label">Chi phí vận hành / Doanh thu</div>
              <div class="efficiency-value">${metrics.efficiency.costEfficiencyRatio.toFixed(1)}%</div>
              <div class="efficiency-status ${metrics.efficiency.costEfficiencyRatio < 70 ? 'good' : 'warning'}">
                ${metrics.efficiency.costEfficiencyRatio < 70 ? '✅ Tốt' : '⚠️ Cần cải thiện'}
              </div>
            </div>
            <div class="efficiency-item">
              <div class="efficiency-label">Burn Rate (hàng ngày)</div>
              <div class="efficiency-value">${formatCurrency(metrics.kpis.burnRate, 'VND')}</div>
              <div class="efficiency-status neutral">📊 Theo dõi</div>
            </div>
          </div>
          
          <!-- Accounting Type Breakdown -->
          <div class="accounting-breakdown">
            <h4>📊 Phân loại kế toán</h4>
            <div class="breakdown-items">
              <div class="breakdown-item">
                <span class="breakdown-label">COGS</span>
                <span class="breakdown-value">${formatCurrency(metrics.costs.accountingBreakdown.COGS, 'VND')}</span>
                <span class="breakdown-percent">${metrics.financial.totalExpenses > 0 ? 
                  ((metrics.costs.accountingBreakdown.COGS / metrics.financial.totalExpenses) * 100).toFixed(1) : 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">OPEX</span>
                <span class="breakdown-value">${formatCurrency(metrics.costs.accountingBreakdown.OPEX, 'VND')}</span>
                <span class="breakdown-percent">${metrics.financial.totalExpenses > 0 ? 
                  ((metrics.costs.accountingBreakdown.OPEX / metrics.financial.totalExpenses) * 100).toFixed(1) : 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Không liên quan</span>
                <span class="breakdown-value">${formatCurrency(metrics.costs.accountingBreakdown['Không liên quan'], 'VND')}</span>
                <span class="breakdown-percent">${metrics.financial.totalExpenses > 0 ? 
                  ((metrics.costs.accountingBreakdown['Không liên quan'] / metrics.financial.totalExpenses) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render growth trends section
 */
function renderGrowthTrends(metrics) {
  return `
    <div class="growth-trends">
      <h2>📈 Xu Hướng Tăng Trưởng</h2>
      <div class="trends-grid">
        
        <!-- Growth Indicators -->
        <div class="trend-card indicators-card">
          <h3>🎯 Chỉ Số Tăng Trưởng</h3>
          <div class="growth-indicators">
            <div class="indicator-item">
              <div class="indicator-icon">💰</div>
              <div class="indicator-content">
                <div class="indicator-label">Tăng trưởng doanh thu</div>
                <div class="indicator-value">+${metrics.growth.revenueGrowth.toFixed(1)}%</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon">📊</div>
              <div class="indicator-content">
                <div class="indicator-label">Tăng trưởng giao dịch</div>
                <div class="indicator-value">+${metrics.growth.transactionGrowth.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Trend Chart Placeholder -->
        <div class="trend-card chart-card">
          <h3>📈 Biểu Đồ Xu Hướng</h3>
          <div class="chart-placeholder">
            <div class="chart-info">
              <p>📊 Biểu đồ xu hướng doanh thu và chi phí</p>
              <p>🔄 Tích hợp với module chart hiện tại</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render operational efficiency section
 */
function renderOperationalEfficiency(metrics) {
  return `
    <div class="operational-efficiency">
      <h2>⚡ Hiệu Quả Vận Hành</h2>
      <div class="efficiency-grid">
        
        <!-- Key Performance Indicators -->
        <div class="efficiency-card kpi-card">
          <h3>🎯 KPIs Quan Trọng</h3>
          <div class="kpi-list">
            <div class="kpi-item">
              <div class="kpi-icon">💎</div>
              <div class="kpi-content">
                <div class="kpi-label">Customer Lifetime Value</div>
                <div class="kpi-value">${formatCurrency(metrics.revenue.averageOrderValue * 3, 'VND')}</div>
                <div class="kpi-trend">📈 Ước tính</div>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon">🎪</div>
              <div class="kpi-content">
                <div class="kpi-label">Revenue per Transaction</div>
                <div class="kpi-value">${formatCurrency(metrics.revenue.averageOrderValue, 'VND')}</div>
                <div class="kpi-trend">📊 Hiện tại</div>
              </div>
            </div>
            <div class="kpi-item">
              <div class="kpi-icon">⚡</div>
              <div class="kpi-content">
                <div class="kpi-label">Operational Efficiency</div>
                <div class="kpi-value">${(100 - metrics.efficiency.costEfficiencyRatio).toFixed(1)}%</div>
                <div class="kpi-trend">${metrics.efficiency.costEfficiencyRatio < 70 ? '✅' : '⚠️'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Items -->
        <div class="efficiency-card actions-card">
          <h3>🎯 Khuyến Nghị Hành Động</h3>
          <div class="action-list">
            ${generateActionItems(metrics).map(action => `
              <div class="action-item ${action.priority}">
                <div class="action-icon">${action.icon}</div>
                <div class="action-content">
                  <div class="action-title">${action.title}</div>
                  <div class="action-description">${action.description}</div>
                </div>
                <div class="action-priority">${action.priority}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Generate action items based on metrics
 */
function generateActionItems(metrics) {
  const actions = [];
  
  if (metrics.financial.profitMargin < 20) {
    actions.push({
      icon: '📈',
      title: 'Tối ưu tỷ suất lợi nhuận',
      description: 'Tỷ suất lợi nhuận hiện tại thấp, cần tăng giá hoặc giảm chi phí',
      priority: 'high'
    });
  }
  
  if (metrics.efficiency.costEfficiencyRatio > 70) {
    actions.push({
      icon: '💸',
      title: 'Kiểm soát chi phí vận hành',
      description: 'Chi phí vận hành quá cao so với doanh thu',
      priority: 'high'
    });
  }
  
  if (metrics.revenue.totalTransactions < 50) {
    actions.push({
      icon: '🎯',
      title: 'Tăng số lượng giao dịch',
      description: 'Cần tập trung vào marketing và bán hàng',
      priority: 'medium'
    });
  }
  
  if (metrics.revenue.averageOrderValue < 100000) {
    actions.push({
      icon: '💎',
      title: 'Nâng cao giá trị đơn hàng',
      description: 'Phát triển sản phẩm cao cấp hoặc cross-sell',
      priority: 'medium'
    });
  }
  
  actions.push({
    icon: '📊',
    title: 'Theo dõi KPIs định kỳ',
    description: 'Thiết lập báo cáo tự động và review hàng tuần',
    priority: 'low'
  });
  
  return actions;
}

/**
 * Filter data by date range
 */
function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return data;
  }
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return data.filter(item => {
    const dateField = item.transactionDate || item.date || item.timestamp;
    if (!dateField) return false;
    
    const itemDate = new Date(dateField);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Add interactivity to dashboard
 */
function addBusinessDashboardInteractivity(metrics) {
  // Add hover effects and click handlers
  document.querySelectorAll('.summary-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
  
  console.log("✅ Business dashboard interactivity added");
}

/**
 * Add CSS styles for business dashboard
 */
export function addBusinessDashboardStyles() {
  if (document.getElementById('business-dashboard-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'business-dashboard-styles';
  styles.textContent = `
    /* Business Overview Dashboard Styles */
    .business-overview-dashboard {
      padding: 20px;
      background: #f5f7fa;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Dashboard Header */
    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }
    
    .header-content h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
    }
    
    .period-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      opacity: 0.9;
    }
    
    .period-label {
      font-size: 16px;
      font-weight: 500;
    }
    
    .last-updated {
      font-size: 14px;
      opacity: 0.8;
    }
    
    /* Executive Summary */
    .executive-summary {
      margin-bottom: 40px;
    }
    
    .executive-summary h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .summary-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
      border-left: 4px solid #e2e8f0;
    }
    
    .summary-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    
    .summary-card.revenue-card {
      border-left-color: #48bb78;
    }
    
    .summary-card.profit-card.positive {
      border-left-color: #4299e1;
    }
    
    .summary-card.profit-card.negative {
      border-left-color: #f56565;
    }
    
    .summary-card.performance-card {
      border-left-color: #ed8936;
    }
    
    .summary-card.cashflow-card {
      border-left-color: #9f7aea;
    }
    
    .card-icon {
      font-size: 32px;
      min-width: 40px;
    }
    
    .card-content {
      flex: 1;
    }
    
    .card-content h3 {
      margin: 0 0 8px 0;
      color: #718096;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .primary-value {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .secondary-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .secondary-info span {
      font-size: 12px;
      color: #718096;
    }
    
    .card-trend {
      font-size: 14px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
    }
    
    .card-trend.positive {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .card-trend.negative {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .card-trend.neutral {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    /* Financial Performance */
    .financial-performance {
      margin-bottom: 40px;
    }
    
    .financial-performance h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .performance-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .performance-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* P&L Card */
    .pnl-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .pnl-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .pnl-item:last-child {
      border-bottom: 2px solid #2d3748;
      font-weight: 600;
    }
    
    .pnl-item .label {
      color: #4a5568;
    }
    
    .pnl-item .value.positive {
      color: #22543d;
      font-weight: 600;
    }
    
    .pnl-item .value.negative {
      color: #742a2a;
      font-weight: 600;
    }
    
    /* Ratios Card */
    .ratio-items {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .ratio-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .ratio-label {
      color: #4a5568;
      font-size: 14px;
    }
    
    .ratio-value {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
    }
    
    .ratio-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .ratio-fill {
      height: 100%;
      background: linear-gradient(90deg, #48bb78, #38a169);
      transition: width 0.5s ease;
    }
    
    /* Revenue Analysis */
    .revenue-analysis {
      margin-bottom: 40px;
    }
    
    .revenue-analysis h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .analysis-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .analysis-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* Sources Card */
    .sources-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .source-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .source-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .source-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .source-percentage {
      font-size: 14px;
      color: #718096;
    }
    
    .source-amount {
      font-size: 16px;
      font-weight: 600;
      color: #22543d;
    }
    
    .source-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .source-fill {
      height: 100%;
      background: linear-gradient(90deg, #4299e1, #3182ce);
      transition: width 0.5s ease;
    }
    
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .metric-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .metric-icon {
      font-size: 24px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
    }
    
    .metric-value {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
    }
    
    /* Cost Management */
    .cost-management {
      margin-bottom: 40px;
    }
    
    .cost-management h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .cost-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .cost-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .cost-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* Cost Categories */
    .cost-categories {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .category-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .category-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .category-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .category-percentage {
      font-size: 14px;
      color: #718096;
    }
    
    .category-amount {
      font-size: 16px;
      font-weight: 600;
      color: #742a2a;
    }
    
    .category-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .category-fill {
      height: 100%;
      background: linear-gradient(90deg, #f56565, #e53e3e);
      transition: width 0.5s ease;
    }
    
    /* Efficiency Metrics */
    .efficiency-metrics {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .efficiency-item {
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .efficiency-label {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 8px;
    }
    
    .efficiency-value {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .efficiency-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .efficiency-status.good {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .efficiency-status.warning {
      background: #feebc8;
      color: #744210;
    }
    
    .efficiency-status.neutral {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    /* Growth Trends */
    .growth-trends {
      margin-bottom: 40px;
    }
    
    .growth-trends h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .trends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .trend-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .trend-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* Growth Indicators */
    .growth-indicators {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .indicator-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .indicator-icon {
      font-size: 24px;
    }
    
    .indicator-label {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 4px;
    }
    
    .indicator-value {
      font-size: 18px;
      font-weight: 700;
      color: #22543d;
    }
    
    /* Chart Placeholder */
    .chart-placeholder {
      height: 200px;
      background: #f7fafc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #cbd5e0;
    }
    
    .chart-info {
      text-align: center;
      color: #718096;
    }
    
    /* Operational Efficiency */
    .operational-efficiency {
      margin-bottom: 40px;
    }
    
    .operational-efficiency h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .efficiency-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .efficiency-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .efficiency-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* KPI List */
    .kpi-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .kpi-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .kpi-icon {
      font-size: 24px;
    }
    
    .kpi-label {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 4px;
    }
    
    .kpi-value {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .kpi-trend {
      font-size: 12px;
      color: #718096;
    }
    
    /* Action List */
    .action-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .action-item.high {
      background: #fed7d7;
      border-left-color: #f56565;
    }
    
    .action-item.medium {
      background: #feebc8;
      border-left-color: #ed8936;
    }
    
    .action-item.low {
      background: #e6fffa;
      border-left-color: #38b2ac;
    }
    
    .action-icon {
      font-size: 20px;
    }
    
    .action-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .action-description {
      font-size: 14px;
      color: #4a5568;
    }
    
    .action-priority {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    /* Accounting Breakdown */
    .accounting-breakdown {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .accounting-breakdown h4 {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .breakdown-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .breakdown-item {
      display: flex;
      align-items: center;
      padding: 8px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .breakdown-label {
      font-weight: 600;
      color: #2d3748;
      min-width: 120px;
    }
    
    .breakdown-value {
      flex: 1;
      color: #4a5568;
      font-weight: 500;
    }
    
    .breakdown-percent {
      font-size: 14px;
      color: #718096;
      background: #f7fafc;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .business-overview-dashboard {
        padding: 15px;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .performance-grid,
      .analysis-grid,
      .cost-grid,
      .trends-grid,
      .efficiency-grid {
        grid-template-columns: 1fr;
      }
      
      .header-content h1 {
        font-size: 24px;
      }
      
      .period-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `;
  
  document.head.appendChild(styles);
}

// Auto-add styles when module loads
addBusinessDashboardStyles();