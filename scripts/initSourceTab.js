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
  document.getElementById('sourceSupplierName').value = source.supplierName || '';
  document.getElementById('sourceSoftwareName').value = source.softwareName || '';
  document.getElementById('sourceZaloContact').value = source.zaloContact || '';
  document.getElementById('sourceSoftwarePackage').value = source.softwarePackage || '';
  document.getElementById('sourceTargetAudience').value = source.targetAudience || '';
  document.getElementById('sourceAccountProvisionMethod').value = source.accountProvisionMethod || '';
  document.getElementById('sourceDuration').value = source.duration || '';
  document.getElementById('sourcePurchasePrice').value = source.purchasePrice || '';
  document.getElementById('sourceSellingPrice').value = source.sellingPrice || '';
  document.getElementById('sourceListedPrice').value = source.listedPrice || '';
  document.getElementById('sourceNote').value = source.sourceNote || '';
  document.getElementById('sourceDeliveryTime').value = source.deliveryTime || '';
  document.getElementById('sourceCustomerRequirements').value = source.customerRequirements || '';
  document.getElementById('sourceUpgradeMethod').value = source.upgradeMethod || '';
  
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
    
    // ✅ LOGIC ĐẶC BIỆT: Nếu có ghi chú, chỉ tìm kiếm theo ghi chú
    if (conditions.sourceNote) {
      console.log('🔍 Special search mode: searching by note only');
      conditions.isNoteOnlySearch = true;
      // Giữ lại chỉ trường ghi chú
      const noteValue = conditions.sourceNote;
      Object.keys(conditions).forEach(key => {
        if (key !== 'sourceNote' && key !== 'isNoteOnlySearch') {
          delete conditions[key];
        }
      });
      conditions.sourceNote = noteValue;
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
    supplierName: sourceForm.elements['sourceSupplierName']?.value?.trim() || '',
    softwareName: sourceForm.elements['sourceSoftwareName']?.value?.trim() || '',
    zaloContact: sourceForm.elements['sourceZaloContact']?.value?.trim() || '',
    softwarePackage: sourceForm.elements['sourceSoftwarePackage']?.value?.trim() || '',
    targetAudience: sourceForm.elements['sourceTargetAudience']?.value?.trim() || '',
    accountProvisionMethod: sourceForm.elements['sourceAccountProvisionMethod']?.value?.trim() || '',
    duration: sourceForm.elements['sourceDuration']?.value?.trim() || '',
    purchasePrice: sourceForm.elements['sourcePurchasePrice']?.value?.trim() || '',
    sellingPrice: sourceForm.elements['sourceSellingPrice']?.value?.trim() || '',
    listedPrice: sourceForm.elements['sourceListedPrice']?.value?.trim() || '',
    sourceNote: sourceForm.elements['sourceNote']?.value?.trim() || '',
    deliveryTime: sourceForm.elements['sourceDeliveryTime']?.value?.trim() || '',
    customerRequirements: sourceForm.elements['sourceCustomerRequirements']?.value?.trim() || '',
    upgradeMethod: sourceForm.elements['sourceUpgradeMethod']?.value?.trim() || ''
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
  const supplierName = sourceForm.elements['sourceSupplierName']?.value?.trim();
  if (supplierName) conditions.supplierName = supplierName;
  
  const softwareName = sourceForm.elements['sourceSoftwareName']?.value?.trim();
  if (softwareName) conditions.softwareName = softwareName;
  
  const zaloContact = sourceForm.elements['sourceZaloContact']?.value?.trim();
  if (zaloContact) conditions.zaloContact = zaloContact;
  
  const softwarePackage = sourceForm.elements['sourceSoftwarePackage']?.value?.trim();
  if (softwarePackage) conditions.softwarePackage = softwarePackage;
  
  const targetAudience = sourceForm.elements['sourceTargetAudience']?.value?.trim();
  if (targetAudience) conditions.targetAudience = targetAudience;
  
  const accountProvisionMethod = sourceForm.elements['sourceAccountProvisionMethod']?.value?.trim();
  if (accountProvisionMethod) conditions.accountProvisionMethod = accountProvisionMethod;
  
  const duration = sourceForm.elements['sourceDuration']?.value?.trim();
  if (duration) conditions.duration = duration;
  
  const purchasePrice = sourceForm.elements['sourcePurchasePrice']?.value?.trim();
  if (purchasePrice) conditions.purchasePrice = purchasePrice;
  
  const sellingPrice = sourceForm.elements['sourceSellingPrice']?.value?.trim();
  if (sellingPrice) conditions.sellingPrice = sellingPrice;
  
  const listedPrice = sourceForm.elements['sourceListedPrice']?.value?.trim();
  if (listedPrice) conditions.listedPrice = listedPrice;

  const deliveryTime = sourceForm.elements['sourceDeliveryTime']?.value?.trim();
  if (deliveryTime) conditions.deliveryTime = deliveryTime;

  const customerRequirements = sourceForm.elements['sourceCustomerRequirements']?.value?.trim();
  if (customerRequirements) conditions.customerRequirements = customerRequirements;

  const upgradeMethod = sourceForm.elements['sourceUpgradeMethod']?.value?.trim();
  if (upgradeMethod) conditions.upgradeMethod = upgradeMethod;
  
  const sourceNote = sourceForm.elements['sourceNote']?.value?.trim();
  if (sourceNote) conditions.sourceNote = sourceNote;
  
  console.log('🔍 Search conditions being sent to backend:', conditions);
  console.log('🔍 Number of search conditions:', Object.keys(conditions).length);
  
  return conditions;
}

// Validate source form
function validateSourceForm(formData) {
  let isValid = true;
  
  // Clear previous errors
  clearSourceFormErrors();
  
  // Validate required fields
  if (!formData.supplierName) {
    showFieldError('sourceSupplierName', 'Vui lòng nhập tên nhà cung cấp');
    isValid = false;
  }
  
  if (!formData.softwareName) {
    showFieldError('sourceSoftwareName', 'Vui lòng nhập tên phần mềm');
    isValid = false;
  }
  
  // Validate price fields format if provided
  if (formData.purchasePrice && !isValidPrice(formData.purchasePrice)) {
    showFieldError('sourcePurchasePrice', 'Giá mua không hợp lệ');
    isValid = false;
  }
  
  if (formData.sellingPrice && !isValidPrice(formData.sellingPrice)) {
    showFieldError('sourceSellingPrice', 'Giá bán không hợp lệ');
    isValid = false;
  }
  
  if (formData.listedPrice && !isValidPrice(formData.listedPrice)) {
    showFieldError('sourceListedPrice', 'Giá niêm yết không hợp lệ');
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
  const supplierNameInput = document.getElementById('sourceSupplierName');
  if (supplierNameInput) {
    supplierNameInput.addEventListener('input', handleSupplierNameChange);
    supplierNameInput.addEventListener('change', handleSupplierNameChange);
  }
  
  // Software name change event  
  const softwareNameInput = document.getElementById('sourceSoftwareName');
  if (softwareNameInput) {
    softwareNameInput.addEventListener('input', handleSoftwareNameChange);
    softwareNameInput.addEventListener('change', handleSoftwareNameChange);
  }
  
  // Software package change event
  const softwarePackageInput = document.getElementById('sourceSoftwarePackage');
  if (softwarePackageInput) {
    softwarePackageInput.addEventListener('input', handleSoftwarePackageChange);
    softwarePackageInput.addEventListener('change', handleSoftwarePackageChange);
    
    // Focus event - refresh dropdown based on current software name
    softwarePackageInput.addEventListener('focus', function() {
      const currentSoftwareName = document.getElementById('sourceSoftwareName').value.trim();
      if (currentSoftwareName) {
        // Re-trigger the software name change handler to refresh the package dropdown
        handleSoftwareNameChange({ target: { value: currentSoftwareName } });
      }
    });
  }
  
  // Target audience change event
  const targetAudienceInput = document.getElementById('sourceTargetAudience');
  if (targetAudienceInput) {
    targetAudienceInput.addEventListener('input', handleTargetAudienceChange);
    targetAudienceInput.addEventListener('change', handleTargetAudienceChange);
  }
  
  // Account provision method change event
  const accountProvisionInput = document.getElementById('sourceAccountProvisionMethod');
  if (accountProvisionInput) {
    accountProvisionInput.addEventListener('input', handleAccountProvisionMethodChange);
    accountProvisionInput.addEventListener('change', handleAccountProvisionMethodChange);
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
  updateDatalist('sourceSupplierNameList', window.sourceDropdownData.suppliers);
  updateDatalist('sourceSoftwareNameList', window.sourceDropdownData.software);
  updateDatalist('sourceZaloContactList', window.sourceDropdownData.zalo);
  updateDatalist('sourceSoftwarePackageList', window.sourceDropdownData.packages);
  updateDatalist('sourceTargetAudienceList', window.sourceDropdownData.audiences);
  updateDatalist('sourceAccountProvisionMethodList', window.sourceDropdownData.provisionMethods);
  updateDatalist('sourceDurationList', window.sourceDropdownData.durations);
}

// Update a specific datalist with options
function updateDatalist(listId, options) {
  const datalist = document.getElementById(listId);
  if (!datalist) {
    console.warn(`⚠️ Datalist with ID "${listId}" not found`);
    return;
  }
  
  console.log(`🔄 Updating datalist "${listId}" with ${options.length} options:`, options);
  
  datalist.innerHTML = '';
  
  // Sort options alphabetically (ABC order)
  const sortedOptions = [...options].sort((a, b) => {
    // Convert to strings to ensure localeCompare works
    const strA = String(a);
    const strB = String(b);
    return strA.localeCompare(strB, 'vi', { sensitivity: 'base' });
  });
  
  sortedOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    datalist.appendChild(optionElement);
  });
  
  console.log(`✅ Successfully updated datalist "${listId}" with ${sortedOptions.length} sorted options`);
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
  autoFillOrUpdateDropdown('sourceZaloContact', 'sourceZaloContactList', matchingRecords.map(r => r.zaloContact).filter(Boolean));
}

// Handle software name change - filter package dropdown only
function handleSoftwareNameChange(event) {
  const softwareName = event.target.value.trim();
  
  console.log(`🔍 Software name changed to: "${softwareName}"`);
  
  // Clear dependent fields when software name changes
  clearDependentFields(['sourceSoftwarePackage', 'sourceTargetAudience', 'sourceAccountProvisionMethod', 'sourceDuration']);
  
  // If software name is empty, reset all dropdowns to show all values
  if (!softwareName) {
    updateDatalist('sourceSoftwarePackageList', window.sourceDropdownData.packages);
    updateDatalist('sourceTargetAudienceList', window.sourceDropdownData.audiences);
    updateDatalist('sourceAccountProvisionMethodList', window.sourceDropdownData.provisionMethods);
    updateDatalist('sourceDurationList', window.sourceDropdownData.durations);
    console.log('📋 Reset all dropdowns to original values');
    return;
  }
  
  // Find all records with this software name (case insensitive)
  const matchingRecords = window.sourceList.filter(item => 
    item.softwareName && item.softwareName.toLowerCase() === softwareName.toLowerCase()
  );
  
  console.log(`📊 Found ${matchingRecords.length} matching records for software: "${softwareName}"`);
  
  if (matchingRecords.length === 0) {
    console.log('⚠️ No matching records found, resetting dropdowns');
    updateDatalist('sourceSoftwarePackageList', []);
    updateDatalist('sourceTargetAudienceList', []);
    updateDatalist('sourceAccountProvisionMethodList', []);
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Update only the software package dropdown with filtered values
  const softwarePackages = matchingRecords
    .map(r => r.softwarePackage)
    .filter(pkg => pkg && pkg.toString().trim() !== '');
  
  const uniquePackages = [...new Set(softwarePackages)];
  
  console.log(`📦 Found ${uniquePackages.length} unique packages:`, uniquePackages);
  updateDatalist('sourceSoftwarePackageList', uniquePackages);
  
  // Reset other dropdowns until package is selected
  updateDatalist('sourceTargetAudienceList', []);
  updateDatalist('sourceAccountProvisionMethodList', []);
  updateDatalist('sourceDurationList', []);
  
  // Auto-fill package field if only one unique value
  if (uniquePackages.length === 1) {
    document.getElementById('sourceSoftwarePackage').value = uniquePackages[0];
    console.log(`✅ Auto-filled package field with: "${uniquePackages[0]}"`);
    // Trigger package change event
    handleSoftwarePackageChange({ target: { value: uniquePackages[0] } });
  }
}

// Clear dependent fields utility function
function clearDependentFields(fieldIds) {
  fieldIds.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = '';
    }
  });
}

// Get filtered records based on current selections
function getFilteredRecords() {
  const softwareName = document.getElementById('sourceSoftwareName').value.trim();
  const softwarePackage = document.getElementById('sourceSoftwarePackage').value.trim();
  const targetAudience = document.getElementById('sourceTargetAudience').value.trim();
  const accountProvisionMethod = document.getElementById('sourceAccountProvisionMethod').value.trim();
  
  let filteredRecords = window.sourceList || [];
  
  if (softwareName) {
    filteredRecords = filteredRecords.filter(item => 
      item.softwareName && item.softwareName.toLowerCase() === softwareName.toLowerCase()
    );
  }
  
  if (softwarePackage) {
    filteredRecords = filteredRecords.filter(item => 
      item.softwarePackage && item.softwarePackage.toLowerCase() === softwarePackage.toLowerCase()
    );
  }
  
  if (targetAudience) {
    filteredRecords = filteredRecords.filter(item => 
      item.targetAudience && item.targetAudience.toLowerCase() === targetAudience.toLowerCase()
    );
  }
  
  if (accountProvisionMethod) {
    filteredRecords = filteredRecords.filter(item => 
      item.accountProvisionMethod && item.accountProvisionMethod.toLowerCase() === accountProvisionMethod.toLowerCase()
    );
  }
  
  return filteredRecords;
}

// Handle software package change - filter target audience dropdown
function handleSoftwarePackageChange(event) {
  const softwarePackage = event.target.value.trim();
  
  console.log(`📦 Software package changed to: "${softwarePackage}"`);
  
  // Clear dependent fields
  clearDependentFields(['sourceTargetAudience', 'sourceAccountProvisionMethod', 'sourceDuration']);
  
  if (!softwarePackage) {
    updateDatalist('sourceTargetAudienceList', []);
    updateDatalist('sourceAccountProvisionMethodList', []);
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Get filtered records based on software name and package
  const filteredRecords = getFilteredRecords();
  
  console.log(`🎯 Found ${filteredRecords.length} records for software package: "${softwarePackage}"`);
  
  if (filteredRecords.length === 0) {
    updateDatalist('sourceTargetAudienceList', []);
    updateDatalist('sourceAccountProvisionMethodList', []);
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Update target audience dropdown
  const targetAudiences = filteredRecords
    .map(r => r.targetAudience)
    .filter(audience => audience && audience.toString().trim() !== '');
  
  const uniqueAudiences = [...new Set(targetAudiences)];
  console.log(`👥 Found ${uniqueAudiences.length} unique target audiences:`, uniqueAudiences);
  
  updateDatalist('sourceTargetAudienceList', uniqueAudiences);
  
  // Reset subsequent dropdowns
  updateDatalist('sourceAccountProvisionMethodList', []);
  updateDatalist('sourceDurationList', []);
  
  // Auto-fill if only one option
  if (uniqueAudiences.length === 1) {
    document.getElementById('sourceTargetAudience').value = uniqueAudiences[0];
    console.log(`✅ Auto-filled target audience: "${uniqueAudiences[0]}"`);
    handleTargetAudienceChange({ target: { value: uniqueAudiences[0] } });
  }
}

// Handle target audience change - filter account provision method dropdown
function handleTargetAudienceChange(event) {
  const targetAudience = event.target.value.trim();
  
  console.log(`👥 Target audience changed to: "${targetAudience}"`);
  
  // Clear dependent fields
  clearDependentFields(['sourceAccountProvisionMethod', 'sourceDuration']);
  
  if (!targetAudience) {
    updateDatalist('sourceAccountProvisionMethodList', []);
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Get filtered records
  const filteredRecords = getFilteredRecords();
  
  console.log(`🔐 Found ${filteredRecords.length} records for target audience: "${targetAudience}"`);
  
  if (filteredRecords.length === 0) {
    updateDatalist('sourceAccountProvisionMethodList', []);
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Update account provision method dropdown
  const provisionMethods = filteredRecords
    .map(r => r.accountProvisionMethod)
    .filter(method => method && method.toString().trim() !== '');
  
  const uniqueMethods = [...new Set(provisionMethods)];
  console.log(`🔐 Found ${uniqueMethods.length} unique provision methods:`, uniqueMethods);
  
  updateDatalist('sourceAccountProvisionMethodList', uniqueMethods);
  
  // Reset subsequent dropdowns
  updateDatalist('sourceDurationList', []);
  
  // Auto-fill if only one option
  if (uniqueMethods.length === 1) {
    document.getElementById('sourceAccountProvisionMethod').value = uniqueMethods[0];
    console.log(`✅ Auto-filled provision method: "${uniqueMethods[0]}"`);
    handleAccountProvisionMethodChange({ target: { value: uniqueMethods[0] } });
  }
}

// Handle account provision method change - filter duration dropdown
function handleAccountProvisionMethodChange(event) {
  const accountProvisionMethod = event.target.value.trim();
  
  console.log(`🔐 Account provision method changed to: "${accountProvisionMethod}"`);
  
  // Clear dependent fields
  clearDependentFields(['sourceDuration']);
  
  if (!accountProvisionMethod) {
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Get filtered records
  const filteredRecords = getFilteredRecords();
  
  console.log(`⏰ Found ${filteredRecords.length} records for provision method: "${accountProvisionMethod}"`);
  
  if (filteredRecords.length === 0) {
    updateDatalist('sourceDurationList', []);
    return;
  }
  
  // Update duration dropdown
  const durations = filteredRecords
    .map(r => r.duration)
    .filter(duration => duration && duration.toString().trim() !== '');
  
  const uniqueDurations = [...new Set(durations)];
  console.log(`⏰ Found ${uniqueDurations.length} unique durations:`, uniqueDurations);
  
  updateDatalist('sourceDurationList', uniqueDurations);
  
  // Auto-fill if only one option
  if (uniqueDurations.length === 1) {
    document.getElementById('sourceDuration').value = uniqueDurations[0];
    console.log(`✅ Auto-filled duration: "${uniqueDurations[0]}"`);
  }
  
  // Auto-fill price fields if records match exactly
  autoFillPriceFields(filteredRecords);
}

// Auto-fill price fields based on exact matches
function autoFillPriceFields(records) {
  if (records.length === 0) return;
  
  // Auto-fill price fields if only one unique value
  const uniquePurchasePrices = [...new Set(records.map(r => r.purchasePrice).filter(Boolean))];
  if (uniquePurchasePrices.length === 1) {
    document.getElementById('sourcePurchasePrice').value = uniquePurchasePrices[0];
    console.log(`💰 Auto-filled purchase price: "${uniquePurchasePrices[0]}"`);
  }
  
  const uniqueSellingPrices = [...new Set(records.map(r => r.sellingPrice).filter(Boolean))];
  if (uniqueSellingPrices.length === 1) {
    document.getElementById('sourceSellingPrice').value = uniqueSellingPrices[0];
    console.log(`💰 Auto-filled selling price: "${uniqueSellingPrices[0]}"`);
  }
  
  const uniqueListedPrices = [...new Set(records.map(r => r.listedPrice).filter(Boolean))];
  if (uniqueListedPrices.length === 1) {
    document.getElementById('sourceListedPrice').value = uniqueListedPrices[0];
    console.log(`💰 Auto-filled listed price: "${uniqueListedPrices[0]}"`);
  }
  
  const uniqueDeliveryTimes = [...new Set(records.map(r => r.deliveryTime).filter(Boolean))];
  if (uniqueDeliveryTimes.length === 1) {
    document.getElementById('sourceDeliveryTime').value = uniqueDeliveryTimes[0];
    console.log(`🚚 Auto-filled delivery time: "${uniqueDeliveryTimes[0]}"`);
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