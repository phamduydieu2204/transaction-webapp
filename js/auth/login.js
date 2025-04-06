import { SHEET_ID } from '../config.js';

// Xử lý đăng nhập
export function login(callback) {
    console.log('Login button clicked');
    const empId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;

    if (!empId || !password) {
        document.getElementById('error-message').textContent = 'Vui lòng nhập đầy đủ thông tin';
        return;
    }

    // Lấy số lần đăng nhập sai từ localStorage
    const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts')) || {};
    const attempts = loginAttempts[empId] || 0;

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách nhân viên!A2:E'
    }).then(response => {
        const employees = response.result.values || [];
        const employee = employees.find(row => row[0] === empId && row[2] === password);

        if (!employee) {
            // Tăng số lần đăng nhập sai
            const newAttempts = attempts + 1;
            loginAttempts[empId] = newAttempts;
            localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));

            // Hiển thị thông báo số lần sai
            document.getElementById('error-message').textContent = `Sai mã nhân viên hoặc mật khẩu (${newAttempts}/5 lần)`;

            // Nếu sai quá 5 lần, cập nhật trạng thái thành OFF
            if (newAttempts >= 5) {
                const employeeIndex = employees.findIndex(row => row[0] === empId);
                if (employeeIndex !== -1) {
                    const rowIndex = employeeIndex + 2; // Hàng trong sheet (A2:E)
                    gapi.client.sheets.spreadsheets.values.update({
                        spreadsheetId: SHEET_ID,
                        range: `Danh sách nhân viên!E${rowIndex}`,
                        valueInputOption: 'RAW',
                        resource: { values: [['OFF']] }
                    }).then(() => {
                        console.log(`Updated status to OFF for employee ${empId}`);
                        document.getElementById('error-message').textContent = 'Tài khoản đã bị khóa do đăng nhập sai quá 5 lần';
                        // Reset số lần đăng nhập sai sau khi khóa
                        loginAttempts[empId] = 0;
                        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
                    }).catch(err => {
                        console.error('Error updating employee status:', err);
                        document.getElementById('error-message').textContent = 'Lỗi khi cập nhật trạng thái, vui lòng thử lại';
                    });
                }
            }
            return;
        }

        // Nếu đăng nhập thành công, reset số lần đăng nhập sai
        loginAttempts[empId] = 0;
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));

        if (employee[4] === 'OFF') {
            document.getElementById('error-message').textContent = 'Tài khoản đã bị khóa';
            return;
        }

        localStorage.setItem('loggedInEmployee', JSON.stringify({ id: empId, name: employee[1], role: employee[3] }));
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
        callback();
    }).catch(err => {
        console.error('Error fetching employee data:', err);
        document.getElementById('error-message').textContent = 'Lỗi kết nối, vui lòng thử lại';
    });
}