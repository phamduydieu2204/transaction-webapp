/**
 * periodFilter.test.js
 * 
 * Test suite for period filtering functionality
 * Tests all_time, this_month, last_month, etc.
 */

import { describe, test, expect, beforeEach } from '../setup.js';

// Mock date utilities
const mockDateUtils = {
  normalizeDate: (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  },
  
  getDateRange: (period, referenceDate = new Date()) => {
    const today = new Date(referenceDate);
    const ranges = {};

    switch (period) {
      case "today":
        ranges.start = mockDateUtils.normalizeDate(today);
        ranges.end = mockDateUtils.normalizeDate(today);
        break;

      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        ranges.start = mockDateUtils.normalizeDate(startOfMonth);
        ranges.end = mockDateUtils.normalizeDate(endOfMonth);
        break;

      case "last_month":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        ranges.start = mockDateUtils.normalizeDate(lastMonthStart);
        ranges.end = mockDateUtils.normalizeDate(lastMonthEnd);
        break;

      case "this_year":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        ranges.start = mockDateUtils.normalizeDate(startOfYear);
        ranges.end = mockDateUtils.normalizeDate(endOfYear);
        break;

      case "all_time":
        ranges.start = null;
        ranges.end = null;
        break;

      default:
        ranges.start = mockDateUtils.normalizeDate(today);
        ranges.end = mockDateUtils.normalizeDate(today);
    }

    return ranges;
  }
};

// Mock filtering function
const mockFilterUtils = {
  filterDataByDateRange: (data, dateRange) => {
    if (!dateRange || (!dateRange.start && !dateRange.end)) {
      // No filtering - return all data (for all_time)
      return data;
    }
    
    return data.filter(item => {
      const itemDate = mockDateUtils.normalizeDate(item.transactionDate || item.date);
      if (!itemDate) return false;
      
      const isAfterStart = !dateRange.start || itemDate >= dateRange.start;
      const isBeforeEnd = !dateRange.end || itemDate <= dateRange.end;
      
      return isAfterStart && isBeforeEnd;
    });
  },
  
  filterByPeriod: (data, period, referenceDate = new Date()) => {
    if (period === 'all_time') {
      return data; // No filtering for all_time
    }
    
    const dateRange = mockDateUtils.getDateRange(period, referenceDate);
    return mockFilterUtils.filterDataByDateRange(data, dateRange);
  }
};

// Test data spanning multiple months
const testTransactions = [
  // Current month (January 2025)
  {
    id: 1,
    transactionDate: '2025/01/15',
    revenue: 100000,
    currency: 'VND',
    loaiGiaoDich: 'Hoàn tất'
  },
  {
    id: 2,
    transactionDate: '2025/01/10',
    revenue: 200000,
    currency: 'VND',
    loaiGiaoDich: 'Đã thanh toán'
  },
  // Last month (December 2024)
  {
    id: 3,
    transactionDate: '2024/12/20',
    revenue: 150000,
    currency: 'VND',
    loaiGiaoDich: 'Chưa thanh toán'
  },
  {
    id: 4,
    transactionDate: '2024/12/15',
    revenue: 120000,
    currency: 'VND',
    loaiGiaoDich: 'Hoàn tất'
  },
  // Previous year (2024)
  {
    id: 5,
    transactionDate: '2024/06/10',
    revenue: 80000,
    currency: 'VND',
    loaiGiaoDich: 'Hoàn tất'
  }
];

// Reference date for consistent testing
const referenceDate = new Date('2025-01-16');

describe('Period Filter Tests', () => {
  
  describe('Date Range Generation', () => {
    test('should generate correct date range for this_month', () => {
      console.log('🧪 Testing this_month date range...');
      
      const dateRange = mockDateUtils.getDateRange('this_month', referenceDate);
      
      expect(dateRange.start).toBe('2025/01/01');
      expect(dateRange.end).toBe('2025/01/31');
      
      console.log(`✅ This Month: ${dateRange.start} to ${dateRange.end}`);
    });
    
    test('should generate correct date range for last_month', () => {
      console.log('🧪 Testing last_month date range...');
      
      const dateRange = mockDateUtils.getDateRange('last_month', referenceDate);
      
      expect(dateRange.start).toBe('2024/12/01');
      expect(dateRange.end).toBe('2024/12/31');
      
      console.log(`✅ Last Month: ${dateRange.start} to ${dateRange.end}`);
    });
    
    test('should generate correct date range for this_year', () => {
      console.log('🧪 Testing this_year date range...');
      
      const dateRange = mockDateUtils.getDateRange('this_year', referenceDate);
      
      expect(dateRange.start).toBe('2025/01/01');
      expect(dateRange.end).toBe('2025/12/31');
      
      console.log(`✅ This Year: ${dateRange.start} to ${dateRange.end}`);
    });
    
    test('should return null ranges for all_time', () => {
      console.log('🧪 Testing all_time date range...');
      
      const dateRange = mockDateUtils.getDateRange('all_time', referenceDate);
      
      expect(dateRange.start).toBeNull();
      expect(dateRange.end).toBeNull();
      
      console.log('✅ All Time: No date restrictions');
    });
  });
  
  describe('Data Filtering', () => {
    test('should filter transactions for this_month correctly', () => {
      console.log('🧪 Testing this_month filtering...');
      
      const filtered = mockFilterUtils.filterByPeriod(testTransactions, 'this_month', referenceDate);
      
      expect(filtered).toHaveLength(2); // 2 transactions in January 2025
      expect(filtered[0].id).toBe(1);
      expect(filtered[1].id).toBe(2);
      
      const totalRevenue = filtered.reduce((sum, t) => sum + t.revenue, 0);
      expect(totalRevenue).toBe(300000); // 100,000 + 200,000
      
      console.log(`✅ This Month: ${filtered.length} transactions, ${totalRevenue.toLocaleString()} VND`);
    });
    
    test('should filter transactions for last_month correctly', () => {
      console.log('🧪 Testing last_month filtering...');
      
      const filtered = mockFilterUtils.filterByPeriod(testTransactions, 'last_month', referenceDate);
      
      expect(filtered).toHaveLength(2); // 2 transactions in December 2024
      expect(filtered[0].id).toBe(3);
      expect(filtered[1].id).toBe(4);
      
      const totalRevenue = filtered.reduce((sum, t) => sum + t.revenue, 0);
      expect(totalRevenue).toBe(270000); // 150,000 + 120,000
      
      console.log(`✅ Last Month: ${filtered.length} transactions, ${totalRevenue.toLocaleString()} VND`);
    });
    
    test('should return all transactions for all_time', () => {
      console.log('🧪 Testing all_time filtering...');
      
      const filtered = mockFilterUtils.filterByPeriod(testTransactions, 'all_time', referenceDate);
      
      expect(filtered).toHaveLength(5); // All transactions
      expect(filtered.length).toBe(testTransactions.length);
      
      const totalRevenue = filtered.reduce((sum, t) => sum + t.revenue, 0);
      expect(totalRevenue).toBe(650000); // Sum of all transactions
      
      console.log(`✅ All Time: ${filtered.length} transactions, ${totalRevenue.toLocaleString()} VND`);
    });
    
    test('should filter transactions for this_year correctly', () => {
      console.log('🧪 Testing this_year filtering...');
      
      const filtered = mockFilterUtils.filterByPeriod(testTransactions, 'this_year', referenceDate);
      
      expect(filtered).toHaveLength(2); // Only 2025 transactions
      expect(filtered[0].id).toBe(1);
      expect(filtered[1].id).toBe(2);
      
      console.log(`✅ This Year: ${filtered.length} transactions in 2025`);
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle empty data gracefully', () => {
      console.log('🧪 Testing empty data filtering...');
      
      const filtered = mockFilterUtils.filterByPeriod([], 'this_month', referenceDate);
      
      expect(filtered).toHaveLength(0);
      expect(Array.isArray(filtered)).toBe(true);
      
      console.log('✅ Empty data handled correctly');
    });
    
    test('should handle invalid dates gracefully', () => {
      console.log('🧪 Testing invalid date handling...');
      
      const invalidTransactions = [
        { id: 1, transactionDate: 'invalid-date', revenue: 100000 },
        { id: 2, transactionDate: null, revenue: 200000 },
        { id: 3, transactionDate: '2025/01/15', revenue: 150000 } // Valid
      ];
      
      const filtered = mockFilterUtils.filterByPeriod(invalidTransactions, 'this_month', referenceDate);
      
      expect(filtered).toHaveLength(1); // Only valid date transaction
      expect(filtered[0].id).toBe(3);
      
      console.log('✅ Invalid dates filtered out correctly');
    });
    
    test('should handle unknown period gracefully', () => {
      console.log('🧪 Testing unknown period handling...');
      
      const dateRange = mockDateUtils.getDateRange('unknown_period', referenceDate);
      
      // Should default to today's range
      const todayRange = mockDateUtils.getDateRange('today', referenceDate);
      expect(dateRange.start).toBe(todayRange.start);
      expect(dateRange.end).toBe(todayRange.end);
      
      console.log('✅ Unknown period defaulted to today');
    });
  });
  
  describe('Period Comparison', () => {
    test('should show different results for different periods', () => {
      console.log('🧪 Testing period comparison...');
      
      const thisMonth = mockFilterUtils.filterByPeriod(testTransactions, 'this_month', referenceDate);
      const lastMonth = mockFilterUtils.filterByPeriod(testTransactions, 'last_month', referenceDate);
      const allTime = mockFilterUtils.filterByPeriod(testTransactions, 'all_time', referenceDate);
      
      expect(thisMonth.length).toBe(2);
      expect(lastMonth.length).toBe(2);
      expect(allTime.length).toBe(5);
      
      // Verify no overlap between this month and last month
      const thisMonthIds = thisMonth.map(t => t.id);
      const lastMonthIds = lastMonth.map(t => t.id);
      const overlap = thisMonthIds.filter(id => lastMonthIds.includes(id));
      expect(overlap).toHaveLength(0);
      
      console.log('✅ Period filtering produces different results:');
      console.log(`   This Month: ${thisMonth.length} transactions`);
      console.log(`   Last Month: ${lastMonth.length} transactions`);
      console.log(`   All Time: ${allTime.length} transactions`);
    });
    
    test('should preserve data integrity across filters', () => {
      console.log('🧪 Testing data integrity...');
      
      const allTime = mockFilterUtils.filterByPeriod(testTransactions, 'all_time', referenceDate);
      const thisMonth = mockFilterUtils.filterByPeriod(testTransactions, 'this_month', referenceDate);
      const lastMonth = mockFilterUtils.filterByPeriod(testTransactions, 'last_month', referenceDate);
      
      // All filtered data should be subset of original
      expect(thisMonth.every(t => testTransactions.includes(t))).toBe(true);
      expect(lastMonth.every(t => testTransactions.includes(t))).toBe(true);
      expect(allTime.every(t => testTransactions.includes(t))).toBe(true);
      
      // All time should include everything
      expect(allTime.length).toBe(testTransactions.length);
      
      console.log('✅ Data integrity preserved across all filters');
    });
  });
  
  describe('Performance Tests', () => {
    test('should filter large datasets efficiently', () => {
      console.log('🧪 Testing large dataset filtering performance...');
      
      // Generate large dataset
      const largeDataset = [];
      for (let i = 0; i < 10000; i++) {
        largeDataset.push({
          id: i,
          transactionDate: `2025/01/${String((i % 31) + 1).padStart(2, '0')}`,
          revenue: Math.random() * 500000
        });
      }
      
      const startTime = performance.now();
      const filtered = mockFilterUtils.filterByPeriod(largeDataset, 'this_month', referenceDate);
      const endTime = performance.now();
      
      const filterTime = endTime - startTime;
      
      // Should filter 10,000 records efficiently (< 20ms)
      expect(filterTime).toBeLessThan(20);
      expect(filtered.length).toBe(10000); // All are in January
      
      console.log(`✅ Large dataset (10,000 records): ${filterTime.toFixed(2)}ms`);
      console.log(`   Performance target: <20ms`);
    });
    
    test('should handle all_time efficiently for large datasets', () => {
      console.log('🧪 Testing all_time performance...');
      
      // Generate large dataset
      const largeDataset = [];
      for (let i = 0; i < 10000; i++) {
        largeDataset.push({
          id: i,
          transactionDate: `2024/01/${String((i % 31) + 1).padStart(2, '0')}`,
          revenue: Math.random() * 500000
        });
      }
      
      const startTime = performance.now();
      const filtered = mockFilterUtils.filterByPeriod(largeDataset, 'all_time', referenceDate);
      const endTime = performance.now();
      
      const filterTime = endTime - startTime;
      
      // Should be very fast for all_time (< 5ms) since no filtering
      expect(filterTime).toBeLessThan(5);
      expect(filtered.length).toBe(10000);
      expect(filtered).toBe(largeDataset); // Should return same reference
      
      console.log(`✅ All Time (10,000 records): ${filterTime.toFixed(2)}ms`);
      console.log(`   Performance target: <5ms`);
    });
  });
});

export default {
  testTransactions,
  mockDateUtils,
  mockFilterUtils,
  referenceDate
};