import { getConstants } from './constants.js';
    // Loại kế toán sẽ được tự động xác định ở backend dựa vào danh mục
  };
  });
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    // Không cần closeProcessingModal vì dùng uiBlocker
    
    if (result.status === "success") {
      showResultModal(`Chi phí đã được lưu! Mã chi phí: ${result.chiPhiId}`, true);
      document.getElementById("expenseForm").reset();
      
      // Set default values after reset
      document.getElementById("expenseDate").value = window.todayFormatted;
      document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
      document.getElementById("expenseCurrency").value = "VND";
      document.getElementById("expenseRecurring").value = "Chi một lần";
      document.getElementById("expenseStatus").value = "Đã thanh toán";
      
      // ✅ Clear cache để đảm bảo lấy data mới nhất
      cacheManager.clearExpenseCaches();
      
      // ✅ Refresh danh sách chi phí từ server để lấy data mới nhất
      await renderExpenseStats();
      
      // ✅ Sau khi có data mới, refresh table
      refreshExpenseTable();
    } else {
      showResultModal(`Không thể lưu chi phí: ${result.message}`, false);
    }
  } catch (err) {
    // Không cần closeProcessingModal vì dùng uiBlocker
    showResultModal(`Lỗi khi gửi dữ liệu: ${err.message}`, false);
  } finally {
    // Luôn mở khóa UI khi kết thúc
    uiBlocker.unblock();
  }
}