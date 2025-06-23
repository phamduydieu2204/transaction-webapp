/**
 * Financial Management Report Loader
 * Handles initialization and UI management for financial reporting
 */
        };
    }

    /**
     * Initialize the financial management module
     */
    async initialize() {
        try {
            
            this.core = new FinancialCore();
            this.charts = new FinancialCharts();
            
            await this.loadData();
            this.setupEventListeners();
            this.renderDashboard();
            
            this.isInitialized = true;
  } catch (error) {
            console.error('❌ Failed to initialize Financial Management:', error);
            this.showError('Không thể khởi tạo module quản lý tài chính');
        }
    }

    /**
     * Load financial data
     */
    async loadData() {
        try {
            this.showLoading(true);
            
            await this.core.loadData();
            console.log('Financial data loaded successfully');
  } catch (error) {
            console.error('Error loading financial data:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Setup event listeners for financial management
     */
    setupEventListeners() {
        // Period selector
        document.addEventListener('change', (e) => {
            if (e.target.id === 'financial-period-selector') {
                this.currentPeriod = e.target.value;
                this.updateDashboard();
            }
        });

        // Date range filter
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('financial-date-input')) {
                this.updateDateFilter();
            }
        });

        // Account type filters
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('account-type-checkbox')) {
                this.updateAccountTypeFilter();
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-financial-btn')) {
                const format = e.target.dataset.format;
                this.exportData(format);
            }
        });

        // Refresh button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refresh-financial-data') {
                this.refreshData();
            }
        });

        // Chart interaction
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-toggle-btn')) {
                this.toggleChartVisibility(e.target.dataset.chart);
            }
        });
    }

    /**
     * Render the complete financial dashboard
     */
    renderDashboard() {
        try {
            console.log('Rendering financial dashboard...');
            
            this.renderKPICards();
            this.renderFinancialCharts();
            this.renderAccountsTable();
            this.renderProfitLossStatement();
            this.renderBudgetPlanning();
  } catch (error) {
            console.error('Error rendering financial dashboard:', error);
            this.showError('Không thể hiển thị dashboard tài chính');
        }
    }

    /**
     * Render KPI cards
     */
    renderKPICards() {
        const kpiContainer = document.querySelector('.financial-kpi-dashboard');
        if (!kpiContainer) return;

        const metrics = this.core.calculateFinancialMetrics();
        
        const kpiHTML = `
            <div class="kpi-card revenue-card">
                <div class="kpi-icon">💰</div>
                <div class="kpi-content">
                    <h3>Tổng Doanh Thu</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.totalRevenue)}</div>
                    <div class="kpi-change ${metrics.revenueGrowth >= 0 ? 'positive' : 'negative'}">
                        ${metrics.revenueGrowth >= 0 ? '↗' : '↘'} ${Math.abs(metrics.revenueGrowth).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="kpi-card expense-card">
                <div class="kpi-icon">💸</div>
                <div class="kpi-content">
                    <h3>Tổng Chi Phí</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.totalExpenses)}</div>
                    <div class="kpi-change ${metrics.expenseGrowth <= 0 ? 'positive' : 'negative'}">
                        ${metrics.expenseGrowth >= 0 ? '↗' : '↘'} ${Math.abs(metrics.expenseGrowth).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="kpi-card profit-card">
                <div class="kpi-icon">📊</div>
                <div class="kpi-content">
                    <h3>Lợi Nhuận Ròng</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.netProfit)}</div>
                    <div class="kpi-change ${metrics.profitMargin >= 0 ? 'positive' : 'negative'}">
                        Tỷ suất: ${metrics.profitMargin.toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="kpi-card cashflow-card">
                <div class="kpi-icon">🔄</div>
                <div class="kpi-content">
                    <h3>Dòng Tiền</h3>
                    <div class="kpi-value">${this.formatCurrency(metrics.cashFlow)}</div>
                    <div class="kpi-change">
                        Runway: ${metrics.cashRunway} tháng
                    </div>
                </div>
            </div>
        `;
            tableHTML += `
                <tr>
                    <td>${account.name}</td>
                    <td>${account.type}</td>
                    <td>${this.formatCurrency(account.balance)}</td>
                    <td class="${changeClass}">
                        ${account.change >= 0 ? '+' : ''}${this.formatCurrency(account.change)}
                    </td>
                    <td><span class="status ${statusClass}">${account.status}</span></td>
                </tr>
            `;
        });
            const progressPercentage = Math.min((item.actual / item.budget) * 100, 100);
            
            budgetHTML += `
                <div class="budget-item">
                    <div class="budget-header">
                        <span class="budget-category">${item.category}</span>
                        <span class="budget-variance ${varianceClass}">
                            ${item.variance >= 0 ? '+' : ''}${this.formatCurrency(item.variance)}
                        </span>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="budget-amounts">
                            <span>Thực tế: ${this.formatCurrency(item.actual)}</span>
                            <span>Ngân sách: ${this.formatCurrency(item.budget)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        budgetHTML += '</div>';
        container.innerHTML = budgetHTML;
    }

    /**
     * Update dashboard based on current filters
     */
    updateDashboard() {
        if (!this.isInitialized) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            this.renderDashboard();
            this.showLoading(false);
        }, 500);
    }

    /**
     * Update date filter
     */
    updateDateFilter() {
        const startDate = document.querySelector('#financial-start-date')?.value;
        const endDate = document.querySelector('#financial-end-date')?.value;
        
        if (startDate && endDate) {
            this.filters.dateRange = { startDate, endDate };
            this.updateDashboard();
        }
    }

    /**
     * Update account type filter
     */
    updateAccountTypeFilter() {
        const checkboxes = document.querySelectorAll('.account-type-checkbox:checked');
        this.filters.accountTypes = Array.from(checkboxes).map(cb => cb.value);
        this.updateDashboard();
    }

    /**
     * Export financial data
     */
    exportData(format) {
        try {
            const data = this.core.getExportData();
            
            if (format === 'csv') {
                this.exportToCSV(data);
            } else if (format === 'excel') {
                this.exportToExcel(data);
            }
            
            this.showSuccess(`Xuất dữ liệu ${format.toUpperCase()} thành công`);
  } catch (error) {
            console.error('Export error:', error);
            this.showError('Không thể xuất dữ liệu');
        }
    }

    /**
     * Export to CSV
     */
    exportToCSV(data) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        }
    }

    /**
     * Refresh financial data
     */
    async refreshData() {
        try {
            this.showLoading(true);
            await this.loadData();
            this.renderDashboard();
            this.showSuccess('Đã cập nhật dữ liệu tài chính');
  } catch (error) {
            console.error('Refresh error:', error);
  });

        }).format(amount);
    }

    /**
     * Show loading state
     */
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Integration with existing modal system
        if (window.showResultModalModern) {
            window.showResultModalModern(message, 'success');
        } else {
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Integration with existing modal system
        if (window.showResultModalModern) {
            window.showResultModalModern(message, 'error');
        } else {
            console.error('❌', message);
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        if (this.charts) {
            this.charts.destroy();
        }
        this.isInitialized = false;
        console.log('Financial Management destroyed');
    }
}

// Global instance for easy access
window.FinancialLoader = FinancialLoader;