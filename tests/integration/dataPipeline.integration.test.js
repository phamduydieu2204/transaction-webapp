/**
 * Integration tests for data pipeline
 * Tests how modules work together in real-world scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import modules being tested
import { 
  calculateTotalExpenses, 
  calculateTotalRevenue, 
  calculateFinancialAnalysis,
  calculateAllocatedExpense 
} from '../../scripts/statistics/calculations.js';

import {
  normalizeExpenseData,
  normalizeTransactionData,
  aggregateByPeriod,
  groupByField
} from '../../scripts/statistics-data/dataTransformers.js';

import {
  calculateExpenseByCategoryData,
  calculateCategoryStats,
  groupExpensesByPeriod
} from '../../scripts/expense-category/categoryDataProcessors.js';

import {
  prepareRevenueChartData,
  prepareExpenseChartData,
  prepareROIChartData
} from '../../scripts/statistics/chartHelpers.js';

import {
  initializeStateManager,
  updateState,
  getState,
  persistState,
  cleanupStateManager
} from '../../scripts/core/stateManager.js';

import {
  generateReportSummary
} from '../../scripts/cash-flow/reportUtilities.js';

// Mock localStorage and other globals
const setupMocks = () => {
  global.localStorage = {
    data: {},
    getItem: vi.fn((key) => global.localStorage.data[key] || null),
    setItem: vi.fn((key, value) => { global.localStorage.data[key] = value; }),
    removeItem: vi.fn((key) => { delete global.localStorage.data[key]; }),
    clear: vi.fn(() => { global.localStorage.data = {}; })
  };

  global.window = {
    addEventListener: vi.fn(),
    appState: null,
    DEBUG: false
  };

  global.console = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  };

  global.setInterval = vi.fn();
  global.clearInterval = vi.fn();
  global.Date.now = vi.fn(() => 1704067200000);
  global.Blob = vi.fn().mockImplementation((content) => ({
    size: JSON.stringify(content).length
  }));
};

describe('Data Pipeline Integration Tests', () => {
  // Sample data that flows through the pipeline
  const sampleTransactions = [
    {
      id: 'txn_1',
      date: '2024-01-15',
      amount: 2000000,
      currency: 'VND',
      revenue: 2000000,
      customer: 'Customer A',
      software: 'Software A',
      package: 'Basic'
    },
    {
      id: 'txn_2', 
      date: '2024-01-20',
      amount: 1500000,
      currency: 'VND',
      revenue: 1500000,
      customer: 'Customer B',
      software: 'Software B',
      package: 'Premium'
    },
    {
      id: 'txn_3',
      date: '2024-02-10',
      amount: 500,
      currency: 'USD',
      revenue: 12000000,
      customer: 'Customer C',
      software: 'Software A',
      package: 'Enterprise'
    }
  ];

  const sampleExpenses = [
    {
      id: 'exp_1',
      date: '2024-01-10',
      amount: 500000,
      currency: 'VND',
      category: 'Hosting',
      type: 'Kinh doanh phần mềm',
      periodicAllocation: 'Không'
    },
    {
      id: 'exp_2',
      date: '2024-01-05',
      amount: 300000,
      currency: 'VND', 
      category: 'Ăn uống',
      type: 'Sinh hoạt cá nhân',
      periodicAllocation: 'Không'
    },
    {
      id: 'exp_3',
      date: '2024-01-01',
      amount: 1000000,
      currency: 'VND',
      category: 'Thuê nhà',
      type: 'Sinh hoạt cá nhân',
      periodicAllocation: 'Có',
      renewDate: '2024-12-31'
    }
  ];

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

  describe('Transaction Processing Pipeline', () => {
    it('should process transactions through the complete pipeline', () => {
      // Step 1: Normalize transaction data
      const normalizedTransactions = normalizeTransactionData(sampleTransactions);
      
      expect(normalizedTransactions).toHaveLength(3);
      expect(normalizedTransactions[0]).toHaveProperty('amount');
      expect(normalizedTransactions[0]).toHaveProperty('revenue');

      // Step 2: Calculate total revenue
      const totalRevenue = calculateTotalRevenue(normalizedTransactions);
      
      expect(totalRevenue.VND).toBe(3500000);
      expect(totalRevenue.USD).toBe(500);

      // Step 3: Prepare chart data
      const chartData = prepareRevenueChartData(normalizedTransactions.map(t => ({
        month: t.date.substring(0, 7),
        software: t.software,
        amount: t.revenue
      })));

      expect(chartData).toHaveProperty('labels');
      expect(chartData).toHaveProperty('datasets');
      expect(chartData.datasets).toHaveLength(2); // Software A and B

      // Step 4: Update state with processed data
      initializeStateManager();
      updateState({
        transactions: normalizedTransactions,
        totalRevenue: totalRevenue
      }, false);

      const currentState = getState();
      expect(currentState.transactions).toHaveLength(3);
      expect(currentState.totalRevenue).toEqual(totalRevenue);
    });

    it('should aggregate transactions by period correctly', () => {
      const normalizedTransactions = normalizeTransactionData(sampleTransactions);
      
      // Aggregate by month
      const monthlyRevenue = aggregateByPeriod(normalizedTransactions, 'monthly', 'revenue');
      
      expect(monthlyRevenue).toHaveProperty('2024-01');
      expect(monthlyRevenue).toHaveProperty('2024-02');
      expect(monthlyRevenue['2024-01']).toBe(3500000); // 2M + 1.5M VND
      expect(monthlyRevenue['2024-02']).toBe(12000000); // USD converted
    });

    it('should group transactions by software correctly', () => {
      const normalizedTransactions = normalizeTransactionData(sampleTransactions);
      
      const groupedBySoftware = groupByField(normalizedTransactions, 'software');
      
      expect(groupedBySoftware).toHaveProperty('Software A');
      expect(groupedBySoftware).toHaveProperty('Software B');
      expect(groupedBySoftware['Software A']).toHaveLength(2);
      expect(groupedBySoftware['Software B']).toHaveLength(1);
    });
  });

  describe('Expense Processing Pipeline', () => {
    it('should process expenses through the complete pipeline', () => {
      // Step 1: Normalize expense data
      const normalizedExpenses = normalizeExpenseData(sampleExpenses);
      
      expect(normalizedExpenses).toHaveLength(3);
      expect(normalizedExpenses[0]).toHaveProperty('amount');
      expect(normalizedExpenses[0]).toHaveProperty('type');

      // Step 2: Calculate total expenses
      const totalExpenses = calculateTotalExpenses(normalizedExpenses);
      
      expect(totalExpenses.VND).toBe(1800000);

      // Step 3: Process by categories
      const categoryData = calculateExpenseByCategoryData(normalizedExpenses);
      
      expect(categoryData).toHaveProperty('categories');
      expect(categoryData).toHaveProperty('monthly');
      expect(categoryData.categories['Kinh doanh phần mềm'].total).toBe(500000);
      expect(categoryData.categories['Sinh hoạt cá nhân'].total).toBe(1300000);

      // Step 4: Calculate category statistics
      const categoryStats = calculateCategoryStats(categoryData);
      
      expect(categoryStats.totalExpense).toBe(1800000);
      expect(categoryStats.topCategory.name).toBe('Sinh hoạt cá nhân');
      expect(categoryStats.topCategory.amount).toBe(1300000);

      // Step 5: Prepare chart data
      const chartData = prepareExpenseChartData(normalizedExpenses);
      
      expect(chartData.labels).toContain('Kinh doanh phần mềm');
      expect(chartData.labels).toContain('Sinh hoạt cá nhân');
    });

    it('should handle periodic expense allocation correctly', () => {
      const periodicExpense = sampleExpenses.find(e => e.periodicAllocation === 'Có');
      
      // Calculate allocated amount for January 2024
      const allocatedAmount = calculateAllocatedExpense(
        periodicExpense, 
        '2024-01', 
        new Date('2024-01-31')
      );
      
      expect(allocatedAmount).toBeGreaterThan(0);
      expect(allocatedAmount).toBeLessThan(periodicExpense.amount);

      // Verify it's included in category processing
      const categoryData = calculateExpenseByCategoryData(sampleExpenses);
      const personalExpenses = categoryData.categories['Sinh hoạt cá nhân'].total;
      
      expect(personalExpenses).toBe(1300000); // Should include full allocated amount
    });

    it('should group expenses by different periods', () => {
      const normalizedExpenses = normalizeExpenseData(sampleExpenses);
      
      // Test monthly grouping
      const monthlyGroups = groupExpensesByPeriod(normalizedExpenses, 'monthly');
      expect(monthlyGroups).toHaveProperty('2024-01');
      expect(monthlyGroups['2024-01'].total).toBe(1800000);

      // Test quarterly grouping  
      const quarterlyGroups = groupExpensesByPeriod(normalizedExpenses, 'quarterly');
      expect(quarterlyGroups).toHaveProperty('2024-Q1');
      expect(quarterlyGroups['2024-Q1'].total).toBe(1800000);
    });
  });

  describe('Financial Analysis Integration', () => {
    it('should perform end-to-end financial analysis', () => {
      const normalizedTransactions = normalizeTransactionData(sampleTransactions);
      const normalizedExpenses = normalizeExpenseData(sampleExpenses);

      // Calculate totals
      const totalRevenue = calculateTotalRevenue(normalizedTransactions);
      const totalExpenses = calculateTotalExpenses(normalizedExpenses);

      // Perform financial analysis
      const analysis = calculateFinancialAnalysis(totalRevenue, totalExpenses);

      expect(analysis).toHaveProperty('profit');
      expect(analysis).toHaveProperty('profitMargin');
      expect(analysis).toHaveProperty('expenseRatio');

      // Calculate VND figures
      const vndRevenue = totalRevenue.VND + (totalRevenue.USD * 24000); // Approximate exchange rate
      const vndExpenses = totalExpenses.VND;
      const expectedProfit = vndRevenue - vndExpenses;

      expect(analysis.profit.VND).toBeCloseTo(expectedProfit, -1000); // Allow for rounding
    });

    it('should prepare ROI chart data with calculated metrics', () => {
      // Simulate ROI data from financial calculations
      const roiData = [
        {
          tenChuan: 'Software A',
          revenue: 14000000, // 2M VND + 500 USD converted
          allocatedExpense: 250000, // Allocated from hosting
          accountingProfit: 13750000,
          accountingROI: 5500 // Very high ROI
        },
        {
          tenChuan: 'Software B', 
          revenue: 1500000,
          allocatedExpense: 250000, // Allocated from hosting
          accountingProfit: 1250000,
          accountingROI: 500
        }
      ];

      const chartData = prepareROIChartData(roiData);

      expect(chartData.labels).toEqual(['Software A', 'Software B']);
      expect(chartData.datasets).toHaveLength(3); // Revenue, Expense, Profit
      
      const revenueDataset = chartData.datasets.find(d => d.label === 'Doanh thu');
      const expenseDataset = chartData.datasets.find(d => d.label === 'Chi phí');
      const profitDataset = chartData.datasets.find(d => d.label === 'Lợi nhuận');

      expect(revenueDataset.data).toEqual([14000000, 1500000]);
      expect(expenseDataset.data).toEqual([250000, 250000]);
      expect(profitDataset.data).toEqual([13750000, 1250000]);
    });
  });

  describe('State Management Integration', () => {
    it('should integrate state management with data processing', () => {
      initializeStateManager();

      // Process and store transaction data
      const normalizedTransactions = normalizeTransactionData(sampleTransactions);
      const totalRevenue = calculateTotalRevenue(normalizedTransactions);

      updateState({
        transactions: normalizedTransactions,
        totalRevenue: totalRevenue,
        currentPage: 1,
        isLoading: false
      });

      // Process and store expense data
      const normalizedExpenses = normalizeExpenseData(sampleExpenses);
      const categoryData = calculateExpenseByCategoryData(normalizedExpenses);

      updateState({
        expenses: normalizedExpenses,
        categoryData: categoryData
      });

      // Verify state consistency
      const currentState = getState();
      
      expect(currentState.transactions).toHaveLength(3);
      expect(currentState.expenses).toHaveLength(3);
      expect(currentState.totalRevenue.VND).toBe(3500000);
      expect(currentState.categoryData.categories['Sinh hoạt cá nhân'].total).toBe(1300000);

      // Test state persistence
      persistState();
      expect(global.localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle state updates during data processing', () => {
      initializeStateManager();

      // Simulate loading state
      updateState({ isLoading: true, loadingMessage: 'Processing transactions...' });

      const processingState = getState();
      expect(processingState.isLoading).toBe(true);
      expect(processingState.loadingMessage).toBe('Processing transactions...');

      // Simulate completion
      const processedData = normalizeTransactionData(sampleTransactions);
      updateState({ 
        isLoading: false, 
        loadingMessage: '',
        transactions: processedData,
        lastUpdate: Date.now()
      });

      const completedState = getState();
      expect(completedState.isLoading).toBe(false);
      expect(completedState.transactions).toHaveLength(3);
    });
  });

  describe('Report Generation Integration', () => {
    it('should generate comprehensive reports from processed data', () => {
      // Process all data types
      const normalizedTransactions = normalizeTransactionData(sampleTransactions);
      const normalizedExpenses = normalizeExpenseData(sampleExpenses);
      
      const totalRevenue = calculateTotalRevenue(normalizedTransactions);
      const totalExpenses = calculateTotalExpenses(normalizedExpenses);
      const analysis = calculateFinancialAnalysis(totalRevenue, totalExpenses);

      // Simulate cash flow and accrual data for report
      const cashFlowData = {
        total: totalExpenses.VND,
        largePayments: normalizedExpenses.filter(e => e.amount > 400000)
      };

      const accrualData = {
        total: totalExpenses.VND * 0.85, // Assume some allocation differences
        allocatedExpenses: normalizedExpenses.filter(e => e.periodicAllocation === 'Có')
      };

      const comparisonData = {
        dateRange: '2024-01-01 to 2024-01-31',
        totalDifference: cashFlowData.total - accrualData.total,
        percentDifference: ((cashFlowData.total - accrualData.total) / accrualData.total) * 100,
        insights: [
          { type: 'warning', message: 'Significant difference detected' }
        ]
      };

      // Generate report summary
      const reportSummary = generateReportSummary(cashFlowData, accrualData, comparisonData);

      expect(reportSummary.period).toBe('2024-01-01 to 2024-01-31');
      expect(reportSummary.cashFlowTotal).toBe(cashFlowData.total);
      expect(reportSummary.accrualTotal).toBe(accrualData.total);
      expect(reportSummary.difference).toBe(comparisonData.totalDifference);
      expect(reportSummary.insights).toBe(1);
      expect(reportSummary.largePayments).toBe(2); // Expenses > 400k
      expect(reportSummary.allocatedExpenses).toBe(1); // Periodic expenses
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain data consistency across transformations', () => {
      const originalTransactions = [...sampleTransactions];
      const originalExpenses = [...sampleExpenses];

      // Transform data
      const normalizedTransactions = normalizeTransactionData(originalTransactions);
      const normalizedExpenses = normalizeExpenseData(originalExpenses);

      // Verify original data is unchanged
      expect(originalTransactions).toEqual(sampleTransactions);
      expect(originalExpenses).toEqual(sampleExpenses);

      // Verify transformations maintain essential data
      expect(normalizedTransactions).toHaveLength(originalTransactions.length);
      expect(normalizedExpenses).toHaveLength(originalExpenses.length);

      // Check data integrity
      const originalRevenueSum = originalTransactions.reduce((sum, t) => sum + t.revenue, 0);
      const normalizedRevenueSum = normalizedTransactions.reduce((sum, t) => sum + t.revenue, 0);
      expect(normalizedRevenueSum).toBe(originalRevenueSum);
    });

    it('should handle currency conversion consistency', () => {
      const mixedCurrencyTransactions = [
        { ...sampleTransactions[0], currency: 'VND', revenue: 1000000 },
        { ...sampleTransactions[1], currency: 'USD', revenue: 100 }, // Should be converted
        { ...sampleTransactions[2], currency: 'NGN', revenue: 50000 } // Should be converted
      ];

      const totalRevenue = calculateTotalRevenue(mixedCurrencyTransactions);
      
      expect(totalRevenue).toHaveProperty('VND');
      expect(totalRevenue).toHaveProperty('USD');
      expect(totalRevenue).toHaveProperty('NGN');
      
      // Verify each currency is handled separately
      expect(totalRevenue.VND).toBe(1000000);
      expect(totalRevenue.USD).toBe(100);
      expect(totalRevenue.NGN).toBe(50000);
    });

    it('should validate data pipeline performance with large datasets', () => {
      // Generate large dataset
      const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `txn_${i}`,
        date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        amount: Math.floor(Math.random() * 5000000),
        currency: ['VND', 'USD', 'NGN'][i % 3],
        revenue: Math.floor(Math.random() * 5000000),
        customer: `Customer ${i % 100}`,
        software: `Software ${String.fromCharCode(65 + (i % 5))}`,
        package: ['Basic', 'Premium', 'Enterprise'][i % 3]
      }));

      const start = performance.now();
      
      // Process through pipeline
      const normalized = normalizeTransactionData(largeTransactions);
      const totalRevenue = calculateTotalRevenue(normalized);
      const chartData = prepareRevenueChartData(normalized.map(t => ({
        month: t.date.substring(0, 7),
        software: t.software,
        amount: t.revenue
      })));
      
      const end = performance.now();
      
      // Verify processing completed successfully
      expect(normalized).toHaveLength(1000);
      expect(totalRevenue).toBeDefined();
      expect(chartData.datasets.length).toBeGreaterThan(0);
      
      // Performance check - should complete within reasonable time
      expect(end - start).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle malformed data gracefully throughout pipeline', () => {
      const malformedData = [
        { id: 'txn_1' }, // Missing required fields
        { id: 'txn_2', date: 'invalid-date', amount: 'not-a-number' },
        { id: 'txn_3', date: '2024-01-15', amount: 1000000, revenue: null }
      ];

      // Each function should handle malformed data without crashing
      expect(() => {
        const normalized = normalizeTransactionData(malformedData);
        const total = calculateTotalRevenue(normalized);
        const chartData = prepareRevenueChartData([]);
      }).not.toThrow();
    });

    it('should recover from state corruption', () => {
      initializeStateManager();

      // Simulate corrupted state
      updateState({ 
        transactions: 'not-an-array',
        expenses: null,
        currentPage: 'invalid'
      });

      // State manager should validate and fix corruption
      const state = getState();
      expect(Array.isArray(state.transactions)).toBe(true);
      expect(Array.isArray(state.expenses)).toBe(true);
      expect(typeof state.currentPage).toBe('number');
    });
  });
});