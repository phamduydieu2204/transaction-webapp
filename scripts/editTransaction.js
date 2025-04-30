// Phiên bản mới đã sửa lỗi cho hàm editTransaction
export async function editTransaction(index, transactionList, fetchSoftwareList, updatePackageList, updateAccountList) {
  // Kiểm tra index hợp lệ và lấy giao dịch tương ứng
  if (!transactionList || !Array.isArray(transactionList) || index < 0 || index >= transactionList.length) {
    console.error("Danh sách giao dịch không hợp lệ hoặc chỉ số không hợp lệ:", { index, transactionList });
    return;
  }
  const transaction = transactionList[index];
  if (!transaction) {
    console.error("Giao dịch không tồn tại tại chỉ số:", index);
    return;
  }

  // Lưu ID giao dịch hiện tại đang sửa
  window.currentEditTransactionId = transaction.transactionId;

  // Lấy các phần tử dropdown và input từ DOM
  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");
  const transactionTypeSelect = document.getElementById("transactionType");

  // Lấy giá trị hiện tại của các trường (hoặc chuỗi rỗng nếu null/undefined)
  const softwareNameValue = transaction.softwareName || "";
  const softwarePackageValue = transaction.softwarePackage || "";
  const accountNameValue = transaction.accountName || "";
  const transactionTypeValue = transaction.transactionType || "";

  // Thiết lập các biến toàn cục tạm để giữ giá trị dropdown hiện tại
  window.currentSoftwareName = softwareNameValue;
  window.currentSoftwarePackage = softwarePackageValue;
  window.currentAccountName = accountNameValue;

  // Điền dữ liệu cho các trường văn bản trước
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

    // **Cập nhật danh sách phần mềm, gói và tài khoản như phiên bản cũ:**
    fetchSoftwareList(softwareNameValue, window.softwareData, updatePackageList, updateAccountList);
    // Gán giá trị dropdown "Tên phần mềm"
    document.getElementById("softwareName").value = softwareNameValue;
    // Cập nhật danh sách gói phần mềm với gói hiện tại, và danh sách tài khoản (truyền hàm updateAccountList)
    updatePackageList(window.softwareData, softwarePackageValue, updateAccountList);
    // Gán giá trị dropdown "Gói phần mềm"
    document.getElementById("softwarePackage").value = softwarePackageValue;
    // Cập nhật danh sách tài khoản với tài khoản hiện tại
    updateAccountList(window.softwareData, accountNameValue);
    // Gán giá trị dropdown "Tên tài khoản"
    document.getElementById("accountName").value = accountNameValue;

    // Gán loại giao dịch (không phân biệt hoa/thường)
    if (transactionTypeSelect) {
      const normalizedType = transactionTypeValue.toLowerCase();
      const matchedOption = Array.from(transactionTypeSelect.options)
                                 .find(opt => opt.value.toLowerCase() === normalizedType);
      transactionTypeSelect.value = matchedOption ? matchedOption.value : "";
  }

  // Gắn sự kiện 'change' cho dropdown tài khoản để cập nhật biến toàn cục tương ứng
  accountNameSelect.addEventListener('change', () => {
    window.currentAccountName = accountNameSelect.value;
  });
}
