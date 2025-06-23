/**
 * Profit Analysis Report Module
 * Handles loading and rendering profit analysis report
 */
        // Get date range from options or global filters
        const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
        const period = options.period || window.globalFilters?.period || 'this_month';
        
        // Filter transactions by date range, but keep ALL expenses for allocation calculation
        const filteredTransactions = filterDataByDateRange(transactions, dateRange);
        // For expenses: keep all data, let calculateExpenseMetrics handle the filtering logic
        // Load all components
        await Promise.all([
            updateProfitOverviewGrid(filteredTransactions, allExpenses, period, dateRange),
            updateProfitKPIs(filteredTransactions, allExpenses, period, dateRange),
            loadProfitAnalysisData(filteredTransactions, allExpenses, dateRange),
            loadSoftwareProfitAnalysis(filteredTransactions, allExpenses, dateRange),
            renderProfitTrendChart(filteredTransactions, allExpenses, period),
            renderProfitBreakdownChart(filteredTransactions, allExpenses, dateRange),
            updateProfitInsights(filteredTransactions, allExpenses)
        ]);
        
        // Setup tooltips and event handlers
        setupProfitTooltips();
        setupProfitAnalysisHandlers();
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
  } catch (error) {
        console.error('❌ Could not load profit analysis template:', error);
        throw error;
    }
}

/**
 * Update profit KPI cards
 */
async function updateProfitKPIs(transactions, expenses, period, dateRange) {
    
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
    
}

/**
 * Load profit analysis data into the table
 */
async function loadProfitAnalysisData(transactions, expenses, dateRange) {
    
    try {
        // Calculate metrics
        const revenueMetrics = calculateRevenueMetrics(transactions);
        const expenseMetrics = calculateExpenseMetrics(expenses, dateRange);
        const profitMetrics = calculateProfitMetrics(revenueMetrics, expenseMetrics);
        
        // Update table
        updateProfitTableValues(profitMetrics);
        updateProfitSummaryCards(profitMetrics);
  } catch (error) {
        console.error('❌ Error loading profit analysis data:', error);
    }
}

/**
 * Calculate revenue metrics from transactions
 */
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
                } 
                // Nếu ngày tái tục >= ngày cuối chu kỳ
                }
            }
        }
    });
    };
}

/**
 * Update profit analysis table values
 */
                {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  });
                },
                {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                }
            ]
        },
                },
                            return `${context.dataset.label}: ${formatRevenue(context.parsed.y)}`;
                        }
                    }
                }
            },
            labels: ['Chi phí phân bổ', 'Chi phí không phân bổ', 'Lợi nhuận ròng'],
                    expenseMetrics.allocatedCosts,
                    expenseMetrics.directCosts,
                    Math.max(0, revenueMetrics.totalRevenue - expenseMetrics.totalCosts)
                ],
                backgroundColor: ['#f59e0b', '#ef4444', '#10b981'],
  });
            }]
        },
                },
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
            description: 'Tổng số tiền thực tế đã thu được từ khách hàng trong kỳ, sau khi trừ đi các khoản hoàn tiền. Đây là chỉ số quan trọng nhất để đánh giá hiệu quả kinh doanh.'
        },
        'refunds': {
        },
        'allocated-cost': {
            description: 'Chi phí được phân bổ theo thời gian, thường là những khoản chi dài hạn như thuê văn phòng, lương nhân viên, phần mềm... Được chia đều cho các tháng trong chu kỳ sử dụng.'
        },
        'direct-cost': {
            description: 'Chi phí phát sinh trực tiếp trong kỳ, không cần phân bổ như chi phí marketing, mua nguyên vật liệu, chi phí vận hành... Thường là những khoản chi một lần hoặc theo từng dự án cụ thể.'
        },
        'gross-profit': {
            description: 'Lợi nhuận sau khi trừ đi chi phí cơ bản, thường dùng để đánh giá hiệu quả hoạt động cốt lõi của doanh nghiệp. Chỉ số này giúp đánh giá khả năng sinh lời từ hoạt động kinh doanh chính.'
        },
        'net-profit': {
        },
        'profit-margin': {
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
    }
}
    }
}
        tenChuan: rawExpense.tenChuan || rawExpense.standardName || '',  // standardName is used in getExpenseStats
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
        },
        },
        },
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
    // Implementation for chart refresh
}

// Global functions for template usage
window.refreshProfitAnalysis = function() {
    loadProfitAnalysis();
};

window.exportProfitReport = function() {
    // Implementation for export functionality
};

window.toggleChartView = function(chartType, viewType) {
};

/**
 * Update the profit overview grid (6 KPI cards)
 */
async function updateProfitOverviewGrid(transactions, expenses, period, dateRange) {
    
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
    
}

/**
 * Load software profit analysis table
 */
async function loadSoftwareProfitAnalysis(transactions, expenses, dateRange) {
    
    try {
        // Get software profit data
        const softwareProfitData = await calculateSoftwareProfitMetrics(transactions, expenses, dateRange);
        
        // Update table
        updateSoftwareProfitTable(softwareProfitData);
        
        // Update summary
        updateSoftwareProfitSummary(softwareProfitData);
  } catch (error) {
        console.error('❌ Error loading software profit analysis:', error);
    }
}

/**
 * Calculate profit metrics for each software
 */
 * 1. Tên chuẩn trong sheet GiaoDich có doanh thu nằm trong chu kỳ báo cáo
 * 2. Tên chuẩn có chi phí nằm trong chu kỳ báo cáo (sheet ChiPhi)  
 * 3. Tên chuẩn có chi phí phân bổ (Ngày tái tục >= ngày bắt đầu chu kỳ, Phân bổ = "Có", COGS/OPEX)
 */
        }
                // Debug: Show sample raw data
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

    // Nguồn 3: Tên chuẩn có chi phí phân bổ (Ngày tái tục >= ngày bắt đầu chu kỳ, Phân bổ = "Có", COGS/OPEX)
        }
        
        // Kiểm tra chi phí phân bổ: Ngày tái tục >= ngày bắt đầu chu kỳ, Phân bổ = "Có", COGS/OPEX
                // Debug: Show sample raw data
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

    // Tổng hợp kết quả
    const finalList = Array.from(softwareNames).sort();
    console.log(`\n🎯 KẾT QUẢ BƯỚC 1 - Danh sách tên chuẩn duy nhất:`);
    console.log(`   - Từ GiaoDich có doanh thu: ${revenueNames.size} tên chuẩn`);
    console.log(`   - Từ ChiPhi trong chu kỳ: ${directCostNames.size} tên chuẩn`);
    console.log(`   - Từ Chi phí phân bổ: ${allocatedCostNames.size} tên chuẩn`);
    // Log sample expense data to understand structure
            // Check for "Vận hành văn phòng" in all expenses
        }
        
        // Only process if this expense belongs to the current software (direct tenChuan match)
            // Convert dateRange strings to Date objects
            // Apply SAME LOGIC as overview-allocated-cost but filtered by software name
            
            // Chi phí không phân bổ: Phân bổ = "Không" và Loại kế toán = "COGS" hoặc "OPEX" và Ngày chi trong chu kỳ
            if (allocation === 'không' && (accountingType === 'COGS' || accountingType === 'OPEX')) {
                if (rangeStart && rangeEnd && expenseDate >= rangeStart && expenseDate <= rangeEnd) {
                    directCosts += amount;
                }
            }
            // Chi phí phân bổ: Loại kế toán = "OPEX" hoặc "COGS", Phân bổ = "Có", Ngày tái tục >= Ngày bắt đầu chu kỳ
                if (rangeStart && rangeEnd && renewalDate >= rangeStart && !isNaN(expenseDate.getTime()) && !isNaN(renewalDate.getTime())) {
                    
                    // Tính số ngày từ ngày chi đến ngày tái tục
                    const totalDays = Math.ceil((renewalDate - expenseDate) / (1000 * 60 * 60 * 24));
                    
                    // Tính số ngày trong chu kỳ báo cáo
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
                            formula: `${amount} * ${effectiveDays} / ${totalDays}`,
                    } 
                    // Nếu ngày tái tục >= ngày cuối chu kỳ
                            formula: `${amount} * ${periodDays} / ${totalDays}`,
                    }
    // Return only allocated costs (matching the column name in the table)
            directMatch: doesExpenseMatchSoftware(expenseTenChuan, softwareName),
        // Chi phí không phân bổ: Phân bổ = "Không" và Loại kế toán = "COGS" hoặc "OPEX" và Ngày chi trong chu kỳ
            }
        }
    return directCosts;
}

/**
 * Format currency with zero handling
 */
function formatCurrencyForTable(amount) {
    if (amount === 0 || amount === null || amount === undefined) {
        return '<span class="zero-value">-</span>';
    }
    return formatRevenue(amount);
}

/**
 * Get profit status class and label
 */
function getProfitStatus(profitMargin) {
    if (profitMargin >= 30) return { class: 'excellent', label: 'Xuất sắc' };
    if (profitMargin >= 20) return { class: 'high', label: 'Cao' };
    if (profitMargin >= 10) return { class: 'medium', label: 'Trung bình' };
    if (profitMargin >= 0) return { class: 'low', label: 'Thấp' };
    return { class: 'negative', label: 'Thua lỗ' };
}

/**
 * Update software profit table
 */
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
    // Helper function to format summary values
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
    });
}

/**
 * Sort software profit table
 */
        changeElement.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
    }
}

// Global functions for template usage
window.refreshSoftwareProfitData = function() {
    loadProfitAnalysis();
};

window.exportSoftwareProfitReport = function() {
    // Implementation for export functionality
};

// Make functions available globally
window.loadProfitAnalysis = loadProfitAnalysis;