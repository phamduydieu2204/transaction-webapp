/**
 * authManager.js
 * 
 * Authentication and session management
 * Handles login/logout, session persistence, and user management
 */

export const authManager = {
    currentUser: null,
    sessionTimeout: null,
    
    async login(email, password) {
        try {
            showProcessingModal('Đang đăng nhập...');
            
            const response = await fetch(`${PROXY_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            closeProcessingModal();

            if (result.success) {
                this.currentUser = {
                    email: email,
                    sessionId: result.sessionId,
                    loginTime: new Date().toISOString(),
                    accountInfo: result.accountInfo
                };
                
                this.saveSession();
                this.startSessionTimeout();
                
                showResultModal(
                    'Đăng nhập thành công!',
                    `Chào mừng ${email}`,
                    'success'
                );
                
                return { success: true, user: this.currentUser };
            } else {
                showResultModal('Lỗi đăng nhập', result.message, 'error');
                return { success: false, message: result.message };
            }
        } catch (error) {
            closeProcessingModal();
            console.error('Login error:', error);
            showResultModal(
                'Lỗi kết nối',
                'Không thể kết nối đến server',
                'error'
            );
            return { success: false, message: 'Lỗi kết nối' };
        }
    },

    logout() {
        try {
            this.clearSession();
            this.clearSessionTimeout();
            this.currentUser = null;
            
            localStorage.removeItem('currentTransactions');
            localStorage.removeItem('currentPage');
            localStorage.removeItem('searchKeyword');
            
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'index.html';
        }
    },

    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('userSession', JSON.stringify({
                email: this.currentUser.email,
                sessionId: this.currentUser.sessionId,
                loginTime: this.currentUser.loginTime,
                accountInfo: this.currentUser.accountInfo
            }));
        }
    },

    loadSession() {
        try {
            const savedSession = localStorage.getItem('userSession');
            if (savedSession) {
                const sessionData = JSON.parse(savedSession);
                
                if (this.isSessionValid(sessionData)) {
                    this.currentUser = sessionData;
                    this.startSessionTimeout();
                    return true;
                }
            }
        } catch (error) {
            console.error('Error loading session:', error);
        }
        
        this.clearSession();
        return false;
    },

    clearSession() {
        localStorage.removeItem('userSession');
        this.currentUser = null;
    },

    isSessionValid(sessionData) {
        if (!sessionData || !sessionData.loginTime) {
            return false;
        }

        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const timeDiff = now - loginTime;
        const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours

        return timeDiff < maxSessionTime;
    },

    startSessionTimeout() {
        this.clearSessionTimeout();
        
        this.sessionTimeout = setTimeout(() => {
            showResultModal(
                'Phiên đăng nhập hết hạn',
                'Vui lòng đăng nhập lại',
                'warning'
            );
            
            setTimeout(() => {
                this.logout();
            }, 3000);
        }, 24 * 60 * 60 * 1000); // 24 hours
    },

    clearSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    },

    async refreshSession() {
        if (!this.currentUser) {
            return false;
        }

        try {
            const response = await fetch(`${PROXY_URL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.currentUser.email,
                    sessionId: this.currentUser.sessionId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentUser.sessionId = result.sessionId;
                this.currentUser.loginTime = new Date().toISOString();
                this.saveSession();
                this.startSessionTimeout();
                return true;
            }
        } catch (error) {
            console.error('Session refresh error:', error);
        }
        
        return false;
    },

    requireAuth() {
        if (!this.currentUser) {
            showResultModal(
                'Chưa đăng nhập',
                'Vui lòng đăng nhập để tiếp tục',
                'warning'
            );
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            return false;
        }
        
        return true;
    },

    getUserInfo() {
        return this.currentUser;
    },

    updateAccountInfo(accountInfo) {
        if (this.currentUser) {
            this.currentUser.accountInfo = accountInfo;
            this.saveSession();
        }
    }
};

// Make authManager globally available for backward compatibility
window.authManager = authManager;

// Export individual functions for convenience
export const {
    login,
    logout,
    saveSession,
    loadSession,
    clearSession,
    isSessionValid,
    requireAuth,
    getUserInfo,
    updateAccountInfo,
    refreshSession
} = authManager;