export function viewExpenseRow(e) {
  const detailEl = document.getElementById("transactionDetailContent");
  detailEl.innerHTML = "";

  const fields = [
    { label: "Mã chi phí", value: e.expenseId },
    { label: "Ngày chi", value: e.date },
    { label: "Loại khoản chi", value: e.type },
    { label: "Danh mục", value: e.category },
    { label: "Sản phẩm/Dịch vụ", value: e.product },
    { label: "Gói", value: e.package },
    { label: "Tài khoản sử dụng", value: e.account },
    { label: "Số tiền", value: `${e.amount?.toLocaleString()} ${e.currency}` },
    { label: "Ngân hàng/Ví", value: e.bank },
    { label: "Thẻ/Tài khoản", value: e.card },
    { label: "Phương thức chi", value: e.recurring },
    { label: "Ngày tái tục", value: e.renew },
    { label: "Nhà cung cấp", value: e.supplier },
    { label: "Nguồn tiền", value: e.source },
    { label: "Trạng thái", value: e.status },
    { label: "Ghi chú", value: e.note || "" }
  ];

  fields.forEach(f => {
    const row = document.createElement("div");
    row.className = "detail-row";
    row.innerHTML = `
      <div class="detail-label">${f.label}:</div>
      <div class="detail-value">${f.value || "-"}</div>
    `;
    detailEl.appendChild(row);
  });

  document.getElementById("transactionDetailModal").style.display = "block";
}
