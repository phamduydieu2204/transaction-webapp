/**
 * appInitializer.basic.test.js
 * 
 * Basic unit tests cho application initialization functions
 * Coverage-focused test bản đơn giản
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeGlobals,
  loadUserInfo,
  initializeConstants,
  setupDevelopmentMode,
  cleanupApp
} from '../../scripts/core/appInitializer.js';

// Mock các dependencies
vi.mock('../../scripts/constants.js', () => ({
  getConstants: vi.fn(() => ({
    API_BASE_URL: 'https://api.example.com',
    DEFAULT_CURRENCY: 'VND'
  }))
}));

describe('appInitializer - Basic Coverage', () => {
  beforeEach(() => {
    // Mock global localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    // Mock window object
    global.window = {
      userInfo: null,
      location: { href: '', hostname: 'localhost', search: '' },
      APP_CONSTANTS: null,
      DEBUG: undefined,
      debugInfo: undefined,
      refreshInterval: undefined,
      clearInterval: vi.fn(),
      performance: {
        timing: {
          loadEventEnd: 2000,
          navigationStart: 1000
        }
      },
      navigator: {
        userAgent: 'test-agent'
      }
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeGlobals', () => {
    it('should set basic global variables', () => {
      initializeGlobals();

      expect(window.userInfo).toBe(null);
      expect(window.currentEditIndex).toBe(-1);
      expect(window.transactionList).toEqual([]);
      expect(window.currentPage).toBe(1);
      expect(window.itemsPerPage).toBe(50);
    });

    it('should format date correctly', () => {
      initializeGlobals();
      
      expect(window.todayFormatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });
  });

  describe('loadUserInfo', () => {
    it('should return true for valid user data', () => {
      const userData = { tenNhanVien: 'Test', maNhanVien: 'T001', vaiTro: 'Admin' };
      global.localStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = loadUserInfo();

      expect(result).toBe(true);
      expect(window.userInfo).toEqual(userData);
    });

    it('should return false for null data', () => {
      global.localStorage.getItem.mockReturnValue(null);

      const result = loadUserInfo();

      expect(result).toBe(false);
      expect(window.location.href).toBe('index.html');
    });

    it('should handle JSON parse errors', () => {
      global.localStorage.getItem.mockReturnValue('invalid json');

      const result = loadUserInfo();

      expect(result).toBe(false);
      expect(window.userInfo).toBe(null);
    });
  });

  describe('initializeConstants', () => {
    it('should load constants', () => {
      initializeConstants();

      expect(window.APP_CONSTANTS).toEqual({
        API_BASE_URL: 'https://api.example.com',
        DEFAULT_CURRENCY: 'VND'
      });
    });
  });

  describe('setupDevelopmentMode', () => {
    it('should enable debug mode for localhost', () => {
      window.location.hostname = 'localhost';

      setupDevelopmentMode();

      expect(window.DEBUG).toBe(true);
      expect(window.debugInfo).toBeDefined();
    });

    it('should not enable debug mode in production', () => {
      window.location.hostname = 'production.com';
      window.location.search = '';

      setupDevelopmentMode();

      expect(window.DEBUG).toBeUndefined();
      expect(window.debugInfo).toBeUndefined();
    });
  });

  describe('cleanupApp', () => {
    it('should clear intervals when present', () => {
      window.refreshInterval = 123;
      window.userInfo = { name: 'Test' };

      cleanupApp();

      expect(window.clearInterval).toHaveBeenCalledWith(123);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'lastActivity',
        expect.any(String)
      );
    });

    it('should handle missing user info', () => {
      window.userInfo = null;

      expect(() => cleanupApp()).not.toThrow();
    });

    it('should handle localStorage errors', () => {
      window.userInfo = { name: 'Test' };
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => cleanupApp()).not.toThrow();
    });
  });
});