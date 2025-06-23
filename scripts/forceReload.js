/**
 * Force Reload - Clear all caches and reload
 */

// Clear all caches and force reload
window.forceReload = async function() {
  console.log('🔄 Force reloading application...');
  
  try {
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        console.log('🗑️ Unregistering service worker...');
        await registration.unregister();
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('🗑️ Clearing caches:', cacheNames);
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Clear localStorage
    console.log('🗑️ Clearing localStorage...');
    localStorage.clear();
    
    // Clear sessionStorage
    console.log('🗑️ Clearing sessionStorage...');
    sessionStorage.clear();
    
    console.log('✅ All caches cleared. Reloading...');
    
    // Force reload
    window.location.reload(true);
    
  } catch (error) {
    console.error('❌ Error during force reload:', error);
    // Fallback: just reload
    window.location.reload(true);
  }
};

// Auto-attach to window for global access
console.log('🔄 Force reload function available as window.forceReload()');