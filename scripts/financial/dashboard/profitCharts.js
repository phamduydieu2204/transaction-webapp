/**
 * profitCharts.js
 * 
 * Profit and profitability analysis charts for financial dashboard
 * Handles profit tracking, margins, and profitability metrics
 */

import { 
  createOrUpdateChart, 
  createLineChartConfig, 
  createBarChartConfig,
  CHART_COLORS,
  formatCurrencyForChart 
} from '../core/chartManager.js';

/**
 * Render profit trend chart
 * @param {Object} metrics - Financial metrics data
 * @param {string} containerId - Container element ID
 */
export function renderProfitTrendChart(metrics, containerId = 'profitTrendChart') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found for profit trend chart`);
    return;
  }

  const monthlyData = metrics.monthlyData || {};
  const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
  
  const profitData = months.map(month => monthlyData[month]?.profit || 0);
  const profitMarginData = months.map(month => monthlyData[month]?.profitMargin || 0);
  
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
      },
        },
        },
      }
    }
  });

  // Create canvas if it doesn't exist
  }
  });

    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8); // Top 8 software
  );
    }
  ];
  });
        font: { size: 16, weight: 'bold' }
      },
            const software = softwareProfitData[context.dataIndex];
            return [
              `Lợi nhuận: ${formatCurrencyForChart(software.profit)}`,
              `Doanh thu: ${formatCurrencyForChart(software.revenue)}`,
              `Chi phí ước tính: ${formatCurrencyForChart(software.estimatedExpenses)}`,
              `Tỷ suất: ${software.profitMargin.toFixed(1)}%`
            ];
          }
        }
      }
    },
  }
      };
    }
    },
    {
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
  // Calculate profit margins by software
  });

      };
    })
    .filter(item => item.revenue > 0) // Only include software with revenue
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10); // Top 10
  }];

  const config = createBarChartConfig(labels, datasets, {
    indexAxis: 'y', // Horizontal bar chart
  });
        font: { size: 16, weight: 'bold' }
      },
      },
            const software = marginData[context.dataIndex];
            return [
              `Tỷ suất: ${software.margin.toFixed(1)}%`,
              `Doanh thu: ${formatCurrencyForChart(software.revenue)}`
            ];
          }
        }
      }
    },
  }

  createOrUpdateChart(containerId + 'Canvas', config);
}