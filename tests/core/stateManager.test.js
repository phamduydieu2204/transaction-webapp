/**
 * Unit tests for stateManager.js
 * Tests global state management and data persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We'll test the module by importing specific functions
// Note: The module has internal state that makes full isolation challenging
describe('stateManager.js module', () => {
  // Mock localStorage
  const localStorageMock = {
    data: {},
    getItem: vi.fn((key) => localStorageMock.data[key] || null),
    setItem: vi.fn((key, value) => {
      localStorageMock.data[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete localStorageMock.data[key];
    }),
    clear: vi.fn(() => {
      localStorageMock.data = {};
    }),
    get length() {
      return Object.keys(this.data).length;
    },
    key: vi.fn((index) => Object.keys(localStorageMock.data)[index])
  };

  // Mock window object
  const windowMock = {
    addEventListener: vi.fn(),
    appState: null,
    DEBUG: false
  };

  // Mock console methods
  const consoleMock = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.data = {};
    
    // Setup global mocks
    global.localStorage = localStorageMock;
    global.window = windowMock;
    global.console = consoleMock;
    global.setInterval = vi.fn();
    global.clearInterval = vi.fn();
    global.Date.now = vi.fn(() => 1704067200000);
    global.Blob = vi.fn().mockImplementation((content) => ({
      size: JSON.stringify(content).length
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Module loading and exports', () => {
    it('should export required functions', async () => {
      const module = await import('../../scripts/core/stateManager.js');
      
      expect(module.initializeStateManager).toBeDefined();
      expect(module.getState).toBeDefined();
      expect(module.getStateProperty).toBeDefined();
      expect(module.updateState).toBeDefined();
      expect(module.subscribeToState).toBeDefined();
      expect(module.persistState).toBeDefined();
      expect(module.clearPersistedState).toBeDefined();
      expect(module.resetState).toBeDefined();
      expect(module.getStateStats).toBeDefined();
      expect(module.cleanupStateManager).toBeDefined();
    });
  });

  describe('initializeStateManager', () => {
    it('should initialize without throwing errors', async () => {
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      
      expect(() => initializeStateManager()).not.toThrow();
      
      expect(consoleMock.log).toHaveBeenCalledWith('🔄 Initializing state manager...');
      expect(consoleMock.log).toHaveBeenCalledWith('✅ State manager initialized');
    });

    it('should setup auto-save interval', async () => {
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      expect(global.setInterval).toHaveBeenCalled();
      expect(consoleMock.log).toHaveBeenCalledWith('⏰ Auto-save setup complete');
    });

    it('should validate state', async () => {
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      expect(consoleMock.log).toHaveBeenCalledWith('✅ State validation complete');
    });
  });

  describe('getState and getStateProperty', () => {
    it('should return state object and properties', async () => {
      const { initializeStateManager, getState, getStateProperty } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const state = getState();
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
      
      // Test specific properties
      expect(state).toHaveProperty('transactions');
      expect(state).toHaveProperty('expenses');
      expect(state).toHaveProperty('currentPage');
      expect(state).toHaveProperty('activeTab');
      
      // Test getStateProperty
      const activeTab = getStateProperty('activeTab');
      expect(activeTab).toBeDefined();
    });

    it('should return copies, not references', async () => {
      const { initializeStateManager, getState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const state1 = getState();
      const state2 = getState();
      
      expect(state1).not.toBe(state2);
    });
  });

  describe('updateState', () => {
    it('should update state properties', async () => {
      const { initializeStateManager, updateState, getStateProperty } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      updateState({ currentPage: 5 }, false); // Don't persist for test
      
      expect(getStateProperty('currentPage')).toBe(5);
    });

    it('should warn about unknown properties', async () => {
      const { initializeStateManager, updateState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      updateState({ unknownProperty: 'test' }, false);
      
      expect(consoleMock.warn).toHaveBeenCalledWith('⚠️ Unknown state property: unknownProperty');
    });
  });

  describe('subscribeToState', () => {
    it('should allow subscription to state changes', async () => {
      const { initializeStateManager, subscribeToState, updateState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const callback = vi.fn();
      subscribeToState('currentPage', callback);
      
      updateState({ currentPage: 10 }, false);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', async () => {
      const { initializeStateManager, subscribeToState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const callback = vi.fn();
      const unsubscribe = subscribeToState('currentPage', callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle subscriber errors gracefully', async () => {
      const { initializeStateManager, subscribeToState, updateState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const errorCallback = vi.fn(() => {
        throw new Error('Subscriber error');
      });
      
      subscribeToState('isLoading', errorCallback);
      updateState({ isLoading: true }, false);
      
      expect(consoleMock.error).toHaveBeenCalled();
    });
  });

  describe('persistState and clearPersistedState', () => {
    it('should persist state to localStorage', async () => {
      const { initializeStateManager, persistState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      persistState();
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(consoleMock.log).toHaveBeenCalledWith('💾 State persisted to localStorage');
    });

    it('should handle persistence errors', async () => {
      const { initializeStateManager, persistState } = await import('../../scripts/core/stateManager.js');
      
      // Mock setItem to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      initializeStateManager();
      persistState();
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ Error persisting state:',
        expect.any(Error)
      );
    });

    it('should clear persisted state', async () => {
      const { initializeStateManager, clearPersistedState } = await import('../../scripts/core/stateManager.js');
      
      // Add some test data
      localStorageMock.data = {
        'transactionApp_appState': '{"test": "data"}',
        'transactionApp_criticalState': '{"user": "test"}',
        'otherApp_data': '{"other": "data"}'
      };
      
      // Mock Object.keys to return our mock data keys
      const originalKeys = Object.keys;
      Object.keys = vi.fn((obj) => {
        if (obj === global.localStorage) {
          return Object.keys(localStorageMock.data);
        }
        return originalKeys(obj);
      });
      
      initializeStateManager();
      clearPersistedState();
      
      expect(localStorageMock.removeItem).toHaveBeenCalled();
      expect(consoleMock.log).toHaveBeenCalledWith('🗑️ Persisted state cleared');
      
      // Restore Object.keys
      Object.keys = originalKeys;
    });
  });

  describe('resetState', () => {
    it('should reset state to defaults', async () => {
      const { initializeStateManager, updateState, resetState, getStateProperty } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      // Modify state first
      updateState({ currentPage: 10, isLoading: true }, false);
      
      // Then reset
      resetState();
      
      expect(consoleMock.log).toHaveBeenCalledWith('🔄 State reset to defaults');
    });
  });

  describe('getStateStats', () => {
    it('should return state statistics', async () => {
      const { initializeStateManager, getStateStats } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const stats = getStateStats();
      
      expect(stats).toHaveProperty('transactionCount');
      expect(stats).toHaveProperty('expenseCount');
      expect(stats).toHaveProperty('currentPage');
      expect(stats).toHaveProperty('totalPages');
      expect(stats).toHaveProperty('isLoading');
      expect(stats).toHaveProperty('isSearching');
      expect(stats).toHaveProperty('errorCount');
      expect(stats).toHaveProperty('lastUpdate');
      
      expect(typeof stats.transactionCount).toBe('number');
      expect(typeof stats.lastUpdate).toBe('number');
    });
  });

  describe('cleanupStateManager', () => {
    it('should cleanup without errors', async () => {
      const { initializeStateManager, cleanupStateManager } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      expect(() => cleanupStateManager()).not.toThrow();
      
      expect(consoleMock.log).toHaveBeenCalledWith('🧹 Cleaning up state manager...');
      expect(consoleMock.log).toHaveBeenCalledWith('✅ State manager cleanup complete');
    });
  });

  describe('State persistence and loading', () => {
    it('should load saved state', async () => {
      const savedState = {
        currentPage: 5,
        activeTab: 'chi-phi',
        timestamp: Date.now() - 1000 // 1 second ago
      };
      
      localStorageMock.data['transactionApp_appState'] = JSON.stringify(savedState);
      
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      initializeStateManager();
      
      expect(consoleMock.log).toHaveBeenCalledWith('✅ State loaded from localStorage');
    });

    it('should reject old saved state', async () => {
      const oldState = {
        currentPage: 5,
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };
      
      localStorageMock.data['transactionApp_appState'] = JSON.stringify(oldState);
      
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      initializeStateManager();
      
      expect(consoleMock.log).toHaveBeenCalledWith('⚠️ Saved state is too old, using default state');
    });

    it('should handle corrupted saved state', async () => {
      localStorageMock.data['transactionApp_appState'] = 'invalid json';
      
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      initializeStateManager();
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        '❌ Error loading persisted state:',
        expect.any(Error)
      );
    });

    it('should load critical state as fallback', async () => {
      const criticalState = {
        user: { id: 1, name: 'Test' },
        activeTab: 'bao-cao',
        timestamp: Date.now()
      };
      
      localStorageMock.data['transactionApp_criticalState'] = JSON.stringify(criticalState);
      
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      initializeStateManager();
      
      expect(consoleMock.log).toHaveBeenCalledWith('✅ Critical state loaded as fallback');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined window gracefully', async () => {
      delete global.window;
      
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      
      expect(() => initializeStateManager()).not.toThrow();
      
      // Restore window
      global.window = windowMock;
    });

    it('should handle localStorage errors', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { initializeStateManager } = await import('../../scripts/core/stateManager.js');
      
      expect(() => initializeStateManager()).not.toThrow();
      
      expect(consoleMock.error).toHaveBeenCalled();
    });

    it('should handle large state compression', async () => {
      const { initializeStateManager, updateState, persistState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      // Mock Blob to return large size
      global.Blob.mockImplementation(() => ({ size: 6000000 })); // 6MB
      
      const largeTransactions = Array.from({ length: 200 }, (_, i) => ({ id: i }));
      updateState({ transactions: largeTransactions }, false);
      
      persistState();
      
      expect(consoleMock.warn).toHaveBeenCalledWith(
        '⚠️ State too large for localStorage, compressing...'
      );
    });

    it('should handle circular references in state', async () => {
      const { initializeStateManager, updateState } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      const circularObj = { name: 'test' };
      circularObj.self = circularObj;
      
      expect(() => {
        updateState({ user: circularObj });
      }).not.toThrow();
    });

    it('should maintain state consistency', async () => {
      const { initializeStateManager, updateState, getStateProperty } = await import('../../scripts/core/stateManager.js');
      
      initializeStateManager();
      
      // Rapid updates
      for (let i = 0; i < 10; i++) {
        updateState({ errorCount: i }, false);
      }
      
      expect(getStateProperty('errorCount')).toBe(9);
    });
  });
});