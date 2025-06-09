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

// Make available globally
window.debugEmployeeBadge = debugEmployeeBadge;