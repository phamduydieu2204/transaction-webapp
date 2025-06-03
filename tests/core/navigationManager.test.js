/**
 * navigationManager.test.js
 * 
 * Unit tests cho navigation and tab management system
 * Kiểm tra tab switching, routing, URL management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('navigationManager', () => {
  let mockElements = {};
  let mockTabButtons = [];
  let mockTabContents = [];
  let navigationManager;
  let stateManager;

  beforeEach(async () => {
    // Reset all modules
    vi.resetModules();
    vi.clearAllMocks();

    // Setup DOM elements before importing modules
    mockTabButtons = [
      createMockTabButton('giao-dich'),
      createMockTabButton('chi-phi'),
      createMockTabButton('thong-ke'),
      createMockTabButton('bao-cao'),
      createMockTabButton('cai-dat')
    ];

    mockTabContents = [
      createMockTabContent('tab-giao-dich'),
      createMockTabContent('tab-chi-phi'),
      createMockTabContent('tab-thong-ke'),
      createMockTabContent('tab-bao-cao'),
      createMockTabContent('tab-cai-dat')
    ];

    // Setup global mocks
    global.document = {
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.tab-button') return mockTabButtons;
        if (selector === '.tab-content') return mockTabContents;
        return [];
      }),
      querySelector: vi.fn((selector) => {
        if (selector.startsWith('[data-tab="')) {
          const tabName = selector.match(/data-tab="([^"]+)"/)[1];
          return mockTabButtons.find(btn => btn.dataset.tab === tabName);
        }
        if (selector === '.tab-button.active') {
          return mockTabButtons.find(btn => btn.classList.contains('active'));
        }
        return null;
      }),
      getElementById: vi.fn((id) => {
        return mockTabContents.find(content => content.id === id) || null;
      }),
      addEventListener: vi.fn()
    };

    global.window = {
      location: {
        search: '',
        href: 'http://localhost'
      },
      history: {
        replaceState: vi.fn()
      },
      addEventListener: vi.fn(),
      DEBUG: false
    };

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    // Mock URLSearchParams
    global.URLSearchParams = vi.fn().mockImplementation((search) => ({
      get: vi.fn(() => null),
      set: vi.fn(),
      delete: vi.fn()
    }));

    global.URL = vi.fn().mockImplementation(() => ({
      searchParams: new URLSearchParams()
    }));

    // Mock stateManager
    vi.doMock('../../scripts/core/stateManager.js', () => ({
      updateState: vi.fn(),
      getStateProperty: vi.fn().mockReturnValue({ name: 'Test User' }) // Default authenticated
    }));

    // Import modules after mocks are set up
    stateManager = await import('../../scripts/core/stateManager.js');
    navigationManager = await import('../../scripts/core/navigationManager.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createMockTabButton(tabName) {
    return {
      dataset: { tab: tabName },
      addEventListener: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false)
      }
    };
  }

  function createMockTabContent(id) {
    return {
      id,
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false)
      }
    };
  }

  describe('initializeNavigation', () => {
    it('should initialize navigation successfully', () => {
      const result = navigationManager.initializeNavigation();

      expect(result).toBe(true);
      expect(global.console.log).toHaveBeenCalledWith('🧭 Initializing navigation manager...');
      expect(global.console.log).toHaveBeenCalledWith('✅ Navigation manager initialized');
    });

    it('should handle initialization errors', () => {
      global.document.querySelectorAll = vi.fn(() => {
        throw new Error('DOM error');
      });

      const result = navigationManager.initializeNavigation();

      expect(result).toBe(false);
      expect(global.console.error).toHaveBeenCalledWith(
        '❌ Error initializing navigation:',
        expect.any(Error)
      );
    });

    it('should setup tab handlers', () => {
      navigationManager.initializeNavigation();

      mockTabButtons.forEach(button => {
        expect(button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });

    it('should setup URL listener', () => {
      navigationManager.initializeNavigation();

      expect(global.window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    it('should setup keyboard navigation', () => {
      navigationManager.initializeNavigation();

      expect(global.document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('switchToTab', () => {
    beforeEach(() => {
      // Initialize navigation first
      navigationManager.initializeNavigation();
    });

    it('should switch to valid tab successfully', () => {
      const result = navigationManager.switchToTab('chi-phi');

      expect(result).toBe(true);
      expect(stateManager.updateState).toHaveBeenCalledWith({ activeTab: 'chi-phi' });
      expect(global.console.log).toHaveBeenCalledWith('🔄 Switching to tab: chi-phi');
      expect(global.console.log).toHaveBeenCalledWith('✅ Successfully switched to tab: chi-phi');
    });

    it('should reject invalid tab', () => {
      const result = navigationManager.switchToTab('invalid-tab');

      expect(result).toBe(false);
      expect(global.console.error).toHaveBeenCalledWith('❌ Unknown tab: invalid-tab');
    });

    it('should check authentication for protected tabs', () => {
      stateManager.getStateProperty.mockReturnValue(null); // No user

      const result = navigationManager.switchToTab('thong-ke');

      expect(result).toBe(false);
      expect(global.console.warn).toHaveBeenCalledWith(
        '⚠️ Authentication required for tab:',
        'thong-ke'
      );
    });

    it('should allow tab switch for authenticated user', () => {
      stateManager.getStateProperty.mockReturnValue({ name: 'Test User' });

      const result = navigationManager.switchToTab('thong-ke');

      expect(result).toBe(true);
    });

    it('should update URL when requested', () => {
      navigationManager.switchToTab('chi-phi', { updateURL: true });

      expect(global.window.history.replaceState).toHaveBeenCalled();
    });

    it('should skip URL update when requested', () => {
      vi.clearAllMocks(); // Clear mocks from initialization
      navigationManager.switchToTab('chi-phi', { updateURL: false });

      expect(global.window.history.replaceState).not.toHaveBeenCalled();
    });

    it('should skip transition when requested', () => {
      navigationManager.switchToTab('chi-phi', { skipTransition: true });

      const tabContent = mockTabContents.find(content => content.id === 'tab-chi-phi');
      expect(tabContent.classList.add).toHaveBeenCalledWith('active');
    });

    it('should hide current tab content', () => {
      navigationManager.switchToTab('chi-phi');

      mockTabContents.forEach(content => {
        expect(content.classList.remove).toHaveBeenCalledWith('active');
      });

      mockTabButtons.forEach(button => {
        expect(button.classList.remove).toHaveBeenCalledWith('active');
      });
    });

    it('should show new tab content', () => {
      navigationManager.switchToTab('chi-phi');

      const targetButton = mockTabButtons.find(btn => btn.dataset.tab === 'chi-phi');
      const targetContent = mockTabContents.find(content => content.id === 'tab-chi-phi');

      expect(targetButton.classList.add).toHaveBeenCalledWith('active');
      expect(targetContent).toBeDefined();
    });

    it('should handle missing tab content', () => {
      global.document.getElementById = vi.fn(() => null);

      const result = navigationManager.switchToTab('chi-phi');

      expect(result).toBe(false);
      expect(global.console.error).toHaveBeenCalledWith('❌ Tab content not found for: chi-phi');
    });

    it('should handle tab switch errors', () => {
      // Mock an error in the show tab process
      global.document.getElementById = vi.fn(() => {
        throw new Error('DOM error');
      });

      const result = navigationManager.switchToTab('chi-phi');

      expect(result).toBe(false);
      expect(global.console.error).toHaveBeenCalledWith(
        '❌ Error showing tab chi-phi:',
        expect.any(Error)
      );
    });

    it('should initialize tab if init function exists', () => {
      global.window.initExpenseTab = vi.fn();

      navigationManager.switchToTab('chi-phi');

      expect(global.window.initExpenseTab).toHaveBeenCalled();
    });

    it('should handle tab initialization errors', () => {
      global.window.initExpenseTab = vi.fn(() => {
        throw new Error('Init error');
      });

      navigationManager.switchToTab('chi-phi');

      expect(global.console.error).toHaveBeenCalledWith(
        '❌ Error initializing tab chi-phi:',
        expect.any(Error)
      );
    });
  });

  describe('switchToNextTab', () => {
    beforeEach(() => {
      navigationManager.initializeNavigation();
    });

    it('should switch to next tab', () => {
      // First ensure we're on giao-dich
      navigationManager.switchToTab('giao-dich');
      vi.clearAllMocks();
      
      navigationManager.switchToNextTab();

      expect(navigationManager.getCurrentTab()).toBe('chi-phi');
    });

    it('should wrap around to first tab', () => {
      // Start from last tab (cai-dat)
      navigationManager.switchToTab('cai-dat');
      vi.clearAllMocks();
      
      navigationManager.switchToNextTab();

      expect(navigationManager.getCurrentTab()).toBe('giao-dich');
    });
  });

  describe('switchToPreviousTab', () => {
    beforeEach(() => {
      navigationManager.initializeNavigation();
    });

    it('should switch to previous tab', () => {
      // Start from second tab (chi-phi)
      navigationManager.switchToTab('chi-phi');
      vi.clearAllMocks();
      
      navigationManager.switchToPreviousTab();

      expect(navigationManager.getCurrentTab()).toBe('giao-dich');
    });

    it('should wrap around to last tab', () => {
      // Start from first tab (giao-dich)
      navigationManager.switchToTab('giao-dich');
      vi.clearAllMocks();
      
      navigationManager.switchToPreviousTab();

      expect(navigationManager.getCurrentTab()).toBe('cai-dat');
    });
  });

  describe('getCurrentTab', () => {
    it('should return current tab', () => {
      navigationManager.initializeNavigation();
      navigationManager.switchToTab('chi-phi');

      expect(navigationManager.getCurrentTab()).toBe('chi-phi');
    });

    it('should return default tab initially', () => {
      // Just after module import, before initialization
      expect(navigationManager.getCurrentTab()).toBe('giao-dich');
    });
  });

  describe('getTabHistory', () => {
    beforeEach(() => {
      navigationManager.initializeNavigation();
    });

    it('should track tab history', () => {
      navigationManager.switchToTab('chi-phi');
      navigationManager.switchToTab('thong-ke');

      const history = navigationManager.getTabHistory();
      expect(history).toContain('thong-ke');
      expect(history).toContain('chi-phi');
    });

    it('should return copy of history array', () => {
      const history1 = navigationManager.getTabHistory();
      const history2 = navigationManager.getTabHistory();

      expect(history1).not.toBe(history2); // Different references
      expect(history1).toEqual(history2); // Same content
    });
  });

  describe('goToPreviousTabInHistory', () => {
    beforeEach(() => {
      navigationManager.initializeNavigation();
    });

    it('should go to previous tab in history', () => {
      navigationManager.switchToTab('chi-phi');
      navigationManager.switchToTab('thong-ke');

      navigationManager.goToPreviousTabInHistory();

      expect(navigationManager.getCurrentTab()).toBe('chi-phi');
    });

    it('should handle empty history', () => {
      const initialTab = navigationManager.getCurrentTab();
      
      navigationManager.goToPreviousTabInHistory();

      expect(navigationManager.getCurrentTab()).toBe(initialTab);
    });
  });

  describe('subscribeToTabSwitch', () => {
    beforeEach(() => {
      navigationManager.initializeNavigation();
    });

    it('should notify subscribers on tab switch', () => {
      const callback = vi.fn();
      const unsubscribe = navigationManager.subscribeToTabSwitch(callback);

      // Get current tab first
      const currentTab = navigationManager.getCurrentTab();
      navigationManager.switchToTab('chi-phi');

      expect(callback).toHaveBeenCalledWith(currentTab, 'chi-phi');

      // Test unsubscribe
      unsubscribe();
      navigationManager.switchToTab('thong-ke');

      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should handle callback errors', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      navigationManager.subscribeToTabSwitch(errorCallback);
      navigationManager.switchToTab('chi-phi');

      expect(global.console.error).toHaveBeenCalledWith(
        '❌ Error in tab switch listener:',
        expect.any(Error)
      );
    });
  });

  describe('isValidTab', () => {
    it('should return true for valid tabs', () => {
      expect(navigationManager.isValidTab('giao-dich')).toBe(true);
      expect(navigationManager.isValidTab('chi-phi')).toBe(true);
      expect(navigationManager.isValidTab('thong-ke')).toBe(true);
      expect(navigationManager.isValidTab('bao-cao')).toBe(true);
      expect(navigationManager.isValidTab('cai-dat')).toBe(true);
    });

    it('should return false for invalid tabs', () => {
      expect(navigationManager.isValidTab('invalid-tab')).toBe(false);
      expect(navigationManager.isValidTab('')).toBe(false);
      expect(navigationManager.isValidTab(null)).toBe(false);
      expect(navigationManager.isValidTab(undefined)).toBe(false);
    });
  });

  describe('getTabConfig', () => {
    it('should return tab configuration for valid tab', () => {
      const config = navigationManager.getTabConfig('chi-phi');

      expect(config).toEqual({
        name: 'Chi phí',
        icon: '💸',
        requiresAuth: true,
        preloadData: true,
        initFunction: 'initExpenseTab'
      });
    });

    it('should return null for invalid tab', () => {
      expect(navigationManager.getTabConfig('invalid-tab')).toBe(null);
    });
  });

  describe('getAllTabs', () => {
    it('should return all tab configurations', () => {
      const tabs = navigationManager.getAllTabs();

      expect(tabs).toHaveLength(5);
      expect(tabs[0]).toEqual({
        id: 'giao-dich',
        name: 'Giao dịch',
        icon: '💰',
        requiresAuth: true,
        preloadData: true,
        initFunction: null
      });
    });
  });

  describe('URL Management', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should load tab from URL parameter', () => {
      const mockURLParams = {
        get: vi.fn().mockReturnValue('chi-phi')
      };
      global.URLSearchParams = vi.fn().mockReturnValue(mockURLParams);

      navigationManager.initializeNavigation();

      expect(navigationManager.getCurrentTab()).toBe('chi-phi');
    });

    it('should handle invalid URL tab parameter', () => {
      const mockURLParams = {
        get: vi.fn().mockReturnValue('invalid-tab')
      };
      global.URLSearchParams = vi.fn().mockReturnValue(mockURLParams);

      navigationManager.initializeNavigation();

      expect(navigationManager.getCurrentTab()).toBe('giao-dich');
    });
  });

  describe('Keyboard Navigation', () => {
    let keydownHandler;

    beforeEach(() => {
      navigationManager.initializeNavigation();
      
      // Capture the keydown event handler
      const calls = global.document.addEventListener.mock.calls;
      const keydownCall = calls.find(call => call[0] === 'keydown');
      keydownHandler = keydownCall ? keydownCall[1] : null;
    });

    it('should handle Ctrl+Number shortcuts', () => {
      const event = {
        ctrlKey: true,
        key: '2',
        preventDefault: vi.fn()
      };

      keydownHandler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(navigationManager.getCurrentTab()).toBe('chi-phi');
    });

    it('should handle Ctrl+Tab shortcut', () => {
      const event = {
        ctrlKey: true,
        key: 'Tab',
        preventDefault: vi.fn()
      };

      // Start from first tab
      navigationManager.switchToTab('giao-dich');

      keydownHandler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(navigationManager.getCurrentTab()).toBe('chi-phi');
    });
  });

  describe('Global window bindings', () => {
    it('should make functions globally available', () => {
      expect(global.window.switchToTab).toBe(navigationManager.switchToTab);
      expect(global.window.getCurrentTab).toBe(navigationManager.getCurrentTab);
      expect(global.window.switchToNextTab).toBe(navigationManager.switchToNextTab);
      expect(global.window.switchToPreviousTab).toBe(navigationManager.switchToPreviousTab);
    });
  });
});