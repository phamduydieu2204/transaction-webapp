/**
 * Cash Flow vs Accrual Charts Module
 * Handles all chart visualizations for cash flow vs accrual comparison
 */

export class CashFlowAccrualCharts {
    constructor() {
        this.charts = {};
        this.chartColors = {
            cashFlow: '#2E86AB',      // Blue for cash flow
            accrual: '#A23B72',       // Purple for accrual
            difference: '#F18F01',    // Orange for difference
            positive: '#06A77D',      // Green for positive
            negative: '#D73027',      // Red for negative
            neutral: '#6C757D'        // Gray for neutral
        };
    }

    /**
     * Render monthly comparison chart
     */
    renderMonthlyComparisonChart(data) {
        const ctx = document.getElementById('monthlyComparisonChart');
        if (!ctx || !data) return;

        // Destroy existing chart
        if (this.charts.monthlyComparison) {
            this.charts.monthlyComparison.destroy();
        }

        this.charts.monthlyComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Cash Flow (Thực tế)',
                        data: data.cashFlowData,
                        backgroundColor: this.chartColors.cashFlow + '80',
                        borderColor: this.chartColors.cashFlow,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Chi phí phân bổ',
                        data: data.accrualData,
                        backgroundColor: this.chartColors.accrual + '80',
                        borderColor: this.chartColors.accrual,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Chênh lệch',
                        data: data.differenceData,
                        type: 'line',
                        backgroundColor: this.chartColors.difference + '40',
                        borderColor: this.chartColors.difference,
                        borderWidth: 3,
                        fill: false,
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'So sánh Cash Flow vs Chi phí phân bổ theo tháng',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const value = this.formatCurrency(context.parsed.y);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
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
                            text: 'Số tiền (VND)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Chênh lệch (VND)'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }

    /**
     * Render category comparison chart
     */
    renderCategoryComparisonChart(data) {
        const ctx = document.getElementById('categoryComparisonChart');
        if (!ctx || !data) return;

        if (this.charts.categoryComparison) {
            this.charts.categoryComparison.destroy();
        }

        this.charts.categoryComparison = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Cash Flow',
                        data: data.cashFlowData,
                        backgroundColor: this.chartColors.cashFlow + '80',
                        borderColor: this.chartColors.cashFlow,
                        borderWidth: 1
                    },
                    {
                        label: 'Chi phí phân bổ',
                        data: data.accrualData,
                        backgroundColor: this.chartColors.accrual + '80',
                        borderColor: this.chartColors.accrual,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'So sánh theo danh mục',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = this.formatCurrency(context.parsed.x);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Số tiền (VND)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Danh mục'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render cumulative flow chart
     */
    renderCumulativeFlowChart(data) {
        const ctx = document.getElementById('cumulativeFlowChart');
        if (!ctx || !data) return;

        if (this.charts.cumulativeFlow) {
            this.charts.cumulativeFlow.destroy();
        }

        this.charts.cumulativeFlow = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Cash Flow tích lũy',
                        data: data.cashFlowCumulative,
                        borderColor: this.chartColors.cashFlow,
                        backgroundColor: this.chartColors.cashFlow + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Chi phí phân bổ tích lũy',
                        data: data.accrualCumulative,
                        borderColor: this.chartColors.accrual,
                        backgroundColor: this.chartColors.accrual + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Dòng tiền tích lũy theo thời gian',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const value = this.formatCurrency(context.parsed.y);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    },
                    filler: {
                        propagate: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Số tiền tích lũy (VND)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }

    /**
     * Render difference analysis chart
     */
    renderDifferenceAnalysisChart(data) {
        const ctx = document.getElementById('differenceAnalysisChart');
        if (!ctx || !data) return;

        if (this.charts.differenceAnalysis) {
            this.charts.differenceAnalysis.destroy();
        }

        // Create color array based on positive/negative values
        const backgroundColors = data.differenceData.map(value => 
            value >= 0 ? this.chartColors.positive + '80' : this.chartColors.negative + '80'
        );
        const borderColors = data.differenceData.map(value => 
            value >= 0 ? this.chartColors.positive : this.chartColors.negative
        );

        this.charts.differenceAnalysis = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Chênh lệch (Cash Flow - Accrual)',
                        data: data.differenceData,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Phân tích chênh lệch Cash Flow vs Accrual',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = this.formatCurrency(context.parsed.y);
                                const interpretation = context.parsed.y >= 0 ? 
                                    'Cash Flow cao hơn' : 'Accrual cao hơn';
                                return [`Chênh lệch: ${value}`, interpretation];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Chênh lệch (VND)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                }
            }
        });
    }

    /**
     * Render variance analysis chart
     */
    renderVarianceAnalysisChart(data) {
        const ctx = document.getElementById('varianceAnalysisChart');
        if (!ctx || !data) return;

        if (this.charts.varianceAnalysis) {
            this.charts.varianceAnalysis.destroy();
        }

        // Calculate variance percentages
        const variancePercentages = data.differenceData.map((diff, index) => {
            const cashFlowValue = data.cashFlowData[index];
            return cashFlowValue > 0 ? (diff / cashFlowValue * 100) : 0;
        });

        this.charts.varianceAnalysis = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Phân tích độ lệch (%)',
                        data: data.labels.map((label, index) => ({
                            x: data.cashFlowData[index],
                            y: variancePercentages[index]
                        })),
                        backgroundColor: this.chartColors.difference + '60',
                        borderColor: this.chartColors.difference,
                        borderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Mối quan hệ giữa Cash Flow và độ lệch (%)',
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const pointIndex = context.dataIndex;
                                const month = data.labels[pointIndex];
                                const cashFlow = this.formatCurrency(context.parsed.x);
                                const variance = context.parsed.y.toFixed(1);
                                return [
                                    `Tháng: ${month}`,
                                    `Cash Flow: ${cashFlow}`,
                                    `Độ lệch: ${variance}%`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Cash Flow (VND)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Độ lệch (%)'
                        },
                        ticks: {
                            callback: (value) => value.toFixed(1) + '%'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render allocation timeline chart
     */
    renderAllocationTimelineChart(largeExpenses) {
        const ctx = document.getElementById('allocationTimelineChart');
        if (!ctx || !largeExpenses || largeExpenses.length === 0) return;

        if (this.charts.allocationTimeline) {
            this.charts.allocationTimeline.destroy();
        }

        // Group expenses by allocation method
        const allocationGroups = {
            immediate: [],
            monthly: [],
            annual: []
        };

        largeExpenses.forEach(expense => {
            const group = expense.allocationMethod || 'immediate';
            if (allocationGroups[group]) {
                allocationGroups[group].push(expense);
            }
        });

        const datasets = Object.keys(allocationGroups).map((method, index) => {
            const colors = [this.chartColors.cashFlow, this.chartColors.accrual, this.chartColors.difference];
            return {
                label: this.getAllocationMethodLabel(method),
                data: allocationGroups[method].map(expense => ({
                    x: new Date(expense.date),
                    y: expense.amount,
                    description: expense.description
                })),
                backgroundColor: colors[index] + '60',
                borderColor: colors[index],
                borderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10
            };
        });

        this.charts.allocationTimeline = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Timeline phân bổ chi phí lớn',
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const expense = context.raw;
                                return [
                                    `Ngày: ${new Date(expense.x).toLocaleDateString('vi-VN')}`,
                                    `Số tiền: ${this.formatCurrency(expense.y)}`,
                                    `Mô tả: ${expense.description}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MM/yyyy'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Thời gian'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Số tiền (VND)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyShort(value)
                        }
                    }
                }
            }
        });
    }

    /**
     * Update all charts with new data
     */
    updateCharts(coreData) {
        const monthlyData = coreData.getMonthlyComparisonData();
        const categoryData = coreData.getCategoryComparisonData();
        const cumulativeData = coreData.getCumulativeFlowData();
        const largeExpenses = coreData.getLargeExpenses();

        this.renderMonthlyComparisonChart(monthlyData);
        this.renderCategoryComparisonChart(categoryData);
        this.renderCumulativeFlowChart(cumulativeData);
        this.renderDifferenceAnalysisChart(monthlyData);
        this.renderAllocationTimelineChart(largeExpenses);
    }

    /**
     * Destroy all charts
     */
    destroy() {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey]) {
                this.charts[chartKey].destroy();
                delete this.charts[chartKey];
            }
        });
        console.log('All cash flow vs accrual charts destroyed');
    }

    /**
     * Helper methods
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatCurrencyShort(amount) {
        if (Math.abs(amount) >= 1000000000) {
            return (amount / 1000000000).toFixed(1) + 'B';
        } else if (Math.abs(amount) >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (Math.abs(amount) >= 1000) {
            return (amount / 1000).toFixed(1) + 'K';
        }
        return amount.toLocaleString('vi-VN');
    }

    getAllocationMethodLabel(method) {
        const labels = {
            immediate: 'Ngay lập tức',
            monthly: 'Phân bổ hàng tháng',
            annual: 'Phân bổ hàng năm'
        };
        return labels[method] || method;
    }

    /**
     * Toggle chart visibility
     */
    toggleChart(chartId) {
        const chartContainer = document.querySelector(`#${chartId}`).parentElement;
        if (chartContainer) {
            chartContainer.style.display = 
                chartContainer.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Export chart as image
     */
    exportChart(chartKey, filename) {
        if (this.charts[chartKey]) {
            const url = this.charts[chartKey].toBase64Image();
            const link = document.createElement('a');
            link.download = filename || `${chartKey}-chart.png`;
            link.href = url;
            link.click();
        }
    }
}

// Export for use in other modules
export default CashFlowAccrualCharts;