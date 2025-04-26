export async function updatePackageList(BACKEND_URL) {
    const softwareName = document.getElementById("softwareName").value;
    const packageSelect = document.getElementById("softwarePackage");
    packageSelect.innerHTML = '<option value="">Chọn gói phần mềm</option>';
  
    if (softwareName) {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getSoftwareList" })
      });
      const result = await response.json();
      if (result.status === "success") {
        const software = result.data.find(s => s.softwareName === softwareName);
        if (software) {
          software.packages.forEach(pkg => {
            const option = document.createElement("option");
            option.value = pkg.softwarePackage;
            option.textContent = pkg.softwarePackage;
            packageSelect.appendChild(option);
          });
          if (window.currentSoftwarePackage) {
            packageSelect.value = window.currentSoftwarePackage;
          }
        }
      }
    }
  }