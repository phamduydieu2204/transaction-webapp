// Software Account Management Module
// Xử lý dữ liệu và logic cho trang quản lý tài khoản phần mềm

import { formatDate, formatDateTime } from '../../formatDate.js';
import { formatCurrency } from '../../statistics/formatters.js';

export class SoftwareManagement {
    constructor() {
        this.currentSoftwareData = [];
        this.filteredSoftwareData = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.isInitialized = false;
    }

    // Khởi tạo module
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            await this.loadSoftwareData();
            this.renderKPICards();
            this.renderLicenseStatusOverview();
            this.renderAnalyticsCharts();
            this.renderSoftwareTable();
            this.renderLicenseAlerts();
            this.renderPerformanceDashboard();
            this.isInitialized = true;
        } catch (error) {
            console.error('Lỗi khởi tạo Software Management:', error);
        }
    }

    // Tải dữ liệu phần mềm từ giao dịch
    async loadSoftwareData() {
        try {
            // Lấy dữ liệu từ các nguồn hiện có
            const transactionData = window.currentTransactionData || [];
            const expenseData = window.currentExpenseData || [];
            
            // Xử lý dữ liệu từ giao dịch và chi phí
            this.currentSoftwareData = this.processSoftwareFromTransactions(transactionData, expenseData);
            this.filteredSoftwareData = [...this.currentSoftwareData];
            
        } catch (error) {
            console.error('Lỗi tải dữ liệu phần mềm:', error);
            this.currentSoftwareData = this.generateMockSoftwareData();
            this.filteredSoftwareData = [...this.currentSoftwareData];
        }
    }

    // Xử lý dữ liệu phần mềm từ giao dịch
    processSoftwareFromTransactions(transactions, expenses) {
        const softwareMap = new Map();
        const softwareKeywords = ['software', 'phần mềm', 'license', 'giấy phép', 'subscription', 'app', 'tool', 'công cụ'];
        
        // Xử lý từ giao dịch
        transactions.forEach(transaction => {
            const description = (transaction.description || '').toLowerCase();
            const isSoftware = softwareKeywords.some(keyword => description.includes(keyword));
            
            if (isSoftware) {
                const softwareName = this.extractSoftwareName(transaction.description);
                const key = softwareName.toLowerCase();
                
                if (!softwareMap.has(key)) {
                    softwareMap.set(key, {
                        name: softwareName,
                        vendor: transaction.customer || 'Không xác định',
                        category: this.categorize(softwareName),
                        licenses: [],
                        totalCost: 0,
                        transactions: []
                    });
                }
                
                const software = softwareMap.get(key);
                software.totalCost += Math.abs(transaction.amount || 0);
                software.transactions.push(transaction);
                
                // Thêm license nếu là giao dịch mua/gia hạn
                if (transaction.amount < 0) { // Chi phí
                    software.licenses.push({
                        id: `license-${Date.now()}-${Math.random()}`,
                        type: 'Standard',
                        status: 'active',
                        startDate: transaction.date,
                        endDate: this.calculateEndDate(transaction.date),
                        cost: Math.abs(transaction.amount),
                        users: this.estimateUsers(transaction.amount)
                    });
                }
            }
        });
        
        // Xử lý từ chi phí
        expenses.forEach(expense => {
            const description = (expense.description || '').toLowerCase();
            const category = (expense.category || '').toLowerCase();
            const isSoftware = softwareKeywords.some(keyword => 
                description.includes(keyword) || category.includes(keyword)
            );
            
            if (isSoftware) {
                const softwareName = this.extractSoftwareName(expense.description || expense.category);
                const key = softwareName.toLowerCase();
                
                if (!softwareMap.has(key)) {
                    softwareMap.set(key, {
                        name: softwareName,
                        vendor: 'Không xác định',
                        category: this.categorize(softwareName),
                        licenses: [],
                        totalCost: 0,
                        transactions: []
                    });
                }
                
                const software = softwareMap.get(key);
                software.totalCost += expense.amount || 0;
                software.transactions.push(expense);
            }
        });
        
        return Array.from(softwareMap.values()).map(software => ({
            ...software,
            activeLicenses: software.licenses.filter(l => l.status === 'active').length,
            utilization: this.calculateUtilization(software),
            renewalDate: this.getNextRenewalDate(software.licenses),
            riskLevel: this.calculateRiskLevel(software),
            roi: this.calculateROI(software),
            status: 'active'
        }));
    }

    // Tạo dữ liệu mẫu cho demo
    generateMockSoftwareData() {
        return [
            {
                name: 'Microsoft Office 365',
                vendor: 'Microsoft',
                category: 'Productivity',
                activeLicenses: 25,
                totalLicenses: 30,
                utilization: 83.3,
                totalCost: 12500000,
                renewalDate: '2024-07-15',
                riskLevel: 'low',
                roi: 245,
                status: 'active',
                licenses: [
                    { id: 'lic-001', type: 'Business Premium', status: 'active', users: 25, cost: 500000 },
                    { id: 'lic-002', type: 'Basic', status: 'inactive', users: 5, cost: 200000 }
                ]
            },
            {
                name: 'Adobe Creative Suite',
                vendor: 'Adobe',
                category: 'Design',
                activeLicenses: 5,
                totalLicenses: 5,
                utilization: 100,
                totalCost: 8000000,
                renewalDate: '2024-06-30',
                riskLevel: 'medium',
                roi: 180,
                status: 'active',
                licenses: [
                    { id: 'lic-003', type: 'Creative Cloud', status: 'active', users: 5, cost: 1600000 }
                ]
            },
            {
                name: 'Slack Business+',
                vendor: 'Slack',
                category: 'Communication',
                activeLicenses: 50,
                totalLicenses: 50,
                utilization: 75,
                totalCost: 6000000,
                renewalDate: '2024-12-01',
                riskLevel: 'low',
                roi: 310,
                status: 'active',
                licenses: [
                    { id: 'lic-004', type: 'Business+', status: 'active', users: 50, cost: 120000 }
                ]
            },
            {
                name: 'Zoom Pro',
                vendor: 'Zoom',
                category: 'Communication',
                activeLicenses: 10,
                totalLicenses: 15,
                utilization: 66.7,
                renewalDate: '2024-08-15',
                totalCost: 2400000,
                riskLevel: 'medium',
                roi: 150,
                status: 'active',
                licenses: [
                    { id: 'lic-005', type: 'Pro', status: 'active', users: 10, cost: 200000 },
                    { id: 'lic-006', type: 'Basic', status: 'inactive', users: 5, cost: 0 }
                ]
            }
        ];
    }

    // Utility functions
    extractSoftwareName(description) {
        if (!description) return 'Phần mềm không xác định';
        
        // Tách tên phần mềm từ mô tả
        const words = description.split(' ');
        return words.slice(0, 3).join(' ') || 'Phần mềm không xác định';
    }

    categorize(softwareName) {
        const categories = {
            'office': 'Productivity',
            'adobe': 'Design',
            'slack': 'Communication',
            'zoom': 'Communication',
            'accounting': 'Finance',
            'design': 'Design',
            'productivity': 'Productivity'
        };
        
        const name = softwareName.toLowerCase();
        for (const [key, category] of Object.entries(categories)) {
            if (name.includes(key)) return category;
        }
        return 'Other';
    }

    calculateEndDate(startDate) {
        const date = new Date(startDate);
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().split('T')[0];
    }

    estimateUsers(amount) {
        return Math.max(1, Math.floor(Math.abs(amount) / 100000));
    }

    calculateUtilization(software) {
        if (!software.licenses.length) return 0;
        const activeUsers = software.licenses.reduce((sum, l) => sum + (l.status === 'active' ? l.users : 0), 0);
        const totalUsers = software.licenses.reduce((sum, l) => sum + l.users, 0);
        return totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    }

    getNextRenewalDate(licenses) {
        const activeLicenses = licenses.filter(l => l.status === 'active');
        if (!activeLicenses.length) return null;
        
        return activeLicenses.reduce((earliest, license) => {
            const renewalDate = license.endDate || license.startDate;
            return !earliest || renewalDate < earliest ? renewalDate : earliest;
        }, null);
    }

    calculateRiskLevel(software) {
        const utilization = software.utilization || 0;
        const daysToRenewal = software.renewalDate ? 
            Math.floor((new Date(software.renewalDate) - new Date()) / (1000 * 60 * 60 * 24)) : 365;
        
        if (utilization < 50 || daysToRenewal < 30) return 'high';
        if (utilization < 80 || daysToRenewal < 90) return 'medium';
        return 'low';
    }

    calculateROI(software) {
        // Ước tính ROI dựa trên chi phí và lợi ích
        const baseCost = software.totalCost || 1000000;
        const utilizationBonus = (software.utilization || 50) / 100;
        return Math.floor(100 + (utilizationBonus * 200));
    }

    // Render KPI Cards
    renderKPICards() {
        const totalSoftware = this.currentSoftwareData.length;
        const activeLicenses = this.currentSoftwareData.reduce((sum, s) => sum + s.activeLicenses, 0);
        const avgUtilization = this.currentSoftwareData.length > 0 ?
            this.currentSoftwareData.reduce((sum, s) => sum + s.utilization, 0) / this.currentSoftwareData.length : 0;
        const totalRenewalCost = this.currentSoftwareData.reduce((sum, s) => sum + s.totalCost, 0);

        const kpiContainer = document.querySelector('.software-kpi-cards');
        if (!kpiContainer) return;

        kpiContainer.innerHTML = `
            <div class="kpi-card">
                <div class="kpi-icon">📊</div>
                <div class="kpi-content">
                    <div class="kpi-value">${totalSoftware}</div>
                    <div class="kpi-label">Tổng Phần Mềm</div>
                    <div class="kpi-trend positive">+2 tháng này</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">✅</div>
                <div class="kpi-content">
                    <div class="kpi-value">${activeLicenses}</div>
                    <div class="kpi-label">Giấy Phép Hoạt Động</div>
                    <div class="kpi-trend positive">+5 tuần này</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">📈</div>
                <div class="kpi-content">
                    <div class="kpi-value">${avgUtilization.toFixed(1)}%</div>
                    <div class="kpi-label">Tỷ Lệ Sử Dụng</div>
                    <div class="kpi-trend ${avgUtilization > 80 ? 'positive' : 'negative'}">
                        ${avgUtilization > 80 ? '+' : ''}${(avgUtilization - 75).toFixed(1)}% so với mục tiêu
                    </div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">💰</div>
                <div class="kpi-content">
                    <div class="kpi-value">${formatCurrency(totalRenewalCost)}</div>
                    <div class="kpi-label">Chi Phí Gia Hạn</div>
                    <div class="kpi-trend neutral">Năm tới</div>
                </div>
            </div>
        `;
    }

    // Render License Status Overview
    renderLicenseStatusOverview() {
        const activeCount = this.currentSoftwareData.filter(s => s.status === 'active').length;
        const expiringCount = this.currentSoftwareData.filter(s => {
            if (!s.renewalDate) return false;
            const daysToExpiry = Math.floor((new Date(s.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
            return daysToExpiry <= 30 && daysToExpiry > 0;
        }).length;
        const expiredCount = this.currentSoftwareData.filter(s => {
            if (!s.renewalDate) return false;
            return new Date(s.renewalDate) < new Date();
        }).length;
        const inactiveCount = this.currentSoftwareData.length - activeCount;

        const statusContainer = document.querySelector('.license-status-cards');
        if (!statusContainer) return;

        statusContainer.innerHTML = `
            <div class="status-card active">
                <div class="status-icon">✅</div>
                <div class="status-content">
                    <div class="status-value">${activeCount}</div>
                    <div class="status-label">Đang Hoạt Động</div>
                </div>
            </div>
            <div class="status-card expiring">
                <div class="status-icon">⚠️</div>
                <div class="status-content">
                    <div class="status-value">${expiringCount}</div>
                    <div class="status-label">Sấp Hết Hạn</div>
                </div>
            </div>
            <div class="status-card expired">
                <div class="status-icon">❌</div>
                <div class="status-content">
                    <div class="status-value">${expiredCount}</div>
                    <div class="status-label">Đã Hết Hạn</div>
                </div>
            </div>
            <div class="status-card inactive">
                <div class="status-icon">⏸️</div>
                <div class="status-content">
                    <div class="status-value">${inactiveCount}</div>
                    <div class="status-label">Tạm Dừng</div>
                </div>
            </div>
        `;
    }

    // Render Analytics Charts
    renderAnalyticsCharts() {
        this.renderUsageTrendChart();
        this.renderUtilizationChart();
    }

    renderUsageTrendChart() {
        const ctx = document.getElementById('usageTrendChart');
        if (!ctx) return;

        // Tạo dữ liệu cho 12 tháng gần nhất
        const months = [];
        const usageData = [];
        const currentDate = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }));
            usageData.push(Math.floor(Math.random() * 30) + 70); // Mock data 70-100%
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Tỷ lệ sử dụng (%)',
                    data: usageData,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }

    renderUtilizationChart() {
        const ctx = document.getElementById('utilizationChart');
        if (!ctx) return;

        const utilizationRanges = {
            'Cao (80-100%)': this.currentSoftwareData.filter(s => s.utilization >= 80).length,
            'Trung bình (50-79%)': this.currentSoftwareData.filter(s => s.utilization >= 50 && s.utilization < 80).length,
            'Thấp (<50%)': this.currentSoftwareData.filter(s => s.utilization < 50).length
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(utilizationRanges),
                datasets: [{
                    data: Object.values(utilizationRanges),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20 }
                    }
                }
            }
        });
    }

    // Render Software Table
    renderSoftwareTable() {
        const tableBody = document.querySelector('#softwareTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = this.filteredSoftwareData.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedData.map(software => `
            <tr>
                <td>
                    <div class="software-info">
                        <strong>${software.name}</strong>
                        <div class="software-vendor">${software.vendor}</div>
                    </div>
                </td>
                <td><span class="category-badge ${software.category.toLowerCase()}">${software.category}</span></td>
                <td>
                    <div class="license-count">
                        <strong>${software.activeLicenses}</strong>/${software.totalLicenses || software.activeLicenses}
                    </div>
                </td>
                <td>
                    <div class="utilization-bar">
                        <div class="utilization-fill" style="width: ${software.utilization}%"></div>
                        <span class="utilization-text">${software.utilization.toFixed(1)}%</span>
                    </div>
                </td>
                <td>${formatCurrency(software.totalCost)}</td>
                <td>
                    <span class="renewal-date ${this.getRenewalStatus(software.renewalDate)}">
                        ${software.renewalDate ? formatDate(software.renewalDate) : 'N/A'}
                    </span>
                </td>
                <td><span class="risk-badge ${software.riskLevel}">${this.getRiskText(software.riskLevel)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="softwareManagement.viewSoftware('${software.name}')">
                            👁️
                        </button>
                        <button class="action-btn edit" onclick="softwareManagement.editSoftware('${software.name}')">
                            ✏️
                        </button>
                        <button class="action-btn renew" onclick="softwareManagement.renewSoftware('${software.name}')">
                            🔄
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    // Render License Alerts
    renderLicenseAlerts() {
        const alertsContainer = document.querySelector('.license-alerts-list');
        if (!alertsContainer) return;

        // Tạo cảnh báo từ dữ liệu
        const alerts = [];
        
        this.currentSoftwareData.forEach(software => {
            if (software.renewalDate) {
                const daysToRenewal = Math.floor((new Date(software.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
                
                if (daysToRenewal <= 7 && daysToRenewal > 0) {
                    alerts.push({
                        type: 'urgent',
                        icon: '🚨',
                        title: `${software.name} sắp hết hạn`,
                        message: `Còn ${daysToRenewal} ngày`,
                        action: 'Gia hạn ngay'
                    });
                } else if (daysToRenewal <= 30 && daysToRenewal > 7) {
                    alerts.push({
                        type: 'warning',
                        icon: '⚠️',
                        title: `${software.name} cần gia hạn`,
                        message: `Còn ${daysToRenewal} ngày`,
                        action: 'Lên kế hoạch'
                    });
                }
            }
            
            if (software.utilization < 50) {
                alerts.push({
                    type: 'info',
                    icon: '📊',
                    title: `${software.name} sử dụng thấp`,
                    message: `Chỉ ${software.utilization.toFixed(1)}% sử dụng`,
                    action: 'Tối ưu hóa'
                });
            }
        });

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<div class="no-alerts">Không có cảnh báo nào</div>';
            return;
        }

        alertsContainer.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <button class="alert-action">${alert.action}</button>
            </div>
        `).join('');
    }

    // Render Performance Dashboard
    renderPerformanceDashboard() {
        const dashboardContainer = document.querySelector('.performance-metrics');
        if (!dashboardContainer) return;

        const totalROI = this.currentSoftwareData.reduce((sum, s) => sum + s.roi, 0) / this.currentSoftwareData.length;
        const totalCost = this.currentSoftwareData.reduce((sum, s) => sum + s.totalCost, 0);
        const avgUtilization = this.currentSoftwareData.reduce((sum, s) => sum + s.utilization, 0) / this.currentSoftwareData.length;

        dashboardContainer.innerHTML = `
            <div class="performance-card">
                <div class="performance-icon">💹</div>
                <div class="performance-content">
                    <div class="performance-value">${totalROI.toFixed(0)}%</div>
                    <div class="performance-label">ROI Trung Bình</div>
                    <div class="performance-trend positive">+12% so với quý trước</div>
                </div>
            </div>
            <div class="performance-card">
                <div class="performance-icon">💰</div>
                <div class="performance-content">
                    <div class="performance-value">${formatCurrency(totalCost)}</div>
                    <div class="performance-label">Tổng Đầu Tư</div>
                    <div class="performance-trend neutral">Năm hiện tại</div>
                </div>
            </div>
            <div class="performance-card">
                <div class="performance-icon">⚡</div>
                <div class="performance-content">
                    <div class="performance-value">${avgUtilization.toFixed(1)}%</div>
                    <div class="performance-label">Hiệu Suất Sử Dụng</div>
                    <div class="performance-trend ${avgUtilization > 75 ? 'positive' : 'negative'}">
                        Mục tiêu: 80%
                    </div>
                </div>
            </div>
        `;
    }

    // Event Listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('#softwareSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter functionality
        const categoryFilter = document.querySelector('#categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        const statusFilter = document.querySelector('#statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleStatusFilter(e.target.value);
            });
        }

        // Export functionality
        const exportBtn = document.querySelector('#exportSoftwareData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        // Refresh functionality
        const refreshBtn = document.querySelector('#refreshSoftwareData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
    }

    // Search và Filter methods
    handleSearch(searchTerm) {
        const filtered = this.currentSoftwareData.filter(software =>
            software.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            software.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            software.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.filteredSoftwareData = filtered;
        this.currentPage = 1;
        this.renderSoftwareTable();
    }

    handleCategoryFilter(category) {
        if (category === 'all') {
            this.filteredSoftwareData = [...this.currentSoftwareData];
        } else {
            this.filteredSoftwareData = this.currentSoftwareData.filter(s => 
                s.category.toLowerCase() === category.toLowerCase()
            );
        }
        this.currentPage = 1;
        this.renderSoftwareTable();
    }

    handleStatusFilter(status) {
        if (status === 'all') {
            this.filteredSoftwareData = [...this.currentSoftwareData];
        } else {
            this.filteredSoftwareData = this.currentSoftwareData.filter(s => 
                s.status === status
            );
        }
        this.currentPage = 1;
        this.renderSoftwareTable();
    }

    // Action methods
    viewSoftware(softwareName) {
        const software = this.currentSoftwareData.find(s => s.name === softwareName);
        if (!software) return;
        
        // Hiển thị modal chi tiết
        alert(`Xem chi tiết ${software.name}\nNhà cung cấp: ${software.vendor}\nLoại: ${software.category}\nSử dụng: ${software.utilization.toFixed(1)}%`);
    }

    editSoftware(softwareName) {
        const software = this.currentSoftwareData.find(s => s.name === softwareName);
        if (!software) return;
        
        // Hiển thị form chỉnh sửa
        alert(`Chỉnh sửa ${software.name} - Tính năng đang phát triển`);
    }

    renewSoftware(softwareName) {
        const software = this.currentSoftwareData.find(s => s.name === softwareName);
        if (!software) return;
        
        if (confirm(`Gia hạn ${software.name}?`)) {
            // Logic gia hạn
            alert(`Đã gửi yêu cầu gia hạn ${software.name}`);
        }
    }

    // Utility methods
    getRenewalStatus(renewalDate) {
        if (!renewalDate) return 'unknown';
        
        const daysToRenewal = Math.floor((new Date(renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysToRenewal < 0) return 'expired';
        if (daysToRenewal <= 7) return 'urgent';
        if (daysToRenewal <= 30) return 'warning';
        return 'normal';
    }

    getRiskText(riskLevel) {
        const riskTexts = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao'
        };
        return riskTexts[riskLevel] || 'Không xác định';
    }

    updatePagination() {
        const totalItems = this.filteredSoftwareData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="softwareManagement.goToPage(${this.currentPage - 1})">‹</button>`;
        }
        
        // Page numbers
        for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(totalPages, this.currentPage + 2); i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            paginationHTML += `<button class="page-btn ${activeClass}" onclick="softwareManagement.goToPage(${i})">${i}</button>`;
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" onclick="softwareManagement.goToPage(${this.currentPage + 1})">›</button>`;
        }
        
        paginationHTML += '</div>';
        paginationHTML += `<div class="pagination-info">Hiển thị ${Math.min(totalItems, (this.currentPage - 1) * this.itemsPerPage + 1)}-${Math.min(totalItems, this.currentPage * this.itemsPerPage)} trong tổng số ${totalItems} phần mềm</div>`;
        
        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderSoftwareTable();
    }

    // Export functionality
    exportToExcel() {
        // Tạo dữ liệu CSV đơn giản
        const headers = ['Tên Phần Mềm', 'Nhà Cung Cấp', 'Loại', 'Giấy Phép', 'Sử Dụng (%)', 'Chi Phí', 'Gia Hạn', 'Rủi Ro'];
        const csvData = [headers];
        
        this.filteredSoftwareData.forEach(software => {
            csvData.push([
                software.name,
                software.vendor,
                software.category,
                `${software.activeLicenses}/${software.totalLicenses || software.activeLicenses}`,
                software.utilization.toFixed(1),
                software.totalCost,
                software.renewalDate || 'N/A',
                this.getRiskText(software.riskLevel)
            ]);
        });
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `software-management-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    // Refresh data
    async refreshData() {
        await this.loadSoftwareData();
        this.renderKPICards();
        this.renderLicenseStatusOverview();
        this.renderAnalyticsCharts();
        this.renderSoftwareTable();
        this.renderLicenseAlerts();
        this.renderPerformanceDashboard();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Đã cập nhật dữ liệu phần mềm';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 3000);
    }

    // Public method để gọi từ bên ngoài
    async refresh() {
        await this.refreshData();
    }
}

// Export instance để sử dụng global
export const softwareManagement = new SoftwareManagement();