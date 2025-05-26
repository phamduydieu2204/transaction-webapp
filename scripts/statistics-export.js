// statistics-export.js - Xuất báo cáo thống kê

import { formatCurrency, formatNumber } from './statistics-utils.js';

// Xuất báo cáo PDF
window.exportStatsToPDF = function() {
  console.log("Xuất PDF...");
  
  const element = document.getElementById('tab-thong-ke');
  if (!element) return;
  
  // Tạo tên file với timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10);
  const filename = `thong-ke-${timestamp}.pdf`;
  
  // Clone element để không ảnh hưởng tới UI
  const clonedElement = element.cloneNode(true);
  
  // Loại bỏ các elements không cần thiết
  const removeElements = clonedElement.querySelectorAll('.export-controls, .time-filter, button, select, input');
  removeElements.forEach(el => el.remove());
  
  // Sử dụng window.print() như một fallback đơn giản
  const printWindow = window.open('', '', 'height=800,width=1200');
  printWindow.document.write(`
    <html>
      <head>
        <title>Báo Cáo Thống Kê - ${timestamp}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .statistics-header { background: #f5f5f5; padding: 20px; margin-bottom: 30px; }
          .kpi-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #007bff; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .currency { text-align: right; }
          .percentage { text-align: right; }
          h2, h3 { color: #333; }
          @media print { 
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        ${clonedElement.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};