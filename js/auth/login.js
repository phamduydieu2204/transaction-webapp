function login() {
    const form = document.getElementById('login-form');
    if (!form) {
      console.error('Không tìm thấy form đăng nhập');
      return;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const employeeId = document.getElementById('employee-id').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU',
          range: 'Danh sách nhân viên!A:E'
        });
        const employees = response.result.values || [];
        const employee = employees.find(row => row[0] === employeeId && row[2] === password);
  
        if (!employee) {
          let attempts = localStorage.getItem(`attempts_${employeeId}`) || 0;
          attempts++;
          localStorage.setItem(`attempts_${employeeId}`, attempts);
          document.getElementById('login-error').textContent = `Sai thông tin, lần thử ${attempts}/5`;
          if (attempts >= 5) {
            await updateEmployeeStatus(employeeId, 'OFF');
            alert('Tài khoản bị khóa do quá 5 lần đăng nhập sai.');
          }
          return;
        }
  
        localStorage.setItem('user', JSON.stringify({ id: employee[0], name: employee[1], role: employee[3] }));
        localStorage.removeItem(`attempts_${employeeId}`);
        console.log('Đăng nhập thành công:', employee);
        // Chuyển sang giao diện chính (tạm thời log ra console)
      } catch (error) {
        console.error('Lỗi đăng nhập:', error);
      }
    });
  }
  
  async function updateEmployeeStatus(employeeId, status) {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU',
        range: 'Danh sách nhân viên!A:E'
      });
      const employees = response.result.values;
      const rowIndex = employees.findIndex(row => row[0] === employeeId) + 1;
      if (rowIndex === 0) return;
  
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU',
        range: `Danh sách nhân viên!E${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[status]] }
      });
      console.log(`Cập nhật trạng thái ${employeeId} thành ${status}`);
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  }