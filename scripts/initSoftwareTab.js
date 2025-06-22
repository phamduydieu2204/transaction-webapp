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
window.handleSoftwareAdd = function() {
  console.log('🔄 Adding new software...');
  
  // Get form data
  const formData = getSoftwareFormData();
  
  // Validate required fields
  if (!validateSoftwareForm(formData)) {
    return;
  }
  
  // TODO: Implement add software API call
  console.log('Software data to add:', formData);
  alert('🚧 Chức năng thêm phần mềm đang được phát triển!');
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
  
  // Clear previous errors
  clearSoftwareFormErrors();
  
  // Validate required fields
  const requiredFields = [
    { field: 'softwareName', name: 'Tên phần mềm', elementId: 'softwareFormName' },
    { field: 'softwarePackage', name: 'Gói phần mềm', elementId: 'softwareFormPackage' },
    { field: 'accountName', name: 'Tên tài khoản', elementId: 'softwareFormAccount' },
    { field: 'loginUsername', name: 'Tên đăng nhập' },
    { field: 'loginPassword', name: 'Mật khẩu đăng nhập' }
  ];
  
  requiredFields.forEach(({ field, name, elementId }) => {
    if (!formData[field]) {
      showSoftwareFieldError(elementId || field, `${name} là bắt buộc`);
      isValid = false;
    }
  });
  
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
    });
    
    softwareNameInput.addEventListener('change', () => {
      console.log('🔄 Software name confirmed:', softwareNameInput.value);
      updateSoftwarePackageDropdown();
      updateAccountNameDropdown();
    });
  }
  
  if (softwarePackageInput) {
    // Clear dependent fields when package changes
    softwarePackageInput.addEventListener('input', () => {
      console.log('🔄 Software package changed:', softwarePackageInput.value);
      // Clear dependent fields
      if (accountNameInput) accountNameInput.value = '';
      // Update dropdown
      updateAccountNameDropdown();
    });
    
    softwarePackageInput.addEventListener('change', () => {
      console.log('🔄 Software package confirmed:', softwarePackageInput.value);
      updateAccountNameDropdown();
    });
  }
  
  if (accountNameInput) {
    accountNameInput.addEventListener('change', () => {
      console.log('🔄 Account name selected:', accountNameInput.value);
      autoFillFormFromSelection();
    });
  }
  
  console.log('✅ Software form dropdowns initialized');
}

function updateSoftwareFormDropdowns() {
  updateSoftwareNameDropdown();
  updateSoftwarePackageDropdown();
  updateAccountNameDropdown();
}

// Debug function để kiểm tra dữ liệu
window.debugSoftwareDropdowns = function() {
  console.log('🔍 DEBUG: Software List Data');
  console.log('Total items:', window.softwareList.length);
  console.log('Sample data:', window.softwareList.slice(0, 3));
  
  // Unique software names
  const uniqueNames = [...new Set(window.softwareList.map(item => item.softwareName))].filter(Boolean);
  console.log('Unique software names:', uniqueNames);
  
  // Test filtering for first software
  if (uniqueNames.length > 0) {
    const testSoftware = uniqueNames[0];
    const packagesForSoftware = window.softwareList
      .filter(item => item.softwareName === testSoftware)
      .map(item => item.softwarePackage)
      .filter(Boolean);
    console.log(`Packages for "${testSoftware}":`, [...new Set(packagesForSoftware)]);
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

function autoFillFormFromSelection() {
  const selectedSoftwareName = document.getElementById('softwareFormName')?.value?.trim();
  const selectedSoftwarePackage = document.getElementById('softwareFormPackage')?.value?.trim();
  const selectedAccountName = document.getElementById('softwareFormAccount')?.value?.trim();
  
  if (!selectedSoftwareName || !selectedSoftwarePackage || !selectedAccountName) {
    return;
  }
  
  // Find matching software entry
  const matchingSoftware = window.softwareList.find(item => 
    item.softwareName === selectedSoftwareName &&
    item.softwarePackage === selectedSoftwarePackage &&
    item.accountName === selectedAccountName
  );
  
  if (matchingSoftware) {
    console.log('🔄 Auto-filling form from selection:', matchingSoftware);
    
    // Fill other form fields with existing data
    const accountSheetIdField = document.getElementById('accountSheetId');
    const loginUsernameField = document.getElementById('loginUsername');
    const loginPasswordField = document.getElementById('loginPassword');
    const loginSecretField = document.getElementById('loginSecret');
    const standardNameField = document.getElementById('standardName');
    
    if (accountSheetIdField && matchingSoftware.accountSheetId) {
      accountSheetIdField.value = matchingSoftware.accountSheetId;
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
    
    if (standardNameField && matchingSoftware.standardName) {
      standardNameField.value = matchingSoftware.standardName;
    }
    
    // Set global edit index for update operations
    const editIndex = window.softwareList.indexOf(matchingSoftware);
    if (editIndex !== -1) {
      window.currentEditSoftwareIndex = editIndex;
      console.log(`📝 Set edit index to: ${editIndex}`);
    }
    
    console.log('✅ Form auto-filled successfully');
  }
}