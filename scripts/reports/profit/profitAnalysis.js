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
    console.log('💰 Loading profit analysis report', options);
    
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
        
        console.log('📊 Profit analysis data:', {
            transactions: transactions.length,
            expenses: expenses.length
        });
        
        // Get date range from options or global filters
        const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
        const period = options.period || window.globalFilters?.period || 'this_month';
        
        // Filter data by date range
        const filteredTransactions = filterDataByDateRange(transactions, dateRange);
        const filteredExpenses = filterExpensesByDateRange(expenses, dateRange);
        
        // Load all components
        await Promise.all([
            updateProfitOverviewGrid(filteredTransactions, filteredExpenses, period, dateRange),
            updateProfitKPIs(filteredTransactions, filteredExpenses, period, dateRange),
            loadProfitAnalysisData(filteredTransactions, filteredExpenses, dateRange),
            loadSoftwareProfitAnalysis(filteredTransactions, filteredExpenses, dateRange),
            renderProfitTrendChart(filteredTransactions, filteredExpenses, period),
            renderProfitBreakdownChart(filteredTransactions, filteredExpenses, dateRange),
            updateProfitInsights(filteredTransactions, filteredExpenses)
        ]);
        
        // Setup tooltips and event handlers
        setupProfitTooltips();
        setupProfitAnalysisHandlers();
        
        console.log('✅ Profit analysis report loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading profit analysis report:', error);
        showError('Không thể tải phân tích lợi nhuận');
    }
}

/**
 * Load the profit analysis HTML template
 */
async function loadProfitAnalysisHTML() {
    const container = document.getElementById('report-profit');
    if (!container) return;
    
    try {
        const response = await fetch('./partials/tabs/report-pages/profit-analysis.html');
        if (!response.ok) {
            throw new Error('Template not found');
        }
        
        const html = await response.text();
        container.innerHTML = html;
        container.classList.add('active');
        
        console.log('✅ Profit analysis template loaded');
        
    } catch (error) {
        console.error('❌ Could not load profit analysis template:', error);
        throw error;
    }
}

/**
 * Update profit KPI cards
 */
async function updateProfitKPIs(transactions, expenses, period, dateRange) {
    console.log('💰 Updating profit KPIs');
    
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
    
    // Update KPI values
    updateKPIElement('gross-profit-value', formatRevenue(profitMetrics.grossProfit));
    updateKPIElement('net-profit-value', formatRevenue(profitMetrics.netProfit));
    updateKPIElement('profit-margin-kpi', `${profitMetrics.profitMargin.toFixed(1)}%`);
    
    // Calculate and update changes
    const grossProfitChange = calculatePercentageChange(
        previousProfitMetrics.grossProfit, 
        profitMetrics.grossProfit
    );
    const netProfitChange = calculatePercentageChange(
        previousProfitMetrics.netProfit, 
        profitMetrics.netProfit
    );
    
    updateChangeElement('gross-profit-change', grossProfitChange);
    updateChangeElement('net-profit-change', netProfitChange);
    
    // Update business efficiency
    const efficiency = calculateBusinessEfficiency(profitMetrics);
    updateKPIElement('business-efficiency', efficiency.label);
    updateKPIElement('efficiency-detail', efficiency.description);
    
    console.log('💰 Profit KPIs updated:', profitMetrics);
}

/**
 * Load profit analysis data into the table
 */
async function loadProfitAnalysisData(transactions, expenses, dateRange) {
    console.log('💰 Loading profit analysis data for table');
    
    try {
        // Calculate metrics
        const revenueMetrics = calculateRevenueMetrics(transactions);
        const expenseMetrics = calculateExpenseMetrics(expenses, dateRange);
        const profitMetrics = calculateProfitMetrics(revenueMetrics, expenseMetrics);
        
        // Update table
        updateProfitTableValues(profitMetrics);
        updateProfitSummaryCards(profitMetrics);
        
        console.log('💰 Profit analysis data loaded:', profitMetrics);
        
    } catch (error) {
        console.error('❌ Error loading profit analysis data:', error);
    }
}

/**
 * Calculate revenue metrics from transactions
 */
function calculateRevenueMetrics(transactions) {
    let grossRevenue = 0;
    let refundAmount = 0;
    let validTransactionCount = 0;
    
    transactions.forEach(rawTransaction => {
        const t = normalizeTransaction(rawTransaction);
        if (!t) return;
        
        const status = (t.transactionType || t.loaiGiaoDich || '').toLowerCase().trim();
        const amount = t.revenue || 0;
        
        if (status === 'đã hoàn tất' || status === 'đã thanh toán') {
            grossRevenue += amount;
            validTransactionCount++;
        } else if (status === 'hoàn tiền') {
            refundAmount += Math.abs(amount);
        }
    });
    
    const totalRevenue = grossRevenue - refundAmount;
    
    return {
        totalRevenue,
        grossRevenue,
        refundAmount,
        transactionCount: validTransactionCount
    };
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
        
        // Chi phí không phân bổ: Phân bổ = "Không" và Loại kế toán = "COGS" hoặc "OPEX"
        if (allocation === 'không' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
            directCosts += amount;
        } 
        // Chi phí phân bổ: Loại kế toán = "OPEX" hoặc "COGS", Phân bổ = "Có", Ngày tái tục >= Ngày bắt đầu chu kỳ
        else if (allocation === 'có' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
            if (rangeStart && rangeEnd && renewalDate >= rangeStart && !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime())) {
                
                // Tính số ngày từ ngày chi đến ngày tái tục
                const totalDays = Math.ceil((renewalDate - expenseDate) / (1000 * 60 * 60 * 24));
                
                // Tính số ngày trong chu kỳ báo cáo (từ đầu đến cuối tháng)
                const periodDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
                
                let allocatedAmount = 0;
                
                // Nếu ngày tái tục < ngày cuối chu kỳ
                if (renewalDate < rangeEnd) {
                    // Số ngày từ đầu chu kỳ đến ngày tái tục
                    const daysToRenewal = Math.ceil((renewalDate - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
                    
                    // Ngày hiện tại (giả sử là ngày cuối chu kỳ để tính đầy đủ)
                    const today = new Date();
                    const daysToToday = Math.ceil((today - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
                    
                    // Lấy Min(ngày tái tục - đầu chu kỳ, ngày hiện tại - đầu chu kỳ)
                    const effectiveDays = Math.min(daysToRenewal, daysToToday);
                    
                    // Công thức: số tiền * effectiveDays / totalDays
                    allocatedAmount = amount * effectiveDays / totalDays;
                    
                    console.log(`📊 Renewal < End Date calculation:`, {
                        renewalDate: renewalDate.toISOString().split('T')[0],
                        rangeEnd: rangeEnd.toISOString().split('T')[0],
                        daysToRenewal: daysToRenewal,
                        daysToToday: daysToToday,
                        effectiveDays: effectiveDays,
                        formula: `${amount} * ${effectiveDays} / ${totalDays} = ${allocatedAmount.toFixed(2)}`
                    });
                } 
                // Nếu ngày tái tục >= ngày cuối chu kỳ
                else {
                    // Công thức: số tiền * periodDays / totalDays
                    allocatedAmount = amount * periodDays / totalDays;
                    
                    console.log(`📊 Renewal >= End Date calculation:`, {
                        renewalDate: renewalDate.toISOString().split('T')[0],
                        rangeEnd: rangeEnd.toISOString().split('T')[0],
                        periodDays: periodDays,
                        formula: `${amount} * ${periodDays} / ${totalDays} = ${allocatedAmount.toFixed(2)}`
                    });
                }
                
                allocatedCosts += allocatedAmount;
                
                console.log(`📊 Final allocated cost summary:`, {
                    expenseId: expense.expenseId || 'N/A',
                    product: expense.product || 'N/A',
                    amount: amount,
                    expenseDate: expenseDate.toISOString().split('T')[0],
                    renewalDate: renewalDate.toISOString().split('T')[0],
                    rangeStart: rangeStart.toISOString().split('T')[0],
                    rangeEnd: rangeEnd.toISOString().split('T')[0],
                    totalDays: totalDays,
                    periodDays: periodDays,
                    isRenewalBeforeEnd: renewalDate < rangeEnd,
                    allocatedAmount: allocatedAmount.toFixed(2)
                });
            }
        }
    });
    
    console.log(`💰 Expense metrics calculated:`, {
        allocatedCosts: allocatedCosts,
        directCosts: directCosts,
        totalExpenses: expenses.length
    });
    
    return {
        allocatedCosts,
        directCosts,
        totalCosts: allocatedCosts + directCosts
    };
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
    console.log('📈 Rendering profit trend chart');
    
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
    console.log('🍰 Rendering profit breakdown chart');
    
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
    console.log('💡 Updating profit insights');
    
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
        console.warn('❌ Profit tooltip container not found');
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
        console.warn(`❌ Element not found: ${elementId}`);
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
        category: rawExpense.danhMucChung || rawExpense.category || ''
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
    console.log(`🔄 Refreshing profit chart for period: ${period}`);
    // Implementation for chart refresh
}

// Global functions for template usage
window.refreshProfitAnalysis = function() {
    loadProfitAnalysis();
};

window.exportProfitReport = function() {
    console.log('📊 Exporting profit report...');
    // Implementation for export functionality
};

window.toggleChartView = function(chartType, viewType) {
    console.log(`🔄 Toggling ${chartType} chart to ${viewType} view`);
};

/**
 * Update the profit overview grid (6 KPI cards)
 */
async function updateProfitOverviewGrid(transactions, expenses, period, dateRange) {
    console.log('💰 Updating profit overview grid');
    
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
    
    console.log('💰 Profit overview grid updated');
}

/**
 * Load software profit analysis table
 */
async function loadSoftwareProfitAnalysis(transactions, expenses, dateRange) {
    console.log('💻 Loading software profit analysis');
    
    try {
        // Get software profit data
        const softwareProfitData = await calculateSoftwareProfitMetrics(transactions, expenses, dateRange);
        
        // Update table
        updateSoftwareProfitTable(softwareProfitData);
        
        // Update summary
        updateSoftwareProfitSummary(softwareProfitData);
        
        console.log('💻 Software profit analysis loaded:', softwareProfitData.length, 'software items');
        
    } catch (error) {
        console.error('❌ Error loading software profit analysis:', error);
    }
}

/**
 * Calculate profit metrics for each software
 */
async function calculateSoftwareProfitMetrics(transactions, expenses, dateRange) {
    console.log('🔢 Calculating software profit metrics');
    
    // Get unique software names from expenses (Tên chuẩn column - column R)
    const softwareNames = getSoftwareNamesFromExpenses(expenses, dateRange);
    console.log('📋 Found software names:', softwareNames);
    
    const softwareProfitData = [];
    
    for (const softwareName of softwareNames) {
        // Calculate revenue for this software from transactions
        const softwareRevenue = calculateSoftwareRevenue(transactions, softwareName);
        
        // Calculate refunds for this software
        const softwareRefunds = calculateSoftwareRefunds(transactions, softwareName);
        
        // Calculate allocated costs for this software
        const allocatedCosts = calculateSoftwareAllocatedCosts(expenses, softwareName, dateRange);
        
        // Calculate gross profit = revenue - allocated costs
        const grossProfit = softwareRevenue.netRevenue - allocatedCosts;
        
        // Calculate profit margin = (gross profit / net revenue) * 100
        const profitMargin = softwareRevenue.netRevenue > 0 ? (grossProfit / softwareRevenue.netRevenue) * 100 : 0;
        
        softwareProfitData.push({
            softwareName,
            totalRevenue: softwareRevenue.netRevenue,
            grossRevenue: softwareRevenue.grossRevenue,
            refunds: softwareRefunds,
            allocatedCosts,
            grossProfit,
            profitMargin
        });
    }
    
    // Sort by gross profit descending
    softwareProfitData.sort((a, b) => b.grossProfit - a.grossProfit);
    
    return softwareProfitData;
}

/**
 * Get unique software names from expenses that meet criteria
 */
function getSoftwareNamesFromExpenses(expenses, dateRange) {
    const softwareNames = new Set();
    
    expenses.forEach(expense => {
        const expenseDate = normalizeDate(expense.ngayChi || expense.date || '');
        const expenseType = (expense.type || expense.loaiKhoanChi || expense.expenseType || '').trim();
        const softwareName = (expense.product || expense.tenChuan || expense.standardName || '').trim();
        const allocation = (expense.periodicAllocation || expense.phanBo || expense.allocation || '').toLowerCase().trim();
        const renewalDate = normalizeDate(expense.ngayTaiTuc || expense.renewalDate || '');
        
        // Check criteria: "Kinh doanh phần mềm" expense type
        if (expenseType === 'Kinh doanh phần mềm' && softwareName) {
            // Check if expense date is in selected period OR (allocation = "Có" AND renewal date > period start)
            const isInPeriod = dateRange && expenseDate >= dateRange.start && expenseDate <= dateRange.end;
            const isAllocatedAndActiveInPeriod = allocation === 'có' && dateRange && renewalDate > dateRange.start;
            
            if (isInPeriod || isAllocatedAndActiveInPeriod) {
                softwareNames.add(softwareName);
            }
        }
    });
    
    return Array.from(softwareNames).sort();
}

/**
 * Calculate revenue for a specific software
 */
function calculateSoftwareRevenue(transactions, softwareName) {
    let grossRevenue = 0;
    let refunds = 0;
    
    transactions.forEach(transaction => {
        const transactionSoftware = transaction.tenPhanMem || transaction.softwareName || '';
        const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
        const amount = parseFloat(transaction.doanhThu || transaction.revenue || 0);
        
        if (transactionSoftware === softwareName) {
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
        const transactionSoftware = transaction.tenPhanMem || transaction.softwareName || '';
        const status = (transaction.loaiGiaoDich || transaction.transactionType || '').toLowerCase().trim();
        const amount = parseFloat(transaction.doanhThu || transaction.revenue || 0);
        
        if (transactionSoftware === softwareName && status === 'hoàn tiền') {
            refunds += Math.abs(amount);
        }
    });
    
    return refunds;
}

/**
 * Calculate allocated costs for a specific software
 */
function calculateSoftwareAllocatedCosts(expenses, softwareName, dateRange) {
    let totalAllocatedCosts = 0;
    
    expenses.forEach(expense => {
        const expenseSoftware = (expense.product || expense.tenChuan || expense.standardName || '').trim();
        const expenseType = (expense.type || expense.loaiKhoanChi || expense.expenseType || '').trim();
        
        if (expenseSoftware === softwareName && expenseType === 'Kinh doanh phần mềm') {
            const expenseDate = normalizeDate(expense.ngayChi || expense.date || '');
            const allocation = (expense.periodicAllocation || expense.phanBo || expense.allocation || '').toLowerCase().trim();
            const accountingType = (expense.accountingType || expense.loaiKeToan || '').trim();
            const amount = parseFloat(expense.soTien || expense.amount || 0);
            const renewalDate = normalizeDate(expense.ngayTaiTuc || expense.renewalDate || '');
            
            // Check if expense date is in selected period
            const isInPeriod = dateRange && expenseDate >= dateRange.start && expenseDate <= dateRange.end;
            
            if (isInPeriod) {
                if (allocation === 'không' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
                    // Direct cost - add full amount only if accounting type is COGS or OPEX
                    totalAllocatedCosts += amount;
                } else if (allocation === 'có') {
                    // Allocated cost - check if renewal date > period start
                    if (renewalDate > dateRange.start) {
                        // Calculate allocated portion
                        const totalDays = Math.ceil((renewalDate - expenseDate) / (1000 * 60 * 60 * 24));
                        const periodDays = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1;
                        const allocatedAmount = (amount / totalDays) * periodDays;
                        totalAllocatedCosts += allocatedAmount;
                    }
                }
            } else if (allocation === 'có' && renewalDate > dateRange.start) {
                // Expense outside period but allocated and still active
                const totalDays = Math.ceil((renewalDate - expenseDate) / (1000 * 60 * 60 * 24));
                const periodDays = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1;
                const allocatedAmount = (amount / totalDays) * periodDays;
                totalAllocatedCosts += allocatedAmount;
            }
        }
    });
    
    return totalAllocatedCosts;
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
                <td colspan="6" class="no-data-cell">
                    <div class="no-data-message">
                        <i class="fas fa-info-circle"></i>
                        <span>Không có dữ liệu phần mềm trong kỳ được chọn</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const rows = softwareProfitData.map(item => {
        const profitClass = item.grossProfit >= 0 ? 'positive' : 'negative';
        const marginClass = item.profitMargin >= 20 ? 'high' : item.profitMargin >= 10 ? 'medium' : 'low';
        
        return `
            <tr class="software-row" data-software="${item.softwareName}">
                <td class="software-name">
                    <div class="software-info">
                        <span class="software-title">${item.softwareName}</span>
                    </div>
                </td>
                <td class="revenue-value">
                    <span class="value-amount">${formatRevenue(item.totalRevenue)}</span>
                    <div class="value-breakdown">
                        <small>Gộp: ${formatRevenue(item.grossRevenue)}</small>
                    </div>
                </td>
                <td class="refund-value">
                    <span class="value-amount negative">${formatRevenue(item.refunds)}</span>
                </td>
                <td class="cost-value">
                    <span class="value-amount">${formatRevenue(item.allocatedCosts)}</span>
                </td>
                <td class="profit-value ${profitClass}">
                    <span class="value-amount">${formatRevenue(item.grossProfit)}</span>
                </td>
                <td class="margin-value ${marginClass}">
                    <span class="margin-percent">${item.profitMargin.toFixed(1)}%</span>
                    <div class="margin-indicator">
                        <div class="indicator-bar">
                            <div class="indicator-fill" style="width: ${Math.min(100, Math.max(0, item.profitMargin))}%"></div>
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
    const totalCosts = softwareProfitData.reduce((sum, item) => sum + item.allocatedCosts, 0);
    const totalProfit = softwareProfitData.reduce((sum, item) => sum + item.grossProfit, 0);
    const averageMargin = totalCount > 0 ? 
        softwareProfitData.reduce((sum, item) => sum + item.profitMargin, 0) / totalCount : 0;
    
    updateKPIElement('total-software-count', totalCount.toString());
    updateKPIElement('total-software-revenue', formatRevenue(totalRevenue));
    updateKPIElement('total-software-cost', formatRevenue(totalCosts));
    updateKPIElement('total-software-profit', formatRevenue(totalProfit));
    updateKPIElement('average-profit-margin', `${averageMargin.toFixed(1)}%`);
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
    console.log(`🔄 Sorting software profit table by: ${sortBy}`);
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
    console.log('📊 Exporting software profit report...');
    // Implementation for export functionality
};

// Make functions available globally
window.loadProfitAnalysis = loadProfitAnalysis;