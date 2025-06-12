/**
 * Employee Report Loader Module
 * Initializes and manages the employee report functionality
 */

import { EmployeeReportCore } from './employeeReportCore.js';

class EmployeeReportLoader {
    constructor() {
        this.employeeCore = null;
        this.isInitialized = false;
        this.currentData = {
            transactions: [],
            expenses: []
        };
    }

    /**
     * Initialize the employee report
     */
    async init() {
        try {
            console.log('[Employee Report] Initializing...');
            
            // Initialize core module
            this.employeeCore = new EmployeeReportCore();
            
            // Load initial data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial view
            this.render();
            
            this.isInitialized = true;
            console.log('[Employee Report] Initialized successfully');
            
        } catch (error) {
            console.error('[Employee Report] Initialization failed:', error);
            this.handleError('Không thể khởi tạo báo cáo nhân viên', error);
        }
    }

    /**
     * Load data for employee report
     */
    async loadData() {
        try {
            console.log('[Employee Report] Loading data...');
            
            // Use existing global data if available
            if (window.currentTransactionData && window.currentExpenseData) {
                this.currentData.transactions = window.currentTransactionData;
                this.currentData.expenses = window.currentExpenseData;
                console.log('[Employee Report] Using cached data');
                return;
            }

            // If no cached data, try to load from API
            // This would typically call your data loading functions
            console.log('[Employee Report] No cached data available');
            
        } catch (error) {
            console.error('[Employee Report] Data loading failed:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners for employee report
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('#employeeSearchInput') || document.querySelector('.employee-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter functionality
        const filterSelect = document.querySelector('#performanceFilter') || document.querySelector('.employee-filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.handleFilter(e.target.value);
            });
        }

        // Chart period buttons
        const chartButtons = document.querySelectorAll('.employee-chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChartPeriodChange(e.target.dataset.period);
            });
        });

        // Quick actions
        const actionButtons = document.querySelectorAll('.employee-action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.dataset.action);
            });
        });

        // Refresh button
        const refreshBtn = document.querySelector('[data-action="refresh"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }

    /**
     * Render the employee report
     */
    render() {
        if (!this.employeeCore) {
            console.error('[Employee Report] Core module not initialized');
            return;
        }

        try {
            // Process data
            const processedData = this.employeeCore.processAllData(
                this.currentData.transactions,
                this.currentData.expenses
            );

            // Render KPI cards
            this.renderKPICards(processedData.kpis);

            // Render charts
            this.renderCharts(processedData);

            // Render performance table
            this.renderPerformanceTable(processedData.employees);

            // Render comparison sections
            this.renderComparisons(processedData);

            // Render alerts
            this.renderAlerts(processedData.alerts);

            console.log('[Employee Report] Render completed');

        } catch (error) {
            console.error('[Employee Report] Render failed:', error);
            this.handleError('Không thể hiển thị báo cáo nhân viên', error);
        }
    }

    /**
     * Render KPI cards
     */
    renderKPICards(kpis) {
        const container = document.querySelector('.employee-kpi-dashboard');
        if (!container) return;

        const kpiCards = [
            {
                title: 'Tổng nhân viên',
                value: kpis.totalEmployees,
                icon: '👥',
                change: kpis.employeeChange,
                color: '#667eea'
            },
            {
                title: 'Doanh thu bình quân',
                value: this.formatCurrency(kpis.avgRevenue),
                icon: '💰',
                change: kpis.revenueChange,
                color: '#28a745'
            },
            {
                title: 'Hiệu suất cao nhất',
                value: `${kpis.topPerformance}%`,
                icon: '⭐',
                change: kpis.performanceChange,
                color: '#ffc107'
            },
            {
                title: 'Hoa hồng trung bình',
                value: this.formatCurrency(kpis.avgCommission),
                icon: '🎯',
                change: kpis.commissionChange,
                color: '#17a2b8'
            }
        ];

        container.innerHTML = kpiCards.map(kpi => `
            <div class="employee-kpi-card">
                <div class="employee-kpi-header">
                    <span class="employee-kpi-title">${kpi.title}</span>
                    <div class="employee-kpi-icon" style="background: ${kpi.color}20; color: ${kpi.color}">
                        ${kpi.icon}
                    </div>
                </div>
                <div class="employee-kpi-value">${kpi.value}</div>
                <div class="employee-kpi-change ${this.getChangeClass(kpi.change)}">
                    <span>${this.getChangeIcon(kpi.change)}</span>
                    <span>${Math.abs(kpi.change)}% so với tháng trước</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render charts
     */
    renderCharts(data) {
        // Performance chart
        this.renderPerformanceChart(data.chartData.performance);
        
        // Revenue chart
        this.renderRevenueChart(data.chartData.revenue);
    }

    /**
     * Render performance chart
     */
    renderPerformanceChart(data) {
        const canvas = document.querySelector('#employeePerformanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (window.employeePerformanceChart) {
            window.employeePerformanceChart.destroy();
        }

        window.employeePerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Hiệu suất (%)',
                    data: data.values,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Render revenue chart
     */
    renderRevenueChart(data) {
        const canvas = document.querySelector('#employeeRevenueChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (window.employeeRevenueChart) {
            window.employeeRevenueChart.destroy();
        }

        window.employeeRevenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Doanh thu',
                    data: data.values,
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Render performance table
     */
    renderPerformanceTable(employees) {
        const container = document.querySelector('.employee-table-container');
        if (!container) return;

        const table = `
            <table class="employee-performance-table">
                <thead>
                    <tr>
                        <th>Xếp hạng</th>
                        <th>Nhân viên</th>
                        <th>Phòng ban</th>
                        <th>Doanh thu</th>
                        <th>Hoa hồng</th>
                        <th>Hiệu suất</th>
                        <th>Xu hướng</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map((emp, index) => `
                        <tr>
                            <td>
                                <span class="employee-rank-badge ${this.getRankClass(index + 1)}">
                                    ${index + 1}
                                </span>
                            </td>
                            <td>
                                <div class="employee-name-cell">
                                    <div class="employee-avatar">
                                        ${emp.tenNhanVien.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="employee-info">
                                        <div class="employee-name">${emp.tenNhanVien}</div>
                                        <div class="employee-id">${emp.maNhanVien}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="employee-department-badge ${this.getDepartmentClass(emp.phongBan)}">
                                    ${emp.phongBan || 'Khác'}
                                </span>
                            </td>
                            <td>${this.formatCurrency(emp.tongDoanhThu)}</td>
                            <td>${this.formatCurrency(emp.tongHoaHong)}</td>
                            <td>
                                <div class="employee-performance-metric">
                                    <div class="employee-progress-bar">
                                        <div class="employee-progress-fill" style="width: ${emp.hieuSuat}%"></div>
                                    </div>
                                    <span>${emp.hieuSuat}%</span>
                                </div>
                            </td>
                            <td>
                                <span class="employee-trend-icon ${this.getTrendClass(emp.xuHuong)}">
                                    ${this.getTrendIcon(emp.xuHuong)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    }

    /**
     * Render comparison sections
     */
    renderComparisons(data) {
        // Top performers
        this.renderTopPerformers(data.topPerformers);
        
        // Department comparison
        this.renderDepartmentComparison(data.departmentStats);
    }

    /**
     * Render top performers
     */
    renderTopPerformers(performers) {
        const container = document.querySelector('#topPerformers');
        if (!container) return;

        const list = `
            <ul class="employee-comparison-list">
                ${performers.slice(0, 5).map((emp, index) => `
                    <li class="employee-comparison-item">
                        <div class="employee-comparison-info">
                            <span class="employee-comparison-rank">${index + 1}</span>
                            <div class="employee-comparison-details">
                                <div class="employee-comparison-name">${emp.tenNhanVien}</div>
                                <div class="employee-comparison-dept">${emp.phongBan || 'Khác'}</div>
                            </div>
                        </div>
                        <div class="employee-comparison-value">
                            ${this.formatCurrency(emp.tongDoanhThu)}
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;

        container.innerHTML = list;
    }

    /**
     * Render department comparison
     */
    renderDepartmentComparison(deptStats) {
        const container = document.querySelector('#departmentComparison');
        if (!container) return;

        const list = `
            <ul class="employee-comparison-list">
                ${Object.entries(deptStats).map(([dept, stats], index) => `
                    <li class="employee-comparison-item">
                        <div class="employee-comparison-info">
                            <span class="employee-comparison-rank">${index + 1}</span>
                            <div class="employee-comparison-details">
                                <div class="employee-comparison-name">${dept}</div>
                                <div class="employee-comparison-dept">${stats.employeeCount} nhân viên</div>
                            </div>
                        </div>
                        <div class="employee-comparison-value">
                            ${this.formatCurrency(stats.totalRevenue)}
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;

        container.innerHTML = list;
    }

    /**
     * Render alerts
     */
    renderAlerts(alerts) {
        const container = document.querySelector('.employee-alerts-section .employee-alert-list');
        if (!container) return;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">Không có cảnh báo nào</p>';
            return;
        }

        const alertsHTML = alerts.map(alert => `
            <div class="employee-alert-item">
                <div class="employee-alert-icon ${alert.type}">
                    ${this.getAlertIcon(alert.type)}
                </div>
                <div class="employee-alert-content">
                    <div class="employee-alert-message">${alert.message}</div>
                    <div class="employee-alert-details">${alert.details}</div>
                </div>
                <div class="employee-alert-time">${alert.time}</div>
            </div>
        `).join('');

        container.innerHTML = alertsHTML;
    }

    /**
     * Handle search functionality
     */
    handleSearch(query) {
        // Filter employees based on search query
        console.log('[Employee Report] Search:', query);
        // Implementation would filter the table data
    }

    /**
     * Handle filter functionality
     */
    handleFilter(filterValue) {
        console.log('[Employee Report] Filter:', filterValue);
        // Implementation would filter employees by department or other criteria
    }

    /**
     * Handle chart period changes
     */
    handleChartPeriodChange(period) {
        // Update active button
        document.querySelectorAll('.employee-chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // Reload charts with new period
        console.log('[Employee Report] Chart period changed:', period);
    }

    /**
     * Handle quick actions
     */
    handleQuickAction(action) {
        console.log('[Employee Report] Quick action:', action);
        
        switch (action) {
            case 'export':
                this.exportData();
                break;
            case 'refresh':
                this.refresh();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    /**
     * Refresh the report
     */
    async refresh() {
        try {
            console.log('[Employee Report] Refreshing...');
            await this.loadData();
            this.render();
            console.log('[Employee Report] Refresh completed');
        } catch (error) {
            console.error('[Employee Report] Refresh failed:', error);
            this.handleError('Không thể làm mới báo cáo', error);
        }
    }

    /**
     * Export data
     */
    exportData() {
        console.log('[Employee Report] Exporting data...');
        // Implementation would export employee data to Excel/CSV
    }

    /**
     * Show settings
     */
    showSettings() {
        console.log('[Employee Report] Showing settings...');
        // Implementation would show settings modal
    }

    /**
     * Utility methods
     */
    formatCurrency(amount) {
        if (typeof amount !== 'number') return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    getChangeClass(change) {
        if (change > 0) return 'positive';
        if (change < 0) return 'negative';
        return 'neutral';
    }

    getChangeIcon(change) {
        if (change > 0) return '↗️';
        if (change < 0) return '↘️';
        return '➡️';
    }

    getRankClass(rank) {
        if (rank === 1) return 'rank-1';
        if (rank === 2) return 'rank-2';
        if (rank === 3) return 'rank-3';
        return 'rank-other';
    }

    getDepartmentClass(dept) {
        if (!dept) return 'dept-other';
        const deptLower = dept.toLowerCase();
        if (deptLower.includes('bán hàng') || deptLower.includes('sales')) return 'dept-sales';
        if (deptLower.includes('marketing')) return 'dept-marketing';
        if (deptLower.includes('kỹ thuật') || deptLower.includes('tech')) return 'dept-tech';
        return 'dept-other';
    }

    getTrendClass(trend) {
        if (trend > 0) return 'up';
        if (trend < 0) return 'down';
        return 'neutral';
    }

    getTrendIcon(trend) {
        if (trend > 0) return '📈';
        if (trend < 0) return '📉';
        return '➡️';
    }

    getAlertIcon(type) {
        switch (type) {
            case 'warning': return '⚠️';
            case 'danger': return '🚨';
            case 'info': return 'ℹ️';
            default: return '📋';
        }
    }

    /**
     * Handle errors
     */
    handleError(message, error) {
        console.error('[Employee Report]', message, error);
        
        // Show error to user
        const container = document.querySelector('.employee-report-container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `
                <strong>Lỗi:</strong> ${message}
                <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
            `;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }

    /**
     * Cleanup method
     */
    cleanup() {
        // Destroy charts
        if (window.employeePerformanceChart) {
            window.employeePerformanceChart.destroy();
            window.employeePerformanceChart = null;
        }
        
        if (window.employeeRevenueChart) {
            window.employeeRevenueChart.destroy();
            window.employeeRevenueChart = null;
        }

        // Reset state
        this.isInitialized = false;
        this.employeeCore = null;
        this.currentData = { transactions: [], expenses: [] };
    }
}

// Export for module usage
export { EmployeeReportLoader };

// Global initialization function
window.initEmployeeReport = async function() {
    if (!window.employeeReportLoader) {
        window.employeeReportLoader = new EmployeeReportLoader();
    }
    await window.employeeReportLoader.init();
};

// Cleanup function
window.cleanupEmployeeReport = function() {
    if (window.employeeReportLoader) {
        window.employeeReportLoader.cleanup();
    }
};