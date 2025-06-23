/**
 * kpiCards.js
 * 
 * KPI (Key Performance Indicator) cards for financial dashboard
 * Handles metric cards, alerts, and performance indicators
 */
  return `
    <div class="kpi-card profit-card ${profitClass}">
      <div class="card-header">
        <div class="card-icon">${profitIcon}</div>
        <div class="card-title">${isProfit ? 'Lợi nhuận' : 'Lỗ'}</div>
      </div>
      <div class="card-value">${formatCurrencyForChart(Math.abs(netProfit))} VND</div>
      <div class="card-detail">
        <span class="margin-text">Tỷ suất: ${profitMargin.toFixed(1)}%</span>
      </div>
    </div>
  `;
}

/**
 * Render transaction card
 * @param {number} transactionCount - Number of transactions
 * @param {number} totalRevenue - Total revenue for average calculation
 * @returns {string} HTML for transaction card
 */
  return `
    <div class="kpi-card transaction-card">
      <div class="card-header">
        <div class="card-icon">🔄</div>
        <div class="card-title">Giao dịch</div>
      </div>
      <div class="card-value">${transactionCount.toLocaleString()}</div>
      <div class="card-detail">
        <span class="avg-text">TB: ${formatCurrencyForChart(avgTransactionValue)} VND</span>
      </div>
    </div>
  `;
}

/**
 * Render cash flow tracker cards
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
  return `
    <div class="kpi-card small net-cash-flow-card ${cardClass}">
      <div class="card-header">
        <div class="card-icon">${icon}</div>
        <div class="card-title">Dòng tiền ròng</div>
      </div>
      <div class="card-value small">${formatCurrencyForChart(Math.abs(netCashFlow))}</div>
      <div class="card-detail">${isPositive ? 'Dương' : 'Âm'}</div>
    </div>
  `;
}

/**
 * Render weekly cash flow card
 */
  });
      description: `Tỷ suất lợi nhuận hiện tại chỉ ${profitMargin.toFixed(1)}%. Cần tối ưu chi phí hoặc tăng doanh thu.`
    });
  }

  // Negative profit alert
  });
      description: `Doanh nghiệp đang thua lỗ với tỷ suất ${profitMargin.toFixed(1)}%. Cần hành động khẩn cấp.`
    });
  }

  // Cash flow alerts
  });
      description: `Runway chỉ còn ${Math.round(cashFlowMetrics.runwayDays)} ngày. Cần bổ sung thanh khoản ngay.`
    });
  } else if (cashFlowMetrics.runwayDays && cashFlowMetrics.runwayDays < 90) {
  });
      description: `Runway còn ${Math.round(cashFlowMetrics.runwayDays)} ngày. Nên chuẩn bị kế hoạch tài chính.`
    });
  }

  // Negative growth alert
  });
      description: `Doanh thu giảm ${Math.abs(growthMetrics.revenueGrowth).toFixed(1)}% so với tháng trước.`
    });
  }

  // High expense growth alert
  });
      description: `Chi phí tăng ${growthMetrics.expenseGrowth.toFixed(1)}% so với tháng trước. Cần kiểm soát chi phí.`
    });
  }

  // High burn rate alert
  });
      description: `Tốc độ chi tiêu ${formatCurrencyForChart(cashFlowMetrics.burnRate)}/ngày. Cần tối ưu chi phí.`
    });
  }

  return alerts;
}