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