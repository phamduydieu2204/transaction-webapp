export async function handleDelete(transactionId, BACKEND_URL, USER_INFO, showProcessingModal, showResultModal, closeProcessingModal, loadTransactions) {
    if (confirm("Bạn có chắc muốn xóa giao dịch này?")) {
      showProcessingModal("Đang xóa giao dịch...");
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteTransaction",
          transactionId: transactionId,
          maNhanVien: USER_INFO.maNhanVien,
          vaiTro: USER_INFO.vaiTro
        })
      });
      const result = await response.json();
  
      if (result.status === "success") {
        showResultModal("Giao dịch đã được xóa!", true);
        loadTransactions();
      } else {
        showResultModal("Lỗi: " + result.message, false);
      }
      closeProcessingModal();
    }
  }