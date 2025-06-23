import { getConstants } from './constants.js';
      conditions: {} // Empty conditions = get all expenses
    };
  });
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    
    if (result.status === "success") {
      window.expenseList = result.data || [];
      
      // Update table with fresh data
      if (typeof window.updateExpenseTable === 'function') {
        window.updateExpenseTable();
      }
    } else {
      console.warn("⚠️ Failed to reload expense data:", result.message);
    }
  } catch (error) {
    console.error("❌ Error reloading expense data:", error);
  }
}
  };
  
  // Determine accounting type
    expenseId: getValue("expenseId"), // ✅ Bạn cần có 1 input ẩn hoặc field nào chứa mã chi phí gốc để cập nhật
    accountingType: accountingType, // New field
  };
  });
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    closeProcessingModal();
    
    if (result.status === "success") {
      showResultModal("Đã cập nhật chi phí thành công!", true);
      document.getElementById("expenseForm").reset();
      
      // Set default values after reset
      document.getElementById("expenseDate").value = window.todayFormatted;
      document.getElementById("expenseRecorder").value = window.userInfo?.tenNhanVien || "";
      document.getElementById("expenseCurrency").value = "VND";
      document.getElementById("expenseRecurring").value = "Chi một lần";
      document.getElementById("expenseStatus").value = "Đã thanh toán";
      
      // ✅ Clear cache và reload expense data
      cacheManager.clearExpenseCaches();
      await renderExpenseStats();
    } else {
      showResultModal(`Không thể cập nhật chi phí: ${result.message}`, false);
    }
  } catch (err) {
    closeProcessingModal();
    showResultModal(`Lỗi kết nối: ${err.message}`, false);
  }
}
