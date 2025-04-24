let softwareData = [];

export async function fetchSoftwareList(softwareNameToKeep) {
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
      softwareData = result.data;

      const softwareNames = [...new Set(softwareData.map(item => item.softwareName))];
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

      softwareNameSelect.value = softwareNameToKeep || "";

      updatePackageList();
    } else {
      console.error("Lỗi khi lấy danh sách phần mềm:", result.message);
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phần mềm:", err);
  }
}

export function updatePackageList(softwarePackageToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackageSelect = document.getElementById("softwarePackage");

  softwarePackageSelect.innerHTML = '<option value="">-- Chọn gói --</option>';

  if (softwareName) {
    const allPackages = [...new Set(softwareData
      .map(item => item.softwareName === softwareName ? item.softwarePackage : null)
      .filter(item => item !== null)
    )];

    const availablePackages = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName)
      .map(item => item.softwarePackage)
    )];

    const unavailablePackages = allPackages.filter(pkg => !availablePackages.includes(pkg));

    availablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      softwarePackageSelect.appendChild(option);
    });

    unavailablePackages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg;
      option.textContent = pkg;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    });

    if (softwarePackageToKeep && !allPackages.includes(softwarePackageToKeep)) {
      const option = document.createElement("option");
      option.value = softwarePackageToKeep;
      option.textContent = softwarePackageToKeep;
      option.className = "unavailable";
      softwarePackageSelect.appendChild(option);
    }

    softwarePackageSelect.value = softwarePackageToKeep || "";
  }

  updateAccountList();
}

export async function updateAccountList(accountNameToKeep) {
  const softwareName = document.getElementById("softwareName").value;
  const softwarePackage = document.getElementById("softwarePackage").value;
  const accountNameSelect = document.getElementById("accountName");

  accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';

  if (softwareName && softwarePackage) {
    const allAccounts = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName && item.softwarePackage === softwarePackage)
      .map(item => item.accountName)
    )];

    const availableAccounts = [...new Set(softwareData
      .filter(item => item.softwareName === softwareName && item.softwarePackage === softwarePackage && item.activeUsers < item.allowedUsers)
      .map(item => item.accountName)
    )];

    const unavailableAccounts = allAccounts.filter(account => !availableAccounts.includes(account));

    availableAccounts.forEach(account => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      accountNameSelect.appendChild(option);
    });

    unavailableAccounts.forEach(account => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    });

    if (accountNameToKeep && !allAccounts.includes(accountNameToKeep)) {
      const option = document.createElement("option");
      option.value = accountNameToKeep;
      option.textContent = accountNameToKeep;
      option.className = "unavailable";
      accountNameSelect.appendChild(option);
    }

    accountNameSelect.value = accountNameToKeep || "";
  }
}