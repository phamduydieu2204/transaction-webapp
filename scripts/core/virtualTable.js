/**
 * Virtual Table Implementation
 * Only renders visible rows for massive performance improvement
 */

export class VirtualTable {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      rowHeight: 50, // pixels
      bufferSize: 10, // extra rows to render
      ...options
    };
    
    this.data = [];
    this.visibleStartIndex = 0;
    this.visibleEndIndex = 0;
    this.containerHeight = 0;
    this.visibleRowCount = 0;
    
    this.init();
  }

  init() {
    // Create virtual structure
    this.createVirtualStructure();
    this.setupScrollHandler();
    this.calculateVisibleRows();
  }

  createVirtualStructure() {
    const table = this.container.querySelector('table');
    if (!table) return;

    // Create virtual container
    this.virtualContainer = document.createElement('div');
    this.virtualContainer.className = 'virtual-table-container';
    this.virtualContainer.style.cssText = `
      height: 500px;
      overflow-y: auto;
      position: relative;
    `;

    // Create spacer for total height
    this.spacer = document.createElement('div');
    this.spacer.className = 'virtual-spacer';

    // Create visible rows container
    this.visibleContainer = document.createElement('div');
    this.visibleContainer.className = 'virtual-visible';
    this.visibleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `;

    // Wrap existing table
    const tbody = table.querySelector('tbody');
    if (tbody) {
      this.virtualContainer.appendChild(this.spacer);
      this.virtualContainer.appendChild(this.visibleContainer);
      this.visibleContainer.appendChild(tbody);
      
      table.appendChild(this.virtualContainer);
    }
  }

  setupScrollHandler() {
    if (!this.virtualContainer) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateVisibleRows();
          ticking = false;
        });
        ticking = true;
      }
    };

    this.virtualContainer.addEventListener('scroll', handleScroll);
  }

  calculateVisibleRows() {
    if (!this.virtualContainer) return;

    this.containerHeight = this.virtualContainer.clientHeight;
    this.visibleRowCount = Math.ceil(this.containerHeight / this.options.rowHeight) + this.options.bufferSize;
  }

  setData(data) {
    this.data = data;
    this.updateSpacerHeight();
    this.updateVisibleRows();
  }

  updateSpacerHeight() {
    if (!this.spacer) return;
    
    const totalHeight = this.data.length * this.options.rowHeight;
    this.spacer.style.height = `${totalHeight}px`;
  }

  updateVisibleRows() {
    if (!this.virtualContainer || !this.visibleContainer) return;

    const scrollTop = this.virtualContainer.scrollTop;
    
    // Calculate which rows should be visible
    this.visibleStartIndex = Math.floor(scrollTop / this.options.rowHeight);
    this.visibleEndIndex = Math.min(
      this.visibleStartIndex + this.visibleRowCount,
      this.data.length
    );

    // Ensure we don't go negative
    this.visibleStartIndex = Math.max(0, this.visibleStartIndex - this.options.bufferSize);

    // Update visible container position
    this.visibleContainer.style.transform = `translateY(${this.visibleStartIndex * this.options.rowHeight}px)`;

    // Render only visible rows
    this.renderVisibleRows();
  }

  renderVisibleRows() {
    const tbody = this.visibleContainer.querySelector('tbody');
    if (!tbody) return;

    const visibleData = this.data.slice(this.visibleStartIndex, this.visibleEndIndex);
    
    // Use the existing row renderer but only for visible rows
    if (this.options.renderRow) {
      const rowsHtml = visibleData.map((item, index) => {
        const actualIndex = this.visibleStartIndex + index;
        return this.options.renderRow(item, actualIndex);
      }).join('');

      tbody.innerHTML = rowsHtml;
    }
  }

  destroy() {
    if (this.virtualContainer) {
      this.virtualContainer.removeEventListener('scroll', this.handleScroll);
    }
  }
}

/**
 * Optimized table update using virtual scrolling
 */
export function createVirtualTransactionTable(tableBody, data, options = {}) {
  if (!tableBody || !data || data.length < 100) {
    // Use regular rendering for small datasets
    return null;
  }

  const table = tableBody.closest('table');
  if (!table) return null;

  const virtualTable = new VirtualTable(table.parentElement, {
    rowHeight: 45,
    bufferSize: 5,
    renderRow: options.renderRow,
    ...options
  });

  virtualTable.setData(data);
  return virtualTable;
}

// Export utilities
window.virtualTable = {
  VirtualTable,
  createVirtualTransactionTable
};