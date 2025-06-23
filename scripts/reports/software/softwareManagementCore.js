// Software Account Management Core Module
// Xử lý dữ liệu thực tế từ sheet PhanMem, GiaoDich, ChiPhi

import { formatDate } from '../../formatDate.js';
import { formatDateTime } from '../../formatDateTime.js';
import { formatCurrency } from '../../statistics/formatters.js';

export class SoftwareManagement {
    constructor() {
        this.softwareAccounts = [];
        this.transactions = [];
        this.expenses = [];
        this.filteredAccounts = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.isInitialized = false;
        this.charts = {};
    }

    // Khởi tạo module
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            
            this.setupEventListeners();
            await this.loadAllData();
            this.processAndCombineData();
            this.renderKPIDashboard();
            this.renderOverviewCards();
            this.renderAnalyticsCharts();
            this.renderSoftwareAccountsTable();
            this.renderDetailsSection();
            this.renderAlertsSection();
            
            this.isInitialized = true;
  } catch (error) {
            console.error('❌ Error initializing Software Management:', error);
        }
    }

    // Tải tất cả dữ liệu từ các sheet
  } catch (error) {
            console.error('❌ Error loading data:', error);
            // Fallback to mock data if real data is not available
            tenPhanMem: row[0] || '',           // A: Tên phần mềm
            goiPhanMem: row[1] || '',           // B: Gói phần mềm
            giaBan: parseFloat(row[2]) || 0,    // C: Giá bán
            tenTaiKhoan: row[3] || '',          // D: Tên tài khoản
            soNguoiDungChoPhep: parseInt(row[4]) || 0,    // E: Số người dùng cho phép
            soNguoiDungDangHoatDong: parseInt(row[5]) || 0, // F: Số người dùng đang hoạt động
            idSheetTaiKhoan: row[6] || '',      // G: ID Sheet tài khoản
            thongTinDonHang: row[7] || '',      // H: Thông tin đơn hàng
            tenDangNhap: row[8] || '',          // I: Tên đăng nhập
            matKhauDangNhap: row[9] || '',      // J: Mật khẩu đăng nhập
            secret: row[10] || '',              // K: Secret
            linkYeuCauOTP: row[11] || '',       // L: Link yêu cầu OTP
            tenChuan: row[12] || '',            // M: Tên chuẩn
        }));
    }

    // Trích xuất dữ liệu từ sheet GiaoDich
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
        }));
    }

    // Trích xuất dữ liệu từ sheet ChiPhi
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
        }));
    }

    // Xử lý và kết hợp dữ liệu
  });

            }
        });

        // Kết hợp dữ liệu từ sheet GiaoDich
            // Tính tỷ lệ sử dụng
            },
            {
            },
            {
            },
            {
            },
            {
            }
        ];
    }

    // Render KPI Dashboard
        const activeAccounts = this.filteredAccounts.filter(acc => acc.status === 'active').length;
        const expiringAccounts = this.filteredAccounts.filter(acc => acc.status === 'expiring').length;
        const expiredAccounts = this.filteredAccounts.filter(acc => acc.status === 'expired').length;

        container.innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card revenue">
                    <div class="kpi-icon">💰</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalRevenue)}</div>
                        <div class="kpi-label">Tổng doanh thu</div>
                        <div class="kpi-trend positive">+${((totalRevenue / (totalRevenue + totalCost)) * 100).toFixed(1)}% tỷ suất</div>
                    </div>
                </div>

                <div class="kpi-card cost">
                    <div class="kpi-icon">💸</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalCost)}</div>
                        <div class="kpi-label">Tổng chi phí</div>
                        <div class="kpi-trend neutral">${totalAccounts} tài khoản</div>
                    </div>
                </div>

                <div class="kpi-card profit">
                    <div class="kpi-icon">📈</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${formatCurrency(totalProfit)}</div>
                        <div class="kpi-label">Lợi nhuận</div>
                        <div class="kpi-trend ${totalProfit >= 0 ? 'positive' : 'negative'}">
                            ${totalProfit >= 0 ? '+' : ''}${((totalProfit / totalCost) * 100).toFixed(1)}% ROI
                        </div>
                    </div>
                </div>

                <div class="kpi-card utilization">
                    <div class="kpi-icon">👥</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${avgUtilization.toFixed(1)}%</div>
                        <div class="kpi-label">Tỷ lệ sử dụng TB</div>
                        <div class="kpi-trend ${avgUtilization >= 80 ? 'positive' : avgUtilization >= 60 ? 'neutral' : 'negative'}">
                        </div>
                    </div>
                </div>

                <div class="kpi-card accounts">
                    <div class="kpi-icon">📊</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${totalAccounts}</div>
                        <div class="kpi-label">Tổng tài khoản</div>
                        <div class="kpi-trend neutral">${activeAccounts} hoạt động</div>
                    </div>
                </div>

                <div class="kpi-card alerts">
                    <div class="kpi-icon">🚨</div>
                    <div class="kpi-content">
                        <div class="kpi-value">${expiringAccounts + expiredAccounts}</div>
                        <div class="kpi-label">Cần chú ý</div>
                        <div class="kpi-trend ${expiringAccounts + expiredAccounts > 0 ? 'negative' : 'positive'}">
                            ${expiredAccounts} hết hạn, ${expiringAccounts} sắp hết hạn
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Overview Cards
  });

                };
            }
            softwareStats[software].accounts++;
            softwareStats[software].revenue += acc.totalRevenue;
            softwareStats[software].cost += acc.totalCost;
            softwareStats[software].users += acc.soNguoiDungChoPhep;
        });

        const topSoftware = Object.entries(softwareStats)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 3);

        container.innerHTML = `
            <div class="overview-card">
                <h4>🏆 Top phần mềm theo doanh thu</h4>
                <div class="top-list">
                    ${topSoftware.map((([name, stats], index) => `
                        <div class="top-item">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${name}</span>
                            <span class="value">${formatCurrency(stats.revenue)}</span>
                        </div>
                    `)).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>📊 Phân bổ chi phí</h4>
                <div class="cost-breakdown">
                    ${Object.entries(softwareStats).slice(0, 4).map(([name, stats]) => `
                        <div class="cost-item">
                            <div class="cost-info">
                                <span class="software-name">${name}</span>
                                <span class="cost-amount">${formatCurrency(stats.cost)}</span>
                            </div>
                            <div class="cost-bar">
                                <div class="cost-fill" style="width: ${(stats.cost / Object.values(softwareStats).reduce((sum, s) => sum + s.cost, 0)) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="overview-card">
                <h4>⚠️ Cảnh báo tài khoản</h4>
                <div class="alert-summary">
                    <div class="alert-item high">
                        <span class="alert-count">${this.filteredAccounts.filter(acc => acc.alertLevel === 'high').length}</span>
                        <span class="alert-label">Mức độ cao</span>
                    </div>
                    <div class="alert-item medium">
                        <span class="alert-count">${this.filteredAccounts.filter(acc => acc.alertLevel === 'medium').length}</span>
                        <span class="alert-label">Mức độ trung bình</span>
                    </div>
                    <div class="alert-item normal">
                        <span class="alert-count">${this.filteredAccounts.filter(acc => acc.alertLevel === 'normal').length}</span>
                        <span class="alert-label">Bình thường</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Analytics Charts
                        '#4f46e5',
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
  });

                }]
            },
                    legend: { display: false },
                            label: (context) => `Doanh thu: ${formatCurrency(context.parsed.y)}`
                        }
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
  });

                            label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                        }
                    }
                }
            }
        });
    }
            'Trung bình (60-79%)': this.filteredAccounts.filter(acc => acc.utilizationRate >= 60 && acc.utilizationRate < 80).length,
            'Thấp (30-59%)': this.filteredAccounts.filter(acc => acc.utilizationRate >= 30 && acc.utilizationRate < 60).length,
            'Rất thấp (<30%)': this.filteredAccounts.filter(acc => acc.utilizationRate < 30).length
        };
                    backgroundColor: ['#10b981', '#f59e0b', '#fb923c', '#ef4444']
  });

                }]
            },
                        labels: { padding: 20 }
                    }
                }
            }
        });
    }
  });

        }));
                        '#4f46e5',
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
  });

                }]
            },
                        labels: { padding: 15 }
                    },
                                const item = marketShare[context.dataIndex];
                                return `${item.name}: ${item.share.toFixed(1)}% (${formatCurrency(item.revenue)})`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render Software Accounts Table
    renderSoftwareAccountsTable() {
        const tableBody = document.querySelector('#softwareAccountsTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = this.filteredAccounts.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedData.map(account => `
            <tr class="table-row ${account.alertLevel}">
                <td>
                    <div class="software-info">
                        <strong class="software-name">${account.tenPhanMem}</strong>
                        <span class="software-package">${account.goiPhanMem}</span>
                    </div>
                </td>
                <td>
                    <div class="account-info">
                        <strong class="account-name">${account.tenTaiKhoan}</strong>
                        <span class="account-id">${account.idSheetTaiKhoan || 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <div class="user-stats">
                        <span class="user-count">${account.soNguoiDungDangHoatDong}/${account.soNguoiDungChoPhep}</span>
                        <span class="user-label">người dùng</span>
                    </div>
                </td>
                <td>
                    <div class="utilization-display">
                        <div class="utilization-bar">
                            <div class="utilization-fill" style="width: ${account.utilizationRate}%"></div>
                        </div>
                        <span class="utilization-text">${account.utilizationRate.toFixed(1)}%</span>
                    </div>
                </td>
                <td class="revenue-cell">${formatCurrency(account.totalRevenue)}</td>
                <td class="cost-cell">${formatCurrency(account.totalCost)}</td>
                <td class="profit-cell ${account.profit >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(account.profit)}
                    <div class="roi-text">(${account.roi.toFixed(1)}%)</div>
                </td>
                <td>
                    <span class="expiry-date ${account.status}">
                        ${account.expiryDate ? formatDate(account.expiryDate) : 'N/A'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${account.status}">
                        ${this.getStatusText(account.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="softwareManagement.viewAccount(${account.id})" title="Xem chi tiết">
                            👁️
                        </button>
                        <button class="action-btn edit" onclick="softwareManagement.editAccount(${account.id})" title="Chỉnh sửa">
                            ✏️
                        </button>
                        <button class="action-btn refresh" onclick="softwareManagement.refreshAccount(${account.id})" title="Làm mới">
                            🔄
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    // Render Details Section
    renderDetailsSection() {
        this.renderRevenueAnalysis();
        this.renderCostAnalysis();
        this.renderProfitAnalysis();
        this.renderUserManagement();
    }

    renderRevenueAnalysis() {
        const container = document.querySelector('#revenueAnalysisContent');
        if (!container) return;

        const totalRevenue = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalRevenue, 0);
        const avgRevenue = totalRevenue / this.filteredAccounts.length;
        const topRevenue = [...this.filteredAccounts].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng doanh thu:</span>
                    <span class="summary-value">${formatCurrency(totalRevenue)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">TB mỗi tài khoản:</span>
                    <span class="summary-value">${formatCurrency(avgRevenue)}</span>
                </div>
            </div>
            <div class="top-performers">
                <h5>Top 3 doanh thu cao nhất:</h5>
                ${topRevenue.map((acc, index) => `
                    <div class="performer-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${acc.tenPhanMem}</span>
                        <span class="value">${formatCurrency(acc.totalRevenue)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCostAnalysis() {
        const container = document.querySelector('#costAnalysisContent');
        if (!container) return;

        const totalCost = this.filteredAccounts.reduce((sum, acc) => sum + acc.totalCost, 0);
        const avgCost = totalCost / this.filteredAccounts.length;
        const highestCost = [...this.filteredAccounts].sort((a, b) => b.totalCost - a.totalCost).slice(0, 3);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng chi phí:</span>
                    <span class="summary-value">${formatCurrency(totalCost)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">TB mỗi tài khoản:</span>
                    <span class="summary-value">${formatCurrency(avgCost)}</span>
                </div>
            </div>
            <div class="top-performers">
                <h5>Top 3 chi phí cao nhất:</h5>
                ${highestCost.map((acc, index) => `
                    <div class="performer-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${acc.tenPhanMem}</span>
                        <span class="value">${formatCurrency(acc.totalCost)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProfitAnalysis() {
        const container = document.querySelector('#profitAnalysisContent');
        if (!container) return;

        const totalProfit = this.filteredAccounts.reduce((sum, acc) => sum + acc.profit, 0);
        const profitableAccounts = this.filteredAccounts.filter(acc => acc.profit > 0);
        const topProfitable = [...this.filteredAccounts].sort((a, b) => b.roi - a.roi).slice(0, 3);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng lợi nhuận:</span>
                    <span class="summary-value ${totalProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(totalProfit)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Tài khoản có lãi:</span>
                    <span class="summary-value">${profitableAccounts.length}/${this.filteredAccounts.length}</span>
                </div>
            </div>
            <div class="top-performers">
                <h5>Top 3 ROI cao nhất:</h5>
                ${topProfitable.map((acc, index) => `
                    <div class="performer-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${acc.tenPhanMem}</span>
                        <span class="value ${acc.roi >= 0 ? 'positive' : 'negative'}">${acc.roi.toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderUserManagement() {
        const container = document.querySelector('#userManagementContent');
        if (!container) return;

        const totalUsers = this.filteredAccounts.reduce((sum, acc) => sum + acc.soNguoiDungChoPhep, 0);
        const activeUsers = this.filteredAccounts.reduce((sum, acc) => sum + acc.soNguoiDungDangHoatDong, 0);
        const underutilized = this.filteredAccounts.filter(acc => acc.utilizationRate < 60);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="summary-item">
                    <span class="summary-label">Tổng người dùng:</span>
                    <span class="summary-value">${activeUsers}/${totalUsers}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Tỷ lệ sử dụng:</span>
                    <span class="summary-value">${((activeUsers / totalUsers) * 100).toFixed(1)}%</span>
                </div>
            </div>
            <div class="underutilized-accounts">
                <h5>Tài khoản sử dụng thấp (<60%):</h5>
                ${underutilized.slice(0, 5).map(acc => `
                    <div class="underutilized-item">
                        <span class="software-name">${acc.tenPhanMem}</span>
                        <span class="utilization-rate">${acc.utilizationRate.toFixed(1)}%</span>
                        <button class="optimize-btn" onclick="softwareManagement.optimizeAccount(${acc.id})">Tối ưu</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render Alerts Section
  });
                    title: `${acc.tenPhanMem} đã hết hạn`,
                    message: `Tài khoản ${acc.tenTaiKhoan} đã hết hạn từ ${formatDate(acc.expiryDate)}`,
                });
            } else if (acc.status === 'expiring') {
  });
                    title: `${acc.tenPhanMem} sắp hết hạn`,
                    message: `Còn ${daysLeft} ngày (${formatDate(acc.expiryDate)})`,
                });
            }

            // Cảnh báo sử dụng thấp
  });
                    title: `${acc.tenPhanMem} sử dụng rất thấp`,
                    message: `Chỉ ${acc.utilizationRate.toFixed(1)}% công suất`,
                });
            }

            // Cảnh báo lỗ
  });
                    title: `${acc.tenPhanMem} đang lỗ`,
                    message: `Lỗ ${formatCurrency(Math.abs(acc.profit))} (ROI: ${acc.roi.toFixed(1)}%)`,
                });
            }
        });

        // Sắp xếp theo priority
        alerts.sort((a, b) => {
            const priority = { high: 3, medium: 2, low: 1 };
            'expiring': 'Sắp hết hạn',
            'expired': 'Đã hết hạn'
        };
        return statusTexts[status] || 'Không xác định';
    }

    updatePagination() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;

        const totalItems = this.filteredAccounts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        container.innerHTML = `
            <div class="pagination-info">
                Hiển thị ${(this.currentPage - 1) * this.itemsPerPage + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} 
                trong tổng số ${totalItems} tài khoản
            </div>
            <div class="pagination-controls">
                <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        onclick="softwareManagement.goToPage(${this.currentPage - 1})" 
                        ${this.currentPage === 1 ? 'disabled' : ''}>‹</button>
                
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const page = Math.max(1, this.currentPage - 2) + i;
                    if (page <= totalPages) {
                        return `<button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                                       onclick="softwareManagement.goToPage(${page})">${page}</button>`;
                    }
                    return '';
                }).join('')}
                
                <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                        onclick="softwareManagement.goToPage(${this.currentPage + 1})" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}>›</button>
            </div>
        `;
    }

    // Action methods
    handleSearch(searchTerm) {
        // Implementation for search functionality
        this.applyFilters();
    }

    handleSoftwareFilter(software) {
        // Implementation for software filtering
        this.applyFilters();
    }

    handleStatusFilter(status) {
        // Implementation for status filtering
        this.applyFilters();
    }

    applyFilters() {
        // Apply all filters and re-render table
        this.currentPage = 1;
        this.renderSoftwareAccountsTable();
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderSoftwareAccountsTable();
    }

    viewAccount(accountId) {
        const account = this.filteredAccounts.find(acc => acc.id === accountId);
        if (account) {
            this.showAccountModal(account);
        }
    }

    editAccount(accountId) {
        const account = this.filteredAccounts.find(acc => acc.id === accountId);
        if (account) {
            this.showAccountModal(account, true);
        }
    }

    refreshAccount(accountId) {
        // Implementation for refreshing specific account
        console.log('Refreshing account:', accountId);
    }

    optimizeAccount(accountId) {
        // Implementation for optimizing account usage
        console.log('Optimizing account:', accountId);
    }
        content.innerHTML = `
            <div class="account-detail-grid">
                <div class="detail-item">
                    <label>Tên phần mềm:</label>
                    <span>${account.tenPhanMem}</span>
                </div>
                <div class="detail-item">
                    <label>Gói phần mềm:</label>
                    <span>${account.goiPhanMem}</span>
                </div>
                <div class="detail-item">
                    <label>Tên tài khoản:</label>
                    <span>${account.tenTaiKhoan}</span>
                </div>
                <div class="detail-item">
                    <label>Người dùng:</label>
                    <span>${account.soNguoiDungDangHoatDong}/${account.soNguoiDungChoPhep}</span>
                </div>
                <div class="detail-item">
                    <label>Tỷ lệ sử dụng:</label>
                    <span>${account.utilizationRate.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <label>Doanh thu:</label>
                    <span>${formatCurrency(account.totalRevenue)}</span>
                </div>
                <div class="detail-item">
                    <label>Chi phí:</label>
                    <span>${formatCurrency(account.totalCost)}</span>
                </div>
                <div class="detail-item">
                    <label>Lợi nhuận:</label>
                    <span class="${account.profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(account.profit)}</span>
                </div>
                <div class="detail-item">
                    <label>ROI:</label>
                    <span class="${account.roi >= 0 ? 'positive' : 'negative'}">${account.roi.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <label>Ngày hết hạn:</label>
                    <span>${account.expiryDate ? formatDate(account.expiryDate) : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Trạng thái:</label>
                    <span class="status-badge ${account.status}">${this.getStatusText(account.status)}</span>
                </div>
            </div>
        `;
                break;
        }
    }

    exportToExcel() {
        // Implementation for Excel export
        const headers = ['Phần mềm', 'Gói', 'Tài khoản', 'Người dùng', 'Tỷ lệ sử dụng', 'Doanh thu', 'Chi phí', 'Lợi nhuận', 'ROI', 'Trạng thái'];
        const data = [headers];
        
        this.filteredAccounts.forEach(acc => {
            data.push([
                acc.tenPhanMem,
                acc.goiPhanMem,
                acc.tenTaiKhoan
  });
                `${acc.soNguoiDungDangHoatDong}/${acc.soNguoiDungChoPhep}`,
                `${acc.utilizationRate.toFixed(1)}%`,
                acc.totalRevenue,
                acc.totalCost,
                acc.profit,
                `${acc.roi.toFixed(1)}%`,
                this.getStatusText(acc.status)
            ]);
        });
        
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `software-accounts-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    generateReport() {
        // Implementation for generating comprehensive report
        console.log('Generating comprehensive software report...');
    }

    async refresh() {
        this.isInitialized = false;
        await this.initialize();
    }
}

// Export instance for global use
export const softwareManagement = new SoftwareManagement();