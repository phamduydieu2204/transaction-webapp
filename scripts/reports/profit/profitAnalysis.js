/**
 * Profit Analysis Report Module
 * Handles loading and rendering profit analysis report
 */

import { formatRevenue, formatCurrency } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { normalizeDate } from '../../statisticsCore.js';
import { normalizeTransaction } from '../../core/dataMapping.js';
import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';

/**
 * Load and render profit analysis report
 * @param {Object} options - Report options
 * @param {Object} options.dateRange - Date range filter
 * @param {string} options.period - Period filter
 */
export async function loadProfitAnalysis(options = {}) {
    // console.log('💰 Loading profit analysis report', options);
    
    try {
        // Get container
        const container = document.getElementById('report-profit');
        if (!container) {
            throw new Error('Profit report container not found');
        }
        
        // Load template
        await loadProfitAnalysisHTML();
        
        // Ensure data is loaded
        await ensureDataIsLoaded();
        
        // Get data
        const transactions = window.transactionList || getFromStorage('transactions') || [];
        const expenses = window.expenseList || getFromStorage('expenses') || [];
        
// console.log('📊 Profit analysis data:', {

  //             transactions: transactions.length,
  //             expenses: expenses.length
  //         });
  //         
  //         // Get date range from options or global filters
  //         const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
  //         const period = options.period || window.globalFilters?.period || 'this_month';
  //         
  //         // Filter transactions by date range, but keep ALL expenses for allocation calculation
  //         const filteredTransactions = filterDataByDateRange(transactions, dateRange);
  //         // For expenses: keep all data, let calculateExpenseMetrics handle the filtering logic
  //         const allExpenses = expenses;
  //         
// console.log('📊 Profit analysis data filtering:', {

  //             originalTransactions: transactions.length,
  //             filteredTransactions: filteredTransactions.length,
  //             allExpensesKept: allExpenses.length,
  //             dateRange: dateRange
  //         });
  //         
  //         // Load all components
  //         await Promise.all([
  //             updateProfitOverviewGrid(filteredTransactions, allExpenses, period, dateRange),
  //             updateProfitKPIs(filteredTransactions, allExpenses, period, dateRange),
  //             loadProfitAnalysisData(filteredTransactions, allExpenses, dateRange),
  //             loadSoftwareProfitAnalysis(filteredTransactions, allExpenses, dateRange),
  //             renderProfitTrendChart(filteredTransactions, allExpenses, period),
  //             renderProfitBreakdownChart(filteredTransactions, allExpenses, dateRange),
  //             updateProfitInsights(filteredTransactions, allExpenses)
  //         ]);
  //         
  //         // Setup tooltips and event handlers
  //         setupProfitTooltips();
  //         setupProfitAnalysisHandlers();
  //         
  //         // console.log('✅ Profit analysis report loaded successfully');
  //         
  //     } catch (error) {
  //         console.error('❌ Error loading profit analysis report:', error);
  //         showError('Không thể tải phân tích lợi nhuận');
  //     }
  // }
  // 
/**
  //  * Load the profit analysis HTML template
  //  */
  // async function loadProfitAnalysisHTML() {
  //     const container = document.getElementById('report-profit');
  //     if (!container) return;
  //     
  //     try {
  //         const response = await fetch('./partials/tabs/report-pages/profit-analysis.html');
  //         if (!response.ok) {
  //             throw new Error('Template not found');
  //         }
  //         
  //         const html = await response.text();
  //         container.innerHTML = html;
  //         container.classList.add('active');
  //         
  //         // console.log('✅ Profit analysis template loaded');
  //         
  //     } catch (error) {
  //         console.error('❌ Could not load profit analysis template:', error);
  //         throw error;
  //     }
  // }
  // 
/**
  //  * Update profit KPI cards
  //  */
  // async function updateProfitKPIs(transactions, expenses, period, dateRange) {
  //     // console.log('💰 Updating profit KPIs');
  //     
  //     // Calculate current period metrics
  //     const revenueMetrics = calculateRevenueMetrics(transactions);
  //     const expenseMetrics = calculateExpenseMetrics(expenses, dateRange);
  //     const profitMetrics = calculateProfitMetrics(revenueMetrics, expenseMetrics);
  //     
  //     // Calculate previous period for comparison
  //     const previousTransactions = getPreviousPeriodTransactions(transactions, period);
  //     const previousExpenses = getPreviousPeriodExpenses(expenses, period);
  //     const previousRevenueMetrics = calculateRevenueMetrics(previousTransactions);
  //     const previousExpenseMetrics = calculateExpenseMetrics(previousExpenses, dateRange);
  //     const previousProfitMetrics = calculateProfitMetrics(previousRevenueMetrics, previousExpenseMetrics);
  //     
  //     // Update KPI values
  //     updateKPIElement('gross-profit-value', formatRevenue(profitMetrics.grossProfit));
  //     updateKPIElement('net-profit-value', formatRevenue(profitMetrics.netProfit));
  //     updateKPIElement('profit-margin-kpi', `${profitMetrics.profitMargin.toFixed(1)}%`);
  //     
  //     // Calculate and update changes
  //     const grossProfitChange = calculatePercentageChange(
  //         previousProfitMetrics.grossProfit, 
  //         profitMetrics.grossProfit
  //     );
  //     const netProfitChange = calculatePercentageChange(
  //         previousProfitMetrics.netProfit, 
  //         profitMetrics.netProfit
  //     );
  //     
  //     updateChangeElement('gross-profit-change', grossProfitChange);
  //     updateChangeElement('net-profit-change', netProfitChange);
  //     
  //     // Update business efficiency
  //     const efficiency = calculateBusinessEfficiency(profitMetrics);
  //     updateKPIElement('business-efficiency', efficiency.label);
  //     updateKPIElement('efficiency-detail', efficiency.description);
  //     
  //     // console.log('💰 Profit KPIs updated:', profitMetrics);
  // }
  // 
/**
  //  * Load profit analysis data into the table
  //  */
  // async function loadProfitAnalysisData(transactions, expenses, dateRange) {
  //     // console.log('💰 Loading profit analysis data for table');
  //     
  //     try {
  //         // Calculate metrics
  //         const revenueMetrics = calculateRevenueMetrics(transactions);
  //         const expenseMetrics = calculateExpenseMetrics(expenses, dateRange);
  //         const profitMetrics = calculateProfitMetrics(revenueMetrics, expenseMetrics);
  //         
  //         // Update table
  //         updateProfitTableValues(profitMetrics);
  //         updateProfitSummaryCards(profitMetrics);
  //         
  //         // console.log('💰 Profit analysis data loaded:', profitMetrics);
  //         
  //     } catch (error) {
  //         console.error('❌ Error loading profit analysis data:', error);
  //     }
  // }
  // 
/**
  //  * Calculate revenue metrics from transactions
  //  */
  // function calculateRevenueMetrics(transactions) {
  //     let grossRevenue = 0;
  //     let refundAmount = 0;
  //     let validTransactionCount = 0;
  //     
  //     transactions.forEach(rawTransaction => {
  //         const t = normalizeTransaction(rawTransaction);
  //         if (!t) return;
  //         
  //         const status = (t.transactionType || t.loaiGiaoDich || '').toLowerCase().trim();
  //         const amount = t.revenue || 0;
  //         
  //         if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
  //             grossRevenue += amount;
  //             validTransactionCount++;
  //         } else if (status === 'hoàn tiền') {
  //             refundAmount += Math.abs(amount);
  //         }
  //     });
  //     
  //     const totalRevenue = grossRevenue - refundAmount;
  //     
  //     return {
  //         totalRevenue,
  //         grossRevenue,
  //         refundAmount,
  //         transactionCount: validTransactionCount
  //     };
}

/**
 * Calculate expense metrics from filtered expenses with proper allocation logic
 */
function calculateExpenseMetrics(expenses, dateRange) {
    let allocatedCosts = 0;
    let directCosts = 0;
    
    expenses.forEach(rawExpense => {
        const expense = normalizeExpense(rawExpense);
        if (!expense) return;
        
        const amount = expense.amount || 0;
        const allocation = (expense.periodicAllocation || expense.phanBo || expense.allocation || '').toLowerCase().trim();
        const accountingType = (expense.accountingType || expense.loaiKeToan || '').trim();
        const expenseDate = new Date(expense.date || '');
        const renewalDate = new Date(expense.renewDate || expense.ngayTaiTuc || '');
        
        // Convert dateRange strings to Date objects
        const rangeStart = dateRange ? new Date(dateRange.start) : null;
        const rangeEnd = dateRange ? new Date(dateRange.end) : null;
        
        // Chi phí không phân bổ: Phân bổ = "Không" và Loại kế toán = "COGS" hoặc "OPEX" và Ngày chi trong chu kỳ
        if (allocation === 'không' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
            // Chỉ tính chi phí không phân bổ nếu ngày chi nằm trong chu kỳ
            if (rangeStart && rangeEnd && expenseDate >= rangeStart && expenseDate <= rangeEnd) {
                directCosts += amount;
            }
        } 
        // Chi phí phân bổ: Loại kế toán = "OPEX" hoặc "COGS", Phân bổ = "Có", Ngày tái tục >= Ngày bắt đầu chu kỳ
        // KHÔNG cần quan tâm ngày chi có nằm trong chu kỳ hay không
        else if (allocation === 'có' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
            if (rangeStart && rangeEnd && renewalDate >= rangeStart && !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime())) {
                
                // Tính số ngày từ ngày chi đến ngày tái tục
                const totalDays = Math.ceil((renewalDate - expenseDate) / (1000 * 60 * 60 * 24));
                
                // Tính số ngày trong chu kỳ báo cáo (từ đầu đến cuối tháng)
                const periodDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
                
                let allocatedAmount = 0;
                
                // Nếu ngày tái tục < ngày cuối chu kỳ
                if (renewalDate < rangeEnd) {
                    // Ngày hiện tại
                    const today = new Date();
                    
                    // Số ngày từ đầu chu kỳ đến ngày tái tục
                    const daysToRenewal = Math.ceil((renewalDate - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
                    
                    // Số ngày từ đầu chu kỳ đến ngày hiện tại
                    const daysToToday = Math.ceil((today - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
                    
                    // Lấy Min(ngày hiện tại - đầu chu kỳ, ngày tái tục - đầu chu kỳ)
                    const effectiveDays = Math.min(daysToToday, daysToRenewal);
                    
                    // Công thức: số tiền * Min(ngày hiện tại - đầu chu kỳ, ngày tái tục - đầu chu kỳ) / (ngày tái tục - ngày chi)
                    allocatedAmount = amount * effectiveDays / totalDays;
                    
// console.log(`📊 Renewal < End Date calculation:`, {

  //                         renewalDate: !isNaN(renewalDate.getTime()) ? renewalDate.toISOString().split('T')[0] : 'Invalid Date',
  //                         rangeEnd: rangeEnd && !isNaN(rangeEnd.getTime()) ? rangeEnd.toISOString().split('T')[0] : 'Invalid Date',
  //                         daysToRenewal: daysToRenewal,
  //                         daysToToday: daysToToday,
  //                         effectiveDays: effectiveDays,
  //                         formula: `${amount} * ${effectiveDays} / ${totalDays} = ${allocatedAmount.toFixed(2)}`
  //                     });
  //                 } 
  //                 // Nếu ngày tái tục >= ngày cuối chu kỳ
  //                 else {
  //                     // Công thức: số tiền * periodDays / totalDays
  //                     allocatedAmount = amount * periodDays / totalDays;
  //                     
// console.log(`📊 Renewal >= End Date calculation:`, {

  //                         renewalDate: !isNaN(renewalDate.getTime()) ? renewalDate.toISOString().split('T')[0] : 'Invalid Date',
  //                         rangeEnd: rangeEnd && !isNaN(rangeEnd.getTime()) ? rangeEnd.toISOString().split('T')[0] : 'Invalid Date',
  //                         periodDays: periodDays,
  //                         formula: `${amount} * ${periodDays} / ${totalDays} = ${allocatedAmount.toFixed(2)}`
  //                     });
  //                 }
  //                 
  //                 allocatedCosts += allocatedAmount;
  //                 
// console.log(`📊 Final allocated cost summary:`, {

  //                     expenseId: expense.expenseId || 'N/A',
  //                     product: expense.product || 'N/A',
  //                     amount: amount,
  //                     expenseDate: !isNaN(expenseDate.getTime()) ? expenseDate.toISOString().split('T')[0] : 'Invalid Date',
  //                     renewalDate: !isNaN(renewalDate.getTime()) ? renewalDate.toISOString().split('T')[0] : 'Invalid Date',
  //                     rangeStart: rangeStart && !isNaN(rangeStart.getTime()) ? rangeStart.toISOString().split('T')[0] : 'Invalid Date',
  //                     rangeEnd: rangeEnd && !isNaN(rangeEnd.getTime()) ? rangeEnd.toISOString().split('T')[0] : 'Invalid Date',
  //                     totalDays: totalDays,
  //                     periodDays: periodDays,
  //                     isRenewalBeforeEnd: renewalDate < rangeEnd,
  //                     allocatedAmount: allocatedAmount.toFixed(2)
  //                 });
  //             }
  //         }
  //     });
  //     
// console.log(`💰 Expense metrics calculated:`, {

  //         allocatedCosts: allocatedCosts.toFixed(2),
  //         directCosts: directCosts.toFixed(2),
  //         totalExpensesProcessed: expenses.length,
  //         dateRange: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'No date range'
  //     });
  //     
  //     return {
  //         allocatedCosts,
  //         directCosts,
  //         totalCosts: allocatedCosts + directCosts
  //     };
}

/**
 * Calculate profit metrics
 */
function calculateProfitMetrics(revenueMetrics, expenseMetrics) {
    const revenue = revenueMetrics.totalRevenue;
    const refunds = revenueMetrics.refundAmount;
    const allocatedCosts = expenseMetrics.allocatedCosts;
    const directCosts = expenseMetrics.directCosts;
    
    const grossProfit = revenue - allocatedCosts;
    const netProfit = grossProfit - directCosts;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    
    return {
        revenue,
        refunds: -Math.abs(refunds),
        allocatedCosts,
        directCosts,
        grossProfit,
        netProfit,
        profitMargin,
        
        refundsPercent: revenue > 0 ? (refunds / revenue) * 100 : 0,
        allocatedCostsPercent: revenue > 0 ? (allocatedCosts / revenue) * 100 : 0,
        directCostsPercent: revenue > 0 ? (directCosts / revenue) * 100 : 0,
        grossProfitPercent: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        netProfitPercent: revenue > 0 ? (netProfit / revenue) * 100 : 0
    };
}

/**
 * Update profit analysis table values
 */
function updateProfitTableValues(metrics) {
    updateElementText('profit-revenue', formatRevenue(metrics.revenue));
    updateElementText('profit-revenue-percent', '100.0%');
    
    updateElementText('profit-refunds', formatRevenue(metrics.refunds));
    updateElementText('profit-refunds-percent', `${metrics.refundsPercent.toFixed(1)}%`);
    
    updateElementText('profit-allocated-cost', formatRevenue(metrics.allocatedCosts));
    updateElementText('profit-allocated-cost-percent', `${metrics.allocatedCostsPercent.toFixed(1)}%`);
    
    updateElementText('profit-direct-cost', formatRevenue(metrics.directCosts));
    updateElementText('profit-direct-cost-percent', `${metrics.directCostsPercent.toFixed(1)}%`);
    
    updateElementText('profit-gross', formatRevenue(metrics.grossProfit));
    updateElementText('profit-gross-percent', `${metrics.grossProfitPercent.toFixed(1)}%`);
    
    updateElementText('profit-net', formatRevenue(metrics.netProfit));
    updateElementText('profit-net-percent', `${metrics.netProfitPercent.toFixed(1)}%`);
    
    updateElementText('profit-margin-value', `${metrics.profitMargin.toFixed(1)}%`);
    updateElementText('profit-margin-percent', '-');
}

/**
 * Update profit summary cards
 */
function updateProfitSummaryCards(metrics) {
    const refundRate = Math.abs(metrics.refundsPercent);
    let revenueEfficiency = 'Xuất sắc';
    if (refundRate > 10) revenueEfficiency = 'Cần cải thiện';
    else if (refundRate > 5) revenueEfficiency = 'Khá tốt';
    else if (refundRate > 2) revenueEfficiency = 'Tốt';
    
    updateElementText('revenue-efficiency', revenueEfficiency);
    
    const totalCostPercent = metrics.allocatedCostsPercent + metrics.directCostsPercent;
    let costControl = 'Xuất sắc';
    if (totalCostPercent > 80) costControl = 'Cần kiểm soát';
    else if (totalCostPercent > 60) costControl = 'Khá tốt';
    else if (totalCostPercent > 40) costControl = 'Tốt';
    
    updateElementText('cost-control', costControl);
    
    let profitabilityLevel = 'Thấp';
    if (metrics.profitMargin > 30) profitabilityLevel = 'Rất cao';
    else if (metrics.profitMargin > 20) profitabilityLevel = 'Cao';
    else if (metrics.profitMargin > 10) profitabilityLevel = 'Trung bình';
    else if (metrics.profitMargin > 0) profitabilityLevel = 'Thấp';
    else profitabilityLevel = 'Thua lỗ';
    
    updateElementText('profitability-level', profitabilityLevel);
}

/**
 * Render profit trend chart
 */
async function renderProfitTrendChart(transactions, expenses, period) {
    // console.log('📈 Rendering profit trend chart');
    
    const canvas = document.getElementById('profit-trend-chart');
    if (!canvas) return;
    
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        await loadChartJS();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Prepare trend data
    const trendData = prepareProfitTrendData(transactions, expenses, period);
    
    // Destroy existing chart
    if (window.profitTrendChart) {
        window.profitTrendChart.destroy();
    }
    
    // Create new chart
    window.profitTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [
                {
                    label: 'Lợi nhuận gộp',
                    data: trendData.grossProfit,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Lợi nhuận ròng',
                    data: trendData.netProfit,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatRevenue(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatRevenue(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render profit breakdown chart
 */
async function renderProfitBreakdownChart(transactions, expenses, dateRange) {
// console.log('🍰 Rendering profit breakdown chart');
    
    const canvas = document.getElementById('profit-breakdown-chart');
    if (!canvas) return;
    
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        await loadChartJS();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Calculate breakdown data
    const revenueMetrics = calculateRevenueMetrics(transactions);
    const expenseMetrics = calculateExpenseMetrics(expenses, dateRange);
    
    // Destroy existing chart
    if (window.profitBreakdownChart) {
        window.profitBreakdownChart.destroy();
    }
    
    // Create doughnut chart
    window.profitBreakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chi phí phân bổ', 'Chi phí không phân bổ', 'Lợi nhuận ròng'],
            datasets: [{
                data: [
                    expenseMetrics.allocatedCosts,
                    expenseMetrics.directCosts,
                    Math.max(0, revenueMetrics.totalRevenue - expenseMetrics.totalCosts)
                ],
                backgroundColor: ['#f59e0b', '#ef4444', '#10b981'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatRevenue(context.parsed)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update profit insights
 */
async function updateProfitInsights(transactions, expenses) {
    // console.log('💡 Updating profit insights');
    
    const insights = generateProfitInsights(transactions, expenses);
    
    updateInsightElement('highest-margin-value', insights.highestMargin.value);
    updateInsightElement('highest-margin-desc', insights.highestMargin.description);
    
    updateInsightElement('cost-efficiency-value', insights.costEfficiency.value);
    updateInsightElement('cost-efficiency-desc', insights.costEfficiency.description);
    
    updateInsightElement('growth-potential-value', insights.growthPotential.value);
    updateInsightElement('growth-potential-desc', insights.growthPotential.description);
    
    updateInsightElement('improvement-area-value', insights.improvementArea.value);
    updateInsightElement('improvement-area-desc', insights.improvementArea.description);
}

/**
 * Setup custom profit tooltips
 */
function setupProfitTooltips() {
    const tooltipElements = document.querySelectorAll('.custom-tooltip[data-metric]');
    const tooltip = document.getElementById('profit-tooltip');
    
    if (!tooltip) {
// console.warn('❌ Profit tooltip container not found');
        return;
    }
    
    const tooltipData = {
        'revenue': {
            title: 'Doanh thu',
            icon: 'fas fa-dollar-sign',
            iconColor: '#16a34a',
            iconBg: '#dcfce7',
            formula: 'Doanh thu = Đã hoàn tất + Đã thanh toán - Hoàn tiền',
            description: 'Tổng số tiền thực tế đã thu được từ khách hàng trong kỳ, sau khi trừ đi các khoản hoàn tiền. Đây là chỉ số quan trọng nhất để đánh giá hiệu quả kinh doanh.'
        },
        'refunds': {
            title: 'Tổng hoàn tiền',
            icon: 'fas fa-undo-alt',
            iconColor: '#dc2626',
            iconBg: '#fee2e2',
            formula: 'Tổng hoàn tiền = -(Tổng giao dịch có trạng thái "hoàn tiền")',
            description: 'Tổng số tiền đã hoàn trả lại cho khách hàng trong kỳ. Hiển thị dưới dạng số âm để thể hiện đây là khoản tiền bị mất. Tỷ lệ hoàn tiền cao có thể báo hiệu vấn đề về chất lượng sản phẩm hoặc dịch vụ.'
        },
        'allocated-cost': {
            title: 'Chi phí phân bổ',
            icon: 'fas fa-chart-line',
            iconColor: '#d97706',
            iconBg: '#fef3c7',
            formula: 'Chi phí phân bổ = Tổng chi phí có cột "Phân bổ" = "Có"',
            description: 'Chi phí được phân bổ theo thời gian, thường là những khoản chi dài hạn như thuê văn phòng, lương nhân viên, phần mềm... Được chia đều cho các tháng trong chu kỳ sử dụng.'
        },
        'direct-cost': {
            title: 'Chi phí không phân bổ',
            icon: 'fas fa-receipt',
            iconColor: '#d97706',
            iconBg: '#fef3c7',
            formula: 'Chi phí không phân bổ = Tổng chi phí có cột "Phân bổ" = "Không"',
            description: 'Chi phí phát sinh trực tiếp trong kỳ, không cần phân bổ như chi phí marketing, mua nguyên vật liệu, chi phí vận hành... Thường là những khoản chi một lần hoặc theo từng dự án cụ thể.'
        },
        'gross-profit': {
            title: 'Lợi nhuận gộp',
            icon: 'fas fa-trending-up',
            iconColor: '#2563eb',
            iconBg: '#dbeafe',
            formula: 'Lợi nhuận gộp = Doanh thu - Chi phí phân bổ',
            description: 'Lợi nhuận sau khi trừ đi chi phí cơ bản, thường dùng để đánh giá hiệu quả hoạt động cốt lõi của doanh nghiệp. Chỉ số này giúp đánh giá khả năng sinh lời từ hoạt động kinh doanh chính.'
        },
        'net-profit': {
            title: 'Lợi nhuận ròng',
            icon: 'fas fa-coins',
            iconColor: '#2563eb',
            iconBg: '#dbeafe',
            formula: 'Lợi nhuận ròng = Lợi nhuận gộp - Chi phí không phân bổ',
            description: 'Lợi nhuận cuối cùng sau khi trừ tất cả các loại chi phí. Đây là chỉ số quan trọng nhất để đánh giá hiệu quả tổng thể và khả năng sinh lời thực sự của doanh nghiệp trong kỳ.'
        },
        'profit-margin': {
            title: 'Tỷ suất lợi nhuận',
            icon: 'fas fa-percentage',
            iconColor: '#7c3aed',
            iconBg: '#f3e8ff',
            formula: 'Tỷ suất lợi nhuận = (Lợi nhuận ròng ÷ Doanh thu) × 100',
            description: 'Tỷ lệ phần trăm lợi nhuận ròng so với doanh thu, cho biết hiệu quả sử dụng vốn. Tỷ suất cao cho thấy doanh nghiệp hoạt động hiệu quả và có khả năng kiểm soát chi phí tốt.'
        }
    };
    
    tooltipElements.forEach(element => {
        const metricType = element.getAttribute('data-metric');
        const data = tooltipData[metricType];
        
        if (!data) return;
        
        element.addEventListener('mouseenter', (e) => {
            showCustomTooltip(e, data, tooltip);
        });
        
        element.addEventListener('mouseleave', () => {
            hideCustomTooltip(tooltip);
        });
        
        element.addEventListener('mousemove', (e) => {
            updateTooltipPosition(e, tooltip);
        });
    });
}

/**
 * Setup event handlers for profit analysis
 */
function setupProfitAnalysisHandlers() {
    // Period selector buttons
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            periodBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const period = e.target.dataset.period;
            refreshProfitChart(period);
        });
    });
}

// Helper functions
function updateKPIElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateChangeElement(id, change) {
    const element = document.getElementById(id);
    if (element) {
        const isPositive = change >= 0;
        element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
        element.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
    }
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
// console.warn(`❌ Element not found: ${elementId}`);
    }
}

function updateInsightElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function calculatePercentageChange(previous, current) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

function calculateBusinessEfficiency(metrics) {
    const totalCostPercent = metrics.allocatedCostsPercent + metrics.directCostsPercent;
    
    if (totalCostPercent < 40) {
        return { label: 'Xuất sắc', description: 'Chi phí được kiểm soát rất tốt' };
    } else if (totalCostPercent < 60) {
        return { label: 'Tốt', description: 'Hiệu quả kinh doanh ổn định' };
    } else if (totalCostPercent < 80) {
        return { label: 'Khá tốt', description: 'Cần tối ưu hóa chi phí' };
    } else {
        return { label: 'Cần cải thiện', description: 'Chi phí quá cao so với doanh thu' };
    }
}

// Data processing helper functions
function filterDataByDateRange(data, dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) return data;
    
    return data.filter(item => {
        const itemDate = normalizeDate(getTransactionField(item, 'transactionDate'));
        if (!itemDate) return false;
        
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
}

function filterExpensesByDateRange(expenses, dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) return expenses;
    
    return expenses.filter(expense => {
        const expenseDate = normalizeDate(getExpenseField(expense, 'expenseDate'));
        if (!expenseDate) return false;
        
        return expenseDate >= dateRange.start && expenseDate <= dateRange.end;
    });
}

function getTransactionField(transaction, fieldType) {
    if (!transaction) return '';
    
    switch (fieldType) {
        case 'transactionDate':
            return transaction.ngayGiaoDich || transaction.date || transaction.transactionDate || '';
        default:
            return '';
    }
}

function getExpenseField(expense, fieldType) {
    if (!expense) return '';
    
    switch (fieldType) {
        case 'expenseDate':
            return expense.ngayChi || expense.date || expense.expenseDate || '';
        default:
            return '';
    }
}

function normalizeExpense(rawExpense) {
    if (!rawExpense) return null;
    
    return {
        expenseId: rawExpense.expenseId || rawExpense.maChiPhi || '',
        amount: parseFloat(rawExpense.soTien || rawExpense.amount || 0),
        allocation: rawExpense.periodicAllocation || rawExpense.phanBo || rawExpense.allocation || '',
        accountingType: rawExpense.accountingType || rawExpense.loaiKeToan || '',
        periodicAllocation: rawExpense.periodicAllocation || rawExpense.phanBo || '',
        product: rawExpense.product || rawExpense.tenSanPham || '',
        date: rawExpense.ngayChi || rawExpense.date || '',
        renewDate: rawExpense.renewDate || rawExpense.ngayTaiTuc || '',
        category: rawExpense.danhMucChung || rawExpense.category || '',
        tenChuan: rawExpense.tenChuan || rawExpense.standardName || '',  // standardName is used in getExpenseStats
        type: rawExpense.type || rawExpense.loaiKhoanChi || rawExpense.expenseType || ''
    };
}

function prepareProfitTrendData(transactions, expenses, period) {
    // Placeholder implementation - should be enhanced with real time-series analysis
    return {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
        grossProfit: [50000, 75000, 60000, 90000],
        netProfit: [30000, 45000, 35000, 55000]
    };
}

function generateProfitInsights(transactions, expenses) {
    // Placeholder implementation for insights generation
    return {
        highestMargin: {
            value: 'Software A',
            description: 'Biên lợi nhuận 45%'
        },
        costEfficiency: {
            value: '65%',
            description: 'Tỷ lệ chi phí trên doanh thu'
        },
        growthPotential: {
            value: 'Cao',
            description: 'Dự báo tăng trưởng 25% trong quý tới'
        },
        improvementArea: {
            value: 'Chi phí vận hành',
            description: 'Giảm 10% chi phí không cần thiết'
        }
    };
}

function getPreviousPeriodTransactions(transactions, period) {
    // Placeholder - would implement actual previous period calculation
    return transactions.slice(0, Math.floor(transactions.length / 2));
}

function getPreviousPeriodExpenses(expenses, period) {
    // Placeholder - would implement actual previous period calculation
    return expenses.slice(0, Math.floor(expenses.length / 2));
}

function loadChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function showCustomTooltip(event, data, tooltip) {
    const icon = tooltip.querySelector('.tooltip-icon');
    const title = tooltip.querySelector('.tooltip-title');
    const formula = tooltip.querySelector('.tooltip-formula');
    const description = tooltip.querySelector('.tooltip-description');
    
    icon.className = `tooltip-icon ${data.icon}`;
    icon.style.backgroundColor = data.iconBg;
    icon.style.color = data.iconColor;
    
    title.textContent = data.title;
    formula.textContent = data.formula;
    description.textContent = data.description;
    
    updateTooltipPosition(event, tooltip);
    tooltip.classList.add('show');
}

function hideCustomTooltip(tooltip) {
    tooltip.classList.remove('show');
}

function updateTooltipPosition(event, tooltip) {
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = event.pageX + 15;
    let top = event.pageY - rect.height - 15;
    
    if (left + rect.width > viewportWidth) {
        left = event.pageX - rect.width - 15;
    }
    
    if (top < window.pageYOffset) {
        top = event.pageY + 15;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function refreshProfitChart(period) {
    // console.log(`🔄 Refreshing profit chart for period: ${period}`);
    // Implementation for chart refresh
}

// Global functions for template usage
window.refreshProfitAnalysis = function() {
    loadProfitAnalysis();
};

window.exportProfitReport = function() {
    // console.log('📊 Exporting profit report...');
    // Implementation for export functionality
};

window.toggleChartView = function(chartType, viewType) {
    // console.log(`🔄 Toggling ${chartType} chart to ${viewType} view`);
};

/**
 * Update the profit overview grid (6 KPI cards)
 */
async function updateProfitOverviewGrid(transactions, expenses, period, dateRange) {
    // console.log('💰 Updating profit overview grid');
    
    // Calculate current period metrics
    const revenueMetrics = calculateRevenueMetrics(transactions);
    const expenseMetrics = calculateExpenseMetrics(expenses, dateRange);
    const profitMetrics = calculateProfitMetrics(revenueMetrics, expenseMetrics);
    
    // Calculate previous period for comparison
    const previousTransactions = getPreviousPeriodTransactions(transactions, period);
    const previousExpenses = getPreviousPeriodExpenses(expenses, period);
    const previousRevenueMetrics = calculateRevenueMetrics(previousTransactions);
    const previousExpenseMetrics = calculateExpenseMetrics(previousExpenses, dateRange);
    const previousProfitMetrics = calculateProfitMetrics(previousRevenueMetrics, previousExpenseMetrics);
    
    // Update overview grid values
    updateOverviewCard('overview-revenue', formatRevenue(profitMetrics.revenue), 
        calculatePercentageChange(previousProfitMetrics.revenue, profitMetrics.revenue));
    
    updateOverviewCard('overview-refunds', formatRevenue(Math.abs(profitMetrics.refunds)), 
        calculatePercentageChange(Math.abs(previousProfitMetrics.refunds), Math.abs(profitMetrics.refunds)), true);
    
    updateOverviewCard('overview-allocated-cost', formatRevenue(profitMetrics.allocatedCosts), 
        calculatePercentageChange(previousProfitMetrics.allocatedCosts, profitMetrics.allocatedCosts));
    
    updateOverviewCard('overview-direct-cost', formatRevenue(profitMetrics.directCosts), 
        calculatePercentageChange(previousProfitMetrics.directCosts, profitMetrics.directCosts));
    
    updateOverviewCard('overview-gross-profit', formatRevenue(profitMetrics.grossProfit), 
        calculatePercentageChange(previousProfitMetrics.grossProfit, profitMetrics.grossProfit));
    
    updateOverviewCard('overview-net-profit', formatRevenue(profitMetrics.netProfit), 
        calculatePercentageChange(previousProfitMetrics.netProfit, profitMetrics.netProfit));
    
    // Update profit margin with status
    updateKPIElement('overview-profit-margin', `${profitMetrics.profitMargin.toFixed(1)}%`);
    
    let marginStatus = 'Ổn định';
    if (profitMetrics.profitMargin > 30) marginStatus = 'Rất tốt';
    else if (profitMetrics.profitMargin > 20) marginStatus = 'Tốt';
    else if (profitMetrics.profitMargin > 10) marginStatus = 'Trung bình';
    else if (profitMetrics.profitMargin <= 0) marginStatus = 'Cần cải thiện';
    
    updateKPIElement('overview-margin-status', marginStatus);
    
    // console.log('💰 Profit overview grid updated');
}

/**
 * Load software profit analysis table
 */
async function loadSoftwareProfitAnalysis(transactions, expenses, dateRange) {
// console.log('💻 Loading software profit analysis');
    
    try {
        // Get software profit data
        const softwareProfitData = await calculateSoftwareProfitMetrics(transactions, expenses, dateRange);
        
        // Update table
        updateSoftwareProfitTable(softwareProfitData);
        
        // Update summary
        updateSoftwareProfitSummary(softwareProfitData);
        
// console.log('💻 Software profit analysis loaded:', softwareProfitData.length, 'software items');
        
    } catch (error) {
        console.error('❌ Error loading software profit analysis:', error);
    }
}

/**
 * Calculate profit metrics for each software
 */
async function calculateSoftwareProfitMetrics(transactions, expenses, dateRange) {
// console.log('🔢 Calculating software profit metrics');
    
    // Get unique software names from all sources (revenue + direct costs + allocated costs)
    const softwareNames = getSoftwareNamesFromAllSources(transactions, expenses, dateRange);
    
    const softwareProfitData = [];
    
    for (const softwareName of softwareNames) {
        // Calculate revenue for this software from transactions
        const softwareRevenue = calculateSoftwareRevenue(transactions, softwareName);
        
        // Calculate refunds for this software
        const softwareRefunds = calculateSoftwareRefunds(transactions, softwareName);
        
        // Calculate allocated costs for this software
        const allocatedCosts = calculateSoftwareAllocatedCosts(expenses, softwareName, dateRange);
        
        // Calculate direct costs for this software  
        const directCosts = calculateSoftwareDirectCosts(expenses, softwareName, dateRange);
        
        // Calculate total costs = allocated costs + direct costs
        const totalCosts = allocatedCosts + directCosts;
        
        // Calculate gross profit = revenue - total costs
        const grossProfit = softwareRevenue.netRevenue - totalCosts;
        
        // Calculate profit margin = (gross profit / net revenue) * 100
        const profitMargin = softwareRevenue.netRevenue > 0 ? (grossProfit / softwareRevenue.netRevenue) * 100 : 0;
        
        softwareProfitData.push({
            softwareName,
            totalRevenue: softwareRevenue.netRevenue,
            grossRevenue: softwareRevenue.grossRevenue,
            refunds: softwareRefunds,
            directCosts,
            allocatedCosts,
            totalCosts,
            grossProfit,
            profitMargin
        });
    }
    
    // Sort by gross profit descending
    softwareProfitData.sort((a, b) => b.grossProfit - a.grossProfit);
    
    return softwareProfitData;
}

/**
 * Check if expense matches software by tenChuan field
 */
function doesExpenseMatchSoftware(expenseTenChuan, targetSoftwareName) {
    // Both should use tenChuan field - direct comparison
    return expenseTenChuan === targetSoftwareName;
}

/**
 * BƯỚC 1: Liệt kê danh sách tên chuẩn duy nhất từ 3 nguồn
 * 1. Tên chuẩn trong sheet GiaoDich có doanh thu nằm trong chu kỳ báo cáo
 * 2. Tên chuẩn có chi phí nằm trong chu kỳ báo cáo (sheet ChiPhi)  
 * 3. Tên chuẩn có chi phí phân bổ (Ngày tái tục >= ngày bắt đầu chu kỳ, Phân bổ = "Có", COGS/OPEX)
 */
function getSoftwareNamesFromAllSources(transactions, expenses, dateRange) {
    const softwareNames = new Set();
    
    // console.log('🔍 BƯỚC 1: Liệt kê danh sách tên chuẩn duy nhất từ 3 nguồn...');
    // console.log('📅 Chu kỳ báo cáo:', dateRange ? `${dateRange.start} đến ${dateRange.end}` : 'Không xác định');
    
    // Nguồn 1: Tên chuẩn trong sheet GiaoDich có doanh thu nằm trong chu kỳ báo cáo
    let revenueSource = 0;
    const revenueNames = new Set();
    
    transactions.forEach((transaction, index) => {
        const transactionDate = new Date(transaction.ngayGiaoDich || transaction.date || transaction.transactionDate || '');
        const standardName = (transaction.tenChuan || transaction.standardName || '').trim();
        const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
        const amount = parseFloat(transaction.doanhThu || transaction.revenue || 0);
        
        // Kiểm tra giao dịch có doanh thu trong chu kỳ
        const rangeStart = dateRange ? new Date(dateRange.start) : null;
        const rangeEnd = dateRange ? new Date(dateRange.end) : null;
        const isInDateRange = rangeStart && rangeEnd && transactionDate >= rangeStart && transactionDate <= rangeEnd;
        const hasRevenue = (status === 'đã hoàn tất' || status === 'đã thanh toán') && amount > 0;
        
        if (index < 3) {
// console.log(`📊 Giao dịch #${index + 1}:`, {
                standardName: standardName,
                transactionDate: !isNaN(transactionDate.getTime()) ? transactionDate.toISOString().split('T')[0] : 'Invalid Date',
                status: status,
                amount: amount,
                isInDateRange: isInDateRange,
                hasRevenue: hasRevenue,
                willInclude: standardName && hasRevenue && isInDateRange
            });
        }
        
        if (standardName && hasRevenue && isInDateRange) {
            softwareNames.add(standardName);
            revenueNames.add(standardName);
            revenueSource++;
        }
    });
    
    // console.log(`✅ Nguồn 1 - GiaoDich có doanh thu: ${revenueSource} records, ${revenueNames.size} tên chuẩn unique`);
    // console.log(`📋 Danh sách từ GiaoDich:`, Array.from(revenueNames).sort());
    
    // Nguồn 2: Tên chuẩn có chi phí nằm trong chu kỳ báo cáo (sheet ChiPhi)
    let directCostSource = 0;
    const directCostNames = new Set();
    
    expenses.forEach((expense, index) => {
        // First normalize the expense to ensure consistent field access
        const normalizedExpense = normalizeExpense(expense);
        const expenseDate = new Date(normalizedExpense.date || '');
        // CHỈ sử dụng tenChuan field, KHÔNG fallback sang product
        const standardName = (normalizedExpense.tenChuan || '').trim();
        const accountingType = (normalizedExpense.accountingType || '').trim();
        const expenseType = (normalizedExpense.type || '').trim();
        
        // Kiểm tra chi phí nằm trong chu kỳ báo cáo
        const rangeStart = dateRange ? new Date(dateRange.start) : null;
        const rangeEnd = dateRange ? new Date(dateRange.end) : null;
        const isInDateRange = rangeStart && rangeEnd && expenseDate >= rangeStart && expenseDate <= rangeEnd;
        const isRelevantExpense = standardName && (accountingType === 'COGS' || accountingType === 'OPEX');
        
        if (index < 3) {
// console.log(`💰 Chi phí #${index + 1}:`, {
                standardName: standardName,
                rawExpenseFields: Object.keys(expense),
                rawTenChuan: expense.tenChuan,
                rawStandardName: expense.standardName,
                rawProduct: expense.product,
                normalizedTenChuan: normalizedExpense.tenChuan,
                expenseDate: !isNaN(expenseDate.getTime()) ? expenseDate.toISOString().split('T')[0] : 'Invalid Date',
                accountingType: accountingType,
                expenseType: expenseType,
                isInDateRange: isInDateRange,
                isRelevantExpense: isRelevantExpense,
                willInclude: isRelevantExpense && isInDateRange,
                // Debug: Show sample raw data
                rawExpenseSample: {
                    tenChuan: expense.tenChuan,
                    standardName: expense.standardName,
                    product: expense.product,
                    tenSanPham: expense.tenSanPham,
                    loaiKeToan: expense.loaiKeToan,
                    accountingType: expense.accountingType
                }
            });
        }
        
        // Chỉ cần điều kiện: loại kế toán COGS/OPEX và ngày chi trong chu kỳ
        if (isRelevantExpense && isInDateRange) {
            softwareNames.add(standardName);
            directCostNames.add(standardName);
            directCostSource++;
        }
    });
    
    // console.log(`✅ Nguồn 2 - ChiPhi trong chu kỳ: ${directCostSource} records, ${directCostNames.size} tên chuẩn unique`);
    // console.log(`📋 Danh sách từ ChiPhi:`, Array.from(directCostNames).sort());
    
    // Nguồn 3: Tên chuẩn có chi phí phân bổ (Ngày tái tục >= ngày bắt đầu chu kỳ, Phân bổ = "Có", COGS/OPEX)
    let allocatedCostSource = 0;
    const allocatedCostNames = new Set();
    
    expenses.forEach((expense, index) => {
        // First normalize the expense to ensure consistent field access
        const normalizedExpense = normalizeExpense(expense);
        const renewalDate = new Date(normalizedExpense.renewDate || '');
        // CHỈ sử dụng tenChuan field, KHÔNG fallback sang product
        const standardName = (normalizedExpense.tenChuan || '').trim();
        const allocation = (normalizedExpense.allocation || '').toLowerCase().trim();
        const accountingType = (normalizedExpense.accountingType || '').trim();
        const expenseType = (normalizedExpense.type || '').trim();
        
        // Debug: Check for "Vận hành văn phòng"
        if (expense.product && expense.product.includes('văn phòng')) {
// console.log(`🏢 Found văn phòng expense #${index + 1}:`, {
                rawProduct: expense.product,
                normalizedTenChuan: normalizedExpense.tenChuan,
                standardName: standardName,
                allocation: allocation,
                accountingType: accountingType,
                expenseType: expenseType,
                renewalDate: !isNaN(renewalDate.getTime()) ? renewalDate.toISOString().split('T')[0] : 'Invalid Date',
                rawData: expense,
                normalizedData: normalizedExpense
            });
        }
        
        // Kiểm tra chi phí phân bổ: Ngày tái tục >= ngày bắt đầu chu kỳ, Phân bổ = "Có", COGS/OPEX
        const rangeStart = dateRange ? new Date(dateRange.start) : null;
        const isRenewalAfterStart = rangeStart && renewalDate >= rangeStart && !isNaN(renewalDate.getTime());
        const isAllocated = allocation === 'có';
        const isRelevantExpense = standardName && (accountingType === 'COGS' || accountingType === 'OPEX');
        
        if (index < 3) {
// console.log(`📈 Chi phí phân bổ #${index + 1}:`, {
                standardName: standardName,
                rawExpenseFields: Object.keys(expense),
                rawTenChuan: expense.tenChuan,
                rawStandardName: expense.standardName,
                rawProduct: expense.product,
                normalizedTenChuan: normalizedExpense.tenChuan,
                renewalDate: !isNaN(renewalDate.getTime()) ? renewalDate.toISOString().split('T')[0] : 'Invalid Date',
                allocation: allocation,
                accountingType: accountingType,
                expenseType: expenseType,
                isRenewalAfterStart: isRenewalAfterStart,
                isAllocated: isAllocated,
                isRelevantExpense: isRelevantExpense,
                willInclude: isRelevantExpense && isAllocated && isRenewalAfterStart,
                // Debug: Show sample raw data
                rawExpenseSample: {
                    tenChuan: expense.tenChuan,
                    standardName: expense.standardName,
                    product: expense.product,
                    tenSanPham: expense.tenSanPham,
                    loaiKeToan: expense.loaiKeToan,
                    accountingType: expense.accountingType,
                    phanBo: expense.phanBo,
                    periodicAllocation: expense.periodicAllocation,
                    ngayTaiTuc: expense.ngayTaiTuc,
                    renewDate: expense.renewDate
                }
            });
        }
        
        // Chỉ cần điều kiện: loại kế toán COGS/OPEX, phân bổ = Có, ngày tái tục >= đầu chu kỳ
        if (isRelevantExpense && isAllocated && isRenewalAfterStart) {
            softwareNames.add(standardName);
            allocatedCostNames.add(standardName);
            allocatedCostSource++;
        }
    });
    
    // console.log(`✅ Nguồn 3 - Chi phí phân bổ: ${allocatedCostSource} records, ${allocatedCostNames.size} tên chuẩn unique`);
    // console.log(`📋 Danh sách từ Chi phí phân bổ:`, Array.from(allocatedCostNames).sort());
    
    // Tổng hợp kết quả
    const finalList = Array.from(softwareNames).sort();
    // console.log(`\n🎯 KẾT QUẢ BƯỚC 1 - Danh sách tên chuẩn duy nhất:`);
    // console.log(`📊 Tổng số tên chuẩn unique: ${finalList.length}`);
    // console.log(`📋 Danh sách cuối cùng:`, finalList);
    // console.log(`📈 Thống kê nguồn dữ liệu:`);
// console.log(`   - Từ GiaoDich có doanh thu: ${revenueNames.size} tên chuẩn`);
// console.log(`   - Từ ChiPhi trong chu kỳ: ${directCostNames.size} tên chuẩn`);
// console.log(`   - Từ Chi phí phân bổ: ${allocatedCostNames.size} tên chuẩn`);
    
    return finalList;
}

/**
 * Calculate revenue for a specific software
 */
function calculateSoftwareRevenue(transactions, softwareName) {
    let grossRevenue = 0;
    let refunds = 0;
    
    transactions.forEach(transaction => {
        // Cột T trong sheet GiaoDich = tenChuan
        const standardName = (transaction.tenChuan || transaction.standardName || '').trim();
        const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
        const amount = parseFloat(transaction.doanhThu || transaction.revenue || 0);
        
        if (standardName === softwareName) {
            if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
                grossRevenue += amount;
            } else if (status === 'hoàn tiền') {
                refunds += Math.abs(amount);
            }
        }
    });
    
    return {
        grossRevenue,
        refunds,
        netRevenue: grossRevenue - refunds
    };
}

/**
 * Calculate refunds for a specific software
 */
function calculateSoftwareRefunds(transactions, softwareName) {
    let refunds = 0;
    
    transactions.forEach(transaction => {
        // Cột T trong sheet GiaoDich = tenChuan
        const standardName = (transaction.tenChuan || transaction.standardName || '').trim();
        const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
        const amount = parseFloat(transaction.doanhThu || transaction.revenue || 0);
        
        if (standardName === softwareName && status === 'hoàn tiền') {
            refunds += Math.abs(amount);
        }
    });
    
    return refunds;
}

/**
 * Calculate allocated costs for a specific software
 */
function calculateSoftwareAllocatedCosts(expenses, softwareName, dateRange) {
    let allocatedCosts = 0;
    let directCosts = 0;
    
// console.log(`🔍 DEBUG SOFTWARE ALLOCATED COSTS - START:`, {

  //         softwareName: softwareName,
  //         totalExpenses: expenses.length,
  //         dateRange: dateRange,
  //         dateRangeFormatted: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'No date range'
  //     });
  //     
  //     // Log sample expense data to understand structure
  //     if (expenses.length > 0) {
  //         // console.log(`📋 Sample expense data (first 3 items):`, expenses.slice(0, 3));
  //         
  //         // Log all possible field names from first expense
  //         if (expenses[0]) {
  //             // console.log(`📊 Available fields in expense object:`, Object.keys(expenses[0]));
// console.log(`📊 Field values that might contain software name:`, {

  //                 product: expenses[0].product,
  //                 tenChuan: expenses[0].tenChuan,
  //                 standardName: expenses[0].standardName,
  //                 tenSanPham: expenses[0].tenSanPham,
  //                 moTa: expenses[0].moTa,
  //                 description: expenses[0].description
  //             });
  //             
  //             // Check for "Vận hành văn phòng" in all expenses
  //             const vanHanhExpenses = expenses.filter(exp => {
  //                 const product = (exp.product || exp.tenSanPham || '').toLowerCase();
  //                 const tenChuan = (exp.tenChuan || exp.standardName || '').toLowerCase();
  //                 const description = (exp.moTa || exp.description || '').toLowerCase();
  //                 return product.includes('văn phòng') || tenChuan.includes('văn phòng') || description.includes('văn phòng');
  //             });
  //             
  //             // console.log(`🏢 Found ${vanHanhExpenses.length} expenses with "văn phòng":`, vanHanhExpenses);
  //         }
  //     }
  //     
  //     let processedCount = 0;
  //     let matchedCount = 0;
  //     
  //     expenses.forEach((expense, index) => {
  //         // Log full expense object for first few items
  //         if (index < 5) {
  //             // console.log(`📦 Expense #${index + 1} full data:`, expense);
  //         }
  //         
  //         // Get software name from expense using tenChuan field (cột T trong sheet ChiPhi)
  //         const expenseTenChuan = (expense.tenChuan || expense.standardName || '').trim();
  //         const expenseType = (expense.type || expense.loaiKhoanChi || expense.expenseType || '').trim();
  //         
  //         // Debug: Log field values
  //         if (index < 5) {
// console.log(`🔤 Expense #${index + 1} tenChuan comparison:`, {
  //                 expenseTenChuan: expenseTenChuan,
  //                 targetSoftware: softwareName,
  //                 matches: expenseTenChuan === softwareName,
  //                 expenseType: expenseType,
  //                 isBusinessSoftware: expenseType === 'Kinh doanh phần mềm'
  //             });
  //         }
  //         
  //         // Only process if this expense belongs to the current software (direct tenChuan match)
  //         if (doesExpenseMatchSoftware(expenseTenChuan, softwareName)) {
  //             matchedCount++;
// console.log(`✅ MATCHED expense #${index + 1} for ${softwareName}:`, {
  //                 expenseId: expense.expenseId || expense.maChiPhi || 'N/A',
  //                 description: expense.description || expense.moTa || 'N/A',
  //                 amount: expense.amount || expense.soTien || 0,
  //                 allocation: expense.periodicAllocation || expense.phanBo || expense.allocation || '',
  //                 accountingType: expense.accountingType || expense.loaiKeToan || '',
  //                 date: expense.date || expense.ngayChi || '',
  //                 renewDate: expense.renewDate || expense.ngayTaiTuc || ''
  //             });
  //             
  //             const amount = parseFloat(expense.amount || expense.soTien || 0);
  //             const allocation = (expense.periodicAllocation || expense.phanBo || expense.allocation || '').toLowerCase().trim();
  //             const accountingType = (expense.accountingType || expense.loaiKeToan || '').trim();
  //             const expenseDate = new Date(expense.date || expense.ngayChi || '');
  //             const renewalDate = new Date(expense.renewDate || expense.ngayTaiTuc || '');
  //             const isValidDates = !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime());
  //             
// console.log(`🔢 Processing allocation for matched expense:`, {

  //                 amount: amount,
  //                 allocation: allocation,
  //                 accountingType: accountingType,
  //                 expenseDate: isValidDates ? expenseDate.toISOString().split('T')[0] : 'Invalid Date',
  //                 renewalDate: isValidDates ? renewalDate.toISOString().split('T')[0] : 'Invalid Date',
  //                 isValidDates: isValidDates
  //             });
  //             
  //             // Convert dateRange strings to Date objects
  //             const rangeStart = dateRange ? new Date(dateRange.start) : null;
  //             const rangeEnd = dateRange ? new Date(dateRange.end) : null;
  //             
  //             // Apply SAME LOGIC as overview-allocated-cost but filtered by software name
  //             
  //             // Chi phí không phân bổ: Phân bổ = "Không" và Loại kế toán = "COGS" hoặc "OPEX" và Ngày chi trong chu kỳ
  //             if (allocation === 'không' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
  //                 if (rangeStart && rangeEnd && expenseDate >= rangeStart && expenseDate <= rangeEnd) {
  //                     directCosts += amount;
// console.log(`💸 Added to direct costs: ${amount} (total direct: ${directCosts})`);
  //                 }
  //             }
  //             // Chi phí phân bổ: Loại kế toán = "OPEX" hoặc "COGS", Phân bổ = "Có", Ngày tái tục >= Ngày bắt đầu chu kỳ
  //             else if (allocation === 'có' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
// console.log(`🔍 Checking allocated cost conditions:`, {

  //                     hasDateRange: rangeStart && rangeEnd,
  //                     renewalAfterStart: renewalDate >= rangeStart,
  //                     validDates: !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime()),
  //                     conditionsMet: rangeStart && rangeEnd && renewalDate >= rangeStart && !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime())
  //                 });
  //                 
  //                 if (rangeStart && rangeEnd && renewalDate >= rangeStart && !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime())) {
  //                     
  //                     // Tính số ngày từ ngày chi đến ngày tái tục
  //                     const totalDays = Math.ceil((renewalDate - expenseDate) / (1000 * 60 * 60 * 24));
  //                     
  //                     // Tính số ngày trong chu kỳ báo cáo
  //                     const periodDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
  //                     
  //                     let allocatedAmount = 0;
  //                     
  //                     // Nếu ngày tái tục < ngày cuối chu kỳ
  //                     if (renewalDate < rangeEnd) {
  //                         // Ngày hiện tại
  //                         const today = new Date();
  //                         
  //                         // Số ngày từ đầu chu kỳ đến ngày tái tục
  //                         const daysToRenewal = Math.ceil((renewalDate - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
  //                         
  //                         // Số ngày từ đầu chu kỳ đến ngày hiện tại
  //                         const daysToToday = Math.ceil((today - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
  //                         
  //                         // Lấy Min(ngày hiện tại - đầu chu kỳ, ngày tái tục - đầu chu kỳ)
  //                         const effectiveDays = Math.min(daysToToday, daysToRenewal);
  //                         
  //                         // Công thức: số tiền * Min(ngày hiện tại - đầu chu kỳ, ngày tái tục - đầu chu kỳ) / (ngày tái tục - ngày chi)
  //                         allocatedAmount = amount * effectiveDays / totalDays;
  //                         
                        // console.log(`📊 Allocated calculation (renewal < end):`, {

  //                         //     amount: amount,
  //                         //     effectiveDays: effectiveDays,
  //                         //     totalDays: totalDays,
  //                         //     formula: `${amount} * ${effectiveDays} / ${totalDays}`,
  //                         //     result: allocatedAmount
  //                         // });
  //                     } 
  //                     // Nếu ngày tái tục >= ngày cuối chu kỳ
  //                     else {
  //                         allocatedAmount = amount * periodDays / totalDays;
  //                         
                        // console.log(`📊 Allocated calculation (renewal >= end):`, {

  //                         //     amount: amount,
  //                         //     periodDays: periodDays,
  //                         //     totalDays: totalDays,
  //                         //     formula: `${amount} * ${periodDays} / ${totalDays}`,
  //                         //     result: allocatedAmount
  //                         // });
  //                     }
  //                     
  //                     allocatedCosts += allocatedAmount;
  //                     // console.log(`💰 Added to allocated costs: ${allocatedAmount} (total allocated: ${allocatedCosts})`);
  //                 }
  //             }
  //         }
  //         
  //         processedCount++;
  //     });
  //     
// console.log(`💰 SOFTWARE ALLOCATED COSTS FINAL RESULT for ${softwareName}:`, {
  //         allocatedCosts: allocatedCosts,
  //         directCosts: directCosts,
  //         totalExpenses: expenses.length,
  //         processedExpenses: processedCount,
  //         matchedExpenses: matchedCount,
  //         dateRange: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'No date range'
  //     });
  //     
  //     // Return only allocated costs (matching the column name in the table)
  //     return allocatedCosts;
  // }
  // 
/**
  //  * Calculate direct costs for a specific software (không phân bổ)
  //  */
  // function calculateSoftwareDirectCosts(expenses, softwareName, dateRange) {
// console.log(`🔍 DEBUG SOFTWARE DIRECT COSTS - START:`, {

  //         softwareName: softwareName,
  //         totalExpenses: expenses.length,
  //         dateRange: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'No date range'
  //     });
  //     
  //     let directCosts = 0;
  //     let processedCount = 0;
  //     let matchedCount = 0;
  //     
  //     // Convert dateRange strings to Date objects
  //     const rangeStart = dateRange ? new Date(dateRange.start) : null;
  //     const rangeEnd = dateRange ? new Date(dateRange.end) : null;
  //     
  //     expenses.forEach((expense, index) => {
  //         // Get software name from expense using tenChuan field (cột T trong sheet ChiPhi)
  //         const expenseTenChuan = (expense.tenChuan || expense.standardName || '').trim();
  //         
  //         // Check if this expense tenChuan matches the target software (direct comparison)
  //         if (!doesExpenseMatchSoftware(expenseTenChuan, softwareName)) {
  //             return;
  //         }
  //         
  //         matchedCount++;
  //         
  //         const amount = parseFloat(expense.amount || expense.soTien || 0);
  //         const allocation = (expense.periodicAllocation || expense.phanBo || expense.allocation || '').toLowerCase().trim();
  //         const accountingType = (expense.accountingType || expense.loaiKeToan || '').trim();
  //         const expenseDate = new Date(expense.date || expense.ngayChi || '');
  //         const isValidExpenseDate = !isNaN(expenseDate.getTime());
  //         
// console.log(`🔢 Processing direct cost for matched expense (tenChuan):`, {

  //             expenseId: expense.expenseId || 'N/A',
  //             expenseTenChuan: expenseTenChuan,
  //             softwareName: softwareName,
  //             directMatch: doesExpenseMatchSoftware(expenseTenChuan, softwareName),
  //             amount: amount,
  //             allocation: allocation,
  //             accountingType: accountingType,
  //             expenseDate: isValidExpenseDate ? expenseDate.toISOString().split('T')[0] : 'Invalid Date',
  //             isValidExpenseDate: isValidExpenseDate,
  //             rangeStart: rangeStart ? rangeStart.toISOString().split('T')[0] : 'No start',
  //             rangeEnd: rangeEnd ? rangeEnd.toISOString().split('T')[0] : 'No end',
  //             expenseInRange: rangeStart && rangeEnd && isValidExpenseDate && expenseDate >= rangeStart && expenseDate <= rangeEnd
  //         });
  //         
  //         // Chi phí không phân bổ: Phân bổ = "Không" và Loại kế toán = "COGS" hoặc "OPEX" và Ngày chi trong chu kỳ
  //         if (allocation === 'không' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
  //             // Chỉ tính chi phí không phân bổ nếu ngày chi nằm trong chu kỳ
  //             if (rangeStart && rangeEnd && isValidExpenseDate && expenseDate >= rangeStart && expenseDate <= rangeEnd) {
  //                 directCosts += amount;
  //                 
// console.log(`💰 Added direct cost:`, {

  //                     amount: amount,
  //                     expenseDate: expenseDate.toISOString().split('T')[0],
  //                     rangeStart: rangeStart.toISOString().split('T')[0],
  //                     rangeEnd: rangeEnd.toISOString().split('T')[0],
  //                     runningTotal: directCosts
  //                 });
  //             }
  //         }
  //         
  //         processedCount++;
  //     });
  //     
// console.log(`💰 SOFTWARE DIRECT COSTS FINAL RESULT for ${softwareName}:`, {
  //         directCosts: directCosts,
  //         totalExpenses: expenses.length,
  //         processedExpenses: processedCount,
  //         matchedExpenses: matchedCount,
  //         dateRange: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'No date range'
  //     });
  //     
  //     return directCosts;
  // }
  // 
/**
  //  * Format currency with zero handling
  //  */
  // function formatCurrencyForTable(amount) {
  //     if (amount === 0 || amount === null || amount === undefined) {
  //         return '<span class="zero-value">-</span>';
  //     }
  //     return formatRevenue(amount);
  // }
  // 
/**
  //  * Get profit status class and label
  //  */
  // function getProfitStatus(profitMargin) {
  //     if (profitMargin >= 30) return { class: 'excellent', label: 'Xuất sắc' };
    if (profitMargin >= 20) return { class: 'high', label: 'Cao' };
    if (profitMargin >= 10) return { class: 'medium', label: 'Trung bình' };
    if (profitMargin >= 0) return { class: 'low', label: 'Thấp' };
    return { class: 'negative', label: 'Thua lỗ' };
}

/**
 * Update software profit table
 */
function updateSoftwareProfitTable(softwareProfitData) {
    const tableBody = document.getElementById('software-profit-table-body');
    if (!tableBody) return;
    
    if (softwareProfitData.length === 0) {
        tableBody.innerHTML = `
            <tr class="no-data-row">
                <td colspan="7" class="no-data-cell">
                    <div class="no-data-message">
                        <i class="fas fa-info-circle"></i>
                        <span>Không có dữ liệu phần mềm trong kỳ được chọn</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const rows = softwareProfitData.map((item, index) => {
        const profitClass = item.grossProfit >= 0 ? 'positive' : 'negative';
        const profitStatus = getProfitStatus(item.profitMargin);
        const hasRevenue = item.totalRevenue > 0;
        const hasRefunds = item.refunds > 0;
        const hasDirectCosts = item.directCosts > 0;
        const hasAllocatedCosts = item.allocatedCosts > 0;
        
        return `
            <tr class="software-row ${hasRevenue ? 'has-revenue' : 'no-revenue'}" data-software="${item.softwareName}">
                <td class="software-name-cell">
                    <div class="software-info">
                        <div class="software-rank">${index + 1}</div>
                        <div class="software-details">
                            <span class="software-title">${item.softwareName}</span>
                            <div class="software-status ${profitStatus.class}">
                                <i class="fas fa-circle status-indicator"></i>
                                <span class="status-text">${profitStatus.label}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="revenue-cell ${hasRevenue ? 'has-value' : 'empty-value'}">
                    <div class="value-container">
                        <span class="primary-value">${formatCurrencyForTable(item.totalRevenue)}</span>
                        ${item.grossRevenue !== item.totalRevenue ? `
                            <div class="value-breakdown">
                                <small class="breakdown-label">Gộp: ${formatCurrencyForTable(item.grossRevenue)}</small>
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td class="refund-cell ${hasRefunds ? 'has-value negative' : 'empty-value'}">
                    <div class="value-container">
                        <span class="primary-value">${formatCurrencyForTable(item.refunds)}</span>
                    </div>
                </td>
                <td class="direct-cost-cell ${hasDirectCosts ? 'has-value cost' : 'empty-value'}">
                    <div class="value-container">
                        <span class="primary-value">${formatCurrencyForTable(item.directCosts)}</span>
                    </div>
                </td>
                <td class="allocated-cost-cell ${hasAllocatedCosts ? 'has-value cost' : 'empty-value'}">
                    <div class="value-container">
                        <span class="primary-value">${formatCurrencyForTable(item.allocatedCosts)}</span>
                    </div>
                </td>
                <td class="profit-cell ${profitClass}">
                    <div class="value-container">
                        <span class="primary-value profit-amount">${formatCurrencyForTable(item.grossProfit)}</span>
                        ${item.grossProfit !== 0 ? `
                            <div class="profit-indicator">
                                <i class="fas ${item.grossProfit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td class="margin-cell ${profitStatus.class}">
                    <div class="margin-container">
                        <span class="margin-percent">${item.profitMargin.toFixed(1)}%</span>
                        <div class="margin-bar">
                            <div class="margin-fill ${profitStatus.class}" 
                                 style="width: ${Math.min(100, Math.max(0, Math.abs(item.profitMargin)))}%">
                            </div>
                        </div>
                        <div class="margin-status ${profitStatus.class}">
                            ${profitStatus.label}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Setup table interaction
    setupSoftwareProfitTableHandlers();
}

/**
 * Update software profit summary
 */
function updateSoftwareProfitSummary(softwareProfitData) {
    const totalCount = softwareProfitData.length;
    const totalRevenue = softwareProfitData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalDirectCosts = softwareProfitData.reduce((sum, item) => sum + item.directCosts, 0);
    const totalAllocatedCosts = softwareProfitData.reduce((sum, item) => sum + item.allocatedCosts, 0);
    const totalCosts = softwareProfitData.reduce((sum, item) => sum + item.totalCosts, 0);
    const totalProfit = softwareProfitData.reduce((sum, item) => sum + item.grossProfit, 0);
    const averageMargin = totalCount > 0 ? 
        softwareProfitData.reduce((sum, item) => sum + item.profitMargin, 0) / totalCount : 0;
    
    // Helper function to format summary values
    const formatSummaryValue = (amount) => {
        return amount === 0 ? '-' : formatRevenue(amount);
    };
    
    updateKPIElement('total-software-count', totalCount.toString());
    updateKPIElement('total-software-revenue', formatSummaryValue(totalRevenue));
    updateKPIElement('total-software-direct-cost', formatSummaryValue(totalDirectCosts));
    updateKPIElement('total-software-cost', formatSummaryValue(totalAllocatedCosts));
    updateKPIElement('total-software-profit', formatSummaryValue(totalProfit));
    updateKPIElement('average-profit-margin', averageMargin === 0 ? '-' : `${averageMargin.toFixed(1)}%`);
}

/**
 * Setup software profit table handlers
 */
function setupSoftwareProfitTableHandlers() {
    // Search functionality
    const searchInput = document.getElementById('software-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterSoftwareProfitTable(e.target.value);
        });
    }
    
    // Sort functionality
    const sortIcons = document.querySelectorAll('.software-profit-table .sort-icon');
    sortIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            const sortBy = e.target.dataset.sort;
            sortSoftwareProfitTable(sortBy);
        });
    });
}

/**
 * Filter software profit table
 */
function filterSoftwareProfitTable(searchTerm) {
    const rows = document.querySelectorAll('.software-row');
    const term = searchTerm.toLowerCase().trim();
    
    rows.forEach(row => {
        const softwareName = row.dataset.software.toLowerCase();
        const isVisible = !term || softwareName.includes(term);
        row.style.display = isVisible ? '' : 'none';
    });
}

/**
 * Sort software profit table
 */
function sortSoftwareProfitTable(sortBy) {
    // console.log(`🔄 Sorting software profit table by: ${sortBy}`);
    // Implementation for table sorting
}

/**
 * Helper function to update overview cards
 */
function updateOverviewCard(valueId, value, change, isNegative = false) {
    updateKPIElement(valueId, value);
    
    const changeId = valueId + '-change';
    const changeElement = document.getElementById(changeId);
    if (changeElement && typeof change === 'number') {
        const isPositive = isNegative ? change <= 0 : change >= 0;
        changeElement.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
    }
}

// Global functions for template usage
window.refreshSoftwareProfitData = function() {
    loadProfitAnalysis();
};

window.exportSoftwareProfitReport = function() {
    // console.log('📊 Exporting software profit report...');
    // Implementation for export functionality
};

// Make functions available globally
window.loadProfitAnalysis = loadProfitAnalysis;