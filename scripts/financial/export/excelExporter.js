/**
 * excelExporter.js
 * 
 * Excel export functionality for financial dashboard
 * Handles data export to Excel format
 */

/**
 * Export financial dashboard data to Excel
 * @param {Object} metrics - Financial metrics data
 * @param {Array} transactionData - Raw transaction data
 * @param {Array} expenseData - Raw expense data
 * @param {string} filename - Export filename
 */
export function exportFinancialDashboardToExcel(metrics, transactionData, expenseData, filename = 'financial-dashboard.xlsx') {
  try {
    // Check if SheetJS is available
    if (typeof XLSX === 'undefined') {
      throw new Error('SheetJS library not loaded');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add summary sheet
    addSummarySheet(workbook, metrics);

    // Add transaction data sheet
    addTransactionSheet(workbook, transactionData);

    // Add expense data sheet
    addExpenseSheet(workbook, expenseData);

    // Add revenue analysis sheet
    addRevenueAnalysisSheet(workbook, metrics);

    // Add expense analysis sheet
    addExpenseAnalysisSheet(workbook, metrics);

    // Export file
    XLSX.writeFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    
    // Fallback to CSV export
    exportToCSVFallback(metrics, transactionData, expenseData);
    return false;
  }
}

/**
 * Add summary sheet to workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Object} metrics - Financial metrics
 */
function addSummarySheet(workbook, metrics) {
  const summaryData = [
    ['TỔNG QUAN TÀI CHÍNH', '', ''],
    ['Chỉ số', 'Giá trị', 'Đơn vị'],
    ['Tổng Doanh thu', metrics.totalRevenue || 0, 'VND'],
    ['Tổng Chi phí', metrics.totalExpenses || 0, 'VND'],
    ['Lợi nhuận ròng', metrics.netProfit || 0, 'VND'],
    ['Tỷ suất lợi nhuận', metrics.profitMargin || 0, '%'],
    ['Số giao dịch', metrics.transactionCount || 0, 'giao dịch'],
    ['Số chi phí', metrics.expenseCount || 0, 'khoản'],
    ['', '', ''],
    ['DÒNG TIỀN (30 NGÀY)', '', ''],
    ['Tiền vào', metrics.cashFlowMetrics?.recentCashInflow || 0, 'VND'],
    ['Tiền ra', metrics.cashFlowMetrics?.recentCashOutflow || 0, 'VND'],
    ['Dòng tiền ròng', metrics.cashFlowMetrics?.netCashFlow || 0, 'VND'],
    ['Burn Rate (ngày)', metrics.cashFlowMetrics?.burnRate || 0, 'VND/ngày'],
    ['Runway', metrics.cashFlowMetrics?.runwayDays || 0, 'ngày'],
    ['', '', ''],
    ['TĂNG TRƯỞNG', '', ''],
    ['Tăng trưởng doanh thu', metrics.growthMetrics?.revenueGrowth || 0, '%'],
    ['Tăng trưởng chi phí', metrics.growthMetrics?.expenseGrowth || 0, '%'],
    ['Doanh thu tháng hiện tại', metrics.growthMetrics?.currentMonthRevenue || 0, 'VND'],
    ['Doanh thu tháng trước', metrics.growthMetrics?.lastMonthRevenue || 0, 'VND']
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 25 },
    { width: 20 },
    { width: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, ws, 'Tổng quan');
}

/**
 * Add transaction data sheet to workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Array} transactionData - Transaction data
 */
function addTransactionSheet(workbook, transactionData) {
  if (!transactionData || transactionData.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['Không có dữ liệu giao dịch']]);
    XLSX.utils.book_append_sheet(workbook, ws, 'Giao dịch');
    return;
  }

  // Prepare transaction data for export
  const exportData = transactionData.map(transaction => ({
    'Ngày tạo': transaction.ngayTao || '',
    'Khách hàng': transaction.customer || '',
    'Phần mềm': transaction.software || '',
    'Gói': transaction.package || '',
    'Doanh thu': parseFloat(transaction.revenue) || 0,
    'Ngày bắt đầu': transaction.ngayBatDau || '',
    'Ngày kết thúc': transaction.ngayKetThuc || '',
    'Loại giao dịch': transaction.transactionType || '',
    'Ghi chú': transaction.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 12 }, // Ngày tạo
    { width: 20 }, // Khách hàng
    { width: 15 }, // Phần mềm
    { width: 15 }, // Gói
    { width: 15 }, // Doanh thu
    { width: 12 }, // Ngày bắt đầu
    { width: 12 }, // Ngày kết thúc
    { width: 15 }, // Loại giao dịch
    { width: 30 }  // Ghi chú
  ];

  XLSX.utils.book_append_sheet(workbook, ws, 'Giao dịch');
}

/**
 * Add expense data sheet to workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Array} expenseData - Expense data
 */
function addExpenseSheet(workbook, expenseData) {
  if (!expenseData || expenseData.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['Không có dữ liệu chi phí']]);
    XLSX.utils.book_append_sheet(workbook, ws, 'Chi phí');
    return;
  }

  // Prepare expense data for export
  const exportData = expenseData.map(expense => ({
    'Ngày tạo': expense.ngayTao || expense.date || '',
    'Loại chi phí': expense.loaiChiPhi || expense.category || '',
    'Mô tả': expense.moTa || expense.description || '',
    'Số tiền': parseFloat(expense.soTien || expense.amount) || 0,
    'Phương thức thanh toán': expense.phuongThucThanhToan || expense.paymentMethod || '',
    'Ghi chú': expense.ghiChu || expense.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 12 }, // Ngày tạo
    { width: 20 }, // Loại chi phí
    { width: 30 }, // Mô tả
    { width: 15 }, // Số tiền
    { width: 20 }, // Phương thức thanh toán
    { width: 30 }  // Ghi chú
  ];

  XLSX.utils.book_append_sheet(workbook, ws, 'Chi phí');
}

/**
 * Add revenue analysis sheet to workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Object} metrics - Financial metrics
 */
function addRevenueAnalysisSheet(workbook, metrics) {
  const revenueByOrgSoftware = metrics.revenueByOrgSoftware || {};
  
  if (Object.keys(revenueByOrgSoftware).length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['Không có dữ liệu phân tích doanh thu']]);
    XLSX.utils.book_append_sheet(workbook, ws, 'Phân tích DT');
    return;
  }

  // Header
  const analysisData = [
    ['PHÂN TÍCH DOANH THU THEO PHẦN MỀM', '', '', '', ''],
    ['Phần mềm', 'Doanh thu', 'Số giao dịch', 'Trung bình', '% Tổng DT']
  ];

  const totalRevenue = metrics.totalRevenue || 0;

  // Add software data
  Object.values(revenueByOrgSoftware)
    .sort((a, b) => b.revenue - a.revenue)
    .forEach(software => {
      const percentage = totalRevenue > 0 ? ((software.revenue / totalRevenue) * 100).toFixed(1) : '0';
      analysisData.push([
        software.name,
        software.revenue,
        software.transactionCount,
        software.averageValue,
        percentage + '%'
      ]);
    });

  // Add total row
  analysisData.push([
    'TỔNG CỘNG',
    totalRevenue,
    metrics.transactionCount || 0,
    totalRevenue / (metrics.transactionCount || 1),
    '100%'
  ]);

  const ws = XLSX.utils.aoa_to_sheet(analysisData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 25 }, // Phần mềm
    { width: 15 }, // Doanh thu
    { width: 12 }, // Số giao dịch
    { width: 15 }, // Trung bình
    { width: 12 }  // % Tổng DT
  ];

  XLSX.utils.book_append_sheet(workbook, ws, 'Phân tích DT');
}

/**
 * Add expense analysis sheet to workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Object} metrics - Financial metrics
 */
function addExpenseAnalysisSheet(workbook, metrics) {
  const expensesByCategory = metrics.expensesByCategory || {};
  
  if (Object.keys(expensesByCategory).length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['Không có dữ liệu phân tích chi phí']]);
    XLSX.utils.book_append_sheet(workbook, ws, 'Phân tích CP');
    return;
  }

  // Header
  const analysisData = [
    ['PHÂN TÍCH CHI PHÍ THEO DANH MỤC', '', '', '', ''],
    ['Danh mục', 'Chi phí', 'Số lượng', 'Trung bình', '% Tổng CP']
  ];

  const totalExpenses = metrics.totalExpenses || 0;

  // Add category data
  Object.values(expensesByCategory)
    .sort((a, b) => b.amount - a.amount)
    .forEach(category => {
      const percentage = totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : '0';
      analysisData.push([
        category.name,
        category.amount,
        category.count,
        category.averageAmount,
        percentage + '%'
      ]);
    });

  // Add total row
  analysisData.push([
    'TỔNG CỘNG',
    totalExpenses,
    metrics.expenseCount || 0,
    totalExpenses / (metrics.expenseCount || 1),
    '100%'
  ]);

  const ws = XLSX.utils.aoa_to_sheet(analysisData);
  
  // Set column widths
  ws['!cols'] = [
    { width: 25 }, // Danh mục
    { width: 15 }, // Chi phí
    { width: 12 }, // Số lượng
    { width: 15 }, // Trung bình
    { width: 12 }  // % Tổng CP
  ];

  XLSX.utils.book_append_sheet(workbook, ws, 'Phân tích CP');
}

/**
 * Fallback CSV export when Excel export fails
 * @param {Object} metrics - Financial metrics
 * @param {Array} transactionData - Transaction data
 * @param {Array} expenseData - Expense data
 */
function exportToCSVFallback(metrics, transactionData, expenseData) {
  try {
    // Export summary as CSV
    const summaryCSV = generateSummaryCSV(metrics);
    downloadCSV(summaryCSV, 'financial-summary.csv');
    
    // Export transactions as CSV if available
    if (transactionData && transactionData.length > 0) {
      const transactionCSV = generateTransactionCSV(transactionData);
      downloadCSV(transactionCSV, 'transactions.csv');
    }
    
    // Export expenses as CSV if available
    if (expenseData && expenseData.length > 0) {
      const expenseCSV = generateExpenseCSV(expenseData);
      downloadCSV(expenseCSV, 'expenses.csv');
    }
    
    console.log('✅ Exported data as CSV files');
  } catch (error) {
    console.error('❌ Error in CSV fallback export:', error);
    alert('Không thể xuất dữ liệu. Vui lòng thử lại sau.');
  }
}

/**
 * Generate summary CSV content
 * @param {Object} metrics - Financial metrics
 * @returns {string} CSV content
 */
function generateSummaryCSV(metrics) {
  const rows = [
    ['Chỉ số', 'Giá trị', 'Đơn vị'],
    ['Tổng Doanh thu', metrics.totalRevenue || 0, 'VND'],
    ['Tổng Chi phí', metrics.totalExpenses || 0, 'VND'],
    ['Lợi nhuận ròng', metrics.netProfit || 0, 'VND'],
    ['Tỷ suất lợi nhuận', metrics.profitMargin || 0, '%'],
    ['Số giao dịch', metrics.transactionCount || 0, 'giao dịch'],
    ['Số chi phí', metrics.expenseCount || 0, 'khoản']
  ];
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate transaction CSV content
 * @param {Array} transactionData - Transaction data
 * @returns {string} CSV content
 */
function generateTransactionCSV(transactionData) {
  const headers = ['Ngày tạo', 'Khách hàng', 'Phần mềm', 'Gói', 'Doanh thu', 'Loại giao dịch'];
  const rows = [headers];
  
  transactionData.forEach(transaction => {
    rows.push([
      transaction.ngayTao || '',
      transaction.customer || '',
      transaction.software || '',
      transaction.package || '',
      parseFloat(transaction.revenue) || 0,
      transaction.transactionType || ''
    ]);
  });
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate expense CSV content
 * @param {Array} expenseData - Expense data
 * @returns {string} CSV content
 */
function generateExpenseCSV(expenseData) {
  const headers = ['Ngày tạo', 'Loại chi phí', 'Mô tả', 'Số tiền'];
  const rows = [headers];
  
  expenseData.forEach(expense => {
    rows.push([
      expense.ngayTao || expense.date || '',
      expense.loaiChiPhi || expense.category || '',
      expense.moTa || expense.description || '',
      parseFloat(expense.soTien || expense.amount) || 0
    ]);
  });
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Download CSV content as file
 * @param {string} csvContent - CSV content
 * @param {string} filename - File name
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}