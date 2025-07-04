/**
 * Financial Charts Module
 * Tạo và quản lý các biểu đồ tài chính
 */

export class FinancialCharts {
    constructor() {
        this.charts = new Map();
        this.chartConfig = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                                notation: 'compact'
                            }).format(value);
                        }
                    }
                }
            }
        };
    }

    /**
     * Render cash flow chart
     */
    renderCashFlowChart(cashFlowData) {
        const canvas = document.getElementById('cashFlowChart');
        if (!canvas) {
// console.warn('Cash flow chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('cashFlow')) {
            this.charts.get('cashFlow').destroy();
        }

        const labels = cashFlowData.map(data => {
            const [year, month] = data.month.split('-');
            return `${month}/${year}`;
        });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Tiền vào',
                    data: cashFlowData.map(data => data.cashIn),
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    type: 'bar'
                },
                {
                    label: 'Tiền ra',
                    data: cashFlowData.map(data => data.cashOut),
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    type: 'bar'
                },
                {
                    label: 'Dòng tiền ròng',
                    data: cashFlowData.map(data => data.netCashFlow),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 3,
                    type: 'line',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                ...this.chartConfig,
                plugins: {
                    ...this.chartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Dòng tiền theo tháng'
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('cashFlow', chart);
    }

    /**
     * Render profit & loss chart
     */
    renderProfitLossChart(monthlyData) {
        const canvas = document.getElementById('profitLossChart');
        if (!canvas) {
// console.warn('Profit loss chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('profitLoss')) {
            this.charts.get('profitLoss').destroy();
        }

        const sortedData = Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
        
        const labels = sortedData.map(data => {
            const [year, month] = data.month.split('-');
            return `${month}/${year}`;
        });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Doanh thu',
                    data: sortedData.map(data => data.revenue),
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Chi phí',
                    data: sortedData.map(data => data.expenses),
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Lợi nhuận',
                    data: sortedData.map(data => data.profit),
                    backgroundColor: sortedData.map(data => 
                        data.profit >= 0 ? 'rgba(40, 167, 69, 0.6)' : 'rgba(220, 53, 69, 0.6)'
                    ),
                    borderColor: sortedData.map(data => 
                        data.profit >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'
                    ),
                    borderWidth: 2
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                ...this.chartConfig,
                plugins: {
                    ...this.chartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Báo cáo Lãi/Lỗ theo tháng'
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('profitLoss', chart);
    }

    /**
     * Render budget vs actual chart
     */
    renderBudgetVsActualChart(actualData, budgetData = null) {
        const canvas = document.getElementById('budgetVsActualChart');
        if (!canvas) {
// console.warn('Budget vs actual chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('budgetVsActual')) {
            this.charts.get('budgetVsActual').destroy();
        }

        // Generate mock budget data if not provided
        if (!budgetData) {
            budgetData = this.generateMockBudgetData(actualData);
        }

        const sortedActual = Array.from(actualData.values()).sort((a, b) => a.month.localeCompare(b.month));
        
        const labels = sortedActual.map(data => {
            const [year, month] = data.month.split('-');
            return `${month}/${year}`;
        });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Ngân sách',
                    data: budgetData,
                    backgroundColor: 'rgba(108, 117, 125, 0.6)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Thực tế',
                    data: sortedActual.map(data => data.expenses),
                    backgroundColor: 'rgba(23, 162, 184, 0.8)',
                    borderColor: 'rgba(23, 162, 184, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Chênh lệch',
                    data: sortedActual.map((data, index) => data.expenses - budgetData[index]),
                    backgroundColor: sortedActual.map((data, index) => 
                        data.expenses <= budgetData[index] ? 'rgba(40, 167, 69, 0.6)' : 'rgba(220, 53, 69, 0.6)'
                    ),
                    borderColor: sortedActual.map((data, index) => 
                        data.expenses <= budgetData[index] ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'
                    ),
                    borderWidth: 2
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                ...this.chartConfig,
                plugins: {
                    ...this.chartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Ngân sách vs Thực tế'
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('budgetVsActual', chart);
    }

    /**
     * Render account balance chart
     */
    renderAccountBalanceChart(accounts) {
        const canvas = document.getElementById('accountBalanceChart');
        if (!canvas) {
// console.warn('Account balance chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('accountBalance')) {
            this.charts.get('accountBalance').destroy();
        }

        const accountsArray = Array.from(accounts.values());
        
        const data = {
            labels: accountsArray.map(account => account.name),
            datasets: [{
                label: 'Số dư tài khoản',
                data: accountsArray.map(account => account.balance),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Phân bổ số dư tài khoản'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(context.parsed);
                                const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('accountBalance', chart);
    }

    /**
     * Render revenue by category chart
     */
    renderRevenueByCategoryChart(revenueByCategory) {
        const canvas = document.getElementById('revenueByCategoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('revenueByCategory')) {
            this.charts.get('revenueByCategory').destroy();
        }

        const categories = Array.from(revenueByCategory.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8); // Top 8 categories

        const data = {
            labels: categories.map(cat => cat.category),
            datasets: [{
                label: 'Doanh thu theo danh mục',
                data: categories.map(cat => cat.revenue),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Doanh thu theo danh mục'
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('revenueByCategory', chart);
    }

    /**
     * Render expenses by category chart
     */
    renderExpensesByCategoryChart(expensesByCategory) {
        const canvas = document.getElementById('expensesByCategoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('expensesByCategory')) {
            this.charts.get('expensesByCategory').destroy();
        }

        const categories = Array.from(expensesByCategory.values())
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 8); // Top 8 categories

        const data = {
            labels: categories.map(cat => cat.category),
            datasets: [{
                label: 'Chi phí theo danh mục',
                data: categories.map(cat => cat.amount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(201, 203, 207, 0.8)',
                    'rgba(255, 99, 255, 0.8)'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: 'horizontalBar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Chi phí theo danh mục'
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    notation: 'compact'
                                }).format(value);
                            }
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('expensesByCategory', chart);
    }

    /**
     * Render financial trends chart
     */
    renderFinancialTrendsChart(monthlyData) {
        const canvas = document.getElementById('financialTrendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('financialTrends')) {
            this.charts.get('financialTrends').destroy();
        }

        const sortedData = Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
        
        // Calculate profit margin for each month
        const profitMargins = sortedData.map(data => 
            data.revenue > 0 ? ((data.profit / data.revenue) * 100) : 0
        );

        const labels = sortedData.map(data => {
            const [year, month] = data.month.split('-');
            return `${month}/${year}`;
        });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Doanh thu',
                    data: sortedData.map(data => data.revenue),
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Chi phí',
                    data: sortedData.map(data => data.expenses),
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Tỷ suất lợi nhuận (%)',
                    data: profitMargins,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Xu hướng tài chính'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Số tiền (VNĐ)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    notation: 'compact'
                                }).format(value);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tỷ suất lợi nhuận (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('financialTrends', chart);
    }

    /**
     * Update chart period
     */
    updateChartPeriod(period, financialData) {
// console.log(`Updating financial charts for period: ${period}`);
        
        // Filter data based on period
        const filteredData = this.filterDataByPeriod(financialData, period);
        
        // Re-render all charts with filtered data
        this.renderCashFlowChart(filteredData.cashFlow);
        this.renderProfitLossChart(filteredData.monthly);
        this.renderBudgetVsActualChart(filteredData.monthly);
    }

    /**
     * Filter data by time period
     */
    filterDataByPeriod(data, period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarterStart = Math.floor(now.getMonth() / 3) * 3;
                startDate = new Date(now.getFullYear(), quarterStart, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return data; // Return all data if period not recognized
        }
        
        // Filter logic would go here
        // For now, return original data
        return data;
    }

    /**
     * Generate mock budget data
     */
    generateMockBudgetData(actualData) {
        const sortedActual = Array.from(actualData.values()).sort((a, b) => a.month.localeCompare(b.month));
        
        // Generate budget that's slightly higher than actual with some variance
        return sortedActual.map(data => {
            const variance = 0.1 + Math.random() * 0.2; // 10-30% variance
            return Math.round(data.expenses * (1 + variance));
        });
    }

    /**
     * Cleanup all charts
     */
    cleanup() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Get chart instance
     */
    getChart(name) {
        return this.charts.get(name);
    }

    /**
     * Export chart as image
     */
    exportChart(chartName) {
        const chart = this.charts.get(chartName);
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `financial-${chartName}-chart.png`;
            link.href = url;
            link.click();
        }
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}