async function searchTransactions(filters) {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: YOUR_SPREADSHEET_ID,
      range: 'Dữ liệu giao dịch!A:O'
    });
    let transactions = response.result.values.filter(row => row[14] === user.id);
    Object.keys(filters).forEach(key => {
      transactions = transactions.filter(row => row[key] === filters[key]);
    });
    displayTransactions(transactions.slice(0, 10)); // Phân trang
    logAction('Tìm kiếm', filters);
  }