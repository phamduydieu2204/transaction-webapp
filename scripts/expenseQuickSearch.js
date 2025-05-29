/**
 * expenseQuickSearch.js
 * 
 * Xử lý tìm kiếm nhanh khoản chi theo mô tả
 */

import { getConstants } from './constants.js';

let searchTimeout = null;
let currentSearchResults = [];

/**
 * Initialize expense quick search
 */
export function initExpenseQuickSearch() {
  const searchInput = document.getElementById('expenseQuickSearch');
  const clearBtn = document.getElementById('clearExpenseSearch');
  const resultsDiv = document.getElementById('expenseSearchResults');
  
  if (!searchInput) return;
  
  // Handle input events
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Show/hide clear button
    clearBtn.style.display = query ? 'block' : 'none';
    
    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Hide results if query is empty
    if (!query) {
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      return;
    }
    
    // Debounce search
    searchTimeout = setTimeout(() => {
      searchExpenseDescriptions(query);
    }, 300);
  });
  
  // Handle click outside to close dropdown
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });
  
  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    handleKeyboardNavigation(e);
  });
}

/**
 * Search expense descriptions
 */
async function searchExpenseDescriptions(query) {
  const { BACKEND_URL } = getConstants();
  const resultsDiv = document.getElementById('expenseSearchResults');
  
  try {
    // Show loading state
    resultsDiv.innerHTML = '<div class="search-loading">Đang tìm kiếm...</div>';
    resultsDiv.style.display = 'block';
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'searchExpenseByDescription',
        query: query
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      currentSearchResults = result.data || [];
      console.log('Search results received:', currentSearchResults);
      currentSearchResults.forEach((item, index) => {
        console.log(`Result ${index}: "${item.description}"`);
      });
      displaySearchResults(currentSearchResults);
    } else {
      console.error('Search error:', result);
      resultsDiv.innerHTML = '<div class="search-error">Lỗi khi tìm kiếm</div>';
    }
  } catch (error) {
    console.error('Error searching expenses:', error);
    resultsDiv.innerHTML = '<div class="search-error">Lỗi kết nối</div>';
  }
}

/**
 * Display search results
 */
function displaySearchResults(results) {
  const resultsDiv = document.getElementById('expenseSearchResults');
  
  if (results.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">Không tìm thấy kết quả phù hợp</div>';
    return;
  }
  
  resultsDiv.innerHTML = results.map((item, index) => `
    <div class="search-result-item" data-index="${index}" onclick="selectExpenseItem(${index})">
      <div class="result-text">${highlightMatch(item.description, document.getElementById('expenseQuickSearch').value)}</div>
    </div>
  `).join('');
  
  // Add hover effect
  const items = resultsDiv.querySelectorAll('.search-result-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      items.forEach(i => i.classList.remove('hover'));
      item.classList.add('hover');
    });
  });
}

/**
 * Highlight matching text
 */
function highlightMatch(text, query) {
  if (!query || !text) return text || '';
  
  // Clean the text thoroughly - remove line breaks, tabs, and extra spaces
  const cleanText = text.toString()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`Original text: "${text}"`);
  console.log(`Clean text: "${cleanText}"`);
  console.log(`Query: "${query}"`);
  
  // Escape special regex characters in query
  const queryTerms = query.split(/\s+/).filter(term => term.length > 0);
  const escapedQuery = queryTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  console.log(`Escaped query: "${escapedQuery}"`);
  
  if (!escapedQuery) return cleanText;
  
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const result = cleanText.replace(regex, '<mark>$1</mark>');
  
  console.log(`Highlighted result: "${result}"`);
  
  return result;
}

/**
 * Select expense item
 */
window.selectExpenseItem = function(index) {
  const item = currentSearchResults[index];
  if (!item) return;
  
  // Fill form fields
  document.getElementById('expenseCategory').value = item.category || '';
  if (window.handleCategoryChange) window.handleCategoryChange();
  
  setTimeout(() => {
    document.getElementById('expenseSubCategory').value = item.subCategory || '';
    if (window.handleSubCategoryChange) window.handleSubCategoryChange();
    
    setTimeout(() => {
      document.getElementById('expenseProduct').value = item.product || '';
      if (window.handleProductChange) window.handleProductChange();
      
      setTimeout(() => {
        document.getElementById('expensePackage').value = item.package || '';
        
        // Fill account used if available
        const accountField = document.getElementById('expenseAccount');
        if (accountField && item.accountUsed) {
          accountField.value = item.accountUsed;
        }
      }, 100);
    }, 100);
  }, 100);
  
  // Clear search
  clearExpenseSearch();
  
  // Show success message
  showSuccessMessage('Đã chọn: ' + item.description);
}

/**
 * Clear expense search
 */
window.clearExpenseSearch = function() {
  const searchInput = document.getElementById('expenseQuickSearch');
  const clearBtn = document.getElementById('clearExpenseSearch');
  const resultsDiv = document.getElementById('expenseSearchResults');
  
  searchInput.value = '';
  clearBtn.style.display = 'none';
  resultsDiv.style.display = 'none';
  resultsDiv.innerHTML = '';
  currentSearchResults = [];
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(e) {
  const resultsDiv = document.getElementById('expenseSearchResults');
  const items = resultsDiv.querySelectorAll('.search-result-item');
  
  if (!items.length) return;
  
  let currentIndex = -1;
  items.forEach((item, index) => {
    if (item.classList.contains('hover')) currentIndex = index;
  });
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      currentIndex = (currentIndex + 1) % items.length;
      items.forEach(i => i.classList.remove('hover'));
      items[currentIndex].classList.add('hover');
      items[currentIndex].scrollIntoView({ block: 'nearest' });
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      items.forEach(i => i.classList.remove('hover'));
      items[currentIndex].classList.add('hover');
      items[currentIndex].scrollIntoView({ block: 'nearest' });
      break;
      
    case 'Enter':
      e.preventDefault();
      if (currentIndex >= 0) {
        selectExpenseItem(currentIndex);
      }
      break;
      
    case 'Escape':
      clearExpenseSearch();
      break;
  }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Add CSS for animations and styles
const style = document.createElement('style');
style.textContent = `
  .search-loading, .search-error, .no-results {
    padding: 12px;
    text-align: center;
    color: #6c757d;
  }
  
  .search-error {
    color: #dc3545;
  }
  
  .search-result-item {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
    min-height: 36px;
    display: flex;
    align-items: center;
  }
  
  .search-result-item:last-child {
    border-bottom: none;
  }
  
  .search-result-item:hover,
  .search-result-item.hover {
    background: #f8f9fa;
  }
  
  .result-text {
    font-weight: 500;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
  
  .result-text mark {
    background: #fff3cd;
    padding: 0 2px;
    border-radius: 2px;
  }
  
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExpenseQuickSearch);
} else {
  initExpenseQuickSearch();
}