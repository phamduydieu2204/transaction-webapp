/**
 * Initialize Software Tab
 * Handles software data loading, display, and pagination
 */

import { getConstants } from './constants.js';

// Global variables for software tab
window.softwareList = [];
window.currentSoftwarePage = 1;
window.softwareItemsPerPage = 10;

export function initSoftwareTab() {
  console.log('💿 Initializing software tab...');
  
  // Initialize pagination controls
  initSoftwarePagination();
  
  // Load software data
  loadSoftwareData();
  
  console.log('✅ Software tab initialized');
}

async function loadSoftwareData() {
  try {
    const { BACKEND_URL } = getConstants();
    
    console.log('🔄 Loading software data...');
    
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getSoftwareListFull" // We'll need to create this action
      })
    });
    
    const result = await response.json();
    
    if (result.status === "success") {
      window.softwareList = result.data || [];
      console.log(`✅ Loaded ${window.softwareList.length} software items`);
      
      // Update display
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
    } else {
      console.error('❌ Error loading software data:', result.message);
      window.softwareList = [];
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
    }
    
  } catch (error) {
    console.error('❌ Error loading software data:', error);
    window.softwareList = [];
    updateSoftwareTable();
    updateSoftwareTotalDisplay();
  }
}

function updateSoftwareTable() {
  const tbody = document.getElementById('softwareTableBody');
  if (!tbody) return;
  
  const itemsPerPage = parseInt(document.getElementById('softwareItemsPerPage')?.value || 10);
  const startIndex = (window.currentSoftwarePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = window.softwareList.slice(startIndex, endIndex);
  
  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
          Không có dữ liệu phần mềm
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = pageData.map((software, index) => {
    const actualIndex = startIndex + index + 1;
    const loginInfo = formatLoginInfo(software);
    const lastModified = formatDate(software.lastModified);
    const price = formatCurrency(software.price);
    
    return `
      <tr>
        <td style="text-align: center;">${actualIndex}</td>
        <td>${escapeHtml(software.softwareName || '')}</td>
        <td>${escapeHtml(software.softwarePackage || '')}</td>
        <td>${escapeHtml(software.accountName || '')}</td>
        <td style="text-align: right;">${price}</td>
        <td class="login-info-cell">${loginInfo}</td>
        <td style="text-align: center;">${lastModified}</td>
        <td style="text-align: center;">
          <select class="action-select" onchange="handleSoftwareAction(this, ${startIndex + index})">
            <option value="">-- Chọn hành động --</option>
            <option value="view">Xem chi tiết</option>
            <option value="edit">Chỉnh sửa</option>
            <option value="openSheet">Mở Google Sheet</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
  
  updateSoftwarePagination();
}

function formatLoginInfo(software) {
  const items = [];
  
  if (software.username) {
    items.push(`
      <div class="login-item">
        <span class="login-label">Email:</span>
        <span class="login-value">${escapeHtml(software.username)}</span>
        <button class="copy-small-btn" onclick="copyToClipboard('${escapeHtml(software.username)}')" title="Sao chép email">📋</button>
      </div>
    `);
  }
  
  if (software.password) {
    items.push(`
      <div class="login-item">
        <span class="login-label">Mật khẩu:</span>
        <span class="login-value password-mask">${maskPassword(software.password)}</span>
        <button class="copy-small-btn" onclick="copyToClipboard('${escapeHtml(software.password)}')" title="Sao chép mật khẩu">📋</button>
      </div>
    `);
  }
  
  if (software.secret) {
    items.push(`
      <div class="login-item">
        <span class="login-label">Secret:</span>
        <span class="login-value secret-mask">${maskSecret(software.secret)}</span>
        <button class="copy-small-btn" onclick="copyToClipboard('${escapeHtml(software.secret)}')" title="Sao chép secret">📋</button>
      </div>
    `);
  }
  
  return items.length > 0 ? items.join('') : '<span class="no-data">Chưa có thông tin</span>';
}

function maskPassword(password) {
  if (!password) return '';
  return password.length > 8 ? password.substring(0, 4) + '***' + password.substring(password.length - 2) : '***';
}

function maskSecret(secret) {
  if (!secret) return '';
  return secret.length > 8 ? secret.substring(0, 4) + '***' + secret.substring(secret.length - 4) : '***';
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return '';
  }
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '';
  
  try {
    const number = parseFloat(amount);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(number);
  } catch (error) {
    return amount.toString();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateSoftwareTotalDisplay() {
  const totalDisplay = document.getElementById('softwareTotalDisplay');
  if (totalDisplay) {
    totalDisplay.textContent = `Tổng: ${window.softwareList.length} phần mềm`;
  }
}

function initSoftwarePagination() {
  // Items per page change handler
  const itemsPerPageSelect = document.getElementById('softwareItemsPerPage');
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', () => {
      window.currentSoftwarePage = 1;
      updateSoftwareTable();
    });
  }
  
  // Previous button
  const prevBtn = document.getElementById('softwarePrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (window.currentSoftwarePage > 1) {
        window.currentSoftwarePage--;
        updateSoftwareTable();
      }
    });
  }
  
  // Next button
  const nextBtn = document.getElementById('softwareNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const itemsPerPage = parseInt(document.getElementById('softwareItemsPerPage')?.value || 10);
      const totalPages = Math.ceil(window.softwareList.length / itemsPerPage);
      
      if (window.currentSoftwarePage < totalPages) {
        window.currentSoftwarePage++;
        updateSoftwareTable();
      }
    });
  }
}

function updateSoftwarePagination() {
  const itemsPerPage = parseInt(document.getElementById('softwareItemsPerPage')?.value || 10);
  const totalItems = window.softwareList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Update page info
  const pageInfo = document.getElementById('softwarePageInfo');
  if (pageInfo) {
    const startIndex = (window.currentSoftwarePage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(window.currentSoftwarePage * itemsPerPage, totalItems);
    pageInfo.textContent = `Hiển thị ${startIndex}-${endIndex} của ${totalItems} phần mềm`;
  }
  
  // Update buttons
  const prevBtn = document.getElementById('softwarePrevBtn');
  const nextBtn = document.getElementById('softwareNextBtn');
  
  if (prevBtn) {
    prevBtn.disabled = window.currentSoftwarePage <= 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = window.currentSoftwarePage >= totalPages;
  }
  
  // Update page numbers
  const pageNumbers = document.getElementById('softwarePageNumbers');
  if (pageNumbers) {
    pageNumbers.innerHTML = generatePageNumbers(window.currentSoftwarePage, totalPages);
  }
}

function generatePageNumbers(currentPage, totalPages) {
  if (totalPages <= 1) return '';
  
  let pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === currentPage;
    pages.push(`
      <button class="page-number ${isActive ? 'active' : ''}" 
              onclick="goToSoftwarePage(${i})"
              ${isActive ? 'disabled' : ''}>
        ${i}
      </button>
    `);
  }
  
  return pages.join('');
}

// Global functions
window.goToSoftwarePage = function(page) {
  window.currentSoftwarePage = page;
  updateSoftwareTable();
};

window.handleSoftwareAction = function(selectElement, index) {
  const action = selectElement.value;
  if (!action) return;
  
  const software = window.softwareList[index];
  if (!software) return;
  
  switch (action) {
    case 'view':
      // TODO: Implement view details
      console.log('View software:', software);
      break;
    case 'edit':
      // TODO: Implement edit
      console.log('Edit software:', software);
      break;
    case 'openSheet':
      if (software.accountSheetId) {
        window.open(`https://docs.google.com/spreadsheets/d/${software.accountSheetId}/edit`, '_blank');
      }
      break;
  }
  
  // Reset select
  selectElement.value = '';
};

window.copyToClipboard = function(text) {
  if (!text) {
    alert('⚠️ Không có dữ liệu để sao chép!');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    // Show a brief success indicator
    console.log('✅ Copied to clipboard:', text);
  }).catch(() => {
    alert('❌ Không thể sao chép dữ liệu!');
  });
};