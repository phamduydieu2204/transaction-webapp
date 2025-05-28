/**
 * revenueExpenseChart.js
 * 
 * Biểu đồ doanh thu và chi phí 12 tháng gần nhất
 */

console.log('📦 revenueExpenseChart.js module loading...');

import { normalizeDate, formatCurrency } from './statisticsCore.js';

/**
 * Determine chart granularity based on date range
 * @param {Object} dateRange - Date range object with start and end
 * @returns {string} Granularity type: 'daily', 'weekly', or 'monthly'
 */
function determineGranularity(dateRange) {
  if (!dateRange) return 'monthly'; // Default to monthly for 12 months
  
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Standard rules:
  // <= 31 days: show daily
  // 32-90 days: show weekly
  // > 90 days: show monthly
  if (daysDiff <= 31) {
    return 'daily';
  } else if (daysDiff <= 90) {
    return 'weekly';
  } else {
    return 'monthly';
  }
}

/**
 * Calculate revenue and expense data based on date range and granularity
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} dateRange - Optional date range filter
 * @returns {Object} Data for chart
 */
export function calculateChartData(transactionData, expenseData, dateRange = null) {
  console.log('📢 calculateChartData called with:', {
    transactions: transactionData.length,
    expenses: expenseData.length,
    dateRange
  });
  
  const granularity = determineGranularity(dateRange);
  console.log('📅 Granularity:', granularity);
  
  if (granularity === 'daily') {
    return calculateDailyData(transactionData, expenseData, dateRange);
  } else if (granularity === 'weekly') {
    return calculateWeeklyData(transactionData, expenseData, dateRange);
  } else {
    return calculateMonthlyData(transactionData, expenseData, dateRange);
  }
}

/**
 * Calculate daily data
 */
function calculateDailyData(transactionData, expenseData, dateRange) {
  const dailyData = {};
  const start = dateRange ? new Date(dateRange.start) : new Date();
  const end = dateRange ? new Date(dateRange.end) : new Date();
  
  // Initialize all days in range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateKey = formatDateKey(date, 'daily');
    dailyData[dateKey] = {
      date: dateKey,
      label: formatDateLabel(date, 'daily'),
      revenue: 0,
      expense: 0,
      profit: 0
    };
  }
  
  // Process transactions
  transactionData.forEach(transaction => {
    const transactionDate = normalizeDate(transaction.transactionDate);
    const dateKey = formatDateKey(new Date(transactionDate), 'daily');
    
    if (dailyData[dateKey]) {
      const revenue = parseFloat(transaction.revenue) || 0;
      dailyData[dateKey].revenue += revenue;
    }
  });
  
  // Process expenses
  expenseData.forEach(expense => {
    const expenseDate = normalizeDate(expense.date);
    const dateKey = formatDateKey(new Date(expenseDate), 'daily');
    
    if (dailyData[dateKey]) {
      const amount = parseFloat(expense.amount) || 0;
      dailyData[dateKey].expense += amount;
    }
  });
  
  // Calculate profit
  Object.values(dailyData).forEach(day => {
    day.profit = day.revenue - day.expense;
  });
  
  return Object.values(dailyData);
}

/**
 * Calculate weekly data
 */
function calculateWeeklyData(transactionData, expenseData, dateRange) {
  const weeklyData = {};
  const start = dateRange ? new Date(dateRange.start) : new Date();
  const end = dateRange ? new Date(dateRange.end) : new Date();
  
  // Get Monday of start week
  const startWeek = new Date(start);
  const startDay = startWeek.getDay();
  const daysToMonday = startDay === 0 ? 6 : startDay - 1;
  startWeek.setDate(startWeek.getDate() - daysToMonday);
  
  // Initialize all weeks in range
  for (let weekStart = new Date(startWeek); weekStart <= end; weekStart.setDate(weekStart.getDate() + 7)) {
    const weekKey = formatDateKey(weekStart, 'weekly');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    weeklyData[weekKey] = {
      date: weekKey,
      label: formatDateLabel(weekStart, 'weekly'),
      weekStart: new Date(weekStart),
      weekEnd: weekEnd,
      revenue: 0,
      expense: 0,
      profit: 0
    };
  }
  
  // Process transactions
  transactionData.forEach(transaction => {
    const transactionDate = new Date(normalizeDate(transaction.transactionDate));
    
    // Find which week this transaction belongs to
    Object.values(weeklyData).forEach(week => {
      if (transactionDate >= week.weekStart && transactionDate <= week.weekEnd) {
        const revenue = parseFloat(transaction.revenue) || 0;
        week.revenue += revenue;
      }
    });
  });
  
  // Process expenses
  expenseData.forEach(expense => {
    const expenseDate = new Date(normalizeDate(expense.date));
    
    // Find which week this expense belongs to
    Object.values(weeklyData).forEach(week => {
      if (expenseDate >= week.weekStart && expenseDate <= week.weekEnd) {
        const amount = parseFloat(expense.amount) || 0;
        week.expense += amount;
      }
    });
  });
  
  // Calculate profit and clean up temporary fields
  Object.values(weeklyData).forEach(week => {
    week.profit = week.revenue - week.expense;
    delete week.weekStart;
    delete week.weekEnd;
  });
  
  return Object.values(weeklyData);
}

/**
 * Calculate monthly data
 */
function calculateMonthlyData(transactionData, expenseData, dateRange) {
  const monthlyData = {};
  const today = new Date();
  const start = dateRange ? new Date(dateRange.start) : new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const end = dateRange ? new Date(dateRange.end) : today;
  
  // Initialize all months in range
  for (let date = new Date(start.getFullYear(), start.getMonth(), 1); 
       date <= end; 
       date.setMonth(date.getMonth() + 1)) {
    const monthKey = formatDateKey(date, 'monthly');
    monthlyData[monthKey] = {
      date: monthKey,
      label: formatDateLabel(date, 'monthly'),
      revenue: 0,
      expense: 0,
      profit: 0
    };
  }
  
  console.log('📅 Initialized months:', Object.keys(monthlyData));
  
  // Process transactions
  transactionData.forEach(transaction => {
    const transactionDate = new Date(normalizeDate(transaction.transactionDate));
    const monthKey = formatDateKey(transactionDate, 'monthly');
    
    if (monthlyData[monthKey]) {
      const revenue = parseFloat(transaction.revenue) || 0;
      monthlyData[monthKey].revenue += revenue;
    }
  });
  
  // Process expenses
  expenseData.forEach(expense => {
    const expenseDate = new Date(normalizeDate(expense.date));
    const monthKey = formatDateKey(expenseDate, 'monthly');
    
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
 * Format date key based on granularity
 */
function formatDateKey(date, granularity) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (granularity) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      // Use Monday of the week as key
      return `${year}-W${getWeekNumber(date)}`;
    case 'monthly':
      return `${year}-${month}`;
    default:
      return `${year}-${month}`;
  }
}

/**
 * Format date label for display
 */
function formatDateLabel(date, granularity) {
  switch (granularity) {
    case 'daily':
      return `${date.getDate()}/${date.getMonth() + 1}`;
    case 'weekly':
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${date.getDate()}/${date.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
    case 'monthly':
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    default:
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

/**
 * Calculate revenue and expense data for last 12 months (backward compatibility)
 */
export function calculateLast12MonthsData(transactionData, expenseData) {
  // Default to last 12 months
  const today = new Date();
  const dateRange = {
    start: new Date(today.getFullYear() - 1, today.getMonth(), 1),
    end: today
  };
  
  return calculateChartData(transactionData, expenseData, dateRange);
}

/**
 * Render revenue/expense chart
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 */
export function renderRevenueExpenseChart(transactionData, expenseData, containerId = 'revenueChart') {
  console.log('🎯 renderRevenueExpenseChart called with:', {
    containerId,
    transactionCount: transactionData.length,
    expenseCount: expenseData.length
  });
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  // Get date range and compare mode from global filters
  const dateRange = window.globalFilters && window.globalFilters.dateRange ? window.globalFilters.dateRange : null;
  const compareMode = window.globalFilters && window.globalFilters.compareMode || 'none';
  
  console.log('📆 Calculating chart data...');
  const chartData = calculateChartData(transactionData, expenseData, dateRange);
  console.log('📊 Chart data calculated:', chartData);
  
  // Calculate compare data if needed
  let compareData = null;
  if (compareMode !== 'none' && dateRange) {
    console.log('🔄 Calculating compare data...');
    const compareRange = getCompareDateRange(compareMode, dateRange);
    
    // Get all data and filter for compare period
    const allTransactions = window.transactionList || [];
    const allExpenses = window.expenseList || [];
    
    const { filterDataByDateRange } = await import('./financialDashboard.js');
    const compareTransactions = filterDataByDateRange(allTransactions, compareRange, window.globalFilters);
    const compareExpenses = filterDataByDateRange(allExpenses, compareRange, window.globalFilters);
    
    compareData = calculateChartData(compareTransactions, compareExpenses, compareRange);
    console.log('🔄 Compare data calculated:', compareData);
  }
  
  // Find max value for scaling (include compare data if exists)
  const allData = compareData ? [...chartData, ...compareData] : chartData;
  const maxValue = Math.max(
    ...allData.map(d => Math.max(d.revenue, d.expense))
  );
  console.log('📏 Max value for scaling:', maxValue);
  
  // Get period label and granularity
  let periodLabel = '12 tháng gần nhất';
  let granularity = 'monthly';
  if (dateRange) {
    const { start, end } = dateRange;
    periodLabel = `Từ ${start} đến ${end}`;
    granularity = determineGranularity(dateRange);
  }
  
  // Helper function to get compare date range
  function getCompareDateRange(mode, currentRange) {
    const start = new Date(currentRange.start);
    const end = new Date(currentRange.end);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (mode === 'previous_period') {
      const compareEnd = new Date(start);
      compareEnd.setDate(compareEnd.getDate() - 1);
      const compareStart = new Date(compareEnd);
      compareStart.setDate(compareStart.getDate() - daysDiff + 1);
      
      return {
        start: formatDate(compareStart),
        end: formatDate(compareEnd)
      };
    } else {
      const compareStart = new Date(start);
      compareStart.setFullYear(compareStart.getFullYear() - 1);
      const compareEnd = new Date(end);
      compareEnd.setFullYear(compareEnd.getFullYear() - 1);
      
      return {
        start: formatDate(compareStart),
        end: formatDate(compareEnd)
      };
    }
  }
  
  // Format date helper
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Create chart HTML
  const chartHTML = `
    <div class="revenue-expense-chart">
      <div class="chart-header">
        <h3>📊 Biểu đồ Doanh thu & Chi phí</h3>
        <div class="period-badge">${periodLabel}</div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color revenue"></span>
            <span>Doanh thu${compareMode !== 'none' ? ' (hiện tại)' : ''}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color expense"></span>
            <span>Chi phí${compareMode !== 'none' ? ' (hiện tại)' : ''}</span>
          </div>
          ${compareMode !== 'none' ? `
            <div class="legend-item">
              <span class="legend-color compare"></span>
              <span>${compareMode === 'previous_period' ? 'Kỳ trước' : 'Cùng kỳ năm trước'}</span>
            </div>
          ` : `
            <div class="legend-item">
              <span class="legend-color profit"></span>
              <span>Lợi nhuận</span>
            </div>
          `}
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
              points="${generateLinePoints(chartData, 'revenue', maxValue)}"
              fill="none"
              stroke="#28a745"
              stroke-width="3"
            />
            
            <!-- Expense line -->
            <polyline
              class="chart-line expense-line"
              points="${generateLinePoints(chartData, 'expense', maxValue)}"
              fill="none"
              stroke="#dc3545"
              stroke-width="3"
            />
            
            <!-- Profit area -->
            <path
              class="profit-area"
              d="${generateProfitArea(chartData, maxValue)}"
              fill="url(#profitGradient)"
              opacity="0.3"
            />
            
            <!-- Compare lines if compare mode is active -->
            ${compareData && compareMode !== 'none' ? `
              <!-- Compare Revenue line -->
              <polyline
                class="chart-line compare-revenue-line"
                points="${generateLinePoints(compareData, 'revenue', maxValue)}"
                fill="none"
                stroke="#28a745"
                stroke-width="2"
                stroke-dasharray="5,5"
                opacity="0.6"
              />
              
              <!-- Compare Expense line -->
              <polyline
                class="chart-line compare-expense-line"
                points="${generateLinePoints(compareData, 'expense', maxValue)}"
                fill="none"
                stroke="#dc3545"
                stroke-width="2"
                stroke-dasharray="5,5"
                opacity="0.6"
              />
            ` : ''}
            
            <!-- Data points -->
            ${generateDataPoints(chartData, maxValue)}
            
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
            ${chartData.map((data, index) => `
              <div class="chart-tooltip" 
                   style="left: ${(index / (chartData.length - 1)) * 100}%"
                   data-period="${data.label}">
                <div class="tooltip-content">
                  <div class="tooltip-title">${data.label}</div>
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
          ${generateXAxisLabels(chartData, granularity)}
        </div>
      </div>
      
      <!-- Summary stats -->
      <div class="chart-summary">
        ${generateChartSummary(chartData, granularity)}
      </div>
    </div>
  `;
  
  console.log('🔨 Setting container HTML...');
  container.innerHTML = chartHTML;
  console.log('✅ Chart HTML rendered, length:', chartHTML.length);
  
  // Add interactivity
  addChartInteractivity(containerId);
  console.log('🎮 Interactivity added');
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
 * Generate X-axis labels based on granularity
 */
function generateXAxisLabels(data, granularity) {
  const maxLabels = granularity === 'daily' ? 10 : data.length; // Limit daily labels to avoid crowding
  const skipInterval = Math.ceil(data.length / maxLabels);
  
  return data.map((item, index) => {
    if (index % skipInterval !== 0 && index !== data.length - 1) return '';
    
    const label = granularity === 'daily' 
      ? item.label.split('/')[0] // Just show day number
      : item.label.split('/')[0]; // Show month number or week range
      
    return `
      <div class="x-label" style="left: ${(index / (data.length - 1)) * 100}%">
        ${label}
      </div>
    `;
  }).join('');
}

/**
 * Generate line points for SVG polyline
 */
function generateLinePoints(data, type, maxValue) {
  if (data.length === 0) return '';
  
  return data.map((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const y = 400 - (item[type] / maxValue) * 400;
    return `${x},${y}`;
  }).join(' ');
}

/**
 * Generate profit area path
 */
function generateProfitArea(data, maxValue) {
  if (data.length === 0) return '';
  
  let path = 'M 0,400';
  
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const revenueY = 400 - (item.revenue / maxValue) * 400;
    
    if (index === 0) {
      path += ` L ${x},${revenueY}`;
    } else {
      path += ` L ${x},${revenueY}`;
    }
  });
  
  // Close the path
  for (let i = data.length - 1; i >= 0; i--) {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * i;
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
  if (data.length === 0) return '';
  
  let points = '';
  
  data.forEach((item, index) => {
    const x = data.length === 1 ? 500 : (1000 / (data.length - 1)) * index;
    const revenueY = 400 - (item.revenue / maxValue) * 400;
    const expenseY = 400 - (item.expense / maxValue) * 400;
    
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
function generateChartSummary(data, granularity) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const avgExpense = data.length > 0 ? totalExpense / data.length : 0;
  
  // Find best and worst periods
  const bestPeriod = data.reduce((best, item) => 
    item.profit > best.profit ? item : best
  , data[0] || { profit: 0 });
  const worstPeriod = data.reduce((worst, item) => 
    item.profit < worst.profit ? item : worst
  , data[0] || { profit: 0 });
  
  // Labels based on granularity
  const periodLabel = granularity === 'daily' ? 'ngày' : granularity === 'weekly' ? 'tuần' : 'tháng';
  
  return `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <div class="summary-label">Tổng doanh thu</div>
          <div class="summary-value revenue">${formatCurrency(totalRevenue, 'VND')}</div>
          <div class="summary-detail">TB: ${formatCurrency(avgRevenue, 'VND')}/${periodLabel}</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">💸</div>
        <div class="summary-content">
          <div class="summary-label">Tổng chi phí</div>
          <div class="summary-value expense">${formatCurrency(totalExpense, 'VND')}</div>
          <div class="summary-detail">TB: ${formatCurrency(avgExpense, 'VND')}/${periodLabel}</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">📈</div>
        <div class="summary-content">
          <div class="summary-label">Lợi nhuận ròng</div>
          <div class="summary-value ${totalProfit >= 0 ? 'profit' : 'loss'}">${formatCurrency(totalProfit, 'VND')}</div>
          <div class="summary-detail">Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">🏆</div>
        <div class="summary-content">
          <div class="summary-label">${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)} tốt nhất</div>
          <div class="summary-value">${bestPeriod.label || 'N/A'}</div>
          <div class="summary-detail">LN: ${formatCurrency(bestPeriod.profit || 0, 'VND')}</div>
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
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    
    .chart-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 20px;
      flex: 0 0 auto;
    }
    
    .period-badge {
      background: #e6f3ff;
      color: #2563eb;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid #93c5fd;
    }
    
    .chart-legend {
      display: flex;
      gap: 20px;
      margin-left: auto;
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
    .legend-color.compare { 
      background: #6c757d;
      border: 2px dashed #6c757d;
      background-clip: content-box;
      padding: 1px;
    }
    
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

console.log('✅ revenueExpenseChart.js module loaded successfully');