export function openCalendar(inputId, calculateEndDate, startDateInput, durationInput, endDateInput) {
    flatpickr(`#${inputId}`, {
      dateFormat: "Y/m/d",
      onChange: function(selectedDates, dateStr) {
        document.getElementById(inputId).value = dateStr;
        if (inputId === "startDate") {
          calculateEndDate(startDateInput, durationInput, endDateInput);
        }
      }
    }).open();
  }