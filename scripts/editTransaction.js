// Phiên bản mới của hàm editTransaction
export async function editTransaction(index, transactionList, fetchSoftwareList, updatePackageList, updateAccountList) {
  // Kiểm tra index hợp lệ
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

  // Lấy các phần tử dropdown từ DOM
  const softwareNameSelect = document.getElementById("softwareName");
  const softwarePackageSelect = document.getElementById("softwarePackage");
  const accountNameSelect = document.getElementById("accountName");
  const transactionTypeSelect = document.getElementById("transactionType");

  // Lấy giá trị hiện tại của các trường (hoặc chuỗi rỗng nếu null/undefined)
  const softwareNameValue = transaction.softwareName || "";
  const softwarePackageValue = transaction.softwarePackage || "";
  const accountNameValue = transaction.accountName || "";
  const transactionTypeValue = transaction.transactionType || "";

  // Thiết lập biến toàn cục tạm để giữ giá trị dropdown hiện tại
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

  // Cập nhật danh sách phần mềm, gói và tài khoản một cách tuần tự
  try {
    // Gọi hàm fetchSoftwareList và chờ hoàn tất
    await fetchSoftwareList(softwareNameValue, window.softwareData, updatePackageList, updateAccountList);
    // Sau khi fetchSoftwareList hoàn tất, dropdown softwareName đã được điền.
    // Gán giá trị phần mềm hiện tại vào dropdown (đảm bảo đúng phần mềm được chọn)
    softwareNameSelect.value = softwareNameValue;

    // Cập nhật danh sách gói dựa trên phần mềm đã chọn, và truyền giá trị gói cần giữ
    updatePackageList(window.softwareData, softwarePackageValue, updateAccountList);
    // Gán giá trị gói hiện tại vào dropdown gói
    softwarePackageSelect.value = softwarePackageValue;

    // Cập nhật danh sách tài khoản dựa trên phần mềm & gói đã chọn, truyền giá trị tài khoản cần giữ
    await updateAccountList(window.softwareData, accountNameValue);
    // Gán giá trị tài khoản hiện tại vào dropdown tài khoản
    accountNameSelect.value = accountNameValue;
  } catch (err) {
    console.error("Lỗi khi cập nhật danh sách phần mềm/gói/tài khoản:", err);
  }

  // Thiết lập loại giao dịch (transactionType) một cách không phân biệt hoa thường
  if (transactionTypeSelect) {
    const normalizedType = transactionTypeValue.toLowerCase();
    const matchedOption = Array.from(transactionTypeSelect.options).find(option => 
      option.value.toLowerCase() === normalizedType
    );
    transactionTypeSelect.value = matchedOption ? matchedOption.value : "";
  } else {
    console.error("Không tìm thấy trường transactionType trong DOM");
  }

  // Gắn sự kiện 'change' cho dropdown tài khoản để cập nhật biến toàn cục tương ứng
  accountNameSelect.addEventListener('change', () => {
    window.currentAccountName = accountNameSelect.value;
  });
}
