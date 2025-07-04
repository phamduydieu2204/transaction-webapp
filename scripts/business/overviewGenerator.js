/**
 * overviewGenerator.js
 * 
 * Business overview dashboard generation and rendering
 * Handles executive summary, financial performance, and dashboard header
 */

import { formatCurrency } from '../statisticsCore.js';

/**
 * Render dashboard header
 */
export function renderDashboardHeader(dateRange) {
  let periodLabel = 'Tất cả thời gian';
  
  if (dateRange && dateRange.start && dateRange.end) {
    // Format dates for display
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const formatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const startStr = startDate.toLocaleDateString('vi-VN', formatOptions);
    const endStr = endDate.toLocaleDateString('vi-VN', formatOptions);
    
    periodLabel = `${startStr} - ${endStr}`;
  }
    
  return `
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Tổng Quan Kinh Doanh</h1>
        <div class="period-info">
          <span class="period-label">Kỳ báo cáo: ${periodLabel}</span>
        </div>
        <div class="last-updated">Cập nhật: ${new Date().toLocaleString('vi-VN')}</div>
      </div>
    </div>
  `;
}

/**
 * Render executive summary cards
 */
export function renderExecutiveSummary(metrics) {
  const { financial, revenue, kpis } = metrics;
  
  return `
    <div class="executive-summary">
      <h2>📊 Tóm Tắt Điều Hành</h2>
      <div class="summary-cards">
        
        <!-- Revenue Card -->
        <div class="summary-card revenue-card" data-tooltip="Tổng doanh thu trong kỳ báo cáo, bao gồm tất cả các giao dịch đã hoàn tất. AOV (Average Order Value) là giá trị trung bình mỗi đơn hàng.">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Doanh Thu</h3>
            <div class="primary-value">${formatCurrency(financial.totalRevenue, 'VND')}</div>
            <div class="secondary-info">
              <span data-tooltip="Tổng số giao dịch đã thực hiện trong kỳ">${revenue.totalTransactions} giao dịch</span>
              <span data-tooltip="Giá trị trung bình mỗi giao dịch (Average Order Value)">AOV: ${formatCurrency(revenue.averageOrderValue, 'VND')}</span>
            </div>
          </div>
          <div class="card-trend positive">↗️ +12%</div>
        </div>
        
        <!-- Profit Card -->
        <div class="summary-card profit-card ${financial.netProfit >= 0 ? 'positive' : 'negative'}" data-tooltip="Lợi nhuận ròng = Doanh thu - Tổng chi phí. Đây là số tiền thực tế doanh nghiệp kiếm được sau khi trừ mọi chi phí.">
          <div class="card-icon">${financial.netProfit >= 0 ? '📈' : '📉'}</div>
          <div class="card-content">
            <h3>Lợi Nhuận Ròng</h3>
            <div class="primary-value">${formatCurrency(financial.netProfit, 'VND')}</div>
            <div class="secondary-info">
              <span data-tooltip="Tỷ suất lợi nhuận ròng = (Lợi nhuận ròng / Doanh thu) x 100%">Margin: ${financial.profitMargin.toFixed(1)}%</span>
              <span data-tooltip="Tỷ suất lợi nhuận gộp = ((Doanh thu - Giá vốn) / Doanh thu) x 100%">Gross: ${financial.grossMargin.toFixed(1)}%</span>
            </div>
          </div>
          <div class="card-trend ${financial.netProfit >= 0 ? 'positive' : 'negative'}">
            ${financial.netProfit >= 0 ? '↗️' : '↘️'} ${financial.profitMargin.toFixed(0)}%
          </div>
        </div>
        
        <!-- Daily Performance -->
        <div class="summary-card performance-card" data-tooltip="Hiệu suất kinh doanh trung bình mỗi ngày trong kỳ báo cáo">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3>Hiệu Suất Hàng Ngày</h3>
            <div class="primary-value" data-tooltip="Doanh thu trung bình mỗi ngày">${formatCurrency(kpis.revenuePerDay, 'VND')}/ngày</div>
            <div class="secondary-info">
              <span data-tooltip="Chi phí vận hành trung bình mỗi ngày (không bao gồm chi phí cá nhân)">Burn Rate: ${formatCurrency(kpis.burnRate, 'VND')}/ngày</span>
              <span data-tooltip="Lợi nhuận ròng trung bình mỗi ngày">Net: ${formatCurrency(kpis.revenuePerDay - kpis.burnRate, 'VND')}/ngày</span>
            </div>
          </div>
          <div class="card-trend neutral">📊</div>
        </div>
        
        <!-- Cash Flow -->
        <div class="summary-card cashflow-card" data-tooltip="Dòng tiền thể hiện lượng tiền thực tế ra vào doanh nghiệp trong kỳ">
          <div class="card-icon">💸</div>
          <div class="card-content">
            <h3>Dòng Tiền</h3>
            <div class="primary-value" data-tooltip="Dòng tiền ròng = Tổng tiền vào - Tổng tiền ra">${formatCurrency(metrics.cashFlow.netCashFlow, 'VND')}</div>
            <div class="secondary-info">
              <span data-tooltip="Dòng tiền từ hoạt động kinh doanh chính">Operating: ${formatCurrency(metrics.cashFlow.operatingCashFlow, 'VND')}</span>
              <span data-tooltip="Dòng tiền tự do sau khi trừ chi phí đầu tư">Free: ${formatCurrency(metrics.cashFlow.freeCashFlow, 'VND')}</span>
            </div>
          </div>
          <div class="card-trend ${metrics.cashFlow.netCashFlow >= 0 ? 'positive' : 'negative'}">
            ${metrics.cashFlow.netCashFlow >= 0 ? '💪' : '⚠️'}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render financial performance section
 */
export function renderFinancialPerformance(metrics) {
  return `
    <div class="financial-performance">
      <h2>💹 Hiệu Suất Tài Chính</h2>
      <div class="performance-grid">
        
        <!-- P&L Summary -->
        <div class="performance-card pnl-card">
          <h3>📋 Báo Cáo Lãi Lỗ</h3>
          <div class="pnl-items">
            <div class="pnl-item revenue" data-tooltip="Tổng tiền thu được từ các giao dịch đã hoàn tất và dịch vụ trong kỳ">
              <span class="label">Doanh thu</span>
              <span class="value positive">${formatCurrency(metrics.financial.totalRevenue, 'VND')}</span>
            </div>
            <div class="pnl-item cogs" data-tooltip="Chi phí trực tiếp để tạo ra sản phẩm/dịch vụ đã hoàn tất (Cost of Goods Sold)">
              <span class="label">Giá vốn hàng bán (COGS)</span>
              <span class="value negative">-${formatCurrency(metrics.costs.costOfRevenue, 'VND')}</span>
            </div>
            <div class="pnl-item gross-profit" data-tooltip="Lợi nhuận gộp = Doanh thu - Giá vốn. Số tiền còn lại để chi trả chi phí vận hành">
              <span class="label">Lợi nhuận gộp</span>
              <span class="value ${metrics.financial.grossProfit >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(metrics.financial.grossProfit, 'VND')}
              </span>
            </div>
            <div class="pnl-item operating" data-tooltip="Chi phí vận hành hàng ngày như lương, thuê mặt bằng, marketing, hành chính (Operating Expenses)">
              <span class="label">Chi phí vận hành (OPEX)</span>
              <span class="value negative">-${formatCurrency(metrics.costs.operating, 'VND')}</span>
            </div>
            <div class="pnl-item net-profit" data-tooltip="Lợi nhuận cuối cùng sau khi trừ tất cả chi phí. Đây là số tiền thực sự kiếm được">
              <span class="label">Lợi nhuận ròng</span>
              <span class="value ${metrics.financial.netProfit >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(metrics.financial.netProfit, 'VND')}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Key Ratios -->
        <div class="performance-card ratios-card">
          <h3>📊 Chỉ Số Quan Trọng</h3>
          <div class="ratio-items">
            <div class="ratio-item" data-tooltip="Tỷ suất lợi nhuận gộp cho biết bạn giữ lại được bao nhiêu % doanh thu sau khi trừ giá vốn hàng bán. Càng cao càng tốt.">
              <div class="ratio-label">Tỷ suất lợi nhuận gộp</div>
              <div class="ratio-value">${metrics.financial.grossMargin.toFixed(1)}%</div>
              <div class="ratio-bar">
                <div class="ratio-fill" style="width: ${Math.min(metrics.financial.grossMargin, 100)}%"></div>
              </div>
            </div>
            <div class="ratio-item" data-tooltip="Tỷ suất lợi nhuận ròng cho biết bạn giữ lại được bao nhiêu % doanh thu sau khi trừ TẤT CẢ chi phí. Đây là chỉ số quan trọng nhất.">
              <div class="ratio-label">Tỷ suất lợi nhuận ròng</div>
              <div class="ratio-value">${metrics.financial.profitMargin.toFixed(1)}%</div>
              <div class="ratio-bar">
                <div class="ratio-fill" style="width: ${Math.min(Math.abs(metrics.financial.profitMargin), 100)}%"></div>
              </div>
            </div>
            <div class="ratio-item" data-tooltip="Tỷ lệ chi phí vận hành so với doanh thu. Càng thấp càng tốt, dưới 70% là tốt, dưới 50% là xuất sắc.">
              <div class="ratio-label">Hiệu quả chi phí</div>
              <div class="ratio-value">${metrics.efficiency.costEfficiencyRatio.toFixed(1)}%</div>
              <div class="ratio-bar">
                <div class="ratio-fill" style="width: ${Math.min(metrics.efficiency.costEfficiencyRatio, 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Add interactivity to dashboard
 */
export async function addBusinessDashboardInteractivity(metrics) {
  // Add hover effects and click handlers
  document.querySelectorAll('.summary-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
  
  
  // Initialize tooltip functionality
  initializeTooltips();
  
  // console.log("✅ Business dashboard interactivity added");
}

/**
 * Initialize tooltip functionality
 */
function initializeTooltips() {
  // Add tooltip functionality for touch devices
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(element => {
    // For touch devices, show tooltip on tap
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      showTooltip(element);
      
      // Hide after 3 seconds
      setTimeout(() => {
        hideTooltip(element);
      }, 3000);
    });
  });
  
  // console.log("✅ Tooltips initialized for", tooltipElements.length, "elements");
}

/**
 * Show tooltip programmatically
 */
function showTooltip(element) {
  element.classList.add('tooltip-active');
}

/**
 * Hide tooltip programmatically
 */
function hideTooltip(element) {
  element.classList.remove('tooltip-active');
}