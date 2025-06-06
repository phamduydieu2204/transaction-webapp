import { getConstants } from './constants.js';
import { showResultModal } from './showResultModal.js';

/**
 * Initialize expense quick search functionality
 */
export function initExpenseQuickSearchNew() {
  const searchInput = document.getElementById('expenseQuickSearch');
  const searchDropdown = document.getElementById('expenseSearchDropdown');
  
  if (!searchInput || !searchDropdown) {
    console.warn('Expense quick search elements not found');
    return;
  }

  let searchDebounceTimer;
  let selectedIndex = -1;
  let searchResults = [];

  // Handle input events
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      hideDropdown();
      return;
    }
    
    searchDebounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (!searchResults.length) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
        updateSelection();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection();
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          selectItem(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          selectItem(searchResults[0]);
        }
        break;
        
      case 'Escape':
        hideDropdown();
        searchInput.blur();
        break;
    }
  });

  // Handle click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      hideDropdown();
    }
  });

  // Handle search icon click
  const searchIcon = searchInput.previousElementSibling;
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        performSearch(query);
      }
    });
  }

  /**
   * Perform search
   */
  async function performSearch(query) {
    showLoading();
    
    try {
      const { BACKEND_URL } = getConstants();
      
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "searchExpenseCategories",
          query: query
        })
      });

      const result = await response.json();
      
      if (result.status === "success") {
        searchResults = result.data || [];
        displayResults(searchResults, query);
      } else {
        showError(result.message || "Không thể tìm kiếm");
      }
      
    } catch (error) {
      console.error("Error searching expense categories:", error);
      showError("Lỗi khi tìm kiếm: " + error.message);
    }
  }

  /**
   * Display search results
   */
  function displayResults(results, query) {
    if (!results.length) {
      showEmpty();
      return;
    }
    
    const html = results.map((item, index) => {
      const title = item.description || 
        `${item.type || ''} - ${item.category || ''} - ${item.product || ''} - ${item.package || ''}`.trim();
      
      const highlightedTitle = highlightText(title, query);
      
      return `
        <div class="search-dropdown-item ${index === selectedIndex ? 'selected' : ''}" 
             data-index="${index}">
          <div class="search-dropdown-item-title">${highlightedTitle}</div>
          ${item.description ? 
            `<div class="search-dropdown-item-subtitle">
              ${item.type || ''} - ${item.category || ''} - ${item.product || ''} - ${item.package || ''}
            </div>` : ''
          }
        </div>
      `;
    }).join('');
    
    searchDropdown.innerHTML = html;
    searchDropdown.style.display = 'block';
    
    // Add click handlers
    searchDropdown.querySelectorAll('.search-dropdown-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        selectItem(searchResults[index]);
      });
      
      item.addEventListener('mouseenter', () => {
        selectedIndex = index;
        updateSelection();
      });
    });
  }

  /**
   * Select an item and fill form
   */
  function selectItem(item) {
    console.log('Selected item:', item);
    
    // Fill form fields
    fillFormField('expenseCategory', item.type);
    
    // Trigger change event to update dependent dropdowns
    const categoryField = document.getElementById('expenseCategory');
    if (categoryField) {
      categoryField.dispatchEvent(new Event('change'));
      
      // Wait for dropdown to update then fill subcategory
      setTimeout(() => {
        fillFormField('expenseSubCategory', item.category);
        
        const subCategoryField = document.getElementById('expenseSubCategory');
        if (subCategoryField) {
          subCategoryField.dispatchEvent(new Event('change'));
          
          // Wait for dropdown to update then fill product
          setTimeout(() => {
            fillFormField('expenseProduct', item.product);
            
            const productField = document.getElementById('expenseProduct');
            if (productField) {
              productField.dispatchEvent(new Event('change'));
              
              // Wait for dropdown to update then fill package
              setTimeout(() => {
                fillFormField('expensePackage', item.package);
              }, 100);
            }
          }, 100);
        }
      }, 100);
    }
    
    // Clear search and hide dropdown
    searchInput.value = '';
    hideDropdown();
    
    // Show success message
    showResultModal(`Đã chọn: ${item.description || 'Chi phí'}`, true);
  }

  /**
   * Fill form field
   */
  function fillFormField(fieldId, value) {
    if (!value) return;
    
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value;
      // Remove error state if any
      const formField = field.closest('.form-field');
      if (formField) {
        formField.classList.remove('error');
      }
    }
  }

  /**
   * Highlight matching text
   */
  function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  /**
   * Escape regex special characters
   */
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Update selection highlight
   */
  function updateSelection() {
    const items = searchDropdown.querySelectorAll('.search-dropdown-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedIndex);
    });
  }

  /**
   * Show loading state
   */
  function showLoading() {
    searchDropdown.innerHTML = `
      <div class="search-dropdown-loading">
        <div class="spinner"></div>
        <div>Đang tìm kiếm...</div>
      </div>
    `;
    searchDropdown.style.display = 'block';
  }

  /**
   * Show empty state
   */
  function showEmpty() {
    searchDropdown.innerHTML = `
      <div class="search-dropdown-empty">
        Không tìm thấy kết quả phù hợp
      </div>
    `;
    searchDropdown.style.display = 'block';
  }

  /**
   * Show error state
   */
  function showError(message) {
    searchDropdown.innerHTML = `
      <div class="search-dropdown-empty" style="color: #dc3545;">
        ${message}
      </div>
    `;
    searchDropdown.style.display = 'block';
  }

  /**
   * Hide dropdown
   */
  function hideDropdown() {
    searchDropdown.style.display = 'none';
    selectedIndex = -1;
    searchResults = [];
  }
}

// Make function available globally
window.initExpenseQuickSearchNew = initExpenseQuickSearchNew;