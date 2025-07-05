/**
 * Skeleton Loader
 * Shows loading placeholders while data is being fetched
 */

class SkeletonLoader {
  /**
   * Create skeleton HTML for table rows
   */
  static createTableSkeleton(rows = 10, columns = 10) {
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += '<tr class="skeleton-row">';
      for (let j = 0; j < columns; j++) {
        html += '<td><div class="skeleton-cell"></div></td>';
      }
      html += '</tr>';
    }
    return html;
  }

  /**
   * Create skeleton HTML for cards
   */
  static createCardSkeleton(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card">
          <div class="skeleton-icon"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-value"></div>
          <div class="skeleton-change"></div>
        </div>
      `;
    }
    return html;
  }

  /**
   * Show skeleton loading for transaction table
   */
  static showTransactionTableSkeleton() {
    const tableBody = document.querySelector('#transactionTableBody');
    if (tableBody) {
      tableBody.innerHTML = this.createTableSkeleton(10, 10);
      this.injectSkeletonStyles();
    }
  }

  /**
   * Show skeleton loading for expense table
   */
  static showExpenseTableSkeleton() {
    const tableBody = document.querySelector('#expenseTableBody');
    if (tableBody) {
      tableBody.innerHTML = this.createTableSkeleton(10, 8);
    }
  }

  /**
   * Show skeleton loading for statistics cards
   */
  static showStatisticsCardsSkeleton() {
    const container = document.querySelector('.kpi-container');
    if (container) {
      container.innerHTML = this.createCardSkeleton(6);
    }
  }

  /**
   * Hide all skeleton loaders
   */
  static hideAllSkeletons() {
    document.querySelectorAll('.skeleton-row, .skeleton-card').forEach(el => {
      el.classList.add('skeleton-fade-out');
      setTimeout(() => el.remove(), 300);
    });
  }

  /**
   * Inject skeleton CSS if not already present
   */
  static injectSkeletonStyles() {
    if (document.getElementById('skeleton-styles')) return;

    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
      /* Skeleton Loading Styles */
      @keyframes skeleton-loading {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      .skeleton-row td {
        padding: 8px;
      }

      .skeleton-cell {
        height: 20px;
        background: #eee;
        background-image: linear-gradient(
          90deg,
          #eee,
          #f5f5f5,
          #eee
        );
        background-size: 200px 100%;
        background-repeat: no-repeat;
        animation: skeleton-loading 1.2s ease-in-out infinite;
        border-radius: 4px;
      }

      .skeleton-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 15px;
      }

      .skeleton-icon {
        width: 40px;
        height: 40px;
        background: #eee;
        border-radius: 50%;
        margin-bottom: 10px;
        animation: skeleton-loading 1.2s ease-in-out infinite;
      }

      .skeleton-title {
        height: 16px;
        width: 60%;
        background: #eee;
        margin-bottom: 10px;
        animation: skeleton-loading 1.2s ease-in-out infinite;
        border-radius: 4px;
      }

      .skeleton-value {
        height: 24px;
        width: 80%;
        background: #eee;
        margin-bottom: 10px;
        animation: skeleton-loading 1.2s ease-in-out infinite;
        border-radius: 4px;
      }

      .skeleton-change {
        height: 14px;
        width: 40%;
        background: #eee;
        animation: skeleton-loading 1.2s ease-in-out infinite;
        border-radius: 4px;
      }

      .skeleton-fade-out {
        animation: fadeOut 0.3s ease-out forwards;
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show initial loading state immediately
   */
  static showInitialLoadingState() {
    // Show skeleton for the active tab immediately
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      const tabId = activeTab.id;
      
      switch(tabId) {
        case 'tab-giao-dich':
          this.showTransactionTableSkeleton();
          break;
        case 'tab-chi-phi':
          this.showExpenseTableSkeleton();
          break;
        case 'tab-thong-ke':
          this.showStatisticsCardsSkeleton();
          break;
      }
    }

    // Also show loading in header
    const userInfo = document.querySelector('.user-info');
    if (userInfo && !userInfo.textContent.trim()) {
      userInfo.innerHTML = '<span class="skeleton-text">Đang tải...</span>';
    }
  }
}

// Export for use
export default SkeletonLoader;
window.SkeletonLoader = SkeletonLoader;