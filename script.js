function login() {
    alert("Đăng nhập đang được phát triển!");
}

function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";
}

function logout() {
    window.location.href = "index.html";
}