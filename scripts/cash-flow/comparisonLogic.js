/**
 * comparisonLogic.js
 * Cash vs accrual comparison và analysis
 */

import { formatCurrency } from '../statisticsCore.js';

/**
 * Compare Cash Flow and Accrual views
 */
export function compareViews(cashFlow, accrual) {
  const comparison = {
    totalDifference: cashFlow.total - accrual.total,
    percentDifference: cashFlow.total > 0 ? ((cashFlow.total - accrual.total) / cashFlow.total * 100) : 0,
    monthlyDifferences: {},
  };

  // Compare by month
  const allMonths = new Set([...Object.keys(cashFlow.byMonth), ...Object.keys(accrual.byMonth)]);
  allMonths.forEach(month => {
    const cfAmount = cashFlow.byMonth[month] || 0;
    const acAmount = accrual.byMonth[month] || 0;
    comparison.monthlyDifferences[month] = {
      cashFlow: cfAmount,
      accrual: acAmount,
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
    });
  }

  return comparison;
}

/**
 * Render comparison summary
 */
export function renderComparisonSummary(comparison) {
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
export function renderDualViewCharts(cashFlow, accrual) {
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
export function renderDetailedBreakdown(cashFlow, accrual) {
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
                <td class="amount ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}">
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
    </div>
  `;
}

/**
 * Render insights section
 */
export function renderInsights(comparison) {
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
 * Analyze variance between cash flow and accrual
 */
export function analyzeVariance(comparison) {
  const analysis = {
    significantVariances: [],
    pattern: 'stable',
  };
  
  // Find months with significant variance
  Object.keys(comparison.monthlyDifferences).forEach(month => {
    const diff = comparison.monthlyDifferences[month];
    const variance = Math.abs(diff.difference);
    const percentVariance = diff.cashFlow > 0 ? (variance / diff.cashFlow * 100) : 0;
    
    if (percentVariance > 20) {
      analysis.significantVariances.push({
        month,
        variance,
        percentVariance,
      });
    }
  });
  
  // Determine pattern
  if (analysis.significantVariances.length > 3) {
    analysis.pattern = 'high_variance';
  } else if (analysis.significantVariances.length === 0) {
    analysis.pattern = 'well_aligned';
  }
  
  // Generate recommendations based on pattern
  if (analysis.pattern === 'high_variance') {
    analysis.recommendations.push({
      priority: 'high',
    });
  }
  
  return analysis;
}

/**
 * Calculate reconciliation between cash flow and accrual
 */
export function calculateReconciliation(cashFlow, accrual) {
  const reconciliation = {
    startingCashFlow: cashFlow.total,
    adjustments: [],
    endingAccrual: accrual.total,
  };
  
  // Calculate timing differences from allocated expenses
  const timingDifference = accrual.allocatedExpenses.reduce((sum, exp) => {
    return sum + (exp.amount - exp.allocatedAmount);
  }, 0);
  
  if (timingDifference !== 0) {
    reconciliation.adjustments.push({
      type: 'timing',
      description: 'Chênh lệch thời gian phân bổ',
    });
  }
  
  // Calculate unexplained difference
  const explainedDifference = reconciliation.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  reconciliation.unexplainedDifference = (cashFlow.total - accrual.total) - explainedDifference;
  
  return reconciliation;
}