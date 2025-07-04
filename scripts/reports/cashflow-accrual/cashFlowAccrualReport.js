/**
 * Cash Flow vs Accrual Report Main Module
 * Main entry point for cash flow vs accrual comparison functionality
 */

import { CashFlowAccrualLoader } from './cashFlowAccrualLoader.js';

let cashFlowAccrualLoader = null;

/**
 * Load and initialize cash flow vs accrual comparison
 */
export async function loadCashFlowAccrualReport() {
    try {
        // console.log('⚖️ Loading Cash Flow vs Accrual Report...');
        
        // Cleanup previous instance if exists
        if (cashFlowAccrualLoader) {
            cashFlowAccrualLoader.destroy();
        }

        // Create new instance
        cashFlowAccrualLoader = new CashFlowAccrualLoader();
        
        // Load the HTML template first
        await loadCashFlowAccrualTemplate();
        
        // Initialize the comparison
        await cashFlowAccrualLoader.initialize();
        
        // console.log('✅ Cash Flow vs Accrual Report loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading Cash Flow vs Accrual Report:', error);
        showCashFlowAccrualError('Không thể tải module so sánh Cash Flow vs Accrual');
    }
}

/**
 * Load cash flow vs accrual HTML template
 */
async function loadCashFlowAccrualTemplate() {
    const container = document.getElementById('report-cashflow-accrual');
    if (!container) {
        throw new Error('Cash flow vs accrual report container not found');
    }
    
    try {
        const response = await fetch('./partials/tabs/report-pages/cashflow-accrual-report.html');
        if (!response.ok) {
            console.warn('⚠️ Cash flow vs accrual template not found, using fallback');
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        
        // console.log('📄 Cash flow vs accrual template loaded from file');
        
    } catch (error) {
        // console.log('📄 Using fallback cash flow vs accrual template');
        // Fallback template
        container.innerHTML = `
            <div class="cashflow-accrual-container">
                <div class="page-header">
                    <h2>⚖️ Cash Flow vs Chi phí phân bổ</h2>
                    <div class="header-actions">
                        <button class="btn-refresh" id="refresh-cashflow-data">
                            <i class="fas fa-sync-alt"></i> Làm mới
                        </button>
                        <button class="export-cashflow-btn" data-format="csv">
                            <i class="fas fa-download"></i> Xuất CSV
                        </button>
                    </div>
                </div>
                
                <div class="cashflow-loading" style="display: none;">
                    <div class="loading-spinner">🔄 Đang phân tích dữ liệu Cash Flow...</div>
                </div>
                
                <div class="cashflow-error" style="display: none;">
                    <div class="error-message">❌ Không thể tải dữ liệu Cash Flow</div>
                </div>

                <!-- Comparison Overview -->
                <div class="comparison-overview">
                    <div class="overview-cards">
                        <div class="overview-card cash-flow-card">
                            <div class="card-icon">💰</div>
                            <div class="card-content">
                                <h3>Cash Flow (Thực tế)</h3>
                                <div class="card-value" id="cash-flow-total">0 ₫</div>
                                <div class="card-description">Tiền thực tế ra vào</div>
                            </div>
                        </div>
                        
                        <div class="overview-card accrual-card">
                            <div class="card-icon">📊</div>
                            <div class="card-content">
                                <h3>Chi phí phân bổ</h3>
                                <div class="card-value" id="accrual-total">0 ₫</div>
                                <div class="card-description">Chi phí được phân bổ theo kỳ</div>
                            </div>
                        </div>
                        
                        <div class="overview-card difference-card">
                            <div class="card-icon">⚡</div>
                            <div class="card-content">
                                <h3>Chênh lệch</h3>
                                <div class="card-value" id="difference-total">0 ₫</div>
                                <div class="card-description" id="difference-percentage">0%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="comparison-charts-section">
                    <h3>📈 Biểu đồ so sánh</h3>
                    <div class="charts-grid">
                        <div class="chart-container">
                            <div class="chart-header">
                                <h4>📅 So sánh theo tháng</h4>
                            </div>
                            <canvas id="monthlyComparisonChart" width="400" height="250"></canvas>
                        </div>
                        <div class="chart-container">
                            <div class="chart-header">
                                <h4>🏷️ So sánh theo danh mục</h4>
                            </div>
                            <canvas id="categoryComparisonChart" width="400" height="250"></canvas>
                        </div>
                        <div class="chart-container">
                            <div class="chart-header">
                                <h4>📊 Dòng tiền tích lũy</h4>
                            </div>
                            <canvas id="cumulativeFlowChart" width="400" height="250"></canvas>
                        </div>
                        <div class="chart-container">
                            <div class="chart-header">
                                <h4>⚖️ Phân tích chênh lệch</h4>
                            </div>
                            <canvas id="differenceAnalysisChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Analysis Tables -->
                <div class="analysis-tables-section">
                    <h3>📋 Phân tích chi tiết</h3>
                    
                    <div class="table-section">
                        <h4>📅 Phân tích theo tháng</h4>
                        <div class="monthly-analysis-table-container">
                            <table class="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Tháng</th>
                                        <th>Cash Flow</th>
                                        <th>Chi phí phân bổ</th>
                                        <th>Chênh lệch</th>
                                        <th>Tỷ lệ (%)</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody id="monthly-analysis-tbody">
                                    <tr>
                                        <td colspan="6" style="text-align: center; padding: 20px;">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="table-section">
                        <h4>🏷️ Phân tích theo danh mục</h4>
                        <div class="category-analysis-table-container">
                            <table class="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Danh mục</th>
                                        <th>Cash Flow</th>
                                        <th>Chi phí phân bổ</th>
                                        <th>Chênh lệch</th>
                                        <th>Tỷ lệ (%)</th>
                                        <th>Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody id="category-analysis-tbody">
                                    <tr>
                                        <td colspan="6" style="text-align: center; padding: 20px;">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Insights Section -->
                <div class="insights-section">
                    <h3>💡 Phân tích và khuyến nghị</h3>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <div class="insight-header">
                                <h4>💰 Cash Flow Analysis</h4>
                            </div>
                            <div class="insight-content" id="cash-flow-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-header">
                                <h4>📊 Accrual Analysis</h4>
                            </div>
                            <div class="insight-content" id="accrual-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-header">
                                <h4>🎯 Khuyến nghị</h4>
                            </div>
                            <div class="insight-content" id="recommendations">
                                <!-- Recommendations will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter Controls -->
                <div class="filter-controls-section">
                    <h3>🔍 Bộ lọc</h3>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label>📅 Khoảng thời gian:</label>
                            <div class="date-range-inputs">
                                <input type="date" id="cashflow-start-date" class="cashflow-date-input">
                                <span>đến</span>
                                <input type="date" id="cashflow-end-date" class="cashflow-date-input">
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>🏷️ Danh mục:</label>
                            <div class="category-filter-options" id="category-filter-options">
                                <!-- Category checkboxes will be populated here -->
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>👁️ Chế độ xem:</label>
                            <select id="view-mode-selector" class="filter-select">
                                <option value="both">Cả hai phương pháp</option>
                                <option value="cashflow">Chỉ Cash Flow</option>
                                <option value="accrual">Chỉ Chi phí phân bổ</option>
                                <option value="difference">Chỉ Chênh lệch</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>📊 Mức độ chi tiết:</label>
                            <select id="granularity-selector" class="filter-select">
                                <option value="monthly">Theo tháng</option>
                                <option value="weekly">Theo tuần</option>
                                <option value="daily">Theo ngày</option>
                                <option value="quarterly">Theo quý</option>
                            </select>
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="btn-apply-filters" id="apply-cashflow-filters">
                            <i class="fas fa-filter"></i> Áp dụng bộ lọc
                        </button>
                        <button class="btn-reset-filters" id="reset-cashflow-filters">
                            <i class="fas fa-undo"></i> Đặt lại
                        </button>
                    </div>
                </div>

                <!-- Allocation Details -->
                <div class="allocation-details-section">
                    <h3>📋 Chi tiết phân bổ</h3>
                    <div class="allocation-details-content">
                        <div class="allocation-group">
                            <h4>💳 Chi phí lớn được phân bổ</h4>
                            <div class="large-expenses-container" id="large-expenses-container">
                                <!-- Large expenses will be populated here -->
                            </div>
                        </div>
                        <div class="allocation-group">
                            <h4>🔄 Chi phí định kỳ</h4>
                            <div class="recurring-allocations-container" id="recurring-allocations-container">
                                <!-- Recurring allocations will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Show cash flow vs accrual error
 */
function showCashFlowAccrualError(message) {
    const container = document.getElementById('report-cashflow-accrual');
    if (container) {
        container.innerHTML = `
            <div class="cashflow-accrual-error-container">
                <div class="error-content">
                    <h3>⚠️ Lỗi tải Cash Flow vs Accrual</h3>
                    <p>${message}</p>
                    <button onclick="window.loadCashFlowAccrualReport && window.loadCashFlowAccrualReport()" class="btn btn-primary">
                        Thử lại
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Initialize cash flow vs accrual comparison
 */
export async function initCashFlowAccrualReport() {
    try {
        // console.log('⚖️ Initializing Cash Flow vs Accrual Report...');
        await loadCashFlowAccrualReport();
    } catch (error) {
        console.error('❌ Failed to initialize Cash Flow vs Accrual Report:', error);
    }
}

/**
 * Cleanup cash flow vs accrual comparison
 */
export function cleanupCashFlowAccrualReport() {
    if (cashFlowAccrualLoader) {
        cashFlowAccrualLoader.destroy();
        cashFlowAccrualLoader = null;
    }
    console.log('🧹 Cash Flow vs Accrual Report cleaned up');
}

// Make functions available globally
window.loadCashFlowAccrualReport = loadCashFlowAccrualReport;
window.initCashFlowAccrualReport = initCashFlowAccrualReport;
window.cleanupCashFlowAccrualReport = cleanupCashFlowAccrualReport;

// Export for module use
export default loadCashFlowAccrualReport;