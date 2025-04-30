export function updatePackageList(softwareData, softwarePackageToKeep, updateAccountList, accountNameToKeep = null) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  // Thiết lập tùy chọn mặc định cho danh sách gói
  softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

  if (softwareName) {
    // Lấy tất cả các gói (kể cả đã ngừng cung cấp) cho phần mềm đã chọn
    const allPackages = [...new Set(softwareData
      .map(item => item.softwareName === softwareName ? item.softwarePackage : null)
      .filter(item => item !== null)
    )];
    // Lấy các gói hiện có sẵn cho phần mềm đã chọn
    const availablePackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];
    // Các gói không khả dụng (có trong allPackages nhưng không có trong availablePackages)
    const unavailablePackages = allPackages.filter(pkg => !availablePackages.includes(pkg));

    // Thêm các tùy chọn gói khả dụng vào dropdown
    availablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      softwarePackageSelect.appendChild(option);
    });

    // Thêm các tùy chọn gói không khả dụng vào dropdown (nếu có)
    unavailablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    });

    // Nếu có tên gói cần giữ mà không nằm trong allPackages, thêm vào như tùy chọn không khả dụng
    if (softwarePackageToKeep && !allPackages.includes(softwarePackageToKeep)) {
      const option = document.createElement("option");
      option.value = softwarePackageToKeep;
      option.textContent = softwarePackageToKeep;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    }

    // Đặt giá trị được chọn cho dropdown gói (nếu có)
    softwarePackageSelect.value = softwarePackageToKeep || window.currentSoftwarePackage || "";
  }

  // Cập nhật danh sách tài khoản dựa trên phần mềm & gói đã chọn, truyền giá trị tài khoản cần giữ
  updateAccountList(softwareData, accountNameToKeep);
}
