import { validateBeforeOperation } from './core/sessionValidator.js';
import { cacheManager } from './core/cacheManager.js';
import { uiBlocker } from './uiBlocker.js';
import { updateTable } from './updateTable.js';
import { formatDate } from './formatDate.js';
import { editTransaction } from './editTransaction.js';
import { viewTransaction } from './viewTransaction.js';

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
  }`;

  // Hiển thị confirm modal ngay lập tức
  };
  });

        "Content-Type": "application/json"
      },
    });

    const result = await response.json();
    console.log("Kết quả từ server:", result);
        true
      );
      
      // Load lại data từ server trong background để đồng bộ
      setTimeout(() => {
        window.loadTransactions();
      }, 500);
      
      handleReset();
    } else {
      console.error("Lỗi từ server:", result.message);
      
      // Rollback - thêm lại giao dịch vào danh sách
      window.transactionList.splice(index, 0, removedTransaction);
      updateTable(window.transactionList, window.currentPage || 1, window.itemsPerPage || 10,
                 formatDate, editTransaction, window.deleteTransaction, viewTransaction);
      
      showResultModal(result.message || "Không thể xóa giao dịch!", false);
    }
  } catch (err) {
    console.error("Lỗi trong deleteTransaction:", err);
    
    // Rollback - thêm lại giao dịch vào danh sách
    window.transactionList.splice(index, 0, removedTransaction);
    updateTable(window.transactionList, window.currentPage || 1, window.itemsPerPage || 10,
               formatDate, editTransaction, window.deleteTransaction, viewTransaction);
    
    showResultModal(`Lỗi kết nối server: ${err.message}`, false);
  } finally {
    // Luôn mở khóa UI khi kết thúc
    uiBlocker.unblock();
  }
}
