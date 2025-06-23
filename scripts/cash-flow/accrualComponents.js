/**
 * accrualComponents.js
 * Accrual accounting components và logic
 */

import { formatCurrency, normalizeDate } from '../statisticsCore.js';

/**
 * Calculate Accrual view (allocated expenses)
 */
export function calculateAccrualView(expenseData, dateRange) {
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
    const expenseDate = new Date(expense.date);
    const amount = parseFloat(expense.amount || 0);
    const category = expense.type || expense.category || 'Khác';
    
    // Check if expense has periodic allocation (new logic)
    const hasPeriodicAllocation = expense.periodicAllocation === 'Có' || expense.periodicAllocation === 'Yes';
    const renewDate = expense.renewDate ? new Date(expense.renewDate) : null;
    
    if (hasPeriodicAllocation && renewDate && renewDate > expenseDate) {
      // Calculate allocation period
      const allocStart = new Date(Math.max(expenseDate, rangeStart));
      const allocEnd = new Date(Math.min(renewDate, rangeEnd));
      
      // Check if allocation period overlaps with report range
      if (allocStart > allocEnd || allocEnd < rangeStart || allocStart > rangeEnd) {
        return; // No overlap
      }
      
      // Calculate total days in full allocation period
      const fullPeriodDays = Math.ceil((renewDate - expenseDate) / (1000 * 60 * 60 * 24));
      
      // Calculate days in report period
      const reportPeriodDays = Math.ceil((allocEnd - allocStart) / (1000 * 60 * 60 * 24));
      
      // Calculate allocated amount for report period
      const dailyAmount = amount / fullPeriodDays;
      const allocatedAmount = dailyAmount * reportPeriodDays;
      
      // Distribute to each day
      for (let d = new Date(allocStart); d < allocEnd; d.setDate(d.getDate() + 1)) {
        const day = normalizeDate(d);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        result.byDay[day] = (result.byDay[day] || 0) + dailyAmount;
        result.byMonth[month] = (result.byMonth[month] || 0) + dailyAmount;
        result.byCategory[category] = (result.byCategory[category] || 0) + dailyAmount;
      }
      
      result.allocatedExpenses.push({
        originalDate: normalizeDate(expense.date),
        renewDate: normalizeDate(renewDate),
        amount: amount,
        allocatedAmount: allocatedAmount,
        period: `${Math.ceil(fullPeriodDays / 30)} tháng`,
        description: expense.note || expense.category || 'Chi phí phân bổ'
      });
      
      result.total += allocatedAmount;
      
    } else {
      // Non-allocated expense or no valid renewal date
      if (expenseDate >= rangeStart && expenseDate <= rangeEnd) {
        const day = normalizeDate(expense.date);
        const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        
        result.byDay[day] = (result.byDay[day] || 0) + amount;
        result.byMonth[month] = (result.byMonth[month] || 0) + amount;
        result.byCategory[category] = (result.byCategory[category] || 0) + amount;
        
        result.total += amount;
      }
    }
  });

  return result;
}

/**
 * Render Accrual chart component
 */
export function renderAccrualChart(accrualData) {
  return `
    <div class="chart-container">
      <h3>📅 Chi phí phân bổ (Accrual)</h3>
      <canvas id="accrualChart"></canvas>
      <div class="chart-summary">
        <div class="total-amount">${formatCurrency(accrualData.total, 'VND')}</div>
        <div class="chart-description">Tổng chi phí đã phân bổ</div>
      </div>
    </div>
  `;
}

/**
 * Render allocated expenses section
 */
export function renderAllocatedExpenses(allocatedExpenses) {
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
 * Prepare accrual data for Chart.js
 */
export function prepareAccrualChartData(accrualData) {
  const months = Object.keys(accrualData.byMonth).sort();
  const data = months.map(month => accrualData.byMonth[month]);
  
  return {
    labels: months.map(formatMonthLabel),
    datasets: [{
      label: 'Chi phí phân bổ',
      data: data,
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      borderColor: 'rgb(34, 197, 94)',
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
 * Analyze allocation effectiveness
 */
export function analyzeAllocationEffectiveness(accrualData) {
  const analysis = {
    totalAllocated: accrualData.allocatedExpenses.reduce((sum, exp) => sum + exp.allocatedAmount, 0),
    allocationCount: accrualData.allocatedExpenses.length,
    averageAllocationPeriod: 0,
    recommendations: []
  };
  
  // Calculate average allocation period
  if (analysis.allocationCount > 0) {
    const totalPeriods = accrualData.allocatedExpenses.reduce((sum, exp) => {
      const months = parseInt(exp.period) || 1;
      return sum + months;
    }, 0);
    analysis.averageAllocationPeriod = totalPeriods / analysis.allocationCount;
  }
  
  // Generate recommendations
  if (analysis.allocationCount === 0) {
    analysis.recommendations.push({
      type: 'suggestion',
      message: 'Chưa có chi phí nào được phân bổ. Xem xét phân bổ các chi phí định kỳ để báo cáo chính xác hơn.'
    });
  }
  
  if (analysis.averageAllocationPeriod < 3) {
    analysis.recommendations.push({
      type: 'info',
      message: 'Kỳ phân bổ trung bình ngắn. Kiểm tra lại các chi phí dài hạn có được phân bổ đúng không.'
    });
  }
  
  return analysis;
}

/**
 * Calculate accrual smoothness index
 */
export function calculateAccrualSmoothness(accrualData) {
  const monthlyValues = Object.values(accrualData.byMonth);
  if (monthlyValues.length < 2) return { smoothness: 'N/A', coefficient: 0 };
  
  const mean = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
  const variance = monthlyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyValues.length;
  const stdDev = Math.sqrt(variance);
  const coefficient = mean > 0 ? stdDev / mean : 0;
  
  let smoothness = 'Rất đều';
  if (coefficient > 0.5) smoothness = 'Không đều';
  else if (coefficient > 0.25) smoothness = 'Tương đối đều';
  
  return {
    smoothness,
    coefficient: coefficient.toFixed(3),
    insight: `Chi phí phân bổ ${smoothness.toLowerCase()} qua các tháng`
  };
}