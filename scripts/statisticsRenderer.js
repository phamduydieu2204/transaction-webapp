/**
 * statisticsRenderer.js
 * 
 * Handles rendering of statistics tables, charts, and visualizations
 * Responsible for DOM manipulation and UI updates for statistics display
 */

import { formatCurrency, normalizeDate, calculateGrowthRate } from './statisticsCore.js';

/**
 * Renders the monthly expense summary table
 * @param {Array} summaryData - Monthly summary data
 * @param {Object} options - Rendering options
 */
export function renderMonthlySummaryTable(summaryData, options = {}) {
  const {
    tableId = "monthlySummaryTable",
    showGrowthRate = false,
    maxRows = 100
  } = options;

  // Check if statistics tab is currently active
  const currentTab = document.querySelector(".tab-button.active");
  const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
  
  if (!isThongKeTab) {
    console.log(`⏭️ Statistics tab not active, skipping table render`);
    return;
  }

  // Get table element and ensure tbody exists
  const tableElement = document.getElementById(tableId);
  let tableBody = document.querySelector(`#${tableId} tbody`);

  // Create tbody if it doesn't exist (fix for missing tbody issue)
  if (!tableBody && tableElement) {
    console.log(`🔧 Creating missing tbody for table ${tableId}`);
    tableBody = document.createElement('tbody');
    tableElement.appendChild(tableBody);
  }

  if (!tableBody) {
    console.error(`❌ Cannot find or create tbody for table ${tableId}`);
    window.pendingStatsData = summaryData;
    window.pendingStatsOptions = options;
    return;
  }

  console.log("📊 Rendering monthly summary table:", summaryData.length, "entries");

  // Clear existing content
  tableBody.innerHTML = "";

  // Limit data if specified
  const dataToRender = summaryData.slice(0, maxRows);

  if (dataToRender.length === 0) {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td colspan="3" style="text-align: center; color: #666; font-style: italic;">
        Không có dữ liệu thống kê
      </td>
    `;
    return;
  }

  dataToRender.forEach((item, index) => {
    const row = tableBody.insertRow();
    
    // Month column
    const monthCell = row.insertCell();
    monthCell.textContent = item.month;
    
    // Type column  
    const typeCell = row.insertCell();
    typeCell.textContent = item.type;
    
    // Amount column
    const amountCell = row.insertCell();
    amountCell.textContent = formatCurrency(item.amount, "VND");
    amountCell.style.textAlign = "right";
    amountCell.style.fontWeight = "bold";
    
    // Add growth rate if enabled and previous data exists
    if (showGrowthRate && index > 0) {
      const previousItem = dataToRender[index - 1];
      if (previousItem.type === item.type) {
        const growth = calculateGrowthRate(item.amount, previousItem.amount);
        const growthSpan = document.createElement('span');
        growthSpan.style.fontSize = "0.8em";
        growthSpan.style.marginLeft = "8px";
        
        if (growth.direction === "up") {
          growthSpan.style.color = "#28a745";
          growthSpan.textContent = `↑${growth.rate.toFixed(1)}%`;
        } else if (growth.direction === "down") {
          growthSpan.style.color = "#dc3545";
          growthSpan.textContent = `↓${growth.rate.toFixed(1)}%`;
        } else {
          growthSpan.style.color = "#6c757d";
          growthSpan.textContent = "→0%";
        }
        
        amountCell.appendChild(growthSpan);
      }
    }
    
    // Add alternating row colors
    if (index % 2 === 1) {
      row.style.backgroundColor = "#f8f9fa";
    }
    
    // Highlight high amounts
    if (item.amount > 10000000) { // > 10M VND
      amountCell.style.color = "#dc3545";
      amountCell.style.fontWeight = "bold";
    }
  });

  console.log("✅ Monthly summary table rendered successfully");
}

/**
 * Renders a financial overview dashboard
 * @param {Object} financialData - Financial analysis data
 * @param {Object} options - Rendering options
 */
export function renderFinancialOverview(financialData, options = {}) {
  const {
    containerId = "financialOverview",
    showDetails = true
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container #${containerId} not found`);
    return;
  }

  console.log("💰 Rendering financial overview");

  const { summary, profit, profitMargin } = financialData;

  // Create overview HTML
  const overviewHTML = `
    <div class="financial-overview">
      <div class="overview-cards">
        <div class="overview-card revenue">
          <h4>Tổng Doanh Thu</h4>
          <div class="amount">${formatCurrency(summary.totalRevenue, "VND")}</div>
        </div>
        <div class="overview-card expense">
          <h4>Tổng Chi Phí</h4>
          <div class="amount">${formatCurrency(summary.totalExpenses, "VND")}</div>
        </div>
        <div class="overview-card profit ${summary.totalProfit >= 0 ? 'positive' : 'negative'}">
          <h4>Lợi Nhuận</h4>
          <div class="amount">${formatCurrency(summary.totalProfit, "VND")}</div>
          <div class="margin">${summary.overallMargin.toFixed(1)}% margin</div>
        </div>
      </div>
      ${showDetails ? renderCurrencyBreakdown(profit, profitMargin) : ''}
    </div>
  `;

  container.innerHTML = overviewHTML;

  // Add CSS styles if not already present
  addFinancialOverviewStyles();

  console.log("✅ Financial overview rendered successfully");
}

/**
 * Renders currency breakdown details
 * @param {Object} profit - Profit by currency
 * @param {Object} profitMargin - Profit margins by currency
 * @returns {string} - HTML for currency breakdown
 */
function renderCurrencyBreakdown(profit, profitMargin) {
  const currencies = ["VND", "USD", "NGN"];
  
  const breakdownHTML = currencies.map(currency => {
    const profitAmount = profit[currency] || 0;
    const margin = profitMargin[currency] || 0;
    
    if (profitAmount === 0) return '';
    
    return `
      <div class="currency-breakdown">
        <h5>${currency}</h5>
        <div class="breakdown-item">
          <span>Lợi nhuận:</span>
          <span class="${profitAmount >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(profitAmount, currency)}
          </span>
        </div>
        <div class="breakdown-item">
          <span>Tỷ suất:</span>
          <span class="${margin >= 0 ? 'positive' : 'negative'}">
            ${margin.toFixed(1)}%
          </span>
        </div>
      </div>
    `;
  }).filter(html => html !== '').join('');

  return breakdownHTML ? `
    <div class="currency-details">
      <h4>Chi Tiết Theo Tiền Tệ</h4>
      <div class="currency-grid">
        ${breakdownHTML}
      </div>
    </div>
  ` : '';
}

/**
 * Creates a simple chart visualization
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 */
export function renderSimpleChart(data, options = {}) {
  const {
    containerId = "chartContainer",
    chartType = "bar", // "bar", "line", "pie"
    title = "Chart",
    xLabel = "",
    yLabel = "",
    maxBars = 20
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Chart container #${containerId} not found`);
    return;
  }

  console.log(`📈 Rendering ${chartType} chart:`, data.length, "data points");

  // Limit data for readability
  const chartData = data.slice(0, maxBars);

  if (chartData.length === 0) {
    container.innerHTML = `
      <div class="chart-placeholder">
        <p>Không có dữ liệu để hiển thị biểu đồ</p>
      </div>
    `;
    return;
  }

  switch (chartType) {
    case "bar":
      renderBarChart(container, chartData, { title, xLabel, yLabel });
      break;
    case "line":
      renderLineChart(container, chartData, { title, xLabel, yLabel });
      break;
    case "pie":
      renderPieChart(container, chartData, { title });
      break;
    default:
      console.error("❌ Unsupported chart type:", chartType);
  }
}

/**
 * Renders a simple bar chart using CSS
 * @param {HTMLElement} container - Container element
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 */
function renderBarChart(container, data, options) {
  const { title, xLabel, yLabel } = options;
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.amount || item.value || 0));
  
  const chartHTML = `
    <div class="simple-chart bar-chart">
      <h4 class="chart-title">${title}</h4>
      <div class="chart-area">
        <div class="y-axis-label">${yLabel}</div>
        <div class="bars-container">
          ${data.map((item, index) => {
            const value = item.amount || item.value || 0;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const label = item.month || item.type || item.label || `Item ${index + 1}`;
            
            return `
              <div class="bar-wrapper">
                <div class="bar" style="height: ${height}%;" title="${formatCurrency(value, 'VND')}">
                  <div class="bar-value">${formatCurrency(value, 'VND')}</div>
                </div>
                <div class="bar-label">${label}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="x-axis-label">${xLabel}</div>
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
  addChartStyles();
}

/**
 * Renders statistics export controls
 * @param {Object} options - Export options
 */
export function renderExportControls(options = {}) {
  const {
    containerId = "exportControls",
    formats = ["csv", "json"],
    onExport = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Export controls container #${containerId} not found`);
    return;
  }

  const controlsHTML = `
    <div class="export-controls">
      <h5>Xuất Dữ Liệu</h5>
      <div class="export-buttons">
        ${formats.map(format => `
          <button class="export-btn" data-format="${format}">
            📄 Xuất ${format.toUpperCase()}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = controlsHTML;

  // Add event listeners
  const exportButtons = container.querySelectorAll('.export-btn');
  exportButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const format = e.target.dataset.format;
      if (onExport && typeof onExport === 'function') {
        onExport(format);
      }
    });
  });

  addExportControlsStyles();
}

/**
 * Renders loading state for statistics
 * @param {string} containerId - Container ID
 * @param {string} message - Loading message
 */
export function renderLoadingState(containerId, message = "Đang tải dữ liệu thống kê...") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;

  addLoadingStyles();
}

/**
 * Renders error state for statistics
 * @param {string} containerId - Container ID
 * @param {string} error - Error message
 */
export function renderErrorState(containerId, error = "Có lỗi xảy ra khi tải dữ liệu") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>${error}</p>
      <button class="retry-btn" onclick="location.reload()">Thử Lại</button>
    </div>
  `;

  addErrorStyles();
}

/**
 * Adds CSS styles for financial overview
 */
function addFinancialOverviewStyles() {
  if (document.getElementById('financial-overview-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'financial-overview-styles';
  styles.textContent = `
    .financial-overview {
      margin: 20px 0;
    }
    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .overview-card {
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .overview-card.revenue {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
    }
    .overview-card.expense {
      background: linear-gradient(135deg, #dc3545, #fd7e14);
      color: white;
    }
    .overview-card.profit.positive {
      background: linear-gradient(135deg, #17a2b8, #6f42c1);
      color: white;
    }
    .overview-card.profit.negative {
      background: linear-gradient(135deg, #6c757d, #495057);
      color: white;
    }
    .overview-card h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .overview-card .amount {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .overview-card .margin {
      font-size: 12px;
      opacity: 0.8;
    }
    .currency-details {
      margin-top: 20px;
    }
    .currency-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .currency-breakdown {
      padding: 15px;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .positive { color: #28a745; }
    .negative { color: #dc3545; }
  `;
  document.head.appendChild(styles);
}

/**
 * Adds CSS styles for charts
 */
function addChartStyles() {
  if (document.getElementById('chart-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'chart-styles';
  styles.textContent = `
    .simple-chart {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    .chart-title {
      text-align: center;
      margin-bottom: 20px;
      color: #333;
    }
    .bars-container {
      display: flex;
      align-items: flex-end;
      height: 200px;
      gap: 10px;
      padding: 20px 0;
      overflow-x: auto;
    }
    .bar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }
    .bar {
      width: 40px;
      background: linear-gradient(to top, #007bff, #0056b3);
      border-radius: 3px 3px 0 0;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .bar:hover {
      background: linear-gradient(to top, #0056b3, #004085);
    }
    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 2px 5px;
      border-radius: 3px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .bar:hover .bar-value {
      opacity: 1;
    }
    .bar-label {
      margin-top: 10px;
      font-size: 12px;
      text-align: center;
      transform: rotate(-45deg);
      width: 80px;
    }
    .chart-placeholder {
      text-align: center;
      padding: 40px;
      color: #6c757d;
      font-style: italic;
    }
  `;
  document.head.appendChild(styles);
}

/**
 * Adds CSS styles for export controls
 */
function addExportControlsStyles() {
  if (document.getElementById('export-controls-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'export-controls-styles';
  styles.textContent = `
    .export-controls {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    .export-controls h5 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .export-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .export-btn {
      padding: 8px 15px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s ease;
    }
    .export-btn:hover {
      background: #0056b3;
    }
  `;
  document.head.appendChild(styles);
}

/**
 * Adds CSS styles for loading state
 */
function addLoadingStyles() {
  if (document.getElementById('loading-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'loading-styles';
  styles.textContent = `
    .loading-state {
      text-align: center;
      padding: 40px;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styles);
}

/**
 * Adds CSS styles for error state
 */
function addErrorStyles() {
  if (document.getElementById('error-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'error-styles';
  styles.textContent = `
    .error-state {
      text-align: center;
      padding: 40px;
      color: #dc3545;
    }
    .error-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .retry-btn {
      margin-top: 15px;
      padding: 10px 20px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .retry-btn:hover {
      background: #c82333;
    }
  `;
  document.head.appendChild(styles);
}