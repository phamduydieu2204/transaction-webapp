/**
 * Initialize Software Tab
 * Handles software data loading, display, and pagination
 */

import { getConstants } from './constants.js';

// Global variables for software tab
window.softwareList = [];
window.currentSoftwarePage = 1;
window.softwareItemsPerPage = 10;
window.currentEditSoftwareIndex = -1;

export function initSoftwareTab() {
  console.log('💿 Initializing software tab...');
  
  // Initialize pagination controls
  initSoftwarePagination();
  
  // Initialize form dropdowns
  initSoftwareFormDropdowns();
  
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
      
      // Debug: Log sample data to check orderInfo field
      if (window.softwareList.length > 0) {
        console.log('📋 Sample software data:', window.softwareList[0]);
        const hasOrderInfo = window.softwareList.some(item => item.orderInfo);
        console.log(`📋 Has orderInfo data: ${hasOrderInfo}`);
      }
      
      // Update display
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
      
      // Update form dropdowns
      updateSoftwareFormDropdowns();
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
  
  const startIndex = (window.currentSoftwarePage - 1) * window.softwareItemsPerPage;
  const endIndex = startIndex + window.softwareItemsPerPage;
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
    totalDisplay.textContent = `Tổng: ${window.softwareList.length} phần mềm`;
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

// Software form handlers
window.handleSoftwareAdd = async function() {
  console.log('🔄 Adding new software...');
  
  try {
    // Get form data
    const formData = getSoftwareFormData();
    
    // Validate required fields
    if (!validateSoftwareForm(formData)) {
      return;
    }
    
    // Show processing modal
    if (typeof showProcessingModalModern === 'function') {
      showProcessingModalModern('Đang thêm phần mềm...', 'Vui lòng đợi trong giây lát');
    }
    
    // Call backend API
    const { BACKEND_URL } = getConstants();
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addSoftware",
        ...formData
      })
    });
    
    const result = await response.json();
    
    // Close processing modal
    if (typeof closeProcessingModalModern === 'function') {
      closeProcessingModalModern();
    }
    
    if (result.status === "success") {
      // Show success message
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Thành công!', result.message || 'Phần mềm đã được thêm thành công', 'success');
      } else {
        alert('✅ ' + (result.message || 'Phần mềm đã được thêm thành công'));
      }
      
      // Reset form
      window.handleSoftwareReset();
      
      // Reload software data to reflect changes
      await loadSoftwareData();
      
      console.log('✅ Software added successfully:', result.data);
      
    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi thêm phần mềm';
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Lỗi!', errorMessage, 'error');
      } else {
        alert('❌ ' + errorMessage);
      }
      console.error('❌ Error adding software:', result.message);
    }
    
  } catch (error) {
    // Close processing modal if still open
    if (typeof closeProcessingModalModern === 'function') {
      closeProcessingModalModern();
    }
    
    const errorMessage = 'Lỗi kết nối: ' + error.message;
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Lỗi kết nối!', errorMessage, 'error');
    } else {
      alert('❌ ' + errorMessage);
    }
    console.error('❌ Network error adding software:', error);
  }
};

window.handleSoftwareUpdate = function() {
  console.log('🔄 Updating software...');
  
  // Get form data
  const formData = getSoftwareFormData();
  
  // Validate required fields
  if (!validateSoftwareForm(formData)) {
    return;
  }
  
  // TODO: Implement update software API call
  console.log('Software data to update:', formData);
  alert('🚧 Chức năng cập nhật phần mềm đang được phát triển!');
};

window.handleSoftwareSearch = function() {
  console.log('🔍 Searching software...');
  
  // Get form data
  const formData = getSoftwareFormData();
  
  // TODO: Implement search software logic
  console.log('Software search criteria:', formData);
  alert('🚧 Chức năng tìm kiếm phần mềm đang được phát triển!');
};

window.handleSoftwareReset = function() {
  console.log('🔄 Resetting software form...');
  
  // Clear all form fields
  const form = document.getElementById('softwareForm');
  if (form) {
    form.reset();
  }
  
  // Clear any error messages
  clearSoftwareFormErrors();
  
  // Reset any global editing state
  window.currentEditSoftwareIndex = -1;
  
  console.log('✅ Software form reset complete');
};

function getSoftwareFormData() {
  return {
    softwareName: document.getElementById('softwareFormName')?.value?.trim() || '',
    softwarePackage: document.getElementById('softwareFormPackage')?.value?.trim() || '',
    accountName: document.getElementById('softwareFormAccount')?.value?.trim() || '',
    accountSheetId: document.getElementById('accountSheetId')?.value?.trim() || '',
    orderInfo: document.getElementById('orderInfo')?.value?.trim() || '',
    loginUsername: document.getElementById('loginUsername')?.value?.trim() || '',
    loginPassword: document.getElementById('loginPassword')?.value?.trim() || '',
    loginSecret: document.getElementById('loginSecret')?.value?.trim() || '',
    standardName: document.getElementById('standardName')?.value?.trim() || ''
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
    console.warn('🔺 Form validation errors:', errors);
    if (typeof showResultModalModern === 'function') {
      showResultModalModern(
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
  console.log('🔧 Initializing software form dropdowns...');
  
  // Add event listeners for cascading dropdowns
  const softwareNameInput = document.getElementById('softwareFormName');
  const softwarePackageInput = document.getElementById('softwareFormPackage');
  const accountNameInput = document.getElementById('softwareFormAccount');
  
  if (softwareNameInput) {
    // Clear dependent fields when software name changes
    softwareNameInput.addEventListener('input', () => {
      console.log('🔄 Software name changed:', softwareNameInput.value);
      // Clear dependent fields
      if (softwarePackageInput) softwarePackageInput.value = '';
      if (accountNameInput) accountNameInput.value = '';
      // Update dropdowns
      updateSoftwarePackageDropdown();
      updateAccountNameDropdown();
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
    });
    
    softwareNameInput.addEventListener('change', () => {
      console.log('🔄 Software name confirmed:', softwareNameInput.value);
      updateSoftwarePackageDropdown();
      updateAccountNameDropdown();
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
    });
  }
  
  if (softwarePackageInput) {
    // Clear dependent fields when package changes
    softwarePackageInput.addEventListener('input', () => {
      console.log('🔄 Software package changed:', softwarePackageInput.value);
      // Clear dependent fields
      if (accountNameInput) accountNameInput.value = '';
      // Update dropdowns
      updateAccountNameDropdown();
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
    });
    
    softwarePackageInput.addEventListener('change', () => {
      console.log('🔄 Software package confirmed:', softwarePackageInput.value);
      updateAccountNameDropdown();
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
    });
  }
  
  if (accountNameInput) {
    accountNameInput.addEventListener('input', () => {
      console.log('🔄 Account name changed:', accountNameInput.value);
      // Update dependent dropdowns
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
    });
    
    accountNameInput.addEventListener('change', () => {
      console.log('🔄 Account name selected:', accountNameInput.value);
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
      autoFillFormFromSelection();
    });
  }
  
  // Add event listeners for order info field
  const orderInfoInput = document.getElementById('orderInfo');
  if (orderInfoInput) {
    orderInfoInput.addEventListener('input', () => {
      console.log('🔄 Order info changed (typing):', orderInfoInput.value);
      // Don't auto-fill during typing to avoid interrupting user input
    });
    
    orderInfoInput.addEventListener('change', () => {
      console.log('🔄 Order info selected/entered:', orderInfoInput.value);
      // Try to auto-fill if we have a complete selection or manual entry
      autoFillFormFromSelection();
    });
    
    // Also handle when user selects from datalist dropdown
    orderInfoInput.addEventListener('blur', () => {
      console.log('🔄 Order info field lost focus:', orderInfoInput.value);
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
      console.log('🔄 Standard name changed (typing):', standardNameInput.value);
      // Don't auto-fill during typing to avoid interrupting user input
    });
    
    standardNameInput.addEventListener('change', () => {
      console.log('🔄 Standard name selected/entered:', standardNameInput.value);
      // Try to auto-fill if we have a complete selection or manual entry
      autoFillFormFromSelection();
    });
    
    // Also handle when user selects from datalist dropdown
    standardNameInput.addEventListener('blur', () => {
      console.log('🔄 Standard name field lost focus:', standardNameInput.value);
      // Auto-fill when user finishes entering/selecting value
      if (standardNameInput.value.trim()) {
        autoFillFormFromSelection();
      }
    });
  }
  
  console.log('✅ Software form dropdowns initialized');
}

function updateSoftwareFormDropdowns() {
  updateSoftwareNameDropdown();
  updateSoftwarePackageDropdown();
  updateAccountNameDropdown();
  updateOrderInfoDropdown();
  updateStandardNameDropdown();
}

// Debug function để kiểm tra dữ liệu
window.debugSoftwareDropdowns = function() {
  console.log('🔍 DEBUG: Software List Data');
  console.log('Total items:', window.softwareList.length);
  console.log('Sample data:', window.softwareList.slice(0, 3));
  
  // Unique software names
  const uniqueNames = [...new Set(window.softwareList.map(item => item.softwareName))].filter(Boolean);
  console.log('Unique software names:', uniqueNames);
  
  // Unique order info
  const uniqueOrderInfo = [...new Set(window.softwareList.map(item => item.orderInfo))].filter(Boolean);
  console.log('Unique order info:', uniqueOrderInfo);
  
  // Test filtering for first software
  if (uniqueNames.length > 0) {
    const testSoftware = uniqueNames[0];
    const packagesForSoftware = window.softwareList
      .filter(item => item.softwareName === testSoftware)
      .map(item => item.softwarePackage)
      .filter(Boolean);
    console.log(`Packages for "${testSoftware}":`, [...new Set(packagesForSoftware)]);
    
    const orderInfoForSoftware = window.softwareList
      .filter(item => item.softwareName === testSoftware)
      .map(item => item.orderInfo)
      .filter(Boolean);
    console.log(`Order info for "${testSoftware}":`, [...new Set(orderInfoForSoftware)]);
  }
};

// Function để force refresh tất cả dropdowns - cho debugging
window.forceRefreshDropdowns = function() {
  console.log('🔄 Force refreshing all dropdowns...');
  updateSoftwareFormDropdowns();
  console.log('✅ All dropdowns refreshed');
};

// Function để xử lý khi chọn từ order info dropdown
window.selectOrderInfo = function(value) {
  if (value) {
    const orderInfoTextarea = document.getElementById('orderInfo');
    if (orderInfoTextarea) {
      orderInfoTextarea.value = value;
      console.log('✅ Selected order info:', value);
      
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
  
  console.log(`✅ Updated software name dropdown with ${uniqueNames.length} items`);
}

function updateSoftwarePackageDropdown() {
  const datalist = document.getElementById('softwarePackageList');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  
  if (!datalist) return;
  
  console.log(`🔍 Filtering packages for software: "${selectedSoftwareName}"`);
  
  let packages = [];
  
  if (selectedSoftwareName) {
    // Filter packages by selected software name
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    console.log(`📊 Found ${filteredItems.length} items matching software name`);
    
    packages = filteredItems
      .map(item => item.softwarePackage)
      .filter(Boolean);
  } else {
    // Show all packages if no software name selected
    packages = window.softwareList.map(item => item.softwarePackage).filter(Boolean);
    console.log(`📊 Showing all packages (no filter)`);
  }
  
  // Get unique packages and sort
  const uniquePackages = [...new Set(packages)].sort();
  
  console.log(`📦 Available packages:`, uniquePackages);
  
  datalist.innerHTML = '';
  uniquePackages.forEach(pkg => {
    const option = document.createElement('option');
    option.value = pkg;
    datalist.appendChild(option);
  });
  
  console.log(`✅ Updated software package dropdown with ${uniquePackages.length} items`);
}

function updateAccountNameDropdown() {
  const datalist = document.getElementById('accountNameList');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  
  if (!datalist) return;
  
  console.log(`🔍 Filtering accounts for software: "${selectedSoftwareName}", package: "${selectedSoftwarePackage}"`);
  
  let accounts = [];
  let filterDescription = '';
  
  if (selectedSoftwareName && selectedSoftwarePackage) {
    // Filter accounts by both software name and package
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName && 
      item.softwarePackage === selectedSoftwarePackage
    );
    
    filterDescription = `software "${selectedSoftwareName}" AND package "${selectedSoftwarePackage}"`;
    console.log(`📊 Found ${filteredItems.length} items matching both criteria`);
    
    accounts = filteredItems
      .map(item => item.accountName)
      .filter(Boolean);
  } else if (selectedSoftwareName) {
    // Filter accounts by software name only
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    filterDescription = `software "${selectedSoftwareName}" only`;
    console.log(`📊 Found ${filteredItems.length} items matching software name only`);
    
    accounts = filteredItems
      .map(item => item.accountName)
      .filter(Boolean);
  } else {
    // Show all accounts if no filters
    accounts = window.softwareList.map(item => item.accountName).filter(Boolean);
    filterDescription = 'no filter (showing all)';
    console.log(`📊 Showing all accounts (no filter)`);
  }
  
  // Get unique accounts and sort
  const uniqueAccounts = [...new Set(accounts)].sort();
  
  console.log(`🏢 Available accounts for ${filterDescription}:`, uniqueAccounts);
  
  datalist.innerHTML = '';
  uniqueAccounts.forEach(account => {
    const option = document.createElement('option');
    option.value = account;
    datalist.appendChild(option);
  });
  
  console.log(`✅ Updated account name dropdown with ${uniqueAccounts.length} items`);
}

function updateOrderInfoDropdown() {
  const dropdown = document.getElementById('orderInfoDropdown');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  if (!dropdown) {
    console.warn('⚠️ orderInfoDropdown select not found');
    return;
  }
  
  if (!window.softwareList || window.softwareList.length === 0) {
    console.warn('⚠️ No software data available for order info dropdown');
    return;
  }
  
  console.log(`🔍 Filtering order info for software: "${selectedSoftwareName}", package: "${selectedSoftwarePackage}", account: "${selectedAccountName}"`);
  
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
    console.log(`📊 Found ${filteredItems.length} items matching all criteria`);
    
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
    console.log(`📊 Found ${filteredItems.length} items matching software and package`);
    
    orderInfoList = filteredItems
      .map(item => item.orderInfo)
      .filter(Boolean);
  } else if (selectedSoftwareName) {
    // Filter by software name only
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    filterDescription = `software "${selectedSoftwareName}" only`;
    console.log(`📊 Found ${filteredItems.length} items matching software name only`);
    
    orderInfoList = filteredItems
      .map(item => item.orderInfo)
      .filter(Boolean);
  } else {
    // Show all order info if no filters
    orderInfoList = window.softwareList.map(item => item.orderInfo).filter(Boolean);
    filterDescription = 'no filter (showing all)';
    console.log(`📊 Showing all order info (no filter)`);
  }
  
  // Get unique order info and sort
  const uniqueOrderInfo = [...new Set(orderInfoList)].sort();
  
  console.log(`📋 Available order info for ${filterDescription}:`, uniqueOrderInfo);
  
  // Clear existing options (keep first option)
  dropdown.innerHTML = '<option value="">-- Chọn từ danh sách có sẵn --</option>';
  
  uniqueOrderInfo.forEach(info => {
    const option = document.createElement('option');
    option.value = info;
    option.textContent = info.length > 50 ? info.substring(0, 50) + '...' : info;
    option.title = info; // Full text in tooltip
    dropdown.appendChild(option);
  });
  
  console.log(`✅ Updated order info dropdown with ${uniqueOrderInfo.length} items`);
}

function updateStandardNameDropdown() {
  const datalist = document.getElementById('standardNameList');
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  if (!datalist) return;
  
  console.log(`🔍 Filtering standard names for software: "${selectedSoftwareName}", package: "${selectedSoftwarePackage}", account: "${selectedAccountName}"`);
  
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
    console.log(`📊 Found ${filteredItems.length} items matching all criteria`);
    
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
    console.log(`📊 Found ${filteredItems.length} items matching software and package`);
    
    standardNames = filteredItems
      .map(item => item.standardName)
      .filter(Boolean);
  } else if (selectedSoftwareName) {
    // Filter by software name only
    const filteredItems = window.softwareList.filter(item => 
      item.softwareName === selectedSoftwareName
    );
    
    filterDescription = `software "${selectedSoftwareName}" only`;
    console.log(`📊 Found ${filteredItems.length} items matching software name only`);
    
    standardNames = filteredItems
      .map(item => item.standardName)
      .filter(Boolean);
  } else {
    // Show all standard names if no filters
    standardNames = window.softwareList.map(item => item.standardName).filter(Boolean);
    filterDescription = 'no filter (showing all)';
    console.log(`📊 Showing all standard names (no filter)`);
  }
  
  // Get unique standard names and sort
  const uniqueStandardNames = [...new Set(standardNames)].sort();
  
  console.log(`📋 Available standard names for ${filterDescription}:`, uniqueStandardNames);
  
  datalist.innerHTML = '';
  uniqueStandardNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
  
  console.log(`✅ Updated standard name dropdown with ${uniqueStandardNames.length} items`);
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
      console.log('🎯 Found exact match with standard name:', exactMatch);
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
      console.log('🔄 Found partial match (without standard name):', partialMatch);
      fillFormFields(partialMatch, false); // Don't overwrite standard name if user typed it
      return;
    }
  }
  
  console.log('ℹ️ No matching software found for auto-fill');
}

function fillFormFields(matchingSoftware, includeOptionalFields = true) {
  console.log('🔄 Auto-filling form from selection:', matchingSoftware);
  
  // Fill other form fields with existing data
  const accountSheetIdField = document.getElementById('accountSheetId');
  const orderInfoField = document.getElementById('orderInfo');
  const loginUsernameField = document.getElementById('loginUsername');
  const loginPasswordField = document.getElementById('loginPassword');
  const loginSecretField = document.getElementById('loginSecret');
  const standardNameField = document.getElementById('standardName');
  
  if (accountSheetIdField && matchingSoftware.accountSheetId) {
    accountSheetIdField.value = matchingSoftware.accountSheetId;
  }
  
  // Only fill order info if requested and field is empty or matches
  if (includeOptionalFields && orderInfoField && matchingSoftware.orderInfo) {
    const currentOrderInfo = orderInfoField.value.trim();
    if (!currentOrderInfo || currentOrderInfo === matchingSoftware.orderInfo) {
      orderInfoField.value = matchingSoftware.orderInfo;
    }
  }
  
  if (loginUsernameField && matchingSoftware.username) {
    loginUsernameField.value = matchingSoftware.username;
  }
  
  if (loginPasswordField && matchingSoftware.password) {
    loginPasswordField.value = matchingSoftware.password;
  }
  
  if (loginSecretField && matchingSoftware.secret) {
    loginSecretField.value = matchingSoftware.secret;
  }
  
  // Only fill standard name if requested and field is empty or matches
  if (includeOptionalFields && standardNameField && matchingSoftware.standardName) {
    const currentStandardName = standardNameField.value.trim();
    if (!currentStandardName || currentStandardName === matchingSoftware.standardName) {
      standardNameField.value = matchingSoftware.standardName;
    }
  }
  
  // Set global edit index for update operations
  const editIndex = window.softwareList.indexOf(matchingSoftware);
  if (editIndex !== -1) {
    window.currentEditSoftwareIndex = editIndex;
    console.log(`📝 Set edit index to: ${editIndex}`);
  }
  
  console.log('✅ Form auto-filled successfully');
}