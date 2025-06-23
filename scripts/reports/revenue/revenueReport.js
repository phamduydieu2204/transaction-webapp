/**
 * revenueReport.js
 * 
 * Revenue report functionality
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatPercentage, formatMonthYear } from '../core/reportFormatters.js';
import { calculateTotalRevenue, groupByTimePeriod, calculateGrowthRate } from '../core/reportCalculations.js';

/**
 * Load revenue report
 */
export async function loadRevenueReport() {
  
  try {
    await ensureDataIsLoaded();
    
    await Promise.all([
      loadRevenueOverview(),
      loadRevenueByPeriod(),
      loadRevenueByProduct(),
      loadRevenueByCustomer()
    ]);
    
    console.log('✅ Revenue report loaded');
  } catch (error) {
    console.error('❌ Error loading revenue report:', error);
    showError('Không thể tải báo cáo doanh thu');
  }
}

/**
 * Load revenue overview
 */
async function loadRevenueOverview() {
  const container = document.getElementById('revenueOverview');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const currentMonth = new Date();
  const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  
  // Calculate current and previous month revenue
  const currentMonthRevenue = calculateTotalRevenue(transactions, {
    startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    endDate: currentMonth
  
  const lastMonthRevenue = calculateTotalRevenue(transactions, {
    startDate: lastMonth,
    endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
  
  const growthRate = calculateGrowthRate(currentMonthRevenue, lastMonthRevenue);
  
  const html = `
    <div class="revenue-overview">
      <div class="overview-card current-month">
        <h4>Doanh thu tháng này</h4>
        <div class="revenue-amount">${formatRevenue(currentMonthRevenue)}</div>
        <div class="growth-rate ${growthRate >= 0 ? 'positive' : 'negative'}">
          ${growthRate >= 0 ? '📈' : '📉'} ${formatPercentage(Math.abs(growthRate))} so với tháng trước
        </div>
      </div>
      
      <div class="overview-card last-month">
        <h4>Doanh thu tháng trước</h4>
        <div class="revenue-amount">${formatRevenue(lastMonthRevenue)}</div>
        <div class="month-label">${formatMonthYear(lastMonth)}</div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Load revenue by time period
 */
async function loadRevenueByPeriod() {
  const container = document.getElementById('revenueByPeriod');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const monthlyData = groupByTimePeriod(transactions, 'month');
  
  let html = `
    <div class="revenue-by-period">
      <h4>Doanh thu theo tháng</h4>
      <div class="period-chart">
  `;
  
  // Sort months and display last 6 months
  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
  
  sortedMonths.forEach(month => {
    const monthTransactions = monthlyData[month];
    const monthRevenue = calculateTotalRevenue(monthTransactions);
    
    html += `
      <div class="period-bar">
        <div class="bar-label">${month}</div>
        <div class="bar-container">
          <div class="bar" style="height: ${Math.min(monthRevenue / 10000000, 100)}px"></div>
        </div>
        <div class="bar-value">${formatRevenue(monthRevenue)}</div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Load revenue by product
 */
async function loadRevenueByProduct() {
  const container = document.getElementById('revenueByProduct');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const productRevenue = {};
  
  transactions.forEach(transaction => {
    const product = transaction.software || 'Không xác định';
    const revenue = parseFloat(transaction.revenue) || 0;
    
    if (!productRevenue[product]) {
      productRevenue[product] = 0;
    }
    productRevenue[product] += revenue;
  });
  
  const sortedProducts = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  let html = `
    <div class="revenue-by-product">
      <h4>Doanh thu theo sản phẩm</h4>
      <div class="product-list">
  `;
  
  sortedProducts.forEach(([product, revenue], index) => {
    const percentage = (revenue / calculateTotalRevenue(transactions)) * 100;
    
    html += `
      <div class="product-item">
        <div class="product-rank">#${index + 1}</div>
        <div class="product-name">${product}</div>
        <div class="product-revenue">${formatRevenue(revenue)}</div>
        <div class="product-percentage">${formatPercentage(percentage)}</div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Load revenue by customer
 */
async function loadRevenueByCustomer() {
  const container = document.getElementById('revenueByCustomer');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const customerRevenue = {};
  
  transactions.forEach(transaction => {
    const customer = transaction.customer || 'Không xác định';
    const revenue = parseFloat(transaction.revenue) || 0;
    
    if (!customerRevenue[customer]) {
      customerRevenue[customer] = 0;
    }
    customerRevenue[customer] += revenue;
  });
  
  const sortedCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  let html = `
    <div class="revenue-by-customer">
      <h4>Doanh thu theo khách hàng</h4>
      <div class="customer-list">
  `;
  
  sortedCustomers.forEach(([customer, revenue], index) => {
    const percentage = (revenue / calculateTotalRevenue(transactions)) * 100;
    
    html += `
      <div class="customer-item">
        <div class="customer-rank">#${index + 1}</div>
        <div class="customer-name">${customer}</div>
        <div class="customer-revenue">${formatRevenue(revenue)}</div>
        <div class="customer-percentage">${formatPercentage(percentage)}</div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}