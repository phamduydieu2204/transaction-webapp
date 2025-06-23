/**
 * expenseCharts.js
 * 
 * Expense-specific chart components for financial dashboard
 * Handles expense tracking, categorization, and analysis charts
 */
  });
        font: { size: 16, weight: 'bold' }
      },
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            const category = categoryData[context.dataIndex];
            return [
              `${context.label}: ${formatCurrencyForChart(context.parsed)} (${percentage}%)`,
              `Số lượng: ${category.count}`,
              `Trung bình: ${formatCurrencyForChart(category.averageAmount)}`
            ];
          }
        }
      }
    }
  });

  // Create canvas if it doesn't exist
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}

/**
 * Render monthly expense trend chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderExpenseTrendChart(metrics, containerId = 'expenseTrendChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for expense trend chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
  
  const expenseData = months.map(month => monthlyData[month]?.expenses || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });
  }];
  });
        font: { size: 16, weight: 'bold' }
      }
    },
  }
    },
    {
    }
  ];
        font: { size: 16, weight: 'bold' }
      },
      }
    },
  });

  }

  createOrUpdateChart(containerId + 'Canvas', config);
}

/**
 * Render expense efficiency chart (cost per transaction)
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderExpenseEfficiencyChart(metrics, containerId = 'expenseEfficiencyChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for expense efficiency chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-6); // Last 6 months
  
  // Calculate expense efficiency metrics
  const efficiencyData = months.map(month => {
    const data = monthlyData[month];
    if (!data || data.revenue === 0) return 0;
    
    // Cost as percentage of revenue
    return (data.expenses / data.revenue) * 100;
  });
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });

  // Color bars based on efficiency (lower is better)
  }];
  });
        font: { size: 16, weight: 'bold' }
      },
      },
            const value = context.parsed.y.toFixed(1);
            return `Chi phí/DT: ${value}%`;
          }
        }
      }
    },
  }
    tableHTML += `
      <tr>
        <td class="category-name">${category.name}</td>
        <td class="expense-amount">${formatCurrencyForChart(category.amount)} VND</td>
        <td class="expense-count">${category.count}</td>
        <td class="average-amount">${formatCurrencyForChart(category.averageAmount)} VND</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Tổng cộng</strong></td>
            <td><strong>${formatCurrencyForChart(totalExpenses)} VND</strong></td>
            <td><strong>${metrics.expenseCount || 0}</strong></td>
            <td><strong>${formatCurrencyForChart(totalExpenses / (metrics.expenseCount || 1))} VND</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}

/**
 * Render top expense items
 * @param {Array} expenseData - Raw expense data
 * @param {string} containerId - Container element ID
 * @param {number} limit - Number of top items to show
 */
export function renderTopExpenseItems(expenseData, containerId = 'topExpenseItems', limit = 10) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for top expense items`);
    return;
  }

  // Sort expenses by amount
  const sortedExpenses = [...expenseData]
    .sort((a, b) => (parseFloat(b.soTien || b.amount) || 0) - (parseFloat(a.soTien || a.amount) || 0))
    .slice(0, limit);

  if (sortedExpenses.length === 0) {
    container.innerHTML = '<div class="no-data">Không có dữ liệu chi phí</div>';
    return;
  }

  let html = `
    <div class="top-expenses">
      <h4>💸 Top ${limit} Chi phí Lớn nhất</h4>
      <div class="expense-list">
  `;

  sortedExpenses.forEach((expense, index) => {
    const amount = parseFloat(expense.soTien || expense.amount) || 0;
    const description = expense.moTa || expense.description || 'Không có mô tả';
    const category = expense.loaiChiPhi || expense.category || 'Khác';
    const date = new Date(expense.ngayTao || expense.date).toLocaleDateString('vi-VN');

    html += `
      <div class="expense-item">
        <div class="expense-rank">#${index + 1}</div>
        <div class="expense-details">
          <div class="expense-description">${description}</div>
          <div class="expense-meta">
            <span class="expense-category">${category}</span> • 
            <span class="expense-date">${date}</span>
          </div>
        </div>
        <div class="expense-amount">${formatCurrencyForChart(amount)} VND</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}