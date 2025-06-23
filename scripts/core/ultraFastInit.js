/**
 * Ultra-Fast Application Initialization
 * Skips all non-essential features for maximum speed
 */

import { getConstants } from '../constants.js';
import { loadTransactionsOptimized } from '../loadTransactions.js';
import { updateTable } from '../updateTableUltraFast.js';
import { formatDate } from '../formatDate.js';
import { editTransaction } from '../editTransaction.js';
import { deleteTransaction } from '../deleteTransaction.js';
import { viewTransaction } from '../viewTransaction.js';
import { deduplicateRequest } from './requestOptimizer.js';

/**
 * Load critical functions needed for basic operations
 */
async function loadCriticalFunctions() {
  
  try {
    // Import and attach modal functions
    const { showProcessingModal } = await import('../showProcessingModal.js');
    const { closeProcessingModal } = await import('../closeProcessingModal.js');
    const { showResultModal } = await import('../showResultModal.js');
    
    // Attach to window for global access
    window.showProcessingModal = showProcessingModal;
    window.closeProcessingModal = closeProcessingModal;
    window.showResultModal = showResultModal;

    // Load other critical functions
    const { updatePackageList } = await import('../updatePackageList.js');
    const { updateAccountList } = await import('../updateAccountList.js');
    
    window.updatePackageList = updatePackageList;
    window.updateAccountList = updateAccountList;
  } catch (error) {
    console.error('❌ Failed to load critical functions:', error);
  });

      }
    );
      scheduleBackgroundLoading();
      
      return true;
    } else {
      throw new Error(result.message || 'Failed to load transactions');
    }
  } catch (error) {
    console.error('❌ Ultra-fast init failed:', error);
  } catch (error) {
      console.warn('⚠️ Background software list loading failed:', error);
    }
  }, 1000);

  // Load expense data in background
          conditions: {}
        };
  });
          headers: { 'Content-Type': 'application/json' },
        });
  } catch (error) {
      console.warn('⚠️ Background expense loading failed:', error);
    }
  }, 2000);

  // Preload next page of transactions
        }
      );
  } catch (error) {
      console.warn('⚠️ Background preloading failed:', error);
    }
  }, 3000);
}

/**
 * Check if ultra-fast mode should be used
 */
  // 2. Large dataset detected
  // 3. Performance preference set
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );

  const hasPerformancePreference = localStorage.getItem('preferUltraFast') === 'true';
  
  return isSlowConnection || hasPerformancePreference;
}

// Export for global access
window.ultraFastInit = {
  ultraFastInit,
  shouldUseUltraFast,
  scheduleBackgroundLoading
};