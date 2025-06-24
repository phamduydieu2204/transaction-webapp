/**
 * Fast Data Loader
 * Optimizes initial data loading for better perceived performance
 */

import { getConstants } from '../constants.js';
import { deduplicateRequest } from './requestOptimizer.js';

class FastDataLoader {
  constructor() {
    this.criticalDataLoaded = false;
    this.fullDataLoaded = false;
  }

  /**
   * Load only critical data needed for initial render
   */
  async loadCriticalData(user) {
    console.log('⚡ Loading critical data for fast initial render...');
    
    try {
      // Load only first page of transactions (10-20 items)
      const transactions = await this.loadTransactionsPage(user, 1, 20);
      
      // Store in window for immediate use
      window.transactionList = transactions;
      window.currentTransactionData = transactions;
      
      this.criticalDataLoaded = true;
      console.log('✅ Critical data loaded');
      
      return { transactions, criticalOnly: true };
    } catch (error) {
      console.error('❌ Error loading critical data:', error);
      throw error;
    }
  }

  /**
   * Load remaining data in background
   */
  async loadRemainingData(user) {
    console.log('📊 Loading remaining data in background...');
    
    try {
      // Load all data in parallel
      const [allTransactions, expenses, software] = await Promise.all([
        this.loadAllTransactions(user),
        this.loadExpenses(user),
        this.loadSoftwareList()
      ]);

      // Update global data
      window.transactionList = allTransactions;
      window.currentTransactionData = allTransactions;
      window.expenseList = expenses;
      window.currentExpenseData = expenses;
      window.softwareData = software;

      this.fullDataLoaded = true;
      console.log('✅ All data loaded in background');

      return { 
        transactions: allTransactions, 
        expenses, 
        software,
        fullDataLoaded: true 
      };
    } catch (error) {
      console.error('❌ Error loading remaining data:', error);
      // Don't throw - let app continue with partial data
    }
  }

  /**
   * Load single page of transactions
   */
  async loadTransactionsPage(user, page = 1, limit = 20) {
    const { BACKEND_URL } = getConstants();
    const cacheKey = `transactions-${user.id}-page${page}-limit${limit}`;
    
    return deduplicateRequest(cacheKey, async () => {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchTransactions',
          page,
          limit,
          maNhanVien: user.id,
          filters: {}
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data.transactions || [];
      }
      throw new Error(data.message || 'Failed to load transactions');
    }, { cacheDuration: 1 * 60 * 1000 }); // 1 minute cache
  }

  /**
   * Load all transactions
   */
  async loadAllTransactions(user) {
    const { BACKEND_URL } = getConstants();
    const cacheKey = `all-transactions-${user.id}`;
    
    return deduplicateRequest(cacheKey, async () => {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'loadTransactions',
          maNhanVien: user.id
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data.transactions || [];
      }
      throw new Error(data.message || 'Failed to load all transactions');
    }, { cacheDuration: 5 * 60 * 1000 }); // 5 minute cache
  }

  /**
   * Load expenses
   */
  async loadExpenses(user) {
    const { BACKEND_URL } = getConstants();
    const cacheKey = `expenses-${user.id}`;
    
    return deduplicateRequest(cacheKey, async () => {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'loadExpenses',
          maNhanVien: user.id
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data.expenses || [];
      }
      throw new Error(data.message || 'Failed to load expenses');
    }, { cacheDuration: 5 * 60 * 1000 });
  }

  /**
   * Load software list
   */
  async loadSoftwareList() {
    const { BACKEND_URL } = getConstants();
    
    return deduplicateRequest('software-list', async () => {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSoftwareList' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data.data || [];
      }
      throw new Error(data.message || 'Failed to load software');
    }, { cacheDuration: 10 * 60 * 1000 }); // 10 minute cache
  }

  /**
   * Preload data before authentication completes
   */
  static preloadCommonData() {
    // Preload software list as it's common for all users
    const loader = new FastDataLoader();
    loader.loadSoftwareList().catch(err => {
      console.warn('Failed to preload software list:', err);
    });
  }
}

// Create singleton instance
const fastDataLoader = new FastDataLoader();

// Export functions
export default fastDataLoader;
export const { 
  loadCriticalData, 
  loadRemainingData,
  loadTransactionsPage,
  loadAllTransactions,
  loadExpenses,
  loadSoftwareList
} = fastDataLoader;

// Make available globally
window.fastDataLoader = fastDataLoader;