/**
 * expenseCategoryChart.js
 * 
 * Biểu đồ chi phí theo danh mục
 */

import { normalizeDate, formatCurrency } from './statisticsCore.js';

/**
 * Calculate expense data by category for last 12 months
 * @param {Array} expenseData - Expense records
 * @returns {Object} Category data for chart
 */
export function calculateExpenseByCategoryData(expenseData) {
  const categoryData = {};
  const monthlyData = {};
  const today = new Date();
  
  // Define main categories
  const mainCategories = {
    'Kinh doanh phần mềm': { color: '#667eea', icon: '💻' },
    'Sinh hoạt cá nhân': { color: '#f093fb', icon: '🏠' },
    'Kinh doanh Amazon': { color: '#4facfe', icon: '📦' },
    'Khác': { color: '#fa709a', icon: '📌' }
  };
  
  // Initialize data structures
  Object.keys(mainCategories).forEach(category => {
    categoryData[category] = {
      total: 0,
      monthly: {},
      subCategories: {}
    };
  });
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = {
      month: monthKey,
      monthLabel: `${date.getMonth() + 1}/${date.getFullYear()}`,
      ...Object.keys(mainCategories).reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
      }, {}),
      total: 0
    };
  }
  
  // Process expense data
  expenseData.forEach(expense => {
    const expenseDate = new Date(normalizeDate(expense.date));
    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    const amount = parseFloat(expense.amount) || 0;
    const type = expense.type || 'Khác';
    const subCategory = expense.category || 'Khác';
    
    // Map to main category
    let mainCategory = 'Khác';
    if (type.includes('Sinh hoạt') || type.includes('cá nhân')) {
      mainCategory = 'Sinh hoạt cá nhân';
    } else if (type.includes('phần mềm') || type.includes('software')) {
      mainCategory = 'Kinh doanh phần mềm';
    } else if (type.includes('Amazon')) {
      mainCategory = 'Kinh doanh Amazon';
    }
    
    // Add to category total
    if (categoryData[mainCategory]) {
      categoryData[mainCategory].total += amount;
      
      // Add to subcategory
      if (!categoryData[mainCategory].subCategories[subCategory]) {
        categoryData[mainCategory].subCategories[subCategory] = 0;
      }
      categoryData[mainCategory].subCategories[subCategory] += amount;
      
      // Add to monthly data
      if (monthlyData[monthKey]) {
        monthlyData[monthKey][mainCategory] += amount;
        monthlyData[monthKey].total += amount;
        
        if (!categoryData[mainCategory].monthly[monthKey]) {
          categoryData[mainCategory].monthly[monthKey] = 0;
        }
        categoryData[mainCategory].monthly[monthKey] += amount;
      }
    }
  });
  
  return {
    categories: categoryData,
    monthly: Object.values(monthlyData),
    mainCategories
  };
}

/**
 * Render expense category chart
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 */
export function renderExpenseCategoryChart(expenseData, containerId = 'expenseByCategory') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  const { categories, monthly, mainCategories } = calculateExpenseByCategoryData(expenseData);
  
  // Calculate totals
  const totalExpense = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);
  
  // Create chart HTML
  const chartHTML = `
    <div class="expense-category-chart">
      <div class="chart-header">
        <h3>💸 Phân tích Chi phí theo Danh mục</h3>
        <div class="chart-period">12 tháng gần nhất</div>
      </div>
      
      <!-- Category overview -->
      <div class="category-overview">
        ${Object.entries(categories).map(([category, data]) => {
          const percentage = totalExpense > 0 ? (data.total / totalExpense) * 100 : 0;
          const config = mainCategories[category];
          
          return `
            <div class="category-overview-card" style="border-color: ${config.color}">
              <div class="category-header">
                <span class="category-icon">${config.icon}</span>
                <span class="category-name">${category}</span>
              </div>
              <div class="category-amount">${formatCurrency(data.total, 'VND')}</div>
              <div class="category-percentage">
                <div class="percentage-bar" style="background: #e0e0e0;">
                  <div class="percentage-fill" 
                       style="width: ${percentage}%; background: ${config.color}"></div>
                </div>
                <span class="percentage-text">${percentage.toFixed(1)}%</span>
              </div>
              
              <!-- Top subcategories -->
              <div class="subcategories">
                ${Object.entries(data.subCategories)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([subCat, amount]) => `
                    <div class="subcategory-item">
                      <span class="subcat-name">${subCat}</span>
                      <span class="subcat-amount">${formatCurrency(amount, 'VND')}</span>
                    </div>
                  `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- Monthly trend chart -->
      <div class="monthly-trend-section">
        <h4>📊 Xu hướng Chi phí theo Tháng</h4>
        <div class="stacked-bar-chart">
          <div class="chart-container">
            <div class="chart-y-axis">
              ${generateYAxis(monthly)}
            </div>
            
            <div class="chart-bars">
              ${monthly.map((month, index) => {
                const maxValue = Math.max(...monthly.map(m => m.total));
                const heightPercent = maxValue > 0 ? (month.total / maxValue) * 100 : 0;
                
                return `
                  <div class="bar-column" data-month="${month.monthLabel}">
                    <div class="stacked-bar" style="height: ${heightPercent}%">
                      ${Object.entries(mainCategories).map(([category, config]) => {
                        const catAmount = month[category] || 0;
                        const catPercent = month.total > 0 ? (catAmount / month.total) * 100 : 0;
                        
                        return catPercent > 0 ? `
                          <div class="bar-segment" 
                               style="height: ${catPercent}%; background: ${config.color}"
                               data-category="${category}"
                               data-amount="${formatCurrency(catAmount, 'VND')}">
                          </div>
                        ` : '';
                      }).join('')}
                    </div>
                    <div class="bar-label">${month.monthLabel.split('/')[0]}</div>
                    
                    <!-- Tooltip -->
                    <div class="bar-tooltip">
                      <div class="tooltip-header">${month.monthLabel}</div>
                      <div class="tooltip-total">Tổng: ${formatCurrency(month.total, 'VND')}</div>
                      <div class="tooltip-breakdown">
                        ${Object.entries(mainCategories).map(([category, config]) => {
                          const amount = month[category] || 0;
                          return amount > 0 ? `
                            <div class="tooltip-item">
                              <span class="tooltip-icon">${config.icon}</span>
                              <span class="tooltip-cat">${category}:</span>
                              <span class="tooltip-amount">${formatCurrency(amount, 'VND')}</span>
                            </div>
                          ` : '';
                        }).join('')}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Summary stats -->
      <div class="expense-summary">
        ${generateExpenseSummary(categories, monthly)}
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
  
  // Add interactivity
  addChartInteractivity(containerId);
}

/**
 * Generate Y-axis for chart
 */
function generateYAxis(monthly) {
  const maxValue = Math.max(...monthly.map(m => m.total));
  const steps = 5;
  let labels = '';
  
  for (let i = steps; i >= 0; i--) {
    const value = (maxValue / steps) * i;
    labels += `
      <div class="y-tick" style="bottom: ${(i / steps) * 100}%">
        ${formatNumber(value)}
      </div>
    `;
  }
  
  return labels;
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
 * Generate expense summary
 */
function generateExpenseSummary(categories, monthly) {
  const totalExpense = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);
  const avgMonthly = totalExpense / 12;
  
  // Find highest spending month
  const highestMonth = monthly.reduce((max, month) => 
    month.total > max.total ? month : max
  );
  
  // Find most expensive category
  const topCategory = Object.entries(categories)
    .sort((a, b) => b[1].total - a[1].total)[0];
  
  return `
    <div class="summary-cards">
      <div class="summary-item">
        <div class="summary-icon">💰</div>
        <div class="summary-info">
          <div class="summary-label">Tổng chi phí 12 tháng</div>
          <div class="summary-value">${formatCurrency(totalExpense, 'VND')}</div>
        </div>
      </div>
      
      <div class="summary-item">
        <div class="summary-icon">📊</div>
        <div class="summary-info">
          <div class="summary-label">Chi phí TB/tháng</div>
          <div class="summary-value">${formatCurrency(avgMonthly, 'VND')}</div>
        </div>
      </div>
      
      <div class="summary-item">
        <div class="summary-icon">📈</div>
        <div class="summary-info">
          <div class="summary-label">Tháng chi cao nhất</div>
          <div class="summary-value">${highestMonth.monthLabel}</div>
          <div class="summary-sub">${formatCurrency(highestMonth.total, 'VND')}</div>
        </div>
      </div>
      
      <div class="summary-item">
        <div class="summary-icon">🏆</div>
        <div class="summary-info">
          <div class="summary-label">Danh mục chi nhiều nhất</div>
          <div class="summary-value">${topCategory[0]}</div>
          <div class="summary-sub">${formatCurrency(topCategory[1].total, 'VND')}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Add chart interactivity
 */
function addChartInteractivity(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Bar hover effects
  const barColumns = container.querySelectorAll('.bar-column');
  barColumns.forEach(column => {
    column.addEventListener('mouseenter', () => {
      column.classList.add('active');
    });
    
    column.addEventListener('mouseleave', () => {
      column.classList.remove('active');
    });
  });
}

/**
 * Export chart styles
 */
export function addExpenseCategoryChartStyles() {
  if (document.getElementById('expense-category-chart-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'expense-category-chart-styles';
  styles.textContent = `
    .expense-category-chart {
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
    
    .chart-period {
      font-size: 14px;
      color: #718096;
      background: #f7fafc;
      padding: 6px 12px;
      border-radius: 6px;
    }
    
    .category-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .category-overview-card {
      background: #fafafa;
      border: 2px solid;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .category-overview-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .category-icon {
      font-size: 24px;
    }
    
    .category-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .category-amount {
      font-size: 28px;
      font-weight: bold;
      color: #1a202c;
      margin-bottom: 12px;
    }
    
    .category-percentage {
      margin-bottom: 16px;
    }
    
    .percentage-bar {
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    
    .percentage-fill {
      height: 100%;
      transition: width 0.5s ease;
    }
    
    .percentage-text {
      font-size: 12px;
      color: #718096;
    }
    
    .subcategories {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 12px;
    }
    
    .subcategory-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
      color: #4a5568;
    }
    
    .subcat-amount {
      font-weight: 500;
    }
    
    .monthly-trend-section {
      margin-bottom: 32px;
    }
    
    .monthly-trend-section h4 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }
    
    .stacked-bar-chart {
      background: #fafafa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .chart-container {
      display: grid;
      grid-template-columns: 50px 1fr;
      gap: 16px;
      height: 300px;
    }
    
    .chart-y-axis {
      position: relative;
    }
    
    .y-tick {
      position: absolute;
      right: 0;
      transform: translateY(50%);
      font-size: 11px;
      color: #718096;
      text-align: right;
    }
    
    .chart-bars {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 100%;
      padding: 0 4px;
    }
    
    .bar-column {
      position: relative;
      flex: 1;
      max-width: 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      cursor: pointer;
    }
    
    .stacked-bar {
      width: 100%;
      display: flex;
      flex-direction: column-reverse;
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .bar-segment {
      width: 100%;
      transition: all 0.3s ease;
    }
    
    .bar-label {
      margin-top: 8px;
      font-size: 11px;
      color: #718096;
    }
    
    .bar-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
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
    
    .bar-column.active .bar-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(-10px);
    }
    
    .bar-column.active .stacked-bar {
      transform: scaleY(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .tooltip-header {
      font-weight: bold;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .tooltip-total {
      margin-bottom: 8px;
      color: #4fd1c5;
    }
    
    .tooltip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
    }
    
    .tooltip-icon {
      font-size: 14px;
    }
    
    .tooltip-amount {
      margin-left: auto;
      font-weight: 500;
    }
    
    .expense-summary {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    
    .summary-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .summary-icon {
      font-size: 32px;
    }
    
    .summary-info {
      flex: 1;
    }
    
    .summary-label {
      font-size: 13px;
      color: #718096;
      margin-bottom: 4px;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: bold;
      color: #2d3748;
    }
    
    .summary-sub {
      font-size: 12px;
      color: #a0aec0;
      margin-top: 2px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .category-overview {
        grid-template-columns: 1fr;
      }
      
      .chart-bars {
        gap: 2px;
      }
      
      .bar-column {
        max-width: 40px;
      }
      
      .bar-label {
        font-size: 9px;
      }
    }
  `;
  
  document.head.appendChild(styles);
}