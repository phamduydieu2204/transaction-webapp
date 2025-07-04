/**
 * Unified Modal System
 * Works with both old and new modal structures
 */

export function showProcessingModal(message = "Hệ thống đang thực thi...") {
  // console.log('🔄 showProcessingModal called:', message);
  
  // Hide any existing result modals first
  hideAllResultModals();
  
  // Try to use existing old modal first (for compatibility)
  let oldModal = document.getElementById("processingModal");
  if (oldModal) {
    const modalMessage = document.getElementById("modalMessage");
    const modalTitle = document.getElementById("modalTitle");
    const modalClose = document.getElementById("modalClose");
    
    if (modalTitle) modalTitle.textContent = "Đang xử lý";
    if (modalMessage) modalMessage.textContent = message;
    if (modalClose) modalClose.style.display = "none";
    
    oldModal.style.display = "block";
    // console.log('✅ Old processing modal shown');
  }
  
  // Also create/show modern modal
  let modernModal = document.getElementById("processingModalModern");
  if (!modernModal) {
    modernModal = document.createElement('div');
    modernModal.id = 'processingModalModern';
    modernModal.className = 'modal processing-modal';
    modernModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-body">
          <div class="spinner">
            <div class="spinner-circle"></div>
          </div>
          <h2>Đang xử lý</h2>
          <p id="modernModalMessage">
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
    document.body.appendChild(modernModal);
    // console.log('✅ Modern processing modal created');
  }

  const messageText = modernModal.querySelector("#messageText");
  if (messageText) {
    messageText.textContent = message;
  }
  
  modernModal.style.display = "block";
  // console.log('✅ Modern processing modal shown');

  // Disable form elements
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = true;
  });
}

export function closeProcessingModal() {
  // console.log('❌ closeProcessingModal called');
  
  // Close old modal
  const oldModal = document.getElementById("processingModal");
  if (oldModal) {
    oldModal.style.display = "none";
    // console.log('✅ Old processing modal closed');
  }
  
  // Close modern modal
  const modernModal = document.getElementById("processingModalModern");
  if (modernModal) {
    modernModal.style.display = "none";
    // console.log('✅ Modern processing modal closed');
  }
  
  // Enable all form elements
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });
}

export function showResultModal(message, isSuccess = true) {
  console.log('📢 showResultModal called:', message, 'success:', isSuccess);
  
  // First close any processing modals
  closeProcessingModal();
  
  // Create or get result modal
  let modal = document.getElementById('resultModalUnified');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'resultModalUnified';
    modal.className = 'modal result-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="window.closeResultModalUnified()"></button>
        
        <div class="modal-body">
          <div class="modal-icon" id="resultIcon">
            <div class="modal-icon-success" id="successIcon" style="display: none;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path class="icon-checkmark" d="M10 20 L17 27 L30 13" stroke="white" stroke-width="3" fill="none"/>
              </svg>
            </div>
            
            <div class="modal-icon-error" id="errorIcon" style="display: none;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path class="icon-cross" d="M12 12 L28 28 M28 12 L12 28" stroke="white" stroke-width="3"/>
              </svg>
            </div>
          </div>
          
          <h2 id="resultTitle">Thông báo</h2>
          <p id="resultMessage"></p>
        </div>
        
        <div class="modal-buttons">
          <button class="modal-btn modal-btn-primary" onclick="window.closeResultModalUnified()">Đóng</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add close function to window
    window.closeResultModalUnified = function() {
      modal.style.display = 'none';
      // Enable all form elements
      document.querySelectorAll("input, select, textarea, button").forEach(element => {
        element.disabled = false;
      });
      // console.log('✅ Result modal closed');
    };
    
    // Click outside to close
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        window.closeResultModalUnified();
      }
    });
    
    // console.log('✅ Result modal created');
  }
  
  // Update modal content
  const title = modal.querySelector('#resultTitle');
  const messageElement = modal.querySelector('#resultMessage');
  const successIcon = modal.querySelector('#successIcon');
  const errorIcon = modal.querySelector('#errorIcon');
  
  if (title) {
    title.textContent = isSuccess ? 'Thành công' : 'Lỗi';
  }
  
  if (messageElement) {
    messageElement.textContent = message;
  }
  
  // Show appropriate icon
  if (successIcon && errorIcon) {
    if (isSuccess) {
      successIcon.style.display = 'block';
      errorIcon.style.display = 'none';
    } else {
      successIcon.style.display = 'none';
      errorIcon.style.display = 'block';
    }
  }
  
  // Show modal
  modal.style.display = 'block';
  // console.log('✅ Result modal shown');
  
  // Enable all form elements
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });
  
  // Auto close after 3 seconds if success
  if (isSuccess) {
    setTimeout(() => {
      window.closeResultModalUnified();
    }, 3000);
  }
}

function hideAllResultModals() {
  // Hide old result modal if exists
  const oldResult = document.getElementById('resultModalModern');
  if (oldResult) {
    oldResult.style.display = 'none';
  }
  
  // Hide unified result modal if exists
  const unifiedResult = document.getElementById('resultModalUnified');
  if (unifiedResult) {
    unifiedResult.style.display = 'none';
  }
}

// Export for global access
window.showProcessingModalUnified = showProcessingModal;
window.closeProcessingModalUnified = closeProcessingModal;
window.showResultModalUnified = showResultModal;