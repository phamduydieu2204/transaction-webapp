export function logout() {
    localStorage.removeItem("employeeInfo");
    window.location.href = "index.html";
  }