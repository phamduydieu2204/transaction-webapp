export function closeProcessingModal() {
    const modal = document.getElementById("processingModal");
    modal.style.display = "none";
    document.getElementById("modalMessage").style.color = "black";
  }