// CÁCH 2: Cải thiện hàm loadTransactions trong file loadTransactions.js

import { getConstants } from './constants.js';

export async function loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  // ✅ Kiểm tra nhanh userInfo trước khi gọi API
  if (!userInfo) {
    console.warn("⚠️ Không có thông tin user, bỏ qua load transactions");
    return { status: "error", message: "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại." };
  }

  console.log("🔄 Bắt đầu load transactions...");
  
  const { BACKEND_URL } = getConstants();
  const data = {
    action: "getTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro ? userInfo.vaiTro.toLowerCase() : "",
    giaoDichNhinThay: userInfo.giaoDichNhinThay || "",
    nhinThayGiaoDichCuaAi: userInfo.nhinThayGiaoDichCuaAi || ""
  };

  try {
    // ✅ SỬ DỤNG TIMEOUT ĐỂ TRÁNH BLOCK UI QUÁ LÂU
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 giây timeout

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    window.isSearching = false;
    
    if (result.status === "success") {
      window.transactionList = result.data || [];

      // ✅ Sắp xếp giao dịch mới nhất lên đầu (timestamp giảm dần)
      window.transactionList.sort((a, b) => {
        const timestampA = (a.transactionId || "").replace(/[^0-9]/g, "");
        const timestampB = (b.transactionId || "").replace(/[^0-9]/g, "");
        return timestampB.localeCompare(timestampA);
      });

      window.currentPage = 1;
      
      // ✅ UPDATE TABLE IF ON TRANSACTION TAB OR IF DATA HAS CHANGED
      const activeTab = document.querySelector(".tab-content.active");
      const activeTabButton = document.querySelector(".tab-button.active");
      const isTransactionTabActive = (activeTab && activeTab.id === "tab-giao-dich") || 
                                   (activeTabButton && activeTabButton.dataset.tab === "tab-giao-dich");
      
      console.log("🔍 Tab check:", {
        activeTabId: activeTab ? activeTab.id : "none",
        activeTabButtonData: activeTabButton ? activeTabButton.dataset.tab : "none",
        isTransactionTabActive,
        willUpdateTable: isTransactionTabActive
      });
      
      // ✅ ALWAYS UPDATE TABLE IF WE HAVE TRANSACTION DATA
      if (window.transactionList && window.transactionList.length >= 0) {
        console.log("🔄 Updating transaction table with", window.transactionList.length, "transactions");
        updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
      } else {
        console.log("ℹ️ No transaction data to update");
      }

      console.log("✅ Load transactions thành công:", window.transactionList.length, "giao dịch");
      return { status: "success", data: window.transactionList };
      
    } else {
      const errorMsg = result.message || "Không thể tải danh sách giao dịch!";
      console.error("❌ Lỗi từ server:", errorMsg);
      
      // ✅ CHỈ HIỂN THỊ LỖI NẾU ĐANG Ở TAB GIAO DỊCH
      const currentTab = document.querySelector(".tab-button.active");
      if (currentTab && currentTab.dataset.tab === "tab-giao-dich") {
        const errorElement = document.getElementById("errorMessage");
        if (errorElement) {
          errorElement.textContent = errorMsg;
        }
      }
      
      return { status: "error", message: errorMsg };
    }
    
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("⚠️ Load transactions bị timeout sau 30 giây");
      return { status: "error", message: "Tải dữ liệu quá lâu, vui lòng thử lại" };
    }
    
    const errorMsg = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    console.error("❌", errorMsg);
    
    // ✅ CHỈ HIỂN THỊ LỖI NẾU ĐANG Ở TAB GIAO DỊCH
    const currentTab = document.querySelector(".tab-button.active");
    if (currentTab && currentTab.dataset.tab === "tab-giao-dich") {
      const errorElement = document.getElementById("errorMessage");
      if (errorElement) {
        errorElement.textContent = errorMsg;
      }
    }
    
    return { status: "error", message: errorMsg };
  }
}