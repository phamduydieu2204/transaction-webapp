/**
 * categoryChartComponents.js
 * 
 * Chart component functions for expense categories
 * Handles rendering of pie, bar, and trend charts
 */

import { formatCurrency } from '../statisticsCore.js';
import { formatNumber } from './categoryChartConfig.js';

/**
 * Render expense category chart
 * @param {Array} expenseData - Expense records
 * @param {string} containerId - Container element ID
 */
export function renderExpenseCategoryChart(expenseData, containerId, processedData) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  const { categories, monthly, mainCategories } = processedData;
  
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
        ${renderCategoryOverviewCards(categories, totalExpense, mainCategories)}
      </div>
      
      <!-- Monthly trend chart -->
      <div class="monthly-trend-section">
        <h4>📊 Xu hướng Chi phí theo Tháng</h4>
        ${renderStackedBarChart(monthly, mainCategories)}
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
 * Render category overview cards
 */
function renderCategoryOverviewCards(categories, totalExpense, mainCategories) {
  return Object.entries(categories).map(([category, data]) => {
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
  }).join('');
}

/**
 * Render stacked bar chart
 */
function renderStackedBarChart(monthly, mainCategories) {
  return `
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
                  ${renderBarSegments(month, mainCategories)}
                </div>
                <div class="bar-label">${month.monthLabel.split('/')[0]}</div>
                
                <!-- Tooltip -->
                ${renderBarTooltip(month, mainCategories)}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render bar segments
 */
function renderBarSegments(month, mainCategories) {
  return Object.entries(mainCategories).map(([category, config]) => {
    const catAmount = month[category] || 0;
    const catPercent = month.total > 0 ? (catAmount / month.total) * 100 : 0;
    
    return catPercent > 0 ? `
      <div class="bar-segment" 
           style="height: ${catPercent}%; background: ${config.color}"
           data-category="${category}"
           data-amount="${formatCurrency(catAmount, 'VND')}">
      </div>
    ` : '';
  }).join('');
}

/**
 * Render bar tooltip
 */
function renderBarTooltip(month, mainCategories) {
  return `
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
  `;
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