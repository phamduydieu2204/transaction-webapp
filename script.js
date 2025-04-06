const CLIENT_ID = '490612546849-1vqphpttqqislvdc1e9eb7jdjt8lrbdi.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDt9wLPmhQBYN2OKUnO3tXqiZdo6DCoS0g';
const SHEET_ID = '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

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
                loadSoftwareOptions();
                loadCustomerSuggestions();
                setupForm();
            }
        }).catch(err => console.error('Error initializing Google API:', err));
    });
}

function login() {
    const empId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách nhân viên!A2:E'
    }).then(response => {
        const employees = response.result.values || [];
        const employee = employees.find(row => row[0] === empId && row[2] === password);
        if (employee) {
            localStorage.setItem('loggedInEmployee', JSON.stringify({ id: empId, name: employee[1], role: employee[3] }));
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-page').style.display = 'block';
            loadSoftwareOptions();
        } else {
            document.getElementById('error-message').textContent = 'Sai thông tin đăng nhập';
        }
    });
}

function loadSoftwareOptions() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách phần mềm!A2:C'
    }).then(response => {
        const softwareData = response.result.values || [];
        console.log('Software data:', softwareData);
        const softwareSelect = document.getElementById('software');
        const packageSelect = document.getElementById('package');

        const uniqueSoftware = [...new Set(softwareData.map(row => row[0]))];
        softwareSelect.innerHTML = '<option value="">Chọn phần mềm</option>';
        uniqueSoftware.forEach(software => {
            softwareSelect.innerHTML += `<option value="${software}">${software}</option>`;
        });

        softwareSelect.onchange = () => {
            const selectedSoftware = softwareSelect.value;
            packageSelect.innerHTML = '<option value="">Chọn gói phần mềm</option>';
            if (selectedSoftware) {
                const packages = softwareData.filter(row => row[0] === selectedSoftware);
                packages.forEach(row => {
                    packageSelect.innerHTML += `<option value="${row[1]}">${row[1]}</option>`;
                });
            }
        };
    }).catch(err => console.error('Error loading software data:', err));
}

// Gợi ý tên khách hàng và email
function loadCustomerSuggestions() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Dữ liệu giao dịch!D2:E' // Cột Tên khách hàng và Email
    }).then(response => {
        const transactions = response.result.values || [];
        const customers = [...new Set(transactions.map(row => row[0]))];
        const emails = [...new Set(transactions.map(row => row[1]))];

        const customerList = document.getElementById('customer-suggestions');
        const emailList = document.getElementById('email-suggestions');
        customerList.innerHTML = customers.map(c => `<option value="${c}">`).join('');
        emailList.innerHTML = emails.map(e => `<option value="${e}">`).join('');

        // Tự động điền liên hệ khi chọn email
        document.getElementById('email').addEventListener('change', () => {
            const selectedEmail = document.getElementById('email').value;
            const transaction = transactions.find(row => row[1] === selectedEmail);
            if (transaction) {
                document.getElementById('contact').value = transaction[2] || ''; // Cột Liên hệ
            }
        });
    });
}

// Thiết lập form (ngày bắt đầu, tự động tính ngày kết thúc)
// Khởi tạo form
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

// Thêm giao dịch
function addTransaction() {
    const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
    if (!employee) {
        alert('Vui lòng đăng nhập lại');
        return;
    }

    const data = {
        id: 'TX' + Date.now(),
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        type: document.getElementById('transaction-type').value,
        customer: document.getElementById('customer-name').value.toLowerCase(),
        email: document.getElementById('email').value.toLowerCase(),
        contact: document.getElementById('contact').value,
        months: document.getElementById('months').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        devices: document.getElementById('devices').value,
        software: document.getElementById('software').value,
        package: document.getElementById('package').value,
        revenue: document.getElementById('revenue').value,
        note: document.getElementById('note').value,
        empName: employee.name,
        empId: employee.id
    };

    if (!Object.values(data).every(val => val || val === data.note)) {
        alert('Vui lòng nhập đầy đủ thông tin (trừ ghi chú)');
        return;
    }

    const row = Object.values(data);
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Dữ liệu giao dịch!A:O',
        valueInputOption: 'RAW',
        resource: { values: [row] }
    }).then(() => {
        logActivity(employee.id, 'Thêm giao dịch', JSON.stringify(data));
        alert('Thêm giao dịch thành công');
        loadCustomerSuggestions(); // Cập nhật gợi ý sau khi thêm
    }).catch(err => console.error('Error adding transaction:', err));
}

// Ghi log (giữ nguyên từ trước)
function logActivity(empId, action, details = '') {
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const logEntry = [[empId, timestamp, action, details]];
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Logs!A:D',
        valueInputOption: 'RAW',
        resource: { values: logEntry }
    }).then(() => console.log('Logged:', action));
}

// Khởi động
window.onload = function() {
    setupForm();
};