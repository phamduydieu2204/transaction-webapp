/**
 * categoryExportUtils.js
 * 
 * Export and download utilities for expense category charts
 * Handles export to various formats (PNG, PDF, Excel, CSV)
 */
  });

      });
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      console.error('html2canvas library not loaded');
    }
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
  }
}

/**
 * Export category data as CSV
 * @param {Object} categoryData - Processed category data
 * @param {string} fileName - Output file name
 */
    const topSubcategories = Object.entries(data.subCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([sub, amount]) => `${sub}: ${formatCurrency(amount, 'VND')}`)
      .join('; ');
    
    summaryData.push([
      category,
      data.total,
      `${percentage.toFixed(2)}%`,
      topSubcategories
    ]);
  });
  
  // Add total row
  summaryData.push([]);
  summaryData.push(['Total', totalExpense, '100.00%', '']);
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  
  // Create monthly trend sheet
  const monthlyData = [
    ['Monthly Expense Trend'],
    [],
    ['Month', ...Object.keys(categories), 'Total']
  ];
  
  monthly.forEach(month => {
    const row = [month.monthLabel];
    Object.keys(categories).forEach(cat => {
      row.push(month[cat] || 0);
    });
    row.push(month.total);
    monthlyData.push(row);
  });
  
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly Trend');
  
  // Create subcategories sheet
  const subcategoryData = [
    ['Subcategory Analysis'],
    [],
    ['Main Category', 'Subcategory', 'Amount']
  ];
  
  Object.entries(categories).forEach(([category, data]) => {
    Object.entries(data.subCategories).forEach(([subCat, amount]) => {
      subcategoryData.push([category, subCat, amount]);
    });
  });
  
  const subcategorySheet = XLSX.utils.aoa_to_sheet(subcategoryData);
  XLSX.utils.book_append_sheet(wb, subcategorySheet, 'Subcategories');
  
  // Save file
  XLSX.writeFile(wb, fileName);
}

/**
 * Export category report as PDF
 * @param {Object} categoryData - Processed category data
 * @param {string} fileName - Output file name
 */
export async function exportCategoryReportAsPDF(categoryData, fileName = 'expense-category-report.pdf') {
  if (!window.jsPDF) {
    console.error('jsPDF library not loaded');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const { categories, monthly } = categoryData;
  const totalExpense = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);
  
  // Add title
  doc.setFontSize(20);
  doc.text('Expense Category Analysis Report', 20, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('vi-VN')}`, 20, 30);
  
  // Add summary section
    doc.text(`${category}: ${formatCurrency(data.total, 'VND')} (${percentage.toFixed(1)}%)`, 25, yPosition);
    yPosition += 7;
  });
  
  // Add total
  doc.setFontSize(12);
  doc.text(`Total Expense: ${formatCurrency(totalExpense, 'VND')}`, 20, yPosition + 5);
  
  // Add chart if possible (placeholder for actual chart image)
  if (document.getElementById('expenseByCategory')) {
    try {
      const canvas = await html2canvas(document.getElementById('expenseByCategory'));
      const imgData = canvas.toDataURL('image/png');
      doc.addPage();
      doc.text('Expense Charts', 20, 20);
      doc.addImage(imgData, 'PNG', 20, 30, 170, 100);
  } catch (error) {
      console.error('Error adding chart to PDF:', error);
    }
  }
  
  // Save PDF
  doc.save(fileName);
}

/**
 * Generate and download category summary report
 * @param {Object} categoryData - Processed category data
 * @param {Object} stats - Category statistics
 */
export function downloadCategorySummaryReport(categoryData, stats) {
  const { categories, monthly } = categoryData;
  
  let reportContent = 'EXPENSE CATEGORY ANALYSIS REPORT\n';
  reportContent += '================================\n\n';
  reportContent += `Report Date: ${new Date().toLocaleDateString('vi-VN')}\n`;
  reportContent += 'SUMMARY\n';
  reportContent += '-------\n';
  reportContent += `Total Expense: ${formatCurrency(stats.totalExpense, 'VND')}\n`;
  reportContent += `Average Monthly: ${formatCurrency(stats.avgMonthlyExpense, 'VND')}\n`;
  reportContent += `Top Category: ${stats.topCategory.name} (${formatCurrency(stats.topCategory.amount, 'VND')})\n\n`;
  
  reportContent += 'CATEGORY BREAKDOWN\n';
  reportContent += '------------------\n';
  Object.entries(categories).forEach(([category, data]) => {
    reportContent += `\n${category}\n`;
    reportContent += `Total: ${formatCurrency(data.total, 'VND')} (${stats.categoryPercentages[category].toFixed(1)}%)\n`;
    
    // Top subcategories
    const topSubs = Object.entries(data.subCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topSubs.length > 0) {
      reportContent += 'Top Subcategories:\n';
      topSubs.forEach(([sub, amount]) => {
        reportContent += `  - ${sub}: ${formatCurrency(amount, 'VND')}\n`;
      });
    }
  });
    reportContent += `${trend.month}: ${formatCurrency(trend.total, 'VND')} `;
    if (trend.growth !== 0) {
      reportContent += `${growthIndicator} ${Math.abs(trend.growth).toFixed(1)}%`;
    }
    reportContent += '\n';
  });
  
  // Download as text file
  downloadFile(reportContent, 'expense-category-report.txt', 'text/plain');
}

/**
 * Utility function to download file
 * @param {string} content - File content
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
    clipboardText += `${category}: ${formatCurrency(data.total, 'VND')} (${percentage.toFixed(1)}%)\n`;
  });
  
  clipboardText += `\nTotal: ${formatCurrency(totalExpense, 'VND')}`;
  
  navigator.clipboard.writeText(clipboardText).then(() => {
    console.log('Category data copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
  });
}