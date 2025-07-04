/**
 * Financial Management Report Main Module
 * Main entry point for financial management functionality
 */

import { FinancialLoader } from './financialLoader.js';

let financialLoader = null;

/**
 * Load and initialize financial management
 */
export async function loadFinancialManagement() {
    try {
        console.log('🏦 Loading Financial Management...');
        
        // Cleanup previous instance if exists
        if (financialLoader) {
            financialLoader.destroy();
        }

        // Create new instance
        financialLoader = new FinancialLoader();
        
        // Load the HTML template first
        await loadFinancialTemplate();
        
        // Initialize the financial management
        await financialLoader.initialize();
        
        // console.log('✅ Financial Management loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading Financial Management:', error);
        showFinancialError('Không thể tải module quản lý tài chính');
    }
}

/**
 * Load financial management HTML template
 */
async function loadFinancialTemplate() {
    const container = document.getElementById('report-finance');
    if (!container) {
        throw new Error('Financial report container not found');
    }
    
    try {
        const response = await fetch('./partials/tabs/report-pages/financial-management.html');
        if (!response.ok) {
            console.warn('⚠️ Financial template not found, using fallback');
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        
        // console.log('📄 Financial management template loaded from file');
        
    } catch (error) {
        // console.log('📄 Using fallback financial template');
        // Always use fallback template for now
        container.innerHTML = `
            <div class="financial-management-container">
                <div class="page-header">
                    <h2>🏦 Quản lý tài chính</h2>
                    <div class="header-actions">
                        <button class="btn-refresh" id="refresh-financial-data">
                            <i class="fas fa-sync-alt"></i> Làm mới
                        </button>
                        <button class="export-financial-btn" data-format="csv">
                            <i class="fas fa-download"></i> Xuất CSV
                        </button>
                    </div>
                </div>
                
                <div class="financial-loading" style="display: none;">
                    <div class="loading-spinner">🔄 Đang tải dữ liệu tài chính...</div>
                </div>
                
                <div class="financial-error" style="display: none;">
                    <div class="error-message">❌ Không thể tải dữ liệu tài chính</div>
                </div>
                
                <div class="financial-content">
                    <!-- KPI Dashboard -->
                    <div class="financial-kpi-dashboard">
                        <!-- KPI cards will be rendered here -->
                    </div>
                    
                    <!-- Charts Section -->
                    <div class="financial-overview-section">
                        <h3>📊 Biểu đồ tài chính</h3>
                        <div class="charts-grid">
                            <div class="chart-container">
                                <h4>💰 Dòng tiền</h4>
                                <canvas id="cashFlowChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>📈 Lãi lỗ</h4>
                                <canvas id="profitLossChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>📊 Ngân sách vs Thực tế</h4>
                                <canvas id="budgetChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>💳 Số dư tài khoản</h4>
                                <canvas id="accountBalanceChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>🏷️ Chi phí theo danh mục</h4>
                                <canvas id="expenseCategoryChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>📈 Xu hướng doanh thu</h4>
                                <canvas id="revenueTrendChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Accounts Table -->
                    <div class="accounts-section">
                        <h3>💳 Tài khoản</h3>
                        <div class="accounts-table-container">
                            <!-- Table will be rendered here -->
                        </div>
                    </div>
                    
                    <!-- P&L Statement -->
                    <div class="profit-loss-section">
                        <h3>📈 Báo cáo lãi lỗ</h3>
                        <div class="profit-loss-statement">
                            <!-- P&L will be rendered here -->
                        </div>
                    </div>
                    
                    <!-- Budget Planning -->
                    <div class="budget-section">
                        <h3>📋 Kế hoạch ngân sách</h3>
                        <div class="budget-planning-section">
                            <!-- Budget planning will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Show financial management error
 */
function showFinancialError(message) {
    const container = document.getElementById('report-finance');
    if (container) {
        container.innerHTML = `
            <div class="financial-error-container">
                <div class="error-content">
                    <h3>⚠️ Lỗi tải quản lý tài chính</h3>
                    <p>${message}</p>
                    <button onclick="window.loadFinancialManagement && window.loadFinancialManagement()" class="btn btn-primary">
                        Thử lại
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Initialize financial management 
 */
export async function initFinancialManagement() {
    try {
        console.log('🏦 Initializing Financial Management...');
        await loadFinancialManagement();
    } catch (error) {
        console.error('❌ Failed to initialize Financial Management:', error);
    }
}

/**
 * Cleanup financial management
 */
export function cleanupFinancialManagement() {
    if (financialLoader) {
        financialLoader.destroy();
        financialLoader = null;
    }
    console.log('🧹 Financial Management cleaned up');
}

// Make functions available globally
window.loadFinancialManagement = loadFinancialManagement;
window.initFinancialManagement = initFinancialManagement;
window.cleanupFinancialManagement = cleanupFinancialManagement;

// Export for module use
export default loadFinancialManagement;