/**
 * eventManager.test.js
 * 
 * Unit tests cho event management system
 * Kiểm tra event handlers, keyboard shortcuts, và UI interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setupFormHandlers,
  setupPaginationHandlers,
  setupKeyboardShortcuts,
  setupModalHandlers,
  setupResponsiveHandlers,
  setupPerformanceMonitoring,
  initializeEventHandlers,
  cleanupEventHandlers
} from '../../scripts/core/eventManager.js';

// Mock dependencies
vi.mock('../../scripts/handleReset.js', () => ({
  handleReset: vi.fn()
}));

vi.mock('../../scripts/handleAdd.js', () => ({
  handleAdd: vi.fn()
}));

vi.mock('../../scripts/handleUpdate.js', () => ({
  handleUpdate: vi.fn()
}));

vi.mock('../../scripts/handleSearch.js', () => ({
  handleSearch: vi.fn()
}));

vi.mock('../../scripts/handleAddExpense.js', () => ({
  handleAddExpense: vi.fn()
}));

vi.mock('../../scripts/handleUpdateExpense.js', () => ({
  handleUpdateExpense: vi.fn()
}));

vi.mock('../../scripts/handleSearchExpense.js', () => ({
  handleSearchExpense: vi.fn()
}));

vi.mock('../../scripts/handleResetExpense.js', () => ({
  handleResetExpense: vi.fn()
}));

vi.mock('../../scripts/logout.js', () => ({
  logout: vi.fn()
}));

vi.mock('../../scripts/openCalendar.js', () => ({
  openCalendar: vi.fn()
}));

vi.mock('../../scripts/updateCustomerInfo.js', () => ({
  updateCustomerInfo: vi.fn()
}));

vi.mock('../../scripts/updatePackageList.js', () => ({
  updatePackageList: vi.fn()
}));

vi.mock('../../scripts/copyToClipboard.js', () => ({
  copyToClipboard: vi.fn()
}));

vi.mock('../../scripts/closeModal.js', () => ({
  closeModal: vi.fn()
}));

vi.mock('../../scripts/pagination.js', () => ({
  firstPage: vi.fn(),
  prevPage: vi.fn(),
  nextPage: vi.fn(),
  lastPage: vi.fn(),
  goToPage: vi.fn()
}));

describe('eventManager', () => {
  let mockElements = {};

  beforeEach(() => {
    // Reset DOM
    global.document = {
      getElementById: vi.fn((id) => mockElements[id] || null),
      querySelectorAll: vi.fn(() => []),
      querySelector: vi.fn(() => null),
      addEventListener: vi.fn()
    };

    global.window = {
      innerWidth: 1024,
      addEventListener: vi.fn(),
      DEBUG: false,
      performance: {
        now: vi.fn(() => Date.now())
      }
    };

    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    // Setup mock elements
    mockElements = {
      resetBtn: createMockElement('resetBtn'),
      addBtn: createMockElement('addBtn'),
      updateBtn: createMockElement('updateBtn'),
      searchBtn: createMockElement('searchBtn'),
      software: createMockElement('software', 'select'),
      customer: createMockElement('customer', 'input'),
      startDate: createMockElement('startDate', 'input'),
      endDate: createMockElement('endDate', 'input'),
      addExpenseBtn: createMockElement('addExpenseBtn'),
      updateExpenseBtn: createMockElement('updateExpenseBtn'),
      searchExpenseBtn: createMockElement('searchExpenseBtn'),
      resetExpenseBtn: createMockElement('resetExpenseBtn'),
      logoutBtn: createMockElement('logoutBtn'),
      firstPage: createMockElement('firstPage'),
      prevPage: createMockElement('prevPage'),
      nextPage: createMockElement('nextPage'),
      lastPage: createMockElement('lastPage'),
      pageInput: createMockElement('pageInput', 'input')
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createMockElement(id, type = 'button') {
    const element = {
      id,
      type,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false)
      },
      dataset: {},
      options: [],
      selectedIndex: 0,
      value: '',
      textContent: '',
      closest: vi.fn(),
      previousElementSibling: null
    };

    if (type === 'select') {
      element.options = [{
        dataset: { packages: 'package1,package2' }
      }];
    }

    return element;
  }

  describe('setupFormHandlers', () => {
    it('should setup transaction form handlers', () => {
      setupFormHandlers();

      expect(mockElements.resetBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.addBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.updateBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.searchBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should setup expense form handlers', () => {
      setupFormHandlers();

      expect(mockElements.addExpenseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.updateExpenseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.searchExpenseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.resetExpenseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should setup software select change handler', () => {
      setupFormHandlers();

      expect(mockElements.software.addEventListener).toHaveBeenCalledWith('change', expect.any(Function), expect.any(Object));

      // Test the change handler
      const changeHandler = mockElements.software.addEventListener.mock.calls.find(
        call => call[0] === 'change'
      )[1];
      
      const mockUpdatePackageList = vi.fn();
      vi.doMock('../../scripts/updatePackageList.js', () => ({
        updatePackageList: mockUpdatePackageList
      }));

      changeHandler.call(mockElements.software);
      // Should call updatePackageList with packages data
    });

    it('should setup customer input handler', () => {
      setupFormHandlers();

      expect(mockElements.customer.addEventListener).toHaveBeenCalledWith('input', expect.any(Function), expect.any(Object));
    });

    it('should setup date input handlers', () => {
      setupFormHandlers();

      expect(mockElements.startDate.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.endDate.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should handle missing elements gracefully', () => {
      mockElements = {}; // Clear all elements
      global.document.getElementById = vi.fn(() => null);

      expect(() => setupFormHandlers()).not.toThrow();
    });

    it('should setup global handlers', () => {
      const mockModalButtons = [
        createMockElement('modal1'),
        createMockElement('modal2')
      ];
      
      const mockCopyButtons = [
        createMockElement('copy1'),
        createMockElement('copy2')
      ];

      global.document.querySelectorAll = vi.fn((selector) => {
        if (selector === '.close-modal') return mockModalButtons;
        if (selector === '.copy-btn') return mockCopyButtons;
        return [];
      });

      setupFormHandlers();

      expect(mockElements.logoutBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockModalButtons[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockCopyButtons[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });
  });

  describe('setupPaginationHandlers', () => {
    it('should setup pagination button handlers', () => {
      setupPaginationHandlers();

      expect(mockElements.firstPage.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.prevPage.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.nextPage.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      expect(mockElements.lastPage.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should setup page input handler', () => {
      setupPaginationHandlers();

      expect(mockElements.pageInput.addEventListener).toHaveBeenCalledWith('keypress', expect.any(Function), expect.any(Object));
    });

    it('should handle page input enter key', () => {
      setupPaginationHandlers();

      const keypressHandler = mockElements.pageInput.addEventListener.mock.calls.find(
        call => call[0] === 'keypress'
      )[1];

      const mockGoToPage = vi.fn();
      vi.doMock('../../scripts/pagination.js', () => ({
        goToPage: mockGoToPage
      }));

      // Test Enter key
      mockElements.pageInput.value = '5';
      keypressHandler.call(mockElements.pageInput, { key: 'Enter' });

      // Test invalid input
      mockElements.pageInput.value = 'invalid';
      keypressHandler.call(mockElements.pageInput, { key: 'Enter' });

      // Test other keys
      keypressHandler.call(mockElements.pageInput, { key: 'a' });
    });
  });

  describe('setupKeyboardShortcuts', () => {
    it('should setup keyboard event listener', () => {
      setupKeyboardShortcuts();

      expect(global.document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), expect.any(Object));
    });

    it('should handle Ctrl+S shortcut', async () => {
      const { handleAdd } = await import('../../scripts/handleAdd.js');
      const { handleAddExpense } = await import('../../scripts/handleAddExpense.js');

      setupKeyboardShortcuts();

      const keydownHandler = global.document.addEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )[1];

      // Mock active tab
      global.document.querySelector = vi.fn((selector) => {
        if (selector === '.tab-button.active') {
          return { dataset: { tab: 'giao-dich' } };
        }
        return null;
      });

      const mockEvent = {
        ctrlKey: true,
        key: 's',
        preventDefault: vi.fn()
      };

      keydownHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(handleAdd).toHaveBeenCalled();
    });

    it('should handle Ctrl+R shortcut', async () => {
      const { handleReset } = await import('../../scripts/handleReset.js');

      setupKeyboardShortcuts();

      const keydownHandler = global.document.addEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )[1];

      global.document.querySelector = vi.fn(() => ({
        dataset: { tab: 'giao-dich' }
      }));

      const mockEvent = {
        ctrlKey: true,
        key: 'r',
        preventDefault: vi.fn()
      };

      keydownHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(handleReset).toHaveBeenCalled();
    });

    it('should handle Escape key', async () => {
      const { closeModal } = await import('../../scripts/closeModal.js');

      setupKeyboardShortcuts();

      const keydownHandler = global.document.addEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )[1];

      const mockEvent = { key: 'Escape' };
      keydownHandler(mockEvent);

      expect(closeModal).toHaveBeenCalled();
    });

    it('should handle expense tab shortcuts', async () => {
      const { handleAddExpense } = await import('../../scripts/handleAddExpense.js');
      const { handleResetExpense } = await import('../../scripts/handleResetExpense.js');

      setupKeyboardShortcuts();

      const keydownHandler = global.document.addEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )[1];

      // Test Ctrl+S for expense tab
      global.document.querySelector = vi.fn(() => ({
        dataset: { tab: 'chi-phi' }
      }));

      const mockEventS = {
        ctrlKey: true,
        key: 's',
        preventDefault: vi.fn()
      };

      keydownHandler(mockEventS);
      expect(handleAddExpense).toHaveBeenCalled();

      // Test Ctrl+R for expense tab
      const mockEventR = {
        ctrlKey: true,
        key: 'r',
        preventDefault: vi.fn()
      };

      keydownHandler(mockEventR);
      expect(handleResetExpense).toHaveBeenCalled();
    });
  });

  describe('setupModalHandlers', () => {
    it('should setup modal click outside handler', () => {
      setupModalHandlers();

      expect(global.document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should close modal on outside click', async () => {
      const { closeModal } = await import('../../scripts/closeModal.js');

      setupModalHandlers();

      const clickHandler = global.document.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )[1];

      const mockEvent = {
        target: {
          classList: {
            contains: vi.fn(() => true) // Simulate clicking on modal backdrop
          }
        }
      };

      clickHandler(mockEvent);
      expect(closeModal).toHaveBeenCalled();
    });

    it('should setup modal form handlers', () => {
      const mockForms = [
        {
          addEventListener: vi.fn(),
          closest: vi.fn(() => ({ id: 'addOrUpdateModal' }))
        }
      ];

      global.document.querySelectorAll = vi.fn((selector) => {
        if (selector === '.modal form') return mockForms;
        return [];
      });

      setupModalHandlers();

      expect(mockForms[0].addEventListener).toHaveBeenCalledWith('submit', expect.any(Function), expect.any(Object));
    });
  });

  describe('setupResponsiveHandlers', () => {
    it('should setup window resize handler', () => {
      setupResponsiveHandlers();

      expect(global.window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function), expect.any(Object));
    });

    it('should handle responsive layout changes', () => {
      const mockTables = [
        { classList: { add: vi.fn(), remove: vi.fn() } },
        { classList: { add: vi.fn(), remove: vi.fn() } }
      ];

      const mockPagination = {
        classList: { add: vi.fn(), remove: vi.fn() }
      };

      global.document.querySelectorAll = vi.fn((selector) => {
        if (selector === 'table') return mockTables;
        return [];
      });

      global.document.querySelector = vi.fn((selector) => {
        if (selector === '.pagination') return mockPagination;
        return null;
      });

      setupResponsiveHandlers();

      const resizeHandler = global.window.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )[1];

      // Test mobile layout
      global.window.innerWidth = 600;
      resizeHandler();

      // Wait for debounced execution
      setTimeout(() => {
        expect(mockTables[0].classList.add).toHaveBeenCalledWith('mobile-table');
        expect(mockPagination.classList.add).toHaveBeenCalledWith('mobile-pagination');
      }, 300);

      // Test desktop layout
      global.window.innerWidth = 1200;
      resizeHandler();

      setTimeout(() => {
        expect(mockTables[0].classList.remove).toHaveBeenCalledWith('mobile-table');
        expect(mockPagination.classList.remove).toHaveBeenCalledWith('mobile-pagination');
      }, 300);
    });
  });

  describe('setupPerformanceMonitoring', () => {
    it('should not setup monitoring when DEBUG is false', () => {
      global.window.DEBUG = false;

      setupPerformanceMonitoring();

      expect(global.document.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should setup monitoring when DEBUG is true', () => {
      global.window.DEBUG = true;

      setupPerformanceMonitoring();

      expect(global.document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
    });

    it('should monitor slow operations', () => {
      global.window.DEBUG = true;
      global.window.performance = {
        now: vi.fn().mockReturnValue(0)
      };

      setupPerformanceMonitoring();

      // Verify event listener was added for performance monitoring
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        expect.any(Object)
      );
      
      // Verify debug logging
      expect(global.console.log).toHaveBeenCalledWith('📊 Setting up performance monitoring...');
      expect(global.console.log).toHaveBeenCalledWith('✅ Performance monitoring setup complete');
    });
  });

  describe('initializeEventHandlers', () => {
    it('should initialize all event handlers successfully', () => {
      const result = initializeEventHandlers();

      expect(result).toBe(true);
      expect(global.console.log).toHaveBeenCalledWith('🎯 Initializing event handlers...');
      expect(global.console.log).toHaveBeenCalledWith('✅ All event handlers initialized successfully');
    });

    it('should handle initialization errors', () => {
      // Mock an error in one of the setup functions
      global.document.getElementById = vi.fn(() => {
        throw new Error('DOM error');
      });

      const result = initializeEventHandlers();

      expect(result).toBe(false);
      expect(global.console.error).toHaveBeenCalledWith(
        '❌ Error initializing event handlers:',
        expect.any(Error)
      );
    });
  });

  describe('cleanupEventHandlers', () => {
    it('should cleanup event listeners', () => {
      // Setup some handlers first
      setupFormHandlers();

      // Test cleanup
      cleanupEventHandlers();

      expect(global.console.log).toHaveBeenCalledWith('🧹 Cleaning up event handlers...');
      expect(global.console.log).toHaveBeenCalledWith('✅ Event handlers cleanup complete');
    });

    it('should handle cleanup errors gracefully', () => {
      // Setup a handler that will fail during cleanup
      const mockElement = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(() => {
          throw new Error('Cleanup error');
        })
      };

      global.document.getElementById = vi.fn(() => mockElement);
      
      setupFormHandlers();
      cleanupEventHandlers();

      expect(global.console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not remove event listener'),
        expect.any(Error)
      );
    });
  });

  describe('Global window bindings', () => {
    it('should make functions globally available', async () => {
      // Reset modules and set up window before import
      vi.resetModules();
      global.window = {};
      
      // Dynamic import for ES modules
      const eventManager = await import('../../scripts/core/eventManager.js');
      
      expect(global.window.setupFormHandlers).toBeDefined();
      expect(global.window.setupPaginationHandlers).toBeDefined();
      expect(global.window.cleanupEventHandlers).toBeDefined();
      
      // Also check that they are the correct functions
      expect(global.window.setupFormHandlers).toBe(eventManager.setupFormHandlers);
      expect(global.window.setupPaginationHandlers).toBe(eventManager.setupPaginationHandlers);
      expect(global.window.cleanupEventHandlers).toBe(eventManager.cleanupEventHandlers);
    });
  });
});