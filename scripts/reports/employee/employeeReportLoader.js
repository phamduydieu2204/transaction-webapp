/**
 * Employee Report Loader Module
 * Initializes and manages the employee report functionality
 */
        };
        this.exportManager = new EmployeeExport();
    }

    /**
     * Initialize the employee report
     */
    async init() {
        try {
            console.log('[Employee Report] Initializing...');
            
            // Initialize core module
            this.employeeCore = new EmployeeReportCore();
            
            // Load initial data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial view
            this.render();
            
            this.isInitialized = true;
            console.log('[Employee Report] Initialized successfully');
  } catch (error) {
            console.error('[Employee Report] Initialization failed:', error);
            this.handleError('Không thể khởi tạo báo cáo nhân viên', error);
        }
    }

    /**
     * Load data for employee report
     */
    async loadData() {
        try {
            console.log('[Employee Report] Loading data...');
            
            // Check multiple possible data sources
            if (window.transactionList && window.expenseList) {
                this.currentData.transactions = window.transactionList;
                this.currentData.expenses = window.expenseList;
                console.log('[Employee Report] Using transactionList/expenseList data');
                return;
            }
            
            if (window.currentTransactionData && window.currentExpenseData) {
                this.currentData.transactions = window.currentTransactionData;
                this.currentData.expenses = window.currentExpenseData;
                console.log('[Employee Report] Using currentTransactionData/currentExpenseData');
                return;
            }

            // If no cached data, generate mock data for testing
            console.log('[Employee Report] No cached data available, using mock data');
            this.generateMockData();
  } catch (error) {
            console.error('[Employee Report] Data loading failed:', error);
            throw error;
        }
    }

    /**
     * Generate mock data for testing
     */
    generateMockData() {
        // Mock transaction data
        this.currentData.transactions = [
            {maGiaoDich: 'GD001', tenNhanVien: 'Nguyễn Văn A', maNhanVien: 'NV001', doanhThu: 50000000, hoaHong: 5000000, ngayGiaoDich: '2024-01-15'},
            {maGiaoDich: 'GD002', tenNhanVien: 'Trần Thị B', maNhanVien: 'NV002', doanhThu: 30000000, hoaHong: 3000000, ngayGiaoDich: '2024-01-20'},
            {maGiaoDich: 'GD003', tenNhanVien: 'Lê Văn C', maNhanVien: 'NV003', doanhThu: 40000000, hoaHong: 4000000, ngayGiaoDich: '2024-02-01'},
            {maGiaoDich: 'GD004', tenNhanVien: 'Nguyễn Văn A', maNhanVien: 'NV001', doanhThu: 60000000, hoaHong: 6000000, ngayGiaoDich: '2024-02-10'},
            {maGiaoDich: 'GD005', tenNhanVien: 'Phạm Thị D', maNhanVien: 'NV004', doanhThu: 35000000, hoaHong: 3500000, ngayGiaoDich: '2024-02-15'}
        ];
        
        // Mock expense data
        this.currentData.expenses = [
            {maChiPhi: 'CP001', tenNhanVien: 'Nguyễn Văn A', maNhanVien: 'NV001', soTien: 5000000, ngayChi: '2024-01-10'},
            {maChiPhi: 'CP002', tenNhanVien: 'Trần Thị B', maNhanVien: 'NV002', soTien: 3000000, ngayChi: '2024-01-15'},
            {maChiPhi: 'CP003', tenNhanVien: 'Lê Văn C', maNhanVien: 'NV003', soTien: 2000000, ngayChi: '2024-02-05'}
        ];
    }

    /**
     * Setup event listeners for employee report
     */
                topPerformers: this.employeeCore.employees.slice(0, 5),
            };

            // Render KPI cards
            this.renderKPICards(processedData.kpis);

            // Render charts
            this.renderCharts(processedData);

            // Render performance table
            this.renderPerformanceTable(processedData.employees);

            // Render comparison sections
            this.renderComparisons(processedData);

            // Render alerts
            this.renderAlerts(processedData.alerts);

            console.log('[Employee Report] Render completed');
  } catch (error) {
            console.error('[Employee Report] Render failed:', error);
            },
            {
            },
            {
                value: `${kpis.topPerformance}%`,
            },
            {
            }
        ];

        container.innerHTML = kpiCards.map(kpi => `
            <div class="employee-kpi-card">
                <div class="employee-kpi-header">
                    <span class="employee-kpi-title">${kpi.title}</span>
                    <div class="employee-kpi-icon" style="background: ${kpi.color}20; color: ${kpi.color}">
                        ${kpi.icon}
                    </div>
                </div>
                <div class="employee-kpi-value">${kpi.value}</div>
                <div class="employee-kpi-change ${this.getChangeClass(kpi.change)}">
                    <span>${this.getChangeIcon(kpi.change)}</span>
                    <span>${Math.abs(kpi.change)}% so với tháng trước</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render charts using the chart manager
     */
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)'
  });

                }]
            },
                    }
                },
                    }
                }
            }
        });
    }

    /**
     * Render revenue chart
     */
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  });

                }]
            },
                    }
                },
                    }
                }
            }
        });
    }

    /**
     * Render performance table
     */
    renderPerformanceTable(employees) {
        const container = document.querySelector('.employee-table-container');
        if (!container) return;

        const table = `
            <table class="employee-performance-table">
                <thead>
                    <tr>
                        <th>Xếp hạng</th>
                        <th>Nhân viên</th>
                        <th>Phòng ban</th>
                        <th>Doanh thu</th>
                        <th>Hoa hồng</th>
                        <th>Hiệu suất</th>
                        <th>Xu hướng</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map((emp, index) => `
                        <tr>
                            <td>
                                <span class="employee-rank-badge ${this.getRankClass(index + 1)}">
                                    ${index + 1}
                                </span>
                            </td>
                            <td>
                                <div class="employee-name-cell">
                                    <div class="employee-avatar">
                                        ${emp.tenNhanVien.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="employee-info">
                                        <div class="employee-name">${emp.tenNhanVien}</div>
                                        <div class="employee-id">${emp.maNhanVien}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="employee-department-badge ${this.getDepartmentClass(emp.phongBan)}">
                                    ${emp.phongBan || 'Khác'}
                                </span>
                            </td>
                            <td>${this.formatCurrency(emp.tongDoanhThu)}</td>
                            <td>${this.formatCurrency(emp.tongHoaHong)}</td>
                            <td>
                                <div class="employee-performance-metric">
                                    <div class="employee-progress-bar">
                                        <div class="employee-progress-fill" style="width: ${emp.hieuSuat}%"></div>
                                    </div>
                                    <span>${emp.hieuSuat}%</span>
                                </div>
                            </td>
                            <td>
                                <span class="employee-trend-icon ${this.getTrendClass(emp.xuHuong)}">
                                    ${this.getTrendIcon(emp.xuHuong)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
            return;
        }

        const alertsHTML = alerts.map(alert => `
            <div class="employee-alert-item">
                <div class="employee-alert-icon ${alert.type}">
                    ${this.getAlertIcon(alert.type)}
                </div>
                <div class="employee-alert-content">
                    <div class="employee-alert-message">${alert.message}</div>
                    <div class="employee-alert-details">${alert.details}</div>
                </div>
                <div class="employee-alert-time">${alert.time}</div>
            </div>
        `).join('');

        container.innerHTML = alertsHTML;
    }

    /**
     * Handle search functionality
     */
    handleSearch(query) {
        // Filter employees based on search query
        console.log('[Employee Report] Search:', query);
        // Implementation would filter the table data
    }

    /**
     * Handle filter functionality
     */
    handleFilter(filterValue) {
        console.log('[Employee Report] Filter:', filterValue);
        // Implementation would filter employees by department or other criteria
    }

    /**
     * Handle chart period changes
     */
    handleChartPeriodChange(period) {
        // Update active button
        document.querySelectorAll('.employee-chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const periodBtn = document.querySelector(`[data-period="${period}"]`);
        if (periodBtn) {
            periodBtn.classList.add('active');
        }

        // Update charts with new period using chart manager
        if (this.employeeCore && this.employeeCore.chartManager) {
            const processedData = this.employeeCore.processedData;
            this.employeeCore.chartManager.updateChartPeriod(
                period, 
                processedData.employees, 
                processedData.departments
            );
        }

        console.log('[Employee Report] Chart period changed:', period);
    }

    /**
     * Handle quick actions
     */
    handleQuickAction(action) {
        console.log('[Employee Report] Quick action:', action);
                break;
        }
    }

    /**
     * Refresh the report
     */
    async refresh() {
        try {
            console.log('[Employee Report] Refreshing...');
            await this.loadData();
            this.render();
            console.log('[Employee Report] Refresh completed');
  } catch (error) {
            console.error('[Employee Report] Refresh failed:', error);
  });

        }).format(amount);
    }
        }
    }

    /**
     * Handle errors
     */
    handleError(message, error) {
        console.error('[Employee Report]', message, error);
        
        // Show error to user
        const container = document.querySelector('.employee-report-container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `
                <strong>Lỗi:</strong> ${message}
                <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
            `;
        };
    }

    /**
     * Prepare chart data
     */
            },
            }
        };
    }

    /**
     * Calculate department statistics
     */
  });

                };
            }
  });
                message: `${lowPerformers.length} nhân viên có hiệu suất dưới 80%`,
            });
        }
        
        // No activity alert
  });
                message: `${inactiveEmployees.length} nhân viên không hoạt động > 30 ngày`,
            });
        }
        
        return alerts;
    }

    /**
     * Cleanup method
     */
    cleanup() {
        // Cleanup chart manager
        if (this.employeeCore && this.employeeCore.chartManager) {
            this.employeeCore.chartManager.cleanup();
        }

        // Destroy legacy charts
        if (window.employeePerformanceChart) {
            window.employeePerformanceChart.destroy();
            window.employeePerformanceChart = null;
        }
        
        if (window.employeeRevenueChart) {
            window.employeeRevenueChart.destroy();
            window.employeeRevenueChart = null;
        }

        // Reset state
        this.isInitialized = false;
        this.employeeCore = null;
        this.currentData = { transactions: [], expenses: [] };
    }
}

// Export for module usage
export { EmployeeReportLoader };

// Global initialization function
window.initEmployeeReport = async function() {
    if (!window.employeeReportLoader) {
        window.employeeReportLoader = new EmployeeReportLoader();
    }
    await window.employeeReportLoader.init();
};

// Cleanup function
window.cleanupEmployeeReport = function() {
    if (window.employeeReportLoader) {
        window.employeeReportLoader.cleanup();
    }
};