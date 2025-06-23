/**
 * financeReport.js
 * 
 * Financial reporting and analysis
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';

/**
 * Load finance report
 */
export async function loadFinanceReport() {
  console.log('💼 Loading finance report');
  
  try {
    await ensureDataIsLoaded();
    
    const container = document.getElementById('report-finance');
    if (!container) {
      console.warn('❌ Finance report container not found');
      return;
    }
    
    const html = `
      <div class="finance-report">
        <h3>💼 Báo cáo Tài chính</h3>
        <div class="report-placeholder">
          <div class="placeholder-icon">🚧</div>
          <div class="placeholder-text">
            <h4>Đang phát triển</h4>
            <p>Báo cáo tài chính chi tiết sẽ bao gồm:</p>
            <ul>
              <li>📊 Báo cáo lãi/lỗ</li>
              <li>💰 Dòng tiền (Cash Flow)</li>
              <li>📈 Phân tích tỷ suất lợi nhuận</li>
              <li>📋 Bảng cân đối kế toán</li>
              <li>📊 Phân tích tài chính theo thời gian</li>
              <li>💎 Chỉ số tài chính quan trọng</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Finance report placeholder loaded');
  } catch (error) {
    console.error('❌ Error loading finance report:', error);
    showError('Không thể tải báo cáo tài chính');
  }
}