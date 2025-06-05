export function closeProcessingModal() {
  // Close modern modal
  const modernModal = document.getElementById("processingModalModern");
  if (modernModal) {
    modernModal.style.display = "none";
  }
  
  // Close old modal (for compatibility)
  const oldModal = document.getElementById("processingModal");
  if (oldModal) {
    oldModal.style.display = "none";
  }
  
  // Enable all form elements
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });
}

// Export for backward compatibility
export { closeProcessingModal as default };