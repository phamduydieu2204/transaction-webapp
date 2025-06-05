import { closeProcessingModal } from './closeProcessingModal.js';

export function showResultModal(message, isSuccess = true) {
  // First close any processing modal
  closeProcessingModal();
  
  // Create or get result modal
  let modal = document.getElementById('resultModalModern');
  
  if (!modal) {
    // Create modern modal structure if it doesn't exist
    modal = document.createElement('div');
    modal.id = 'resultModalModern';
    modal.className = 'modal result-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="window.closeResultModalModern()"></button>
        
        <div class="modal-body">
          <!-- Success Icon -->
          <div class="modal-icon" id="resultIcon">
            <div class="modal-icon-success" id="successIcon" style="display: none;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path class="icon-checkmark" d="M10 20 L17 27 L30 13" />
              </svg>
            </div>
            
            <!-- Error Icon -->
            <div class="modal-icon-error" id="errorIcon" style="display: none;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path class="icon-cross" d="M12 12 L28 28 M28 12 L12 28" />
              </svg>
            </div>
          </div>
          
          <h2 id="resultTitle">Thông báo</h2>
          <p id="resultMessage"></p>
        </div>
        
        <div class="modal-buttons">
          <button class="modal-btn modal-btn-primary" onclick="window.closeResultModalModern()">Đóng</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add close modal function
    window.closeResultModalModern = function() {
      modal.style.display = 'none';
      // Enable all form elements
      document.querySelectorAll("input, select, textarea, button").forEach(element => {
        element.disabled = false;
      });
    };
    
    // Click outside to close
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        window.closeResultModalModern();
      }
    });
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
  
  // Show modal with animation
  modal.style.display = 'block';
  
  // Enable all form elements
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });
  
  // Auto close after 3 seconds if success
  if (isSuccess) {
    setTimeout(() => {
      window.closeResultModalModern();
    }, 3000);
  }
}

// Export for backward compatibility
export { showResultModal as default };