/**
 * Software Management Report Module
 * Handles loading and rendering software account management report
 */

import { softwareManagement } from './softwareManagementCore.js';
import { formatRevenue, formatCurrency } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { normalizeDate } from '../../statisticsCore.js';
import { normalizeTransaction } from '../../core/dataMapping.js';

// Software management instance
let softwareManagementInstance = null;

/**
 * Load and render software management report
 * @param {Object} options - Report options
 * @param {Object} options.dateRange - Date range filter
 * @param {string} options.period - Period filter
 */
export async function loadSoftwareManagement(options = {}) {
    console.log('💻 Loading software management report', options);
    
    try {
        // Get container
        const container = document.getElementById('report-software');
        if (!container) {
            throw new Error('Software report container not found');
        }
        
        // Load template
        await loadSoftwareTemplate(container);
        
        // Initialize software management if not already done
        if (!softwareManagementInstance) {
            softwareManagementInstance = softwareManagement;
        }
        
        // Initialize with data
        await softwareManagementInstance.initialize();
        
        console.log('✅ Software management report loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading software management report:', error);
        
        // Show error message
        const container = document.getElementById('report-software');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>❌ Lỗi tải báo cáo</h3>
                    <p>Không thể tải báo cáo quản lý phần mềm: ${error.message}</p>
                    <button onclick="window.loadReport('software')" class="retry-btn">Thử lại</button>
                </div>
            `;
        }
    }
}

/**
 * Load software management template
 * @param {HTMLElement} container - Container element
 */
async function loadSoftwareTemplate(container) {
    try {
        // Try to load from partials first
        const response = await fetch('/transaction-webapp/partials/tabs/report-pages/software-management.html');
        
        if (response.ok) {
            const templateContent = await response.text();
            container.innerHTML = templateContent;
        } else {
            // If template file doesn't exist, create inline template
            container.innerHTML = createInlineSoftwareTemplate();
        }
        
    } catch (error) {
        console.warn('Could not load software template file, using inline template');
        container.innerHTML = createInlineSoftwareTemplate();
    }
}

/**
 * Create inline software management template
 * @returns {string} HTML template string
 */
function createInlineSoftwareTemplate() {
    return `
        <div class="software-management-container">
            <!-- KPI Cards -->
            <div class="software-kpi-cards">
                <!-- KPI cards will be rendered by JavaScript -->
            </div>
            
            <!-- License Status Overview -->
            <div class="license-status-overview">
                <h3>📊 Trạng thái giấy phép</h3>
                <div class="license-status-cards">
                    <!-- Status cards will be rendered by JavaScript -->
                </div>
            </div>
            
            <!-- Analytics Charts -->
            <div class="software-analytics">
                <div class="chart-container">
                    <h3>📈 xu hướng sử dụng</h3>
                    <div class="chart-wrapper">
                        <canvas id="usageTrendChart"></canvas>
                    </div>
                </div>
                <div class="chart-container">
                    <h3>📊 Phân bổ sử dụng</h3>
                    <div class="chart-wrapper">
                        <canvas id="utilizationChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Software Data Table -->
            <div class="software-data-section">
                <div class="software-data-header">
                    <h3 class="software-data-title">💾 Danh sách phần mềm</h3>
                    <div class="software-data-controls">
                        <input type="text" id="softwareSearchInput" placeholder="Tìm kiếm phần mềm..." class="software-search-input">
                        <select id="categoryFilter" class="software-filter-select">
                            <option value="all">Tất cả loại</option>
                            <option value="productivity">Productivity</option>
                            <option value="design">Design</option>
                            <option value="communication">Communication</option>
                            <option value="finance">Finance</option>
                            <option value="other">Other</option>
                        </select>
                        <select id="statusFilter" class="software-filter-select">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Tạm dừng</option>
                            <option value="expired">Đã hết hạn</option>
                        </select>
                        <button id="exportSoftwareData" class="software-action-btn">📄 Xuất Excel</button>
                        <button id="refreshSoftwareData" class="software-action-btn secondary">🔄 Làm mới</button>
                    </div>
                </div>
                
                <div class="software-table-container">
                    <table class="software-table">
                        <thead>
                            <tr>
                                <th>Phần mềm</th>
                                <th>Loại</th>
                                <th>Giấy phép</th>
                                <th>Sử dụng</th>
                                <th>Chi phí</th>
                                <th>Gia hạn</th>
                                <th>Rủi ro</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="softwareTableBody">
                            <!-- Table rows will be rendered by JavaScript -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination-container">
                    <!-- Pagination will be rendered by JavaScript -->
                </div>
            </div>
            
            <!-- License Alerts -->
            <div class="license-alerts">
                <div class="license-alerts-header">
                    <h3 class="license-alerts-title">🚨 Cảnh báo giấy phép</h3>
                </div>
                <div class="license-alerts-list">
                    <!-- Alerts will be rendered by JavaScript -->
                </div>
            </div>
            
            <!-- License Management Tools -->
            <div class="license-management-tools">
                <div class="management-tool-card">
                    <div class="tool-icon">🔄</div>
                    <div class="tool-title">Gia hạn tự động</div>
                    <div class="tool-description">Thiết lập gia hạn tự động cho các phần mềm quan trọng</div>
                    <button class="tool-action">Cấu hình</button>
                </div>
                
                <div class="management-tool-card">
                    <div class="tool-icon">📊</div>
                    <div class="tool-title">Tối ưu hóa</div>
                    <div class="tool-description">Phân tích và tối ưu hóa việc sử dụng phần mềm</div>
                    <button class="tool-action">Phân tích</button>
                </div>
                
                <div class="management-tool-card">
                    <div class="tool-icon">📈</div>
                    <div class="tool-title">Báo cáo chi tiết</div>
                    <div class="tool-description">Tạo báo cáo chi tiết về sử dụng và chi phí</div>
                    <button class="tool-action">Tạo báo cáo</button>
                </div>
                
                <div class="management-tool-card">
                    <div class="tool-icon">⚖️</div>
                    <div class="tool-title">Tuân thủ</div>
                    <div class="tool-description">Kiểm tra tuân thủ giấy phép và quy định</div>
                    <button class="tool-action">Kiểm tra</button>
                </div>
            </div>
            
            <!-- Software Performance Dashboard -->
            <div class="software-performance-dashboard">
                <h3>📊 Bảng điều khiển hiệu suất</h3>
                <div class="performance-metrics">
                    <!-- Performance metrics will be rendered by JavaScript -->
                </div>
            </div>
        </div>
        
        <!-- Load Chart.js if not already loaded -->
        <script>
            if (typeof Chart === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                document.head.appendChild(script);
            }
        </script>
    `;
}


/**
 * Refresh software management data
 */
export async function refreshSoftwareManagement() {
    if (softwareManagementInstance) {
        await softwareManagementInstance.refresh();
    }
}

/**
 * Export software management data
 */
export function exportSoftwareManagement() {
    if (softwareManagementInstance) {
        softwareManagementInstance.exportToExcel();
    }
}

// Make functions available globally
window.loadSoftwareManagement = loadSoftwareManagement;
window.refreshSoftwareManagement = refreshSoftwareManagement;
window.exportSoftwareManagement = exportSoftwareManagement;