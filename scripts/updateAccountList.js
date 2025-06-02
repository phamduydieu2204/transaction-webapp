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

    // Phân nhóm tài khoản
    const groupA = []; // activeUsers < allowedUsers
    const groupB = []; // activeUsers >= allowedUsers && allowedUsers > 0
    const groupC = []; // allowedUsers = 0

    accounts.forEach(item => {
      const activeUsers = parseInt(item.activeUsers) || 0;
      const allowedUsers = parseInt(item.allowedUsers) || 0;
      
      if (allowedUsers === 0) {
        groupC.push(item);
      } else if (activeUsers >= allowedUsers) {
        groupB.push(item);
      } else {
        groupA.push(item);
      }
    });

    // Sắp xếp trong từng nhóm theo số người dùng đang hoạt động (từ thấp đến cao)
    groupA.sort((a, b) => parseInt(a.activeUsers || 0) - parseInt(b.activeUsers || 0));
    groupB.sort((a, b) => parseInt(a.activeUsers || 0) - parseInt(b.activeUsers || 0));
    // Nhóm C không cần sắp xếp theo activeUsers vì allowedUsers = 0

    // Tạo option cho từng nhóm theo thứ tự: A, B, C
    [...groupA, ...groupB, ...groupC].forEach(item => {
      const option = document.createElement("option");
      option.value = item.accountName;
      option.textContent = item.accountName;
      
      const activeUsers = parseInt(item.activeUsers) || 0;
      const allowedUsers = parseInt(item.allowedUsers) || 0;
      
      // Styling theo nhóm
      if (allowedUsers === 0) {
        // Nhóm C: In nghiêng đỏ
        option.style.fontStyle = "italic";
        option.style.color = "red";
      } else if (activeUsers >= allowedUsers) {
        // Nhóm B: In nghiêng mờ
        option.style.fontStyle = "italic";
        option.style.color = "#999";
        option.className = "unavailable";
      }
      // Nhóm A: Hiển thị bình thường (không cần style)
      
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
