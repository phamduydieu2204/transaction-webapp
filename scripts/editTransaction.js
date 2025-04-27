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

  // Cập nhật danh sách phần mềm, gói, và tài khoản
  fetchSoftwareList(softwareNameValue, window.softwareData, updatePackageList, updateAccountList);
  softwareNameSelect.value = softwareNameValue;

  updatePackageList(window.softwareData, softwarePackageValue, updateAccountList);
  softwarePackageSelect.value = softwarePackageValue;

  updateAccountList(window.softwareData, accountNameValue);
  accountNameSelect.value = accountNameValue;

  // Gán transactionType, xử lý không phân biệt chữ hoa - chữ thường
  if (!transactionTypeSelect) {
    console.error("Không tìm thấy trường transactionType trong DOM");
  } else {
    console.log("Giá trị transactionType trước khi gán:", transactionTypeValue);
    console.log("Các giá trị tùy chọn transactionType:", Array.from(transactionTypeSelect.options).map(opt => opt.value));

    // Tìm giá trị phù hợp không phân biệt chữ hoa - chữ thường
    const normalizedTypeValue = transactionTypeValue.toLowerCase();
    const matchingOption = Array.from(transactionTypeSelect.options).find(
      option => option.value.toLowerCase() === normalizedTypeValue
    );

    if (matchingOption) {
      transactionTypeSelect.value = matchingOption.value;
      console.log("Giá trị transactionType sau khi gán:", transactionTypeSelect.value);
      // Kiểm tra xem giá trị có được gán đúng không
      if (transactionTypeSelect.value.toLowerCase() !== normalizedTypeValue) {
        console.warn("Giá trị transactionType không được gán đúng, thử gán lại:", matchingOption.value);
        transactionTypeSelect.value = matchingOption.value;
        console.log("Giá trị transactionType sau khi gán lại:", transactionTypeSelect.value);
      }
    } else {
      console.warn("Không tìm thấy tùy chọn khớp với transactionType:", transactionTypeValue);
      transactionTypeSelect.value = "";
    }
  }
}