/**
 * authManager.js
 * 
 * Authentication and session management
 * Handles login/logout, session persistence, and user management
 */

import { updateState, getState } from './stateManager.js';
import { showTab } from './navigationManager.js';

// Auth configuration
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const AUTH_STORAGE_KEY = 'authData';

/**
 * Initialize authentication
 */
export function initializeAuth() {
    // Check for existing session
    const savedAuth = loadAuthFromStorage();
    if (savedAuth && isSessionValid(savedAuth)) {
        restoreSession(savedAuth);
    }
    
    // Set up periodic session check
    setInterval(checkSessionValidity, 60000); // Check every minute
}

/**
 * Handle user login
 */
export function login(userData) {
    if (!userData || !userData.username) {
        console.error('Invalid user data for login');
        return false;
    }
    
    const authData = {
        user: userData,
        loginTime: Date.now(),
        expiryTime: Date.now() + SESSION_TIMEOUT
    };
    
    // Update state
    updateState({ 
        user: userData,
        isAuthenticated: true 
    });
    
    // Save to storage
    saveAuthToStorage(authData);
    
    // Show main content
    showTab('list');
    
    console.log('User logged in:', userData.username);
    return true;
}

/**
 * Handle user logout
 */
export function logout() {
    // Clear state
    updateState({ 
        user: null,
        isAuthenticated: false,
        transactions: [],
        expenses: [],
        currentPage: 1
    });
    
    // Clear storage
    clearAuthFromStorage();
    
    // Show login tab
    showTab('messages');
    
    // Clear any cached data
    clearCache();
    
    console.log('User logged out');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    const state = getState();
    return state.isAuthenticated && state.user !== null;
}

/**
 * Get current user
 */
export function getCurrentUser() {
    const state = getState();
    return state.user;
}

/**
 * Check session validity
 */
function checkSessionValidity() {
    const authData = loadAuthFromStorage();
    
    if (!authData || !isSessionValid(authData)) {
        if (isAuthenticated()) {
            console.warn('Session expired, logging out');
            logout();
        }
    }
}

/**
 * Validate session data
 */
function isSessionValid(authData) {
    if (!authData || !authData.expiryTime) {
        return false;
    }
    
    return Date.now() < authData.expiryTime;
}

/**
 * Restore session from storage
 */
function restoreSession(authData) {
    if (authData && authData.user) {
        updateState({ 
            user: authData.user,
            isAuthenticated: true 
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
function loadAuthFromStorage() {
    try {
        const data = localStorage.getItem(AUTH_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
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
export function extendSession() {
    const authData = loadAuthFromStorage();
    
    if (authData && isSessionValid(authData)) {
        authData.expiryTime = Date.now() + SESSION_TIMEOUT;
        saveAuthToStorage(authData);
    }
}

/**
 * Handle session expiry warning
 */
export function checkSessionExpiry() {
    const authData = loadAuthFromStorage();
    
    if (!authData || !authData.expiryTime) {
        return;
    }
    
    const timeRemaining = authData.expiryTime - Date.now();
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes
    
    if (timeRemaining > 0 && timeRemaining < WARNING_TIME) {
        showSessionExpiryWarning(timeRemaining);
    }
}

/**
 * Show session expiry warning
 */
function showSessionExpiryWarning(timeRemaining) {
    const minutes = Math.floor(timeRemaining / 60000);
    
    if (window.confirm(`Phiên làm việc sẽ hết hạn trong ${minutes} phút. Bạn có muốn gia hạn không?`)) {
        extendSession();
    }
}

// Make functions available globally for backward compatibility
window.login = login;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.extendSession = extendSession;