/**
 * Initialize Software Tab
 * Handles software data loading, display, and pagination
 */

import { getConstants } from './constants.js';
import { handleDeleteSoftware } from './handleDeleteSoftware.js';
import { apiRequestJson } from './apiClient.js';

// Global variables for software tab
window.softwareList = [];
window.currentSoftwarePage = 1;
window.softwareItemsPerPage = 10;
window.currentEditSoftwareIndex = -1;

export function initSoftwareTab() {
  // Initializing software tab
  
  // Initialize pagination controls
  initSoftwarePagination();
  
  // Initialize form dropdowns
  initSoftwareFormDropdowns();
  
  // Load software data
  loadSoftwareData();
  
  // Debug checkbox positioning
  debugCheckboxPosition();
  
  // Software tab initialized
}

// Debug function to check checkbox positioning
function debugCheckboxPosition() {
  setTimeout(() => {
    // DEBUG CHECKBOX POSITION
    
    const accountSheetInput = document.getElementById('accountSheetId');
    const checkbox = document.getElementById('templateFile');
    const container = document.querySelector('.date-input-container');
    
    if (accountSheetInput) {
      const inputRect = accountSheetInput.getBoundingClientRect();
      const inputStyles = window.getComputedStyle(accountSheetInput);
      // Check ID Sheet Input dimensions and position
    } else {
      // ID Sheet input not found
    }
    
    if (checkbox) {
      const checkboxRect = checkbox.getBoundingClientRect();
      const checkboxStyles = window.getComputedStyle(checkbox);
      // Check checkbox dimensions and position
      
      // Check if checkbox is overlapping input text area
      if (accountSheetInput && checkbox) {
        const inputRect = accountSheetInput.getBoundingClientRect();
        const checkboxRect = checkbox.getBoundingClientRect();
        const overlap = inputRect.right - checkboxRect.left;
        const inputPaddingRight = parseFloat(window.getComputedStyle(accountSheetInput).paddingRight);
        
        // Analyze checkbox overlap with input
      }
    } else {
      // Checkbox not found
    }
    
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const containerStyles = window.getComputedStyle(container);
      // Check container dimensions
    }
    
    // END DEBUG
  }, 500); // Wait for DOM to fully render
}

// Global debug function that can be called from console
window.debugCheckboxNow = function() {
  debugCheckboxPosition();
}

async function loadSoftwareData() {
  try {
    // Loading software data
    
    // Show loading modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang tải dữ liệu phần mềm...');
    } else if (typeof showProcessingModal === 'function') {
      showProcessingModal('Đang tải dữ liệu phần mềm...');
    }
    
    const result = await apiRequestJson({
      action: "getSoftwareListFull"
    });
    
    // Close loading modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    }
    
    if (result.status === "success") {
      window.softwareList = result.data || [];
      // Successfully loaded software items
      
      // Debug: Log sample data to check fields
      if (window.softwareList.length > 0) {
        // Check sample software data and validate fields
        const hasOrderInfo = window.softwareList.some(item => item.orderInfo);
        const hasPasswordChangeDays = window.softwareList.some(item => item.passwordChangeDays);
      }
      
      // Update display
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
      
      // Update form dropdowns
      updateSoftwareFormDropdowns();
    } else {
      // Error loading software data
      window.softwareList = [];
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
    }
    
  } catch (error) {
    // Close loading modal if error occurs
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    }
    
    // Error loading software data
    window.softwareList = [];
    updateSoftwareTable();
    updateSoftwareTotalDisplay();
    
    // Show error message
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Không thể tải dữ liệu phần mềm', false);
    }
  }
}

function updateSoftwareTable() {
  const tbody = document.getElementById('softwareTableBody');
  if (!tbody) return;
  
  const startIndex = (window.currentSoftwarePage - 1) * window.softwareItemsPerPage;
  const endIndex = startIndex + window.softwareItemsPerPage;
  const pageData = window.softwareList.slice(startIndex, endIndex);
  
  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align: center; padding: 20px; color: #666;">
          Không có dữ liệu phần mềm
        </td>
      </tr>
    `;
    return;
  }
  
  // Get search terms for highlighting if in search mode
  const searchTerms = window.isSoftwareSearching ? getCurrentSearchTerms() : [];
  
  tbody.innerHTML = pageData.map((software, index) => {
    const actualIndex = startIndex + index + 1;
    const loginInfo = formatLoginInfo(software);
    const lastModified = formatDate(software.lastModified);
    const renewalDate = formatDate(software.renewalDate);
    const price = formatCurrency(software.price);
    
    // Apply highlighting if searching
    const softwareName = window.isSoftwareSearching ? 
      highlightSearchTerms(software.softwareName || '', searchTerms) : 
      escapeHtml(software.softwareName || '');
    
    const softwarePackage = window.isSoftwareSearching ? 
      highlightSearchTerms(software.softwarePackage || '', searchTerms) : 
      escapeHtml(software.softwarePackage || '');
    
    const accountName = window.isSoftwareSearching ? 
      highlightSearchTerms(software.accountName || '', searchTerms) : 
      escapeHtml(software.accountName || '');
    
    const note = window.isSoftwareSearching ? 
      highlightSearchTerms(software.note || '', searchTerms) : 
      escapeHtml(software.note || '');
    
    // Build action dropdown based on fileType
    // When searching, use the local index. When not searching, use the global index
    const actionIndex = window.isSoftwareSearching ? index : (startIndex + index);
    const actionDropdown = buildSoftwareActionDropdown(software.fileType, actionIndex);
    
    // Get row background color based on date difference
    const rowBackgroundColor = getSoftwareRowColor(software.lastModified, software.passwordChangeDays);
    
    // Combine search highlighting with date-based coloring
    let rowStyle = '';
    if (window.isSoftwareSearching) {
      rowStyle = 'style="background-color: #f8f9fa;"'; // Search mode takes priority
    } else if (rowBackgroundColor) {
      rowStyle = `style="${rowBackgroundColor}"`;
    }
    
    return `
      <tr ${rowStyle}>
        <td style="text-align: center;">${actualIndex}</td>
        <td>${softwareName}</td>
        <td>${softwarePackage}</td>
        <td>${accountName}</td>
        <td style="text-align: right;">${price}</td>
        <td style="text-align: center;">${software.allowedUsers || '-'}</td>
        <td class="login-info-cell">${loginInfo}</td>
        <td style="text-align: center;">${lastModified}</td>
        <td style="text-align: center;">${renewalDate}</td>
        <td>${escapeHtml(software.fileType || '')}</td>
        <td style="max-width: 200px; word-wrap: break-word;">${note || ''}</td>
        <td style="text-align: center;">
          ${actionDropdown}
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
    // If it's already in dd/mm/yyyy format, return as is
    if (typeof dateValue === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
      return dateValue;
    }
    
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
    if (window.isSoftwareSearching) {
      totalDisplay.innerHTML = `
        <span style="color: #007bff;">🔍 Kết quả tìm kiếm: ${window.softwareList.length} phần mềm</span>
        <button onclick="clearSoftwareSearch()" style="margin-left: 10px; padding: 4px 8px; font-size: 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Xóa bộ lọc
        </button>
      `;
    } else {
      totalDisplay.textContent = `Tổng: ${window.softwareList.length} phần mềm`;
    }
  }
}

function initSoftwarePagination() {
  // Software pagination functions - mirror transaction pagination pattern
  window.softwareFirstPage = () => {
    window.currentSoftwarePage = 1;
    updateSoftwareTable();
  };
  
  window.softwarePrevPage = () => {
    if (window.currentSoftwarePage > 1) {
      window.currentSoftwarePage--;
      updateSoftwareTable();
    }
  };
  
  window.softwareNextPage = () => {
    const totalPages = Math.ceil(window.softwareList.length / window.softwareItemsPerPage);
    if (window.currentSoftwarePage < totalPages) {
      window.currentSoftwarePage++;
      updateSoftwareTable();
    }
  };
  
  window.softwareLastPage = () => {
    const totalPages = Math.ceil(window.softwareList.length / window.softwareItemsPerPage);
    window.currentSoftwarePage = totalPages;
    updateSoftwareTable();
  };
  
  window.softwareGoToPage = (page) => {
    const totalPages = Math.ceil(window.softwareList.length / window.softwareItemsPerPage);
    if (page >= 1 && page <= totalPages) {
      window.currentSoftwarePage = page;
      updateSoftwareTable();
    }
  };
}

function updateSoftwarePagination() {
  const totalItems = window.softwareList.length;
  const totalPages = Math.ceil(totalItems / window.softwareItemsPerPage);
  const pagination = document.getElementById("softwarePagination");
  
  if (!pagination) return;
  
  pagination.innerHTML = "";

  // First button
  const firstButton = document.createElement("button");
  firstButton.textContent = "«";
  firstButton.onclick = window.softwareFirstPage;
  firstButton.disabled = window.currentSoftwarePage === 1;
  pagination.appendChild(firstButton);

  // Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "‹";
  prevButton.onclick = window.softwarePrevPage;
  prevButton.disabled = window.currentSoftwarePage === 1;
  pagination.appendChild(prevButton);

  const maxVisiblePages = 5;
  let startPage = Math.max(1, window.currentSoftwarePage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "4px 8px";
    pagination.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.onclick = () => window.softwareGoToPage(i);
    if (i === window.currentSoftwarePage) {
      pageButton.classList.add("active");
    }
    pagination.appendChild(pageButton);
  }

  if (endPage < totalPages) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.padding = "4px 8px";
    pagination.appendChild(dots);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.onclick = window.softwareNextPage;
  nextButton.disabled = window.currentSoftwarePage === totalPages;
  pagination.appendChild(nextButton);

  // Last button
  const lastButton = document.createElement("button");
  lastButton.textContent = "»";
  lastButton.onclick = window.softwareLastPage;
  lastButton.disabled = window.currentSoftwarePage === totalPages;
  pagination.appendChild(lastButton);
}

// Global functions - Legacy support
window.goToSoftwarePage = function(page) {
  window.softwareGoToPage(page);
};

window.handleSoftwareAction = function(selectElement, index) {
  const action = selectElement.value;
  if (!action) return;
  
  const software = window.softwareList[index];
  if (!software) return;
  
  switch (action) {
    case 'view':
      // TODO: Implement view details
      // View software details
      break;
    case 'edit':
      // Edit software
      editSoftwareItem(software, index);
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

// ========================================
// EDIT SOFTWARE FUNCTIONALITY
// ========================================

function editSoftwareItem(software, index) {
  // Editing software at specified index
  
  // Set the edit index
  window.currentEditSoftwareIndex = index;
  
  // Fill form with software data
  const formElements = {
    softwareFormName: document.getElementById('softwareFormName'),
    softwareFormPackage: document.getElementById('softwareFormPackage'),
    softwareFormAccount: document.getElementById('softwareFormAccount'),
    price: document.getElementById('price'),
    allowedUsers: document.getElementById('allowedUsers'),
    accountSheetId: document.getElementById('accountSheetId'),
    orderInfo: document.getElementById('orderInfo'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginSecret: document.getElementById('loginSecret'),
    standardName: document.getElementById('standardName'),
    renewalDate: document.getElementById('renewalDate'),
    softwareNote: document.getElementById('softwareNote'),
    fileType: document.getElementById('fileType'),
    templateFile: document.getElementById('templateFile')
  };
  
  // Batch DOM updates to prevent layout thrashing
  requestAnimationFrame(() => {
    // Fill form fields
    if (formElements.softwareFormName) formElements.softwareFormName.value = software.softwareName || '';
    if (formElements.softwareFormPackage) formElements.softwareFormPackage.value = software.softwarePackage || '';
    if (formElements.softwareFormAccount) formElements.softwareFormAccount.value = software.accountName || '';
    if (formElements.price) formElements.price.value = software.price || '';
    if (formElements.allowedUsers) formElements.allowedUsers.value = software.allowedUsers || '';
    if (formElements.accountSheetId) formElements.accountSheetId.value = software.accountSheetId || '';
    if (formElements.orderInfo) formElements.orderInfo.value = software.orderInfo || '';
    if (formElements.loginUsername) formElements.loginUsername.value = software.username || '';
    if (formElements.loginPassword) formElements.loginPassword.value = software.password || '';
    if (formElements.loginSecret) formElements.loginSecret.value = software.secret || '';
    if (formElements.standardName) formElements.standardName.value = software.standardName || '';
    if (formElements.softwareNote) formElements.softwareNote.value = software.note || '';
    if (formElements.fileType) formElements.fileType.value = software.fileType || '';
    if (formElements.templateFile) formElements.templateFile.checked = software.templateFile || false;
    
    // Handle renewalDate - convert from dd/mm/yyyy to yyyy-mm-dd for input[type="date"]
    if (formElements.renewalDate && software.renewalDate) {
      const convertToInputDate = (vietnameseDate) => {
        if (!vietnameseDate) return '';
        const parts = vietnameseDate.split('/');
        if (parts.length === 3) {
          // Convert dd/mm/yyyy to yyyy-mm-dd
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return '';
      };
      formElements.renewalDate.value = convertToInputDate(software.renewalDate);
    }
    
    // Update form dropdowns to match the selected values
    updateSoftwareFormDropdowns();
    
    // Scroll to form
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Show success message
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(
        `Dữ liệu phần mềm "${software.softwareName}" đã được tải vào form. Bạn có thể chỉnh sửa và nhấn "Cập nhật" để lưu thay đổi.`, 
        true
      );
    }
    
    // Software data loaded into form for editing
  });
  
  // Reset the action select
  setTimeout(() => {
    const selectElement = document.querySelector(`select[onchange*="handleSoftwareAction(this, ${index})"]`);
    if (selectElement) {
      selectElement.value = '';
    }
  }, 100);
}

window.copyToClipboard = function(text) {
  if (!text) {
    alert('⚠️ Không có dữ liệu để sao chép!');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    // Show a brief success indicator
    // Successfully copied to clipboard
  }).catch(() => {
    alert('❌ Không thể sao chép dữ liệu!');
  });
};

// Software form handlers
window.handleSoftwareAdd = async function() {
  // Adding new software
  
  try {
    // Get form data
    const formData = getSoftwareFormData();
    
    // Debug log the form data being sent
    
    // Also log the actual DOM element values to compare
    const usernameElement = document.getElementById('loginUsername');
    const passwordElement = document.getElementById('loginPassword');
    const checkboxElement = document.getElementById('templateFile');
    
    // Check DOM element values directly
    
    // Validate required fields
    if (!validateSoftwareForm(formData)) {
      return;
    }
    
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang thêm phần mềm...');
    } else if (typeof showProcessingModal === 'function') {
      showProcessingModal('Đang thêm phần mềm...');
    }
    
    // Call backend API
    const result = await apiRequestJson({
      action: "addSoftware",
      ...formData
    });
    
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      // Show success message
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(result.message || 'Phần mềm đã được thêm thành công', true);
      } else if (typeof showResultModal === 'function') {
        showResultModal(result.message || 'Phần mềm đã được thêm thành công', true);
      } else {
        alert('✅ ' + (result.message || 'Phần mềm đã được thêm thành công'));
      }
      
      // Reset form
      window.handleSoftwareReset();
      
      // Reload software data to reflect changes
      await loadSoftwareData();
      
      // Software added successfully
      
    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi thêm phần mềm';
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(errorMessage, false);
      } else {
        alert('❌ ' + errorMessage);
      }
      // Error adding software
    }
    
  } catch (error) {
    // Close processing modal if still open
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    }
    
    const errorMessage = 'Lỗi kết nối: ' + error.message;
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
    // Network error adding software
  }
};

window.handleSoftwareUpdate = async function() {
  // Updating software
  
  // Check if we're in edit mode
  if (window.currentEditSoftwareIndex === -1) {
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Vui lòng chọn một phần mềm để chỉnh sửa trước', false);
    } else {
      alert('⚠️ Vui lòng chọn một phần mềm để chỉnh sửa trước');
    }
    return;
  }
  
  // Get original software data
  const originalSoftware = window.softwareList[window.currentEditSoftwareIndex];
  if (!originalSoftware) {
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Không tìm thấy dữ liệu phần mềm gốc', false);
    } else {
      alert('❌ Không tìm thấy dữ liệu phần mềm gốc');
    }
    return;
  }
  
  // Get form data
  const formData = getSoftwareFormData();
  
  // Validate required fields
  if (!validateSoftwareForm(formData)) {
    return;
  }
  
  try {
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang cập nhật phần mềm...');
    }
    
    // Prepare update data with original values for identification
    const updateData = {
      // Original values for identification
      originalSoftwareName: originalSoftware.softwareName,
      originalSoftwarePackage: originalSoftware.softwarePackage,
      originalAccountName: originalSoftware.accountName,
      
      // New values for update
      ...formData
    };
    
    // Prepare software update data
    
    // Call backend API
    const result = await apiRequestJson({
      action: "updateSoftware",
      ...updateData
    });
    
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      // Show success message
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(result.message || 'Phần mềm đã được cập nhật thành công', true);
      } else {
        alert('✅ ' + (result.message || 'Phần mềm đã được cập nhật thành công'));
      }
      
      // Reset form and editing state
      window.handleSoftwareReset();
      
      // Reload software data to reflect changes
      await loadSoftwareData();
      
      // Software updated successfully
      
    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi cập nhật phần mềm';
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(errorMessage, false);
      } else {
        alert('❌ ' + errorMessage);
      }
      // Error updating software
    }
    
  } catch (error) {
    // Close processing modal if still open
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    }
    
    const errorMessage = 'Lỗi kết nối: ' + error.message;
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
    // Network error updating software
  }
};


window.handleSoftwareReset = async function() {
  // Resetting software form
  
  // Clear all form fields
  const form = document.getElementById('softwareForm');
  if (form) {
    form.reset();
  }
  
  // Clear any error messages
  clearSoftwareFormErrors();
  
  // Reset any global editing state
  window.currentEditSoftwareIndex = -1;
  
  // Clear search mode if active
  if (window.isSoftwareSearching) {
    window.isSoftwareSearching = false;
    window.softwareSearchTerms = [];
    
    // Show loading modal while reloading data
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang tải lại dữ liệu...');
    }
    
    try {
      // Reload original data
      await loadSoftwareData();
      
      // Close processing modal
      if (typeof closeProcessingModalUnified === 'function') {
        closeProcessingModalUnified();
      }
      
      // Cleared search mode and reloaded original data
    } catch (error) {
      // Close processing modal if error occurs
      if (typeof closeProcessingModalUnified === 'function') {
        closeProcessingModalUnified();
      }
      
      // Error reloading data
      
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified('Có lỗi xảy ra khi tải lại dữ liệu', false);
      }
    }
  }
  
  // Software form reset complete
};

function getSoftwareFormData() {
  return {
    softwareName: document.getElementById('softwareFormName')?.value?.trim() || '',
    softwarePackage: document.getElementById('softwareFormPackage')?.value?.trim() || '',
    accountName: document.getElementById('softwareFormAccount')?.value?.trim() || '',
    price: document.getElementById('price')?.value?.trim() || '',
    allowedUsers: document.getElementById('allowedUsers')?.value?.trim() || '',
    accountSheetId: document.getElementById('accountSheetId')?.value?.trim() || '',
    orderInfo: document.getElementById('orderInfo')?.value?.trim() || '',
    loginUsername: document.getElementById('loginUsername')?.value?.trim() || '',
    loginPassword: document.getElementById('loginPassword')?.value?.trim() || '',
    loginSecret: document.getElementById('loginSecret')?.value?.trim() || '',
    note: document.getElementById('softwareNote')?.value?.trim() || '',
    standardName: document.getElementById('standardName')?.value?.trim() || '',
    renewalDate: document.getElementById('renewalDate')?.value?.trim() || '',
    fileType: document.getElementById('fileType')?.value?.trim() || '',
    templateFile: document.getElementById('templateFile')?.checked || false
  };
}

function validateSoftwareForm(formData) {
  let isValid = true;
  const errors = [];
  
  // Clear previous errors
  clearSoftwareFormErrors();
  
  // Validate required fields
  const requiredFields = [
    { field: 'softwareName', name: 'Tên phần mềm', elementId: 'softwareFormName' },
    { field: 'softwarePackage', name: 'Gói phần mềm', elementId: 'softwareFormPackage' },
    { field: 'accountName', name: 'Tên tài khoản', elementId: 'softwareFormAccount' },
    { field: 'loginUsername', name: 'Tên đăng nhập', elementId: 'loginUsername' },
    { field: 'loginPassword', name: 'Mật khẩu đăng nhập', elementId: 'loginPassword' }
  ];
  
  requiredFields.forEach(({ field, name, elementId }) => {
    if (!formData[field] || formData[field].trim() === '') {
      const errorMsg = `${name} là bắt buộc`;
      showSoftwareFieldError(elementId || field, errorMsg);
      errors.push(errorMsg);
      isValid = false;
    }
  });
  
  // Validate data lengths
  if (formData.softwareName && formData.softwareName.length > 100) {
    showSoftwareFieldError('softwareFormName', 'Tên phần mềm không được vượt quá 100 ký tự');
    errors.push('Tên phần mềm quá dài');
    isValid = false;
  }
  
  if (formData.loginPassword && formData.loginPassword.length < 4) {
    showSoftwareFieldError('loginPassword', 'Mật khẩu phải có ít nhất 4 ký tự');
    errors.push('Mật khẩu quá ngắn');
    isValid = false;
  }
  
  // Show summary error if validation fails
  if (!isValid) {
    // Form validation errors found
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(
        'Lỗi nhập liệu!', 
        'Vui lòng kiểm tra các trường bắt buộc:\n• ' + errors.join('\n• '), 
        'error'
      );
    }
  }
  
  return isValid;
}

function showSoftwareFieldError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  const fieldElement = document.getElementById(fieldId);
  if (fieldElement) {
    fieldElement.classList.add('error');
  }
}

function clearSoftwareFormErrors() {
  const errorElements = document.querySelectorAll('#softwareForm .error-message');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
  
  const fieldElements = document.querySelectorAll('#softwareForm .form-field');
  fieldElements.forEach(element => {
    element.classList.remove('error');
  });
  
  const inputElements = document.querySelectorAll('#softwareForm input, #softwareForm textarea, #softwareForm select');
  inputElements.forEach(element => {
    element.classList.remove('error');
  });
}

// Dropdown management functions
function initSoftwareFormDropdowns() {
  // Initializing software form dropdowns
  
  // Add event listeners for cascading dropdowns
  const softwareNameInput = document.getElementById('softwareFormName');
  const softwarePackageInput = document.getElementById('softwareFormPackage');
  const accountNameInput = document.getElementById('softwareFormAccount');
  
  if (softwareNameInput) {
    // Clear dependent fields when software name changes
    softwareNameInput.addEventListener('input', () => {
      // Software name changed
      // Clear dependent fields only if they have values to avoid unnecessary DOM updates
      if (softwarePackageInput && softwarePackageInput.value) softwarePackageInput.value = '';
      if (accountNameInput && accountNameInput.value) accountNameInput.value = '';
      // Use debounced update for input events
      debouncedDropdownUpdate();
    });
    
    softwareNameInput.addEventListener('change', () => {
      // Software name confirmed
      // Batch these updates in a single requestAnimationFrame
      requestAnimationFrame(() => {
        updateSoftwarePackageDropdown();
        updateAccountNameDropdown();
        updateOrderInfoDropdown();
        updateStandardNameDropdown();
      });
    });
  }
  
  if (softwarePackageInput) {
    // Clear dependent fields when package changes
    softwarePackageInput.addEventListener('input', () => {
      // Software package changed
      // Clear dependent fields only if they have values to avoid unnecessary DOM updates
      if (accountNameInput && accountNameInput.value) accountNameInput.value = '';
      // Use debounced update for input events
      debouncedDropdownUpdate();
    });
    
    softwarePackageInput.addEventListener('change', () => {
      // Software package confirmed
      // Batch these updates in a single requestAnimationFrame
      requestAnimationFrame(() => {
        updateAccountNameDropdown();
        updateOrderInfoDropdown();
        updateStandardNameDropdown();
      });
    });
  }
  
  if (accountNameInput) {
    accountNameInput.addEventListener('input', () => {
      // Account name changed
      // Use debounced update for input events
      debouncedDropdownUpdate();
      debouncedAuthDropdownUpdate(); // Update auth fields when account changes
    });
    
    accountNameInput.addEventListener('change', () => {
      // Account name selected
      // Batch these updates in a single requestAnimationFrame
      requestAnimationFrame(() => {
        updateOrderInfoDropdown();
        updateStandardNameDropdown();
        // Update auth-related dropdowns
        updateLoginUsernameDropdown();
        updateLoginPasswordDropdown();
        updateLoginSecretDropdown();
        updateAccountSheetIdDropdown();
        updateRenewalDateDropdown();
        autoFillFormFromSelection();
      });
    });
  }
  
  // Add event listeners for order info field
  const orderInfoInput = document.getElementById('orderInfo');
  if (orderInfoInput) {
    orderInfoInput.addEventListener('input', () => {
      // Order info changed (typing)
      // Don't auto-fill during typing to avoid interrupting user input
    });
    
    orderInfoInput.addEventListener('change', () => {
      // Order info selected/entered
      // Try to auto-fill if we have a complete selection or manual entry
      autoFillFormFromSelection();
    });
    
    // Also handle when user selects from datalist dropdown
    orderInfoInput.addEventListener('blur', () => {
      // Order info field lost focus
      // Auto-fill when user finishes entering/selecting value
      if (orderInfoInput.value.trim()) {
        autoFillFormFromSelection();
      }
    });
  }
  
  // Add event listeners for standard name field
  const standardNameInput = document.getElementById('standardName');
  if (standardNameInput) {
    standardNameInput.addEventListener('input', () => {
      // Standard name changed (typing)
      // Don't auto-fill during typing to avoid interrupting user input
    });
    
    standardNameInput.addEventListener('change', () => {
      // Standard name selected/entered
      // Try to auto-fill if we have a complete selection or manual entry
      autoFillFormFromSelection();
    });
    
    // Also handle when user selects from datalist dropdown
    standardNameInput.addEventListener('blur', () => {
      // Standard name field lost focus
      // Auto-fill when user finishes entering/selecting value
      if (standardNameInput.value.trim()) {
        autoFillFormFromSelection();
      }
    });
  }
  
  // Software form dropdowns initialized
}

function updateSoftwareFormDropdowns() {
  updateSoftwareNameDropdown();
  updateSoftwarePackageDropdown();
  updateAccountNameDropdown();
  // Level 1 dropdowns (software + package)
  updatePriceDropdown();
  updateAllowedUsersDropdown();
  updateOrderInfoDropdown();
  updateStandardNameDropdown();
  updateFileTypeDropdown();
  // Level 2 dropdowns (software + package + account)
  updateLoginUsernameDropdown();
  updateLoginPasswordDropdown();
  updateLoginSecretDropdown();
  updateAccountSheetIdDropdown();
  updateRenewalDateDropdown();
}

// Debug function để kiểm tra dữ liệu
window.debugSoftwareDropdowns = function() {
  // DEBUG: Software List Data
  
  // Unique software names
  const uniqueNames = [...new Set(window.softwareList.map(item => item.softwareName))].filter(Boolean);
  // Check unique software names
  
  // Unique order info
  const uniqueOrderInfo = [...new Set(window.softwareList.map(item => item.orderInfo))].filter(Boolean);
  // Check unique order info
  
  // Test filtering for first software
  if (uniqueNames.length > 0) {
    const testSoftware = uniqueNames[0];
    const packagesForSoftware = window.softwareList
      .filter(item => item.softwareName === testSoftware)
      .map(item => item.softwarePackage)
      .filter(Boolean);
    // Check packages for test software
    
    const orderInfoForSoftware = window.softwareList
      .filter(item => item.softwareName === testSoftware)
      .map(item => item.orderInfo)
      .filter(Boolean);
    // Check order info for test software
  }
};

// Debounce function to prevent excessive updates
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Smart debounced dropdown update that only updates what's needed
const debouncedDropdownUpdate = debounce(() => {
  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    try {
      updateSoftwarePackageDropdown();
      updateAccountNameDropdown();
      // Level 1 dropdowns: based on software name + package
      updatePriceDropdown();
      updateAllowedUsersDropdown();
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
      updateFileTypeDropdown();
    } catch (error) {
      // Error in debounced dropdown update
    }
  });
}, 100); // Reduced from 150ms to 100ms

// Smart debounced dropdown update for auth fields (requires software + package + account)
const debouncedAuthDropdownUpdate = debounce(() => {
  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    try {
      // Level 2 dropdowns: based on software name + package + account
      updateLoginUsernameDropdown();
      updateLoginPasswordDropdown();
      updateLoginSecretDropdown();
      updateAccountSheetIdDropdown();
      updateRenewalDateDropdown();
    } catch (error) {
      // Error in debounced auth dropdown update
    }
  });
}, 100);

// Function để force refresh tất cả dropdowns - cho debugging
window.forceRefreshDropdowns = function() {
  // Force refreshing all dropdowns
  updateSoftwareFormDropdowns();
  // All dropdowns refreshed
};

// Function để xử lý khi chọn từ order info dropdown
window.selectOrderInfo = function(value) {
  if (value) {
    const orderInfoTextarea = document.getElementById('orderInfo');
    if (orderInfoTextarea) {
      orderInfoTextarea.value = value;
      // Selected order info
      
      // Reset dropdown to default
      const dropdown = document.getElementById('orderInfoDropdown');
      if (dropdown) {
        dropdown.value = '';
      }
      
      // Trigger auto-fill if we have complete selection
      autoFillFormFromSelection();
    }
  }
};

function updateSoftwareNameDropdown() {
  const datalist = document.getElementById('softwareNameList');
  if (!datalist) return;
  
  // Get unique software names from data
  const uniqueNames = [...new Set(window.softwareList.map(item => item.softwareName))].filter(Boolean).sort();
  
  datalist.innerHTML = '';
  uniqueNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
  
  // Updated software name dropdown
}

function updateSoftwarePackageDropdown() {
  const datalist = document.getElementById('softwarePackageList');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  
  if (!datalist) return;
  
  // Filtering packages for software
  
  let packages = [];
  
  if (selectedSoftwareName) {
    // Filter packages by selected software name
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    // Found items matching software name
    
    packages = filteredItems
      .map(item => item.softwarePackage)
      .filter(Boolean);
  } else {
    // Show all packages if no software name selected
    packages = window.softwareList.map(item => item.softwarePackage).filter(Boolean);
    // Showing all packages (no filter)
  }
  
  // Get unique packages and sort
  const uniquePackages = [...new Set(packages)].sort();
  
  // Check available packages
  
  // Check if the content would be the same to avoid unnecessary DOM updates
  const currentOptions = Array.from(datalist.children).map(option => option.value);
  const isSame = currentOptions.length === uniquePackages.length && 
                currentOptions.every((value, index) => value === uniquePackages[index]);
  
  if (!isSame) {
    // Use DocumentFragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    uniquePackages.forEach(pkg => {
      const option = document.createElement('option');
      option.value = pkg;
      fragment.appendChild(option);
    });
    
    // Single DOM update
    datalist.innerHTML = '';
    datalist.appendChild(fragment);
  }
  
  if (!isSame) {
    // Updated software package dropdown
  } else {
    // Software package dropdown unchanged
  }
}

function updateAccountNameDropdown() {
  const datalist = document.getElementById('accountNameList');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  
  if (!datalist) return;
  
  // Filtering accounts for software and package
  
  let accounts = [];
  let filterDescription = '';
  
  if (selectedSoftwareName && selectedSoftwarePackage) {
    // Filter accounts by both software name and package
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    
    filterDescription = `software "${selectedSoftwareName}" AND package "${selectedSoftwarePackage}"`;
    // Found items matching both criteria
    
    accounts = filteredItems
      .map(item => item.accountName)
      .filter(Boolean);
  } else if (selectedSoftwareName) {
    // Filter accounts by software name only
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    filterDescription = `software "${selectedSoftwareName}" only`;
    // Found items matching software name only
    
    accounts = filteredItems
      .map(item => item.accountName)
      .filter(Boolean);
  } else {
    // Show all accounts if no filters
    accounts = window.softwareList.map(item => item.accountName).filter(Boolean);
    filterDescription = 'no filter (showing all)';
    // Showing all accounts (no filter)
  }
  
  // Get unique accounts and sort
  const uniqueAccounts = [...new Set(accounts)].sort();
  
  // Check available accounts
  
  datalist.innerHTML = '';
  uniqueAccounts.forEach(account => {
    const option = document.createElement('option');
    option.value = account;
    datalist.appendChild(option);
  });
  
  // Updated account name dropdown
}

function updateOrderInfoDropdown() {
  const dropdown = document.getElementById('orderInfoDropdown');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  if (!dropdown) {
    // orderInfoDropdown select not found
    return;
  }
  
  if (!window.softwareList || window.softwareList.length === 0) {
    // No software data available for order info dropdown
    return;
  }
  
  // Filtering order info for software, package, and account
  
  let orderInfoList = [];
  let filterDescription = '';
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    // Filter by all three criteria
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    
    filterDescription = `all three criteria`;
    // Found items matching all criteria
    
    orderInfoList = filteredItems
      .map(item => item.orderInfo)
      .filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    // Filter by software name and package
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    
    filterDescription = `software "${selectedSoftwareName}" AND package "${selectedSoftwarePackage}"`;
    // Found items matching software and package
    
    orderInfoList = filteredItems
      .map(item => item.orderInfo)
      .filter(Boolean);
  } else if (selectedSoftwareName) {
    // Filter by software name only
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    filterDescription = `software "${selectedSoftwareName}" only`;
    // Found items matching software name only
    
    orderInfoList = filteredItems
      .map(item => item.orderInfo)
      .filter(Boolean);
  } else {
    // Show all order info if no filters
    orderInfoList = window.softwareList.map(item => item.orderInfo).filter(Boolean);
    filterDescription = 'no filter (showing all)';
    // Showing all order info (no filter)
  }
  
  // Get unique order info and sort
  const uniqueOrderInfo = [...new Set(orderInfoList)].sort();
  
  // Check available order info
  
  // Clear existing options (keep first option)
  dropdown.innerHTML = '<option value="">-- Chọn từ danh sách có sẵn --</option>';
  
  uniqueOrderInfo.forEach(info => {
    const option = document.createElement('option');
    option.value = info;
    option.textContent = info.length > 50 ? info.substring(0, 50) + '...' : info;
    option.title = info; // Full text in tooltip
    dropdown.appendChild(option);
  });
  
  // Updated order info dropdown
}

function updateStandardNameDropdown() {
  const datalist = document.getElementById('standardNameList');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  if (!datalist) return;
  
  // Filtering standard names for software, package, and account
  
  let standardNames = [];
  let filterDescription = '';
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    // Filter by all three criteria
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    
    filterDescription = `all three criteria`;
    // Found items matching all criteria
    
    standardNames = filteredItems
      .map(item => item.standardName)
      .filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    // Filter by software name and package
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    
    filterDescription = `software "${selectedSoftwareName}" AND package "${selectedSoftwarePackage}"`;
    // Found items matching software and package
    
    standardNames = filteredItems
      .map(item => item.standardName)
      .filter(Boolean);
  } else if (selectedSoftwareName) {
    // Filter by software name only
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    filterDescription = `software "${selectedSoftwareName}" only`;
    // Found items matching software name only
    
    standardNames = filteredItems
      .map(item => item.standardName)
      .filter(Boolean);
  } else {
    // Show all standard names if no filters
    standardNames = window.softwareList.map(item => item.standardName).filter(Boolean);
    filterDescription = 'no filter (showing all)';
    // Showing all standard names (no filter)
  }
  
  // Get unique standard names and sort
  const uniqueStandardNames = [...new Set(standardNames)].sort();
  
  // Check available standard names
  
  datalist.innerHTML = '';
  uniqueStandardNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
  
  // Updated standard name dropdown
}

// ========== LEVEL 1 DROPDOWNS (Software + Package) ==========
function updatePriceDropdown() {
  const datalist = document.getElementById('priceList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const priceInput = document.getElementById('price');
    if (priceInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'priceList';
      priceInput.setAttribute('list', 'priceList');
      priceInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  
  let prices = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    prices = filteredItems.map(item => item.price).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    prices = filteredItems.map(item => item.price).filter(Boolean);
  } else {
    prices = window.softwareList.map(item => item.price).filter(Boolean);
  }
  
  const uniquePrices = [...new Set(prices)].sort((a, b) => parseFloat(a) - parseFloat(b));
  
  const datalistElement = document.getElementById('priceList');
  datalistElement.innerHTML = '';
  uniquePrices.forEach(price => {
    const option = document.createElement('option');
    option.value = price;
    datalistElement.appendChild(option);
  });
}

function updateAllowedUsersDropdown() {
  const datalist = document.getElementById('allowedUsersList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const allowedUsersInput = document.getElementById('allowedUsers');
    if (allowedUsersInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'allowedUsersList';
      allowedUsersInput.setAttribute('list', 'allowedUsersList');
      allowedUsersInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  
  let allowedUsers = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    allowedUsers = filteredItems.map(item => item.allowedUsers).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    allowedUsers = filteredItems.map(item => item.allowedUsers).filter(Boolean);
  } else {
    allowedUsers = window.softwareList.map(item => item.allowedUsers).filter(Boolean);
  }
  
  const uniqueAllowedUsers = [...new Set(allowedUsers)].sort((a, b) => parseInt(a) - parseInt(b));
  
  const datalistElement = document.getElementById('allowedUsersList');
  datalistElement.innerHTML = '';
  uniqueAllowedUsers.forEach(count => {
    const option = document.createElement('option');
    option.value = count;
    datalistElement.appendChild(option);
  });
}

// ========== LEVEL 2 DROPDOWNS (Software + Package + Account) ==========
function updateLoginUsernameDropdown() {
  const datalist = document.getElementById('loginUsernameList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const loginUsernameInput = document.getElementById('loginUsername');
    if (loginUsernameInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'loginUsernameList';
      loginUsernameInput.setAttribute('list', 'loginUsernameList');
      loginUsernameInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  let usernames = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    usernames = filteredItems.map(item => item.username).filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    usernames = filteredItems.map(item => item.username).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    usernames = filteredItems.map(item => item.username).filter(Boolean);
  } else {
    usernames = window.softwareList.map(item => item.username).filter(Boolean);
  }
  
  const uniqueUsernames = [...new Set(usernames)].sort();
  
  const datalistElement = document.getElementById('loginUsernameList');
  datalistElement.innerHTML = '';
  uniqueUsernames.forEach(username => {
    const option = document.createElement('option');
    option.value = username;
    datalistElement.appendChild(option);
  });
}

function updateLoginPasswordDropdown() {
  const datalist = document.getElementById('loginPasswordList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const loginPasswordInput = document.getElementById('loginPassword');
    if (loginPasswordInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'loginPasswordList';
      loginPasswordInput.setAttribute('list', 'loginPasswordList');
      loginPasswordInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  let passwords = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    passwords = filteredItems.map(item => item.password).filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    passwords = filteredItems.map(item => item.password).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    passwords = filteredItems.map(item => item.password).filter(Boolean);
  } else {
    passwords = window.softwareList.map(item => item.password).filter(Boolean);
  }
  
  const uniquePasswords = [...new Set(passwords)];
  
  const datalistElement = document.getElementById('loginPasswordList');
  datalistElement.innerHTML = '';
  uniquePasswords.forEach(password => {
    const option = document.createElement('option');
    option.value = password;
    datalistElement.appendChild(option);
  });
}

function updateLoginSecretDropdown() {
  const datalist = document.getElementById('loginSecretList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const loginSecretInput = document.getElementById('loginSecret');
    if (loginSecretInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'loginSecretList';
      loginSecretInput.setAttribute('list', 'loginSecretList');
      loginSecretInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  let secrets = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    secrets = filteredItems.map(item => item.secret).filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    secrets = filteredItems.map(item => item.secret).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    secrets = filteredItems.map(item => item.secret).filter(Boolean);
  } else {
    secrets = window.softwareList.map(item => item.secret).filter(Boolean);
  }
  
  const uniqueSecrets = [...new Set(secrets)];
  
  const datalistElement = document.getElementById('loginSecretList');
  datalistElement.innerHTML = '';
  uniqueSecrets.forEach(secret => {
    const option = document.createElement('option');
    option.value = secret;
    datalistElement.appendChild(option);
  });
}

function updateAccountSheetIdDropdown() {
  const datalist = document.getElementById('accountSheetIdList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const accountSheetIdInput = document.getElementById('accountSheetId');
    if (accountSheetIdInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'accountSheetIdList';
      accountSheetIdInput.setAttribute('list', 'accountSheetIdList');
      accountSheetIdInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  let sheetIds = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    sheetIds = filteredItems.map(item => item.accountSheetId).filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    sheetIds = filteredItems.map(item => item.accountSheetId).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    sheetIds = filteredItems.map(item => item.accountSheetId).filter(Boolean);
  } else {
    sheetIds = window.softwareList.map(item => item.accountSheetId).filter(Boolean);
  }
  
  const uniqueSheetIds = [...new Set(sheetIds)];
  
  const datalistElement = document.getElementById('accountSheetIdList');
  datalistElement.innerHTML = '';
  uniqueSheetIds.forEach(sheetId => {
    const option = document.createElement('option');
    option.value = sheetId;
    datalistElement.appendChild(option);
  });
}

function updateRenewalDateDropdown() {
  const datalist = document.getElementById('renewalDateList');
  if (!datalist) {
    // Create datalist if it doesn't exist
    const renewalDateInput = document.getElementById('renewalDate');
    if (renewalDateInput) {
      const newDatalist = document.createElement('datalist');
      newDatalist.id = 'renewalDateList';
      renewalDateInput.setAttribute('list', 'renewalDateList');
      renewalDateInput.parentNode.appendChild(newDatalist);
    } else {
      return;
    }
  }

  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  let renewalDates = [];
  
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    renewalDates = filteredItems.map(item => item.renewalDate).filter(Boolean);
  } else if (selectedSoftwareName && selectedSoftwarePackage) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    renewalDates = filteredItems.map(item => item.renewalDate).filter(Boolean);
  } else if (selectedSoftwareName) {
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    renewalDates = filteredItems.map(item => item.renewalDate).filter(Boolean);
  } else {
    renewalDates = window.softwareList.map(item => item.renewalDate).filter(Boolean);
  }
  
  const uniqueRenewalDates = [...new Set(renewalDates)].sort();
  
  const datalistElement = document.getElementById('renewalDateList');
  datalistElement.innerHTML = '';
  uniqueRenewalDates.forEach(date => {
    const option = document.createElement('option');
    option.value = date;
    datalistElement.appendChild(option);
  });
}

function updateFileTypeDropdown() {
  const datalistElement = document.getElementById('fileTypeList');
  if (!datalistElement) return;
  
  // Clear existing options
  datalistElement.innerHTML = '';
  
  // Get unique file types from column Q
  const uniqueFileTypes = [...new Set(
    window.softwareList
      .map(item => item.fileType)
      .filter(fileType => fileType && fileType.trim() !== '')
  )].sort();
  
  // Populate datalist
  uniqueFileTypes.forEach(fileType => {
    const option = document.createElement('option');
    option.value = fileType;
    datalistElement.appendChild(option);
  });
}

function autoFillFormFromSelection() {
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  const selectedOrderInfo = document.getElementById('orderInfo')?.value?.trim();
  const selectedStandardName = document.getElementById('standardName')?.value?.trim();
  
  // Try to find an exact match first (all 5 key fields)
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName && selectedOrderInfo && selectedStandardName) {
    const exactMatch = window.softwareList.find(item => 
      item.softwareName === selectedSoftwareName &&
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName &&
      item.orderInfo === selectedOrderInfo &&
      item.standardName === selectedStandardName
    );
    
    if (exactMatch) {
      // Found exact match with standard name
      fillFormFields(exactMatch);
      return;
    }
  }
  
  // If no exact match, try to find match by first 3 fields
  if (selectedSoftwareName && selectedSoftwarePackage && selectedAccountName) {
    const partialMatch = window.softwareList.find(item => 
      item.softwareName === selectedSoftwareName &&
      item.softwarePackage === selectedSoftwarePackage &&
      item.accountName === selectedAccountName
    );
    
    if (partialMatch) {
      // Found partial match (without standard name)
      fillFormFields(partialMatch, false); // Don't overwrite standard name if user typed it
      return;
    }
  }
  
  // No matching software found for auto-fill
}

function fillFormFields(matchingSoftware, includeOptionalFields = true) {
  // Auto-filling form from selection
  
  // Batch DOM operations to prevent layout thrashing
  requestAnimationFrame(() => {
    // Fill other form fields with existing data
    const fields = {
      price: document.getElementById('price'),
      allowedUsers: document.getElementById('allowedUsers'),
      accountSheetId: document.getElementById('accountSheetId'),
      orderInfo: document.getElementById('orderInfo'),
      loginUsername: document.getElementById('loginUsername'),
      loginPassword: document.getElementById('loginPassword'),
      loginSecret: document.getElementById('loginSecret'),
      standardName: document.getElementById('standardName')
    };
    
    // Batch all value assignments
    const updates = [];
    
    if (fields.price && matchingSoftware.price) {
      updates.push(() => fields.price.value = matchingSoftware.price);
    }
    
    if (fields.allowedUsers && matchingSoftware.allowedUsers) {
      updates.push(() => fields.allowedUsers.value = matchingSoftware.allowedUsers);
    }
    
    if (fields.accountSheetId && matchingSoftware.accountSheetId) {
      updates.push(() => fields.accountSheetId.value = matchingSoftware.accountSheetId);
    }
    
    // Only fill order info if requested and field is empty or matches
    if (includeOptionalFields && fields.orderInfo && matchingSoftware.orderInfo) {
      const currentOrderInfo = fields.orderInfo.value.trim();
      if (!currentOrderInfo || currentOrderInfo === matchingSoftware.orderInfo) {
        updates.push(() => fields.orderInfo.value = matchingSoftware.orderInfo);
      }
    }
    
    if (fields.loginUsername && matchingSoftware.username) {
      updates.push(() => fields.loginUsername.value = matchingSoftware.username);
    }
    
    if (fields.loginPassword && matchingSoftware.password) {
      updates.push(() => fields.loginPassword.value = matchingSoftware.password);
    }
    
    if (fields.loginSecret && matchingSoftware.secret) {
      updates.push(() => fields.loginSecret.value = matchingSoftware.secret);
    }
    
    // Only fill standard name if requested and field is empty or matches
    if (includeOptionalFields && fields.standardName && matchingSoftware.standardName) {
      const currentStandardName = fields.standardName.value.trim();
      if (!currentStandardName || currentStandardName === matchingSoftware.standardName) {
        updates.push(() => fields.standardName.value = matchingSoftware.standardName);
      }
    }
    
    // Execute all updates in one batch
    updates.forEach(update => update());
    
    // Set global edit index for update operations
    const editIndex = window.softwareList.indexOf(matchingSoftware);
    if (editIndex !== -1) {
      window.currentEditSoftwareIndex = editIndex;
      // Set edit index
    }
    
    // Form auto-filled successfully
  });
}

// ========================================
// UPDATE SOFTWARE FUNCTIONALITY  
// ========================================
// NOTE: This is a duplicate function - the main implementation is at line 708
// Keeping this commented out for reference

/* DUPLICATE - COMMENTED OUT
window.handleSoftwareUpdate = async function() {
  // Updating software
  
  try {
    // Check if we have a software selected for editing
    if (window.currentEditSoftwareIndex === -1 || !window.softwareList[window.currentEditSoftwareIndex]) {
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(
          'Chưa chọn phần mềm!', 
          'Vui lòng chọn một phần mềm từ danh sách để cập nhật bằng cách nhấp vào dòng trong bảng.', 
          'warning'
        );
      } else {
        alert('⚠️ Vui lòng chọn một phần mềm từ danh sách để cập nhật');
      }
      return;
    }
    
    // Get original software data
    const originalSoftware = window.softwareList[window.currentEditSoftwareIndex];
    
    // Get current form data
    const formData = getSoftwareFormData();
    
    // Validate required fields
    if (!validateSoftwareForm(formData)) {
      return;
    }
    
    // Check if anything actually changed
    const hasChanges = 
      formData.softwareName !== originalSoftware.softwareName ||
      formData.softwarePackage !== originalSoftware.softwarePackage ||
      formData.accountName !== originalSoftware.accountName ||
      formData.price !== originalSoftware.price ||
      formData.accountSheetId !== originalSoftware.accountSheetId ||
      formData.orderInfo !== originalSoftware.orderInfo ||
      formData.loginUsername !== originalSoftware.username ||
      formData.loginPassword !== originalSoftware.password ||
      formData.loginSecret !== originalSoftware.secret ||
      formData.note !== (originalSoftware.note || '') ||
      formData.standardName !== originalSoftware.standardName;
    
    if (!hasChanges) {
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(
          'Không có thay đổi!', 
          'Không có thông tin nào được thay đổi. Vui lòng sửa đổi ít nhất một trường thông tin.', 
          'info'
        );
      } else {
        alert('ℹ️ Không có thông tin nào được thay đổi');
      }
      return;
    }
    
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang cập nhật phần mềm...');
    }
    
    // Prepare update data with original identifiers
    const updateData = {
      // Original identifiers for finding the record
      originalSoftwareName: originalSoftware.softwareName,
      originalSoftwarePackage: originalSoftware.softwarePackage,
      originalAccountName: originalSoftware.accountName,
      
      // New data to update
      ...formData
    };
    
    // Call backend API
    const result = await apiRequestJson({
      action: "updateSoftware",
      ...updateData
    });
    
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      // Show success message
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(result.message || 'Phần mềm đã được cập nhật thành công', true);
      } else {
        alert('✅ ' + (result.message || 'Phần mềm đã được cập nhật thành công'));
      }
      
      // Reset form and edit state
      window.handleSoftwareReset();
      window.currentEditSoftwareIndex = -1;
      
      // Reload software data to reflect changes
      await loadSoftwareData();
      
      // Software updated successfully
      
    } else {
      // Show error message
      // Error updating software
      
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(result.message || 'Có lỗi xảy ra khi cập nhật phần mềm', false);
      } else {
        alert('❌ ' + (result.message || 'Có lỗi xảy ra khi cập nhật phần mềm'));
      }
    }
    
  } catch (error) {
    // Error in handleSoftwareUpdate
    
    // Close processing modal if it's open
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    }
    
    const errorMessage = 'Có lỗi xảy ra khi cập nhật phần mềm. Vui lòng thử lại.';
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
  }
};
*/ // END OF DUPLICATE FUNCTION

// ========================================
// SEARCH SOFTWARE FUNCTIONALITY
// ========================================

window.handleSoftwareSearch = async function() {
  // SOFTWARE SEARCH - Starting software search from frontend
  
  try {
    // Get search conditions from form
    const conditions = getSoftwareSearchConditions();
    
    // Check if at least one search condition is provided
    if (Object.keys(conditions).length === 0) {
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(
          'Vui lòng nhập ít nhất một điều kiện tìm kiếm trong form.', 
          false
        );
      } else {
        alert('⚠️ Vui lòng nhập ít nhất một điều kiện tìm kiếm');
      }
      return;
    }
    
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang tìm kiếm phần mềm...');
    }
    
    // Get user info for authentication
    const userInfo = window.getUserInfo ? window.getUserInfo() : { maNhanVien: 'ADMIN' };
    
    // Call backend API using apiRequestJson (same as transaction search)
    const requestData = {
      action: "searchSoftware", 
      maNhanVien: userInfo.maNhanVien,
      conditions: conditions
    };
    // SOFTWARE SEARCH - Sending request
    
    const result = await apiRequestJson(requestData);
    
    // Debug: Log raw response from backend
    // DEBUG Frontend v3: Raw API response
    
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      // Debug: Log kết quả search
      // DEBUG Frontend v3: Search results
      if (result.data.length > 0) {
        // DEBUG Frontend v3: Check first result renewal date
        // DEBUG Frontend v3: Check sample results
      } else {
        // DEBUG Frontend v3: No results found for conditions
      }
      
      // Set search mode and update software list
      window.isSoftwareSearching = true;
      window.softwareList = result.data || [];
      window.currentSoftwarePage = 1;
      
      // Update display
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
      
      // Show success message
      const message = result.message || `Tìm thấy ${result.data.length} phần mềm phù hợp`;
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(message, true);
      } else {
        alert('✅ ' + message);
      }
      
      // Software search completed
      
    } else {
      // Show error message
      // Error searching software
      
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(result.message || 'Có lỗi xảy ra khi tìm kiếm phần mềm', false);
      } else {
        alert('❌ ' + (result.message || 'Có lỗi xảy ra khi tìm kiếm phần mềm'));
      }
    }
    
  } catch (error) {
    // Error in handleSoftwareSearch
    
    // Close processing modal if it's open
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    }
    
    const errorMessage = 'Có lỗi xảy ra khi tìm kiếm phần mềm. Vui lòng thử lại.';
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
  }
};

function getSoftwareSearchConditions() {
  const conditions = {};
  
  // Get form values
  const getValue = (id) => document.getElementById(id)?.value?.trim() || '';
  
  const note = getValue('softwareNote');
  
  // Check if note field has data
  if (note) {
    // If note has data, perform global search with note value only
    conditions.globalSearch = note;
    return conditions;
  }
  
  // If note is empty, get other field values
  const softwareName = getValue('softwareFormName');
  const softwarePackage = getValue('softwareFormPackage');
  const accountName = getValue('softwareFormAccount');
  const price = getValue('price');
  const accountSheetId = getValue('accountSheetId');
  const orderInfo = getValue('orderInfo');
  const loginUsername = getValue('loginUsername');
  const standardName = getValue('standardName');
  const renewalDate = getValue('renewalDate');
  
  // Add non-empty conditions
  if (softwareName) conditions.softwareName = softwareName;
  if (softwarePackage) conditions.softwarePackage = softwarePackage;
  if (accountName) conditions.accountName = accountName;
  if (price) conditions.price = price;
  if (accountSheetId) conditions.accountSheetId = accountSheetId;
  if (orderInfo) conditions.orderInfo = orderInfo;
  if (loginUsername) conditions.username = loginUsername;
  if (standardName) conditions.standardName = standardName;
  if (renewalDate) conditions.renewalDate = renewalDate;
  
  // Check search conditions
  
  // Debug: Chi tiết về renewalDate
  if (conditions.renewalDate) {
    // DEBUG Frontend: Check renewal date value
    // DEBUG Frontend: Check renewal date type, length and character codes
  }
  
  return conditions;
}

// Function to clear search and return to normal view
window.clearSoftwareSearch = function() {
  // Clearing software search
  
  // Reset search state
  window.isSoftwareSearching = false;
  window.currentSoftwarePage = 1;
  
  // Reload all software data
  loadSoftwareData();
  
  // Reset form
  window.handleSoftwareReset();
  
  // Software search cleared
};

// Function to highlight search terms in text
function highlightSearchTerms(text, searchTerms) {
  if (!text || !searchTerms || searchTerms.length === 0) {
    return escapeHtml(text);
  }
  
  let highlightedText = escapeHtml(text);
  
  // Create a case-insensitive regex for each search term
  searchTerms.forEach(term => {
    if (term && term.trim()) {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark style="background-color: yellow; padding: 1px 2px;">$1</mark>');
    }
  });
  
  return highlightedText;
}

// Get current search terms for highlighting
function getCurrentSearchTerms() {
  if (!window.isSoftwareSearching) {
    return [];
  }
  
  const conditions = getSoftwareSearchConditions();
  return Object.values(conditions).filter(term => term && term.trim());
}

// Function to calculate days difference and get row background color
function getSoftwareRowColor(lastModifiedDate, passwordChangeDays) {
  if (!lastModifiedDate) {
    return ''; // No color for empty dates
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
  
  // Parse Vietnamese date format dd/mm/yyyy
  const parseVietnameseDate = (dateStr) => {
    if (!dateStr) return null;
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Convert dd/mm/yyyy to Date object
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0); // Reset time
      return date;
    }
    return null;
  };
  
  const lastModified = parseVietnameseDate(lastModifiedDate);
  if (!lastModified) {
    return ''; // Invalid date format
  }
  
  // Calculate days difference
  const diffTime = today.getTime() - lastModified.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Use passwordChangeDays from software item, fallback to default value if not available
  let passwordChangeThreshold = 30; // Default value
  
  if (passwordChangeDays !== null && passwordChangeDays !== undefined && passwordChangeDays !== '') {
    if (typeof passwordChangeDays === 'number') {
      passwordChangeThreshold = passwordChangeDays;
    } else if (typeof passwordChangeDays === 'string') {
      const parsed = parseInt(passwordChangeDays.trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        passwordChangeThreshold = parsed;
      }
    }
  }
  
  // Apply color rules according to user requirements:
  // Red: when diffDays > passwordChangeDays + 1
  // Yellow: when diffDays > passwordChangeDays
  if (diffDays > passwordChangeThreshold + 1) {
    return 'background-color: #ffe6e6;'; // Màu đỏ nhạt khi quá hạn đổi mật khẩu > 1 ngày
  } else if (diffDays > passwordChangeThreshold) {
    return 'background-color: #fff9e6;'; // Màu vàng nhạt khi quá hạn đổi mật khẩu
  }
  
  return ''; // Không tô màu khi còn trong thời hạn an toàn
}

// Build action dropdown based on fileType
function buildSoftwareActionDropdown(fileType, index) {
  let actionOptions = `<option value="">-- Chọn hành động --</option>`;
  actionOptions += `<option value="view">Xem chi tiết</option>`;
  actionOptions += `<option value="edit">Chỉnh sửa</option>`;
  actionOptions += `<option value="delete">Xóa</option>`;
  actionOptions += `<option value="openSheet">Mở Google Sheet</option>`;
  
  // Add specific actions based on fileType
  if (fileType && fileType.toLowerCase() === 'sheet') {
    actionOptions += `<option value="changePassword">Đổi MK</option>`;
  } else if (fileType && fileType.toLowerCase() === 'docs') {
    actionOptions += `<option value="updateCookie">Cookie</option>`;
  }
  
  return `<select class="action-select" onchange="handleSoftwareAction(this, ${index})">${actionOptions}</select>`;
}

// Handle software action selection
window.handleSoftwareAction = function(selectElement, index) {
  const action = selectElement.value;
  if (!action) return;
  
  // Software action for index
  
  // Reset select to default
  selectElement.value = '';
  
  switch (action) {
    case 'view':
      viewSoftwareItem(index);
      break;
    case 'edit':
      // Get the software object from the current displayed list
      const currentList = window.isSoftwareSearching ? window.softwareList : window.softwareList;
      const software = currentList[index];
      if (software) {
        // Editing software
        editSoftwareItem(software, index);
      } else {
        // Software not found at index
        alert('❌ Không tìm thấy phần mềm để chỉnh sửa');
      }
      break;
    case 'openSheet':
      openSoftwareSheet(index);
      break;
    case 'changePassword':
      // Reuse function from transaction tab
      if (typeof window.handleChangePassword === 'function') {
        // Create a temporary transaction-like object for the software
        const software = window.softwareList[index];
        if (software) {
          // Map software data to transaction format for compatibility
          const tempTransaction = {
            accountName: software.accountName,
            accountSheetId: software.accountSheetId,
            softwareName: software.softwareName,
            softwarePackage: software.softwarePackage,
            username: software.username,
            password: software.password,
            secret: software.secret
          };
          
          // Temporarily set this as current transaction for the handler
          const originalList = window.transactionList;
          window.transactionList = [tempTransaction];
          
          window.handleChangePassword(0);
          
          // Restore original list after a short delay
          setTimeout(() => {
            window.transactionList = originalList;
          }, 100);
        }
      } else {
        // handleChangePassword function not found
        alert('❌ Chức năng đổi mật khẩu chưa sẵn sàng');
      }
      break;
    case 'updateCookie':
      // Reuse function from transaction tab
      if (typeof window.handleUpdateCookie === 'function') {
        // Create a temporary transaction-like object for the software
        const software = window.softwareList[index];
        if (software) {
          // Map software data to transaction format for compatibility
          const tempTransaction = {
            accountName: software.accountName,
            accountSheetId: software.accountSheetId,
            softwareName: software.softwareName,
            softwarePackage: software.softwarePackage,
            username: software.username,
            password: software.password,
            cookie: software.cookie || '' // Add cookie field if available
          };
          
          // Temporarily set this as current transaction for the handler
          const originalList = window.transactionList;
          window.transactionList = [tempTransaction];
          
          window.handleUpdateCookie(0);
          
          // Restore original list after a short delay
          setTimeout(() => {
            window.transactionList = originalList;
          }, 100);
        }
      } else {
        // handleUpdateCookie function not found
        alert('❌ Chức năng cập nhật cookie chưa sẵn sàng');
      }
      break;
    case 'delete':
      // Handle software deletion
      const softwareToDelete = window.softwareList[index];
      if (softwareToDelete) {
        handleDeleteSoftware(softwareToDelete, loadSoftwareData);
      } else {
        // Software not found at index
        alert('❌ Không tìm thấy phần mềm để xóa');
      }
      break;
    default:
      // Unknown action
  }
};

// View software item details
function viewSoftwareItem(index) {
  const software = window.softwareList[index];
  if (!software) {
    // Software not found at index
    return;
  }
  
  // Viewing software
  
  // Use existing modal system to show software details
  if (typeof showResultModalUnified === 'function') {
    const details = `
      <div style="text-align: left; line-height: 1.6;">
        <h4>💻 ${software.softwareName} - ${software.softwarePackage}</h4>
        <p><strong>Tài khoản:</strong> ${software.accountName}</p>
        <p><strong>Giá bán:</strong> ${formatCurrency(software.price)}</p>
        <p><strong>Tên đăng nhập:</strong> ${software.username || 'Chưa có'}</p>
        <p><strong>Mật khẩu:</strong> ${software.password ? '***' : 'Chưa có'}</p>
        <p><strong>Secret:</strong> ${software.secret ? '***' : 'Chưa có'}</p>
        <p><strong>Ngày thay đổi:</strong> ${software.lastModified || 'Chưa có'}</p>
        <p><strong>Ngày gia hạn:</strong> ${software.renewalDate || 'Chưa có'}</p>
        <p><strong>Loại tệp:</strong> ${software.fileType || 'Chưa có'}</p>
        <p><strong>Số ngày đổi MK:</strong> ${software.passwordChangeDays || 'Mặc định'}</p>
        ${software.orderInfo ? `<p><strong>Thông tin đơn hàng:</strong><br>${software.orderInfo}</p>` : ''}
      </div>
    `;
    showResultModalUnified('Chi tiết phần mềm', details, 'info');
  } else {
    // Fallback to alert if modal not available
    alert(`💻 ${software.softwareName}\n• Gói: ${software.softwarePackage}\n• Tài khoản: ${software.accountName}\n• Giá: ${formatCurrency(software.price)}`);
  }
}

// Open Google Sheet for software
function openSoftwareSheet(index) {
  const software = window.softwareList[index];
  if (!software) {
    // Software not found at index
    return;
  }
  
  if (!software.accountSheetId) {
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Phần mềm này chưa có liên kết tới Google Sheet', false);
    } else {
      alert('⚠️ Phần mềm này chưa có liên kết tới Google Sheet');
    }
    return;
  }
  
  // Opening Google Sheet
  
  // Construct Google Sheets URL
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${software.accountSheetId}/edit`;
  
  // Open in new tab
  window.open(sheetUrl, '_blank');
  
  // Show confirmation
  if (typeof showResultModalUnified === 'function') {
    showResultModalUnified(`Đã mở Google Sheet cho ${software.softwareName}`, true);
  }
}

// Debug function to check software data note field
window.debugSoftwareNotes = function() {
  // DEBUG: Checking software data for note field
  
  if (window.softwareList && window.softwareList.length > 0) {
    // Check sample software item (first)
    
    // Check if note field exists in data
    const itemsWithNotes = window.softwareList.filter(item => item.note && item.note.trim() !== '');
    // Check items with note data
    
    if (itemsWithNotes.length > 0) {
      // Sample note data:
      itemsWithNotes.slice(0, 3).forEach((item, index) => {
        // Log note data item
      });
    } else {
      // No items found with note data
      
      // Check all field names
      // Available fields in first item:
      Object.keys(window.softwareList[0]).forEach(key => {
        // Log field data
      });
    }
  } else {
    // No software data available
  }
};