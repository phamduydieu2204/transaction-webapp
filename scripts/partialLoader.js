/**
 * HTML Partial Loader
 * Dùng để load các file HTML partials vào trong main layout
 */

export async function loadPartial(elementId, partialPath) {
  console.log(`📄 Loading partial: ${partialPath} into #${elementId}`);
  try {
    const response = await fetch(partialPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${partialPath}: ${response.status}`);
    }
    const html = await response.text();
    console.log(`✅ Loaded ${partialPath} (${html.length} chars)`);
    
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
      console.log(`✅ Inserted into #${elementId}`);
    } else {
      console.error(`❌ Element with id '${elementId}' not found`);
    }
  } catch (error) {
    console.error(`❌ Error loading partial ${partialPath}:`, error);
    // Hiển thị thông báo lỗi cho user
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="error">Không thể tải nội dung: ${error.message}</div>`;
    }
  }
}

/**
 * Load nhiều partials cùng lúc
 * @param {Array} partials - Array of {elementId, partialPath}
 */
export async function loadPartials(partials) {
  const promises = partials.map(({ elementId, partialPath }) => 
    loadPartial(elementId, partialPath)
  );
  await Promise.all(promises);
}

/**
 * Initialize all partials khi DOM loaded
 */
export async function initializePartials() {
  console.log('🚀 PartialLoader: Starting optimized partial loading...');
  
  try {
    // Phase 1: Critical UI components (parallel loading)
    console.log('🚀 Phase 1: Loading critical UI components...');
    const criticalPartials = [
      { elementId: 'modals-container', partialPath: './partials/modals/all-modals.html' },
      { elementId: 'header-container', partialPath: './partials/header/header.html' },
      { elementId: 'tab-navigation-container', partialPath: './partials/header/tab-navigation.html' },
      { elementId: 'transaction-tab-container', partialPath: './partials/tabs/transaction-tab.html' }
    ];
    
    await loadPartials(criticalPartials);
    console.log('✅ Critical components loaded');
    
    // Phase 2: Secondary tabs (parallel loading)
    console.log('🚀 Phase 2: Loading secondary tabs...');
    const secondaryPartials = [
      { elementId: 'expense-tab-container', partialPath: './partials/tabs/expense-tab.html' },
      { elementId: 'statistics-tab-container', partialPath: './partials/tabs/statistics-tab.html' },
      { elementId: 'reports-tab-container', partialPath: './partials/tabs/reports-tab.html' },
      { elementId: 'settings-tab-container', partialPath: './partials/tabs/settings-tab.html' }
    ];
    
    const secondaryLoad = loadPartials(secondaryPartials);
    
    // Phase 3: Modal components (parallel loading)
    console.log('🚀 Phase 3: Loading modal components...');
    const modalConfigs = [
      { elementId: 'processing-modal-placeholder', partialPath: './partials/modals/processing-modal.html' },
      { elementId: 'delete-modal-placeholder', partialPath: './partials/modals/delete-modal.html' },
      { elementId: 'transaction-detail-modal-placeholder', partialPath: './partials/modals/transaction-detail-modal.html' },
      { elementId: 'add-update-modal-placeholder', partialPath: './partials/modals/add-update-modal.html' },
      { elementId: 'cookie-modal-placeholder', partialPath: './partials/modals/cookie-modal.html' },
      { elementId: 'password-modal-placeholder', partialPath: './partials/modals/password-modal.html' }
    ];
    
    const modalLoad = loadPartials(modalConfigs);
    
    // Wait for secondary and modal loading to complete
    await Promise.all([secondaryLoad, modalLoad]);
    console.log('✅ Secondary tabs and modals loaded');
    
    // Phase 4: Optional components (lazy load)
    console.log('🚀 Phase 4: Loading optional components...');
    setTimeout(async () => {
      const reportPagesContainer = document.getElementById('report-pages-container');
      if (reportPagesContainer) {
        await loadPartial('report-pages-container', './partials/tabs/report-pages.html');
        console.log('✅ Report pages loaded');
      }
    }, 50); // Reduced delay
    
    console.log('✅ All partials loading initiated');
    
  } catch (error) {
    console.error('❌ Error in partial loading:', error);
  }
}