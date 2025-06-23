/**
 * comparisonLogic.js
 * Cash vs accrual comparison và analysis
 */

    monthlyDifferences: {},
  };

  // Compare by month

  });
    };
  });

  // Generate insights

  });
      message: `Chênh lệch lớn: ${formatCurrency(Math.abs(comparison.totalDifference), 'VND')} giữa 2 phương pháp`
    });
  }

  });
    });
  }

  return `
    <div class="comparison-summary">
      <div class="summary-card">
        <h3>📊 Tổng quan</h3>
        <div class="summary-item">
          <span>Chênh lệch tổng:</span>
          <span class="${differenceClass}">${formatCurrency(Math.abs(comparison.totalDifference), 'VND')}</span>
        </div>
        <div class="summary-item">
          <span>Tỷ lệ chênh lệch:</span>
          <span>${comparison.percentDifference.toFixed(1)}%</span>
        </div>
      </div>
      
      ${comparison.insights.map(insight => `
        <div class="insight-card ${insight.type}">
          <i class="fas fa-${insight.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
          ${insight.message}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render dual view charts
 */
export function renderDualViewCharts(cashFlow, accrual) {

            return `
              <tr>
                <td>${formatMonth(month)}</td>
                <td class="amount">${formatCurrency(cfAmount, 'VND')}</td>
                <td class="amount">${formatCurrency(acAmount, 'VND')}</td>
                <td class="amount ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}">
                  ${formatCurrency(Math.abs(difference), 'VND')}
                </td>
                <td>${note}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <th>Tổng cộng</th>
            <th class="amount">${formatCurrency(cashFlow.total, 'VND')}</th>
            <th class="amount">${formatCurrency(accrual.total, 'VND')}</th>
            <th class="amount ${cashFlow.total - accrual.total > 0 ? 'positive' : 'negative'}">
              ${formatCurrency(Math.abs(cashFlow.total - accrual.total), 'VND')}
            </th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

/**
 * Render insights section
 */
export function renderInsights(comparison) {
  return `
    <div class="insights-section">
      <h3>💡 Phân tích & Khuyến nghị</h3>
      <div class="insights-grid">
        <div class="insight-card">
          <h4>📊 Sử dụng báo cáo nào?</h4>
          <ul>
            <li><strong>Cash Flow:</strong> Để quản lý dòng tiền, lập kế hoạch chi tiêu</li>
            <li><strong>Chi phí phân bổ:</strong> Để đánh giá hiệu quả kinh doanh, tính lợi nhuận chính xác</li>
          </ul>
        </div>
        
        <div class="insight-card">
          <h4>🎯 Khuyến nghị</h4>
          <ul>
            <li>Phân bổ các chi phí định kỳ (thuê nhà, lương, bảo hiểm)</li>
            <li>Theo dõi cả 2 góc độ để có cái nhìn toàn diện</li>
            <li>Sử dụng Cash Flow cho quản lý ngắn hạn</li>
            <li>Sử dụng Accrual cho báo cáo tài chính</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format month for display
 */
function formatMonth(monthStr) {

  };
  
  // Find months with significant variance

  });
    });
  }

  };
  
  // Calculate timing differences from allocated expenses

  });
    });
  }
  
  // Calculate unexplained difference
  const explainedDifference = reconciliation.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  reconciliation.unexplainedDifference = (cashFlow.total - accrual.total) - explainedDifference;
  
  return reconciliation;
}