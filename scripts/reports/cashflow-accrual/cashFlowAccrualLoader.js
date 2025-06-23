/**
 * Cash Flow vs Accrual Report Loader
 * Handles initialization and UI management for cash flow vs accrual comparison
 */

import { CashFlowAccrualCore } from './cashFlowAccrualCore.js';
import { CashFlowAccrualCharts } from './cashFlowAccrualCharts.js';

export class CashFlowAccrualLoader {
    constructor() {
        this.core = null;
        this.charts = null;
        this.isInitialized = false;
        this.filters = {
            dateRange: null,
            categories: [],
            viewMode: 'both',
            granularity: 'monthly'
        };
    }

    /**
     * Initialize the cash flow vs accrual module
     */
    async initialize() {
        try {
            
            this.core = new CashFlowAccrualCore();
            this.charts = new CashFlowAccrualCharts();
            
            await this.loadData();
            this.setupEventListeners();
            this.renderDashboard();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Cash Flow vs Accrual comparison:', error);
            this.showError('Không thể khởi tạo module so sánh Cash Flow vs Accrual');
        }
    }

    /**
     * Load cash flow vs accrual data
     */
    async loadData() {
        try {
            this.showLoading(true);
            
            await this.core.loadData();
            console.log('Cash flow vs accrual data loaded successfully');
            
        } catch (error) {
            console.error('Error loading cash flow vs accrual data:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refresh-cashflow-data') {
                this.refreshData();
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-cashflow-btn')) {
                const format = e.target.dataset.format;
                this.exportData(format);
            }
        });

        // Filter controls
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('cashflow-date-input')) {
                this.updateDateFilter();
            }
            if (e.target.id === 'view-mode-selector') {
                this.filters.viewMode = e.target.value;
                this.updateDashboard();
            }
            if (e.target.id === 'granularity-selector') {
                this.filters.granularity = e.target.value;
                this.updateDashboard();
            }
        });

        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'apply-cashflow-filters') {
                this.applyFilters();
            }
            if (e.target.id === 'reset-cashflow-filters') {
                this.resetFilters();
            }
        });

        // Chart interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-toggle-btn')) {
                const chartId = e.target.dataset.chart;
                this.charts.toggleChart(chartId);
            }
        });
    }

    /**
     * Render the complete dashboard
     */
    renderDashboard() {
        try {
            console.log('Rendering cash flow vs accrual dashboard...');
            
            this.renderOverviewCards();
            this.renderCharts();
            this.renderAnalysisTables();
            this.renderInsights();
            this.renderAllocationDetails();
            this.renderFilterOptions();
            
            
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            this.showError('Không thể hiển thị dashboard');
        }
    }

    /**
     * Render overview cards
     */
    renderOverviewCards() {
        const overview = this.core.getComparisonOverview();
        if (!overview) return;

        // Update cash flow total
        const cashFlowElement = document.getElementById('cash-flow-total');
        if (cashFlowElement) {
            cashFlowElement.textContent = this.formatCurrency(overview.cashFlowTotal);
        }

        // Update accrual total
        const accrualElement = document.getElementById('accrual-total');
        if (accrualElement) {
            accrualElement.textContent = this.formatCurrency(overview.accrualTotal);
        }

        // Update difference
        const differenceElement = document.getElementById('difference-total');
        const percentageElement = document.getElementById('difference-percentage');
        if (differenceElement && percentageElement) {
            differenceElement.textContent = this.formatCurrency(overview.difference);
            percentageElement.textContent = `${overview.percentDifference.toFixed(1)}%`;
            
            // Update colors based on difference
            const card = differenceElement.closest('.overview-card');
            if (card) {
                card.className = `overview-card difference-card ${overview.status}`;
            }
        }
    }

    /**
     * Render charts
     */
    renderCharts() {
        this.charts.updateCharts(this.core);
    }

    /**
     * Render analysis tables
     */
    renderAnalysisTables() {
        this.renderMonthlyAnalysisTable();
        this.renderCategoryAnalysisTable();
    }

    /**
     * Render monthly analysis table
     */
    renderMonthlyAnalysisTable() {
        const tbody = document.getElementById('monthly-analysis-tbody');
        if (!tbody) return;

        const monthlyData = this.core.getMonthlyAnalysisTableData();
        
        let html = '';
        monthlyData.forEach(row => {
            html += `
                <tr>
                    <td>${row.month}</td>
                    <td>${this.formatCurrency(row.cashFlow)}</td>
                    <td>${this.formatCurrency(row.accrual)}</td>
                    <td class="${row.difference >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(row.difference)}
                    </td>
                    <td>${row.percentDifference.toFixed(1)}%</td>
                    <td><span class="status ${row.status}">${this.getStatusText(row.status)}</span></td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    /**
     * Render category analysis table
     */
    renderCategoryAnalysisTable() {
        const tbody = document.getElementById('category-analysis-tbody');
        if (!tbody) return;

        const categoryData = this.core.getCategoryAnalysisTableData();
        
        let html = '';
        categoryData.forEach(row => {
            html += `
                <tr>
                    <td>${row.category}</td>
                    <td>${this.formatCurrency(row.cashFlow)}</td>
                    <td>${this.formatCurrency(row.accrual)}</td>
                    <td class="${row.difference >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(row.difference)}
                    </td>
                    <td>${row.percentDifference.toFixed(1)}%</td>
                    <td>${row.note}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    /**
     * Render insights
     */
    renderInsights() {
        if (!this.core.analysisData) return;

        const { insights } = this.core.analysisData;
        
        // Cash flow insights
        this.renderInsightSection('cash-flow-insights', insights.cashFlowInsights);
        
        // Accrual insights
        this.renderInsightSection('accrual-insights', insights.accrualInsights);
        
        // Recommendations
        this.renderRecommendations();
    }

    /**
     * Render insight section
     */
    renderInsightSection(containerId, insightList) {
        const container = document.getElementById(containerId);
        if (!container || !insightList) return;

        let html = '';
        insightList.forEach(insight => {
            html += `
                <div class="insight-item ${insight.type}">
                    <div class="insight-icon">${this.getInsightIcon(insight.type)}</div>
                    <div class="insight-text">
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-message">${insight.message}</div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Render recommendations
     */
    renderRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container || !this.core.analysisData) return;

        const { recommendations } = this.core.analysisData;
        
        let html = '';
        recommendations.forEach(rec => {
            html += `
                <div class="insight-item ${rec.type}">
                    <div class="insight-icon">${this.getRecommendationIcon(rec.priority)}</div>
                    <div class="insight-text">
                        <div class="insight-title">${rec.title}</div>
                        <div class="insight-message">${rec.message}</div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Render allocation details
     */
    renderAllocationDetails() {
        this.renderLargeExpenses();
        this.renderRecurringAllocations();
    }

    /**
     * Render large expenses
     */
    renderLargeExpenses() {
        const container = document.getElementById('large-expenses-container');
        if (!container) return;

        const largeExpenses = this.core.getLargeExpenses();
        
        let html = '';
        largeExpenses.forEach(expense => {
            html += `
                <div class="allocation-item">
                    <div class="allocation-info">
                        <div class="allocation-description">${expense.description}</div>
                        <div class="allocation-meta">
                            ${new Date(expense.date).toLocaleDateString('vi-VN')} • 
                            ${expense.category} • 
                            ${this.getAllocationMethodText(expense.allocationMethod)}
                        </div>
                    </div>
                    <div class="allocation-amount">${this.formatCurrency(expense.amount)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Render recurring allocations
     */
    renderRecurringAllocations() {
        const container = document.getElementById('recurring-allocations-container');
        if (!container) return;

        const recurring = this.core.getRecurringAllocations();
        
        let html = '';
        recurring.forEach(allocation => {
            html += `
                <div class="allocation-item">
                    <div class="allocation-info">
                        <div class="allocation-description">${allocation.category}</div>
                        <div class="allocation-meta">
                            Xuất hiện ${allocation.frequency} lần • 
                            Loại: ${allocation.type}
                        </div>
                    </div>
                    <div class="allocation-amount">${this.formatCurrency(allocation.avgMonthlyAmount)}/tháng</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Render filter options
     */
    renderFilterOptions() {
        // Populate category filter options
        const categoryContainer = document.getElementById('category-filter-options');
        if (categoryContainer && this.core.expenseData) {
            const categories = [...new Set(this.core.expenseData.map(expense => 
                expense.danhMuc || expense.category
            ))].filter(cat => cat);

            let html = '';
            categories.forEach(category => {
                html += `
                    <div class="category-checkbox-wrapper">
                        <input type="checkbox" id="cat-${category}" value="${category}" class="category-checkbox">
                        <label for="cat-${category}">${category}</label>
                    </div>
                `;
            });
            
            categoryContainer.innerHTML = html;
        }
    }

    /**
     * Update dashboard based on filters
     */
    updateDashboard() {
        if (!this.isInitialized) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            this.core.applyFilters(this.filters);
            this.renderDashboard();
            this.showLoading(false);
        }, 500);
    }

    /**
     * Update date filter
     */
    updateDateFilter() {
        const startDate = document.querySelector('#cashflow-start-date')?.value;
        const endDate = document.querySelector('#cashflow-end-date')?.value;
        
        if (startDate && endDate) {
            this.filters.dateRange = { start: startDate, end: endDate };
        }
    }

    /**
     * Apply filters
     */
    applyFilters() {
        this.updateDateFilter();
        
        // Get selected categories
        const categoryCheckboxes = document.querySelectorAll('.category-checkbox:checked');
        this.filters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
        
        this.updateDashboard();
        this.showSuccess('Đã áp dụng bộ lọc');
    }

    /**
     * Reset filters
     */
    resetFilters() {
        this.filters = {
            dateRange: null,
            categories: [],
            viewMode: 'both',
            granularity: 'monthly'
        };
        
        // Reset form elements
        document.querySelector('#cashflow-start-date').value = '';
        document.querySelector('#cashflow-end-date').value = '';
        document.querySelector('#view-mode-selector').value = 'both';
        document.querySelector('#granularity-selector').value = 'monthly';
        
        document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
        
        this.updateDashboard();
        this.showSuccess('Đã đặt lại bộ lọc');
    }

    /**
     * Export data
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
        const csvData = [
            // Monthly data
            ['PHÂN TÍCH THEO THÁNG'],
            ['Tháng', 'Cash Flow', 'Chi phí phân bổ', 'Chênh lệch', 'Tỷ lệ %'],
            ...data.monthly.map(row => [
                row.month,
                row.cashFlow,
                row.accrual,
                row.difference,
                row.percentDifference
            ]),
            [''],
            // Category data
            ['PHÂN TÍCH THEO DANH MỤC'],
            ['Danh mục', 'Cash Flow', 'Chi phí phân bổ', 'Chênh lệch', 'Tỷ lệ %'],
            ...data.category.map(row => [
                row.category,
                row.cashFlow,
                row.accrual,
                row.difference,
                row.percentDifference
            ])
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashflow-vs-accrual-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        window.URL.revokeObjectURL(url);
    }

    /**
     * Refresh data
     */
    async refreshData() {
        try {
            this.showLoading(true);
            await this.loadData();
            this.renderDashboard();
            this.showSuccess('Đã cập nhật dữ liệu');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showError('Không thể cập nhật dữ liệu');
        }
    }

    /**
     * Helper methods
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    getStatusText(status) {
        const statusTexts = {
            excellent: 'Tuyệt vời',
            good: 'Tốt',
            warning: 'Cảnh báo',
            critical: 'Nghiêm trọng'
        };
        return statusTexts[status] || status;
    }

    getInsightIcon(type) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            success: '✅'
        };
        return icons[type] || 'ℹ️';
    }

    getRecommendationIcon(priority) {
        const icons = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        return icons[priority] || '🟡';
    }

    getAllocationMethodText(method) {
        const methods = {
            immediate: 'Ngay lập tức',
            monthly: 'Hàng tháng',
            annual: 'Hàng năm'
        };
        return methods[method] || method;
    }

    /**
     * Show loading state
     */
    showLoading(show) {
        const loader = document.querySelector('.cashflow-loading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        if (window.showResultModalModern) {
            window.showResultModalModern(message, 'success');
        } else {
        }
    }

    /**
     * Show error message
     */
    showError(message) {
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
        console.log('Cash Flow vs Accrual comparison destroyed');
    }
}

// Global instance for easy access
window.CashFlowAccrualLoader = CashFlowAccrualLoader;