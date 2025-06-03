/**
 * dataAnalytics.test.js
 * 
 * Unit tests cho business data analytics và calculations
 * Kiểm tra metrics calculation, data filtering, và KPI computation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateBusinessMetrics,
  calculateTotalRevenue,
  calculateTotalExpenses,
  calculateRevenueBySource,
  calculateRevenueByPeriod,
  calculateExpensesByCategory,
  calculateOperatingExpenses
} from '../../scripts/business/dataAnalytics.js';

// Mock dependencies
vi.mock('../../scripts/statisticsCore.js', () => ({
  normalizeDate: vi.fn((date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  })
}));

describe('dataAnalytics', () => {
  let sampleTransactions;
  let sampleExpenses;
  let dateRange;

  beforeEach(() => {
    sampleTransactions = [
      {
        id: 'txn_1',
        date: '2024-01-15',
        transactionDate: '2024-01-15',
        amount: 1000000,
        revenue: 1000000,
        tenChuan: 'Software A',
        softwareName: 'Software A Original'
      },
      {
        id: 'txn_2',
        date: '2024-01-16',
        transactionDate: '2024-01-16',
        amount: 2000000,
        revenue: 2000000,
        tenChuan: 'Software B',
        softwareName: 'Software B Original'
      },
      {
        id: 'txn_3',
        date: '2024-01-17',
        transactionDate: '2024-01-17',
        amount: 1500000,
        revenue: 1500000,
        tenChuan: 'Software A',
        softwareName: 'Software A Original'
      }
    ];

    sampleExpenses = [
      {
        id: 'exp_1',
        date: '2024-01-15',
        amount: 500000,
        type: 'Kinh doanh phần mềm',
        category: 'Phần mềm',
        accountingType: 'OPEX',
        tenChuan: 'Kinh doanh phần mềm'
      },
      {
        id: 'exp_2',
        date: '2024-01-16',
        amount: 200000,
        type: 'Sinh hoạt cá nhân',
        category: 'Cá nhân',
        accountingType: 'Không liên quan',
        tenChuan: 'Sinh hoạt cá nhân'
      },
      {
        id: 'exp_3',
        date: '2024-01-17',
        amount: 800000,
        type: 'Marketing',
        category: 'Quảng cáo',
        accountingType: 'OPEX',
        tenChuan: 'Marketing & Quảng cáo'
      }
    ];

    dateRange = {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    };

    vi.clearAllMocks();
  });

  describe('calculateTotalRevenue', () => {
    it('should calculate total revenue from amount field', () => {
      const transactions = [
        { amount: 1000000 },
        { amount: 2000000 },
        { amount: 1500000 }
      ];

      const result = calculateTotalRevenue(transactions);

      expect(result).toBe(4500000);
    });

    it('should calculate total revenue from revenue field', () => {
      const transactions = [
        { revenue: 1000000, amount: 500000 }, // Should use revenue
        { revenue: 2000000, amount: 1000000 },
        { amount: 1500000 } // Fallback to amount
      ];

      const result = calculateTotalRevenue(transactions);

      expect(result).toBe(4500000);
    });

    it('should handle empty transactions array', () => {
      const result = calculateTotalRevenue([]);

      expect(result).toBe(0);
    });

    it('should handle invalid amounts', () => {
      const transactions = [
        { amount: 'invalid' },
        { amount: null },
        { amount: undefined },
        { amount: 1000000 }
      ];

      const result = calculateTotalRevenue(transactions);

      expect(result).toBe(1000000);
    });

    it('should handle transactions without amount fields', () => {
      const transactions = [
        { id: 'txn_1' },
        { id: 'txn_2', customer: 'ABC' },
        { amount: 1000000 }
      ];

      const result = calculateTotalRevenue(transactions);

      expect(result).toBe(1000000);
    });

    it('should handle string amounts', () => {
      const transactions = [
        { amount: '1000000' },
        { amount: '2500000.50' },
        { amount: '500000' }
      ];

      const result = calculateTotalRevenue(transactions);

      expect(result).toBe(4000000.5);
    });
  });

  describe('calculateTotalExpenses', () => {
    it('should calculate total expenses', () => {
      const expenses = [
        { amount: 500000 },
        { amount: 200000 },
        { amount: 800000 }
      ];

      const result = calculateTotalExpenses(expenses);

      expect(result).toBe(1500000);
    });

    it('should handle empty expenses array', () => {
      const result = calculateTotalExpenses([]);

      expect(result).toBe(0);
    });

    it('should handle invalid amounts', () => {
      const expenses = [
        { amount: 'invalid' },
        { amount: null },
        { amount: 500000 }
      ];

      const result = calculateTotalExpenses(expenses);

      expect(result).toBe(500000);
    });

    it('should handle expenses without amount field', () => {
      const expenses = [
        { category: 'Test' },
        { amount: 500000 },
        { description: 'Test expense' }
      ];

      const result = calculateTotalExpenses(expenses);

      expect(result).toBe(500000);
    });

    it('should handle string amounts', () => {
      const expenses = [
        { amount: '500000' },
        { amount: '250000.75' },
        { amount: '300000' }
      ];

      const result = calculateTotalExpenses(expenses);

      expect(result).toBe(1050000.75);
    });
  });

  describe('calculateRevenueBySource', () => {
    it('should calculate revenue by source using tenChuan', () => {
      const result = calculateRevenueBySource(sampleTransactions);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ source: 'Software A', amount: 2500000 });
      expect(result[1]).toEqual({ source: 'Software B', amount: 2000000 });
    });

    it('should fallback to softwareName when tenChuan is missing', () => {
      const transactions = [
        { amount: 1000000, softwareName: 'Software C' },
        { amount: 2000000, softwareName: 'Software D' }
      ];

      const result = calculateRevenueBySource(transactions);

      expect(result[0]).toEqual({ source: 'Software D', amount: 2000000 });
      expect(result[1]).toEqual({ source: 'Software C', amount: 1000000 });
    });

    it('should use "Khác" for transactions without source information', () => {
      const transactions = [
        { amount: 1000000 },
        { amount: 2000000, softwareName: 'Software A' },
        { amount: 500000 }
      ];

      const result = calculateRevenueBySource(transactions);

      expect(result.find(item => item.source === 'Khác')).toEqual({
        source: 'Khác',
        amount: 1500000
      });
    });

    it('should sort results by amount descending', () => {
      const transactions = [
        { amount: 500000, tenChuan: 'Software A' },
        { amount: 2000000, tenChuan: 'Software B' },
        { amount: 1000000, tenChuan: 'Software C' }
      ];

      const result = calculateRevenueBySource(transactions);

      expect(result[0].amount).toBeGreaterThan(result[1].amount);
      expect(result[1].amount).toBeGreaterThan(result[2].amount);
    });

    it('should handle empty transactions', () => {
      const result = calculateRevenueBySource([]);

      expect(result).toEqual([]);
    });

    it('should aggregate multiple transactions for same source', () => {
      const transactions = [
        { amount: 1000000, tenChuan: 'Software A' },
        { amount: 500000, tenChuan: 'Software A' },
        { amount: 2000000, tenChuan: 'Software B' }
      ];

      const result = calculateRevenueBySource(transactions);

      expect(result.find(item => item.source === 'Software A').amount).toBe(1500000);
    });

    it('should handle revenue field priority over amount', () => {
      const transactions = [
        { revenue: 1000000, amount: 500000, tenChuan: 'Software A' },
        { revenue: 2000000, amount: 1000000, tenChuan: 'Software B' }
      ];

      const result = calculateRevenueBySource(transactions);

      expect(result[0]).toEqual({ source: 'Software B', amount: 2000000 });
      expect(result[1]).toEqual({ source: 'Software A', amount: 1000000 });
    });
  });

  describe('calculateRevenueByPeriod', () => {
    it('should calculate revenue by date period', async () => {
      const { normalizeDate } = await import('../../scripts/statisticsCore.js');
      
      const result = calculateRevenueByPeriod(sampleTransactions, dateRange);

      expect(normalizeDate).toHaveBeenCalledTimes(3);
      expect(result['2024-01-15']).toBe(1000000);
      expect(result['2024-01-16']).toBe(2000000);
      expect(result['2024-01-17']).toBe(1500000);
    });

    it('should handle transactions without dates', async () => {
      const transactions = [
        { amount: 1000000, date: '2024-01-15' },
        { amount: 2000000 }, // No date
        { amount: 1500000, date: '2024-01-16' }
      ];

      const result = calculateRevenueByPeriod(transactions, dateRange);

      expect(result['2024-01-15']).toBe(1000000);
      expect(result['2024-01-16']).toBe(1500000);
      expect(Object.keys(result)).not.toContain('undefined');
    });

    it('should prefer transactionDate over date field', async () => {
      const transactions = [
        { 
          amount: 1000000, 
          date: '2024-01-15', 
          transactionDate: '2024-01-20' // Should use this
        }
      ];

      const result = calculateRevenueByPeriod(transactions, dateRange);

      expect(result['2024-01-20']).toBe(1000000);
      expect(result['2024-01-15']).toBeUndefined();
    });

    it('should handle empty transactions', () => {
      const result = calculateRevenueByPeriod([], dateRange);

      expect(result).toEqual({});
    });

    it('should aggregate amounts for same date', () => {
      const transactions = [
        { amount: 1000000, date: '2024-01-15' },
        { amount: 500000, date: '2024-01-15' },
        { amount: 2000000, date: '2024-01-16' }
      ];

      const result = calculateRevenueByPeriod(transactions, dateRange);

      expect(result['2024-01-15']).toBe(1500000);
      expect(result['2024-01-16']).toBe(2000000);
    });

    it('should use revenue field when available', () => {
      const transactions = [
        { revenue: 1000000, amount: 500000, date: '2024-01-15' },
        { amount: 2000000, date: '2024-01-16' }
      ];

      const result = calculateRevenueByPeriod(transactions, dateRange);

      expect(result['2024-01-15']).toBe(1000000);
      expect(result['2024-01-16']).toBe(2000000);
    });
  });

  describe('calculateExpensesByCategory', () => {
    it('should calculate expenses by category using tenChuan', () => {
      const result = calculateExpensesByCategory(sampleExpenses);

      expect(result).toHaveLength(3);
      expect(result.find(item => item.category === 'Kinh doanh phần mềm').amount).toBe(500000);
      expect(result.find(item => item.category === 'Sinh hoạt cá nhân').amount).toBe(200000);
      expect(result.find(item => item.category === 'Marketing & Quảng cáo').amount).toBe(800000);
    });

    it('should handle "Không liên quan" accounting type', () => {
      const expenses = [
        {
          amount: 300000,
          accountingType: 'Không liên quan',
          tenChuan: 'Some other category'
        }
      ];

      const result = calculateExpensesByCategory(expenses);

      expect(result.find(item => item.category === 'Sinh hoạt cá nhân').amount).toBe(300000);
    });

    it('should fallback to old categorization logic', () => {
      const expenses = [
        {
          amount: 500000,
          type: 'Chi phí phần mềm',
          category: 'Phần mềm development'
        },
        {
          amount: 200000,
          type: 'Chi phí cá nhân',
          category: 'Personal'
        },
        {
          amount: 300000,
          type: 'Amazon business',
          category: 'E-commerce'
        },
        {
          amount: 400000,
          type: 'Other',
          category: 'Marketing và Quảng cáo'
        }
      ];

      const result = calculateExpensesByCategory(expenses);

      expect(result.find(item => item.category === 'Kinh doanh phần mềm')).toBeDefined();
      expect(result.find(item => item.category === 'Sinh hoạt cá nhân')).toBeDefined();
      expect(result.find(item => item.category === 'Kinh doanh Amazon')).toBeDefined();
      expect(result.find(item => item.category === 'Marketing & Quảng cáo')).toBeDefined();
    });

    it('should categorize as "Khác" for unknown categories', () => {
      const expenses = [
        {
          amount: 100000,
          type: 'Unknown type',
          category: 'Unknown category'
        }
      ];

      const result = calculateExpensesByCategory(expenses);

      expect(result.find(item => item.category === 'Khác').amount).toBe(100000);
    });

    it('should filter out zero amounts', () => {
      const expenses = [
        { amount: 0, tenChuan: 'Zero Amount' },
        { amount: 100000, tenChuan: 'Valid Amount' }
      ];

      const result = calculateExpensesByCategory(expenses);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Valid Amount');
    });

    it('should sort by amount descending', () => {
      const expenses = [
        { amount: 100000, tenChuan: 'Category A' },
        { amount: 500000, tenChuan: 'Category B' },
        { amount: 300000, tenChuan: 'Category C' }
      ];

      const result = calculateExpensesByCategory(expenses);

      expect(result[0].amount).toBe(500000);
      expect(result[1].amount).toBe(300000);
      expect(result[2].amount).toBe(100000);
    });

    it('should handle empty expenses', () => {
      const result = calculateExpensesByCategory([]);

      expect(result).toEqual([]);
    });

    it('should aggregate amounts for same category', () => {
      const expenses = [
        { amount: 200000, tenChuan: 'Same Category' },
        { amount: 300000, tenChuan: 'Same Category' },
        { amount: 500000, tenChuan: 'Different Category' }
      ];

      const result = calculateExpensesByCategory(expenses);

      expect(result.find(item => item.category === 'Same Category').amount).toBe(500000);
      expect(result.find(item => item.category === 'Different Category').amount).toBe(500000);
    });
  });

  describe('calculateOperatingExpenses', () => {
    it('should calculate OPEX using accountingType', () => {
      const expenses = [
        { amount: 500000, accountingType: 'OPEX' },
        { amount: 200000, accountingType: 'Không liên quan' },
        { amount: 800000, accountingType: 'OPEX' },
        { amount: 300000, accountingType: 'CAPEX' }
      ];

      const result = calculateOperatingExpenses(expenses);

      expect(result).toBe(1300000); // 500000 + 800000
    });

    it('should fallback to type-based filtering when no accountingType', () => {
      const expenses = [
        { amount: 500000, type: 'Business expense' },
        { amount: 200000, type: 'Chi phí cá nhân' },
        { amount: 800000, type: 'Sinh hoạt personal' },
        { amount: 300000, type: 'Operating cost' }
      ];

      const result = calculateOperatingExpenses(expenses);

      expect(result).toBe(800000); // Excludes personal expenses (500000 + 300000)
    });

    it('should handle mixed accountingType and type filtering', () => {
      const expenses = [
        { amount: 500000, accountingType: 'OPEX' },
        { amount: 200000, type: 'Chi phí cá nhân' }, // No accountingType, uses type
        { amount: 800000, accountingType: 'Không liên quan' },
        { amount: 300000, type: 'Business expense' } // No accountingType, uses type
      ];

      const result = calculateOperatingExpenses(expenses);

      expect(result).toBe(800000); // 500000 (OPEX) + 300000 (business)
    });

    it('should handle empty expenses', () => {
      const result = calculateOperatingExpenses([]);

      expect(result).toBe(0);
    });

    it('should handle expenses without relevant fields', () => {
      const expenses = [
        { amount: 500000 }, // No type or accountingType
        { amount: 200000, category: 'Some category' },
        { amount: 300000, description: 'Some description' }
      ];

      const result = calculateOperatingExpenses(expenses);

      expect(result).toBe(1000000); // All included as they don't match personal patterns
    });

    it('should handle invalid amounts', () => {
      const expenses = [
        { amount: 'invalid', accountingType: 'OPEX' },
        { amount: null, accountingType: 'OPEX' },
        { amount: 500000, accountingType: 'OPEX' }
      ];

      const result = calculateOperatingExpenses(expenses);

      expect(result).toBe(500000);
    });

    it('should exclude personal expenses using category field', () => {
      const expenses = [
        { amount: 500000, category: 'Business expense' },
        { amount: 200000, category: 'Chi phí cá nhân' },
        { amount: 300000, category: 'Sinh hoạt daily' }
      ];

      const result = calculateOperatingExpenses(expenses);

      expect(result).toBe(500000); // Excludes personal category (200k + 300k)
    });
  });

  describe('calculateBusinessMetrics', () => {
    it('should calculate comprehensive business metrics', () => {
      const result = calculateBusinessMetrics(sampleTransactions, sampleExpenses, dateRange);

      expect(result).toHaveProperty('financial');
      expect(result).toHaveProperty('revenue');
      expect(result).toHaveProperty('costs');
      expect(result).toHaveProperty('growth');
      expect(result).toHaveProperty('efficiency');
      expect(result).toHaveProperty('cashFlow');
      expect(result).toHaveProperty('kpis');
    });

    it('should calculate correct financial metrics', () => {
      const result = calculateBusinessMetrics(sampleTransactions, sampleExpenses, dateRange);

      expect(result.financial.totalRevenue).toBe(4500000);
      expect(result.financial.totalExpenses).toBe(1500000);
      expect(result.financial.netProfit).toBe(3000000);
      expect(result.financial.profitMargin).toBeCloseTo(66.67, 1);
    });

    it('should calculate revenue metrics', () => {
      const result = calculateBusinessMetrics(sampleTransactions, sampleExpenses, dateRange);

      expect(result.revenue.totalTransactions).toBe(3);
      expect(result.revenue.averageOrderValue).toBe(1500000);
      expect(result.revenue.bySource).toHaveLength(2);
      expect(result.revenue.byPeriod).toBeDefined();
    });

    it('should calculate cost metrics', () => {
      const result = calculateBusinessMetrics(sampleTransactions, sampleExpenses, dateRange);

      expect(result.costs.byCategory).toHaveLength(3);
      expect(result.costs.costPerTransaction).toBe(500000);
      expect(result.costs.accountingBreakdown).toBeDefined();
    });

    it('should handle zero revenue scenario', () => {
      const result = calculateBusinessMetrics([], sampleExpenses, dateRange);

      expect(result.financial.totalRevenue).toBe(0);
      expect(result.financial.profitMargin).toBe(0);
      expect(result.financial.grossMargin).toBe(0);
      expect(result.revenue.averageOrderValue).toBe(0);
    });

    it('should handle zero transactions scenario', () => {
      const result = calculateBusinessMetrics([], sampleExpenses, dateRange);

      expect(result.revenue.totalTransactions).toBe(0);
      expect(result.costs.costPerTransaction).toBe(0);
    });

    it('should handle empty data', () => {
      const result = calculateBusinessMetrics([], [], dateRange);

      expect(result.financial.totalRevenue).toBe(0);
      expect(result.financial.totalExpenses).toBe(0);
      expect(result.financial.netProfit).toBe(0);
      expect(result.revenue.bySource).toEqual([]);
      expect(result.costs.byCategory).toEqual([]);
    });
  });
});