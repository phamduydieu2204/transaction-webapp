/**
 * cssOptimizer.js
 * 
 * Utilities for optimizing CSS loading and performance
 */

/**
 * CSS Loading Optimizer
 */
class CSSOptimizer {
  constructor() {
    this.loadedSheets = new Set();
    this.criticalCSS = null;
  }
  
  /**
   * Load critical CSS inline for faster initial paint
   */
  async loadCriticalCSS() {
    if (this.criticalCSS) {
      return;
    }
    
    try {
      const response = await fetch('./css/critical.css');
      if (!response.ok) throw new Error('Critical CSS not found');
      
      const css = await response.text();
      
      // Inject critical CSS inline
      const style = document.createElement('style');
      style.textContent = css;
      style.id = 'critical-css';
      document.head.insertBefore(style, document.head.firstChild);
      
      this.criticalCSS = css;
      
    } catch (error) {
      console.warn('⚠️ Critical CSS loading failed:', error);
    }
  }
  
  /**
   * Lazy load non-critical CSS
   */
  loadCSS(href, media = 'all') {
    if (this.loadedSheets.has(href)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print'; // Load as print first (non-blocking)
      
      link.onload = () => {
        link.media = media; // Switch to correct media
        this.loadedSheets.add(href);
        resolve();
      };
      
      link.onerror = () => {
        console.error('❌ CSS loading failed:', href);
        reject(new Error(`CSS loading failed: ${href}`));
      };
      
      // Insert before critical CSS to maintain cascade order
      const criticalStyle = document.getElementById('critical-css');
      if (criticalStyle) {
        document.head.insertBefore(link, criticalStyle.nextSibling);
      } else {
        document.head.appendChild(link);
      }
    });
  }
  
  /**
   * Preload CSS for better performance
   */
  preloadCSS(href) {
    if (this.loadedSheets.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    
    // Convert to actual stylesheet when loaded
    link.onload = () => {
      link.rel = 'stylesheet';
      this.loadedSheets.add(href);
    };
    
    document.head.appendChild(link);
  }
  
  /**
   * Load CSS with intersection observer (when needed)
   */
  loadCSSOnDemand(href, triggerSelector) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadCSS(href);
          observer.disconnect();
        }
      });
    }, { rootMargin: '100px' });
    
    const trigger = document.querySelector(triggerSelector);
    if (trigger) {
      observer.observe(trigger);
    }
  }
  
  /**
   * Remove unused CSS classes (basic cleanup)
   */
  removeUnusedCSS(stylesheet) {
    if (!stylesheet || !stylesheet.cssRules) return;
    
    const usedClasses = new Set();
    
    // Scan DOM for used classes
    document.querySelectorAll('*').forEach(element => {
      element.classList.forEach(className => {
        usedClasses.add(className);
      });
    });
    
    // Remove unused rules (simplified)
    const rulesToRemove = [];
    
    for (let i = 0; i < stylesheet.cssRules.length; i++) {
      const rule = stylesheet.cssRules[i];
      if (rule.type === CSSRule.STYLE_RULE) {
        const selector = rule.selectorText;
        
        // Simple class selector check
        if (selector.startsWith('.')) {
          const className = selector.substring(1).split(/[\s:]+/)[0];
          if (!usedClasses.has(className)) {
            rulesToRemove.push(i);
          }
        }
      }
    }
    
    // Remove rules in reverse order to maintain indices
    rulesToRemove.reverse().forEach(index => {
      try {
        stylesheet.deleteRule(index);
      } catch (e) {
        // Some rules can't be deleted, ignore
      }
    });
    
  }
  
  /**
   * Optimize all stylesheets
   */
  optimizeAllCSS() {
    document.styleSheets.forEach(stylesheet => {
      try {
        this.removeUnusedCSS(stylesheet);
      } catch (e) {
        // Cross-origin stylesheets can't be accessed
        console.log('⚠️ Cannot optimize cross-origin stylesheet');
      }
    });
  }
}

/**
 * Initialize CSS optimizations for overview report
 */
export async function initCSSOptimizations() {
  const optimizer = new CSSOptimizer();
  
  // Load critical CSS first
  await optimizer.loadCriticalCSS();
  
  // Preload important stylesheets
  optimizer.preloadCSS('./css/components/reports.css');
  optimizer.preloadCSS('./css/components/cards.css');
  
  // Lazy load chart-specific CSS when charts section is visible
  optimizer.loadCSSOnDemand('./css/components/charts.css', '.charts-row');
  
  // Lazy load table-specific CSS when tables section is visible
  optimizer.loadCSSOnDemand('./css/components/tables.css', '.tables-row');
  
  
  return optimizer;
}

/**
 * Font loading optimization
 */
export function optimizeFontLoading() {
  // Preload critical fonts
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];
  
  fontPreloads.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Convert to stylesheet after preload
    setTimeout(() => {
      link.rel = 'stylesheet';
    }, 100);
  });
  
}

/**
 * Resource hints for better performance
 */
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
  
}

export default CSSOptimizer;