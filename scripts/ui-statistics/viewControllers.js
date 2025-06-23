/**
 * viewControllers.js
 * 
 * View switching và layout management
 * Handles view transitions, layout changes, and responsive behavior
 */
    };
  }
  
  /**
   * Switch to a specific view
   * @param {string} viewName - Name of the view to switch to
   * @param {Object} options - View options
   */
  });
  } catch (error) {
      console.error(`❌ Error switching to view ${viewName}:`, error);
      showWarningMessage(`Không thể chuyển đến view ${viewName}`);
    }
  }
  
  /**
   * Go back to previous view
   */
  async goBack() {
    if (this.viewHistory.length === 0) {
      return;
    }
    
    const previousView = this.viewHistory.pop();
    await this.switchToView(previousView, { pushToHistory: false });
  }
  
  /**
   * Show view with animation
   * @param {string} viewName - View name
   */
  }
  
  /**
   * Get view element by name
   * @param {string} viewName - View name
   * @returns {Element|null}
   */
  getViewElement(viewName) {
    // Try different possible selectors
    const selectors = [
      `#stats-${viewName}`,
      `#${viewName}-view`,
      `[data-view="${viewName}"]`,
      `.stats-view-${viewName}`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    
    console.warn(`View element not found for: ${viewName}`);
    };
  });

  }
  
  /**
   * Get view configuration
   * @param {string} viewName - View name
   * @returns {Object|null}
   */
    // Handle mobile-specific view adjustments
  });

    };
  }
  
  /**
   * Reset view controller state
   */
  reset() {
    this.currentView = 'overview';
    this.viewHistory = [];
    this.switchToView('overview', { animate: false });
  }
}

// Create global view controller instance
  });

  // Setup navigation event listeners
  setupNavigationListeners();
  
  // Initial layout setup
  layoutManager.handleResize();
  
}

/**
 * Setup navigation event listeners
 */
function setupNavigationListeners() {
  // Handle view switching buttons
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-view], [data-subtab]');
    if (!button) return;
    
    const viewName = button.dataset.view || button.dataset.subtab;
    if (viewName) {
      event.preventDefault();
      viewController.switchToView(viewName);
    }
  });
  
  // Handle back button
  document.addEventListener('click', (event) => {
    if (event.target.matches('.back-button, [data-action="back"]')) {
      event.preventDefault();
      viewController.goBack();
    }
  });
  
  // Handle sidebar toggle
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle="sidebar"]');
    if (toggle) {
      event.preventDefault();
      const sidebarId = toggle.dataset.target || 'sidebar';
      layoutManager.toggleSidebar(sidebarId);
    }
  });
}

// Initialize on module load
document.addEventListener('DOMContentLoaded', () => {
  initializeViewControllers();
});

// Make functions available globally for legacy compatibility
window.viewController = viewController;
window.layoutManager = layoutManager;
window.initializeViewControllers = initializeViewControllers;
