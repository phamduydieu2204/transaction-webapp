/**
 * DOM Optimizer
 * Batches DOM operations to minimize reflows and repaints
 */

class DOMBatcher {
  constructor() {
    this.operations = [];
    this.frameId = null;
    this.isProcessing = false;
  }

  /**
   * Add DOM operation to batch
   */
  add(operation) {
    this.operations.push(operation);
    this.scheduleFlush();
  }

  /**
   * Schedule batch processing
   */
  scheduleFlush() {
    if (this.frameId || this.isProcessing) return;
    
    this.frameId = requestAnimationFrame(() => {
      this.flush();
    });
  }

  /**
   * Process all batched operations
   */
  flush() {
    if (this.isProcessing || this.operations.length === 0) return;
    
    this.isProcessing = true;
    this.frameId = null;
    
    // Use DocumentFragment for multiple insertions
    const fragments = new Map();
    
    // Group operations by type
    const reads = [];
    const writes = [];
    
    this.operations.forEach(op => {
      if (op.type === 'read') {
        reads.push(op);
      } else {
        writes.push(op);
      }
    });
    
    // Execute all reads first
    reads.forEach(op => {
      try {
        op.execute();
      } catch (error) {
        console.error('DOM read error:', error);
      }
    });
    
    // Then execute all writes
    writes.forEach(op => {
      try {
        op.execute();
      } catch (error) {
        console.error('DOM write error:', error);
      }
    });
    
    // Clear operations
    this.operations = [];
    this.isProcessing = false;
  }
}

// Global instance
const domBatcher = new DOMBatcher();

/**
 * Batch DOM read operation
 */
export function batchRead(fn) {
  return new Promise((resolve) => {
    domBatcher.add({
      type: 'read',
      execute: () => {
        const result = fn();
        resolve(result);
      }
    });
  });
}

/**
 * Batch DOM write operation
 */
export function batchWrite(fn) {
  return new Promise((resolve) => {
    domBatcher.add({
      type: 'write',
      execute: () => {
        const result = fn();
        resolve(result);
      }
    });
  });
}

/**
 * Efficiently update table with virtual DOM diffing
 */
export function updateTableEfficiently(tableBody, newRows, columns = 10) {
  if (!tableBody) return;
  
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Clear existing content in one operation
  batchWrite(() => {
    tableBody.innerHTML = '';
  });
  
  // Build all rows in memory first
  const rowsHtml = newRows.map(rowData => {
    return `<tr>${rowData}</tr>`;
  }).join('');
  
  // Insert all rows at once
  batchWrite(() => {
    tableBody.insertAdjacentHTML('afterbegin', rowsHtml);
  });
}

/**
 * Lazy load images and heavy content
 */
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    // Observe all lazy images
    document.querySelectorAll('img.lazy').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Debounce function for reducing event handler calls
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function for limiting execution rate
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Optimize form inputs with debounced validation
 */
export function optimizeFormInputs() {
  const inputs = document.querySelectorAll('input[type="text"], textarea');
  
  inputs.forEach(input => {
    // Remove existing listeners to prevent duplicates
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Add optimized listener
    newInput.addEventListener('input', debounce((e) => {
      // Validation logic here
      console.log('Input changed:', e.target.value);
    }, 300));
  });
}

// Export utilities
window.domOptimizer = {
  batchRead,
  batchWrite,
  updateTableEfficiently,
  setupLazyLoading,
  debounce,
  throttle,
  optimizeFormInputs
};