/**
 * Employee Data Processor
 * Xử lý và tính toán dữ liệu nhân viên từ các sheet
 */

export class EmployeeDataProcessor {
    constructor() {
        this.employees = new Map();
        this.departments = new Map();
        this.monthlyTargets = new Map();
        this.commissionRates = new Map();
    }

    /**
     * Process transaction and expense data to calculate employee metrics
     */
    processEmployeeData(transactions = [], expenses = []) {
        console.log('📊 Processing employee data...', { transactions: transactions.length, expenses: expenses.length });
        
        // Clear previous data
        this.employees.clear();
        this.departments.clear();

        // Process transactions for revenue and commission
        this.processTransactionData(transactions);
        
        // Process expenses for employee-related costs
        this.processExpenseData(expenses);
        
        // Calculate performance metrics
        this.calculatePerformanceMetrics();
        
        // Generate department summaries
        this.generateDepartmentSummaries();
        
        const result = {
            employees: Array.from(this.employees.values()),
            departments: Array.from(this.departments.values()),
            kpis: this.calculateKPIs(),
            topPerformers: this.getTopPerformers(),
            alerts: this.generateAlerts()
        };
        
        console.log('✅ Employee data processed:', result);
        return result;
    }

    /**
     * Process transaction data for employee revenue and commission
     */
    processTransactionData(transactions) {
        transactions.forEach(transaction => {
            const employeeName = transaction.tenNhanVien || transaction.employeeName;
            const employeeId = transaction.maNhanVien || transaction.employeeId;
            
            if (!employeeName && !employeeId) return;
            
            const key = employeeId || employeeName;
            
            if (!this.employees.has(key)) {
                this.employees.set(key, {
                    id: employeeId || this.generateEmployeeId(employeeName),
                    name: employeeName || 'Không rõ',
                    department: this.getDepartmentFromTransaction(transaction),
                    revenue: 0,
                    commission: 0,
                    transactionCount: 0,
                    customerCount: 0,
                    customers: new Set(),
                    monthlyRevenue: new Map(),
                    softwareTypes: new Set(),
                    avgDealSize: 0,
                    lastActivity: null,
                    totalDevices: 0,
                    renewalRate: 0,
                    renewals: 0,
                    newAcquisitions: 0
                });
            }
            
            const employee = this.employees.get(key);
            
            // Update revenue and commission
            const revenue = parseFloat(transaction.doanhThu || transaction.revenue || 0);
            const commission = parseFloat(transaction.hoaHong || transaction.commission || 0);
            
            employee.revenue += revenue;
            employee.commission += commission;
            employee.transactionCount++;
            
            // Track unique customers
            const customerName = transaction.tenKhachHang || transaction.customerName;
            if (customerName) {
                employee.customers.add(customerName);
            }
            
            // Track monthly revenue
            const date = new Date(transaction.ngayGiaoDich || transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!employee.monthlyRevenue.has(monthKey)) {
                employee.monthlyRevenue.set(monthKey, 0);
            }
            employee.monthlyRevenue.set(monthKey, employee.monthlyRevenue.get(monthKey) + revenue);
            
            // Track software types
            const software = transaction.tenPhanMem || transaction.softwareName;
            if (software) {
                employee.softwareTypes.add(software);
            }
            
            // Track devices
            const devices = parseInt(transaction.soThietBi || transaction.deviceCount || 0);
            employee.totalDevices += devices;
            
            // Update last activity
            if (!employee.lastActivity || date > new Date(employee.lastActivity)) {
                employee.lastActivity = transaction.ngayGiaoDich || transaction.date;
            }
            
            // Track renewal vs new acquisition
            const transactionType = transaction.loaiGiaoDich || transaction.type;
            if (transactionType && transactionType.toLowerCase().includes('gia hạn')) {
                employee.renewals++;
            } else {
                employee.newAcquisitions++;
            }
        });
        
        // Calculate derived metrics
        this.employees.forEach(employee => {
            employee.customerCount = employee.customers.size;
            employee.avgDealSize = employee.transactionCount > 0 ? employee.revenue / employee.transactionCount : 0;
            employee.renewalRate = (employee.renewals + employee.newAcquisitions) > 0 ? 
                (employee.renewals / (employee.renewals + employee.newAcquisitions)) * 100 : 0;
        });
    }

    /**
     * Process expense data for employee-related costs
     */
    processExpenseData(expenses) {
        expenses.forEach(expense => {
            // Look for employee-related expenses
            const description = (expense.moTa || expense.description || '').toLowerCase();
            const category = (expense.danhMucChung || expense.category || '').toLowerCase();
            
            // If expense is related to employees (salary, commission, etc.)
            if (description.includes('lương') || description.includes('hoa hồng') || 
                description.includes('nhân viên') || category.includes('nhân sự')) {
                
                // Try to match to specific employee
                this.employees.forEach(employee => {
                    if (description.includes(employee.name.toLowerCase())) {
                        if (!employee.expenses) employee.expenses = 0;
                        employee.expenses += parseFloat(expense.soTien || expense.amount || 0);
                    }
                });
            }
        });
    }

    /**
     * Calculate performance metrics for all employees
     */
    calculatePerformanceMetrics() {
        const allEmployees = Array.from(this.employees.values());
        
        if (allEmployees.length === 0) return;
        
        // Calculate percentiles for ranking
        const revenues = allEmployees.map(emp => emp.revenue).sort((a, b) => b - a);
        const commissions = allEmployees.map(emp => emp.commission).sort((a, b) => b - a);
        
        allEmployees.forEach(employee => {
            // Performance score (0-100)
            const revenuePercentile = this.getPercentile(employee.revenue, revenues);
            const commissionPercentile = this.getPercentile(employee.commission, commissions);
            const activityScore = this.calculateActivityScore(employee);
            
            employee.performanceScore = Math.round(
                (revenuePercentile * 0.4) + 
                (commissionPercentile * 0.3) + 
                (activityScore * 0.3)
            );
            
            // Revenue trend (last 3 months)
            employee.revenueTrend = this.calculateRevenueTrend(employee);
            
            // Efficiency metrics
            employee.revenuePerCustomer = employee.customerCount > 0 ? employee.revenue / employee.customerCount : 0;
            employee.commissionRate = employee.revenue > 0 ? (employee.commission / employee.revenue) * 100 : 0;
            
            // Set performance level
            employee.performanceLevel = this.getPerformanceLevel(employee.performanceScore);
            
            // Calculate monthly target achievement
            employee.targetAchievement = this.calculateTargetAchievement(employee);
        });
    }

    /**
     * Generate department summaries
     */
    generateDepartmentSummaries() {
        this.employees.forEach(employee => {
            const dept = employee.department || 'Khác';
            
            if (!this.departments.has(dept)) {
                this.departments.set(dept, {
                    name: dept,
                    employeeCount: 0,
                    totalRevenue: 0,
                    totalCommission: 0,
                    avgPerformance: 0,
                    topPerformer: null,
                    customerCount: 0
                });
            }
            
            const department = this.departments.get(dept);
            department.employeeCount++;
            department.totalRevenue += employee.revenue;
            department.totalCommission += employee.commission;
            department.customerCount += employee.customerCount;
            
            if (!department.topPerformer || employee.performanceScore > department.topPerformer.performanceScore) {
                department.topPerformer = employee;
            }
        });
        
        // Calculate averages
        this.departments.forEach(dept => {
            dept.avgRevenue = dept.employeeCount > 0 ? dept.totalRevenue / dept.employeeCount : 0;
            dept.avgCommission = dept.employeeCount > 0 ? dept.totalCommission / dept.employeeCount : 0;
            
            // Calculate average performance
            let totalPerformance = 0;
            let count = 0;
            this.employees.forEach(emp => {
                if ((emp.department || 'Khác') === dept.name) {
                    totalPerformance += emp.performanceScore;
                    count++;
                }
            });
            dept.avgPerformance = count > 0 ? totalPerformance / count : 0;
        });
    }

    /**
     * Calculate overall KPIs
     */
    calculateKPIs() {
        const employees = Array.from(this.employees.values());
        
        if (employees.length === 0) {
            return {
                totalEmployees: 0,
                avgRevenue: 0,
                avgCommission: 0,
                topPerformance: 0,
                employeeChange: 0,
                revenueChange: 5.2,
                commissionChange: 3.1,
                performanceChange: 2.8
            };
        }
        
        const totalRevenue = employees.reduce((sum, emp) => sum + emp.revenue, 0);
        const totalCommission = employees.reduce((sum, emp) => sum + emp.commission, 0);
        const topPerformance = Math.max(...employees.map(emp => emp.performanceScore));
        
        return {
            totalEmployees: employees.length,
            avgRevenue: totalRevenue / employees.length,
            avgCommission: totalCommission / employees.length,
            topPerformance: topPerformance,
            employeeChange: 2.5, // Mock data - would calculate from historical data
            revenueChange: 5.2,
            commissionChange: 3.1,
            performanceChange: 2.8
        };
    }

    /**
     * Get top performers
     */
    getTopPerformers(limit = 10) {
        return Array.from(this.employees.values())
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, limit);
    }

    /**
     * Generate alerts based on performance data
     */
    generateAlerts() {
        const alerts = [];
        const employees = Array.from(this.employees.values());
        
        // Low performance alerts
        const lowPerformers = employees.filter(emp => emp.performanceScore < 60);
        if (lowPerformers.length > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowPerformers.length} nhân viên có hiệu suất thấp`,
                details: `Cần hỗ trợ: ${lowPerformers.map(emp => emp.name).join(', ')}`,
                time: '2 giờ trước'
            });
        }
        
        // High performers
        const highPerformers = employees.filter(emp => emp.performanceScore > 90);
        if (highPerformers.length > 0) {
            alerts.push({
                type: 'info',
                message: `${highPerformers.length} nhân viên hiệu suất xuất sắc`,
                details: `Xem xét thưởng: ${highPerformers.map(emp => emp.name).join(', ')}`,
                time: '1 giờ trước'
            });
        }
        
        // Inactive employees
        const inactiveEmployees = employees.filter(emp => {
            if (!emp.lastActivity) return true;
            const daysSinceLastActivity = Math.floor((Date.now() - new Date(emp.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceLastActivity > 30;
        });
        
        if (inactiveEmployees.length > 0) {
            alerts.push({
                type: 'danger',
                message: `${inactiveEmployees.length} nhân viên không hoạt động`,
                details: `Hơn 30 ngày không có giao dịch`,
                time: '30 phút trước'
            });
        }
        
        return alerts;
    }

    /**
     * Helper methods
     */
    getDepartmentFromTransaction(transaction) {
        // Try to infer department from software type or customer
        const software = transaction.tenPhanMem || transaction.softwareName || '';
        const customer = transaction.tenKhachHang || transaction.customerName || '';
        
        if (software.toLowerCase().includes('marketing')) return 'Marketing';
        if (software.toLowerCase().includes('sales') || software.toLowerCase().includes('bán hàng')) return 'Bán hàng';
        if (software.toLowerCase().includes('tech') || software.toLowerCase().includes('kỹ thuật')) return 'Kỹ thuật';
        if (customer.toLowerCase().includes('enterprise')) return 'Enterprise';
        
        return 'Bán hàng'; // Default department
    }

    generateEmployeeId(name) {
        return 'EMP' + name.replace(/\s+/g, '').substr(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);
    }

    getPercentile(value, sortedArray) {
        const index = sortedArray.indexOf(value);
        return index >= 0 ? ((sortedArray.length - index) / sortedArray.length) * 100 : 0;
    }

    calculateActivityScore(employee) {
        const baseScore = Math.min(employee.transactionCount * 5, 50);
        const customerScore = Math.min(employee.customerCount * 3, 30);
        const recentActivityScore = employee.lastActivity ? 
            Math.max(20 - Math.floor((Date.now() - new Date(employee.lastActivity).getTime()) / (1000 * 60 * 60 * 24 * 7)), 0) : 0;
        
        return Math.min(baseScore + customerScore + recentActivityScore, 100);
    }

    calculateRevenueTrend(employee) {
        const monthlyData = Array.from(employee.monthlyRevenue.entries()).sort();
        if (monthlyData.length < 2) return 0;
        
        const recent = monthlyData.slice(-2);
        const [, lastMonth] = recent[0];
        const [, currentMonth] = recent[1];
        
        return currentMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;
    }

    getPerformanceLevel(score) {
        if (score >= 90) return 'Xuất sắc';
        if (score >= 80) return 'Tốt';
        if (score >= 70) return 'Khá';
        if (score >= 60) return 'Trung bình';
        return 'Cần cải thiện';
    }

    calculateTargetAchievement(employee) {
        // Mock calculation - would use actual targets from database
        const monthlyTarget = 50000000; // 50M VND
        const currentMonth = new Date().toISOString().substr(0, 7);
        const currentRevenue = employee.monthlyRevenue.get(currentMonth) || 0;
        
        return monthlyTarget > 0 ? (currentRevenue / monthlyTarget) * 100 : 0;
    }
}