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

    const table1 = document.querySelector("#expenseStatsTable tbody");
    const table2 = document.querySelector("#monthlySummaryTable tbody");
    table1.innerHTML = "";
    table2.innerHTML = "";

    const summaryMap = {};

    result.data.forEach(e => {
      // Chi tiết bảng 1
      const row = table1.insertRow();
      row.innerHTML = `
        <td>${e.date}</td>
        <td>${e.type}</td>
        <td>${e.category}</td>
        <td>${e.product}</td>
        <td>${e.amount.toLocaleString()}</td>
        <td>${e.currency}</td>
        <td>${e.source}</td>
        <td>${e.status}</td>
      `;

      // Tổng hợp bảng 2
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
  } catch (err) {
    console.error("Lỗi khi thống kê chi phí:", err);
  }
}
