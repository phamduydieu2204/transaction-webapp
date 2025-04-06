// Xử lý đăng nhập
import { SHEET_ID } from '../config.js';

export function login(callback) {
    console.log('Login button clicked');
    const empId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;

    if (!empId || !password) {
        document.getElementById('error-message').textContent = 'Vui lòng nhập đầy đủ thông tin';
        return;
    }

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách nhân viên!A2:E'
    }).then(response => {
        const employees = response.result.values || [];
        const employee = employees.find(row => row[0] === empId && row[2] === password);

        if (!employee) {
            document.getElementById('error-message').textContent = 'Sai mã nhân viên hoặc mật khẩu';
            return;
        }

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