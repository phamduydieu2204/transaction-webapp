export function openCalendar(inputId, calculateEndDate, startDateInput, durationInput, endDateInput) {
    flatpickr(`#${inputId}`, {
      dateFormat: "Y/m/d",
      onChange: function(selectedDates, dateStr) {
        document.getElementById(inputId).value = dateStr;
        if (inputId === "startDate" && typeof calculateEndDate === 'function') {
          try {
            calculateEndDate(startDateInput, durationInput, endDateInput);
          } catch (error) {
            console.warn('Error calling calculateEndDate:', error);
          }
        }
      }
    }).open();
  }