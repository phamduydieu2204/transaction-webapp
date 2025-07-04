/**
 * renewalReport.js
 * 
 * Renewal and subscription analytics
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatDate, formatRelativeTime } from '../core/reportFormatters.js';
import { calculateDaysBetween, calculateRenewalRate } from '../core/reportCalculations.js';

/**
 * Load renewal report
 */
export async function loadRenewalReport() {
  // console.log('🔄 Loading renewal report');
  
  try {
    await ensureDataIsLoaded();
    
    const container = document.getElementById('report-renewal');
    if (!container) {
      console.warn('❌ Renewal report container not found');
      return;
    }
    
    const html = `
      <div class="renewal-report">
        <h3>🔄 Báo cáo Gia hạn</h3>
        <div id="renewalOverview"></div>
        <div id="expiringSubscriptions"></div>
        <div id="renewalTrends"></div>
      </div>
    `;
    
    container.innerHTML = html;
    
    await Promise.all([
      loadRenewalOverview(),
      loadExpiringSubscriptions(),
      loadRenewalTrends()
    ]);
    
    // console.log('✅ Renewal report loaded');
  } catch (error) {
    console.error('❌ Error loading renewal report:', error);
    showError('Không thể tải báo cáo gia hạn');
  }
}

/**
 * Load renewal overview statistics
 */
async function loadRenewalOverview() {
  const container = document.getElementById('renewalOverview');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  
  // Filter renewal transactions (assuming there's a way to identify them)
  const renewalTransactions = transactions.filter(t => 
    t.transactionType === 'Gia hạn' || 
    t.notes?.toLowerCase().includes('gia hạn') ||
    t.description?.toLowerCase().includes('renewal')
  );
  
  const newTransactions = transactions.filter(t => 
    t.transactionType === 'Mới' || 
    (!t.transactionType && !renewalTransactions.includes(t))
  );
  
  const renewalRevenue = renewalTransactions.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  const newRevenue = newTransactions.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
  const totalRevenue = renewalRevenue + newRevenue;
  
  const renewalRate = calculateRenewalRate(renewalTransactions, transactions);
  
  const html = `
    <div class="renewal-overview">
      <h4>📊 Tổng quan Gia hạn</h4>
      
      <div class="renewal-metrics">
        <div class="renewal-metric">
          <div class="metric-icon">🔄</div>
          <div class="metric-value">${renewalTransactions.length}</div>
          <div class="metric-label">Giao dịch gia hạn</div>
          <div class="metric-detail">${formatRevenue(renewalRevenue)}</div>
        </div>
        
        <div class="renewal-metric">
          <div class="metric-icon">🆕</div>
          <div class="metric-value">${newTransactions.length}</div>
          <div class="metric-label">Giao dịch mới</div>
          <div class="metric-detail">${formatRevenue(newRevenue)}</div>
        </div>
        
        <div class="renewal-metric">
          <div class="metric-icon">📈</div>
          <div class="metric-value">${renewalRate.toFixed(1)}%</div>
          <div class="metric-label">Tỷ lệ gia hạn</div>
          <div class="metric-detail">Renewal rate</div>
        </div>
        
        <div class="renewal-metric">
          <div class="metric-icon">💰</div>
          <div class="metric-value">${((renewalRevenue / totalRevenue) * 100).toFixed(1)}%</div>
          <div class="metric-label">% Doanh thu gia hạn</div>
          <div class="metric-detail">Của tổng doanh thu</div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Load expiring subscriptions
 */
async function loadExpiringSubscriptions() {
  const container = document.getElementById('expiringSubscriptions');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  const now = new Date();
  
  // Calculate expiring subscriptions (assuming end dates exist)
  const expiringItems = [];
  
  transactions.forEach(transaction => {
    if (transaction.ngayKetThuc) {
      const endDate = new Date(transaction.ngayKetThuc);
      const daysUntilExpiry = calculateDaysBetween(now, endDate);
      
      if (daysUntilExpiry <= 90 && daysUntilExpiry >= 0) { // Next 90 days
        expiringItems.push({
          ...transaction,
          daysUntilExpiry,
          isUrgent: daysUntilExpiry <= 30
        });
      }
    }
  });
  
  // Sort by expiry date
  expiringItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  
  let html = `
    <div class="expiring-subscriptions">
      <h4>⚠️ Sắp hết hạn (90 ngày tới)</h4>
      
      <div class="expiry-summary">
        <div class="expiry-stat urgent">
          <div class="stat-count">${expiringItems.filter(i => i.daysUntilExpiry <= 30).length}</div>
          <div class="stat-label">Khẩn cấp (≤30 ngày)</div>
        </div>
        <div class="expiry-stat warning">
          <div class="stat-count">${expiringItems.filter(i => i.daysUntilExpiry > 30 && i.daysUntilExpiry <= 60).length}</div>
          <div class="stat-label">Cảnh báo (31-60 ngày)</div>
        </div>
        <div class="expiry-stat normal">
          <div class="stat-count">${expiringItems.filter(i => i.daysUntilExpiry > 60).length}</div>
          <div class="stat-label">Bình thường (61-90 ngày)</div>
        </div>
      </div>
      
      <div class="expiring-list">
  `;
  
  expiringItems.slice(0, 10).forEach(item => {
    const urgencyClass = item.isUrgent ? 'urgent' : (item.daysUntilExpiry <= 60 ? 'warning' : 'normal');
    
    html += `
      <div class="expiring-item ${urgencyClass}">
        <div class="expiring-info">
          <div class="customer-name">${item.customer || 'Không xác định'}</div>
          <div class="software-name">${item.software || 'Không xác định'}</div>
          <div class="revenue-amount">${formatRevenue(parseFloat(item.revenue) || 0)}</div>
        </div>
        <div class="expiry-details">
          <div class="days-left">${item.daysUntilExpiry} ngày</div>
          <div class="expiry-date">${formatDate(item.ngayKetThuc)}</div>
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
 * Load renewal trends
 */
async function loadRenewalTrends() {
  const container = document.getElementById('renewalTrends');
  if (!container) return;
  
  const transactions = window.transactionList || [];
  
  // Group renewals by month
  const renewalsByMonth = {};
  const newSubscriptionsByMonth = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.ngayTao);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const isRenewal = transaction.transactionType === 'Gia hạn' || 
                     transaction.notes?.toLowerCase().includes('gia hạn');
    
    if (isRenewal) {
      if (!renewalsByMonth[monthKey]) renewalsByMonth[monthKey] = 0;
      renewalsByMonth[monthKey]++;
    } else {
      if (!newSubscriptionsByMonth[monthKey]) newSubscriptionsByMonth[monthKey] = 0;
      newSubscriptionsByMonth[monthKey]++;
    }
  });
  
  // Get last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      key: monthKey,
      label: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      renewals: renewalsByMonth[monthKey] || 0,
      newSubs: newSubscriptionsByMonth[monthKey] || 0
    });
  }
  
  let html = `
    <div class="renewal-trends">
      <h4>📈 Xu hướng Gia hạn</h4>
      
      <div class="trend-chart">
  `;
  
  months.forEach(month => {
    const total = month.renewals + month.newSubs;
    const renewalPercentage = total > 0 ? (month.renewals / total) * 100 : 0;
    
    html += `
      <div class="trend-month">
        <div class="month-chart">
          <div class="chart-bar renewals" style="height: ${month.renewals * 5}px" title="Gia hạn: ${month.renewals}"></div>
          <div class="chart-bar new-subs" style="height: ${month.newSubs * 3}px" title="Mới: ${month.newSubs}"></div>
        </div>
        <div class="month-stats">
          <div class="renewal-count">GH: ${month.renewals}</div>
          <div class="new-count">Mới: ${month.newSubs}</div>
          <div class="renewal-rate">${renewalPercentage.toFixed(0)}%</div>
        </div>
        <div class="month-label">${month.label}</div>
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="trend-legend">
        <div class="legend-item">
          <div class="legend-color renewals"></div>
          <span>Gia hạn</span>
        </div>
        <div class="legend-item">
          <div class="legend-color new-subs"></div>
          <span>Đăng ký mới</span>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}