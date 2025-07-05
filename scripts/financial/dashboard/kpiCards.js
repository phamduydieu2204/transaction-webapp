/**
 * kpiCards.js
 * 
 * KPI (Key Performance Indicator) cards for financial dashboard
 * Handles metric cards, alerts, and performance indicators
 */

import { formatCurrencyForChart } from '../core/chartManager.js';

/**
 * Render overview KPI cards
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderOverviewCards(metrics, containerId = 'overviewCards') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for overview cards`);
    return;
  }

  const {
    totalRevenue = 0,
    totalExpenses = 0,
    netProfit = 0,
    profitMargin = 0,
    transactionCount = 0,
    expenseCount = 0,
    growthMetrics = {}
  } = metrics;

  const html = `
    <div class="overview-cards-grid">
      ${renderRevenueCard(totalRevenue, growthMetrics.revenueGrowth)}
      ${renderExpenseCard(totalExpenses, growthMetrics.expenseGrowth)}
      ${renderProfitCard(netProfit, profitMargin)}
      ${renderTransactionCard(transactionCount, totalRevenue)}
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render revenue card
 * @param {number} totalRevenue - Total revenue amount
 * @param {number} growthRate - Revenue growth rate
 * @returns {string} HTML for revenue card
 */
function renderRevenueCard(totalRevenue, growthRate = 0) {
  const isPositiveGrowth = growthRate >= 0;
  const growthIcon = isPositiveGrowth ? '📈' : '📉';
  const growthClass = isPositiveGrowth ? 'positive' : 'negative';

  return `
    <div class="kpi-card revenue-card">
      <div class="card-header">
        <div class="card-icon">💰</div>
        <div class="card-title">Doanh thu</div>
      </div>
      <div class="card-value">${formatCurrencyForChart(totalRevenue)} VND</div>
      <div class="card-growth ${growthClass}">
        <span class="growth-icon">${growthIcon}</span>
        <span class="growth-text">${Math.abs(growthRate).toFixed(1)}% so với tháng trước</span>
      </div>
    </div>
  `;
}

/**
 * Render expense card
 * @param {number} totalExpenses - Total expenses amount
 * @param {number} growthRate - Expense growth rate
 * @returns {string} HTML for expense card
 */
function renderExpenseCard(totalExpenses, growthRate = 0) {
  const isGoodGrowth = growthRate <= 0; // Lower expense growth is better
  const growthIcon = growthRate >= 0 ? '📈' : '📉';
  const growthClass = isGoodGrowth ? 'positive' : 'negative';

  return `
    <div class="kpi-card expense-card">
      <div class="card-header">
        <div class="card-icon">💸</div>
        <div class="card-title">Chi phí</div>
      </div>
      <div class="card-value">${formatCurrencyForChart(totalExpenses)} VND</div>
      <div class="card-growth ${growthClass}">
        <span class="growth-icon">${growthIcon}</span>
        <span class="growth-text">${Math.abs(growthRate).toFixed(1)}% so với tháng trước</span>
      </div>
    </div>
  `;
}

/**
 * Render profit card
 * @param {number} netProfit - Net profit amount
 * @param {number} profitMargin - Profit margin percentage
 * @returns {string} HTML for profit card
 */
function renderProfitCard(netProfit, profitMargin) {
  const isProfit = netProfit >= 0;
  const profitIcon = isProfit ? '📊' : '📉';
  const profitClass = isProfit ? 'positive' : 'negative';

  return `
    <div class="kpi-card profit-card ${profitClass}">
      <div class="card-header">
        <div class="card-icon">${profitIcon}</div>
        <div class="card-title">${isProfit ? 'Lợi nhuận' : 'Lỗ'}</div>
      </div>
      <div class="card-value">${formatCurrencyForChart(Math.abs(netProfit))} VND</div>
      <div class="card-detail">
        <span class="margin-text">Tỷ suất: ${profitMargin.toFixed(1)}%</span>
      </div>
    </div>
  `;
}

/**
 * Render transaction card
 * @param {number} transactionCount - Number of transactions
 * @param {number} totalRevenue - Total revenue for average calculation
 * @returns {string} HTML for transaction card
 */
function renderTransactionCard(transactionCount, totalRevenue) {
  const avgTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  return `
    <div class="kpi-card transaction-card">
      <div class="card-header">
        <div class="card-icon">🔄</div>
        <div class="card-title">Giao dịch</div>
      </div>
      <div class="card-value">${transactionCount.toLocaleString()}</div>
      <div class="card-detail">
        <span class="avg-text">TB: ${formatCurrencyForChart(avgTransactionValue)} VND</span>
      </div>
    </div>
  `;
}

/**
 * Render cash flow tracker cards
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderCashFlowCards(metrics, containerId = 'cashFlowCards') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for cash flow cards`);
    return;
  }

  const { cashFlowMetrics = {} } = metrics;
  const {
    recentCashInflow = 0,
    recentCashOutflow = 0,
    netCashFlow = 0,
    weeklyCashFlow = 0,
    burnRate = 0,
    runwayDays = 0
  } = cashFlowMetrics;

  const html = `
    <div class="cash-flow-section">
      <h4>💵 Dòng tiền & Thanh khoản (30 ngày gần nhất)</h4>
      <div class="cash-flow-grid">
        ${renderCashInflowCard(recentCashInflow)}
        ${renderCashOutflowCard(recentCashOutflow)}
        ${renderNetCashFlowCard(netCashFlow)}
        ${renderWeeklyCashFlowCard(weeklyCashFlow)}
        ${renderBurnRateCard(burnRate)}
        ${renderRunwayCard(runwayDays)}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render cash inflow card
 */
function renderCashInflowCard(cashInflow) {
  return `
    <div class="kpi-card small cash-inflow-card">
      <div class="card-header">
        <div class="card-icon">💰</div>
        <div class="card-title">Tiền vào</div>
      </div>
      <div class="card-value small">${formatCurrencyForChart(cashInflow)}</div>
      <div class="card-detail">30 ngày qua</div>
    </div>
  `;
}

/**
 * Render cash outflow card
 */
function renderCashOutflowCard(cashOutflow) {
  return `
    <div class="kpi-card small cash-outflow-card">
      <div class="card-header">
        <div class="card-icon">💸</div>
        <div class="card-title">Tiền ra</div>
      </div>
      <div class="card-value small">${formatCurrencyForChart(cashOutflow)}</div>
      <div class="card-detail">30 ngày qua</div>
    </div>
  `;
}

/**
 * Render net cash flow card
 */
function renderNetCashFlowCard(netCashFlow) {
  const isPositive = netCashFlow >= 0;
  const cardClass = isPositive ? 'positive' : 'negative';
  const icon = isPositive ? '📈' : '📉';

  return `
    <div class="kpi-card small net-cash-flow-card ${cardClass}">
      <div class="card-header">
        <div class="card-icon">${icon}</div>
        <div class="card-title">Dòng tiền ròng</div>
      </div>
      <div class="card-value small">${formatCurrencyForChart(Math.abs(netCashFlow))}</div>
      <div class="card-detail">${isPositive ? 'Dương' : 'Âm'}</div>
    </div>
  `;
}

/**
 * Render weekly cash flow card
 */
function renderWeeklyCashFlowCard(weeklyCashFlow) {
  const isPositive = weeklyCashFlow >= 0;
  const cardClass = isPositive ? 'positive' : 'negative';

  return `
    <div class="kpi-card small weekly-cash-flow-card ${cardClass}">
      <div class="card-header">
        <div class="card-icon">📅</div>
        <div class="card-title">Tuần này</div>
      </div>
      <div class="card-value small">${formatCurrencyForChart(Math.abs(weeklyCashFlow))}</div>
      <div class="card-detail">7 ngày qua</div>
    </div>
  `;
}

/**
 * Render burn rate card
 */
function renderBurnRateCard(burnRate) {
  const alertClass = burnRate > 1000000 ? 'alert' : ''; // Alert if burning > 1M per day

  return `
    <div class="kpi-card small burn-rate-card ${alertClass}">
      <div class="card-header">
        <div class="card-icon">🔥</div>
        <div class="card-title">Burn Rate</div>
      </div>
      <div class="card-value small">${formatCurrencyForChart(burnRate)}</div>
      <div class="card-detail">mỗi ngày</div>
    </div>
  `;
}

/**
 * Render runway card
 */
function renderRunwayCard(runwayDays) {
  let alertClass = '';
  let icon = '🛫';
  
  if (runwayDays < 30) {
    alertClass = 'critical';
    icon = '⚠️';
  } else if (runwayDays < 90) {
    alertClass = 'warning';
    icon = '🟡';
  }

  return `
    <div class="kpi-card small runway-card ${alertClass}">
      <div class="card-header">
        <div class="card-icon">${icon}</div>
        <div class="card-title">Runway</div>
      </div>
      <div class="card-value small">${Math.round(runwayDays)}</div>
      <div class="card-detail">ngày</div>
    </div>
  `;
}

/**
 * Render performance alerts
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderPerformanceAlerts(metrics, containerId = 'performanceAlerts') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for performance alerts`);
    return;
  }

  const alerts = generatePerformanceAlerts(metrics);
  
  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="alerts-section">
        <h4>🎯 Cảnh báo Hiệu suất</h4>
        <div class="no-alerts">
          <div class="no-alerts-icon">✅</div>
          <div class="no-alerts-text">Không có cảnh báo</div>
        </div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="alerts-section">
      <h4>⚠️ Cảnh báo Hiệu suất</h4>
      <div class="alerts-list">
  `;

  alerts.forEach(alert => {
    html += `
      <div class="alert-item ${alert.severity}">
        <div class="alert-icon">${alert.icon}</div>
        <div class="alert-content">
          <div class="alert-title">${alert.title}</div>
          <div class="alert-description">${alert.description}</div>
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
 * Generate performance alerts based on metrics
 * @param {Object} metrics - Financial metrics data
 * @returns {Array} Array of alert objects
 */
function generatePerformanceAlerts(metrics) {
  const alerts = [];
  const {
    profitMargin = 0,
    cashFlowMetrics = {},
    growthMetrics = {},
    totalRevenue = 0,
    totalExpenses = 0
  } = metrics;

  // Low profit margin alert
  if (profitMargin < 10) {
    alerts.push({
      severity: 'warning',
      icon: '📉',
      title: 'Tỷ suất lợi nhuận thấp',
      description: `Tỷ suất lợi nhuận hiện tại chỉ ${profitMargin.toFixed(1)}%. Cần tối ưu chi phí hoặc tăng doanh thu.`
    });
  }

  // Negative profit alert
  if (profitMargin < 0) {
    alerts.push({
      severity: 'critical',
      icon: '🚨',
      title: 'Kinh doanh thua lỗ',
      description: `Doanh nghiệp đang thua lỗ với tỷ suất ${profitMargin.toFixed(1)}%. Cần hành động khẩn cấp.`
    });
  }

  // Cash flow alerts
  if (cashFlowMetrics.runwayDays && cashFlowMetrics.runwayDays < 30) {
    alerts.push({
      severity: 'critical',
      icon: '💸',
      title: 'Cảnh báo Dòng tiền',
      description: `Runway chỉ còn ${Math.round(cashFlowMetrics.runwayDays)} ngày. Cần bổ sung thanh khoản ngay.`
    });
  } else if (cashFlowMetrics.runwayDays && cashFlowMetrics.runwayDays < 90) {
    alerts.push({
      severity: 'warning',
      icon: '⏰',
      title: 'Dòng tiền cần chú ý',
      description: `Runway còn ${Math.round(cashFlowMetrics.runwayDays)} ngày. Nên chuẩn bị kế hoạch tài chính.`
    });
  }

  // Negative growth alert
  if (growthMetrics.revenueGrowth < -10) {
    alerts.push({
      severity: 'warning',
      icon: '📉',
      title: 'Doanh thu giảm',
      description: `Doanh thu giảm ${Math.abs(growthMetrics.revenueGrowth).toFixed(1)}% so với tháng trước.`
    });
  }

  // High expense growth alert
  if (growthMetrics.expenseGrowth > 20) {
    alerts.push({
      severity: 'warning',
      icon: '💸',
      title: 'Chi phí tăng cao',
      description: `Chi phí tăng ${growthMetrics.expenseGrowth.toFixed(1)}% so với tháng trước. Cần kiểm soát chi phí.`
    });
  }

  // High burn rate alert
  if (cashFlowMetrics.burnRate > 5000000) { // > 5M per day
    alerts.push({
      severity: 'warning',
      icon: '🔥',
      title: 'Burn rate cao',
      description: `Tốc độ chi tiêu ${formatCurrencyForChart(cashFlowMetrics.burnRate)}/ngày. Cần tối ưu chi phí.`
    });
  }

  return alerts;
}