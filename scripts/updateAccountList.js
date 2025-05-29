export async function updateAccountList(softwareData, accountNameToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountNameSelect = document.getElementById("accountName");

  // Reset dropdown tài khoản
  accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';

  if (softwareName && softwarePackage) {
    // Lấy tất cả các tài khoản liên quan đến phần mềm + gói này
    const allAccounts = [...new Set(softwareData
      .filter(item =>
        item.softwareName === softwareName &&
        item.softwarePackage === softwarePackage
      )
      .map(item => item.accountName)
    )];

    // Tài khoản còn khả dụng (chưa đạt số lượng người dùng cho phép)
    const availableAccounts = [...new Set(softwareData
      .filter(item =>
        item.softwareName === softwareName &&
        item.softwarePackage === softwarePackage &&
        item.activeUsers < item.allowedUsers
      )
      .map(item => item.accountName)
    )];

    // Tài khoản không khả dụng (đã đủ người dùng hoặc bị vô hiệu hóa)
    const unavailableAccounts = allAccounts.filter(acc => !availableAccounts.includes(acc));

    // Thêm tài khoản khả dụng
    availableAccounts.forEach(acc => {
      const option = document.createElement("option");
      option.value = acc;
      option.textContent = acc;
      accountNameSelect.appendChild(option);
    });

    // Thêm tài khoản không khả dụng (in nghiêng)
    unavailableAccounts.forEach(acc => {
      const option = document.createElement("option");
      option.value = acc;
      option.textContent = acc;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    });

    // ✅ Nếu tài khoản cần giữ không nằm trong danh sách (đã bị xóa hoàn toàn), thêm vào
    if (accountNameToKeep && !allAccounts.includes(accountNameToKeep)) {
      const option = document.createElement("option");
      option.value = accountNameToKeep;
      option.textContent = accountNameToKeep;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    }

    // ✅ Gán đúng giá trị dropdown
    accountNameSelect.value = accountNameToKeep || window.currentAccountName || "";
  }
}
