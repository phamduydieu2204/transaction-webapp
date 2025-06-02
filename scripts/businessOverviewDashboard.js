/**
 * businessOverviewDashboard.js
 * 
 * Business Overview Dashboard Controller
 * Orchestrates all business dashboard modules
 */

import { getDateRange } from './statisticsCore.js';
import { 
  renderDashboardHeader, 
  renderExecutiveSummary, 
  renderFinancialPerformance,
  addBusinessDashboardInteractivity 
} from './business/overviewGenerator.js';
import { 
  renderRevenueAnalysis, 
  renderCostManagement, 
  renderGrowthTrends 
} from './business/chartManager.js';
import { 
  calculateBusinessMetrics, 
  filterDataByDateRange 
} from './business/dataAnalytics.js';

/**
 * Renders comprehensive business overview dashboard
 * @param {Array} transactionData - Transaction records
 * @param {Array} expenseData - Expense records
 * @param {Object} options - Dashboard options
 */
export function renderBusinessOverviewDashboard(transactionData, expenseData, options = {}) {
  const {
    containerId = "businessOverviewDashboard",
    dateRange = null
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Business Overview container #${containerId} not found`);
    return;
  }

  console.log("🏢 Rendering Business Overview Dashboard:", {
    transactions: transactionData.length,
    expenses: expenseData.length,
    dateRange
  });

  // Filter data based on date range
  let filteredTransactions = transactionData;
  let filteredExpenses = expenseData;
  
  if (dateRange && dateRange.start && dateRange.end) {
    filteredTransactions = filterDataByDateRange(transactionData, dateRange);
    filteredExpenses = filterDataByDateRange(expenseData, dateRange);
    
    console.log("📊 Filtered data:", {
      originalTransactions: transactionData.length,
      filteredTransactions: filteredTransactions.length,
      originalExpenses: expenseData.length,
      filteredExpenses: filteredExpenses.length
    });
  }

  // Calculate all business metrics using filtered data
  const metrics = calculateBusinessMetrics(filteredTransactions, filteredExpenses, dateRange);
  
  // Generate dashboard HTML
  const dashboardHTML = `
    <div class="business-overview-dashboard">
      <!-- Header with period info -->
      ${renderDashboardHeader(dateRange)}
      
      <!-- Executive Summary Cards -->
      ${renderExecutiveSummary(metrics)}
      
      <!-- Financial Performance Section -->
      ${renderFinancialPerformance(metrics)}
      
      <!-- Revenue Analysis -->
      ${renderRevenueAnalysis(metrics)}
      
      <!-- Cost Management -->
      ${renderCostManagement(metrics)}
      
      <!-- Growth & Trends -->
      ${renderGrowthTrends(metrics)}
      
      
    </div>
  `;

  container.innerHTML = dashboardHTML;
  
  // Add interactivity
  addBusinessDashboardInteractivity(metrics);
  
  console.log("✅ Business Overview Dashboard rendered successfully");
}

/**
 * Add CSS styles for business dashboard
 */
export function addBusinessDashboardStyles() {
  if (document.getElementById('business-dashboard-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'business-dashboard-styles';
  styles.textContent = `
    /* Business Overview Dashboard Styles */
    .business-overview-dashboard {
      padding: 20px;
      background: #f5f7fa;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Tooltip Styles */
    [data-tooltip] {
      position: relative;
      cursor: help;
    }
    
    [data-tooltip]:hover::before,
    [data-tooltip]:hover::after {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    [data-tooltip]::before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(5px);
      padding: 10px 15px;
      background-color: rgba(33, 37, 41, 0.95);
      color: white;
      font-size: 13px;
      line-height: 1.5;
      border-radius: 6px;
      white-space: normal;
      max-width: 300px;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      pointer-events: none;
      font-weight: normal;
    }
    
    [data-tooltip]::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      border: 6px solid transparent;
      border-top-color: rgba(33, 37, 41, 0.95);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      pointer-events: none;
    }
    
    /* Adjust tooltip position for elements near the top */
    .summary-card[data-tooltip]::before,
    .pnl-item[data-tooltip]::before {
      bottom: auto;
      top: 100%;
      transform: translateX(-50%) translateY(-5px);
    }
    
    .summary-card[data-tooltip]:hover::before,
    .pnl-item[data-tooltip]:hover::before {
      transform: translateX(-50%) translateY(5px);
    }
    
    .summary-card[data-tooltip]::after,
    .pnl-item[data-tooltip]::after {
      bottom: auto;
      top: 100%;
      transform: translateX(-50%) translateY(-10px);
      border-top-color: transparent;
      border-bottom-color: rgba(33, 37, 41, 0.95);
    }
    
    .summary-card[data-tooltip]:hover::after,
    .pnl-item[data-tooltip]:hover::after {
      transform: translateX(-50%) translateY(-2px);
    }
    
    /* Special handling for small elements */
    .secondary-info span[data-tooltip]::before,
    .breakdown-item[data-tooltip]::before {
      left: 0;
      transform: translateX(0) translateY(5px);
    }
    
    .secondary-info span[data-tooltip]:hover::before,
    .breakdown-item[data-tooltip]:hover::before {
      transform: translateX(0) translateY(0);
    }
    
    .secondary-info span[data-tooltip]::after,
    .breakdown-item[data-tooltip]::after {
      left: 20px;
      transform: translateX(0) translateY(10px);
    }
    
    /* Active tooltip state for touch devices */
    [data-tooltip].tooltip-active::before,
    [data-tooltip].tooltip-active::after {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) !important;
    }
    
    /* Dashboard Header */
    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }
    
    .header-content h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
    }
    
    .period-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      opacity: 0.9;
    }
    
    .period-label {
      font-size: 16px;
      font-weight: 500;
    }
    
    .last-updated {
      font-size: 14px;
      opacity: 0.8;
    }
    
    /* Executive Summary */
    .executive-summary {
      margin-bottom: 40px;
    }
    
    .executive-summary h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .summary-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
      border-left: 4px solid #e2e8f0;
    }
    
    .summary-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    
    .summary-card.revenue-card {
      border-left-color: #48bb78;
    }
    
    .summary-card.profit-card.positive {
      border-left-color: #4299e1;
    }
    
    .summary-card.profit-card.negative {
      border-left-color: #f56565;
    }
    
    .summary-card.performance-card {
      border-left-color: #ed8936;
    }
    
    .summary-card.cashflow-card {
      border-left-color: #9f7aea;
    }
    
    .card-icon {
      font-size: 32px;
      min-width: 40px;
    }
    
    .card-content {
      flex: 1;
    }
    
    .card-content h3 {
      margin: 0 0 8px 0;
      color: #718096;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .primary-value {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .secondary-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .secondary-info span {
      font-size: 12px;
      color: #718096;
    }
    
    .card-trend {
      font-size: 14px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
    }
    
    .card-trend.positive {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .card-trend.negative {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .card-trend.neutral {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    /* Financial Performance */
    .financial-performance {
      margin-bottom: 40px;
    }
    
    .financial-performance h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .performance-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .performance-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* P&L Card */
    .pnl-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .pnl-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .pnl-item:last-child {
      border-bottom: 2px solid #2d3748;
      font-weight: 600;
    }
    
    .pnl-item .label {
      color: #4a5568;
    }
    
    .pnl-item .value.positive {
      color: #22543d;
      font-weight: 600;
    }
    
    .pnl-item .value.negative {
      color: #742a2a;
      font-weight: 600;
    }
    
    /* Ratios Card */
    .ratio-items {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .ratio-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .ratio-label {
      color: #4a5568;
      font-size: 14px;
    }
    
    .ratio-value {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
    }
    
    .ratio-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .ratio-fill {
      height: 100%;
      background: linear-gradient(90deg, #48bb78, #38a169);
      transition: width 0.5s ease;
    }
    
    /* Revenue Analysis */
    .revenue-analysis {
      margin-bottom: 40px;
    }
    
    .revenue-analysis h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .analysis-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .analysis-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* Sources Card */
    .sources-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .source-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .source-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .source-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .source-percentage {
      font-size: 14px;
      color: #718096;
    }
    
    .source-amount {
      font-size: 16px;
      font-weight: 600;
      color: #22543d;
    }
    
    .source-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .source-fill {
      height: 100%;
      background: linear-gradient(90deg, #4299e1, #3182ce);
      transition: width 0.5s ease;
    }
    
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .metric-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .metric-icon {
      font-size: 24px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
    }
    
    .metric-value {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
    }
    
    /* Cost Management */
    .cost-management {
      margin-bottom: 40px;
    }
    
    .cost-management h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .cost-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .cost-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .cost-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* Cost Categories */
    .cost-categories {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .category-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .category-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .category-name {
      font-weight: 600;
      color: #2d3748;
    }
    
    .category-percentage {
      font-size: 14px;
      color: #718096;
    }
    
    .category-amount {
      font-size: 16px;
      font-weight: 600;
      color: #742a2a;
    }
    
    .category-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .category-fill {
      height: 100%;
      background: linear-gradient(90deg, #f56565, #e53e3e);
      transition: width 0.5s ease;
    }
    
    /* Efficiency Metrics */
    .efficiency-metrics {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .efficiency-item {
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .efficiency-label {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 8px;
    }
    
    .efficiency-value {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .efficiency-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .efficiency-status.good {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .efficiency-status.warning {
      background: #feebc8;
      color: #744210;
    }
    
    .efficiency-status.neutral {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    /* Growth Trends */
    .growth-trends {
      margin-bottom: 40px;
    }
    
    .growth-trends h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .trends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .trend-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .trend-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* Growth Indicators */
    .growth-indicators {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .indicator-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .indicator-icon {
      font-size: 24px;
    }
    
    .indicator-label {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 4px;
    }
    
    .indicator-value {
      font-size: 18px;
      font-weight: 700;
      color: #22543d;
    }
    
    /* Chart Placeholder */
    .chart-placeholder {
      height: 200px;
      background: #f7fafc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #cbd5e0;
    }
    
    .chart-info {
      text-align: center;
      color: #718096;
    }
    
    /* Operational Efficiency */
    .operational-efficiency {
      margin-bottom: 40px;
    }
    
    .operational-efficiency h2 {
      margin-bottom: 20px;
      color: #2d3748;
      font-size: 24px;
    }
    
    .efficiency-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .efficiency-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .efficiency-card h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }
    
    /* KPI List */
    .kpi-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .kpi-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .kpi-icon {
      font-size: 24px;
    }
    
    .kpi-label {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 4px;
    }
    
    .kpi-value {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .kpi-trend {
      font-size: 12px;
      color: #718096;
    }
    
    /* Action List */
    .action-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .action-item.high {
      background: #fed7d7;
      border-left-color: #f56565;
    }
    
    .action-item.medium {
      background: #feebc8;
      border-left-color: #ed8936;
    }
    
    .action-item.low {
      background: #e6fffa;
      border-left-color: #38b2ac;
    }
    
    .action-icon {
      font-size: 20px;
    }
    
    .action-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .action-description {
      font-size: 14px;
      color: #4a5568;
    }
    
    .action-priority {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    /* Accounting Breakdown */
    .accounting-breakdown {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .accounting-breakdown h4 {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .breakdown-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .breakdown-item {
      display: flex;
      align-items: center;
      padding: 8px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .breakdown-label {
      font-weight: 600;
      color: #2d3748;
      min-width: 120px;
    }
    
    .breakdown-value {
      flex: 1;
      color: #4a5568;
      font-weight: 500;
    }
    
    .breakdown-percent {
      font-size: 14px;
      color: #718096;
      background: #f7fafc;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .business-overview-dashboard {
        padding: 15px;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .performance-grid,
      .analysis-grid,
      .cost-grid,
      .trends-grid,
      .efficiency-grid {
        grid-template-columns: 1fr;
      }
      
      .header-content h1 {
        font-size: 24px;
      }
      
      .period-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `;
  
  document.head.appendChild(styles);
}

// Auto-add styles when module loads
addBusinessDashboardStyles();