/**
 * appInitializer.test.js
 * 
 * Unit tests cho application initialization functions
 * Kiểm tra khởi tạo ứng dụng, globals, UI, và data loading
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeGlobals,
  loadUserInfo,
  initializeUI,
  loadInitialData,
  setupErrorHandling,
  initializeConstants,
  setupDevelopmentMode,
  initializeApp,
  cleanupApp
} from '../../scripts/core/appInitializer.js';

// Mock các dependencies
vi.mock('../../scripts/constants.js', () => ({
  getConstants: vi.fn(() => ({
    API_BASE_URL: 'https://api.example.com',
    DEFAULT_CURRENCY: 'VND',
    ITEMS_PER_PAGE: 50
  }))
}));

vi.mock('../../scripts/updateAccountList.js', () => ({
  updateAccountList: vi.fn()
}));

vi.mock('../../scripts/fetchSoftwareList.js', () => ({
  fetchSoftwareList: vi.fn()
}));

vi.mock('../../scripts/loadTransactions.js', () => ({
  loadTransactions: vi.fn()
}));

vi.mock('../../scripts/updateTable.js', () => ({
  updateTable: vi.fn()
}));

vi.mock('../../scripts/initExpenseDropdowns.js', () => ({
  initExpenseDropdowns: vi.fn()
}));

vi.mock('../../scripts/renderExpenseStats.js', () => ({
  renderExpenseStats: vi.fn()
}));

vi.mock('../../scripts/updateTotalDisplay.js', () => ({
  initTotalDisplay: vi.fn()
}));

vi.mock('../../scripts/expenseQuickSearch.js', () => ({
  initExpenseQuickSearch: vi.fn()
}));

describe('appInitializer', () => {
  beforeEach(() => {
    // Reset window object
    global.window = {
      userInfo: null,
      currentEditIndex: -1,
      location: { href: '', hostname: 'localhost', search: '' },
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      addEventListener: vi.fn(),
      document: {
        getElementById: vi.fn(() => ({ textContent: '' }))
      },
      performance: {
        timing: {
          loadEventEnd: 2000,
          navigationStart: 1000
        }
      },
      navigator: {
        userAgent: 'test-agent'
      },
      console: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      },
      alert: vi.fn(),
      showResultModal: vi.fn(),
      clearInterval: vi.fn()
    };
    
    // Reset localStorage mock
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
    
    // Mock global localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeGlobals', () => {
    it('should initialize all global variables correctly', () => {
      initializeGlobals();

      expect(window.userInfo).toBe(null);
      expect(window.currentEditIndex).toBe(-1);
      expect(window.currentEditTransactionId).toBe(null);
      expect(window.transactionList).toEqual([]);
      expect(window.today).toBeInstanceOf(Date);
      expect(window.currentPage).toBe(1);
      expect(window.itemsPerPage).toBe(50);
      expect(window.softwareData).toEqual([]);
      expect(window.confirmCallback).toBe(null);
      expect(window.currentSoftwareName).toBe('');
      expect(window.currentSoftwarePackage).toBe('');
      expect(window.currentAccountName).toBe('');
      expect(window.isExpenseSearching).toBe(false);
      expect(window.expenseList).toEqual([]);
    });

    it('should format today date correctly', () => {
      const mockDate = new Date('2024-01-15T10:00:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      initializeGlobals();

      expect(window.todayFormatted).toBe('2024/01/15');
    });

    it('should handle single digit month and day with padding', () => {
      const mockDate = new Date('2024-03-05T10:00:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      initializeGlobals();

      expect(window.todayFormatted).toBe('2024/03/05');
    });
  });

  describe('loadUserInfo', () => {
    it('should load valid user data from localStorage', () => {
      const mockUserData = {
        tenNhanVien: 'Nguyễn Văn A',
        maNhanVien: 'NV001',
        vaiTro: 'Admin'
      };

      global.localStorage.getItem.mockReturnValue(JSON.stringify(mockUserData));

      const result = loadUserInfo();

      expect(result).toBe(true);
      expect(window.userInfo).toEqual(mockUserData);
      expect(global.localStorage.getItem).toHaveBeenCalledWith('employeeInfo');
    });

    it('should handle null user data', () => {
      global.localStorage.getItem.mockReturnValue(null);

      const result = loadUserInfo();

      expect(result).toBe(false);
      expect(window.userInfo).toBe(null);
      expect(window.location.href).toBe('index.html');
    });

    it('should handle invalid JSON data', () => {
      global.localStorage.getItem.mockReturnValue('invalid json');

      const result = loadUserInfo();

      expect(result).toBe(false);
      expect(window.userInfo).toBe(null);
      expect(window.location.href).toBe('index.html');
    });

    it('should handle empty string user data', () => {
      global.localStorage.getItem.mockReturnValue('');

      const result = loadUserInfo();

      expect(result).toBe(false);
      expect(window.userInfo).toBe(null);
      expect(window.location.href).toBe('index.html');
    });
  });

  describe('initializeUI', () => {
    it('should display user welcome message when user info exists', () => {
      window.userInfo = {
        tenNhanVien: 'Nguyễn Văn A',
        maNhanVien: 'NV001',
        vaiTro: 'Admin'
      };

      const mockElement = { textContent: '' };
      window.document.getElementById.mockReturnValue(mockElement);

      initializeUI();

      expect(window.document.getElementById).toHaveBeenCalledWith('userWelcome');
      expect(mockElement.textContent).toBe('Xin chào Nguyễn Văn A (NV001) - Admin');
    });

    it('should handle missing user welcome element', () => {
      window.userInfo = {
        tenNhanVien: 'Nguyễn Văn A',
        maNhanVien: 'NV001',
        vaiTro: 'Admin'
      };

      window.document.getElementById.mockReturnValue(null);

      expect(() => initializeUI()).not.toThrow();
    });

    it('should handle missing user info', () => {
      window.userInfo = null;
      
      const mockElement = { textContent: '' };
      window.document.getElementById.mockReturnValue(mockElement);

      initializeUI();

      expect(mockElement.textContent).toBe('');
    });
  });

  describe('setupErrorHandling', () => {
    it('should set up global error event listener', () => {
      setupErrorHandling();

      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should set up unhandled rejection event listener', () => {
      setupErrorHandling();

      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    it('should handle global errors correctly', () => {
      setupErrorHandling();

      // Get the error handler
      const errorHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )[1];

      const mockEvent = {
        error: new Error('Test error')
      };

      errorHandler(mockEvent);

      expect(window.showResultModal).toHaveBeenCalledWith(
        'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        false
      );
    });

    it('should handle unhandled promise rejections', () => {
      setupErrorHandling();

      // Get the rejection handler
      const rejectionHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'unhandledrejection'
      )[1];

      const mockEvent = {
        reason: 'Test rejection',
        preventDefault: vi.fn()
      };

      rejectionHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(window.showResultModal).toHaveBeenCalledWith(
        'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.',
        false
      );
    });
  });

  describe('initializeConstants', () => {
    it('should load constants successfully', () => {
      initializeConstants();

      expect(window.APP_CONSTANTS).toEqual({
        API_BASE_URL: 'https://api.example.com',
        DEFAULT_CURRENCY: 'VND',
        ITEMS_PER_PAGE: 50
      });
    });

    it('should handle constants loading error', async () => {
      const constantsModule = await import('../../scripts/constants.js');
      constantsModule.getConstants.mockImplementation(() => {
        throw new Error('Constants error');
      });

      expect(() => initializeConstants()).toThrow('Constants error');
    });
  });

  describe('setupDevelopmentMode', () => {
    it('should enable development mode for localhost', () => {
      window.location.hostname = 'localhost';

      setupDevelopmentMode();

      expect(window.DEBUG).toBe(true);
      expect(window.debugInfo).toEqual({
        version: '1.0.0',
        buildTime: expect.any(String),
        userAgent: expect.any(String)
      });
    });

    it('should enable development mode for 127.0.0.1', () => {
      window.location.hostname = '127.0.0.1';

      setupDevelopmentMode();

      expect(window.DEBUG).toBe(true);
    });

    it('should enable development mode with debug flag', () => {
      window.location.hostname = 'production.com';
      window.location.search = '?debug=true';

      setupDevelopmentMode();

      expect(window.DEBUG).toBe(true);
    });

    it('should not enable development mode in production', () => {
      window.location.hostname = 'production.com';
      window.location.search = '';

      setupDevelopmentMode();

      expect(window.DEBUG).toBeUndefined();
      expect(window.debugInfo).toBeUndefined();
    });

    it('should log performance timing in development mode', (done) => {
      window.location.hostname = 'localhost';

      setupDevelopmentMode();

      // Wait for setTimeout to execute
      setTimeout(() => {
        // Performance timing should be logged
        done();
      }, 10);
    });

    it('should handle missing performance API', () => {
      window.location.hostname = 'localhost';
      window.performance = null;

      expect(() => setupDevelopmentMode()).not.toThrow();
    });
  });

  describe('loadInitialData', () => {
    it('should load all data successfully', async () => {
      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      const updateAccountListModule = await import('../../scripts/updateAccountList.js');
      const loadTransactionsModule = await import('../../scripts/loadTransactions.js');
      const updateTableModule = await import('../../scripts/updateTable.js');
      const initExpenseDropdownsModule = await import('../../scripts/initExpenseDropdowns.js');
      const renderExpenseStatsModule = await import('../../scripts/renderExpenseStats.js');
      const initExpenseQuickSearchModule = await import('../../scripts/expenseQuickSearch.js');

      fetchSoftwareListModule.fetchSoftwareList.mockResolvedValue();
      updateAccountListModule.updateAccountList.mockResolvedValue();
      loadTransactionsModule.loadTransactions.mockResolvedValue();
      initExpenseDropdownsModule.initExpenseDropdowns.mockResolvedValue();

      await loadInitialData();

      expect(fetchSoftwareListModule.fetchSoftwareList).toHaveBeenCalled();
      expect(updateAccountListModule.updateAccountList).toHaveBeenCalled();
      expect(loadTransactionsModule.loadTransactions).toHaveBeenCalled();
      expect(updateTableModule.updateTable).toHaveBeenCalled();
      expect(initExpenseDropdownsModule.initExpenseDropdowns).toHaveBeenCalled();
      expect(renderExpenseStatsModule.renderExpenseStats).toHaveBeenCalled();
      expect(initExpenseQuickSearchModule.initExpenseQuickSearch).toHaveBeenCalled();
    });

    it('should handle software data loading error gracefully', async () => {
      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      const loadTransactionsModule = await import('../../scripts/loadTransactions.js');

      fetchSoftwareListModule.fetchSoftwareList.mockRejectedValue(new Error('Software error'));
      loadTransactionsModule.loadTransactions.mockResolvedValue();

      await expect(loadInitialData()).resolves.toBeUndefined();
      expect(loadTransactionsModule.loadTransactions).toHaveBeenCalled();
    });

    it('should handle transaction data loading error gracefully', async () => {
      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      const loadTransactionsModule = await import('../../scripts/loadTransactions.js');
      const initExpenseDropdownsModule = await import('../../scripts/initExpenseDropdowns.js');

      fetchSoftwareListModule.fetchSoftwareList.mockResolvedValue();
      loadTransactionsModule.loadTransactions.mockRejectedValue(new Error('Transaction error'));
      initExpenseDropdownsModule.initExpenseDropdowns.mockResolvedValue();

      await expect(loadInitialData()).resolves.toBeUndefined();
      expect(initExpenseDropdownsModule.initExpenseDropdowns).toHaveBeenCalled();
    });

    it('should handle expense features initialization error gracefully', async () => {
      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      const loadTransactionsModule = await import('../../scripts/loadTransactions.js');
      const initExpenseDropdownsModule = await import('../../scripts/initExpenseDropdowns.js');

      fetchSoftwareListModule.fetchSoftwareList.mockResolvedValue();
      loadTransactionsModule.loadTransactions.mockResolvedValue();
      initExpenseDropdownsModule.initExpenseDropdowns.mockRejectedValue(new Error('Expense error'));

      await expect(loadInitialData()).resolves.toBeUndefined();
    });
  });

  describe('initializeApp', () => {
    it('should initialize app successfully with authenticated user', async () => {
      // Mock user data
      window.localStorage.getItem.mockReturnValue(JSON.stringify({
        tenNhanVien: 'Test User',
        maNhanVien: 'TEST001',
        vaiTro: 'Admin'
      }));

      // Mock all dependencies
      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      fetchSoftwareListModule.fetchSoftwareList.mockResolvedValue();

      const result = await initializeApp();

      expect(result).toBe(true);
      expect(window.userInfo).toBeDefined();
      expect(window.APP_CONSTANTS).toBeDefined();
    });

    it('should fail initialization for unauthenticated user', async () => {
      window.localStorage.getItem.mockReturnValue(null);

      const result = await initializeApp();

      expect(result).toBe(false);
      expect(window.location.href).toBe('index.html');
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock user data
      window.localStorage.getItem.mockReturnValue(JSON.stringify({
        tenNhanVien: 'Test User',
        maNhanVien: 'TEST001',
        vaiTro: 'Admin'
      }));

      // Mock data loading error
      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      fetchSoftwareListModule.fetchSoftwareList.mockRejectedValue(new Error('Data loading error'));

      const result = await initializeApp();

      expect(result).toBe(false);
      expect(window.showResultModal).toHaveBeenCalledWith(
        'Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.',
        false
      );
    });

    it('should show alert when showResultModal is not available', async () => {
      window.showResultModal = undefined;
      
      window.localStorage.getItem.mockReturnValue(JSON.stringify({
        tenNhanVien: 'Test User',
        maNhanVien: 'TEST001',
        vaiTro: 'Admin'
      }));

      const fetchSoftwareListModule = await import('../../scripts/fetchSoftwareList.js');
      fetchSoftwareListModule.fetchSoftwareList.mockRejectedValue(new Error('Data loading error'));

      const result = await initializeApp();

      expect(result).toBe(false);
      expect(window.alert).toHaveBeenCalledWith(
        'Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.'
      );
    });
  });

  describe('cleanupApp', () => {
    it('should clear intervals and save activity', () => {
      window.refreshInterval = 123;
      window.userInfo = { name: 'Test User' };

      cleanupApp();

      expect(window.clearInterval).toHaveBeenCalledWith(123);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'lastActivity',
        expect.any(String)
      );
    });

    it('should handle cleanup without refresh interval', () => {
      window.refreshInterval = undefined;
      window.userInfo = { name: 'Test User' };

      expect(() => cleanupApp()).not.toThrow();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'lastActivity',
        expect.any(String)
      );
    });

    it('should handle cleanup without user info', () => {
      window.userInfo = null;

      expect(() => cleanupApp()).not.toThrow();
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage save error', () => {
      window.userInfo = { name: 'Test User' };
      window.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => cleanupApp()).not.toThrow();
    });
  });

  describe('Event listener setup', () => {
    it('should setup beforeunload event listener', () => {
      // Re-import module to trigger event listener setup
      delete require.cache[require.resolve('../../scripts/core/appInitializer.js')];
      
      // Reset window mock
      global.window = {
        addEventListener: vi.fn()
      };

      require('../../scripts/core/appInitializer.js');

      expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should not setup event listener when window is undefined', () => {
      const originalWindow = global.window;
      global.window = undefined;

      // Re-import module
      delete require.cache[require.resolve('../../scripts/core/appInitializer.js')];
      
      expect(() => {
        require('../../scripts/core/appInitializer.js');
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});