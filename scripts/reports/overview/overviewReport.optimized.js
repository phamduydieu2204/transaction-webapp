/**
 * OPTIMIZED VERSION - Template Loading Performance Improvements
 * 
 * This file contains optimized template loading functions
 * to replace the current implementation in overviewReport.js
 */

/**
 * OPTIMIZED: Load overview HTML template with performance improvements
 */
  });
      cache: 'force-cache', // Use browser cache
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Template fetch failed: ${response.status}`);
    }
    const criticalElements = ['completed-revenue', 'paid-revenue', 'unpaid-revenue'];
    const loaded = criticalElements.every(id => document.getElementById(id));
    
    if (loaded) {
    } else {
      console.warn('⚠️ Some template elements missing');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Template loading timeout (5s)');
    } else {
      console.error('❌ Template loading failed:', error);
    }
 */
  });

    });
    
    if (!response.ok) {
      throw new Error(`Template fetch failed: ${response.status}`);
    }
 */
async function loadOverviewHTML_Cached() {
  const container = document.getElementById('report-overview');
  if (!container) return;
  
  // Check if already loaded
  if (container.querySelector('#completed-revenue')) {
    return;
  }
  
  try {
    const html = await templateCache.loadTemplate('./partials/tabs/report-pages/overview-report.html');
    
    // Batch DOM updates
    requestAnimationFrame(() => {
      container.innerHTML = html;
      container.classList.add('active');
    });
  } catch (error) {
    console.error('❌ Cached template loading failed:', error);
 */
async function preloadTemplates() {
  const templates = [
    './partials/tabs/report-pages/overview-report.html',
    './partials/tabs/report-pages.html'
  ];

  try {
    await Promise.all(templates.map(url => templateCache.loadTemplate(url)));
    console.log('✅ All templates preloaded');
  } catch (error) {
    console.warn('⚠️ Template preloading failed:', error);
  }
}

// Export optimized functions
export {
  loadOverviewHTML_Optimized,
  loadOverviewHTML_Cached,
  templateCache,
  preloadTemplates
};