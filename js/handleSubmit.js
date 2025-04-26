export async function handleSubmit(BACKEND_URL, USER_INFO, transactions, showProcessingModal, showResultModal, closeProcessingModal, loadTransactions) {
    showProcessingModal("Đang xử lý...");
    const formData = {
      action: window.currentEditTransactionId ? "updateTransaction" : "addTransaction",
      transactionId: window.currentEditTransactionId || document.getElementById("transactionId").value,
      transactionType: document.getElementById("transactionType").value,
      transactionDate: document.getElementById("transactionDate").value,
      customerName: document.getElementById("customerName").value,
      customerEmail: document.getElementById("customerEmail").value,
      customerPhone: document.getElementById("customerPhone").value,
      duration: parseInt(document.getElementById("duration").value) || 0,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      deviceCount: parseInt(document.getElementById("deviceCount").value) || 0,
      softwareName: document.getElementById("softwareName").value,
      softwarePackage: document.getElementById("softwarePackage").value,
      accountName: document.getElementById("accountName").value,
      revenue: parseFloat(document.getElementById("revenue").value) || 0,
      note: document.getElementById("note").value,
      tenNhanVien: USER_INFO.tenNhanVien,
      maNhanVien: USER_INFO.maNhanVien,
      editorTenNhanVien: USER_INFO.tenNhanVien,
      editorMaNhanVien: USER_INFO.maNhanVien
    };
  
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await response.json();
  
    if (result.status === "success") {
      showResultModal(window.currentEditTransactionId ? "Giao dịch đã được cập nhật!" : "Giao dịch đã được thêm!", true);
      loadTransactions();
    } else {
      showResultModal("Lỗi: " + result.message, false);
    }
    closeProcessingModal();
  }