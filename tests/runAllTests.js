/**
 * 🧪 Test Runner - Chạy Tất Cả Kiểm Thử
 * Runs all statistics dashboard tests and generates summary report
 */

import { testOverviewFunctionality } from './overview/overviewReport.test.js';
import { testKPICalculations } from './overview/kpiCalculation.test.js';
import { testPeriodFilters } from './overview/periodFilter.test.js';
import { testOverviewCache } from './cache/cacheTesting.js';

/**
 * Chạy tất cả kiểm thử và tạo báo cáo tổng hợp
 */
export async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...');
  console.log('================================================');
  
  const results = {
    overview: null,
    kpi: null,
    filters: null,
    cache: null,
    summary: {
      total: 4,
      passed: 0,
      failed: 0,
      startTime: new Date(),
      endTime: null
    }
  };

  try {
    // 1. Test Overview Functionality
    console.log('\n📋 1. Testing Overview Report Functionality...');
    results.overview = await testOverviewFunctionality();
    if (results.overview.success) results.summary.passed++;
    else results.summary.failed++;
    
    // 2. Test KPI Calculations
    console.log('\n📈 2. Testing KPI Calculations...');
    results.kpi = await testKPICalculations();
    if (results.kpi.success) results.summary.passed++;
    else results.summary.failed++;
    
    // 3. Test Period Filters
    console.log('\n📅 3. Testing Period Filters...');
    results.filters = await testPeriodFilters();
    if (results.filters.success) results.summary.passed++;
    else results.summary.failed++;
    
    // 4. Test Cache Management
    console.log('\n🗄️ 4. Testing Cache Management...');
    results.cache = await testOverviewCache();
    if (results.cache.cacheStatus.allTestsPassed) results.summary.passed++;
    else results.summary.failed++;
    
    results.summary.endTime = new Date();
    
    // Generate Summary Report
    generateSummaryReport(results);
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.summary.endTime = new Date();
    results.summary.failed = results.summary.total;
    return results;
  }
}

/**
 * Tạo báo cáo tổng hợp kết quả kiểm thử
 */
function generateSummaryReport(results) {
  const duration = results.summary.endTime - results.summary.startTime;
  const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
  
  console.log('\n🎯 =============================================');
  console.log('📊 STATISTICS DASHBOARD TEST SUMMARY');
  console.log('===============================================');
  
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`✅ Passed: ${results.summary.passed}/${results.summary.total}`);
  console.log(`❌ Failed: ${results.summary.failed}/${results.summary.total}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  console.log('\n📋 Test Details:');
  console.log(`  📋 Overview Report: ${results.overview?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  📈 KPI Calculations: ${results.kpi?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  📅 Period Filters: ${results.filters?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  🗄️  Cache Management: ${results.cache?.cacheStatus?.allTestsPassed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.summary.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Statistics dashboard is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check individual test results above.');
  }
  
  console.log('\n📄 Full report available in: tests/TEST-RESULTS-REPORT.md');
  console.log('===============================================');
}

/**
 * Quick health check - chỉ kiểm tra các chức năng cơ bản
 */
export async function quickHealthCheck() {
  console.log('🏥 Running quick health check...');
  
  try {
    // Test basic functionality
    const { calculateBusinessMetrics } = await import('../scripts/statisticsCore.js');
    
    // Mock minimal data
    const testTransactions = [{ amount: 100000, date: '2024-01-15' }];
    const testExpenses = [{ amount: 30000, date: '2024-01-15' }];
    
    const metrics = calculateBusinessMetrics(testTransactions, testExpenses);
    
    const isHealthy = metrics && 
                     metrics.financial && 
                     metrics.financial.totalRevenue === 100000 &&
                     metrics.financial.totalExpenses === 30000;
    
    if (isHealthy) {
      console.log('✅ Health check PASSED - Dashboard is functional');
      return { healthy: true, metrics };
    } else {
      console.log('❌ Health check FAILED - Dashboard needs attention');
      return { healthy: false, error: 'Metrics calculation error' };
    }
    
  } catch (error) {
    console.log('❌ Health check FAILED:', error.message);
    return { healthy: false, error: error.message };
  }
}

// Auto-run cho debugging
if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
  runAllTests().then(results => {
    console.log('🔧 Debug mode - Test results:', results);
  });
}

// Export for manual testing
window.runStatisticsTests = runAllTests;
window.quickHealthCheck = quickHealthCheck;