/**
 * Cash Flow vs Accrual Core Module
 * Handles data processing and analysis for cash flow vs accrual accounting comparison
 */

import { calculateCashFlowView } from '../../cash-flow/cashFlowComponents.js';
import { calculateAccrualView } from '../../cash-flow/accrualComponents.js';
import { compareViews } from '../../cash-flow/comparisonLogic.js';

export class CashFlowAccrualCore {
    constructor() {
        this.transactionData = [];
        this.expenseData = [];
        this.analysisData = null;
        this.dateRange = null;
        this.filters = {
            categories: [],
            viewMode: 'both',
        };
    }

    /**
     * Load and process data
     */
    async loadData() {
        try {
            
            // Get data from global variables
            this.transactionData = window.transactionList || [];
            this.expenseData = window.expenseList || [];
            
                transactions: this.transactionData.length,
            
            // Process the data
            await this.processData();
            
            
        } catch (error) {
            console.error('❌ Error loading cash flow vs accrual data:', error);
            throw error;
        }
    }

    /**
     * Process and analyze data
     */
    async processData() {
        // Set default date range if not specified
        if (!this.dateRange) {
            const now = new Date();
            this.dateRange = {
                start: new Date(now.getFullYear(), 0, 1),
                end: new Date(now.getFullYear(), 11, 31)
            };
        }

        // Calculate cash flow view
        const cashFlowView = calculateCashFlowView(this.expenseData, this.dateRange);
        
        // Calculate accrual view
        const accrualView = calculateAccrualView(this.expenseData, this.dateRange);
        
        // Compare the two views
        const comparison = compareViews(cashFlowView, accrualView);
        
        // Store analysis data
        this.analysisData = {
            cashFlow: cashFlowView,
            accrual: accrualView,
            comparison: comparison,
            insights: this.generateInsights(cashFlowView, accrualView, comparison),
        };
    }

    /**
     * Generate insights from the comparison
     */
    generateInsights(cashFlow, accrual, comparison) {
        const insights = {
            cashFlowInsights: [],
            accrualInsights: [],
        };

        // Cash Flow Insights
        const largestCashFlowMonth = this.getLargestMonth(cashFlow.byMonth);
        if (largestCashFlowMonth) {
            insights.cashFlowInsights.push({
                type: 'info',
                title: 'Tháng chi tiêu cao nhất',
            });
        }

        // Count large payments
        const largePayments = Object.values(cashFlow.byMonth).filter(amount => amount > cashFlow.total * 0.15);
        if (largePayments.length > 0) {
            insights.cashFlowInsights.push({
                type: 'warning',
                title: 'Chi tiêu lớn',
            });
        }

        // Accrual Insights
        const mostAllocatedCategory = this.getLargestCategory(accrual.byCategory);
        if (mostAllocatedCategory) {
            insights.accrualInsights.push({
                type: 'info',
                title: 'Danh mục phân bổ nhiều nhất',
            });
        }

        // Comparison Insights
        const totalDifferencePercent = Math.abs(comparison.percentDifference);
        if (totalDifferencePercent > 20) {
            insights.comparisonInsights.push({
                type: 'warning',
                title: 'Chênh lệch lớn',
            });
        } else if (totalDifferencePercent < 5) {
            insights.comparisonInsights.push({
                type: 'success',
                title: 'Cân bằng tốt',
            });
        }

        // Monthly variance analysis
        const monthlyVariances = Object.values(comparison.monthlyDifferences)
            .map(diff => Math.abs(diff.difference))
            .filter(variance => variance > 0);
        
        if (monthlyVariances.length > 0) {
            const avgVariance = monthlyVariances.reduce((sum, v) => sum + v, 0) / monthlyVariances.length;
            insights.comparisonInsights.push({
                type: 'info',
                title: 'Biến động hàng tháng',
            });
        }

        return insights;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(comparison) {
        const recommendations = [];

        // Cash flow timing recommendations
        if (comparison.totalDifference > 0) {
            recommendations.push({
                type: 'optimization',
                title: 'Tối ưu timing thanh toán',
                message: 'Cash flow cao hơn phân bổ - có thể điều chỉnh timing thanh toán để cân bằng dòng tiền',
            });
        } else if (comparison.totalDifference < 0) {
            recommendations.push({
                type: 'planning',
                title: 'Lập kế hoạch thanh toán',
                message: 'Chi phí phân bổ cao hơn cash flow - cần chuẩn bị thanh toán các khoản phân bổ',
            });
        }

        // Seasonal pattern recommendations
        const monthlyDiffs = Object.values(comparison.monthlyDifferences);
        const hasSeasonalPattern = this.detectSeasonalPattern(monthlyDiffs);
        if (hasSeasonalPattern) {
            recommendations.push({
                type: 'forecasting',
                title: 'Dự báo theo mùa',
                message: 'Phát hiện mẫu hình theo mùa - có thể dự báo và lập kế hoạch tài chính tốt hơn',
            });
        }

        // Large variance recommendations
        const largeVariances = monthlyDiffs.filter(diff => Math.abs(diff.difference) > comparison.totalDifference * 0.2);
        if (largeVariances.length > 2) {
            recommendations.push({
                type: 'control',
                title: 'Kiểm soát biến động',
                message: 'Có nhiều tháng với chênh lệch lớn - cần xem xét chính sách phân bổ chi phí',
            });
        }

        return recommendations;
    }

    /**
     * Get comparison overview data
     */
    getComparisonOverview() {
        if (!this.analysisData) return null;

        const { cashFlow, accrual, comparison } = this.analysisData;
        
        return {
            cashFlowTotal: cashFlow.total,
            accrualTotal: accrual.total,
            difference: comparison.totalDifference,
            percentDifference: comparison.percentDifference,
        };
    }

    /**
     * Get monthly comparison data for charts
     */
    getMonthlyComparisonData() {
        if (!this.analysisData) return null;

        const { comparison } = this.analysisData;
        const months = Object.keys(comparison.monthlyDifferences).sort();
        
        return {
            labels: months.map(month => this.formatMonthLabel(month)),
            cashFlowData: months.map(month => comparison.monthlyDifferences[month].cashFlow),
            accrualData: months.map(month => comparison.monthlyDifferences[month].accrual),
        };
    }

    /**
     * Get category comparison data for charts
     */
    getCategoryComparisonData() {
        if (!this.analysisData) return null;

        const { cashFlow, accrual } = this.analysisData;
        
        // Get all categories
        const allCategories = new Set([
            ...Object.keys(cashFlow.byCategory),
            ...Object.keys(accrual.byCategory)
        ]);

        const categories = Array.from(allCategories);
        
        return {
            labels: categories,
            cashFlowData: categories.map(cat => cashFlow.byCategory[cat] || 0),
            accrualData: categories.map(cat => accrual.byCategory[cat] || 0),
            differenceData: categories.map(cat => 
                (cashFlow.byCategory[cat] || 0) - (accrual.byCategory[cat] || 0)
            )
        };
    }

    /**
     * Get cumulative flow data for charts
     */
    getCumulativeFlowData() {
        if (!this.analysisData) return null;

        const monthlyData = this.getMonthlyComparisonData();
        if (!monthlyData) return null;

        let cashFlowCumulative = 0;
        let accrualCumulative = 0;

        return {
            labels: monthlyData.labels,
            cashFlowCumulative: monthlyData.cashFlowData.map(value => {
                cashFlowCumulative += value;
                return cashFlowCumulative;
            }),
            accrualCumulative: monthlyData.accrualData.map(value => {
                accrualCumulative += value;
                return accrualCumulative;
            })
        };
    }

    /**
     * Get detailed monthly analysis table data
     */
    getMonthlyAnalysisTableData() {
        if (!this.analysisData) return [];

        const { comparison } = this.analysisData;
        
        return Object.keys(comparison.monthlyDifferences)
            .sort()
            .map(month => {
                const data = comparison.monthlyDifferences[month];
                const percentDiff = data.cashFlow > 0 ? 
                    (data.difference / data.cashFlow * 100) : 0;
                
                return {
                    month: this.formatMonthLabel(month),
                    cashFlow: data.cashFlow,
                    accrual: data.accrual,
                    difference: data.difference,
                    percentDifference: percentDiff,
                };
            });
    }

    /**
     * Get detailed category analysis table data
     */
    getCategoryAnalysisTableData() {
        if (!this.analysisData) return [];

        const { cashFlow, accrual } = this.analysisData;
        const allCategories = new Set([
            ...Object.keys(cashFlow.byCategory),
            ...Object.keys(accrual.byCategory)
        ]);

        return Array.from(allCategories).map(category => {
            const cfAmount = cashFlow.byCategory[category] || 0;
            const acAmount = accrual.byCategory[category] || 0;
            const difference = cfAmount - acAmount;
            const percentDiff = cfAmount > 0 ? (difference / cfAmount * 100) : 0;

            return {
                category: category,
                cashFlow: cfAmount,
                accrual: acAmount,
                difference: difference,
                percentDifference: percentDiff,
                note: this.getCategoryNote(category, difference)
            };
        }).filter(item => item.cashFlow > 0 || item.accrual > 0);
    }

    /**
     * Get large expenses for allocation details
     */
    getLargeExpenses() {
        if (!this.analysisData) return [];

        return this.expenseData
            .filter(expense => {
                const amount = parseFloat(expense.soTien) || parseFloat(expense.amount) || 0;
                return amount > 10000000; // > 10M VND
            })
            .map(expense => ({
                date: expense.ngay || expense.date,
                description: expense.moTa || expense.description,
                amount: parseFloat(expense.soTien) || parseFloat(expense.amount) || 0,
                category: expense.danhMuc || expense.category,
            }));
    }

    /**
     * Get recurring allocations
     */
    getRecurringAllocations() {
        // Detect recurring patterns in expenses
        const categoryMonthlyAmounts = {};
        
        this.expenseData.forEach(expense => {
            const date = new Date(expense.ngay || expense.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const category = expense.danhMuc || expense.category;
            const amount = parseFloat(expense.soTien) || parseFloat(expense.amount) || 0;
            
            if (!categoryMonthlyAmounts[category]) {
                categoryMonthlyAmounts[category] = {};
            }
            
            categoryMonthlyAmounts[category][monthKey] = 
                (categoryMonthlyAmounts[category][monthKey] || 0) + amount;
        });

        // Find recurring patterns
        const recurring = [];
        Object.keys(categoryMonthlyAmounts).forEach(category => {
            const monthlyAmounts = Object.values(categoryMonthlyAmounts[category]);
            if (monthlyAmounts.length >= 3) {
                const avgAmount = monthlyAmounts.reduce((sum, amt) => sum + amt, 0) / monthlyAmounts.length;
                const variance = this.calculateVariance(monthlyAmounts, avgAmount);
                
                // Low variance indicates recurring pattern
                if (variance / avgAmount < 0.3) {
                    recurring.push({
                        category: category,
                        avgMonthlyAmount: avgAmount,
                        frequency: monthlyAmounts.length,
                        variance: variance,
                    });
                }
            }
        });

        return recurring;
    }

    /**
     * Get export data
     */
    getExportData() {
        const monthlyData = this.getMonthlyAnalysisTableData();
        const categoryData = this.getCategoryAnalysisTableData();
        
        return {
            monthly: monthlyData,
            category: categoryData,
            overview: this.getComparisonOverview(),
            insights: this.analysisData?.insights || {},
        };
    }

    /**
     * Apply filters to data
     */
    applyFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.processData();
    }

    /**
     * Helper methods
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
        }).format(amount);
    }

    formatMonthLabel(monthString) {
        const [year, month] = monthString.split('-');
        return `${month}/${year}`;
    }

    getDifferenceStatus(percentDiff) {
        const abs = Math.abs(percentDiff);
        if (abs < 5) return 'excellent';
        if (abs < 15) return 'good';
        if (abs < 30) return 'warning';
        return 'critical';
    }

    getLargestMonth(monthlyData) {
        let largest = null;
        let maxAmount = 0;
        
        Object.keys(monthlyData).forEach(month => {
            if (monthlyData[month] > maxAmount) {
                maxAmount = monthlyData[month];
                largest = { month, amount: maxAmount };
            }
        });
        
        return largest;
    }

    getLargestCategory(categoryData) {
        let largest = null;
        let maxAmount = 0;
        
        Object.keys(categoryData).forEach(category => {
            if (categoryData[category] > maxAmount) {
                maxAmount = categoryData[category];
                largest = { category, amount: maxAmount };
            }
        });
        
        return largest;
    }

    detectSeasonalPattern(monthlyDiffs) {
        if (monthlyDiffs.length < 12) return false;
        
        // Simple seasonal detection - check if patterns repeat
        const quarters = [];
        for (let i = 0; i < monthlyDiffs.length; i += 3) {
            quarters.push(monthlyDiffs.slice(i, i + 3));
        }
        
        // Check variance between quarters
        return quarters.length > 1;
    }

    getAllocationMethod(expense) {
        const amount = parseFloat(expense.soTien) || parseFloat(expense.amount) || 0;
        const description = (expense.moTa || expense.description || '').toLowerCase();
        
        if (amount > 50000000) return 'annual'; // > 50M - allocate annually
        if (description.includes('thuê') || description.includes('rent')) return 'monthly';
        if (description.includes('bảo hiểm') || description.includes('insurance')) return 'annual';
        
        return 'immediate';
    }

    getCategoryNote(category, difference) {
        const absDiff = Math.abs(difference);
        if (absDiff < 1000000) return 'Cân bằng tốt';
        if (difference > 0) return 'Cash flow cao hơn';
        return 'Cần thanh toán thêm';
    }

    calculateVariance(amounts, average) {
        const sumSquares = amounts.reduce((sum, amount) => {
            return sum + Math.pow(amount - average, 2);
        }, 0);
        return Math.sqrt(sumSquares / amounts.length);
    }
}

// Export for use in other modules
export default CashFlowAccrualCore;