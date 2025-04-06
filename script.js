// Global variables
let loggedInEmployee = null;
let loginAttempts = {};
const SHEET_ID = "1P7DnxTXevkAF0l1d5T2AWCf2l5CrkQ0e9UY"; // Your Sheet ID from Step 1
const API_KEY = "YOUR_API_KEY"; // Replace with your API Key

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const profile = jwt_decode(response.credential); // Decode Google token
    console.log("Google User:", profile);
    // Save Google user info to localStorage
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

    // Fetch employee data from Google Sheets
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
            loginAttempts[employeeId] = 0; // Reset attempts on successful login
            loggedInEmployee = { id: employee[0], name: employee[1], role: employee[3] };
            localStorage.setItem("loggedInEmployee", JSON.stringify(loggedInEmployee));
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            console.error("Error during login:", error);
            document.getElementById("error").textContent = "Đã có lỗi xảy ra, vui lòng thử lại!";
        });
}

// Update employee status (to be implemented with OAuth 2.0)
function updateEmployeeStatus(employeeId, status) {
    // This requires OAuth 2.0 to write to Google Sheets
    console.log(`Update status of ${employeeId} to ${status}`);
    // Placeholder: In the next step, we'll implement this using OAuth 2.0
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
