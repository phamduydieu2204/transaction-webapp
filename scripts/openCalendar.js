export function openCalendar(inputId, calculateEndDate, startDateInput, durationInput, endDateInput) {
    // Lấy ngày hiện tại
    const today = new Date();
    
    // Lấy giá trị hiện tại của input (nếu có)
    const currentValue = document.getElementById(inputId).value;
    
    // Tính toán ngày mở lịch dựa trên field và logic riêng
    let targetDate = today;
    let highlightDate = today;
    
    // Logic đặc biệt cho endDate
    if (inputId === 'endDate') {
      const startDate = startDateInput?.value;
      const duration = parseInt(durationInput?.value || 0);
      
      if (startDate && duration > 0) {
        try {
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) {
            // Tính ngày kết thúc: ngày bắt đầu + tháng * 30
            const calculatedEndDate = new Date(start.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
            if (!isNaN(calculatedEndDate.getTime())) {
              targetDate = calculatedEndDate;
              highlightDate = calculatedEndDate;
            }
          }
        } catch (error) {
// console.warn('Error calculating target date for endDate calendar:', error);
        }
      }
    }
    
    // Kiểm tra xem đã có instance flatpickr chưa
    const existingInstance = document.getElementById(inputId)._flatpickr;
    if (existingInstance) {
      // Jump đến tháng mục tiêu
      existingInstance.jumpToDate(targetDate);
      existingInstance.open();
      return;
    }
    
    const fp = flatpickr(`#${inputId}`, {
      dateFormat: "Y/m/d",
      defaultDate: currentValue || null, // Giữ giá trị hiện tại nếu có
      inline: false,
      allowInput: true, // Cho phép nhập thủ công
      clickOpens: false, // Không mở calendar khi click vào input
      disableMobile: true, // Tắt mobile mode để giữ được input thủ công
      // Thêm class để highlight ngày được chỉ định
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        const cellDate = dayElem.dateObj;
        
        // Highlight ngày mục tiêu (ngày hiện tại cho transactionDate/startDate, ngày tính toán cho endDate)
        const isTargetDate = cellDate.toDateString() === highlightDate.toDateString();
        
        if (isTargetDate) {
          // Thêm class và style để làm nổi bật ngày mục tiêu
          dayElem.classList.add('target-date');
          dayElem.style.backgroundColor = '#007bff';
          dayElem.style.color = 'white';
          dayElem.style.fontWeight = 'bold';
          dayElem.style.borderRadius = '50%';
        }
      },
      onChange: function(selectedDates, dateStr) {
        document.getElementById(inputId).value = dateStr;
        if (inputId === "startDate" && typeof calculateEndDate === 'function') {
          try {
            calculateEndDate(startDateInput, durationInput, endDateInput);
          } catch (error) {
// console.warn('Error calling calculateEndDate:', error);
          }
        }
      },
      onOpen: function(selectedDates, dateStr, instance) {
        // Hiển thị tháng mục tiêu khi mở calendar
        instance.jumpToDate(targetDate);
      },
      onClose: function(selectedDates, dateStr, instance) {
        // Đảm bảo input vẫn có thể nhập thủ công sau khi đóng calendar
        const input = document.getElementById(inputId);
        input.removeAttribute('readonly');
      }
    });
    
    // Mở calendar và jump đến tháng mục tiêu
    fp.jumpToDate(targetDate);
    fp.open();
  }