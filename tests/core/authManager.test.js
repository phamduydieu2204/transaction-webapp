/**
 * authManager.test.js
 * 
 * Unit tests cho authentication và session management
 * Kiểm tra login/logout, session persistence, và user management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeAuth,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  extendSession,
  checkSessionExpiry
} from '../../scripts/core/authManager.js';

// Mock dependencies
vi.mock('../../scripts/core/stateManager.js', () => ({
  updateState: vi.fn(),
  getState: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    transactions: [],
    expenses: [],
    currentPage: 1
  }))
}));

vi.mock('../../scripts/core/navigationManager.js', () => ({
  showTab: vi.fn()
}));

describe('authManager', () => {
  beforeEach(() => {
    // Reset localStorage mock
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();

    // Reset window mock
    global.window = {
      confirm: vi.fn(),
      console: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    };

    // Mock Date.now to return consistent timestamp
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00

    // Reset modules
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeAuth', () => {
    it('should initialize auth without existing session', () => {
      Storage.prototype.getItem.mockReturnValue(null);
      vi.spyOn(global, 'setInterval').mockImplementation(() => {});

      initializeAuth();

      expect(Storage.prototype.getItem).toHaveBeenCalledWith('authData');
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it('should restore valid existing session', async () => {
      const validAuthData = {
        user: { username: 'testuser', name: 'Test User' },
        loginTime: Date.now() - 3600000, // 1 hour ago
        expiryTime: Date.now() + 82800000 // 23 hours from now
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(validAuthData));
      vi.spyOn(global, 'setInterval').mockImplementation(() => {});

      const stateManagerModule = await import('../../scripts/core/stateManager.js');

      initializeAuth();

      expect(stateManagerModule.updateState).toHaveBeenCalledWith({
        user: validAuthData.user,
        isAuthenticated: true
      });
    });

    it('should not restore expired session', async () => {
      const expiredAuthData = {
        user: { username: 'testuser', name: 'Test User' },
        loginTime: Date.now() - 86400000, // 24 hours ago
        expiryTime: Date.now() - 3600000 // 1 hour ago (expired)
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(expiredAuthData));
      vi.spyOn(global, 'setInterval').mockImplementation(() => {});

      const stateManagerModule = await import('../../scripts/core/stateManager.js');

      initializeAuth();

      expect(stateManagerModule.updateState).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON in storage', () => {
      Storage.prototype.getItem.mockReturnValue('invalid json');
      vi.spyOn(global, 'setInterval').mockImplementation(() => {});

      expect(() => initializeAuth()).not.toThrow();
    });
  });

  describe('login', () => {
    it('should login with valid user data', async () => {
      const userData = {
        username: 'testuser',
        name: 'Test User',
        role: 'admin'
      };

      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      const navigationManagerModule = await import('../../scripts/core/navigationManager.js');

      const result = login(userData);

      expect(result).toBe(true);
      expect(stateManagerModule.updateState).toHaveBeenCalledWith({
        user: userData,
        isAuthenticated: true
      });
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'authData',
        expect.stringContaining('"user"')
      );
      expect(navigationManagerModule.showTab).toHaveBeenCalledWith('list');
    });

    it('should reject login with invalid user data', () => {
      const result1 = login(null);
      const result2 = login({});
      const result3 = login({ name: 'Test User' }); // missing username

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should save correct auth data structure', () => {
      const userData = { username: 'testuser', name: 'Test User' };

      login(userData);

      const savedData = JSON.parse(Storage.prototype.setItem.mock.calls[0][1]);
      
      expect(savedData).toEqual({
        user: userData,
        loginTime: 1640995200000,
        expiryTime: 1640995200000 + 24 * 60 * 60 * 1000 // 24 hours later
      });
    });

    it('should handle localStorage error gracefully', () => {
      const userData = { username: 'testuser', name: 'Test User' };
      
      Storage.prototype.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = login(userData);

      expect(result).toBe(true); // Should still succeed
      expect(console.error).toBeUndefined(); // Error should be logged but not thrown
    });
  });

  describe('logout', () => {
    it('should clear state and storage on logout', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      const navigationManagerModule = await import('../../scripts/core/navigationManager.js');

      logout();

      expect(stateManagerModule.updateState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        transactions: [],
        expenses: [],
        currentPage: 1
      });
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('authData');
      expect(navigationManagerModule.showTab).toHaveBeenCalledWith('messages');
    });

    it('should clear cached data on logout', () => {
      logout();

      const expectedKeys = [
        'authData',
        'cachedTransactions',
        'cachedExpenses',
        'lastSearch',
        'filters'
      ];

      expectedKeys.forEach(key => {
        expect(Storage.prototype.removeItem).toHaveBeenCalledWith(key);
      });
    });

    it('should handle localStorage errors during logout', () => {
      Storage.prototype.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => logout()).not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      stateManagerModule.getState.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser' }
      });

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      stateManagerModule.getState.mockReturnValue({
        isAuthenticated: false,
        user: null
      });

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when user is null despite authenticated flag', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      stateManagerModule.getState.mockReturnValue({
        isAuthenticated: true,
        user: null
      });

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from state', async () => {
      const mockUser = { username: 'testuser', name: 'Test User' };
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      stateManagerModule.getState.mockReturnValue({ user: mockUser });

      const result = getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      stateManagerModule.getState.mockReturnValue({ user: null });

      const result = getCurrentUser();

      expect(result).toBe(null);
    });
  });

  describe('extendSession', () => {
    it('should extend valid session', () => {
      const validAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 3600000,
        expiryTime: Date.now() + 3600000
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(validAuthData));

      extendSession();

      expect(Storage.prototype.setItem).toHaveBeenCalled();
      
      const savedData = JSON.parse(Storage.prototype.setItem.mock.calls[0][1]);
      expect(savedData.expiryTime).toBe(Date.now() + 24 * 60 * 60 * 1000);
    });

    it('should not extend expired session', () => {
      const expiredAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 86400000,
        expiryTime: Date.now() - 3600000
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(expiredAuthData));

      extendSession();

      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('should handle missing auth data', () => {
      Storage.prototype.getItem.mockReturnValue(null);

      expect(() => extendSession()).not.toThrow();
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('should handle invalid auth data', () => {
      Storage.prototype.getItem.mockReturnValue('invalid json');

      expect(() => extendSession()).not.toThrow();
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });
  });

  describe('checkSessionExpiry', () => {
    it('should show warning when session expires soon', () => {
      const soonToExpireAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 86100000, // 23h55m ago
        expiryTime: Date.now() + 300000 // 5 minutes from now
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(soonToExpireAuthData));
      window.confirm.mockReturnValue(true);

      checkSessionExpiry();

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Phiên làm việc sẽ hết hạn trong')
      );
      expect(Storage.prototype.setItem).toHaveBeenCalled(); // Session extended
    });

    it('should not show warning for fresh session', () => {
      const freshAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 3600000,
        expiryTime: Date.now() + 20 * 60 * 60 * 1000 // 20 hours from now
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(freshAuthData));

      checkSessionExpiry();

      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should not extend session when user declines', () => {
      const soonToExpireAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 86100000,
        expiryTime: Date.now() + 300000
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(soonToExpireAuthData));
      window.confirm.mockReturnValue(false);

      checkSessionExpiry();

      expect(window.confirm).toHaveBeenCalled();
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('should handle missing auth data gracefully', () => {
      Storage.prototype.getItem.mockReturnValue(null);

      expect(() => checkSessionExpiry()).not.toThrow();
      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should handle auth data without expiry time', () => {
      const invalidAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now()
        // missing expiryTime
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(invalidAuthData));

      expect(() => checkSessionExpiry()).not.toThrow();
      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should handle expired session in warning check', () => {
      const expiredAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 86400000,
        expiryTime: Date.now() - 3600000 // already expired
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(expiredAuthData));

      expect(() => checkSessionExpiry()).not.toThrow();
      expect(window.confirm).not.toHaveBeenCalled();
    });
  });

  describe('Session validation edge cases', () => {
    it('should handle session at exact expiry time', () => {
      const exactExpiryAuthData = {
        user: { username: 'testuser' },
        loginTime: Date.now() - 86400000,
        expiryTime: Date.now() // expires right now
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(exactExpiryAuthData));
      vi.spyOn(global, 'setInterval').mockImplementation(() => {});

      initializeAuth();

      const { updateState } = require('../../scripts/core/stateManager.js');
      expect(updateState).not.toHaveBeenCalled();
    });

    it('should handle very long session times', () => {
      const longSessionData = {
        user: { username: 'testuser' },
        loginTime: Date.now(),
        expiryTime: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(longSessionData));

      extendSession();

      expect(Storage.prototype.setItem).toHaveBeenCalled();
    });

    it('should handle negative timestamps gracefully', () => {
      const invalidTimestampData = {
        user: { username: 'testuser' },
        loginTime: -1000,
        expiryTime: -500
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify(invalidTimestampData));

      expect(() => {
        checkSessionExpiry();
        extendSession();
      }).not.toThrow();
    });
  });

  describe('Global function bindings', () => {
    it('should make auth functions globally available', () => {
      // Re-import module to trigger global bindings
      delete require.cache[require.resolve('../../scripts/core/authManager.js')];
      
      global.window = {};
      require('../../scripts/core/authManager.js');

      expect(window.login).toBeDefined();
      expect(window.logout).toBeDefined();
      expect(window.isAuthenticated).toBeDefined();
      expect(window.getCurrentUser).toBeDefined();
      expect(window.extendSession).toBeDefined();
    });
  });
});