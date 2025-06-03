/**
 * authManager.basic.test.js
 * 
 * Basic unit tests cho authentication và session management
 * Coverage-focused test bản đơn giản
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
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
    user: null
  }))
}));

vi.mock('../../scripts/core/navigationManager.js', () => ({
  showTab: vi.fn()
}));

describe('authManager - Basic Coverage', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();

    // Mock window
    global.window = {
      confirm: vi.fn()
    };

    // Mock Date.now
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should return true for valid user', async () => {
      const userData = { username: 'test', name: 'Test User' };
      const stateManagerModule = await import('../../scripts/core/stateManager.js');

      const result = login(userData);

      expect(result).toBe(true);
      expect(stateManagerModule.updateState).toHaveBeenCalledWith({
        user: userData,
        isAuthenticated: true
      });
      expect(Storage.prototype.setItem).toHaveBeenCalled();
    });

    it('should return false for invalid user', () => {
      expect(login(null)).toBe(false);
      expect(login({})).toBe(false);
      expect(login({ name: 'Test' })).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear state and storage', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');

      logout();

      expect(stateManagerModule.updateState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        transactions: [],
        expenses: [],
        currentPage: 1
      });
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('authData');
    });
  });

  describe('isAuthenticated', () => {
    it('should return authentication status', async () => {
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      
      stateManagerModule.getState.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'test' }
      });

      expect(isAuthenticated()).toBe(true);

      stateManagerModule.getState.mockReturnValue({
        isAuthenticated: false,
        user: null
      });

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = { username: 'test' };
      const stateManagerModule = await import('../../scripts/core/stateManager.js');
      stateManagerModule.getState.mockReturnValue({ user: mockUser });

      expect(getCurrentUser()).toEqual(mockUser);
    });
  });

  describe('extendSession', () => {
    it('should extend valid session', () => {
      const validAuth = {
        user: { username: 'test' },
        expiryTime: Date.now() + 3600000
      };
      Storage.prototype.getItem.mockReturnValue(JSON.stringify(validAuth));

      extendSession();

      expect(Storage.prototype.setItem).toHaveBeenCalled();
    });

    it('should not extend expired session', () => {
      const expiredAuth = {
        user: { username: 'test' },
        expiryTime: Date.now() - 3600000
      };
      Storage.prototype.getItem.mockReturnValue(JSON.stringify(expiredAuth));

      extendSession();

      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('should handle missing auth data', () => {
      Storage.prototype.getItem.mockReturnValue(null);

      expect(() => extendSession()).not.toThrow();
    });
  });

  describe('checkSessionExpiry', () => {
    it('should show warning for expiring session', () => {
      const expiringAuth = {
        expiryTime: Date.now() + 300000 // 5 minutes
      };
      Storage.prototype.getItem.mockReturnValue(JSON.stringify(expiringAuth));
      window.confirm.mockReturnValue(true);

      checkSessionExpiry();

      expect(window.confirm).toHaveBeenCalled();
      expect(Storage.prototype.setItem).toHaveBeenCalled();
    });

    it('should not show warning for fresh session', () => {
      const freshAuth = {
        expiryTime: Date.now() + 7200000 // 2 hours
      };
      Storage.prototype.getItem.mockReturnValue(JSON.stringify(freshAuth));

      checkSessionExpiry();

      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should handle missing expiry time', () => {
      const invalidAuth = { user: { username: 'test' } };
      Storage.prototype.getItem.mockReturnValue(JSON.stringify(invalidAuth));

      expect(() => checkSessionExpiry()).not.toThrow();
    });
  });
});