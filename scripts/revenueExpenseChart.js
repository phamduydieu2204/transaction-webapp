/**
 * revenueExpenseChart.js
 * 
 * Biểu đồ doanh thu và chi phí 12 tháng gần nhất
 */

import { normalizeDate, formatCurrency } from './statisticsCore.js';

/**
 * Calculate revenue and expense data for last 12 months
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @returns {Object} Monthly data for chart
 */
export function calculateLast12MonthsData(transactionData, expenseData) {
  const monthlyData = {};
  const today = new Date();
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = {
      month: monthKey,
      monthLabel: `${date.getMonth() + 1}/${date.getFullYear()}`,
      revenue: 0,
      expense: 0,
      profit: 0
    };
  }
  
  // Calculate revenue by month
  transactionData.forEach(transaction => {
    const transactionDate = new Date(normalizeDate(transaction.transactionDate));
    const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyData[monthKey]) {
      const revenue = parseFloat(transaction.revenue) || 0;
      monthlyData[monthKey].revenue += revenue;
    }
  });
  
  // Calculate expenses by month
  expenseData.forEach(expense => {
    const expenseDate = new Date(normalizeDate(expense.date));
    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyData[monthKey]) {
      const amount = parseFloat(expense.amount) || 0;
      monthlyData[monthKey].expense += amount;
    }
  });
  
  // Calculate profit
  Object.values(monthlyData).forEach(month => {
    month.profit = month.revenue - month.expense;
  });
  
  return Object.values(monthlyData);
}

/**
 * Render revenue/expense chart
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 */
export function renderRevenueExpenseChart(transactionData, expenseData, containerId = 'revenueChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  const monthlyData = calculateLast12MonthsData(transactionData, expenseData);
  
  // Find max value for scaling
  const maxValue = Math.max(
    ...monthlyData.map(d => Math.max(d.revenue, d.expense))
  );
  
  // Create chart HTML
  const chartHTML = `
    <div class="revenue-expense-chart">
      <div class="chart-header">
        <h3>📊 Biểu đồ Doanh thu & Chi phí 12 tháng gần nhất</h3>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color revenue"></span>
            <span>Doanh thu</span>
          </div>
          <div class="legend-item">
            <span class="legend-color expense"></span>
            <span>Chi phí</span>
          </div>
          <div class="legend-item">
            <span class="legend-color profit"></span>
            <span>Lợi nhuận</span>
          </div>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-y-axis">
          ${generateYAxisLabels(maxValue)}
        </div>
        
        <div class="chart-area">
          <svg viewBox="0 0 1000 400" class="line-chart">
            <!-- Grid lines -->
            ${generateGridLines()}
            
            <!-- Revenue line -->
            <polyline
              class="chart-line revenue-line"
              points="${generateLinePoints(monthlyData, 'revenue', maxValue)}"
              fill="none"
              stroke="#28a745"
              stroke-width="3"
            />
            
            <!-- Expense line -->
            <polyline
              class="chart-line expense-line"
              points="${generateLinePoints(monthlyData, 'expense', maxValue)}"
              fill="none"
              stroke="#dc3545"
              stroke-width="3"
            />
            
            <!-- Profit area -->
            <path
              class="profit-area"
              d="${generateProfitArea(monthlyData, maxValue)}"
              fill="url(#profitGradient)"
              opacity="0.3"
            />
            
            <!-- Data points -->
            ${generateDataPoints(monthlyData, maxValue)}
            
            <!-- Gradient definitions -->
            <defs>
              <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#17a2b8;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#17a2b8;stop-opacity:0.1" />
              </linearGradient>
            </defs>
          </svg>
          
          <!-- Tooltips -->
          <div class="chart-tooltips">
            ${monthlyData.map((data, index) => `
              <div class="chart-tooltip" 
                   style="left: ${(index / 11) * 100}%"
                   data-month="${data.monthLabel}">
                <div class="tooltip-content">
                  <div class="tooltip-title">${data.monthLabel}</div>
                  <div class="tooltip-row revenue">
                    Doanh thu: ${formatCurrency(data.revenue, 'VND')}
                  </div>
                  <div class="tooltip-row expense">
                    Chi phí: ${formatCurrency(data.expense, 'VND')}
                  </div>
                  <div class="tooltip-row profit ${data.profit >= 0 ? 'positive' : 'negative'}">
                    Lợi nhuận: ${formatCurrency(data.profit, 'VND')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="chart-x-axis">
          ${monthlyData.map((data, index) => `
            <div class="x-label" style="left: ${(index / 11) * 100}%">
              ${data.monthLabel.split('/')[0]}
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Summary stats -->
      <div class="chart-summary">
        ${generateChartSummary(monthlyData)}
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
  
  // Add interactivity
  addChartInteractivity(containerId);
}

/**
 * Generate Y-axis labels
 */
function generateYAxisLabels(maxValue) {
  const steps = 5;
  let labels = '';
  
  for (let i = steps; i >= 0; i--) {
    const value = (maxValue / steps) * i;
    labels += `
      <div class="y-label" style="bottom: ${(i / steps) * 100}%">
        ${formatNumber(value)}
      </div>
    `;
  }
  
  return labels;
}

/**
 * Generate grid lines
 */
function generateGridLines() {
  let lines = '';
  const steps = 5;
  
  // Horizontal lines
  for (let i = 0; i <= steps; i++) {
    const y = 400 - (400 / steps) * i;
    lines += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="#e0e0e0" stroke-width="1" />`;
  }
  
  // Vertical lines
  for (let i = 0; i < 12; i++) {
    const x = (1000 / 11) * i;
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="400" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />`;
  }
  
  return lines;
}

/**
 * Generate line points for SVG polyline
 */
function generateLinePoints(data, type, maxValue) {
  return data.map((month, index) => {
    const x = (1000 / 11) * index;
    const y = 400 - (month[type] / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
}

/**
 * Generate profit area path
 */
function generateProfitArea(data, maxValue) {
  let path = 'M 0,400';
  
  data.forEach((month, index) => {
    const x = (1000 / 11) * index;
    const revenueY = 400 - (month.revenue / maxValue) * 400;
    const expenseY = 400 - (month.expense / maxValue) * 400;
    
    if (index === 0) {
      path += ` L ${x},${revenueY}`;
    } else {
      path += ` L ${x},${revenueY}`;
    }
  });
  
  // Close the path
  for (let i = data.length - 1; i >= 0; i--) {
    const x = (1000 / 11) * i;
    const expenseY = 400 - (data[i].expense / maxValue) * 400;
    path += ` L ${x},${expenseY}`;
  }
  
  path += ' Z';
  return path;
}

/**
 * Generate data points
 */
function generateDataPoints(data, maxValue) {
  let points = '';
  
  data.forEach((month, index) => {
    const x = (1000 / 11) * index;
    const revenueY = 400 - (month.revenue / maxValue) * 400;
    const expenseY = 400 - (month.expense / maxValue) * 400;
    
    // Revenue point
    points += `
      <circle cx="${x}" cy="${revenueY}" r="5" fill="#28a745" class="data-point revenue-point" />
    `;
    
    // Expense point
    points += `
      <circle cx="${x}" cy="${expenseY}" r="5" fill="#dc3545" class="data-point expense-point" />
    `;
  });
  
  return points;
}

/**
 * Generate chart summary
 */
function generateChartSummary(data) {
  const totalRevenue = data.reduce((sum, month) => sum + month.revenue, 0);
  const totalExpense = data.reduce((sum, month) => sum + month.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const avgMonthlyRevenue = totalRevenue / 12;
  const avgMonthlyExpense = totalExpense / 12;
  
  // Find best and worst months
  const bestMonth = data.reduce((best, month) => 
    month.profit > best.profit ? month : best
  );
  const worstMonth = data.reduce((worst, month) => 
    month.profit < worst.profit ? month : worst
  );
  
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <div class="summary-label">Tổng doanh thu 12 tháng</div>
          <div class="summary-value revenue">${formatCurrency(totalRevenue, 'VND')}</div>
          <div class="summary-detail">TB: ${formatCurrency(avgMonthlyRevenue, 'VND')}/tháng</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">💸</div>
        <div class="summary-content">
          <div class="summary-label">Tổng chi phí 12 tháng</div>
          <div class="summary-value expense">${formatCurrency(totalExpense, 'VND')}</div>
          <div class="summary-detail">TB: ${formatCurrency(avgMonthlyExpense, 'VND')}/tháng</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">📈</div>
        <div class="summary-content">
          <div class="summary-label">Lợi nhuận ròng</div>
          <div class="summary-value ${totalProfit >= 0 ? 'profit' : 'loss'}">${formatCurrency(totalProfit, 'VND')}</div>
          <div class="summary-detail">Margin: ${((totalProfit / totalRevenue) * 100).toFixed(1)}%</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">🏆</div>
        <div class="summary-content">
          <div class="summary-label">Tháng tốt nhất</div>
          <div class="summary-value">${bestMonth.monthLabel}</div>
          <div class="summary-detail">LN: ${formatCurrency(bestMonth.profit, 'VND')}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format number for display
 */
function formatNumber(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

/**
 * Add chart interactivity
 */
function addChartInteractivity(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Hover effects for tooltips
  const tooltips = container.querySelectorAll('.chart-tooltip');
  const dataPoints = container.querySelectorAll('.data-point');
  
  tooltips.forEach((tooltip, index) => {
    const tooltipArea = tooltip;
    
    tooltipArea.addEventListener('mouseenter', () => {
      tooltip.classList.add('active');
      
      // Highlight corresponding data points
      const revenuePoint = dataPoints[index * 2];
      const expensePoint = dataPoints[index * 2 + 1];
      
      if (revenuePoint) revenuePoint.setAttribute('r', '8');
      if (expensePoint) expensePoint.setAttribute('r', '8');
    });
    
    tooltipArea.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
      
      // Reset data points
      const revenuePoint = dataPoints[index * 2];
      const expensePoint = dataPoints[index * 2 + 1];
      
      if (revenuePoint) revenuePoint.setAttribute('r', '5');
      if (expensePoint) expensePoint.setAttribute('r', '5');
    });
  });
}

/**
 * Export chart styles
 */
export function addRevenueExpenseChartStyles() {
  if (document.getElementById('revenue-expense-chart-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'revenue-expense-chart-styles';
  styles.textContent = `
    .revenue-expense-chart {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .chart-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 20px;
    }
    
    .chart-legend {
      display: flex;
      gap: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #4a5568;
    }
    
    .legend-color {
      width: 20px;
      height: 3px;
      border-radius: 2px;
    }
    
    .legend-color.revenue { background: #28a745; }
    .legend-color.expense { background: #dc3545; }
    .legend-color.profit { background: #17a2b8; }
    
    .chart-container {
      position: relative;
      display: grid;
      grid-template-columns: 60px 1fr;
      grid-template-rows: 1fr 40px;
      gap: 10px;
      height: 450px;
    }
    
    .chart-y-axis {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-right: 10px;
    }
    
    .y-label {
      position: absolute;
      right: 0;
      transform: translateY(50%);
      font-size: 12px;
      color: #718096;
      text-align: right;
      width: 100%;
    }
    
    .chart-area {
      position: relative;
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .line-chart {
      width: 100%;
      height: 100%;
    }
    
    .chart-line {
      transition: all 0.3s ease;
    }
    
    .data-point {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .data-point:hover {
      r: 8;
    }
    
    .chart-x-axis {
      grid-column: 2;
      position: relative;
      display: flex;
      justify-content: space-between;
      padding-top: 10px;
    }
    
    .x-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 12px;
      color: #718096;
    }
    
    .chart-tooltips {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    .chart-tooltip {
      position: absolute;
      width: 8.33%;
      height: 100%;
      pointer-events: auto;
    }
    
    .tooltip-content {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 10;
      pointer-events: none;
    }
    
    .chart-tooltip.active .tooltip-content {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(-15px);
    }
    
    .tooltip-title {
      font-weight: bold;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .tooltip-row {
      margin: 4px 0;
    }
    
    .tooltip-row.revenue { color: #48bb78; }
    .tooltip-row.expense { color: #f56565; }
    .tooltip-row.profit.positive { color: #4fd1c5; }
    .tooltip-row.profit.negative { color: #feb2b2; }
    
    .chart-summary {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    
    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .summary-icon {
      font-size: 32px;
    }
    
    .summary-content {
      flex: 1;
    }
    
    .summary-label {
      font-size: 13px;
      color: #718096;
      margin-bottom: 4px;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .summary-value.revenue { color: #28a745; }
    .summary-value.expense { color: #dc3545; }
    .summary-value.profit { color: #17a2b8; }
    .summary-value.loss { color: #ffc107; }
    
    .summary-detail {
      font-size: 12px;
      color: #a0aec0;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
      
      .chart-legend {
        flex-wrap: wrap;
      }
      
      .summary-grid {
        grid-template-columns: 1fr;
      }
      
      .chart-container {
        height: 350px;
      }
    }
  `;
  
  document.head.appendChild(styles);
}