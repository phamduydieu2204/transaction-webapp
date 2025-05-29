/**
 * cashFlowVsAccrualReport.js
 * 
 * Báo cáo so sánh Cash Flow (dòng tiền thực) vs Accrual (chi phí phân bổ)
 */

import { formatCurrency, normalizeDate } from './statisticsCore.js';
import { getAllocatedAmount, isExpenseInRange } from './handleAllocationPeriod.js';

/**
 * Render Cash Flow vs Accrual comparison report
 */
export function renderCashFlowVsAccrualReport(expenseData, options = {}) {
  const {
    containerId = "cashFlowVsAccrualReport",
    dateRange = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container #${containerId} not found`);
    return;
  }

  console.log("💰 Rendering Cash Flow vs Accrual Report:", {
    expenses: expenseData.length,
    dateRange
  });

  // Calculate both views
  const cashFlowData = calculateCashFlowView(expenseData, dateRange);
  const accrualData = calculateAccrualView(expenseData, dateRange);
  const comparison = compareViews(cashFlowData, accrualData);

  // Render report
  const reportHTML = `
    <div class="cashflow-accrual-report">
      ${renderReportHeader(dateRange)}
      ${renderComparisonSummary(comparison)}
      ${renderDualViewCharts(cashFlowData, accrualData)}
      ${renderDetailedBreakdown(cashFlowData, accrualData)}
      ${renderInsights(comparison)}
    </div>
  `;

  container.innerHTML = reportHTML;
  
  // Add interactivity
  addReportInteractivity();
}

/**
 * Calculate Cash Flow view (actual money out)
 */
function calculateCashFlowView(expenseData, dateRange) {
  const result = {
    total: 0,
    byMonth: {},
    byCategory: {},
    byDay: {},
    largePayments: []
  };

  expenseData.forEach(expense => {
    const expenseDate = new Date(expense.date);
    
    // Check if in date range
    if (dateRange && dateRange.start && dateRange.end) {
      const rangeStart = new Date(dateRange.start);
      const rangeEnd = new Date(dateRange.end);
      
      if (expenseDate < rangeStart || expenseDate > rangeEnd) {
        return;
      }
    }

    const amount = parseFloat(expense.amount || 0);
    const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    const day = normalizeDate(expense.date);
    const category = expense.type || expense.category || 'Khác';

    // Aggregate data
    result.total += amount;
    result.byMonth[month] = (result.byMonth[month] || 0) + amount;
    result.byCategory[category] = (result.byCategory[category] || 0) + amount;
    result.byDay[day] = (result.byDay[day] || 0) + amount;

    // Track large payments (> 10M VND)
    if (amount > 10000000) {
      result.largePayments.push({
        date: day,
        amount: amount,
        description: expense.note || expense.category || 'Chi phí lớn',
        allocation: expense.allocationPeriod
      });
    }
  });

  return result;
}

/**
 * Calculate Accrual view (allocated expenses)
 */
function calculateAccrualView(expenseData, dateRange) {
  const result = {
    total: 0,
    byMonth: {},
    byCategory: {},
    byDay: {},
    allocatedExpenses: []
  };

  // Get date range bounds
  let rangeStart, rangeEnd;
  if (dateRange && dateRange.start && dateRange.end) {
    rangeStart = new Date(dateRange.start);
    rangeEnd = new Date(dateRange.end);
  } else {
    // Use full year if no range specified
    const now = new Date();
    rangeStart = new Date(now.getFullYear(), 0, 1);
    rangeEnd = new Date(now.getFullYear(), 11, 31);
  }

  // Process each expense
  expenseData.forEach(expense => {
    // Check if expense affects this period
    if (!isExpenseInRange(expense, rangeStart, rangeEnd)) {
      return;
    }

    // Calculate allocated amount for this period
    const allocatedAmount = getAllocatedAmount(expense, rangeStart, rangeEnd);
    if (allocatedAmount === 0) return;

    const category = expense.type || expense.category || 'Khác';

    // For allocated expenses, distribute daily
    if (expense.allocationPeriod && expense.allocationPeriod !== 'none') {
      const allocStart = new Date(Math.max(
        new Date(expense.allocationStart || expense.date),
        rangeStart
      ));
      const allocEnd = new Date(Math.min(
        new Date(expense.allocationEnd || expense.date),
        rangeEnd
      ));

      // Calculate daily amount
      const totalDays = Math.ceil((allocEnd - allocStart) / (1000 * 60 * 60 * 24)) + 1;
      const dailyAmount = allocatedAmount / totalDays;

      // Distribute to each day
      for (let d = new Date(allocStart); d <= allocEnd; d.setDate(d.getDate() + 1)) {
        const day = normalizeDate(d);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        result.byDay[day] = (result.byDay[day] || 0) + dailyAmount;
        result.byMonth[month] = (result.byMonth[month] || 0) + dailyAmount;
        result.byCategory[category] = (result.byCategory[category] || 0) + dailyAmount;
      }

      result.allocatedExpenses.push({
        originalDate: expense.date,
        amount: expense.amount,
        allocatedAmount: allocatedAmount,
        period: expense.allocationPeriod,
        description: expense.note || expense.category
      });
    } else {
      // Non-allocated expense
      const expenseDate = new Date(expense.date);
      const day = normalizeDate(expense.date);
      const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      
      result.byDay[day] = (result.byDay[day] || 0) + allocatedAmount;
      result.byMonth[month] = (result.byMonth[month] || 0) + allocatedAmount;
      result.byCategory[category] = (result.byCategory[category] || 0) + allocatedAmount;
    }

    result.total += allocatedAmount;
  });

  return result;
}

/**
 * Compare Cash Flow and Accrual views
 */
function compareViews(cashFlow, accrual) {
  const comparison = {
    totalDifference: cashFlow.total - accrual.total,
    percentDifference: cashFlow.total > 0 ? ((cashFlow.total - accrual.total) / cashFlow.total * 100) : 0,
    monthlyDifferences: {},
    insights: []
  };

  // Compare by month
  const allMonths = new Set([...Object.keys(cashFlow.byMonth), ...Object.keys(accrual.byMonth)]);
  allMonths.forEach(month => {
    const cfAmount = cashFlow.byMonth[month] || 0;
    const acAmount = accrual.byMonth[month] || 0;
    comparison.monthlyDifferences[month] = {
      cashFlow: cfAmount,
      accrual: acAmount,
      difference: cfAmount - acAmount
    };
  });

  // Generate insights
  if (Math.abs(comparison.totalDifference) > 1000000) {
    comparison.insights.push({
      type: 'warning',
      message: `Chênh lệch lớn: ${formatCurrency(Math.abs(comparison.totalDifference), 'VND')} giữa 2 phương pháp`
    });
  }

  if (cashFlow.largePayments.length > 0) {
    comparison.insights.push({
      type: 'info',
      message: `Có ${cashFlow.largePayments.length} khoản chi lớn (>10tr) cần phân bổ để báo cáo chính xác hơn`
    });
  }

  return comparison;
}

/**
 * Render report header
 */
function renderReportHeader(dateRange) {
  const periodLabel = dateRange && dateRange.start && dateRange.end ?
    `${dateRange.start} - ${dateRange.end}` : 'Tất cả thời gian';

  return `
    <div class="report-header">
      <h2>💰 So sánh Cash Flow vs Chi phí phân bổ</h2>
      <p class="period-info">Kỳ báo cáo: ${periodLabel}</p>
      <div class="help-text">
        <p><strong>Cash Flow:</strong> Dòng tiền thực tế chi ra (ngày nào chi tiền thì ghi nhận ngày đó)</p>
        <p><strong>Chi phí phân bổ:</strong> Phân bổ đều chi phí cho kỳ sử dụng (ví dụ: thuê nhà tháng 1 phân bổ đều cho 30 ngày)</p>
      </div>
    </div>
  `;
}

/**
 * Render comparison summary
 */
function renderComparisonSummary(comparison) {
  const differenceClass = comparison.totalDifference > 0 ? 'positive' : 'negative';
  
  return `
    <div class="comparison-summary">
      <div class="summary-card">
        <h3>📊 Tổng quan</h3>
        <div class="summary-item">
          <span>Chênh lệch tổng:</span>
          <span class="${differenceClass}">${formatCurrency(Math.abs(comparison.totalDifference), 'VND')}</span>
        </div>
        <div class="summary-item">
          <span>Tỷ lệ chênh lệch:</span>
          <span>${comparison.percentDifference.toFixed(1)}%</span>
        </div>
      </div>
      
      ${comparison.insights.map(insight => `
        <div class="insight-card ${insight.type}">
          <i class="fas fa-${insight.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
          ${insight.message}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render dual view charts
 */
function renderDualViewCharts(cashFlow, accrual) {
  return `
    <div class="dual-view-charts">
      <div class="chart-container">
        <h3>💵 Cash Flow (Dòng tiền thực)</h3>
        <canvas id="cashFlowChart"></canvas>
        <div class="chart-summary">
          <div class="total-amount">${formatCurrency(cashFlow.total, 'VND')}</div>
          <div class="chart-description">Tổng tiền chi thực tế</div>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>📅 Chi phí phân bổ (Accrual)</h3>
        <canvas id="accrualChart"></canvas>
        <div class="chart-summary">
          <div class="total-amount">${formatCurrency(accrual.total, 'VND')}</div>
          <div class="chart-description">Tổng chi phí đã phân bổ</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render detailed breakdown
 */
function renderDetailedBreakdown(cashFlow, accrual) {
  // Prepare monthly comparison data
  const allMonths = new Set([...Object.keys(cashFlow.byMonth), ...Object.keys(accrual.byMonth)]);
  const sortedMonths = Array.from(allMonths).sort();

  return `
    <div class="detailed-breakdown">
      <h3>📈 Chi tiết theo tháng</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Tháng</th>
            <th>Cash Flow</th>
            <th>Chi phí phân bổ</th>
            <th>Chênh lệch</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${sortedMonths.map(month => {
            const cfAmount = cashFlow.byMonth[month] || 0;
            const acAmount = accrual.byMonth[month] || 0;
            const difference = cfAmount - acAmount;
            const note = Math.abs(difference) > 5000000 ? 
              '⚠️ Chênh lệch lớn' : 
              difference > 0 ? '📈 CF > Phân bổ' : 
              difference < 0 ? '📉 CF < Phân bổ' : '✅ Cân bằng';
            
            return `
              <tr>
                <td>${formatMonth(month)}</td>
                <td class="amount">${formatCurrency(cfAmount, 'VND')}</td>
                <td class="amount">${formatCurrency(acAmount, 'VND')}</td>
                <td class="amount ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}"}>
                  ${formatCurrency(Math.abs(difference), 'VND')}
                </td>
                <td>${note}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <th>Tổng cộng</th>
            <th class="amount">${formatCurrency(cashFlow.total, 'VND')}</th>
            <th class="amount">${formatCurrency(accrual.total, 'VND')}</th>
            <th class="amount ${cashFlow.total - accrual.total > 0 ? 'positive' : 'negative'}">
              ${formatCurrency(Math.abs(cashFlow.total - accrual.total), 'VND')}
            </th>
            <th></th>
          </tr>
        </tfoot>
      </table>

      ${renderLargePayments(cashFlow.largePayments)}
      ${renderAllocatedExpenses(accrual.allocatedExpenses)}
    </div>
  `;
}

/**
 * Render large payments section
 */
function renderLargePayments(largePayments) {
  if (largePayments.length === 0) return '';

  return `
    <div class="large-payments-section">
      <h4>💸 Các khoản chi lớn (> 10 triệu)</h4>
      <div class="payment-list">
        ${largePayments.map(payment => `
          <div class="payment-item">
            <div class="payment-date">${payment.date}</div>
            <div class="payment-amount">${formatCurrency(payment.amount, 'VND')}</div>
            <div class="payment-description">${payment.description}</div>
            <div class="payment-allocation ${payment.allocation && payment.allocation !== 'none' ? 'allocated' : 'not-allocated'}">
              ${payment.allocation && payment.allocation !== 'none' ? 
                '✅ Đã phân bổ' : 
                '⚠️ Chưa phân bổ - Cân nhắc phân bổ để báo cáo chính xác hơn'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render allocated expenses section
 */
function renderAllocatedExpenses(allocatedExpenses) {
  if (allocatedExpenses.length === 0) return '';

  return `
    <div class="allocated-expenses-section">
      <h4>📅 Chi phí đã phân bổ</h4>
      <div class="allocation-list">
        ${allocatedExpenses.map(expense => `
          <div class="allocation-item">
            <div class="allocation-info">
              <span class="original-date">Chi ngày: ${expense.originalDate}</span>
              <span class="original-amount">${formatCurrency(expense.amount, 'VND')}</span>
            </div>
            <div class="allocation-details">
              <span class="allocated-amount">Phân bổ trong kỳ: ${formatCurrency(expense.allocatedAmount, 'VND')}</span>
              <span class="allocation-period">Kỳ phân bổ: ${getPeriodLabel(expense.period)}</span>
            </div>
            <div class="allocation-description">${expense.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render insights section
 */
function renderInsights(comparison) {
  return `
    <div class="insights-section">
      <h3>💡 Phân tích & Khuyến nghị</h3>
      <div class="insights-grid">
        <div class="insight-card">
          <h4>📊 Sử dụng báo cáo nào?</h4>
          <ul>
            <li><strong>Cash Flow:</strong> Để quản lý dòng tiền, lập kế hoạch chi tiêu</li>
            <li><strong>Chi phí phân bổ:</strong> Để đánh giá hiệu quả kinh doanh, tính lợi nhuận chính xác</li>
          </ul>
        </div>
        
        <div class="insight-card">
          <h4>🎯 Khuyến nghị</h4>
          <ul>
            <li>Phân bổ các chi phí định kỳ (thuê nhà, lương, bảo hiểm)</li>
            <li>Theo dõi cả 2 góc độ để có cái nhìn toàn diện</li>
            <li>Sử dụng Cash Flow cho quản lý ngắn hạn</li>
            <li>Sử dụng Accrual cho báo cáo tài chính</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format month for display
 */
function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  const monthNames = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  return `${monthNames[parseInt(month)]} ${year}`;
}

/**
 * Get period label
 */
function getPeriodLabel(period) {
  const labels = {
    'none': 'Không phân bổ',
    '1_month': '1 tháng',
    '3_months': '3 tháng',
    '6_months': '6 tháng',
    '12_months': '1 năm',
    'custom': 'Tùy chỉnh'
  };
  return labels[period] || period;
}

/**
 * Add report interactivity
 */
function addReportInteractivity() {
  // Initialize charts if Chart.js is available
  if (typeof Chart !== 'undefined') {
    // Implementation would go here
    console.log('📊 Charts would be initialized here');
  }
}

/**
 * Add CSS styles for the report
 */
export function addCashFlowVsAccrualStyles() {
  if (document.getElementById('cashflow-accrual-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'cashflow-accrual-styles';
  styles.textContent = `
    /* Cash Flow vs Accrual Report Styles */
    .cashflow-accrual-report {
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    
    .report-header h2 {
      margin: 0 0 15px 0;
      font-size: 28px;
    }
    
    .help-text {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    
    .help-text p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .comparison-summary {
      display: grid;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .summary-card h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .summary-item:last-child {
      border-bottom: none;
    }
    
    .positive {
      color: #22c55e;
      font-weight: 600;
    }
    
    .negative {
      color: #ef4444;
      font-weight: 600;
    }
    
    .insight-card {
      padding: 15px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .insight-card.warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .insight-card.info {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .dual-view-charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .chart-container h3 {
      margin: 0 0 20px 0;
      color: #333;
    }
    
    .chart-summary {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    .total-amount {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }
    
    .chart-description {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .comparison-table {
      width: 100%;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .comparison-table th,
    .comparison-table td {
      padding: 12px;
      text-align: left;
    }
    
    .comparison-table thead {
      background: #f3f4f6;
    }
    
    .comparison-table tbody tr:hover {
      background: #f9fafb;
    }
    
    .comparison-table .amount {
      text-align: right;
      font-family: 'Courier New', monospace;
    }
    
    .comparison-table tfoot {
      background: #f3f4f6;
      font-weight: 600;
    }
    
    .large-payments-section,
    .allocated-expenses-section {
      margin-top: 30px;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .payment-item,
    .allocation-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: grid;
      gap: 10px;
    }
    
    .payment-item:last-child,
    .allocation-item:last-child {
      border-bottom: none;
    }
    
    .payment-allocation.allocated {
      color: #22c55e;
    }
    
    .payment-allocation.not-allocated {
      color: #f59e0b;
    }
    
    .insights-section {
      margin-top: 40px;
    }
    
    .insights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .insights-grid .insight-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: block;
    }
    
    .insights-grid .insight-card h4 {
      margin: 0 0 15px 0;
      color: #333;
    }
    
    .insights-grid .insight-card ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .insights-grid .insight-card li {
      margin: 8px 0;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .dual-view-charts,
      .insights-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  
  document.head.appendChild(styles);
}

// Auto-add styles when module loads
addCashFlowVsAccrualStyles();