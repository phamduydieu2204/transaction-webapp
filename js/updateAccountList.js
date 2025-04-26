export async function updateAccountList(BACKEND_URL) {
    const softwareName = document.getElementById("softwareName").value;
    const softwarePackage = document.getElementById("softwarePackage").value;
    const accountSelect = document.getElementById("accountName");
    accountSelect.innerHTML = '<option value="">Chọn tài khoản</option>';
  
    if (softwareName && softwarePackage) {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getSoftwareList" })
      });
      const result = await response.json();
      if (result.status === "success") {
        const software = result.data.find(s => s.softwareName === softwareName);
        if (software) {
          const pkg = software.packages.find(p => p.softwarePackage === softwarePackage);
          if (pkg) {
            pkg.accounts.forEach(acc => {
              const option = document.createElement("option");
              option.value = acc.accountName;
              option.textContent = acc.accountName;
              accountSelect.appendChild(option);
            });
            if (window.currentAccountName) {
              accountSelect.value = window.currentAccountName;
            }
          }
        }
      }
    }
  }