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
  const transactionTypeSelect = document.getElementById("transactionType");

  const softwareNameValue = transaction.softwareName || "";
  const softwarePackageValue = transaction.softwarePackage || "";
  const accountNameValue = transaction.accountName || "";
  const transactionTypeValue = transaction.transactionType || "";

  window.currentSoftwareName = softwareNameValue;
  window.currentSoftwarePackage = softwarePackageValue;
  window.currentAccountName = accountNameValue;

  // Điền các trường dữ liệu trước
  document.getElementById("transactionDate").value = transaction.transactionDate;
  document.getElementById("customerName").value = transaction.customerName;
  document.getElementById("customerEmail").value = transaction.customerEmail;
  document.getElementById("customerPhone").value = transaction.customerPhone;
  document.getElementById("duration").value = transaction.duration;
  document.getElementById("startDate").value = transaction.startDate;
  document.getElementById("endDate").value = transaction.endDate;
  document.getElementById("deviceCount").value = transaction.deviceCount;
  document.getElementById("revenue").value = transaction.revenue;
  document.getElementById("note").value = transaction.note;

  // Gọi fetchSoftwareList → gọi tiếp updatePackageList + updateAccountList
  fetchSoftwareList(softwareNameValue, window.softwareData, (softwareData, _, updateAccountListCallback) => {
    updatePackageList(softwareData, softwarePackageValue, (data) => {
      updateAccountList(data || softwareData, accountNameValue);
    });

    // ⚠️ Delay 100ms để chờ DOM render, sau đó gán lại value
    setTimeout(() => {
      softwareNameSelect.value = softwareNameValue;
      softwarePackageSelect.value = softwarePackageValue;
      accountNameSelect.value = accountNameValue;
    }, 100);
  });

  // Gán transactionType chính xác
  if (transactionTypeSelect) {
    const normalizedType = transactionTypeValue.toLowerCase();
    const matchedOption = Array.from(transactionTypeSelect.options).find(opt => opt.value.toLowerCase() === normalizedType);
    transactionTypeSelect.value = matchedOption ? matchedOption.value : "";
  }

  // Cập nhật tài khoản hiện tại
  if (accountNameSelect) {
    accountNameSelect.addEventListener('change', () => {
      window.currentAccountName = accountNameSelect.value;
    });
  }
}
