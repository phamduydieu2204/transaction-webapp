/**
 * accrualComponents.js
 * Accrual accounting components và logic
 */
    byMonth: {},
    byCategory: {},
    byDay: {},
  };

  // Get date range bounds
  });
        period: `${Math.ceil(fullPeriodDays / 30)} tháng`,
      });
      
      result.total += allocatedAmount;
      
    } else {
      // Non-allocated expense or no valid renewal date
      if (expenseDate >= rangeStart && expenseDate <= rangeEnd) {
        const day = normalizeDate(expense.date);
        const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        
        result.byDay[day] = (result.byDay[day] || 0) + amount;
        result.byMonth[month] = (result.byMonth[month] || 0) + amount;
        result.byCategory[category] = (result.byCategory[category] || 0) + amount;
        
        result.total += amount;
      }
    }
  });

  return result;
}

/**
 * Render Accrual chart component
 */
export function renderAccrualChart(accrualData) {
  return `
    <div class="chart-container">
      <h3>📅 Chi phí phân bổ (Accrual)</h3>
      <canvas id="accrualChart"></canvas>
      <div class="chart-summary">
        <div class="total-amount">${formatCurrency(accrualData.total, 'VND')}</div>
        <div class="chart-description">Tổng chi phí đã phân bổ</div>
      </div>
    </div>
  `;
}

/**
 * Render allocated expenses section
 */
export function renderAllocatedExpenses(allocatedExpenses) {
  if (allocatedExpenses.length === 0) return '';

  return `
    <div class="allocated-expenses-section">
      <h4>📅 Chi phí đã phân bổ</h4>
      <div class="allocation-list">
        ${allocatedExpenses.map(expense => `
          <div class="allocation-item">
            <div class="allocation-info">
              <span class="original-date">Chi ngày: ${expense.originalDate}</span>
              <span class="original-amount">${formatCurrency(expense.amount, 'VND')}</span>
            </div>
            <div class="allocation-details">
              <span class="allocated-amount">Phân bổ trong kỳ: ${formatCurrency(expense.allocatedAmount, 'VND')}</span>
              <span class="allocation-period">Kỳ phân bổ: ${getPeriodLabel(expense.period)}</span>
            </div>
            <div class="allocation-description">${expense.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Get period label
 */
    '1_month': '1 tháng',
    '3_months': '3 tháng',
    '6_months': '6 tháng',
    '12_months': '1 năm',
    'custom': 'Tùy chỉnh'
  };
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      borderColor: 'rgb(34, 197, 94)',
    }]
  };
}

/**
 * Format month label for charts
 */
function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  const monthNames = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return `${monthNames[parseInt(month)]}/${year}`;
}

/**
 * Analyze allocation effectiveness
 */
export function analyzeAllocationEffectiveness(accrualData) {
  const analysis = {
    totalAllocated: accrualData.allocatedExpenses.reduce((sum, exp) => sum + exp.allocatedAmount, 0),
  };
  
  // Calculate average allocation period
  });

    });
  }
  });

    });
  }
  
  return analysis;
}

/**
 * Calculate accrual smoothness index
 */
export function calculateAccrualSmoothness(accrualData) {
  const monthlyValues = Object.values(accrualData.byMonth);
  if (monthlyValues.length < 2) return { smoothness: 'N/A', coefficient: 0 };
    insight: `Chi phí phân bổ ${smoothness.toLowerCase()} qua các tháng`
  };
}