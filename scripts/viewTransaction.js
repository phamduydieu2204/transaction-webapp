// viewTransaction.js

import { closeModal } from './closeModal.js';
import { getConstants } from './constants.js';

export async function viewTransaction(index, transactionList, formatDate, copyToClipboard) {
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
    {
      label: "Liên hệ",
      value: transaction.customerPhone,
      showCopy: true,
      showExternalLink: true
    },
    { label: "Số tháng đăng ký", value: transaction.duration, showCopy: false },
    { label: "Ngày bắt đầu", value: formatDate(transaction.startDate), showCopy: false },
    { label: "Ngày kết thúc", value: formatDate(transaction.endDate), showCopy: false },
    { label: "Số thiết bị", value: transaction.deviceCount, showCopy: false },
    { label: "Tên phần mềm", value: transaction.softwareName, showCopy: false },
    { label: "Gói phần mềm", value: transaction.softwarePackage, showCopy: false },
    { label: "Tên tài khoản", value: transaction.accountName || "", showCopy: false },
    { label: "ID Sheet Tài Khoản", value: transaction.accountSheetId || "", showCopy: false, showLink: true },
    { label: "Thông tin đơn hàng", value: transaction.orderInfo || "", showCopy: true },
    { label: "Doanh thu", value: transaction.revenue, showCopy: false },
    { label: "Ghi chú", value: transaction.note, showCopy: false },
    { label: "Tên nhân viên", value: transaction.tenNhanVien, showCopy: false },
    { label: "Mã nhân viên", value: transaction.maNhanVien, showCopy: false }
  ];

  try {
    const { BACKEND_URL } = getConstants();
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getAccountInfoBySoftware",
        softwareName: transaction.softwareName,
        softwarePackage: transaction.softwarePackage,
        accountName: transaction.accountName
      })      
    });
    const result = await res.json();
    if (result.status === "success") {
      fields.push({ label: "Tên đăng nhập", value: result.username || "", showCopy: true });
      fields.push({ label: "Mật khẩu đăng nhập", value: result.password || "", showCopy: true });
      fields.push({ label: "Secret", value: result.secret || "", showCopy: true });
    } else {
      console.warn("Không thể lấy thông tin tài khoản:", result.message);
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản từ PhanMem:", error);
  }

  fields.forEach(field => {
    const row = document.createElement("div");
    row.className = "detail-row";

    const labelEl = document.createElement("span");
    labelEl.className = "detail-label";
    labelEl.textContent = `${field.label}:`;

    const valueWrapper = document.createElement("div");
    valueWrapper.style.display = "flex";
    valueWrapper.style.flex = "1";
    valueWrapper.style.justifyContent = "space-between";
    valueWrapper.style.alignItems = "center";

    const valueEl = document.createElement("span");
    valueEl.className = "detail-value";
    valueEl.style.whiteSpace = field.label === "Liên hệ" ? "nowrap" : "pre-line";
    valueEl.style.overflow = field.label === "Liên hệ" ? "hidden" : "visible";
    valueEl.style.textOverflow = field.label === "Liên hệ" ? "ellipsis" : "unset";
    valueEl.style.display = field.label === "Liên hệ" ? "inline-block" : "block";
    valueEl.style.maxWidth = field.label === "Liên hệ" ? "300px" : "100%";

    if (field.showLink && field.value) {
      const sheetLink = document.createElement("a");
      sheetLink.href = `https://docs.google.com/spreadsheets/d/${field.value}`;
      sheetLink.target = "_blank";
      sheetLink.style.marginRight = "12px";
      sheetLink.innerHTML = `<i class="fas fa-table" style="color: #1a73e8"></i> Sheet`;
      sheetLink.title = "Mở Google Sheet";

      const docLink = document.createElement("a");
      docLink.href = `https://docs.google.com/document/d/${field.value}`;
      docLink.target = "_blank";
      docLink.innerHTML = `<i class="fas fa-file-alt" style="color: #d93025"></i> Docs`;
      docLink.title = "Mở Google Docs";

      valueEl.appendChild(sheetLink);
      valueEl.appendChild(docLink);
    } else {
      valueEl.textContent = field.value;
    }

    valueWrapper.appendChild(valueEl);

    const iconContainer = document.createElement("span");
    iconContainer.style.display = "flex";
    iconContainer.style.marginLeft = "auto";
    iconContainer.style.justifyContent = "flex-end";
    iconContainer.style.gap = "8px";

    if (field.showExternalLink && field.value && typeof field.value === "string" && field.value.startsWith("http")) {
      const linkIcon = document.createElement("i");
      linkIcon.className = "fas fa-external-link-alt copy-icon";
      linkIcon.title = "Mở liên kết";
      linkIcon.style.cursor = "pointer";
      linkIcon.addEventListener("click", () => {
        window.open(field.value, "_blank");
      });
      iconContainer.appendChild(linkIcon);
    }

    if (field.showCopy) {
      const copyIcon = document.createElement("i");
      copyIcon.className = "fas fa-copy copy-icon";
      copyIcon.title = "Sao chép";
      copyIcon.style.cursor = "pointer";
      copyIcon.addEventListener("click", () => copyToClipboard(field.value, copyIcon));
      iconContainer.appendChild(copyIcon);
    }

    valueWrapper.appendChild(iconContainer);
    row.appendChild(labelEl);
    row.appendChild(valueWrapper);
    detailContent.appendChild(row);
  });

  modal.style.display = "block";

  modal.addEventListener("click", function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  const closeButton = modal.querySelector(".close");
  if (closeButton) {
    closeButton.onclick = () => closeModal();
  }
}
