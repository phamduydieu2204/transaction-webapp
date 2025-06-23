/**
 * reportUtilities.js
 * Report generation utilities và helpers
 */

/**
 * Render report header
 */
export function renderReportHeader(dateRange) {
  const periodLabel = dateRange && dateRange.start && dateRange.end ?
    `${dateRange.start} - ${dateRange.end}` : 'Tất cả thời gian';

  return `
    <div class="report-header">
      <h2>💰 So sánh Cash Flow vs Chi phí phân bổ</h2>
      <p class="period-info">Kỳ báo cáo: ${periodLabel}</p>
      <div class="help-text">
        <p><strong>Cash Flow:</strong> Dòng tiền thực tế chi ra (ngày nào chi tiền thì ghi nhận ngày đó)</p>
        <p><strong>Chi phí phân bổ:</strong> Phân bổ đều chi phí cho kỳ sử dụng (ví dụ: thuê nhà tháng 1 phân bổ đều cho 30 ngày)</p>
      </div>
    </div>
  `;
}

/**
 * Add report interactivity
 */
export function addReportInteractivity() {
  // Initialize charts if Chart.js is available
  if (typeof Chart !== 'undefined') {
    // Implementation would go here
  }
}

/**
 * Add CSS styles for the report
 */
export function addCashFlowVsAccrualStyles() {
  if (document.getElementById('cashflow-accrual-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'cashflow-accrual-styles';
  styles.textContent = `
    /* Cash Flow vs Accrual Report Styles */
    .cashflow-accrual-report {
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    
    .report-header h2 {
      margin: 0 0 15px 0;
      font-size: 28px;
    }
    
    .help-text {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    
    .help-text p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .comparison-summary {
      display: grid;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .summary-card h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .summary-item:last-child {
      border-bottom: none;
    }
    
    .positive {
      color: #22c55e;
      font-weight: 600;
    }
    
    .negative {
      color: #ef4444;
      font-weight: 600;
    }
    
    .insight-card {
      padding: 15px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .insight-card.warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .insight-card.info {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .dual-view-charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .chart-container h3 {
      margin: 0 0 20px 0;
      color: #333;
    }
    
    .chart-summary {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    .total-amount {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }
    
    .chart-description {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .comparison-table {
      width: 100%;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .comparison-table th,
    .comparison-table td {
      padding: 12px;
      text-align: left;
    }
    
    .comparison-table thead {
      background: #f3f4f6;
    }
    
    .comparison-table tbody tr:hover {
      background: #f9fafb;
    }
    
    .comparison-table .amount {
      text-align: right;
      font-family: 'Courier New', monospace;
    }
    
    .comparison-table tfoot {
      background: #f3f4f6;
      font-weight: 600;
    }
    
    .large-payments-section,
    .allocated-expenses-section {
      margin-top: 30px;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .payment-item,
    .allocation-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: grid;
      gap: 10px;
    }
    
    .payment-item:last-child,
    .allocation-item:last-child {
      border-bottom: none;
    }
    
    .payment-allocation.allocated {
      color: #22c55e;
    }
    
    .payment-allocation.not-allocated {
      color: #f59e0b;
    }
    
    .insights-section {
      margin-top: 40px;
    }
    
    .insights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .insights-grid .insight-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: block;
    }
    
    .insights-grid .insight-card h4 {
      margin: 0 0 15px 0;
      color: #333;
    }
    
    .insights-grid .insight-card ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .insights-grid .insight-card li {
      margin: 8px 0;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .dual-view-charts,
      .insights-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  
  document.head.appendChild(styles);
}

/**
 * Export report to PDF
 */
export function exportReportToPDF(reportData, filename = 'cashflow-accrual-report.pdf') {
  // This would require a PDF library like jsPDF
}

/**
 * Export report to Excel
 */
export function exportReportToExcel(reportData, filename = 'cashflow-accrual-report.xlsx') {
  // This would require an Excel library like SheetJS
}

/**
 * Generate report summary
 */
export function generateReportSummary(cashFlow, accrual, comparison) {
  return {
    period: comparison.dateRange || 'All time',
    cashFlowTotal: cashFlow.total,
    accrualTotal: accrual.total,
    difference: comparison.totalDifference,
    percentDifference: comparison.percentDifference,
    insights: comparison.insights.length,
    largePayments: cashFlow.largePayments.length,
    allocatedExpenses: accrual.allocatedExpenses.length
  };
}

/**
 * Format report for printing
 */
export function formatReportForPrint() {
  return `
    <style>
      @media print {
        .no-print { display: none !important; }
        .page-break { page-break-after: always; }
        body { font-size: 12pt; }
        .chart-container { page-break-inside: avoid; }
      }
    </style>
  `;
}

// Auto-add styles when module loads
addCashFlowVsAccrualStyles();