import { getConstants } from './constants.js';
import { updateTotalDisplay } from './updateTotalDisplay.js';

export async function renderExpenseStats() {
  const { BACKEND_URL } = getConstants();
  
  // Nếu đang trong trạng thái tìm kiếm, sử dụng dữ liệu đã tìm
  if (window.isExpenseSearching && window.expenseList) {
    renderExpenseData(window.expenseList);
    return;
  }
  
  // Nếu không, lấy toàn bộ dữ liệu
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseStats" })
    });
    const result = await res.json();

    if (result.status === "success") {
      window.expenseList = result.data || [];
      window.isExpenseSearching = false;
      renderExpenseData(result.data);
    }
  } catch (err) {
    console.error("Lỗi khi thống kê chi phí:", err);
  }
}

function renderExpenseData(data) {
  console.log("🔍 DEBUG: Dữ liệu chi phí nhận được:", data);
  
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

  // Kiểm tra tab nào đang active
  const isChiPhiTab = document.getElementById("tab-chi-phi")?.classList.contains("active");
  const isThongKeTab = document.getElementById("tab-thong-ke")?.classList.contains("active");

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

  // ✅ Hiển thị bảng chi phí (nếu đang ở tab chi phí) - LOGIC GIỐNG TAB GIAO DỊCH
  if (isChiPhiTab) {
    const table1 = document.querySelector("#expenseListTable tbody");

    if (!table1) {
      console.error("❌ Không tìm thấy table #expenseListTable tbody");
      return;
    }

    // ✅ Sắp xếp chi phí mới nhất lên đầu (timestamp giảm dần) - với fallback
    let sortedData;
    try {
      sortedData = typeof sortByTimestampDesc === 'function' 
        ? sortByTimestampDesc(data || [], 'expenseId')
        : [...(data || [])].sort((a, b) => {
            const timestampA = (a.expenseId || "").replace(/[^0-9]/g, "");
            const timestampB = (b.expenseId || "").replace(/[^0-9]/g, "");
            return timestampB.localeCompare(timestampA);
          });
    } catch (err) {
      console.warn("Fallback sorting:", err);
      sortedData = [...(data || [])];
    }

    // ✅ Logic phân trang giống tab giao dịch
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

      // ✅ Thêm style cho dòng đã hết hạn tái tục (giống giao dịch hết hạn)
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

      row.insertCell().textContent = e.expenseId || "";
      row.insertCell().textContent = formatDate(e.date);
      row.insertCell().textContent = e.type || "";
      row.insertCell().textContent = e.category || "";
      row.insertCell().textContent = e.product || "";
      row.insertCell().textContent = e.package || "";
      row.insertCell().textContent = `${(e.amount || 0).toLocaleString()} ${e.currency || ""}`;
      row.insertCell().textContent = formatDate(e.renew);
      row.insertCell().textContent = e.status || "";

      // ✅ Action dropdown giống giao dịch
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

    // ✅ Cập nhật phân trang giống tab giao dịch
    const refreshExpenseTable = () => renderExpenseStats();
    
    // Inline pagination function để tránh import error
    const updateExpensePagination = (totalPages, currentPage, firstPage, prevPage, nextPage, lastPage, goToPage) => {
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

      const firstButton = document.createElement("button");
      firstButton.textContent = "«";
      firstButton.onclick = firstPage;
      firstButton.disabled = currentPage === 1;
      pagination.appendChild(firstButton);

      const prevButton = document.createElement("button");
      prevButton.textContent = "‹";
      prevButton.onclick = prevPage;
      prevButton.disabled = currentPage === 1;
      pagination.appendChild(prevButton);

      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.padding = "4px 8px";
        pagination.appendChild(dots);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pagination.appendChild(pageButton);
      }

      if (endPage < totalPages) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.padding = "4px 8px";
        pagination.appendChild(dots);
      }

      const nextButton = document.createElement("button");
      nextButton.textContent = "›";
      nextButton.onclick = nextPage;
      nextButton.disabled = currentPage === totalPages;
      pagination.appendChild(nextButton);

      const lastButton = document.createElement("button");
      lastButton.textContent = "»";
      lastButton.onclick = lastPage;
      lastButton.disabled = currentPage === totalPages;
      pagination.appendChild(lastButton);
    };
    
    updateExpensePagination(
      totalPages,
      window.currentExpensePage || 1,
      () => { window.currentExpensePage = 1; refreshExpenseTable(); },
      () => { if (window.currentExpensePage > 1) { window.currentExpensePage--; refreshExpenseTable(); } },
      () => { if (window.currentExpensePage < totalPages) { window.currentExpensePage++; refreshExpenseTable(); } },
      () => { window.currentExpensePage = totalPages; refreshExpenseTable(); },
      (page) => { window.currentExpensePage = page; refreshExpenseTable(); }
    );
  }

  // ✅ Hiển thị bảng thống kê (nếu đang ở tab thống kê)
  if (isThongKeTab) {
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
}