// statistics-export.js - Xuất báo cáo thống kê

import { formatCurrency, formatNumber } from './statistics-utils.js';

// Xuất báo cáo PDF
window.exportStatsToPDF = function() {
  // Sử dụng html2pdf hoặc jsPDF
  console.log("Xuất PDF...");
  
  const element = document.getElementById('tab-thong-ke');
  if (!element) return;
  
  // Tạo tên file với timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10);
  const filename = `thong-ke-${timestamp}.pdf`;
  
  // Sử dụng window.print() như một fallback đơn giản
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write(`
    <html>
      <head>
        <title>Báo Cáo Thống Kê - ${timestamp}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .kpi-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .currency { text-align: right; }
          .percentage { text-align: right; }
          h2, h3 { color: #333; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${generatePrintContent()}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
};

// Xuất Excel
window.exportStatsToExcel = function() {
  console.log("Xuất Excel...");
  
  const data = window.statisticsData.filteredData;
  const workbook = createExcelWorkbook(data);
  
  // Tạo tên file
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10);
  const filename = `thong-ke-${timestamp}.xlsx`;
  
  // Download file (cần library như SheetJS)
  downloadExcelFile(workbook, filename);
};

// Xuất CSV
window.exportStatsToCSV = function() {
  console.log("Xuất CSV...");
  
  const data = window.statisticsData.filteredData;
  const csvContent = generateCSVContent(data);
  
  // Tạo tên file
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10);
  const filename = `thong-ke-${timestamp}.csv`;
  
  // Download file
  downloadCSVFile(csvContent, filename);
};

// In báo cáo
window.printStats = function() {
  console.log("In báo cáo...");
  
  const printContent = generatePrintContent();
  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Báo Cáo Thống Kê</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .kpi-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .kpi-card { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 8px;
            text-align: center;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .currency { text-align: right; }
          .percentage { text-align: right; }
          .rank { text-align: center; }
          h2, h3 { 
            color: #333; 
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .page-break { page-break-before: always; }
          @media print { 
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// Tạo nội dung để in
function generatePrintContent() {
  const data = window.statisticsData.filteredData;
  const { fromDate, toDate } = window.statisticsData;
  
  // Tính toán KPI
  const revenue = data.transactions.reduce((sum, t) => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      return sum + (parseFloat(t.revenue) || 0);
    }
    return sum;
  }, 0);
  
  const expense = data.expenses.reduce((sum, e) => {
    if (e.currency === 'VND') {
      return sum + (parseFloat(e.amount) || 0);
    }
    return sum;
  }, 0);
  
  const profit = revenue - expense;
  const transactionCount = data.transactions.filter(t => 
    t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử'
  ).length;
  
  return `
    <div class="header">
      <h1>BÁO CÁO THỐNG KÊ</h1>
      <p><strong>Từ ngày:</strong> ${fromDate} <strong>đến ngày:</strong> ${toDate}</p>
      <p><strong>Thời gian xuất:</strong> ${new Date().toLocaleString('vi-VN')}</p>
    </div>
    
    <div class="kpi-section">
      <div class="kpi-card">
        <h3>Tổng Doanh Thu</h3>
        <div class="kpi-value">${formatCurrency(revenue)}</div>
      </div>
      <div class="kpi-card">
        <h3>Tổng Chi Phí</h3>
        <div class="kpi-value">${formatCurrency(expense)}</div>
      </div>
      <div class="kpi-card">
        <h3>Lợi Nhuận</h3>
        <div class="kpi-value" style="color: ${profit >= 0 ? '#28a745' : '#dc3545'}">${formatCurrency(profit)}</div>
      </div>
      <div class="kpi-card">
        <h3>Số Giao Dịch</h3>
        <div class="kpi-value">${formatNumber(transactionCount)}</div>
      </div>
    </div>
    
    ${generateTopSoftwareTableHTML(data)}
    
    <div class="page-break"></div>
    
    ${generateEmployeeStatsTableHTML(data)}
    
    ${generateExpenseCategoryTableHTML(data)}
  `;
}

// Tạo bảng top phần mềm cho print
function generateTopSoftwareTableHTML(data) {
  const { transactions } = data;
  const softwareStats = {};
  let totalRevenue = 0;
  
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      const key = `${t.softwareName} - ${t.softwarePackage}`;
      const revenue = parseFloat(t.revenue) || 0;
      
      if (!softwareStats[key]) {
        softwareStats[key] = { name: key, count: 0, revenue: 0 };
      }
      
      softwareStats[key].count++;
      softwareStats[key].revenue += revenue;
      totalRevenue += revenue;
    }
  });
  
  const sorted = Object.values(softwareStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  let html = `
    <h2>🏆 Top Phần Mềm Bán Chạy</h2>
    <table>
      <thead>
        <tr>
          <th>Hạng</th>
          <th>Phần Mềm</th>
          <th>Số Bán</th>
          <th>Doanh Thu</th>
          <th>% Tổng</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sorted.forEach((item, index) => {
    const percentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : 0;
    html += `
      <tr>
        <td class="rank">${index + 1}</td>
        <td>${item.name}</td>
        <td>${formatNumber(item.count)}</td>
        <td class="currency">${formatCurrency(item.revenue)}</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  return html;
}

// Tạo bảng nhân viên cho print
function generateEmployeeStatsTableHTML(data) {
  const { transactions } = data;
  const employeeStats = {};
  let totalRevenue = 0;
  
  transactions.forEach(t => {
    if (t.transactionType === 'Bán hàng' || t.transactionType === 'Dùng thử') {
      const key = t.tenNhanVien || 'Không xác định';
      const revenue = parseFloat(t.revenue) || 0;
      
      if (!employeeStats[key]) {
        employeeStats[key] = { name: key, count: 0, revenue: 0 };
      }
      
      employeeStats[key].count++;
      employeeStats[key].revenue += revenue;
      totalRevenue += revenue;
    }
  });
  
  const sorted = Object.values(employeeStats)
    .sort((a, b) => b.revenue - a.revenue);
  
  let html = `
    <h2>👥 Hiệu Suất Nhân Viên</h2>
    <table>
      <thead>
        <tr>
          <th>Nhân Viên</th>
          <th>Số GD</th>
          <th>Doanh Thu</th>
          <th>TB/GD</th>
          <th>% Tổng</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sorted.forEach(item => {
    const percentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : 0;
    const averagePerTransaction = item.count > 0 ? item.revenue / item.count : 0;
    
    html += `
      <tr>
        <td>${item.name}</td>
        <td>${formatNumber(item.count)}</td>
        <td class="currency">${formatCurrency(item.revenue)}</td>
        <td class="currency">${formatCurrency(averagePerTransaction)}</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  return html;
}

// Tạo bảng chi phí cho print
function generateExpenseCategoryTableHTML(data) {
  const { expenses } = data;
  const categoryStats = {};
  let totalExpense = 0;
  
  expenses.forEach(e => {
    if (e.currency === 'VND') {
      const key = e.type || 'Khác';
      const amount = parseFloat(e.amount) || 0;
      
      if (!categoryStats[key]) {
        categoryStats[key] = { name: key, count: 0, amount: 0 };
      }
      
      categoryStats[key].count++;
      categoryStats[key].amount += amount;
      totalExpense += amount;
    }
  });
  
  const sorted = Object.values(categoryStats)
    .sort((a, b) => b.amount - a.amount);
  
  let html = `
    <h2>🏷️ Chi Phí Theo Danh Mục</h2>
    <table>
      <thead>
        <tr>
          <th>Danh Mục</th>
          <th>Số Khoản</th>
          <th>Tổng Tiền</th>
          <th>TB/Khoản</th>
          <th>% Tổng</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sorted.forEach(item => {
    const percentage = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : 0;
    const averagePerItem = item.count > 0 ? item.amount / item.count : 0;
    
    html += `
      <tr>
        <td>${item.name}</td>
        <td>${formatNumber(item.count)}</td>
        <td class="currency">${formatCurrency(item.amount)}</td>
        <td class="currency">${formatCurrency(averagePerItem)}</td>
        <td class="percentage">${percentage}%</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  return html;
}

// Tạo Excel workbook (đơn giản)
function createExcelWorkbook(data) {
  // Placeholder - cần implement với SheetJS
  return {
    SheetNames: ['Thống kê'],
    Sheets: {
      'Thống kê': {}
    }
  };
}

// Download Excel file
function downloadExcelFile(workbook, filename) {
  // Placeholder - cần implement với SheetJS
  alert('Chức năng xuất Excel đang được phát triển');
}

// Tạo CSV content
function generateCSVContent(data) {
  const { transactions, expenses } = data;
  
  let csv = 'Loại,Ngày,Tên,Email,Phần mềm,Gói,Doanh thu,Ghi chú\n';
  
  transactions.forEach(t => {
    const row = [
      t.transactionType || '',
      t.transactionDate || '',
      t.customerName || '',
      t.customerEmail || '',
      t.softwareName || '',
      t.softwarePackage || '',
      t.revenue || 0,
      (t.note || '').replace(/,/g, ';')
    ];
    csv += row.join(',') + '\n';
  });
  
  csv += '\n\nChi phí\n';
  csv += 'Ngày,Loại,Danh mục,Sản phẩm,Số tiền,Tiền tệ,Ghi chú\n';
  
  expenses.forEach(e => {
    const row = [
      e.date || '',
      e.type || '',
      e.category || '',
      e.product || '',
      e.amount || 0,
      e.currency || '',
      (e.note || '').replace(/,/g, ';')
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

// Download CSV file
function downloadCSVFile(content, filename) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert('Trình duyệt không hỗ trợ tải file');
  }
}