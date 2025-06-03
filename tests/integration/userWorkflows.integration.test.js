/**
 * Integration tests for user workflows
 * Tests end-to-end user scenarios and component interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import modules for testing complete workflows
import { 
  calculateTotalExpenses, 
  calculateTotalRevenue, 
  calculateFinancialAnalysis 
} from '../../scripts/statistics/calculations.js';

import {
  normalizeExpenseData,
  normalizeTransactionData,
  aggregateByPeriod,
  formatCurrency,
  formatDate
} from '../../scripts/statistics-data/dataTransformers.js';

import {
  calculateExpenseByCategoryData,
  calculateCategoryStats,
  getMainCategories
} from '../../scripts/expense-category/categoryDataProcessors.js';

import {
  prepareRevenueChartData,
  prepareExpenseChartData,
  prepareComparisonChartData,
  generateColors,
  generateChartConfig
} from '../../scripts/statistics/chartHelpers.js';

import {
  initializeStateManager,
  updateState,
  getState,
  subscribeToState,
  resetState,
  cleanupStateManager
} from '../../scripts/core/stateManager.js';

import {
  renderReportHeader,
  generateReportSummary,
  formatReportForPrint
} from '../../scripts/cash-flow/reportUtilities.js';

// Mock browser environment
const setupBrowserMocks = () => {
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

  global.document = {
    getElementById: vi.fn(),
    createElement: vi.fn(() => ({
      id: '',
      textContent: '',
      style: {}
    })),
    head: {
      appendChild: vi.fn()
    }
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

describe('User Workflow Integration Tests', () => {
  // Real-world sample data representing user inputs
  const userTransactionData = [
    {
      id: 'TXN001',
      date: '2024-01-15',
      amount: 2500000,
      currency: 'VND',
      revenue: 2500000,
      customer: 'Công ty ABC',
      software: 'Phần mềm quản lý',
      package: 'Gói cơ bản',
      loaiKeToAn: 'Doanh thu bán hàng'
    },
    {
      id: 'TXN002',
      date: '2024-01-20',
      amount: 800,
      currency: 'USD',
      revenue: 19200000, // Converted to VND
      customer: 'International Corp',
      software: 'Cloud Solution',
      package: 'Enterprise',
      loaiKeToAn: 'Doanh thu dịch vụ'
    },
    {
      id: 'TXN003',
      date: '2024-02-05',
      amount: 1800000,
      currency: 'VND',
      revenue: 1800000,
      customer: 'Doanh nghiệp XYZ',
      software: 'Phần mềm quản lý',
      package: 'Gói nâng cao',
      loaiKeToAn: 'Doanh thu bán hàng'
    }
  ];

  const userExpenseData = [
    {
      id: 'EXP001',
      date: '2024-01-10',
      amount: 800000,
      currency: 'VND',
      category: 'Server hosting',
      type: 'Kinh doanh phần mềm',
      periodicAllocation: 'Có',
      renewDate: '2024-12-10',
      ghiChu: 'Chi phí hosting cho năm 2024'
    },
    {
      id: 'EXP002',
      date: '2024-01-15',
      amount: 500000,
      currency: 'VND',
      category: 'Ăn uống',
      type: 'Sinh hoạt cá nhân',
      periodicAllocation: 'Không',
      ghiChu: 'Chi phí ăn uống tháng 1'
    },
    {
      id: 'EXP003',
      date: '2024-01-20',
      amount: 300000,
      currency: 'VND',
      category: 'Marketing',
      type: 'Kinh doanh phần mềm',
      periodicAllocation: 'Không',
      ghiChu: 'Quảng cáo Facebook'
    },
    {
      id: 'EXP004',
      date: '2024-02-01',
      amount: 50,
      currency: 'USD',
      category: 'Software license',
      type: 'Kinh doanh phần mềm',
      periodicAllocation: 'Có',
      renewDate: '2024-08-01',
      ghiChu: 'License Figma 6 tháng'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    try {
      cleanupStateManager();
    } catch (e) {
      // Ignore cleanup errors
    }
    vi.restoreAllMocks();
  });

  describe('Dashboard Workflow - Revenue Overview', () => {
    it('should complete revenue dashboard workflow from data input to visualization', () => {
      // User workflow: Load transactions → Process → Display dashboard
      
      // Step 1: Initialize application state
      initializeStateManager();
      const initialState = getState();
      expect(initialState.transactions).toEqual([]);
      expect(initialState.isLoading).toBe(false);

      // Step 2: Simulate loading state during data fetch
      updateState({ 
        isLoading: true, 
        loadingMessage: 'Đang tải dữ liệu giao dịch...' 
      });

      // Step 3: Process incoming transaction data
      const normalizedData = normalizeTransactionData(userTransactionData);
      const totalRevenue = calculateTotalRevenue(normalizedData);

      // Step 4: Update state with processed data
      updateState({
        transactions: normalizedData,
        totalRevenue: totalRevenue,
        isLoading: false,
        loadingMessage: '',
        lastUpdate: Date.now()
      });

      // Step 5: Prepare data for revenue chart
      const chartData = prepareRevenueChartData(normalizedData.map(t => ({
        month: t.date.substring(0, 7),
        software: t.software,
        amount: t.revenue
      })));

      // Step 6: Generate chart configuration
      const chartConfig = generateChartConfig('line', {
        plugins: {
          title: {
            display: true,
            text: 'Biểu đồ doanh thu theo tháng'
          }
        }
      });

      // Verify complete workflow
      const finalState = getState();
      expect(finalState.transactions).toHaveLength(3);
      expect(finalState.totalRevenue.VND).toBe(23500000); // 2.5M + 19.2M + 1.8M
      expect(finalState.totalRevenue.USD).toBe(800);
      expect(finalState.isLoading).toBe(false);

      expect(chartData.datasets).toHaveLength(2); // Two software types
      expect(chartConfig.plugins.title.text).toBe('Biểu đồ doanh thu theo tháng');
    });

    it('should handle real-time revenue updates with state subscription', () => {
      initializeStateManager();
      
      // Set up revenue tracking
      let currentRevenue = null;
      const unsubscribe = subscribeToState('totalRevenue', (newRevenue) => {
        currentRevenue = newRevenue;
      });

      // Process initial transactions
      const initialData = normalizeTransactionData(userTransactionData.slice(0, 2));
      const initialRevenue = calculateTotalRevenue(initialData);
      
      updateState({ 
        transactions: initialData,
        totalRevenue: initialRevenue 
      });

      expect(currentRevenue.VND).toBe(21700000); // 2.5M + 19.2M

      // Add new transaction (simulating real-time update)
      const newTransaction = userTransactionData[2];
      const updatedData = [...initialData, normalizeTransactionData([newTransaction])[0]];
      const updatedRevenue = calculateTotalRevenue(updatedData);

      updateState({
        transactions: updatedData,
        totalRevenue: updatedRevenue
      });

      expect(currentRevenue.VND).toBe(23500000); // Previous + 1.8M

      unsubscribe();
    });
  });

  describe('Expense Management Workflow', () => {
    it('should complete expense management workflow from input to categorization', () => {
      // User workflow: Add expenses → Categorize → Analyze trends
      
      initializeStateManager();

      // Step 1: Process expense data
      const normalizedExpenses = normalizeExpenseData(userExpenseData);
      const totalExpenses = calculateTotalExpenses(normalizedExpenses);

      // Step 2: Categorize expenses
      const categoryData = calculateExpenseByCategoryData(normalizedExpenses);
      const categoryStats = calculateCategoryStats(categoryData);
      const mainCategories = getMainCategories();

      // Step 3: Update state with expense analysis
      updateState({
        expenses: normalizedExpenses,
        totalExpenses: totalExpenses,
        categoryData: categoryData,
        categoryStats: categoryStats
      });

      // Step 4: Prepare expense visualization
      const expenseChartData = prepareExpenseChartData(normalizedExpenses);
      const categoryColors = generateColors(Object.keys(mainCategories).length, 'expense');

      // Verify expense workflow results
      expect(totalExpenses.VND).toBe(1600000); // 800k + 500k + 300k
      expect(totalExpenses.USD).toBe(50);

      expect(categoryStats.totalExpense).toBeGreaterThan(0);
      expect(categoryStats.topCategory.name).toBe('Kinh doanh phần mềm');

      expect(expenseChartData.labels).toContain('Kinh doanh phần mềm');
      expect(expenseChartData.labels).toContain('Sinh hoạt cá nhân');
      expect(categoryColors).toHaveLength(4); // Four main categories
    });

    it('should handle periodic expense allocation workflow', () => {
      // Focus on periodic expenses (like hosting, licenses)
      const periodicExpenses = userExpenseData.filter(e => e.periodicAllocation === 'Có');
      
      expect(periodicExpenses).toHaveLength(2); // Hosting and software license

      // Process through category system
      const categoryData = calculateExpenseByCategoryData(periodicExpenses);
      
      // Verify periodic expenses are properly categorized
      expect(categoryData.categories['Kinh doanh phần mềm'].total).toBeGreaterThan(0);
      
      // Check if monthly allocation is working
      const monthlyData = categoryData.monthly;
      const januaryData = monthlyData.find(m => m.month === '2024-01');
      
      expect(januaryData).toBeDefined();
      expect(januaryData['Kinh doanh phần mềm']).toBeGreaterThan(0);
    });
  });

  describe('Financial Reporting Workflow', () => {
    it('should generate comprehensive financial report', () => {
      // Complete financial analysis workflow
      
      // Step 1: Process all financial data
      const transactions = normalizeTransactionData(userTransactionData);
      const expenses = normalizeExpenseData(userExpenseData);
      
      const totalRevenue = calculateTotalRevenue(transactions);
      const totalExpenses = calculateTotalExpenses(expenses);
      
      // Step 2: Perform financial analysis
      const analysis = calculateFinancialAnalysis(totalRevenue, totalExpenses);
      
      // Step 3: Generate period comparison
      const currentPeriodData = {
        'Kinh doanh phần mềm': { amount: analysis.profit.VND },
        'Sinh hoạt cá nhân': { amount: totalExpenses.VND * 0.3 }
      };
      
      const previousPeriodData = {
        'Kinh doanh phần mềm': { amount: analysis.profit.VND * 0.8 },
        'Sinh hoạt cá nhân': { amount: totalExpenses.VND * 0.25 }
      };
      
      const comparisonChart = prepareComparisonChartData(currentPeriodData, previousPeriodData);
      
      // Step 4: Generate report components
      const reportHeader = renderReportHeader({
        start: '2024-01-01',
        end: '2024-02-29'
      });
      
      const reportSummary = generateReportSummary(
        { total: totalExpenses.VND, largePayments: [] },
        { total: totalExpenses.VND * 0.9, allocatedExpenses: [] },
        {
          dateRange: '2024-01-01 to 2024-02-29',
          totalDifference: totalExpenses.VND * 0.1,
          percentDifference: 11.11,
          insights: [{ type: 'info', message: 'Positive growth trend' }]
        }
      );
      
      const printStyles = formatReportForPrint();
      
      // Verify complete reporting workflow
      expect(analysis.profit.VND).toBeGreaterThan(0);
      expect(analysis.profitMargin.VND).toBeGreaterThan(80); // Should be high profit margin
      
      expect(comparisonChart.datasets).toHaveLength(2);
      expect(comparisonChart.labels).toContain('Kinh doanh phần mềm');
      
      expect(reportHeader).toContain('💰 So sánh Cash Flow vs Chi phí phân bổ');
      expect(reportHeader).toContain('2024-01-01 - 2024-02-29');
      
      expect(reportSummary.period).toBe('2024-01-01 to 2024-02-29');
      expect(reportSummary.percentDifference).toBe(11.11);
      
      expect(printStyles).toContain('@media print');
    });
  });

  describe('Data Export and Import Workflow', () => {
    it('should handle data formatting for different export formats', () => {
      // User wants to export data for external analysis
      
      const transactions = normalizeTransactionData(userTransactionData);
      const expenses = normalizeExpenseData(userExpenseData);
      
      // Format transaction data for display/export
      const formattedTransactions = transactions.map(t => ({
        ...t,
        formattedAmount: formatCurrency(t.amount, t.currency),
        formattedDate: formatDate(t.date),
        formattedRevenue: formatCurrency(t.revenue, 'VND')
      }));
      
      // Format expense data for display/export
      const formattedExpenses = expenses.map(e => ({
        ...e,
        formattedAmount: formatCurrency(e.amount, e.currency),
        formattedDate: formatDate(e.date),
        periodicLabel: e.periodicAllocation === 'Có' ? 'Định kỳ' : 'Một lần'
      }));
      
      // Verify formatting is user-friendly
      expect(formattedTransactions[0].formattedAmount).toContain('2.500.000');
      expect(formattedTransactions[1].formattedAmount).toContain('$800');
      expect(formattedTransactions[0].formattedDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      
      expect(formattedExpenses[0].periodicLabel).toBe('Định kỳ');
      expect(formattedExpenses[1].periodicLabel).toBe('Một lần');
    });

    it('should aggregate data for summary reports', () => {
      // User requests monthly summary
      
      const transactions = normalizeTransactionData(userTransactionData);
      const expenses = normalizeExpenseData(userExpenseData);
      
      // Create monthly aggregations
      const monthlyRevenue = aggregateByPeriod(transactions, 'monthly', 'revenue');
      const monthlyExpenses = aggregateByPeriod(expenses, 'monthly', 'amount');
      
      // Generate summary statistics
      const summaryReport = {
        period: '2024 Q1',
        revenue: {
          january: monthlyRevenue['2024-01'] || 0,
          february: monthlyRevenue['2024-02'] || 0,
          total: Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0)
        },
        expenses: {
          january: monthlyExpenses['2024-01'] || 0,
          february: monthlyExpenses['2024-02'] || 0,
          total: Object.values(monthlyExpenses).reduce((sum, val) => sum + val, 0)
        }
      };
      
      summaryReport.profit = {
        january: summaryReport.revenue.january - summaryReport.expenses.january,
        february: summaryReport.revenue.february - summaryReport.expenses.february,
        total: summaryReport.revenue.total - summaryReport.expenses.total
      };
      
      // Verify aggregation accuracy
      expect(summaryReport.revenue.january).toBe(21700000); // VND equivalent
      expect(summaryReport.revenue.february).toBe(1800000);
      expect(summaryReport.profit.total).toBeGreaterThan(20000000);
    });
  });

  describe('User Interface State Synchronization', () => {
    it('should maintain UI state consistency across user interactions', () => {
      initializeStateManager();
      
      // Simulate user navigation and data loading
      const navigationStates = [];
      const dataStates = [];
      
      // Track state changes
      const unsubscribeNav = subscribeToState('activeTab', (tab) => {
        navigationStates.push(tab);
      });
      
      const unsubscribeData = subscribeToState('transactions', (transactions) => {
        dataStates.push(transactions.length);
      });
      
      // User navigates to transactions tab
      updateState({ activeTab: 'giao-dich' });
      
      // User loads transaction data
      const transactions = normalizeTransactionData(userTransactionData);
      updateState({ transactions });
      
      // User switches to expense tab
      updateState({ activeTab: 'chi-phi' });
      
      // User loads expense data
      const expenses = normalizeExpenseData(userExpenseData);
      updateState({ expenses });
      
      // User goes to reports tab
      updateState({ activeTab: 'bao-cao' });
      
      // Verify state tracking
      expect(navigationStates).toEqual(['giao-dich', 'chi-phi', 'bao-cao']);
      expect(dataStates).toEqual([3]); // Only tracked transaction loads
      
      const finalState = getState();
      expect(finalState.activeTab).toBe('bao-cao');
      expect(finalState.transactions).toHaveLength(3);
      expect(finalState.expenses).toHaveLength(4);
      
      unsubscribeNav();
      unsubscribeData();
    });

    it('should handle application state reset workflow', () => {
      initializeStateManager();
      
      // Populate state with data
      updateState({
        transactions: normalizeTransactionData(userTransactionData),
        expenses: normalizeExpenseData(userExpenseData),
        currentPage: 5,
        activeTab: 'bao-cao',
        isLoading: true,
        searchQuery: 'test search'
      });
      
      const beforeReset = getState();
      expect(beforeReset.transactions).toHaveLength(3);
      expect(beforeReset.currentPage).toBe(5);
      expect(beforeReset.activeTab).toBe('bao-cao');
      
      // User triggers application reset
      resetState();
      
      const afterReset = getState();
      expect(afterReset.transactions).toEqual([]);
      expect(afterReset.expenses).toEqual([]);
      expect(afterReset.currentPage).toBe(1);
      expect(afterReset.activeTab).toBe('giao-dich');
      expect(afterReset.isLoading).toBe(false);
      expect(afterReset.searchQuery).toBe('');
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from data processing errors gracefully', () => {
      initializeStateManager();
      
      // Simulate corrupted transaction data
      const corruptedData = [
        { id: 'valid', date: '2024-01-15', amount: 1000000, revenue: 1000000 },
        { id: 'invalid1' }, // Missing required fields
        { id: 'invalid2', date: 'not-a-date', amount: 'not-a-number' },
        null, // Null entry
        undefined // Undefined entry
      ];
      
      // Process should handle errors gracefully
      let processedData, totalRevenue, chartData;
      
      expect(() => {
        processedData = normalizeTransactionData(corruptedData);
        totalRevenue = calculateTotalRevenue(processedData);
        chartData = prepareRevenueChartData([]);
      }).not.toThrow();
      
      // Should have filtered out invalid entries
      expect(processedData.length).toBeGreaterThan(0);
      expect(processedData.length).toBeLessThan(corruptedData.length);
      
      // Update state with recovered data
      updateState({
        transactions: processedData,
        totalRevenue: totalRevenue,
        lastError: null,
        errorCount: 0
      });
      
      const state = getState();
      expect(state.transactions.length).toBeGreaterThan(0);
      expect(state.lastError).toBeNull();
    });

    it('should handle network failures and retry mechanisms', () => {
      initializeStateManager();
      
      // Simulate network failure during data load
      updateState({
        isLoading: true,
        loadingMessage: 'Đang tải dữ liệu từ server...',
        errorCount: 0
      });
      
      // First failure
      updateState({
        isLoading: false,
        lastError: 'Network timeout',
        errorCount: 1
      });
      
      let state = getState();
      expect(state.lastError).toBe('Network timeout');
      expect(state.errorCount).toBe(1);
      
      // Retry attempt
      updateState({
        isLoading: true,
        loadingMessage: 'Đang thử lại...',
        lastError: null
      });
      
      // Success on retry
      const successData = normalizeTransactionData(userTransactionData);
      updateState({
        isLoading: false,
        transactions: successData,
        lastError: null,
        errorCount: 0,
        loadingMessage: ''
      });
      
      state = getState();
      expect(state.transactions).toHaveLength(3);
      expect(state.lastError).toBeNull();
      expect(state.errorCount).toBe(0);
      expect(state.isLoading).toBe(false);
    });
  });
});