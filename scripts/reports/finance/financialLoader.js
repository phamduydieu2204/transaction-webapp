/**
 * Financial Management Report Loader
 * Handles initialization and UI management for financial reporting
 */

import { FinancialCore } from './financialCore.js';
import { FinancialCharts } from './financialCharts.js';

export class FinancialLoader {
    constructor() {
        this.core = null;
        this.charts = null;
        this.isInitialized = false;
        this.currentPeriod = 'month';
        this.selectedAccounts = [];
        this.filters = {
            dateRange: null,
            accountTypes: [],
            categories: []
        };
    }

    /**
     * Initialize the financial management module
     */
    async initialize() {
        try {
            console.log('Initializing Financial Management...');
            
            this.core = new FinancialCore();
            this.charts = new FinancialCharts();
            
            await this.loadData();
            this.setupEventListeners();
            this.renderDashboard();
            
            this.isInitialized = true;
            // console.log('✅ Financial Management initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Financial Management:', error);
            this.showError('Không thể khởi tạo module quản lý tài chính');
        }
    }

    /**
     * Load financial data
     */
    async loadData() {
        try {
            this.showLoading(true);
            
            await this.core.loadData();
            console.log('Financial data loaded successfully');
            
        } catch (error) {
            console.error('Error loading financial data:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Setup event listeners for financial management
     */
    setupEventListeners() {
        // Period selector
        document.addEventListener('change', (e) => {
            if (e.target.id === 'financial-period-selector') {
                this.currentPeriod = e.target.value;
                this.updateDashboard();
            }
        });

        // Date range filter
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('financial-date-input')) {
                this.updateDateFilter();
            }
        });

        // Account type filters
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('account-type-checkbox')) {
                this.updateAccountTypeFilter();
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-financial-btn')) {
                const format = e.target.dataset.format;
                this.exportData(format);
            }
        });

        // Refresh button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refresh-financial-data') {
                this.refreshData();
            }
        });

        // Chart interaction
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-toggle-btn')) {
                this.toggleChartVisibility(e.target.dataset.chart);
            }
        });
    }

    /**
     * Render the complete financial dashboard
     */
    renderDashboard() {
        try {
            console.log('Rendering financial dashboard...');
            
            this.renderKPICards();
            this.renderFinancialCharts();
            this.renderAccountsTable();
            this.renderProfitLossStatement();
            this.renderBudgetPlanning();
            
            // console.log('✅ Financial dashboard rendered');
            
        } catch (error) {
            console.error('Error rendering financial dashboard:', error);
            this.showError('Không thể hiển thị dashboard tài chính');
        }
    }

    /**
     * Render KPI cards
     */
    renderKPICards() {
        const kpiContainer = document.querySelector('.financial-kpi-dashboard');
        if (!kpiContainer) return;

        const metrics = this.core.calculateFinancialMetrics();
        
        const kpiHTML = `
            <div class="kpi-card revenue-card">
                <div class="kpi-icon">💰</div>
                <div class="kpi-content">
                    <h3>Tổng Doanh Thu</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.totalRevenue)}</div>
                    <div class="kpi-change ${metrics.revenueGrowth >= 0 ? 'positive' : 'negative'}">
                        ${metrics.revenueGrowth >= 0 ? '↗' : '↘'} ${Math.abs(metrics.revenueGrowth).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="kpi-card expense-card">
                <div class="kpi-icon">💸</div>
                <div class="kpi-content">
                    <h3>Tổng Chi Phí</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.totalExpenses)}</div>
                    <div class="kpi-change ${metrics.expenseGrowth <= 0 ? 'positive' : 'negative'}">
                        ${metrics.expenseGrowth >= 0 ? '↗' : '↘'} ${Math.abs(metrics.expenseGrowth).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="kpi-card profit-card">
                <div class="kpi-icon">📊</div>
                <div class="kpi-content">
                    <h3>Lợi Nhuận Ròng</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.netProfit)}</div>
                    <div class="kpi-change ${metrics.profitMargin >= 0 ? 'positive' : 'negative'}">
                        Tỷ suất: ${metrics.profitMargin.toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="kpi-card cashflow-card">
                <div class="kpi-icon">🔄</div>
                <div class="kpi-content">
                    <h3>Dòng Tiền</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.cashFlow)}</div>
                    <div class="kpi-change">
                        Runway: ${metrics.cashRunway} tháng
                    </div>
                </div>
            </div>
        `;
        
        kpiContainer.innerHTML = kpiHTML;
    }

    /**
     * Render financial charts
     */
    renderFinancialCharts() {
        const cashFlowData = this.core.calculateCashFlow();
        const profitLossData = this.core.calculateProfitLoss();
        const budgetData = this.core.calculateBudgetComparison();
        
        // Render charts
        this.charts.renderCashFlowChart(cashFlowData);
        this.charts.renderProfitLossChart(profitLossData);
        this.charts.renderBudgetChart(budgetData);
        this.charts.renderAccountBalanceChart(this.core.getAccountBalances());
        this.charts.renderExpenseCategoryChart(this.core.getExpensesByCategory());
        this.charts.renderRevenueTrendChart(this.core.getRevenueTrend());
    }

    /**
     * Render accounts table
     */
    renderAccountsTable() {
        const tableContainer = document.querySelector('.accounts-table-container');
        if (!tableContainer) return;

        const accounts = this.core.getAccountBalances();
        
        let tableHTML = `
            <table class="financial-table">
                <thead>
                    <tr>
                        <th>Tài Khoản</th>
                        <th>Loại</th>
                        <th>Số Dư</th>
                        <th>Thay Đổi</th>
                        <th>Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        accounts.forEach(account => {
            const changeClass = account.change >= 0 ? 'positive' : 'negative';
            const statusClass = account.balance >= 0 ? 'active' : 'warning';
            
            tableHTML += `
                <tr>
                    <td>${account.name}</td>
                    <td>${account.type}</td>
                    <td>${this.formatCurrency(account.balance)}</td>
                    <td class="${changeClass}">
                        ${account.change >= 0 ? '+' : ''}${this.formatCurrency(account.change)}
                    </td>
                    <td><span class="status ${statusClass}">${account.status}</span></td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        tableContainer.innerHTML = tableHTML;
    }

    /**
     * Render profit & loss statement
     */
    renderProfitLossStatement() {
        const container = document.querySelector('.profit-loss-statement');
        if (!container) return;

        const pnl = this.core.calculateProfitLoss();
        
        const pnlHTML = `
            <div class="pnl-section">
                <h4>Doanh Thu</h4>
                <div class="pnl-line">
                    <span>Doanh thu bán hàng</span>
                    <span>${this.formatCurrency(pnl.revenue.sales)}</span>
                </div>
                <div class="pnl-line">
                    <span>Doanh thu dịch vụ</span>
                    <span>${this.formatCurrency(pnl.revenue.services)}</span>
                </div>
                <div class="pnl-total">
                    <span>Tổng Doanh Thu</span>
                    <span>${this.formatCurrency(pnl.revenue.total)}</span>
                </div>
            </div>
            
            <div class="pnl-section">
                <h4>Chi Phí</h4>
                <div class="pnl-line">
                    <span>Chi phí vận hành</span>
                    <span>${this.formatCurrency(pnl.expenses.operating)}</span>
                </div>
                <div class="pnl-line">
                    <span>Chi phí marketing</span>
                    <span>${this.formatCurrency(pnl.expenses.marketing)}</span>
                </div>
                <div class="pnl-line">
                    <span>Chi phí nhân sự</span>
                    <span>${this.formatCurrency(pnl.expenses.personnel)}</span>
                </div>
                <div class="pnl-total">
                    <span>Tổng Chi Phí</span>
                    <span>${this.formatCurrency(pnl.expenses.total)}</span>
                </div>
            </div>
            
            <div class="pnl-section">
                <div class="pnl-total profit">
                    <span>Lợi Nhuận Ròng</span>
                    <span>${this.formatCurrency(pnl.netProfit)}</span>
                </div>
            </div>
        `;
        
        container.innerHTML = pnlHTML;
    }

    /**
     * Render budget planning section
     */
    renderBudgetPlanning() {
        const container = document.querySelector('.budget-planning-section');
        if (!container) return;

        const budget = this.core.calculateBudgetComparison();
        
        let budgetHTML = '<div class="budget-items">';
        
        budget.forEach(item => {
            const varianceClass = item.variance >= 0 ? 'positive' : 'negative';
            const progressPercentage = Math.min((item.actual / item.budget) * 100, 100);
            
            budgetHTML += `
                <div class="budget-item">
                    <div class="budget-header">
                        <span class="budget-category">${item.category}</span>
                        <span class="budget-variance ${varianceClass}">
                            ${item.variance >= 0 ? '+' : ''}${this.formatCurrency(item.variance)}
                        </span>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="budget-amounts">
                            <span>Thực tế: ${this.formatCurrency(item.actual)}</span>
                            <span>Ngân sách: ${this.formatCurrency(item.budget)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        budgetHTML += '</div>';
        container.innerHTML = budgetHTML;
    }

    /**
     * Update dashboard based on current filters
     */
    updateDashboard() {
        if (!this.isInitialized) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            this.renderDashboard();
            this.showLoading(false);
        }, 500);
    }

    /**
     * Update date filter
     */
    updateDateFilter() {
        const startDate = document.querySelector('#financial-start-date')?.value;
        const endDate = document.querySelector('#financial-end-date')?.value;
        
        if (startDate && endDate) {
            this.filters.dateRange = { startDate, endDate };
            this.updateDashboard();
        }
    }

    /**
     * Update account type filter
     */
    updateAccountTypeFilter() {
        const checkboxes = document.querySelectorAll('.account-type-checkbox:checked');
        this.filters.accountTypes = Array.from(checkboxes).map(cb => cb.value);
        this.updateDashboard();
    }

    /**
     * Export financial data
     */
    exportData(format) {
        try {
            const data = this.core.getExportData();
            
            if (format === 'csv') {
                this.exportToCSV(data);
            } else if (format === 'excel') {
                this.exportToExcel(data);
            }
            
            this.showSuccess(`Xuất dữ liệu ${format.toUpperCase()} thành công`);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Không thể xuất dữ liệu');
        }
    }

    /**
     * Export to CSV
     */
    exportToCSV(data) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        window.URL.revokeObjectURL(url);
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [headers, ...rows].join('\n');
    }

    /**
     * Toggle chart visibility
     */
    toggleChartVisibility(chartId) {
        const chartContainer = document.querySelector(`#${chartId}`);
        if (chartContainer) {
            chartContainer.style.display = 
                chartContainer.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Refresh financial data
     */
    async refreshData() {
        try {
            this.showLoading(true);
            await this.loadData();
            this.renderDashboard();
            this.showSuccess('Đã cập nhật dữ liệu tài chính');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showError('Không thể cập nhật dữ liệu');
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Show loading state
     */
    showLoading(show) {
        const loader = document.querySelector('.financial-loading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Integration with existing modal system
        if (window.showResultModalModern) {
            window.showResultModalModern(message, 'success');
        } else {
            // console.log('✅', message);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Integration with existing modal system
        if (window.showResultModalModern) {
            window.showResultModalModern(message, 'error');
        } else {
            console.error('❌', message);
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        if (this.charts) {
            this.charts.destroy();
        }
        this.isInitialized = false;
        console.log('Financial Management destroyed');
    }
}

// Global instance for easy access
window.FinancialLoader = FinancialLoader;