export async function deleteTransaction(
  index,
  transactionList,
  userInfo,
  loadTransactions,
  handleReset,
  showProcessingModal,
  showResultModal,
  openConfirmModal,
  getConstants
) {
  console.log("deleteTransaction được gọi, index:", index);
  const transaction = transactionList[index];

  if (!transaction) {
    console.error("Giao dịch không tồn tại, index:", index);
    showResultModal("Giao dịch không tồn tại. Vui lòng thử lại.", false);
    return;
  }

  const confirmMessage = `Bạn có chắc muốn xóa giao dịch ${transaction.transactionId}? ${
    transaction.accountSheetId && transaction.customerEmail
      ? `Giao dịch này sẽ được xóa và quyền chia sẻ tệp với email ${transaction.customerEmail} sẽ bị hủy.`
      : ""
  }`;

  const confirmDelete = await new Promise((resolve) => {
    openConfirmModal(confirmMessage, resolve);
  });

  if (!confirmDelete) {
    console.log("Người dùng hủy xóa giao dịch");
    return;
  }

  showProcessingModal("Đang xóa giao dịch...");

  const { BACKEND_URL } = getConstants();

  const data = {
    action: "deleteTransaction",
    transactionId: transaction.transactionId,
    maNhanVien: userInfo.maNhanVien,
    duocXoaGiaoDichCuaAi: userInfo.duocXoaGiaoDichCuaAi || "chỉ bản thân"
  };

  console.log("📤 Dữ liệu gửi đi:", JSON.stringify(data, null, 2));

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Kết quả từ server:", result);

    if (result.status === "success") {
      showResultModal(
        transaction.accountSheetId && transaction.customerEmail
          ? "Giao dịch đã được xóa và quyền chia sẻ đã được hủy!"
          : "Giao dịch đã được xóa!",
        true
      );

      await loadTransactions();
      handleReset();
    } else {
      console.error("Lỗi từ server:", result.message);
      showResultModal(result.message || "Không thể xóa giao dịch!", false);
    }
  } catch (err) {
    console.error("Lỗi trong deleteTransaction:", err);
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
  }
}
