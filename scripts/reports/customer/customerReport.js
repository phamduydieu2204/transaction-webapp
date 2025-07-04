/**
 * customerReport.js
 * 
 * Customer analytics and reporting functionality
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatDate, formatDuration } from '../core/reportFormatters.js';
import { calculateCustomerLifetimeValue, calculateDaysBetween } from '../core/reportCalculations.js';

/**
 * Load customer report
 */
export async function loadCustomerReport() {
  console.log('👥 Loading customer report');
  
  try {
    await ensureDataIsLoaded();
    
    await Promise.all([
      loadCustomerOverview(),
      loadTopCustomers(),
      loadCustomerLifetimeValue(),
      loadCustomerActivity()
    ]);
    
    // console.log('✅ Customer report loaded');
  } catch (error) {
    console.error('❌ Error loading customer report:', error);
    showError('Không thể tải báo cáo khách hàng');
  }
}

/**
 * Load customer overview statistics
 */
async function loadCustomerOverview() {
  const container = document.getElementById('customerOverview');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  
  // Calculate customer metrics
  const uniqueCustomers = new Set(transactions.map(t => t.customer)).size;
  const totalRevenue = transactions.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  const avgRevenuePerCustomer = totalRevenue / (uniqueCustomers || 1);
  const avgTransactionsPerCustomer = transactions.length / (uniqueCustomers || 1);
  
  // New customers this month
  const thisMonth = new Date();
  const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const newCustomersThisMonth = new Set(
    transactions
      .filter(t => new Date(t.ngayTao) >= startOfMonth)
      .map(t => t.customer)
  ).size;
  
  const html = `
    <div class="customer-overview-grid">
      <div class="overview-metric">
        <div class="metric-icon">👥</div>
        <div class="metric-value">${uniqueCustomers.toLocaleString()}</div>
        <div class="metric-label">Tổng khách hàng</div>
      </div>
      
      <div class="overview-metric">
        <div class="metric-icon">💰</div>
        <div class="metric-value">${formatRevenue(avgRevenuePerCustomer)}</div>
        <div class="metric-label">Doanh thu trung bình/KH</div>
      </div>
      
      <div class="overview-metric">
        <div class="metric-icon">📊</div>
        <div class="metric-value">${avgTransactionsPerCustomer.toFixed(1)}</div>
        <div class="metric-label">Giao dịch trung bình/KH</div>
      </div>
      
      <div class="overview-metric">
        <div class="metric-icon">🆕</div>
        <div class="metric-value">${newCustomersThisMonth}</div>
        <div class="metric-label">Khách hàng mới tháng này</div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Load top customers by revenue
 */
async function loadTopCustomers() {
  const container = document.getElementById('topCustomersList');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const customerStats = {};
  
  // Calculate stats for each customer
  transactions.forEach(transaction => {
    const customer = transaction.customer || 'Không xác định';
    const revenue = parseFloat(transaction.revenue) || 0;
    
    if (!customerStats[customer]) {
      customerStats[customer] = {
        name: customer,
        revenue: 0,
        transactionCount: 0,
        firstTransaction: transaction.ngayTao,
        lastTransaction: transaction.ngayTao
      };
    }
    
    customerStats[customer].revenue += revenue;
    customerStats[customer].transactionCount += 1;
    
    if (new Date(transaction.ngayTao) < new Date(customerStats[customer].firstTransaction)) {
      customerStats[customer].firstTransaction = transaction.ngayTao;
    }
    if (new Date(transaction.ngayTao) > new Date(customerStats[customer].lastTransaction)) {
      customerStats[customer].lastTransaction = transaction.ngayTao;
    }
  });
  
  // Sort by revenue and get top 10
  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  let html = `
    <div class="top-customers">
      <h4>🏆 Top 10 Khách hàng</h4>
      <div class="customers-table">
        <div class="table-header">
          <div>Hạng</div>
          <div>Khách hàng</div>
          <div>Doanh thu</div>
          <div>Giao dịch</div>
          <div>Khách hàng từ</div>
        </div>
  `;
  
  topCustomers.forEach((customer, index) => {
    const customerSince = formatDate(customer.firstTransaction);
    const avgTransactionValue = customer.revenue / customer.transactionCount;
    
    html += `
      <div class="table-row">
        <div class="customer-rank">#${index + 1}</div>
        <div class="customer-name">${customer.name}</div>
        <div class="customer-revenue">${formatRevenue(customer.revenue)}</div>
        <div class="customer-transactions">
          ${customer.transactionCount} 
          <small>(Avg: ${formatRevenue(avgTransactionValue)})</small>
        </div>
        <div class="customer-since">${customerSince}</div>
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
 * Load customer lifetime value analysis
 */
async function loadCustomerLifetimeValue() {
  const container = document.getElementById('customerLifetimeValue');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const customerLTV = {};
  
  // Calculate LTV for each customer
  transactions.forEach(transaction => {
    const customer = transaction.customer || 'Không xác định';
    if (!customerLTV[customer]) {
      customerLTV[customer] = [];
    }
    customerLTV[customer].push(transaction);
  });
  
  // Calculate LTV statistics
  const ltvValues = Object.entries(customerLTV).map(([customer, customerTransactions]) => {
    const ltv = calculateCustomerLifetimeValue(customerTransactions);
    const daysSinceFirst = calculateDaysBetween(
      customerTransactions[0].ngayTao,
      new Date()
    );
    
    return {
      customer,
      ltv,
      transactionCount: customerTransactions.length,
      daysSinceFirst
    };
  });
  
  // Sort by LTV
  ltvValues.sort((a, b) => b.ltv - a.ltv);
  
  const avgLTV = ltvValues.reduce((sum, c) => sum + c.ltv, 0) / ltvValues.length;
  const medianLTV = ltvValues[Math.floor(ltvValues.length / 2)]?.ltv || 0;
  const maxLTV = ltvValues[0]?.ltv || 0;
  
  let html = `
    <div class="ltv-analysis">
      <h4>💎 Phân tích Customer Lifetime Value</h4>
      
      <div class="ltv-stats">
        <div class="ltv-stat">
          <div class="stat-label">LTV Trung bình</div>
          <div class="stat-value">${formatRevenue(avgLTV)}</div>
        </div>
        <div class="ltv-stat">
          <div class="stat-label">LTV Trung vị</div>
          <div class="stat-value">${formatRevenue(medianLTV)}</div>
        </div>
        <div class="ltv-stat">
          <div class="stat-label">LTV Cao nhất</div>
          <div class="stat-value">${formatRevenue(maxLTV)}</div>
        </div>
      </div>
      
      <div class="ltv-distribution">
        <h5>Phân bố LTV (Top 5)</h5>
  `;
  
  ltvValues.slice(0, 5).forEach((customer, index) => {
    html += `
      <div class="ltv-item">
        <div class="ltv-rank">#${index + 1}</div>
        <div class="ltv-customer">${customer.customer}</div>
        <div class="ltv-value">${formatRevenue(customer.ltv)}</div>
        <div class="ltv-details">
          ${customer.transactionCount} giao dịch · 
          ${formatDuration(customer.daysSinceFirst)}
        </div>
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
 * Load customer activity analysis
 */
async function loadCustomerActivity() {
  const container = document.getElementById('customerActivity');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const now = new Date();
  
  // Categorize customers by last activity
  const categories = {
    active: [], // Last 30 days
    recent: [], // 31-90 days
    inactive: [], // 91-365 days
    dormant: [] // 365+ days
  };
  
  const customerLastActivity = {};
  
  transactions.forEach(transaction => {
    const customer = transaction.customer || 'Không xác định';
    const transactionDate = new Date(transaction.ngayTao);
    
    if (!customerLastActivity[customer] || transactionDate > customerLastActivity[customer]) {
      customerLastActivity[customer] = transactionDate;
    }
  });
  
  Object.entries(customerLastActivity).forEach(([customer, lastActivity]) => {
    const daysSinceLastActivity = calculateDaysBetween(lastActivity, now);
    
    if (daysSinceLastActivity <= 30) {
      categories.active.push({ customer, daysSinceLastActivity });
    } else if (daysSinceLastActivity <= 90) {
      categories.recent.push({ customer, daysSinceLastActivity });
    } else if (daysSinceLastActivity <= 365) {
      categories.inactive.push({ customer, daysSinceLastActivity });
    } else {
      categories.dormant.push({ customer, daysSinceLastActivity });
    }
  });
  
  const html = `
    <div class="customer-activity">
      <h4>🎯 Phân tích hoạt động khách hàng</h4>
      
      <div class="activity-grid">
        <div class="activity-category active">
          <div class="category-icon">🟢</div>
          <div class="category-count">${categories.active.length}</div>
          <div class="category-label">Hoạt động<br>(0-30 ngày)</div>
        </div>
        
        <div class="activity-category recent">
          <div class="category-icon">🟡</div>
          <div class="category-count">${categories.recent.length}</div>
          <div class="category-label">Gần đây<br>(31-90 ngày)</div>
        </div>
        
        <div class="activity-category inactive">
          <div class="category-icon">🟠</div>
          <div class="category-count">${categories.inactive.length}</div>
          <div class="category-label">Không hoạt động<br>(91-365 ngày)</div>
        </div>
        
        <div class="activity-category dormant">
          <div class="category-icon">🔴</div>
          <div class="category-count">${categories.dormant.length}</div>
          <div class="category-label">Ngừng hoạt động<br>(365+ ngày)</div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}