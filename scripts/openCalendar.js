export function openCalendar(inputId, calculateEndDate, startDateInput, durationInput, endDateInput) {
    // Lấy ngày hiện tại
      defaultDate: currentValue || null, // Giữ giá trị hiện tại nếu có
  });
      allowInput: true, // Cho phép nhập thủ công
      clickOpens: false, // Không mở calendar khi click vào input
      disableMobile: true, // Tắt mobile mode để giữ được input thủ công
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
      onOpen: function(selectedDates, dateStr, instance) {
        // Luôn hiển thị tháng hiện tại khi mở calendar
        instance.jumpToDate(today);
      },
      onClose: function(selectedDates, dateStr, instance) {
        // Đảm bảo input vẫn có thể nhập thủ công sau khi đóng calendar
        const input = document.getElementById(inputId);
        input.removeAttribute('readonly');
      }
    });
    
    // Mở calendar và jump đến tháng hiện tại
    fp.jumpToDate(today);
    fp.open();
  }