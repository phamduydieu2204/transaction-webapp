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
    if (result.status !== "success") return;

    // Kiểm tra tab nào đang active
    const isChiPhiTab = document.getElementById("tab-chi-phi")?.classList.contains("active");
    const isThongKeTab = document.getElementById("tab-thong-ke")?.classList.contains("active");

    // 1. Nếu đang ở tab chi phí → hiển thị bảng danh sách chi tiết
    if (isChiPhiTab) {
      const table1 = document.querySelector("#expenseListTable tbody");
      table1.innerHTML = "";

      result.data.forEach(e => {
        const row = table1.insertRow();

        // Dữ liệu từng dòng chi phí
        row.innerHTML = `
          <td>${e.date}</td>
          <td>${e.type}</td>
          <td>${e.category}</td>
          <td>${e.product}</td>
          <td>${e.amount.toLocaleString()}</td>
          <td>${e.currency}</td>
          <td>${e.status}</td>
          <td>${e.note || ""}</td>
          <td>
            <select class="action-select">
              <option value="">-- Chọn --</option>
              <option value="edit">Sửa</option>
              <option value="delete">Xóa</option>
              <option value="view">Xem</option>
            </select>
          </td>
        `;

        // Gán sự kiện khi chọn hành động
        const actionSelect = row.querySelector(".action-select");
        actionSelect.addEventListener("change", () => {
          const selected = actionSelect.value;

          if (selected === "edit") {
            if (typeof window.editExpenseRow === "function") {
              window.editExpenseRow(e);
            } else {
              alert("⚠️ Chức năng sửa chưa được triển khai.");
            }
          } else if (selected === "delete") {
            if (typeof window.handleDeleteExpense === "function") {
              window.handleDeleteExpense(e.expenseId);
            } else {
              alert("⚠️ Chức năng xóa chưa được triển khai.");
            }
          } else if (selected === "view") {
            if (typeof window.viewExpenseRow === "function") {
                window.viewExpenseRow(e);
            } else {
                alert("⚠️ Chức năng xem chưa được triển khai.");
            }
            }
          actionSelect.value = ""; // reset lại chọn
        });
      });
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
