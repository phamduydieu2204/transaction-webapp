/**
 * revenueCharts.js
 * 
 * Revenue-specific chart components for financial dashboard
 * Handles revenue tracking, trends, and analysis charts
 */

import { 
  createOrUpdateChart, 
  createLineChartConfig, 
  createBarChartConfig,
  createPieChartConfig,
  CHART_COLORS,
  formatCurrencyForChart 
} from '../core/chartManager.js';

/**
 * Render revenue trend chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderRevenueTrendChart(metrics, containerId = 'revenueTrendChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for revenue trend chart`);
    return;
  }

  // Prepare monthly data for trend analysis
  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
  
  const revenueData = months.map(month => monthlyData[month]?.revenue || 0);
  const profitData = months.map(month => monthlyData[month]?.profit || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });
    },
    {
    }
  ];
  });
        font: { size: 16, weight: 'bold' }
      },
      }
    },
  }
  });
        font: { size: 16, weight: 'bold' }
      },
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            const software = softwareData[context.dataIndex];
            return [
              `${context.label}: ${formatCurrencyForChart(context.parsed)} (${percentage}%)`,
              `Giao dịch: ${software.transactionCount}`,
              `Trung bình: ${formatCurrencyForChart(software.averageValue)}`
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
 * Render monthly revenue comparison chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderMonthlyRevenueChart(metrics, containerId = 'monthlyRevenueChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for monthly revenue chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-6); // Last 6 months
  
  const revenueData = months.map(month => monthlyData[month]?.revenue || 0);
  const expenseData = months.map(month => monthlyData[month]?.expenses || 0);
  
  // Format month labels
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, monthNum - 1);
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  });
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
 * Render revenue growth chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderRevenueGrowthChart(metrics, containerId = 'revenueGrowthChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for revenue growth chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12);
  
  // Calculate month-over-month growth rates
  const growthRates = [];
  const labels = [];
  
  for (let i = 1; i < months.length; i++) {
    const currentMonth = monthlyData[months[i]];
    const previousMonth = monthlyData[months[i - 1]];
    
    if (currentMonth && previousMonth && previousMonth.revenue > 0) {
      const growthRate = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
      growthRates.push(growthRate);
      
      const [year, monthNum] = months[i].split('-');
      const date = new Date(year, monthNum - 1);
      labels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }));
    }
  }
  );
  }];
  });
        font: { size: 16, weight: 'bold' }
      },
      },
            const value = context.parsed.y.toFixed(1);
            return `Tăng trưởng: ${value}%`;
          }
        }
      }
    },
  }
    tableHTML += `
      <tr>
        <td class="software-name">${software.name}</td>
        <td class="revenue-amount">${formatCurrencyForChart(software.revenue)} VND</td>
        <td class="transaction-count">${software.transactionCount}</td>
        <td class="average-value">${formatCurrencyForChart(software.averageValue)} VND</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td><strong>Tổng cộng</strong></td>
            <td><strong>${formatCurrencyForChart(totalRevenue)} VND</strong></td>
            <td><strong>${metrics.transactionCount || 0}</strong></td>
            <td><strong>${formatCurrencyForChart(totalRevenue / (metrics.transactionCount || 1))} VND</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}