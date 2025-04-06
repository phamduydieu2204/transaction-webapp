// Logic ngày tháng (ngày bắt đầu, ngày kết thúc)
export function setupDateLogic() {
    console.log('Setting up date logic...');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const monthsInput = document.getElementById('months');

    // Đặt ngày bắt đầu mặc định là ngày hiện tại
    const today = new Date();
    const formattedToday = today.toLocaleDateString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    startDateInput.value = formattedToday;

    // Hàm tính ngày kết thúc
    function calculateEndDate() {
        const startDateStr = startDateInput.value;
        const months = parseInt(monthsInput.value) || 0;

        const [day, month, year] = startDateStr.split('/').map(Number);
        const startDate = new Date(year, month - 1, day);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + months * 30);

        const formattedEndDate = endDate.toLocaleDateString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        endDateInput.value = formattedEndDate;
    }

    monthsInput.addEventListener('input', calculateEndDate);
    startDateInput.addEventListener('change', calculateEndDate);
}