// Employee Report Core Module
// Xử lý dữ liệu và phân tích hiệu suất nhân viên từ GiaoDich và ChiPhi

import { formatDate } from '../../formatDate.js';
import { formatDateTime } from '../../formatDateTime.js';
import { formatCurrency } from '../../statistics/formatters.js';
import { EmployeeDataProcessor } from './employeeDataProcessor.js';
import { EmployeeCharts } from './employeeCharts.js';

export class EmployeeReportCore {
    constructor() {
        this.employees = [];
        this.transactions = [];
        this.expenses = [];
        this.filteredEmployees = [];
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.isInitialized = false;
        this.charts = {};
        this.kpiTargets = new Map(); // Lưu KPI targets cho nhân viên
        
        // Initialize new modules
        this.dataProcessor = new EmployeeDataProcessor();
        this.chartManager = new EmployeeCharts();
        this.processedData = {
            employees: [],
            departments: [],
            kpis: {},
            topPerformers: [],
            alerts: []
        };
    }

    // Khởi tạo module
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // console.log('🔧 Initializing Employee Report with actual sheet data...');
            
            this.setupEventListeners();
            await this.loadAllData();
            this.processEmployeeData();
            this.renderKPIDashboard();
            this.renderOverviewCards();
            this.renderAnalyticsCharts();
            this.renderEmployeePerformanceTable();
            this.renderDetailsSection();
            this.renderGoalsSection();
            this.renderRankingSection();
            
            this.isInitialized = true;
            // console.log('✅ Employee Report initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Employee Report:', error);
        }
    }

    // Tải tất cả dữ liệu từ các sheet
    async loadAllData() {
        try {
            // Lấy dữ liệu từ các sheet hiện có
            this.transactions = this.extractTransactionData();
            this.expenses = this.extractExpenseData();
            
// console.log('📊 Employee data loaded:', {

  //                 transactions: this.transactions.length,
  //                 expenses: this.expenses.length
  //             });
  //             
  //         } catch (error) {
  //             console.error('❌ Error loading employee data:', error);
  //             // Fallback to mock data if real data is not available
  //             this.generateMockData();
  //         }
  //     }
  // 
  //     // Trích xuất dữ liệu từ sheet GiaoDich
  //     extractTransactionData() {
  //         const rawData = this.transactions || [];
  //         
  //         // Handle both array and object formats
  //         return rawData.map((row, index) => {
  //             // If data is already in object format
  //             if (typeof row === 'object' && !Array.isArray(row)) {
  //                 return {
  //                     id: index + 1,
  //                     maGiaoDich: row.maGiaoDich || row.transactionCode || '',
  //                     ngayGiaoDich: row.ngayGiaoDich || row.date || '',
  //                     loaiGiaoDich: row.loaiGiaoDich || row.type || '',
  //                     tenKhachHang: row.tenKhachHang || row.customerName || '',
  //                     email: row.email || '',
  //                     lienHe: row.lienHe || row.contact || '',
  //                     soThangDangKy: parseInt(row.soThangDangKy || row.months || 0),
  //                     ngayBatDau: row.ngayBatDau || row.startDate || '',
  //                     ngayKetThuc: row.ngayKetThuc || row.endDate || '',
  //                     soThietBi: parseInt(row.soThietBi || row.devices || 0),
  //                     tenPhanMem: row.tenPhanMem || row.software || '',
  //                     goiPhanMem: row.goiPhanMem || row.package || '',
  //                     tenTaiKhoan: row.tenTaiKhoan || row.accountName || '',
  //                     idSheetTaiKhoan: row.idSheetTaiKhoan || row.sheetId || '',
  //                     capNhatCookie: row.capNhatCookie || row.updateCookie || '',
  //                     thongTinDonHang: row.thongTinDonHang || row.orderInfo || '',
  //                     doanhThu: parseFloat(row.doanhThu || row.revenue || 0),
  //                     hoaHong: parseFloat(row.hoaHong || row.commission || 0),
  //                     ghiChu: row.ghiChu || row.note || '',
  //                     tenChuan: row.tenChuan || row.standardName || '',
  //                     tenNhanVien: row.tenNhanVien || row.employeeName || '',
  //                     maNhanVien: row.maNhanVien || row.employeeCode || ''
  //                 };
            }
            
            // If data is in array format
            return {
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
            };
        });
    }

    // Trích xuất dữ liệu từ sheet ChiPhi
    extractExpenseData() {
        const rawData = this.expenses || [];
        
        // Handle both array and object formats
        return rawData.map((row, index) => {
            // If data is already in object format
            if (typeof row === 'object' && !Array.isArray(row)) {
                return {
                    id: index + 1,
                    maChiPhi: row.maChiPhi || row.expenseCode || '',
                    ngayChi: row.ngayChi || row.date || '',
                    loaiKeToan: row.loaiKeToan || row.accountingType || '',
                    phanBo: row.phanBo || row.allocation || '',
                    loaiKhoanChi: row.loaiKhoanChi || row.expenseType || '',
                    danhMucChung: row.danhMucChung || row.category || '',
                    tenSanPham: row.tenSanPham || row.productName || '',
                    phienBan: row.phienBan || row.version || '',
                    soTien: parseFloat(row.soTien || row.amount || 0),
                    donViTienTe: row.donViTienTe || row.currency || 'VND',
                    nganHang: row.nganHang || row.bank || '',
                    thongTinThe: row.thongTinThe || row.cardInfo || '',
                    phuongThucChi: row.phuongThucChi || row.paymentMethod || '',
                    ngayTaiTuc: row.ngayTaiTuc || row.renewalDate || '',
                    nguoiNhan: row.nguoiNhan || row.recipient || '',
                    trangThai: row.trangThai || row.status || '',
                    ghiChu: row.ghiChu || row.note || '',
                    tenChuan: row.tenChuan || row.standardName || '',
                    tenNhanVien: row.tenNhanVien || row.employeeName || '',
                    maNhanVien: row.maNhanVien || row.employeeCode || ''
                };
            }
            
            // If data is in array format
            return {
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
            };
        });
    }

    // Method mới để xử lý tất cả dữ liệu sử dụng EmployeeDataProcessor
    processAllData(transactions = [], expenses = []) {
        // console.log('🔄 Processing all employee data...');
        
        // Use the new data processor
        this.processedData = this.dataProcessor.processEmployeeData(transactions, expenses);
        
        // Update local references
        this.employees = this.processedData.employees;
        this.filteredEmployees = [...this.employees];
        
        // console.log('✅ All employee data processed:', this.processedData);
        return this.processedData;
    }

    // Xử lý và tính toán dữ liệu nhân viên (legacy method - keep for compatibility)
    processEmployeeData() {
        // console.log('🔄 Processing employee data...');
        
        // Tạo map nhân viên
        const employeeMap = new Map();
        
        // Xử lý dữ liệu từ giao dịch
        this.transactions.forEach(transaction => {
            const employeeKey = transaction.maNhanVien || transaction.tenNhanVien;
            if (!employeeKey) return;
            
            if (!employeeMap.has(employeeKey)) {
                employeeMap.set(employeeKey, {
                    maNhanVien: transaction.maNhanVien,
                    tenNhanVien: transaction.tenNhanVien,
                    department: this.getDepartmentFromEmployee(transaction.tenNhanVien),
                    totalRevenue: 0,
                    totalCommission: 0,
                    totalExpenses: 0,
                    transactionCount: 0,
                    transactions: [],
                    expenses: [],
                    lastActivity: null,
                    performanceRatio: 0,
                    avgTransactionValue: 0,
                    monthlyRevenue: {},
                    monthlyTransactions: {},
                    rank: 0
                });
            }
            
            const employee = employeeMap.get(employeeKey);
            employee.totalRevenue += transaction.doanhThu || 0;
            employee.totalCommission += transaction.hoaHong || 0;
            employee.transactionCount++;
            employee.transactions.push(transaction);
            
            // Cập nhật hoạt động cuối
            const transactionDate = new Date(transaction.ngayGiaoDich);
            if (!employee.lastActivity || transactionDate > new Date(employee.lastActivity)) {
                employee.lastActivity = transaction.ngayGiaoDich;
            }
            
            // Cập nhật dữ liệu theo tháng
            const monthKey = transaction.ngayGiaoDich ? transaction.ngayGiaoDich.substring(0, 7) : new Date().toISOString().substring(0, 7);
            employee.monthlyRevenue[monthKey] = (employee.monthlyRevenue[monthKey] || 0) + (transaction.doanhThu || 0);
            employee.monthlyTransactions[monthKey] = (employee.monthlyTransactions[monthKey] || 0) + 1;
        });

        // Xử lý dữ liệu từ chi phí
        this.expenses.forEach(expense => {
            const employeeKey = expense.maNhanVien || expense.tenNhanVien;
            if (!employeeKey || !employeeMap.has(employeeKey)) return;
            
            const employee = employeeMap.get(employeeKey);
            employee.totalExpenses += expense.soTien || 0;
            employee.expenses.push(expense);
        });

        // Tính toán các chỉ số
        employeeMap.forEach((employee, key) => {
            // Tính giá trị giao dịch trung bình
            employee.avgTransactionValue = employee.transactionCount > 0 ? 
                employee.totalRevenue / employee.transactionCount : 0;
            
            // Tính hiệu suất (so với target hoặc trung bình)
            const target = this.getEmployeeTarget(employee.maNhanVien) || this.calculateAverageTarget();
            employee.performanceRatio = target > 0 ? (employee.totalRevenue / target) * 100 : 0;
            
            // Xác định level hiệu suất
            employee.performanceLevel = this.getPerformanceLevel(employee.performanceRatio);
        });

        // Sắp xếp và xếp hạng
        this.employees = Array.from(employeeMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        // Gán rank
        this.employees.forEach((employee, index) => {
            employee.rank = index + 1;
        });
        
        this.filteredEmployees = [...this.employees];
        
        // console.log('✅ Employee data processing completed:', this.employees.length, 'employees');
    }

    // Tạo dữ liệu mẫu nếu không có dữ liệu thực
    generateMockData() {
// console.log('🎭 Generating mock employee data for demonstration...');
        
        const mockEmployees = [
            { name: 'Nguyễn Văn An', code: 'NV001', dept: 'sales' },
            { name: 'Trần Thị Bình', code: 'NV002', dept: 'sales' },
            { name: 'Lê Văn Cường', code: 'NV003', dept: 'support' },
            { name: 'Phạm Thị Dung', code: 'NV004', dept: 'marketing' },
            { name: 'Hoàng Văn Em', code: 'NV005', dept: 'sales' },
            { name: 'Võ Thị Phượng', code: 'NV006', dept: 'support' },
            { name: 'Đặng Văn Giang', code: 'NV007', dept: 'admin' },
            { name: 'Bùi Thị Hoa', code: 'NV008', dept: 'sales' }
        ];

        this.employees = mockEmployees.map((emp, index) => ({
            maNhanVien: emp.code,
            tenNhanVien: emp.name,
            department: emp.dept,
            totalRevenue: Math.floor(Math.random() * 100000000) + 20000000,
            totalCommission: Math.floor(Math.random() * 10000000) + 2000000,
            totalExpenses: Math.floor(Math.random() * 5000000) + 1000000,
            transactionCount: Math.floor(Math.random() * 50) + 10,
            avgTransactionValue: 0,
            performanceRatio: Math.floor(Math.random() * 60) + 80,
            performanceLevel: '',
            lastActivity: this.getRandomDate(),
            rank: index + 1,
            monthlyRevenue: this.generateMonthlyData(),
            monthlyTransactions: this.generateMonthlyTransactionData()
        }));

        // Tính toán và cập nhật các chỉ số
        this.employees.forEach(employee => {
            employee.avgTransactionValue = employee.totalRevenue / employee.transactionCount;
            employee.performanceLevel = this.getPerformanceLevel(employee.performanceRatio);
        });

        // Sắp xếp theo doanh thu
        this.employees.sort((a, b) => b.totalRevenue - a.totalRevenue);
        this.employees.forEach((emp, index) => emp.rank = index + 1);
        
        this.filteredEmployees = [...this.employees];
    }

    // Helper methods
    getDepartmentFromEmployee(employeeName) {
        // Logic để xác định phòng ban từ tên nhân viên
        // Có thể dựa vào pattern tên hoặc data mapping
        const salesKeywords = ['kinh doanh', 'sales', 'bán hàng'];
        const supportKeywords = ['hỗ trợ', 'support', 'cs'];
        const marketingKeywords = ['marketing', 'mk', 'quảng cáo'];
        
        const name = (employeeName || '').toLowerCase();
        
        if (salesKeywords.some(keyword => name.includes(keyword))) return 'sales';
        if (supportKeywords.some(keyword => name.includes(keyword))) return 'support';
        if (marketingKeywords.some(keyword => name.includes(keyword))) return 'marketing';
        
        return 'sales'; // Default
    }

    getEmployeeTarget(employeeCode) {
        return this.kpiTargets.get(employeeCode) || 0;
    }

    calculateAverageTarget() {
        const totalRevenue = this.employees.reduce((sum, emp) => sum + emp.totalRevenue, 0);
        return totalRevenue / this.employees.length;
    }

    getPerformanceLevel(ratio) {
        if (ratio >= 120) return 'excellent';
        if (ratio >= 100) return 'good';
        if (ratio >= 80) return 'average';
        return 'below';
    }

    getRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date();
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
    }

    generateMonthlyData() {
        const months = {};
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7);
            months[monthKey] = Math.floor(Math.random() * 20000000) + 5000000;
        }
        return months;
    }

    generateMonthlyTransactionData() {
        const months = {};
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7);
            months[monthKey] = Math.floor(Math.random() * 20) + 5;
        }
        return months;
    }

    // Render KPI Dashboard
    renderKPIDashboard() {
        const container = document.querySelector('.employee-kpi-dashboard');
        if (!container) return;

        const totalEmployees = this.employees.length;
        const totalRevenue = this.employees.reduce((sum, emp) => sum + emp.totalRevenue, 0);
        const totalCommission = this.employees.reduce((sum, emp) => sum + emp.totalCommission, 0);
        const avgPerformance = totalEmployees > 0 ? 
            this.employees.reduce((sum, emp) => sum + emp.performanceRatio, 0) / totalEmployees : 0;
        const topPerformers = this.employees.filter(emp => emp.performanceRatio >= 100).length;
        const activeEmployees = this.employees.filter(emp => {
            if (!emp.lastActivity) return false;
            const daysSinceActivity = Math.floor((new Date() - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysSinceActivity <= 30;
        }).length;

        container.innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card employees">
                    <div class="kpi-icon">👥</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${totalEmployees}</div>
                        <div class="kpi-label">Tổng nhân viên</div>
                        <div class="kpi-trend positive">${activeEmployees} hoạt động tháng này</div>
                    </div>
                </div>

                <div class="kpi-card revenue">
                    <div class="kpi-icon">💰</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalRevenue)}</div>
                        <div class="kpi-label">Tổng doanh thu</div>
                        <div class="kpi-trend positive">+${((totalRevenue / (totalRevenue + totalCommission)) * 100).toFixed(1)}% hiệu quả</div>
                    </div>
                </div>

                <div class="kpi-card commission">
                    <div class="kpi-icon">💵</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalCommission)}</div>
                        <div class="kpi-label">Tổng hoa hồng</div>
                        <div class="kpi-trend neutral">${((totalCommission / totalRevenue) * 100).toFixed(1)}% tỷ lệ</div>
                    </div>
                </div>

                <div class="kpi-card performance">
                    <div class="kpi-icon">📈</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${avgPerformance.toFixed(1)}%</div>
                        <div class="kpi-label">Hiệu suất TB</div>
                        <div class="kpi-trend ${avgPerformance >= 100 ? 'positive' : 'negative'}">
                            Mục tiêu: 100%
                        </div>
                    </div>
                </div>

                <div class="kpi-card top-performers">
                    <div class="kpi-icon">🏆</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${topPerformers}</div>
                        <div class="kpi-label">Top performers</div>
                        <div class="kpi-trend positive">≥100% KPI</div>
                    </div>
                </div>

                <div class="kpi-card efficiency">
                    <div class="kpi-icon">⚡</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalRevenue / totalEmployees)}</div>
                        <div class="kpi-label">Doanh thu/NV</div>
                        <div class="kpi-trend neutral">Trung bình</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Overview Cards
    renderOverviewCards() {
        const container = document.querySelector('.overview-cards');
        if (!container) return;

        // Phân tích theo phòng ban
        const departmentStats = {};
        this.employees.forEach(emp => {
            const dept = emp.department;
            if (!departmentStats[dept]) {
                departmentStats[dept] = {
                    count: 0,
                    revenue: 0,
                    commission: 0,
                    avgPerformance: 0
                };
            }
            departmentStats[dept].count++;
            departmentStats[dept].revenue += emp.totalRevenue;
            departmentStats[dept].commission += emp.totalCommission;
            departmentStats[dept].avgPerformance += emp.performanceRatio;
        });

        // Tính trung bình
        Object.keys(departmentStats).forEach(dept => {
            departmentStats[dept].avgPerformance /= departmentStats[dept].count;
        });

        const topDepartments = Object.entries(departmentStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 3);

        container.innerHTML = `
            <div class="overview-card">
                <h4>🏢 Top phòng ban theo doanh thu</h4>
                <div class="top-list">
                    ${topDepartments.map(([dept, stats], index) => `
                        <div class="top-item">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${this.getDepartmentName(dept)}</span>
                            <span class="value">${formatCurrency(stats.revenue)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>📊 Phân bổ hiệu suất</h4>
                <div class="performance-breakdown">
                    ${Object.entries(departmentStats).map(([dept, stats]) => `
                        <div class="performance-item">
                            <div class="performance-info">
                                <span class="dept-name">${this.getDepartmentName(dept)}</span>
                                <span class="performance-value">${stats.avgPerformance.toFixed(1)}%</span>
                            </div>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${Math.min(stats.avgPerformance, 150)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>⭐ Phân loại hiệu suất</h4>
                <div class="performance-summary">
                    <div class="performance-group excellent">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'excellent').length}</span>
                        <span class="performance-label">Xuất sắc (≥120%)</span>
                    </div>
                    <div class="performance-group good">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'good').length}</span>
                        <span class="performance-label">Tốt (100-120%)</span>
                    </div>
                    <div class="performance-group average">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'average').length}</span>
                        <span class="performance-label">Trung bình (80-100%)</span>
                    </div>
                    <div class="performance-group below">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'below').length}</span>
                        <span class="performance-label">Cần cải thiện (<80%)</span>
                    </div>
                </div>
            </div>
        `;
    }

    getDepartmentName(dept) {
        const names = {
            'sales': 'Kinh doanh',
            'support': 'Hỗ trợ',
            'marketing': 'Marketing',
            'admin': 'Quản trị'
        };
        return names[dept] || dept;
    }

    // Render Analytics Charts
    renderAnalyticsCharts() {
        setTimeout(() => {
            this.renderEmployeeRevenueChart();
            this.renderCommissionChart();
            this.renderPerformanceTrendChart();
            this.renderKPIDistributionChart();
        }, 100);
    }

    renderEmployeeRevenueChart() {
        const ctx = document.getElementById('employeeRevenueChart');
        if (!ctx) return;

        // Top 10 nhân viên theo doanh thu
        const topEmployees = this.employees.slice(0, 10);
        const labels = topEmployees.map(emp => emp.tenNhanVien);
        const data = topEmployees.map(emp => emp.totalRevenue);

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
                        '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
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
                    },
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    renderCommissionChart() {
        const ctx = document.getElementById('employeeCommissionChart');
        if (!ctx) return;

        // Biểu đồ hoa hồng so với doanh thu
        const topEmployees = this.employees.slice(0, 8);
        const labels = topEmployees.map(emp => emp.tenNhanVien);
        const revenueData = topEmployees.map(emp => emp.totalRevenue);
        const commissionData = topEmployees.map(emp => emp.totalCommission);

        if (this.charts.commissionChart) {
            this.charts.commissionChart.destroy();
        }

        this.charts.commissionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: revenueData,
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Hoa hồng',
                        data: commissionData,
                        backgroundColor: '#f59e0b',
                        borderRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    renderPerformanceTrendChart() {
        const ctx = document.getElementById('performanceTrendChart');
        if (!ctx) return;

        // Tạo dữ liệu xu hướng hiệu suất 6 tháng gần nhất
        const months = [];
        const avgPerformanceData = [];
        const topPerformerCountData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
            months.push(monthKey);
            
            // Tính hiệu suất trung bình (mock data dựa trên trend)
            const basePerformance = 95;
            const trend = (5 - i) * 2; // Xu hướng tăng
            const randomVariation = Math.random() * 10 - 5;
            avgPerformanceData.push(basePerformance + trend + randomVariation);
            
            // Số lượng top performers
            const baseCount = 3;
            const countTrend = Math.floor((5 - i) * 0.5);
            topPerformerCountData.push(baseCount + countTrend + Math.floor(Math.random() * 2));
        }

        if (this.charts.performanceTrendChart) {
            this.charts.performanceTrendChart.destroy();
        }

        this.charts.performanceTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Hiệu suất TB (%)',
                        data: avgPerformanceData,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Số top performers',
                        data: topPerformerCountData,
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        type: 'bar',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                if (context.datasetIndex === 0) {
                                    return `Hiệu suất TB: ${context.parsed.y.toFixed(1)}%`;
                                } else {
                                    return `Top performers: ${context.parsed.y} người`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderKPIDistributionChart() {
        const ctx = document.getElementById('kpiDistributionChart');
        if (!ctx) return;

        // Phân bố KPI theo level
        const distributionData = {
            'Xuất sắc (≥120%)': this.employees.filter(emp => emp.performanceRatio >= 120).length,
            'Tốt (100-119%)': this.employees.filter(emp => emp.performanceRatio >= 100 && emp.performanceRatio < 120).length,
            'Trung bình (80-99%)': this.employees.filter(emp => emp.performanceRatio >= 80 && emp.performanceRatio < 100).length,
            'Cần cải thiện (<80%)': this.employees.filter(emp => emp.performanceRatio < 80).length
        };

        if (this.charts.kpiDistributionChart) {
            this.charts.kpiDistributionChart.destroy();
        }

        this.charts.kpiDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(distributionData),
                datasets: [{
                    data: Object.values(distributionData),
                    backgroundColor: ['#10b981', '#f59e0b', '#6b7280', '#ef4444'],
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
                        labels: { padding: 20 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} người (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render Employee Performance Table
    renderEmployeePerformanceTable() {
        const tableBody = document.querySelector('#employeePerformanceTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = this.filteredEmployees.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedData.map(employee => `
            <tr class="table-row ${employee.performanceLevel}">
                <td>
                    <div class="employee-info">
                        <strong class="employee-name">${employee.tenNhanVien}</strong>
                        <span class="employee-department">${this.getDepartmentName(employee.department)}</span>
                    </div>
                </td>
                <td>
                    <span class="employee-code">${employee.maNhanVien}</span>
                </td>
                <td class="revenue-cell">${formatCurrency(employee.totalRevenue)}</td>
                <td class="commission-cell">${formatCurrency(employee.totalCommission)}</td>
                <td class="transaction-count">${employee.transactionCount}</td>
                <td class="avg-transaction">${formatCurrency(employee.avgTransactionValue)}</td>
                <td>
                    <div class="performance-display">
                        <div class="performance-bar">
                            <div class="performance-fill ${employee.performanceLevel}" style="width: ${Math.min(employee.performanceRatio, 150)}%"></div>
                        </div>
                        <span class="performance-text">${employee.performanceRatio.toFixed(1)}%</span>
                    </div>
                </td>
                <td>
                    <span class="last-activity">${employee.lastActivity ? formatDate(employee.lastActivity) : 'N/A'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="employeeReport.viewEmployee('${employee.maNhanVien}')" title="Xem chi tiết">
                            👁️
                        </button>
                        <button class="action-btn edit" onclick="employeeReport.editEmployee('${employee.maNhanVien}')" title="Chỉnh sửa">
                            ✏️
                        </button>
                        <button class="action-btn kpi" onclick="employeeReport.setKPI('${employee.maNhanVien}')" title="Thiết lập KPI">
                            🎯
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    // Render Details Section
    renderDetailsSection() {
        this.renderTopPerformers();
        this.renderDepartmentPerformance();
        this.renderCommissionAnalysis();
        this.renderActivityTracking();
    }

    renderTopPerformers() {
        const container = document.querySelector('#topPerformersContent');
        if (!container) return;

        const topPerformers = [...this.employees]
            .sort((a, b) => b.performanceRatio - a.performanceRatio)
            .slice(0, 5);

        container.innerHTML = `
            <div class="top-performers-list">
                ${topPerformers.map((emp, index) => `
                    <div class="performer-item">
                        <span class="performer-rank">#${index + 1}</span>
                        <div class="performer-info">
                            <strong class="performer-name">${emp.tenNhanVien}</strong>
                            <span class="performer-dept">${this.getDepartmentName(emp.department)}</span>
                        </div>
                        <div class="performer-stats">
                            <span class="performer-performance ${emp.performanceLevel}">${emp.performanceRatio.toFixed(1)}%</span>
                            <span class="performer-revenue">${formatCurrency(emp.totalRevenue)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDepartmentPerformance() {
        const container = document.querySelector('#departmentPerformanceContent');
        if (!container) return;

        // Tính toán hiệu suất theo phòng ban
        const deptStats = {};
        this.employees.forEach(emp => {
            const dept = emp.department;
            if (!deptStats[dept]) {
                deptStats[dept] = {
                    count: 0,
                    totalRevenue: 0,
                    totalCommission: 0,
                    avgPerformance: 0,
                    employees: []
                };
            }
            deptStats[dept].count++;
            deptStats[dept].totalRevenue += emp.totalRevenue;
            deptStats[dept].totalCommission += emp.totalCommission;
            deptStats[dept].avgPerformance += emp.performanceRatio;
            deptStats[dept].employees.push(emp);
        });

        // Tính trung bình
        Object.keys(deptStats).forEach(dept => {
            deptStats[dept].avgPerformance /= deptStats[dept].count;
        });

        container.innerHTML = `
            <div class="department-stats">
                ${Object.entries(deptStats).map(([dept, stats]) => `
                    <div class="dept-item">
                        <div class="dept-header">
                            <span class="dept-name">${this.getDepartmentName(dept)}</span>
                            <span class="dept-count">${stats.count} NV</span>
                        </div>
                        <div class="dept-metrics">
                            <div class="metric">
                                <span class="metric-label">Doanh thu:</span>
                                <span class="metric-value">${formatCurrency(stats.totalRevenue)}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Hiệu suất TB:</span>
                                <span class="metric-value ${stats.avgPerformance >= 100 ? 'positive' : 'negative'}">${stats.avgPerformance.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCommissionAnalysis() {
        const container = document.querySelector('#commissionAnalysisContent');
        if (!container) return;

        const totalCommission = this.employees.reduce((sum, emp) => sum + emp.totalCommission, 0);
        const totalRevenue = this.employees.reduce((sum, emp) => sum + emp.totalRevenue, 0);
        const avgCommissionRate = (totalCommission / totalRevenue) * 100;
        const topCommissionEarners = [...this.employees]
            .sort((a, b) => b.totalCommission - a.totalCommission)
            .slice(0, 3);

        container.innerHTML = `
            <div class="commission-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng hoa hồng:</span>
                    <span class="summary-value">${formatCurrency(totalCommission)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Tỷ lệ hoa hồng TB:</span>
                    <span class="summary-value">${avgCommissionRate.toFixed(2)}%</span>
                </div>
            </div>
            <div class="top-commission">
                <h5>Top 3 hoa hồng cao nhất:</h5>
                ${topCommissionEarners.map((emp, index) => `
                    <div class="commission-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${emp.tenNhanVien}</span>
                        <span class="value">${formatCurrency(emp.totalCommission)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderActivityTracking() {
        const container = document.querySelector('#activityTrackingContent');
        if (!container) return;

        const now = new Date();
        const activeToday = this.employees.filter(emp => {
            if (!emp.lastActivity) return false;
            const daysDiff = Math.floor((now - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysDiff === 0;
        }).length;

        const activeThisWeek = this.employees.filter(emp => {
            if (!emp.lastActivity) return false;
            const daysDiff = Math.floor((now - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7;
        }).length;

        const inactiveEmployees = this.employees.filter(emp => {
            if (!emp.lastActivity) return true;
            const daysDiff = Math.floor((now - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysDiff > 30;
        });

        container.innerHTML = `
            <div class="activity-summary">
                <div class="activity-item">
                    <span class="activity-label">Hoạt động hôm nay:</span>
                    <span class="activity-value">${activeToday} NV</span>
                </div>
                <div class="activity-item">
                    <span class="activity-label">Hoạt động tuần này:</span>
                    <span class="activity-value">${activeThisWeek} NV</span>
                </div>
                <div class="activity-item">
                    <span class="activity-label">Không hoạt động (>30 ngày):</span>
                    <span class="activity-value warning">${inactiveEmployees.length} NV</span>
                </div>
            </div>
            ${inactiveEmployees.length > 0 ? `
                <div class="inactive-employees">
                    <h5>Nhân viên cần quan tâm:</h5>
                    ${inactiveEmployees.slice(0, 5).map(emp => `
                        <div class="inactive-item">
                            <span class="inactive-name">${emp.tenNhanVien}</span>
                            <span class="inactive-date">${emp.lastActivity ? formatDate(emp.lastActivity) : 'Chưa rõ'}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    // Render Goals Section
    renderGoalsSection() {
        const container = document.querySelector('#employeeGoalsContent');
        if (!container) return;

        container.innerHTML = `
            <div class="goals-overview">
                <div class="goals-stats">
                    <div class="goal-stat">
                        <span class="stat-value">${this.employees.filter(emp => emp.performanceRatio >= 100).length}</span>
                        <span class="stat-label">Đạt mục tiêu</span>
                    </div>
                    <div class="goal-stat">
                        <span class="stat-value">${this.employees.filter(emp => emp.performanceRatio < 100).length}</span>
                        <span class="stat-label">Chưa đạt</span>
                    </div>
                    <div class="goal-stat">
                        <span class="stat-value">${this.kpiTargets.size}</span>
                        <span class="stat-label">Có KPI</span>
                    </div>
                </div>
                <div class="goals-actions">
                    <button class="goals-btn" onclick="employeeReport.openKPIModal()">
                        🎯 Thiết lập KPI mới
                    </button>
                    <button class="goals-btn secondary" onclick="employeeReport.reviewGoals()">
                        📋 Xem lại mục tiêu
                    </button>
                </div>
            </div>
        `;
    }

    // Render Ranking Section
    renderRankingSection() {
        const container = document.querySelector('#employeeRankingContent');
        if (!container) return;

        const topRanked = this.employees.slice(0, 10);

        container.innerHTML = `
            <div class="ranking-list">
                ${topRanked.map((emp, index) => `
                    <div class="ranking-item ${index < 3 ? 'podium' : ''}">
                        <div class="ranking-position">
                            ${index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                        </div>
                        <div class="ranking-employee">
                            <strong class="ranking-name">${emp.tenNhanVien}</strong>
                            <span class="ranking-dept">${this.getDepartmentName(emp.department)}</span>
                        </div>
                        <div class="ranking-metrics">
                            <span class="ranking-revenue">${formatCurrency(emp.totalRevenue)}</span>
                            <span class="ranking-performance ${emp.performanceLevel}">${emp.performanceRatio.toFixed(1)}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('#employeeSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter functionality
        const performanceFilter = document.querySelector('#performanceFilter');
        if (performanceFilter) {
            performanceFilter.addEventListener('change', (e) => {
                this.handlePerformanceFilter(e.target.value);
            });
        }

        const departmentFilter = document.querySelector('#departmentFilter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.handleDepartmentFilter(e.target.value);
            });
        }

        // Refresh button
        const refreshBtn = document.querySelector('#refreshEmployeeData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Export button
        const exportBtn = document.querySelector('#exportEmployeeData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        // Management tool buttons
        const toolBtns = document.querySelectorAll('.management-tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleManagementTool(e.target.closest('.management-tool-btn').id);
            });
        });

        // Modal controls
        this.setupModalControls();
    }

    setupModalControls() {
        // Employee detail modal
        const employeeModal = document.querySelector('#employeeDetailModal');
        const closeEmployeeBtn = document.querySelector('#closeEmployeeModal');
        const cancelEmployeeBtn = document.querySelector('#cancelEmployeeModal');
        
        if (closeEmployeeBtn) closeEmployeeBtn.addEventListener('click', () => this.closeEmployeeModal());
        if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', () => this.closeEmployeeModal());
        if (employeeModal) {
            employeeModal.addEventListener('click', (e) => {
                if (e.target === employeeModal) this.closeEmployeeModal();
            });
        }

        // KPI setting modal
        const kpiModal = document.querySelector('#kpiSettingModal');
        const closeKpiBtn = document.querySelector('#closeKpiModal');
        const cancelKpiBtn = document.querySelector('#cancelKpiModal');
        const saveKpiBtn = document.querySelector('#saveKpiSettings');
        
        if (closeKpiBtn) closeKpiBtn.addEventListener('click', () => this.closeKPIModal());
        if (cancelKpiBtn) cancelKpiBtn.addEventListener('click', () => this.closeKPIModal());
        if (saveKpiBtn) saveKpiBtn.addEventListener('click', () => this.saveKPISettings());
        if (kpiModal) {
            kpiModal.addEventListener('click', (e) => {
                if (e.target === kpiModal) this.closeKPIModal();
            });
        }
    }

    // Filter and search methods
    handleSearch(searchTerm) {
        const filtered = this.employees.filter(emp =>
            emp.tenNhanVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.maNhanVien.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.filteredEmployees = filtered;
        this.currentPage = 1;
        this.renderEmployeePerformanceTable();
    }

    handlePerformanceFilter(level) {
        if (level === 'all') {
            this.filteredEmployees = [...this.employees];
        } else {
            this.filteredEmployees = this.employees.filter(emp => 
                emp.performanceLevel === level
            );
        }
        this.currentPage = 1;
        this.renderEmployeePerformanceTable();
    }

    handleDepartmentFilter(dept) {
        if (dept === 'all') {
            this.filteredEmployees = [...this.employees];
        } else {
            this.filteredEmployees = this.employees.filter(emp => 
                emp.department === dept
            );
        }
        this.currentPage = 1;
        this.renderEmployeePerformanceTable();
    }

    // Action methods
    viewEmployee(employeeCode) {
        const employee = this.employees.find(emp => emp.maNhanVien === employeeCode);
        if (employee) {
            this.showEmployeeModal(employee);
        }
    }

    editEmployee(employeeCode) {
        const employee = this.employees.find(emp => emp.maNhanVien === employeeCode);
        if (employee) {
            this.showEmployeeModal(employee, true);
        }
    }

    setKPI(employeeCode) {
        this.openKPIModal(employeeCode);
    }

    showEmployeeModal(employee, editMode = false) {
        const modal = document.querySelector('#employeeDetailModal');
        const title = document.querySelector('#modalTitle');
        const content = document.querySelector('#employeeDetailContent');
        
        if (!modal || !title || !content) return;

        title.textContent = editMode ? 'Chỉnh sửa nhân viên' : 'Chi tiết nhân viên';
        
        content.innerHTML = `
            <div class="employee-detail-grid">
                <div class="detail-item">
                    <label>Tên nhân viên:</label>
                    <span>${employee.tenNhanVien}</span>
                </div>
                <div class="detail-item">
                    <label>Mã nhân viên:</label>
                    <span>${employee.maNhanVien}</span>
                </div>
                <div class="detail-item">
                    <label>Phòng ban:</label>
                    <span>${this.getDepartmentName(employee.department)}</span>
                </div>
                <div class="detail-item">
                    <label>Xếp hạng:</label>
                    <span>#${employee.rank}</span>
                </div>
                <div class="detail-item">
                    <label>Doanh thu:</label>
                    <span class="positive">${formatCurrency(employee.totalRevenue)}</span>
                </div>
                <div class="detail-item">
                    <label>Hoa hồng:</label>
                    <span class="positive">${formatCurrency(employee.totalCommission)}</span>
                </div>
                <div class="detail-item">
                    <label>Số giao dịch:</label>
                    <span>${employee.transactionCount}</span>
                </div>
                <div class="detail-item">
                    <label>Giá trị TB/GD:</label>
                    <span>${formatCurrency(employee.avgTransactionValue)}</span>
                </div>
                <div class="detail-item">
                    <label>Hiệu suất:</label>
                    <span class="${employee.performanceLevel}">${employee.performanceRatio.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <label>Hoạt động cuối:</label>
                    <span>${employee.lastActivity ? formatDate(employee.lastActivity) : 'N/A'}</span>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeEmployeeModal() {
        const modal = document.querySelector('#employeeDetailModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    openKPIModal(employeeCode = null) {
        const modal = document.querySelector('#kpiSettingModal');
        const employeeSelect = document.querySelector('#employeeSelect');
        
        if (!modal || !employeeSelect) return;

        // Populate employee select
        employeeSelect.innerHTML = '<option value="">-- Chọn nhân viên --</option>' +
            this.employees.map(emp => 
                `<option value="${emp.maNhanVien}"${emp.maNhanVien === employeeCode ? ' selected' : ''}>${emp.tenNhanVien} (${emp.maNhanVien})</option>`
            ).join('');

        // If specific employee, pre-fill data
        if (employeeCode) {
            const employee = this.employees.find(emp => emp.maNhanVien === employeeCode);
            if (employee) {
                const currentTarget = this.kpiTargets.get(employeeCode) || employee.totalRevenue;
                document.querySelector('#revenueTarget').value = currentTarget;
                document.querySelector('#transactionTarget').value = employee.transactionCount * 1.2; // 20% increase
                document.querySelector('#commissionRate').value = ((employee.totalCommission / employee.totalRevenue) * 100).toFixed(1);
            }
        }

        modal.classList.remove('hidden');
    }

    closeKPIModal() {
        const modal = document.querySelector('#kpiSettingModal');
        if (modal) {
            modal.classList.add('hidden');
            // Clear form
            document.querySelector('#employeeSelect').value = '';
            document.querySelector('#revenueTarget').value = '';
            document.querySelector('#transactionTarget').value = '';
            document.querySelector('#commissionRate').value = '';
        }
    }

    saveKPISettings() {
        const employeeCode = document.querySelector('#employeeSelect').value;
        const revenueTarget = parseFloat(document.querySelector('#revenueTarget').value);
        const transactionTarget = parseInt(document.querySelector('#transactionTarget').value);
        const commissionRate = parseFloat(document.querySelector('#commissionRate').value);
        const period = document.querySelector('#targetPeriod').value;

        if (!employeeCode || !revenueTarget) {
            alert('Vui lòng chọn nhân viên và nhập mục tiêu doanh thu');
            return;
        }

        // Save KPI target
        this.kpiTargets.set(employeeCode, revenueTarget);
        
        // Update employee performance ratio
        const employee = this.employees.find(emp => emp.maNhanVien === employeeCode);
        if (employee) {
            employee.performanceRatio = (employee.totalRevenue / revenueTarget) * 100;
            employee.performanceLevel = this.getPerformanceLevel(employee.performanceRatio);
        }

        // Refresh displays
        this.renderKPIDashboard();
        this.renderEmployeePerformanceTable();
        this.renderAnalyticsCharts();
        
        this.closeKPIModal();
        
        // Show success message
        this.showSuccessMessage(`Đã thiết lập KPI cho ${employee?.tenNhanVien}`);
    }

    handleManagementTool(toolId) {
        switch (toolId) {
            case 'performanceReview':
// console.log('Performance review tool');
                break;
            case 'commissionCalculator':
// console.log('Commission calculator');
                break;
            case 'goalSetting':
                this.openKPIModal();
                break;
            case 'trainingPlan':
// console.log('Training plan tool');
                break;
            case 'teamAnalytics':
// console.log('Team analytics tool');
                break;
            case 'incentiveProgram':
// console.log('Incentive program tool');
                break;
        }
    }

    reviewGoals() {
// console.log('Review goals functionality');
    }

    // Utility methods
    updatePagination() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;

        const totalItems = this.filteredEmployees.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        container.innerHTML = `
            <div class="pagination-info">
                Hiển thị ${(this.currentPage - 1) * this.itemsPerPage + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} 
                trong tổng số ${totalItems} nhân viên
            </div>
            <div class="pagination-controls">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        onclick="employeeReport.goToPage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>‹</button>
                
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const page = Math.max(1, this.currentPage - 2) + i;
                    if (page <= totalPages) {
                        return `<button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                                       onclick="employeeReport.goToPage(${page})">${page}</button>`;
                    }
                    return '';
                }).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                        onclick="employeeReport.goToPage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>›</button>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderEmployeePerformanceTable();
    }

    exportToExcel() {
        const headers = ['Nhân viên', 'Mã NV', 'Phòng ban', 'Doanh thu', 'Hoa hồng', 'Số GD', 'TB/GD', 'Hiệu suất', 'Xếp hạng'];
        const data = [headers];
        
        this.filteredEmployees.forEach(emp => {
            data.push([
                emp.tenNhanVien,
                emp.maNhanVien,
                this.getDepartmentName(emp.department),
                emp.totalRevenue,
                emp.totalCommission,
                emp.transactionCount,
                emp.avgTransactionValue,
                `${emp.performanceRatio.toFixed(1)}%`,
                emp.rank
            ]);
        });
        
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `employee-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    showSuccessMessage(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = message;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 3000);
    }

    async refresh() {
        // console.log('🔄 Refreshing employee report data...');
        this.isInitialized = false;
        await this.initialize();
    }
}

// Export instance for global use
export const employeeReport = new EmployeeReportCore();