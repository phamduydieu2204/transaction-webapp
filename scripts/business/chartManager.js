/**
 * chartManager.js
 * 
 * Business charts and visualization management
 * Handles revenue analysis, cost management charts, and growth trends
 */

import { formatCurrency } from '../statisticsCore.js';

/**
 * Render revenue analysis section
 */
export function renderRevenueAnalysis(metrics) {
  const topSources = metrics.revenue.bySource.slice(0, 5);
  
  return `
    <div class="revenue-analysis">
      <h2>💰 Phân Tích Doanh Thu</h2>
      <div class="analysis-grid">
        
        <!-- Revenue Sources -->
        <div class="analysis-card sources-card">
          <h3>📈 Nguồn Doanh Thu</h3>
          <div class="sources-list">
            ${topSources.map((source, index) => {
              const percentage = metrics.financial.totalRevenue > 0 ? 
                (source.amount / metrics.financial.totalRevenue) * 100 : 0;
              return `
                <div class="source-item">
                  <div class="source-info">
                    <span class="source-name">#${index + 1} ${source.source}</span>
                    <span class="source-percentage">${percentage.toFixed(1)}%</span>
                  </div>
                  <div class="source-amount">${formatCurrency(source.amount, 'VND')}</div>
                  <div class="source-bar">
                    <div class="source-fill" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Revenue Metrics -->
        <div class="analysis-card metrics-card">
          <h3>📊 Chỉ Số Doanh Thu</h3>
          <div class="metrics-grid">
            <div class="metric-item" data-tooltip="Giá trị trung bình của mỗi giao dịch. Tăng chỉ số này bằng cách bán thêm sản phẩm hoặc nâng cấp gói">
              <div class="metric-icon">🎯</div>
              <div class="metric-content">
                <div class="metric-label">Giá trị đơn hàng TB</div>
                <div class="metric-value">${formatCurrency(metrics.revenue.averageOrderValue, 'VND')}</div>
              </div>
            </div>
            <div class="metric-item" data-tooltip="Tổng số giao dịch thành công trong kỳ báo cáo">
              <div class="metric-icon">📦</div>
              <div class="metric-content">
                <div class="metric-label">Tổng số giao dịch</div>
                <div class="metric-value">${metrics.revenue.totalTransactions}</div>
              </div>
            </div>
            <div class="metric-item" data-tooltip="Chi phí trung bình cho mỗi giao dịch. Giảm chỉ số này để tăng lợi nhuận">
              <div class="metric-icon">💎</div>
              <div class="metric-content">
                <div class="metric-label">Chi phí mỗi giao dịch</div>
                <div class="metric-value">${formatCurrency(metrics.costs.costPerTransaction, 'VND')}</div>
              </div>
            </div>
            <div class="metric-item" data-tooltip="Doanh thu trung bình trên mỗi giao dịch, thể hiện hiệu quả bán hàng">
              <div class="metric-icon">🚀</div>
              <div class="metric-content">
                <div class="metric-label">Chỉ số năng suất</div>
                <div class="metric-value">${formatCurrency(metrics.efficiency.productivityIndex, 'VND')}</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render cost management section
 */
export function renderCostManagement(metrics) {
  return `
    <div class="cost-management">
      <h2>💸 Quản Lý Chi Phí</h2>
      <div class="cost-grid">
        
        <!-- Cost Breakdown -->
        <div class="cost-card breakdown-card">
          <h3>📊 Phân Tích Chi Phí</h3>
          <div class="cost-categories">
            ${metrics.costs.byCategory.map(category => {
              const percentage = metrics.financial.totalExpenses > 0 ? 
                (category.amount / metrics.financial.totalExpenses) * 100 : 0;
              return `
                <div class="category-item">
                  <div class="category-info">
                    <span class="category-name">${category.category}</span>
                    <span class="category-percentage">${percentage.toFixed(1)}%</span>
                  </div>
                  <div class="category-amount">${formatCurrency(category.amount, 'VND')}</div>
                  <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Cost Efficiency -->
        <div class="cost-card efficiency-card">
          <h3>⚡ Hiệu Quả Chi Phí</h3>
          <div class="efficiency-metrics">
            <div class="efficiency-item" data-tooltip="Tỷ lệ chi phí vận hành so với doanh thu. Thấp hơn 70% là tốt, thấp hơn 50% là xuất sắc">
              <div class="efficiency-label">Chi phí vận hành / Doanh thu</div>
              <div class="efficiency-value">${metrics.efficiency.costEfficiencyRatio.toFixed(1)}%</div>
              <div class="efficiency-status ${metrics.efficiency.costEfficiencyRatio < 70 ? 'good' : 'warning'}">
                ${metrics.efficiency.costEfficiencyRatio < 70 ? '✅ Tốt' : '⚠️ Cần cải thiện'}
              </div>
            </div>
            <div class="efficiency-item" data-tooltip="Số tiền chi tiêu trung bình mỗi ngày cho hoạt động kinh doanh (không bao gồm chi phí cá nhân)">
              <div class="efficiency-label">Burn Rate (hàng ngày)</div>
              <div class="efficiency-value">${formatCurrency(metrics.kpis.burnRate, 'VND')}</div>
              <div class="efficiency-status neutral">📊 Theo dõi</div>
            </div>
          </div>
          
          <!-- Accounting Type Breakdown -->
          <div class="accounting-breakdown">
            <h4>📊 Phân loại kế toán</h4>
            <div class="breakdown-items">
              <div class="breakdown-item" data-tooltip="Cost of Goods Sold - Chi phí trực tiếp để tạo ra sản phẩm/dịch vụ">
                <span class="breakdown-label">COGS</span>
                <span class="breakdown-value">${formatCurrency(metrics.costs.accountingBreakdown.COGS, 'VND')}</span>
                <span class="breakdown-percent">${metrics.financial.totalExpenses > 0 ? 
                  ((metrics.costs.accountingBreakdown.COGS / metrics.financial.totalExpenses) * 100).toFixed(1) : 0}%</span>
              </div>
              <div class="breakdown-item" data-tooltip="Operating Expenses - Chi phí vận hành kinh doanh như lương, thuê văn phòng, marketing">
                <span class="breakdown-label">OPEX</span>
                <span class="breakdown-value">${formatCurrency(metrics.costs.accountingBreakdown.OPEX, 'VND')}</span>
                <span class="breakdown-percent">${metrics.financial.totalExpenses > 0 ? 
                  ((metrics.costs.accountingBreakdown.OPEX / metrics.financial.totalExpenses) * 100).toFixed(1) : 0}%</span>
              </div>
              <div class="breakdown-item" data-tooltip="Chi phí cá nhân không liên quan đến kinh doanh">
                <span class="breakdown-label">Không liên quan</span>
                <span class="breakdown-value">${formatCurrency(metrics.costs.accountingBreakdown['Không liên quan'], 'VND')}</span>
                <span class="breakdown-percent">${metrics.financial.totalExpenses > 0 ? 
                  ((metrics.costs.accountingBreakdown['Không liên quan'] / metrics.financial.totalExpenses) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Render growth trends section
 */
export function renderGrowthTrends(metrics) {
  return `
    <div class="growth-trends">
      <h2>📈 Xu Hướng Tăng Trưởng</h2>
      <div class="trends-grid">
        
        <!-- Growth Indicators -->
        <div class="trend-card indicators-card">
          <h3>🎯 Chỉ Số Tăng Trưởng</h3>
          <div class="growth-indicators">
            <div class="indicator-item">
              <div class="indicator-icon">💰</div>
              <div class="indicator-content">
                <div class="indicator-label">Tăng trưởng doanh thu</div>
                <div class="indicator-value">+${metrics.growth.revenueGrowth.toFixed(1)}%</div>
              </div>
            </div>
            <div class="indicator-item">
              <div class="indicator-icon">📊</div>
              <div class="indicator-content">
                <div class="indicator-label">Tăng trưởng giao dịch</div>
                <div class="indicator-value">+${metrics.growth.transactionGrowth.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Operational Efficiency -->
        <div class="trend-card efficiency-card">
          <h3>⚡ Hiệu Quả Vận Hành</h3>
          <div class="kpi-list">
            <div class="kpi-item" data-tooltip="Giá trị trọng đời của khách hàng - Tổng doanh thu ước tính từ một khách hàng trong suốt thời gian họ là khách hàng">
              <div class="kpi-icon">💎</div>
              <div class="kpi-content">
                <div class="kpi-label">Customer Lifetime Value</div>
                <div class="kpi-value">${formatCurrency(metrics.revenue.averageOrderValue * 3, 'VND')}</div>
                <div class="kpi-trend">📈 Ước tính</div>
              </div>
            </div>
            <div class="kpi-item" data-tooltip="Doanh thu trung bình trên mỗi giao dịch">
              <div class="kpi-icon">🎪</div>
              <div class="kpi-content">
                <div class="kpi-label">Revenue per Transaction</div>
                <div class="kpi-value">${formatCurrency(metrics.revenue.averageOrderValue, 'VND')}</div>
                <div class="kpi-trend">📊 Hiện tại</div>
              </div>
            </div>
            <div class="kpi-item" data-tooltip="Hiệu quả vận hành - Phần trăm doanh thu giữ lại sau khi trừ chi phí vận hành">
              <div class="kpi-icon">⚡</div>
              <div class="kpi-content">
                <div class="kpi-label">Operational Efficiency</div>
                <div class="kpi-value">${(100 - metrics.efficiency.costEfficiencyRatio).toFixed(1)}%</div>
                <div class="kpi-trend">${metrics.efficiency.costEfficiencyRatio < 70 ? '✅' : '⚠️'}</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}