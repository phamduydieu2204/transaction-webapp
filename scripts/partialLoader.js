/**
 * HTML Partial Loader
 * Dùng để load các file HTML partials vào trong main layout
 */

// Cache for loaded partials
const partialCache = new Map();

export async function loadPartial(elementId, partialPath, useCache = true) {
  // Check cache first
  if (useCache && partialCache.has(partialPath)) {
    const cachedHtml = partialCache.get(partialPath);
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = cachedHtml;
      console.log(`📦 Used cached partial: ${partialPath}`);
    }
    return;
  }

  console.log(`📄 Loading partial: ${partialPath} into #${elementId}`);
  try {
    const response = await fetch(partialPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${partialPath}: ${response.status}`);
    }
    const html = await response.text();
    
    // Cache the result
    if (useCache) {
      partialCache.set(partialPath, html);
    }
    
    const element = document.getElementById(elementId);
    if (element) {
      // Use insertAdjacentHTML for better performance
      element.innerHTML = '';
      element.insertAdjacentHTML('afterbegin', html);
      console.log(`✅ Inserted into #${elementId}`);
    } else {
      console.error(`❌ Element with id '${elementId}' not found`);
    }
  } catch (error) {
    console.error(`❌ Error loading partial ${partialPath}:`, error);
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
    // Preload all partials in parallel but inject only critical ones first
    console.log('🚀 Preloading all partials in parallel...');
    
    // Define all partials
    const allPartials = [
      // Critical
      { elementId: 'header-container', partialPath: './partials/header/header.html', priority: 1 },
      { elementId: 'tab-navigation-container', partialPath: './partials/header/tab-navigation.html', priority: 1 },
      { elementId: 'transaction-tab-container', partialPath: './partials/tabs/transaction-tab.html', priority: 1 },
      // Secondary
      { elementId: 'expense-tab-container', partialPath: './partials/tabs/expense-tab.html', priority: 2 },
      { elementId: 'statistics-tab-container', partialPath: './partials/tabs/statistics-tab.html', priority: 2 },
      { elementId: 'reports-tab-container', partialPath: './partials/tabs/reports-tab.html', priority: 2 },
      { elementId: 'settings-tab-container', partialPath: './partials/tabs/settings-tab.html', priority: 2 },
      // Modals
      { elementId: 'modals-container', partialPath: './partials/modals/all-modals.html', priority: 3 },
      { elementId: 'processing-modal-placeholder', partialPath: './partials/modals/processing-modal.html', priority: 3 },
      { elementId: 'delete-modal-placeholder', partialPath: './partials/modals/delete-modal.html', priority: 3 },
      { elementId: 'transaction-detail-modal-placeholder', partialPath: './partials/modals/transaction-detail-modal.html', priority: 3 },
      { elementId: 'add-update-modal-placeholder', partialPath: './partials/modals/add-update-modal.html', priority: 3 },
      { elementId: 'cookie-modal-placeholder', partialPath: './partials/modals/cookie-modal.html', priority: 3 },
      { elementId: 'password-modal-placeholder', partialPath: './partials/modals/password-modal.html', priority: 3 },
      { elementId: 'access-check-modal-placeholder', partialPath: './partials/modals/access-check-modal.html', priority: 3 }
    ];
    
    // Preload all HTML files in parallel
    const preloadPromises = allPartials.map(async ({ partialPath }) => {
      try {
        const response = await fetch(partialPath);
        if (response.ok) {
          const html = await response.text();
          partialCache.set(partialPath, html);
        }
      } catch (error) {
        console.warn(`Failed to preload ${partialPath}:`, error);
      }
    });
    
    // Start preloading all files
    const preloadStart = Date.now();
    Promise.all(preloadPromises).then(() => {
      console.log(`✅ All partials preloaded in ${Date.now() - preloadStart}ms`);
    });
    
    // Phase 1: Inject critical components immediately
    console.log('🚀 Phase 1: Injecting critical components...');
    const criticalPartials = allPartials.filter(p => p.priority === 1);
    await loadPartials(criticalPartials);
    console.log('✅ Critical components injected');
    
    // Phase 2: Inject remaining components using cached data
    console.log('🚀 Phase 2: Injecting remaining components from cache...');
    
    // Use requestIdleCallback for non-critical components
    const injectNonCritical = () => {
      const nonCriticalPartials = allPartials.filter(p => p.priority > 1);
      nonCriticalPartials.forEach(({ elementId, partialPath }) => {
        requestAnimationFrame(() => {
          loadPartial(elementId, partialPath, true);
        });
      });
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(injectNonCritical, { timeout: 1000 });
    } else {
      setTimeout(injectNonCritical, 10);
    }
    
    console.log('✅ Non-critical component injection scheduled');
    
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