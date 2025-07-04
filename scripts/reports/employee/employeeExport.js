/**
 * Employee Export Module
 * Xuất báo cáo nhân viên ra các định dạng khác nhau
 */

export class EmployeeExport {
    constructor() {
        this.exportFormats = ['excel', 'csv', 'pdf'];
    }

    /**
     * Export employee data to Excel
     */
    exportToExcel(employees, departments, options = {}) {
        // console.log('📊 Exporting employee data to Excel...');
        
        try {
            // Create workbook data
            const workbookData = this.prepareExcelData(employees, departments);
            
            // Create and download Excel file
            this.downloadExcelFile(workbookData, options.filename || 'employee-report.xlsx');
            
            // console.log('✅ Excel export completed');
            return true;
            
        } catch (error) {
            console.error('❌ Excel export failed:', error);
            return false;
        }
    }

    /**
     * Export employee data to CSV
     */
    exportToCSV(employees, options = {}) {
        // console.log('📄 Exporting employee data to CSV...');
        
        try {
            const csvData = this.prepareCSVData(employees);
            this.downloadCSVFile(csvData, options.filename || 'employee-report.csv');
            
            // console.log('✅ CSV export completed');
            return true;
            
        } catch (error) {
            console.error('❌ CSV export failed:', error);
            return false;
        }
    }

    /**
     * Export employee data to PDF
     */
    exportToPDF(employees, departments, charts, options = {}) {
        console.log('📑 Exporting employee data to PDF...');
        
        try {
            // This would require a PDF library like jsPDF
            console.log('PDF export not yet implemented');
            alert('Tính năng xuất PDF đang được phát triển');
            return false;
            
        } catch (error) {
            console.error('❌ PDF export failed:', error);
            return false;
        }
    }

    /**
     * Prepare data for Excel export
     */
    prepareExcelData(employees, departments) {
        const workbook = {
            SheetNames: ['Employees', 'Departments', 'Summary'],
            Sheets: {}
        };

        // Employee sheet
        const employeeData = [
            ['Mã NV', 'Tên nhân viên', 'Phòng ban', 'Doanh thu', 'Hoa hồng', 'Số giao dịch', 'Số khách hàng', 'Điểm hiệu suất', 'Xếp loại', 'Hoạt động gần nhất']
        ];

        employees.forEach(emp => {
            employeeData.push([
                emp.id || '',
                emp.name || '',
                emp.department || '',
                emp.revenue || 0,
                emp.commission || 0,
                emp.transactionCount || 0,
                emp.customerCount || 0,
                emp.performanceScore || 0,
                emp.performanceLevel || '',
                emp.lastActivity || ''
            ]);
        });

        workbook.Sheets['Employees'] = this.arrayToSheet(employeeData);

        // Department sheet
        const departmentData = [
            ['Phòng ban', 'Số nhân viên', 'Tổng doanh thu', 'Tổng hoa hồng', 'Hiệu suất TB', 'Top performer']
        ];

        Array.from(departments.values()).forEach(dept => {
            departmentData.push([
                dept.name || '',
                dept.employeeCount || 0,
                dept.totalRevenue || 0,
                dept.totalCommission || 0,
                Math.round(dept.avgPerformance || 0),
                dept.topPerformer?.name || ''
            ]);
        });

        workbook.Sheets['Departments'] = this.arrayToSheet(departmentData);

        // Summary sheet
        const summaryData = [
            ['Chỉ số', 'Giá trị'],
            ['Tổng số nhân viên', employees.length],
            ['Tổng doanh thu', employees.reduce((sum, emp) => sum + (emp.revenue || 0), 0)],
            ['Tổng hoa hồng', employees.reduce((sum, emp) => sum + (emp.commission || 0), 0)],
            ['Điểm hiệu suất cao nhất', Math.max(...employees.map(emp => emp.performanceScore || 0))],
            ['Điểm hiệu suất thấp nhất', Math.min(...employees.map(emp => emp.performanceScore || 0))],
            ['Điểm hiệu suất trung bình', Math.round(employees.reduce((sum, emp) => sum + (emp.performanceScore || 0), 0) / employees.length)]
        ];

        workbook.Sheets['Summary'] = this.arrayToSheet(summaryData);

        return workbook;
    }

    /**
     * Prepare data for CSV export
     */
    prepareCSVData(employees) {
        const headers = [
            'Mã NV', 'Tên nhân viên', 'Phòng ban', 'Doanh thu', 'Hoa hồng', 
            'Số giao dịch', 'Số khách hàng', 'Điểm hiệu suất', 'Xếp loại', 'Hoạt động gần nhất'
        ];

        const rows = employees.map(emp => [
            emp.id || '',
            emp.name || '',
            emp.department || '',
            emp.revenue || 0,
            emp.commission || 0,
            emp.transactionCount || 0,
            emp.customerCount || 0,
            emp.performanceScore || 0,
            emp.performanceLevel || '',
            emp.lastActivity || ''
        ]);

        return [headers, ...rows];
    }

    /**
     * Convert array to sheet format (simple implementation)
     */
    arrayToSheet(data) {
        const sheet = {};
        const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

        for (let R = 0; R < data.length; R++) {
            for (let C = 0; C < data[R].length; C++) {
                if (range.s.r > R) range.s.r = R;
                if (range.s.c > C) range.s.c = C;
                if (range.e.r < R) range.e.r = R;
                if (range.e.c < C) range.e.c = C;
                
                const cell = { v: data[R][C] };
                
                if (cell.v == null) continue;
                
                const cellRef = this.encodeCell({ c: C, r: R });
                
                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n';
                    cell.z = 'MM/dd/yy';
                    cell.v = this.dateToNumber(cell.v);
                } else cell.t = 's';
                
                sheet[cellRef] = cell;
            }
        }
        
        if (range.s.c < 10000000) sheet['!ref'] = this.encodeRange(range);
        return sheet;
    }

    /**
     * Download Excel file (simplified implementation)
     */
    downloadExcelFile(workbook, filename) {
        // This is a simplified implementation
        // In a real application, you would use a library like SheetJS
        
        const csvData = this.workbookToCSV(workbook);
        this.downloadCSVFile(csvData, filename.replace('.xlsx', '.csv'));
    }

    /**
     * Download CSV file
     */
    downloadCSVFile(data, filename) {
        const csvContent = data.map(row => 
            row.map(cell => {
                // Escape quotes and wrap in quotes if necessary
                const stringValue = String(cell);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
            }).join(',')
        ).join('\n');

        // Add BOM for UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Convert workbook to CSV (simplified)
     */
    workbookToCSV(workbook) {
        // Return the first sheet as CSV
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // This is a simplified conversion
        // In reality, you'd need to properly parse the sheet structure
        return [
            ['Mã NV', 'Tên nhân viên', 'Phòng ban', 'Doanh thu', 'Hoa hồng', 'Số giao dịch', 'Số khách hàng', 'Điểm hiệu suất'],
            // Add employee data here...
        ];
    }

    /**
     * Helper functions for Excel format
     */
    encodeCell(cell) {
        return this.encodeColumn(cell.c) + this.encodeRow(cell.r);
    }

    encodeColumn(col) {
        let s = '';
        for (++col; col; col = Math.floor((col - 1) / 26)) {
            s = String.fromCharCode(((col - 1) % 26) + 65) + s;
        }
        return s;
    }

    encodeRow(row) {
        return '' + (row + 1);
    }

    encodeRange(range) {
        return this.encodeCell(range.s) + ':' + this.encodeCell(range.e);
    }

    dateToNumber(date) {
        return (date.getTime() - new Date('1899-12-30').getTime()) / (24 * 60 * 60 * 1000);
    }

    /**
     * Export individual employee report
     */
    exportEmployeeReport(employee, options = {}) {
        // console.log(`📊 Exporting individual report for ${employee.name}...`);
        
        const reportData = this.prepareIndividualReport(employee);
        
        switch (options.format || 'csv') {
            case 'csv':
                this.downloadCSVFile(reportData.csv, `employee-${employee.id}-report.csv`);
                break;
            case 'excel':
                this.downloadExcelFile(reportData.excel, `employee-${employee.id}-report.xlsx`);
                break;
            default:
                console.warn('Unsupported export format:', options.format);
        }
    }

    /**
     * Prepare individual employee report data
     */
    prepareIndividualReport(employee) {
        const headers = ['Chỉ số', 'Giá trị'];
        const data = [
            headers,
            ['Mã nhân viên', employee.id],
            ['Tên nhân viên', employee.name],
            ['Phòng ban', employee.department],
            ['Tổng doanh thu', employee.revenue],
            ['Tổng hoa hồng', employee.commission],
            ['Số giao dịch', employee.transactionCount],
            ['Số khách hàng', employee.customerCount],
            ['Điểm hiệu suất', employee.performanceScore],
            ['Xếp loại hiệu suất', employee.performanceLevel],
            ['Tỷ lệ gia hạn', employee.renewalRate + '%'],
            ['Doanh thu TB/giao dịch', employee.avgDealSize],
            ['Hoạt động gần nhất', employee.lastActivity]
        ];

        return {
            csv: data,
            excel: {
                SheetNames: ['Employee Report'],
                Sheets: {
                    'Employee Report': this.arrayToSheet(data)
                }
            }
        };
    }

    /**
     * Show export options modal
     */
    showExportModal(employees, departments) {
        const modal = document.createElement('div');
        modal.className = 'modal export-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Xuất báo cáo nhân viên</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="export-options">
                        <h4>Chọn định dạng xuất:</h4>
                        <label class="export-option">
                            <input type="radio" name="exportFormat" value="csv" checked>
                            <span>📄 CSV - Tương thích với Excel</span>
                        </label>
                        <label class="export-option">
                            <input type="radio" name="exportFormat" value="excel">
                            <span>📊 Excel - Định dạng đầy đủ</span>
                        </label>
                        <label class="export-option">
                            <input type="radio" name="exportFormat" value="pdf" disabled>
                            <span>📑 PDF - Đang phát triển</span>
                        </label>
                    </div>
                    <div class="export-options">
                        <h4>Chọn dữ liệu xuất:</h4>
                        <label class="export-option">
                            <input type="checkbox" name="exportData" value="employees" checked>
                            <span>👥 Dữ liệu nhân viên</span>
                        </label>
                        <label class="export-option">
                            <input type="checkbox" name="exportData" value="departments" checked>
                            <span>🏢 Thống kê phòng ban</span>
                        </label>
                        <label class="export-option">
                            <input type="checkbox" name="exportData" value="summary" checked>
                            <span>📈 Tóm tắt báo cáo</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.employeeExport.executeExport()">
                        📥 Xuất báo cáo
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        ❌ Hủy
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Store data for export
        this.pendingExportData = { employees, departments };
    }

    /**
     * Execute export based on modal selections
     */
    executeExport() {
        const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
        const exportOptions = Array.from(document.querySelectorAll('input[name="exportData"]:checked'))
            .map(input => input.value);

        const { employees, departments } = this.pendingExportData || {};
        
        if (!employees) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        switch (format) {
            case 'csv':
                this.exportToCSV(employees);
                break;
            case 'excel':
                this.exportToExcel(employees, departments);
                break;
            case 'pdf':
                this.exportToPDF(employees, departments);
                break;
        }

        // Close modal
        document.querySelector('.export-modal')?.remove();
        this.pendingExportData = null;
    }
}

// Create global instance
window.employeeExport = new EmployeeExport();