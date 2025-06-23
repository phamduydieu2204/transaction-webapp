/**
 * pdfExporter.js
 * 
 * PDF export functionality for financial dashboard
 * Handles data export to PDF format with charts and tables
 */

/**
 * Export financial dashboard to PDF
 * @param {Object} metrics - Financial metrics data
 * @param {Array} transactionData - Raw transaction data
 * @param {Array} expenseData - Raw expense data
 * @param {string} filename - Export filename
 */
export function exportFinancialDashboardToPDF(metrics, transactionData, expenseData, filename = 'financial-dashboard.pdf') {
  try {
    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
      throw new Error('jsPDF library not loaded');
    }

    // Create PDF document
    const { jsPDF } = window;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let yPosition = 20;
    
    // Add header
    yPosition = addPDFHeader(doc, yPosition);
    
    // Add summary section
    yPosition = addSummarySection(doc, metrics, yPosition);
    
    // Add new page for detailed analysis
    doc.addPage();
    yPosition = 20;
    
    // Add revenue analysis
    yPosition = addRevenueAnalysis(doc, metrics, yPosition);
    
    // Add expense analysis if there's space, otherwise new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    yPosition = addExpenseAnalysis(doc, metrics, yPosition);
    
    // Add performance metrics
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    addPerformanceMetrics(doc, metrics, yPosition);
    
    // Save PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('❌ Error exporting to PDF:', error);
    
    // Fallback to browser print
    exportToPrintFallback();
    return false;
  }
}

/**
 * Add PDF header
 * @param {Object} doc - jsPDF document
 * @param {number} yPosition - Current Y position
 * @returns {number} Updated Y position
 */
function addPDFHeader(doc, yPosition) {
  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BÁOCÁO TÀI CHÍNH TỔNG QUAN', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  // Date
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  doc.text(`Ngày xuất: ${currentDate}`, 105, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Divider line
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  
  return yPosition + 10;
}

/**
 * Add summary section to PDF
 * @param {Object} doc - jsPDF document
 * @param {Object} metrics - Financial metrics
 * @param {number} yPosition - Current Y position
 * @returns {number} Updated Y position
 */
function addSummarySection(doc, metrics, yPosition) {
  // Section title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('📊 TỔNG QUAN TÀI CHÍNH', 20, yPosition);
  yPosition += 10;
  
  // Create summary table
  const summaryData = [
    ['Chỉ số', 'Giá trị'],
    ['Tổng Doanh thu', formatCurrency(metrics.totalRevenue || 0)],
    ['Tổng Chi phí', formatCurrency(metrics.totalExpenses || 0)],
    ['Lợi nhuận ròng', formatCurrency(metrics.netProfit || 0)],
    ['Tỷ suất lợi nhuận', `${(metrics.profitMargin || 0).toFixed(1)}%`],
    ['Số giao dịch', (metrics.transactionCount || 0).toLocaleString()],
    ['Số chi phí', (metrics.expenseCount || 0).toLocaleString()]
  ];
  
  yPosition = addTableToPDF(doc, summaryData, yPosition, {
    headerStyle: { fillColor: [66, 139, 202] },
    alternateRowColors: true
  
  return yPosition + 10;
}

/**
 * Add revenue analysis section
 * @param {Object} doc - jsPDF document
 * @param {Object} metrics - Financial metrics
 * @param {number} yPosition - Current Y position
 * @returns {number} Updated Y position
 */
function addRevenueAnalysis(doc, metrics, yPosition) {
  // Section title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('💰 PHÂN TÍCH DOANH THU', 20, yPosition);
  yPosition += 10;
  
  const revenueByOrgSoftware = metrics.revenueByOrgSoftware || {};
  
  if (Object.keys(revenueByOrgSoftware).length === 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Không có dữ liệu doanh thu', 20, yPosition);
    return yPosition + 10;
  }
  
  // Create revenue table
  const revenueData = [['Phần mềm', 'Doanh thu', 'Giao dịch', '% Tổng']];
  const totalRevenue = metrics.totalRevenue || 0;
  
  Object.values(revenueByOrgSoftware)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10) // Top 10
    .forEach(software => {
      const percentage = totalRevenue > 0 ? ((software.revenue / totalRevenue) * 100).toFixed(1) : '0';
      revenueData.push([
        software.name.length > 15 ? software.name.substring(0, 15) + '...' : software.name,
        formatCurrency(software.revenue),
        software.transactionCount.toString(),
        `${percentage}%`
      ]);
    });
  
  yPosition = addTableToPDF(doc, revenueData, yPosition, {
    headerStyle: { fillColor: [40, 167, 69] },
    alternateRowColors: true,
    maxWidth: 170
  
  return yPosition + 10;
}

/**
 * Add expense analysis section
 * @param {Object} doc - jsPDF document
 * @param {Object} metrics - Financial metrics
 * @param {number} yPosition - Current Y position
 * @returns {number} Updated Y position
 */
function addExpenseAnalysis(doc, metrics, yPosition) {
  // Section title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('💸 PHÂN TÍCH CHI PHÍ', 20, yPosition);
  yPosition += 10;
  
  const expensesByCategory = metrics.expensesByCategory || {};
  
  if (Object.keys(expensesByCategory).length === 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Không có dữ liệu chi phí', 20, yPosition);
    return yPosition + 10;
  }
  
  // Create expense table
  const expenseData = [['Danh mục', 'Chi phí', 'Số lượng', '% Tổng']];
  const totalExpenses = metrics.totalExpenses || 0;
  
  Object.values(expensesByCategory)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10) // Top 10
    .forEach(category => {
      const percentage = totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : '0';
      expenseData.push([
        category.name.length > 15 ? category.name.substring(0, 15) + '...' : category.name,
        formatCurrency(category.amount),
        category.count.toString(),
        `${percentage}%`
      ]);
    });
  
  yPosition = addTableToPDF(doc, expenseData, yPosition, {
    headerStyle: { fillColor: [220, 53, 69] },
    alternateRowColors: true,
    maxWidth: 170
  
  return yPosition + 10;
}

/**
 * Add performance metrics section
 * @param {Object} doc - jsPDF document
 * @param {Object} metrics - Financial metrics
 * @param {number} yPosition - Current Y position
 * @returns {number} Updated Y position
 */
function addPerformanceMetrics(doc, metrics, yPosition) {
  // Section title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('📈 CHỈ SỐ HIỆU SUẤT', 20, yPosition);
  yPosition += 10;
  
  const { cashFlowMetrics = {}, growthMetrics = {} } = metrics;
  
  // Performance data
  const performanceData = [
    ['Chỉ số', 'Giá trị', 'Đánh giá'],
    [
      'Dòng tiền ròng (30 ngày)',
      formatCurrency(cashFlowMetrics.netCashFlow || 0),
      (cashFlowMetrics.netCashFlow || 0) >= 0 ? 'Tích cực' : 'Cần cải thiện'
    ],
    [
      'Tăng trưởng doanh thu',
      `${(growthMetrics.revenueGrowth || 0).toFixed(1)}%`,
      (growthMetrics.revenueGrowth || 0) >= 0 ? 'Tích cực' : 'Cần cải thiện'
    ],
    [
      'Burn Rate (ngày)',
      formatCurrency(cashFlowMetrics.burnRate || 0),
      (cashFlowMetrics.burnRate || 0) < 1000000 ? 'Hợp lý' : 'Cần kiểm soát'
    ],
    [
      'Runway',
      `${Math.round(cashFlowMetrics.runwayDays || 0)} ngày`,
      (cashFlowMetrics.runwayDays || 0) > 90 ? 'An toàn' : 'Cần chú ý'
    ]
  ];
  
  yPosition = addTableToPDF(doc, performanceData, yPosition, {
    headerStyle: { fillColor: [102, 16, 242] },
    alternateRowColors: true
  
  // Add footer
  yPosition += 20;
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  doc.text('* Báo cáo được tạo tự động từ hệ thống quản lý tài chính', 105, yPosition, { align: 'center' });
  
  return yPosition;
}

/**
 * Add table to PDF document
 * @param {Object} doc - jsPDF document
 * @param {Array} data - Table data (2D array)
 * @param {number} yPosition - Starting Y position
 * @param {Object} options - Table styling options
 * @returns {number} Updated Y position
 */
function addTableToPDF(doc, data, yPosition, options = {}) {
  const {
    headerStyle = { fillColor: [66, 139, 202] },
    alternateRowColors = false,
    maxWidth = 170,
    cellPadding = 3
  } = options;
  
  const startX = 20;
  const colWidth = maxWidth / data[0].length;
  const rowHeight = 8;
  
  data.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const currentY = yPosition + (rowIndex * rowHeight);
    
    // Set background color for header or alternating rows
    if (isHeader && headerStyle.fillColor) {
      doc.setFillColor(...headerStyle.fillColor);
      doc.rect(startX, currentY - rowHeight + 2, maxWidth, rowHeight, 'F');
    } else if (!isHeader && alternateRowColors && rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(startX, currentY - rowHeight + 2, maxWidth, rowHeight, 'F');
    }
    
    // Set text style
    doc.setFontSize(isHeader ? 11 : 10);
    doc.setFont(undefined, isHeader ? 'bold' : 'normal');
    doc.setTextColor(isHeader ? 255 : 0);
    
    // Add cell text
    row.forEach((cell, colIndex) => {
      const cellX = startX + (colIndex * colWidth) + cellPadding;
      const cellText = String(cell);
      
      // Truncate long text
      const maxCellWidth = colWidth - (cellPadding * 2);
      const textWidth = doc.getTextWidth(cellText);
      let displayText = cellText;
      
      if (textWidth > maxCellWidth) {
        // Truncate text to fit
        let truncated = cellText;
        while (doc.getTextWidth(truncated + '...') > maxCellWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        displayText = truncated + '...';
      }
      
      doc.text(displayText, cellX, currentY);
    });
  });
  
  // Add table border
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.rect(startX, yPosition - rowHeight + 2, maxWidth, data.length * rowHeight);
  
  // Add column separators
  for (let i = 1; i < data[0].length; i++) {
    const lineX = startX + (i * colWidth);
    doc.line(lineX, yPosition - rowHeight + 2, lineX, yPosition + ((data.length - 1) * rowHeight) + 2);
  }
  
  // Add row separators
  for (let i = 1; i < data.length; i++) {
    const lineY = yPosition + ((i - 1) * rowHeight) + 2;
    doc.line(startX, lineY, startX + maxWidth, lineY);
  }
  
  return yPosition + (data.length * rowHeight) + 5;
}

/**
 * Format currency for PDF display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 VND';
  
  if (Math.abs(amount) >= 1e9) {
    return (amount / 1e9).toFixed(1) + 'B VND';
  } else if (Math.abs(amount) >= 1e6) {
    return (amount / 1e6).toFixed(1) + 'M VND';
  } else if (Math.abs(amount) >= 1e3) {
    return (amount / 1e3).toFixed(1) + 'K VND';
  }
  
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
}

/**
 * Fallback to browser print when PDF export fails
 */
function exportToPrintFallback() {
  try {
    // Create a printable version of the dashboard
    const printWindow = window.open('', '_blank');
    const dashboardContent = document.getElementById('financialDashboard')?.innerHTML || 'Không có dữ liệu';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Báo cáo Tài chính</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .dashboard-wrapper { max-width: 100%; }
          @media print {
            .filter-panel, .dashboard-controls, button { display: none !important; }
            .chart-container { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Báo cáo Tài chính Tổng quan</h1>
        <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
        ${dashboardContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Trigger print after content loads
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    console.log('✅ Opened print dialog as fallback');
  } catch (error) {
    console.error('❌ Error in print fallback:', error);
    alert('Không thể xuất PDF. Vui lòng thử sao chép nội dung dashboard thủ công.');
  }
}