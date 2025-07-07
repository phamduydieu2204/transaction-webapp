/**
 * initSourceTab.js - Source Tab Initialization
 * 
 * Manages source/supplier functionality in the application
 */

import { apiRequestJson } from './apiRequest.js';
import { formatCurrency } from './utils/formatters.js';
import { validateForm } from './utils/validators.js';

// Global variables for source management
window.sourceList = [];
window.currentSourcePage = 1;
window.sourceItemsPerPage = 10;
window.currentEditSourceIndex = -1;
window.isSourceSearching = false;
window.sourceSearchTerms = [];

// Global variables for dropdown data
window.sourceDropdownData = {
  suppliers: [],
  software: [],
  zalo: [],
  packages: [],
  audiences: [],
  provisionMethods: [],
  durations: []
};

export function initSourceTab() {
  console.log('📦 Initializing source tab...');
  
  // Initialize pagination controls
  initSourcePagination();
  
  // Load source data
  loadSourceData();
  
  // Initialize form event listeners
  initFormEventListeners();
  
  console.log('✅ Source tab initialized');
}

// Initialize pagination for source list
function initSourcePagination() {
  window.sourceNextPage = function() {
    const totalPages = Math.ceil(window.sourceList.length / window.sourceItemsPerPage);
    if (window.currentSourcePage < totalPages) {
      window.currentSourcePage++;
      updateSourceTable();
      updateSourcePagination();
    }
  };

  window.sourcePrevPage = function() {
    if (window.currentSourcePage > 1) {
      window.currentSourcePage--;
      updateSourceTable();
      updateSourcePagination();
    }
  };

  window.sourceFirstPage = function() {
    window.currentSourcePage = 1;
    updateSourceTable();
    updateSourcePagination();
  };

  window.sourceLastPage = function() {
    const totalPages = Math.ceil(window.sourceList.length / window.sourceItemsPerPage);
    window.currentSourcePage = totalPages;
    updateSourceTable();
    updateSourcePagination();
  };

  window.sourceGoToPage = function(page) {
    const totalPages = Math.ceil(window.sourceList.length / window.sourceItemsPerPage);
    if (page >= 1 && page <= totalPages) {
      window.currentSourcePage = page;
      updateSourceTable();
      updateSourcePagination();
    }
  };
}

// Load source data from backend
async function loadSourceData() {
  try {
    console.log('🔄 Loading source data...');
    
    // Show loading modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang tải dữ liệu nguồn hàng...');
    } else if (typeof showProcessingModal === 'function') {
      showProcessingModal('Đang tải dữ liệu nguồn hàng...');
    }
    
    const result = await apiRequestJson({
      action: "getSourceList"
    });
    
    // Close loading modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      window.sourceList = result.data || [];
      console.log(`✅ Loaded ${window.sourceList.length} source items`);
      
      // Update dropdown data
      updateDropdownData();
      
      // Update display
      updateSourceTable();
      updateSourceTotalDisplay();
    }
    
  } catch (error) {
    // Close loading modal if error occurs
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    console.error('❌ Error loading source data:', error);
    window.sourceList = [];
    updateSourceTable();
    updateSourceTotalDisplay();
    
    // Show error message
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Không thể tải dữ liệu nguồn hàng', false);
    }
  }
}

// Update source table display
function updateSourceTable() {
  const tbody = document.getElementById('sourceTableBody');
  if (!tbody) return;
  
  const startIndex = (window.currentSourcePage - 1) * window.sourceItemsPerPage;
  const endIndex = startIndex + window.sourceItemsPerPage;
  const pageData = window.sourceList.slice(startIndex, endIndex);
  
  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 20px; color: #666;">
          Không có dữ liệu nguồn hàng
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = pageData.map((source, index) => {
    const globalIndex = startIndex + index;
    const rowNumber = globalIndex + 1;
    
    // Build supplier info with contact (truncated with copy icon)
    const contactInfo = source.zaloContact || '';
    const truncatedContact = contactInfo.length > 10 ? contactInfo.substring(0, 10) + '...' : contactInfo;
    const supplierInfo = `
      <div style="font-weight: 500; margin-bottom: 3px;">${source.supplierName || '--'}</div>
      ${contactInfo ? `<div style="font-size: 0.85em; color: #666; display: flex; align-items: center; gap: 5px;">
        <span>${truncatedContact}</span>
        <i class="fas fa-copy" style="cursor: pointer; color: #3498db;" onclick="copyToClipboard('${contactInfo}')" title="Copy: ${contactInfo}"></i>
      </div>` : ''}
    `;
    
    // Build software info - 2 lines without labels
    const line1Parts = [source.softwareName || '', source.softwarePackage || ''].filter(part => part.trim() !== '');
    const line2Parts = [
      source.targetAudience ? getTargetAudienceDisplay(source.targetAudience) : '',
      source.accountProvisionMethod ? getAccountProvisionDisplay(source.accountProvisionMethod) : ''
    ].filter(part => part.trim() !== '');
    
    const softwareInfo = `
      <div style="margin-bottom: 2px; font-weight: 500;">${line1Parts.join(' - ') || '--'}</div>
      <div style="font-size: 0.9em; color: #666;">${line2Parts.join(' - ') || '--'}</div>
    `;
    
    // Build price info - 3 lines with labels
    const priceInfo = `
      <div style="margin-bottom: 2px; font-size: 0.9em;"><strong>Giá nhập:</strong> ${source.purchasePrice || '--'}</div>
      <div style="margin-bottom: 2px; font-size: 0.9em;"><strong>Giá bán:</strong> ${source.sellingPrice || '--'}</div>
      <div style="font-size: 0.9em;"><strong>Giá niêm yết:</strong> ${source.listedPrice || '--'}</div>
    `;
    
    return `
      <tr>
        <td style="text-align: center; font-weight: 500;">${rowNumber}</td>
        <td style="max-width: 200px; word-wrap: break-word;">${supplierInfo}</td>
        <td style="max-width: 300px; word-wrap: break-word;">${softwareInfo}</td>
        <td style="text-align: center;">${source.duration || '--'}</td>
        <td style="max-width: 150px; word-wrap: break-word;">${priceInfo}</td>
        <td style="text-align: center;">${source.deliveryTime || '--'}</td>
        <td style="max-width: 250px; word-wrap: break-word;">${source.upgradeMethod || '--'}</td>
        <td style="max-width: 250px; word-wrap: break-word;">${source.sourceNote || '--'}</td>
        <td style="max-width: 250px; word-wrap: break-word;">${source.customerRequirements || '--'}</td>
        <td style="text-align: center;">
          <select class="action-select" onchange="handleSourceAction(this, ${globalIndex})">
            <option value="">Chọn</option>
            <option value="edit">✏️ Sửa</option>
            <option value="delete">🗑️ Xóa</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
  
  updateSourcePagination();
}

// Copy to clipboard function
window.copyToClipboard = function(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // Modern approach
    navigator.clipboard.writeText(text).then(() => {
      showToast('Đã copy: ' + text, 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    // Fallback for older browsers
    fallbackCopyTextToClipboard(text);
  }
};

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showToast('Đã copy: ' + text, 'success');
    } else {
      showToast('Không thể copy', 'error');
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    showToast('Không thể copy', 'error');
  }

  document.body.removeChild(textArea);
}

function showToast(message, type) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// Get display text for source type
function getSourceTypeDisplay(type) {
  const typeMap = {
    'nha-cung-cap': 'Nhà cung cấp',
    'nha-phan-phoi': 'Nhà phân phối',
    'nha-san-xuat': 'Nhà sản xuất',
    'dai-ly': 'Đại lý',
    'khac': 'Khác'
  };
  return typeMap[type] || type || '';
}

// Get display text for payment terms
function getPaymentTermsDisplay(terms) {
  const termsMap = {
    'tien-mat': 'Tiền mặt',
    'chuyen-khoan': 'Chuyển khoản',
    '30-ngay': 'Net 30 ngày',
    '60-ngay': 'Net 60 ngày',
    '90-ngay': 'Net 90 ngày',
    'cod': 'COD'
  };
  return termsMap[terms] || terms || '';
}

// Get display text for rating
function getRatingDisplay(rating) {
  if (!rating) return '';
  const stars = '⭐'.repeat(parseInt(rating));
  return stars;
}

// Get display text for target audience
function getTargetAudienceDisplay(audience) {
  const audienceMap = {
    'ca-nhan': 'Cá nhân',
    'doanh-nghiep': 'Doanh nghiệp',
    'hoc-sinh-sinh-vien': 'Học sinh - Sinh viên',
    'gia-dinh': 'Gia đình',
    'chuyen-gia': 'Chuyên gia',
    'khac': 'Khác'
  };
  return audienceMap[audience] || audience || '';
}

// Get display text for account provision method
function getAccountProvisionDisplay(method) {
  const methodMap = {
    'tu-dong': 'Tự động',
    'thu-cong': 'Thủ công',
    'api': 'API',
    'email': 'Email',
    'sms': 'SMS',
    'khac': 'Khác'
  };
  return methodMap[method] || method || '';
}

// Update total display
function updateSourceTotalDisplay() {
  const totalDisplay = document.getElementById('sourceTotalDisplay');
  if (totalDisplay) {
    totalDisplay.textContent = `Tổng: ${window.sourceList.length} nguồn hàng`;
  }
}

// Update pagination controls
function updateSourcePagination() {
  const pagination = document.getElementById('sourcePagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(window.sourceList.length / window.sourceItemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  pagination.innerHTML = '';
  
  // First button
  const firstButton = document.createElement('button');
  firstButton.textContent = '«';
  firstButton.onclick = window.sourceFirstPage;
  firstButton.disabled = window.currentSourcePage === 1;
  pagination.appendChild(firstButton);
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = '‹';
  prevButton.onclick = window.sourcePrevPage;
  prevButton.disabled = window.currentSourcePage === 1;
  pagination.appendChild(prevButton);
  
  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, window.currentSourcePage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => window.sourceGoToPage(i);
    if (i === window.currentSourcePage) {
      pageButton.classList.add('active');
    }
    pagination.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = '›';
  nextButton.onclick = window.sourceNextPage;
  nextButton.disabled = window.currentSourcePage === totalPages;
  pagination.appendChild(nextButton);
  
  // Last button
  const lastButton = document.createElement('button');
  lastButton.textContent = '»';
  lastButton.onclick = window.sourceLastPage;
  lastButton.disabled = window.currentSourcePage === totalPages;
  pagination.appendChild(lastButton);
}

// Handle source actions (edit, delete)
window.handleSourceAction = function(selectElement, index) {
  const action = selectElement.value;
  if (!action) return;
  
  const source = window.sourceList[index];
  if (!source) return;
  
  switch (action) {
    case 'edit':
      editSourceItem(source, index);
      break;
    case 'delete':
      deleteSourceItem(source, index);
      break;
  }
  
  // Reset select
  selectElement.value = '';
};

// Edit source item
function editSourceItem(source, index) {
  console.log(`📝 Editing source at index ${index}:`, source);
  
  // Set the edit index
  window.currentEditSourceIndex = index;
  
  // Fill form with source data
  document.getElementById('supplierName').value = source.supplierName || '';
  document.getElementById('softwareName').value = source.softwareName || '';
  document.getElementById('zaloContact').value = source.zaloContact || '';
  document.getElementById('softwarePackage').value = source.softwarePackage || '';
  document.getElementById('targetAudience').value = source.targetAudience || '';
  document.getElementById('accountProvisionMethod').value = source.accountProvisionMethod || '';
  document.getElementById('duration').value = source.duration || '';
  document.getElementById('purchasePrice').value = source.purchasePrice || '';
  document.getElementById('sellingPrice').value = source.sellingPrice || '';
  document.getElementById('listedPrice').value = source.listedPrice || '';
  document.getElementById('sourceNote').value = source.sourceNote || '';
  document.getElementById('deliveryTime').value = source.deliveryTime || '';
  document.getElementById('customerRequirements').value = source.customerRequirements || '';
  document.getElementById('upgradeMethod').value = source.upgradeMethod || '';
  
  // Store for update reference - using rowIndex
  
  // Scroll to form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
  
  // Show notification
  if (typeof showResultModalUnified === 'function') {
    showResultModalUnified(
      `Dữ liệu nguồn hàng "${source.supplierName || source.softwareName}" đã được tải vào form. Bạn có thể chỉnh sửa và nhấn "Cập nhật" để lưu thay đổi.`, 
      true
    );
  }
}

// Delete source item
async function deleteSourceItem(source, index) {
  const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa nguồn hàng "${source.supplierName || source.softwareName}"?`);
  if (!confirmDelete) return;
  
  try {
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang xóa nguồn hàng...');
    } else if (typeof showProcessingModal === 'function') {
      showProcessingModal('Đang xóa nguồn hàng...');
    }
    
    const result = await apiRequestJson({
      action: "deleteSource",
      rowIndex: source.rowIndex
    });
    
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      // Remove from local array
      window.sourceList.splice(index, 1);
      
      // Update display
      updateSourceTable();
      updateSourceTotalDisplay();
      
      // Show success message
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified('Nguồn hàng đã được xóa thành công', true);
      }
    } else {
      // Show error message
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(result.message || 'Có lỗi xảy ra khi xóa nguồn hàng', false);
      }
    }
  } catch (error) {
    // Close processing modal if error occurs
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    console.error('❌ Error deleting source:', error);
    
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Có lỗi xảy ra khi xóa nguồn hàng', false);
    }
  }
}

// Handle add source
window.handleSourceAdd = async function() {
  console.log('🔄 Adding new source...');
  
  try {
    // Get form data
    const formData = getSourceFormData();
    
    // Validate required fields
    if (!validateSourceForm(formData)) {
      return;
    }
    
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang thêm nguồn hàng...');
    } else if (typeof showProcessingModal === 'function') {
      showProcessingModal('Đang thêm nguồn hàng...');
    }
    
    // Call backend API
    const result = await apiRequestJson({
      action: "addSource",
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
        showResultModalUnified(result.message || 'Nguồn hàng đã được thêm thành công', true);
      } else if (typeof showResultModal === 'function') {
        showResultModal(result.message || 'Nguồn hàng đã được thêm thành công', true);
      } else {
        alert('✅ ' + (result.message || 'Nguồn hàng đã được thêm thành công'));
      }
      
      // Reset form
      window.handleSourceReset();
      
      // Reload source data to reflect changes
      await loadSourceData();
      
      console.log('✅ Source added successfully:', result.data);
      
    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi thêm nguồn hàng';
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(errorMessage, false);
      } else {
        alert('❌ ' + errorMessage);
      }
      console.error('❌ Error adding source:', result.message);
    }
    
  } catch (error) {
    // Close processing modal if still open
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    console.error('❌ Error in handleSourceAdd:', error);
    const errorMessage = 'Có lỗi kết nối. Vui lòng thử lại sau.';
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
  }
};

// Handle update source
window.handleSourceUpdate = async function() {
  console.log('🔄 Updating source...');
  
  // Check if we're in edit mode
  if (window.currentEditSourceIndex === -1) {
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Vui lòng chọn một nguồn hàng để chỉnh sửa trước', false);
    } else {
      alert('⚠️ Vui lòng chọn một nguồn hàng để chỉnh sửa trước');
    }
    return;
  }
  
  // Get original source data
  const originalSource = window.sourceList[window.currentEditSourceIndex];
  if (!originalSource) {
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified('Không tìm thấy dữ liệu nguồn hàng gốc', false);
    } else {
      alert('❌ Không tìm thấy dữ liệu nguồn hàng gốc');
    }
    return;
  }
  
  // Get form data
  const formData = getSourceFormData();
  
  // Validate required fields
  if (!validateSourceForm(formData)) {
    return;
  }
  
  try {
    // Show processing modal
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang cập nhật nguồn hàng...');
    }
    
    // Prepare update data with original rowIndex
    const updateData = {
      rowIndex: originalSource.rowIndex,
      ...formData
    };
    
    console.log('Source update data:', updateData);
    
    // Call backend API
    const result = await apiRequestJson({
      action: "updateSource",
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
        showResultModalUnified(result.message || 'Nguồn hàng đã được cập nhật thành công', true);
      } else {
        alert('✅ ' + (result.message || 'Nguồn hàng đã được cập nhật thành công'));
      }
      
      // Reset form and editing state
      window.handleSourceReset();
      
      // Reload source data to reflect changes
      await loadSourceData();
      
      console.log('✅ Source updated successfully:', result.data);
      
    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi cập nhật nguồn hàng';
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(errorMessage, false);
      } else {
        alert('❌ ' + errorMessage);
      }
      console.error('❌ Error updating source:', result.message);
    }
    
  } catch (error) {
    // Close processing modal if still open
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    console.error('❌ Error in handleSourceUpdate:', error);
    const errorMessage = 'Có lỗi kết nối. Vui lòng thử lại sau.';
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
  }
};

// Handle search source
window.handleSourceSearch = async function() {
  console.log('🔍 Starting source search...');
  
  try {
    // Get search conditions from form
    const conditions = getSourceSearchConditions();
    
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
      showProcessingModalUnified('Đang tìm kiếm nguồn hàng...');
    }
    
    // Call backend API
    const result = await apiRequestJson({
      action: "searchSource",
      conditions: conditions
    });
    
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    if (result.status === "success") {
      // Update search results
      window.sourceList = result.data || [];
      window.isSourceSearching = true;
      window.sourceSearchTerms = conditions;
      window.currentSourcePage = 1;
      
      // Update display
      updateSourceTable();
      updateSourceTotalDisplay();
      
      // Show result message
      const count = window.sourceList.length;
      const message = count > 0 
        ? `Tìm thấy ${count} nguồn hàng phù hợp`
        : 'Không tìm thấy nguồn hàng nào phù hợp với điều kiện tìm kiếm';
      
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(message, true);
      } else {
        alert(count > 0 ? '✅ ' + message : '⚠️ ' + message);
      }
      
      console.log(`✅ Search completed: ${count} sources found`);
      
    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi tìm kiếm nguồn hàng';
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified(errorMessage, false);
      } else {
        alert('❌ ' + errorMessage);
      }
      console.error('❌ Error searching sources:', result.message);
    }
    
  } catch (error) {
    // Close processing modal
    if (typeof closeProcessingModalUnified === 'function') {
      closeProcessingModalUnified();
    } else if (typeof closeProcessingModal === 'function') {
      closeProcessingModal();
    }
    
    console.error('❌ Error in handleSourceSearch:', error);
    const errorMessage = 'Có lỗi kết nối. Vui lòng thử lại sau.';
    if (typeof showResultModalUnified === 'function') {
      showResultModalUnified(errorMessage, false);
    } else {
      alert('❌ ' + errorMessage);
    }
  }
};

// Handle reset source form
window.handleSourceReset = async function() {
  console.log('🔄 Resetting source form...');
  
  // Clear all form fields
  const form = document.getElementById('sourceForm');
  if (form) {
    form.reset();
  }
  
  // Clear any stored edit references
  
  // Clear any error messages
  clearSourceFormErrors();
  
  // Reset any global editing state
  window.currentEditSourceIndex = -1;
  
  // Clear search mode if active
  if (window.isSourceSearching) {
    window.isSourceSearching = false;
    window.sourceSearchTerms = [];
    
    // Show loading modal while reloading data
    if (typeof showProcessingModalUnified === 'function') {
      showProcessingModalUnified('Đang tải lại dữ liệu...');
    }
    
    try {
      // Reload original data
      await loadSourceData();
      
      // Close processing modal
      if (typeof closeProcessingModalUnified === 'function') {
        closeProcessingModalUnified();
      } else if (typeof closeProcessingModal === 'function') {
        closeProcessingModal();
      }
      
      console.log('🔄 Cleared search mode and reloaded original data');
    } catch (error) {
      // Close processing modal if error occurs
      if (typeof closeProcessingModalUnified === 'function') {
        closeProcessingModalUnified();
      } else if (typeof closeProcessingModal === 'function') {
        closeProcessingModal();
      }
      
      console.error('❌ Error reloading data:', error);
      
      if (typeof showResultModalUnified === 'function') {
        showResultModalUnified('Có lỗi xảy ra khi tải lại dữ liệu', false);
      }
    }
  }
  
  console.log('✅ Source form reset complete');
};

// Get form data
function getSourceFormData() {
  // Get the source form to ensure we're getting the right elements
  const sourceForm = document.getElementById('sourceForm');
  if (!sourceForm) {
    console.error('Source form not found');
    return {};
  }
  
  // Use form.elements to get the correct elements within the source form
  return {
    supplierName: sourceForm.elements['supplierName']?.value?.trim() || '',
    softwareName: sourceForm.elements['softwareName']?.value?.trim() || '',
    zaloContact: sourceForm.elements['zaloContact']?.value?.trim() || '',
    softwarePackage: sourceForm.elements['softwarePackage']?.value?.trim() || '',
    targetAudience: sourceForm.elements['targetAudience']?.value?.trim() || '',
    accountProvisionMethod: sourceForm.elements['accountProvisionMethod']?.value?.trim() || '',
    duration: sourceForm.elements['duration']?.value?.trim() || '',
    purchasePrice: sourceForm.elements['purchasePrice']?.value?.trim() || '',
    sellingPrice: sourceForm.elements['sellingPrice']?.value?.trim() || '',
    listedPrice: sourceForm.elements['listedPrice']?.value?.trim() || '',
    sourceNote: sourceForm.elements['sourceNote']?.value?.trim() || '',
    deliveryTime: sourceForm.elements['deliveryTime']?.value?.trim() || '',
    customerRequirements: sourceForm.elements['customerRequirements']?.value?.trim() || '',
    upgradeMethod: sourceForm.elements['upgradeMethod']?.value?.trim() || ''
  };
}

// Get search conditions
function getSourceSearchConditions() {
  const conditions = {};
  
  // Get the source form to ensure we're getting the right elements
  const sourceForm = document.getElementById('sourceForm');
  if (!sourceForm) {
    console.error('Source form not found');
    return conditions;
  }
  
  // Use form.elements to get the correct elements within the source form
  const supplierName = sourceForm.elements['supplierName']?.value?.trim();
  if (supplierName) conditions.supplierName = supplierName;
  
  const softwareName = sourceForm.elements['softwareName']?.value?.trim();
  if (softwareName) conditions.softwareName = softwareName;
  
  const zaloContact = sourceForm.elements['zaloContact']?.value?.trim();
  if (zaloContact) conditions.zaloContact = zaloContact;
  
  const softwarePackage = sourceForm.elements['softwarePackage']?.value?.trim();
  if (softwarePackage) conditions.softwarePackage = softwarePackage;
  
  const targetAudience = sourceForm.elements['targetAudience']?.value?.trim();
  if (targetAudience) conditions.targetAudience = targetAudience;
  
  const accountProvisionMethod = sourceForm.elements['accountProvisionMethod']?.value?.trim();
  if (accountProvisionMethod) conditions.accountProvisionMethod = accountProvisionMethod;
  
  const duration = sourceForm.elements['duration']?.value?.trim();
  if (duration) conditions.duration = duration;
  
  const purchasePrice = sourceForm.elements['purchasePrice']?.value?.trim();
  if (purchasePrice) conditions.purchasePrice = purchasePrice;
  
  const sellingPrice = sourceForm.elements['sellingPrice']?.value?.trim();
  if (sellingPrice) conditions.sellingPrice = sellingPrice;
  
  const listedPrice = sourceForm.elements['listedPrice']?.value?.trim();
  if (listedPrice) conditions.listedPrice = listedPrice;

  const deliveryTime = sourceForm.elements['deliveryTime']?.value?.trim();
  if (deliveryTime) conditions.deliveryTime = deliveryTime;

  const customerRequirements = sourceForm.elements['customerRequirements']?.value?.trim();
  if (customerRequirements) conditions.customerRequirements = customerRequirements;

  const upgradeMethod = sourceForm.elements['upgradeMethod']?.value?.trim();
  if (upgradeMethod) conditions.upgradeMethod = upgradeMethod;
  
  console.log('Search conditions:', conditions);
  
  return conditions;
}

// Validate source form
function validateSourceForm(formData) {
  let isValid = true;
  
  // Clear previous errors
  clearSourceFormErrors();
  
  // Validate required fields
  if (!formData.supplierName) {
    showFieldError('supplierName', 'Vui lòng nhập tên nhà cung cấp');
    isValid = false;
  }
  
  if (!formData.softwareName) {
    showFieldError('softwareName', 'Vui lòng nhập tên phần mềm');
    isValid = false;
  }
  
  // Validate price fields format if provided
  if (formData.purchasePrice && !isValidPrice(formData.purchasePrice)) {
    showFieldError('purchasePrice', 'Giá mua không hợp lệ');
    isValid = false;
  }
  
  if (formData.sellingPrice && !isValidPrice(formData.sellingPrice)) {
    showFieldError('sellingPrice', 'Giá bán không hợp lệ');
    isValid = false;
  }
  
  if (formData.listedPrice && !isValidPrice(formData.listedPrice)) {
    showFieldError('listedPrice', 'Giá niêm yết không hợp lệ');
    isValid = false;
  }
  
  return isValid;
}

// Clear form errors
function clearSourceFormErrors() {
  const errorElements = document.querySelectorAll('#sourceForm .error-message');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
  
  // Remove error class from inputs
  const inputs = document.querySelectorAll('#sourceForm input, #sourceForm select, #sourceForm textarea');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
}

// Show field error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  
  if (field) {
    field.classList.add('error');
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Price validation
function isValidPrice(price) {
  const priceRegex = /^\d+(\.\d+)?$/;
  return priceRegex.test(price);
}

// Initialize form event listeners for auto-fill functionality
function initFormEventListeners() {
  // Supplier name change event
  const supplierNameInput = document.getElementById('supplierName');
  if (supplierNameInput) {
    supplierNameInput.addEventListener('input', handleSupplierNameChange);
    supplierNameInput.addEventListener('change', handleSupplierNameChange);
  }
  
  // Software name change event  
  const softwareNameInput = document.getElementById('softwareName');
  if (softwareNameInput) {
    softwareNameInput.addEventListener('input', handleSoftwareNameChange);
    softwareNameInput.addEventListener('change', handleSoftwareNameChange);
  }
}

// Update dropdown data from loaded source list
function updateDropdownData() {
  const data = window.sourceList || [];
  
  // Reset dropdown data
  window.sourceDropdownData = {
    suppliers: [],
    software: [],
    zalo: [],
    packages: [],
    audiences: [],
    provisionMethods: [],
    durations: []
  };
  
  // Extract unique values for each dropdown
  data.forEach(item => {
    if (item.supplierName && !window.sourceDropdownData.suppliers.includes(item.supplierName)) {
      window.sourceDropdownData.suppliers.push(item.supplierName);
    }
    if (item.softwareName && !window.sourceDropdownData.software.includes(item.softwareName)) {
      window.sourceDropdownData.software.push(item.softwareName);
    }
    if (item.zaloContact && !window.sourceDropdownData.zalo.includes(item.zaloContact)) {
      window.sourceDropdownData.zalo.push(item.zaloContact);
    }
    if (item.softwarePackage && !window.sourceDropdownData.packages.includes(item.softwarePackage)) {
      window.sourceDropdownData.packages.push(item.softwarePackage);
    }
    if (item.targetAudience && !window.sourceDropdownData.audiences.includes(item.targetAudience)) {
      window.sourceDropdownData.audiences.push(item.targetAudience);
    }
    if (item.accountProvisionMethod && !window.sourceDropdownData.provisionMethods.includes(item.accountProvisionMethod)) {
      window.sourceDropdownData.provisionMethods.push(item.accountProvisionMethod);
    }
    if (item.duration && !window.sourceDropdownData.durations.includes(item.duration)) {
      window.sourceDropdownData.durations.push(item.duration);
    }
  });
  
  // Update all datalists
  updateDatalist('supplierNameList', window.sourceDropdownData.suppliers);
  updateDatalist('softwareNameList', window.sourceDropdownData.software);
  updateDatalist('zaloContactList', window.sourceDropdownData.zalo);
  updateDatalist('softwarePackageList', window.sourceDropdownData.packages);
  updateDatalist('targetAudienceList', window.sourceDropdownData.audiences);
  updateDatalist('accountProvisionMethodList', window.sourceDropdownData.provisionMethods);
  updateDatalist('durationList', window.sourceDropdownData.durations);
}

// Update a specific datalist with options
function updateDatalist(listId, options) {
  const datalist = document.getElementById(listId);
  if (!datalist) return;
  
  datalist.innerHTML = '';
  
  // Sort options alphabetically (ABC order)
  const sortedOptions = [...options].sort((a, b) => {
    return a.localeCompare(b, 'vi', { sensitivity: 'base' });
  });
  
  sortedOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    datalist.appendChild(optionElement);
  });
}

// Handle supplier name change - auto fill related fields
function handleSupplierNameChange(event) {
  const supplierName = event.target.value.trim();
  if (!supplierName) return;
  
  // Find all records with this supplier name
  const matchingRecords = window.sourceList.filter(item => 
    item.supplierName && item.supplierName.toLowerCase() === supplierName.toLowerCase()
  );
  
  if (matchingRecords.length === 0) return;
  
  // Auto-fill or update dropdown for related fields
  autoFillOrUpdateDropdown('zaloContact', 'zaloContactList', matchingRecords.map(r => r.zaloContact).filter(Boolean));
}

// Handle software name change - auto fill related fields
function handleSoftwareNameChange(event) {
  const softwareName = event.target.value.trim();
  if (!softwareName) return;
  
  // Find all records with this software name
  const matchingRecords = window.sourceList.filter(item => 
    item.softwareName && item.softwareName.toLowerCase() === softwareName.toLowerCase()
  );
  
  if (matchingRecords.length === 0) return;
  
  // Auto-fill or update dropdown for related fields
  autoFillOrUpdateDropdown('softwarePackage', 'softwarePackageList', matchingRecords.map(r => r.softwarePackage).filter(Boolean));
  autoFillOrUpdateDropdown('targetAudience', 'targetAudienceList', matchingRecords.map(r => r.targetAudience).filter(Boolean));
  autoFillOrUpdateDropdown('accountProvisionMethod', 'accountProvisionMethodList', matchingRecords.map(r => r.accountProvisionMethod).filter(Boolean));
  autoFillOrUpdateDropdown('duration', 'durationList', matchingRecords.map(r => r.duration).filter(Boolean));
  
  // Auto-fill price fields if only one unique value
  const uniquePurchasePrices = [...new Set(matchingRecords.map(r => r.purchasePrice).filter(Boolean))];
  if (uniquePurchasePrices.length === 1) {
    document.getElementById('purchasePrice').value = uniquePurchasePrices[0];
  }
  
  const uniqueSellingPrices = [...new Set(matchingRecords.map(r => r.sellingPrice).filter(Boolean))];
  if (uniqueSellingPrices.length === 1) {
    document.getElementById('sellingPrice').value = uniqueSellingPrices[0];
  }
  
  const uniqueListedPrices = [...new Set(matchingRecords.map(r => r.listedPrice).filter(Boolean))];
  if (uniqueListedPrices.length === 1) {
    document.getElementById('listedPrice').value = uniqueListedPrices[0];
  }
}

// Auto-fill field if only one unique value, otherwise update dropdown
function autoFillOrUpdateDropdown(fieldId, listId, values) {
  const field = document.getElementById(fieldId);
  const datalist = document.getElementById(listId);
  
  if (!field || !datalist) return;
  
  // Filter out empty values
  const nonEmptyValues = values.filter(value => value && value.trim() !== '');
  
  if (nonEmptyValues.length === 0) return;
  
  // Get unique values (loại bỏ trùng lặp)
  const uniqueValues = [...new Set(nonEmptyValues)];
  
  if (uniqueValues.length === 1) {
    // Chỉ có 1 giá trị duy nhất (có thể từ nhiều dòng nhưng giá trị giống nhau) → auto-fill
    field.value = uniqueValues[0];
  } else if (uniqueValues.length > 1) {
    // Có 2+ giá trị khác nhau → hiển thị dropdown
    updateDatalist(listId, uniqueValues);
  }
}