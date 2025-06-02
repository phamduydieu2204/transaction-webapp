/**
 * overviewReport.js
 * 
 * Overview report functionality - Tổng quan kinh doanh
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatPercentage } from '../core/reportFormatters.js';
import { calculateTotalRevenue, calculateTotalExpenses, calculateProfit, calculateProfitMargin } from '../core/reportCalculations.js';

/**
 * Load overview report (Tổng quan kinh doanh)
 */
export async function loadOverviewReport() {
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
 * Load top products data
 */
async function loadTopProducts() {
  try {
    const container = document.getElementById('topProducts');
    if (!container) {
      console.warn('❌ Top products container not found');
      return;
    }

    const transactions = window.transactionList || [];
    
    // Group by software and calculate totals
    const softwareStats = {};
    transactions.forEach(transaction => {
      const software = transaction.software || 'Không xác định';
      const revenue = parseFloat(transaction.revenue) || 0;
      
      if (!softwareStats[software]) {
        softwareStats[software] = {
          name: software,
          revenue: 0,
          count: 0
        };
      }
      
      softwareStats[software].revenue += revenue;
      softwareStats[software].count += 1;
    });

    // Sort by revenue and get top 5
    const topProducts = Object.values(softwareStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Render top products
    let html = `
      <div class="metric-card">
        <div class="metric-content">
          <h4>🏆 Top 5 Sản phẩm</h4>
          <div class="product-list">
    `;

    topProducts.forEach((product, index) => {
      html += `
        <div class="product-item">
          <span class="product-rank">#${index + 1}</span>
          <span class="product-name">${product.name}</span>
          <span class="product-revenue">${formatRevenue(product.revenue)}</span>
          <span class="product-count">(${product.count} giao dịch)</span>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log('✅ Top products loaded');
  } catch (error) {
    console.error('❌ Error loading top products:', error);
    showError('Không thể tải dữ liệu sản phẩm hàng đầu');
  }
}

/**
 * Load top customers data
 */
async function loadTopCustomers() {
  try {
    const container = document.getElementById('topCustomers');
    if (!container) {
      console.warn('❌ Top customers container not found');
      return;
    }

    const transactions = window.transactionList || [];
    
    // Group by customer and calculate totals
    const customerStats = {};
    transactions.forEach(transaction => {
      const customer = transaction.customer || 'Không xác định';
      const revenue = parseFloat(transaction.revenue) || 0;
      
      if (!customerStats[customer]) {
        customerStats[customer] = {
          name: customer,
          revenue: 0,
          count: 0
        };
      }
      
      customerStats[customer].revenue += revenue;
      customerStats[customer].count += 1;
    });

    // Sort by revenue and get top 5
    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Render top customers
    let html = `
      <div class="metric-card">
        <div class="metric-content">
          <h4>👥 Top 5 Khách hàng</h4>
          <div class="customer-list">
    `;

    topCustomers.forEach((customer, index) => {
      html += `
        <div class="customer-item">
          <span class="customer-rank">#${index + 1}</span>
          <span class="customer-name">${customer.name}</span>
          <span class="customer-revenue">${formatRevenue(customer.revenue)}</span>
          <span class="customer-count">(${customer.count} giao dịch)</span>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log('✅ Top customers loaded');
  } catch (error) {
    console.error('❌ Error loading top customers:', error);
    showError('Không thể tải dữ liệu khách hàng hàng đầu');
  }
}

/**
 * Load summary statistics
 */
async function loadSummaryStats() {
  try {
    const container = document.getElementById('summaryStats');
    if (!container) {
      console.warn('❌ Summary stats container not found');
      return;
    }

    const transactions = window.transactionList || [];
    const expenses = window.expenseList || [];
    
    // Calculate key metrics
    const totalRevenue = calculateTotalRevenue(transactions);
    const totalExpenses = calculateTotalExpenses(expenses);
    const profit = calculateProfit(totalRevenue, totalExpenses);
    const profitMargin = calculateProfitMargin(profit, totalRevenue);
    
    const totalTransactions = transactions.length;
    const totalCustomers = new Set(transactions.map(t => t.customer)).size;
    const avgTransactionValue = totalRevenue / (totalTransactions || 1);

    // Render summary stats
    const html = `
      <div class="summary-grid">
        <div class="summary-card revenue">
          <div class="summary-icon">💰</div>
          <div class="summary-content">
            <div class="summary-value">${formatRevenue(totalRevenue)}</div>
            <div class="summary-label">Tổng doanh thu</div>
          </div>
        </div>
        
        <div class="summary-card expenses">
          <div class="summary-icon">💸</div>
          <div class="summary-content">
            <div class="summary-value">${formatRevenue(totalExpenses)}</div>
            <div class="summary-label">Tổng chi phí</div>
          </div>
        </div>
        
        <div class="summary-card profit ${profit >= 0 ? 'positive' : 'negative'}">
          <div class="summary-icon">${profit >= 0 ? '📈' : '📉'}</div>
          <div class="summary-content">
            <div class="summary-value">${formatRevenue(profit)}</div>
            <div class="summary-label">Lợi nhuận</div>
            <div class="summary-detail">${formatPercentage(profitMargin)} margin</div>
          </div>
        </div>
        
        <div class="summary-card transactions">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <div class="summary-value">${totalTransactions.toLocaleString()}</div>
            <div class="summary-label">Tổng giao dịch</div>
            <div class="summary-detail">Avg: ${formatRevenue(avgTransactionValue)}</div>
          </div>
        </div>
        
        <div class="summary-card customers">
          <div class="summary-icon">👥</div>
          <div class="summary-content">
            <div class="summary-value">${totalCustomers.toLocaleString()}</div>
            <div class="summary-label">Khách hàng</div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    console.log('✅ Summary stats loaded');
  } catch (error) {
    console.error('❌ Error loading summary stats:', error);
    showError('Không thể tải thống kê tổng hợp');
  }
}

/**
 * Load revenue chart
 */
async function loadRevenueChart() {
  try {
    const container = document.getElementById('revenueChart');
    if (!container) {
      console.warn('❌ Revenue chart container not found');
      return;
    }

    // For now, show a placeholder or use existing chart functionality
    if (window.renderRevenueExpenseChart) {
      await window.renderRevenueExpenseChart();
      console.log('✅ Revenue chart loaded via existing function');
    } else {
      container.innerHTML = `
        <div class="chart-placeholder">
          <div class="chart-icon">📈</div>
          <div class="chart-text">Biểu đồ doanh thu sẽ được hiển thị ở đây</div>
        </div>
      `;
      console.log('ℹ️ Revenue chart placeholder displayed');
    }
  } catch (error) {
    console.error('❌ Error loading revenue chart:', error);
    showError('Không thể tải biểu đồ doanh thu');
  }
}