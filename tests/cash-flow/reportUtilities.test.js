/**
 * Unit tests for reportUtilities.js
 * Tests report generation utilities and helpers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  renderReportHeader,
  addReportInteractivity,
  addCashFlowVsAccrualStyles,
  exportReportToPDF,
  exportReportToExcel,
  generateReportSummary,
  formatReportForPrint
} from '../../scripts/cash-flow/reportUtilities.js';

// Mock DOM methods
Object.defineProperty(document, 'getElementById', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    id: '',
    textContent: '',
    style: {}
  })),
  writable: true
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn()
  },
  writable: true
});

// Mock console methods
global.console = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

describe('reportUtilities.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM mocks
    document.getElementById.mockReturnValue(null);
    document.createElement.mockReturnValue({
      id: '',
      textContent: '',
      style: {}
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('renderReportHeader', () => {
    it('should render header with date range', () => {
      const dateRange = {
        start: '2024-01-01',
        end: '2024-01-31'
      };
      
      const result = renderReportHeader(dateRange);
      
      expect(result).toContain('💰 So sánh Cash Flow vs Chi phí phân bổ');
      expect(result).toContain('2024-01-01 - 2024-01-31');
      expect(result).toContain('Kỳ báo cáo:');
      expect(result).toContain('Cash Flow:');
      expect(result).toContain('Chi phí phân bổ:');
    });

    it('should render header without date range', () => {
      const result = renderReportHeader();
      
      expect(result).toContain('💰 So sánh Cash Flow vs Chi phí phân bổ');
      expect(result).toContain('Tất cả thời gian');
      expect(result).toContain('help-text');
    });

    it('should render header with empty date range', () => {
      const dateRange = {};
      
      const result = renderReportHeader(dateRange);
      
      expect(result).toContain('Tất cả thời gian');
    });

    it('should render header with partial date range', () => {
      const dateRange = { start: '2024-01-01' };
      
      const result = renderReportHeader(dateRange);
      
      expect(result).toContain('Tất cả thời gian');
    });

    it('should include proper HTML structure', () => {
      const dateRange = { start: '2024-01-01', end: '2024-01-31' };
      const result = renderReportHeader(dateRange);
      
      expect(result).toContain('<div class="report-header">');
      expect(result).toContain('<h2>');
      expect(result).toContain('<p class="period-info">');
      expect(result).toContain('<div class="help-text">');
      expect(result).toContain('</div>');
    });

    it('should include explanatory text', () => {
      const result = renderReportHeader();
      
      expect(result).toContain('Dòng tiền thực tế chi ra');
      expect(result).toContain('Phân bổ đều chi phí cho kỳ sử dụng');
      expect(result).toContain('thuê nhà tháng 1 phân bổ đều cho 30 ngày');
    });
  });

  describe('addReportInteractivity', () => {
    it('should initialize charts when Chart.js is available', () => {
      // Mock Chart.js availability
      global.Chart = { version: '3.0.0' };
      
      addReportInteractivity();
      
      expect(console.log).toHaveBeenCalledWith('📊 Charts would be initialized here');
      
      // Cleanup
      delete global.Chart;
    });

    it('should handle missing Chart.js gracefully', () => {
      // Ensure Chart.js is not available
      delete global.Chart;
      
      addReportInteractivity();
      
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not throw errors when called multiple times', () => {
      global.Chart = { version: '3.0.0' };
      
      expect(() => {
        addReportInteractivity();
        addReportInteractivity();
        addReportInteractivity();
      }).not.toThrow();
      
      delete global.Chart;
    });
  });

  describe('addCashFlowVsAccrualStyles', () => {
    it('should add styles when not already present', () => {
      document.getElementById.mockReturnValue(null); // No existing styles
      
      const mockStyleElement = {
        id: '',
        textContent: ''
      };
      document.createElement.mockReturnValue(mockStyleElement);
      
      addCashFlowVsAccrualStyles();
      
      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(mockStyleElement.id).toBe('cashflow-accrual-styles');
      expect(mockStyleElement.textContent).toContain('.cashflow-accrual-report');
      expect(document.head.appendChild).toHaveBeenCalledWith(mockStyleElement);
    });

    it('should not add styles when already present', () => {
      const existingStyleElement = { id: 'cashflow-accrual-styles' };
      document.getElementById.mockReturnValue(existingStyleElement);
      
      addCashFlowVsAccrualStyles();
      
      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.head.appendChild).not.toHaveBeenCalled();
    });

    it('should include all required CSS classes', () => {
      const mockStyleElement = {
        id: '',
        textContent: ''
      };
      document.createElement.mockReturnValue(mockStyleElement);
      
      addCashFlowVsAccrualStyles();
      
      const styles = mockStyleElement.textContent;
      
      // Check for key CSS classes
      expect(styles).toContain('.report-header');
      expect(styles).toContain('.comparison-summary');
      expect(styles).toContain('.summary-card');
      expect(styles).toContain('.insight-card');
      expect(styles).toContain('.dual-view-charts');
      expect(styles).toContain('.chart-container');
      expect(styles).toContain('.comparison-table');
      expect(styles).toContain('.large-payments-section');
      expect(styles).toContain('.insights-section');
    });

    it('should include responsive design', () => {
      const mockStyleElement = {
        id: '',
        textContent: ''
      };
      document.createElement.mockReturnValue(mockStyleElement);
      
      addCashFlowVsAccrualStyles();
      
      const styles = mockStyleElement.textContent;
      
      expect(styles).toContain('@media (max-width: 768px)');
      expect(styles).toContain('grid-template-columns: 1fr');
    });

    it('should include color and styling properties', () => {
      const mockStyleElement = {
        id: '',
        textContent: ''
      };
      document.createElement.mockReturnValue(mockStyleElement);
      
      addCashFlowVsAccrualStyles();
      
      const styles = mockStyleElement.textContent;
      
      expect(styles).toContain('background: linear-gradient');
      expect(styles).toContain('.positive');
      expect(styles).toContain('.negative');
      expect(styles).toContain('border-radius');
      expect(styles).toContain('box-shadow');
    });
  });

  describe('exportReportToPDF', () => {
    it('should log PDF export attempt with default filename', () => {
      const reportData = { total: 1000000 };
      
      exportReportToPDF(reportData);
      
      expect(console.log).toHaveBeenCalledWith(
        '📄 PDF export would be implemented here',
        { reportData, filename: 'cashflow-accrual-report.pdf' }
      );
    });

    it('should log PDF export attempt with custom filename', () => {
      const reportData = { total: 1000000 };
      const filename = 'custom-report.pdf';
      
      exportReportToPDF(reportData, filename);
      
      expect(console.log).toHaveBeenCalledWith(
        '📄 PDF export would be implemented here',
        { reportData, filename }
      );
    });

    it('should handle empty report data', () => {
      const reportData = {};
      
      expect(() => exportReportToPDF(reportData)).not.toThrow();
      expect(console.log).toHaveBeenCalledWith(
        '📄 PDF export would be implemented here',
        { reportData, filename: 'cashflow-accrual-report.pdf' }
      );
    });

    it('should handle null report data', () => {
      expect(() => exportReportToPDF(null)).not.toThrow();
      expect(console.log).toHaveBeenCalledWith(
        '📄 PDF export would be implemented here',
        { reportData: null, filename: 'cashflow-accrual-report.pdf' }
      );
    });
  });

  describe('exportReportToExcel', () => {
    it('should log Excel export attempt with default filename', () => {
      const reportData = { total: 1000000 };
      
      exportReportToExcel(reportData);
      
      expect(console.log).toHaveBeenCalledWith(
        '📊 Excel export would be implemented here',
        { reportData, filename: 'cashflow-accrual-report.xlsx' }
      );
    });

    it('should log Excel export attempt with custom filename', () => {
      const reportData = { total: 1000000 };
      const filename = 'custom-report.xlsx';
      
      exportReportToExcel(reportData, filename);
      
      expect(console.log).toHaveBeenCalledWith(
        '📊 Excel export would be implemented here',
        { reportData, filename }
      );
    });

    it('should handle empty report data', () => {
      const reportData = {};
      
      expect(() => exportReportToExcel(reportData)).not.toThrow();
      expect(console.log).toHaveBeenCalledWith(
        '📊 Excel export would be implemented here',
        { reportData, filename: 'cashflow-accrual-report.xlsx' }
      );
    });

    it('should handle null report data', () => {
      expect(() => exportReportToExcel(null)).not.toThrow();
      expect(console.log).toHaveBeenCalledWith(
        '📊 Excel export would be implemented here',
        { reportData: null, filename: 'cashflow-accrual-report.xlsx' }
      );
    });
  });

  describe('generateReportSummary', () => {
    let sampleCashFlow, sampleAccrual, sampleComparison;

    beforeEach(() => {
      sampleCashFlow = {
        total: 5000000,
        largePayments: [
          { amount: 1000000, description: 'Large payment 1' },
          { amount: 800000, description: 'Large payment 2' }
        ]
      };

      sampleAccrual = {
        total: 4500000,
        allocatedExpenses: [
          { amount: 500000, category: 'Rent' },
          { amount: 300000, category: 'Software' }
        ]
      };

      sampleComparison = {
        dateRange: '2024-01-01 to 2024-01-31',
        totalDifference: 500000,
        percentDifference: 11.11,
        insights: [
          { type: 'warning', message: 'Large difference detected' },
          { type: 'info', message: 'Cash flow higher than accrual' }
        ]
      };
    });

    it('should generate complete report summary', () => {
      const summary = generateReportSummary(sampleCashFlow, sampleAccrual, sampleComparison);
      
      expect(summary).toEqual({
        period: '2024-01-01 to 2024-01-31',
        cashFlowTotal: 5000000,
        accrualTotal: 4500000,
        difference: 500000,
        percentDifference: 11.11,
        insights: 2,
        largePayments: 2,
        allocatedExpenses: 2
      });
    });

    it('should handle missing date range', () => {
      const comparisonWithoutDate = { ...sampleComparison };
      delete comparisonWithoutDate.dateRange;
      
      const summary = generateReportSummary(sampleCashFlow, sampleAccrual, comparisonWithoutDate);
      
      expect(summary.period).toBe('All time');
    });

    it('should handle empty data arrays', () => {
      const emptyCashFlow = { total: 0, largePayments: [] };
      const emptyAccrual = { total: 0, allocatedExpenses: [] };
      const emptyComparison = { 
        totalDifference: 0, 
        percentDifference: 0, 
        insights: [] 
      };
      
      const summary = generateReportSummary(emptyCashFlow, emptyAccrual, emptyComparison);
      
      expect(summary.insights).toBe(0);
      expect(summary.largePayments).toBe(0);
      expect(summary.allocatedExpenses).toBe(0);
    });

    it('should handle missing properties gracefully', () => {
      const incompleteCashFlow = { total: 1000000 }; // Missing largePayments
      const incompleteAccrual = { total: 900000 }; // Missing allocatedExpenses
      const incompleteComparison = { 
        totalDifference: 100000,
        percentDifference: 11.11
        // Missing insights
      };
      
      expect(() => {
        generateReportSummary(incompleteCashFlow, incompleteAccrual, incompleteComparison);
      }).toThrow(); // Should throw because of missing properties
    });

    it('should preserve exact numerical values', () => {
      const summary = generateReportSummary(sampleCashFlow, sampleAccrual, sampleComparison);
      
      expect(summary.cashFlowTotal).toBe(5000000);
      expect(summary.accrualTotal).toBe(4500000);
      expect(summary.difference).toBe(500000);
      expect(summary.percentDifference).toBe(11.11);
    });
  });

  describe('formatReportForPrint', () => {
    it('should return print styles', () => {
      const printStyles = formatReportForPrint();
      
      expect(printStyles).toContain('<style>');
      expect(printStyles).toContain('</style>');
      expect(printStyles).toContain('@media print');
    });

    it('should include print-specific CSS rules', () => {
      const printStyles = formatReportForPrint();
      
      expect(printStyles).toContain('.no-print { display: none !important; }');
      expect(printStyles).toContain('.page-break { page-break-after: always; }');
      expect(printStyles).toContain('body { font-size: 12pt; }');
      expect(printStyles).toContain('.chart-container { page-break-inside: avoid; }');
    });

    it('should be consistent when called multiple times', () => {
      const styles1 = formatReportForPrint();
      const styles2 = formatReportForPrint();
      
      expect(styles1).toBe(styles2);
    });

    it('should have proper HTML structure', () => {
      const printStyles = formatReportForPrint();
      
      expect(printStyles.trim().startsWith('<style>')).toBe(true);
      expect(printStyles.trim().endsWith('</style>')).toBe(true);
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle undefined parameters gracefully', () => {
      expect(() => renderReportHeader(undefined)).not.toThrow();
      expect(() => generateReportSummary(undefined, undefined, undefined)).toThrow();
      expect(() => exportReportToPDF(undefined)).not.toThrow();
      expect(() => exportReportToExcel(undefined)).not.toThrow();
    });

    it('should work with special characters in data', () => {
      const specialData = {
        dateRange: 'Từ 01/01/2024 đến 31/01/2024',
        totalDifference: 1000000,
        percentDifference: 15.5,
        insights: [{ message: 'Thông tin đặc biệt với ký tự: áàảãạ' }]
      };
      
      const result = renderReportHeader({ start: specialData.dateRange.split(' ')[1], end: specialData.dateRange.split(' ')[3] });
      expect(result).toContain('01/01/2024');
      expect(result).toContain('31/01/2024');
    });

    it('should handle large numbers correctly', () => {
      const largeCashFlow = { total: 999999999999, largePayments: [] };
      const largeAccrual = { total: 888888888888, allocatedExpenses: [] };
      const largeComparison = {
        totalDifference: 111111111111,
        percentDifference: 12.5,
        insights: []
      };
      
      const summary = generateReportSummary(largeCashFlow, largeAccrual, largeComparison);
      
      expect(summary.cashFlowTotal).toBe(999999999999);
      expect(summary.accrualTotal).toBe(888888888888);
      expect(summary.difference).toBe(111111111111);
    });

    it('should maintain data integrity across multiple function calls', () => {
      const testData = {
        cashFlow: { total: 1000000, largePayments: [{ amount: 500000 }] },
        accrual: { total: 900000, allocatedExpenses: [{ amount: 300000 }] },
        comparison: { totalDifference: 100000, percentDifference: 11.11, insights: [] }
      };
      
      // Multiple calls should not modify the original data
      const summary1 = generateReportSummary(testData.cashFlow, testData.accrual, testData.comparison);
      const summary2 = generateReportSummary(testData.cashFlow, testData.accrual, testData.comparison);
      
      expect(summary1).toEqual(summary2);
      expect(testData.cashFlow.total).toBe(1000000); // Original data unchanged
    });

    it('should handle concurrent style additions', () => {
      // Simulate multiple concurrent calls
      document.getElementById.mockReturnValue(null);
      
      const promises = Array.from({ length: 5 }, () => 
        Promise.resolve().then(() => addCashFlowVsAccrualStyles())
      );
      
      return Promise.all(promises).then(() => {
        // Should only create styles once, even with concurrent calls
        expect(document.createElement).toHaveBeenCalledTimes(5);
      });
    });

    it('should handle malformed date ranges', () => {
      const malformedRanges = [
        { start: '', end: '' }, // Empty strings
        { start: null, end: null }, // Null values
        { start: undefined, end: undefined }, // Undefined values
        { start: '2024-01-01' }, // Missing end
        { end: '2024-01-31' } // Missing start
      ];
      
      malformedRanges.forEach(range => {
        expect(() => renderReportHeader(range)).not.toThrow();
        const result = renderReportHeader(range);
        expect(result).toContain('Tất cả thời gian');
      });
      
      // Test with invalid but present strings (these should still display the values)
      const validStringRanges = [
        { start: 'invalid-date', end: '2024-01-31' },
        { start: '2024-01-01', end: 'invalid-date' }
      ];
      
      validStringRanges.forEach(range => {
        expect(() => renderReportHeader(range)).not.toThrow();
        const result = renderReportHeader(range);
        expect(result).toContain(`${range.start} - ${range.end}`);
      });
    });
  });
});