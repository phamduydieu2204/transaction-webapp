export function calculateEndDate(startDateInput, durationInput, endDateInput) {
  const start = new Date(startDateInput.value);
  const months = parseInt(durationInput.value || 0);
  if (!isNaN(months)) {
    const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    const year = estimated.getFullYear();
    const month = String(estimated.getMonth() + 1).padStart(2, '0');
    const day = String(estimated.getDate()).padStart(2, '0');
    endDateInput.value = `${year}/${month}/${day}`;
  }
}