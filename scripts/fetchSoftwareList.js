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
  const { BACKEND_URL } = getConstants();
  const data = { action: "getSoftwareList" };

  try {
    // Use request deduplication to prevent duplicate API calls
    const result = await deduplicateRequest(
      'software-list',
      async () => {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        return await response.json();
      },
      { cacheDuration: 10 * 60 * 1000 } // Cache for 10 minutes
    );

    if (result.status === "success") {
      // Cập nhật biến toàn cục
      window.softwareData = result.data;
      
      // Debug: Log first few software entries to check structure
      console.log('📦 Software data loaded:', {
        total: window.softwareData.length,
        sample: window.softwareData.slice(0, 2).map(item => ({
          softwareName: item.softwareName,
          softwarePackage: item.softwarePackage,
          accountName: item.accountName,
          fileType: item.fileType,
          allKeys: Object.keys(item)
        }))
      });
      
      // Check if any item has fileType-related fields
      const hasFileType = window.softwareData.some(item => 
        item.fileType || item.loaiTep || item['loại tệp'] || item.FileType
      );
      console.log('🔍 Has fileType field:', hasFileType);
      
      // Log all unique keys to understand data structure
      const allKeys = new Set();
      window.softwareData.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });
      console.log('🗝️ All available keys:', Array.from(allKeys).sort());

      const softwareNames = [...new Set(window.softwareData.map(item => item.softwareName))];
      const softwareNameSelect = document.getElementById("softwareName");

      // Reset dropdown phần mềm
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

      // ✅ Gọi tiếp để cập nhật gói và tài khoản theo phần mềm hiện tại
      updatePackageList(window.softwareData, softwarePackageToKeep, updateAccountList, accountNameToKeep);

    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
    }

  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}
