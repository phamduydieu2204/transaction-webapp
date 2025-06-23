/**
 * OPTIMIZED VERSION - Template Loading Performance Improvements
 * 
 * This file contains optimized template loading functions
 * to replace the current implementation in overviewReport.js
 */

/**
 * OPTIMIZED: Load overview HTML template with performance improvements
 */
async function loadOverviewHTML_Optimized() {
  const container = document.getElementById('report-overview');
  if (!container) {
    console.error('❌ report-overview container not found');
    return;
  }
  
  // Performance: Check if template is already loaded
  if (container.querySelector('#completed-revenue')) {
    return;
  }
  
  try {
    // Performance: Add request timeout and caching
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch('./partials/tabs/report-pages/overview-report.html', {
      signal: controller.signal,
      cache: 'force-cache', // Use browser cache
      priority: 'high' // High priority fetch
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Template fetch failed: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Performance: Single DOM manipulation instead of multiple
    container.innerHTML = html;
    container.classList.add('active');
    
    // Performance: Immediate verification instead of setTimeout
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
    throw error;
  }
}

/**
 * OPTIMIZED: Template cache management
 */
class TemplateCache {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }
  
  async loadTemplate(url) {
    // Return cached template if available
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // Return existing loading promise if already fetching
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }
    
    // Start new fetch
    const loadingPromise = this.fetchTemplate(url);
    this.loadingPromises.set(url, loadingPromise);
    
    try {
      const html = await loadingPromise;
      this.cache.set(url, html);
      this.loadingPromises.delete(url);
      return html;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }
  
  async fetchTemplate(url) {
    const response = await fetch(url, {
      cache: 'force-cache',
      priority: 'high'
    });
    
    if (!response.ok) {
      throw new Error(`Template fetch failed: ${response.status}`);
    }
    
    return response.text();
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Global template cache instance
const templateCache = new TemplateCache();

/**
 * OPTIMIZED: Load overview report with caching
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
    throw error;
  }
}

/**
 * OPTIMIZED: Preload templates for better performance
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