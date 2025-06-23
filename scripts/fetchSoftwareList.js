import { getConstants } from './constants.js';
import { deduplicateRequest } from './core/requestOptimizer.js';

export async function fetchSoftwareList(
  softwareNameToKeep,
  softwareData,
  updatePackageList,
  updateAccountList,
  softwarePackageToKeep = null,
  accountNameToKeep = null
) {
  try {
    const { BACKEND_URL } = getConstants();
    const data = { action: "getSoftwareList" };

    // Use deduplicateRequest to cache API calls
    const result = await deduplicateRequest(
      'getSoftwareList',
      async () => {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
        return await response.json();
      },
      { cacheDuration: 10 * 60 * 1000 } // Cache for 10 minutes
    );

    if (result.status === "success") {
      // Cập nhật biến toàn cục
      window.softwareData = result.data;

      const softwareNames = [...new Set(window.softwareData.map(item => item.softwareName))];
      const softwareNameSelect = document.getElementById("softwareName");

      // Reset dropdown phần mềm
      if (softwareNameSelect) {
        softwareNameSelect.innerHTML = '<option value="">-- Chọn phần mềm --</option>';

        // Thêm các phần mềm khả dụng
        softwareNames.forEach(name => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          softwareNameSelect.appendChild(option);
        });

        // ✅ Thêm phần mềm không còn tồn tại (nếu có) và chưa nằm trong danh sách
        if (softwareNameToKeep && !softwareNames.includes(softwareNameToKeep)) {
          const option = document.createElement("option");
          option.value = softwareNameToKeep;
          option.textContent = softwareNameToKeep;
          option.className = "unavailable"; // kiểu in nghiêng
          softwareNameSelect.appendChild(option);
        }

        // ✅ Đặt giá trị được chọn cho dropdown phần mềm
        softwareNameSelect.value = softwareNameToKeep || window.currentSoftwareName || "";
      }

      // ✅ Gọi tiếp để cập nhật gói và tài khoản theo phần mềm hiện tại
      if (typeof updatePackageList === 'function') {
        updatePackageList(window.softwareData, softwarePackageToKeep, updateAccountList, accountNameToKeep);
      }

    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
    }

  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}