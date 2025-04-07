async function displayRevenueReport() {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: YOUR_SPREADSHEET_ID,
      range: 'Dữ liệu giao dịch!A:O'
    });
    const transactions = response.result.values.filter(row => user.role === 'admin' || row[14] === user.id);
    const revenueByDay = transactions.reduce((acc, row) => {
        const date = row[1]; // Giả sử cột B chứa ngày giao dịch
        const amount = parseFloat(row[12]); // Giả sử cột M chứa số tiền giao dịch
        const day = new Date(date).toLocaleDateString(); // Đổi định dạng ngày
    
        if (!acc[day]) {
            acc[day] = 0;
        }
        acc[day] += amount;
    
        return acc;
    }, {});
    
    document.getElementById('revenue-report').innerHTML = JSON.stringify(revenueByDay, null, 2);
 // Hiển thị kết quả
  }