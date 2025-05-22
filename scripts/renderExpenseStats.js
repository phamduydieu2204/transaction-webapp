import { getConstants } from './constants.js';

export async function renderExpenseStats() {
  const { BACKEND_URL } = getConstants();
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseStats" })
    });
    const result = await res.json();

    const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    if (isNaN(d)) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
    };


    if (result.status !== "success") return;

    // Kiểm tra tab nào đang active
    const isChiPhiTab = document.getElementById("tab-chi-phi")?.classList.contains("active");
    const isThongKeTab = document.getElementById("tab-thong-ke")?.classList.contains("active");

    // 1. Nếu đang ở tab chi phí → hiển thị bảng danh sách chi tiết
    if (isChiPhiTab) {
    const table1 = document.querySelector("#expenseListTable tbody");
    const paginationContainer = document.getElementById("expensePagination");

    const allData = result.data || [];
    const itemsPerPage = 10;
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    const currentPage = window.currentExpensePage || 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = allData.slice(startIndex, startIndex + itemsPerPage);

    table1.innerHTML = "";

paginatedItems.forEach(e => {
  const row = table1.insertRow();

  const format = val => val || "";

  row.insertCell().textContent = formatDate(e.date);
  row.insertCell().textContent = format(e.type);
  row.insertCell().textContent = format(e.category);
  row.insertCell().textContent = format(e.product);
  row.insertCell().textContent = format(e.package);
  row.insertCell().textContent = e.amount?.toLocaleString() || "0";
  row.insertCell().textContent = format(e.currency);
  row.insertCell().textContent = format(e.bank);
  row.insertCell().textContent = format(e.card);
  row.insertCell().textContent = format(e.recurring);
  row.insertCell().textContent = formatDate(e.renew);
  row.insertCell().textContent = format(e.supplier);
  row.insertCell().textContent = format(e.source);
  row.insertCell().textContent = format(e.status);
  row.insertCell().textContent = format(e.note);

  const actionCell = row.insertCell();
  const select = document.createElement("select");
  select.className = "action-select";

  const actions = [
    { value: "", label: "-- Chọn --" },
    { value: "view", label: "Xem" },
    { value: "edit", label: "Sửa" },
    { value: "delete", label: "Xóa" }
  ];

  actions.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.value;
    opt.textContent = a.label;
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
    select.value = ""; // reset
  });

  actionCell.appendChild(select);
});



    // Cập nhật phân trang
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
        window.currentExpensePage = i;
        renderExpenseStats();
        });
        paginationContainer.appendChild(btn);
    }
    }


    // 2. Nếu đang ở tab thống kê → hiển thị bảng tổng hợp theo tháng
    if (isThongKeTab) {
      const table2 = document.querySelector("#monthlySummaryTable tbody");
      table2.innerHTML = "";

      const summaryMap = {};
      result.data.forEach(e => {
        if (e.currency === "VND") {
          const month = e.date?.slice(0, 7); // yyyy/mm
          const key = `${month}|${e.type}`;
          summaryMap[key] = (summaryMap[key] || 0) + e.amount;
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

  } catch (err) {
    console.error("Lỗi khi thống kê chi phí:", err);
  }
}
