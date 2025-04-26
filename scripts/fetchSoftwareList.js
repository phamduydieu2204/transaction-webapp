import { getConstants } from './constants.js';

export async function fetchSoftwareList(softwareNameToKeep, softwareData, updatePackageList, updateAccountList) {
  const { BACKEND_URL } = getConstants();
  const data = {
    action: "getSoftwareList"
  };

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status === "success") {
      window.softwareData = result.data;

      const softwareNames = [...new Set(window.softwareData.map(item => item.softwareName))];
      const softwareNameSelect = document.getElementById("softwareName");

      softwareNameSelect.innerHTML = '<option value="">-- Chọn phần mềm --</option>';

      softwareNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        softwareNameSelect.appendChild(option);
      });

      if (softwareNameToKeep && !softwareNames.includes(softwareNameToKeep)) {
        const option = document.createElement("option");
        option.value = softwareNameToKeep;
        option.textContent = softwareNameToKeep;
        option.className = "unavailable";
        softwareNameSelect.appendChild(option);
      }

      softwareNameSelect.value = softwareNameToKeep || window.currentSoftwareName || "";

      updatePackageList(window.softwareData, null, updateAccountList);
    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}