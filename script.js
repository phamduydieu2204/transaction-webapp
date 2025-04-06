// Biến toàn cục
let loggedInEmployee = null;
const SHEET_ID = "1pl7DwxtXTeVqKmfQl1UdIS7A2WcFl2sjCrkOqOegv9U"; // Thay bằng Sheet ID từ Bước 1

// Xử lý đăng nhập bằng Google
function handleCredentialResponse(response) {
    const profile = jwt_decode(response.credential); // Giải mã token từ Google
    console.log("Google User:", profile);
    // Lưu thông tin đăng nhập (có thể lưu vào localStorage)
    localStorage.setItem("googleUser", JSON.stringify(profile));
}

// Giải mã JWT (thêm hàm jwt_decode)
function jwt_decode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Kiểm tra đăng nhập bằng mã nhân viên và mật khẩu
function checkLogin() {
    const employeeId = document.getElementById("employeeId").value;
    const password = document.getElementById("password").value;

    // Gọi Google Sheets API để kiểm tra thông tin nhân viên
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Danh sách nhân viên!A2:E?key=AIzaSyDt9wLPmhQBYN2OKUnO3tXqiZdo6DCoS0g`)
        .then(response => response.json())
        .then(data => {
            const employees = data.values || [];
            const employee = employees.find(row => row[0] === employeeId && row[2] === password);
            if (!employee) {
                document.getElementById("error").textContent = "Sai mã nhân viên hoặc mật khẩu!";
                return;
            }
            if (employee[4] === "OFF") {
                document.getElementById("error").textContent = "Tài khoản của bạn đã bị khóa!";
                return;
            }
            loggedInEmployee = { id: employee[0], name: employee[1], role: employee[3] };
            localStorage.setItem("loggedInEmployee", JSON.stringify(loggedInEmployee));
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            console.error("Lỗi khi kiểm tra đăng nhập:", error);
            document.getElementById("error").textContent = "Đã có lỗi xảy ra, vui lòng thử lại!";
        });
}

// Hiển thị tab
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";
}

// Đăng xuất
function logout() {
    loggedInEmployee = null;
    localStorage.removeItem("loggedInEmployee");
    localStorage.removeItem("googleUser");
    window.location.href = "index.html";
}
