export function showProcessingModal(message) {
    const modal = document.getElementById("processingModal");
    const messageElement = document.getElementById("processingMessage");
    messageElement.textContent = message;
    modal.style.display = "block";
  }