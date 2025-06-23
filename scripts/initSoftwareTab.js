/**
 * Initialize Software Tab
 * Handles software data loading, display, and pagination
 */
      if (window.softwareList.length > 0) {
        const hasOrderInfo = window.softwareList.some(item => item.orderInfo);
        const hasPasswordChangeDays = window.softwareList.some(item => item.passwordChangeDays);
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
    // Build action dropdown based on fileType
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
        <td class="login-info-cell">${loginInfo}</td>
        <td style="text-align: center;">${lastModified}</td>
        <td style="text-align: center;">${renewalDate}</td>
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
}
}
}
  });

    });
  } catch (error) {
  });

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
      console.log('View software:', software);
      break;
    case 'edit':
      console.log('Edit software:', software);
        window.open(`https://docs.google.com/spreadsheets/d/${software.accountSheetId}/edit`, '_blank');
      }
  };
  
  // Batch DOM updates to prevent layout thrashing
  });

      });
    }
    
    // Show success message
      headers: { "Content-Type": "application/json" },
  });
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
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Lỗi kết nối!', errorMessage, 'error');
    } else {
      alert('❌ ' + errorMessage);
    }
    console.error('❌ Network error adding software:', error);
  }
};
      // New values for update
      ...formData
    };
    
    console.log('Software update data:', updateData);
    
    // Call backend API
      headers: { "Content-Type": "application/json" },
  });
        ...updateData
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
        showResultModalModern('Thành công!', result.message || 'Phần mềm đã được cập nhật thành công', 'success');
      } else {
        alert('✅ ' + (result.message || 'Phần mềm đã được cập nhật thành công'));
      }
      
      // Reset form and editing state
      window.handleSoftwareReset();
      
      // Reload software data to reflect changes
      await loadSoftwareData();

    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi cập nhật phần mềm';
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Lỗi!', errorMessage, 'error');
      } else {
        alert('❌ ' + errorMessage);
      }
      console.error('❌ Error updating software:', result.message);
    }
  } catch (error) {
    // Close processing modal if still open
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Lỗi kết nối!', errorMessage, 'error');
    } else {
      alert('❌ ' + errorMessage);
    }
    console.error('❌ Network error updating software:', error);
  }
};

window.handleSoftwareSearch = async function() {
  
  // Get form data
  const formData = getSoftwareFormData();
  
  // Check if at least one search field is filled
  const hasSearchCriteria = Object.values(formData).some(value => value && value.trim() !== '');
  
  if (!hasSearchCriteria) {
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Thông báo!', 'Vui lòng nhập ít nhất một tiêu chí tìm kiếm', 'warning');
    } else {
      alert('⚠️ Vui lòng nhập ít nhất một tiêu chí tìm kiếm');
    }
    return;
  }
  
  try {
    // Show processing modal
    if (typeof showProcessingModalModern === 'function') {
      showProcessingModalModern('Đang tìm kiếm phần mềm...', 'Vui lòng đợi trong giây lát');
    }
    
    // Prepare search conditions (only include non-empty fields)
    const searchConditions = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        searchConditions[key] = value.trim();
      }
    });
    
    console.log('Software search conditions:', searchConditions);
    
    // Call backend API
    const { BACKEND_URL } = getConstants();
    const response = await fetch(BACKEND_URL, {
  });
    });
    
    const result = await response.json();
    
    // Close processing modal
    if (typeof closeProcessingModalModern === 'function') {
      closeProcessingModalModern();
    }
    
    if (result.status === "success") {
      // Store search results and enable search mode
      window.softwareList = result.data || [];
      window.isSoftwareSearching = true;
      window.softwareSearchTerms = Object.values(searchConditions);
      
      // Reset to first page
      window.currentSoftwarePage = 1;
      
      // Update display
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
      
      // Show success message
      const message = result.message || `Tìm thấy ${result.data.length} phần mềm phù hợp`;
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Kết quả tìm kiếm!', message, 'success');
      } else {
        alert('✅ ' + message);
      }

    } else {
      // Show error message
      const errorMessage = result.message || 'Có lỗi xảy ra khi tìm kiếm phần mềm';
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Lỗi!', errorMessage, 'error');
      } else {
        alert('❌ ' + errorMessage);
      }
      console.error('❌ Error searching software:', result.message);
    }
  } catch (error) {
    // Close processing modal if still open
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Lỗi kết nối!', errorMessage, 'error');
    } else {
      alert('❌ ' + errorMessage);
    }
    console.error('❌ Network error searching software:', error);
  }
};
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
      updateOrderInfoDropdown();
      updateStandardNameDropdown();
  } catch (error) {
      console.error('Error in debounced dropdown update:', error);
    }
  });
}, 100); // Reduced from 150ms to 100ms

// Function để force refresh tất cả dropdowns - cho debugging
    };
    
    // Batch all value assignments
      // New data to update
      ...formData
    };
    
    // Call backend API
      headers: { "Content-Type": "application/json" },
  });
        ...updateData
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
        showResultModalModern('Thành công!', result.message || 'Phần mềm đã được cập nhật thành công', 'success');
      } else {
        alert('✅ ' + (result.message || 'Phần mềm đã được cập nhật thành công'));
      }
      
      // Reset form and edit state
      window.handleSoftwareReset();
      window.currentEditSoftwareIndex = -1;
      
      // Reload software data to reflect changes
      await loadSoftwareData();

    } else {
      // Show error message
      console.error('❌ Error updating software:', result.message);
      
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Lỗi!', result.message || 'Có lỗi xảy ra khi cập nhật phần mềm', 'error');
      } else {
        alert('❌ ' + (result.message || 'Có lỗi xảy ra khi cập nhật phần mềm'));
      }
    }
  } catch (error) {
    console.error('❌ Error in handleSoftwareUpdate:', error);
    
    // Close processing modal if it's open
    if (typeof closeProcessingModalModern === 'function') {
      closeProcessingModalModern();
    }
    
    const errorMessage = 'Có lỗi xảy ra khi cập nhật phần mềm. Vui lòng thử lại.';
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Lỗi!', errorMessage, 'error');
    } else {
      alert('❌ ' + errorMessage);
    }
  }
};

// ========================================
// SEARCH SOFTWARE FUNCTIONALITY
// ========================================

window.handleSoftwareSearch = async function() {
  
  try {
    // Get search conditions from form
    const conditions = getSoftwareSearchConditions();
    
    // Check if at least one search condition is provided
    if (Object.keys(conditions).length === 0) {
      if (typeof showResultModalModern === 'function') {
        showResultModalModern(
          'Thiếu điều kiện tìm kiếm!', 
          'Vui lòng nhập ít nhất một điều kiện tìm kiếm trong form.', 
          'warning'
        );
      } else {
        alert('⚠️ Vui lòng nhập ít nhất một điều kiện tìm kiếm');
      }
      return;
    }
    
    // Show processing modal
    if (typeof showProcessingModalModern === 'function') {
      showProcessingModalModern('Đang tìm kiếm phần mềm...', 'Vui lòng đợi trong giây lát');
    }
    
    // Call backend API
    const { BACKEND_URL } = getConstants();
    const response = await fetch(BACKEND_URL, {
  });
    });
    
    const result = await response.json();
    
    // Close processing modal
    if (typeof closeProcessingModalModern === 'function') {
      closeProcessingModalModern();
    }
    
    if (result.status === "success") {
      // Set search mode and update software list
      window.isSoftwareSearching = true;
      window.softwareList = result.data || [];
      window.currentSoftwarePage = 1;
      
      // Update display
      updateSoftwareTable();
      updateSoftwareTotalDisplay();
      
      // Show success message
      const message = result.message || `Tìm thấy ${result.data.length} phần mềm phù hợp`;
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Tìm kiếm thành công!', message, 'success');
      } else {
        alert('✅ ' + message);
      }

    } else {
      // Show error message
      console.error('❌ Error searching software:', result.message);
      
      if (typeof showResultModalModern === 'function') {
        showResultModalModern('Lỗi!', result.message || 'Có lỗi xảy ra khi tìm kiếm phần mềm', 'error');
      } else {
        alert('❌ ' + (result.message || 'Có lỗi xảy ra khi tìm kiếm phần mềm'));
      }
    }
  } catch (error) {
    console.error('❌ Error in handleSoftwareSearch:', error);
    
    // Close processing modal if it's open
    }
  });
  // Yellow: when diffDays > passwordChangeDays
  } else if (diffDays > passwordChangeThreshold) {
  }
          };
          
          // Temporarily set this as current transaction for the handler
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
        console.error('❌ handleUpdateCookie function not found');
        alert('❌ Chức năng cập nhật cookie chưa sẵn sàng');
      }
      break;
    default:
      console.warn(`⚠️ Unknown action: ${action}`);
  }
};

// View software item details
function viewSoftwareItem(index) {
  const software = window.softwareList[index];
  if (!software) {
    console.error('❌ Software not found at index:', index);
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
    showResultModalModern('Chi tiết phần mềm', details, 'info');
  } else {
    // Fallback to alert if modal not available
    alert(`💻 ${software.softwareName}\n• Gói: ${software.softwarePackage}\n• Tài khoản: ${software.accountName}\n• Giá: ${formatCurrency(software.price)}`);
  }
}

// Open Google Sheet for software
function openSoftwareSheet(index) {
  const software = window.softwareList[index];
  if (!software) {
    console.error('❌ Software not found at index:', index);
    return;
  }
  
  if (!software.accountSheetId) {
    if (typeof showResultModalModern === 'function') {
      showResultModalModern('Thông báo', 'Phần mềm này chưa có liên kết tới Google Sheet', 'warning');
    } else {
      alert('⚠️ Phần mềm này chưa có liên kết tới Google Sheet');
    }
    return;
  }

  // Construct Google Sheets URL
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${software.accountSheetId}/edit`;
  
  // Open in new tab
  window.open(sheetUrl, '_blank');
  
  // Show confirmation
  if (typeof showResultModalModern === 'function') {
    showResultModalModern('Thành công', `Đã mở Google Sheet cho ${software.softwareName}`, 'success');
  }
}