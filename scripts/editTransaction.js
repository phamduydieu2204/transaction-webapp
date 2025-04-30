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

  // Điền các trường khác trước
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

  // ✅ Gọi fetchSoftwareList rồi gán lại sau khi dropdown cập nhật
  fetchSoftwareList(softwareNameValue, window.softwareData, (softwareData, _, updateAccountListCallback) => {
    updatePackageList(softwareData, softwarePackageValue, updateAccountListCallback);

    // Gán lại value sau khi dropdown được render
    softwareNameSelect.value = softwareNameValue;
    softwarePackageSelect.value = softwarePackageValue;

    updateAccountList(softwareData, accountNameValue);
    accountNameSelect.value = accountNameValue;
  });

  // Cập nhật currentAccountName khi thay đổi
  accountNameSelect.addEventListener('change', () => {
    window.currentAccountName = accountNameSelect.value;
  });

  // Loại giao dịch (Dropdown loại giao dịch)
  if (!transactionTypeSelect) {
    console.error("Không tìm thấy trường transactionType trong DOM");
  } else {
    const normalizedTypeValue = transactionTypeValue.toLowerCase();
    const matchingOption = Array.from(transactionTypeSelect.options).find(
      option => option.value.toLowerCase() === normalizedTypeValue
    );

    if (matchingOption) {
      transactionTypeSelect.value = matchingOption.value;
    } else {
      console.warn("Không tìm thấy tùy chọn khớp với transactionType:", transactionTypeValue);
      transactionTypeSelect.value = "";
    }
  }
}
