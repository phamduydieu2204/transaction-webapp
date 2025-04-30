// viewTransaction.js

import { closeModal } from './closeModal.js';

export function viewTransaction(index, transactionList, formatDate, copyToClipboard) {
  const transaction = transactionList[index];
  const modal = document.getElementById("transactionDetailModal");
  const detailContent = document.getElementById("transactionDetailContent");

  if (!modal || !detailContent) {
    console.error("Không tìm thấy modal hoặc nội dung chi tiết");
    return;
  }

  detailContent.innerHTML = "";

  const fields = [
    { label: "Mã giao dịch", value: transaction.transactionId, showCopy: true },
    { label: "Ngày giao dịch", value: formatDate(transaction.transactionDate), showCopy: false },
    { label: "Loại giao dịch", value: transaction.transactionType, showCopy: false },
    { label: "Tên khách hàng", value: transaction.customerName, showCopy: false },
    { label: "Email", value: transaction.customerEmail, showCopy: true },
    { label: "Liên hệ", value: transaction.customerPhone, showCopy: true },
    { label: "Số tháng đăng ký", value: transaction.duration, showCopy: false },
    { label: "Ngày bắt đầu", value: formatDate(transaction.startDate), showCopy: false },
    { label: "Ngày kết thúc", value: formatDate(transaction.endDate), showCopy: false },
    { label: "Số thiết bị", value: transaction.deviceCount, showCopy: false },
    { label: "Tên phần mềm", value: transaction.softwareName, showCopy: false },
    { label: "Gói phần mềm", value: transaction.softwarePackage, showCopy: false },
    { label: "Tên tài khoản", value: transaction.accountName || "", showCopy: false },
    { label: "ID Sheet Tài Khoản", value: transaction.accountSheetId || "", showCopy: false },
    { label: "Thông tin đơn hàng", value: transaction.orderInfo || "", showCopy: true },
    { label: "Doanh thu", value: transaction.revenue, showCopy: false },
    { label: "Ghi chú", value: transaction.note, showCopy: false },
    { label: "Tên nhân viên", value: transaction.tenNhanVien, showCopy: false },
    { label: "Mã nhân viên", value: transaction.maNhanVien, showCopy: false }
  ];

  fields.forEach(field => {
    const row = document.createElement("div");
    row.className = "detail-row";
  
    const labelEl = document.createElement("span");
    labelEl.className = "detail-label";
    labelEl.textContent = `${field.label}:`;
  
    const valueEl = document.createElement("span");
    valueEl.className = "detail-value";
    valueEl.textContent = field.value;  // 👉 dùng textContent để giữ \n xuống dòng
  
    row.appendChild(labelEl);
    row.appendChild(valueEl);
  
    if (field.showCopy) {
      const copyIcon = document.createElement("i");
      copyIcon.className = "fas fa-copy copy-icon";
      copyIcon.addEventListener("click", () => copyToClipboard(field.value, copyIcon));
      row.appendChild(copyIcon);
    }
  
    detailContent.appendChild(row);
  });
  

  modal.style.display = "block";

  // Xử lý click ra ngoài để đóng modal
  modal.addEventListener("click", function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Gán luôn sự kiện cho nút X nếu chưa có
  const closeButton = modal.querySelector(".close");
  if (closeButton) {
    closeButton.onclick = () => closeModal();
  }
}
