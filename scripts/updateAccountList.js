export async function updateAccountList(softwareData, accountNameToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountNameSelect = document.getElementById("accountName");

  // Reset dropdown tài khoản
  accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';

  if (softwareName && softwarePackage) {
    // Lấy tất cả tài khoản với thông tin đầy đủ
    const accounts = softwareData.filter(item =>
      item.softwareName === softwareName &&
      item.softwarePackage === softwarePackage
    );

    // Sắp xếp theo số người dùng đang hoạt động (từ thấp đến cao)
    accounts.sort((a, b) => parseInt(a.activeUsers || 0) - parseInt(b.activeUsers || 0));

    // Thêm từng tài khoản vào dropdown
    accounts.forEach(item => {
      const option = document.createElement("option");
      option.value = item.accountName;
      option.textContent = item.accountName;
      
      // Kiểm tra xem tài khoản có bị full không
      const activeUsers = parseInt(item.activeUsers) || 0;
      const allowedUsers = parseInt(item.allowedUsers) || 0;
      
      // In nghiêng mờ nếu số người dùng đang hoạt động >= số người dùng cho phép
      if (activeUsers >= allowedUsers) {
        option.className = "unavailable";
      }
      
      accountNameSelect.appendChild(option);
    });

    // Nếu tài khoản cần giữ không nằm trong danh sách (đã bị xóa hoàn toàn), thêm vào
    const accountNames = accounts.map(item => item.accountName);
    if (accountNameToKeep && !accountNames.includes(accountNameToKeep)) {
      const option = document.createElement("option");
      option.value = accountNameToKeep;
      option.textContent = accountNameToKeep;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    }

    // Gán đúng giá trị dropdown
    accountNameSelect.value = accountNameToKeep || window.currentAccountName || "";
  }
}
