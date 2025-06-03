/**
 * Unit tests for calculations.js
 * Tests all calculation functions for financial analysis
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateFinancialAnalysis,
  calculateGrowthRate,
  calculateAllocatedExpense,
  calculateActualExpense,
  calculateMonthlyExpenseBreakdown
} from '../../scripts/statistics/calculations.js';

// Mock the dataUtilities module
vi.mock('../../scripts/statistics/dataUtilities.js', () => ({
  normalizeDate: vi.fn((date) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0];
    }
    return date;
  })
}));

describe('calculateTotalExpenses', () => {
  const sampleExpenses = [
    { amount: '1000000', currency: 'VND', date: '2024-01-15' },
    { amount: '500', currency: 'USD', date: '2024-01-20' },
    { amount: '2000000', currency: 'VND', date: '2024-02-10' },
    { amount: '300', currency: 'USD', date: '2024-02-15' }
  ];

  it('should calculate totals for all currencies', () => {
    const result = calculateTotalExpenses(sampleExpenses);
    
    expect(result).toEqual({
      VND: 3000000,
      USD: 800,
      NGN: 0
    });
  });

  it('should filter by specific currency', () => {
    const result = calculateTotalExpenses(sampleExpenses, { currency: 'USD' });
    
    expect(result).toEqual({
      VND: 0,
      USD: 800,
      NGN: 0
    });
  });

  it('should filter by target date', () => {
    const result = calculateTotalExpenses(sampleExpenses, { 
      targetDate: '2024-01-15' 
    });
    
    expect(result).toEqual({
      VND: 1000000,
      USD: 0,
      NGN: 0
    });
  });

  it('should filter by date range', () => {
    const result = calculateTotalExpenses(sampleExpenses, {
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      }
    });
    
    expect(result).toEqual({
      VND: 1000000,
      USD: 500,
      NGN: 0
    });
  });

  it('should handle empty data array', () => {
    const result = calculateTotalExpenses([]);
    
    expect(result).toEqual({
      VND: 0,
      USD: 0,
      NGN: 0
    });
  });

  it('should handle non-array input', () => {
    const result = calculateTotalExpenses(null);
    
    expect(result).toEqual({
      VND: 0,
      USD: 0,
      NGN: 0
    });
  });

  it('should handle missing or invalid amounts', () => {
    const expensesWithInvalidAmounts = [
      { amount: '', currency: 'VND', date: '2024-01-15' },
      { amount: 'invalid', currency: 'USD', date: '2024-01-20' },
      { currency: 'VND', date: '2024-02-10' }, // missing amount
      { amount: '1000000', currency: 'VND', date: '2024-02-15' }
    ];
    
    const result = calculateTotalExpenses(expensesWithInvalidAmounts);
    
    expect(result).toEqual({
      VND: 1000000,
      USD: 0,
      NGN: 0
    });
  });
});

describe('calculateTotalRevenue', () => {
  const sampleTransactions = [
    { revenue: '5000000', currency: 'VND', transactionDate: '2024-01-15' },
    { revenue: '1000', currency: 'USD', transactionDate: '2024-01-20' },
    { revenue: '3000000', currency: 'VND', transactionDate: '2024-02-10' },
    { revenue: '500', currency: 'USD', transactionDate: '2024-02-15' }
  ];

  it('should calculate totals for all currencies', () => {
    const result = calculateTotalRevenue(sampleTransactions);
    
    expect(result).toEqual({
      VND: 8000000,
      USD: 1500,
      NGN: 0
    });
  });

  it('should filter by specific currency', () => {
    const result = calculateTotalRevenue(sampleTransactions, { currency: 'VND' });
    
    expect(result).toEqual({
      VND: 8000000,
      USD: 0,
      NGN: 0
    });
  });

  it('should filter by target date', () => {
    const result = calculateTotalRevenue(sampleTransactions, { 
      targetDate: '2024-01-15' 
    });
    
    expect(result).toEqual({
      VND: 5000000,
      USD: 0,
      NGN: 0
    });
  });

  it('should handle searching mode', () => {
    const result = calculateTotalRevenue(sampleTransactions, { 
      isSearching: true 
    });
    
    expect(result).toEqual({
      VND: 8000000,
      USD: 1500,
      NGN: 0
    });
  });
});

describe('calculateFinancialAnalysis', () => {
  const revenue = { VND: 10000000, USD: 2000, NGN: 0 };
  const expenses = { VND: 6000000, USD: 1200, NGN: 0 };

  it('should calculate financial analysis correctly', () => {
    const result = calculateFinancialAnalysis(revenue, expenses);
    
    expect(result.profit).toEqual({
      VND: 4000000,
      USD: 800,
      NGN: 0
    });
    
    expect(result.profitMargin.VND).toBeCloseTo(40);
    expect(result.profitMargin.USD).toBeCloseTo(40);
    expect(result.profitMargin.NGN).toBe(0);
    
    expect(result.expenseRatio.VND).toBeCloseTo(60);
    expect(result.expenseRatio.USD).toBeCloseTo(60);
    
    // The function sums currencies as simple addition, not converting to VND
    expect(result.summary.totalRevenue).toBe(10002000); // 10000000 + 2000 + 0
    expect(result.summary.totalExpenses).toBe(6001200); // 6000000 + 1200 + 0  
    expect(result.summary.totalProfit).toBe(4000800);   // difference
    expect(result.summary.overallMargin).toBeCloseTo(40);
  });

  it('should handle zero revenue', () => {
    const zeroRevenue = { VND: 0, USD: 0, NGN: 0 };
    const result = calculateFinancialAnalysis(zeroRevenue, expenses);
    
    expect(result.profitMargin).toEqual({
      VND: 0,
      USD: 0,
      NGN: 0
    });
    
    expect(result.summary.overallMargin).toBe(0);
  });
});

describe('calculateGrowthRate', () => {
  it('should calculate positive growth rate', () => {
    const result = calculateGrowthRate(1200, 1000);
    
    expect(result.rate).toBe(20);
    expect(result.direction).toBe('up');
    expect(result.isNew).toBe(false);
  });

  it('should calculate negative growth rate', () => {
    const result = calculateGrowthRate(800, 1000);
    
    expect(result.rate).toBe(20);
    expect(result.direction).toBe('down');
    expect(result.isNew).toBe(false);
  });

  it('should handle zero previous value', () => {
    const result = calculateGrowthRate(1000, 0);
    
    expect(result.rate).toBe(100);
    expect(result.direction).toBe('up');
    expect(result.isNew).toBe(true);
  });

  it('should handle zero current value with previous value', () => {
    const result = calculateGrowthRate(0, 1000);
    
    expect(result.rate).toBe(100);
    expect(result.direction).toBe('down');
    expect(result.isNew).toBe(false);
  });

  it('should handle equal values', () => {
    const result = calculateGrowthRate(1000, 1000);
    
    expect(result.rate).toBe(0);
    expect(result.direction).toBe('neutral');
    expect(result.isNew).toBe(false);
  });

  it('should handle string inputs', () => {
    const result = calculateGrowthRate('1200', '1000');
    
    expect(result.rate).toBe(20);
    expect(result.direction).toBe('up');
  });
});

describe('calculateAllocatedExpense', () => {
  const dateRange = {
    start: '2024-01-01',
    end: '2024-01-31'
  };

  it('should calculate allocated expense for period allocation', () => {
    const expense = {
      amount: '1200000',
      currency: 'VND',
      date: '2024-01-01',
      renewDate: '2024-02-01',
      periodicAllocation: 'Có',
      product: 'Software License'
    };
    
    const result = calculateAllocatedExpense(expense, dateRange);
    // January has 31 days, so expect roughly (31/32) * 1200000
    // Since the function calculates daily rate and allocates for overlapping days
    expect(result).toBeGreaterThan(1100000);
    expect(result).toBeLessThan(1200000);
  });

  it('should return 0 for non-allocated expenses', () => {
    const expense = {
      amount: '1200000',
      currency: 'VND',
      date: '2024-01-01',
      renewDate: '2024-02-01',
      periodicAllocation: 'Không',
      product: 'One-time Purchase'
    };
    
    const result = calculateAllocatedExpense(expense, dateRange);
    expect(result).toBe(0);
  });

  it('should handle partial month allocation', () => {
    const expense = {
      amount: '3100000', // 31 days * 100k
      currency: 'VND',
      date: '2024-01-15',
      renewDate: '2024-02-15',
      periodicAllocation: 'Có',
      product: 'Monthly Service'
    };
    
    const result = calculateAllocatedExpense(expense, dateRange);
    // Should allocate for Jan 15-31 (17 days)
    expect(result).toBeGreaterThan(1600000); // Approximately 17 days worth
    expect(result).toBeLessThan(1800000);
  });

  it('should handle missing dates', () => {
    const expense = {
      amount: '1200000',
      currency: 'VND',
      periodicAllocation: 'Có',
      product: 'Invalid Date Service'
    };
    
    const result = calculateAllocatedExpense(expense, dateRange);
    expect(result).toBe(0);
  });

  it('should handle invalid renewal date', () => {
    const expense = {
      amount: '1200000',
      currency: 'VND',
      date: '2024-01-15',
      renewDate: '2024-01-10', // Before transaction date
      periodicAllocation: 'Có',
      product: 'Invalid Service'
    };
    
    const result = calculateAllocatedExpense(expense, dateRange);
    expect(result).toBe(0);
  });
});

describe('calculateActualExpense', () => {
  const dateRange = {
    start: '2024-01-01',
    end: '2024-01-31'
  };

  it('should include expense paid within period', () => {
    const expense = {
      amount: '1000000',
      currency: 'VND',
      date: '2024-01-15',
      product: 'Office Supplies'
    };
    
    const result = calculateActualExpense(expense, dateRange);
    expect(result).toBe(1000000);
  });

  it('should exclude expense paid outside period', () => {
    const expense = {
      amount: '1000000',
      currency: 'VND',
      date: '2024-02-15',
      product: 'Office Supplies'
    };
    
    const result = calculateActualExpense(expense, dateRange);
    expect(result).toBe(0);
  });

  it('should handle missing date', () => {
    const expense = {
      amount: '1000000',
      currency: 'VND',
      product: 'No Date Expense'
    };
    
    const result = calculateActualExpense(expense, dateRange);
    expect(result).toBe(0);
  });
});

describe('calculateMonthlyExpenseBreakdown', () => {
  const sampleExpenses = [
    {
      amount: '1200000',
      currency: 'VND',
      date: '2024-01-01',
      renewDate: '2024-02-01',
      periodicAllocation: 'Có',
      product: 'Software License'
    },
    {
      amount: '500000',
      currency: 'VND',
      date: '2024-01-15',
      product: 'Office Supplies'
    }
  ];

  it('should calculate monthly breakdown correctly', () => {
    const result = calculateMonthlyExpenseBreakdown(sampleExpenses, {
      year: 2024,
      month: 1
    });
    
    expect(result.targetMonth).toBe('2024/01');
    expect(result.totalAllocatedExpense).toBeGreaterThan(0);
    // Both expenses should be included in actual expenses for January
    expect(result.totalActualExpense).toBeGreaterThan(500000); 
    expect(result.allocatedDetails).toHaveLength(1);
    expect(result.actualDetails).toHaveLength(2); // Both expenses paid in January
  });

  it('should handle current month when no target specified', () => {
    const result = calculateMonthlyExpenseBreakdown(sampleExpenses);
    
    expect(result.targetMonth).toMatch(/\d{4}\/\d{2}/);
    expect(result).toHaveProperty('totalAllocatedExpense');
    expect(result).toHaveProperty('totalActualExpense');
  });

  it('should handle empty expenses array', () => {
    const result = calculateMonthlyExpenseBreakdown([], {
      year: 2024,
      month: 1
    });
    
    expect(result.totalAllocatedExpense).toBe(0);
    expect(result.totalActualExpense).toBe(0);
    expect(result.allocatedDetails).toHaveLength(0);
    expect(result.actualDetails).toHaveLength(0);
  });
});