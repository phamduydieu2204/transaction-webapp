/**
 * cashFlowComponents.js
 * Cash flow chart components và calculation
 */

import { formatCurrency, normalizeDate } from '../statisticsCore.js';

/**
 * Calculate Cash Flow view (actual money out)
 */
export function calculateCashFlowView(expenseData, dateRange) {
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
        allocation: expense.periodicAllocation || 'Không'
      });
    }
  });

  return result;
}

/**
 * Render Cash Flow chart component
 */
export function renderCashFlowChart(cashFlowData) {
  return `
    <div class="chart-container">
      <h3>💵 Cash Flow (Dòng tiền thực)</h3>
      <canvas id="cashFlowChart"></canvas>
      <div class="chart-summary">
        <div class="total-amount">${formatCurrency(cashFlowData.total, 'VND')}</div>
        <div class="chart-description">Tổng tiền chi thực tế</div>
      </div>
    </div>
  `;
}

/**
 * Render large payments section
 */
export function renderLargePayments(largePayments) {
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
            <div class="payment-allocation ${payment.allocation === 'Có' ? 'allocated' : 'not-allocated'}">
              ${payment.allocation === 'Có' ? 
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
 * Prepare cash flow data for Chart.js
 */
export function prepareCashFlowChartData(cashFlowData) {
  const months = Object.keys(cashFlowData.byMonth).sort();
  const data = months.map(month => cashFlowData.byMonth[month]);
  
  return {
    labels: months.map(formatMonthLabel),
    datasets: [{
      label: 'Cash Flow',
      data: data,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      tension: 0.3
    }]
  };
}

/**
 * Format month label for charts
 */
function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  const monthNames = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return `${monthNames[parseInt(month)]}/${year}`;
}

/**
 * Calculate cash flow trends
 */
export function calculateCashFlowTrends(cashFlowData) {
  const months = Object.keys(cashFlowData.byMonth).sort();
  if (months.length < 2) return null;
  
  const values = months.map(m => cashFlowData.byMonth[m]);
  const avgAmount = values.reduce((sum, val) => sum + val, 0) / values.length;
  const maxAmount = Math.max(...values);
  const minAmount = Math.min(...values);
  
  // Calculate month-over-month changes
  const changes = [];
  for (let i = 1; i < values.length; i++) {
    const change = ((values[i] - values[i-1]) / values[i-1]) * 100;
    changes.push({
      month: months[i],
      change: change,
      value: values[i]
    });
  }
  
  return {
    average: avgAmount,
    max: { month: months[values.indexOf(maxAmount)], value: maxAmount },
    min: { month: months[values.indexOf(minAmount)], value: minAmount },
    volatility: maxAmount - minAmount,
    monthlyChanges: changes
  };
}

/**
 * Generate cash flow insights
 */
export function generateCashFlowInsights(cashFlowData, trends) {
  const insights = [];
  
  if (cashFlowData.largePayments.length > 0) {
    const totalLarge = cashFlowData.largePayments.reduce((sum, p) => sum + p.amount, 0);
    const percentLarge = (totalLarge / cashFlowData.total) * 100;
    insights.push({
      type: 'info',
      title: 'Khoản chi lớn',
      message: `${cashFlowData.largePayments.length} khoản chi lớn chiếm ${percentLarge.toFixed(1)}% tổng chi phí`
    });
  }
  
  if (trends && trends.volatility > cashFlowData.total * 0.5) {
    insights.push({
      type: 'warning',
      title: 'Biến động lớn',
      message: `Dòng tiền biến động mạnh giữa các tháng (chênh lệch ${formatCurrency(trends.volatility, 'VND')})`
    });
  }
  
  return insights;
}