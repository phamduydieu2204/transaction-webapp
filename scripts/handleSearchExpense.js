import { getConstants } from './constants.js';
  };
  });
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    closeProcessingModal();
    
    if (result.status === "success") {
      window.expenseList = result.data || [];
      window.currentExpensePage = 1;
      window.isExpenseSearching = hasConditions; // Chỉ đánh dấu là đang tìm kiếm nếu có điều kiện
      
      // Cập nhật table ngay lập tức
      if (typeof window.updateExpenseTable === 'function') {
        window.updateExpenseTable();
      }
      
      // Gọi renderExpenseStats để hiển thị kết quả
      renderExpenseStats();
      
      // Thông báo khác nhau tùy theo có điều kiện tìm kiếm hay không
      if (hasConditions) {
        showResultModal(`Tìm kiếm thành công! Tìm thấy ${result.data.length} chi phí phù hợp.`, true);
      } else {
        showResultModal(`Đã tải ${result.data.length} chi phí.`, true);
      }
    } else {
      showResultModal(result.message || "Không thể tìm kiếm chi phí!", false);
    }
  } catch (err) {
    console.error("Lỗi khi tìm kiếm chi phí", err);
    showResultModal(`Lỗi khi tìm kiếm chi phí: ${err.message}`, false);
  }
}