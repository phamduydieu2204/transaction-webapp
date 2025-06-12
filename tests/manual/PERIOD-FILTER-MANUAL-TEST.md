# 📅 Manual Testing Guide - Period Filters

**Date:** 2025-01-16  
**Objective:** Verify period filtering works correctly after cleanup

---

## 🎯 Test Objectives

Verify that the period selector in the overview report correctly filters data and displays accurate KPIs for:
- **All Time** (tất cả thời gian)
- **This Month** (tháng này)
- **Last Month** (tháng trước)
- **This Year** (năm này)
- **Custom date ranges** (if implemented)

---

## 🛠️ Pre-Test Setup

### 1. Clear Browser Cache
```bash
# Critical for testing after cleanup
1. Press F12 → Application tab
2. Clear Storage → Clear site data
3. Clear Local Storage and Session Storage
4. Hard refresh: Ctrl+Shift+R
5. Close and reopen browser
```

### 2. Verify Test Data
Ensure you have transactions spanning multiple periods:
- **Current month (January 2025):** Some transactions
- **Previous month (December 2024):** Some transactions  
- **Previous year (2024):** Some transactions
- **Total transactions:** Should be 1332+ as mentioned earlier

### 3. Expected Console Output
After cleanup, you should see:
```
✅ Expected (OK):
⚠️ businessOverviewDashboard.js is disabled
⚠️ financial/financialDashboard.js is disabled
✅ Template loaded with caching
✅ Using consolidated business metrics

❌ Should NOT see:
❌ "old template" messages
❌ Import/module errors
❌ Template loading failures
```

---

## 📊 Manual Test Cases

### **Test Case 1: All Time Filter**

**Steps:**
1. Navigate to Statistics tab → Overview report
2. Verify period selector shows "Tất cả thời gian" or similar
3. Check KPI values
4. Open browser console

**Expected Results:**
- ✅ **Total transactions:** 1332 (or your full dataset)
- ✅ **Revenue:** Shows sum of ALL transactions
- ✅ **Console:** `✅ All Time ACTIVATED - NO FILTERING!`
- ✅ **Console:** `💯 RESULT: transactions = 1332` (your total)
- ✅ **No errors** in console

**Verification:**
```javascript
// Check in console:
console.log('Total transactions:', window.transactionList?.length);
console.log('KPI shows all data:', document.getElementById('total-transactions')?.textContent);
```

---

### **Test Case 2: This Month Filter**

**Steps:**
1. Change period selector to "Tháng này" or "This Month"
2. Wait for data to reload
3. Check KPI values update
4. Verify numbers are smaller than "All Time"

**Expected Results:**
- ✅ **Transaction count:** < 1332 (only current month)
- ✅ **Revenue:** Only January 2025 transactions
- ✅ **Data updates** immediately without page reload
- ✅ **Console:** Shows current month filtering logs
- ✅ **Period display** updates to show current month

**Verification:**
```javascript
// Check filtered data in console:
console.log('Filtered transactions:', 
  window.transactionList?.filter(t => {
    const date = new Date(t.transactionDate);
    return date.getMonth() === new Date().getMonth() && 
           date.getFullYear() === new Date().getFullYear();
  }).length
);
```

---

### **Test Case 3: Last Month Filter**

**Steps:**
1. Select "Tháng trước" or "Last Month"
2. Verify different data loads
3. Check KPI values are different from current month

**Expected Results:**
- ✅ **Different transaction count** from current month
- ✅ **December 2024 data** (if available)
- ✅ **Period display** shows last month range
- ✅ **No overlap** with current month data

---

### **Test Case 4: Filter Switching Performance**

**Steps:**
1. Switch rapidly between: All Time → This Month → Last Month → All Time
2. Monitor loading speed and console
3. Check for any errors or delays

**Expected Results:**
- ✅ **Fast switching** (< 200ms per change)
- ✅ **No console errors** during switching
- ✅ **Data consistency** - same results for same filters
- ✅ **UI responsiveness** maintained

**Performance Check:**
```javascript
// Time filter switching:
console.time('filter-switch');
// Change filter
console.timeEnd('filter-switch');
// Should be < 200ms
```

---

### **Test Case 5: Data Accuracy Verification**

**Steps:**
1. Note "All Time" totals
2. Switch to "This Month" and "Last Month"
3. Manually verify partial totals make sense

**Expected Results:**
- ✅ **Math consistency:** This Month + Last Month + Other Months = All Time
- ✅ **No negative values** in any period
- ✅ **Logical relationships:** All Time ≥ This Month ≥ 0
- ✅ **Currency formatting** consistent across all periods

**Manual Calculation:**
```
All Time Revenue = Sum of all periods
This Month Revenue ≤ All Time Revenue
Transaction Count (All Time) ≥ Transaction Count (This Month)
```

---

## 🚨 Common Issues & Troubleshooting

### **Issue 1: "All Time" Shows Same as "This Month"**
**Cause:** Period filtering not working
**Solution:** 
1. Check console for filtering errors
2. Verify `period === 'all_time'` logic
3. Hard refresh browser cache

### **Issue 2: Console Shows "Using old template"**
**Cause:** Browser cache serving old JavaScript
**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear cache completely
3. Check for Service Worker conflicts

### **Issue 3: KPI Cards Show "0 ₫"**
**Cause:** Data structure mismatch or calculation error
**Solution:**
1. Check `calculateBusinessMetrics` output
2. Verify data access: `window.transactionList`
3. Check for JavaScript errors in console

### **Issue 4: Period Selector Not Responding**
**Cause:** Event handlers not attached
**Solution:**
1. Check for JavaScript errors
2. Verify DOM elements loaded
3. Test with manual console commands

---

## 🧪 Advanced Testing

### **Performance Testing:**
```javascript
// Monitor period filter performance
function testPeriodFilterPerformance() {
  const periods = ['all_time', 'this_month', 'last_month'];
  
  periods.forEach(period => {
    console.time(`filter-${period}`);
    // Change to period
    console.timeEnd(`filter-${period}`);
  });
}
```

### **Data Integrity Testing:**
```javascript
// Verify filter accuracy
function verifyFilterAccuracy() {
  const allData = window.transactionList || [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpected = allData.filter(t => {
    const date = new Date(t.transactionDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  console.log('Expected this month:', thisMonthExpected.length);
  console.log('UI shows:', document.getElementById('total-transactions')?.textContent);
}
```

### **Memory Leak Testing:**
```javascript
// Check for memory leaks during filter switching
function testMemoryUsage() {
  console.log('Initial memory:', performance.memory?.usedJSHeapSize);
  
  // Switch filters multiple times
  for (let i = 0; i < 10; i++) {
    // Change period rapidly
  }
  
  console.log('Final memory:', performance.memory?.usedJSHeapSize);
}
```

---

## ✅ Success Criteria

### **Filter Testing Passed If:**
1. **All Time shows complete dataset** (1332+ transactions)
2. **Monthly filters show subset** (< All Time)
3. **No console errors** during filter switching
4. **Performance < 200ms** per filter change
5. **Data accuracy verified** through manual spot checks
6. **UI updates smoothly** without flashing

### **Filter Testing Failed If:**
1. **JavaScript errors** in console
2. **All periods show same data**
3. **Negative or impossible values** displayed
4. **Performance degradation** (> 1s delays)
5. **Data inconsistencies** across periods

---

## 📝 Test Results Template

| Test Case | Status | Notes | Performance |
|-----------|--------|-------|-------------|
| All Time Filter | ⏳ | | |
| This Month Filter | ⏳ | | |
| Last Month Filter | ⏳ | | |
| Filter Switching | ⏳ | | |
| Data Accuracy | ⏳ | | |

**Overall Status:** 🟡 Ready for Testing

**Browser:** Chrome/Firefox/Safari  
**Date:** 2025-01-16  
**Tester:** [Name]

---

## 🎯 Post-Test Actions

### **If Tests Pass:**
1. Document successful filter functionality
2. Note performance improvements
3. Verify cleanup was successful

### **If Tests Fail:**
1. Document specific failure modes
2. Check console errors for clues
3. Compare with pre-cleanup behavior
4. Consider rollback if critical issues found

The period filter testing will verify that our cleanup and consolidation efforts haven't broken the core filtering functionality while potentially improving performance.