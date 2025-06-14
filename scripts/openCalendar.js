export function openCalendar(inputId, calculateEndDate, startDateInput, durationInput, endDateInput) {
    // Lấy ngày hiện tại
    const today = new Date();
    
    // Lấy giá trị hiện tại của input (nếu có)
    const currentValue = document.getElementById(inputId).value;
    
    const fp = flatpickr(`#${inputId}`, {
      dateFormat: "Y/m/d",
      defaultDate: currentValue || null, // Giữ giá trị hiện tại nếu có
      inline: false,
      // Thêm class để highlight ngày hôm nay
      onDayCreate: function(dObj, dStr, fp, dayElem) {
        // Kiểm tra nếu là ngày hôm nay
        const cellDate = dayElem.dateObj;
        const isToday = cellDate.toDateString() === today.toDateString();
        
        if (isToday) {
          // Thêm class và style để làm nổi bật ngày hôm nay
          dayElem.classList.add('today');
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
            console.warn('Error calling calculateEndDate:', error);
          }
        }
      },
      onReady: function(dateObj, dateStr, instance) {
        // Đảm bảo calendar hiển thị tháng hiện tại khi mở
        if (!currentValue) {
          instance.jumpToDate(today);
        }
      }
    });
    
    fp.open();
  }