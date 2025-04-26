export async function handleReset(fetchSoftwareList, showProcessingModal, showResultModal, todayFormatted) {
    showProcessingModal("Đang làm mới dữ liệu...");
    const startDateInput = document.getElementById("startDate");
    const transactionDateInput = document.getElementById("transactionDate");
    
    startDateInput.value = todayFormatted;
    transactionDateInput.value = todayFormatted;
  
    document.getElementById("transactionForm").reset();
  
    const softwareNameSelect = document.getElementById("softwareName");
    const softwarePackageSelect = document.getElementById("softwarePackage");
    const accountNameSelect = document.getElementById("accountName");
  
    softwareNameSelect.removeEventListener("focus", softwareNameSelect.focusHandler);
    softwarePackageSelect.removeEventListener("focus", softwarePackageSelect.focusHandler);
    accountNameSelect.removeEventListener("focus", accountNameSelect.focusHandler);
  
    document.getElementById("transactionType").value = "";
    document.getElementById("softwareName").value = "";
    document.getElementById("softwarePackage").value = "";
    document.getElementById("accountName").value = "";
  
    document.getElementById("customerName").value = "";
    document.getElementById("customerEmail").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("deviceCount").value = "";
    document.getElementById("note").value = "";
    document.getElementById("revenue").value = "";
  
    window.currentEditIndex = -1;
    window.currentEditTransactionId = null;
    
    try {
      await fetchSoftwareList();
      showResultModal("Dữ liệu đã được làm mới!", true);
    } catch (err) {
      showResultModal(`Lỗi khi làm mới dữ liệu: ${err.message}`, false);
    }
  }