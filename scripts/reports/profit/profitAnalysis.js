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
            updateProfitKPIs(filteredTransactions, filteredExpenses, period),
            loadProfitAnalysisData(filteredTransactions, filteredExpenses, dateRange),
            renderProfitTrendChart(filteredTransactions, filteredExpenses, period),
            renderProfitBreakdownChart(filteredTransactions, filteredExpenses),
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
async function updateProfitKPIs(transactions, expenses, period) {
    console.log('💰 Updating profit KPIs');
    
    // Calculate current period metrics
    const revenueMetrics = calculateRevenueMetrics(transactions);
    const expenseMetrics = calculateExpenseMetrics(expenses);
    const profitMetrics = calculateProfitMetrics(revenueMetrics, expenseMetrics);
    
    // Calculate previous period for comparison
    const previousTransactions = getPreviousPeriodTransactions(transactions, period);
    const previousExpenses = getPreviousPeriodExpenses(expenses, period);
    const previousRevenueMetrics = calculateRevenueMetrics(previousTransactions);
    const previousExpenseMetrics = calculateExpenseMetrics(previousExpenses);
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
        const expenseMetrics = calculateExpenseMetrics(expenses);
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
 * Calculate expense metrics from filtered expenses
 */
function calculateExpenseMetrics(expenses) {
    let allocatedCosts = 0;
    let directCosts = 0;
    
    expenses.forEach(rawExpense => {
        const expense = normalizeExpense(rawExpense);
        if (!expense) return;
        
        const amount = expense.amount || 0;
        const isAllocated = (expense.allocation || expense.phanBo || '').toLowerCase().trim() === 'có';
        
        if (isAllocated) {
            allocatedCosts += amount;
        } else {
            directCosts += amount;
        }
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
async function renderProfitBreakdownChart(transactions, expenses) {
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
    const expenseMetrics = calculateExpenseMetrics(expenses);
    
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
        amount: parseFloat(rawExpense.soTien || rawExpense.amount || 0),
        allocation: rawExpense.phanBo || rawExpense.allocation || '',
        date: rawExpense.ngayChi || rawExpense.date || '',
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

// Make functions available globally
window.loadProfitAnalysis = loadProfitAnalysis;