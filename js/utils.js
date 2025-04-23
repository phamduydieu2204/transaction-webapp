export function formatDate(dateString) {
  if (!dateString) return "";
  return dateString;
}

export function showProcessingModal(message = "Hệ thống đang thực thi...") {
  const modal = document.getElementById("processingModal");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  modalTitle.textContent = "Thông báo";
  modalMessage.textContent = message;
  modalClose.style.display = "none";
  modal.style.display = "block";

  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = true;
  });
}

export function showResultModal(message, isSuccess) {
  const modal = document.getElementById("processingModal");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  modalTitle.textContent = isSuccess ? "Thành công" : "Lỗi";
  modalMessage.textContent = message;
  modalMessage.style.color = isSuccess ? "green" : "red";
  modalClose.style.display = "block";

  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });

  modal.addEventListener("click", function handler(event) {
    if (event.target === modal) {
      closeProcessingModal();
      modal.removeEventListener("click", handler);
    }
  });
}

export function closeProcessingModal() {
  const modal = document.getElementById("processingModal");
  modal.style.display = "none";
  document.getElementById("modalMessage").style.color = "black";
}

export function updateCustomerInfo() {
  const email = document.getElementById("customerEmail").value.toLowerCase();
  const customerNameInput = document.getElementById("customerName");
  const customerPhoneInput = document.getElementById("customerPhone");

  customerNameInput.value = "";
  customerPhoneInput.value = "";
  customerNameInput.placeholder = "Đang tìm kiếm...";
  customerPhoneInput.placeholder = "Đang tìm kiếm...";

  const transaction = transactionList.find(t => t.customerEmail.toLowerCase() === email);

  if (transaction) {
    customerNameInput.value = transaction.customerName || "";
    customerPhoneInput.value = transaction.customerPhone || "";
  } else {
    customerNameInput.value = "";
    customerPhoneInput.value = "";
  }

  customerNameInput.placeholder = "";
  customerPhoneInput.placeholder = "";
}

export function openCalendar(inputId) {
  flatpickr(`#${inputId}`, {
    dateFormat: "Y/m/d",
    onChange: function(selectedDates, dateStr) {
      document.getElementById(inputId).value = dateStr;
      if (inputId === "startDate") {
        calculateEndDate();
      }
    }
  }).open();
}

export function copyToClipboard(text, iconElement) {
  navigator.clipboard.writeText(text)
    .then(() => {
      const message = document.createElement("span");
      message.className = "copy-message";
      message.textContent = "Đã copy";
      iconElement.appendChild(message);

      message.classList.add("show");

      setTimeout(() => {
        message.classList.remove("show");
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }, 1000);
    })
    .catch(err => {
      console.error("Lỗi khi copy nội dung: ", err);
    });
}

export function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function calculateEndDate() {
  const startDateInput = document.getElementById("startDate");
  const durationInput = document.getElementById("duration");
  const endDateInput = document.getElementById("endDate");

  const start = new Date(startDateInput.value);
  const months = parseInt(durationInput.value || 0);
  if (!isNaN(months)) {
    const estimated = new Date(start.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    const year = estimated.getFullYear();
    const month = String(estimated.getMonth() + 1).padStart(2, '0');
    const day = String(estimated.getDate()).padStart(2, '0');
    endDateInput.value = `${year}/${month}/${day}`;
  }
}