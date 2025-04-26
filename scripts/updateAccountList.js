export async function updateAccountList(softwareData, accountNameToKeep) {
    const softwareName = document.getElementById("softwareName").value;
    const softwarePackage = document.getElementById("softwarePackage").value;
    const accountNameSelect = document.getElementById("accountName");
  
    accountNameSelect.innerHTML = '<option value="">-- Chọn tài khoản --</option>';
  
    if (softwareName && softwarePackage) {
      const allAccounts = [...new Set(softwareData
        .filter(item =>
          item.softwareName === softwareName &&
          item.softwarePackage === softwarePackage
        )
        .map(item => item.accountName)
      )];
  
      const availableAccounts = [...new Set(softwareData
        .filter(item =>
          item.softwareName === softwareName &&
          item.softwarePackage === softwarePackage &&
          item.activeUsers < item.allowedUsers
        )
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
  
      accountNameSelect.value = accountNameToKeep || window.currentAccountName || "";
    }
  }