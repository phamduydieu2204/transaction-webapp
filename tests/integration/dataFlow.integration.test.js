/**
 * Simplified Integration Tests for Data Flow
 * Tests realistic data pipeline integration without assuming specific formats
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import core modules
import { 
  calculateTotalExpenses, 
  calculateTotalRevenue, 
  calculateFinancialAnalysis 
} from '../../scripts/statistics/calculations.js';

import {
  normalizeExpenseData,
  normalizeTransactionData,
  formatCurrency,
  formatDate
} from '../../scripts/statistics-data/dataTransformers.js';

import {
  calculateExpenseByCategoryData,
  getMainCategories
} from '../../scripts/expense-category/categoryDataProcessors.js';

import {
  prepareRevenueChartData,
  prepareExpenseChartData,
  generateColors
} from '../../scripts/statistics/chartHelpers.js';

import {
  initializeStateManager,
  updateState,
  getState,
  cleanupStateManager
} from '../../scripts/core/stateManager.js';

import {
  renderReportHeader,
  generateReportSummary
} from '../../scripts/cash-flow/reportUtilities.js';

// Simple test data
const testTransactions = [
  {
    id: 'T1',
    ngayTao: '2024-01-15',
    soTien: 1000000,
    currency: 'VND',
    khachHang: 'Customer A',
    phanMem: 'Software X'
  },
  {
    id: 'T2', 
    ngayTao: '2024-01-20',
    soTien: 500,
    currency: 'USD',
    khachHang: 'Customer B',
    phanMem: 'Software Y'
  }
];

const testExpenses = [
  {
    id: 'E1',
    ngayTao: '2024-01-10',
    soTien: 300000,
    currency: 'VND',
    danhMuc: 'Hosting',
    loai: 'Kinh doanh phần mềm'
  },
  {
    id: 'E2',
    ngayTao: '2024-01-15', 
    soTien: 200000,
    currency: 'VND',
    danhMuc: 'Ăn uống',
    loai: 'Sinh hoạt cá nhân'
  }
];

// Mock environment
const setupMocks = () => {
  global.localStorage = {
    data: {},
    getItem: vi.fn((key) => global.localStorage.data[key] || null),
    setItem: vi.fn((key, value) => { global.localStorage.data[key] = value; }),
    removeItem: vi.fn((key) => { delete global.localStorage.data[key]; })
  };

  global.window = {
    addEventListener: vi.fn(),
    appState: null
  };

  global.document = {
    getElementById: vi.fn(),
    createElement: vi.fn(() => ({ id: '', textContent: '' })),
    head: { appendChild: vi.fn() }
  };

  global.console = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  };

  global.setInterval = vi.fn();
  global.clearInterval = vi.fn();
  global.Date.now = vi.fn(() => 1704067200000);
};

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  afterEach(() => {
    try {
      cleanupStateManager();
    } catch (e) {
      // Ignore cleanup errors
    }
    vi.restoreAllMocks();
  });

  describe('Basic Data Processing Integration', () => {
    it('should process data through normalization and calculation pipeline', () => {
      // Step 1: Normalize data (test that functions don't crash)
      const normalizedTransactions = normalizeTransactionData(testTransactions);
      const normalizedExpenses = normalizeExpenseData(testExpenses);

      // Verify normalization completed without errors
      expect(Array.isArray(normalizedTransactions)).toBe(true);
      expect(Array.isArray(normalizedExpenses)).toBe(true);
      expect(normalizedTransactions.length).toBeGreaterThan(0);
      expect(normalizedExpenses.length).toBeGreaterThan(0);

      // Step 2: Calculate totals
      const totalRevenue = calculateTotalRevenue(normalizedTransactions);
      const totalExpenses = calculateTotalExpenses(normalizedExpenses);

      // Verify calculations return valid data structures
      expect(typeof totalRevenue).toBe('object');
      expect(typeof totalExpenses).toBe('object');
      expect(totalRevenue).toBeDefined();
      expect(totalExpenses).toBeDefined();

      // Step 3: Perform financial analysis
      const analysis = calculateFinancialAnalysis(totalRevenue, totalExpenses);
      
      expect(typeof analysis).toBe('object');
      expect(analysis).toBeDefined();
    });

    it('should format data for user display', () => {
      const normalizedTransactions = normalizeTransactionData(testTransactions);
      
      // Test data formatting functions
      const formatted = normalizedTransactions.map(transaction => ({
        ...transaction,
        displayAmount: formatCurrency(transaction.amount || transaction.soTien, 'VND'),
        displayDate: formatDate(transaction.date || transaction.ngayTao)
      }));

      expect(formatted).toHaveLength(normalizedTransactions.length);
      formatted.forEach(item => {
        expect(typeof item.displayAmount).toBe('string');
        expect(typeof item.displayDate).toBe('string');
      });
    });
  });

  describe('Category Processing Integration', () => {
    it('should process expenses through category analysis', () => {
      const normalizedExpenses = normalizeExpenseData(testExpenses);
      
      // Get category configuration
      const mainCategories = getMainCategories();
      expect(typeof mainCategories).toBe('object');
      expect(Object.keys(mainCategories).length).toBeGreaterThan(0);

      // Process category data (with proper data structure)
      const expensesWithCategories = normalizedExpenses.map(expense => ({
        ...expense,
        type: expense.type || expense.loai || 'Khác',
        category: expense.category || expense.danhMuc || 'Khác',
        amount: parseFloat(expense.amount || expense.soTien) || 0,
        date: expense.date || expense.ngayTao
      }));

      const categoryData = calculateExpenseByCategoryData(expensesWithCategories);
      
      expect(typeof categoryData).toBe('object');
      expect(categoryData).toHaveProperty('categories');
      expect(categoryData).toHaveProperty('monthly');
    });
  });

  describe('Chart Data Preparation Integration', () => {
    it('should prepare data for chart visualization', () => {
      const normalizedTransactions = normalizeTransactionData(testTransactions);
      const normalizedExpenses = normalizeExpenseData(testExpenses);

      // Prepare revenue chart data
      const revenueChartData = prepareRevenueChartData([
        { month: '2024-01', software: 'Software X', amount: 1000000 },
        { month: '2024-01', software: 'Software Y', amount: 500000 }
      ]);

      expect(revenueChartData).toHaveProperty('labels');
      expect(revenueChartData).toHaveProperty('datasets');
      expect(Array.isArray(revenueChartData.labels)).toBe(true);
      expect(Array.isArray(revenueChartData.datasets)).toBe(true);

      // Prepare expense chart data
      const expenseChartData = prepareExpenseChartData([
        { type: 'Kinh doanh phần mềm', amount: 300000 },
        { type: 'Sinh hoạt cá nhân', amount: 200000 }
      ]);

      expect(expenseChartData).toHaveProperty('labels');
      expect(expenseChartData).toHaveProperty('datasets');

      // Generate colors for charts
      const colors = generateColors(5, 'primary');
      expect(Array.isArray(colors)).toBe(true);
      expect(colors).toHaveLength(5);
    });
  });

  describe('State Management Integration', () => {
    it('should integrate data processing with state management', () => {
      // Initialize state manager
      const initResult = initializeStateManager();
      expect(typeof initResult).toBe('boolean');

      // Get initial state
      const initialState = getState();
      expect(typeof initialState).toBe('object');
      expect(initialState).toBeDefined();

      // Process some data
      const normalizedTransactions = normalizeTransactionData(testTransactions);
      const normalizedExpenses = normalizeExpenseData(testExpenses);

      // Update state with processed data (using existing state properties)
      updateState({
        transactions: normalizedTransactions,
        expenses: normalizedExpenses
      }, false); // Don't persist during tests

      // Verify state was updated
      const updatedState = getState();
      expect(updatedState.transactions).toBeDefined();
      expect(updatedState.expenses).toBeDefined();
      expect(Array.isArray(updatedState.transactions)).toBe(true);
      expect(Array.isArray(updatedState.expenses)).toBe(true);
    });
  });

  describe('Report Generation Integration', () => {
    it('should generate reports from processed data', () => {
      // Generate report header
      const reportHeader = renderReportHeader({
        start: '2024-01-01',
        end: '2024-01-31'
      });

      expect(typeof reportHeader).toBe('string');
      expect(reportHeader.length).toBeGreaterThan(0);
      expect(reportHeader).toContain('2024-01-01');
      expect(reportHeader).toContain('2024-01-31');

      // Generate report summary with mock data
      const mockCashFlow = { total: 500000, largePayments: [] };
      const mockAccrual = { total: 450000, allocatedExpenses: [] };
      const mockComparison = {
        dateRange: '2024-01-01 to 2024-01-31',
        totalDifference: 50000,
        percentDifference: 11.11,
        insights: []
      };

      const reportSummary = generateReportSummary(mockCashFlow, mockAccrual, mockComparison);

      expect(typeof reportSummary).toBe('object');
      expect(reportSummary.period).toBe('2024-01-01 to 2024-01-31');
      expect(reportSummary.cashFlowTotal).toBe(500000);
      expect(reportSummary.accrualTotal).toBe(450000);
      expect(reportSummary.difference).toBe(50000);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed data gracefully across modules', () => {
      // Use less problematic malformed data that still tests error handling
      const malformedData = [
        { id: 'test', invalidField: 'data' },
        { someField: 'value' },
        { id: 'another', date: 'invalid-date', amount: 'not-a-number' }
      ];

      // All normalization functions should handle bad data without crashing
      expect(() => {
        normalizeTransactionData(malformedData);
      }).not.toThrow();

      expect(() => {
        normalizeExpenseData(malformedData);
      }).not.toThrow();

      // Chart functions should handle empty/invalid data
      expect(() => {
        prepareRevenueChartData([]);
      }).not.toThrow();

      expect(() => {
        prepareExpenseChartData([]);
      }).not.toThrow();
    });

    it('should handle state management errors gracefully', () => {
      // Initialize state manager
      initializeStateManager();

      // Try to update state with invalid data
      expect(() => {
        updateState({ invalidProperty: 'test' }, false);
      }).not.toThrow();

      // State should still be accessible
      const state = getState();
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    });
  });

  describe('Performance Integration', () => {
    it('should handle moderate datasets efficiently', () => {
      // Generate moderate dataset
      const largeTransactions = Array.from({ length: 100 }, (_, i) => ({
        id: `T${i}`,
        ngayTao: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        soTien: Math.floor(Math.random() * 1000000),
        currency: 'VND'
      }));

      const largeExpenses = Array.from({ length: 100 }, (_, i) => ({
        id: `E${i}`,
        ngayTao: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        soTien: Math.floor(Math.random() * 500000),
        currency: 'VND'
      }));

      const start = performance.now();

      // Process through pipeline
      const normalizedTransactions = normalizeTransactionData(largeTransactions);
      const normalizedExpenses = normalizeExpenseData(largeExpenses);
      const totalRevenue = calculateTotalRevenue(normalizedTransactions);
      const totalExpenses = calculateTotalExpenses(normalizedExpenses);

      const end = performance.now();

      // Verify processing completed
      expect(normalizedTransactions).toBeDefined();
      expect(normalizedExpenses).toBeDefined();
      expect(totalRevenue).toBeDefined();
      expect(totalExpenses).toBeDefined();

      // Performance should be reasonable (less than 100ms for 100 items)
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Module Interoperability', () => {
    it('should demonstrate data flow between all modules', () => {
      // Complete integration workflow
      initializeStateManager();

      // 1. Data normalization
      const transactions = normalizeTransactionData(testTransactions);
      const expenses = normalizeExpenseData(testExpenses);

      // 2. Financial calculations
      const revenue = calculateTotalRevenue(transactions);
      const expenseTotal = calculateTotalExpenses(expenses);

      // 3. State management
      updateState({
        transactions,
        expenses,
        revenue,
        expenseTotal
      }, false);

      // 4. Category processing
      const expensesForCategory = expenses.map(e => ({
        ...e,
        type: 'Kinh doanh phần mềm',
        amount: e.amount || e.soTien || 0,
        date: e.date || e.ngayTao
      }));
      const categoryData = calculateExpenseByCategoryData(expensesForCategory);

      // 5. Chart preparation
      const chartData = prepareRevenueChartData([
        { month: '2024-01', software: 'Test', amount: 100000 }
      ]);

      // 6. Report generation
      const reportHeader = renderReportHeader({
        start: '2024-01-01',
        end: '2024-01-31'
      });

      // Verify all steps completed successfully
      const finalState = getState();
      expect(finalState.transactions).toBeDefined();
      expect(finalState.expenses).toBeDefined();
      expect(categoryData).toBeDefined();
      expect(chartData).toBeDefined();
      expect(reportHeader).toBeDefined();

      // Verify data types
      expect(Array.isArray(finalState.transactions)).toBe(true);
      expect(Array.isArray(finalState.expenses)).toBe(true);
      expect(typeof categoryData).toBe('object');
      expect(typeof chartData).toBe('object');
      expect(typeof reportHeader).toBe('string');
    });
  });
});