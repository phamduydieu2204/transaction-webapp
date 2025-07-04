/**
 * Lazy Loading System
 * Loads modules and components on-demand to improve initial page load speed
 */

class LazyLoader {
  constructor() {
    this.loadedModules = new Set();
    this.loadingPromises = new Map();
    this.moduleCache = new Map();
  }

  /**
   * Lazy load a module only when needed
   */
  async loadModule(modulePath, cacheKey = null) {
    const key = cacheKey || modulePath;
    
    // Return cached module if already loaded
    if (this.moduleCache.has(key)) {
      return this.moduleCache.get(key);
    }
    
    // Return existing promise if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }
    
    // Start loading the module
    const loadPromise = this.doLoadModule(modulePath, key);
    this.loadingPromises.set(key, loadPromise);
    
    try {
      const module = await loadPromise;
      this.moduleCache.set(key, module);
      this.loadedModules.add(key);
      return module;
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  /**
   * Actually load the module
   */
  async doLoadModule(modulePath, key) {
    try {
      // console.log(`🔄 Lazy loading: ${key}`);
      const module = await import(modulePath);
      // console.log(`✅ Loaded: ${key}`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load ${key}:`, error);
      throw error;
    }
  }

  /**
   * Preload modules that will likely be needed soon
   */
  async preloadModule(modulePath, cacheKey = null) {
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      return new Promise((resolve, reject) => {
        requestIdleCallback(async () => {
          try {
            const module = await this.loadModule(modulePath, cacheKey);
            resolve(module);
          } catch (error) {
            reject(error);
          }
        }, { timeout: 5000 });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const module = await this.loadModule(modulePath, cacheKey);
            resolve(module);
          } catch (error) {
            reject(error);
          }
        }, 100);
      });
    }
  }

  /**
   * Load multiple modules in parallel
   */
  async loadModules(moduleConfigs) {
    const promises = moduleConfigs.map(config => {
      if (typeof config === 'string') {
        return this.loadModule(config);
      } else {
        return this.loadModule(config.path, config.key);
      }
    });
    
    return Promise.all(promises);
  }

  /**
   * Check if module is loaded
   */
  isLoaded(key) {
    return this.loadedModules.has(key);
  }

  /**
   * Get loaded module from cache
   */
  getLoadedModule(key) {
    return this.moduleCache.get(key);
  }

  /**
   * Clear cache for specific module or all modules
   */
  clearCache(key = null) {
    if (key) {
      this.moduleCache.delete(key);
      this.loadedModules.delete(key);
    } else {
      this.moduleCache.clear();
      this.loadedModules.clear();
    }
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      loadedModules: Array.from(this.loadedModules),
      loadingCount: this.loadingPromises.size,
      cacheSize: this.moduleCache.size
    };
  }
}

// Create global lazy loader instance
const lazyLoader = new LazyLoader();

// Export functions bound to the instance
export const loadModule = (modulePath, cacheKey) => lazyLoader.loadModule(modulePath, cacheKey);
export const preloadModule = (modulePath, cacheKey) => lazyLoader.preloadModule(modulePath, cacheKey);
export const loadModules = (moduleConfigs) => lazyLoader.loadModules(moduleConfigs);
export const isLoaded = (key) => lazyLoader.isLoaded(key);
export const getLoadedModule = (key) => lazyLoader.getLoadedModule(key);
export const clearCache = (key) => lazyLoader.clearCache(key);
export const getStats = () => lazyLoader.getStats();

// Make available globally for backward compatibility
window.lazyLoader = lazyLoader;

export default lazyLoader;