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
 */
export function setDefaultDates(forceUpdate = false) {
  const today = getTodayFormatted();
  
  // Set transaction date - Always update if forceUpdate is true
  const transactionDateInput = document.getElementById('transactionDate');
  if (transactionDateInput && (!transactionDateInput.value || forceUpdate)) {
    transactionDateInput.value = today;
  }
  
  // Set start date - Always update if forceUpdate is true
  const startDateInput = document.getElementById('startDate');
  if (startDateInput && (!startDateInput.value || forceUpdate)) {
    startDateInput.value = today;
  }
  
  // Update end date based on current values
  const durationInput = document.getElementById('duration');
  const endDateInput = document.getElementById('endDate');
  if (startDateInput && durationInput && endDateInput) {
    calculateEndDate(startDateInput, durationInput, endDateInput);
  }
}

/**
 * Initialize date calculations and event listeners
 */
export function initializeDateCalculations() {
  // Set default dates
  setDefaultDates();
  
  // Add event listeners
  const startDateInput = document.getElementById('startDate');
  const durationInput = document.getElementById('duration');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput && durationInput && endDateInput) {
    // Update end date when start date changes
    startDateInput.addEventListener('change', () => {
      calculateEndDate(startDateInput, durationInput, endDateInput);
    });
    
    // Update end date when duration changes
    durationInput.addEventListener('change', () => {
      calculateEndDate(startDateInput, durationInput, endDateInput);
    });
    durationInput.addEventListener('input', () => {
      calculateEndDate(startDateInput, durationInput, endDateInput);
    });
  }
}
