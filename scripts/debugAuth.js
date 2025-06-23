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

  });

      });
    } catch (e) {
      console.log('📄 Invalid JSON in authData');
    }
  }
  
  // Check state
  if (window.getState) {
    const state = window.getState();
    console.log('📄 State:', {

  });

    });
  }

  });

    });
  }
  
  // Redirect to login
  window.location.reload();
}

// Make available globally for debugging
window.debugAuth = debugAuth;
window.forceLogout = forceLogout;