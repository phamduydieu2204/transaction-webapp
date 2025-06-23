// REFACTORED: renderExpenseStats.js now uses modular statistics system

import { getConstants } from './constants.js';
import { updateTotalDisplay } from './updateTotalDisplay.js';
import { fetchExpenseData, getCombinedStatistics } from './statisticsDataManager.js';
import { 
  normalizeDate, 
  calculateTotalExpenses, 
  groupExpensesByMonth,
  calculateFinancialAnalysis 
} from './statisticsCore.js';
import { renderMonthlySummaryTable } from './statisticsRenderer.js';

export async function renderExpenseStats() {
  // ✅ KIỂM TRA XEM CÓ ĐANG Ở TAB CHI PHÍ KHÔNG
  const currentTab = document.querySelector(".tab-button.active");
  const isChiPhiTab = currentTab && currentTab.dataset.tab === "tab-chi-phi";
  const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
  
  if (!isChiPhiTab && !isThongKeTab) {
    console.log("⏭️ Không ở tab chi phí/thống kê, bỏ qua render");
    return;
  }
  
  // ✅ SKIP THỐNG KÊ NẾU UI CONTROLLER ĐÃ XỬ LÝ
  if (isThongKeTab && window.statisticsUIControllerActive) {
    console.log("⏭️ Statistics UI Controller đang xử lý, bỏ qua renderExpenseStats");
    return;
  }
  
  // Nếu đang trong trạng thái tìm kiếm, sử dụng dữ liệu đã tìm
  if (window.isExpenseSearching && window.expenseList) {
    renderExpenseData(window.expenseList);
    return;
  }
  
  
  try {
    // ✅ Force refresh để lấy data mới nhất từ server
    const expenseData = await fetchExpenseData({ forceRefresh: true });
    
    window.expenseList = expenseData || [];
    window.isExpenseSearching = false;
    renderExpenseData(expenseData);
    
  } catch (err) {
    console.error("❌ Lỗi khi thống kê chi phí:", err);
    // Fallback to old method if new module fails
    await renderExpenseStatsLegacy();
  }
}

// ✅ LEGACY METHOD FOR BACKWARD COMPATIBILITY
async function renderExpenseStatsLegacy() {
  const { BACKEND_URL } = getConstants();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseStats" }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const result = await res.json();

    if (result.status === "success") {
      window.expenseList = result.data || [];
      window.isExpenseSearching = false;
      renderExpenseData(result.data);
    } else {
      console.error("❌ Lỗi từ server:", result.message);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("⚠️ Load expense data bị timeout sau 15 giây");
    } else {
      console.error("❌ Lỗi khi thống kê chi phí (legacy):", err);
    }
  }
}

function renderExpenseData(data) {
  
  // ✅ KIỂM TRA LẠI TAB HIỆN TẠI TRƯỚC KHI RENDER
  const currentTab = document.querySelector(".tab-button.active");
  const isChiPhiTab = currentTab && currentTab.dataset.tab === "tab-chi-phi";
  const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
  
  // ✅ SỬ DỤNG MODULE MỚI ĐỂ TÍNH TỔNG CHI PHÍ
  const today = new Date();
  const todayFormatted = normalizeDate(today);


  // ✅ SỬ DỤNG FUNCTION MỚI ĐỂ TÍNH TỔNG
  const totalExpenses = calculateTotalExpenses(data, {
    isSearching: window.isExpenseSearching === true,
    targetDate: window.isExpenseSearching ? null : todayFormatted,
    currency: "VND"

  const totalExpense = totalExpenses.VND || 0;

  // ✅ Lưu tổng chi phí vào biến global và cập nhật hiển thị
  window.totalExpense = totalExpense;

  // Không cần cập nhật hiển thị totals nữa - đã xóa

  // ✅ CHỈ RENDER BẢNG NẾU ĐANG Ở TAB TƯƠNG ỨNG
  if (isChiPhiTab) {
    renderExpenseTable(data, normalizeDate);
  }

  if (isThongKeTab) {
    renderExpenseSummaryModular(data);
  }
}

// ✅ SỬ DỤNG MODULE MỚI ĐỂ RENDER BẢNG THỐNG KÊ
function renderExpenseSummaryModular(data) {
  try {
    // Check if statistics tab is active before processing
    const currentTab = document.querySelector(".tab-button.active");
    const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
    
    if (!isThongKeTab) {
      console.log("⏭️ Not on statistics tab, skipping modular summary");
      return;
    }

    const summaryData = groupExpensesByMonth(data, {
      currency: "VND",
      sortBy: "month",
      sortOrder: "desc"

    renderMonthlySummaryTable(summaryData, {
      tableId: "monthlySummaryTable",
      showGrowthRate: false

    console.log("✅ Statistics summary rendered with new modules");
  } catch (error) {
    console.error("❌ Error rendering modular summary:", error);
    // Fallback to legacy method
    renderExpenseSummary(data, normalizeDate);
  }
}

// ✅ TÁCH RIÊNG HÀM RENDER BẢNG CHI PHÍ
function renderExpenseTable(data, formatDate) {
  const table1 = document.querySelector("#expenseListTable tbody");
  
  if (!table1) {
    console.error("❌ Không tìm thấy table #expenseListTable tbody");
    return;
  }

  // ✅ Cập nhật header theo yêu cầu mới
  const tableHead = document.querySelector("#expenseListTable thead tr");
  if (tableHead) {
    tableHead.innerHTML = `
      <th>Mã chi phí</th>
      <th>Ngày chi</th>
      <th>Loại kế toán</th>
      <th>Phân bổ</th>
      <th>Thông tin khoản chi</th>
      <th>Số tiền</th>
      <th>Chi tiết ngân hàng</th>
      <th>Ngày tái tục</th>
      <th>Người nhận/Nhà cung cấp</th>
      <th>Ghi chú</th>
      <th>Thao tác</th>
    `;
  }

  const today = new Date();

  // ✅ Sắp xếp chi phí mới nhất lên đầu (timestamp giảm dần)
  const sortedData = [...(data || [])].sort((a, b) => {
    const timestampA = (a.expenseId || "").replace(/[^0-9]/g, "");
    const timestampB = (b.expenseId || "").replace(/[^0-9]/g, "");
    return timestampB.localeCompare(timestampA);
  });

  // ✅ Logic phân trang
  const itemsPerPage = window.itemsPerPage || 50;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentPage = window.currentExpensePage || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedData.slice(startIndex, endIndex);

  table1.innerHTML = "";

  paginatedItems.forEach((e, index) => {
    const globalIndex = startIndex + index;
    const row = table1.insertRow();

    // ✅ Thêm style cho dòng đã hết hạn tái tục
    if (e.renewDate) {
      const parseDate = (str) => {
        const [y, m, d] = (str || "").split("/").map(Number);
        return new Date(y, m - 1, d);
      };
      const renewDate = parseDate(e.renewDate);
      if (renewDate < today) {
        row.classList.add("expired-row");
      }
    }

    // ✅ Thêm style màu vàng nhạt cho trạng thái "chưa thanh toán"
    if (e.status && e.status.toLowerCase().includes("chưa thanh toán")) {
      row.style.backgroundColor = "#fff9c4"; // Màu vàng nhạt
    }

    // ✅ CÁC CỘT THEO THỨ TỰ YÊU CẦU:
    // 1. Mã chi phí
    row.insertCell().textContent = e.expenseId || "";
    
    // 2. Ngày chi
    row.insertCell().textContent = formatDate(e.date);
    
    // 3. Loại kế toán
    row.insertCell().textContent = e.accountingType || "";
    
    // 4. Phân bổ (hiển thị với icon)
    const allocationCell = row.insertCell();
    if (e.periodicAllocation === "Có") {
      allocationCell.innerHTML = '<span style="color: #28a745;">✓ Có</span>';
    } else {
      allocationCell.innerHTML = '<span style="color: #6c757d;">✗ Không</span>';
    }
    
    // 5. Thông tin khoản chi (gộp 4 trường: type, category, product, package)
    const expenseInfoParts = [
      e.type || "",
      e.category || "",
      e.product || "",
      e.package || ""
    ].filter(part => part.trim() !== ""); // Loại bỏ các phần rỗng
    
    const expenseInfoCell = row.insertCell();
    expenseInfoCell.textContent = expenseInfoParts.join(" - ");
    
    // 6. Số tiền (với đơn vị tiền tệ)
    row.insertCell().textContent = `${(e.amount || 0).toLocaleString()} ${e.currency || ""}`;
    
    // 7. Chi tiết ngân hàng (gộp bank và card/account info)
    const bankDetailsParts = [
      e.bank || "",
      e.cardInfo || e.accountInfo || ""
    ].filter(part => part.trim() !== "");
    
    const bankDetailsCell = row.insertCell();
    bankDetailsCell.textContent = bankDetailsParts.join(" - ") || "--";
    
    // 8. Ngày tái tục
    row.insertCell().textContent = formatDate(e.renewDate);
    
    // 9. Người nhận/Nhà cung cấp
    row.insertCell().textContent = e.supplier || "--";
    
    // 10. Ghi chú
    row.insertCell().textContent = e.note || "";

    // 11. Thao tác
    const actionCell = row.insertCell();
    const select = document.createElement("select");
    select.className = "action-select";

    const actions = [
      { value: "", label: "-- Chọn --" },
      { value: "view", label: "Xem" },
      { value: "edit", label: "Sửa" },
      { value: "delete", label: "Xóa" }
    ];

    actions.forEach(action => {
      const opt = document.createElement("option");
      opt.value = action.value;
      opt.textContent = action.label;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      const selected = select.value;
      if (selected === "edit" && typeof window.editExpenseRow === "function") {
        window.editExpenseRow(e);
      } else if (selected === "delete" && typeof window.handleDeleteExpense === "function") {
        window.handleDeleteExpense(e.expenseId);
      } else if (selected === "view" && typeof window.viewExpenseRow === "function") {
        window.viewExpenseRow(e);
      }
      select.value = "";
    });

    actionCell.appendChild(select);
  });

  // ✅ Cập nhật phân trang (giống như code cũ)
  updateExpensePagination(totalPages, currentPage);
}

// ✅ TÁCH RIÊNG HÀM RENDER BẢNG THỐNG KÊ
function renderExpenseSummary(data, normalizeDate) {
  const table2 = document.querySelector("#monthlySummaryTable tbody");
  if (table2) {
    table2.innerHTML = "";

    const summaryMap = {};
    data.forEach(e => {
      if (e.currency === "VND") {
        const normalizedDate = normalizeDate(e.date);
        const month = normalizedDate.slice(0, 7); // yyyy/mm
        const key = `${month}|${e.type}`;
        summaryMap[key] = (summaryMap[key] || 0) + (parseFloat(e.amount) || 0);
      }
    });

    Object.entries(summaryMap).forEach(([key, value]) => {
      const [month, type] = key.split("|");
      const row = table2.insertRow();
      row.innerHTML = `
        <td>${month}</td>
        <td>${type}</td>
        <td>${value.toLocaleString()} VND</td>
      `;
    });
  }
}

// ✅ HÀM PHÂN TRANG ĐƠN GIẢN
function updateExpensePagination(totalPages, currentPage) {
  const pagination = document.getElementById("expensePagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  // Thêm nút "Tất cả" nếu đang trong trạng thái tìm kiếm
  if (window.isExpenseSearching) {
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tất cả";
    allBtn.style.marginRight = "10px";
    allBtn.style.backgroundColor = "#28a745";
    allBtn.addEventListener("click", () => {
      window.isExpenseSearching = false;
      window.currentExpensePage = 1;
      renderExpenseStats();
    });
    pagination.appendChild(allBtn);
  }

  if (totalPages <= 1) return;

  const refreshExpenseTable = () => renderExpenseStats();

  // Tạo các nút phân trang
  for (let i = 1; i <= Math.min(totalPages, 10); i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.onclick = () => {
      window.currentExpensePage = i;
      refreshExpenseTable();
    };
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pagination.appendChild(pageButton);
  }
}

// ✅ KHỞI TẠO STATISTICS UI CONTROLLER KHI MODULE ĐƯỢC LOAD
document.addEventListener('DOMContentLoaded', () => {
  // Lazy load UI controller to avoid circular imports
  import('./statisticsUIController.js').then(module => {
    if (module.initializeStatisticsUI) {
      module.initializeStatisticsUI();
    }
  }).catch(error => {
    console.warn("⚠️ Could not load statistics UI controller:", error);
  });
});