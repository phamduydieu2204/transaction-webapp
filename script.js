// Thông tin Google API
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
            // Khi API sẵn sàng, kiểm tra nếu đã đăng nhập thì tải dữ liệu
            const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
            if (employee) {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-page').style.display = 'block';
                loadSoftwareOptions(); // Tải dữ liệu phần mềm ngay sau khi đăng nhập
                loadTransactions(employee.id);
            }
        }).catch(err => console.error('Error initializing Google API:', err));
    });
}

// Đăng nhập
let loginAttempts = {};
// Đăng nhập (giữ nguyên, chỉ thêm gọi hàm loadSoftwareOptions khi thành công)
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
            loginAttempts[empId] = (loginAttempts[empId] || 0) + 1;
            document.getElementById('error-message').textContent = 'Sai mã nhân viên hoặc mật khẩu';

            if (loginAttempts[empId] >= 5) {
                updateEmployeeStatus(empId, 'OFF');
            }
            return;
        }

        if (employee[4] === 'OFF') {
            document.getElementById('error-message').textContent = 'Tài khoản đã bị khóa';
            return;
        }

        localStorage.setItem('loggedInEmployee', JSON.stringify({ id: empId, name: employee[1], role: employee[3] }));
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
        loadSoftwareOptions(); // Tải dữ liệu phần mềm ngay khi đăng nhập thành công
        loadTransactions(empId);
        logActivity(empId, 'Đăng nhập');
    }).catch(err => console.error('Error fetching employee data:', err));
}

// Cập nhật trạng thái nhân viên
function updateEmployeeStatus(empId, status) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách nhân viên!A2:E'
    }).then(response => {
        const employees = response.result.values || [];
        const rowIndex = employees.findIndex(row => row[0] === empId) + 2;

        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Danh sách nhân viên!E${rowIndex}`,
            valueInputOption: 'RAW',
            resource: { values: [[status]] }
        }).then(() => {
            document.getElementById('error-message').textContent = 'Tài khoản đã bị khóa do đăng nhập sai quá 5 lần';
        });
    });
}

// Ghi log hoạt động
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



function showTab(tabId) {
    document.querySelectorAll('#main-page > div').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// Hàm tải danh sách phần mềm và gói phần mềm
function loadSoftwareOptions() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách phần mềm!A2:C' // Lấy từ hàng 2, cột A đến C
    }).then(response => {
        const softwareData = response.result.values || [];
        const softwareSelect = document.getElementById('software');
        const packageSelect = document.getElementById('package');

        // Tạo danh sách phần mềm duy nhất
        const uniqueSoftware = [...new Set(softwareData.map(row => row[0]))];
        softwareSelect.innerHTML = '<option value="">Chọn phần mềm</option>';
        uniqueSoftware.forEach(software => {
            softwareSelect.innerHTML += `<option value="${software}">${software}</option>`;
        });

        // Khi chọn phần mềm, cập nhật danh sách gói
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
    }).catch(err => {
        console.error('Error loading software data:', err);
    });
}

function addTransaction() {
    const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
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
        alert('Vui lòng nhập đầy đủ thông tin');
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
        loadTransactions(employee.id);
    });
}

function loadTransactions(empId, page = 1) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Dữ liệu giao dịch!A2:O'
    }).then(response => {
        const transactions = (response.result.values || []).filter(row => row[14] === empId);
        const tbody = document.querySelector('#transaction-list tbody');
        tbody.innerHTML = '';

        const perPage = 10;
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginated = transactions.slice(start, end);

        paginated.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[12]}</td>
                <td>
                    <button onclick="editTransaction('${row[0]}')">Sửa</button>
                    <button onclick="deleteTransaction('${row[0]}')">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        const totalPages = Math.ceil(transactions.length / perPage);
        document.getElementById('pagination').innerHTML = Array.from(
            { length: totalPages },
            (_, i) => `<button onclick="loadTransactions('${empId}', ${i + 1})">${i + 1}</button>`
        ).join('');
    });
}

// Khởi động khi đăng nhập thành công
document.getElementById('main-page').addEventListener('load', () => {
    const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
    loadSoftwareOptions();
    loadTransactions(employee.id);
});

// Khởi động
window.onload = initClient;