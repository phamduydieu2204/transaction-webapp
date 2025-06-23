/**
 * Initialize Expense Tab
 * Load expense data when switching to expense tab
 */
    // Check if we already have data and don't need to reload
    if (window.expenseTabInitialized && window.expenseList && window.expenseList.length > 0) {
      // Update table with existing data
      updateExpenseTable();
      // Render expense statistics
      renderExpenseStats();
    } else {
      await loadExpensesInBackground();
      // Mark as initialized
      window.expenseTabInitialized = true;
    }
    
    console.log('✅ Expense tab initialized');
  } catch (error) {
    console.error('❌ Error initializing expense tab:', error);
  }
}

/**
 * Load expenses from backend without modal
 */
  };
        'Content-Type': 'application/json'
      },
  });

      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Store expenses globally - API returns data not expenses
      window.expenseList = result.data || [];
      window.currentExpensePage = 1;
      window.isExpenseSearching = false;

      // Update table
      updateExpenseTable();
      // Render expense statistics
      renderExpenseStats();
      
    } else {
      console.error('❌ Error loading expenses:', result.message);
      window.expenseList = [];
    }
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
    window.expenseList = [];
  }
}

/**
 * Load expenses from backend with modal (for refresh/search operations)
 */
async function loadExpenses() {
  try {
    // Show loading modal
    showProcessingModal('Đang tải dữ liệu chi phí...');
    
    await loadExpensesInBackground();
    
    // Mark as initialized
    window.expenseTabInitialized = true;
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
  } finally {
    closeProcessingModal();
  }
}

/**
 * Reset expense tab state (for logout or forced refresh)
 */
function resetExpenseTabState() {
  window.expenseTabInitialized = false;
  window.expenseList = [];
}

// Make functions globally available
window.initExpenseTab = initExpenseTab;
window.loadExpenses = loadExpenses; // For refresh/search operations that need modal
window.resetExpenseTabState = resetExpenseTabState; // For logout or forced refresh