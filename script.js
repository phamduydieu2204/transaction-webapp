const CLIENT_ID = '490612546849-1vqphpttqqislvdc1e9eb7jdjt8lrbdi.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDt9wLPmhQBYN2OKUnO3tXqiZdo6DCoS0g';
const SHEET_ID = '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Khởi tạo Google API
function initClient() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(() => {
            console.log('Google API initialized');
            const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
            if (employee) {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-page').style.display = 'block';
                setupForm();
            }
        }).catch(err => console.error('Error initializing Google API:', err));
    });
}

// Hàm đăng nhập
function login() {
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
        setupForm(); // Khởi tạo form sau khi đăng nhập
    }).catch(err => {
        console.error('Error fetching employee data:', err);
        document.getElementById('error-message').textContent = 'Lỗi kết nối, vui lòng thử lại';
    });
}

// Chuyển tab
function showTab(tabId) {
    document.querySelectorAll('#main-page > div').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// Thiết lập form ngày tháng
function setupForm() {
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
        const startDateStr = startDateInput.value; // Định dạng dd/mm/yyyy
        const months = parseInt(monthsInput.value) || 0;

        // Chuyển đổi ngày bắt đầu sang đối tượng Date
        const [day, month, year] = startDateStr.split('/').map(Number);
        const startDate = new Date(year, month - 1, day); // month bắt đầu từ 0

        // Tính ngày kết thúc
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + months * 30);

        // Định dạng ngày kết thúc
        const formattedEndDate = endDate.toLocaleDateString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        endDateInput.value = formattedEndDate;
    }

    // Gọi tính ngày kết thúc khi thay đổi số tháng hoặc ngày bắt đầu
    monthsInput.addEventListener('input', calculateEndDate);
    startDateInput.addEventListener('change', calculateEndDate);
}

// Nút kiểm tra tạm thời
function testForm() {
    console.log('Start Date:', document.getElementById('start-date').value);
    console.log('Months:', document.getElementById('months').value);
    console.log('End Date:', document.getElementById('end-date').value);
}

// Các hàm placeholder để tránh lỗi (sẽ hoàn thiện sau)
function addTransaction() {
    console.log('Add transaction clicked');
}

function searchTransactions() {
    console.log('Search transactions clicked');
}

// Khởi động
window.onload = initClient;