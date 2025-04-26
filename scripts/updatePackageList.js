export function updatePackageList(softwareData, softwarePackageToKeep, updateAccountList) {
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
  
      softwarePackageSelect.value = softwarePackageToKeep || window.currentSoftwarePackage || "";
    }
  
    updateAccountList();
  }