export function calculateEndDate(startDateInput, durationInput, endDateInput) {
  const start = new Date(startDateInput.value);
  const months = parseInt(durationInput.value || 0);

  // Kiểm tra hợp lệ trước khi tính toán
  if (isNaN(start.getTime()) || isNaN(months) || months <= 0) {
    // Nếu dữ liệu không hợp lệ, trả về "yyyy/mm/dd"
    endDateInput.value = "yyyy/mm/dd";
    return;
  }

  // Ước lượng ngày kết thúc
  const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
  if (isNaN(estimated.getTime())) {
    endDateInput.value = "yyyy/mm/dd";
    return;
  }

  const year = estimated.getFullYear();
  const month = String(estimated.getMonth() + 1).padStart(2, '0');
  const day = String(estimated.getDate()).padStart(2, '0');

  endDateInput.value = `${year}/${month}/${day}`;
}

/**
 * Get today's date in yyyy/mm/dd format
 */
export function getTodayFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Set default date values
 * @param {boolean} forceUpdate - If true, always update dates to today even if fields have values
 * @param {boolean} recalculateEndDate - If true, recalculate end date. If false, preserve user-modified end date
 */
export function setDefaultDates(forceUpdate = false, recalculateEndDate = true) {
  const today = getTodayFormatted();
  
  // Set transaction date - Always set to today on page load, or when forceUpdate is true
  const transactionDateInput = document.getElementById('transactionDate');
  if (transactionDateInput && (!transactionDateInput.value || forceUpdate)) {
    transactionDateInput.value = today;
  }
  
  // Set start date - Always set to today on page load, or when forceUpdate is true
  const startDateInput = document.getElementById('startDate');
  if (startDateInput && (!startDateInput.value || forceUpdate)) {
    startDateInput.value = today;
  }
  
  // Only recalculate end date if explicitly requested
  if (recalculateEndDate) {
    const durationInput = document.getElementById('duration');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput && durationInput && endDateInput) {
      calculateEndDate(startDateInput, durationInput, endDateInput);
    }
  }
}

/**
 * Initialize date calculations and event listeners
 */
export function initializeDateCalculations() {
  // Set default dates only if fields are empty (don't force override user's values)
  setDefaultDates(false, true); // Don't force update, but recalculate end date if needed
  
  // Add event listeners (only if not already added)
  const startDateInput = document.getElementById('startDate');
  const durationInput = document.getElementById('duration');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput && durationInput && endDateInput) {
    // Check if event listeners are already attached to avoid duplicates
    if (!startDateInput.hasDateCalculationListeners) {
      // Update end date when start date changes
      startDateInput.addEventListener('change', () => {
        calculateEndDate(startDateInput, durationInput, endDateInput);
      });
      
      // Update end date when user types in start date manually
      startDateInput.addEventListener('input', () => {
        calculateEndDate(startDateInput, durationInput, endDateInput);
      });
      
      startDateInput.hasDateCalculationListeners = true;
    }
    
    if (!durationInput.hasDateCalculationListeners) {
      // Update end date when duration changes
      durationInput.addEventListener('change', () => {
        calculateEndDate(startDateInput, durationInput, endDateInput);
      });
      durationInput.addEventListener('input', () => {
        calculateEndDate(startDateInput, durationInput, endDateInput);
      });
      
      durationInput.hasDateCalculationListeners = true;
    }
  }
}
