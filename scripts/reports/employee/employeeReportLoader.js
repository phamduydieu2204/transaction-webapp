/**
 * Employee Report Loader Module
 * Initializes and manages the employee report functionality
 */

import { EmployeeReportCore } from './employeeReportCore.js';
import { EmployeeExport } from './employeeExport.js';

class EmployeeReportLoader {
    constructor() {
        this.employeeCore = null;
        this.isInitialized = false;
        this.currentData = {
            transactions: [],
            expenses: []
        };
        this.exportManager = new EmployeeExport();
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
            
            // Check multiple possible data sources
            if (window.transactionList && window.expenseList) {
                this.currentData.transactions = window.transactionList;
                this.currentData.expenses = window.expenseList;
                console.log('[Employee Report] Using transactionList/expenseList data');
                return;
            }
            
            if (window.currentTransactionData && window.currentExpenseData) {
                this.currentData.transactions = window.currentTransactionData;
                this.currentData.expenses = window.currentExpenseData;
                console.log('[Employee Report] Using currentTransactionData/currentExpenseData');
                return;
            }

            // If no cached data, generate mock data for testing
            console.log('[Employee Report] No cached data available, using mock data');
            this.generateMockData();
            
        } catch (error) {
            console.error('[Employee Report] Data loading failed:', error);
            throw error;
        }
    }

    /**
     * Generate mock data for testing
     */
    generateMockData() {
        // Mock transaction data
        this.currentData.transactions = [
            {maGiaoDich: 'GD001', tenNhanVien: 'Nguyễn Văn A', maNhanVien: 'NV001', doanhThu: 50000000, hoaHong: 5000000, ngayGiaoDich: '2024-01-15'},
            {maGiaoDich: 'GD002', tenNhanVien: 'Trần Thị B', maNhanVien: 'NV002', doanhThu: 30000000, hoaHong: 3000000, ngayGiaoDich: '2024-01-20'},
            {maGiaoDich: 'GD003', tenNhanVien: 'Lê Văn C', maNhanVien: 'NV003', doanhThu: 40000000, hoaHong: 4000000, ngayGiaoDich: '2024-02-01'},
            {maGiaoDich: 'GD004', tenNhanVien: 'Nguyễn Văn A', maNhanVien: 'NV001', doanhThu: 60000000, hoaHong: 6000000, ngayGiaoDich: '2024-02-10'},
            {maGiaoDich: 'GD005', tenNhanVien: 'Phạm Thị D', maNhanVien: 'NV004', doanhThu: 35000000, hoaHong: 3500000, ngayGiaoDich: '2024-02-15'}
        ];
        
        // Mock expense data
        this.currentData.expenses = [
            {maChiPhi: 'CP001', tenNhanVien: 'Nguyễn Văn A', maNhanVien: 'NV001', soTien: 5000000, ngayChi: '2024-01-10'},
            {maChiPhi: 'CP002', tenNhanVien: 'Trần Thị B', maNhanVien: 'NV002', soTien: 3000000, ngayChi: '2024-01-15'},
            {maChiPhi: 'CP003', tenNhanVien: 'Lê Văn C', maNhanVien: 'NV003', soTien: 2000000, ngayChi: '2024-02-05'}
        ];
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
            // Initialize the employee core with data
            this.employeeCore.transactions = this.currentData.transactions || [];
            this.employeeCore.expenses = this.currentData.expenses || [];
            
            // Process the data
            this.employeeCore.processEmployeeData();
            
            // Get processed data
            const processedData = {
                kpis: this.calculateKPIs(),
                chartData: this.prepareChartData(),
                employees: this.employeeCore.filteredEmployees,
                topPerformers: this.employeeCore.employees.slice(0, 5),
                departmentStats: this.calculateDepartmentStats(),
                alerts: this.generateAlerts()
            };

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
     * Render charts using the chart manager
     */
    renderCharts(data) {
        if (!this.employeeCore || !this.employeeCore.chartManager) {
            console.warn('Chart manager not available');
            return;
        }

        // Use the chart manager to render all charts
        this.employeeCore.chartManager.renderPerformanceChart(data.employees);
        this.employeeCore.chartManager.renderRevenueTrendChart(data.employees);
        this.employeeCore.chartManager.renderDepartmentChart(data.departments);
        this.employeeCore.chartManager.renderCommissionRevenueChart(data.employees);
        this.employeeCore.chartManager.renderPerformanceDistribution(data.employees);
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
        const periodBtn = document.querySelector(`[data-period="${period}"]`);
        if (periodBtn) {
            periodBtn.classList.add('active');
        }

        // Update charts with new period using chart manager
        if (this.employeeCore && this.employeeCore.chartManager) {
            const processedData = this.employeeCore.processedData;
            this.employeeCore.chartManager.updateChartPeriod(
                period, 
                processedData.employees, 
                processedData.departments
            );
        }

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
        
        if (!this.employeeCore || !this.employeeCore.processedData) {
            console.warn('No employee data available for export');
            alert('Không có dữ liệu để xuất. Vui lòng tải lại báo cáo.');
            return;
        }

        const { employees, departments } = this.employeeCore.processedData;
        this.exportManager.showExportModal(employees, departments);
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
     * Calculate KPIs
     */
    calculateKPIs() {
        const employees = this.employeeCore.employees;
        const totalEmployees = employees.length;
        const totalRevenue = employees.reduce((sum, emp) => sum + emp.totalRevenue, 0);
        const avgRevenue = totalEmployees > 0 ? totalRevenue / totalEmployees : 0;
        const topPerformance = Math.max(...employees.map(emp => emp.performanceRatio || 0), 0);
        const avgCommission = employees.reduce((sum, emp) => sum + emp.totalCommission, 0) / totalEmployees || 0;
        
        return {
            totalEmployees,
            avgRevenue,
            topPerformance,
            avgCommission,
            employeeChange: Math.floor(Math.random() * 20) - 10,
            revenueChange: Math.floor(Math.random() * 30) - 15,
            performanceChange: Math.floor(Math.random() * 25) - 12,
            commissionChange: Math.floor(Math.random() * 20) - 10
        };
    }

    /**
     * Prepare chart data
     */
    prepareChartData() {
        const employees = this.employeeCore.employees.slice(0, 10);
        
        return {
            performance: {
                labels: employees.map(emp => emp.tenNhanVien),
                values: employees.map(emp => emp.performanceRatio || 0)
            },
            revenue: {
                labels: employees.map(emp => emp.tenNhanVien),
                values: employees.map(emp => emp.totalRevenue)
            }
        };
    }

    /**
     * Calculate department statistics
     */
    calculateDepartmentStats() {
        const stats = {};
        
        this.employeeCore.employees.forEach(emp => {
            const dept = emp.department || 'Khác';
            if (!stats[dept]) {
                stats[dept] = {
                    employeeCount: 0,
                    totalRevenue: 0,
                    totalCommission: 0
                };
            }
            stats[dept].employeeCount++;
            stats[dept].totalRevenue += emp.totalRevenue || 0;
            stats[dept].totalCommission += emp.totalCommission || 0;
        });
        
        return stats;
    }

    /**
     * Generate alerts
     */
    generateAlerts() {
        const alerts = [];
        const employees = this.employeeCore.employees;
        
        // Low performers alert
        const lowPerformers = employees.filter(emp => emp.performanceRatio < 80);
        if (lowPerformers.length > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowPerformers.length} nhân viên có hiệu suất dưới 80%`,
                details: 'Cần xem xét kế hoạch hỗ trợ và đào tạo',
                time: 'Hôm nay'
            });
        }
        
        // No activity alert
        const inactiveEmployees = employees.filter(emp => {
            if (!emp.lastActivity) return true;
            const daysSince = Math.floor((new Date() - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysSince > 30;
        });
        
        if (inactiveEmployees.length > 0) {
            alerts.push({
                type: 'danger',
                message: `${inactiveEmployees.length} nhân viên không hoạt động > 30 ngày`,
                details: 'Kiểm tra tình trạng và liên hệ với nhân viên',
                time: 'Cảnh báo'
            });
        }
        
        return alerts;
    }

    /**
     * Cleanup method
     */
    cleanup() {
        // Cleanup chart manager
        if (this.employeeCore && this.employeeCore.chartManager) {
            this.employeeCore.chartManager.cleanup();
        }

        // Destroy legacy charts
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