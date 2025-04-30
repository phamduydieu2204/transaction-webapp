import { getConstants } from './constants.js';

export async function fetchSoftwareList(softwareNameToKeep, softwareData, updatePackageList, updateAccountList, softwarePackageToKeep = null, accountNameToKeep = null) {
  const { BACKEND_URL } = getConstants();
  const data = { action: "getSoftwareList" };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.status === "success") {
      // Lưu danh sách phần mềm vào biến toàn cục
      window.softwareData = result.data;

      // Lấy danh sách tên phần mềm (duy nhất)
      const softwareNames = [...new Set(window.softwareData.map(item => item.softwareName))];
      const softwareNameSelect = document.getElementById("softwareName");

      // Xóa và thiết lập phần tử chọn phần mềm mặc định
      softwareNameSelect.innerHTML = '<option value="">-- Chọn phần mềm --</option>';
      softwareNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        softwareNameSelect.appendChild(option);
      });

      // Nếu có tên phần mềm cần giữ mà không nằm trong danh sách hiện tại, thêm vào như tùy chọn không khả dụng
      if (softwareNameToKeep && !softwareNames.includes(softwareNameToKeep)) {
        const option = document.createElement("option");
        option.value = softwareNameToKeep;
        option.textContent = softwareNameToKeep;
        option.className = "unavailable";
        softwareNameSelect.appendChild(option);
      }

      // Đặt giá trị được chọn cho dropdown phần mềm (nếu có)
      softwareNameSelect.value = softwareNameToKeep || window.currentSoftwareName || "";

      // Cập nhật danh sách gói phần mềm tiếp theo, truyền vào giá trị gói và tài khoản cần giữ
      updatePackageList(window.softwareData, softwarePackageToKeep, updateAccountList, accountNameToKeep);
    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}
