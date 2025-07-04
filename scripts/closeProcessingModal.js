export function closeProcessingModal() {
  const modal = document.getElementById("processingModal");
  const modalMessage = document.getElementById("modalMessage");
  
  if (!modal) {
// console.warn("⚠️ Processing modal not found when trying to close");
    return;
  }
  
  modal.style.display = "none";
  
  if (modalMessage) {
    modalMessage.style.color = "black";
  }

  // ✅ Cho phép người dùng tương tác trở lại
  document.querySelectorAll("input, select, textarea, button").forEach(element => {
    element.disabled = false;
  });
}
