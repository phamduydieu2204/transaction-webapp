export function showProcessingModal(message = "Hệ thống đang thực thi...") {
    const modal = document.getElementById("processingModal");
    const modalMessage = document.getElementById("modalMessage");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");
  
    // Check if elements exist before setting properties
    if (!modal) {
        console.error("❌ Processing modal not found - using alert fallback");
        alert(message);
        return;
    }
    
    if (modalTitle) {
        modalTitle.textContent = "Thông báo";
    }
    
    if (modalMessage) {
        modalMessage.textContent = message;
    }
    
    if (modalClose) {
        modalClose.style.display = "none";
    }
    
    modal.style.display = "block";
  
    document.querySelectorAll("input, select, textarea, button").forEach(element => {
      element.disabled = true;
    });
  }