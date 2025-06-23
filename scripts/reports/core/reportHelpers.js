/**
 * reportHelpers.js
 * 
 * Shared utility functions for all reports
 */

/**
 * Ensure data is loaded before rendering reports
 */
export async function ensureDataIsLoaded() {
  let attempts = 0;
  const maxAttempts = 50; // Wait up to 5 seconds
  
  while (attempts < maxAttempts && (!window.transactionList || !window.expenseList)) {
    console.log(`⏳ Waiting for data to load... (attempt ${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  // If still no data after waiting, try to trigger load
  if (!window.transactionList || window.transactionList.length === 0) {
    if (window.loadTransactions) {
      try {
        await window.loadTransactions();
  } catch (error) {
        console.warn('⚠️ Failed to load transactions:', error);
      }
    }
  }
  
  // Also ensure expense data is loaded
          conditions: {} // Empty conditions to get all expenses
        };
  });

            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
          // Store expenses globally - API returns data not expenses
          window.expenseList = result.data || [];
        } else {
          console.error('❌ Error loading expenses:', result.message);
          window.expenseList = [];
        }
      } else {
        console.warn('⚠️ No user info available to load expenses');
        window.expenseList = [];
      }
  } catch (error) {
      console.error('❌ Failed to load expense data:', error);
  };
}

/**
 * Ensure software data is loaded for commission calculation
 */
  });
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        window.softwareList = result.softwareList || [];
      }
  } catch (error) {
      console.warn('⚠️ Failed to load software list:', error);
      break;
    default:
  });

  }).format(amount);
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
  });

  });
}