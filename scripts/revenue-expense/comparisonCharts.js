/**
 * comparisonCharts.js
 * 
 * Revenue vs expense comparisons and profit analysis
 * Handles comparative visualization and profitability metrics
 */
    };
  }
  });

  }));
  );
  );
  
  // Analyze profit trend
    comparisonRows = `
      <tr>
        <td>Thay đổi so với kỳ trước</td>
        <td class="${revenueChange >= 0 ? 'positive' : 'negative'}">
          ${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%
        </td>
        <td class="${expenseChange <= 0 ? 'positive' : 'negative'}">
          ${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%
        </td>
        <td class="${profitChange >= 0 ? 'positive' : 'negative'}">
          ${profitChange >= 0 ? '+' : ''}${profitChange.toFixed(1)}%
        </td>
      </tr>
    `;
  }
  
  return `
    <div class="comparison-summary">
      <h4>📊 Tổng quan so sánh</h4>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Chỉ số</th>
            <th>Doanh thu</th>
            <th>Chi phí</th>
            <th>Lợi nhuận</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Kỳ hiện tại</td>
            <td>${formatCurrency(currentTotalRevenue, 'VND')}</td>
            <td>${formatCurrency(currentTotalExpense, 'VND')}</td>
            <td class="${currentMetrics.totalProfit >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(currentMetrics.totalProfit, 'VND')}
            </td>
          </tr>
          ${previousMetrics ? `
            <tr>
              <td>Kỳ trước</td>
              <td>${formatCurrency(previousData.reduce((sum, item) => sum + item.revenue, 0), 'VND')}</td>
              <td>${formatCurrency(previousData.reduce((sum, item) => sum + item.expense, 0), 'VND')}</td>
              <td class="${previousMetrics.totalProfit >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(previousMetrics.totalProfit, 'VND')}
              </td>
            </tr>
          ` : ''}
          ${comparisonRows}
          <tr class="summary-row">
            <td><strong>Tỷ suất lợi nhuận</strong></td>
            <td colspan="2">-</td>
            <td><strong>${currentMetrics.profitMargin.toFixed(1)}%</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate profitability indicators
 * @param {Array} data - Revenue/expense data
 * @returns {string} HTML for profitability indicators
 */
  return `
    <div class="profitability-indicators">
      <div class="indicator-grid">
        <div class="indicator-card total-profit ${metrics.totalProfit >= 0 ? 'positive' : 'negative'}">
          <div class="indicator-icon">${metrics.totalProfit >= 0 ? '💰' : '⚠️'}</div>
          <div class="indicator-content">
            <div class="indicator-label">Tổng lợi nhuận</div>
            <div class="indicator-value">${formatCurrency(metrics.totalProfit, 'VND')}</div>
          </div>
        </div>
        
        <div class="indicator-card profit-margin">
          <div class="indicator-icon">📊</div>
          <div class="indicator-content">
            <div class="indicator-label">Tỷ suất LN</div>
            <div class="indicator-value">${metrics.profitMargin.toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="indicator-card profitable-months">
          <div class="indicator-icon">✅</div>
          <div class="indicator-content">
            <div class="indicator-label">Tháng có lãi</div>
            <div class="indicator-value">${metrics.profitableMonths}/${data.length}</div>
          </div>
        </div>
        
        <div class="indicator-card trend ${metrics.profitTrend}">
          <div class="indicator-icon">
            ${metrics.profitTrend === 'improving' ? '📈' : 
              metrics.profitTrend === 'declining' ? '📉' : '➡️'}
          </div>
          <div class="indicator-content">
            <div class="indicator-label">Xu hướng</div>
            <div class="indicator-value">
              ${metrics.profitTrend === 'improving' ? 'Cải thiện' : 
                metrics.profitTrend === 'declining' ? 'Giảm sút' : 'Ổn định'}
            </div>
          </div>
        </div>
      </div>
      
      <div class="best-worst-months">
        <div class="best-month">
          <span class="label">🏆 Tháng tốt nhất:</span>
          <span class="value">${metrics.bestMonth.label} - ${formatCurrency(metrics.bestMonth.profit, 'VND')}</span>
        </div>
        <div class="worst-month">
          <span class="label">⚠️ Tháng khó khăn:</span>
          <span class="value">${metrics.worstMonth.label} - ${formatCurrency(metrics.worstMonth.profit, 'VND')}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate profit tooltip content
 * @param {Object} dataPoint - Data point
 * @returns {string} HTML for profit tooltip
 */
  return `
    <div class="tooltip-section profit-section">
      <div class="tooltip-title">
        <span class="icon">${profit >= 0 ? '💰' : '⚠️'}</span>
        Lợi nhuận ${dataPoint.label}
      </div>
      <div class="tooltip-value ${profit >= 0 ? 'positive' : 'negative'}">
        ${formatCurrency(profit, 'VND')}
      </div>
      <div class="tooltip-details">
        <div class="detail-row">
          <span>Trạng thái:</span>
          <span class="${profit >= 0 ? 'positive' : 'negative'}">${profitStatus}</span>
        </div>
        <div class="detail-row">
          <span>Tỷ suất LN:</span>
          <span class="${margin >= 0 ? 'positive' : 'negative'}">${margin.toFixed(1)}%</span>
        </div>
        <div class="detail-row">
          <span>Hiệu quả:</span>
          <span>${getProfitEfficiency(margin)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get profit efficiency description
 * @param {number} margin - Profit margin percentage
 * @returns {string} Efficiency description
 */
function getProfitEfficiency(margin) {
  if (margin >= 30) return 'Xuất sắc';
  if (margin >= 20) return 'Tốt';
  if (margin >= 10) return 'Khá';
  if (margin >= 0) return 'Thấp';
  return 'Thua lỗ';
}

// Make functions available globally for backward compatibility
window.generateProfitArea = generateProfitArea;
window.generatePeriodComparison = generatePeriodComparison;
window.analyzeProfitMetrics = analyzeProfitMetrics;
window.generateProfitBars = generateProfitBars;
window.generateComparisonSummary = generateComparisonSummary;
window.generateProfitabilityIndicators = generateProfitabilityIndicators;
window.generateProfitTooltip = generateProfitTooltip;