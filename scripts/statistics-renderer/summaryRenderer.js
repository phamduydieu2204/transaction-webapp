/**
 * summaryRenderer.js
 * 
 * Handles rendering of summary cards, financial overviews, and key metrics
 * Creates visual representations of aggregated data
 */

import { formatCurrency } from '../statisticsCore.js';

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

  // console.log("💰 Rendering financial overview");

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

  // console.log("✅ Financial overview rendered successfully");
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