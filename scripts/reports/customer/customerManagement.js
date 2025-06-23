/**
 * customerManagement.js
 * 
 * Customer Management functionality - Quản lý khách hàng
 */
};

/**
 * Load customer management report
 * @param {Object} options - Options for loading report
 * @param {Object} options.dateRange - Date range filter {start: 'yyyy/mm/dd', end: 'yyyy/mm/dd'}
 * @param {string} options.period - Period name (e.g., 'this_month', 'last_month')
 */
export async function loadCustomerManagement(options = {}) {
  
  try {
    // Load template
    await loadCustomerManagementHTML();
    
    // Ensure data is loaded
    await ensureDataIsLoaded();
    
    // Get data
    const transactions = window.transactionList || getFromStorage('transactions') || [];
    const expenses = window.expenseList || getFromStorage('expenses') || [];
    
    // Get date range from options or global filters
    const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
    const period = options.period || window.globalFilters?.period || 'this_month';
    
    // Filter data by date range
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    
    // Process customer data
    const customerData = processCustomerData(filteredTransactions);
    
    // Load all components
    await Promise.all([
      updateCustomerKPIs(customerData, period),
      renderCustomerAcquisitionChart(customerData, period),
      renderCustomerLifecycleChart(customerData),
      updateCustomerSegmentation(customerData),
      loadActiveCustomersTable(customerData),
      loadCustomerInsights(customerData),
      updateCRMTools(customerData)
    ]);
    
    // Setup event handlers
    setupCustomerManagementHandlers();
  } catch (error) {
    console.error('❌ Error loading customer management:', error);
    showError('Không thể tải quản lý khách hàng');
  }
}

/**
 * Load the customer management HTML template
 */
async function loadCustomerManagementHTML() {
  const container = document.getElementById('report-customer');
  if (!container) return;
  
  try {
    const response = await fetch('./partials/tabs/report-pages/customer-management.html');
    if (!response.ok) {
      throw new Error('Template not found');
    }
    
    const html = await response.text();
    container.innerHTML = html;
    container.classList.add('active');
  } catch (error) {
    console.error('❌ Could not load customer management template:', error);
  });
      };
    }
    totalRevenue: customerArray.reduce((sum, c) => sum + c.totalRevenue, 0),
  };
}

/**
 * Update customer KPI cards
 */
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
  });
      }]
    },
      },
        },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
              return `Khách hàng mới: ${context.parsed.y}`;
            }
          }
        }
      },
          },
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
          }
        }
      }
    }
  });
}

/**
 * Render customer lifecycle chart
 */
      labels: ['Khách hàng mới', 'Hoạt động', 'Không hoạt động', 'VIP', 'Rủi ro'],
          '#10b981', // New - Green
          '#3b82f6', // Active - Blue
          '#6b7280', // Inactive - Gray
          '#f59e0b', // VIP - Gold
          '#ef4444'  // At Risk - Red
        ],
      }]
    },
  });
          }
        },
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Update customer segmentation
 */
async function updateCustomerSegmentation(customerData) {
  
  const segments = calculateSegmentMetrics(customerData);
  
  // Update VIP customers
  updateKPIElement('vip-customers-count', segments.vip.count);
  updateKPIElement('vip-customers-revenue', `${segments.vip.revenuePercentage}%`);
  updateKPIElement('vip-customers-ltv', formatRevenue(segments.vip.averageLTV));
  
  // Update regular customers
  updateKPIElement('regular-customers-count', segments.regular.count);
  updateKPIElement('regular-customers-revenue', `${segments.regular.revenuePercentage}%`);
  updateKPIElement('regular-customers-ltv', formatRevenue(segments.regular.averageLTV));
  
  // Update at-risk customers
  updateKPIElement('risk-customers-count', segments.atRisk.count);
  updateKPIElement('risk-customers-percentage', `${segments.atRisk.percentage}%`);
  updateKPIElement('risk-customers-days', `${segments.atRisk.averageDaysSinceLastTransaction} ngày`);
  
  // Update new customers segment
  updateKPIElement('new-customers-segment-count', segments.new.count);
  updateKPIElement('new-customers-conversion', `${segments.new.conversionRate}%`);
}

/**
 * Load active customers table
 */
async function loadActiveCustomersTable(customerData) {
  
  customerState.filteredCustomers = customerData.customers;
  customerState.totalCustomers = customerData.customers.length;
  
  renderCustomersTable();
  updatePaginationInfo();
}

/**
 * Render customers table with current page data
 */
function renderCustomersTable() {
  const tbody = document.getElementById('active-customers-tbody');
  if (!tbody) return;
  
  const startIndex = (customerState.currentPage - 1) * customerState.pageSize;
  const endIndex = startIndex + customerState.pageSize;
  const pageCustomers = customerState.filteredCustomers.slice(startIndex, endIndex);
  
  if (pageCustomers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="no-data">Không có dữ liệu khách hàng</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = pageCustomers.map((customer, index) => {
    const globalIndex = startIndex + index;
    const lastActivityDays = Math.floor(
      (new Date() - customer.lastTransactionDate) / (1000 * 60 * 60 * 24)
    );
    
    return `
      <tr data-customer-id="${globalIndex}">
        <td class="select-col">
          <input type="checkbox" class="customer-checkbox" data-customer-id="${globalIndex}">
        </td>
        <td class="customer-col">
          <div class="customer-info">
            <div class="customer-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="customer-details">
              <span class="customer-name">${customer.name}</span>
              <small class="customer-email">${customer.email || 'N/A'}</small>
            </div>
          </div>
        </td>
        <td class="status-col">
          <span class="status-badge ${customer.status}">
            ${getStatusDisplayName(customer.status)}
          </span>
        </td>
        <td class="transactions-col">${customer.transactionCount}</td>
        <td class="revenue-col">${formatRevenue(customer.totalRevenue)}</td>
        <td class="last-activity-col">
          <span class="activity-time">${lastActivityDays} ngày trước</span>
        </td>
        <td class="ltv-col">${formatRevenue(customer.ltv)}</td>
        <td class="segment-col">
          <span class="segment-badge ${customer.segment}">
            ${getSegmentDisplayName(customer.segment)}
          </span>
        </td>
        <td class="action-col">
          <div class="action-buttons">
            <button class="action-btn view" onclick="viewCustomerDetails('${globalIndex}')" title="Xem chi tiết">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit" onclick="editCustomer('${globalIndex}')" title="Chỉnh sửa">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn message" onclick="messageCustomer('${globalIndex}')" title="Nhắn tin">
              <i class="fas fa-envelope"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Load customer insights
 */
async function loadCustomerInsights(customerData) {
  
  const insights = generateCustomerInsights(customerData, customerState.currentInsight);
  
  const tbody = document.getElementById('customer-insights-tbody');
  if (!tbody) return;
  
  if (insights.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="no-data">Không có thông tin chi tiết</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = insights.map(insight => `
    <tr>
      <td class="customer-col">
        <div class="customer-info">
          <span class="customer-name">${insight.customerName}</span>
          <small class="customer-detail">${insight.customerDetail}</small>
        </div>
      </td>
      <td class="insight-col">
        <div class="insight-content">
          <span class="insight-title">${insight.title}</span>
          <small class="insight-description">${insight.description}</small>
        </div>
      </td>
      <td class="priority-col">
        <span class="priority-badge ${insight.priority}">
          ${getPriorityDisplayName(insight.priority)}
        </span>
      </td>
      <td class="action-col">
        <button class="insight-action-btn" onclick="executeInsightAction('${insight.action}', '${insight.customerId}')">
          ${insight.actionLabel}
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Update CRM tools
 */
async function updateCRMTools(customerData) {
  
  // Update communication stats
  updateKPIElement('recent-emails', '12'); // Placeholder
  updateKPIElement('email-open-rate', '24.5%'); // Placeholder
  
  // Update support metrics
  updateKPIElement('pending-tickets', '3'); // Placeholder
  updateKPIElement('resolved-tickets', '28'); // Placeholder
  
  // Update loyalty program
  updateKPIElement('loyalty-members', customerData.vipCustomers.toString());
  updateKPIElement('points-distributed', '15,420'); // Placeholder
  
  // Update analytics
  updateKPIElement('customer-satisfaction', '87%'); // Placeholder
  updateKPIElement('retention-rate', '73%'); // Placeholder
  updateKPIElement('churn-rate', '5.2%'); // Placeholder
}

/**
 * Setup event handlers for customer management
 */
function setupCustomerManagementHandlers() {
  // View selector buttons for acquisition chart
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.chart-container');
      const viewBtns = container.querySelectorAll('.view-btn');
      
      viewBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const view = e.target.dataset.view;
      refreshAcquisitionChart(view);
    });
  });
  
  // Segment selector buttons
  const segmentBtns = document.querySelectorAll('.segment-btn');
  segmentBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      segmentBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      customerState.currentSegment = e.target.dataset.segment;
      refreshSegmentation();
    });
  });
  
  // Insight selector buttons
  const insightBtns = document.querySelectorAll('.insight-btn');
  insightBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      insightBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      customerState.currentInsight = e.target.dataset.insight;
      refreshInsights();
    });
  });
}

// Helper functions
function updateKPIElement(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateChangeElement(id, change, type = 'percentage') {
  const element = document.getElementById(id);
  if (element) {
    const isPositive = change >= 0;
    let displayValue;
    
    if (type === 'count') {
      displayValue = `${isPositive ? '+' : ''}${change}`;
    } else {
      displayValue = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
    }
    
    element.textContent = displayValue;
    element.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
  }
}

function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) return data;
  
  return data.filter(item => {
    const itemDate = normalizeDate(getTransactionField(item, 'transactionDate'));
    if (!itemDate) return false;
    
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}

// Additional helper functions
function prepareAcquisitionData(customers, period) {
  // Group customers by acquisition period
  const acquisitionByPeriod = {};
  
  customers.forEach(customer => {
    const date = customer.firstTransactionDate;
    const periodKey = getDatePeriodKey(date, period);
    
    if (!acquisitionByPeriod[periodKey]) {
      acquisitionByPeriod[periodKey] = 0;
    }
    acquisitionByPeriod[periodKey]++;
  });
  
  const sortedPeriods = Object.keys(acquisitionByPeriod).sort();
  
  return {
    labels: sortedPeriods.slice(-12), // Last 12 periods
  };
}
  };
  
  customers.forEach(customer => {
    if (customer.segment === 'vip') {
      distribution.vip++;
    } else if (customer.segment === 'at-risk') {
      distribution.atRisk++;
    } else if (customer.status === 'new') {
      distribution.new++;
    } else if (customer.status === 'active') {
      distribution.active++;
    } else {
      distribution.inactive++;
    }
  });
  
  return distribution;
}

function calculateSegmentMetrics(customerData) {
  const totalRevenue = customerData.totalRevenue;
  
  const segments = {
    vip: { customers: [], count: 0, revenue: 0, revenuePercentage: 0, averageLTV: 0 },
    regular: { customers: [], count: 0, revenue: 0, revenuePercentage: 0, averageLTV: 0 },
    atRisk: { customers: [], count: 0, percentage: 0, averageDaysSinceLastTransaction: 0 },
    new: { customers: [], count: 0, conversionRate: 0 }
  };
  });
          description: `${customer.transactionCount} giao dịch trong kỳ`,
        });
      });
  });
          customerDetail: `${daysSince} ngày không hoạt động`,
        });
      });
  });
          customerDetail: `${customer.transactionCount} giao dịch`,
        });
      });
      break;
  }
  
  return insights;
}

function getDatePeriodKey(date, period) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = Math.ceil(date.getDate() / 7);
  
  switch (period) {
    case 'weekly':
    default:
    'active': 'Hoạt động',
    'inactive': 'Không hoạt động'
  };
    'regular': 'Thường',
    'at-risk': 'Rủi ro',
    'new': 'Mới'
  };
    'medium': 'Trung bình',
    'low': 'Thấp'
  };
  return priorityMap[priority] || priority;
}

function updatePaginationInfo() {
  const startIndex = (customerState.currentPage - 1) * customerState.pageSize + 1;
  const endIndex = Math.min(customerState.currentPage * customerState.pageSize, customerState.totalCustomers);
  
  updateKPIElement('customers-showing', `${startIndex}-${endIndex}`);
  updateKPIElement('customers-total', customerState.totalCustomers.toString());
  
  // Update pagination numbers
  const paginationContainer = document.getElementById('customer-pagination-numbers');
  if (paginationContainer) {
    const totalPages = Math.ceil(customerState.totalCustomers / customerState.pageSize);
    let paginationHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === customerState.currentPage) {
        paginationHTML += `<span class="pagination-number active">${i}</span>`;
      } else {
        paginationHTML += `<button class="pagination-number" onclick="goToCustomerPage(${i})">${i}</button>`;
      }
    }
    
    paginationContainer.innerHTML = paginationHTML;
  }
}

function calculatePreviousPeriodCustomers(customerData, period) {
  // Placeholder for previous period calculation
  return {
    totalCustomers: Math.max(0, customerData.totalCustomers - Math.floor(Math.random() * 5)),
    activeCustomers: Math.max(0, customerData.activeCustomers - Math.floor(Math.random() * 3))
  };
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

// Global functions for template usage
window.refreshCustomerManagement = function() {
  loadCustomerManagement();
};

window.exportCustomerReport = function() {
};

window.openAddCustomerModal = function() {
  console.log('➕ Opening add customer modal...');
};

window.exportCustomerData = function() {
};

window.toggleCustomerLifecycleView = function(viewType) {
};

window.filterCustomers = function() {
  const searchTerm = document.getElementById('customer-search').value.toLowerCase();
  // Implementation for customer filtering
};

window.filterByStatus = function() {
  const status = document.getElementById('customer-status-filter').value;
  // Implementation for status filtering
};

window.toggleSelectAll = function() {
  const selectAll = document.getElementById('select-all-customers').checked;
  const checkboxes = document.querySelectorAll('.customer-checkbox');
  checkboxes.forEach(cb => cb.checked = selectAll);
};

window.viewCustomerDetails = function(customerId) {
};

window.editCustomer = function(customerId) {
  console.log(`✏️ Editing customer: ${customerId}`);
};

window.messageCustomer = function(customerId) {
};

window.executeInsightAction = function(action, customerId) {
};

window.previousCustomerPage = function() {
  if (customerState.currentPage > 1) {
    customerState.currentPage--;
    renderCustomersTable();
    updatePaginationInfo();
  }
};

window.nextCustomerPage = function() {
  const totalPages = Math.ceil(customerState.totalCustomers / customerState.pageSize);
  if (customerState.currentPage < totalPages) {
    customerState.currentPage++;
    renderCustomersTable();
    updatePaginationInfo();
  }
};

window.goToCustomerPage = function(page) {
  customerState.currentPage = page;
  renderCustomersTable();
  updatePaginationInfo();
};

// CRM Tools functions
window.sendBulkEmail = function() {
};

window.sendBulkSMS = function() {
};

window.createNewsletter = function() {
};

window.viewPendingTickets = function() {
};

window.createNewTicket = function() {
};

window.manageLoyaltyProgram = function() {
};

window.distributeRewards = function() {
};

window.generateCustomerReport = function() {
};

window.scheduleReport = function() {
};

function refreshAcquisitionChart(view) {
}

function refreshSegmentation() {
}

function refreshInsights() {
}