/**
 * Unit tests for categoryDataProcessors.js
 * Tests expense category data processing functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMainCategories,
  calculateExpenseByCategoryData,
  calculateCategoryStats,
  groupExpensesByPeriod
} from '../../scripts/expense-category/categoryDataProcessors.js';

// Mock statisticsCore module
vi.mock('../../scripts/statisticsCore.js', () => ({
  normalizeDate: vi.fn((date) => {
    // Simple normalization for testing
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  })
}));

describe('categoryDataProcessors.js', () => {
  describe('getMainCategories', () => {
    it('should return main categories configuration', () => {
      const categories = getMainCategories();
      
      expect(categories).toHaveProperty('Kinh doanh phần mềm');
      expect(categories).toHaveProperty('Sinh hoạt cá nhân');
      expect(categories).toHaveProperty('Kinh doanh Amazon');
      expect(categories).toHaveProperty('Khác');
      
      // Check category structure
      const softwareCategory = categories['Kinh doanh phần mềm'];
      expect(softwareCategory).toHaveProperty('color');
      expect(softwareCategory).toHaveProperty('icon');
      expect(typeof softwareCategory.color).toBe('string');
      expect(typeof softwareCategory.icon).toBe('string');
    });

    it('should return consistent configuration each time', () => {
      const categories1 = getMainCategories();
      const categories2 = getMainCategories();
      
      expect(categories1).toEqual(categories2);
    });
  });

  describe('calculateExpenseByCategoryData', () => {
    let sampleExpenses;

    beforeEach(() => {
      // Mock current date to have predictable test results
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15'));

      sampleExpenses = [
        {
          date: '2024-01-15',
          amount: '1000000',
          type: 'Kinh doanh phần mềm',
          category: 'Hosting'
        },
        {
          date: '2024-02-20',
          amount: '500000',
          type: 'Sinh hoạt cá nhân',
          category: 'Ăn uống'
        },
        {
          date: '2024-03-10',
          amount: '2000000',
          type: 'Kinh doanh Amazon',
          category: 'Sản phẩm'
        },
        {
          date: '2024-04-05',
          amount: '300000',
          type: 'Khác',
          category: 'Tiện ích'
        }
      ];
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should process expenses and return category data', () => {
      const result = calculateExpenseByCategoryData(sampleExpenses);
      
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('monthly');
      expect(result).toHaveProperty('mainCategories');
      
      // Check categories structure
      expect(result.categories).toHaveProperty('Kinh doanh phần mềm');
      expect(result.categories).toHaveProperty('Sinh hoạt cá nhân');
      expect(result.categories).toHaveProperty('Kinh doanh Amazon');
      expect(result.categories).toHaveProperty('Khác');
    });

    it('should calculate correct category totals', () => {
      const result = calculateExpenseByCategoryData(sampleExpenses);
      
      expect(result.categories['Kinh doanh phần mềm'].total).toBe(1000000);
      expect(result.categories['Sinh hoạt cá nhân'].total).toBe(500000);
      expect(result.categories['Kinh doanh Amazon'].total).toBe(2000000);
      expect(result.categories['Khác'].total).toBe(300000);
    });

    it('should group subcategories correctly', () => {
      const result = calculateExpenseByCategoryData(sampleExpenses);
      
      expect(result.categories['Kinh doanh phần mềm'].subCategories['Hosting']).toBe(1000000);
      expect(result.categories['Sinh hoạt cá nhân'].subCategories['Ăn uống']).toBe(500000);
      expect(result.categories['Kinh doanh Amazon'].subCategories['Sản phẩm']).toBe(2000000);
      expect(result.categories['Khác'].subCategories['Tiện ích']).toBe(300000);
    });

    it('should generate 12 months of data', () => {
      const result = calculateExpenseByCategoryData(sampleExpenses);
      
      expect(result.monthly).toHaveLength(12);
      
      // Check monthly data structure
      const monthData = result.monthly[0];
      expect(monthData).toHaveProperty('month');
      expect(monthData).toHaveProperty('monthLabel');
      expect(monthData).toHaveProperty('total');
      expect(monthData).toHaveProperty('Kinh doanh phần mềm');
      expect(monthData).toHaveProperty('Sinh hoạt cá nhân');
      expect(monthData).toHaveProperty('Kinh doanh Amazon');
      expect(monthData).toHaveProperty('Khác');
    });

    it('should handle empty expense data', () => {
      const result = calculateExpenseByCategoryData([]);
      
      expect(result.categories['Kinh doanh phần mềm'].total).toBe(0);
      expect(result.categories['Sinh hoạt cá nhân'].total).toBe(0);
      expect(result.categories['Kinh doanh Amazon'].total).toBe(0);
      expect(result.categories['Khác'].total).toBe(0);
      
      expect(result.monthly).toHaveLength(12);
      result.monthly.forEach(month => {
        expect(month.total).toBe(0);
      });
    });

    it('should handle invalid amount values', () => {
      const invalidExpenses = [
        { date: '2024-01-15', amount: 'invalid', type: 'Kinh doanh phần mềm', category: 'Test' },
        { date: '2024-01-15', amount: '', type: 'Sinh hoạt cá nhân', category: 'Test' },
        { date: '2024-01-15', amount: null, type: 'Kinh doanh Amazon', category: 'Test' },
        { date: '2024-01-15', amount: undefined, type: 'Khác', category: 'Test' }
      ];
      
      const result = calculateExpenseByCategoryData(invalidExpenses);
      
      Object.values(result.categories).forEach(category => {
        expect(category.total).toBe(0);
      });
    });

    it('should map expense types to correct main categories', () => {
      const typeTestExpenses = [
        { date: '2024-01-15', amount: '100000', type: 'software development', category: 'Dev' },
        { date: '2024-01-15', amount: '100000', type: 'Sinh hoạt hàng ngày', category: 'Food' },
        { date: '2024-01-15', amount: '100000', type: 'Chi phí cá nhân', category: 'Personal' },
        { date: '2024-01-15', amount: '100000', type: 'Amazon FBA', category: 'Product' },
        { date: '2024-01-15', amount: '100000', type: 'Unknown type', category: 'Other' }
      ];
      
      const result = calculateExpenseByCategoryData(typeTestExpenses);
      
      expect(result.categories['Kinh doanh phần mềm'].total).toBe(100000);
      expect(result.categories['Sinh hoạt cá nhân'].total).toBe(200000); // Two personal expenses
      expect(result.categories['Kinh doanh Amazon'].total).toBe(100000);
      expect(result.categories['Khác'].total).toBe(100000);
    });
  });

  describe('calculateCategoryStats', () => {
    let sampleCategoryData;

    beforeEach(() => {
      sampleCategoryData = {
        categories: {
          'Kinh doanh phần mềm': {
            total: 2000000,
            subCategories: { 'Hosting': 1000000, 'Domain': 1000000 }
          },
          'Sinh hoạt cá nhân': {
            total: 1500000,
            subCategories: { 'Ăn uống': 800000, 'Di chuyển': 700000 }
          },
          'Kinh doanh Amazon': {
            total: 3000000,
            subCategories: { 'Sản phẩm': 2000000, 'Quảng cáo': 1000000 }
          },
          'Khác': {
            total: 500000,
            subCategories: { 'Tiện ích': 500000 }
          }
        },
        monthly: [
          { monthLabel: '1/2024', total: 1000000 },
          { monthLabel: '2/2024', total: 1200000 },
          { monthLabel: '3/2024', total: 800000 },
          { monthLabel: '4/2024', total: 1500000 },
          { monthLabel: '5/2024', total: 1800000 },
          { monthLabel: '6/2024', total: 1700000 }
        ]
      };
    });

    it('should calculate total expense correctly', () => {
      const stats = calculateCategoryStats(sampleCategoryData);
      
      expect(stats.totalExpense).toBe(7000000); // 2M + 1.5M + 3M + 0.5M
    });

    it('should calculate average monthly expense', () => {
      const stats = calculateCategoryStats(sampleCategoryData);
      
      expect(stats.avgMonthlyExpense).toBe(7000000 / 12);
    });

    it('should identify top category', () => {
      const stats = calculateCategoryStats(sampleCategoryData);
      
      expect(stats.topCategory.name).toBe('Kinh doanh Amazon');
      expect(stats.topCategory.amount).toBe(3000000);
    });

    it('should calculate category percentages', () => {
      const stats = calculateCategoryStats(sampleCategoryData);
      
      expect(stats.categoryPercentages['Kinh doanh Amazon']).toBeCloseTo(42.86, 2);
      expect(stats.categoryPercentages['Kinh doanh phần mềm']).toBeCloseTo(28.57, 2);
      expect(stats.categoryPercentages['Sinh hoạt cá nhân']).toBeCloseTo(21.43, 2);
      expect(stats.categoryPercentages['Khác']).toBeCloseTo(7.14, 2);
    });

    it('should find top subcategories', () => {
      const stats = calculateCategoryStats(sampleCategoryData);
      
      expect(stats.topSubCategories).toHaveLength(7); // All subcategories from test data
      expect(stats.topSubCategories[0].amount).toBe(2000000);
      expect(stats.topSubCategories[0].subCategory).toBe('Sản phẩm');
      expect(stats.topSubCategories[1].amount).toBe(1000000);
    });

    it('should calculate monthly trend', () => {
      const stats = calculateCategoryStats(sampleCategoryData);
      
      expect(stats.monthlyTrend).toHaveLength(6);
      expect(stats.monthlyTrend[0].growth).toBe(0); // First month has no previous month
      expect(stats.monthlyTrend[1].growth).toBe(20); // (1200000 - 1000000) / 1000000 * 100
      expect(stats.monthlyTrend[1].isIncrease).toBe(true);
      expect(stats.monthlyTrend[2].growth).toBeCloseTo(-33.33, 2); // (800000 - 1200000) / 1200000 * 100
      expect(stats.monthlyTrend[2].isIncrease).toBe(false);
    });

    it('should handle zero total expense', () => {
      const emptyData = {
        categories: {
          'Kinh doanh phần mềm': { total: 0, subCategories: {} },
          'Sinh hoạt cá nhân': { total: 0, subCategories: {} },
          'Kinh doanh Amazon': { total: 0, subCategories: {} },
          'Khác': { total: 0, subCategories: {} }
        },
        monthly: []
      };
      
      const stats = calculateCategoryStats(emptyData);
      
      expect(stats.totalExpense).toBe(0);
      expect(stats.avgMonthlyExpense).toBe(0);
      expect(stats.topCategory.name).toBe('Kinh doanh phần mềm'); // First category when all are 0
      expect(stats.topCategory.amount).toBe(0);
      expect(stats.categoryPercentages['Kinh doanh phần mềm']).toBe(0);
    });
  });

  describe('groupExpensesByPeriod', () => {
    let sampleExpenses;

    beforeEach(() => {
      sampleExpenses = [
        { date: '2024-01-15', amount: '1000000', type: 'Kinh doanh phần mềm' },
        { date: '2024-01-20', amount: '500000', type: 'Sinh hoạt cá nhân' },
        { date: '2024-02-10', amount: '2000000', type: 'Kinh doanh Amazon' },
        { date: '2024-02-25', amount: '300000', type: 'Khác' },
        { date: '2024-03-05', amount: '800000', type: 'Kinh doanh phần mềm' }
      ];
    });

    it('should group expenses by monthly period by default', () => {
      const result = groupExpensesByPeriod(sampleExpenses);
      
      expect(result).toHaveProperty('2024-01');
      expect(result).toHaveProperty('2024-02');
      expect(result).toHaveProperty('2024-03');
      
      expect(result['2024-01'].total).toBe(1500000);
      expect(result['2024-02'].total).toBe(2300000);
      expect(result['2024-03'].total).toBe(800000);
    });

    it('should group expenses by daily period', () => {
      const result = groupExpensesByPeriod(sampleExpenses, 'daily');
      
      expect(result).toHaveProperty('2024-01-15');
      expect(result).toHaveProperty('2024-01-20');
      expect(result).toHaveProperty('2024-02-10');
      expect(result).toHaveProperty('2024-02-25');
      expect(result).toHaveProperty('2024-03-05');
      
      expect(result['2024-01-15'].total).toBe(1000000);
      expect(result['2024-01-20'].total).toBe(500000);
    });

    it('should group expenses by weekly period', () => {
      const result = groupExpensesByPeriod(sampleExpenses, 'weekly');
      
      // Check that weekly keys are generated
      const weekKeys = Object.keys(result);
      expect(weekKeys.some(key => key.includes('-W'))).toBe(true);
    });

    it('should group expenses by quarterly period', () => {
      const result = groupExpensesByPeriod(sampleExpenses, 'quarterly');
      
      expect(result).toHaveProperty('2024-Q1');
      expect(result['2024-Q1'].total).toBe(4600000); // All expenses are in Q1
    });

    it('should distribute amounts to correct categories', () => {
      const result = groupExpensesByPeriod(sampleExpenses, 'monthly');
      
      expect(result['2024-01']['Kinh doanh phần mềm']).toBe(1000000);
      expect(result['2024-01']['Sinh hoạt cá nhân']).toBe(500000);
      expect(result['2024-02']['Kinh doanh Amazon']).toBe(2000000);
      expect(result['2024-02']['Khác']).toBe(300000);
      expect(result['2024-03']['Kinh doanh phần mềm']).toBe(800000);
    });

    it('should handle empty expense data', () => {
      const result = groupExpensesByPeriod([], 'monthly');
      
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should handle invalid amounts', () => {
      const invalidExpenses = [
        { date: '2024-01-15', amount: 'invalid', type: 'Kinh doanh phần mềm' },
        { date: '2024-01-20', amount: '', type: 'Sinh hoạt cá nhân' },
        { date: '2024-01-25', amount: null, type: 'Kinh doanh Amazon' }
      ];
      
      const result = groupExpensesByPeriod(invalidExpenses, 'monthly');
      
      expect(result['2024-01'].total).toBe(0);
      expect(result['2024-01']['Kinh doanh phần mềm']).toBe(0);
      expect(result['2024-01']['Sinh hoạt cá nhân']).toBe(0);
      expect(result['2024-01']['Kinh doanh Amazon']).toBe(0);
    });

    it('should handle missing type field', () => {
      const noTypeExpenses = [
        { date: '2024-01-15', amount: '1000000' },
        { date: '2024-01-20', amount: '500000', type: '' }
      ];
      
      const result = groupExpensesByPeriod(noTypeExpenses, 'monthly');
      
      expect(result['2024-01']['Khác']).toBe(1500000); // Both should map to 'Khác'
    });

    it('should initialize all main categories for each period', () => {
      const singleExpense = [
        { date: '2024-01-15', amount: '1000000', type: 'Kinh doanh phần mềm' }
      ];
      
      const result = groupExpensesByPeriod(singleExpense, 'monthly');
      
      expect(result['2024-01']).toHaveProperty('Kinh doanh phần mềm');
      expect(result['2024-01']).toHaveProperty('Sinh hoạt cá nhân');
      expect(result['2024-01']).toHaveProperty('Kinh doanh Amazon');
      expect(result['2024-01']).toHaveProperty('Khác');
      
      expect(result['2024-01']['Kinh doanh phần mềm']).toBe(1000000);
      expect(result['2024-01']['Sinh hoạt cá nhân']).toBe(0);
      expect(result['2024-01']['Kinh doanh Amazon']).toBe(0);
      expect(result['2024-01']['Khác']).toBe(0);
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle date normalization correctly', () => {
      const expensesWithDifferentDateFormats = [
        { date: new Date('2024-01-15'), amount: '1000000', type: 'Kinh doanh phần mềm' },
        { date: '2024-01-20', amount: '500000', type: 'Sinh hoạt cá nhân' }
      ];
      
      const result = calculateExpenseByCategoryData(expensesWithDifferentDateFormats);
      
      expect(result.categories['Kinh doanh phần mềm'].total).toBe(1000000);
      expect(result.categories['Sinh hoạt cá nhân'].total).toBe(500000);
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = [];
      for (let i = 0; i < 1000; i++) {
        largeDataset.push({
          date: `2024-${String(Math.floor(i / 100) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
          amount: String(Math.floor(Math.random() * 1000000)),
          type: 'Kinh doanh phần mềm',
          category: `Category${i % 10}`
        });
      }
      
      const start = performance.now();
      const result = calculateExpenseByCategoryData(largeDataset);
      const end = performance.now();
      
      expect(result).toBeDefined();
      expect(result.categories['Kinh doanh phần mềm'].total).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should maintain data consistency across functions', () => {
      const expenses = [
        { date: '2024-01-15', amount: '1000000', type: 'Kinh doanh phần mềm', category: 'Hosting' },
        { date: '2024-02-20', amount: '500000', type: 'Sinh hoạt cá nhân', category: 'Ăn uống' }
      ];
      
      const categoryData = calculateExpenseByCategoryData(expenses);
      const stats = calculateCategoryStats(categoryData);
      const grouped = groupExpensesByPeriod(expenses, 'monthly');
      
      // Total should be consistent
      expect(stats.totalExpense).toBe(1500000);
      expect(grouped['2024-01'].total + grouped['2024-02'].total).toBe(1500000);
    });
  });
});