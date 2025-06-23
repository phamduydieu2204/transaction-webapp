/**
 * expenseAnalysis.js
 * 
 * Expense Analysis functionality - Phân tích chi phí chi tiết
 */

import { ensureDataIsLoaded, showError } from '../core/reportHelpers.js';
import { formatRevenue, formatCurrency, formatDate } from '../../formatDate.js';
import { getFromStorage } from '../../core/stateManager.js';
import { 
  calculateBusinessMetrics,
  calculateTotalRevenue,
  normalizeDate,
  getDateRange
} from '../../statisticsCore.js';
import { 
  getTransactionField, 
  normalizeTransaction 
} from '../../core/dataMapping.js';

/**
 * Load expense analysis report
 * @param {Object} options - Options for loading report
 * @param {Object} options.dateRange - Date range filter {start: 'yyyy/mm/dd', end: 'yyyy/mm/dd'}
 * @param {string} options.period - Period name (e.g., 'this_month', 'last_month')
 */
    // Get date range from options or global filters
    const dateRange = options.dateRange || window.globalFilters?.dateRange || null;
    const period = options.period || window.globalFilters?.period || 'this_month';
    
    // Filter data by date range
    const filteredExpenses = filterDataByDateRange(expenses, dateRange);
    const filteredTransactions = filterDataByDateRange(transactions, dateRange);
    
    // Load all components
    await Promise.all([
      updateExpenseKPIs(filteredExpenses, filteredTransactions, period),
      renderExpenseTrendChart(filteredExpenses, period),
      renderExpenseCategoryChart(filteredExpenses),
      renderBudgetComparisonChart(filteredExpenses),
      loadTopExpenseCategories(filteredExpenses),
      loadExpenseTypes(filteredExpenses),
      updateExpenseControlDashboard(filteredExpenses, filteredTransactions)
    ]);
    
    // Setup event handlers
    setupExpenseAnalysisHandlers();
  } catch (error) {
    console.error('❌ Error loading expense analysis:', error);
    showError('Không thể tải phân tích chi phí');
  }
}

/**
 * Load the expense analysis HTML template
 */
async function loadExpenseAnalysisHTML() {
  const container = document.getElementById('report-expense');
  if (!container) return;
  
  try {
    const response = await fetch('./partials/tabs/report-pages/expense-analysis.html');
    if (!response.ok) {
      throw new Error('Template not found');
    }
    
    const html = await response.text();
    container.innerHTML = html;
    container.classList.add('active');
  } catch (error) {
    console.error('❌ Could not load expense analysis template:', error);
  updateKPIElement('expense-ratio-value', `${expenseRatio.toFixed(1)}%`);
  
  // Calculate and update changes
  const expenseChange = calculatePercentageChange(
    previousMetrics.totalExpense, 
    currentMetrics.totalExpense
  );
  const avgChange = calculatePercentageChange(
    previousMetrics.avgExpenseValue, 
    currentMetrics.avgExpenseValue
  );
  
  updateChangeElement('total-expense-change', expenseChange);
  updateChangeElement('avg-expense-change', avgChange);
  
  // Update largest expense details
  if (currentMetrics.largestExpense.description) {
    updateKPIElement('largest-expense-detail', 
      `${currentMetrics.largestExpense.category || 'N/A'} - ${currentMetrics.largestExpense.description}`);
  }
  
}

/**
 * Calculate expense metrics from expenses
 */
function calculateExpenseMetrics(expenses) {
  let totalExpense = 0;
  let largestExpense = { amount: 0, category: '', description: '' };
  });
      };
    }
  });
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
  });
      }]
    },
      },
        },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
              return `Chi phí: ${formatRevenue(context.parsed.y)}`;
            }
          }
        }
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
 * Render expense category chart (pie/bar)
 */
          '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
          '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
        ],
      }]
    },
  });
          }
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
 * Render budget comparison chart
 */
        {
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
  });
        },
        {
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        }
      ]
    },
        },
              return `${context.dataset.label}: ${formatRevenue(context.parsed.y)}`;
            }
          }
        }
      },
    return `
      <tr class="${typeClass}">
        <td class="type-col">
          <div class="type-indicator ${typeClass}">
            <i class="fas ${typeIcon}"></i>
            ${expense.isRecurring ? 'Định kỳ' : 'Một lần'}
          </div>
        </td>
        <td class="description-col">${expense.description}</td>
        <td class="frequency-col">${expense.frequency}</td>
        <td class="amount-col">${formatRevenue(expense.amount)}</td>
        <td class="next-col">${expense.nextDate || 'N/A'}</td>
        <td class="action-col">
          <button class="action-btn" onclick="editExpense('${expense.id}')">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update expense control dashboard
 */
async function updateExpenseControlDashboard(expenses, transactions) {
  
  // Update budget alerts
  const budgetAlerts = generateBudgetAlerts(expenses);
  updateBudgetAlerts(budgetAlerts);
  
  // Update optimization suggestions
  const optimizationSuggestions = generateOptimizationSuggestions(expenses);
  updateOptimizationSuggestions(optimizationSuggestions);
  
  // Update expense forecast
  const forecast = calculateExpenseForecast(expenses);
  updateExpenseForecast(forecast);
  
  // Update expense insights
  const insights = generateExpenseInsights(expenses, transactions);
  updateExpenseInsights(insights);
}

/**
 * Setup event handlers for expense analysis
 */
function setupExpenseAnalysisHandlers() {
  // Period selector buttons
  const periodBtns = document.querySelectorAll('.period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      periodBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const period = e.target.dataset.period;
      refreshExpenseChart(period);
    });
  });
  
  // View selector buttons
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.chart-container, .table-container');
      const viewBtns = container.querySelectorAll('.view-btn');
      
      viewBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const view = e.target.dataset.view;
      if (container.classList.contains('budget-vs-actual')) {
        refreshBudgetChart(view);
      } else {
        refreshExpenseTable(view);
      }
    });
  });
  
  // Filter selector buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.table-container');
      const filterBtns = container.querySelectorAll('.filter-btn');
      
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.dataset.filter;
      filterExpenseTypes(filter);
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
    element.className = `kpi-change ${isPositive ? 'negative' : 'positive'}`; // For expenses, less is better
  }
}
  return ((current - previous) / previous) * 100;
}

function filterDataByDateRange(data, dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) return data;
  
  return data.filter(item => {
    const itemDate = normalizeDate(item.ngayTao || item.date || item.transactionDate);
    if (!itemDate) return false;
    
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}

// Additional helper functions for data processing
function prepareExpenseTrendData(expenses, period) {
  // Implementation for expense trend data preparation
  return {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    values: [50000, 75000, 60000, 90000] // Placeholder data
  };
}
  };
}
    budget: [5000000, 3000000, 2000000, 8000000, 1000000],
    actual: [4500000, 3500000, 1800000, 7500000, 1200000]
  };
}
  });
      };
    }
    
    categories[categoryName].amount += amount;
    categories[categoryName].count++;
  });
  
  return Object.values(categories).map(category => ({
    ...category
  });
  }));
}

function analyzeExpenseTypes(expenses) {
  // Placeholder implementation for expense type analysis
  return expenses.slice(0, 10).map((expense, index) => ({
    id: `expense-${index}`,
    isRecurring: Math.random() > 0.5, // Placeholder logic
  }));
}

function calculateCategoryTrend(categoryName, expenses) {
  // Placeholder implementation for category trend calculation
  return { type: 'down', icon: 'arrow-down', value: '-8' };
}
    }
  ];
}
    }
  ];
}
  };
}
    },
    },
    },
    }
  };
}

function updateBudgetAlerts(alerts) {
  const container = document.getElementById('budget-alerts-list');
  if (!container) return;
  
  container.innerHTML = alerts.map(alert => `
    <div class="alert-item">
      <div class="alert-icon ${alert.type}">
        <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      </div>
      <div class="alert-content">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-description">${alert.description}</div>
      </div>
    </div>
  `).join('');
}

function updateOptimizationSuggestions(suggestions) {
  const container = document.getElementById('optimization-suggestions');
  if (!container) return;
  
  container.innerHTML = suggestions.map(suggestion => `
    <div class="optimization-item">
      <div class="optimization-icon">
        <i class="fas fa-lightbulb"></i>
      </div>
      <div class="optimization-content">
        <div class="optimization-title">${suggestion.title}</div>
        <div class="optimization-description">${suggestion.description}</div>
        <div class="optimization-savings">Tiết kiệm: ${formatRevenue(suggestion.savings)}</div>
      </div>
    </div>
  `).join('');
}
  updateKPIElement('forecast-confidence', `${forecast.confidence}%`);
}

function updateExpenseInsights(insights) {
  updateKPIElement('saving-opportunity-value', insights.savingOpportunity.value);
  updateKPIElement('saving-opportunity-desc', insights.savingOpportunity.description);
  
  updateKPIElement('spending-pattern-value', insights.spendingPattern.value);
  updateKPIElement('spending-pattern-desc', insights.spendingPattern.description);
  
  updateKPIElement('cost-efficiency-value', insights.costEfficiency.value);
  updateKPIElement('cost-efficiency-desc', insights.costEfficiency.description);
  
  updateKPIElement('expense-risk-value', insights.expenseRisk.value);
  updateKPIElement('expense-risk-desc', insights.expenseRisk.description);
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

// Global functions for template usage
window.refreshExpenseAnalysis = function() {
  loadExpenseAnalysis();
};

window.exportExpenseReport = function() {
  // Implementation for export functionality
};

window.exportCategoryExpenseData = function() {
};

window.exportExpenseTypesData = function() {
};

window.toggleExpenseChartView = function(chartType, viewType) {
};

window.editExpense = function(expenseId) {
  console.log(`✏️ Editing expense: ${expenseId}`);
};

function refreshExpenseChart(period) {
  // Implementation for chart refresh
}

function refreshBudgetChart(view) {
  // Implementation for budget chart refresh
}

function refreshExpenseTable(view) {
  // Implementation for table refresh
}

function filterExpenseTypes(filter) {
  // Implementation for expense type filtering
}