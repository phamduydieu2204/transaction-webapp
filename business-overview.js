/**
 * Business Overview Dashboard
 * Xử lý dữ liệu và hiển thị thống kê kinh doanh
 */

class BusinessOverview {
    constructor() {
        this.transactions = [];
        this.expenses = [];
        this.currentPeriod = 'month';
        this.previousData = null;
        
        // Chart configuration
        this.chart = null;
        this.pieChart = null;
        this.currentChartRange = '7days';
        this.currentChartType = 'column';
        this.currentPieView = 'count';
        this.currentPiePeriod = 'month';
        
        // Action table configuration
        this.currentActionFilter = 'all';
        this.actionTableData = [];
        this.filteredActionData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.sortBy = 'date-desc';
        
        this.init();
    }

    /**
     * Khởi tạo dashboard
     */
    init() {
        console.log('🚀 Khởi tạo Business Overview Dashboard');
        this.loadSampleData();
        this.updateDashboard();
        this.initTopPerformers();
    }

    /**
     * Tải dữ liệu mẫu (thay thế bằng API thực tế)
     */
    loadSampleData() {
        // Tạo dữ liệu mẫu cho 30 ngày qua
        this.transactions = [];
        const statuses = ["Đã hoàn tất", "Đã thanh toán", "Chưa thanh toán", "Hoàn tiền", "Đã hủy"];
        const products = ["Office 365", "Windows 11", "Adobe Creative", "Antivirus", "AutoCAD", "SQL Server", "Photoshop", "Enterprise Suite"];
        const customers = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E", "Đặng Thị F", "Bùi Văn G", "Lý Thị H"];

        // Tạo giao dịch cho 30 ngày qua
        for (let i = 0; i < 100; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            let amount = Math.floor(Math.random() * 5000000) + 500000; // 500k - 5.5M
            
            // Hoàn tiền là số âm
            if (status === "Hoàn tiền") {
                amount = -amount;
            }
            
            this.transactions.push({
                id: i + 1,
                status: status,
                amount: amount,
                date: date,
                customer: customers[Math.floor(Math.random() * customers.length)],
                product: products[Math.floor(Math.random() * products.length)]
            });
        }

        // Sắp xếp theo ngày
        this.transactions.sort((a, b) => b.date - a.date);

        // Dữ liệu chi phí mẫu (hiện tại để 0, có thể thêm sau)
        this.expenses = [];
        
        console.log('📊 Đã tải', this.transactions.length, 'giao dịch mẫu cho 30 ngày qua');
    }

    /**
     * Tính toán các chỉ số KPI
     */
    calculateKPIs() {
        const validTransactions = this.transactions.filter(t => t.status !== "Đã hủy");
        
        // Doanh thu (chỉ giao dịch đã hoàn tất)
        const revenue = this.transactions
            .filter(t => t.status === "Đã hoàn tất")
            .reduce((sum, t) => sum + t.amount, 0);

        // Chi phí (hiện tại = 0, có thể lấy từ API khác)
        const expenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);

        // Lợi nhuận (đã tính cả hoàn tiền vì amount đã là số âm)
        const profit = revenue - expenses + this.transactions
            .filter(t => t.status === "Hoàn tiền")
            .reduce((sum, t) => sum + t.amount, 0);

        // Tổng số giao dịch (loại trừ đã hủy)
        const totalTransactions = validTransactions.length;

        // Phân tích theo trạng thái
        const statusBreakdown = this.getStatusBreakdown();

        return {
            revenue,
            expenses,
            profit,
            totalTransactions,
            statusBreakdown
        };
    }

    /**
     * Phân tích giao dịch theo trạng thái
     */
    getStatusBreakdown() {
        const statuses = ["Đã hoàn tất", "Đã thanh toán", "Chưa thanh toán", "Hoàn tiền", "Đã hủy"];
        const breakdown = {};

        statuses.forEach(status => {
            const statusTransactions = this.transactions.filter(t => t.status === status);
            breakdown[status] = {
                count: statusTransactions.length,
                amount: statusTransactions.reduce((sum, t) => sum + t.amount, 0),
                percentage: 0 // Sẽ tính sau
            };
        });

        // Tính phần trăm (dựa trên tổng số giao dịch)
        const totalCount = this.transactions.length;
        Object.keys(breakdown).forEach(status => {
            breakdown[status].percentage = totalCount > 0 
                ? (breakdown[status].count / totalCount * 100) 
                : 0;
        });

        return breakdown;
    }

    /**
     * Tính toán tăng trưởng so với kỳ trước
     */
    calculateGrowth(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100);
    }

    /**
     * Format số tiền VNĐ
     */
    formatCurrency(amount) {
        if (amount === 0) return '0 ₫';
        
        const absAmount = Math.abs(amount);
        const formatted = new Intl.NumberFormat('vi-VN').format(absAmount);
        
        if (amount < 0) {
            return `-${formatted} ₫`;
        }
        return `${formatted} ₫`;
    }

    /**
     * Format số lượng
     */
    formatNumber(number) {
        return new Intl.NumberFormat('vi-VN').format(number);
    }

    /**
     * Cập nhật thẻ KPI
     */
    updateDashboardCards(kpis) {
        // Doanh thu
        document.getElementById('revenue-value').textContent = this.formatCurrency(kpis.revenue);
        
        // Chi phí
        document.getElementById('expense-value').textContent = this.formatCurrency(kpis.expenses);
        
        // Lợi nhuận
        const profitElement = document.getElementById('profit-value');
        profitElement.textContent = this.formatCurrency(kpis.profit);
        profitElement.style.color = kpis.profit >= 0 ? '#27ae60' : '#e74c3c';
        
        // Tổng giao dịch
        document.getElementById('transaction-value').textContent = this.formatNumber(kpis.totalTransactions);

        // Cập nhật tăng trưởng (giả định có dữ liệu kỳ trước)
        this.updateGrowthIndicators(kpis);

        console.log('💰 Đã cập nhật dashboard cards');
    }

    /**
     * Cập nhật chỉ số tăng trưởng
     */
    updateGrowthIndicators(kpis) {
        // Giả lập dữ liệu kỳ trước (thực tế sẽ lấy từ API)
        const previousKpis = {
            revenue: kpis.revenue * 0.85,
            expenses: kpis.expenses * 1.1,
            profit: kpis.profit * 0.75,
            totalTransactions: kpis.totalTransactions * 0.9
        };

        // Tính và hiển thị tăng trưởng
        this.updateGrowthElement('revenue-change', kpis.revenue, previousKpis.revenue);
        this.updateGrowthElement('expense-change', kpis.expenses, previousKpis.expenses);
        this.updateGrowthElement('profit-change', kpis.profit, previousKpis.profit);
        this.updateGrowthElement('transaction-change', kpis.totalTransactions, previousKpis.totalTransactions);
    }

    /**
     * Cập nhật element tăng trưởng
     */
    updateGrowthElement(elementId, current, previous) {
        const element = document.getElementById(elementId);
        const growth = this.calculateGrowth(current, previous);
        const isPositive = growth >= 0;
        
        element.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> 
            ${isPositive ? '+' : ''}${growth.toFixed(1)}%
        `;
        
        element.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
    }

    /**
     * Cập nhật phân bố trạng thái
     */
    updateStatusBreakdown(statusBreakdown) {
        const statusKeys = ["Đã hoàn tất", "Đã thanh toán", "Chưa thanh toán", "Hoàn tiền", "Đã hủy"];
        const statusIds = ["completed", "paid", "unpaid", "refund", "cancelled"];

        statusKeys.forEach((status, index) => {
            const data = statusBreakdown[status];
            const statusId = statusIds[index];

            // Cập nhật số lượng
            document.getElementById(`${statusId}-count`).textContent = this.formatNumber(data.count);
            
            // Cập nhật số tiền
            document.getElementById(`${statusId}-amount`).textContent = this.formatCurrency(data.amount);
            
            // Cập nhật thanh tiến trình
            document.getElementById(`${statusId}-bar`).style.width = `${data.percentage}%`;
        });

        console.log('📊 Đã cập nhật phân bố trạng thái');
    }

    /**
     * Cập nhật toàn bộ dashboard
     */
    updateDashboard() {
        console.log('🔄 Đang cập nhật dashboard...');
        
        const kpis = this.calculateKPIs();
        
        this.updateDashboardCards(kpis);
        this.updateStatusBreakdown(kpis.statusBreakdown);
        this.updateRevenueChart();
        this.updatePieChart();
        this.updateActionTable();
        
        console.log('✅ Hoàn thành cập nhật dashboard');
        console.log('📈 KPIs:', kpis);
    }

    /**
     * Tạo dữ liệu cho biểu đồ theo thời gian
     */
    getChartData(range) {
        const now = new Date();
        let days;
        
        switch (range) {
            case '7days':
                days = 7;
                break;
            case '30days':
                days = 30;
                break;
            case '3months':
                days = 90;
                break;
            case '6months':
                days = 180;
                break;
            default:
                days = 7;
        }

        // Tạo labels theo ngày
        const labels = [];
        const dataPoints = {
            completed: [],
            paid: [],
            unpaid: [],
            refund: []
        };

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Format label
            if (days <= 7) {
                labels.push(date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));
            } else if (days <= 30) {
                labels.push(date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }));
            } else {
                labels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }));
            }

            // Tính tổng cho ngày này
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayTransactions = this.transactions.filter(t => 
                t.date >= dayStart && t.date <= dayEnd
            );

            // Tính theo trạng thái
            dataPoints.completed.push(
                dayTransactions
                    .filter(t => t.status === "Đã hoàn tất")
                    .reduce((sum, t) => sum + t.amount, 0)
            );
            
            dataPoints.paid.push(
                dayTransactions
                    .filter(t => t.status === "Đã thanh toán")
                    .reduce((sum, t) => sum + t.amount, 0)
            );
            
            dataPoints.unpaid.push(
                dayTransactions
                    .filter(t => t.status === "Chưa thanh toán")
                    .reduce((sum, t) => sum + t.amount, 0)
            );
            
            dataPoints.refund.push(
                Math.abs(dayTransactions
                    .filter(t => t.status === "Hoàn tiền")
                    .reduce((sum, t) => sum + t.amount, 0))
            );
        }

        return { labels, dataPoints };
    }

    /**
     * Cập nhật biểu đồ doanh thu
     */
    updateRevenueChart() {
        const ctx = document.getElementById('revenueTrendChart');
        if (!ctx) return;

        const chartData = this.getChartData(this.currentChartRange);
        
        // Hủy chart cũ nếu có
        if (this.chart) {
            this.chart.destroy();
        }

        // Cấu hình chart
        const config = {
            type: this.currentChartType === 'line' ? 'line' : 
                  this.currentChartType === 'area' ? 'line' : 'bar',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Đã hoàn tất',
                        data: chartData.dataPoints.completed,
                        backgroundColor: this.currentChartType === 'area' ? 'rgba(39, 174, 96, 0.2)' : '#27ae60',
                        borderColor: '#27ae60',
                        borderWidth: 2,
                        fill: this.currentChartType === 'area',
                        tension: 0.4
                    },
                    {
                        label: 'Đã thanh toán',
                        data: chartData.dataPoints.paid,
                        backgroundColor: this.currentChartType === 'area' ? 'rgba(52, 152, 219, 0.2)' : '#3498db',
                        borderColor: '#3498db',
                        borderWidth: 2,
                        fill: this.currentChartType === 'area',
                        tension: 0.4
                    },
                    {
                        label: 'Chưa thanh toán',
                        data: chartData.dataPoints.unpaid,
                        backgroundColor: this.currentChartType === 'area' ? 'rgba(243, 156, 18, 0.2)' : '#f39c12',
                        borderColor: '#f39c12',
                        borderWidth: 2,
                        fill: this.currentChartType === 'area',
                        tension: 0.4
                    },
                    {
                        label: 'Hoàn tiền',
                        data: chartData.dataPoints.refund,
                        backgroundColor: this.currentChartType === 'area' ? 'rgba(231, 76, 60, 0.2)' : '#e74c3c',
                        borderColor: '#e74c3c',
                        borderWidth: 2,
                        fill: this.currentChartType === 'area',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrency(value);
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };

        this.chart = new Chart(ctx, config);
        
        // Cập nhật legend và stats
        this.updateChartLegend(chartData);
        this.updateChartStats(chartData);
        
        console.log('📊 Đã cập nhật biểu đồ doanh thu');
    }

    /**
     * Cập nhật legend biểu đồ
     */
    updateChartLegend(chartData) {
        const totals = {
            completed: chartData.dataPoints.completed.reduce((sum, val) => sum + val, 0),
            paid: chartData.dataPoints.paid.reduce((sum, val) => sum + val, 0),
            unpaid: chartData.dataPoints.unpaid.reduce((sum, val) => sum + val, 0),
            refund: chartData.dataPoints.refund.reduce((sum, val) => sum + val, 0)
        };

        document.getElementById('legend-completed').textContent = this.formatCurrency(totals.completed);
        document.getElementById('legend-paid').textContent = this.formatCurrency(totals.paid);
        document.getElementById('legend-unpaid').textContent = this.formatCurrency(totals.unpaid);
        document.getElementById('legend-refund').textContent = this.formatCurrency(totals.refund);
    }

    /**
     * Cập nhật thống kê biểu đồ
     */
    updateChartStats(chartData) {
        const allValues = [];
        chartData.dataPoints.completed.forEach((val, i) => {
            const total = val + chartData.dataPoints.paid[i] + chartData.dataPoints.unpaid[i];
            allValues.push(total);
        });

        const avgDaily = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
        const maxDaily = Math.max(...allValues);
        
        // Tính tăng trưởng (so sánh tuần đầu vs tuần cuối)
        const firstHalf = allValues.slice(0, Math.floor(allValues.length / 2));
        const secondHalf = allValues.slice(Math.floor(allValues.length / 2));
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg * 100) : 0;

        document.getElementById('avg-daily').textContent = this.formatCurrency(avgDaily);
        document.getElementById('max-daily').textContent = this.formatCurrency(maxDaily);
        
        const growthElement = document.getElementById('growth-rate');
        growthElement.textContent = `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
        growthElement.style.color = growthRate >= 0 ? '#27ae60' : '#e74c3c';
    }

    /**
     * Thay đổi khoảng thời gian biểu đồ
     */
    changeChartRange(range) {
        this.currentChartRange = range;
        
        // Cập nhật UI
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-range="${range}"]`).classList.add('active');
        
        // Cập nhật biểu đồ
        this.updateRevenueChart();
        
        console.log('📅 Thay đổi khoảng thời gian biểu đồ:', range);
    }

    /**
     * Thay đổi loại biểu đồ
     */
    changeChartType(type) {
        this.currentChartType = type;
        
        // Cập nhật UI
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // Cập nhật biểu đồ
        this.updateRevenueChart();
        
        console.log('📊 Thay đổi loại biểu đồ:', type);
    }

    /**
     * Lấy dữ liệu theo kỳ pie chart
     */
    getPieChartData(period) {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case 'quarter':
                const quarterStart = Math.floor(now.getMonth() / 3) * 3;
                startDate = new Date(now.getFullYear(), quarterStart, 1);
                endDate = new Date(now.getFullYear(), quarterStart + 3, 0, 23, 59, 59, 999);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case 'all':
            default:
                return this.transactions;
        }

        return this.transactions.filter(t => t.date >= startDate && t.date <= endDate);
    }

    /**
     * Cập nhật pie chart
     */
    updatePieChart() {
        const ctx = document.getElementById('statusPieChart');
        if (!ctx) return;

        const filteredData = this.getPieChartData(this.currentPiePeriod);
        const statusData = this.calculatePieData(filteredData);

        // Hủy chart cũ
        if (this.pieChart) {
            this.pieChart.destroy();
        }

        // Chuẩn bị dữ liệu
        const labels = ['Đã hoàn tất', 'Đã thanh toán', 'Chưa thanh toán', 'Hoàn tiền', 'Đã hủy'];
        const colors = ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#95a5a6'];
        
        let data, total;
        if (this.currentPieView === 'count') {
            data = [
                statusData.completed.count,
                statusData.paid.count,
                statusData.unpaid.count,
                statusData.refund.count,
                statusData.cancelled.count
            ];
            total = data.reduce((sum, val) => sum + val, 0);
        } else {
            data = [
                statusData.completed.amount,
                statusData.paid.amount,
                statusData.unpaid.amount,
                Math.abs(statusData.refund.amount),
                statusData.cancelled.amount
            ];
            total = data.reduce((sum, val) => sum + val, 0);
        }

        // Tạo pie chart
        const config = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color),
                    borderWidth: 2,
                    hoverBorderWidth: 4,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                
                                if (this.currentPieView === 'count') {
                                    return `${context.label}: ${value} (${percentage}%)`;
                                } else {
                                    return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                }
            }
        };

        this.pieChart = new Chart(ctx, config);

        // Cập nhật thông tin chi tiết
        this.updatePieDetails(statusData, filteredData);

        console.log('🥧 Đã cập nhật pie chart');
    }

    /**
     * Tính toán dữ liệu pie chart
     */
    calculatePieData(transactions) {
        const statusBreakdown = {
            completed: { count: 0, amount: 0 },
            paid: { count: 0, amount: 0 },
            unpaid: { count: 0, amount: 0 },
            refund: { count: 0, amount: 0 },
            cancelled: { count: 0, amount: 0 }
        };

        transactions.forEach(t => {
            const status = t.status;
            const amount = t.amount;

            if (status === "Đã hoàn tất") {
                statusBreakdown.completed.count++;
                statusBreakdown.completed.amount += amount;
            } else if (status === "Đã thanh toán") {
                statusBreakdown.paid.count++;
                statusBreakdown.paid.amount += amount;
            } else if (status === "Chưa thanh toán") {
                statusBreakdown.unpaid.count++;
                statusBreakdown.unpaid.amount += amount;
            } else if (status === "Hoàn tiền") {
                statusBreakdown.refund.count++;
                statusBreakdown.refund.amount += amount; // Đã là số âm
            } else if (status === "Đã hủy") {
                statusBreakdown.cancelled.count++;
                statusBreakdown.cancelled.amount += amount;
            }
        });

        return statusBreakdown;
    }

    /**
     * Cập nhật chi tiết pie chart
     */
    updatePieDetails(statusData, filteredTransactions) {
        const total = filteredTransactions.length;
        const totalAmount = Object.values(statusData).reduce((sum, item) => sum + Math.abs(item.amount), 0);

        // Cập nhật tiêu đề và tổng
        document.getElementById('pie-chart-title').textContent = 
            this.currentPieView === 'count' ? 'Phân bố theo số lượng' : 'Phân bố theo giá trị';
        
        const totalValue = this.currentPieView === 'count' ? 
            `${total} giao dịch` : this.formatCurrency(totalAmount);
        document.getElementById('pie-total-value').textContent = totalValue;

        // Cập nhật period
        const periodLabels = {
            'today': 'Hôm nay',
            'week': 'Tuần này', 
            'month': 'Tháng này',
            'quarter': 'Quý này',
            'year': 'Năm nay',
            'all': 'Tất cả'
        };
        document.getElementById('pie-center-period').textContent = periodLabels[this.currentPiePeriod];

        // Cập nhật status cards
        const statuses = ['completed', 'paid', 'unpaid', 'refund', 'cancelled'];
        statuses.forEach(status => {
            const data = statusData[status];
            const percentage = total > 0 ? (data.count / total * 100).toFixed(1) : 0;
            
            document.getElementById(`pie-${status}-count`).textContent = this.formatNumber(data.count);
            document.getElementById(`pie-${status}-amount`).textContent = this.formatCurrency(Math.abs(data.amount));
            document.getElementById(`pie-${status}-percentage`).textContent = `${percentage}%`;
        });

        // Cập nhật insights
        this.updatePieInsights(statusData, total);
    }

    /**
     * Cập nhật thông tin quan trọng
     */
    updatePieInsights(statusData, total) {
        // Tỷ lệ thành công
        const successRate = total > 0 ? (statusData.completed.count / total * 100).toFixed(1) : 0;
        document.getElementById('success-rate-value').textContent = `${successRate}%`;

        // Giao dịch cần theo dõi
        const pendingCount = statusData.paid.count + statusData.unpaid.count;
        document.getElementById('pending-transactions-value').textContent = `${pendingCount} giao dịch`;

        // Tổn thất hoàn tiền
        document.getElementById('refund-loss-value').textContent = this.formatCurrency(Math.abs(statusData.refund.amount));

        // Tiềm năng thu
        const potentialRevenue = statusData.paid.amount + statusData.unpaid.amount;
        document.getElementById('potential-revenue-value').textContent = this.formatCurrency(potentialRevenue);

        // Thay đổi màu insight theo ngưỡng
        const successElement = document.getElementById('insight-success-rate');
        if (successRate >= 80) {
            successElement.className = 'insight-item success';
        } else if (successRate >= 60) {
            successElement.className = 'insight-item warning';
        } else {
            successElement.className = 'insight-item danger';
        }

        const refundElement = document.getElementById('insight-refund');
        if (Math.abs(statusData.refund.amount) > 5000000) { // > 5M
            refundElement.className = 'insight-item danger';
        } else if (Math.abs(statusData.refund.amount) > 1000000) { // > 1M
            refundElement.className = 'insight-item warning';
        } else {
            refundElement.className = 'insight-item info';
        }
    }

    /**
     * Thay đổi view pie chart (count/amount)
     */
    changePieView(view) {
        this.currentPieView = view;
        
        // Cập nhật UI
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Cập nhật pie chart
        this.updatePieChart();
        
        console.log('🥧 Thay đổi pie view:', view);
    }

    /**
     * Thay đổi kỳ pie chart
     */
    changePiePeriod() {
        const period = document.getElementById('pieChartPeriod').value;
        this.currentPiePeriod = period;
        
        // Cập nhật pie chart
        this.updatePieChart();
        
        console.log('📅 Thay đổi pie period:', period);
    }

    /**
     * Chuẩn bị dữ liệu cho action table
     */
    prepareActionTableData() {
        const actionTransactions = [];
        const now = new Date();

        this.transactions.forEach(transaction => {
            let actionRequired = null;
            let priority = 'low';
            let daysSince = Math.floor((now - transaction.date) / (1000 * 60 * 60 * 24));

            // Xác định loại action cần thiết
            if (transaction.status === "Đã thanh toán") {
                actionRequired = {
                    type: 'delivery',
                    action: 'Cần giao hàng',
                    description: 'Khách đã thanh toán, cần giao hàng'
                };
                if (daysSince > 3) priority = 'high';
                else if (daysSince > 1) priority = 'medium';
            } else if (transaction.status === "Chưa thanh toán") {
                // Giả sử có field delivered (thực tế cần thêm vào data)
                const isDelivered = Math.random() > 0.7; // Giả lập
                if (isDelivered) {
                    actionRequired = {
                        type: 'payment',
                        action: 'Cần thu tiền',
                        description: 'Đã giao hàng, cần thu tiền từ khách'
                    };
                    if (daysSince > 7) priority = 'high';
                    else if (daysSince > 3) priority = 'medium';
                }
            } else if (transaction.status === "Hoàn tiền") {
                actionRequired = {
                    type: 'refund',
                    action: 'Xử lý hoàn tiền',
                    description: 'Khách yêu cầu hoàn tiền'
                };
                priority = 'high';
            }

            if (actionRequired) {
                actionTransactions.push({
                    ...transaction,
                    actionRequired: actionRequired,
                    priority: priority,
                    daysSince: daysSince
                });
            }
        });

        this.actionTableData = actionTransactions;
        return actionTransactions;
    }

    /**
     * Cập nhật action table
     */
    updateActionTable() {
        const actionData = this.prepareActionTableData();
        
        // Cập nhật action stats
        this.updateActionStats(actionData);
        
        // Cập nhật filter counts
        this.updateFilterCounts(actionData);
        
        // Lọc và hiển thị data
        this.filterAndDisplayActionData();
        
        console.log('📋 Đã cập nhật action table với', actionData.length, 'giao dịch cần xử lý');
    }

    /**
     * Cập nhật thống kê action
     */
    updateActionStats(actionData) {
        const stats = {
            delivery: { count: 0, amount: 0 },
            payment: { count: 0, amount: 0 },
            refund: { count: 0, amount: 0 }
        };

        actionData.forEach(item => {
            const type = item.actionRequired.type;
            stats[type].count++;
            stats[type].amount += Math.abs(item.amount);
        });

        // Cập nhật UI
        document.getElementById('delivery-stat-count').textContent = stats.delivery.count;
        document.getElementById('delivery-stat-amount').textContent = this.formatCurrency(stats.delivery.amount);
        
        document.getElementById('payment-stat-count').textContent = stats.payment.count;
        document.getElementById('payment-stat-amount').textContent = this.formatCurrency(stats.payment.amount);
        
        document.getElementById('refund-stat-count').textContent = stats.refund.count;
        document.getElementById('refund-stat-amount').textContent = this.formatCurrency(stats.refund.amount);
    }

    /**
     * Cập nhật số đếm filter
     */
    updateFilterCounts(actionData) {
        const counts = {
            all: actionData.length,
            delivery: actionData.filter(item => item.actionRequired.type === 'delivery').length,
            payment: actionData.filter(item => item.actionRequired.type === 'payment').length,
            refund: actionData.filter(item => item.actionRequired.type === 'refund').length
        };

        document.getElementById('all-count').textContent = counts.all;
        document.getElementById('delivery-count').textContent = counts.delivery;
        document.getElementById('payment-count').textContent = counts.payment;
        document.getElementById('refund-count').textContent = counts.refund;
    }

    /**
     * Lọc và hiển thị dữ liệu action table
     */
    filterAndDisplayActionData() {
        let filteredData = [...this.actionTableData];

        // Lọc theo filter type
        if (this.currentActionFilter !== 'all') {
            filteredData = filteredData.filter(item => 
                item.actionRequired.type === this.currentActionFilter
            );
        }

        // Lọc theo search term
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.customer.toLowerCase().includes(searchLower) ||
                item.product.toLowerCase().includes(searchLower) ||
                item.actionRequired.action.toLowerCase().includes(searchLower)
            );
        }

        // Sắp xếp
        this.sortActionData(filteredData);

        this.filteredActionData = filteredData;
        this.currentPage = 1; // Reset về trang đầu

        // Hiển thị
        this.displayActionTablePage();
        this.updatePagination();
        this.updateFilterText();
    }

    /**
     * Sắp xếp dữ liệu action table
     */
    sortActionData(data) {
        switch (this.sortBy) {
            case 'date-desc':
                data.sort((a, b) => b.date - a.date);
                break;
            case 'date-asc':
                data.sort((a, b) => a.date - b.date);
                break;
            case 'amount-desc':
                data.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
                break;
            case 'amount-asc':
                data.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
                break;
            case 'priority':
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                data.sort((a, b) => {
                    const aPriority = priorityOrder[a.priority] || 0;
                    const bPriority = priorityOrder[b.priority] || 0;
                    if (aPriority !== bPriority) {
                        return bPriority - aPriority;
                    }
                    return b.daysSince - a.daysSince; // Nếu cùng priority, ưu tiên ngày cũ hơn
                });
                break;
        }
    }

    /**
     * Hiển thị trang action table hiện tại
     */
    displayActionTablePage() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredActionData.slice(startIndex, endIndex);

        const tbody = document.getElementById('action-table-body');
        if (!tbody) return;

        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-inbox" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        Không có giao dịch nào cần xử lý
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageData.map(item => {
            const priorityClass = item.priority;
            const daysClass = item.daysSince > 7 ? 'urgent' : item.daysSince > 3 ? 'warning' : 'normal';
            const actionTypeClass = item.actionRequired.type;

            return `
                <tr data-id="${item.id}">
                    <td class="checkbox-col">
                        <input type="checkbox" class="row-checkbox" value="${item.id}">
                    </td>
                    <td class="priority-col">
                        <div class="priority-flag ${priorityClass}" title="Độ ưu tiên ${priorityClass}"></div>
                    </td>
                    <td class="date-col">${item.date.toLocaleDateString('vi-VN')}</td>
                    <td class="customer-col">
                        <div style="font-weight: 600;">${item.customer}</div>
                    </td>
                    <td class="product-col">${item.product}</td>
                    <td class="amount-col">${this.formatCurrency(Math.abs(item.amount))}</td>
                    <td class="status-col">
                        <span class="status-badge ${item.status.includes('thanh toán') ? 'paid' : item.status.includes('Hoàn') ? 'refund' : 'unpaid'}">
                            ${item.status}
                        </span>
                    </td>
                    <td class="action-col">
                        <span class="action-required ${actionTypeClass}" title="${item.actionRequired.description}">
                            ${item.actionRequired.action}
                        </span>
                    </td>
                    <td class="days-col">
                        <span class="days-badge ${daysClass}">${item.daysSince} ngày</span>
                    </td>
                    <td class="actions-col">
                        ${this.getActionButtons(item)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Tạo action buttons cho từng loại
     */
    getActionButtons(item) {
        const type = item.actionRequired.type;
        
        switch (type) {
            case 'delivery':
                return `
                    <button class="action-btn success" onclick="markAsDelivered(${item.id})" title="Đánh dấu đã giao">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn primary" onclick="viewTransactionDetail(${item.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
            case 'payment':
                return `
                    <button class="action-btn warning" onclick="collectPayment(${item.id})" title="Thu tiền">
                        <i class="fas fa-dollar-sign"></i>
                    </button>
                    <button class="action-btn primary" onclick="viewTransactionDetail(${item.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
            case 'refund':
                return `
                    <button class="action-btn danger" onclick="processRefund(${item.id})" title="Xử lý hoàn tiền">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="action-btn primary" onclick="viewTransactionDetail(${item.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
            default:
                return `
                    <button class="action-btn primary" onclick="viewTransactionDetail(${item.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
        }
    }

    /**
     * Cập nhật pagination
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredActionData.length / this.itemsPerPage);
        const startRecord = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endRecord = Math.min(startRecord + this.itemsPerPage - 1, this.filteredActionData.length);

        // Cập nhật thông tin
        document.getElementById('start-record').textContent = this.filteredActionData.length > 0 ? startRecord : 0;
        document.getElementById('end-record').textContent = endRecord;
        document.getElementById('total-records').textContent = this.filteredActionData.length;
        document.getElementById('filtered-count').textContent = this.filteredActionData.length;

        // Cập nhật nút prev/next
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        // Tạo page numbers
        this.generatePageNumbers(totalPages);
    }

    /**
     * Tạo số trang
     */
    generatePageNumbers(totalPages) {
        const pageNumbersContainer = document.getElementById('page-numbers');
        if (!pageNumbersContainer) return;

        let pagesHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pagesHTML += `
                <span class="page-number ${i === this.currentPage ? 'active' : ''}" 
                      onclick="goToPage(${i})">${i}</span>
            `;
        }

        pageNumbersContainer.innerHTML = pagesHTML;
    }

    /**
     * Cập nhật text filter hiện tại
     */
    updateFilterText() {
        const filterTexts = {
            'all': 'Tất cả giao dịch cần xử lý',
            'delivery': 'Cần giao hàng',
            'payment': 'Cần thu tiền',
            'refund': 'Hoàn tiền'
        };

        const filterTextElement = document.getElementById('current-filter-text');
        if (filterTextElement) {
            filterTextElement.textContent = filterTexts[this.currentActionFilter];
        }
    }

    /**
     * Thay đổi filter action
     */
    changeActionFilter(filter) {
        this.currentActionFilter = filter;
        
        // Cập nhật UI tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Lọc lại dữ liệu
        this.filterAndDisplayActionData();
        
        console.log('🔍 Thay đổi action filter:', filter);
    }

    /**
     * Tìm kiếm trong action table
     */
    searchActionTable() {
        const searchInput = document.getElementById('action-search');
        this.searchTerm = searchInput ? searchInput.value : '';
        this.filterAndDisplayActionData();
    }

    /**
     * Sắp xếp action table
     */
    sortActionTable() {
        const sortSelect = document.getElementById('action-sort');
        this.sortBy = sortSelect ? sortSelect.value : 'date-desc';
        this.filterAndDisplayActionData();
    }

    /**
     * Chuyển trang
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredActionData.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.displayActionTablePage();
            this.updatePagination();
        }
    }

    /**
     * Trang trước
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    /**
     * Trang sau
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredActionData.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    /**
     * Toggle select all checkboxes
     */
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('select-all');
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        
        if (selectAllCheckbox && rowCheckboxes.length > 0) {
            const isChecked = selectAllCheckbox.checked;
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.toggle('selected', isChecked);
                }
            });
        }
    }

    /**
     * Thay đổi kỳ báo cáo
     */
    changePeriod(period) {
        this.currentPeriod = period;
        console.log('📅 Thay đổi kỳ báo cáo:', period);
        
        // Hiện tại chỉ log, sẽ implement filter theo thời gian ở phần tiếp theo
        this.updateDashboard();
    }

    /**
     * Làm mới dữ liệu
     */
    refreshData() {
        console.log('🔄 Làm mới dữ liệu...');
        
        // Hiệu ứng loading
        const refreshBtn = document.querySelector('.btn-refresh i');
        refreshBtn.classList.add('loading');
        
        // Giả lập API call
        setTimeout(() => {
            this.loadSampleData();
            this.updateDashboard();
            refreshBtn.classList.remove('loading');
            console.log('✅ Đã làm mới dữ liệu');
        }, 1000);
    }

    // ===== TOP PERFORMERS METHODS =====

    /**
     * Khởi tạo Top Performers section
     */
    initTopPerformers() {
        this.topPerformersData = {
            customers: [],
            products: [],
            period: 'month',
            view: 'revenue', // revenue or quantity
            showMore: {
                customers: false,
                products: false
            }
        };

        this.updateTopPerformers();
    }

    /**
     * Cập nhật dữ liệu Top Performers
     */
    updateTopPerformers() {
        this.prepareTopPerformersData();
        this.renderTopCustomersStats();
        this.renderTopProductsStats();
        this.renderTopCustomersTable();
        this.renderTopProductsTable();
        this.renderPerformanceInsights();
    }

    /**
     * Chuẩn bị dữ liệu Top Performers
     */
    prepareTopPerformersData() {
        const period = this.topPerformersData.period;
        const view = this.topPerformersData.view;
        
        // Lọc giao dịch theo thời kỳ
        const filteredTransactions = this.filterTransactionsByPeriod(this.transactions, period);
        
        // Phân tích khách hàng
        const customerAnalysis = this.analyzeCustomers(filteredTransactions, view);
        
        // Phân tích sản phẩm
        const productAnalysis = this.analyzeProducts(filteredTransactions, view);
        
        this.topPerformersData.customers = customerAnalysis;
        this.topPerformersData.products = productAnalysis;
    }

    /**
     * Phân tích dữ liệu khách hàng
     */
    analyzeCustomers(transactions, view) {
        const customerStats = {};
        
        transactions.forEach(transaction => {
            const customer = transaction.customer;
            if (!customerStats[customer]) {
                customerStats[customer] = {
                    name: customer,
                    email: this.generateCustomerEmail(customer),
                    orders: 0,
                    revenue: 0,
                    lastOrder: transaction.date,
                    status: 'regular'
                };
            }
            
            customerStats[customer].orders++;
            customerStats[customer].revenue += transaction.amount;
            
            if (transaction.date > customerStats[customer].lastOrder) {
                customerStats[customer].lastOrder = transaction.date;
            }
        });
        
        // Chuyển đổi thành array và sắp xếp
        const customers = Object.values(customerStats).map(customer => ({
            ...customer,
            avgOrderValue: customer.revenue / customer.orders,
            daysSinceLastOrder: Math.floor((new Date() - customer.lastOrder) / (1000 * 60 * 60 * 24))
        }));
        
        // Xác định trạng thái khách hàng
        customers.forEach(customer => {
            if (customer.revenue >= 5000000) customer.status = 'vip';
            else if (customer.orders >= 5) customer.status = 'regular';
            else customer.status = 'new';
        });
        
        // Sắp xếp theo view
        const sortKey = view === 'revenue' ? 'revenue' : 'orders';
        return customers.sort((a, b) => b[sortKey] - a[sortKey]);
    }

    /**
     * Phân tích dữ liệu sản phẩm
     */
    analyzeProducts(transactions, view) {
        const productStats = {};
        
        transactions.forEach(transaction => {
            const product = transaction.product;
            if (!productStats[product]) {
                productStats[product] = {
                    name: product,
                    category: this.getProductCategory(product),
                    sold: 0,
                    revenue: 0,
                    orders: []
                };
            }
            
            productStats[product].sold++;
            productStats[product].revenue += transaction.amount;
            productStats[product].orders.push(transaction.date);
        });
        
        // Chuyển đổi thành array và tính toán
        const products = Object.values(productStats).map(product => {
            const avgPrice = product.revenue / product.sold;
            const trend = this.calculateProductTrend(product.orders);
            const performance = this.calculateProductPerformance(product.revenue, product.sold);
            
            return {
                ...product,
                avgPrice,
                trend,
                performance
            };
        });
        
        // Sắp xếp theo view
        const sortKey = view === 'revenue' ? 'revenue' : 'sold';
        return products.sort((a, b) => b[sortKey] - a[sortKey]);
    }

    /**
     * Tính toán xu hướng sản phẩm
     */
    calculateProductTrend(orders) {
        if (orders.length < 2) return 'stable';
        
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const prevWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const recentOrders = orders.filter(date => date >= lastWeek).length;
        const previousOrders = orders.filter(date => date >= prevWeek && date < lastWeek).length;
        
        if (recentOrders > previousOrders) return 'up';
        if (recentOrders < previousOrders) return 'down';
        return 'stable';
    }

    /**
     * Tính toán hiệu suất sản phẩm
     */
    calculateProductPerformance(revenue, sold) {
        const score = (revenue / 1000000) + (sold / 10); // Weighted score
        
        if (score >= 4) return { level: 'excellent', percentage: Math.min(100, score * 20) };
        if (score >= 2) return { level: 'good', percentage: Math.min(100, score * 30) };
        if (score >= 1) return { level: 'average', percentage: Math.min(100, score * 40) };
        return { level: 'poor', percentage: Math.min(100, score * 50) };
    }

    /**
     * Render Top Customers Stats
     */
    renderTopCustomersStats() {
        const customers = this.topPerformersData.customers;
        const vipCustomers = customers.filter(c => c.status === 'vip');
        const repeatCustomers = customers.filter(c => c.orders > 1);
        
        const avgCustomerValue = customers.length > 0 
            ? customers.reduce((sum, c) => sum + c.revenue, 0) / customers.length 
            : 0;
        const avgCustomerOrders = customers.length > 0
            ? customers.reduce((sum, c) => sum + c.orders, 0) / customers.length
            : 0;
        
        document.getElementById('vip-customers-count').textContent = vipCustomers.length;
        document.getElementById('vip-customers-revenue').textContent = 
            this.formatCurrency(vipCustomers.reduce((sum, c) => sum + c.revenue, 0));
        
        document.getElementById('repeat-customers-count').textContent = repeatCustomers.length;
        document.getElementById('repeat-customers-rate').textContent = 
            customers.length > 0 ? Math.round((repeatCustomers.length / customers.length) * 100) + '%' : '0%';
        
        document.getElementById('avg-customer-value').textContent = this.formatCurrency(avgCustomerValue);
        document.getElementById('avg-customer-orders').textContent = Math.round(avgCustomerOrders);
    }

    /**
     * Render Top Products Stats
     */
    renderTopProductsStats() {
        const products = this.topPerformersData.products;
        const bestSellers = products.filter(p => p.sold >= 3);
        const trendingProducts = products.filter(p => p.trend === 'up');
        
        const avgProfitMargin = 25; // Giả định
        const bestMarginProduct = products.length > 0 ? products[0].name : '-';
        
        document.getElementById('bestseller-count').textContent = bestSellers.length;
        document.getElementById('bestseller-revenue').textContent = 
            this.formatCurrency(bestSellers.reduce((sum, p) => sum + p.revenue, 0));
        
        document.getElementById('trending-products-count').textContent = trendingProducts.length;
        document.getElementById('trending-growth-rate').textContent = '+' + (trendingProducts.length * 5) + '%';
        
        document.getElementById('avg-profit-margin').textContent = avgProfitMargin + '%';
        document.getElementById('best-margin-product').textContent = bestMarginProduct;
    }

    /**
     * Render Top Customers Table
     */
    renderTopCustomersTable() {
        const customers = this.topPerformersData.customers;
        const showMore = this.topPerformersData.showMore.customers;
        const displayCount = showMore ? customers.length : Math.min(5, customers.length);
        
        const tbody = document.getElementById('customers-table-body');
        tbody.innerHTML = '';
        
        for (let i = 0; i < displayCount; i++) {
            const customer = customers[i];
            if (!customer) break;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="rank-col">${i + 1}</td>
                <td class="customer-col">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-email">${customer.email}</div>
                </td>
                <td class="orders-col">${customer.orders}</td>
                <td class="revenue-col">${this.formatCurrency(customer.revenue)}</td>
                <td class="avg-col">${this.formatCurrency(customer.avgOrderValue)}</td>
                <td class="last-order-col">${customer.daysSinceLastOrder} ngày</td>
                <td class="status-col">
                    <span class="status-indicator ${customer.status}">
                        ${customer.status === 'vip' ? 'VIP' : customer.status === 'new' ? 'Mới' : 'Thường'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        }
        
        // Update counts
        document.getElementById('customers-table-count').textContent = `(${customers.length} khách hàng)`;
        
        // Update show more button
        const showMoreBtn = document.getElementById('show-more-customers');
        if (customers.length > 5) {
            showMoreBtn.style.display = 'inline-flex';
            showMoreBtn.innerHTML = showMore 
                ? '<i class="fas fa-chevron-up"></i> Ẩn bớt'
                : '<i class="fas fa-chevron-down"></i> Hiển thị thêm';
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    /**
     * Render Top Products Table
     */
    renderTopProductsTable() {
        const products = this.topPerformersData.products;
        const showMore = this.topPerformersData.showMore.products;
        const displayCount = showMore ? products.length : Math.min(5, products.length);
        
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';
        
        for (let i = 0; i < displayCount; i++) {
            const product = products[i];
            if (!product) break;
            
            const trendIcon = product.trend === 'up' ? 'fa-arrow-up' : 
                            product.trend === 'down' ? 'fa-arrow-down' : 'fa-minus';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="rank-col">${i + 1}</td>
                <td class="product-col">
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${product.category}</div>
                </td>
                <td class="sold-col">${product.sold}</td>
                <td class="revenue-col">${this.formatCurrency(product.revenue)}</td>
                <td class="avg-price-col">${this.formatCurrency(product.avgPrice)}</td>
                <td class="trend-col">
                    <span class="trend-indicator ${product.trend}">
                        <i class="fas ${trendIcon}"></i>
                    </span>
                </td>
                <td class="performance-col">
                    <div class="performance-bar">
                        <div class="performance-fill ${product.performance.level}" 
                             style="width: ${product.performance.percentage}%"></div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }
        
        // Update counts
        document.getElementById('products-table-count').textContent = `(${products.length} sản phẩm)`;
        
        // Update show more button
        const showMoreBtn = document.getElementById('show-more-products');
        if (products.length > 5) {
            showMoreBtn.style.display = 'inline-flex';
            showMoreBtn.innerHTML = showMore 
                ? '<i class="fas fa-chevron-up"></i> Ẩn bớt'
                : '<i class="fas fa-chevron-down"></i> Hiển thị thêm';
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    /**
     * Render Performance Insights
     */
    renderPerformanceInsights() {
        const customers = this.topPerformersData.customers;
        const products = this.topPerformersData.products;
        
        // Customer insights
        const returnRate = customers.length > 0 
            ? Math.round((customers.filter(c => c.orders > 1).length / customers.length) * 100)
            : 0;
        const newCustomers = customers.filter(c => c.status === 'new').length;
        const avgCustomerLTV = customers.length > 0
            ? customers.reduce((sum, c) => sum + c.revenue, 0) / customers.length
            : 0;
        
        document.getElementById('insight-return-rate').textContent = returnRate + '%';
        document.getElementById('insight-new-customers').textContent = newCustomers;
        document.getElementById('insight-avg-customer-ltv').textContent = this.formatCurrency(avgCustomerLTV);
        
        // Product insights
        const topProduct = products.length > 0 ? products[0].name : '-';
        const fastestGrowing = products.find(p => p.trend === 'up')?.name || '-';
        const mostProfitable = products.length > 0 ? products[0].name : '-';
        
        document.getElementById('insight-top-product').textContent = topProduct;
        document.getElementById('insight-fastest-growing').textContent = fastestGrowing;
        document.getElementById('insight-most-profitable').textContent = mostProfitable;
        
        // Trend insights
        const revenueGrowth = Math.round(Math.random() * 20 + 5); // Giả định
        const effectiveNewProducts = products.filter(p => p.sold >= 2).length;
        const peakSeason = 'Tháng 12'; // Giả định
        
        document.getElementById('insight-revenue-growth').textContent = '+' + revenueGrowth + '%';
        document.getElementById('insight-new-products').textContent = effectiveNewProducts;
        document.getElementById('insight-peak-season').textContent = peakSeason;
    }

    /**
     * Helper functions
     */
    generateCustomerEmail(name) {
        return name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
    }

    getProductCategory(product) {
        const categories = {
            'Office 365': 'Productivity',
            'Windows 11': 'Operating System',
            'Adobe Creative': 'Design',
            'Antivirus': 'Security',
            'AutoCAD': 'Engineering',
            'Photoshop': 'Design',
            'Zoom Pro': 'Communication'
        };
        return categories[product] || 'Software';
    }

    /**
     * Change top performers period
     */
    changeTopPerformersPeriod() {
        const period = document.getElementById('topPerformersPeriod').value;
        this.topPerformersData.period = period;
        
        // Update period labels
        const periodNames = {
            'week': 'Tuần này',
            'month': 'Tháng này', 
            'quarter': 'Quý này',
            'year': 'Năm này',
            'all': 'Tất cả thời gian'
        };
        
        document.getElementById('customers-period').textContent = periodNames[period];
        document.getElementById('products-period').textContent = periodNames[period];
        
        this.updateTopPerformers();
    }

    /**
     * Change top performers view (revenue/quantity)
     */
    changeTopView(view) {
        // Update active button
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.topPerformersData.view = view;
        
        // Update metric labels
        const metricNames = {
            'revenue': 'theo doanh thu',
            'quantity': 'theo số lượng'
        };
        
        document.getElementById('customers-metric').textContent = metricNames[view];
        document.getElementById('products-metric').textContent = metricNames[view];
        
        this.updateTopPerformers();
    }

    // ===== CSV EXPORT HELPER METHODS =====

    /**
     * Xuất dữ liệu table thành CSV
     */
    exportTableToCSV(data, fields, headers) {
        const csvContent = [];
        
        // Header row
        csvContent.push(headers.join(','));
        
        // Data rows
        data.forEach(item => {
            const row = fields.map(field => {
                let value = item[field];
                
                // Format values based on field type
                if (field === 'revenue' || field === 'avgOrderValue' || field === 'avgPrice') {
                    value = this.formatCurrency(value).replace(/[₫,]/g, '');
                } else if (field === 'trend') {
                    value = value === 'up' ? 'Tăng' : value === 'down' ? 'Giảm' : 'Ổn định';
                } else if (field === 'status') {
                    value = value === 'vip' ? 'VIP' : value === 'new' ? 'Mới' : 'Thường';
                }
                
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                
                return value;
            });
            csvContent.push(row.join(','));
        });
        
        return csvContent.join('\n');
    }

    /**
     * Download CSV file
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Khởi tạo dashboard khi trang load xong
let dashboard;

document.addEventListener('DOMContentLoaded', function() {
    dashboard = new BusinessOverview();
});

// Các hàm global cho HTML events
function refreshData() {
    if (dashboard) {
        dashboard.refreshData();
    }
}

function changePeriod() {
    const period = document.getElementById('periodSelector').value;
    if (dashboard) {
        dashboard.changePeriod(period);
    }
}

function changeChartRange(range) {
    if (dashboard) {
        dashboard.changeChartRange(range);
    }
}

function changeChartType(type) {
    if (dashboard) {
        dashboard.changeChartType(type);
    }
}

function changePieView(view) {
    if (dashboard) {
        dashboard.changePieView(view);
    }
}

function changePiePeriod() {
    if (dashboard) {
        dashboard.changePiePeriod();
    }
}

// ===== TOP PERFORMERS GLOBAL FUNCTIONS =====

function changeTopPerformersPeriod() {
    if (dashboard) {
        dashboard.changeTopPerformersPeriod();
    }
}

function changeTopView(view) {
    if (dashboard) {
        dashboard.changeTopView(view);
    }
}

function showMoreCustomers() {
    if (dashboard) {
        dashboard.topPerformersData.showMore.customers = !dashboard.topPerformersData.showMore.customers;
        dashboard.renderTopCustomersTable();
    }
}

function showMoreProducts() {
    if (dashboard) {
        dashboard.topPerformersData.showMore.products = !dashboard.topPerformersData.showMore.products;
        dashboard.renderTopProductsTable();
    }
}

function expandCustomersTable() {
    if (dashboard) {
        // Tạo modal hoặc chuyển sang trang chi tiết
        alert('Chức năng mở rộng bảng khách hàng sẽ được implement sau');
    }
}

function expandProductsTable() {
    if (dashboard) {
        // Tạo modal hoặc chuyển sang trang chi tiết
        alert('Chức năng mở rộng bảng sản phẩm sẽ được implement sau');
    }
}

function exportCustomersTable() {
    if (dashboard) {
        // Xuất CSV cho bảng khách hàng
        const customers = dashboard.topPerformersData.customers;
        const csv = dashboard.exportTableToCSV(customers, [
            'name', 'email', 'orders', 'revenue', 'avgOrderValue', 'status'
        ], [
            'Tên khách hàng', 'Email', 'Đơn hàng', 'Doanh thu', 'TB/đơn', 'Trạng thái'
        ]);
        dashboard.downloadCSV(csv, 'top-khach-hang.csv');
    }
}

function exportProductsTable() {
    if (dashboard) {
        // Xuất CSV cho bảng sản phẩm
        const products = dashboard.topPerformersData.products;
        const csv = dashboard.exportTableToCSV(products, [
            'name', 'category', 'sold', 'revenue', 'avgPrice', 'trend'
        ], [
            'Tên sản phẩm', 'Danh mục', 'Đã bán', 'Doanh thu', 'Giá TB', 'Xu hướng'
        ]);
        dashboard.downloadCSV(csv, 'top-san-pham.csv');
    }
}

// Export cho việc sử dụng module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BusinessOverview;
}