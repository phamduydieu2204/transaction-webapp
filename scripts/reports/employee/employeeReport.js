/**
 * employeeReport.js
 * 
 * Employee performance and analytics
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';

/**
 * Load employee report
 */
export async function loadEmployeeReport() {
  console.log('👨‍💼 Loading employee report');
  
  try {
    await ensureDataIsLoaded();
    
    const container = document.getElementById('report-employee');
    if (!container) {
      console.warn('❌ Employee report container not found');
      return;
    }
    
    const html = `
      <div class="employee-report">
        <h3>👨‍💼 Báo cáo Nhân viên</h3>
        <div class="report-placeholder">
          <div class="placeholder-icon">🚧</div>
          <div class="placeholder-text">
            <h4>Đang phát triển</h4>
            <p>Báo cáo hiệu suất nhân viên sẽ bao gồm:</p>
            <ul>
              <li>📊 Doanh số theo nhân viên</li>
              <li>🎯 Đạt/không đạt KPI</li>
              <li>💰 Hoa hồng tính toán</li>
              <li>📈 Xu hướng hiệu suất</li>
              <li>🏆 Bảng xếp hạng</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Employee report placeholder loaded');
  } catch (error) {
    console.error('❌ Error loading employee report:', error);
    showError('Không thể tải báo cáo nhân viên');
  }
}