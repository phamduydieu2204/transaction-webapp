/**
 * Debug Employee Badge Display
 */

export function debugEmployeeBadge() {
  console.log('🔍 === EMPLOYEE BADGE DEBUG START ===');
  
  // Check if transactions have maNhanVien field
  if (window.transactionList && window.transactionList.length > 0) {
    const firstTransaction = window.transactionList[0];
    console.log('📄 First transaction data:', {
      transactionId: firstTransaction.transactionId,
      maNhanVien: firstTransaction.maNhanVien,
      tenNhanVien: firstTransaction.tenNhanVien,
      employeeCode: firstTransaction.employeeCode,
      employeeName: firstTransaction.employeeName,
      staffCode: firstTransaction.staffCode,
      staffName: firstTransaction.staffName,
      user: firstTransaction.user,
      creator: firstTransaction.creator,
      allKeys: Object.keys(firstTransaction)
    });
    
    // Check ALL possible employee-related fields
    const employeeFields = Object.keys(firstTransaction).filter(key => 
      key.toLowerCase().includes('nhan') || 
      key.toLowerCase().includes('emp') || 
      key.toLowerCase().includes('staff') || 
      key.toLowerCase().includes('user') || 
      key.toLowerCase().includes('create') ||
      key.toLowerCase().includes('ma')
    );
    console.log('📄 Possible employee fields:', employeeFields);
    
    // Check multiple transactions
    const sampleTransactions = window.transactionList.slice(0, 3);
    console.log('📄 Sample transaction employee data:');
    sampleTransactions.forEach((t, i) => {
      console.log(`  Transaction ${i + 1}:`, {
        id: t.transactionId,
        maNhanVien: t.maNhanVien,
        tenNhanVien: t.tenNhanVien,
        employeeCode: t.employeeCode,
        employeeName: t.employeeName,
        staffCode: t.staffCode,
        user: t.user
      });
    });
  } else {
    console.log('❌ No transaction data found');
  }
  
  // Check DOM elements
  const infoCells = document.querySelectorAll('.info-cell-container');
  console.log('📄 Found info cells:', infoCells.length);
  
  // Check for table rows
  const tableRows = document.querySelectorAll('#transactionTable tbody tr');
  console.log('📄 Found table rows:', tableRows.length);
  
  // Check table body specifically
  const tableBody = document.querySelector('#transactionTable tbody');
  console.log('📄 Table body exists:', !!tableBody);
  if (tableBody) {
    console.log('📄 Table body HTML preview:', tableBody.innerHTML.substring(0, 500));
  }
  
  const employeeBadges = document.querySelectorAll('.employee-badge');
  console.log('📄 Found employee badges:', employeeBadges.length);
  
  if (employeeBadges.length > 0) {
    employeeBadges.forEach((badge, i) => {
      console.log(`  Badge ${i + 1}:`, {
        text: badge.textContent,
        visible: window.getComputedStyle(badge).display !== 'none',
        styles: {
          position: window.getComputedStyle(badge).position,
          top: window.getComputedStyle(badge).top,
          right: window.getComputedStyle(badge).right,
          fontSize: window.getComputedStyle(badge).fontSize
        }
      });
    });
  }
  
  // Check CSS
  const cssLink = document.querySelector('link[href*="employee-badge.css"]');
  console.log('📄 Employee badge CSS loaded:', !!cssLink);
  
  console.log('🔍 === EMPLOYEE BADGE DEBUG END ===');
}

// Debug after table render
export function debugEmployeeBadgeAfterRender() {
  console.log('🔍 === EMPLOYEE BADGE DEBUG AFTER RENDER ===');
  
  // Wait a bit for DOM to settle
  setTimeout(() => {
    debugEmployeeBadge();
  }, 100);
}

// Force table update and then debug
export function forceTableUpdateAndDebug() {
  console.log('🔄 Forcing table update and debug...');
  
  // Trigger table update if possible
  if (window.transactionList && window.formatDate) {
    const currentPage = window.currentPage || 1;
    const itemsPerPage = window.itemsPerPage || 10;
    
    console.log('🔄 Updating table with current data...');
    
    // Try to use the correct update function
    const updateFn = window.updateTableUltraFast || window.updateTable;
    if (updateFn && typeof updateFn === 'function') {
      console.log('🔄 Using update function:', updateFn.name);
      updateFn(
        window.transactionList, 
        currentPage, 
        itemsPerPage, 
        window.formatDate, 
        window.editTransaction, 
        window.deleteTransaction, 
        window.viewTransaction
      );
    } else {
      console.log('❌ No update function found');
    }
    
    // Debug after update
    setTimeout(() => {
      debugEmployeeBadge();
    }, 200);
  } else {
    console.log('❌ Cannot force table update - missing dependencies');
    debugEmployeeBadge();
  }
}

// Test employee colors
export function testEmployeeColors() {
  console.log('🎨 === EMPLOYEE COLOR TEST ===');
  
  const testCodes = ['ADMIN', 'NV01', 'NV02', 'MANAGER', 'SALE01', 'TECH01', 'SUPPORT', 'QA01', 'DEV01', 'HR01'];
  
  testCodes.forEach(code => {
    // Generate consistent color for employee code
    const getEmployeeColor = (code) => {
      const colors = [
        { bg: '#007bff', border: '#0056b3', name: 'Blue' },
        { bg: '#28a745', border: '#1e7e34', name: 'Green' },
        { bg: '#dc3545', border: '#bd2130', name: 'Red' },
        { bg: '#fd7e14', border: '#e65100', name: 'Orange' },
        { bg: '#6f42c1', border: '#5a3597', name: 'Purple' },
        { bg: '#20c997', border: '#17a085', name: 'Teal' },
        { bg: '#e83e8c', border: '#d21b7c', name: 'Pink' },
        { bg: '#6c757d', border: '#545b62', name: 'Gray' },
        { bg: '#17a2b8', border: '#138496', name: 'Cyan' },
        { bg: '#ffc107', border: '#d39e00', name: 'Yellow' },
      ];
      
      let hash = 0;
      for (let i = 0; i < code.length; i++) {
        const char = code.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      const colorIndex = Math.abs(hash) % colors.length;
      const color = colors[colorIndex];
      const textColor = colorIndex === 9 ? '#000' : '#fff';
      
      return { ...color, textColor, index: colorIndex };
    };
    
    const color = getEmployeeColor(code);
    console.log(`🎨 ${code}: ${color.name} (${color.bg}) - Index: ${color.index}`);
  });
  
  console.log('🎨 === COLOR TEST END ===');
}

// Make available globally
window.debugEmployeeBadge = debugEmployeeBadge;
window.debugEmployeeBadgeAfterRender = debugEmployeeBadgeAfterRender;
window.forceTableUpdateAndDebug = forceTableUpdateAndDebug;
window.testEmployeeColors = testEmployeeColors;