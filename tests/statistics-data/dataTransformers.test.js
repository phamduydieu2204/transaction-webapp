/**
 * Unit tests for dataTransformers.js
 * Tests all data transformation, normalization, and formatting functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  convertToCSV,
  normalizeExpenseData,
  normalizeTransactionData,
  formatCurrency,
  formatDate,
  aggregateByPeriod,
  groupByField,
  sortData
} from '../../scripts/statistics-data/dataTransformers.js';

describe('convertToCSV', () => {
  const sampleData = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Jane', age: 25, city: 'Los Angeles' },
    { name: 'Bob', age: 35, city: 'Chicago' }
  ];

  it('should convert array of objects to CSV format', () => {
    const result = convertToCSV(sampleData);
    const lines = result.split('\n');
    
    expect(lines[0]).toBe('name,age,city');
    expect(lines[1]).toBe('"John","30","New York"');
    expect(lines[2]).toBe('"Jane","25","Los Angeles"');
    expect(lines[3]).toBe('"Bob","35","Chicago"');
  });

  it('should handle data with commas and quotes', () => {
    const dataWithSpecialChars = [
      { name: 'John "Johnny" Doe', description: 'Text with, commas', amount: 1000 }
    ];
    
    const result = convertToCSV(dataWithSpecialChars);
    const lines = result.split('\n');
    
    expect(lines[1]).toBe('"John ""Johnny"" Doe","Text with, commas","1000"');
  });

  it('should handle missing values', () => {
    const dataWithMissing = [
      { name: 'John', age: 30 },
      { name: 'Jane', city: 'LA' }
    ];
    
    const result = convertToCSV(dataWithMissing);
    const lines = result.split('\n');
    
    expect(lines[0]).toBe('name,age');
    expect(lines[1]).toBe('"John","30"');
    expect(lines[2]).toBe('"Jane",""');
  });

  it('should return empty string for empty array', () => {
    const result = convertToCSV([]);
    expect(result).toBe('');
  });

  it('should return empty string for non-array input', () => {
    expect(convertToCSV(null)).toBe('');
    expect(convertToCSV(undefined)).toBe('');
    expect(convertToCSV('not array')).toBe('');
  });
});

describe('normalizeExpenseData', () => {
  const rawExpenses = [
    {
      id: 'exp1',
      date: '2024-01-15',
      amount: '1000000',
      category: 'Office',
      description: 'Office supplies',
      bank: 'VCB',
      status: 'active'
    },
    {
      timestamp: 'exp2',
      ngayTao: '2024-01-20',
      soTien: '500000',
      loaiChiPhi: 'Marketing',
      moTa: 'Facebook ads',
      nganHang: 'TCB'
    }
  ];

  it('should normalize expense data with standard fields', () => {
    const result = normalizeExpenseData(rawExpenses);
    
    expect(result).toHaveLength(2);
    
    // First expense (standard fields)
    expect(result[0]).toEqual({
      id: 'exp1',
      date: '2024-01-15',
      amount: 1000000,
      category: 'Office',
      description: 'Office supplies',
      bank: 'VCB',
      status: 'active',
      createdAt: undefined,
      updatedAt: undefined
    });
    
    // Second expense (Vietnamese fields)
    expect(result[1]).toEqual({
      id: 'exp2',
      date: '2024-01-20',
      amount: 500000,
      category: 'Marketing',
      description: 'Facebook ads',
      bank: 'TCB',
      status: 'active',
      createdAt: 'exp2',
      updatedAt: 'exp2'
    });
  });

  it('should handle missing fields with defaults', () => {
    const incompleteExpense = [{ id: 'exp1' }];
    const result = normalizeExpenseData(incompleteExpense);
    
    expect(result[0]).toEqual({
      id: 'exp1',
      date: undefined,
      amount: 0,
      category: 'Unknown',
      description: '',
      bank: '',
      status: 'active',
      createdAt: undefined,
      updatedAt: undefined
    });
  });

  it('should handle non-array input', () => {
    expect(normalizeExpenseData(null)).toEqual([]);
    expect(normalizeExpenseData(undefined)).toEqual([]);
    expect(normalizeExpenseData('not array')).toEqual([]);
  });

  it('should parse string amounts to numbers', () => {
    const expenseWithStringAmount = [{ amount: '1500000.50' }];
    const result = normalizeExpenseData(expenseWithStringAmount);
    
    expect(result[0].amount).toBe(1500000.50);
    expect(typeof result[0].amount).toBe('number');
  });
});

describe('normalizeTransactionData', () => {
  const rawTransactions = [
    {
      id: 'txn1',
      date: '2024-01-15',
      amount: '5000000',
      type: 'revenue',
      customer: 'ABC Corp',
      software: 'Office 365',
      package: 'Business'
    },
    {
      timestamp: 'txn2',
      ngayTao: '2024-01-20',
      soTien: '3000000',
      loaiGiaoDich: 'subscription',
      khachHang: 'XYZ Ltd',
      phanMem: 'Adobe CC',
      goiDichVu: 'Premium'
    }
  ];

  it('should normalize transaction data with standard fields', () => {
    const result = normalizeTransactionData(rawTransactions);
    
    expect(result).toHaveLength(2);
    
    expect(result[0]).toEqual({
      id: 'txn1',
      date: '2024-01-15',
      amount: 5000000,
      type: 'revenue',
      customer: 'ABC Corp',
      software: 'Office 365',
      package: 'Business',
      status: 'active',
      createdAt: undefined,
      updatedAt: undefined
    });
    
    expect(result[1]).toEqual({
      id: 'txn2',
      date: '2024-01-20',
      amount: 3000000,
      type: 'subscription',
      customer: 'XYZ Ltd',
      software: 'Adobe CC',
      package: 'Premium',
      status: 'active',
      createdAt: 'txn2',
      updatedAt: 'txn2'
    });
  });

  it('should handle missing fields with defaults', () => {
    const incompleteTransaction = [{ id: 'txn1' }];
    const result = normalizeTransactionData(incompleteTransaction);
    
    expect(result[0]).toEqual({
      id: 'txn1',
      date: undefined,
      amount: 0,
      type: 'revenue',
      customer: '',
      software: '',
      package: '',
      status: 'active',
      createdAt: undefined,
      updatedAt: undefined
    });
  });

  it('should handle non-array input', () => {
    expect(normalizeTransactionData(null)).toEqual([]);
    expect(normalizeTransactionData({})).toEqual([]);
  });
});

describe('formatCurrency', () => {
  it('should format VND currency correctly', () => {
    const result = formatCurrency(1000000, 'VND');
    expect(result).toContain('1.000.000');
    expect(result).toContain('₫');
  });

  it('should format USD currency correctly', () => {
    const result = formatCurrency(1000, 'USD');
    expect(result).toContain('$1,000');
  });

  it('should default to VND if no currency specified', () => {
    const result = formatCurrency(500000);
    expect(result).toContain('500.000');
    expect(result).toContain('₫');
  });

  it('should handle string numbers', () => {
    const result = formatCurrency('1500000', 'VND');
    expect(result).toContain('1.500.000');
  });

  it('should handle zero and invalid values', () => {
    expect(formatCurrency(0)).toContain('0');
    expect(formatCurrency('')).toContain('0');
    expect(formatCurrency(null)).toContain('0');
    expect(formatCurrency('invalid')).toContain('0');
  });

  it('should handle negative values', () => {
    const result = formatCurrency(-1000000, 'VND');
    expect(result).toContain('-1.000.000');
  });
});

describe('formatDate', () => {
  const testDate = new Date('2024-01-15T10:30:00Z');

  it('should format date in DD/MM/YYYY format by default', () => {
    const result = formatDate(testDate);
    expect(result).toBe('15/01/2024');
  });

  it('should format date in MM/DD/YYYY format', () => {
    const result = formatDate(testDate, 'MM/DD/YYYY');
    expect(result).toBe('01/15/2024');
  });

  it('should format date in YYYY-MM-DD format', () => {
    const result = formatDate(testDate, 'YYYY-MM-DD');
    expect(result).toBe('2024-01-15');
  });

  it('should handle string date input', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('15/01/2024');
  });

  it('should handle invalid date formats', () => {
    expect(formatDate('invalid-date')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('should use default format for unknown format strings', () => {
    const result = formatDate(testDate, 'unknown-format');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Should be locale date string
  });
});

describe('aggregateByPeriod', () => {
  const sampleData = [
    { date: '2024-01-15', amount: 1000, type: 'expense' },
    { date: '2024-01-20', amount: 1500, type: 'expense' },
    { date: '2024-02-10', amount: 2000, type: 'revenue' },
    { date: '2024-02-15', amount: 2500, type: 'revenue' }
  ];

  it('should aggregate by month by default', () => {
    const result = aggregateByPeriod(sampleData);
    
    expect(Object.keys(result)).toEqual(['2024-01', '2024-02']);
    expect(result['2024-01'].count).toBe(2);
    expect(result['2024-01'].total).toBe(2500);
    expect(result['2024-02'].count).toBe(2);
    expect(result['2024-02'].total).toBe(4500);
  });

  it('should aggregate by day', () => {
    const result = aggregateByPeriod(sampleData, 'day');
    
    expect(Object.keys(result)).toEqual(['2024-01-15', '2024-01-20', '2024-02-10', '2024-02-15']);
    expect(result['2024-01-15'].total).toBe(1000);
    expect(result['2024-01-20'].total).toBe(1500);
  });

  it('should aggregate by year', () => {
    const result = aggregateByPeriod(sampleData, 'year');
    
    expect(Object.keys(result)).toEqual(['2024']);
    expect(result['2024'].count).toBe(4);
    expect(result['2024'].total).toBe(7000);
  });

  it('should handle custom value field', () => {
    const dataWithCustomField = [
      { date: '2024-01-15', revenue: 5000 },
      { date: '2024-01-20', revenue: 3000 }
    ];
    
    const result = aggregateByPeriod(dataWithCustomField, 'month', 'revenue');
    expect(result['2024-01'].total).toBe(8000);
  });

  it('should handle Vietnamese field names', () => {
    const vietnameseData = [
      { ngayTao: '2024-01-15', amount: 1000 },
      { ngayTao: '2024-01-20', amount: 1500 }
    ];
    
    const result = aggregateByPeriod(vietnameseData);
    expect(result['2024-01'].total).toBe(2500);
  });

  it('should handle empty or invalid input', () => {
    expect(aggregateByPeriod([])).toEqual({});
    expect(aggregateByPeriod(null)).toEqual({});
    expect(aggregateByPeriod('not array')).toEqual({});
  });
});

describe('groupByField', () => {
  const sampleData = [
    { category: 'Office', amount: 1000 },
    { category: 'Marketing', amount: 1500 },
    { category: 'Office', amount: 800 },
    { category: 'Travel', amount: 2000 }
  ];

  it('should group data by specified field', () => {
    const result = groupByField(sampleData, 'category');
    
    expect(Object.keys(result)).toEqual(['Office', 'Marketing', 'Travel']);
    expect(result.Office.count).toBe(2);
    expect(result.Office.total).toBe(1800);
    expect(result.Marketing.count).toBe(1);
    expect(result.Marketing.total).toBe(1500);
  });

  it('should handle missing field values', () => {
    const dataWithMissing = [
      { category: 'Office', amount: 1000 },
      { amount: 1500 }, // Missing category
      { category: '', amount: 800 }
    ];
    
    const result = groupByField(dataWithMissing, 'category');
    
    expect(result.Office.count).toBe(1);
    expect(result.Unknown.count).toBe(2); // Both missing and empty string
  });

  it('should handle Vietnamese field names', () => {
    const vietnameseData = [
      { category: 'Office', soTien: '1000' },
      { category: 'Marketing', soTien: '1500' }
    ];
    
    const result = groupByField(vietnameseData, 'category');
    
    expect(result.Office.total).toBe(1000);
    expect(result.Marketing.total).toBe(1500);
  });

  it('should handle empty or invalid input', () => {
    expect(groupByField([], 'category')).toEqual({});
    expect(groupByField(null, 'category')).toEqual({});
  });
});

describe('sortData', () => {
  const sampleData = [
    { name: 'John', amount: 1000, date: '2024-01-20' },
    { name: 'Alice', amount: 1500, date: '2024-01-15' },
    { name: 'Bob', amount: 800, date: '2024-01-25' }
  ];

  it('should sort by string field ascending', () => {
    const result = sortData(sampleData, 'name', 'asc');
    
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('John');
  });

  it('should sort by string field descending', () => {
    const result = sortData(sampleData, 'name', 'desc');
    
    expect(result[0].name).toBe('John');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Alice');
  });

  it('should sort by numeric field ascending', () => {
    const result = sortData(sampleData, 'amount', 'asc');
    
    expect(result[0].amount).toBe(800);
    expect(result[1].amount).toBe(1000);
    expect(result[2].amount).toBe(1500);
  });

  it('should sort by numeric field descending', () => {
    const result = sortData(sampleData, 'amount', 'desc');
    
    expect(result[0].amount).toBe(1500);
    expect(result[1].amount).toBe(1000);
    expect(result[2].amount).toBe(800);
  });

  it('should sort by date field', () => {
    const result = sortData(sampleData, 'date', 'asc');
    
    expect(result[0].date).toBe('2024-01-15');
    expect(result[1].date).toBe('2024-01-20');
    expect(result[2].date).toBe('2024-01-25');
  });

  it('should handle Vietnamese field names', () => {
    const vietnameseData = [
      { name: 'John', soTien: '1000' },
      { name: 'Alice', soTien: '1500' }
    ];
    
    const result = sortData(vietnameseData, 'soTien', 'desc');
    
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('John');
  });

  it('should default to ascending order', () => {
    const result = sortData(sampleData, 'amount');
    
    expect(result[0].amount).toBe(800);
    expect(result[2].amount).toBe(1500);
  });

  it('should handle empty or invalid input', () => {
    expect(sortData(null, 'name')).toEqual([]);
    expect(sortData(undefined, 'name')).toEqual([]);
    expect(sortData('not array', 'name')).toEqual([]);
  });

  it('should not mutate original array', () => {
    const original = [...sampleData];
    const result = sortData(sampleData, 'amount', 'desc');
    
    expect(sampleData).toEqual(original);
    expect(result).not.toBe(sampleData);
  });
});