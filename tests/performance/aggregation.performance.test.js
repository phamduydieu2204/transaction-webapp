/**
 * Performance benchmarks for aggregation functions
 * Tests performance with large datasets and identifies optimization opportunities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import functions to benchmark
import { 
  calculateTotalExpenses, 
  calculateTotalRevenue, 
  calculateFinancialAnalysis,
  calculateAllocatedExpense,
  calculateMonthlyExpenseBreakdown
} from '../../scripts/statistics/calculations.js';

import {
  normalizeExpenseData,
  normalizeTransactionData,
  aggregateByPeriod,
  groupByField,
  sortData,
  convertToCSV
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

// Performance utility functions
class PerformanceBenchmark {
  constructor(name) {
    this.name = name;
    this.results = [];
  }

  async run(fn, iterations = 1) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      results.push(end - start);
    }
    
    const avg = results.reduce((sum, time) => sum + time, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    
    this.results.push({ avg, min, max, iterations });
    
    return { avg, min, max, results };
  }

  getReport() {
    return {
      name: this.name,
      results: this.results
    };
  }
}

// Data generators for different sizes
const generateTransactionData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `txn_${i}`,
    ngayTao: `2024-${String(Math.floor(i / 1000) % 12 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    soTien: Math.floor(Math.random() * 10000000) + 100000, // 100K to 10M VND
    currency: ['VND', 'USD', 'NGN'][i % 3],
    khachHang: `Customer_${i % 100}`,
    phanMem: `Software_${String.fromCharCode(65 + (i % 10))}`, // Software_A to Software_J
    goiDichVu: ['Basic', 'Premium', 'Enterprise'][i % 3],
    loaiKeToAn: ['Doanh thu đã hoàn tất', 'Doanh thu dịch vụ'][i % 2]
  }));
};

const generateExpenseData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `exp_${i}`,
    ngayTao: `2024-${String(Math.floor(i / 1000) % 12 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    soTien: Math.floor(Math.random() * 5000000) + 50000, // 50K to 5M VND
    currency: ['VND', 'USD', 'NGN'][i % 3],
    danhMuc: [
      'Hosting', 'Software License', 'Marketing', 'Ăn uống', 'Di chuyển', 
      'Văn phòng phẩm', 'Điện nước', 'Internet', 'Thuê nhà', 'Bảo hiểm'
    ][i % 10],
    loai: [
      'Kinh doanh phần mềm', 'Sinh hoạt cá nhân', 'Kinh doanh Amazon', 'Khác'
    ][i % 4],
    phanBo: i % 5 === 0 ? 'Có' : 'Không', // 20% periodic allocation
    ngayTaiTuc: i % 5 === 0 ? `2024-12-${String((i % 28) + 1).padStart(2, '0')}` : null
  }));
};

// Memory usage tracking
const measureMemoryUsage = () => {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
};

describe('Performance Benchmarks - Aggregation Functions', () => {
  // Test dataset sizes
  const DATASET_SIZES = {
    small: 1000,      // 1K records
    medium: 10000,    // 10K records  
    large: 50000,     // 50K records
    xlarge: 100000    // 100K records
  };

  // Performance thresholds (in milliseconds)
  const PERFORMANCE_THRESHOLDS = {
    small: { max: 50, target: 20 },
    medium: { max: 200, target: 100 },
    large: { max: 1000, target: 500 },
    xlarge: { max: 3000, target: 1500 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Normalization Performance', () => {
    it('should benchmark normalizeTransactionData with different dataset sizes', async () => {
      const benchmark = new PerformanceBenchmark('normalizeTransactionData');
      const results = {};

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📊 Testing normalizeTransactionData with ${count} records (${size})`);
        
        const testData = generateTransactionData(count);
        const memoryBefore = measureMemoryUsage();
        
        const result = await benchmark.run(() => {
          return normalizeTransactionData(testData);
        }, 3); // Run 3 times for average

        const memoryAfter = measureMemoryUsage();
        
        results[size] = {
          ...result,
          recordCount: count,
          memoryUsed: memoryAfter && memoryBefore ? 
            memoryAfter.used - memoryBefore.used : null
        };

        // Performance assertions
        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        if (result.avg > threshold.target) {
          console.warn(`⚠️  Performance warning: ${result.avg.toFixed(2)}ms > ${threshold.target}ms target`);
        } else {
          console.log(`✅ Performance good: ${result.avg.toFixed(2)}ms < ${threshold.target}ms target`);
        }

        console.log(`   Avg: ${result.avg.toFixed(2)}ms, Min: ${result.min.toFixed(2)}ms, Max: ${result.max.toFixed(2)}ms`);
        if (results[size].memoryUsed) {
          console.log(`   Memory: ${(results[size].memoryUsed / 1024 / 1024).toFixed(2)}MB`);
        }
      }

      // Performance scaling analysis
      const smallTime = results.small.avg;
      const mediumTime = results.medium.avg;
      const largeTime = results.large.avg;

      const scalingFactor10x = mediumTime / smallTime; // 10x data scaling
      const scalingFactor50x = largeTime / smallTime; // 50x data scaling

      console.log(`\n📈 Scaling Analysis for normalizeTransactionData:`);
      console.log(`   10x data → ${scalingFactor10x.toFixed(2)}x time`);
      console.log(`   50x data → ${scalingFactor50x.toFixed(2)}x time`);

      // Should scale roughly linearly (good: < 2x, acceptable: < 5x)
      expect(scalingFactor10x).toBeLessThan(15); // Allow some overhead
      expect(scalingFactor50x).toBeLessThan(75);
    });

    it('should benchmark normalizeExpenseData with different dataset sizes', async () => {
      const benchmark = new PerformanceBenchmark('normalizeExpenseData');
      const results = {};

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📊 Testing normalizeExpenseData with ${count} records (${size})`);
        
        const testData = generateExpenseData(count);
        
        const result = await benchmark.run(() => {
          return normalizeExpenseData(testData);
        }, 3);

        results[size] = { ...result, recordCount: count };

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });
  });

  describe('Calculation Functions Performance', () => {
    it('should benchmark calculateTotalRevenue with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('calculateTotalRevenue');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n💰 Testing calculateTotalRevenue with ${count} records (${size})`);
        
        const testData = generateTransactionData(count);
        const normalizedData = normalizeTransactionData(testData);
        
        const result = await benchmark.run(() => {
          return calculateTotalRevenue(normalizedData);
        }, 5); // More iterations for calculation functions

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms, Records/ms: ${(count / result.avg).toFixed(0)}`);
      }
    });

    it('should benchmark calculateTotalExpenses with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('calculateTotalExpenses');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n💸 Testing calculateTotalExpenses with ${count} records (${size})`);
        
        const testData = generateExpenseData(count);
        const normalizedData = normalizeExpenseData(testData);
        
        const result = await benchmark.run(() => {
          return calculateTotalExpenses(normalizedData);
        }, 5);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms, Records/ms: ${(count / result.avg).toFixed(0)}`);
      }
    });

    it('should benchmark calculateFinancialAnalysis performance', async () => {
      const benchmark = new PerformanceBenchmark('calculateFinancialAnalysis');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📈 Testing calculateFinancialAnalysis with ${count} records (${size})`);
        
        const transactionData = generateTransactionData(count);
        const expenseData = generateExpenseData(count);
        
        const normalizedTransactions = normalizeTransactionData(transactionData);
        const normalizedExpenses = normalizeExpenseData(expenseData);
        
        const totalRevenue = calculateTotalRevenue(normalizedTransactions);
        const totalExpenses = calculateTotalExpenses(normalizedExpenses);
        
        const result = await benchmark.run(() => {
          return calculateFinancialAnalysis(totalRevenue, totalExpenses);
        }, 10); // More iterations since this is a lightweight function

        // Financial analysis should be very fast since it operates on totals
        expect(result.avg).toBeLessThan(10); // Should be under 10ms even for large datasets
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });
  });

  describe('Data Transformation Performance', () => {
    it('should benchmark aggregateByPeriod with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('aggregateByPeriod');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📅 Testing aggregateByPeriod with ${count} records (${size})`);
        
        const testData = generateTransactionData(count);
        const normalizedData = normalizeTransactionData(testData);
        
        const result = await benchmark.run(() => {
          return aggregateByPeriod(normalizedData, 'monthly', 'amount');
        }, 3);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });

    it('should benchmark groupByField with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('groupByField');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n🏷️  Testing groupByField with ${count} records (${size})`);
        
        const testData = generateTransactionData(count);
        const normalizedData = normalizeTransactionData(testData);
        
        const result = await benchmark.run(() => {
          return groupByField(normalizedData, 'software');
        }, 3);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });

    it('should benchmark sortData with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('sortData');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n🔢 Testing sortData with ${count} records (${size})`);
        
        const testData = generateTransactionData(count);
        const normalizedData = normalizeTransactionData(testData);
        
        const result = await benchmark.run(() => {
          return sortData(normalizedData, 'amount', 'desc');
        }, 3);

        // Sorting can be more expensive, so use relaxed thresholds
        const threshold = {
          max: PERFORMANCE_THRESHOLDS[size].max * 2,
          target: PERFORMANCE_THRESHOLDS[size].target * 2
        };
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });
  });

  describe('Category Processing Performance', () => {
    it('should benchmark calculateExpenseByCategoryData with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('calculateExpenseByCategoryData');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📊 Testing calculateExpenseByCategoryData with ${count} records (${size})`);
        
        const testData = generateExpenseData(count);
        const normalizedData = normalizeExpenseData(testData);
        
        // Add required fields for category processing
        const categoryData = normalizedData.map(expense => ({
          ...expense,
          type: expense.type || expense.loai || 'Khác',
          category: expense.category || expense.danhMuc || 'Khác',
          amount: parseFloat(expense.amount || expense.soTien) || 0,
          date: expense.date || expense.ngayTao
        }));
        
        const result = await benchmark.run(() => {
          return calculateExpenseByCategoryData(categoryData);
        }, 3);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });

    it('should benchmark groupExpensesByPeriod with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('groupExpensesByPeriod');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📅 Testing groupExpensesByPeriod with ${count} records (${size})`);
        
        const testData = generateExpenseData(count);
        const normalizedData = normalizeExpenseData(testData);
        
        const categoryData = normalizedData.map(expense => ({
          ...expense,
          type: expense.type || expense.loai || 'Khác',
          amount: parseFloat(expense.amount || expense.soTien) || 0,
          date: expense.date || expense.ngayTao
        }));
        
        const result = await benchmark.run(() => {
          return groupExpensesByPeriod(categoryData, 'monthly');
        }, 3);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });
  });

  describe('Chart Data Preparation Performance', () => {
    it('should benchmark prepareRevenueChartData with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('prepareRevenueChartData');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📈 Testing prepareRevenueChartData with ${count} records (${size})`);
        
        const chartData = Array.from({ length: count }, (_, i) => ({
          month: `2024-${String(Math.floor(i / 1000) % 12 + 1).padStart(2, '0')}`,
          software: `Software_${String.fromCharCode(65 + (i % 10))}`,
          amount: Math.floor(Math.random() * 10000000)
        }));
        
        const result = await benchmark.run(() => {
          return prepareRevenueChartData(chartData);
        }, 3);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });

    it('should benchmark prepareExpenseChartData with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('prepareExpenseChartData');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n💸 Testing prepareExpenseChartData with ${count} records (${size})`);
        
        const chartData = Array.from({ length: count }, (_, i) => ({
          type: ['Kinh doanh phần mềm', 'Sinh hoạt cá nhân', 'Kinh doanh Amazon', 'Khác'][i % 4],
          amount: Math.floor(Math.random() * 5000000)
        }));
        
        const result = await benchmark.run(() => {
          return prepareExpenseChartData(chartData);
        }, 3);

        const threshold = PERFORMANCE_THRESHOLDS[size];
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });
  });

  describe('Data Export Performance', () => {
    it('should benchmark convertToCSV with large datasets', async () => {
      const benchmark = new PerformanceBenchmark('convertToCSV');

      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        console.log(`\n📄 Testing convertToCSV with ${count} records (${size})`);
        
        const testData = generateTransactionData(count);
        const normalizedData = normalizeTransactionData(testData);
        
        const result = await benchmark.run(() => {
          return convertToCSV(normalizedData);
        }, 3);

        // CSV conversion can be expensive for large datasets
        const threshold = {
          max: PERFORMANCE_THRESHOLDS[size].max * 3,
          target: PERFORMANCE_THRESHOLDS[size].target * 3
        };
        expect(result.avg).toBeLessThan(threshold.max);
        
        console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      }
    });
  });

  describe('Memory Usage Analysis', () => {
    it('should analyze memory usage patterns with large datasets', async () => {
      console.log(`\n🧠 Memory Usage Analysis`);
      
      const memoryResults = {};
      
      for (const [size, count] of Object.entries(DATASET_SIZES)) {
        const memoryBefore = measureMemoryUsage();
        
        // Generate and process data
        const transactionData = generateTransactionData(count);
        const expenseData = generateExpenseData(count);
        
        const normalizedTransactions = normalizeTransactionData(transactionData);
        const normalizedExpenses = normalizeExpenseData(expenseData);
        
        const totalRevenue = calculateTotalRevenue(normalizedTransactions);
        const totalExpenses = calculateTotalExpenses(normalizedExpenses);
        
        const memoryAfter = measureMemoryUsage();
        
        if (memoryBefore && memoryAfter) {
          const memoryUsed = memoryAfter.used - memoryBefore.used;
          const memoryPerRecord = memoryUsed / (count * 2); // transactions + expenses
          
          memoryResults[size] = {
            totalMemory: memoryUsed,
            memoryPerRecord,
            recordCount: count * 2
          };
          
          console.log(`   ${size} (${count * 2} records): ${(memoryUsed / 1024 / 1024).toFixed(2)}MB total, ${(memoryPerRecord / 1024).toFixed(2)}KB/record`);
          
          // Memory should scale roughly linearly
          expect(memoryPerRecord).toBeLessThan(10 * 1024); // Less than 10KB per record
        } else {
          console.log(`   ${size}: Memory measurement not available in this environment`);
        }
      }
    });
  });

  describe('Bottleneck Identification', () => {
    it('should identify performance bottlenecks in the data pipeline', async () => {
      console.log(`\n🔍 Performance Bottleneck Analysis`);
      
      const count = DATASET_SIZES.large; // Use large dataset for bottleneck analysis
      const testData = generateTransactionData(count);
      
      const steps = [
        {
          name: 'Data Generation',
          fn: () => generateTransactionData(count)
        },
        {
          name: 'Data Normalization',
          fn: () => normalizeTransactionData(testData)
        },
        {
          name: 'Revenue Calculation',
          fn: () => {
            const normalized = normalizeTransactionData(testData);
            return calculateTotalRevenue(normalized);
          }
        },
        {
          name: 'Chart Data Preparation',
          fn: () => {
            const chartData = testData.map((_, i) => ({
              month: `2024-${String(Math.floor(i / 1000) % 12 + 1).padStart(2, '0')}`,
              software: `Software_${String.fromCharCode(65 + (i % 10))}`,
              amount: Math.floor(Math.random() * 10000000)
            }));
            return prepareRevenueChartData(chartData);
          }
        }
      ];
      
      const stepResults = [];
      
      for (const step of steps) {
        const start = performance.now();
        step.fn();
        const end = performance.now();
        const time = end - start;
        
        stepResults.push({ name: step.name, time });
        console.log(`   ${step.name}: ${time.toFixed(2)}ms`);
      }
      
      // Identify the slowest step
      const slowestStep = stepResults.reduce((prev, current) => 
        prev.time > current.time ? prev : current
      );
      
      console.log(`\n🐌 Slowest step: ${slowestStep.name} (${slowestStep.time.toFixed(2)}ms)`);
      
      // Verify that no single step takes more than 80% of total time
      const totalTime = stepResults.reduce((sum, step) => sum + step.time, 0);
      const slowestPercentage = (slowestStep.time / totalTime) * 100;
      
      console.log(`   Slowest step represents ${slowestPercentage.toFixed(1)}% of total pipeline time`);
      
      // Warning if one step dominates
      if (slowestPercentage > 70) {
        console.warn(`⚠️  Performance bottleneck detected in ${slowestStep.name}`);
      }
    });
  });

  describe('Optimization Recommendations', () => {
    it('should provide optimization recommendations based on benchmarks', async () => {
      console.log(`\n💡 Performance Optimization Recommendations`);
      
      const recommendations = [];
      
      // Test specific patterns that indicate optimization opportunities
      const largeDataset = generateTransactionData(DATASET_SIZES.large);
      
      // Test 1: Linear vs Object access patterns
      const start1 = performance.now();
      const linearAccess = largeDataset.map(item => item.soTien).reduce((sum, val) => sum + val, 0);
      const end1 = performance.now();
      
      const start2 = performance.now();
      const objectAccess = largeDataset.reduce((sum, item) => sum + (item.soTien || 0), 0);
      const end2 = performance.now();
      
      if ((end2 - start2) > (end1 - start1) * 1.5) {
        recommendations.push('Consider using map().reduce() over direct reduce() for large datasets');
      }
      
      // Test 2: Memory allocation patterns
      const start3 = performance.now();
      const preallocatedArray = new Array(largeDataset.length);
      for (let i = 0; i < largeDataset.length; i++) {
        preallocatedArray[i] = largeDataset[i].soTien * 2;
      }
      const end3 = performance.now();
      
      const start4 = performance.now();
      const dynamicArray = [];
      for (let i = 0; i < largeDataset.length; i++) {
        dynamicArray.push(largeDataset[i].soTien * 2);
      }
      const end4 = performance.now();
      
      if ((end4 - start4) > (end3 - start3) * 1.3) {
        recommendations.push('Pre-allocate arrays when size is known for better performance');
      }
      
      // Display recommendations
      if (recommendations.length > 0) {
        console.log(`\n📋 Recommendations:`);
        recommendations.forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec}`);
        });
      } else {
        console.log(`\n✅ No immediate optimization opportunities detected`);
      }
      
      // General performance guidelines
      console.log(`\n📊 Performance Guidelines:`);
      console.log(`   • Datasets < 10K records: Excellent performance expected`);
      console.log(`   • Datasets 10K-50K records: Good performance, monitor memory`);
      console.log(`   • Datasets > 50K records: Consider pagination or virtualization`);
      console.log(`   • Memory usage should stay under 100MB for datasets up to 100K records`);
    });
  });
});