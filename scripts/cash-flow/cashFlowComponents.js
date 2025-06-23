/**
 * cashFlowComponents.js
 * Cash flow chart components và calculation
 */
    byMonth: {},
    byCategory: {},
    byDay: {},
  };
  });

      });
    }
  });

  return result;
}

/**
 * Render Cash Flow chart component
 */
export function renderCashFlowChart(cashFlowData) {
  return `
    <div class="chart-container">
      <h3>💵 Cash Flow (Dòng tiền thực)</h3>
      <canvas id="cashFlowChart"></canvas>
      <div class="chart-summary">
        <div class="total-amount">${formatCurrency(cashFlowData.total, 'VND')}</div>
        <div class="chart-description">Tổng tiền chi thực tế</div>
      </div>
    </div>
  `;
}

/**
 * Render large payments section
 */
export function renderLargePayments(largePayments) {
  if (largePayments.length === 0) return '';

  return `
    <div class="large-payments-section">
      <h4>💸 Các khoản chi lớn (> 10 triệu)</h4>
      <div class="payment-list">
        ${largePayments.map(payment => `
          <div class="payment-item">
            <div class="payment-date">${payment.date}</div>
            <div class="payment-amount">${formatCurrency(payment.amount, 'VND')}</div>
            <div class="payment-description">${payment.description}</div>
            <div class="payment-allocation ${payment.allocation === 'Có' ? 'allocated' : 'not-allocated'}">
              ${payment.allocation === 'Có' ? 
                '✅ Đã phân bổ' : 
                '⚠️ Chưa phân bổ - Cân nhắc phân bổ để báo cáo chính xác hơn'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Prepare cash flow data for Chart.js
 */
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
    }]
  };
}

/**
 * Format month label for charts
 */
  });

    });
  }
    max: { month: months[values.indexOf(maxAmount)], value: maxAmount },
    min: { month: months[values.indexOf(minAmount)], value: minAmount },
  };
}

/**
 * Generate cash flow insights
 */
  });
      message: `${cashFlowData.largePayments.length} khoản chi lớn chiếm ${percentLarge.toFixed(1)}% tổng chi phí`
    });
  }
  });
      message: `Dòng tiền biến động mạnh giữa các tháng (chênh lệch ${formatCurrency(trends.volatility, 'VND')})`
    });
  }
  
  return insights;
}