/**
 * CSS Optimizer
 * Optimizes CSS loading and reduces render-blocking resources
 */

class CSSOptimizer {
  constructor() {
    this.loadedCSS = new Set();
    this.criticalCSS = '';
  }

  /**
   * Load CSS asynchronously to avoid render blocking
   */
  async loadCSS(href, id = null) {
    if (this.loadedCSS.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (id) link.id = id;
      
      link.onload = () => {
        this.loadedCSS.add(href);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to load CSS: ${href}`));
      };
      
      // Use media="print" trick for async loading
      link.media = 'print';
      document.head.appendChild(link);
      
      // Switch to screen media after load
      setTimeout(() => {
        link.media = 'all';
      }, 0);
    });
  }

  /**
   * Preload CSS for better performance
   */
  preloadCSS(href) {
    if (this.loadedCSS.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    
    link.onload = () => {
      // Convert to actual stylesheet when loaded
      link.rel = 'stylesheet';
      this.loadedCSS.add(href);
    };
    
    document.head.appendChild(link);
  }

  /**
   * Inline critical CSS to reduce render blocking
   */
  inlineCriticalCSS(css) {
    if (this.criticalCSS.includes(css)) return;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    this.criticalCSS += css;
  }

  /**
   * Remove unused CSS to reduce file size
   */
  removeUnusedCSS() {
    // This would require CSS analysis - simplified version
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    stylesheets.forEach(link => {
      // Check if stylesheet is actually being used
      // This is a simplified check - in production you'd use more sophisticated analysis
      if (link.href.includes('unused') || link.href.includes('temp')) {
        link.remove();
        this.loadedCSS.delete(link.href);
      }
    });
  }

  /**
   * Compress and minify inline styles
   */
  optimizeInlineStyles() {
    const styleElements = document.querySelectorAll('style');
    
    styleElements.forEach(style => {
      if (style.textContent) {
        // Simple minification - remove extra whitespace and comments
        style.textContent = style.textContent
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Remove semicolon before }
          .replace(/\s*{\s*/g, '{') // Remove spaces around {
          .replace(/;\s*/g, ';') // Remove spaces after ;
          .trim();
      }
    });
  }

  /**
   * Lazy load CSS for specific components
   */
  async loadComponentCSS(componentName) {
    const cssPath = `css/components/${componentName}.css`;
    return this.loadCSS(cssPath, `${componentName}-css`);
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      loadedCSS: Array.from(this.loadedCSS),
      criticalCSSSize: this.criticalCSS.length,
      totalStylesheets: document.querySelectorAll('link[rel="stylesheet"]').length
    };
  }
}

// Create global CSS optimizer instance
const cssOptimizer = new CSSOptimizer();

// Critical CSS for fast initial render
const CRITICAL_CSS = `
  /* Critical styles for initial render */
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .container { min-height: 100vh; }
  .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
  .tab-button { cursor: pointer; padding: 8px 16px; border: none; background: #f5f5f5; }
  .tab-button.active { background: #007bff; color: white; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
`;

// Inline critical CSS immediately
cssOptimizer.inlineCriticalCSS(CRITICAL_CSS);

// Export functions
export const {
  loadCSS,
  preloadCSS,
  inlineCriticalCSS,
  removeUnusedCSS,
  optimizeInlineStyles,
  loadComponentCSS,
  getStats
} = cssOptimizer;

// Make available globally
window.cssOptimizer = cssOptimizer;

export default cssOptimizer;