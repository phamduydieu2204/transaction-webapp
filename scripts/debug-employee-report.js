/**
 * Debug script for Employee Report
 */

// Check if all required modules are available
console.log('🔍 Checking Employee Report Dependencies...');

// Check for Chart.js
if (typeof Chart !== 'undefined') {
    console.log('✅ Chart.js is loaded');
} else {
    console.log('❌ Chart.js is NOT loaded');
}

// Check for global data
if (window.currentTransactionData) {
    console.log('✅ Transaction data available:', window.currentTransactionData.length, 'records');
} else {
    console.log('❌ Transaction data NOT available');
}

if (window.currentExpenseData) {
    console.log('✅ Expense data available:', window.currentExpenseData.length, 'records');
} else {
    console.log('❌ Expense data NOT available');
}

// Check for report container
const container = document.getElementById('report-employee');
if (container) {
    console.log('✅ Employee report container found');
} else {
    console.log('❌ Employee report container NOT found');
}

// Try to load the report manually
async function debugLoadEmployeeReport() {
    try {
        console.log('🚀 Attempting to load employee report...');
        
        // Import the module
        const { loadEmployeeReport } = await import('./reports/employee/employeeReport.js');
        
        // Load the report
        await loadEmployeeReport();
        
        console.log('✅ Employee report loaded successfully!');
        
    } catch (error) {
        console.error('❌ Failed to load employee report:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Add debug button
const debugBtn = document.createElement('button');
debugBtn.textContent = 'Debug Load Employee Report';
debugBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;';
debugBtn.onclick = debugLoadEmployeeReport;
document.body.appendChild(debugBtn);

console.log('💡 Debug button added. Click it to manually load the employee report.');

// Export for console debugging
window.debugEmployeeReport = {
    loadReport: debugLoadEmployeeReport,
    checkDependencies: () => {
        return {
            chartJs: typeof Chart !== 'undefined',
            transactionData: !!window.currentTransactionData,
            expenseData: !!window.currentExpenseData,
            container: !!document.getElementById('report-employee')
        };
    }
};