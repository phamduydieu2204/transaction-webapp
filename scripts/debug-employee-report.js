/**
 * Debug Employee Report
 * Test function để kiểm tra employee report có hoạt động không
 */

window.debugEmployeeReport = function() {
    // console.log('🔍 Debugging Employee Report...');
    
    console.log('Available functions:', {
        loadEmployeeReport: typeof window.loadEmployeeReport,
        initEmployeeReport: typeof window.initEmployeeReport,
        cleanupEmployeeReport: typeof window.cleanupEmployeeReport
    });
    
    console.log('Container check:', {
        reportEmployee: !!document.getElementById('report-employee'),
        reportPagesContainer: !!document.getElementById('report-pages-container')
    });
    
    console.log('Menu items:', {
        employeeMenuItem: !!document.querySelector('[data-report="employee"]'),
        menuItems: document.querySelectorAll('.menu-item').length
    });
    
    console.log('Global data:', {
        transactionData: window.currentTransactionData ? window.currentTransactionData.length : 'undefined',
        expenseData: window.currentExpenseData ? window.currentExpenseData.length : 'undefined',
        transactionList: window.transactionList ? window.transactionList.length : 'undefined',
        expenseList: window.expenseList ? window.expenseList.length : 'undefined'
    });
    
    // Try to manually trigger employee report
    console.log('🧪 Testing manual employee report load...');
    if (window.loadEmployeeReport) {
        window.loadEmployeeReport();
    } else {
        console.error('❌ loadEmployeeReport function not available');
    }
};

window.testEmployeeReportTemplate = async function() {
    console.log('🧪 Testing employee report template load...');
    
    try {
        const response = await fetch('./partials/tabs/report-pages/employee-report.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        // console.log('✅ Template loaded successfully, length:', html.length);
        console.log('Template preview:', html.substring(0, 200) + '...');
        
        return html;
    } catch (error) {
        console.error('❌ Template load failed:', error);
        return null;
    }
};

window.forceEmployeeReport = function() {
    // console.log('🔧 Force loading employee report...');
    
    // Hide all report pages
    const reportPages = document.querySelectorAll('.report-page');
    reportPages.forEach(page => page.classList.remove('active'));
    
    // Show employee report page
    const employeePage = document.getElementById('report-employee');
    if (employeePage) {
        employeePage.classList.add('active');
        // console.log('✅ Employee page shown');
        
        // Force load template
        window.testEmployeeReportTemplate().then(html => {
            if (html) {
                employeePage.innerHTML = html;
                // console.log('✅ Template injected directly');
            }
        });
        
    } else {
        console.error('❌ Employee page not found');
    }
    
    // Update menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const employeeMenuItem = document.querySelector('[data-report="employee"]');
    if (employeeMenuItem) {
        employeeMenuItem.classList.add('active');
        // console.log('✅ Employee menu item activated');
    }
};

// Employee report debug functions loaded:
// - debugEmployeeReport()
// - testEmployeeReportTemplate()
// - forceEmployeeReport()