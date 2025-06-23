// Employee Report Core Module
// Xử lý dữ liệu và phân tích hiệu suất nhân viên từ GiaoDich và ChiPhi
            kpis: {},
        };
    }

    // Khởi tạo module
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            
            this.setupEventListeners();
            await this.loadAllData();
            this.processEmployeeData();
            this.renderKPIDashboard();
            this.renderOverviewCards();
            this.renderAnalyticsCharts();
            this.renderEmployeePerformanceTable();
            this.renderDetailsSection();
            this.renderGoalsSection();
            this.renderRankingSection();
            
            this.isInitialized = true;
  } catch (error) {
            console.error('❌ Error initializing Employee Report:', error);
        }
    }

    // Tải tất cả dữ liệu từ các sheet
    async loadAllData() {
        try {
            // Lấy dữ liệu từ các sheet hiện có
            this.transactions = this.extractTransactionData();
            this.expenses = this.extractExpenseData();
  } catch (error) {
            console.error('❌ Error loading employee data:', error);
            // Fallback to mock data if real data is not available
                };
            }
            
            // If data is in array format
                maGiaoDich: row[0] || '',           // A: Mã giao dịch
                ngayGiaoDich: row[1] || '',         // B: Ngày giao dịch
                loaiGiaoDich: row[2] || '',         // C: Loại giao dịch
                tenKhachHang: row[3] || '',         // D: Tên khách hàng
                email: row[4] || '',                // E: Email
                lienHe: row[5] || '',               // F: Liên hệ
                soThangDangKy: parseInt(row[6]) || 0, // G: Số tháng đăng ký
                ngayBatDau: row[7] || '',           // H: Ngày bắt đầu
                ngayKetThuc: row[8] || '',          // I: Ngày kết thúc
                soThietBi: parseInt(row[9]) || 0,   // J: Số thiết bị
                tenPhanMem: row[10] || '',          // K: Tên phần mềm
                goiPhanMem: row[11] || '',          // L: Gói phần mềm
                tenTaiKhoan: row[12] || '',         // M: Tên tài khoản
                idSheetTaiKhoan: row[13] || '',     // N: ID Sheet Tài khoản
                capNhatCookie: row[14] || '',       // O: Cập nhật Cookie
                thongTinDonHang: row[15] || '',     // P: Thông tin đơn hàng
                doanhThu: parseFloat(row[16]) || 0, // Q: Doanh thu
                hoaHong: parseFloat(row[17]) || 0,  // R: Hoa hồng
                ghiChu: row[18] || '',              // S: Ghi chú
                tenChuan: row[19] || '',            // T: Tên chuẩn
                tenNhanVien: row[20] || '',         // U: Tên nhân viên
            };
        });
    }

    // Trích xuất dữ liệu từ sheet ChiPhi
                };
            }
            
            // If data is in array format
                maChiPhi: row[0] || '',             // A: Mã chi phí
                ngayChi: row[1] || '',              // B: Ngày chi
                loaiKeToan: row[2] || '',           // C: Loại kế toán
                phanBo: row[3] || '',               // D: Phân bổ
                loaiKhoanChi: row[4] || '',         // E: Loại khoản chi
                danhMucChung: row[5] || '',         // F: Danh mục chung
                tenSanPham: row[6] || '',           // G: Tên sản phẩm/Dịch vụ
                phienBan: row[7] || '',             // H: Phiên bản/Gói dịch vụ
                soTien: parseFloat(row[8]) || 0,    // I: Số tiền
                donViTienTe: row[9] || '',          // J: Đơn vị tiền tệ
                nganHang: row[10] || '',            // K: Ngân hàng/Ví
                thongTinThe: row[11] || '',         // L: Thông tin thẻ/Tài khoản
                phuongThucChi: row[12] || '',       // M: Phương thức chi
                ngayTaiTuc: row[13] || '',          // N: Ngày tái tục
                nguoiNhan: row[14] || '',           // O: Người nhận hoặc nhà cung cấp
                trangThai: row[15] || '',           // P: Trạng thái
                ghiChu: row[16] || '',              // Q: Ghi chú
                tenChuan: row[17] || '',            // R: Tên chuẩn
                tenNhanVien: row[18] || '',         // S: Tên nhân viên
            };
        });
    }

    // Method mới để xử lý tất cả dữ liệu sử dụng EmployeeDataProcessor
  });
                    monthlyRevenue: {},
                    monthlyTransactions: {},
            }
            
            const employee = employeeMap.get(employeeKey);
            employee.totalRevenue += transaction.doanhThu || 0;
            employee.totalCommission += transaction.hoaHong || 0;
            employee.transactionCount++;
            employee.transactions.push(transaction);
            
            // Cập nhật hoạt động cuối
            const transactionDate = new Date(transaction.ngayGiaoDich);
            if (!employee.lastActivity || transactionDate > new Date(employee.lastActivity)) {
                employee.lastActivity = transaction.ngayGiaoDich;
            }
            
            // Cập nhật dữ liệu theo tháng
            const monthKey = transaction.ngayGiaoDich ? transaction.ngayGiaoDich.substring(0, 7) : new Date().toISOString().substring(0, 7);
            // Tính hiệu suất (so với target hoặc trung bình)
            // Xác định level hiệu suất
            employee.performanceLevel = this.getPerformanceLevel(employee.performanceRatio);
        });

        // Sắp xếp và xếp hạng
        this.employees = Array.from(employeeMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        // Gán rank
        this.employees.forEach((employee, index) => {
            employee.rank = index + 1;
        });
        
        this.filteredEmployees = [...this.employees];
        
    }

    // Tạo dữ liệu mẫu nếu không có dữ liệu thực
    generateMockData() {
        
        const mockEmployees = [
            { name: 'Nguyễn Văn An', code: 'NV001', dept: 'sales' },
            { name: 'Trần Thị Bình', code: 'NV002', dept: 'sales' },
            { name: 'Lê Văn Cường', code: 'NV003', dept: 'support' },
            { name: 'Phạm Thị Dung', code: 'NV004', dept: 'marketing' },
            { name: 'Hoàng Văn Em', code: 'NV005', dept: 'sales' },
            { name: 'Võ Thị Phượng', code: 'NV006', dept: 'support' },
            { name: 'Đặng Văn Giang', code: 'NV007', dept: 'admin' },
            { name: 'Bùi Thị Hoa', code: 'NV008', dept: 'sales' }
        ];
        }));

        // Tính toán và cập nhật các chỉ số
        const topPerformers = this.employees.filter(emp => emp.performanceRatio >= 100).length;
        const activeEmployees = this.employees.filter(emp => {
            if (!emp.lastActivity) return false;
            const daysSinceActivity = Math.floor((new Date() - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysSinceActivity <= 30;
        }).length;

        container.innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card employees">
                    <div class="kpi-icon">👥</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${totalEmployees}</div>
                        <div class="kpi-label">Tổng nhân viên</div>
                        <div class="kpi-trend positive">${activeEmployees} hoạt động tháng này</div>
                    </div>
                </div>

                <div class="kpi-card revenue">
                    <div class="kpi-icon">💰</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalRevenue)}</div>
                        <div class="kpi-label">Tổng doanh thu</div>
                        <div class="kpi-trend positive">+${((totalRevenue / (totalRevenue + totalCommission)) * 100).toFixed(1)}% hiệu quả</div>
                    </div>
                </div>

                <div class="kpi-card commission">
                    <div class="kpi-icon">💵</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalCommission)}</div>
                        <div class="kpi-label">Tổng hoa hồng</div>
                        <div class="kpi-trend neutral">${((totalCommission / totalRevenue) * 100).toFixed(1)}% tỷ lệ</div>
                    </div>
                </div>

                <div class="kpi-card performance">
                    <div class="kpi-icon">📈</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${avgPerformance.toFixed(1)}%</div>
                        <div class="kpi-label">Hiệu suất TB</div>
                        <div class="kpi-trend ${avgPerformance >= 100 ? 'positive' : 'negative'}">
                        </div>
                    </div>
                </div>

                <div class="kpi-card top-performers">
                    <div class="kpi-icon">🏆</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${topPerformers}</div>
                        <div class="kpi-label">Top performers</div>
                        <div class="kpi-trend positive">≥100% KPI</div>
                    </div>
                </div>

                <div class="kpi-card efficiency">
                    <div class="kpi-icon">⚡</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalRevenue / totalEmployees)}</div>
                        <div class="kpi-label">Doanh thu/NV</div>
                        <div class="kpi-trend neutral">Trung bình</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Overview Cards
  });
                };
            }
            departmentStats[dept].count++;
            departmentStats[dept].revenue += emp.totalRevenue;
            departmentStats[dept].commission += emp.totalCommission;
            departmentStats[dept].avgPerformance += emp.performanceRatio;
        });

        // Tính trung bình
        Object.keys(departmentStats).forEach(dept => {
            departmentStats[dept].avgPerformance /= departmentStats[dept].count;
        });

        const topDepartments = Object.entries(departmentStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 3);

        container.innerHTML = `
            <div class="overview-card">
                <h4>🏢 Top phòng ban theo doanh thu</h4>
                <div class="top-list">
                    ${topDepartments.map(([dept, stats], index) => `
                        <div class="top-item">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${this.getDepartmentName(dept)}</span>
                            <span class="value">${formatCurrency(stats.revenue)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>📊 Phân bổ hiệu suất</h4>
                <div class="performance-breakdown">
                    ${Object.entries(departmentStats).map(([dept, stats]) => `
                        <div class="performance-item">
                            <div class="performance-info">
                                <span class="dept-name">${this.getDepartmentName(dept)}</span>
                                <span class="performance-value">${stats.avgPerformance.toFixed(1)}%</span>
                            </div>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: ${Math.min(stats.avgPerformance, 150)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>⭐ Phân loại hiệu suất</h4>
                <div class="performance-summary">
                    <div class="performance-group excellent">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'excellent').length}</span>
                        <span class="performance-label">Xuất sắc (≥120%)</span>
                    </div>
                    <div class="performance-group good">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'good').length}</span>
                        <span class="performance-label">Tốt (100-120%)</span>
                    </div>
                    <div class="performance-group average">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'average').length}</span>
                        <span class="performance-label">Trung bình (80-100%)</span>
                    </div>
                    <div class="performance-group below">
                        <span class="performance-count">${this.employees.filter(emp => emp.performanceLevel === 'below').length}</span>
                        <span class="performance-label">Cần cải thiện (<80%)</span>
                    </div>
                </div>
            </div>
        `;
    }
            'support': 'Hỗ trợ',
            'marketing': 'Marketing',
            'admin': 'Quản trị'
        };
                        '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
                    ],
  });
                }]
            },
                    legend: { display: false },
                        }
                    }
                },
                        }
                    },
                        }
                    }
                }
            }
        });
    }
                    {
                    },
                    {
                    }
                ]
            },
                },
                        }
                    }
                },
                        }
                    },
                        }
                    },
  });

                        },
                        }
                    }
                }
            }
        });
    }

    renderPerformanceTrendChart() {
        const ctx = document.getElementById('performanceTrendChart');
        if (!ctx) return;

        // Tạo dữ liệu xu hướng hiệu suất 6 tháng gần nhất
        const months = [];
        const avgPerformanceData = [];
        const topPerformerCountData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
                    {
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
  });
                    },
                    {
                    }
                ]
            },
                                if (context.datasetIndex === 0) {
                                    return `Hiệu suất TB: ${context.parsed.y.toFixed(1)}%`;
                                } else {
                                    return `Top performers: ${context.parsed.y} người`;
                                }
                            }
                        }
                    }
                },
                        }
                    },
                        },
                        }
                    }
                }
            }
        });
    }
            'Tốt (100-119%)': this.employees.filter(emp => emp.performanceRatio >= 100 && emp.performanceRatio < 120).length,
            'Trung bình (80-99%)': this.employees.filter(emp => emp.performanceRatio >= 80 && emp.performanceRatio < 100).length,
            'Cần cải thiện (<80%)': this.employees.filter(emp => emp.performanceRatio < 80).length
        };
                    backgroundColor: ['#10b981', '#f59e0b', '#6b7280', '#ef4444'],
  });
                }]
            },
                    },
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} người (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render Employee Performance Table
    renderEmployeePerformanceTable() {
        const tableBody = document.querySelector('#employeePerformanceTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = this.filteredEmployees.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedData.map(employee => `
            <tr class="table-row ${employee.performanceLevel}">
                <td>
                    <div class="employee-info">
                        <strong class="employee-name">${employee.tenNhanVien}</strong>
                        <span class="employee-department">${this.getDepartmentName(employee.department)}</span>
                    </div>
                </td>
                <td>
                    <span class="employee-code">${employee.maNhanVien}</span>
                </td>
                <td class="revenue-cell">${formatCurrency(employee.totalRevenue)}</td>
                <td class="commission-cell">${formatCurrency(employee.totalCommission)}</td>
                <td class="transaction-count">${employee.transactionCount}</td>
                <td class="avg-transaction">${formatCurrency(employee.avgTransactionValue)}</td>
                <td>
                    <div class="performance-display">
                        <div class="performance-bar">
                            <div class="performance-fill ${employee.performanceLevel}" style="width: ${Math.min(employee.performanceRatio, 150)}%"></div>
                        </div>
                        <span class="performance-text">${employee.performanceRatio.toFixed(1)}%</span>
                    </div>
                </td>
                <td>
                    <span class="last-activity">${employee.lastActivity ? formatDate(employee.lastActivity) : 'N/A'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="employeeReport.viewEmployee('${employee.maNhanVien}')" title="Xem chi tiết">
                            👁️
                        </button>
                        <button class="action-btn edit" onclick="employeeReport.editEmployee('${employee.maNhanVien}')" title="Chỉnh sửa">
                            ✏️
                        </button>
                        <button class="action-btn kpi" onclick="employeeReport.setKPI('${employee.maNhanVien}')" title="Thiết lập KPI">
                            🎯
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
  });
                };
            }
            deptStats[dept].count++;
            deptStats[dept].totalRevenue += emp.totalRevenue;
            deptStats[dept].totalCommission += emp.totalCommission;
            deptStats[dept].avgPerformance += emp.performanceRatio;
            deptStats[dept].employees.push(emp);
        });

        // Tính trung bình
        Object.keys(deptStats).forEach(dept => {
            deptStats[dept].avgPerformance /= deptStats[dept].count;
        });

        container.innerHTML = `
            <div class="department-stats">
                ${Object.entries(deptStats).map(([dept, stats]) => `
                    <div class="dept-item">
                        <div class="dept-header">
                            <span class="dept-name">${this.getDepartmentName(dept)}</span>
                            <span class="dept-count">${stats.count} NV</span>
                        </div>
                        <div class="dept-metrics">
                            <div class="metric">
                                <span class="metric-label">Doanh thu:</span>
                                <span class="metric-value">${formatCurrency(stats.totalRevenue)}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Hiệu suất TB:</span>
                                <span class="metric-value ${stats.avgPerformance >= 100 ? 'positive' : 'negative'}">${stats.avgPerformance.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCommissionAnalysis() {
        const container = document.querySelector('#commissionAnalysisContent');
        if (!container) return;

        const totalCommission = this.employees.reduce((sum, emp) => sum + emp.totalCommission, 0);
        const totalRevenue = this.employees.reduce((sum, emp) => sum + emp.totalRevenue, 0);
        const avgCommissionRate = (totalCommission / totalRevenue) * 100;
        const topCommissionEarners = [...this.employees]
            .sort((a, b) => b.totalCommission - a.totalCommission)
            .slice(0, 3);

        container.innerHTML = `
            <div class="commission-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng hoa hồng:</span>
                    <span class="summary-value">${formatCurrency(totalCommission)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Tỷ lệ hoa hồng TB:</span>
                    <span class="summary-value">${avgCommissionRate.toFixed(2)}%</span>
                </div>
            </div>
            <div class="top-commission">
                <h5>Top 3 hoa hồng cao nhất:</h5>
                ${topCommissionEarners.map((emp, index) => `
                    <div class="commission-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${emp.tenNhanVien}</span>
                        <span class="value">${formatCurrency(emp.totalCommission)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderActivityTracking() {
        const container = document.querySelector('#activityTrackingContent');
        if (!container) return;

        const now = new Date();
        const activeToday = this.employees.filter(emp => {
            if (!emp.lastActivity) return false;
            const daysDiff = Math.floor((now - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysDiff === 0;
        }).length;

        const activeThisWeek = this.employees.filter(emp => {
            if (!emp.lastActivity) return false;
            const daysDiff = Math.floor((now - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7;
        }).length;

        const inactiveEmployees = this.employees.filter(emp => {
            if (!emp.lastActivity) return true;
            const daysDiff = Math.floor((now - new Date(emp.lastActivity)) / (1000 * 60 * 60 * 24));
            return daysDiff > 30;
        });

        container.innerHTML = `
            <div class="activity-summary">
                <div class="activity-item">
                    <span class="activity-label">Hoạt động hôm nay:</span>
                    <span class="activity-value">${activeToday} NV</span>
                </div>
                <div class="activity-item">
                    <span class="activity-label">Hoạt động tuần này:</span>
                    <span class="activity-value">${activeThisWeek} NV</span>
                </div>
                <div class="activity-item">
                    <span class="activity-label">Không hoạt động (>30 ngày):</span>
                    <span class="activity-value warning">${inactiveEmployees.length} NV</span>
                </div>
            </div>
            ${inactiveEmployees.length > 0 ? `
                <div class="inactive-employees">
                    <h5>Nhân viên cần quan tâm:</h5>
                    ${inactiveEmployees.slice(0, 5).map(emp => `
                        <div class="inactive-item">
                            <span class="inactive-name">${emp.tenNhanVien}</span>
                            <span class="inactive-date">${emp.lastActivity ? formatDate(emp.lastActivity) : 'Chưa rõ'}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    // Render Goals Section
    renderGoalsSection() {
        const container = document.querySelector('#employeeGoalsContent');
        if (!container) return;

        container.innerHTML = `
            <div class="goals-overview">
                <div class="goals-stats">
                    <div class="goal-stat">
                        <span class="stat-value">${this.employees.filter(emp => emp.performanceRatio >= 100).length}</span>
                        <span class="stat-label">Đạt mục tiêu</span>
                    </div>
                    <div class="goal-stat">
                        <span class="stat-value">${this.employees.filter(emp => emp.performanceRatio < 100).length}</span>
                        <span class="stat-label">Chưa đạt</span>
                    </div>
                    <div class="goal-stat">
                        <span class="stat-value">${this.kpiTargets.size}</span>
                        <span class="stat-label">Có KPI</span>
                    </div>
                </div>
                <div class="goals-actions">
                    <button class="goals-btn" onclick="employeeReport.openKPIModal()">
                        🎯 Thiết lập KPI mới
                    </button>
                    <button class="goals-btn secondary" onclick="employeeReport.reviewGoals()">
                        📋 Xem lại mục tiêu
                    </button>
                </div>
            </div>
        `;
    }

    // Render Ranking Section
    renderRankingSection() {
        const container = document.querySelector('#employeeRankingContent');
        if (!container) return;

        const topRanked = this.employees.slice(0, 10);

        container.innerHTML = `
            <div class="ranking-list">
                ${topRanked.map((emp, index) => `
                    <div class="ranking-item ${index < 3 ? 'podium' : ''}">
                        <div class="ranking-position">
                            ${index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                        </div>
                        <div class="ranking-employee">
                            <strong class="ranking-name">${emp.tenNhanVien}</strong>
                            <span class="ranking-dept">${this.getDepartmentName(emp.department)}</span>
                        </div>
                        <div class="ranking-metrics">
                            <span class="ranking-revenue">${formatCurrency(emp.totalRevenue)}</span>
                            <span class="ranking-performance ${emp.performanceLevel}">${emp.performanceRatio.toFixed(1)}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Setup Event Listeners
        content.innerHTML = `
            <div class="employee-detail-grid">
                <div class="detail-item">
                    <label>Tên nhân viên:</label>
                    <span>${employee.tenNhanVien}</span>
                </div>
                <div class="detail-item">
                    <label>Mã nhân viên:</label>
                    <span>${employee.maNhanVien}</span>
                </div>
                <div class="detail-item">
                    <label>Phòng ban:</label>
                    <span>${this.getDepartmentName(employee.department)}</span>
                </div>
                <div class="detail-item">
                    <label>Xếp hạng:</label>
                    <span>#${employee.rank}</span>
                </div>
                <div class="detail-item">
                    <label>Doanh thu:</label>
                    <span class="positive">${formatCurrency(employee.totalRevenue)}</span>
                </div>
                <div class="detail-item">
                    <label>Hoa hồng:</label>
                    <span class="positive">${formatCurrency(employee.totalCommission)}</span>
                </div>
                <div class="detail-item">
                    <label>Số giao dịch:</label>
                    <span>${employee.transactionCount}</span>
                </div>
                <div class="detail-item">
                    <label>Giá trị TB/GD:</label>
                    <span>${formatCurrency(employee.avgTransactionValue)}</span>
                </div>
                <div class="detail-item">
                    <label>Hiệu suất:</label>
                    <span class="${employee.performanceLevel}">${employee.performanceRatio.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <label>Hoạt động cuối:</label>
                    <span>${employee.lastActivity ? formatDate(employee.lastActivity) : 'N/A'}</span>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeEmployeeModal() {
        const modal = document.querySelector('#employeeDetailModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    openKPIModal(employeeCode = null) {
        const modal = document.querySelector('#kpiSettingModal');
        const employeeSelect = document.querySelector('#employeeSelect');
        
        if (!modal || !employeeSelect) return;

        // Populate employee select
        employeeSelect.innerHTML = '<option value="">-- Chọn nhân viên --</option>' +
            this.employees.map(emp => 
                `<option value="${emp.maNhanVien}"${emp.maNhanVien === employeeCode ? ' selected' : ''}>${emp.tenNhanVien} (${emp.maNhanVien})</option>`
            ).join('');

        // If specific employee, pre-fill data
                break;
        }
    }

    reviewGoals() {
        console.log('Review goals functionality');
    }

    // Utility methods
    updatePagination() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;

        const totalItems = this.filteredEmployees.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        container.innerHTML = `
            <div class="pagination-info">
                Hiển thị ${(this.currentPage - 1) * this.itemsPerPage + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} 
                trong tổng số ${totalItems} nhân viên
            </div>
            <div class="pagination-controls">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        onclick="employeeReport.goToPage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>‹</button>
                
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const page = Math.max(1, this.currentPage - 2) + i;
                    if (page <= totalPages) {
                        return `<button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                                       onclick="employeeReport.goToPage(${page})">${page}</button>`;
                    }
                    return '';
                }).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                        onclick="employeeReport.goToPage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>›</button>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderEmployeePerformanceTable();
    }

    exportToExcel() {
        const headers = ['Nhân viên', 'Mã NV', 'Phòng ban', 'Doanh thu', 'Hoa hồng', 'Số GD', 'TB/GD', 'Hiệu suất', 'Xếp hạng'];
        const data = [headers];
        
        this.filteredEmployees.forEach(emp => {
            data.push([
                emp.tenNhanVien,
                emp.maNhanVien,
                this.getDepartmentName(emp.department),
                emp.totalRevenue,
                emp.totalCommission,
                emp.transactionCount,
                emp.avgTransactionValue
  });
                `${emp.performanceRatio.toFixed(1)}%`,
                emp.rank
            ]);
        });
        
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `employee-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    showSuccessMessage(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = message;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 3000);
    }

    async refresh() {
        this.isInitialized = false;
        await this.initialize();
    }
}

// Export instance for global use
export const employeeReport = new EmployeeReportCore();