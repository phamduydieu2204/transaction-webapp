export function showProcessingModal(message = "Hệ thống đang thực thi...") {
  // Try to use existing modal first
  let modal = document.getElementById("processingModalModern");
  
  // Create modern processing modal if needed
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'processingModalModern';
    modal.className = 'modal processing-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-body">
          <div class="spinner">
            <div class="spinner-circle"></div>
          </div>
          <h2 id="modalTitleModern">Đang xử lý</h2>
          <p id="modalMessageModern">
            <span id="messageText">${message}</span>
            <span class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Update message
  const messageText = modal.querySelector("#messageText");
  if (messageText) {
    messageText.textContent = message;
  }
  
  // Show modal
  modal.style.display = "block";

  // Disable form elements
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = true;
  });
  
  // Also try to update old modal if it exists (for compatibility)
  const oldModal = document.getElementById("processingModal");
  if (oldModal && oldModal !== modal) {
    const oldModalMessage = document.getElementById("modalMessage");
    const oldModalTitle = document.getElementById("modalTitle");
    const oldModalClose = document.getElementById("modalClose");
    
    if (oldModalTitle) oldModalTitle.textContent = "Đang xử lý";
    if (oldModalMessage) oldModalMessage.textContent = message;
    if (oldModalClose) oldModalClose.style.display = "none";
    
    oldModal.style.display = "block";
  }
}

// Export for backward compatibility
export { showProcessingModal as default };