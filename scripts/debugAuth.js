/**
 * Debug Auth - Kiểm tra và xóa session
 */

export function debugAuth() {
  console.log('🔍 === AUTH DEBUG START ===');
  
  // Check localStorage
  const authData = localStorage.getItem('authData');
  console.log('📄 localStorage authData:', authData ? 'Found' : 'Not found');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('📄 Auth data:', {
        user: parsed.user?.tenNhanVien || 'Unknown',
        loginTime: new Date(parsed.loginTime).toLocaleString(),
        expiryTime: new Date(parsed.expiryTime).toLocaleString(),
        isExpired: Date.now() > parsed.expiryTime
      });
    } catch (e) {
      console.log('📄 Invalid JSON in authData');
    }
  }
  
  // Check state
  if (window.getState) {
    const state = window.getState();
    console.log('📄 State:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user?.tenNhanVien || 'None'
    });
  }
  
  console.log('🔍 === AUTH DEBUG END ===');
}

export function forceLogout() {
  console.log('🚪 Force logout...');
  
  // Clear localStorage
  localStorage.removeItem('authData');
  localStorage.clear();
  
  // Clear state if available
  if (window.updateState) {
    window.updateState({
      user: null,
      isAuthenticated: false,
      transactions: [],
      expenses: []
    });
  }
  
  // Redirect to login
  window.location.reload();
}

// Make available globally for debugging
window.debugAuth = debugAuth;
window.forceLogout = forceLogout;