/**
 * validators.js - Form validation utilities
 * 
 * Common validation functions for form inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function isValidPhone(phone) {
  // Vietnam phone number format
  const phoneRegex = /^(\+84|84|0)?[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/[\s.-]/g, ''));
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate date format (yyyy/mm/dd)
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid date format
 */
export function isValidDate(date) {
  const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const [year, month, day] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return dateObj.getFullYear() === year && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getDate() === day;
}

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} True if value is not empty
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate minimum length
 * @param {string} value - Value to check
 * @param {number} min - Minimum length
 * @returns {boolean} True if value meets minimum length
 */
export function minLength(value, min) {
  return value && value.length >= min;
}

/**
 * Validate maximum length
 * @param {string} value - Value to check
 * @param {number} max - Maximum length
 * @returns {boolean} True if value is within maximum length
 */
export function maxLength(value, max) {
  return !value || value.length <= max;
}

/**
 * Validate number range
 * @param {number} value - Number to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if number is within range
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate positive number
 * @param {*} value - Value to check
 * @returns {boolean} True if positive number
 */
export function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate form data
 * @param {object} data - Form data object
 * @param {object} rules - Validation rules
 * @returns {object} {isValid: boolean, errors: object}
 */
export function validateForm(data, rules) {
  const errors = {};
  let isValid = true;
  
  for (const field in rules) {
    const value = data[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      if (rule.required && !isRequired(value)) {
        errors[field] = rule.message || `${field} là bắt buộc`;
        isValid = false;
        break;
      }
      
      if (rule.email && value && !isValidEmail(value)) {
        errors[field] = rule.message || 'Email không hợp lệ';
        isValid = false;
        break;
      }
      
      if (rule.phone && value && !isValidPhone(value)) {
        errors[field] = rule.message || 'Số điện thoại không hợp lệ';
        isValid = false;
        break;
      }
      
      if (rule.url && value && !isValidUrl(value)) {
        errors[field] = rule.message || 'URL không hợp lệ';
        isValid = false;
        break;
      }
      
      if (rule.date && value && !isValidDate(value)) {
        errors[field] = rule.message || 'Ngày không hợp lệ (định dạng: yyyy/mm/dd)';
        isValid = false;
        break;
      }
      
      if (rule.minLength && !minLength(value, rule.minLength)) {
        errors[field] = rule.message || `Tối thiểu ${rule.minLength} ký tự`;
        isValid = false;
        break;
      }
      
      if (rule.maxLength && !maxLength(value, rule.maxLength)) {
        errors[field] = rule.message || `Tối đa ${rule.maxLength} ký tự`;
        isValid = false;
        break;
      }
      
      if (rule.custom && !rule.custom(value, data)) {
        errors[field] = rule.message || 'Giá trị không hợp lệ';
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
}

/**
 * Show validation errors on form
 * @param {object} errors - Error messages object
 * @param {string} formId - Form element ID
 */
export function showValidationErrors(errors, formId) {
  // Clear previous errors
  const form = document.getElementById(formId);
  if (!form) return;
  
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
  
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
  
  // Show new errors
  for (const field in errors) {
    const input = form.querySelector(`#${field}`);
    const errorElement = form.querySelector(`#${field}-error`);
    
    if (input) {
      input.classList.add('error');
    }
    
    if (errorElement) {
      errorElement.textContent = errors[field];
      errorElement.style.display = 'block';
    }
  }
}

/**
 * Clear validation errors
 * @param {string} formId - Form element ID
 */
export function clearValidationErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
  
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
}