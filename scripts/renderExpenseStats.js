// CÁCH 3: Cải thiện renderExpenseStats trong file renderExpenseStats.js

import { getConstants } from './constants.js';
import { updateTotalDisplay } from './updateTotalDisplay.js';

export async function renderExpenseStats() {
  const { BACKEND_URL } = getConstants();
  
  // ✅ KIỂM TRA XEM CÓ ĐANG Ở TAB CHI PHÍ KHÔNG
  const currentTab = document.querySelector(".tab-button.active");
  const isChiPhiTab = currentTab && currentTab.dataset.tab === "tab-chi-phi";
  const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
  
  if (!isChiPhiTab && !isThongKeTab) {
    console.log("⏭️ Không ở tab chi phí/thống kê, bỏ qua render");
    return;
  }
  
  // Nếu đang trong trạng thái tìm kiếm, sử dụng dữ liệu đã tìm
  if (window.isExpenseSearching && window.expenseList) {
    renderExpenseData(window.expenseList);
    return;
  }
  
  console.log("🔄 Bắt đầu load expense data...");
  
  try {
    // ✅ SỬ DỤNG TIMEOUT ĐỂ TRÁNH BLOCK UI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
    
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
      console.log("✅ Load expense data thành công:", result.data.length, "chi phí");
    } else {
      console.error("❌ Lỗi từ server:", result.message);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn("⚠️ Load expense data bị timeout sau 15 giây");
    } else {
      console.error("❌ Lỗi khi thống kê chi phí:", err);
    }
  }
}

function renderExpenseData(data) {
  console.log("🔍 DEBUG: Dữ liệu chi phí nhận được:", data);
  
  // ✅ KIỂM TRA LẠI TAB HIỆN TẠI TRƯỚC KHI RENDER
  const currentTab = document.querySelector(".tab-button.active");
  const isChiPhiTab = currentTab && currentTab.dataset.tab === "tab-chi-phi";
  const isThongKeTab = currentTab && currentTab.dataset.tab === "tab-thong-ke";
  
  // ✅ Hàm chuẩn hóa ngày từ nhiều format khác nhau
  const normalizeDate = (dateInput) => {
    if (!dateInput) return "";
    
    let date;
    if (typeof dateInput === 'string') {
      // Nếu là ISO string như "2025-05-21T17:00:00.000Z"
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } 
      // Nếu là format "2025/05/23"
      else if (dateInput.includes('/')) {
        const [y, m, d] = dateInput.split('/');
        date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      }
      // Các format khác
      else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return "";
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const formatDate = (isoStr) => {
    return normalizeDate(isoStr);
  };

  // ✅ TÍNH TỔNG CHI PHÍ (logic giống như tính tổng doanh thu)
  let totalExpense = 0;
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  console.log("📌 BẮT ĐẦU TÍNH TỔNG CHI PHÍ");
  console.log("🟢 Vai trò:", window.userInfo?.vaiTro);
  console.log("🟢 isExpenseSearching:", window.isExpenseSearching);
  console.log("🟢 todayFormatted:", todayFormatted);
  console.log("🟢 Số lượng bản ghi chi phí:", data?.length);

  // Logic tính tổng giống như doanh thu
  if (window.isExpenseSearching === true) {
    // Nếu đang tìm kiếm, tính tổng tất cả kết quả tìm kiếm (chỉ VND)
    totalExpense = data.reduce((sum, e) => {
      console.log("🔍 Chi phí tìm kiếm:", e.amount, e.currency);
      if (e.currency === "VND") {
        return sum + (parseFloat(e.amount) || 0);
      }
      return sum;
    }, 0);
    console.log("🔍 Đang tìm kiếm - Tổng chi phí tìm kiếm:", totalExpense);
  } else {
    // Nếu không tìm kiếm, chỉ tính chi phí hôm nay (chỉ VND)
    totalExpense = data.reduce((sum, e) => {
      // ✅ Chuẩn hóa ngày từ server về format yyyy/mm/dd
      const normalizedDate = normalizeDate(e.date);
      const isToday = normalizedDate === todayFormatted;
      
      console.log("📅 Chi phí hôm nay check:", {
        originalDate: e.date,
        normalizedDate: normalizedDate,
        todayFormatted: todayFormatted,
        isToday: isToday,
        currency: e.currency,
        amount: e.amount
      });
      
      if (isToday && e.currency === "VND") {
        const amount = parseFloat(e.amount) || 0;
        console.log("✅ Thêm vào tổng:", amount);
        return sum + amount;
      }
      return sum;
    }, 0);
    console.log("📅 Không tìm kiếm - Tổng chi phí hôm nay:", totalExpense);
  }

  // ✅ Lưu tổng chi phí vào biến global và cập nhật hiển thị
  window.totalExpense = totalExpense;
  console.log("✅ Đã lưu totalExpense:", totalExpense);

  // Gọi hàm cập nhật hiển thị tổng số
  if (typeof updateTotalDisplay === 'function') {
    updateTotalDisplay();
  } else if (typeof window.updateTotalDisplay === 'function') {
    window.updateTotalDisplay();
  }

  // ✅ CHỈ RENDER BẢNG NẾU ĐANG Ở TAB TƯƠNG ỨNG
  if (isChiPhiTab) {
    renderExpenseTable(data, formatDate);
  }

  if (isThongKeTab) {
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
    if (e.renew) {
      const parseDate = (str) => {
        const [y, m, d] = (str || "").split("/").map(Number);
        return new Date(y, m - 1, d);
      };
      const renewDate = parseDate(e.renew);
      if (renewDate < today) {
        row.classList.add("expired-row");
      }
    }

    // ✅ HIỂN THỊ CÁC CELL - GỘP 4 CỘT THÀNH 1
    row.insertCell().textContent = e.expenseId || "";
    row.insertCell().textContent = formatDate(e.date);
    
    // ✅ Gộp thông tin khoản chi
    const thongTinKhoanChi = [
      e.type || "",
      e.category || "", 
      e.product || "",
      e.package || ""
    ].filter(item => item.trim() !== "").join(" - ");
    
    row.insertCell().textContent = thongTinKhoanChi;
    row.insertCell().textContent = `${(e.amount || 0).toLocaleString()} ${e.currency || ""}`;
    row.insertCell().textContent = formatDate(e.renew);
    row.insertCell().textContent = e.status || "";

    // ✅ Action dropdown
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