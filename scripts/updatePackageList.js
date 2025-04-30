export function updatePackageList(softwareData, softwarePackageToKeep, updateAccountList, accountNameToKeep = null) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  // Thiết lập tùy chọn mặc định
  softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

  if (softwareName) {
    // Lấy tất cả các gói có liên quan đến phần mềm
    const allPackages = [...new Set(softwareData
      .map(item => item.softwareName === softwareName ? item.softwarePackage : null)
      .filter(item => item !== null)
    )];

    // Gói khả dụng (còn hoạt động)
    const availablePackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];

    // Gói không còn hoạt động
    const unavailablePackages = allPackages.filter(pkg => !availablePackages.includes(pkg));

    // Thêm các gói khả dụng
    availablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      softwarePackageSelect.appendChild(option);
    });

    // Thêm các gói không khả dụng (in nghiêng)
    unavailablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    });

    // ✅ Nếu gói cần giữ không nằm trong tất cả các gói, thêm nó vào (dạng không khả dụng)
    if (softwarePackageToKeep && !allPackages.includes(softwarePackageToKeep)) {
      const option = document.createElement("option");
      option.value = softwarePackageToKeep;
      option.textContent = softwarePackageToKeep;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    }

    // ✅ Đặt giá trị cho dropdown
    softwarePackageSelect.value = softwarePackageToKeep || window.currentSoftwarePackage || "";
  }

  // ✅ Cập nhật tài khoản liên quan
  updateAccountList(softwareData, accountNameToKeep);
}
