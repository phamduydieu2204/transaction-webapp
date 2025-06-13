/**
 * Financial Core Module
 * Xử lý và phân tích dữ liệu tài chính từ GiaoDich và ChiPhi sheets
 */

import { formatDate } from '../../formatDate.js';
import { formatDateTime } from '../../formatDateTime.js';

export class FinancialCore {
    constructor() {
        this.transactions = [];
        this.expenses = [];
        this.accounts = new Map();
        this.budgets = new Map();
        this.financialMetrics = {};
        this.isInitialized = false;
    }

    /**
     * Initialize financial management system
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('💰 Initializing Financial Core...');
            
            await this.loadFinancialData();
            this.processFinancialData();
            this.calculateFinancialMetrics();
            this.setupAccounts();
            this.generateFinancialHealth();
            
            this.isInitialized = true;
            console.log('✅ Financial Core initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Financial Core:', error);
            throw error;
        }
    }

    /**
     * Load financial data from global sources
     */
    async loadFinancialData() {
        try {
            // Load transaction data
            this.transactions = this.extractTransactionData();
            this.expenses = this.extractExpenseData();
            
            console.log('📊 Financial data loaded:', {
                transactions: this.transactions.length,
                expenses: this.expenses.length
            });
            
        } catch (error) {
            console.error('❌ Error loading financial data:', error);
            // Use mock data as fallback
            this.generateMockFinancialData();
        }
    }

    /**
     * Extract transaction data for financial analysis
     */
    extractTransactionData() {
        const rawData = window.currentTransactionData || window.transactionList || [];
        
        return rawData.map((row, index) => {
            if (typeof row === 'object' && !Array.isArray(row)) {
                return {
                    id: index + 1,
                    date: row.ngayGiaoDich || row.date || '',
                    type: row.loaiGiaoDich || row.type || '',
                    customer: row.tenKhachHang || row.customerName || '',
                    revenue: parseFloat(row.doanhThu || row.revenue || 0),
                    commission: parseFloat(row.hoaHong || row.commission || 0),
                    software: row.tenPhanMem || row.softwareName || '',
                    package: row.goiPhanMem || row.package || '',
                    months: parseInt(row.soThangDangKy || row.months || 0),
                    employee: row.tenNhanVien || row.employeeName || '',
                    startDate: row.ngayBatDau || row.startDate || '',
                    endDate: row.ngayKetThuc || row.endDate || ''
                };
            }
            
            // Handle array format
            return {
                id: index + 1,
                date: row[1] || '',
                type: row[2] || '',
                customer: row[3] || '',
                revenue: parseFloat(row[16]) || 0,
                commission: parseFloat(row[17]) || 0,
                software: row[10] || '',
                package: row[11] || '',
                months: parseInt(row[6]) || 0,
                employee: row[20] || '',
                startDate: row[7] || '',
                endDate: row[8] || ''
            };
        });
    }

    /**
     * Extract expense data for financial analysis
     */
    extractExpenseData() {
        const rawData = window.currentExpenseData || window.expenseList || [];
        
        return rawData.map((row, index) => {
            if (typeof row === 'object' && !Array.isArray(row)) {
                return {
                    id: index + 1,
                    date: row.ngayChi || row.date || '',
                    accountingType: row.loaiKeToan || row.accountingType || '',
                    allocation: row.phanBo || row.allocation || '',
                    expenseType: row.loaiKhoanChi || row.expenseType || '',
                    category: row.danhMucChung || row.category || '',
                    description: row.moTa || row.description || '',
                    amount: parseFloat(row.soTien || row.amount || 0),
                    currency: row.donViTienTe || row.currency || 'VND',
                    bank: row.nganHang || row.bank || '',
                    recurring: row.thuongXuyen || row.recurring || false,
                    frequency: row.tanSuat || row.frequency || '',
                    nextDate: row.ngayKeTiep || row.nextDate || ''
                };
            }
            
            // Handle array format
            return {
                id: index + 1,
                date: row[1] || '',
                accountingType: row[2] || '',
                allocation: row[3] || '',
                expenseType: row[4] || '',
                category: row[5] || '',
                description: row[6] || '',
                amount: parseFloat(row[8]) || 0,
                currency: row[9] || 'VND',
                bank: row[10] || '',
                recurring: row[11] === 'Có' || false,
                frequency: row[12] || '',
                nextDate: row[13] || ''
            };
        });
    }

    /**
     * Process financial data for analysis
     */
    processFinancialData() {
        console.log('🔄 Processing financial data...');
        
        // Process by time periods
        this.monthlyData = this.groupByMonth();
        this.quarterlyData = this.groupByQuarter();
        this.yearlyData = this.groupByYear();
        
        // Process by categories
        this.revenueByCategory = this.categorizeRevenue();
        this.expensesByCategory = this.categorizeExpenses();
        
        // Calculate cash flow
        this.cashFlowData = this.calculateCashFlow();
        
        console.log('✅ Financial data processed');
    }

    /**
     * Group data by month
     */
    groupByMonth() {
        const monthlyData = new Map();
        
        // Process transactions (revenue)
        this.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            if (isNaN(date.getTime())) return;
            
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                    month: monthKey,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    transactionCount: 0,
                    expenseCount: 0
                });
            }
            
            const monthData = monthlyData.get(monthKey);
            monthData.revenue += transaction.revenue;
            monthData.transactionCount++;
        });
        
        // Process expenses
        this.expenses.forEach(expense => {
            const date = new Date(expense.date);
            if (isNaN(date.getTime())) return;
            
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                    month: monthKey,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    transactionCount: 0,
                    expenseCount: 0
                });
            }
            
            const monthData = monthlyData.get(monthKey);
            monthData.expenses += expense.amount;
            monthData.expenseCount++;
        });
        
        // Calculate profit for each month
        monthlyData.forEach(monthData => {
            monthData.profit = monthData.revenue - monthData.expenses;
        });
        
        return monthlyData;
    }

    /**
     * Group data by quarter
     */
    groupByQuarter() {
        const quarterlyData = new Map();
        
        this.monthlyData.forEach(monthData => {
            const [year, month] = monthData.month.split('-').map(Number);
            const quarter = Math.ceil(month / 3);
            const quarterKey = `${year}-Q${quarter}`;
            
            if (!quarterlyData.has(quarterKey)) {
                quarterlyData.set(quarterKey, {
                    quarter: quarterKey,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    transactionCount: 0,
                    expenseCount: 0
                });
            }
            
            const quarterData = quarterlyData.get(quarterKey);
            quarterData.revenue += monthData.revenue;
            quarterData.expenses += monthData.expenses;
            quarterData.profit += monthData.profit;
            quarterData.transactionCount += monthData.transactionCount;
            quarterData.expenseCount += monthData.expenseCount;
        });
        
        return quarterlyData;
    }

    /**
     * Group data by year
     */
    groupByYear() {
        const yearlyData = new Map();
        
        this.monthlyData.forEach(monthData => {
            const year = monthData.month.split('-')[0];
            
            if (!yearlyData.has(year)) {
                yearlyData.set(year, {
                    year: year,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    transactionCount: 0,
                    expenseCount: 0
                });
            }
            
            const yearData = yearlyData.get(year);
            yearData.revenue += monthData.revenue;
            yearData.expenses += monthData.expenses;
            yearData.profit += monthData.profit;
            yearData.transactionCount += monthData.transactionCount;
            yearData.expenseCount += monthData.expenseCount;
        });
        
        return yearlyData;
    }

    /**
     * Categorize revenue by source
     */
    categorizeRevenue() {
        const categories = new Map();
        
        this.transactions.forEach(transaction => {
            const category = transaction.software || 'Khác';
            
            if (!categories.has(category)) {
                categories.set(category, {
                    category: category,
                    revenue: 0,
                    count: 0,
                    customers: new Set()
                });
            }
            
            const categoryData = categories.get(category);
            categoryData.revenue += transaction.revenue;
            categoryData.count++;
            categoryData.customers.add(transaction.customer);
        });
        
        // Convert customers Set to count
        categories.forEach(categoryData => {
            categoryData.customerCount = categoryData.customers.size;
            delete categoryData.customers;
        });
        
        return categories;
    }

    /**
     * Categorize expenses by type
     */
    categorizeExpenses() {
        const categories = new Map();
        
        this.expenses.forEach(expense => {
            const category = expense.category || expense.expenseType || 'Khác';
            
            if (!categories.has(category)) {
                categories.set(category, {
                    category: category,
                    amount: 0,
                    count: 0,
                    recurring: 0,
                    oneTime: 0
                });
            }
            
            const categoryData = categories.get(category);
            categoryData.amount += expense.amount;
            categoryData.count++;
            
            if (expense.recurring) {
                categoryData.recurring += expense.amount;
            } else {
                categoryData.oneTime += expense.amount;
            }
        });
        
        return categories;
    }

    /**
     * Calculate cash flow data
     */
    calculateCashFlow() {
        const cashFlowData = [];
        const sortedMonths = Array.from(this.monthlyData.keys()).sort();
        
        let runningBalance = 0;
        
        sortedMonths.forEach(month => {
            const monthData = this.monthlyData.get(month);
            const netCashFlow = monthData.revenue - monthData.expenses;
            runningBalance += netCashFlow;
            
            cashFlowData.push({
                month: month,
                cashIn: monthData.revenue,
                cashOut: monthData.expenses,
                netCashFlow: netCashFlow,
                runningBalance: runningBalance
            });
        });
        
        return cashFlowData;
    }

    /**
     * Calculate financial metrics and KPIs
     */
    calculateFinancialMetrics() {
        console.log('📊 Calculating financial metrics...');
        
        const totalRevenue = this.transactions.reduce((sum, t) => sum + t.revenue, 0);
        const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        
        // Current month data
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthData = this.monthlyData.get(currentMonth) || { revenue: 0, expenses: 0, profit: 0 };
        
        // Previous month data for comparison
        const previousMonthDate = new Date();
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
        const previousMonth = previousMonthDate.toISOString().slice(0, 7);
        const previousMonthData = this.monthlyData.get(previousMonth) || { revenue: 0, expenses: 0, profit: 0 };
        
        // Calculate changes
        const revenueChange = this.calculatePercentageChange(currentMonthData.revenue, previousMonthData.revenue);
        const expenseChange = this.calculatePercentageChange(currentMonthData.expenses, previousMonthData.expenses);
        const profitChange = this.calculatePercentageChange(currentMonthData.profit, previousMonthData.profit);
        
        // Calculate margins
        const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
        const operatingMargin = grossMargin; // Simplified for now
        
        // Calculate recurring revenue
        const monthlyRecurringRevenue = this.calculateMRR();
        const annualRecurringRevenue = monthlyRecurringRevenue * 12;
        
        // Cash runway calculation
        const averageMonthlyBurn = this.calculateAverageMonthlyBurn();
        const currentCash = this.getCurrentCashPosition();
        const cashRunway = averageMonthlyBurn > 0 ? currentCash / averageMonthlyBurn : Infinity;
        
        this.financialMetrics = {
            // Core metrics
            totalRevenue,
            totalExpenses,
            netProfit,
            grossMargin,
            operatingMargin,
            
            // Monthly data
            currentMonth: {
                revenue: currentMonthData.revenue,
                expenses: currentMonthData.expenses,
                profit: currentMonthData.profit
            },
            previousMonth: {
                revenue: previousMonthData.revenue,
                expenses: previousMonthData.expenses,
                profit: previousMonthData.profit
            },
            
            // Changes
            revenueChange,
            expenseChange,
            profitChange,
            
            // Recurring metrics
            monthlyRecurringRevenue,
            annualRecurringRevenue,
            
            // Cash metrics
            currentCash,
            averageMonthlyBurn,
            cashRunway,
            
            // Health indicators
            liquidityRatio: this.calculateLiquidityRatio(),
            profitMargin: grossMargin,
            cashCycleDays: this.calculateCashCycle(),
            
            // Customer metrics
            averageRevenuePerCustomer: this.calculateARPC(),
            customerAcquisitionCost: this.calculateCAC()
        };
        
        console.log('✅ Financial metrics calculated:', this.financialMetrics);
    }

    /**
     * Calculate percentage change between two values
     */
    calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * Calculate Monthly Recurring Revenue (MRR)
     */
    calculateMRR() {
        let mrr = 0;
        
        this.transactions.forEach(transaction => {
            if (transaction.months > 0) {
                // Calculate monthly revenue from subscription
                mrr += transaction.revenue / transaction.months;
            }
        });
        
        return mrr;
    }

    /**
     * Calculate average monthly burn rate
     */
    calculateAverageMonthlyBurn() {
        const monthlyExpenses = Array.from(this.monthlyData.values())
            .map(month => month.expenses)
            .filter(expense => expense > 0);
        
        if (monthlyExpenses.length === 0) return 0;
        
        return monthlyExpenses.reduce((sum, expense) => sum + expense, 0) / monthlyExpenses.length;
    }

    /**
     * Get current cash position (simplified)
     */
    getCurrentCashPosition() {
        // This would normally come from bank integrations
        // For now, calculate based on cumulative cash flow
        const lastCashFlow = this.cashFlowData[this.cashFlowData.length - 1];
        return lastCashFlow ? Math.max(lastCashFlow.runningBalance, 0) : 100000000; // Default 100M VND
    }

    /**
     * Calculate liquidity ratio
     */
    calculateLiquidityRatio() {
        const currentCash = this.getCurrentCashPosition();
        const currentMonthExpenses = this.monthlyData.get(new Date().toISOString().slice(0, 7))?.expenses || 1;
        
        return currentMonthExpenses > 0 ? currentCash / currentMonthExpenses : 0;
    }

    /**
     * Calculate cash cycle in days
     */
    calculateCashCycle() {
        // Simplified calculation
        // In real scenario, this would involve accounts receivable, inventory, and accounts payable
        const averageCollectionPeriod = 30; // Days to collect payment
        const averagePaymentPeriod = 15; // Days to pay suppliers
        
        return averageCollectionPeriod - averagePaymentPeriod;
    }

    /**
     * Calculate Average Revenue Per Customer (ARPC)
     */
    calculateARPC() {
        const uniqueCustomers = new Set();
        let totalRevenue = 0;
        
        this.transactions.forEach(transaction => {
            uniqueCustomers.add(transaction.customer);
            totalRevenue += transaction.revenue;
        });
        
        return uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;
    }

    /**
     * Calculate Customer Acquisition Cost (CAC)
     */
    calculateCAC() {
        // Simplified - would need marketing expense data
        const marketingExpenses = Array.from(this.expensesByCategory.values())
            .filter(category => category.category.toLowerCase().includes('marketing'))
            .reduce((sum, category) => sum + category.amount, 0);
        
        const newCustomers = new Set(this.transactions.map(t => t.customer)).size;
        
        return newCustomers > 0 ? marketingExpenses / newCustomers : 0;
    }

    /**
     * Setup account management
     */
    setupAccounts() {
        // Initialize with default accounts (would normally load from database)
        this.accounts = new Map([
            ['main', {
                id: 'main',
                name: 'Tài khoản chính',
                bank: 'Vietcombank',
                accountNumber: '**** 1234',
                balance: 125500000,
                type: 'checking',
                currency: 'VND'
            }],
            ['backup', {
                id: 'backup',
                name: 'Tài khoản dự phòng',
                bank: 'Techcombank',
                accountNumber: '**** 5678',
                balance: 45750000,
                type: 'savings',
                currency: 'VND'
            }],
            ['operational', {
                id: 'operational',
                name: 'Tài khoản vận hành',
                bank: 'BIDV',
                accountNumber: '**** 9012',
                balance: 12300000,
                type: 'checking',
                currency: 'VND'
            }]
        ]);
    }

    /**
     * Generate financial health indicators
     */
    generateFinancialHealth() {
        const health = {
            overall: 'good',
            indicators: {
                liquidity: {
                    value: this.financialMetrics.liquidityRatio,
                    status: this.financialMetrics.liquidityRatio >= 2 ? 'healthy' : 
                           this.financialMetrics.liquidityRatio >= 1 ? 'warning' : 'danger',
                    description: 'Khả năng thanh toán ngắn hạn'
                },
                profitability: {
                    value: this.financialMetrics.profitMargin,
                    status: this.financialMetrics.profitMargin >= 20 ? 'healthy' : 
                           this.financialMetrics.profitMargin >= 10 ? 'warning' : 'danger',
                    description: 'Tỷ suất lợi nhuận'
                },
                cashFlow: {
                    value: this.financialMetrics.cashRunway,
                    status: this.financialMetrics.cashRunway >= 12 ? 'healthy' : 
                           this.financialMetrics.cashRunway >= 6 ? 'warning' : 'danger',
                    description: 'Runway tài chính'
                },
                growth: {
                    value: this.financialMetrics.revenueChange,
                    status: this.financialMetrics.revenueChange >= 10 ? 'healthy' : 
                           this.financialMetrics.revenueChange >= 0 ? 'warning' : 'danger',
                    description: 'Tăng trưởng doanh thu'
                }
            }
        };
        
        this.financialHealth = health;
        return health;
    }

    /**
     * Generate mock data for testing
     */
    generateMockFinancialData() {
        console.log('📝 Generating mock financial data...');
        
        // Mock transactions
        this.transactions = [
            { id: 1, date: '2025-06-01', revenue: 15000000, customer: 'Customer A', software: 'CRM Software' },
            { id: 2, date: '2025-06-05', revenue: 25000000, customer: 'Customer B', software: 'ERP System' },
            { id: 3, date: '2025-06-10', revenue: 12000000, customer: 'Customer C', software: 'Marketing Tools' }
        ];
        
        // Mock expenses
        this.expenses = [
            { id: 1, date: '2025-06-01', amount: 8000000, category: 'Nhân sự', recurring: true },
            { id: 2, date: '2025-06-02', amount: 3000000, category: 'Marketing', recurring: false },
            { id: 3, date: '2025-06-03', amount: 2000000, category: 'Công cụ', recurring: true }
        ];
    }

    /**
     * Export financial data
     */
    exportFinancialData(format = 'csv') {
        console.log(`📊 Exporting financial data as ${format}...`);
        
        const data = {
            metrics: this.financialMetrics,
            monthlyData: Array.from(this.monthlyData.values()),
            revenueByCategory: Array.from(this.revenueByCategory.values()),
            expensesByCategory: Array.from(this.expensesByCategory.values()),
            cashFlow: this.cashFlowData,
            accounts: Array.from(this.accounts.values())
        };
        
        return data;
    }

    /**
     * Get financial summary for dashboard
     */
    getFinancialSummary() {
        return {
            kpis: {
                totalRevenue: this.financialMetrics.totalRevenue,
                totalExpenses: this.financialMetrics.totalExpenses,
                netProfit: this.financialMetrics.netProfit,
                profitMargin: this.financialMetrics.profitMargin,
                revenueChange: this.financialMetrics.revenueChange,
                expenseChange: this.financialMetrics.expenseChange,
                profitChange: this.financialMetrics.profitChange,
                cashRunway: this.financialMetrics.cashRunway
            },
            charts: {
                monthly: Array.from(this.monthlyData.values()),
                cashFlow: this.cashFlowData,
                revenueByCategory: Array.from(this.revenueByCategory.values()),
                expensesByCategory: Array.from(this.expensesByCategory.values())
            },
            health: this.financialHealth,
            accounts: Array.from(this.accounts.values())
        };
    }
}