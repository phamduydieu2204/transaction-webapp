/**
 * Enable Ultra-Fast Mode
 * Add this to localStorage to force ultra-fast loading
 */

// Enable ultra-fast mode for this session
localStorage.setItem('preferUltraFast', 'true');


// Optionally reload the page automatically
if (confirm('Ultra-fast mode enabled! Reload page now to see the improvement?')) {
  location.reload();
}

export { };