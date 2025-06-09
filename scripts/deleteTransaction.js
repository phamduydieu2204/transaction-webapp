import { validateBeforeOperation } from './core/sessionValidator.js';
import { cacheManager } from './core/cacheManager.js';
import { uiBlocker } from './uiBlocker.js';

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
  console.log("🗑️ deleteTransaction được gọi với:", {
    index,
    transactionListType: typeof transactionList,
    transactionListLength: transactionList ? transactionList.length : 0,
    hasUserInfo: !!userInfo
  });

  // Validation cơ bản trước
  if (!transactionList || !Array.isArray(transactionList)) {
    console.error("❌ TransactionList không hợp lệ:", transactionList);
    if (showResultModal) {
      showResultModal("Dữ liệu giao dịch không hợp lệ. Vui lòng tải lại trang.", false);
    }
    return;
  }

  if (typeof index !== 'number' || index < 0) {
    console.error("❌ Index không hợp lệ:", index);
    if (showResultModal) {
      showResultModal("Chỉ số giao dịch không hợp lệ.", false);
    }
    return;
  }

  const transaction = transactionList[index];

  if (!transaction) {
    console.error("❌ Giao dịch không tồn tại tại index:", index, "trong danh sách có", transactionList.length, "items");
    if (showResultModal) {
      showResultModal("Giao dịch không tồn tại. Vui lòng thử lại.", false);
    }
    return;
  }

  console.log("✅ Transaction found:", transaction.transactionId);

  const confirmMessage = `Bạn có chắc muốn xóa giao dịch ${transaction.transactionId}? ${
    transaction.accountSheetId && transaction.customerEmail
      ? `Giao dịch này sẽ được xóa và quyền chia sẻ tệp với email ${transaction.customerEmail} sẽ bị hủy.`
      : ""
  }`;

  // Hiển thị confirm modal ngay lập tức
  const confirmDelete = await new Promise((resolve) => {
    openConfirmModal(confirmMessage, resolve);
  });

  if (!confirmDelete) {
    console.log("Người dùng hủy xóa giao dịch");
    return;
  }

  // Khóa UI ngay sau khi user confirm
  uiBlocker.block();

  // Validate session sau khi confirm
  const sessionValid = await validateBeforeOperation();
  if (!sessionValid) {
    uiBlocker.unblock();
    return;
  }

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
      // Xóa giao dịch khỏi UI ngay lập tức
      if (window.transactionList) {
        window.transactionList.splice(index, 1);
        
        // Update table ngay lập tức với danh sách mới
        if (window.updateTable && typeof window.updateTable === 'function') {
          const { updateTable } = await import('./updateTable.js');
          const { formatDate } = await import('./formatDate.js');
          const { editTransaction } = await import('./editTransaction.js');
          const { viewTransaction } = await import('./viewTransaction.js');
          
          updateTable(window.transactionList, window.currentPage || 1, window.itemsPerPage || 10,
                     formatDate, editTransaction, window.deleteTransaction, viewTransaction);
        }
      }

      // Clear cache để đảm bảo sync với server
      cacheManager.clearTransactionCaches();
      
      // Hiển thị thông báo thành công
      showResultModal(
        transaction.accountSheetId && transaction.customerEmail
          ? "Giao dịch đã được xóa và quyền chia sẻ đã được hủy!"
          : "Giao dịch đã được xóa!",
        true
      );
      
      // Load lại data từ server trong background
      window.loadTransactions();
      handleReset();
    } else {
      console.error("Lỗi từ server:", result.message);
      showResultModal(result.message || "Không thể xóa giao dịch!", false);
    }
  } catch (err) {
    console.error("Lỗi trong deleteTransaction:", err);
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
  } finally {
    // Luôn mở khóa UI khi kết thúc
    uiBlocker.unblock();
  }
}
