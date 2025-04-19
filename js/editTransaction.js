function editTransaction(index) {
  const transaction = transactionList[index];
  currentEditTransactionId = transaction.transactionId;

  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");

  const softwareNameValue = transaction.softwareName || "";
  const softwarePackageValue = transaction.softwarePackage || "";
  const accountNameValue = transaction.accountName || "";

  // Điền các trường input
  document.getElementById("transactionDate").value = transaction.transactionDate;
  document.getElementById("transactionType").value = transaction.transactionType;
  document.getElementById("customerName").value = transaction.customerName;
  document.getElementById("customerEmail").value = transaction.customerEmail;
  document.getElementById("customerPhone").value = transaction.customerPhone;
  document.getElementById("duration").value = transaction.duration;
  document.getElementById("startDate").value = transaction.startDate;
  document.getElementById("endDate").value = transaction.endDate;
  document.getElementById("deviceCount").value = transaction.deviceCount;
  document.getElementById("revenue").value = transaction.revenue;
  document.getElementById("note").value = transaction.note;

  // Tạm thời vô hiệu hóa sự kiện change để tránh cập nhật không mong muốn
  const softwareNameChangeHandler = softwareNameSelect.onchange;
  const softwarePackageChangeHandler = softwarePackageSelect.onchange;
  softwareNameSelect.onchange = null;
  softwarePackageSelect.onchange = null;

  // Tải danh sách phần mềm và chờ hoàn tất
  fetchSoftwareList(softwareNameValue).then(() => {
    softwareNameSelect.value = softwareNameValue;

    // Cập nhật danh sách gói phần mềm
    updatePackageList(softwarePackageValue);
    softwarePackageSelect.value = softwarePackageValue;

    // Cập nhật danh sách tài khoản
    updateAccountList(accountNameValue);
    accountNameSelect.value = accountNameValue;

    // Khôi phục sự kiện change
    softwareNameSelect.onchange = softwareNameChangeHandler;
    softwarePackageSelect.onchange = softwarePackageChangeHandler;
  });
}

// Hàm chỉnh sửa dòng (hỗ trợ tương thích cũ)
window.editRow = function (index) {
  const t = transactionList[index];
  document.getElementById("transactionType").value = t.transactionType || '';
  document.getElementById("customerName").value = t.customerName || '';
  document.getElementById("customerEmail").value = t.customerEmail || '';
  document.getElementById("customerPhone").value = t.customerPhone || '';
  document.getElementById("softwareName").value = t.softwareName || '';
  document.getElementById("softwarePackage").value = t.softwarePackage || '';
  document.getElementById("duration").value = t.duration || '';
  document.getElementById("startDate").value = t.startDate || '';
  document.getElementById("endDate").value = t.endDate || '';
  document.getElementById("revenue").value = t.revenue || '';
  document.getElementById("deviceCount").value = t.deviceCount || '';
  document.getElementById("note").value = t.note || '';
  currentEditIndex = index;
};
