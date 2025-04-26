export async function handleEdit(transactionId, transactions, showProcessingModal, showResultModal, closeProcessingModal, updatePackageList, updateAccountList) {
  showProcessingModal("Đang tải dữ liệu giao dịch...");
  const transaction = transactions.find(t => t.transactionId === transactionId);
  if (!transaction) {
    showResultModal("Không tìm thấy giao dịch!", false);
    return;
  }

  window.currentEditTransactionId = transactionId;
  document.getElementById("submitButton").textContent = "Cập nhật";
  document.getElementById("formTitle").textContent = "Sửa Giao Dịch";

  // Điền dữ liệu vào form
  document.getElementById("transactionType").value = transaction.transactionType || "";
  document.getElementById("customerName").value = transaction.customerName || "";
  document.getElementById("customerEmail").value = transaction.customerEmail || "";
  document.getElementById("customerPhone").value = transaction.customerPhone || "";
  document.getElementById("duration").value = transaction.duration || "";
  document.getElementById("startDate").value = transaction.startDate || "";
  document.getElementById("endDate").value = transaction.endDate || "";
  document.getElementById("deviceCount").value = transaction.deviceCount || "";
  document.getElementById("softwareName").value = transaction.softwareName || "";
  document.getElementById("revenue").value = transaction.revenue || "";
  document.getElementById("note").value = transaction.note || "";
  document.getElementById("accountName").value = transaction.accountName || "";

  // Lưu giá trị hiện tại
  window.currentSoftwareName = transaction.softwareName;
  window.currentSoftwarePackage = transaction.softwarePackage;
  window.currentAccountName = transaction.accountName;

  // Cập nhật danh sách
  await updatePackageList();
  await updateAccountList();

  // Đảm bảo giữ giá trị
  document.getElementById("softwareName").value = window.currentSoftwareName || "";
  document.getElementById("softwarePackage").value = window.currentSoftwarePackage || "";
  document.getElementById("accountName").value = window.currentAccountName || "";

  closeProcessingModal();
}