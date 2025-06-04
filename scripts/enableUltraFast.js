/**
 * Enable Ultra-Fast Mode
 * Add this to localStorage to force ultra-fast loading
 */

// Enable ultra-fast mode for this session
localStorage.setItem('preferUltraFast', 'true');

console.log('⚡ ULTRA-FAST MODE ENABLED');
console.log('🔄 Please reload the page to see the performance improvement');
console.log('📝 To disable: localStorage.removeItem("preferUltraFast")');

// Optionally reload the page automatically
if (confirm('Ultra-fast mode enabled! Reload page now to see the improvement?')) {
  location.reload();
}

export { };