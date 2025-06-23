import { getConstants } from './constants.js';
  if (!userInfo) {
    console.error("❌ Không có thông tin user");
    window.showResultModal("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.", false);
    return;
  }

  // Tìm giao dịch đang chỉnh sửa
  const transactionList = window.transactionList || [];
  const transaction = transactionList.find(t => t.transactionId === currentEditTransactionId);
  
  if (!transaction) {
    console.error("❌ Không tìm thấy giao dịch:", currentEditTransactionId);
  };

  for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
    const element = document.getElementById(fieldId);
    if (!element) {
      console.error(`❌ Không tìm thấy element với id: ${fieldId}`);
      continue;
    }
    
    const value = element.value;
    
    // Kiểm tra đặc biệt cho các trường số
    if (fieldId === 'revenue' || fieldId === 'duration') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        window.showResultModal(`${fieldName} không hợp lệ. Vui lòng kiểm tra lại`, false);
        element.focus();
        return;
      }
    } else {
      // Kiểm tra các trường text/select
      if (!value || value.trim() === "" || value === "0") {
        window.showResultModal(`${fieldName} không được để trống. Vui lòng kiểm tra lại`, false);
        element.focus();
        return;
      }
    }
  }

  // Hiển thị processing modal
  if (typeof window.showProcessingModal === 'function') {
    window.showProcessingModal("Đang cập nhật giao dịch...");
  } else {
    console.warn('⚠️ showProcessingModal not available, loading function...');
    // Dynamically load the function if not available
    import('./showProcessingModal.js').then(({ showProcessingModal }) => {
      window.showProcessingModal = showProcessingModal;
      showProcessingModal("Đang cập nhật giao dịch...");
    }).catch(err => {
      console.error('❌ Failed to load showProcessingModal:', err);
    });
  }
  
  // Chuẩn bị dữ liệu gửi lên server
  };
  });
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.status === "success") {
      // Reset currentEditTransactionId
      window.currentEditTransactionId = null;
      updateState({ currentEditTransactionId: null });
      
      // Reset form
      if (window.handleReset) {
        window.handleReset();
      }
      
      // Clear cache để đảm bảo load data mới
      cacheManager.clearTransactionCaches();
      
      // Reload transactions
      if (window.loadTransactions) {
        await window.loadTransactions();
      }

      // Close processing modal
      if (typeof window.closeProcessingModal === 'function') {
        window.closeProcessingModal();
      }
      
      if (typeof window.showResultModal === 'function') {
        window.showResultModal("Giao dịch đã được cập nhật thành công!", true);
      } else {
        alert("Giao dịch đã được cập nhật thành công!");
      }
    } else {
      console.error("❌ Lỗi từ server:", result.message);
      
      // Close processing modal
      if (typeof window.closeProcessingModal === 'function') {
        window.closeProcessingModal();
      }
      
      if (typeof window.showResultModal === 'function') {
        window.showResultModal(result.message || "Không thể cập nhật giao dịch!", false);
      } else {
        alert(result.message || "Không thể cập nhật giao dịch!");
      }
    }
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật:", err);
    
    // Close processing modal
    if (typeof window.closeProcessingModal === 'function') {
      window.closeProcessingModal();
    }
    
    if (typeof window.showResultModal === 'function') {
      window.showResultModal(`Lỗi kết nối server: ${err.message}`, false);
    } else {
      alert(`Lỗi kết nối server: ${err.message}`);
    }
  }
}