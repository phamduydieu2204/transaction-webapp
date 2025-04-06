// Global variables
let loggedInEmployee = null;
let loginAttempts = {};
const SHEET_ID = "1pl7DwxtXTeVqKmfQl1UdIS7A2WcFl2sjCrkOqOegv9U";
const API_KEY = "AIzaSyDt9wLPmhQBYN2OKUnO3tXqiZdo6DCoS0g";
const CLIENT_ID = "490612546849-1vqphpttqqislvdc1e9eb7jdjt8lrbdi.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";
let currentPage = 1;
const transactionsPerPage = 10;
let currentTransactionId = null;

// Initialize Google API Client
function initClient() {
    gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(error => {
        console.error("Error initializing Google API Client:", error);
    });
}

function updateSignInStatus(isSignedIn) {
    if (!isSignedIn) {
        gapi.auth2.getAuthInstance().signIn();
    }
}

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
                return response.text().then(text => {
                    throw new Error(`Failed to fetch employee data: ${response.status} - ${response.statusText} - ${text}`);
                });
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
            console.error("Error during login:", error.message);
            document.getElementById("error").textContent = "Lỗi: " + error.message;
        });
}

// Update employee status
function updateEmployeeStatus(employeeId, status) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Danh sách nhân viên!A2:E",
    }).then(response => {
        const employees = response.result.values || [];
        const rowIndex = employees.findIndex(row => row[0] === employeeId) + 2;
        if (rowIndex > 1) {
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `Danh sách nhân viên!E${rowIndex}`,
                valueInputOption: "RAW",
                resource: { values: [[status]] },
            }).then(() => {
                console.log(`Updated status of ${employeeId} to ${status}`);
            });
        }
    }).catch(error => {
        console.error("Error updating employee status:", error);
    });
}

// Load software options
function loadSoftwareOptions() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Danh sách phần mềm!A2:C?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const softwareSelect = document.getElementById("software");
            const packageSelect = document.getElementById("package");
            const softwares = data.values || [];
            const uniqueSoftwares = [...new Set(softwares.map(row => row[0]))];
            uniqueSoftwares.forEach(software => {
                const option = document.createElement("option");
                option.value = software;
                option.textContent = software;
                softwareSelect.appendChild(option);
            });

            softwareSelect.addEventListener("change", () => {
                packageSelect.innerHTML = '<option value="" disabled selected>Chọn gói phần mềm</option>';
                const selectedSoftware = softwareSelect.value;
                const packages = softwares.filter(row => row[0] === selectedSoftware).map(row => row[1]);
                packages.forEach(pkg => {
                    const option = document.createElement("option");
                    option.value = pkg;
                    option.textContent = pkg;
                    packageSelect.appendChild(option);
                });
            });
        }).catch(error => {
            console.error("Error loading software options:", error);
        });
}

// Calculate end date
function calculateEndDate() {
    const startDate = document.getElementById("startDate").value;
    const months = parseInt(document.getElementById("months").value);
    if (startDate && months) {
        const [day, month, year] = startDate.split("/").map(Number);
        const start = new Date(year, month - 1, day);
        const end = new Date(start);
        end.setDate(start.getDate() + months * 30);
        document.getElementById("endDate").value = `${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`;
    }
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
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Dữ liệu giao dịch!A:P",
        valueInputOption: "RAW",
        resource: {
            values: [[
                transaction.id,
                transaction.timestamp,
                transaction.type,
                transaction.customerName,
                transaction.email,
                transaction.contact,
                transaction.months,
                transaction.startDate,
                transaction.endDate,
                transaction.devices,
                transaction.software,
                transaction.package,
                transaction.revenue,
                transaction.note,
                transaction.employeeName,
                transaction.employeeId
            ]]
        }
    }).then(() => {
        logAction("Thêm giao dịch", JSON.stringify(transaction));
        loadTransactions();
        form.reset();
    }).catch(error => {
        console.error("Error adding transaction:", error);
        alert("Đã có lỗi khi thêm giao dịch, vui lòng thử lại!");
    });
}

// Load transactions
function loadTransactions() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Dữ liệu giao dịch!A2:P?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const transactions = (data.values || []).filter(row => row[15] === loggedInEmployee.id);
            const transactionList = document.getElementById("transactionList");
            transactionList.innerHTML = "";
            const start = (currentPage - 1) * transactionsPerPage;
            const end = start + transactionsPerPage;
            transactions.slice(start, end).forEach((row, index) => {
                transactionList.innerHTML += `
                    <div>
                        ${row[2]} - ${row[3]} - ${row[11]}
                        <button onclick="editTransaction('${row[0]}')">Sửa</button>
                        <button onclick="confirmDelete('${row[0]}')">Xóa</button>
                    </div>`;
            });
            updatePagination(transactions.length);
        }).catch(error => {
            console.error("Error loading transactions:", error);
        });
}

// Update pagination
function updatePagination(total) {
    const totalPages = Math.ceil(total / transactionsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<button onclick="changePage(${i})">${i}</button>`;
    }
}

// Change page
function changePage(page) {
    currentPage = page;
    loadTransactions();
}

// Edit transaction
function editTransaction(id) {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Dữ liệu giao dịch!A2:P?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const transaction = (data.values || []).find(row => row[0] === id && row[15] === loggedInEmployee.id);
            if (transaction) {
                currentTransactionId = id;
                document.getElementById("transactionType").value = transaction[2];
                document.getElementById("customerName").value = transaction[3];
                document.getElementById("email").value = transaction[4];
                document.getElementById("contact").value = transaction[5];
                document.getElementById("months").value = transaction[6];
                document.getElementById("startDate").value = transaction[7];
                document.getElementById("endDate").value = transaction[8];
                document.getElementById("devices").value = transaction[9];
                document.getElementById("software").value = transaction[10];
                document.getElementById("package").value = transaction[11];
                document.getElementById("revenue").value = transaction[12];
                document.getElementById("note").value = transaction[13];
                document.getElementById("updateBtn").style.display = "inline-block";
                document.getElementById("deleteBtn").style.display = "inline-block";
            }
        }).catch(error => {
            console.error("Error editing transaction:", error);
        });
}

// Update transaction
function updateTransaction() {
    const transaction = {
        id: currentTransactionId,
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
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Dữ liệu giao dịch!A2:P",
    }).then(response => {
        const transactions = response.result.values || [];
        const rowIndex = transactions.findIndex(row => row[0] === currentTransactionId) + 2;
        if (rowIndex > 1) {
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `Dữ liệu giao dịch!A${rowIndex}:P${rowIndex}`,
                valueInputOption: "RAW",
                resource: {
                    values: [[
                        transaction.id,
                        transaction.timestamp,
                        transaction.type,
                        transaction.customerName,
                        transaction.email,
                        transaction.contact,
                        transaction.months,
                        transaction.startDate,
                        transaction.endDate,
                        transaction.devices,
                        transaction.software,
                        transaction.package,
                        transaction.revenue,
                        transaction.note,
                        transaction.employeeName,
                        transaction.employeeId
                    ]]
                }
            }).then(() => {
                logAction("Sửa giao dịch", JSON.stringify(transaction));
                loadTransactions();
                document.getElementById("transactionForm").reset();
                document.getElementById("updateBtn").style.display = "none";
                document.getElementById("deleteBtn").style.display = "none";
                currentTransactionId = null;
            });
        }
    }).catch(error => {
        console.error("Error updating transaction:", error);
        alert("Đã có lỗi khi sửa giao dịch, vui lòng thử lại!");
    });
}

// Confirm delete
function confirmDelete(id) {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Dữ liệu giao dịch!A2:P",
        }).then(response => {
            const transactions = response.result.values || [];
            const rowIndex = transactions.findIndex(row => row[0] === id) + 2;
            if (rowIndex > 1) {
                gapi.client.sheets.spreadsheets.values.clear({
                    spreadsheetId: SHEET_ID,
                    range: `Dữ liệu giao dịch!A${rowIndex}:P${rowIndex}`,
                }).then(() => {
                    logAction("Xóa giao dịch", id);
                    loadTransactions();
                });
            }
        }).catch(error => {
            console.error("Error deleting transaction:", error);
            alert("Đã có lỗi khi xóa giao dịch, vui lòng thử lại!");
        });
    }
}

// Log action
function logAction(action, content) {
    const log = {
        employeeId: loggedInEmployee.id,
        timestamp: new Date().toLocaleString("vi-VN"),
        action: action,
        content: content
    };
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Logs!A:D",
        valueInputOption: "RAW",
        resource: {
            values: [[log.employeeId, log.timestamp, log.action, log.content]]
        }
    }).then(() => {
        console.log("Log saved:", log);
    }).catch(error => {
        console.error("Error logging action:", error);
    });
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
    if (gapi.auth2) {
        gapi.auth2.getAuthInstance().signOut().then(() => {
            window.location.href = "index.html";
        }).catch(error => {
            console.error("Error during sign out:", error);
            window.location.href = "index.html";
        });
    } else {
        window.location.href = "index.html";
    }
}

// Add event listeners for dynamic calculations
document.addEventListener("DOMContentLoaded", () => {
    const startDateInput = document.getElementById("startDate");
    const monthsInput = document.getElementById("months");
    if (startDateInput && monthsInput) {
        startDateInput.addEventListener("input", calculateEndDate);
        monthsInput.addEventListener("input", calculateEndDate);
    }
});
