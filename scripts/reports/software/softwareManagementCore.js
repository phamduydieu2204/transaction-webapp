// Software Account Management Core Module
// Xử lý dữ liệu thực tế từ sheet PhanMem, GiaoDich, ChiPhi

import { formatDate } from '../../formatDate.js';
import { formatDateTime } from '../../formatDateTime.js';
import { formatCurrency } from '../../statistics/formatters.js';

export class SoftwareManagement {
    constructor() {
        this.softwareAccounts = [];
        this.transactions = [];
        this.expenses = [];
        this.filteredAccounts = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.isInitialized = false;
        this.charts = {};
    }

    // Khởi tạo module
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            
            this.setupEventListeners();
            await this.loadAllData();
            this.processAndCombineData();
            this.renderKPIDashboard();
            this.renderOverviewCards();
            this.renderAnalyticsCharts();
            this.renderSoftwareAccountsTable();
            this.renderDetailsSection();
            this.renderAlertsSection();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Error initializing Software Management:', error);
        }
    }

    // Tải tất cả dữ liệu từ các sheet
    async loadAllData() {
        try {
            // Lấy dữ liệu từ các sheet hiện có
            this.softwareAccounts = this.extractSoftwareData();
            this.transactions = this.extractTransactionData();
            this.expenses = this.extractExpenseData();
            
                software: this.softwareAccounts.length,
                transactions: this.transactions.length,
                expenses: this.expenses.length
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            // Fallback to mock data if real data is not available
            this.generateMockData();
        }
    }

    // Trích xuất dữ liệu từ sheet PhanMem
    extractSoftwareData() {
        // Giả định dữ liệu sheet PhanMem được lưu trong window.softwareData
        const rawData = window.softwareData || [];
        
        return rawData.map((row, index) => ({
            id: index + 1,
            tenPhanMem: row[0] || '',           // A: Tên phần mềm
            goiPhanMem: row[1] || '',           // B: Gói phần mềm
            giaBan: parseFloat(row[2]) || 0,    // C: Giá bán
            tenTaiKhoan: row[3] || '',          // D: Tên tài khoản
            soNguoiDungChoPhep: parseInt(row[4]) || 0,    // E: Số người dùng cho phép
            soNguoiDungDangHoatDong: parseInt(row[5]) || 0, // F: Số người dùng đang hoạt động
            idSheetTaiKhoan: row[6] || '',      // G: ID Sheet tài khoản
            thongTinDonHang: row[7] || '',      // H: Thông tin đơn hàng
            tenDangNhap: row[8] || '',          // I: Tên đăng nhập
            matKhauDangNhap: row[9] || '',      // J: Mật khẩu đăng nhập
            secret: row[10] || '',              // K: Secret
            linkYeuCauOTP: row[11] || '',       // L: Link yêu cầu OTP
            tenChuan: row[12] || '',            // M: Tên chuẩn
            phanTramHoaHong: parseFloat(row[13]) || 0  // N: % Hoa hồng
        }));
    }

    // Trích xuất dữ liệu từ sheet GiaoDich
    extractTransactionData() {
        // Giả định dữ liệu sheet GiaoDich được lưu trong window.currentTransactionData
        const rawData = window.currentTransactionData || [];
        
        return rawData.map((row, index) => ({
            id: index + 1,
            maGiaoDich: row[0] || '',           // A: Mã giao dịch
            ngayGiaoDich: row[1] || '',         // B: Ngày giao dịch
            loaiGiaoDich: row[2] || '',         // C: Loại giao dịch
            tenKhachHang: row[3] || '',         // D: Tên khách hàng
            email: row[4] || '',                // E: Email
            lienHe: row[5] || '',               // F: Liên hệ
            soThangDangKy: parseInt(row[6]) || 0, // G: Số tháng đăng ký
            ngayBatDau: row[7] || '',           // H: Ngày bắt đầu
            ngayKetThuc: row[8] || '',          // I: Ngày kết thúc
            soThietBi: parseInt(row[9]) || 0,   // J: Số thiết bị
            tenPhanMem: row[10] || '',          // K: Tên phần mềm
            goiPhanMem: row[11] || '',          // L: Gói phần mềm
            tenTaiKhoan: row[12] || '',         // M: Tên tài khoản
            idSheetTaiKhoan: row[13] || '',     // N: ID Sheet Tài khoản
            capNhatCookie: row[14] || '',       // O: Cập nhật Cookie
            thongTinDonHang: row[15] || '',     // P: Thông tin đơn hàng
            doanhThu: parseFloat(row[16]) || 0, // Q: Doanh thu
            hoaHong: parseFloat(row[17]) || 0,  // R: Hoa hồng
            ghiChu: row[18] || '',              // S: Ghi chú
            tenChuan: row[19] || '',            // T: Tên chuẩn
            tenNhanVien: row[20] || '',         // U: Tên nhân viên
            maNhanVien: row[21] || ''           // V: Mã nhân viên
        }));
    }

    // Trích xuất dữ liệu từ sheet ChiPhi
    extractExpenseData() {
        // Giả định dữ liệu sheet ChiPhi được lưu trong window.currentExpenseData
        const rawData = window.currentExpenseData || [];
        
        return rawData.map((row, index) => ({
            id: index + 1,
            maChiPhi: row[0] || '',             // A: Mã chi phí
            ngayChi: row[1] || '',              // B: Ngày chi
            loaiKeToan: row[2] || '',           // C: Loại kế toán
            phanBo: row[3] || '',               // D: Phân bổ
            loaiKhoanChi: row[4] || '',         // E: Loại khoản chi
            danhMucChung: row[5] || '',         // F: Danh mục chung
            tenSanPham: row[6] || '',           // G: Tên sản phẩm/Dịch vụ
            phienBan: row[7] || '',             // H: Phiên bản/Gói dịch vụ
            soTien: parseFloat(row[8]) || 0,    // I: Số tiền
            donViTienTe: row[9] || '',          // J: Đơn vị tiền tệ
            nganHang: row[10] || '',            // K: Ngân hàng/Ví
            thongTinThe: row[11] || '',         // L: Thông tin thẻ/Tài khoản
            phuongThucChi: row[12] || '',       // M: Phương thức chi
            ngayTaiTuc: row[13] || '',          // N: Ngày tái tục
            nguoiNhan: row[14] || '',           // O: Người nhận hoặc nhà cung cấp
            trangThai: row[15] || '',           // P: Trạng thái
            ghiChu: row[16] || '',              // Q: Ghi chú
            tenChuan: row[17] || '',            // R: Tên chuẩn
            tenNhanVien: row[18] || '',         // S: Tên nhân viên
            maNhanVien: row[19] || ''           // T: Mã nhân viên
        }));
    }

    // Xử lý và kết hợp dữ liệu
    processAndCombineData() {
        
        // Tạo map dữ liệu phần mềm theo tên chuẩn
        const softwareMap = new Map();
        
        // Xử lý dữ liệu sheet PhanMem
        this.softwareAccounts.forEach(software => {
            const key = software.tenChuan || software.tenPhanMem;
            if (!softwareMap.has(key)) {
                softwareMap.set(key, {
                    ...software,
                    totalRevenue: 0,
                    totalCost: 0,
                    profit: 0,
                    roi: 0,
                    utilizationRate: 0,
                    transactions: [],
                    expenses: [],
                    status: 'active',
                    expiryDate: null,
                    alertLevel: 'normal'
            }
        });

        // Kết hợp dữ liệu từ sheet GiaoDich
        this.transactions.forEach(transaction => {
            const key = transaction.tenChuan;
            if (softwareMap.has(key)) {
                const software = softwareMap.get(key);
                software.transactions.push(transaction);
                software.totalRevenue += transaction.doanhThu || 0;
                
                // Cập nhật ngày hết hạn từ giao dịch gần nhất
                if (transaction.ngayKetThuc) {
                    const expiryDate = new Date(transaction.ngayKetThuc);
                    if (!software.expiryDate || expiryDate > new Date(software.expiryDate)) {
                        software.expiryDate = transaction.ngayKetThuc;
                    }
                }
            }
        });

        // Kết hợp dữ liệu từ sheet ChiPhi
        this.expenses.forEach(expense => {
            const key = expense.tenChuan;
            if (softwareMap.has(key)) {
                const software = softwareMap.get(key);
                software.expenses.push(expense);
                software.totalCost += expense.soTien || 0;
                
                // Cập nhật ngày tái tục từ chi phí
                if (expense.ngayTaiTuc) {
                    if (!software.expiryDate || new Date(expense.ngayTaiTuc) > new Date(software.expiryDate)) {
                        software.expiryDate = expense.ngayTaiTuc;
                    }
                }
            }
        });

        // Tính toán các chỉ số cho từng phần mềm
        softwareMap.forEach((software, key) => {
            // Tính lợi nhuận và ROI
            software.profit = software.totalRevenue - software.totalCost;
            software.roi = software.totalCost > 0 ? (software.profit / software.totalCost) * 100 : 0;
            
            // Tính tỷ lệ sử dụng
            if (software.soNguoiDungChoPhep > 0) {
                software.utilizationRate = (software.soNguoiDungDangHoatDong / software.soNguoiDungChoPhep) * 100;
            }
            
            // Xác định trạng thái và mức cảnh báo
            software.status = this.determineStatus(software);
            software.alertLevel = this.determineAlertLevel(software);
        });

        // Chuyển đổi map thành array và sắp xếp
        this.filteredAccounts = Array.from(softwareMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
        
    }

    // Xác định trạng thái phần mềm
    determineStatus(software) {
        if (!software.expiryDate) return 'active';
        
        const today = new Date();
        const expiryDate = new Date(software.expiryDate);
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry < 0) return 'expired';
        if (daysToExpiry <= 7) return 'expiring';
        return 'active';
    }

    // Xác định mức cảnh báo
    determineAlertLevel(software) {
        const status = this.determineStatus(software);
        const utilizationRate = software.utilizationRate || 0;
        
        if (status === 'expired' || utilizationRate < 30) return 'high';
        if (status === 'expiring' || utilizationRate < 60) return 'medium';
        return 'normal';
    }

    // Tạo dữ liệu mẫu nếu không có dữ liệu thực
    generateMockData() {
        
        this.filteredAccounts = [
            {
                id: 1,
                tenPhanMem: 'Microsoft Office 365',
                goiPhanMem: 'Business Premium',
                tenTaiKhoan: 'company@domain.com',
                soNguoiDungChoPhep: 50,
                soNguoiDungDangHoatDong: 42,
                utilizationRate: 84,
                totalRevenue: 25000000,
                totalCost: 18000000,
                profit: 7000000,
                roi: 38.9,
                expiryDate: '2024-12-31',
                status: 'active',
                alertLevel: 'normal',
                tenChuan: 'office365'
            },
            {
                id: 2,
                tenPhanMem: 'Adobe Creative Cloud',
                goiPhanMem: 'Team',
                tenTaiKhoan: 'design@domain.com',
                soNguoiDungChoPhep: 10,
                soNguoiDungDangHoatDong: 8,
                utilizationRate: 80,
                totalRevenue: 15000000,
                totalCost: 12000000,
                profit: 3000000,
                roi: 25.0,
                expiryDate: '2024-07-15',
                status: 'expiring',
                alertLevel: 'medium',
                tenChuan: 'adobe_cc'
            },
            {
                id: 3,
                tenPhanMem: 'Google Workspace',
                goiPhanMem: 'Business Standard',
                tenTaiKhoan: 'admin@domain.com',
                soNguoiDungChoPhep: 30,
                soNguoiDungDangHoatDong: 28,
                utilizationRate: 93.3,
                totalRevenue: 18000000,
                totalCost: 10800000,
                profit: 7200000,
                roi: 66.7,
                expiryDate: '2025-03-20',
                status: 'active',
                alertLevel: 'normal',
                tenChuan: 'google_workspace'
            },
            {
                id: 4,
                tenPhanMem: 'Slack',
                goiPhanMem: 'Pro',
                tenTaiKhoan: 'team@domain.com',
                soNguoiDungChoPhep: 25,
                soNguoiDungDangHoatDong: 15,
                utilizationRate: 60,
                totalRevenue: 8000000,
                totalCost: 6000000,
                profit: 2000000,
                roi: 33.3,
                expiryDate: '2024-06-30',
                status: 'expiring',
                alertLevel: 'medium',
                tenChuan: 'slack_pro'
            },
            {
                id: 5,
                tenPhanMem: 'Zoom',
                goiPhanMem: 'Business',
                tenTaiKhoan: 'meetings@domain.com',
                soNguoiDungChoPhep: 20,
                soNguoiDungDangHoatDong: 5,
                utilizationRate: 25,
                totalRevenue: 4000000,
                totalCost: 4800000,
                profit: -800000,
                roi: -16.7,
                expiryDate: '2024-05-10',
                status: 'expired',
                alertLevel: 'high',
                tenChuan: 'zoom_business'
            }
        ];
    }

    // Render KPI Dashboard
    renderKPIDashboard() {
        const container = document.querySelector('.software-kpi-dashboard');
        if (!container) return;

        const totalAccounts = this.filteredAccounts.length;
        const totalRevenue = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalRevenue, 0);
        const totalCost = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalCost, 0);
        const totalProfit = totalRevenue - totalCost;
        const avgUtilization = totalAccounts > 0 ? 
            this.filteredAccounts.reduce((sum, acc) => sum + acc.utilizationRate, 0) / totalAccounts : 0;
        const activeAccounts = this.filteredAccounts.filter(acc => acc.status === 'active').length;
        const expiringAccounts = this.filteredAccounts.filter(acc => acc.status === 'expiring').length;
        const expiredAccounts = this.filteredAccounts.filter(acc => acc.status === 'expired').length;

        container.innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card revenue">
                    <div class="kpi-icon">💰</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalRevenue)}</div>
                        <div class="kpi-label">Tổng doanh thu</div>
                        <div class="kpi-trend positive">+${((totalRevenue / (totalRevenue + totalCost)) * 100).toFixed(1)}% tỷ suất</div>
                    </div>
                </div>

                <div class="kpi-card cost">
                    <div class="kpi-icon">💸</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalCost)}</div>
                        <div class="kpi-label">Tổng chi phí</div>
                        <div class="kpi-trend neutral">${totalAccounts} tài khoản</div>
                    </div>
                </div>

                <div class="kpi-card profit">
                    <div class="kpi-icon">📈</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalProfit)}</div>
                        <div class="kpi-label">Lợi nhuận</div>
                        <div class="kpi-trend ${totalProfit >= 0 ? 'positive' : 'negative'}">
                            ${totalProfit >= 0 ? '+' : ''}${((totalProfit / totalCost) * 100).toFixed(1)}% ROI
                        </div>
                    </div>
                </div>

                <div class="kpi-card utilization">
                    <div class="kpi-icon">👥</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${avgUtilization.toFixed(1)}%</div>
                        <div class="kpi-label">Tỷ lệ sử dụng TB</div>
                        <div class="kpi-trend ${avgUtilization >= 80 ? 'positive' : avgUtilization >= 60 ? 'neutral' : 'negative'}">
                            Mục tiêu: 80%
                        </div>
                    </div>
                </div>

                <div class="kpi-card accounts">
                    <div class="kpi-icon">📊</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${totalAccounts}</div>
                        <div class="kpi-label">Tổng tài khoản</div>
                        <div class="kpi-trend neutral">${activeAccounts} hoạt động</div>
                    </div>
                </div>

                <div class="kpi-card alerts">
                    <div class="kpi-icon">🚨</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${expiringAccounts + expiredAccounts}</div>
                        <div class="kpi-label">Cần chú ý</div>
                        <div class="kpi-trend ${expiringAccounts + expiredAccounts > 0 ? 'negative' : 'positive'}">
                            ${expiredAccounts} hết hạn, ${expiringAccounts} sắp hết hạn
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Overview Cards
    renderOverviewCards() {
        const container = document.querySelector('.overview-cards');
        if (!container) return;

        // Thống kê theo phần mềm
        const softwareStats = {};
        this.filteredAccounts.forEach(acc => {
            const software = acc.tenPhanMem;
            if (!softwareStats[software]) {
                softwareStats[software] = {
                    accounts: 0,
                    revenue: 0,
                    cost: 0,
                    users: 0
                };
            }
            softwareStats[software].accounts++;
            softwareStats[software].revenue += acc.totalRevenue;
            softwareStats[software].cost += acc.totalCost;
            softwareStats[software].users += acc.soNguoiDungChoPhep;
        });

        const topSoftware = Object.entries(softwareStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 3);

        container.innerHTML = `
            <div class="overview-card">
                <h4>🏆 Top phần mềm theo doanh thu</h4>
                <div class="top-list">
                    ${topSoftware.map((([name, stats], index) => `
                        <div class="top-item">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${name}</span>
                            <span class="value">${formatCurrency(stats.revenue)}</span>
                        </div>
                    `)).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>📊 Phân bổ chi phí</h4>
                <div class="cost-breakdown">
                    ${Object.entries(softwareStats).slice(0, 4).map(([name, stats]) => `
                        <div class="cost-item">
                            <div class="cost-info">
                                <span class="software-name">${name}</span>
                                <span class="cost-amount">${formatCurrency(stats.cost)}</span>
                            </div>
                            <div class="cost-bar">
                                <div class="cost-fill" style="width: ${(stats.cost / Object.values(softwareStats).reduce((sum, s) => sum + s.cost, 0)) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>⚠️ Cảnh báo tài khoản</h4>
                <div class="alert-summary">
                    <div class="alert-item high">
                        <span class="alert-count">${this.filteredAccounts.filter(acc => acc.alertLevel === 'high').length}</span>
                        <span class="alert-label">Mức độ cao</span>
                    </div>
                    <div class="alert-item medium">
                        <span class="alert-count">${this.filteredAccounts.filter(acc => acc.alertLevel === 'medium').length}</span>
                        <span class="alert-label">Mức độ trung bình</span>
                    </div>
                    <div class="alert-item normal">
                        <span class="alert-count">${this.filteredAccounts.filter(acc => acc.alertLevel === 'normal').length}</span>
                        <span class="alert-label">Bình thường</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Analytics Charts
    renderAnalyticsCharts() {
        setTimeout(() => {
            this.renderRevenueChart();
            this.renderCostRevenueChart();
            this.renderUserUtilizationChart();
            this.renderMarketShareChart();
        }, 100);
    }

    renderRevenueChart() {
        const ctx = document.getElementById('softwareRevenueChart');
        if (!ctx) return;

        // Chuẩn bị dữ liệu doanh thu theo phần mềm
        const softwareRevenue = {};
        this.filteredAccounts.forEach(acc => {
            const name = acc.tenPhanMem;
            softwareRevenue[name] = (softwareRevenue[name] || 0) + acc.totalRevenue;
        });

        const labels = Object.keys(softwareRevenue);
        const data = Object.values(softwareRevenue);

        if (this.charts.revenueChart) {
            this.charts.revenueChart.destroy();
        }

        this.charts.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: data,
                    backgroundColor: [
                        '#4f46e5',
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Doanh thu: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    renderCostRevenueChart() {
        const ctx = document.getElementById('costRevenueChart');
        if (!ctx) return;

        // Tạo dữ liệu so sánh chi phí vs doanh thu
        const labels = this.filteredAccounts.map(acc => acc.tenPhanMem).slice(0, 6);
        const revenueData = this.filteredAccounts.map(acc => acc.totalRevenue).slice(0, 6);
        const costData = this.filteredAccounts.map(acc => acc.totalCost).slice(0, 6);

        if (this.charts.costRevenueChart) {
            this.charts.costRevenueChart.destroy();
        }

        this.charts.costRevenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: revenueData,
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        label: 'Chi phí',
                        data: costData,
                        backgroundColor: '#ef4444',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    renderUserUtilizationChart() {
        const ctx = document.getElementById('userUtilizationChart');
        if (!ctx) return;

        // Phân nhóm theo tỷ lệ sử dụng
        const utilizationGroups = {
            'Cao (80-100%)': this.filteredAccounts.filter(acc => acc.utilizationRate >= 80).length,
            'Trung bình (60-79%)': this.filteredAccounts.filter(acc => acc.utilizationRate >= 60 && acc.utilizationRate < 80).length,
            'Thấp (30-59%)': this.filteredAccounts.filter(acc => acc.utilizationRate >= 30 && acc.utilizationRate < 60).length,
            'Rất thấp (<30%)': this.filteredAccounts.filter(acc => acc.utilizationRate < 30).length
        };

        if (this.charts.utilizationChart) {
            this.charts.utilizationChart.destroy();
        }

        this.charts.utilizationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(utilizationGroups),
                datasets: [{
                    data: Object.values(utilizationGroups),
                    backgroundColor: ['#10b981', '#f59e0b', '#fb923c', '#ef4444'],
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

    renderMarketShareChart() {
        const ctx = document.getElementById('softwareMarketShareChart');
        if (!ctx) return;

        // Tính thị phần theo doanh thu
        const totalRevenue = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalRevenue, 0);
        const marketShare = this.filteredAccounts.slice(0, 5).map(acc => ({
            name: acc.tenPhanMem,
            revenue: acc.totalRevenue,
            share: (acc.totalRevenue / totalRevenue) * 100
        }));

        if (this.charts.marketShareChart) {
            this.charts.marketShareChart.destroy();
        }

        this.charts.marketShareChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: marketShare.map(item => item.name),
                datasets: [{
                    data: marketShare.map(item => item.share),
                    backgroundColor: [
                        '#4f46e5',
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const item = marketShare[context.dataIndex];
                                return `${item.name}: ${item.share.toFixed(1)}% (${formatCurrency(item.revenue)})`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render Software Accounts Table
    renderSoftwareAccountsTable() {
        const tableBody = document.querySelector('#softwareAccountsTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = this.filteredAccounts.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedData.map(account => `
            <tr class="table-row ${account.alertLevel}">
                <td>
                    <div class="software-info">
                        <strong class="software-name">${account.tenPhanMem}</strong>
                        <span class="software-package">${account.goiPhanMem}</span>
                    </div>
                </td>
                <td>
                    <div class="account-info">
                        <strong class="account-name">${account.tenTaiKhoan}</strong>
                        <span class="account-id">${account.idSheetTaiKhoan || 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <div class="user-stats">
                        <span class="user-count">${account.soNguoiDungDangHoatDong}/${account.soNguoiDungChoPhep}</span>
                        <span class="user-label">người dùng</span>
                    </div>
                </td>
                <td>
                    <div class="utilization-display">
                        <div class="utilization-bar">
                            <div class="utilization-fill" style="width: ${account.utilizationRate}%"></div>
                        </div>
                        <span class="utilization-text">${account.utilizationRate.toFixed(1)}%</span>
                    </div>
                </td>
                <td class="revenue-cell">${formatCurrency(account.totalRevenue)}</td>
                <td class="cost-cell">${formatCurrency(account.totalCost)}</td>
                <td class="profit-cell ${account.profit >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(account.profit)}
                    <div class="roi-text">(${account.roi.toFixed(1)}%)</div>
                </td>
                <td>
                    <span class="expiry-date ${account.status}">
                        ${account.expiryDate ? formatDate(account.expiryDate) : 'N/A'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${account.status}">
                        ${this.getStatusText(account.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="softwareManagement.viewAccount(${account.id})" title="Xem chi tiết">
                            👁️
                        </button>
                        <button class="action-btn edit" onclick="softwareManagement.editAccount(${account.id})" title="Chỉnh sửa">
                            ✏️
                        </button>
                        <button class="action-btn refresh" onclick="softwareManagement.refreshAccount(${account.id})" title="Làm mới">
                            🔄
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    // Render Details Section
    renderDetailsSection() {
        this.renderRevenueAnalysis();
        this.renderCostAnalysis();
        this.renderProfitAnalysis();
        this.renderUserManagement();
    }

    renderRevenueAnalysis() {
        const container = document.querySelector('#revenueAnalysisContent');
        if (!container) return;

        const totalRevenue = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalRevenue, 0);
        const avgRevenue = totalRevenue / this.filteredAccounts.length;
        const topRevenue = [...this.filteredAccounts].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng doanh thu:</span>
                    <span class="summary-value">${formatCurrency(totalRevenue)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">TB mỗi tài khoản:</span>
                    <span class="summary-value">${formatCurrency(avgRevenue)}</span>
                </div>
            </div>
            <div class="top-performers">
                <h5>Top 3 doanh thu cao nhất:</h5>
                ${topRevenue.map((acc, index) => `
                    <div class="performer-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${acc.tenPhanMem}</span>
                        <span class="value">${formatCurrency(acc.totalRevenue)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCostAnalysis() {
        const container = document.querySelector('#costAnalysisContent');
        if (!container) return;

        const totalCost = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalCost, 0);
        const avgCost = totalCost / this.filteredAccounts.length;
        const highestCost = [...this.filteredAccounts].sort((a, b) => b.totalCost - a.totalCost).slice(0, 3);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng chi phí:</span>
                    <span class="summary-value">${formatCurrency(totalCost)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">TB mỗi tài khoản:</span>
                    <span class="summary-value">${formatCurrency(avgCost)}</span>
                </div>
            </div>
            <div class="top-performers">
                <h5>Top 3 chi phí cao nhất:</h5>
                ${highestCost.map((acc, index) => `
                    <div class="performer-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${acc.tenPhanMem}</span>
                        <span class="value">${formatCurrency(acc.totalCost)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProfitAnalysis() {
        const container = document.querySelector('#profitAnalysisContent');
        if (!container) return;

        const totalProfit = this.filteredAccounts.reduce((sum, acc) => sum + acc.profit, 0);
        const profitableAccounts = this.filteredAccounts.filter(acc => acc.profit > 0);
        const topProfitable = [...this.filteredAccounts].sort((a, b) => b.roi - a.roi).slice(0, 3);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng lợi nhuận:</span>
                    <span class="summary-value ${totalProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(totalProfit)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Tài khoản có lãi:</span>
                    <span class="summary-value">${profitableAccounts.length}/${this.filteredAccounts.length}</span>
                </div>
            </div>
            <div class="top-performers">
                <h5>Top 3 ROI cao nhất:</h5>
                ${topProfitable.map((acc, index) => `
                    <div class="performer-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${acc.tenPhanMem}</span>
                        <span class="value ${acc.roi >= 0 ? 'positive' : 'negative'}">${acc.roi.toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderUserManagement() {
        const container = document.querySelector('#userManagementContent');
        if (!container) return;

        const totalUsers = this.filteredAccounts.reduce((sum, acc) => sum + acc.soNguoiDungChoPhep, 0);
        const activeUsers = this.filteredAccounts.reduce((sum, acc) => sum + acc.soNguoiDungDangHoatDong, 0);
        const underutilized = this.filteredAccounts.filter(acc => acc.utilizationRate < 60);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng người dùng:</span>
                    <span class="summary-value">${activeUsers}/${totalUsers}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Tỷ lệ sử dụng:</span>
                    <span class="summary-value">${((activeUsers / totalUsers) * 100).toFixed(1)}%</span>
                </div>
            </div>
            <div class="underutilized-accounts">
                <h5>Tài khoản sử dụng thấp (<60%):</h5>
                ${underutilized.slice(0, 5).map(acc => `
                    <div class="underutilized-item">
                        <span class="software-name">${acc.tenPhanMem}</span>
                        <span class="utilization-rate">${acc.utilizationRate.toFixed(1)}%</span>
                        <button class="optimize-btn" onclick="softwareManagement.optimizeAccount(${acc.id})">Tối ưu</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render Alerts Section
    renderAlertsSection() {
        const container = document.querySelector('#softwareAlertsContent');
        if (!container) return;

        const alerts = [];

        // Cảnh báo hết hạn
        this.filteredAccounts.forEach(acc => {
            if (acc.status === 'expired') {
                alerts.push({
                    type: 'error',
                    icon: '❌',
                    title: `${acc.tenPhanMem} đã hết hạn`,
                    message: `Tài khoản ${acc.tenTaiKhoan} đã hết hạn từ ${formatDate(acc.expiryDate)}`,
                    action: 'Gia hạn ngay',
                    priority: 'high'
                });
            } else if (acc.status === 'expiring') {
                const daysLeft = Math.ceil((new Date(acc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                alerts.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: `${acc.tenPhanMem} sắp hết hạn`,
                    message: `Còn ${daysLeft} ngày (${formatDate(acc.expiryDate)})`,
                    action: 'Lên kế hoạch',
                    priority: 'medium'
                });
            }

            // Cảnh báo sử dụng thấp
            if (acc.utilizationRate < 30) {
                alerts.push({
                    type: 'info',
                    icon: '📊',
                    title: `${acc.tenPhanMem} sử dụng rất thấp`,
                    message: `Chỉ ${acc.utilizationRate.toFixed(1)}% công suất`,
                    action: 'Tối ưu hóa',
                    priority: 'low'
                });
            }

            // Cảnh báo lỗ
            if (acc.profit < 0) {
                alerts.push({
                    type: 'error',
                    icon: '📉',
                    title: `${acc.tenPhanMem} đang lỗ`,
                    message: `Lỗ ${formatCurrency(Math.abs(acc.profit))} (ROI: ${acc.roi.toFixed(1)}%)`,
                    action: 'Xem xét',
                    priority: 'high'
                });
            }
        });

        // Sắp xếp theo priority
        alerts.sort((a, b) => {
            const priority = { high: 3, medium: 2, low: 1 };
            return priority[b.priority] - priority[a.priority];
        });

        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">✅ Không có cảnh báo nào</div>';
            return;
        }

        container.innerHTML = `
            <div class="alerts-list">
                ${alerts.slice(0, 10).map(alert => `
                    <div class="alert-item ${alert.type}">
                        <div class="alert-icon">${alert.icon}</div>
                        <div class="alert-content">
                            <div class="alert-title">${alert.title}</div>
                            <div class="alert-message">${alert.message}</div>
                        </div>
                        <button class="alert-action">${alert.action}</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('#softwareSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter functionality
        const softwareFilter = document.querySelector('#softwareFilter');
        if (softwareFilter) {
            softwareFilter.addEventListener('change', (e) => {
                this.handleSoftwareFilter(e.target.value);
            });
        }

        const statusFilter = document.querySelector('#statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleStatusFilter(e.target.value);
            });
        }

        // Refresh button
        const refreshBtn = document.querySelector('#refreshSoftwareData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Export button
        const exportBtn = document.querySelector('#exportSoftwareData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.closest('.quick-action-btn').id);
            });
        });

        // Modal controls
        const modal = document.querySelector('#softwareAccountModal');
        const closeBtn = document.querySelector('#closeSoftwareModal');
        const cancelBtn = document.querySelector('#cancelSoftwareModal');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    }

    // Helper methods
    getStatusText(status) {
        const statusTexts = {
            'active': 'Hoạt động',
            'expiring': 'Sắp hết hạn',
            'expired': 'Đã hết hạn'
        };
        return statusTexts[status] || 'Không xác định';
    }

    updatePagination() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;

        const totalItems = this.filteredAccounts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        container.innerHTML = `
            <div class="pagination-info">
                Hiển thị ${(this.currentPage - 1) * this.itemsPerPage + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} 
                trong tổng số ${totalItems} tài khoản
            </div>
            <div class="pagination-controls">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        onclick="softwareManagement.goToPage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>‹</button>
                
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const page = Math.max(1, this.currentPage - 2) + i;
                    if (page <= totalPages) {
                        return `<button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                                       onclick="softwareManagement.goToPage(${page})">${page}</button>`;
                    }
                    return '';
                }).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                        onclick="softwareManagement.goToPage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>›</button>
            </div>
        `;
    }

    // Action methods
    handleSearch(searchTerm) {
        // Implementation for search functionality
        this.applyFilters();
    }

    handleSoftwareFilter(software) {
        // Implementation for software filtering
        this.applyFilters();
    }

    handleStatusFilter(status) {
        // Implementation for status filtering
        this.applyFilters();
    }

    applyFilters() {
        // Apply all filters and re-render table
        this.currentPage = 1;
        this.renderSoftwareAccountsTable();
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderSoftwareAccountsTable();
    }

    viewAccount(accountId) {
        const account = this.filteredAccounts.find(acc => acc.id === accountId);
        if (account) {
            this.showAccountModal(account);
        }
    }

    editAccount(accountId) {
        const account = this.filteredAccounts.find(acc => acc.id === accountId);
        if (account) {
            this.showAccountModal(account, true);
        }
    }

    refreshAccount(accountId) {
        // Implementation for refreshing specific account
        console.log('Refreshing account:', accountId);
    }

    optimizeAccount(accountId) {
        // Implementation for optimizing account usage
        console.log('Optimizing account:', accountId);
    }

    showAccountModal(account, editMode = false) {
        const modal = document.querySelector('#softwareAccountModal');
        const title = document.querySelector('#modalTitle');
        const content = document.querySelector('#softwareAccountDetails');
        
        if (!modal || !title || !content) return;

        title.textContent = editMode ? 'Chỉnh sửa tài khoản' : 'Chi tiết tài khoản';
        
        content.innerHTML = `
            <div class="account-detail-grid">
                <div class="detail-item">
                    <label>Tên phần mềm:</label>
                    <span>${account.tenPhanMem}</span>
                </div>
                <div class="detail-item">
                    <label>Gói phần mềm:</label>
                    <span>${account.goiPhanMem}</span>
                </div>
                <div class="detail-item">
                    <label>Tên tài khoản:</label>
                    <span>${account.tenTaiKhoan}</span>
                </div>
                <div class="detail-item">
                    <label>Người dùng:</label>
                    <span>${account.soNguoiDungDangHoatDong}/${account.soNguoiDungChoPhep}</span>
                </div>
                <div class="detail-item">
                    <label>Tỷ lệ sử dụng:</label>
                    <span>${account.utilizationRate.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <label>Doanh thu:</label>
                    <span>${formatCurrency(account.totalRevenue)}</span>
                </div>
                <div class="detail-item">
                    <label>Chi phí:</label>
                    <span>${formatCurrency(account.totalCost)}</span>
                </div>
                <div class="detail-item">
                    <label>Lợi nhuận:</label>
                    <span class="${account.profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(account.profit)}</span>
                </div>
                <div class="detail-item">
                    <label>ROI:</label>
                    <span class="${account.roi >= 0 ? 'positive' : 'negative'}">${account.roi.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <label>Ngày hết hạn:</label>
                    <span>${account.expiryDate ? formatDate(account.expiryDate) : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Trạng thái:</label>
                    <span class="status-badge ${account.status}">${this.getStatusText(account.status)}</span>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.querySelector('#softwareAccountModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleQuickAction(actionId) {
        switch (actionId) {
            case 'bulkRenewal':
                console.log('Bulk renewal action');
                break;
            case 'utilizationOptimization':
                console.log('Utilization optimization action');
                break;
            case 'costOptimization':
                console.log('Cost optimization action');
                break;
            case 'generateSoftwareReport':
                this.generateReport();
                break;
            case 'accountSecurity':
                console.log('Account security action');
                break;
            case 'licenseCompliance':
                console.log('License compliance action');
                break;
        }
    }

    exportToExcel() {
        // Implementation for Excel export
        const headers = ['Phần mềm', 'Gói', 'Tài khoản', 'Người dùng', 'Tỷ lệ sử dụng', 'Doanh thu', 'Chi phí', 'Lợi nhuận', 'ROI', 'Trạng thái'];
        const data = [headers];
        
        this.filteredAccounts.forEach(acc => {
            data.push([
                acc.tenPhanMem,
                acc.goiPhanMem,
                acc.tenTaiKhoan,
                `${acc.soNguoiDungDangHoatDong}/${acc.soNguoiDungChoPhep}`,
                `${acc.utilizationRate.toFixed(1)}%`,
                acc.totalRevenue,
                acc.totalCost,
                acc.profit,
                `${acc.roi.toFixed(1)}%`,
                this.getStatusText(acc.status)
            ]);
        });
        
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `software-accounts-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    generateReport() {
        // Implementation for generating comprehensive report
        console.log('Generating comprehensive software report...');
    }

    async refresh() {
        this.isInitialized = false;
        await this.initialize();
    }
}

// Export instance for global use
export const softwareManagement = new SoftwareManagement();