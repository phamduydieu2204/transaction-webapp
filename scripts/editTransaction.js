export function editTransaction(index, transactionList, fetchSoftwareList, updatePackageList, updateAccountList) {
    const transaction = transactionList[index];
    window.currentEditTransactionId = transaction.transactionId;
  
    const softwareNameSelect = document.getElementById("softwareName");
    const softwarePackageSelect = document.getElementById("softwarePackage");
    const accountNameSelect = document.getElementById("accountName");
  
    const softwareNameValue = transaction.softwareName || "";
    const softwarePackageValue = transaction.softwarePackage || "";
    const accountNameValue = transaction.accountName || "";
  
    window.currentSoftwareName = softwareNameValue;
    window.currentSoftwarePackage = softwarePackageValue;
    window.currentAccountName = accountNameValue;
  
    document.getElementById("transactionDate").value = transaction.transactionDate;
    document.getElementById("transactionType").value = transaction.transactionType || "";
    document.getElementById("customerName").value = transaction.customerName;
    document.getElementById("customerEmail").value = transaction.customerEmail;
    document.getElementById("customerPhone").value = transaction.customerPhone;
    document.getElementById("duration").value = transaction.duration;
    document.getElementById("startDate").value = transaction.startDate;
    document.getElementById("endDate").value = transaction.endDate;
    document.getElementById("deviceCount").value = transaction.deviceCount;
    document.getElementById("revenue").value = transaction.revenue;
    document.getElementById("note").value = transaction.note;
  
    fetchSoftwareList(softwareNameValue);
    softwareNameSelect.value = softwareNameValue;
  
    updatePackageList(softwarePackageValue);
    softwarePackageSelect.value = softwarePackageValue;
  
    updateAccountList(accountNameValue);
    accountNameSelect.value = accountNameValue;
  }