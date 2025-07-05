export function updatePackageList(softwareData, softwarePackageToKeep, updateAccountList, accountNameToKeep = null) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  // Thiết lập tùy chọn mặc định
  softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

  if (softwareName) {
    // Lấy tất cả các gói duy nhất cho phần mềm đã chọn
    const allPackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];

    // Kiểm tra từng gói để xem có nên in nghiêng mờ không
    allPackages.forEach(pkg => {
      // Lấy tất cả tài khoản của gói này
      const accountsInPackage = softwareData.filter(item => 
        item.softwareName === softwareName && 
        item.softwarePackage === pkg
      );
      
      // Kiểm tra xem tất cả tài khoản có bị full không
      const allAccountsFull = accountsInPackage.every(item => 
        parseInt(item.activeUsers) >= parseInt(item.allowedUsers)
      );

      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      
      // In nghiêng mờ nếu tất cả tài khoản đều full
      if (allAccountsFull) {
        option.className = "unavailable";
      }
      
      softwarePackageSelect.appendChild(option);
    });

    // Nếu gói cần giữ không nằm trong danh sách, thêm vào (dạng không khả dụng)
    if (softwarePackageToKeep && !allPackages.includes(softwarePackageToKeep)) {
      const option = document.createElement("option");
      option.value = softwarePackageToKeep;
      option.textContent = softwarePackageToKeep;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    }

    // Đặt giá trị cho dropdown
    softwarePackageSelect.value = softwarePackageToKeep || window.currentSoftwarePackage || "";
  }

  // Cập nhật tài khoản liên quan
  updateAccountList(softwareData, accountNameToKeep);
}
