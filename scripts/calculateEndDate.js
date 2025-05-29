export function calculateEndDate(startDateInput, durationInput, endDateInput) {
  const start = new Date(startDateInput.value);
  const months = parseInt(durationInput.value || 0);

  // Kiểm tra hợp lệ trước khi tính toán
  if (isNaN(start.getTime()) || isNaN(months) || months <= 0) {
    // Nếu dữ liệu không hợp lệ, để endDateInput trống
    endDateInput.value = "";
    return;
  }

  // Ước lượng ngày kết thúc
  const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
  if (isNaN(estimated.getTime())) {
    endDateInput.value = "";
    return;
  }

  const year = estimated.getFullYear();
  const month = String(estimated.getMonth() + 1).padStart(2, '0');
  const day = String(estimated.getDate()).padStart(2, '0');

  endDateInput.value = `${year}/${month}/${day}`;
}
