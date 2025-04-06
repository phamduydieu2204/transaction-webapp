// Global variables
let loggedInEmployee = null;
let loginAttempts = {};
const SHEET_ID = "1P7DnxTXevkAF0l1d5T2AWCf2l5CrkQ0e9UY"; // Your Sheet ID
const API_KEY = "YOUR_API_KEY"; // Replace with your API Key
let transactions = [];
let currentPage = 1;
const transactionsPerPage = 10;
let editingTransactionId = null;

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const profile = jwt_decode(response.credential);
    console.log("Google User:", profile);
    localStorage.setItem("googleUser", JSON.stringify(profile));
}

// Decode JWT token
function jwt_decode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Check login with employee ID and password
function checkLogin() {
    const employeeId = document.getElementById("employeeId").value;
    const password = document.getElementById("password").value;

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Danh sách nhân viên!A2:E?key=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch employee data: " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const employees = data.values || [];
            const employee = employees.find(row => row[0] === employeeId && row[2] === password);
            if (!employee) {
                loginAttempts[employeeId] = (loginAttempts[employeeId] || 0) + 1;
                if (loginAttempts[employeeId] >= 5) {
                    updateEmployeeStatus(employeeId, "OFF");
                    document.getElementById("error").textContent = "Tài khoản bị khóa do đăng nhập sai quá 5 lần!";
                    return;
                }
                document.getElementById("error").textContent = "Sai mã nhân viên hoặc mật khẩu!";
                return;
            }
            if (employee[4] === "OFF") {
                document.getElementById("error").textContent = "Tài khoản của bạn đã bị khóa!";
                return;
            }
            loginAttempts[employeeId] = 0;
            loggedInEmployee = { id: employee[0], name: employee[1], role: employee[3] };
            localStorage.setItem("loggedInEmployee", JSON.stringify(loggedInEmployee));
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            console.error("Error during login:", error);
            document.getElementById("error").textContent = "Đã có lỗi xảy ra, vui lòng thử lại!";
        });
}

// Update employee status (placeholder)
function updateEmployeeStatus(employeeId, status) {
    console.log(`Update status of ${employeeId} to ${status}`);
}

// Show tab
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";
}

// Logout
function logout() {
    loggedInEmployee = null;
    localStorage.removeItem("loggedInEmployee");
    localStorage.removeItem("googleUser");
    window.location.href = "index.html";
}

// Set default start date
function setDefaultStartDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    document.getElementById("startDate").value = `${day}/${month}/${year}`;
    updateEndDate();
}

// Update end date based on start date and months
function updateEndDate() {
    const startDate = document.getElementById("startDate").value;
    const months = parseInt(document.getElementById("months").value) || 0;
    if (startDate && months > 0) {
        const [day, month, year] = startDate.split('/').map(Number);
        const start = new Date(year, month - 1, day);
        const end = new Date(start);
        end.setDate(start.getDate() + months * 30);
        const endDay = String(end.getDate()).padStart(2, '0');
        const endMonth = String(end.getMonth() + 1).padStart(2, '0');
        const endYear = end.getFullYear();
        document.getElementById("endDate").value = `${endDay}/${endMonth}/${endYear}`;
    }
}

// Load software options
function loadSoftwareOptions() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Danh sách phần mềm!A2:C?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const softwareList = data.values || [];
            const softwareSelect = document.getElementById("software");
            const packageSelect = document.getElementById("package");
            const uniqueSoftware = [...new Set(softwareList.map(row => row[0]))];
            softwareSelect.innerHTML = '<option value="">Chọn phần mềm</option>';
            uniqueSoftware.forEach(software => {
                softwareSelect.innerHTML += `<option value="${software}">${software}</option>`;
            });

            softwareSelect.onchange = () => {
                const selectedSoftware = softwareSelect.value;
                packageSelect.innerHTML = '<option value="">Chọn gói</option>';
                if (selectedSoftware) {
                    const packages = softwareList.filter(row => row[0] === selectedSoftware);
                    packages.forEach(row => {
                        packageSelect.innerHTML += `<option value="${row[1]}">${row[1]}</option>`;
                    });
                }
            };
        });
}

// Load customer suggestions
function loadCustomerSuggestions() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Dữ liệu giao dịch!A2:O?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const transactions = data.values || [];
            const customerList = document.getElementById("customerList");
            const emailList = document.getElementById("emailList");
            const customers = [...new Set(transactions.map(row => row[3]))];
            const emails = [...new Set(transactions.map(row => row[4]))];
            customers.forEach(customer => {
                customerList.innerHTML += `<option value="${customer}">${customer}</option>`;
            });
            emails.forEach(email => {
                emailList.innerHTML += `<option value="${email}">${email}</option>`;
            });

            document.getElementById("email").oninput = () => {
                const email = document.getElementById("email").value.toLowerCase();
                const matchingTransaction = transactions.find(row => row[4] === email);
                if (matchingTransaction) {
                    document.getElementById("contact").value = matchingTransaction[5] || "";
                }
            };
        });
}

// Add transaction
function addTransaction() {
    const form = document.getElementById("transactionForm");
    if (!form.checkValidity()) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc!");
        return;
    }
    const transaction = {
        id: "TX" + Date.now(),
        timestamp: new Date().toLocaleString("vi-VN"),
        type: document.getElementById("transactionType").value,
        customerName: document.getElementById("customerName").value.toLowerCase(),
        email: document.getElementById("email").value.toLowerCase(),
        contact: document.getElementById("contact").value,
        months: document.getElementById("months").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        devices: document.getElementById("devices").value,
        software: document.getElementById("software").value,
        package: document.getElementById("package").value,
        revenue: document.getElementById("revenue").value,
        note: document.getElementById("note").value,
        employeeName: loggedInEmployee.name,
        employeeId: loggedInEmployee.id
    };
    // Placeholder: Save to Google Sheets (requires OAuth 2.0)
    console.log("Add transaction:", transaction);
    transactions.push(transaction);
    loadTransactions();
    resetForm();
}

// Load transactions
function loadTransactions() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Dữ liệu giao dịch!A2:O?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            transactions = (data.values || []).filter(row => row[15] === loggedInEmployee.id);
            displayTransactions();
        });
}

// Display transactions with pagination
function displayTransactions() {
    const start = (currentPage - 1) * transactionsPerPage;
    const end = start + transactionsPerPage;
    const paginatedTransactions = transactions.slice(start, end);
    const transactionList = document.getElementById("transaction
