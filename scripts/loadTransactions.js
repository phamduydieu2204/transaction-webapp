// CÁCH 2: Cải thiện hàm loadTransactions trong file loadTransactions.js

import { apiRequestJson } from './apiClient.js';
import { deduplicateRequest } from './core/requestOptimizer.js';
import { getConstants } from './constants.js';

/**
 * Optimized transaction loading with pagination support
 */
export async function loadTransactionsOptimized(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction, options = {}) {
  const {
    page = 1,
    limit = 25,
    useCache = true,
    showProgress = true
  } = options;

  // ✅ Kiểm tra cache trước
  if (useCache && window.transactionCache && window.transactionCache.page === page && window.transactionCache.limit === limit) {
    updateTable(window.transactionCache.data, page, limit, formatDate, editTransaction, deleteTransaction, viewTransaction);
    return { status: "success", data: window.transactionCache.data, cached: true };
  }

  // ✅ Kiểm tra nhanh userInfo trước khi gọi API
  if (!userInfo) {
    return { status: "error", message: "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại." };
  }
  
  const data = {
    action: "getTransactions",
    maNhanVien: userInfo.maNhanVien,
    vaiTro: userInfo.vaiTro ? userInfo.vaiTro.toLowerCase() : "",
    giaoDichNhinThay: userInfo.giaoDichNhinThay || "",
    nhinThayGiaoDichCuaAi: userInfo.nhinThayGiaoDichCuaAi || "",
    // Add pagination parameters (backend needs to support these)
    page: page,
    limit: limit,
    optimized: true
  };

  try {
    if (showProgress) {
      // Show minimal loading indicator
      const tableBody = document.querySelector('#transactionTable tbody');
      if (tableBody && page === 1) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center">🔄 Đang tải...</td></tr>';
      }
    }

    // Use request deduplication for transactions
    const requestKey = `transactions-${userInfo.maNhanVien}-page${page}-limit${limit}`;
    const result = await deduplicateRequest(
      requestKey,
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

        try {
          // Create a custom fetch with timeout since apiRequestJson doesn't support signal
          const response = await Promise.race([
            apiRequestJson(data),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
          ]);

          clearTimeout(timeoutId);

          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      { cacheDuration: 2 * 60 * 1000, forceRefresh: !useCache } // 2 minutes cache
    );
    
    if (result.status === "success") {
      const transactions = result.data || [];
      
      // ✅ Cache the result for faster subsequent access
      if (useCache) {
        window.transactionCache = {
          data: transactions,
          page: page,
          limit: limit,
          timestamp: Date.now()
        };
      }

      if (page === 1) {
        // For ultra-fast performance, only keep the requested page
        window.transactionList = transactions;
        window.currentPage = 1;
        window.totalTransactionCount = result.total || transactions.length;
      } else {
        // For subsequent pages, replace data instead of appending
        window.transactionList = transactions;
        window.currentPage = page;
      }
      
      // ✅ Sort transactions by timestamp (newest first)
      window.transactionList.sort((a, b) => {
        const timestampA = (a.transactionId || "").replace(/[^0-9]/g, "");
        const timestampB = (b.transactionId || "").replace(/[^0-9]/g, "");
        return timestampB.localeCompare(timestampA);
      });

      // ✅ Update table only if on transaction tab
      const activeTab = document.querySelector(".tab-content.active");
      const isTransactionTabActive = activeTab && activeTab.id === "tab-giao-dich";
      
      if (isTransactionTabActive || page === 1) {
        updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
      }

      return { status: "success", data: transactions, page: page, total: result.total || transactions.length };
      
    } else {
      const errorMsg = result.message || "Không thể tải danh sách giao dịch!";
      return { status: "error", message: errorMsg };
    }
    
  } catch (err) {
    if (err.name === 'AbortError') {
      return { status: "error", message: "Tải dữ liệu quá lâu, vui lòng thử lại" };
    }
    
    const errorMsg = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    return { status: "error", message: errorMsg };
  }
}

export async function loadTransactions(userInfo, updateTable, formatDate, editTransaction, deleteTransaction, viewTransaction) {
  // ✅ Kiểm tra nhanh userInfo trước khi gọi API
  if (!userInfo) {
    return { status: "error", message: "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại." };
  }
  
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
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 giây timeout

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
      
      
      // ✅ ALWAYS UPDATE TABLE IF WE HAVE TRANSACTION DATA
      if (window.transactionList && window.transactionList.length >= 0) {
        updateTable(window.transactionList, window.currentPage, window.itemsPerPage, formatDate, editTransaction, deleteTransaction, viewTransaction);
      }

      return { status: "success", data: window.transactionList };
      
    } else {
      const errorMsg = result.message || "Không thể tải danh sách giao dịch!";
      
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
      return { status: "error", message: "Tải dữ liệu quá lâu, vui lòng thử lại" };
    }
    
    const errorMsg = `Lỗi khi tải danh sách giao dịch: ${err.message}`;
    
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