/**
 * renewalReport.js
 * 
 * Renewal and subscription analytics
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatDate, formatRelativeTime } from '../core/reportFormatters.js';
import { calculateDaysBetween, calculateRenewalRate } from '../core/reportCalculations.js';

/**
 * Load renewal report
 */
export async function loadRenewalReport() {
  
  try {
    await ensureDataIsLoaded();
    
    const container = document.getElementById('report-renewal');
    if (!container) {
      console.warn('❌ Renewal report container not found');
      return;
    }
    
    const html = `
      <div class="renewal-report">
        <h3>🔄 Báo cáo Gia hạn</h3>
        <div id="renewalOverview"></div>
        <div id="expiringSubscriptions"></div>
        <div id="renewalTrends"></div>
      </div>
    `;
    
    container.innerHTML = html;
    
    await Promise.all([
      loadRenewalOverview(),
      loadExpiringSubscriptions(),
      loadRenewalTrends()
    ]);
    
    console.log('✅ Renewal report loaded');
  } catch (error) {
    console.error('❌ Error loading renewal report:', error);
  });
      label: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
    });
  }
    html += `
      <div class="trend-month">
        <div class="month-chart">
          <div class="chart-bar renewals" style="height: ${month.renewals * 5}px" title="Gia hạn: ${month.renewals}"></div>
          <div class="chart-bar new-subs" style="height: ${month.newSubs * 3}px" title="Mới: ${month.newSubs}"></div>
        </div>
        <div class="month-stats">
          <div class="renewal-count">GH: ${month.renewals}</div>
          <div class="new-count">Mới: ${month.newSubs}</div>
          <div class="renewal-rate">${renewalPercentage.toFixed(0)}%</div>
        </div>
        <div class="month-label">${month.label}</div>
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="trend-legend">
        <div class="legend-item">
          <div class="legend-color renewals"></div>
          <span>Gia hạn</span>
        </div>
        <div class="legend-item">
          <div class="legend-color new-subs"></div>
          <span>Đăng ký mới</span>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}