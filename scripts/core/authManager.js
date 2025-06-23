/**
 * authManager.js
 * 
 * Authentication and session management
 * Handles login/logout, session persistence, and user management
 */
    };
    
    // Update state
  });

    });
    
    // Save to storage
    saveAuthToStorage(authData);
    
    // Show main content
    switchToTab('giao-dich');
    
    console.log('User logged in:', userData.username);
  });

    });
    
    // Clear storage
  });

        });
        
        console.log('Session restored for:', authData.user.username);
    }
}

/**
 * Save auth data to storage
 */
function saveAuthToStorage(authData) {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
        console.error('Failed to save auth data:', error);
    }
}

/**
 * Load auth data from storage
 */
  } catch (error) {
        console.error('Failed to load auth data:', error);
        return null;
    }
}

/**
 * Clear auth data from storage
 */
function clearAuthFromStorage() {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
        console.error('Failed to clear auth data:', error);
    }
}

/**
 * Clear cached data
 */
function clearCache() {
    // Clear any other cached data
    const keysToRemove = [
        'cachedTransactions',
        'cachedExpenses',
        'lastSearch',
        'filters'
    ];
    
    keysToRemove.forEach(key => {
        try {
            localStorage.removeItem(key);
  } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
        }
    });
}

/**
 * Update session expiry
 */
  });

            });
            return true;
        }
        return false;
    }
};

// Make functions available globally for backward compatibility
window.login = login;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.extendSession = extendSession;