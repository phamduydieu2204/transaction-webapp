/**
 * Form Validation Script
 * Handles validation for required fields and shows error messages
 */

// Validation configuration for different forms
const validationConfig = {
  transactionForm: {
    fields: [
      { id: 'transactionDate', required: true, message: 'Vui lòng nhập ngày giao dịch' },
      { id: 'customerEmail', required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' },
      { id: 'customerName', required: true, message: 'Vui lòng nhập tên khách hàng' },
      { id: 'transactionType', required: true, message: 'Vui lòng chọn loại giao dịch' },
      { id: 'revenue', required: true, type: 'number', message: 'Vui lòng nhập doanh thu' }
    ]
  },
  expenseForm: {
    fields: [
      { id: 'expenseDate', required: true, message: 'Vui lòng nhập ngày chi' },
      { id: 'expenseCategory', required: true, message: 'Vui lòng chọn loại khoản chi' },
      { id: 'expenseAmount', required: true, type: 'number', message: 'Vui lòng nhập số tiền' }
    ]
  }
};

/**
 * Validate a single field
 */
function validateField(fieldConfig) {
  const element = document.getElementById(fieldConfig.id);
  const formField = element.closest('.form-field');
  
  if (!element || !formField) return true;
  
  let isValid = true;
  let value = element.value.trim();
  
  // Check if required field is empty
  if (fieldConfig.required && !value) {
    isValid = false;
  }
  
  // Check email format
  if (fieldConfig.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
    }
  }
  
  // Check number format
  if (fieldConfig.type === 'number' && value) {
    if (isNaN(value) || parseFloat(value) <= 0) {
      isValid = false;
    }
  }
  
  // Update UI based on validation result
  if (isValid) {
    formField.classList.remove('error');
  } else {
    formField.classList.add('error');
    const errorMessage = formField.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.textContent = fieldConfig.message;
    }
  }
  
  return isValid;
}

/**
 * Validate entire form
 */
function validateForm(formId) {
  const config = validationConfig[formId];
  if (!config) return true;
  
  let isFormValid = true;
  
  // Validate each field
  config.fields.forEach(fieldConfig => {
    const fieldValid = validateField(fieldConfig);
    if (!fieldValid) {
      isFormValid = false;
    }
  });
  
  return isFormValid;
}

/**
 * Clear validation errors for a form
 */
function clearValidationErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const errorFields = form.querySelectorAll('.form-field.error');
  errorFields.forEach(field => {
    field.classList.remove('error');
  });
}

/**
 * Setup real-time validation
 */
function setupRealTimeValidation() {
  // Setup validation for transaction form
  if (document.getElementById('transactionForm')) {
    validationConfig.transactionForm.fields.forEach(fieldConfig => {
      const element = document.getElementById(fieldConfig.id);
      if (element) {
        // Validate on blur
        element.addEventListener('blur', () => {
          validateField(fieldConfig);
        });
        
        // Clear error on input
        element.addEventListener('input', () => {
          const formField = element.closest('.form-field');
          if (formField && formField.classList.contains('error')) {
            formField.classList.remove('error');
          }
        });
      }
    });
  }
  
  // Setup validation for expense form
  if (document.getElementById('expenseForm')) {
    validationConfig.expenseForm.fields.forEach(fieldConfig => {
      const element = document.getElementById(fieldConfig.id);
      if (element) {
        // Validate on blur
        element.addEventListener('blur', () => {
          validateField(fieldConfig);
        });
        
        // Clear error on input
        element.addEventListener('input', () => {
          const formField = element.closest('.form-field');
          if (formField && formField.classList.contains('error')) {
            formField.classList.remove('error');
          }
        });
      }
    });
  }
}

/**
 * Show validation summary if form has errors
 */
function showValidationSummary(formId) {
  const config = validationConfig[formId];
  if (!config) return;
  
  const errors = [];
  
  config.fields.forEach(fieldConfig => {
    const element = document.getElementById(fieldConfig.id);
    const formField = element?.closest('.form-field');
    
    if (formField && formField.classList.contains('error')) {
      errors.push(fieldConfig.message);
    }
  });
  
  if (errors.length > 0) {
    const errorSummary = errors.join('\n• ');
    alert('Vui lòng điền đầy đủ thông tin:\n• ' + errorSummary);
  }
}

// Export functions for global use
window.validateForm = validateForm;
window.clearValidationErrors = clearValidationErrors;
window.showValidationSummary = showValidationSummary;
window.setupRealTimeValidation = setupRealTimeValidation;

// Auto-setup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupRealTimeValidation();
  console.log('✅ Form validation setup complete');
});

export { validateForm, clearValidationErrors, showValidationSummary, setupRealTimeValidation };