/**
 * Employee Charts Module
 * Quản lý các biểu đồ và visualization cho báo cáo nhân viên
 */

export class EmployeeCharts {
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
                    }
                }
            }
        };
    }

    /**
     * Render performance chart
     */
    renderPerformanceChart(employees) {
        const canvas = document.getElementById('employeePerformanceChart');
        if (!canvas) {
            console.warn('Performance chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.has('performance')) {
            this.charts.get('performance').destroy();
        }

        // Prepare data
        const topEmployees = employees
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, 10);

        const data = {
            labels: topEmployees.map(emp => emp.name.length > 15 ? emp.name.substr(0, 15) + '...' : emp.name),
            datasets: [{
                label: 'Điểm hiệu suất',
                data: topEmployees.map(emp => emp.performanceScore),
                backgroundColor: topEmployees.map((emp, index) => {
                    if (index === 0) return '#FFD700'; // Gold for #1
                    if (index === 1) return '#C0C0C0'; // Silver for #2
                    if (index === 2) return '#CD7F32'; // Bronze for #3
                    return 'rgba(102, 126, 234, 0.8)';
                }),
                borderColor: topEmployees.map((emp, index) => {
                    if (index === 0) return '#FFD700';
                    if (index === 1) return '#C0C0C0';
                    if (index === 2) return '#CD7F32';
                    return 'rgba(102, 126, 234, 1)';
                }),
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }]
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
                        text: 'Top 10 Nhân viên hiệu suất cao nhất'
                    }
                },
                scales: {
                    ...this.chartConfig.scales,
                    y: {
                        ...this.chartConfig.scales.y,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('performance', chart);
    }

    /**
     * Render revenue trend chart
     */
    renderRevenueTrendChart(employees) {
        const canvas = document.getElementById('employeeRevenueChart');
        if (!canvas) {
            console.warn('Revenue chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.has('revenue')) {
            this.charts.get('revenue').destroy();
        }

        // Get top 5 employees by revenue
        const topEmployees = employees
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Generate last 6 months labels
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toISOString().substr(0, 7));
        }

        const monthLabels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return `${monthNum}/${year}`;
        });

        const datasets = topEmployees.map((employee, index) => {
            const colors = [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ];

            const borderColors = [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ];

            const data = months.map(month => {
                return employee.monthlyRevenue.get(month) || 0;
            });

            return {
                label: employee.name,
                data: data,
                borderColor: borderColors[index],
                backgroundColor: colors[index],
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6
            };
        });

        const data = {
            labels: monthLabels,
            datasets: datasets
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                ...this.chartConfig,
                plugins: {
                    ...this.chartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Xu hướng doanh thu 6 tháng gần nhất'
                    }
                },
                scales: {
                    ...this.chartConfig.scales,
                    y: {
                        ...this.chartConfig.scales.y,
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
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('revenue', chart);
    }

    /**
     * Render department comparison chart
     */
    renderDepartmentChart(departments) {
        const canvas = document.getElementById('departmentComparisonChart');
        if (!canvas) {
            console.warn('Department chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.has('department')) {
            this.charts.get('department').destroy();
        }

        const deptArray = Array.from(departments.values());

        const data = {
            labels: deptArray.map(dept => dept.name),
            datasets: [{
                label: 'Tổng doanh thu',
                data: deptArray.map(dept => dept.totalRevenue),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
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
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Doanh thu theo phòng ban'
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
        this.charts.set('department', chart);
    }

    /**
     * Render commission vs revenue scatter chart
     */
    renderCommissionRevenueChart(employees) {
        const canvas = document.getElementById('commissionRevenueChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('commission')) {
            this.charts.get('commission').destroy();
        }

        const data = {
            datasets: [{
                label: 'Nhân viên',
                data: employees.map(emp => ({
                    x: emp.revenue,
                    y: emp.commission,
                    label: emp.name
                })),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const config = {
            type: 'scatter',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Mối quan hệ Doanh thu - Hoa hồng'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].raw.label;
                            },
                            label: function(context) {
                                const revenue = new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(context.parsed.x);
                                const commission = new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(context.parsed.y);
                                return [`Doanh thu: ${revenue}`, `Hoa hồng: ${commission}`];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Doanh thu (VNĐ)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('vi-VN', {
                                    notation: 'compact'
                                }).format(value);
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Hoa hồng (VNĐ)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('vi-VN', {
                                    notation: 'compact'
                                }).format(value);
                            }
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('commission', chart);
    }

    /**
     * Render performance distribution chart
     */
    renderPerformanceDistribution(employees) {
        const canvas = document.getElementById('performanceDistributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has('distribution')) {
            this.charts.get('distribution').destroy();
        }

        // Group employees by performance level
        const levels = {
            'Xuất sắc (90-100%)': employees.filter(emp => emp.performanceScore >= 90).length,
            'Tốt (80-89%)': employees.filter(emp => emp.performanceScore >= 80 && emp.performanceScore < 90).length,
            'Khá (70-79%)': employees.filter(emp => emp.performanceScore >= 70 && emp.performanceScore < 80).length,
            'Trung bình (60-69%)': employees.filter(emp => emp.performanceScore >= 60 && emp.performanceScore < 70).length,
            'Cần cải thiện (<60%)': employees.filter(emp => emp.performanceScore < 60).length
        };

        const data = {
            labels: Object.keys(levels),
            datasets: [{
                label: 'Số lượng nhân viên',
                data: Object.values(levels),
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',   // Green for excellent
                    'rgba(23, 162, 184, 0.8)',  // Blue for good
                    'rgba(255, 193, 7, 0.8)',   // Yellow for fair
                    'rgba(255, 108, 0, 0.8)',   // Orange for average
                    'rgba(220, 53, 69, 0.8)'    // Red for needs improvement
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(255, 108, 0, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Phân bổ hiệu suất nhân viên'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('distribution', chart);
    }

    /**
     * Update chart period
     */
    updateChartPeriod(period, employees, departments) {
        console.log(`Updating charts for period: ${period}`);
        
        // Filter data based on period
        const filteredEmployees = this.filterEmployeesByPeriod(employees, period);
        
        // Re-render all charts with filtered data
        this.renderPerformanceChart(filteredEmployees);
        this.renderRevenueTrendChart(filteredEmployees);
        this.renderDepartmentChart(departments);
        this.renderCommissionRevenueChart(filteredEmployees);
        this.renderPerformanceDistribution(filteredEmployees);
    }

    /**
     * Filter employees by time period
     */
    filterEmployeesByPeriod(employees, period) {
        // For now, return all employees as filtering would require more complex logic
        // In a real implementation, this would filter based on the period
        return employees;
    }

    /**
     * Cleanup all charts
     */
    cleanup() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Get chart instances for external access
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
            link.download = `employee-${chartName}-chart.png`;
            link.href = url;
            link.click();
        }
    }
}