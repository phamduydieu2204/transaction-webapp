export function editTransaction(index, transactionList, fetchSoftwareList, updatePackageList, updateAccountList) {
  if (!transactionList || !Array.isArray(transactionList) || index < 0 || index >= transactionList.length) {
    console.error("Danh sách giao dịch không hợp lệ hoặc chỉ số không hợp lệ:", { index, transactionList });
    return;
  }

  const transaction = transactionList[index];
  if (!transaction) {
    console.error("Giao dịch không tồn tại tại chỉ số:", index);
    return;
  }

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

  fetchSoftwareList(softwareNameValue, window.softwareData, updatePackageList, updateAccountList);
  softwareNameSelect.value = softwareNameValue;

  updatePackageList(window.softwareData, softwarePackageValue, updateAccountList);
  softwarePackageSelect.value = softwarePackageValue;

  updateAccountList(accountNameValue);
  accountNameSelect.value = accountNameValue;
}